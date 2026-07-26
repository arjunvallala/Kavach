import React from 'react';
import { TrendsResponse } from '../types';
import { LineChart, BarChart3, Clock, Calendar, Sparkles } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart as ReLineChart, Line, AreaChart, Area } from 'recharts';

interface TrendsModuleProps {
  trendsData: TrendsResponse | null;
  selectedDistrict: string;
}

export const TrendsModule: React.FC<TrendsModuleProps> = ({
  trendsData,
  selectedDistrict
}) => {
  if (!trendsData) {
    return (
      <div className="glass-panel rounded-2xl p-8 border border-slate-800 text-center text-slate-400 animate-pulse">
        Compiling Statistical Crime Trends & Automated Insights...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Automated Plain Language Insight Summary Cards */}
      <div className="glass-panel rounded-2xl p-5 border border-sky-500/30 bg-gradient-to-r from-sky-950/30 via-[#131c31] to-[#131c31]">
        <div className="flex items-center space-x-2 text-sky-400 font-extrabold text-sm mb-3">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span>Automated AI Executive Insight Summaries</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {trendsData.automated_insights.map((insight, idx) => (
            <div key={idx} className="bg-[#131c31]/90 border border-slate-800 rounded-xl p-3.5 flex items-start space-x-3">
              <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                #{idx + 1}
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hourly & Category Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Hourly Distribution Chart */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col h-[380px]">
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Time-of-Day Hourly Crime Distribution (24-Hour Peak Matrix)
            </h3>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendsData.hourly_distribution}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ background: '#1e293b', borderColor: '#38bdf8', fontSize: '11px' }} />
                <Area type="monotone" dataKey="count" stroke="#38bdf8" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Crime Category Distribution */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col h-[380px]">
          <div className="flex items-center space-x-2 mb-3">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Crime Category Breakdown & Incidence Volume
            </h3>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendsData.crime_categories} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={9} width={130} />
                <Tooltip contentStyle={{ background: '#1e293b', borderColor: '#c084fc', fontSize: '11px' }} />
                <Bar dataKey="count" fill="#c084fc" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
