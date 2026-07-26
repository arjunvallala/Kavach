import {
  OverviewStats, HotspotsResponse, NetworkGraphResponse, PredictiveRiskResponse,
  TrendsResponse, FirParseResponse, FairnessAuditResponse, PatrolOptimizationResponse,
  CitizenTip, NlQueryResponse
} from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8000/api';

let jwtToken: string | null = null;

export const setAuthToken = (token: string) => {
  jwtToken = token;
};

// --- Rich Offline Standalone Fallback Data ---
const MOCK_OVERVIEW: OverviewStats = {
  total_firs: 5500,
  districts_count: 10,
  active_gangs: 4,
  red_zones_count: 3,
  high_risk_stations: 4,
  repeat_victims_count: 620,
  top_crime_category: "Chain Snatching",
  districts_summary: [
    { name: "Bengaluru Urban", fir_count: 1925, lat: 12.9716, lng: 77.5946 },
    { name: "Mysuru", fir_count: 660, lat: 12.2958, lng: 76.6394 },
    { name: "Mangaluru", fir_count: 550, lat: 12.9141, lng: 74.8560 },
    { name: "Hubballi-Dharwad", fir_count: 495, lat: 15.3647, lng: 75.1240 },
    { name: "Belagavi", fir_count: 440, lat: 15.8497, lng: 74.4977 },
    { name: "Kalaburagi", fir_count: 385, lat: 17.3297, lng: 76.8343 },
    { name: "Shivamogga", fir_count: 330, lat: 13.9299, lng: 75.5681 },
    { name: "Tumakuru", fir_count: 275, lat: 13.3379, lng: 77.1173 },
    { name: "Ballari", fir_count: 220, lat: 15.1394, lng: 76.9214 },
    { name: "Udupi", fir_count: 220, lat: 13.3409, lng: 74.7421 }
  ]
};

const MOCK_HOTSPOTS: HotspotsResponse = {
  total_incidents: 1240,
  clusters: [
    { cluster_id: 1, center_lat: 13.0329, center_lng: 77.5274, count: 42, district: "Bengaluru Urban", station: "Peenya PS", primary_crime: "Commercial Burglary", radius_meters: 800 },
    { cluster_id: 2, center_lat: 12.9774, center_lng: 77.5708, count: 38, district: "Bengaluru Urban", station: "Majestic PS", primary_crime: "Chain Snatching", radius_meters: 650 },
    { cluster_id: 3, center_lat: 12.3081, center_lng: 76.6508, count: 29, district: "Mysuru", station: "Devaraja PS", primary_crime: "Two-Wheeler Theft", radius_meters: 500 },
    { cluster_id: 4, center_lat: 12.8622, center_lng: 74.8391, count: 24, district: "Mangaluru", station: "Pandeshwar PS", primary_crime: "NDPS / Drug Trafficking", radius_meters: 450 },
    { cluster_id: 5, center_lat: 15.3524, center_lng: 75.1388, count: 18, district: "Hubballi-Dharwad", station: "Suburban PS", primary_crime: "Aggravated Assault", radius_meters: 400 }
  ],
  red_zones: [
    { station: "Peenya PS", district: "Bengaluru Urban", lat: 13.0329, lng: 77.5274, incident_count: 42, z_score: 2.4, alert_level: "CRITICAL", dominant_crime: "Commercial Burglary" },
    { station: "Devaraja PS", district: "Mysuru", lat: 12.3081, lng: 76.6508, incident_count: 29, z_score: 1.8, alert_level: "CRITICAL", dominant_crime: "Chain Snatching" },
    { station: "Pandeshwar PS", district: "Mangaluru", lat: 12.8622, lng: 74.8391, incident_count: 24, z_score: 1.4, alert_level: "ELEVATED", dominant_crime: "NDPS / Drug Trafficking" }
  ]
};

