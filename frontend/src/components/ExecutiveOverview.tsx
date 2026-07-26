import React from 'react';
import { OverviewStats } from '../types';
import { ShieldAlert, AlertTriangle, Users, MapPin, Activity, FileCheck, ArrowUpRight, Zap } from 'lucide-react';

interface ExecutiveOverviewProps {
  stats: OverviewStats | null;
  selectedDistrict: string;
  onSelectTab: (tab: string) => void;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  stats,
  selectedDistrict,
  onSelectTab
}) => {
  if (!stats) {
    return (
      <div className="animate-pulse grid grid-cols-1 md:grid-cols-5 gap-4 my-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-28 bg-slate-800/50 rounded-2xl border border-slate-700/50"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Live Alert Banner */}
      {stats.red_zones_count > 0 && (
        <div className="glass-panel border-l-4 border-l-rose-500 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-rose-950/20">
          <div className="flex items-center space-x-3">
            <div className="bg-rose-500/20 text-rose-400 p-2.5 rounded-xl animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                  CRITICAL ALERT
                </span>
                <span className="text-sm font-semibold text-slate-200">
                  {stats.red_zones_count} Police Stations exhibiting statistical crime spikes (z-score &gt; 1.2)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated spatiotemporal anomaly detection flagged elevated chain snatching & burglary activity in {selectedDistrict === 'All' ? 'Karnataka' : selectedDistrict}.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('geospatial')}
            className="flex items-center space-x-1.5 bg-rose-500 hover:bg-rose-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition shadow-md"
          >
            <span>View Hotspots</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total FIRs */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 hover:border-sky-500/40 transition group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Analyzed FIRs</span>
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl group-hover:bg-sky-500/20 transition">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">{stats.total_firs.toLocaleString()}</div>
          <div className="text-[11px] text-sky-400 font-medium mt-1">Unified State Crime Registry</div>
        </div>

        {/* Emerging Red-Zones */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 hover:border-rose-500/40 transition group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Red-Zone Alerts</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl group-hover:bg-rose-500/20 transition">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-400 tracking-tight">{stats.red_zones_count}</div>
          <div className="text-[11px] text-rose-300/80 font-medium mt-1">High Anomaly Threshold</div>
        </div>

        {/* High Risk Stations */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 hover:border-amber-500/40 transition group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Critical Stations</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl group-hover:bg-amber-500/20 transition">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 tracking-tight">{stats.high_risk_stations}</div>
          <div className="text-[11px] text-amber-300/80 font-medium mt-1">7-Day Risk &gt; 75/100</div>
        </div>

        {/* Active Gang Networks */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 hover:border-purple-500/40 transition group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Criminal Rings</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl group-hover:bg-purple-500/20 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-purple-300 tracking-tight">{stats.active_gangs}</div>
          <div className="text-[11px] text-purple-300/80 font-medium mt-1">Louvain Graph Clusters</div>
        </div>

        {/* Repeat Victims */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 hover:border-emerald-500/40 transition group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Repeat Victims</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:bg-emerald-500/20 transition">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">{stats.repeat_victims_count}</div>
          <div className="text-[11px] text-emerald-300/80 font-medium mt-1">Flagged for Intervention</div>
        </div>

      </div>

    </div>
  );
};
