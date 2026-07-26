import React, { useState } from 'react';
import { PredictiveRiskResponse, StationRisk } from '../types';
import { Brain, ShieldAlert, BarChart3, HelpCircle, AlertOctagon, TrendingUp, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface PredictiveModuleProps {
  riskData: PredictiveRiskResponse | null;
  selectedDistrict: string;
}

export const PredictiveModule: React.FC<PredictiveModuleProps> = ({
  riskData,
  selectedDistrict
}) => {
  const [selectedStation, setSelectedStation] = useState<StationRisk | null>(null);

  if (!riskData) {
    return (
      <div className="glass-panel rounded-2xl p-8 border border-slate-800 text-center text-slate-400 animate-pulse">
        Calculating XGBoost Risk Scores & SHAP Feature Attributions...
      </div>
    );
  }

  const activeStation = selectedStation || riskData.watchlist[0];

  return (
    <div className="space-y-6">
      
      {/* Module Header */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              AI Risk Forecasting & SHAP Explainability Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Machine Learning risk scoring (7/30-day forward looking) with evidence-grade SHAP feature importance attributions.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-sky-500/10 border border-sky-500/30 rounded-xl px-4 py-2">
          <TrendingUp className="w-4 h-4 text-sky-400" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Statewide Mean Risk</div>
            <div className="text-sm font-extrabold text-sky-400">{riskData.overall_state_risk} / 100</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ranked Watchlist Table */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col h-[560px]">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold text-slate-300 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>Station Risk Watchlist ({riskData.watchlist.length} Stations)</span>
            </span>
            <span className="text-[11px] text-slate-400">Click station to view SHAP Explainability</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="py-2 px-3">Rank</th>
                  <th className="py-2 px-3">Police Station</th>
                  <th className="py-2 px-3">District</th>
                  <th className="py-2 px-3">7-Day Risk</th>
                  <th className="py-2 px-3">30-Day Risk</th>
                  <th className="py-2 px-3">Threat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {riskData.watchlist.map((st) => (
                  <tr
                    key={st.station}
                    onClick={() => setSelectedStation(st)}
                    className={`cursor-pointer transition hover:bg-slate-800/80 ${
                      activeStation?.station === st.station ? 'bg-sky-500/10 border-l-4 border-l-sky-400' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-slate-400">#{st.watchlist_rank}</td>
                    <td className="py-3 px-3 font-bold text-white">{st.station}</td>
                    <td className="py-3 px-3 text-slate-300">{st.district}</td>
                    <td className="py-3 px-3 font-extrabold text-rose-400">{st.risk_score_7d}/100</td>
                    <td className="py-3 px-3 font-semibold text-amber-400">{st.risk_score_30d}/100</td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        st.threat_level === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                        st.threat_level === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                        'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      }`}>
                        {st.threat_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SHAP Feature Explainability Panel */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col justify-between h-[560px]">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <HelpCircle className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                SHAP Evidence Explainability Panel
              </h3>
            </div>

            {activeStation ? (
              <div className="space-y-4">
                <div className="bg-[#131c31] border border-sky-500/30 rounded-xl p-3.5">
                  <div className="text-xs text-slate-400">Selected Jurisdiction:</div>
                  <div className="text-base font-extrabold text-white mt-0.5">{activeStation.station}</div>
                  <div className="text-xs text-sky-400">{activeStation.district} District</div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-700">
                    <div>
                      <div className="text-[10px] text-slate-400">7-Day Risk Score</div>
                      <div className="text-xl font-extrabold text-rose-400">{activeStation.risk_score_7d}/100</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Threat Assessment</div>
                      <div className="text-xs font-extrabold text-amber-400 mt-1">{activeStation.threat_level}</div>
                    </div>
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-300">
                  Top Contributing Risk Factors (SHAP Values):
                </div>

                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeStation.shap_factors} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <XAxis type="number" stroke="#64748b" fontSize={10} />
                      <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={9} width={110} />
                      <Tooltip contentStyle={{ background: '#1e293b', borderColor: '#38bdf8', fontSize: '11px' }} />
                      <Bar dataKey="contribution" fill="#38bdf8" radius={[0, 4, 4, 0]}>
                        {activeStation.shap_factors.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#f43f5e' : index === 1 ? '#fb923c' : '#38bdf8'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : null}
          </div>

          {/* Anomaly Detection Banner */}
          <div className="bg-[#131c31] border border-amber-500/30 rounded-xl p-3">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold mb-1">
              <AlertOctagon className="w-4 h-4" />
              <span>Investigator Anomaly Flag</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {riskData.anomalies.length} cases flagged for unusual time-location-MO combinations requiring review.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
