import React from "react";
import { Shield, Lock, Terminal } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white mt-20 text-slate-500 py-12 text-xs font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
              <Shield className="text-blue-500" size={18} />
              <span>Phishing Detection System</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              URL threat intelligence powered by hybrid soft-voting and stacking
              ML meta-learning architectures.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold uppercase text-xs tracking-wider">
              ML Architecture
            </h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li>XGBoost & LightGBM Ensembles</li>
              <li>Extra Trees & Random Forest</li>
              <li>Stacking Meta-Learner</li>
              <li>41 Lexical & Structural Features</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold uppercase text-xs tracking-wider">
              Defensive Principles
            </h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li>Zero External SSRF Fetching</li>
              <li>Passive Lexical Inspection</li>
              <li>No Credential Harvesting</li>
              <li>Explainable AI Indicator Attribution</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold uppercase text-xs tracking-wider">
              Model Status
            </h4>
            <div className="flex items-center gap-2 p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span>Engine v1.0.0 Online (Sub-10ms)</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
          <p>
            © 2026 Phishing Detection System Through Hybrid ML Based on URL.
            Hybrid ML detection system.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Lock size={12} className="text-emerald-400" /> End-to-End
              Encrypted
            </span>
            <span className="flex items-center gap-1">
              <Terminal size={12} className="text-blue-400" /> REST / OpenAPI
              Docs
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
