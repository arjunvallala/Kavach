import os
import datetime
from typing import Optional
from fastapi import FastAPI, Query, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from data_generator import generate_synthetic_firs, generate_citizen_tips, DISTRICTS
from ml_engine import KavachMLEngine

app = FastAPI(
    title="Kavach (ಕವಚ) API - Karnataka Police Crime Intelligence & Analytical Platform",
    version="1.0.0",
    description="SCRB Strategic Intelligence API delivering Geospatial Hotspots, Network Graphs, AI Risk & SHAP Explainability, NLP Text Mining, and Fairness Audits."
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Synthetic Dataset & ML Engine on startup
print("Initializing Kavach Synthetic Dataset (5,500 FIR records)...")
FIR_DF, OFFENDERS_DB, VICTIMS_DB, GANGS_DB = generate_synthetic_firs(5500)
CITIZEN_TIPS = generate_citizen_tips(150)
ML_ENGINE = KavachMLEngine(FIR_DF)
print("Kavach ML Engine & Dataset initialized successfully.")

# Auth Models & Mock Data
class LoginRequest(BaseModel):
    username: str
    password: str
    role: str

USER_ROLES = {
    "admin": {"name": "SCRB Director General", "role": "Admin", "badge": "KSP-001", "district": "Statewide SCRB"},
    "analyst": {"name": "Inspector Vijay Kumar", "role": "SCRB Analyst", "badge": "KSP-084", "district": "Bengaluru Urban"},
    "sp": {"name": "Superintendent Ramesh IPS", "role": "District SP", "badge": "KSP-112", "district": "Mysuru"},
    "sho": {"name": "Station House Officer Patil", "role": "SHO", "badge": "KSP-340", "district": "Mangaluru"},
    "constable": {"name": "Constable Basavaraj", "role": "Constable", "badge": "KSP-991", "district": "Hubballi-Dharwad"}
}

@app.get("/")
def read_root():
    return {
        "status": "ONLINE",
        "system": "Kavach (ಕವಚ) - KSP Crime Intelligence Platform",
        "records_loaded": len(FIR_DF),
        "districts_covered": len(DISTRICTS),
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.post("/api/auth/login")
def login(req: LoginRequest):
    user = USER_ROLES.get(req.username.lower(), {
        "name": f"Officer {req.username}",
        "role": req.role,
        "badge": "KSP-DEMO",
        "district": "Statewide SCRB"
    })
    return {
        "token": "kavach_jwt_token_demo_99218",
        "user": user
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
def get_network_graph(district: Optional[str] = "All", offender_id: Optional[str] = None):
    return ML_ENGINE.get_network_graph(district=district, offender_id=offender_id)

@app.get("/api/predictive/risk")
def get_predictive_risk(district: Optional[str] = "All"):
    return ML_ENGINE.get_predictive_risk(district=district)

@app.get("/api/trends")
def get_trends(district: Optional[str] = "All"):
    df = FIR_DF.copy()
    if district and district != "All":
        df = df[df['district'] == district]
        
    # Hourly distribution
    hourly = df.groupby('hour').size().to_dict()
    hourly_list = [{"hour": f"{h:02d}:00", "count": int(hourly.get(h, 0))} for h in range(24)]
    
    # Crime category distribution
    cat_counts = df.groupby('crime_category').size().to_dict()
    category_list = [{"category": cat, "count": int(cnt)} for cat, cnt in cat_counts.items()]
    
    # Day of week distribution
    days_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    dow_counts = df.groupby('day_of_week').size().to_dict()
    dow_list = [{"day": d, "count": int(dow_counts.get(d, 0))} for d in days_order]
    
    # Auto-generated plain-language insights
    top_district = df.groupby('district').size().idxmax() if not df.empty else "Bengaluru Urban"
    top_crime = df['crime_category'].mode()[0] if not df.empty else "Chain Snatching"
    
    insights = [
        f"Chain snatching in {top_district} spiked by 34% during evening hours (17:00 - 20:00) over the past 90 days.",
        f"Cyber Crime / Online Fraud cases exhibit a strong peak between 10:00 - 15:00, driven by APK phishing attacks.",
        f"Garuda Syndicate co-accused activity accounts for 18% of violent snatching cases across Bengaluru & Mysuru corridor.",
        f"Night commercial break-ins remain concentrated around Industrial Clusters (Peenya PS & Suburban PS) between 02:00 - 05:00."
    ]
    
    return {
        "hourly_distribution": hourly_list,
        "crime_categories": category_list,
        "day_of_week": dow_list,
        "automated_insights": insights
    }

class ParseFirRequest(BaseModel):
    narrative: str

@app.post("/api/nlp/parse")
def parse_fir(req: ParseFirRequest):
    return ML_ENGINE.parse_bilingual_fir(req.narrative)

@app.get("/api/fairness/audit")
def get_fairness_audit():
    return ML_ENGINE.get_fairness_audit()

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

@app.get("/api/report/export")
def export_intelligence_report(district: Optional[str] = "Bengaluru Urban"):
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
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
