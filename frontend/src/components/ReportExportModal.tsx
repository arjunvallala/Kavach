import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { X, Printer, Download, Shield } from 'lucide-react';

interface ReportExportModalProps {
  district: string;
  onClose: () => void;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({ district, onClose }) => {
  const [htmlReport, setHtmlReport] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getReportHtml(district).then(res => {
      setHtmlReport(res.html_report);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [district]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlReport);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">
              SCRB Intelligence Briefing Report Generator ({district})
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={api.downloadReportUrl(district)}
              download
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </a>
            <button
              onClick={handlePrint}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Report Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-20 text-slate-400">Generating Intelligence Document...</div>
          ) : (
            <iframe
              title="KSP Report Preview"
              srcDoc={htmlReport}
              className="w-full h-[550px] rounded-xl border border-slate-700 bg-white"
            />
          )}
        </div>

      </div>
    </div>
  );
};
