import React, { useEffect, useState } from 'react';
import { CitizenTip } from '../types';
import { api } from '../services/api';
import { Shield, EyeOff, MapPin, CheckCircle2, MessageSquare } from 'lucide-react';

interface CitizenTipModuleProps {
  selectedDistrict: string;
}

export const CitizenTipModule: React.FC<CitizenTipModuleProps> = ({ selectedDistrict }) => {
  const [tips, setTips] = useState<CitizenTip[]>([]);

  useEffect(() => {
    api.getTips(selectedDistrict).then(res => setTips(res.tips)).catch(console.error);
  }, [selectedDistrict]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <EyeOff className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Anonymized & Geo-Fuzzed Citizen Tip Intelligence Layer
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Crowdsourced community policing layer compliant with DPDP Act 2023. Location coordinates are geo-blurred for privacy.
          </p>
        </div>

        <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-xl">
          {tips.length} Tips Received
        </span>
      </div>

      {/* Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tips.slice(0, 12).map((tip) => (
          <div key={tip.tip_id} className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-indigo-300">{tip.tip_id}</span>
              <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Score: {Math.round(tip.credibility_score * 100)}%
              </span>
            </div>

            <div className="text-xs font-bold text-white">{tip.category}</div>
            <p className="text-xs text-slate-300 leading-relaxed">{tip.description}</p>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-indigo-400" />
                <span>{tip.station} (Fuzzed: {tip.fuzzed_lat}, {tip.fuzzed_lng})</span>
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
