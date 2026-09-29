"use client";

import { useState } from "react";

export interface ActivityEvent {
  id: string;
  time: string;
  title: string;
  detail: string;
  type: "sos_accept" | "bay_assign" | "online" | "repair_complete" | "settlement";
  amount?: string;
}

const DEFAULT_ACTIVITIES: ActivityEvent[] = [
  {
    id: "act-1",
    time: "09:42",
    title: "SOS #204 accepted",
    detail: "Sokha Auto Care assigned Mobile Van #02 to Toyota Camry",
    type: "sos_accept",
  },
  {
    id: "act-2",
    time: "09:41",
    title: "Bay A assigned → Toyota Camry",
    detail: "Hydraulic 2-Post Lift allocated for alternator repair",
    type: "bay_assign",
  },
  {
    id: "act-3",
    time: "09:39",
    title: "Sokha Auto Care went online",
    detail: "6 Hydraulic Bays & 3 Mobile Vans active in Tuol Kork",
    type: "online",
  },
  {
    id: "act-4",
    time: "09:36",
    title: "Repair #198 completed",
    detail: "Honda Civic battery replacement inspected and released",
    type: "repair_complete",
  },
  {
    id: "act-5",
    time: "09:32",
    title: "$84 settlement received",
    detail: "ABA KHQR instant settlement credited to workshop account",
    type: "settlement",
    amount: "+$84.00",
  },
];

export default function LiveActivityFeed({
  events = DEFAULT_ACTIVITIES,
  className = "",
}: {
  events?: ActivityEvent[];
  className?: string;
}) {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filtered = events.filter((e) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "dispatches") return e.type === "sos_accept" || e.type === "repair_complete";
    if (activeFilter === "finance") return e.type === "settlement";
    return true;
  });

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4 flex flex-col justify-between ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Live Operations Activity Stream
          </h3>
        </div>

        <div className="flex items-center gap-1 text-[10px]">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              activeFilter === "all" ? "bg-slate-900 text-white font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter("dispatches")}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              activeFilter === "dispatches" ? "bg-slate-900 text-white font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Dispatches
          </button>
          <button
            onClick={() => setActiveFilter("finance")}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              activeFilter === "finance" ? "bg-slate-900 text-white font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Settlements
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {filtered.map((evt) => {
          return (
            <div
              key={evt.id}
              className="flex items-start justify-between gap-3 text-xs hover:bg-slate-50/60 p-1.5 rounded-lg transition"
            >
              <div className="flex items-start gap-2.5">
                <span className="font-mono text-[11px] font-bold text-slate-400 mt-0.5 shrink-0">
                  {evt.time}
                </span>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{evt.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{evt.detail}</p>
                </div>
              </div>

              {evt.amount && (
                <span className="font-mono text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded shrink-0">
                  {evt.amount}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Real-time sync note */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span>Connected to Event Bus WebSocket</span>
        <span className="text-emerald-600 font-bold">&bull; 0ms latency</span>
      </div>
    </div>
  );
}
