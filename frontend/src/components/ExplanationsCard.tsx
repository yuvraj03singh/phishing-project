import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { ExplanationItem } from '../types';

interface ExplanationsCardProps {
  explanations: ExplanationItem[];
  isPhishing: boolean;
}

export const ExplanationsCard: React.FC<ExplanationsCardProps> = ({ explanations, isPhishing }) => {
  if (!explanations || explanations.length === 0) {
    return null;
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <AlertCircle size={12} /> CRITICAL FACTOR
          </span>
        );
      case 'HIGH':
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertTriangle size={12} /> SUSPICIOUS FACTOR
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Info size={12} /> OBSERVATION
          </span>
        );
    }
  };

  return (
    <div className="glass-panel rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {isPhishing ? (
            <AlertTriangle className="text-amber-400" size={20} />
          ) : (
            <CheckCircle2 className="text-emerald-400" size={20} />
          )}
          <h3 className="text-sm font-bold tracking-wide uppercase font-mono text-slate-200">
            Why was this URL {isPhishing ? 'Flagged' : 'Cleared'}?
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {explanations.length} Model Indicator{explanations.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {explanations.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                  {item.feature}
                </span>
                {item.value !== undefined && item.value !== '' && (
                  <span className="text-xs text-slate-400 font-mono">
                    = {String(item.value)}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {item.contribution}
              </p>
            </div>
            <div className="self-start sm:self-center shrink-0">
              {getSeverityBadge(item.severity)}
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800/60">
        Note: The indicators above represent mathematical and lexical feature contributions evaluated by the ensemble model and do not constitute absolute proof.
      </p>
    </div>
  );
};
