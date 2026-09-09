import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Zap, ShieldCheck, AlertOctagon, Clock, Cpu, Check, Copy, Layers } from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import { ScoreGauge } from '../components/ScoreGauge';
import { ExplanationsCard } from '../components/ExplanationsCard';
import { FeatureTable } from '../components/FeatureTable';
import api from '../services/api';
import { PredictionResult } from '../types';

export const ScannerPage: React.FC = () => {
  const location = useLocation();
  const initialResult = location.state?.result as PredictionResult | undefined;

  const [urlInput, setUrlInput] = useState(initialResult?.url || '');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(initialResult || null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsScanning(true);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await api.post('/predictions', { url: urlInput.trim() });
      setResult(res.data.data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Scanning failed.');
    } finally {
      setIsScanning(false);
    }
  };

  const copyResults = () => {
    if (!result) return;
    const summary = `PhishGuard AI Analysis Report
URL: ${result.url}
Verdict: ${result.prediction.toUpperCase()}
Risk Score: ${result.riskScore || result.risk_score}% (${result.riskLevel || result.risk_level})
Model: ${result.modelName || result.model_name} (v${result.modelVersion || result.model_version})
Latency: ${result.inferenceLatencyMs || result.inference_latency_ms}ms
Generated: ${new Date().toISOString()}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presets = [
    { label: 'Benign Wikipedia', url: 'https://en.wikipedia.org/wiki/Phishing' },
    { label: 'Suspicious IP Harvester', url: 'http://185.220.101.5/netflix-account-suspended/update-billing.php?id=8372' },
    { label: 'Obfuscated Bank Lure', url: 'http://wellsfargo.com-online-secure-auth.verify-account.tk/signon.do' },
    { label: 'Subdomain Camouflage', url: 'http://secure-login-appleid.apple.com.account-update.xyz/login.php?session=92847' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono">
          <Zap size={13} /> Deep URL Inspection Engine
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight font-mono">
          Real-Time URL Scanner
        </h1>
        <p className="text-sm text-slate-400 font-mono">
          Extract 41 lexical dimensions and compute multi-model risk scores in under 10ms.
        </p>
      </div>

      {/* Input Form */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter full URL (e.g. https://domain.com/path?param=1)..."
              className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-slate-100 text-sm font-mono placeholder:text-slate-500"
            />
          </div>
          <button
            type="submit"
            disabled={isScanning || !urlInput.trim()}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-mono font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 shrink-0"
          >
            {isScanning ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <Zap size={16} />
                <span>Analyze Risk</span>
              </>
            )}
          </button>
        </form>

        {/* Preset quick test buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-mono text-slate-400">
          <span className="text-slate-400">Quick Test:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setUrlInput(p.url);
              }}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            >
              {p.label}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Full Prediction Telemetry */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Main Verdict Card */}
          <div className="glass-panel-glow p-6 sm:p-8 rounded-2xl space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Detection Verdict
                  </span>
                  <RiskBadge level={result.riskLevel || result.risk_level || 'LOW'} size="md" />
                </div>
                <div className="flex items-center gap-3">
                  {result.isPhishing ? (
                    <AlertOctagon className="text-rose-500 shrink-0" size={36} />
                  ) : (
                    <ShieldCheck className="text-emerald-500 shrink-0" size={36} />
                  )}
                  <div>
                    <h2 className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                      result.isPhishing ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {result.isPhishing ? '⚠️ SUSPECTED PHISHING URL' : '🛡️ LEGITIMATE DESTINATION'}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {result.isPhishing
                        ? 'High probability of credential harvesting, spoofing, or fraudulent redirect.'
                        : 'No anomalous structural indicators detected in lexical evaluation.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="self-center md:self-auto shrink-0">
                <ScoreGauge score={result.riskScore || result.risk_score || 0} size={130} strokeWidth={10} />
              </div>
            </div>

            {/* Target URL Display */}
            <div className="space-y-1.5">
              <span className="text-xs font-mono uppercase text-slate-400">Inspected URL:</span>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 break-all select-all flex items-center justify-between gap-2">
                <span>{result.url}</span>
              </div>
            </div>

            {/* Microservice Performance & Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1 font-mono">
                <span className="text-[10px] uppercase text-slate-400 flex items-center gap-1">
                  <Clock size={11} className="text-blue-400" /> Inference Latency
                </span>
                <p className="text-sm font-bold text-slate-200">
                  {result.inferenceLatencyMs || result.inference_latency_ms || 1.2} ms
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1 font-mono">
                <span className="text-[10px] uppercase text-slate-400 flex items-center gap-1">
                  <Cpu size={11} className="text-cyan-400" /> Model Architecture
                </span>
                <p className="text-sm font-bold text-slate-200 truncate" title={result.modelName || result.model_name}>
                  {result.modelName || result.model_name || 'Hybrid Ensemble'}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1 font-mono">
                <span className="text-[10px] uppercase text-slate-400 flex items-center gap-1">
                  <Layers size={11} className="text-amber-400" /> Features Evaluated
                </span>
                <p className="text-sm font-bold text-slate-200">
                  {result.features ? Object.keys(result.features).length : 41} Dimensions
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1 font-mono">
                <span className="text-[10px] uppercase text-slate-400 flex items-center gap-1">
                  <Zap size={11} className="text-emerald-400" /> Version Tag
                </span>
                <p className="text-sm font-bold text-slate-200">
                  {result.modelVersion || result.model_version || 'v1.0.0'}
                </p>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400 italic">
                {result.disclaimer || 'Assessment based on statistical and lexical URL intelligence.'}
              </span>
              <button
                onClick={copyResults}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy Report'}</span>
              </button>
            </div>
          </div>

          {/* Explainability Breakdown */}
          <ExplanationsCard
            explanations={result.explanations || []}
            isPhishing={result.isPhishing || result.is_phishing || false}
          />

          {/* Raw Feature Matrix Table */}
          {result.features && <FeatureTable features={result.features} />}
        </div>
      )}
    </div>
  );
};
