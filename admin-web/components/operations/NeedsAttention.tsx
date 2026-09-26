"use client";

export interface AttentionItem {
  id: string;
  severity: "critical" | "warning" | "notice";
  title: string;
  subtitle: string;
  badge: string;
  actionLabel: string;
  actionType: "assign_van" | "extend_bay" | "restock" | "renew_cert" | "view_order";
  targetId?: string;
}

interface NeedsAttentionProps {
  items?: AttentionItem[];
  onAction?: (actionType: string, targetId?: string) => void;
  className?: string;
}

const DEFAULT_ATTENTION_ITEMS: AttentionItem[] = [
  {
    id: "att-1",
    severity: "critical",
    title: "SOS #204 waiting 02:41",
    subtitle: "Toyota Camry stranded on Sihanouk Blvd · No technician assigned yet",
    badge: "CRITICAL SLA",
    actionLabel: "Assign Van Now",
    actionType: "assign_van",
    targetId: "sos-204",
  },
  {
    id: "att-2",
    severity: "warning",
    title: "Bay B exceeded estimated time",
    subtitle: "Honda Civic transmission overhaul is 18 minutes over initial 60m estimate",
    badge: "+18m OVERDUE",
    actionLabel: "Inspect Bay",
    actionType: "extend_bay",
    targetId: "bay-2",
  },
  {
    id: "att-3",
    severity: "notice",
    title: "AGM Battery stock = 4 units",
    subtitle: "Buffer threshold is 6 units · Recommended restock before weekend rush",
    badge: "OEM LOW",
    actionLabel: "Restock Parts",
    actionType: "restock",
    targetId: "part-agm",
  },
  {
    id: "att-4",
    severity: "notice",
    title: "Workshop verification renewal due",
    subtitle: "Municipal Ministry facility compliance license expires in 12 days",
    badge: "12 DAYS REMAINING",
    actionLabel: "Review License",
    actionType: "renew_cert",
    targetId: "cert-2026",
  },
];

export default function NeedsAttention({
  items = DEFAULT_ATTENTION_ITEMS,
  onAction,
  className = "",
}: NeedsAttentionProps) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 flex flex-col justify-between ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Attention Center
          </h3>
        </div>
        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${
          items.length === 0
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-rose-50 text-rose-700 border-rose-200"
        }`}>
          {items.length === 0 ? "ALL NOMINAL" : `NEEDS ATTENTION · ${items.length}`}
        </span>
      </div>

      {/* Item List */}
      <div className="divide-y divide-slate-100 my-2">
        {items.length === 0 ? (
          <div className="py-8 text-center space-y-1.5">
            <div className="w-8 h-8 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-xs font-bold text-slate-800">All Operations Optimal</p>
            <p className="text-[11px] text-slate-400">Zero active SLA alerts or overdue technician dispatches.</p>
          </div>
        ) : (
          items.map((item) => {
          const isCrit = item.severity === "critical";
          const isWarn = item.severity === "warning";

          return (
            <div
              key={item.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-xl transition"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                    isCrit
                      ? "bg-rose-500 shadow-sm shadow-rose-300"
                      : isWarn
                      ? "bg-amber-500"
                      : "bg-blue-400"
                  }`}
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900">{item.title}</p>
                    <span
                      className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded ${
                        isCrit
                          ? "bg-rose-100 text-rose-800"
                          : isWarn
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{item.subtitle}</p>
                </div>
              </div>

              <button
                onClick={() => onAction && onAction(item.actionType, item.targetId)}
                className={`self-start sm:self-center shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  isCrit
                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                    : isWarn
                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                }`}
              >
                {item.actionLabel}
              </button>
            </div>
          );
        })
      )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Zero unaddressed critical errors required for SLA compliance</span>
        <button
          onClick={() => onAction && onAction("view_all")}
          className="text-blue-600 hover:underline font-medium cursor-pointer"
        >
          View All Logs &rarr;
        </button>
      </div>
    </div>
  );
}
