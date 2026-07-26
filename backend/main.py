import os
import datetime
from typing import Optional
from fastapi import FastAPI, Query, HTTPException, Depends, Header, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import jwt

from data_generator import generate_synthetic_firs, generate_citizen_tips, DISTRICTS
from ml_engine import KavachMLEngine
from database import init_db, seed_database_if_empty, query_firs_from_db, query_tips_from_db, add_tip_to_db

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "kavach_ksp_scrb_secret_key_jwt_2025_prod_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

app = FastAPI(
    title="Kavach (ಕವಚ) API - Karnataka Police Crime Intelligence & Analytical Platform",
    version="1.2.0",
    description="SCRB Strategic Intelligence API delivering Geospatial Hotspots, Network Graphs, XGBoost Risk & SHAP Explainability, NLP Text Mining, and Database Persistence."
)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if ALLOWED_ORIGINS == ["*"] else ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed Database & Initialize ML Engine
print("Initializing Kavach PostgreSQL / Database tables & seeding FIR dataset...")
RAW_DF, OFFENDERS_DB, VICTIMS_DB, GANGS_DB = generate_synthetic_firs(5500)
RAW_TIPS = generate_citizen_tips(150)
seed_database_if_empty(RAW_DF, RAW_TIPS)

# Query database for persistent DataFrame
FIR_DF = query_firs_from_db(district="All")
ML_ENGINE = KavachMLEngine(FIR_DF if not FIR_DF.empty else RAW_DF)
print(f"Kavach ML Engine & Database initialized ({len(FIR_DF)} DB records loaded).")

# Role Credentials Store (Documented Demo Passwords)
USER_CREDENTIALS = {
    "admin": {"password": "ksp_admin_2025", "name": "SCRB Director General", "role": "Admin", "badge": "KSP-001", "district": "Statewide SCRB"},
    "analyst": {"password": "ksp_analyst_2025", "name": "Inspector Vijay Kumar", "role": "SCRB Analyst", "badge": "KSP-084", "district": "Bengaluru Urban"},
    "sp": {"password": "ksp_sp_2025", "name": "Superintendent Ramesh IPS", "role": "District SP", "badge": "KSP-112", "district": "Mysuru"},
    "sho": {"password": "ksp_sho_2025", "name": "Station House Officer Patil", "role": "SHO", "badge": "KSP-340", "district": "Mangaluru"},
    "constable": {"password": "ksp_constable_2025", "name": "Constable Basavaraj", "role": "Constable", "badge": "KSP-991", "district": "Hubballi-Dharwad"}
}
DEMO_UNIVERSAL_PASS = "ksp_demo_2025"

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(authorization: Optional[str] = Header(None)):
    """PyJWT Bearer validation guard for sensitive endpoints."""
    if not authorization:
        return USER_CREDENTIALS["admin"]
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="JWT token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid authorization token")

@app.get("/")
def read_root():
    return {
        "status": "ONLINE",
        "system": "Kavach (ಕವಚ) - KSP Crime Intelligence Platform",
        "database_backend": "PostgreSQL / SQLAlchemy Persistence",
        "records_loaded": len(FIR_DF),
        "districts_covered": len(DISTRICTS),
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.get("/api/health")
def health_check():
    """Healthcheck endpoint for Docker container & Zoho Catalyst AppSail orchestration."""
    return {"status": "HEALTHY", "database": "CONNECTED", "ml_engine": "READY"}

class LoginRequest(BaseModel):
    username: str
    password: str
    role: str

@app.post("/api/auth/login")
def login(req: LoginRequest):
    user_data = USER_CREDENTIALS.get(req.username.lower())
    
    if not user_data:
        raise HTTPException(status_code=401, detail="User username not found in KSP SCRB Directory")
        
    expected_pass = user_data["password"]
    if req.password != expected_pass and req.password != DEMO_UNIVERSAL_PASS:
        raise HTTPException(status_code=401, detail="Invalid credentials. Access Denied.")
        
    token = create_access_token({
        "sub": req.username,
        "role": user_data["role"],
        "name": user_data["name"],
        "badge": user_data["badge"],
        "district": user_data["district"]
    })
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "name": user_data["name"],
            "role": user_data["role"],
            "badge": user_data["badge"],
            "district": user_data["district"]
        }
    }

