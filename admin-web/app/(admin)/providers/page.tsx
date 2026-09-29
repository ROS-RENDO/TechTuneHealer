"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

interface Provider {
  id: string;
  businessName: string;
  address?: string;
  rating?: number;
  isEmergency?: boolean;
  isVerified?: boolean;
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED" | string;
  user: { name: string; email: string; phone?: string; createdAt: string };
  services?: Array<{ id: string; name: string; price: number }>;
  _count: { bookings: number; reviews?: number };
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [page, setPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const limit = 20;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/providers", {
        params: { search, status: statusFilter, page, limit },
      });
      setProviders(res.data.providers || []);
      setTotal(res.data.total || 0);
      setPendingCount(res.data.pendingCount || 0);
      setApprovedCount(res.data.approvedCount || 0);
      setRejectedCount(res.data.rejectedCount || 0);
    } catch (e) {
      console.error(e);
      showToast("Error loading partner workshops.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // Admin approves workshop application
  const handleApprove = async (providerId: string, businessName: string) => {
    setActionLoadingId(providerId);
    try {
      await api.patch(`/admin/providers/${providerId}/approve`);
      setProviders((prev) =>
        prev.map((p) =>
          p.id === providerId
            ? { ...p, approvalStatus: "APPROVED", isVerified: true }
            : p
        )
      );
      setPendingCount((prev) => Math.max(0, prev - 1));
      setApprovedCount((prev) => prev + 1);
      showToast(`✓ Workshop "${businessName}" approved & verified into network!`);
    } catch (err) {
      console.error("Failed to approve provider:", err);
      showToast("Error approving workshop facility.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Admin rejects workshop application
  const handleReject = async (providerId: string, businessName: string) => {
    setActionLoadingId(providerId);
    try {
      await api.patch(`/admin/providers/${providerId}/reject`);
      setProviders((prev) =>
        prev.map((p) =>
          p.id === providerId
            ? { ...p, approvalStatus: "REJECTED", isVerified: false, isEmergency: false }
            : p
        )
      );
      setPendingCount((prev) => Math.max(0, prev - 1));
      setRejectedCount((prev) => prev + 1);
      showToast(`Application for "${businessName}" declined.`);
    } catch (err) {
      console.error("Failed to reject provider:", err);
      showToast("Error declining workshop application.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const toggleEmergencyStandby = async (providerId: string, currentState: boolean) => {
    try {
      await api.patch(`/admin/providers/${providerId}`, { isEmergency: !currentState });
      setProviders((prev) =>
        prev.map((p) => (p.id === providerId ? { ...p, isEmergency: !currentState } : p))
      );
      showToast(`Emergency standby updated to ${!currentState ? "ACTIVE" : "OFF"}`);
    } catch (err) {
      console.error("Failed to toggle emergency:", err);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Notification Toast ────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-medium flex items-center gap-2 border border-slate-700 animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Partner Workshops Network</h1>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                {pendingCount} AWAITING APPROVAL
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Review registration applications, approve certified facilities, and monitor active network garages.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search facility or owner name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
          />
          <svg
            className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 1114 0z" />
          </svg>
        </div>
      </div>

      {/* ─── Segmented Status Tabs ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100/70 p-1 rounded-xl w-fit">
        <button
          onClick={() => {
            setStatusFilter("all");
            setPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            statusFilter === "all"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          All Facilities ({total})
        </button>

        <button
          onClick={() => {
            setStatusFilter("pending");
            setPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
            statusFilter === "pending"
              ? "bg-amber-500 text-white shadow-xs font-bold"
              : "text-amber-800 hover:bg-amber-100/60"
          }`}
        >
          {pendingCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping" />}
          Pending Approval ({pendingCount})
        </button>

        <button
          onClick={() => {
            setStatusFilter("approved");
            setPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            statusFilter === "approved"
              ? "bg-emerald-600 text-white shadow-xs font-bold"
              : "text-emerald-800 hover:bg-emerald-100/60"
          }`}
        >
          Verified Partners ({approvedCount})
        </button>

        <button
          onClick={() => {
            setStatusFilter("rejected");
            setPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            statusFilter === "rejected"
              ? "bg-slate-700 text-white shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Declined ({rejectedCount})
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
                <th className="px-5 py-3">Facility Details</th>
                <th className="px-5 py-3">Lead Operator</th>
                <th className="px-5 py-3">Location &amp; Station</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">24/7 Roadside</th>
                <th className="px-5 py-3 text-center">Admin Approval</th>
                <th className="px-5 py-3 text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    Loading workshop facilities...
                  </td>
                </tr>
              ) : providers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-600">No workshop applications found.</p>
                    <p className="text-[11px]">No facilities currently match status filter: &ldquo;{statusFilter}&rdquo;</p>
                  </td>
                </tr>
              ) : (
                providers.map((p) => {
                  const isPending = (p.approvalStatus || "").toUpperCase() === "PENDING";
                  const isApproved = (p.approvalStatus || "").toUpperCase() === "APPROVED" || Boolean(p.isVerified);
                  const isRejected = (p.approvalStatus || "").toUpperCase() === "REJECTED";
                  const isEmergency = Boolean(p.isEmergency);
                  const isBusy = actionLoadingId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-sm">{p.businessName || "Facility"}</p>
                          {isPending && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                              Pending Review
                            </span>
                          )}
                          {isApproved && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              ✓ Verified
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
                              Declined
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 font-mono text-[11px] mt-0.5">ID: {p.id.slice(0, 8).toUpperCase()}</p>
                      </td>

                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-900">{p.user.name}</p>
                        <a
                          href={`tel:${p.user.phone}`}
                          className="text-blue-600 hover:underline font-mono text-[11px] block mt-0.5"
                        >
                          {p.user.phone || p.user.email}
                        </a>
                      </td>

                      <td className="px-5 py-3.5 text-slate-600 max-w-[200px] truncate" title={p.address || "Phnom Penh"}>
                        {p.address || "Phnom Penh, Cambodia"}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Awaiting Review
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active Partner
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Application Declined
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <button
                          onClick={() => toggleEmergencyStandby(p.id, isEmergency)}
                          disabled={!isApproved}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition cursor-pointer ${
                            !isApproved
                              ? "opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200"
                              : isEmergency
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : "bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200"
                          }`}
                        >
                          {isEmergency ? "STANDBY: ACTIVE" : "OFFLINE"}
                        </button>
                      </td>

                      {/* Admin Acceptance Action Column */}
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        {isPending ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleApprove(p.id, p.businessName)}
                              disabled={isBusy}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs flex items-center gap-1 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                              Accept &amp; Verify
                            </button>
                            <button
                              onClick={() => handleReject(p.id, p.businessName)}
                              disabled={isBusy}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        ) : isApproved ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-[11px] text-emerald-700 font-bold font-mono">AUTHORIZED</span>
                            <button
                              onClick={() => handleReject(p.id, p.businessName)}
                              disabled={isBusy}
                              className="text-[10px] text-slate-400 hover:text-rose-600 hover:underline cursor-pointer"
                              title="Revoke partner verification"
                            >
                              Revoke
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApprove(p.id, p.businessName)}
                            disabled={isBusy}
                            className="px-2.5 py-1 rounded text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
                          >
                            Re-evaluate &amp; Approve
                          </button>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right text-slate-500 font-mono whitespace-nowrap">
                        {new Date(p.user.createdAt).toLocaleDateString()}
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
              Showing page {page} of {totalPages} ({total} workshops)
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
