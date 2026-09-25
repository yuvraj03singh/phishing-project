import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Zap,
  Search,
  Layers,
  Cpu,
  ArrowRight,
  Activity,
  BarChart2,
} from "lucide-react";
import { RiskBadge } from "../components/RiskBadge";
import { ScoreGauge } from "../components/ScoreGauge";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { PredictionResult } from "../types";

export const LandingPage: React.FC = () => {
  const [urlInput, setUrlInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [quickResult, setQuickResult] = useState<PredictionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleQuickScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    if (!user) {
      navigate("/login");
      return;
    }

    setIsScanning(true);
    setErrorMsg("");
    setQuickResult(null);

    try {
      const res = await api.post("/predictions", { url: urlInput.trim() });
      setQuickResult(res.data.data);
    } catch (err: any) {
      setErrorMsg(err.message || "Scan failed.");
    } finally {
      setIsScanning(false);
    }
  };

  const sampleUrls = [
    {
      label: "Legitimate Portal",
      url: "https://developer.mozilla.org/en-US/docs/Web",
    },
    {
      label: "Suspicious IP Harvester",
      url: "http://192.168.1.105:8080/secure/banking/chase/login.htm",
    },
    {
      label: "Obfuscated TLD Lure",
      url: "http://paypal.com.account-update.verify-live.xyz/auth",
    },
  ];

  return (
    <div className="space-y-20 py-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            Phishing link checker
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            AI-Powered <span className="cyber-gradient-text">Phishing URL</span>{" "}
            Threat Detection
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Analyze suspicious links using multi-layer machine learning models,
            and real-time explainable risk attribution.
          </p>

          {/* Interactive URL Scanner Box */}
          <div className="pt-4 max-w-2xl mx-auto">
            <form
              onSubmit={handleQuickScan}
              className="relative flex flex-col sm:flex-row gap-2"
            >
              <div className="relative flex-1">
                <Search
                  className="absolute left-3.5 top-3.5 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Paste URL to inspect (e.g. https://example.com/login)..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-slate-800 text-sm font-mono placeholder:text-slate-400 shadow-sm"
                />
              </div>
              <button
                type="submit"
                disabled={isScanning || !urlInput.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:opacity-100 text-white font-semibold font-mono text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
              >
                {isScanning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    <span>Scan URL</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Sample URLs */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-xs font-mono text-slate-400">
              <span>Try sample:</span>
              {sampleUrls.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setUrlInput(s.url)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono text-left">
                {errorMsg}
              </div>
            )}

            {/* Quick Result Preview Card */}
            {quickResult && (
              <div className="mt-6 p-6 rounded-2xl glass-panel-glow text-left space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      Analysis Verdict
                    </span>
                    <div className="flex items-center gap-3">
                      <h3
                        className={`text-2xl font-black font-mono tracking-tight ${
                          quickResult.isPhishing
                            ? "text-rose-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {quickResult.isPhishing
                          ? "⚠️ SUSPECTED PHISHING"
                          : "🛡️ VERIFIED LEGITIMATE"}
                      </h3>
                      <RiskBadge
                        level={
                          quickResult.riskLevel ||
                          quickResult.risk_level ||
                          "LOW"
                        }
                      />
                    </div>
                  </div>
                  <ScoreGauge
                    score={quickResult.riskScore || quickResult.risk_score || 0}
                    size={100}
                    strokeWidth={8}
                  />
                </div>

                <div className="text-xs font-mono text-slate-300 break-all bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Target: </span>
                  {quickResult.url}
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono font-semibold text-slate-300 uppercase">
                    Key Indicators:
                  </span>
                  <div className="space-y-1.5">
                    {quickResult.explanations.slice(0, 3).map((exp, i) => (
                      <div
                        key={i}
                        className="text-xs text-slate-300 flex items-start gap-2 bg-slate-900/60 p-2 rounded border border-slate-800"
                      >
                        <span className="text-blue-400 font-mono font-bold">
                          •
                        </span>
                        <span>{exp.contribution}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() =>
                      navigate("/scanner", { state: { result: quickResult } })
                    }
                    className="flex items-center gap-1.5 text-xs font-mono font-semibold text-blue-400 hover:text-blue-300 transition"
                  >
                    View Full Telemetry & Feature Matrix{" "}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3-Tier Architecture Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-mono font-semibold text-blue-400 uppercase tracking-widest">
            Multi-Model Ensemble
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-900">
            How PhishGuard Detects Threats
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel feature-card-blue p-6 rounded-2xl space-y-4 hover:border-blue-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Layers size={24} />
            </div>
            <h3 className="text-base font-bold text-white font-mono">
              1. Lexical Feature Extraction
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              41 passive structural dimensions extracted safely in milliseconds
              — Shannon entropy, subdomain depths, IP-host regex, suspicious
              TLDs, and percent-encoding tokens.
            </p>
          </div>

          <div className="glass-panel feature-card-cyan p-6 rounded-2xl space-y-4 hover:border-blue-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cpu size={24} />
            </div>
            <h3 className="text-base font-bold text-white font-mono">
              2. Hybrid ML Classification
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Combines Soft-Voting Ensembles and 2-Tier Stacking Meta-Learners
              using Gradient Boosting, XGBoost, Random Forest, and LightGBM for
              minimal false-positives.
            </p>
          </div>

          <div className="glass-panel feature-card-green p-6 rounded-2xl space-y-4 hover:border-blue-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Activity size={24} />
            </div>
            <h3 className="text-base font-bold text-white font-mono">
              3. Explainable Risk Attribution
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transparent, non-dogmatic breakdown mapping feature weight
              contributions to explain why a URL triggered high risk scores
              without SSRF hazards.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl glass-panel-glow cta-panel text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Inspect Bulk Feeds or Integrate the REST API
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto font-mono">
            Process CSV lists with hundreds of suspicious links or access
            OpenAPI endpoints for real-time automated defense.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/batch"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-semibold text-xs transition flex items-center gap-2"
            >
              <Zap size={15} /> Batch CSV Scanner
            </Link>
            <Link
              to="/dashboard"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono font-semibold text-xs transition flex items-center gap-2"
            >
              <BarChart2 size={15} /> View Telemetry Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
