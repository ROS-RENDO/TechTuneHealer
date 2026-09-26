"use client";

import { useState } from "react";

export interface HourlyUtilization {
  hour: string;
  utilization: number; // percentage 0 - 100
  occupiedBays: number; // e.g. 2, 3, 4
  totalBays: number; // 4
}

const DEFAULT_HOURLY: HourlyUtilization[] = [
  { hour: "08:00", utilization: 45, occupiedBays: 2, totalBays: 4 },
  { hour: "10:00", utilization: 62, occupiedBays: 2, totalBays: 4 },
  { hour: "12:00", utilization: 75, occupiedBays: 3, totalBays: 4 },
  { hour: "14:00", utilization: 91, occupiedBays: 4, totalBays: 4 },
  { hour: "16:00", utilization: 82, occupiedBays: 3, totalBays: 4 },
  { hour: "18:00", utilization: 50, occupiedBays: 2, totalBays: 4 },
];

export default function BayUtilizationChart({
  data,
  totalBays = 4,
  className = "",
}: {
  data?: HourlyUtilization[];
  totalBays?: number;
  className?: string;
}) {
  const [hoveredHour, setHoveredHour] = useState<HourlyUtilization | null>(null);

  const hourlyData = data && data.length > 0 ? data : DEFAULT_HOURLY;

  const avgUtilization = Math.round(
    hourlyData.reduce((acc, h) => acc + h.utilization, 0) / hourlyData.length
  );
  const peakHour = hourlyData.reduce(
    (max, h) => (h.utilization > max.utilization ? h : max),
    hourlyData[0]
  );

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Workshop Bay Utilization Rate
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Hourly vehicle lift occupancy across {totalBays} configured hydraulic bays
          </p>
        </div>

        <div className="text-right">
          <span className="text-xl font-extrabold text-slate-900 font-mono">{avgUtilization}%</span>
          <p className="text-[10px] text-slate-400 font-medium">today&apos;s avg utilization</p>
        </div>
      </div>

      {/* KPI highlight row */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 rounded-xl px-3.5 py-2 text-xs font-mono">
        <span className="text-slate-700 font-semibold">Today: {avgUtilization}% utilization</span>
        <span className="text-amber-700 font-bold">Peak: {peakHour.utilization}% at {peakHour.hour}</span>
      </div>

      {/* Bar Chart Visualization */}
      <div className="h-44 flex items-end gap-3 sm:gap-6 pt-6 pb-2 px-2 relative border-b border-slate-100 select-none">
        {/* Y Axis Guide Lines */}
        <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between pointer-events-none text-[9px] font-mono text-slate-300">
          <div className="border-b border-slate-100 flex justify-between pr-2">
            <span>100%</span>
          </div>
          <div className="border-b border-slate-100 flex justify-between pr-2">
            <span>75%</span>
          </div>
          <div className="border-b border-slate-100 flex justify-between pr-2">
            <span>50%</span>
          </div>
          <div className="border-b border-slate-100 flex justify-between pr-2">
            <span>25%</span>
          </div>
          <div className="flex justify-between pr-2">
            <span>0%</span>
          </div>
        </div>

        {/* Hourly Bars */}
        {hourlyData.map((item) => {
          const isPeak = item.hour === peakHour.hour;
          const isHovered = hoveredHour?.hour === item.hour;

          return (
            <div
              key={item.hour}
              className="flex-1 flex flex-col items-center gap-2 h-full justify-end relative z-10 cursor-pointer"
              onMouseEnter={() => setHoveredHour(item)}
              onMouseLeave={() => setHoveredHour(null)}
            >
              {/* Value Label above bar */}
              <span className={`text-[10px] font-mono font-bold ${isPeak ? "text-amber-600" : "text-slate-500"}`}>
                {item.utilization}%
              </span>

              {/* Bar Column */}
              <div className="w-full max-w-[42px] bg-slate-100 rounded-t-md overflow-hidden h-full flex items-end">
                <div
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    isPeak
                      ? "bg-amber-500"
                      : isHovered
                      ? "bg-blue-600"
                      : item.utilization >= 75
                      ? "bg-slate-800"
                      : "bg-slate-400"
                  }`}
                  style={{ height: `${item.utilization}%` }}
                />
              </div>

              {/* Hour Label */}
              <span className="text-[10px] font-mono text-slate-500">{item.hour}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
