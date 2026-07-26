import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ExecutiveOverview } from './components/ExecutiveOverview';
import { GeospatialModule } from './components/GeospatialModule';
import { NetworkModule } from './components/NetworkModule';
import { PredictiveModule } from './components/PredictiveModule';
import { TrendsModule } from './components/TrendsModule';
import { FirMiningModule } from './components/FirMiningModule';
import { FairnessAuditModule } from './components/FairnessAuditModule';
import { PatrolOptimizerModule } from './components/PatrolOptimizerModule';
import { CitizenTipModule } from './components/CitizenTipModule';
import { ReportExportModal } from './components/ReportExportModal';

import { api } from './services/api';
import { OverviewStats, HotspotsResponse, NetworkGraphResponse, PredictiveRiskResponse, TrendsResponse, UserRole } from './types';
import { LayoutDashboard, MapPin, Network, Brain, TrendingUp, Sparkles, Cpu, Scale, Navigation, EyeOff } from 'lucide-react';

const ROLES_MAP: Record<string, UserRole> = {
  admin: { name: 'SCRB Director General', role: 'Admin', badge: 'KSP-001', district: 'Statewide SCRB' },
  analyst: { name: 'Inspector Vijay Kumar', role: 'SCRB Analyst', badge: 'KSP-084', district: 'Bengaluru Urban' },
  sp: { name: 'Superintendent Ramesh IPS', role: 'District SP', badge: 'KSP-112', district: 'Mysuru' },
  sho: { name: 'Station House Officer Patil', role: 'SHO', badge: 'KSP-340', district: 'Mangaluru' },
  constable: { name: 'Constable Basavaraj', role: 'Constable', badge: 'KSP-991', district: 'Hubballi-Dharwad' },
};

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>(ROLES_MAP['admin']);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [subTab, setSubTab] = useState<string>('nlp');

  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [hotspotsData, setHotspotsData] = useState<HotspotsResponse | null>(null);
  const [networkData, setNetworkData] = useState<NetworkGraphResponse | null>(null);
  const [riskData, setRiskData] = useState<PredictiveRiskResponse | null>(null);
  const [trendsData, setTrendsData] = useState<TrendsResponse | null>(null);

  const [isReportOpen, setIsReportOpen] = useState(false);

  // Fetch initial state
  useEffect(() => {
    loadAllData(selectedDistrict);
  }, [selectedDistrict]);

  const loadAllData = async (district: string) => {
    try {
      const [ov, hs, net, risk, tr] = await Promise.all([
        api.getOverview(district),
        api.getHotspots(district),
        api.getNetworkGraph(district),
        api.getPredictiveRisk(district),
        api.getTrends(district)
      ]);
      setOverviewStats(ov);
      setHotspotsData(hs);
      setNetworkData(net);
      setRiskData(risk);
      setTrendsData(tr);
    } catch (err) {
      console.error('API Error:', err);
    }
  };

  const handleHotspotRefresh = async (hourMin: number, hourMax: number, crimeType: string) => {
    try {
      const hs = await api.getHotspots(selectedDistrict, hourMin, hourMax, crimeType);
      setHotspotsData(hs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNlQuery = async (query: string) => {
    try {
      const parsed = await api.nlQuery(query);
      if (parsed.parsed_district !== 'All') {
        setSelectedDistrict(parsed.parsed_district);
      }
      setActiveTab('geospatial');
      handleHotspotRefresh(0, 23, parsed.parsed_crime_type);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col font-sans">
      
      {/* Navigation Header */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={(key) => setCurrentRole(ROLES_MAP[key])}
        selectedDistrict={selectedDistrict}
        onDistrictChange={(d) => setSelectedDistrict(d)}
        onNlQuery={handleNlQuery}
        onOpenReport={() => setIsReportOpen(true)}
      />

      {/* Primary Module Navigation Tabs */}
      <div className="bg-[#0f172a] border-b border-slate-800 px-4 py-2 sticky top-[65px] z-40">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 overflow-x-auto no-scrollbar">
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Executive Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('geospatial')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'geospatial'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Geospatial Intelligence</span>
          </button>

          <button
            onClick={() => setActiveTab('network')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'network'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Network & Link Analysis</span>
          </button>

          <button
            onClick={() => setActiveTab('predictive')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'predictive'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>AI Risk & SHAP Explainability</span>
          </button>

          <button
            onClick={() => setActiveTab('trends')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'trends'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Pattern & Trend Discovery</span>
          </button>

          <button
            onClick={() => setActiveTab('differentiators')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'differentiators'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                : 'text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/30'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>SCRB Innovation Suite</span>
          </button>

        </div>
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {activeTab === 'overview' && (
          <>
            <ExecutiveOverview
              stats={overviewStats}
              selectedDistrict={selectedDistrict}
              onSelectTab={(tab) => setActiveTab(tab)}
            />
            <GeospatialModule
              hotspotsData={hotspotsData}
              selectedDistrict={selectedDistrict}
              onDistrictChange={(d) => setSelectedDistrict(d)}
              onRefresh={handleHotspotRefresh}
              onOpenReport={() => setIsReportOpen(true)}
            />
          </>
        )}

        {activeTab === 'geospatial' && (
          <GeospatialModule
            hotspotsData={hotspotsData}
            selectedDistrict={selectedDistrict}
            onDistrictChange={(d) => setSelectedDistrict(d)}
            onRefresh={handleHotspotRefresh}
            onOpenReport={() => setIsReportOpen(true)}
          />
        )}

        {activeTab === 'network' && (
          <NetworkModule
            networkData={networkData}
            selectedDistrict={selectedDistrict}
          />
        )}

        {activeTab === 'predictive' && (
          <PredictiveModule
            riskData={riskData}
            selectedDistrict={selectedDistrict}
          />
        )}

        {activeTab === 'trends' && (
          <TrendsModule
            trendsData={trendsData}
            selectedDistrict={selectedDistrict}
          />
        )}

        {activeTab === 'differentiators' && (
          <div className="space-y-6">
            
            {/* Sub-tab Navigation */}
            <div className="flex items-center space-x-2 bg-[#131c31] border border-slate-800 p-1.5 rounded-2xl w-fit">
              <button
                onClick={() => setSubTab('nlp')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  subTab === 'nlp' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Bilingual FIR NLP Mining</span>
              </button>

              <button
                onClick={() => setSubTab('fairness')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  subTab === 'fairness' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Bias & Fairness Audit</span>
              </button>

              <button
                onClick={() => setSubTab('patrol')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  subTab === 'patrol' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Patrol Route Optimizer</span>
              </button>

              <button
                onClick={() => setSubTab('tips')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  subTab === 'tips' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Anonymized Citizen Tips</span>
              </button>
            </div>

            {subTab === 'nlp' && <FirMiningModule />}
            {subTab === 'fairness' && <FairnessAuditModule />}
            {subTab === 'patrol' && <PatrolOptimizerModule />}
            {subTab === 'tips' && <CitizenTipModule selectedDistrict={selectedDistrict} />}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-[#0f172a] border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-500">
        Kavach (ಕವಚ) • State Crime Records Bureau (SCRB) • Karnataka State Police Hackathon Edition
      </footer>

      {/* Report Modal */}
      {isReportOpen && (
        <ReportExportModal
          district={selectedDistrict === 'All' ? 'Bengaluru Urban' : selectedDistrict}
          onClose={() => setIsReportOpen(false)}
        />
      )}

    </div>
  );
};