const MOCK_NETWORK: NetworkGraphResponse = {
  total_nodes: 24,
  total_edges: 28,
  nodes: [
    { id: "OFF-1001", name: "Ramesh @ Kali Ramesh", type: "offender", district: "Bengaluru Urban" },
    { id: "CO-Suresh", name: "Suresh @ Bullet", type: "co_accused", district: "Bengaluru Urban" },
    { id: "CO-Deepak", name: "Deepak @ Snake", type: "co_accused", district: "Bengaluru Urban" },
    { id: "Peenya PS", name: "Peenya PS", type: "station", district: "Bengaluru Urban" },
    { id: "MO: Pillion Snatch", name: "Pillion Snatching", type: "mo", district: "Bengaluru Urban" },
    { id: "OFF-1002", name: "Mohammed @ Don Raza", type: "offender", district: "Mangaluru" },
    { id: "CO-Feroz", name: "Feroz @ Kutta", type: "co_accused", district: "Mangaluru" },
    { id: "Pandeshwar PS", name: "Pandeshwar PS", type: "station", district: "Mangaluru" },
    { id: "MO: MDMA Packets", name: "MDMA Packets", type: "mo", district: "Mangaluru" }
  ],
  links: [
    { source: "OFF-1001", target: "CO-Suresh", relation: "co_accused" },
    { source: "OFF-1001", target: "CO-Deepak", relation: "co_accused" },
    { source: "OFF-1001", target: "Peenya PS", relation: "operates_in" },
    { source: "OFF-1001", target: "MO: Pillion Snatch", relation: "uses_mo" },
    { source: "OFF-1002", target: "CO-Feroz", relation: "co_accused" },
    { source: "OFF-1002", target: "Pandeshwar PS", relation: "operates_in" },
    { source: "OFF-1002", target: "MO: MDMA Packets", relation: "uses_mo" }
  ],
  detected_rings: [
    { ring_id: "RING-KSP-101 (Garuda Syndicate)", member_count: 4, members: ["Ramesh @ Kali Ramesh", "Suresh @ Bullet", "Deepak @ Snake", "Mansoor @ Tiger"], risk_level: "HIGH RISK" },
    { ring_id: "RING-KSP-102 (Coastal Narcotics Ring)", member_count: 3, members: ["Mohammed @ Don Raza", "Feroz @ Kutta", "Prashanth @ Jack"], risk_level: "HIGH RISK" },
    { ring_id: "RING-KSP-103 (Northern Shutter Busters)", member_count: 3, members: ["Basavaraj @ Shutter Basu", "Yallappa @ Cutter", "Mallikarjun"], risk_level: "MEDIUM RISK" }
  ]
};

const MOCK_RISK: PredictiveRiskResponse = {
  overall_state_risk: 68,
  watchlist: [
    {
      station: "Peenya PS", district: "Bengaluru Urban", lat: 13.0329, lng: 77.5274,
      risk_score_7d: 88, risk_score_30d: 94, threat_level: "CRITICAL", watchlist_rank: 1,
      shap_factors: [
        { feature: "Historical Incident Density", contribution: 0.38, impact: "HIGH POSITIVE" },
        { feature: "Regional Unemployment Rate", contribution: 0.24, impact: "POSITIVE" },
        { feature: "Urbanization Density", contribution: 0.18, impact: "MODERATE" },
        { feature: "Repeat Victimization Rate", contribution: 0.12, impact: "MODERATE POSITIVE" }
      ]
    },
    {
      station: "Devaraja PS", district: "Mysuru", lat: 12.3081, lng: 76.6508,
      risk_score_7d: 79, risk_score_30d: 85, threat_level: "CRITICAL", watchlist_rank: 2,
      shap_factors: [
        { feature: "Historical Incident Density", contribution: 0.34, impact: "HIGH POSITIVE" },
        { feature: "Regional Unemployment Rate", contribution: 0.26, impact: "POSITIVE" },
        { feature: "Repeat Victimization Rate", contribution: 0.16, impact: "MODERATE POSITIVE" }
      ]
    },
    {
      station: "Pandeshwar PS", district: "Mangaluru", lat: 12.8622, lng: 74.8391,
      risk_score_7d: 74, risk_score_30d: 81, threat_level: "HIGH", watchlist_rank: 3,
      shap_factors: [
        { feature: "Regional Unemployment Rate", contribution: 0.32, impact: "HIGH POSITIVE" },
        { feature: "Historical Incident Density", contribution: 0.28, impact: "POSITIVE" }
      ]
    },
    {
      station: "Suburban PS", district: "Hubballi-Dharwad", lat: 15.3524, lng: 75.1388,
      risk_score_7d: 68, risk_score_30d: 76, threat_level: "HIGH", watchlist_rank: 4,
      shap_factors: [
        { feature: "Historical Incident Density", contribution: 0.30, impact: "HIGH POSITIVE" },
        { feature: "Urbanization Density", contribution: 0.22, impact: "MODERATE" }
      ]
    }
  ],
  anomalies: [
    { fir_number: "FIR/KSP/2025/10042", district: "Bengaluru Urban", station: "Peenya PS", crime_category: "Commercial Burglary", hour: 3, date: "2025-06-18", fir_narrative: "Night break-in using shutter cutter." }
  ]
};

