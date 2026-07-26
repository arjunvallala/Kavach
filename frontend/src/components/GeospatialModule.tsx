import React, { useState, useEffect } from 'react';
import { HotspotsResponse, HotspotCluster, RedZoneAlert } from '../types';
import { MapPin, Clock, Filter, AlertTriangle, Flame, Shield, Layers, RefreshCw } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup, Circle } from 'react-leaflet';

interface GeospatialModuleProps {
  hotspotsData: HotspotsResponse | null;
  selectedDistrict: string;
  onDistrictChange: (district: string) => void;
  onRefresh: (hourMin: number, hourMax: number, crimeType: string) => void;
  onOpenReport: () => void;
}

const CRIME_TYPES_FILTER = [
  "All", "Chain Snatching", "Cyber Crime / Online Fraud", "NDPS / Drug Trafficking",
  "Two-Wheeler Theft", "Commercial Burglary", "Aggravated Assault", "Domestic Violence / Harassment"
];

const DISTRICT_CENTERS: Record<string, [number, number]> = {
  "Bengaluru Urban": [12.9716, 77.5946],
  "Mysuru": [12.2958, 76.6394],
  "Mangaluru": [12.9141, 74.8560],
  "Hubballi-Dharwad": [15.3647, 75.1240],
  "Belagavi": [15.8497, 74.4977],
  "Kalaburagi": [17.3297, 76.8343],
  "Shivamogga": [13.9299, 75.5681],
  "Tumakuru": [13.3379, 77.1173],
  "Ballari": [15.1394, 76.9214],
  "Udupi": [13.3409, 74.7421],
  "All": [13.5, 76.0]
};