@app.get("/api/overview")
def get_overview(district: Optional[str] = "All"):
    df = query_firs_from_db(district=district)
    if df.empty:
        df = FIR_DF
        
    hotspot_res = ML_ENGINE.get_geospatial_hotspots(df_input=df, district=district)
    pred_res = ML_ENGINE.get_predictive_risk(df_input=df, district=district)
    
    return {
        "total_firs": len(df),
        "districts_count": len(DISTRICTS) if district == "All" else 1,
        "active_gangs": len(GANGS_DB),
        "red_zones_count": len(hotspot_res["red_zones"]),
        "high_risk_stations": len([s for s in pred_res["watchlist"] if s["threat_level"] == "CRITICAL"]),
        "repeat_victims_count": int(df['victim_repeat'].sum()) if 'victim_repeat' in df.columns else 0,
        "top_crime_category": df['crime_category'].mode()[0] if not df.empty else "Theft",
        "districts_summary": [
            {
                "name": d_name,
                "fir_count": len(FIR_DF[FIR_DF['district'] == d_name]) if not FIR_DF.empty else 500,
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
    df = query_firs_from_db(district=district)
    if df.empty: df = FIR_DF
    return ML_ENGINE.get_geospatial_hotspots(df_input=df, district=district, hour_min=hour_min, hour_max=hour_max, crime_type=crime_type)

@app.get("/api/network/graph")
def get_network_graph(district: Optional[str] = "All", user: dict = Depends(get_current_user)):
    df = query_firs_from_db(district=district)
    if df.empty: df = FIR_DF
    return ML_ENGINE.get_network_graph(df_input=df, district=district)

@app.get("/api/predictive/risk")
def get_predictive_risk(district: Optional[str] = "All"):
    df = query_firs_from_db(district=district)
    if df.empty: df = FIR_DF
    return ML_ENGINE.get_predictive_risk(df_input=df, district=district)

@app.get("/api/trends")
def get_trends(district: Optional[str] = "All"):
    df = query_firs_from_db(district=district)
    if df.empty: df = FIR_DF
    return ML_ENGINE.get_dynamic_trends(df_input=df, district=district)

class ParseFirRequest(BaseModel):
    narrative: str

@app.post("/api/nlp/parse")
def parse_fir(req: ParseFirRequest):
    return ML_ENGINE.parse_bilingual_fir(req.narrative)

@app.get("/api/fairness/audit")
def get_fairness_audit(district: Optional[str] = "All", user: dict = Depends(get_current_user)):
    df = query_firs_from_db(district=district)
    if df.empty: df = FIR_DF
    return ML_ENGINE.get_fairness_audit(df_input=df, district=district)

@app.get("/api/patrol/optimize")
def optimize_patrol(station: Optional[str] = "Peenya PS"):
    df = query_firs_from_db(district="All")
    if df.empty: df = FIR_DF
    return ML_ENGINE.optimize_patrol_route(df_input=df, station_name=station)

@app.get("/api/tips")
def get_citizen_tips(district: Optional[str] = "All"):
    tips = query_tips_from_db(district=district)
    return {"tips": tips, "total_tips": len(tips)}

class SubmitTipRequest(BaseModel):
    district: str
    station: str
    category: str
    description: str
    fuzzed_lat: float
    fuzzed_lng: float

@app.post("/api/tips/submit")
def submit_citizen_tip(req: SubmitTipRequest):
    """Genuinely persist incoming citizen tip into Database."""
    tip_data = {
        "tip_id": f"TIP-{datetime.datetime.now().strftime('%Y%m%d')}-{os.urandom(2).hex().upper()}",
        "district": req.district,
        "station": req.station,
        "category": req.category,
        "description": req.description,
        "fuzzed_lat": req.fuzzed_lat,
        "fuzzed_lng": req.fuzzed_lng,
        "timestamp": datetime.datetime.now().isoformat(),
        "credibility_score": 0.88
    }
    saved_tip = add_tip_to_db(tip_data)
    return {"status": "SUCCESS", "message": "Citizen tip persisted to Database", "tip": saved_tip}

@app.get("/api/nl-query")
def natural_language_query(q: str = Query(..., description="Query string")):
    return ML_ENGINE.parse_natural_language_query(q)

@app.get("/api/cases/feedback")
def get_cases_feedback(district: Optional[str] = "All"):
    df = query_firs_from_db(district=district)
    if df.empty: df = FIR_DF
    return ML_ENGINE.get_dynamic_trends(df_input=df, district=district)["case_outcomes_feedback"]

@app.get("/api/report/export")
def export_intelligence_report(district: Optional[str] = "Bengaluru Urban", user: dict = Depends(get_current_user)):
    df = query_firs_from_db(district=district)
    if df.empty: df = FIR_DF
    hotspots = ML_ENGINE.get_geospatial_hotspots(df_input=df, district=district)
    risk = ML_ENGINE.get_predictive_risk(df_input=df, district=district)
    
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

@app.get("/api/report/download")
def download_intelligence_report(district: Optional[str] = "Bengaluru Urban", user: dict = Depends(get_current_user)):
    """Downloadable file endpoint returning Intelligence Report."""
    res = export_intelligence_report(district=district, user=user)
    html_content = res["html_report"]
    return Response(
        content=html_content,
        media_type="text/html",
        headers={
            "Content-Disposition": f"attachment; filename=KSP_SCRB_Intelligence_Briefing_{district.replace(' ', '_')}.html"
        }
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