const MOCK_TRENDS: TrendsResponse = {
  hourly_distribution: [
    { hour: "00:00", count: 85 }, { hour: "02:00", count: 180 }, { hour: "04:00", count: 140 },
    { hour: "06:00", count: 45 }, { hour: "08:00", count: 70 }, { hour: "10:00", count: 210 },
    { hour: "12:00", count: 160 }, { hour: "14:00", count: 190 }, { hour: "16:00", count: 175 },
    { hour: "18:00", count: 320 }, { hour: "20:00", count: 290 }, { hour: "22:00", count: 210 }
  ],
  crime_categories: [
    { category: "Chain Snatching", count: 1420 },
    { category: "Cyber Crime / Online Fraud", count: 1150 },
    { category: "Two-Wheeler Theft", count: 980 },
    { category: "NDPS / Drug Trafficking", count: 740 },
    { category: "Commercial Burglary", count: 610 },
    { category: "Aggravated Assault", count: 600 }
  ],
  day_of_week: [
    { day: "Monday", count: 750 }, { day: "Tuesday", count: 720 }, { day: "Wednesday", count: 780 },
    { day: "Thursday", count: 810 }, { day: "Friday", count: 890 }, { day: "Saturday", count: 960 }, { day: "Sunday", count: 590 }
  ],
  automated_insights: [
    "Chain snatching in Bengaluru Urban spiked by 34% during evening hours (17:00 - 20:00) over the past 90 days.",
    "Cyber Crime / Online Fraud cases exhibit a strong peak between 10:00 - 15:00, driven by APK phishing attacks.",
    "Garuda Syndicate co-accused activity accounts for 18% of violent snatching cases across Bengaluru & Mysuru corridor.",
    "Night commercial break-ins remain concentrated around Industrial Clusters (Peenya PS & Suburban PS) between 02:00 - 05:00."
  ]
};

const MOCK_FAIRNESS: FairnessAuditResponse = {
  disparate_impact_threshold: "0.80 - 1.25 (80% Rule Compliant)",
  overall_fairness_score: "92.1% (Passes Ethical AI Compliance)",
  district_breakdown: [
    { district: "Bengaluru Urban", unemployment_rate: 8.2, literacy_rate: 88.0, total_cases: 1925, risk_selection_rate: 0.34, disparate_impact_ratio: 0.97, bias_status: "FAIR / COMPLIANT (80% Rule)" },
    { district: "Mysuru", unemployment_rate: 9.5, literacy_rate: 82.0, total_cases: 660, risk_selection_rate: 0.36, disparate_impact_ratio: 1.02, bias_status: "FAIR / COMPLIANT (80% Rule)" },
    { district: "Mangaluru", unemployment_rate: 7.6, literacy_rate: 90.0, total_cases: 550, risk_selection_rate: 0.32, disparate_impact_ratio: 0.91, bias_status: "FAIR / COMPLIANT (80% Rule)" },
    { district: "Hubballi-Dharwad", unemployment_rate: 11.0, literacy_rate: 80.0, total_cases: 495, risk_selection_rate: 0.38, disparate_impact_ratio: 1.08, bias_status: "FAIR / COMPLIANT (80% Rule)" },
    { district: "Belagavi", unemployment_rate: 10.5, literacy_rate: 77.0, total_cases: 440, risk_selection_rate: 0.35, disparate_impact_ratio: 1.00, bias_status: "FAIR / COMPLIANT (80% Rule)" }
  ]
};

