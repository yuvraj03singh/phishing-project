import React, { useState } from 'react';
import { FileSpreadsheet, Upload, Download, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import api from '../services/api';
import { BatchScanResult } from '../types';

export const BatchScannerPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchResult, setBatchResult] = useState<BatchScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PHISHING' | 'LEGITIMATE'>('ALL');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        // Parse CSV or newline-separated lines
        const lines = content
          .split(/\r?\n/)
          .map((l) => l.trim().replace(/^["']|["']$/g, ''))
          .filter((l) => l.length > 3 && !l.toLowerCase().startsWith('url'));
        setInputText(lines.join('\n'));
      }
    };
    reader.readAsText(file);
  };

  const handleBatchScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const urls = inputText
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 3);

    if (urls.length === 0) {
      setErrorMsg('Please enter or upload at least one valid URL.');
      return;
    }

    if (urls.length > 500) {
      setErrorMsg('Maximum batch limit is 500 URLs.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');
    setBatchResult(null);

    try {
      const res = await api.post('/predictions/batch', { urls });
      setBatchResult(res.data.data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Batch scan failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCsv = () => {
    if (!batchResult) return;
    const headers = ['URL', 'Verdict', 'Risk Score (%)', 'Risk Level', 'Is Phishing'];
    const rows = batchResult.results.map((r) => [
      `"${r.url.replace(/"/g, '""')}"`,
      r.prediction,
      r.risk_score,
      r.risk_level,
      r.is_phishing ? 'TRUE' : 'FALSE'
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `phishguard_batch_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredResults = batchResult?.results.filter((r) => {
    if (filter === 'PHISHING') return r.is_phishing;
    if (filter === 'LEGITIMATE') return !r.is_phishing;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-8 px-4 sm:px-6 lg:px-8 font-mono">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs">
          <FileSpreadsheet size={13} /> Bulk Threat Triage
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Batch CSV URL Scanner
        </h1>
        <p className="text-sm text-slate-400">
          Upload or paste feeds of URLs to evaluate phishing risks in bulk.
        </p>
      </div>

      {/* Input / Upload Panel */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <form onSubmit={handleBatchScan} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <span className="text-xs text-slate-300 font-semibold uppercase">
              Enter URLs (One per line)
            </span>
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs cursor-pointer border border-slate-700 transition">
              <Upload size={14} className="text-blue-400" />
              <span>Upload CSV / TXT</span>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            rows={6}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="https://example.com/login&#10;http://192.168.1.1:8080/auth&#10;https://legitimate-service.org"
            className="w-full p-4 bg-slate-950 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-slate-100 text-xs font-mono placeholder:text-slate-500 resize-y"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {inputText.split('\n').filter((l) => l.trim().length > 3).length} URLs queued (Max: 500)
            </span>
            <button
              type="submit"
              disabled={isProcessing || !inputText.trim()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing Batch...</span>
                </>
              ) : (
                <>
                  <Zap size={14} />
                  <span>Execute Batch Scan</span>
                </>
              )}
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Batch Results Output */}
      {batchResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Total URLs Evaluated</span>
              <p className="text-2xl font-black text-white">{batchResult.total_scanned}</p>
            </div>

            <div className="glass-panel p-4 rounded-xl space-y-1 border-rose-500/30">
              <span className="text-[10px] text-rose-400 uppercase flex items-center gap-1">
                <AlertTriangle size={12} /> Phishing Flagged
              </span>
              <p className="text-2xl font-black text-rose-400">{batchResult.phishing_count}</p>
            </div>

            <div className="glass-panel p-4 rounded-xl space-y-1 border-emerald-500/30">
              <span className="text-[10px] text-emerald-400 uppercase flex items-center gap-1">
                <CheckCircle size={12} /> Legitimate Cleared
              </span>
              <p className="text-2xl font-black text-emerald-400">{batchResult.legitimate_count}</p>
            </div>

            <div className="glass-panel p-4 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Total Runtime</span>
              <p className="text-2xl font-black text-blue-400">{batchResult.total_time_ms.toFixed(1)} ms</p>
            </div>
          </div>

          {/* Results Table */}
          <div className="glass-panel rounded-2xl overflow-hidden space-y-4 p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilter('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    filter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  All ({batchResult.results.length})
                </button>
                <button
                  onClick={() => setFilter('PHISHING')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    filter === 'PHISHING' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Phishing ({batchResult.phishing_count})
                </button>
                <button
                  onClick={() => setFilter('LEGITIMATE')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    filter === 'LEGITIMATE' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Legitimate ({batchResult.legitimate_count})
                </button>
              </div>

              <button
                onClick={downloadCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition"
              >
                <Download size={14} className="text-emerald-400" />
                <span>Export CSV Report</span>
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 sticky top-0 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Target URL</th>
                    <th className="py-2.5 px-3">Verdict</th>
                    <th className="py-2.5 px-3">Risk Level</th>
                    <th className="py-2.5 px-3">Probability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                  {filteredResults?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition">
                      <td className="py-2 px-3 text-slate-300 break-all max-w-md font-mono">
                        {item.url}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`font-semibold ${
                            item.is_phishing ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {item.prediction.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <RiskBadge level={item.risk_level} size="sm" />
                      </td>
                      <td className="py-2 px-3 text-slate-300">
                        {item.risk_score}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
