import React, { useEffect, useState } from 'react';
import { PatrolOptimizationResponse } from '../types';
import { api } from '../services/api';
import { Navigation, Compass, MapPin, Clock, Fuel, ShieldCheck } from 'lucide-react';

const STATIONS_LIST = [
  "Peenya PS", "Majestic PS", "Indiranagar PS", "Devaraja PS",
  "Pandeshwar PS", "Suburban PS", "Market PS", "Station Bazar PS"
];

export const PatrolOptimizerModule: React.FC = () => {
  const [selectedStation, setSelectedStation] = useState("Peenya PS");
  const [data, setData] = useState<PatrolOptimizationResponse | null>(null);

  useEffect(() => {
    api.optimizePatrol(selectedStation).then(setData).catch(console.error);
  }, [selectedStation]);

  return (
    <div className="space-y-6">
      
      {/* Header & Station Selector */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Operational Hoysala Patrol Route Optimizer
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Turns predictive crime intelligence into operational patrol waypoints & scheduling to maximize deterrence.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-[#131c31] border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs">
          <span className="text-slate-400 font-semibold">Station:</span>
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="bg-transparent text-sky-400 font-bold focus:outline-none cursor-pointer"
          >
            {STATIONS_LIST.map((st) => (
              <option key={st} value={st} className="bg-[#1e293b] text-slate-200">
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Waypoints Sequence List */}
          <div className="lg:col-span-2 glass-panel rounded-2xl p-4 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                Optimized Waypoint Sequence ({data.station})
              </span>
              <span className="text-xs text-sky-400 font-bold bg-sky-500/10 border border-sky-500/30 px-2.5 py-0.5 rounded-full">
                {data.recommended_vehicle}
              </span>
            </div>

            <div className="space-y-3">
              {data.waypoints.map((wp) => (
                <div key={wp.step} className="bg-[#131c31] border border-slate-700/80 rounded-xl p-4 flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 font-extrabold text-sm flex items-center justify-center shrink-0">
                      #{wp.step}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{wp.location}</div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-sky-400" />
                        <span>Scheduled Slot: <strong>{wp.time_slot}</strong></span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                    wp.priority.includes('CRITICAL') ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                    wp.priority.includes('HIGH') ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                    'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  }`}>
                    {wp.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Efficiency Stats */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-4">
            <span className="text-xs font-bold text-slate-300">Resource & Fuel Estimate</span>

            <div className="bg-[#131c31] border border-slate-700 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Total Route Distance</span>
                <span className="text-sm font-extrabold text-white">{data.estimated_distance_km} km</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Estimated Fuel Burn</span>
                <span className="text-sm font-extrabold text-amber-400">{data.estimated_fuel_liters} Liters</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Command Authorization</span>
                <span className="text-xs font-bold text-emerald-400">APPROVED BY KSP SCRB</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
