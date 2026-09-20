import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileCode, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  CheckCircle2, 
  ShieldCheck, 
  Building2 
} from 'lucide-react';
import { Invoice, JewelerStoreProfile } from '../types';
import { downloadTaxCSV, downloadTaxJson, generateCATaxReportJSON } from '../utils/taxExport';
import { formatGrams, formatINR } from '../utils/calculator';

interface CATaxExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  profile: JewelerStoreProfile;
}

export const CATaxExportModal: React.FC<CATaxExportModalProps> = ({
  isOpen,
  onClose,
  invoices,
  profile,
}) => {
  const [period, setPeriod] = useState<string>('Q2 FY 2026-27 (Jul - Sep 2026)');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'json'>('summary');

  if (!isOpen) return null;

  const report = generateCATaxReportJSON(invoices, profile, period);

  const handleDownloadJSON = () => {
    downloadTaxJson(report);
  };

  const handleDownloadCSV = () => {
    downloadTaxCSV(invoices, profile);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-2xl w-full my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-cinzel">
                CA & Accountant Tax Report Generator
              </h2>
              <p className="text-xs text-stone-400">
                GST GSTR-1, HSN 7113/7114 & Books of Accounts JSON Export
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Period selector & action tabs */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
            <div>
              <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                Tax Filing Period:
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-stone-300 rounded-lg text-stone-800"
              >
                <option value="Q2 FY 2026-27 (Jul - Sep 2026)">Q2 FY 2026-27 (Jul - Sep 2026)</option>
                <option value="September 2026 (Monthly Return)">September 2026 (Monthly Return)</option>
                <option value="Q1 FY 2026-27 (Apr - Jun 2026)">Q1 FY 2026-27 (Apr - Jun 2026)</option>
                <option value="Full FY 2026-27 (Annual Return)">Full FY 2026-27 (Annual Return)</option>
              </select>
            </div>

            <div className="flex items-center bg-white p-1 rounded-lg border border-stone-200">
              <button
                type="button"
                onClick={() => setActiveTab('summary')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeTab === 'summary' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                GST Summary
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('json')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeTab === 'json' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Raw JSON Schema
              </button>
            </div>
          </div>

          {activeTab === 'summary' ? (
            <div className="space-y-4">
              {/* GST Totals Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Invoices Billed</span>
                  <span className="text-base font-bold font-mono-num text-stone-900">{report.totalInvoicesCount}</span>
                </div>
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Taxable Turnover</span>
                  <span className="text-base font-bold font-mono-num text-stone-900">{formatINR(report.totalTaxableValue)}</span>
                </div>
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">CGST (1.5%)</span>
                  <span className="text-base font-bold font-mono-num text-emerald-800">{formatINR(report.totalCGST)}</span>
                </div>
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">SGST (1.5%)</span>
                  <span className="text-base font-bold font-mono-num text-emerald-800">{formatINR(report.totalSGST)}</span>
                </div>
              </div>

              {/* HSN Summary Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  HSN-Wise Outward Supplies Summary (GSTR-1 Table 12)
                </span>
                <div className="overflow-x-auto border border-stone-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-200">
                        <th className="p-2.5">HSN Code</th>
                        <th className="p-2.5">Description</th>
                        <th className="p-2.5 text-right">Quantity</th>
                        <th className="p-2.5 text-right">Taxable Val</th>
                        <th className="p-2.5 text-right">Central Tax</th>
                        <th className="p-2.5 text-right">State Tax</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 font-mono-num">
                      {report.hsnSummary.map((hsn) => (
                        <tr key={hsn.hsnCode}>
                          <td className="p-2.5 font-bold text-amber-900">{hsn.hsnCode}</td>
                          <td className="p-2.5 font-sans truncate max-w-[150px]">{hsn.description}</td>
                          <td className="p-2.5 text-right font-bold">{hsn.totalQuantityGrams} g</td>
                          <td className="p-2.5 text-right font-semibold">{formatINR(hsn.totalTaxableValue)}</td>
                          <td className="p-2.5 text-right text-emerald-800">{formatINR(hsn.centralTaxAmount)}</td>
                          <td className="p-2.5 text-right text-emerald-800">{formatINR(hsn.stateTaxAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  The generated export complies with India GST portal JSON schema and can be directly shared with your Chartered Accountant (CA).
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-stone-600">Standard Accountant JSON Schema:</span>
                <button
                  type="button"
                  onClick={handleCopyJSON}
                  className="flex items-center gap-1 text-amber-700 hover:text-amber-900 font-semibold cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="bg-stone-900 text-stone-100 p-3 rounded-xl text-[11px] font-mono-num max-h-64 overflow-y-auto border border-stone-800">
                {JSON.stringify(report, null, 2)}
              </pre>
            </div>
          )}

          {/* Download Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Download Excel (CSV)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download CA JSON Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
