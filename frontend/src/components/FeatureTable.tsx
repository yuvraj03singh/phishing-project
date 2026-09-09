import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Layers } from 'lucide-react';

interface FeatureTableProps {
  features: Record<string, any>;
}

export const FeatureTable: React.FC<FeatureTableProps> = ({ features }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  if (!features || Object.keys(features).length === 0) {
    return null;
  }

  const entries = Object.entries(features);
  const filtered = entries.filter(([k]) =>
    k.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-900/80 hover:bg-slate-800/80 transition text-left"
      >
        <div className="flex items-center gap-2">
          <Layers className="text-blue-400" size={18} />
          <h3 className="text-sm font-bold tracking-wide uppercase font-mono text-slate-200">
            Raw Lexical Feature Matrix ({entries.length} Extracted Features)
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span>{isOpen ? 'Collapse' : 'Expand'}</span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 space-y-3 border-t border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search features (e.g. entropy, length, digit)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 sticky top-0 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">Feature Name</th>
                  <th className="py-2 px-3">Extracted Value</th>
                  <th className="py-2 px-3">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                {filtered.map(([key, val]) => (
                  <tr key={key} className="hover:bg-slate-900/40 transition">
                    <td className="py-2 px-3 font-semibold text-slate-300">{key}</td>
                    <td className="py-2 px-3 text-blue-400 font-mono">
                      {typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(4)) : String(val)}
                    </td>
                    <td className="py-2 px-3 text-slate-400">
                      {typeof val === 'number' ? (Number.isInteger(val) ? 'integer' : 'float') : typeof val}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-slate-400">
                      No matching features found for "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
