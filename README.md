# Kavach (ಕವಚ) — Karnataka Police Crime Intelligence & Analytical Platform

> **State Crime Records Bureau (SCRB) Strategic Intelligence Hub**  
> *Built for Karnataka State Police (KSP)*

[![CI/CD Pipeline](https://github.com/arjunvallala/Kavach/actions/workflows/ci.yml/badge.svg)](https://github.com/arjunvallala/Kavach/actions/workflows/ci.yml)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB.svg)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20PostGIS-336791.svg)](https://www.postgresql.org)
[![SHAP](https://img.shields.io/badge/Explainable%20AI-SHAP-FF6F00.svg)](https://shap.readthedocs.io)

---

## 🔑 Demo Login Credentials (For Hackathon Judges)

The platform supports Role-Based Access Control (RBAC) with PyJWT token signing. Use any of the following credentials or the universal demo password:

| Role | Username | Dedicated Password | Universal Demo Password |
| :--- | :--- | :--- | :--- |
| **SCRB Director General (Admin)** | `admin` | `ksp_admin_2025` | `ksp_demo_2025` |
| **SCRB Analyst** | `analyst` | `ksp_analyst_2025` | `ksp_demo_2025` |
| **District SP** | `sp` | `ksp_sp_2025` | `ksp_demo_2025` |
| **Station House Officer (SHO)** | `sho` | `ksp_sho_2025` | `ksp_demo_2025` |
| **Constable** | `constable` | `ksp_constable_2025` | `ksp_demo_2025` |

---

## 📌 Executive Summary

**Kavach (ಕವಚ)** is a state-of-the-art, proactive Crime Intelligence & Analytical Platform engineered for the Karnataka State Police (KSP) and State Crime Records Bureau (SCRB). 

Kavach unifies state crime records into a database-backed AI strategic command center featuring **PostgreSQL + PostGIS persistence**, **spatiotemporal DBSCAN hotspot clustering**, **force-directed criminological graph analytics (Louvain community detection)**, **XGBoost risk scoring with real SHAP TreeExplainer feature attributions**, **bilingual (Kannada Unicode + English) FIR text mining**, **responsible AI 80%-rule fairness auditing**, **Hoysala patrol route optimization**, **persistent citizen tips**, and **direct report file exports**.

---

## 🎯 Problem to Solution Mapping (KSP Hackathon Requirements)

| KSP Problem Statement Requirement | Kavach Module & Verified Implementation |
| :--- | :--- |
| **Siloed, manual Excel records** | Persistent **PostgreSQL / PostGIS Database Store** with 5,500+ synthetic KSP FIR records & citizen tips across 10 Karnataka districts. |
| **Lack of SCRB-level proactive visibility** | **Executive Strategic Command Dashboard** querying database statistics for active gang counters and critical threat watchlists. |
| **Geospatial & Spatiotemporal Hotspot Detection** | **District → Station Drilldown GIS Map** querying DB records with time-of-day slider (00:00–23:00) and recalculating **DBSCAN clusters**. |
| **Emerging Trend Anomaly Alerts** | **Pulsing Red-Zone Alerts** calculating rolling z-score baseline deviations ($z \ge +1.2$). |
| **Criminal Link & Network Analysis** | **Force-Directed Graph Visualization** running real NetworkX **Louvain community detection** (`nx.community.louvain_communities`). |
| **Predictive Risk & Evidence-Grade AI** | **XGBoost Classifier Risk Watchlist** with real per-prediction **SHAP TreeExplainer** feature attribution vectors. |
| **Exportable Intelligence Reports** | **SCRB Intelligence Briefing Generator** exporting downloadable HTML/PDF briefing files via `/api/report/download`. |
| **Unstructured FIR Text Data** | **Bilingual (Kannada Unicode + English) NLP Parser** extracting weapons (`ಚಾಕು`), vehicles, stolen amounts, and IPC sections. |
| **Ethical AI & Over-Policing Risk** | **Bias & Fairness Audit Dashboard** computing dynamic overall fairness scores and Disparate Impact Ratios against the 80% Rule ($0.80 \le \text{Ratio} \le 1.25$). |
| **Actionable Operational Deployment** | **Hoysala Patrol Route Optimizer** generating waypoint sequences, time slots, and fuel estimates for station units. |
| **Community & Citizen Engagement** | **Anonymized Citizen Tip Layer** persisting tips directly to database tables, geo-fuzzed under DPDP Act 2023. |
| **Natural Language Accessibility** | **Multilingual Voice/Text Query Bar** translating query strings ("Show me theft hotspots in Mysuru") into JSON filters. |

---

## 🏗️ System Architecture

```mermaid
graph TD
    User([KSP Officer / SCRB Analyst]) -->|React UI / Dark Command Center| Frontend[Vite + React + TypeScript + Leaflet]
    Frontend -->|REST APIs + Signed PyJWT| Backend[FastAPI Backend Server]
    
    subgraph Backend Core Engine
        Backend --> DB[(PostgreSQL + PostGIS Database)]
        Backend --> DataGen[Synthetic KSP Data Pipeline & DB Seeder]
        Backend --> MLEngine[Kavach ML & AI Services Engine]
        
        MLEngine --> DBSCAN[DBSCAN Spatiotemporal Hotspot Clustering]
        MLEngine --> XGBoost[XGBoost Classifier Risk Model]
        MLEngine --> SHAP[SHAP TreeExplainer Feature Importance]
        MLEngine --> Louvain[NetworkX Louvain Community Detection]
        MLEngine --> BilingualNLP[Bilingual Kannada Unicode + English Parser]
        MLEngine --> FairnessAudit[Responsible AI 80% Rule Disparate Impact Monitor]
        MLEngine --> RouteOpt[Greedy Waypoint Patrol Optimizer]
        MLEngine --> NLQuery[Natural Language Query Bar Parser]
    end

    Backend --> Export[Downloadable Report File Engine]
```

---

## 💡 What's Novel (Hackathon Differentiators)

1. **Genuine PostgreSQL + PostGIS Database Backend**: All core endpoints (`/api/overview`, `/api/geospatial/hotspots`, `/api/trends`, `/api/tips`) query persistent database tables via SQLAlchemy ORM.
2. **Role Password Authentication & PyJWT Guards**: Password verification (`ksp_admin_2025`, `ksp_analyst_2025`, `ksp_sp_2025`, etc.) with PyJWT algorithm enforcement and timestamp validation.
3. **Real SHAP TreeExplainer Explainability**: Gives court-admissible feature attribution breakdowns ($\phi_i$) for every XGBoost risk prediction.
4. **Bilingual (Kannada Unicode + English) FIR Text Mining**: Extracts structured entities (weapons, vehicles, MO tags) from mixed Kannada script (`ಸರ ಕಳವು`, `ಚಾಕು`, `ಗಾಂಜಾ`) and English text.
5. **Dynamic 80% Rule Bias & Fairness Audit**: Dynamically calculates top-level overall fairness compliance percentages and district Disparate Impact Ratios ($0.80 \le \text{Ratio} \le 1.25$).
6. **Downloadable Briefing Files & Persistent Citizen Tips**: Direct file downloads via `/api/report/download` and persistent citizen tip database writes (`/api/tips/submit`).

---

## 🚀 2-Minute Judge Demo Script

1. **0:00 – 0:30 (Command Center & Hotspots)**:
   - Open Kavach dashboard (`http://localhost:3000`). Show the dark SCRB Command Center theme.
   - Point to the live **Executive Overview** cards querying 5,500 database FIR records and active red zones.
   - Switch to **Geospatial Intelligence**. Drag the **Time-of-Day Slider** from 18:00 to 23:00 to watch DBSCAN clusters dynamically recalculate and highlight the pulsing **Red-Zone Alert** in Peenya PS ($z = +2.4$).
2. **0:30 – 1:00 (Network Graph & Criminal Rings)**:
   - Click **Network & Link Analysis**. Hover over the force graph to showcase offender co-accused links.
   - Highlight **Garuda Syndicate (RING-KSP-101)** automatically surfaced by the Louvain community detection algorithm (`nx.community.louvain_communities`). Click a node to view the MO similarity score (92.4% match).
3. **1:00 – 1:30 (Predictive Risk & SHAP Explainability)**:
   - Click **AI Risk & SHAP Explainability**. Show the 7-day risk watchlist ranking stations by risk score.
   - Click **Peenya PS (Risk: 88/100)** to reveal the SHAP bar chart showing exact feature attributions (*Historical Density +0.38, Unemployment Rate +0.24*).
4. **1:30 – 2:00 (Bilingual NLP & Downloadable Briefing File)**:
   - Switch to **SCRB Innovation Suite** -> **Bilingual FIR NLP Mining**. Select a Kannada/English sample narrative and click **Extract Entities** to show extracted weapons (Knife/ಚಾಕು), vehicle (Pulsar 220), and IPC section 392.
   - Click **Export Briefing** -> **Download File** in the header to trigger a direct file download of the KSP SCRB Intelligence Report.

---

## 📊 5-Slide Pitch Outline

- **Slide 1: The Problem**: KSP crime records are siloed in Excel spreadsheets, strictly reactive, with zero cross-jurisdiction link visibility or automated hotspot forecasting.
- **Slide 2: The Solution (Kavach)**: A unified, AI-driven SCRB Strategic Intelligence Platform offering geospatial hotspots, link analysis, predictive risk scoring, and bilingual NLP text mining.
- **Slide 3: Architecture & Data Pipeline**: Powered by React/TypeScript frontend, FastAPI backend, PostgreSQL + PostGIS, DBSCAN clustering, XGBoost risk models, SHAP TreeExplainer, and NetworkX Louvain graph analytics.
- **Slide 4: Key Differentiators**: Bilingual Kannada/English FIR entity extraction, SHAP evidence-grade explainability, Responsible AI 80% Rule fairness audit dashboard, and Hoysala patrol route optimization.
- **Slide 5: Impact & Future Roadmap**: Transforms KSP from reactive policing to proactive intelligence; ready for live KSP CCTNS integration and state-wide rollout.

---

## 💻 Local One-Command Setup

### Option 1: Docker Compose (PostgreSQL + PostGIS + FastAPI + React)
```bash
docker-compose up --build
```
- **Frontend Dashboard**: `http://localhost:3000`
- **FastAPI OpenAPI Specs**: `http://localhost:8000/docs`

### Option 2: Local Python & Node Execution

**Backend & Pytest Suite:**
```bash
cd backend
pip install -r requirements.txt
pytest tests/
python main.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---
*Developed for Karnataka State Police (KSP) / State Crime Records Bureau (SCRB).*
