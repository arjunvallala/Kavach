import React, { useState } from 'react';
import { Shield, Search, User, Bell, ChevronDown, Activity, FileText } from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (roleKey: string) => void;
  selectedDistrict: string;
  onDistrictChange: (district: string) => void;
  onNlQuery: (query: string) => void;
  onOpenReport: () => void;
}

const DISTRICTS_LIST = [
  "All", "Bengaluru Urban", "Mysuru", "Mangaluru", "Hubballi-Dharwad",
  "Belagavi", "Kalaburagi", "Shivamogga", "Tumakuru", "Ballari", "Udupi"
];

const MOCK_ROLES = [
  { key: 'admin', name: 'SCRB Director General', role: 'Admin', district: 'Statewide SCRB' },
  { key: 'analyst', name: 'Inspector Vijay Kumar', role: 'SCRB Analyst', district: 'Bengaluru Urban' },
  { key: 'sp', name: 'Superintendent Ramesh IPS', role: 'District SP', district: 'Mysuru' },
  { key: 'sho', name: 'Station House Officer Patil', role: 'SHO', district: 'Mangaluru' },
  { key: 'constable', name: 'Constable Basavaraj', role: 'Constable', district: 'Hubballi-Dharwad' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  selectedDistrict,
  onDistrictChange,
  onNlQuery,
  onOpenReport
}) => {
  const [query, setQuery] = useState('');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onNlQuery(query);
    }
  };

  return (
    <header className="bg-[#0f172a]/95 backdrop-blur border-b border-slate-800 sticky top-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Emblem */}
        <div className="flex items-center space-x-3 cursor-pointer">
          <div className="bg-gradient-to-tr from-sky-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-sky-500/20 border border-sky-400/30">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-sky-400 via-indigo-200 to-white bg-clip-text text-transparent">
                KAVACH <span className="font-semibold text-sky-400 text-lg">ಕವಚ</span>
              </h1>
              <span className="bg-sky-500/10 text-sky-400 border border-sky-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-widest uppercase">
                KSP SCRB v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Karnataka State Police • Crime Intelligence Platform</p>
          </div>
        </div>

        {/* Natural Language Query Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl w-full">
          <div className="relative">
            <Search className="w-4 h-4 text-sky-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="AI Natural Query: e.g. 'Show me chain snatching hotspots in Mysuru'..."
              className="w-full bg-[#131c31] border border-slate-700/80 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl pl-10 pr-24 py-2 text-sm text-slate-200 placeholder-slate-500 transition"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs px-3 py-1.5 rounded-lg transition"
            >
              Analyze
            </button>
          </div>
        </form>

        {/* District Selector & Role Dropdown */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          
          {/* District Dropdown */}
          <div className="flex items-center space-x-1.5 bg-[#131c31] border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <span className="text-slate-500 font-semibold">District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => onDistrictChange(e.target.value)}
              className="bg-transparent text-sky-400 font-semibold focus:outline-none cursor-pointer"
            >
              {DISTRICTS_LIST.map((d) => (
                <option key={d} value={d} className="bg-[#1e293b] text-slate-200">
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Export Intelligence Report */}
          <button
            onClick={onOpenReport}
            className="flex items-center space-x-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold px-3 py-2 rounded-xl transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Briefing</span>
          </button>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center space-x-2 bg-[#131c31] hover:bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 transition"
            >
              <div className="bg-sky-500/20 text-sky-400 p-1 rounded-md">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="text-left hidden lg:block">
                <div className="font-semibold text-slate-200">{currentRole.name}</div>
                <div className="text-[10px] text-sky-400 font-mono">{currentRole.role}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#1e293b] border border-slate-700 rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
                <div className="px-3 py-2 border-b border-slate-700/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch RBAC Role (KSP Demo)
                </div>
                {MOCK_ROLES.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => {
                      onRoleChange(r.key);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition ${
                      currentRole.role === r.role ? 'bg-sky-500/10 text-sky-400 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div>{r.name}</div>
                      <div className="text-[10px] text-slate-500">{r.role} • {r.district}</div>
                    </div>
                    {currentRole.role === r.role && <div className="w-2 h-2 bg-sky-400 rounded-full"></div>}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
