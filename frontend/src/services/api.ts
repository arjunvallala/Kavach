import {
  OverviewStats, HotspotsResponse, NetworkGraphResponse, PredictiveRiskResponse,
  TrendsResponse, FirParseResponse, FairnessAuditResponse, PatrolOptimizationResponse,
  CitizenTip, NlQueryResponse
} from '../types';

const API_BASE = 'http://localhost:8000/api';

let jwtToken: string | null = null;

export const setAuthToken = (token: string) => {
  jwtToken = token;
};

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (jwtToken) {
    headers['Authorization'] = `Bearer ${jwtToken}`;
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  login: async (username: string, role: string) => {
    const data = await fetchJson<{ access_token: string; user: any }>(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password: 'password', role })
    });
    setAuthToken(data.access_token);
    return data;
  },

  getOverview: (district = 'All') => 
    fetchJson<OverviewStats>(`${API_BASE}/overview?district=${encodeURIComponent(district)}`),

  getHotspots: (district = 'All', hourMin = 0, hourMax = 23, crimeType = 'All') => 
    fetchJson<HotspotsResponse>(`${API_BASE}/geospatial/hotspots?district=${encodeURIComponent(district)}&hour_min=${hourMin}&hour_max=${hourMax}&crime_type=${encodeURIComponent(crimeType)}`),

  getNetworkGraph: (district = 'All') => 
    fetchJson<NetworkGraphResponse>(`${API_BASE}/network/graph?district=${encodeURIComponent(district)}`),

  getPredictiveRisk: (district = 'All') => 
    fetchJson<PredictiveRiskResponse>(`${API_BASE}/predictive/risk?district=${encodeURIComponent(district)}`),

  getTrends: (district = 'All') => 
    fetchJson<TrendsResponse>(`${API_BASE}/trends?district=${encodeURIComponent(district)}`),

  getCasesFeedback: (district = 'All') => 
    fetchJson<{ crime_category: string; total_cases: number; conviction_rate: number }[]>(`${API_BASE}/cases/feedback?district=${encodeURIComponent(district)}`),

  parseFir: (narrative: string) => 
    fetchJson<FirParseResponse>(`${API_BASE}/nlp/parse`, {
      method: 'POST',
      body: JSON.stringify({ narrative })
    }),

  getFairnessAudit: (district = 'All') => 
    fetchJson<FairnessAuditResponse>(`${API_BASE}/fairness/audit?district=${encodeURIComponent(district)}`),

  optimizePatrol: (station = 'Peenya PS') => 
    fetchJson<PatrolOptimizationResponse>(`${API_BASE}/patrol/optimize?station=${encodeURIComponent(station)}`),

  getTips: (district = 'All') => 
    fetchJson<{ tips: CitizenTip[]; total_tips: number }>(`${API_BASE}/tips?district=${encodeURIComponent(district)}`),

  nlQuery: (query: string) => 
    fetchJson<NlQueryResponse>(`${API_BASE}/nl-query?q=${encodeURIComponent(query)}`),

  getReportHtml: (district = 'Bengaluru Urban') => 
    fetchJson<{ district: string; html_report: string }>(`${API_BASE}/report/export?district=${encodeURIComponent(district)}`)
};