export const GeospatialModule: React.FC<GeospatialModuleProps> = ({
  hotspotsData,
  selectedDistrict,
  onDistrictChange,
  onRefresh,
  onOpenReport
}) => {
  const [hourMin, setHourMin] = useState(0);
  const [hourMax, setHourMax] = useState(23);
  const [selectedCrime, setSelectedCrime] = useState('All');

  const centerCoords = DISTRICT_CENTERS[selectedDistrict] || DISTRICT_CENTERS["All"];
  const zoomLevel = selectedDistrict === 'All' ? 7 : 12;

  const handleTimeChange = (min: number, max: number) => {
    setHourMin(min);
    setHourMax(max);
    onRefresh(min, max, selectedCrime);
  };

  const handleCrimeChange = (crime: string) => {
    setSelectedCrime(crime);
    onRefresh(hourMin, hourMax, crime);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls Bar */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Spatiotemporal Crime Hotspot & Red-Zone Intelligence
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time DBSCAN spatial clustering with rolling-window z-score anomaly detection across Karnataka state jurisdictions.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Category Filter */}
          <div className="flex items-center space-x-2 bg-[#131c31] border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400 font-semibold">Crime:</span>
            <select
              value={selectedCrime}
              onChange={(e) => handleCrimeChange(e.target.value)}
              className="bg-transparent text-sky-400 font-semibold focus:outline-none cursor-pointer"
            >
              {CRIME_TYPES_FILTER.map((c) => (
                <option key={c} value={c} className="bg-[#1e293b] text-slate-200">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenReport}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition shadow-md flex items-center space-x-1.5"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Generate Intelligence Briefing</span>
          </button>

        </div>
      </div>

      {/* Time-of-Day Slider */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Spatiotemporal Time-Window Slider ({String(hourMin).padStart(2, '0')}:00 - {String(hourMax).padStart(2, '0')}:00)</span>
          </div>
          <span className="text-xs text-slate-400">
            DBSCAN clusters auto-recalculated per temporal window
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div>
            <label className="text-[11px] text-slate-400 mb-1 block">Start Hour: {hourMin}:00</label>
            <input
              type="range"
              min="0"
              max={hourMax}
              value={hourMin}
              onChange={(e) => handleTimeChange(parseInt(e.target.value), hourMax)}
              className="w-full accent-sky-400 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 mb-1 block">End Hour: {hourMax}:00</label>
            <input
              type="range"
              min={hourMin}
              max="23"
              value={hourMax}
              onChange={(e) => handleTimeChange(hourMin, parseInt(e.target.value))}
              className="w-full accent-rose-400 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Map & Red-Zones Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Leaflet Map Column */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold text-slate-300 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>KSP Command Center GIS Map • {selectedDistrict}</span>
            </span>
            <span className="text-[11px] text-slate-400">
              Showing {hotspotsData?.total_incidents || 0} Incidents & {hotspotsData?.clusters.length || 0} Hotspot Densities
            </span>
          </div>

          <div className="flex-1 rounded-xl overflow-hidden border border-slate-800 relative z-0">
            <MapContainer
              key={`${selectedDistrict}-${hourMin}-${hourMax}-${selectedCrime}`}
              center={centerCoords}
              zoom={zoomLevel}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Render Hotspot Clusters */}
              {hotspotsData?.clusters.map((c) => (
                <React.Fragment key={c.cluster_id}>
                  <Circle
                    center={[c.center_lat, c.center_lng]}
                    radius={c.radius_meters}
                    pathOptions={{
                      color: '#f43f5e',
                      fillColor: '#f43f5e',
                      fillOpacity: 0.35,
                      weight: 2
                    }}
                  />
                  <CircleMarker
                    center={[c.center_lat, c.center_lng]}
                    radius={Math.min(22, Math.max(8, c.count * 1.5))}
                    pathOptions={{
                      color: '#ffffff',
                      fillColor: '#e11d48',
                      fillOpacity: 0.9,
                      weight: 2
                    }}
                  >
                    <Popup>
                      <div className="text-slate-900 p-1">
                        <div className="font-extrabold text-sm text-rose-700">{c.station} Cluster #{c.cluster_id}</div>
                        <div className="text-xs font-semibold text-slate-700">{c.district} District</div>
                        <div className="text-xs text-slate-600 mt-1">Total Incidents: <strong>{c.count}</strong></div>
                        <div className="text-xs text-slate-600">Dominant Crime: <strong>{c.primary_crime}</strong></div>
                      </div>
                    </Popup>
                  </CircleMarker>
                </React.Fragment>
              ))}

              {/* Render Red Zone Pulsing Alerts */}
              {hotspotsData?.red_zones.map((rz, idx) => (
                <CircleMarker
                  key={`rz-${idx}`}
                  center={[rz.lat, rz.lng]}
                  radius={16}
                  pathOptions={{
                    color: '#fb923c',
                    fillColor: '#ea580c',
                    fillOpacity: 0.85,
                    weight: 3
                  }}
                >
                  <Popup>
                    <div className="text-slate-900 p-1">
                      <div className="font-extrabold text-sm text-amber-700">🚨 RED-ZONE ALERT</div>
                      <div className="text-xs font-bold text-slate-800">{rz.station}</div>
                      <div className="text-xs text-slate-600">Z-Score: <strong>+{rz.z_score}</strong> (Anomaly)</div>
                      <div className="text-xs text-slate-600">Dominant Crime: <strong>{rz.dominant_crime}</strong></div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}

            </MapContainer>
          </div>
        </div>

        {/* Red-Zones Emerging Alerts Column */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col h-[520px]">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-extrabold text-white tracking-wide">
              Emerging Red-Zone Anomaly Alerts
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {(!hotspotsData?.red_zones || hotspotsData.red_zones.length === 0) ? (
              <div className="text-xs text-slate-500 text-center py-12">
                No red-zone z-score alerts detected for selected filter.
              </div>
            ) : (
              hotspotsData.red_zones.map((rz, idx) => (
                <div
                  key={idx}
                  className="bg-[#131c31] border border-rose-500/30 rounded-xl p-3.5 hover:border-rose-500 transition relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-rose-400 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                      <span>{rz.station}</span>
                    </span>
                    <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full">
                      z = +{rz.z_score}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-200 mt-1">
                    {rz.district} District • {rz.dominant_crime}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>Incidents in window: <strong>{rz.incident_count}</strong></span>
                    <span className="text-rose-400 font-semibold">{rz.alert_level} THREAT</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