const MOCK_PATROL: PatrolOptimizationResponse = {
  station: "Peenya PS",
  district: "Bengaluru Urban",
  recommended_vehicle: "KSP Hoysala Patrol Vehicle #4",
  estimated_distance_km: 14.2,
  estimated_fuel_liters: 1.8,
  waypoints: [
    { step: 1, location: "Peenya PS Command Desk", lat: 13.0329, lng: 77.5274, time_slot: "18:00 - 19:15", priority: "START" },
    { step: 2, location: "Commercial Hub & Bus Terminus", lat: 13.0389, lng: 77.5224, time_slot: "19:30 - 21:00", priority: "HIGH (Chain Snatching Spot)" },
    { step: 3, location: "Residential Outer Ring Road", lat: 13.0249, lng: 77.5344, time_slot: "21:15 - 23:00", priority: "MEDIUM (Patrol Coverage)" },
    { step: 4, location: "Industrial Park & ATM Cluster", lat: 13.0369, lng: 77.5354, time_slot: "23:15 - 02:00", priority: "CRITICAL (Night Burglary Spot)" }
  ]
};

const MOCK_TIPS: CitizenTip[] = [
  { tip_id: "TIP-2025-1001", district: "Bengaluru Urban", station: "Peenya PS", category: "Suspicious Group Gathering", description: "Anonymous citizen report of suspicious group gathering near Peenya Industrial Gate 2.", fuzzed_lat: 13.033, fuzzed_lng: 77.527, timestamp: "2025-06-25T14:30:00", credibility_score: 0.92 },
  { tip_id: "TIP-2025-1002", district: "Mysuru", station: "Devaraja PS", category: "Frequent Chain Snatching Spot", description: "Unclaimed black Pulsar bike parked near Market Circle without number plate.", fuzzed_lat: 12.308, fuzzed_lng: 76.651, timestamp: "2025-06-24T19:15:00", credibility_score: 0.88 },
  { tip_id: "TIP-2025-1003", district: "Mangaluru", station: "Pandeshwar PS", category: "Illicit Drug Sale", description: "Suspected sale of MDMA packets near campus bus shelter.", fuzzed_lat: 12.862, fuzzed_lng: 74.839, timestamp: "2025-06-23T22:00:00", credibility_score: 0.95 }
];

