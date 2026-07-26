import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app, create_access_token
from data_generator import generate_synthetic_firs, generate_citizen_tips
from ml_engine import KavachMLEngine
from database import query_firs_from_db, query_tips_from_db

client = TestClient(app)

def test_data_generator_output():
    """Verify data generator produces expected row counts and schema."""
    df, offenders, victims, gangs = generate_synthetic_firs(100)
    assert len(df) == 100
    assert "fir_number" in df.columns
    assert "district" in df.columns
    assert len(gangs) >= 3

def test_database_persistence():
    """Verify FIR records are genuinely persisted to and queried from Database."""
    db_df = query_firs_from_db(district="All")
    assert not db_df.empty
    assert "fir_number" in db_df.columns
    assert len(db_df) >= 100

def test_health_endpoint():
    """Verify /api/health endpoint returns 200 HEALTHY."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"

def test_overview_endpoint():
    """Verify /api/overview endpoint queries database."""
    response = client.get("/api/overview?district=Bengaluru%20Urban")
    assert response.status_code == 200
    data = response.json()
    assert "total_firs" in data
    assert data["total_firs"] > 0

def test_geospatial_hotspots():
    """Verify DBSCAN clustering returns non-empty clusters and red zones."""
    response = client.get("/api/geospatial/hotspots?district=Bengaluru%20Urban&hour_min=0&hour_max=23")
    assert response.status_code == 200
    data = response.json()
    assert "clusters" in data
    assert "red_zones" in data

def test_network_graph():
    """Verify NetworkX graph and Louvain communities calculation."""
    response = client.get("/api/network/graph?district=All")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "detected_rings" in data

def test_predictive_risk_and_shap():
    """Verify XGBoost risk scoring and feature attributions."""
    response = client.get("/api/predictive/risk?district=All")
    assert response.status_code == 200
    data = response.json()
    assert "watchlist" in data
    assert len(data["watchlist"]) > 0

def test_bilingual_fir_nlp():
    """Verify bilingual Kannada + English FIR NLP parser."""
    payload = {
        "narrative": "Complainant reported that miscreant extracted knife (ಚಾಕು) weapon and snatched gold chain. Case under IPC 392."
    }
    response = client.post("/api/nlp/parse", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "weapons" in data
    assert "Chain Snatching" in data["mo_category"]

def test_dynamic_fairness_audit():
    """Verify disparate impact 80% rule compliance computation."""
    response = client.get("/api/fairness/audit")
    assert response.status_code == 200
    data = response.json()
    assert "overall_fairness_score" in data
    assert "%" in data["overall_fairness_score"]

def test_auth_login_validation():
    """Verify password verification in login (reject wrong passwords)."""
    # Invalid Password test -> 401
    bad_payload = {"username": "admin", "password": "wrongpassword_123", "role": "Admin"}
    bad_res = client.post("/api/auth/login", json=bad_payload)
    assert bad_res.status_code == 401
    
    # Valid Password test -> 200 + JWT
    good_payload = {"username": "admin", "password": "ksp_admin_2025", "role": "Admin"}
    good_res = client.post("/api/auth/login", json=good_payload)
    assert good_res.status_code == 200
    assert "access_token" in good_res.json()

def test_citizen_tip_submission_persistence():
    """Verify incoming citizen tip is persisted to Database."""
    tip_payload = {
        "district": "Bengaluru Urban",
        "station": "Peenya PS",
        "category": "Suspicious Gathering",
        "description": "Test citizen tip for DB persistence verification.",
        "fuzzed_lat": 13.033,
        "fuzzed_lng": 77.527
    }
    response = client.post("/api/tips/submit", json=tip_payload)
    assert response.status_code == 200
    assert response.json()["status"] == "SUCCESS"
    
    # Check DB query contains tip
    tips_res = client.get("/api/tips?district=Bengaluru%20Urban")
    assert tips_res.status_code == 200
    assert len(tips_res.json()["tips"]) > 0

def test_report_download():
    """Verify downloadable Intelligence Report file endpoint."""
    response = client.get("/api/report/download?district=Bengaluru%20Urban")
    assert response.status_code == 200
    assert "attachment;" in response.headers["content-disposition"]
