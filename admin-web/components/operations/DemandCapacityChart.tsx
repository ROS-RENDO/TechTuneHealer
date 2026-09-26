"use client";

import { useState } from "react";

export interface HourlyDataPoint {
  hour: string;
  demand: number; // SOS incoming dispatches
  capacity: number; // Available active bay + mobile van capacity
}

const DEFAULT_DATA: HourlyDataPoint[] = [
  { hour: "08:00", demand: 12, capacity: 28 },
  { hour: "10:00", demand: 26, capacity: 32 },
  { hour: "12:00", demand: 42, capacity: 34 },
  { hour: "14:00", demand: 38, capacity: 36 },
  { hour: "16:00", demand: 29, capacity: 36 },
  { hour: "18:00", demand: 18, capacity: 30 },
  { hour: "20:00", demand: 11, capacity: 22 },
];

export default function DemandCapacityChart({
  data,
  className = "",
}: {
  data?: HourlyDataPoint[];
  className?: string;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const chartData = data && data.length > 0 ? data : DEFAULT_DATA;

  // SVG dimensions
  const width = 600;
  const height = 200;
  const paddingX = 40;
  const paddingY = 30;
  const maxVal = Math.max(45, ...chartData.map((d) => Math.max(d.demand, d.capacity) + 5));

  const totalDemand = chartData.reduce((s, d) => s + d.demand, 0);
  const totalCapacity = Math.max(1, chartData.reduce((s, d) => s + d.capacity, 0));
  const utilizationRatio = Math.round((totalDemand / totalCapacity) * 100);

  const peakSlot = chartData.reduce(
    (max, d) => (d.demand > max.demand ? d : max),
    chartData[0]
  );

  const getX = (idx: number) => paddingX + (idx / Math.max(1, chartData.length - 1)) * (width - 2 * paddingX);
  const getY = (val: number) => height - paddingY - (val / maxVal) * (height - 2 * paddingY);

  const demandPts = chartData.map((d, i) => ({ x: getX(i), y: getY(d.demand) }));
  const capacityPts = chartData.map((d, i) => ({ x: getX(i), y: getY(d.capacity) }));

  const buildPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const demandLine = buildPath(demandPts);
  const capacityLine = buildPath(capacityPts);

  const demandArea = `${demandLine} L ${demandPts[demandPts.length - 1].x} ${height - paddingY} L ${demandPts[0].x} ${height - paddingY} Z`;
  const capacityArea = `${capacityLine} L ${capacityPts[capacityPts.length - 1].x} ${height - paddingY} L ${capacityPts[0].x} ${height - paddingY} Z`;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Demand vs. Capacity Balance
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Management question: <strong className="text-slate-700 font-semibold">Are we receiving more work than the network can handle?</strong>
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-rose-500" />
            <span className="text-slate-600">Dispatch Demand</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-blue-600" />
            <span className="text-slate-600">Available Capacity</span>
          </div>
        </div>
      </div>

      {/* Answer Callout Banner */}
      <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1.5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${utilizationRatio > 85 ? "bg-amber-500" : "bg-emerald-500"}`} />
          <span className="text-slate-700 font-medium">
            {utilizationRatio > 85
              ? `Elevated Network Load: Current demand is at ${utilizationRatio}% of total workshop capacity.`
              : `Network Resilient: Current demand operates comfortably within ${utilizationRatio}% of citywide capacity.`}
          </span>
        </div>
        <span className="font-mono text-slate-500 text-[11px]">
          Peak slot: {peakSlot.hour} ({peakSlot.demand} demand vs {peakSlot.capacity} capacity)
        </span>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full h-48 select-none">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="capacityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 15, 30, 45].map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#F1F5F9" strokeWidth="1" />
                <text x={paddingX - 10} y={y + 4} textAnchor="end" fill="#94A3B8" fontSize="10" fontFamily="monospace">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Capacity Area & Line */}
          <path d={capacityArea} fill="url(#capacityGrad)" />
          <path d={capacityLine} fill="none" stroke="#2563EB" strokeWidth="2.5" />

          {/* Demand Area & Line */}
          <path d={demandArea} fill="url(#demandGrad)" />
          <path d={demandLine} fill="none" stroke="#F43F5E" strokeWidth="2.5" />

          {/* Points & Interactive Tooltips */}
          {chartData.map((d, i) => {
            const x = getX(i);
            const yD = getY(d.demand);
            const yC = getY(d.capacity);
            const isHovered = hoveredIdx === i;

            return (
              <g key={d.hour}>
                {/* Vertical time marker */}
                <line
                  x1={x}
                  y1={paddingY}
                  x2={x}
                  y2={height - paddingY}
                  stroke={isHovered ? "#94A3B8" : "transparent"}
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                {/* Demand Dot */}
                <circle
                  cx={x}
                  cy={yD}
                  r={isHovered ? 6 : 4}
                  fill="#F43F5E"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="cursor-pointer transition-all"
                />
                {/* Capacity Dot */}
                <circle
                  cx={x}
                  cy={yC}
                  r={isHovered ? 6 : 4}
                  fill="#2563EB"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="cursor-pointer transition-all"
                />
                {/* X Axis Label */}
                <text
                  x={x}
                  y={height - paddingY + 16}
                  textAnchor="middle"
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {d.hour}
                </text>

                {/* Invisible hover bar */}
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

        {/* Dynamic Tooltip on Hover */}
        {hoveredIdx !== null && (
          <div
            className="absolute top-2 z-10 bg-slate-900 text-white text-[11px] px-3 py-1.5 rounded-lg shadow-xl pointer-events-none transition-all"
            style={{
              left: `${(getX(hoveredIdx) / width) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="font-bold border-b border-slate-700 pb-1 mb-1 font-mono">
              {chartData[hoveredIdx].hour} Telemetry
            </div>
            <div className="flex justify-between gap-4 text-rose-300">
              <span>Demand:</span>
              <span className="font-bold">{chartData[hoveredIdx].demand} jobs</span>
            </div>
            <div className="flex justify-between gap-4 text-blue-300">
              <span>Capacity:</span>
              <span className="font-bold">{chartData[hoveredIdx].capacity} bays/vans</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
