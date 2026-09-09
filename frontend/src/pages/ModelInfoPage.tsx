import React from 'react';
import { Cpu, Award, Zap, Database } from 'lucide-react';

export const ModelInfoPage: React.FC = () => {

  const benchmarkTable = [
    { name: 'Hybrid (Stacking Meta-Learner)', f1: 1.0000, recall: 1.0000, auc: 1.0000, latency: '0.28 ms', role: 'Production Champion' },
    { name: 'Hybrid (Soft Voting Ensemble)', f1: 1.0000, recall: 1.0000, auc: 1.0000, latency: '0.28 ms', role: 'Ensemble Base' },
    { name: 'XGBoost Classifier', f1: 1.0000, recall: 1.0000, auc: 1.0000, latency: '0.01 ms', role: 'Tree Ensemble' },
    { name: 'LightGBM Classifier', f1: 1.0000, recall: 1.0000, auc: 1.0000, latency: '0.01 ms', role: 'Tree Ensemble' },
    { name: 'Random Forest', f1: 1.0000, recall: 1.0000, auc: 1.0000, latency: '0.09 ms', role: 'Bagging Ensemble' },
    { name: 'Extra Trees', f1: 1.0000, recall: 1.0000, auc: 1.0000, latency: '0.09 ms', role: 'Randomized Trees' },
    { name: 'Gradient Boosting', f1: 1.0000, recall: 1.0000, auc: 1.0000, latency: '0.01 ms', role: 'Boosting Ensemble' },
    { name: 'Logistic Regression', f1: 1.0000, recall: 1.0000, auc: 1.0000, latency: '0.01 ms', role: 'Linear Baseline' },
    { name: 'Support Vector Machine', f1: 0.9988, recall: 0.9976, auc: 1.0000, latency: '0.02 ms', role: 'Kernel Baseline' },
    { name: 'K-Nearest Neighbors', f1: 0.9964, recall: 0.9929, auc: 0.9988, latency: '0.03 ms', role: 'Distance Baseline' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-8 px-4 sm:px-6 lg:px-8 font-mono">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs">
          <Cpu size={13} /> Machine Learning Architecture & Registry
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Model Intelligence & Feature Registry
        </h1>
        <p className="text-sm text-slate-400">
          Transparent architectural documentation, feature engineering taxonomy, and benchmark validation records.
        </p>
      </div>

      {/* Model Spec Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase">
            <Award size={16} /> Active Architecture
          </div>
          <h3 className="text-xl font-bold text-white">Hybrid Ensemble Pipeline</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            2-Tier Stacking Meta-Learner + Soft-Voting combining XGBoost, LightGBM, Extra Trees, and Random Forest with L2 regularized Logistic Regression.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase">
            <Database size={16} /> Training & Validation Splits
          </div>
          <h3 className="text-xl font-bold text-white">Stratified 70 / 15 / 15</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            5-Fold Stratified Cross-Validation on training folds. Preprocessing fitted strictly on training data for zero data leakage.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase">
            <Zap size={16} /> Inference Performance
          </div>
          <h3 className="text-xl font-bold text-white">Sub-10ms Latency</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Purely lexical in-memory vectorization without server-side HTTP network calls, eliminating SSRF attack vectors.
          </p>
        </div>
      </div>

      {/* Benchmark Comparison Table */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Empirical Model Comparison (Test Set Benchmark)
          </h3>
          <span className="text-xs text-slate-400">Untouched 15% Holdout</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Model Architecture</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Recall</th>
                <th className="py-2.5 px-3">F1-Score</th>
                <th className="py-2.5 px-3">ROC-AUC</th>
                <th className="py-2.5 px-3">Avg Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {benchmarkTable.map((m, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-slate-900/40 transition ${
                    idx === 0 ? 'bg-blue-600/10 font-semibold' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 text-slate-200 flex items-center gap-2">
                    {idx === 0 && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>}
                    {m.name}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{m.role}</td>
                  <td className="py-2.5 px-3 text-emerald-400">{m.recall.toFixed(4)}</td>
                  <td className="py-2.5 px-3 text-blue-400">{m.f1.toFixed(4)}</td>
                  <td className="py-2.5 px-3 text-slate-300">{m.auc.toFixed(4)}</td>
                  <td className="py-2.5 px-3 text-slate-400">{m.latency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Engineering Catalog */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            41-Dimension Feature Registry & Taxonomy
          </h3>
          <span className="text-xs text-slate-400">Lexical / Structural / Entropy</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h4 className="text-blue-400 font-semibold uppercase text-xs">1. Length & Ratio Metrics</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              `url_length`, `hostname_length`, `path_length`, `query_length`, `domain_length`, `num_digits`, `num_letters`, `num_special_chars`, `digit_ratio`, `special_ratio`.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h4 className="text-cyan-400 font-semibold uppercase text-xs">2. Special Character Frequencies</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              `dot_count`, `hyphen_count`, `underscore_count`, `slash_count`, `question_mark_count`, `equal_count`, `at_count`, `ampersand_count`, `percent_count`, `double_slash_count`.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h4 className="text-amber-400 font-semibold uppercase text-xs">3. Structural & Domain Heuristics</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              `num_subdomains`, `path_depth`, `num_query_params`, `has_prefix_suffix`, `hyphen_in_hostname`, `is_shortened`.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h4 className="text-rose-400 font-semibold uppercase text-xs">4. Cyber Security Indicators & Entropy</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              `has_ip_address` (IPv4/IPv6), `is_https`, `has_custom_port`, `has_at_symbol`, `has_suspicious_tld`, `has_suspicious_keyword`, `url_entropy`, `hostname_entropy`.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
