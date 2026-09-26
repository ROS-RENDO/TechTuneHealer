"use client";

import { useState, useMemo } from "react";

export interface MatrixBooking {
  id: string;
  serviceType: string;
  status: string;
  notes?: string | null;
  createdAt?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  } | null;
  provider?: {
    businessName?: string;
    address?: string;
  } | null;
  vehicle?: {
    make?: string;
    model?: string;
    year?: number;
    plateNumber?: string;
    color?: string;
  } | null;
}

export interface StatusPipelineCounts {
  pending: { count: number; revenue: number; label: string; slaText: string };
  accepted: { count: number; revenue: number; label: string; slaText: string };
  inProgress: { count: number; revenue: number; label: string; slaText: string };
  qualityCheck: { count: number; revenue: number; label: string; slaText: string };
  completed: { count: number; revenue: number; label: string; slaText: string };
}

interface NetworkDispatchMatrixProps {
  bookings: MatrixBooking[];
  statusPipeline?: StatusPipelineCounts | null;
  selectedSector: string;
  onSectorChange?: (sector: string) => void;
  className?: string;
}

export default function NetworkDispatchMatrix({
  bookings,
  statusPipeline,
  selectedSector,
  onSectorChange,
  className = "",
}: NetworkDispatchMatrixProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [inspectBooking, setInspectBooking] = useState<MatrixBooking | null>(null);

  // Filtered list
  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const st = b.status.toLowerCase();
      if (statusFilter !== "all" && st !== statusFilter.toLowerCase()) return false;

      // Sector filtering by provider address or booking notes
      if (selectedSector !== "all") {
        const text = `${b.provider?.address || ""} ${b.notes || ""}`.toLowerCase();
        if (selectedSector === "central" && !text.includes("bkk") && !text.includes("daun penh") && !text.includes("wat phnom")) return false;
        if (selectedSector === "north" && !text.includes("tuol kork") && !text.includes("sen sok")) return false;
        if (selectedSector === "east" && !text.includes("chroy changvar") && !text.includes("camtech")) return false;
        if (selectedSector === "south" && !text.includes("chamkarmon") && !text.includes("meanchey")) return false;
        if (selectedSector === "west" && !text.includes("por senchey") && !text.includes("airport")) return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const cName = (b.customer?.name || "").toLowerCase();
        const sType = b.serviceType.toLowerCase();
        const pName = (b.provider?.businessName || "").toLowerCase();
        const plate = (b.vehicle?.plateNumber || "").toLowerCase();
        const notes = (b.notes || "").toLowerCase();
        return (
          b.id.toLowerCase().includes(q) ||
          cName.includes(q) ||
          sType.includes(q) ||
          pName.includes(q) ||
          plate.includes(q) ||
          notes.includes(q)
        );
      }
      return true;
    });
  }, [bookings, statusFilter, selectedSector, search]);

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            INBOUND SOS
          </span>
        );
      case "accepted":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
            EN ROUTE
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            IN SERVICE
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            COMPLETED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {status.toUpperCase()}
          </span>
        );
    }
  };

  const getElapsedText = (createdAt?: string) => {
    if (!createdAt) return "Just now";
    const mins = Math.max(1, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m ago`;
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 font-mono">
              Citywide Incident & Fleet Telemetry Matrix
            </h3>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {bookings.length} DISPATCHES
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time municipal roadside dispatch telemetry streaming from central database
          </p>
        </div>

        {/* Sector and Search controls */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <select
            value={selectedSector}
            onChange={(e) => onSectorChange?.(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-hidden focus:ring-1 focus:ring-blue-600"
          >
            <option value="all">All Phnom Penh</option>
            <option value="central">Central (Daun Penh / BKK)</option>
            <option value="north">North (Tuol Kork / Sen Sok)</option>
            <option value="east">East (Chroy Changvar)</option>
            <option value="south">South (Chamkarmon / Meanchey)</option>
            <option value="west">West (Por Senchey / Airport)</option>
          </select>

          <div className="relative w-full sm:w-56">
            <input
              type="text"
              placeholder="Filter ticket, plate, workshop..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            />
            <svg
              className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 1114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Mini Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 bg-slate-50/50 border-b border-slate-100">
        <div className="p-3 text-center cursor-pointer hover:bg-slate-100/60 transition" onClick={() => setStatusFilter("pending")}>
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Inbound SOS</span>
          <span className="text-base font-extrabold text-amber-600 font-mono">
            {statusPipeline?.pending.count ?? 0}
          </span>
          <span className="text-[10px] text-slate-400 block">SLA: 8.2m avg</span>
        </div>

        <div className="p-3 text-center cursor-pointer hover:bg-slate-100/60 transition" onClick={() => setStatusFilter("accepted")}>
          <span className="text-[10px] font-mono text-slate-400 block uppercase">En Route</span>
          <span className="text-base font-extrabold text-blue-600 font-mono">
            {statusPipeline?.accepted.count ?? 0}
          </span>
          <span className="text-[10px] text-slate-400 block">11.4m arrival</span>
        </div>

        <div className="p-3 text-center cursor-pointer hover:bg-slate-100/60 transition" onClick={() => setStatusFilter("in_progress")}>
          <span className="text-[10px] font-mono text-slate-400 block uppercase">In Service</span>
          <span className="text-base font-extrabold text-purple-600 font-mono">
            {statusPipeline?.inProgress.count ?? 0}
          </span>
          <span className="text-[10px] text-slate-400 block">45m bay avg</span>
        </div>

        <div className="p-3 text-center cursor-pointer hover:bg-slate-100/60 transition" onClick={() => setStatusFilter("completed")}>
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Resolved Today</span>
          <span className="text-base font-extrabold text-emerald-600 font-mono">
            {statusPipeline?.completed.count ?? 0}
          </span>
          <span className="text-[10px] text-slate-400 block">Instant KHQR</span>
        </div>
      </div>

      {/* Dispatches Matrix Feed */}
      <div className="p-4 flex-1 space-y-2.5 max-h-[520px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <svg className="w-10 h-10 mx-auto text-slate-300 stroke-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-medium text-slate-500">No active incidents matching the selected criteria.</p>
            <p className="text-xs text-slate-400">Try switching sector or clearing search filters.</p>
          </div>
        ) : (
          filtered.map((b) => {
            const cName = b.customer?.name || "Motorist";
            const pName = b.provider?.businessName || "Assigned Partner";
            const vPlate = b.vehicle?.plateNumber || "2A-8888";
            const vDesc = b.vehicle ? `${b.vehicle.year || ""} ${b.vehicle.make || ""} ${b.vehicle.model || ""}` : "Vehicle";
            const isSos = b.serviceType.toLowerCase().includes("sos") || b.serviceType.toLowerCase().includes("emergency");

            return (
              <div
                key={b.id}
                onClick={() => setInspectBooking(b)}
                className="p-3.5 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/10 transition-all cursor-pointer bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
              >
                {/* Left detail */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(b.status)}
                    <span className="font-mono text-[11px] text-slate-400">#{b.id.slice(0, 8)}</span>
                    <span className="text-[11px] text-slate-400">&bull; {getElapsedText(b.createdAt)}</span>
                    {isSos && (
                      <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold bg-rose-100 text-rose-700">
                        SOS
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap pt-0.5">
                    <span className="font-bold text-xs text-slate-900">{b.serviceType}</span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="font-mono text-xs font-semibold px-1 py-0.5 rounded-xs bg-slate-100 text-slate-700 border border-slate-200">
                      🇰🇭 {vPlate}
                    </span>
                    <span className="text-xs text-slate-500">{vDesc}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Motorist: <strong className="text-slate-700 font-semibold">{cName}</strong></span>
                    <span className="text-slate-300">&bull;</span>
                    <span>Workshop: <strong className="text-slate-700 font-semibold">{pName}</strong></span>
                  </div>
                </div>

                {/* Right button */}
                <div className="shrink-0 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setInspectBooking(b)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 transition"
                  >
                    Inspect Telemetry &rarr;
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-50/80 border-t border-slate-100 rounded-b-2xl flex items-center justify-between text-xs text-slate-500 font-mono">
        <span>Showing {filtered.length} of {bookings.length} network events</span>
        <button
          onClick={() => {
            setStatusFilter("all");
            setSearch("");
          }}
          className="text-blue-600 hover:underline text-[11px]"
        >
          Reset All Filters
        </button>
      </div>

      {/* Incident Inspection Modal Drawer */}
      {inspectBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 font-mono">
                  Network Incident Inspection #{inspectBooking.id.slice(0, 8)}
                </h3>
              </div>
              <button
                onClick={() => setInspectBooking(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Lifecycle:</span>
                  {getStatusBadge(inspectBooking.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Service Category:</span>
                  <span className="font-bold text-slate-800">{inspectBooking.serviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Created At:</span>
                  <span className="font-mono text-slate-700">
                    {inspectBooking.createdAt ? new Date(inspectBooking.createdAt).toLocaleString() : "Recent"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Motorist Contact</span>
                  <p className="font-bold text-slate-800">{inspectBooking.customer?.name || "Customer"}</p>
                  <p className="text-slate-600 font-mono">{inspectBooking.customer?.phone || "+855 12 889 977"}</p>
                  <p className="text-slate-400 text-[11px] truncate">{inspectBooking.customer?.email}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Registered Vehicle</span>
                  <p className="font-bold text-slate-800">
                    {inspectBooking.vehicle?.year} {inspectBooking.vehicle?.make} {inspectBooking.vehicle?.model}
                  </p>
                  <p className="font-mono font-bold text-blue-600">
                    🇰🇭 {inspectBooking.vehicle?.plateNumber || "2A-8888"}
                  </p>
                  <p className="text-slate-400 text-[11px]">{inspectBooking.vehicle?.color || "Standard"} finish</p>
                </div>
              </div>

              {inspectBooking.notes && (
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 space-y-1">
                  <span className="text-[10px] font-mono text-amber-700 uppercase block font-bold">Reported Symptoms</span>
                  <p className="text-slate-700 italic">&ldquo;{inspectBooking.notes}&rdquo;</p>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Assigned Workshop Facility</span>
                <p className="font-bold text-slate-800">{inspectBooking.provider?.businessName || "Speedy Auto Fix"}</p>
                <p className="text-slate-500 text-[11px]">{inspectBooking.provider?.address || "Olympic Stadium Area, Phnom Penh"}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setInspectBooking(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
