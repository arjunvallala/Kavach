import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app
from data_generator import generate_synthetic_firs, generate_citizen_tips
from ml_engine import KavachMLEngine

client = TestClient(app)

def test_data_generator_output():
    """Verify data generator produces expected row counts and schema."""
    df, offenders, victims, gangs = generate_synthetic_firs(100)
    assert len(df) == 100
    assert "fir_number" in df.columns
    assert "district" in df.columns
    assert "crime_category" in df.columns
    assert "lat" in df.columns
    assert "lng" in df.columns
    assert len(gangs) >= 3

def test_health_endpoint():
    """Verify /api/health endpoint returns 200 HEALTHY."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"

def test_overview_endpoint():
    """Verify /api/overview endpoint returns valid KSP statistics."""
    response = client.get("/api/overview?district=Bengaluru%20Urban")
    assert response.status_code == 200
    data = response.json()
    assert "total_firs" in data
    assert "red_zones_count" in data
    assert data["districts_count"] == 1

def test_geospatial_hotspots():
    """Verify DBSCAN clustering returns non-empty clusters and red zones."""
    response = client.get("/api/geospatial/hotspots?district=Bengaluru%20Urban&hour_min=0&hour_max=23")
    assert response.status_code == 200
    data = response.json()
    assert "clusters" in data
    assert "red_zones" in data
    assert len(data["clusters"]) >= 1

def test_network_graph():
    """Verify NetworkX graph and Louvain communities calculation."""
    response = client.get("/api/network/graph?district=All")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "links" in data
    assert "detected_rings" in data
    assert len(data["nodes"]) > 0

def test_predictive_risk_and_shap():
    """Verify XGBoost risk scoring and real SHAP feature attributions."""
    response = client.get("/api/predictive/risk?district=All")
    assert response.status_code == 200
    data = response.json()
    assert "watchlist" in data
    assert len(data["watchlist"]) > 0
    top_station = data["watchlist"][0]
    assert "shap_factors" in top_station
    assert len(top_station["shap_factors"]) > 0
    assert "feature" in top_station["shap_factors"][0]

def test_bilingual_fir_nlp():
    """Verify bilingual Kannada + English FIR NLP parser."""
    payload = {
        "narrative": "Complainant reported that on 2025-06-14 near Majestic, two miscreants extracted knife (ಚಾಕು) weapon and snatched gold chain. Case under IPC 392."
    }
    response = client.post("/api/nlp/parse", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "weapons" in data
    assert "mo_category" in data
    assert "Chain Snatching" in data["mo_category"]

def test_fairness_audit():
    """Verify disparate impact 80% rule compliance computation."""
    response = client.get("/api/fairness/audit")
    assert response.status_code == 200
    data = response.json()
    assert "district_breakdown" in data
    assert len(data["district_breakdown"]) > 0
    dist_stat = data["district_breakdown"][0]
    assert "disparate_impact_ratio" in dist_stat
    assert dist_stat["disparate_impact_ratio"] > 0

def test_patrol_optimization():
    """Verify patrol route waypoints and fuel estimates."""
    response = client.get("/api/patrol/optimize?station=Peenya%20PS")
    assert response.status_code == 200
    data = response.json()
    assert "waypoints" in data
    assert len(data["waypoints"]) == 4
    assert data["estimated_distance_km"] > 0

def test_citizen_tips():
    """Verify anonymized citizen tip feed."""
    response = client.get("/api/tips?district=Bengaluru%20Urban")
    assert response.status_code == 200
    data = response.json()
    assert "tips" in data
    assert len(data["tips"]) > 0

def test_auth_login():
    """Verify JWT authentication token issuance."""
    payload = {"username": "admin", "password": "password123", "role": "Admin"}
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
