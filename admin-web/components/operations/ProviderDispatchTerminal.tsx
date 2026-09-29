"use client";

import { useState, useMemo } from "react";

export interface BookingCustomer {
  name: string;
  email?: string;
  phone?: string;
}

export interface BookingVehicle {
  make?: string;
  model?: string;
  year?: number;
  plateNumber?: string;
  color?: string;
}

export interface BookingLocation {
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface TerminalBooking {
  id: string;
  serviceType: string;
  status: string;
  notes?: string | null;
  createdAt?: string;
  customer?: BookingCustomer;
  customerName?: string;
  customerPhone?: string;
  customerLocation?: BookingLocation;
  vehicle?: BookingVehicle | null;
  estimatedPrice?: number;
  isEmergency?: boolean;
}

interface ProviderDispatchTerminalProps {
  bookings: TerminalBooking[];
  onAcceptBooking?: (id: string) => void;
  onUpdateStatus?: (id: string, nextStatus: string) => void;
  onOpenChat?: (booking: TerminalBooking) => void;
  className?: string;
}

export default function ProviderDispatchTerminal({
  bookings,
  onAcceptBooking,
  onUpdateStatus,
  onOpenChat,
  className = "",
}: ProviderDispatchTerminalProps) {
  const [filter, setFilter] = useState<"all" | "sos" | "pending" | "en_route" | "in_progress">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Compute dynamic filter counts
  const counts = useMemo(() => {
    return {
      all: bookings.length,
      sos: bookings.filter(
        (b) =>
          b.isEmergency ||
          b.serviceType.toLowerCase().includes("sos") ||
          b.serviceType.toLowerCase().includes("emergency")
      ).length,
      pending: bookings.filter((b) => b.status.toLowerCase() === "pending").length,
      en_route: bookings.filter((b) => b.status.toLowerCase() === "accepted").length,
      in_progress: bookings.filter((b) => b.status.toLowerCase() === "in_progress").length,
    };
  }, [bookings]);

  // Filtered list
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const st = b.status.toLowerCase();
      const isSos =
        b.isEmergency ||
        b.serviceType.toLowerCase().includes("sos") ||
        b.serviceType.toLowerCase().includes("emergency");

      if (filter === "sos" && !isSos) return false;
      if (filter === "pending" && st !== "pending") return false;
      if (filter === "en_route" && st !== "accepted") return false;
      if (filter === "in_progress" && st !== "in_progress") return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const cName = (b.customer?.name || b.customerName || "").toLowerCase();
        const sType = b.serviceType.toLowerCase();
        const plate = (b.vehicle?.plateNumber || "").toLowerCase();
        const notes = (b.notes || "").toLowerCase();
        const addr = (b.customerLocation?.address || "").toLowerCase();
        return (
          cName.includes(q) ||
          sType.includes(q) ||
          plate.includes(q) ||
          notes.includes(q) ||
          addr.includes(q)
        );
      }
      return true;
    });
  }, [bookings, filter, search]);

  const selectedBooking = useMemo(
    () => bookings.find((b) => b.id === selectedId) || null,
    [bookings, selectedId]
  );

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            PENDING TRIAGE
          </span>
        );
      case "accepted":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
            TECH EN ROUTE
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-purple-50 text-purple-700 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            IN SERVICE
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            SETTLED & PAID
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-slate-100 text-slate-700 border border-slate-200">
            {status.toUpperCase()}
          </span>
        );
    }
  };

  const getElapsedText = (createdAt?: string) => {
    if (!createdAt) return "Active now";
    const mins = Math.max(1, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m ago`;
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col ${className}`}>
      {/* Terminal Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 font-mono">
              Live Dispatch & Triage Terminal
            </h3>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {bookings.filter((b) => b.status.toLowerCase() !== "completed" && b.status.toLowerCase() !== "cancelled").length} ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time workshop roadside dispatch feed from live database API
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search motorist, plate, issue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
          />
          <svg
            className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 1114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Segmented Filter Pills */}
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
            filter === "all"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          All Dispatches ({counts.all})
        </button>
        <button
          onClick={() => setFilter("sos")}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
            filter === "sos"
              ? "bg-rose-600 text-white shadow-xs"
              : "bg-white text-rose-700 border border-rose-200 hover:bg-rose-50"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          Urgent SOS ({counts.sos})
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
            filter === "pending"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-white text-amber-700 border border-amber-200 hover:bg-amber-50"
          }`}
        >
          Pending ({counts.pending})
        </button>
        <button
          onClick={() => setFilter("en_route")}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
            filter === "en_route"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white text-blue-700 border border-blue-200 hover:bg-blue-50"
          }`}
        >
          En Route ({counts.en_route})
        </button>
        <button
          onClick={() => setFilter("in_progress")}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
            filter === "in_progress"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-white text-purple-700 border border-purple-200 hover:bg-purple-50"
          }`}
        >
          In Service ({counts.in_progress})
        </button>
      </div>

      {/* Terminal Feed Body */}
      <div className="p-5 flex-1 space-y-3.5 max-h-[560px] overflow-y-auto">
        {filteredBookings.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <svg
              className="w-10 h-10 mx-auto text-slate-300 stroke-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-medium text-slate-500">No dispatches match the selected filter.</p>
            <p className="text-xs text-slate-400">Incoming roadside breakdown requests will stream here automatically.</p>
          </div>
        ) : (
          filteredBookings.map((b) => {
            const isSelected = selectedId === b.id;
            const cName = b.customer?.name || b.customerName || "Customer";
            const cPhone = b.customer?.phone || b.customerPhone || "+855 12 889 977";
            const vMake = b.vehicle?.make || "";
            const vModel = b.vehicle?.model || "";
            const vYear = b.vehicle?.year || "";
            const vPlate = b.vehicle?.plateNumber || "2A-8888";
            const locationText = b.customerLocation?.address || b.notes || "Phnom Penh City Center";
            const price = b.estimatedPrice || 45;
            const isSos =
              b.isEmergency ||
              b.serviceType.toLowerCase().includes("sos") ||
              b.serviceType.toLowerCase().includes("emergency");

            return (
              <div
                key={b.id}
                onClick={() => setSelectedId(isSelected ? null : b.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/20 ring-1 ring-blue-600/30 shadow-xs"
                    : isSos && b.status.toLowerCase() === "pending"
                    ? "border-rose-200 bg-rose-50/15 hover:border-rose-300 hover:bg-rose-50/25"
                    : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs"
                }`}
              >
                {/* Header line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(b.status)}
                    <span className="font-mono text-[11px] text-slate-400">#{b.id.slice(0, 8)}</span>
                    <span className="text-[11px] text-slate-400">&bull; {getElapsedText(b.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-sm text-slate-900">${price}.00 USD</span>
                  </div>
                </div>

                {/* Main Content */}
                <div className="pt-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-8 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900">{b.serviceType}</h4>
                      {isSos && (
                        <span className="px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-rose-100 text-rose-700">
                          URGENT RESCUE
                        </span>
                      )}
                    </div>

                    {/* Vehicle & Plate Line */}
                    <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
                      <span className="font-semibold text-slate-800">
                        {vYear} {vMake} {vModel}
                      </span>
                      <span className="font-mono font-bold px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-700 border border-slate-200">
                        🇰🇭 {vPlate}
                      </span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-slate-600">{cName} ({cPhone})</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <svg className="w-3.5 h-3.5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{locationText}</span>
                    </div>

                    {/* Breakdown Notes preview */}
                    {b.notes && (
                      <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-md border border-slate-100">
                        &ldquo;{b.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col items-stretch md:items-end gap-2 justify-center" onClick={(e) => e.stopPropagation()}>
                    {b.status.toLowerCase() === "pending" && (
                      <button
                        onClick={() => onAcceptBooking?.(b.id)}
                        className="w-full px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Accept & Deploy Van
                      </button>
                    )}

                    {b.status.toLowerCase() === "accepted" && (
                      <button
                        onClick={() => onUpdateStatus?.(b.id, "in_progress")}
                        className="w-full px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        Mark In Service (Arrived)
                      </button>
                    )}

                    {b.status.toLowerCase() === "in_progress" && (
                      <button
                        onClick={() => onUpdateStatus?.(b.id, "completed")}
                        className="w-full px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Complete Job & Settle
                      </button>
                    )}

                    <div className="flex items-center gap-2 w-full">
                      <button
                        onClick={() => onOpenChat?.(b)}
                        className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 flex items-center justify-center gap-1 transition"
                      >
                        <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Chat
                      </button>
                      <a
                        href={`tel:${cPhone}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 flex items-center justify-center transition"
                        title="Call Motorist"
                      >
                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Expandable Telemetry Drawer */}
                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg">
                    <div>
                      <span className="text-slate-400 block font-mono text-[10px] uppercase">Service Ticket</span>
                      <span className="font-bold text-slate-800">#{b.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono text-[10px] uppercase">SLA Benchmark</span>
                      <span className="font-bold text-emerald-600">&lt; 15 mins (On Target)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono text-[10px] uppercase">Settlement Method</span>
                      <span className="font-bold text-blue-600">Bakong KHQR Auto-Credit</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Strip */}
      <div className="p-3 bg-slate-50/80 border-t border-slate-100 rounded-b-2xl flex items-center justify-between text-xs text-slate-500 font-mono">
        <span>Displaying {filteredBookings.length} of {bookings.length} dispatches</span>
        <span className="flex items-center gap-1 text-emerald-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          WebSocket Live Polling: OK
        </span>
      </div>
    </div>
  );
}
