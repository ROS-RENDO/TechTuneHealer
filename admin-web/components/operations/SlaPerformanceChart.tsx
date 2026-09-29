"use client";

import { useState } from "react";

export interface SlaDayPoint {
  day: string;
  fullDay: string;
  actualSla: number; // minutes
  targetSla: number; // 15 minutes
  withinTarget: boolean;
}

const DEFAULT_SLA_DATA: SlaDayPoint[] = [
  { day: "Mon", fullDay: "Monday", actualSla: 10.8, targetSla: 15, withinTarget: true },
  { day: "Tue", fullDay: "Tuesday", actualSla: 11.4, targetSla: 15, withinTarget: true },
  { day: "Wed", fullDay: "Wednesday", actualSla: 14.2, targetSla: 15, withinTarget: true },
  { day: "Thu", fullDay: "Thursday", actualSla: 11.1, targetSla: 15, withinTarget: true },
  { day: "Fri", fullDay: "Friday", actualSla: 12.8, targetSla: 15, withinTarget: true },
  { day: "Sat", fullDay: "Saturday", actualSla: 16.5, targetSla: 15, withinTarget: false },
  { day: "Sun", fullDay: "Sunday", actualSla: 9.8, targetSla: 15, withinTarget: true },
];

export default function SlaPerformanceChart({
  data,
  compliancePercentage: customCompliance,
  targetMinutes = 15,
  className = "",
}: {
  data?: SlaDayPoint[];
  compliancePercentage?: number;
  targetMinutes?: number;
  className?: string;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const chartData = data && data.length > 0 ? data : DEFAULT_SLA_DATA;
  const compliantCount = chartData.filter((d) => d.withinTarget).length;
  const compliancePercentage =
    typeof customCompliance === "number"
      ? customCompliance
      : Math.round((compliantCount / Math.max(1, chartData.length)) * 1000) / 10;
  const avgSla =
    Math.round(
      (chartData.reduce((acc, d) => acc + d.actualSla, 0) / Math.max(1, chartData.length)) * 10
    ) / 10;
  const aheadMins = Math.round((targetMinutes - avgSla) * 10) / 10;

  const width = 500;
  const height = 180;
  const paddingX = 35;
  const paddingY = 25;
  const maxMins = 20;

  const getX = (idx: number) => paddingX + (idx / Math.max(1, chartData.length - 1)) * (width - 2 * paddingX);
  const getY = (val: number) => height - paddingY - (val / maxMins) * (height - 2 * paddingY);

  const targetY = getY(targetMinutes);

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Arrival SLA Compliance Performance
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Target SLA: <span className="font-semibold text-slate-700">{targetMinutes}m max dispatch response</span>
          </p>
        </div>

        <div className="text-right">
          <span className="text-xl font-extrabold text-emerald-600 font-mono">{compliancePercentage}%</span>
          <p className="text-[10px] text-slate-400 font-medium">within {targetMinutes}m target</p>
        </div>
      </div>

      {/* SLA Metric Bar */}
      <div className="flex items-center justify-between bg-emerald-50/60 border border-emerald-200/80 rounded-xl px-3.5 py-2 text-xs">
        <span className="text-emerald-900 font-medium">
          Citywide Average Response: <strong className="font-mono text-emerald-800">{avgSla} min</strong>
        </span>
        <span className="text-emerald-700 font-mono text-[11px]">
          {aheadMins >= 0 ? `-${aheadMins}m ahead of SLA benchmark` : `+${Math.abs(aheadMins)}m over benchmark`}
        </span>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full h-44 select-none">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Target 15m Baseline Line */}
          <line
            x1={paddingX}
            y1={targetY}
            x2={width - paddingX}
            y2={targetY}
            stroke="#EF4444"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text
            x={width - paddingX + 5}
            y={targetY + 3.5}
            fill="#EF4444"
            fontSize="9"
            fontFamily="monospace"
            fontWeight="bold"
          >
            15m Target
          </text>

          {/* Grid lines */}
          {[5, 10, 15, 20].map((m) => {
            const y = getY(m);
            return (
              <g key={m}>
                <text x={paddingX - 8} y={y + 3.5} textAnchor="end" fill="#94A3B8" fontSize="9" fontFamily="monospace">
                  {m}m
                </text>
              </g>
            );
          })}

          {/* Connecting line between actual daily points */}
          <path
            d={(() => {
              const pts = chartData.map((d, i) => ({ x: getX(i), y: getY(d.actualSla) }));
              if (pts.length < 2) return "";
              let str = `M ${pts[0].x} ${pts[0].y}`;
              for (let i = 0; i < pts.length - 1; i++) {
                const cpX = (pts[i].x + pts[i + 1].x) / 2;
                str += ` C ${cpX} ${pts[i].y}, ${cpX} ${pts[i + 1].y}, ${pts[i + 1].x} ${pts[i + 1].y}`;
              }
              return str;
            })()}
            fill="none"
            stroke="#10B981"
            strokeWidth="2.5"
          />

          {/* Daily SLA Points */}
          {chartData.map((d, i) => {
            const x = getX(i);
            const y = getY(d.actualSla);
            const isHovered = hoveredIdx === i;

            return (
              <g key={d.day}>
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4.5}
                  fill={d.withinTarget ? "#10B981" : "#EF4444"}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="cursor-pointer transition-all"
                />
                <text
                  x={x}
                  y={height - paddingY + 16}
                  textAnchor="middle"
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {d.day}
                </text>

                {/* Hover rect */}
                <rect
                  x={x - 20}
                  y={paddingY}
                  width="40"
                  height={height - 2 * paddingY}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIdx !== null && (
          <div
            className="absolute top-1 z-10 bg-slate-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none transition-all font-mono"
            style={{
              left: `${(getX(hoveredIdx) / width) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="font-bold border-b border-slate-700 pb-0.5 mb-1">
              {chartData[hoveredIdx].fullDay}
            </div>
            <div className={chartData[hoveredIdx].withinTarget ? "text-emerald-400" : "text-rose-400"}>
              Actual SLA: {chartData[hoveredIdx].actualSla} min
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
