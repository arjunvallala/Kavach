import {
  OverviewStats, HotspotsResponse, NetworkGraphResponse, PredictiveRiskResponse,
  TrendsResponse, FirParseResponse, FairnessAuditResponse, PatrolOptimizationResponse,
  CitizenTip, NlQueryResponse
} from '../types';

const API_BASE = 'http://localhost:8000/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export const api = {
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

  parseFir: (narrative: string) => 
    fetchJson<FirParseResponse>(`${API_BASE}/nlp/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ narrative })
    }),

  getFairnessAudit: () => 
    fetchJson<FairnessAuditResponse>(`${API_BASE}/fairness/audit`),

  optimizePatrol: (station = 'Peenya PS') => 
    fetchJson<PatrolOptimizationResponse>(`${API_BASE}/patrol/optimize?station=${encodeURIComponent(station)}`),

  getTips: (district = 'All') => 
    fetchJson<{ tips: CitizenTip[]; total_tips: number }>(`${API_BASE}/tips?district=${encodeURIComponent(district)}`),

  nlQuery: (query: string) => 
    fetchJson<NlQueryResponse>(`${API_BASE}/nl-query?q=${encodeURIComponent(query)}`),

  getReportHtml: (district = 'Bengaluru Urban') => 
    fetchJson<{ district: string; html_report: string }>(`${API_BASE}/report/export?district=${encodeURIComponent(district)}`)
};
