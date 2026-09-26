"use client";

export interface DistrictCoverage {
  district: string;
  name: string;
  percentage: number;
  workshopsCount: number;
  avgResponseMins: number;
  status: "optimal" | "moderate" | "underserved";
}

const DEFAULT_DISTRICT_DATA: DistrictCoverage[] = [
  { district: "Central", name: "Daun Penh / Boeung Keng Kang", percentage: 94, workshopsCount: 8, avgResponseMins: 8.5, status: "optimal" },
  { district: "North", name: "Tuol Kork / Sen Sok", percentage: 88, workshopsCount: 6, avgResponseMins: 11.2, status: "optimal" },
  { district: "East", name: "Chroy Changvar / Russey Keo", percentage: 76, workshopsCount: 4, avgResponseMins: 14.8, status: "moderate" },
  { district: "South", name: "Chamkarmon / Meanchey", percentage: 71, workshopsCount: 3, avgResponseMins: 16.1, status: "moderate" },
  { district: "West", name: "Por Senchey (Airport Corridor)", percentage: 58, workshopsCount: 2, avgResponseMins: 19.4, status: "underserved" },
];

export default function PhnomPenhCoverage({
  data,
  overallCoverage: customCoverage,
  className = "",
}: {
  data?: DistrictCoverage[];
  overallCoverage?: number;
  className?: string;
}) {
  const districtList = data && data.length > 0 ? data : DEFAULT_DISTRICT_DATA;
  const overallCoverage =
    typeof customCoverage === "number"
      ? customCoverage
      : Math.round(districtList.reduce((acc, d) => acc + d.percentage, 0) / districtList.length);

  const lowestDistrict = districtList.reduce(
    (min, d) => (d.percentage < min.percentage ? d : min),
    districtList[0]
  );

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Phnom Penh Municipal Fleet Coverage
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Geographic dispatch radius and rescue unit density across city sectors
          </p>
        </div>

        <div className="text-right">
          <span className="text-xl font-extrabold text-slate-900 font-mono">{overallCoverage}%</span>
          <p className="text-[10px] text-slate-400 font-medium">active citywide coverage</p>
        </div>
      </div>

      {/* Main Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-mono font-bold text-slate-700">
          <span>Total Municipal Service Perimeter</span>
          <span>{overallCoverage}%</span>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
            style={{ width: `${overallCoverage}%` }}
          />
        </div>
      </div>

      {/* District Breakdowns */}
      <div className="space-y-3 pt-1">
        {districtList.map((item) => (
          <div key={item.district} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 w-16">{item.district}</span>
                <span className="text-slate-400 text-[11px] truncate max-w-[160px] sm:max-w-none">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-slate-500">{item.workshopsCount} shops</span>
                <span className={item.avgResponseMins <= 12 ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                  {item.avgResponseMins}m SLA
                </span>
                <span className="font-bold text-slate-900 w-8 text-right">{item.percentage}%</span>
              </div>
            </div>

            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  item.percentage >= 80 ? "bg-emerald-500" : item.percentage >= 65 ? "bg-blue-600" : "bg-amber-500"
                }`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Undercovered warning banner */}
      <div className="bg-amber-50 border border-amber-200/70 rounded-xl p-3 flex items-center justify-between text-xs">
        <span className="text-amber-900 font-medium">
          Priority Expansion: {lowestDistrict.district} ({lowestDistrict.name}) has only {lowestDistrict.workshopsCount} certified partner workshop{lowestDistrict.workshopsCount === 1 ? "" : "s"}.
        </span>
        <button
          onClick={() => { window.location.href = "/providers"; }}
          className="text-amber-800 font-bold hover:underline cursor-pointer"
        >
          Onboard Partners &rarr;
        </button>
      </div>
    </div>
  );
}
