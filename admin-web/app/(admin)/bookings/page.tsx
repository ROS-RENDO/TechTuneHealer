"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

interface Booking {
  id: string;
  status: string;
  serviceType: string;
  createdAt: string;
  scheduledDate?: string;
  scheduledTime?: string;
  estimatedCost?: number;
  customer?: { name: string; email: string };
  provider?: { businessName: string };
}

const STATUS_TABS = [
  { key: "all", label: "All Dispatches" },
  { key: "PENDING", label: "Pending" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

const statusBadgeStyle: Record<string, string> = {
  PENDING:     "bg-amber-50 text-amber-800 border-amber-200",
  ACCEPTED:    "bg-indigo-50 text-indigo-800 border-indigo-200",
  IN_PROGRESS: "bg-blue-50 text-blue-800 border-blue-200",
  COMPLETED:   "bg-emerald-50 text-emerald-800 border-emerald-200",
  CANCELLED:   "bg-slate-100 text-slate-600 border-slate-200",
  REJECTED:    "bg-slate-100 text-slate-600 border-slate-200",
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/bookings", {
        params: { status: activeTab === "all" ? "" : activeTab, search, page, limit },
      });
      setBookings(res.data.bookings);
      setTotal(res.data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, page]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Bookings &amp; Dispatches Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Log of roadside emergency rescues and scheduled workshop appointments ({total} total).
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search customer or service..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition"
          />
        </div>
      </div>

      {/* Clean Status Tabs */}
      <div className="flex border-b border-slate-200 gap-6 overflow-x-auto text-sm">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setPage(1);
              }}
              className={`pb-2.5 font-medium whitespace-nowrap transition cursor-pointer border-b-2 ${
                isActive
                  ? "border-slate-900 text-slate-900 font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Requested Service</th>
                <th className="px-6 py-3">Assigned Workshop</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Quote</th>
                <th className="px-6 py-3 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Loading dispatch records...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                    No dispatches found under &ldquo;{activeTab}&rdquo;.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const badgeClass = statusBadgeStyle[b.status] || "bg-slate-100 text-slate-700 border-slate-200";

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="px-6 py-3.5 font-mono text-slate-900 font-medium">
                        #{b.id.slice(-6).toUpperCase()}
                      </td>

                      <td className="px-6 py-3.5">
                        <p className="font-semibold text-slate-900 text-sm">{b.customer?.name || "Customer"}</p>
                        <p className="text-slate-400 text-xs">{b.customer?.email}</p>
                      </td>

                      <td className="px-6 py-3.5 max-w-[240px]">
                        <p className="font-medium text-slate-800 truncate">{b.serviceType}</p>
                      </td>

                      <td className="px-6 py-3.5 text-slate-600">
                        {b.provider?.businessName || "Unassigned"}
                      </td>

                      <td className="px-6 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${badgeClass}`}>
                          {b.status.replace("_", " ")}
                        </span>
                      </td>

                      <td className="px-6 py-3.5 font-medium text-slate-900">
                        {b.estimatedCost != null ? `$${Number(b.estimatedCost).toFixed(2)}` : "—"}
                      </td>

                      <td className="px-6 py-3.5 text-right text-slate-400 whitespace-nowrap">
                        {new Date(b.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs bg-slate-50">
            <p className="text-slate-600">
              Showing page {page} of {totalPages} ({total} dispatches)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
