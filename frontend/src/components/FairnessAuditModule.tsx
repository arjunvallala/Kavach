import React, { useEffect, useState } from 'react';
import { FairnessAuditResponse } from '../types';
import { api } from '../services/api';
import { ShieldCheck, Scale, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export const FairnessAuditModule: React.FC = () => {
  const [data, setData] = useState<FairnessAuditResponse | null>(null);

  useEffect(() => {
    api.getFairnessAudit().then(setData).catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="glass-panel rounded-2xl p-8 border border-slate-800 text-center text-slate-400 animate-pulse">
        Loading Responsible AI & Bias Fairness Metrics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Responsible AI & Algorithmic Bias Audit Dashboard
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Guards against feedback-loop over-policing by continuously monitoring Disparate Impact Ratios and Demographic Parity across socio-economic strata.
          </p>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2 text-right">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Ethical AI Score</div>
          <div className="text-sm font-extrabold text-emerald-400">{data.overall_fairness_score}</div>
        </div>
      </div>

      {/* Disparate Impact Grid Table */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold text-slate-300">
            District-wise Disparate Impact & Selection Rate Monitor (80% Rule Baseline)
          </span>
          <span className="text-[11px] text-slate-400">
            Target Ratio Range: <strong>0.80 - 1.25</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Total Cases</th>
                <th className="py-2.5 px-3">Unemployment Rate</th>
                <th className="py-2.5 px-3">Literacy Rate</th>
                <th className="py-2.5 px-3">Risk Selection Rate</th>
                <th className="py-2.5 px-3">Disparate Impact Ratio</th>
                <th className="py-2.5 px-3">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {data.district_breakdown.map((row) => (
                <tr key={row.district} className="hover:bg-slate-800/60 transition">
                  <td className="py-3 px-3 font-bold text-white">{row.district}</td>
                  <td className="py-3 px-3 text-slate-300">{row.total_cases}</td>
                  <td className="py-3 px-3 text-slate-300">{row.unemployment_rate}%</td>
                  <td className="py-3 px-3 text-slate-300">{row.literacy_rate}%</td>
                  <td className="py-3 px-3 font-semibold text-sky-400">{row.risk_selection_rate}</td>
                  <td className="py-3 px-3 font-extrabold text-white">{row.disparate_impact_ratio}</td>
                  <td className="py-3 px-3">
                    <span className="flex items-center space-x-1 text-emerald-400 font-bold text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{row.bias_status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
