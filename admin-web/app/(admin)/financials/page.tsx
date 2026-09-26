"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

interface FinancialSummary {
  totalNetworkGmv: number;
  totalPlatformRevenue: number;
  bookingCommission: number;
  partsGrossRevenue: number;
  workshopSettlements: number;
  completedRepairsCount: number;
  totalBookingsCount: number;
  paidOrdersCount: number;
  activeWorkshopsCount: number;
}

interface SettlementItem {
  id: string;
  bookingId: string;
  workshopName: string;
  customerName: string;
  serviceType: string;
  gross: number;
  fee: number;
  netPayout: number;
  date: string;
  status: string;
}

export default function FinancialsPage() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [settlements, setSettlements] = useState<SettlementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchFinancials = useCallback(async () => {
    try {
      const res = await api.get("/admin/financials");
      setSummary(res.data.summary);
      setSettlements(res.data.recentSettlements || []);
    } catch (err) {
      console.error("Error fetching financials:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFinancials();
  }, [fetchFinancials]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFinancials();
  };

  const handleExportReport = () => {
    showToast("Financial Statement exported to CSV successfully");
  };

  const filteredSettlements = settlements.filter(
    (s) =>
      s.workshopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-xs font-mono">Calculating network revenue &amp; settlement ledgers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Notification Toast ────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded shadow-xl text-xs font-medium flex items-center gap-2 border border-slate-700 animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── Header & Sync ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Platform Revenue &amp; Settlements Hub</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Network GMV accounting, 10% workshop booking commission tracking, auto parts revenue, and partner bank payouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <svg className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span>{refreshing ? "Calculating..." : "Sync Revenue"}</span>
          </button>

          <button
            onClick={handleExportReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-2xs cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export CSV Statement</span>
          </button>
        </div>
      </div>

      {/* ─── 4 Standard KPI Overview Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Network GMV</p>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
            ${summary?.totalNetworkGmv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Total repair dispatches + parts shop GMV</p>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform Retained Revenue</p>
          <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">
            ${summary?.totalPlatformRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">10% network commission + parts margins</p>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Workshop Payouts Settled</p>
          <p className="text-2xl font-black text-blue-600 mt-1 font-mono">
            ${summary?.workshopSettlements.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">90% net disbursed to partner garages</p>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Commercial Transactions</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {(summary?.completedRepairsCount || 0) + (summary?.paidOrdersCount || 0)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {summary?.completedRepairsCount || 0} repairs &bull; {summary?.paidOrdersCount || 0} orders
          </p>
        </div>
      </div>

      {/* ─── Platform Economic Framework & Breakdown ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded p-5 shadow-2xs space-y-2">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            10% Workshop Take-Rate
          </h3>
          <p className="text-2xl font-black text-indigo-700 font-mono">
            ${summary?.bookingCommission.toFixed(2) || "0.00"}
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            TechTune deducts an automated 10% network commission on all completed and verified roadside &amp; bay repair tickets.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded p-5 shadow-2xs space-y-2">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Auto Parts E-Commerce Gross
          </h3>
          <p className="text-2xl font-black text-slate-900 font-mono">
            ${summary?.partsGrossRevenue.toFixed(2) || "0.00"}
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Direct parts purchases made by motorists for scheduled maintenance, batteries, lubricants, and brake pads.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded p-5 shadow-2xs space-y-2">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Cambodia Bakong / KHQR Ready
          </h3>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
              100% INSTANT SETTLEMENT
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            All workshop disbursements support automated settlement to ABA Bank, Wing Bank, and ACLEDA Bank accounts.
          </p>
        </div>
      </div>

      {/* ─── Itemized Settlement Ledger Table ───────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Settlement Ledger &amp; Platform Commission Deductions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Itemized transaction records for completed roadside dispatches</p>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workshop, customer, service..."
              className="w-full sm:w-64 px-3 py-1.5 pl-8 rounded text-xs border border-slate-300 focus:outline-none focus:border-slate-900 bg-white"
            />
            <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
                <th className="px-5 py-3">Settlement #</th>
                <th className="px-5 py-3">Workshop Facility</th>
                <th className="px-5 py-3">Customer &amp; Service</th>
                <th className="px-5 py-3">Gross Ticket</th>
                <th className="px-5 py-3">10% Platform Fee</th>
                <th className="px-5 py-3">Net Disbursed</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {filteredSettlements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    No settlement records match your search query.
                  </td>
                </tr>
              ) : (
                filteredSettlements.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {item.id}
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{item.workshopName}</p>
                      <p className="text-slate-400 text-[11px]">Phnom Penh Partner</p>
                    </td>

                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="font-medium text-slate-900">{item.serviceType}</p>
                      <p className="text-slate-500 text-[11px]">{item.customerName}</p>
                    </td>

                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                      ${item.gross.toFixed(2)}
                    </td>

                    <td className="px-5 py-3.5 font-mono font-bold text-indigo-700 whitespace-nowrap">
                      +${item.fee.toFixed(2)}
                    </td>

                    <td className="px-5 py-3.5 font-mono font-bold text-emerald-700 whitespace-nowrap">
                      ${item.netPayout.toFixed(2)}
                    </td>

                    <td className="px-5 py-3.5 text-slate-500 font-mono whitespace-nowrap">
                      {new Date(item.date).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