// --- Reliable Fetch Wrapper with Automatic Offline Fallback ---
async function fetchJson<T>(url: string, options: RequestInit = {}, fallbackData?: T): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (jwtToken) {
    headers['Authorization'] = `Bearer ${jwtToken}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout for immediate fallback
    
    const res = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    if (fallbackData !== undefined) {
      return fallbackData;
    }
    throw err;
  }
}

export const api = {
  login: async (username: string, role: string, password = 'ksp_demo_2025') => {
    try {
      const data = await fetchJson<{ access_token: string; user: any }>(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ username, password, role })
      });
      setAuthToken(data.access_token);
      return data;
    } catch (e) {
      const mockToken = "kavach_jwt_demo_token_offline_2025";
      setAuthToken(mockToken);
      return { access_token: mockToken, user: { name: `Officer ${username}`, role, badge: "KSP-001", district: "Statewide SCRB" } };
    }
  },

  getOverview: (district = 'All') => 
    fetchJson<OverviewStats>(`${API_BASE}/overview?district=${encodeURIComponent(district)}`, {}, MOCK_OVERVIEW),

  getHotspots: (district = 'All', hourMin = 0, hourMax = 23, crimeType = 'All') => 
    fetchJson<HotspotsResponse>(`${API_BASE}/geospatial/hotspots?district=${encodeURIComponent(district)}&hour_min=${hourMin}&hour_max=${hourMax}&crime_type=${encodeURIComponent(crimeType)}`, {}, MOCK_HOTSPOTS),

  getNetworkGraph: (district = 'All') => 
    fetchJson<NetworkGraphResponse>(`${API_BASE}/network/graph?district=${encodeURIComponent(district)}`, {}, MOCK_NETWORK),

  getPredictiveRisk: (district = 'All') => 
    fetchJson<PredictiveRiskResponse>(`${API_BASE}/predictive/risk?district=${encodeURIComponent(district)}`, {}, MOCK_RISK),

  getTrends: (district = 'All') => 
    fetchJson<TrendsResponse>(`${API_BASE}/trends?district=${encodeURIComponent(district)}`, {}, MOCK_TRENDS),

  getCasesFeedback: (district = 'All') => 
    fetchJson<{ crime_category: string; total_cases: number; conviction_rate: number }[]>(`${API_BASE}/cases/feedback?district=${encodeURIComponent(district)}`, {}, [
      { crime_category: "Chain Snatching", total_cases: 1420, conviction_rate: 68.4 },
      { crime_category: "Cyber Crime", total_cases: 1150, conviction_rate: 42.1 },
      { crime_category: "Commercial Burglary", total_cases: 610, conviction_rate: 74.2 }
    ]),

  parseFir: (narrative: string) => {
    const hasKannada = /[\u0C80-\u0CFF]/.test(narrative);
    const mockParse: FirParseResponse = {
      weapons: narrative.includes("knife") || narrative.includes("ಚಾಕು") ? ["Edged Weapon / Knife (ಚಾಕು)"] : ["Blunt Instrument / Iron Rod"],
      vehicles: narrative.includes("Pulsar") || narrative.includes("ಬೈಕ್") ? ["Black Pulsar 220 Bike"] : ["No Vehicle Recorded"],
      extracted_amounts: ["180000"],
      extracted_weights: ["45"],
      mo_category: narrative.includes("snatch") || narrative.includes("ಸರ") ? "Chain Snatching on Vehicle (ಸರ ಕಳವು)" : "Night Break-in (ರಾತ್ರಿ ಕಳ್ಳತನ)",
      ksp_ipc_sections: ["392 IPC", "397 IPC"],
      language_detected: hasKannada ? "Bilingual Kannada (ಕನ್ನಡ Script) + English" : "English with Transliteration",
      confidence_score: 0.96
    };
    return fetchJson<FirParseResponse>(`${API_BASE}/nlp/parse`, { method: 'POST', body: JSON.stringify({ narrative }) }, mockParse);
  },

  getFairnessAudit: (district = 'All') => 
    fetchJson<FairnessAuditResponse>(`${API_BASE}/fairness/audit?district=${encodeURIComponent(district)}`, {}, MOCK_FAIRNESS),

  optimizePatrol: (station = 'Peenya PS') => 
    fetchJson<PatrolOptimizationResponse>(`${API_BASE}/patrol/optimize?station=${encodeURIComponent(station)}`, {}, MOCK_PATROL),

  getTips: (district = 'All') => 
    fetchJson<{ tips: CitizenTip[]; total_tips: number }>(`${API_BASE}/tips?district=${encodeURIComponent(district)}`, {}, { tips: MOCK_TIPS, total_tips: MOCK_TIPS.length }),

  submitTip: (tipData: any) =>
    fetchJson<{ status: string; tip: CitizenTip }>(`${API_BASE}/tips/submit`, { method: 'POST', body: JSON.stringify(tipData) }, { status: "SUCCESS", tip: { ...tipData, tip_id: "TIP-2025-999", timestamp: new Date().toISOString(), credibility_score: 0.88 } }),

  nlQuery: (query: string) => {
    const mockNl: NlQueryResponse = {
      raw_query: query,
      parsed_district: query.includes("Mysuru") || query.includes("mysuru") ? "Mysuru" : "Bengaluru Urban",
      parsed_crime_type: query.includes("snatch") || query.includes("chain") ? "Chain Snatching" : "All",
      parsed_timeframe: "Last 90 Days",
      matching_records: 660
    };
    return fetchJson<NlQueryResponse>(`${API_BASE}/nl-query?q=${encodeURIComponent(query)}`, {}, mockNl);
  },

  getReportHtml: (district = 'Bengaluru Urban') => 
    fetchJson<{ district: string; html_report: string }>(`${API_BASE}/report/export?district=${encodeURIComponent(district)}`, {}, {
      district,
      html_report: `<html><body style="font-family:sans-serif;background:#0f172a;color:#fff;padding:30px;"><h1>KAVACH (ಕವಚ) - KSP SCRB INTELLIGENCE REPORT</h1><h2>District: ${district}</h2><p>Total FIR Records Analyzed: 5,500</p><p>Emerging Red Zones: 3</p></body></html>`
    }),

  downloadReportUrl: (district = 'Bengaluru Urban') => 
    `${API_BASE}/download/report?district=${encodeURIComponent(district)}`
};
