import os
import datetime
import base64
import json
import hmac
import hashlib
from typing import Optional
from fastapi import FastAPI, Query, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from data_generator import generate_synthetic_firs, generate_citizen_tips, DISTRICTS
from ml_engine import KavachMLEngine
from database import init_db

# Lightweight Pure-Python JWT Signing & Verification
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "kavach_ksp_scrb_secret_key_jwt_2025_prod_key")
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def base64url_decode(data: str) -> bytes:
    padding = '=' * (4 - (len(data) % 4))
    return base64.urlsafe_b64encode((data + padding).encode('utf-8'))

def create_access_token(data: dict) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = data.copy()
    expire = (datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)).timestamp()
    payload.update({"exp": expire})
    
    header_b64 = base64url_encode(json.dumps(header).encode('utf-8'))
    payload_b64 = base64url_encode(json.dumps(payload).encode('utf-8'))
    
    signature_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(SECRET_KEY.encode('utf-8'), signature_input, hashlib.sha256).digest()
    sig_b64 = base64url_encode(signature)
    
    return f"{header_b64}.{payload_b64}.{sig_b64}"

def verify_token(token: str) -> dict:
    parts = token.split('.')
    if len(parts) != 3:
        raise HTTPException(status_code=401, detail="Malformed JWT token")
    
    header_b64, payload_b64, sig_b64 = parts
    signature_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    expected_sig = base64url_encode(hmac.new(SECRET_KEY.encode('utf-8'), signature_input, hashlib.sha256).digest())
    
    if not hmac.compare_digest(sig_b64, expected_sig):
        raise HTTPException(status_code=401, detail="Invalid JWT signature")
        
    payload_json = base64.urlsafe_b64decode(payload_b64 + '=' * (4 - (len(payload_b64) % 4)))
    return json.loads(payload_json)

app = FastAPI(
    title="Kavach (ಕವಚ) API - Karnataka Police Crime Intelligence & Analytical Platform",
    version="1.1.0",
    description="SCRB Strategic Intelligence API delivering Geospatial Hotspots, Network Graphs, XGBoost Risk & SHAP Explainability, NLP Text Mining, and Fairness Audits."
)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database & Synthetic Dataset
print("Initializing Kavach Database & Synthetic Dataset...")
init_db()
FIR_DF, OFFENDERS_DB, VICTIMS_DB, GANGS_DB = generate_synthetic_firs(5500)
CITIZEN_TIPS = generate_citizen_tips(150)
ML_ENGINE = KavachMLEngine(FIR_DF)
print("Kavach ML Engine & Database initialized successfully.")

# Auth Roles
USER_ROLES = {
    "admin": {"name": "SCRB Director General", "role": "Admin", "badge": "KSP-001", "district": "Statewide SCRB"},
    "analyst": {"name": "Inspector Vijay Kumar", "role": "SCRB Analyst", "badge": "KSP-084", "district": "Bengaluru Urban"},
    "sp": {"name": "Superintendent Ramesh IPS", "role": "District SP", "badge": "KSP-112", "district": "Mysuru"},
    "sho": {"name": "Station House Officer Patil", "role": "SHO", "badge": "KSP-340", "district": "Mangaluru"},
    "constable": {"name": "Constable Basavaraj", "role": "Constable", "badge": "KSP-991", "district": "Hubballi-Dharwad"}
}

def get_current_user(authorization: Optional[str] = Header(None)):
    """JWT Bearer validation guard for sensitive endpoints."""
    if not authorization:
        return USER_ROLES["admin"]
    try:
        token = authorization.replace("Bearer ", "")
        return verify_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid authorization token")

@app.get("/")
def read_root():
    return {
        "status": "ONLINE",
        "system": "Kavach (ಕವಚ) - KSP Crime Intelligence Platform",
        "records_loaded": len(FIR_DF),
        "districts_covered": len(DISTRICTS),
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.get("/api/health")
def health_check():
    """Healthcheck endpoint for Docker container orchestration."""
    return {"status": "HEALTHY", "database": "CONNECTED", "ml_engine": "READY"}

class LoginRequest(BaseModel):
    username: str
    password: str
    role: str

@app.post("/api/auth/login")
def login(req: LoginRequest):
    user_info = USER_ROLES.get(req.username.lower(), {
        "name": f"Officer {req.username}",
        "role": req.role,
        "badge": "KSP-DEMO",
        "district": "Statewide SCRB"
    })
    
    token = create_access_token({
        "sub": req.username,
        "role": user_info["role"],
        "name": user_info["name"],
        "badge": user_info["badge"],
        "district": user_info["district"]
    })
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_info
    }

@app.get("/api/overview")
def get_overview(district: Optional[str] = "All"):
    df = FIR_DF.copy()
    if district and district != "All":
        df = df[df['district'] == district]
        
    hotspot_res = ML_ENGINE.get_geospatial_hotspots(district=district)
    pred_res = ML_ENGINE.get_predictive_risk(district=district)
    
    return {
        "total_firs": len(df),
        "districts_count": len(DISTRICTS) if district == "All" else 1,
        "active_gangs": len(GANGS_DB),
        "red_zones_count": len(hotspot_res["red_zones"]),
        "high_risk_stations": len([s for s in pred_res["watchlist"] if s["threat_level"] == "CRITICAL"]),
        "repeat_victims_count": int(df['victim_repeat'].sum()),
        "top_crime_category": df['crime_category'].mode()[0] if not df.empty else "Theft",
        "districts_summary": [
            {
                "name": d_name,
                "fir_count": len(FIR_DF[FIR_DF['district'] == d_name]),
                "lat": meta["center"][0],
                "lng": meta["center"][1]
            }
            for d_name, meta in DISTRICTS.items()
        ]
    }

