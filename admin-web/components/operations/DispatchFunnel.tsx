"use client";

interface FunnelStage {
  label: string;
  count: number;
  subtext: string;
  color: string;
  dropOff?: number;
  dropOffRate?: string;
}

const DEFAULT_STAGES: FunnelStage[] = [
  {
    label: "SOS REQUESTS",
    count: 128,
    subtext: "Total inbound emergency & workshop calls",
    color: "#E06D53",
  },
  {
    label: "ACCEPTED",
    count: 117,
    subtext: "Workshop dispatchers accepted job",
    color: "#F3B353",
    dropOff: 11,
    dropOffRate: "8.6% drop-off (out of radius)",
  },
  {
    label: "TECH EN ROUTE",
    count: 108,
    subtext: "Mobile unit deployed to GPS pin",
    color: "#2563EB",
    dropOff: 9,
    dropOffRate: "7.7% cancelled by motorist",
  },
  {
    label: "ARRIVED ON-SITE",
    count: 103,
    subtext: "Mechanic on scene & triage diagnosis begun",
    color: "#76B39D",
    dropOff: 5,
    dropOffRate: "4.6% resolved before arrival",
  },
  {
    label: "COMPLETED & SETTLED",
    count: 97,
    subtext: "First-fix repair completed & KHQR paid",
    color: "#10B981",
    dropOff: 6,
    dropOffRate: "5.8% towed to second facility",
  },
];

export default function DispatchFunnel({
  stages = DEFAULT_STAGES,
  className = "",
}: {
  stages?: FunnelStage[];
  className?: string;
}) {
  const maxCount = stages[0]?.count || 1;
  const overallConversion = Math.round(((stages[stages.length - 1]?.count || 0) / maxCount) * 100);

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Operational Dispatch Funnel
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Conversion stages tracking where emergency motorist requests are retained or lost
          </p>
        </div>

        <div className="text-right">
          <span className="text-xl font-extrabold text-slate-900 font-mono">{overallConversion}%</span>
          <p className="text-[10px] text-slate-400 font-medium">end-to-end completion</p>
        </div>
      </div>

      {/* Funnel Step Rows */}
      <div className="space-y-3">
        {stages.map((stage, idx) => {
          const widthPercent = Math.max(30, Math.round((stage.count / maxCount) * 100));

          return (
            <div key={stage.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: stage.color }} />
                  <span className="font-bold text-slate-900 tracking-tight">{stage.label}</span>
                  <span className="text-slate-400 text-[11px] hidden sm:inline">&bull; {stage.subtext}</span>
                </div>
                <span className="font-mono text-slate-900 font-extrabold text-sm">{stage.count}</span>
              </div>

              {/* Progress bar representing funnel tapering */}
              <div className="h-6 w-full bg-slate-100 rounded-lg overflow-hidden relative flex items-center">
                <div
                  className="h-full transition-all duration-500 rounded-lg flex items-center px-3"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: stage.color,
                  }}
                >
                  <span className="text-[10px] font-bold text-white font-mono drop-shadow">
                    {Math.round((stage.count / maxCount) * 100)}%
                  </span>
                </div>
              </div>

              {/* Drop-off telemetry indicator */}
              {stage.dropOff !== undefined && (
                <div className="flex items-center justify-end gap-1.5 text-[10px] text-rose-500 font-mono pt-0.5">
                  <span>&darr; -{stage.dropOff} lost</span>
                  <span className="text-slate-400">({stage.dropOffRate})</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
