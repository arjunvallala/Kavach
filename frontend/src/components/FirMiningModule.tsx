import React, { useState } from 'react';
import { FirParseResponse } from '../types';
import { api } from '../services/api';
import { FileText, Cpu, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

const SAMPLE_FIRS = [
  {
    label: "Sample 1: Kannada/English Chain Snatching (Bengaluru)",
    text: "Complainant reported that on 2025-06-14 at 18:30 near Majestic Bus Stop, two miscreants on a Black Pulsar 220 bike arrived. Pillion rider extracted knife weapon and forcibly snatched 45 grams gold chain valued at Rs 180000. आरोपीಗಳ ವಿರುದ್ಧ KSP Section 392/397 record clear."
  },
  {
    label: "Sample 2: Kannada Digital Fraud & Cyber Crime (Mysuru)",
    text: "ಫಿರ್ಯಾದುದಾರರು Devaraja Market ಹತ್ತಿರ ಹೋಗುತ್ತಿದ್ದಾಗ Phone Call ಮಾಡಿ Bank Officer ಹೆಸರು ಹೇಳಿ APK Link ಕಳುಹಿಸಿದರು. Fradulent transfer of Rs 75000 executed to account belonging to Offender Don Raza. Case registered under IPC 420."
  },
  {
    label: "Sample 3: Night Commercial Burglary (Peenya)",
    text: "Night commercial burglary at shop near Industrial Gate 2. Shutter lock broken using Iron Rod. Cash of Rs 250000 stolen. CCTV footage shows suspects Ramesh @ Kali and Suresh @ Bullet. MO: Shutter lock cutter."
  }
];

export const FirMiningModule: React.FC = () => {
  const [narrative, setNarrative] = useState(SAMPLE_FIRS[0].text);
  const [result, setResult] = useState<FirParseResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleParse = async () => {
    if (!narrative.trim()) return;
    setLoading(true);
    try {
      const data = await api.parseFir(narrative);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Kannada & English Bilingual FIR Free-Text Mining Studio
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Solves unstructured KSP narrative silos. Automated NLP pipeline extracting weapons, vehicles, stolen values, and MO keywords.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Input Textarea & Samples */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">FIR Narrative Input (Bilingual)</span>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
              NLP Parser Ready
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400">Quick Test Samples:</span>
            <div className="flex flex-col space-y-1">
              {SAMPLE_FIRS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => setNarrative(sample.text)}
                  className="text-left text-[11px] text-sky-400 hover:text-sky-300 bg-[#131c31] hover:bg-slate-800 border border-slate-700/60 rounded-lg p-2 transition"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            rows={8}
            className="w-full bg-[#131c31] border border-slate-700 focus:border-emerald-500 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            placeholder="Paste raw Kannada or English FIR narrative text here..."
          />

          <button
            onClick={handleParse}
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-md flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? "Extracting Entities..." : "Extract Structured Entities"}</span>
          </button>
        </div>

        {/* Results Extraction Card */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-white flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Extracted Structured Entities</span>
              </span>
              {result && (
                <span className="text-[10px] text-slate-400">
                  Confidence: <strong className="text-emerald-400">{Math.round(result.confidence_score * 100)}%</strong>
                </span>
              )}
            </div>

            {result ? (
              <div className="space-y-3 bg-[#131c31] border border-emerald-500/30 rounded-xl p-4">
                
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Weapons Identified</span>
                  <div className="text-xs font-bold text-rose-400 mt-0.5">{result.weapons.join(', ')}</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Vehicle Extracted</span>
                  <div className="text-xs font-bold text-sky-400 mt-0.5">{result.vehicles.join(', ')}</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Stolen Amount / Value</span>
                  <div className="text-xs font-bold text-amber-400 mt-0.5">
                    {result.extracted_amounts.length > 0 ? `Rs ${result.extracted_amounts.join(', ')}` : "None"}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Extracted Modus Operandi (MO)</span>
                  <div className="text-xs font-bold text-purple-300 mt-0.5">{result.mo_category}</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Legal IPC / KSP Sections</span>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">{result.ksp_ipc_sections.join(', ')}</div>
                </div>

              </div>
            ) : (
              <div className="text-xs text-slate-500 text-center py-16">
                Click "Extract Structured Entities" to process bilingual narrative into KSP schema.
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 border-t border-slate-800 pt-3 mt-4">
            Language Pipeline: English + Kannada Transliteration SpaCy Entity Extractor
          </div>
        </div>

      </div>

    </div>
  );
};