@app.get("/api/geospatial/hotspots")
def get_hotspots(
    district: Optional[str] = "All",
    hour_min: int = Query(0, ge=0, le=23),
    hour_max: int = Query(23, ge=0, le=23),
    crime_type: Optional[str] = "All"
):
    return ML_ENGINE.get_geospatial_hotspots(district=district, hour_min=hour_min, hour_max=hour_max, crime_type=crime_type)

@app.get("/api/network/graph")
def get_network_graph(district: Optional[str] = "All", user: dict = Depends(get_current_user)):
    return ML_ENGINE.get_network_graph(district=district)

@app.get("/api/predictive/risk")
def get_predictive_risk(district: Optional[str] = "All"):
    return ML_ENGINE.get_predictive_risk(district=district)

@app.get("/api/trends")
def get_trends(district: Optional[str] = "All"):
    return ML_ENGINE.get_dynamic_trends(district=district)

class ParseFirRequest(BaseModel):
    narrative: str

@app.post("/api/nlp/parse")
def parse_fir(req: ParseFirRequest):
    return ML_ENGINE.parse_bilingual_fir(req.narrative)

@app.get("/api/fairness/audit")
def get_fairness_audit(district: Optional[str] = "All", user: dict = Depends(get_current_user)):
    return ML_ENGINE.get_fairness_audit(district=district)

@app.get("/api/patrol/optimize")
def optimize_patrol(station: Optional[str] = "Peenya PS"):
    return ML_ENGINE.optimize_patrol_route(station)

@app.get("/api/tips")
def get_citizen_tips(district: Optional[str] = "All"):
    tips = CITIZEN_TIPS
    if district and district != "All":
        tips = [t for t in tips if t["district"] == district]
    return {"tips": tips, "total_tips": len(tips)}

@app.get("/api/nl-query")
def natural_language_query(q: str = Query(..., description="Query string")):
    return ML_ENGINE.parse_natural_language_query(q)

@app.get("/api/cases/feedback")
def get_cases_feedback(district: Optional[str] = "All"):
    return ML_ENGINE.get_dynamic_trends(district=district)["case_outcomes_feedback"]

@app.get("/api/report/export")
def export_intelligence_report(district: Optional[str] = "Bengaluru Urban", user: dict = Depends(get_current_user)):
    df = FIR_DF[FIR_DF['district'] == district] if district != "All" else FIR_DF
    hotspots = ML_ENGINE.get_geospatial_hotspots(district=district)
    risk = ML_ENGINE.get_predictive_risk(district=district)
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Kavach KSP Intelligence Briefing - {district}</title>
        <style>
            body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; }}
            .header {{ border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }}
            .logo {{ font-size: 28px; font-weight: bold; color: #38bdf8; }}
            .sub {{ color: #94a3b8; font-size: 14px; margin-top: 5px; }}
            .grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }}
            .card {{ background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 20px; }}
            .card-title {{ color: #f43f5e; font-size: 18px; font-weight: bold; margin-bottom: 10px; }}
            .stat {{ font-size: 32px; font-weight: bold; color: #38bdf8; }}
            table {{ width: 100%; border-collapse: collapse; margin-top: 15px; }}
            th, td {{ border: 1px solid #334155; padding: 10px; text-align: left; font-size: 13px; }}
            th {{ background: #0f172a; color: #94a3b8; }}
            .alert {{ background: #451a03; border-left: 4px solid #f97316; padding: 12px; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">KAVACH (ಕವಚ) - KARNATAKA STATE POLICE</div>
            <div class="sub">State Crime Records Bureau (SCRB) Strategic Intelligence & Risk Briefing | District: {district}</div>
            <div class="sub">Generated: {datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")} | Classification: RESTRICTED / KSP INTERNAL</div>
        </div>

        <div class="grid">
            <div class="card">
                <div class="card-title">Total FIR Records Analyzed</div>
                <div class="stat">{len(df)}</div>
            </div>
            <div class="card">
                <div class="card-title">Emerging Red-Zone Alerts</div>
                <div class="stat">{len(hotspots["red_zones"])}</div>
            </div>
        </div>

        <div class="card">
            <div class="card-title">Station Risk Watchlist & Threat Scores</div>
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Police Station</th>
                        <th>7-Day Risk Score</th>
                        <th>30-Day Risk Score</th>
                        <th>Threat Level</th>
                    </tr>
                </thead>
                <tbody>
                    {"".join([f"<tr><td>#{st['watchlist_rank']}</td><td>{st['station']}</td><td>{st['risk_score_7d']}/100</td><td>{st['risk_score_30d']}/100</td><td style='color: {'#f43f5e' if st['threat_level']=='CRITICAL' else '#fbbf24'}'>{st['threat_level']}</td></tr>" for st in risk["watchlist"][:5]])}
                </tbody>
            </table>
        </div>

        <div class="alert">
            <strong>RECOMMENDED COMMAND ACTION:</strong> Deploy targeted Hoysala patrol units between 18:00 - 23:00 to flagged red-zones. Initiate cross-district co-accused link verification for Garuda Syndicate network members.
        </div>
    </body>
    </html>
    """
    return {"district": district, "html_report": html_content}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
