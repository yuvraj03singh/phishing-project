import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  History,
  Search,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { RiskBadge } from "../components/RiskBadge";
import { ExplanationsCard } from "../components/ExplanationsCard";
import { FeatureTable } from "../components/FeatureTable";
import api from "../services/api";
import { PredictionResult } from "../types";
import { useAuth } from "../context/AuthContext";

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [items, setItems] = useState<PredictionResult[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PredictionResult | null>(
    null,
  );

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const params: any = { page, limit: 15 };
      if (search) params.search = search;
      if (riskFilter) params.riskLevel = riskFilter;

      const res = await api.get("/predictions", { params });
      setItems(res.data.data.items || []);
      setTotalPages(res.data.data.pagination.pages || 1);
      setTotalCount(res.data.data.pagination.total || 0);
    } catch (e) {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    fetchHistory();
  }, [page, riskFilter, user, isAuthLoading]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this prediction history record?")) return;
    try {
      await api.delete(`/predictions/${id}`);
      fetchHistory();
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    } catch (err: any) {
      alert(err.message || "Delete failed.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-8 px-4 sm:px-6 lg:px-8 font-mono">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs">
          <History size={13} /> Audit Logs & Scan History
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Prediction Scan History
        </h1>
        <p className="text-sm text-slate-400">
          Review, filter, and inspect previously analyzed URLs and risk records.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search
            className="absolute left-3 top-2.5 text-slate-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search historical URLs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Risk Tiers</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="CRITICAL">Critical Risk</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-blue-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-blue-100">
              <tr>
                <th className="py-3 px-4">Target URL</th>
                <th className="py-3 px-4">Verdict</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                      <span>Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No scan history found. Run a scan from the URL Scanner to
                    see records.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id || (item as any)._id}
                    className="hover:bg-slate-900/40 transition"
                  >
                    <td className="py-3 px-4 text-slate-200 max-w-sm truncate">
                      {item.url}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold uppercase ${
                          item.isPhishing || item.prediction === "phishing"
                            ? "text-rose-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {item.prediction}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge
                        level={item.riskLevel || (item as any).riskLevel}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {Math.round(
                        item.riskScore || (item as any).riskScore || 0,
                      )}
                      %
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : "Just now"}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 transition"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(item.id || (item as any)._id)
                        }
                        className="p-1.5 rounded bg-slate-800 hover:bg-red-500/20 text-rose-400 hover:text-rose-300 transition"
                        title="Delete Record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            Showing Page {page} of {totalPages} ({totalCount} total scans)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded bg-white hover:bg-blue-50 disabled:opacity-40 text-slate-600 border border-slate-200 transition"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded bg-white hover:bg-blue-50 disabled:opacity-40 text-slate-600 border border-slate-200 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <RiskBadge
                  level={
                    selectedItem.riskLevel || (selectedItem as any).riskLevel
                  }
                  size="md"
                />
                <h3 className="text-base font-bold text-white uppercase">
                  Scan Telemetry Record
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase">
                Analyzed URL:
              </span>
              <p className="p-3 bg-slate-950 rounded-lg text-xs text-slate-200 break-all border border-slate-800">
                {selectedItem.url}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">
                  Verdict
                </span>
                <p className="text-sm font-bold text-white uppercase">
                  {selectedItem.prediction}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">
                  Risk Score
                </span>
                <p className="text-sm font-bold text-white">
                  {Math.round(selectedItem.riskScore || 0)}%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">
                  Latency
                </span>
                <p className="text-sm font-bold text-white">
                  {selectedItem.inferenceLatencyMs || 1.2} ms
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">
                  Model
                </span>
                <p className="text-sm font-bold text-white truncate">
                  {selectedItem.modelVersion || "v1.0.0"}
                </p>
              </div>
            </div>

            <ExplanationsCard
              explanations={selectedItem.explanations || []}
              isPhishing={
                selectedItem.isPhishing ||
                selectedItem.prediction === "phishing"
              }
            />

            {selectedItem.featureSummary && (
              <FeatureTable features={selectedItem.featureSummary} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
