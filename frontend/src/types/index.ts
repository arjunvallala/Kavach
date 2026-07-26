export interface UserRole {
  name: string;
  role: string;
  badge: string;
  district: string;
}

export interface OverviewStats {
  total_firs: number;
  districts_count: number;
  active_gangs: number;
  red_zones_count: number;
  high_risk_stations: number;
  repeat_victims_count: number;
  top_crime_category: string;
  districts_summary: {
    name: string;
    fir_count: number;
    lat: number;
    lng: number;
  }[];
}

export interface HotspotCluster {
  cluster_id: number;
  center_lat: number;
  center_lng: number;
  count: number;
  district: string;
  station: string;
  primary_crime: string;
  radius_meters: number;
}

export interface RedZoneAlert {
  station: string;
  district: string;
  lat: number;
  lng: number;
  incident_count: number;
  z_score: number;
  alert_level: 'CRITICAL' | 'ELEVATED';
  dominant_crime: string;
}

export interface HotspotsResponse {
  clusters: HotspotCluster[];
  red_zones: RedZoneAlert[];
  total_incidents: number;
}

export interface GraphNode {
  id: string;
  name: string;
  type: 'offender' | 'co_accused' | 'station' | 'mo';
  district: string;
}

export interface GraphLink {
  source: string;
  target: string;
  relation: string;
}

export interface CriminalRing {
  ring_id: string;
  member_count: number;
  members: string[];
  risk_level: string;
}

export interface NetworkGraphResponse {
  nodes: GraphNode[];
  links: GraphLink[];
  detected_rings: CriminalRing[];
  total_nodes: number;
  total_edges: number;
}

export interface ShapFactor {
  feature: string;
  contribution: number;
  impact: string;
}

export interface StationRisk {
  station: string;
  district: string;
  lat: number;
  lng: number;
  risk_score_7d: number;
  risk_score_30d: number;
  threat_level: 'CRITICAL' | 'HIGH' | 'MODERATE';
  shap_factors: ShapFactor[];
  watchlist_rank: number;
}

export interface AnomalyRecord {
  fir_number: string;
  district: string;
  station: string;
  crime_category: string;
  hour: number;
  date: string;
  fir_narrative: string;
}

export interface PredictiveRiskResponse {
  watchlist: StationRisk[];
  anomalies: AnomalyRecord[];
  overall_state_risk: number;
}

export interface TrendsResponse {
  hourly_distribution: { hour: string; count: number }[];
  crime_categories: { category: string; count: number }[];
  day_of_week: { day: string; count: number }[];
  automated_insights: string[];
}

export interface FirParseResponse {
  weapons: string[];
  vehicles: string[];
  extracted_amounts: string[];
  extracted_weights: string[];
  mo_category: string;
  ksp_ipc_sections: string[];
  language_detected: string;
  confidence_score: number;
}

export interface DistrictFairness {
  district: string;
  unemployment_rate: number;
  literacy_rate: number;
  total_cases: number;
  risk_selection_rate: number;
  disparate_impact_ratio: number;
  bias_status: string;
}

export interface FairnessAuditResponse {
  disparate_impact_threshold: string;
  overall_fairness_score: string;
  district_breakdown: DistrictFairness[];
}

export interface PatrolWaypoint {
  step: number;
  location: string;
  lat: number;
  lng: number;
  time_slot: string;
  priority: string;
}

export interface PatrolOptimizationResponse {
  station: string;
  district: string;
  recommended_vehicle: string;
  waypoints: PatrolWaypoint[];
  estimated_distance_km: number;
  estimated_fuel_liters: number;
}

export interface CitizenTip {
  tip_id: string;
  district: string;
  station: string;
  category: string;
  description: string;
  fuzzed_lat: number;
  fuzzed_lng: number;
  timestamp: string;
  credibility_score: number;
}

export interface NlQueryResponse {
  raw_query: string;
  parsed_district: string;
  parsed_crime_type: string;
  parsed_timeframe: string;
  matching_records: number;
}
