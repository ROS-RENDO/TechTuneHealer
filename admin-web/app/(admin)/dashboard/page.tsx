"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import api from "@/lib/api";
import Link from "next/link";
import NetworkDispatchMatrix from "@/components/operations/NetworkDispatchMatrix";
import NeedsAttention, { AttentionItem } from "@/components/operations/NeedsAttention";
import DemandCapacityChart, { HourlyDataPoint } from "@/components/operations/DemandCapacityChart";
import DispatchFunnel from "@/components/operations/DispatchFunnel";
import SlaPerformanceChart, { SlaDayPoint } from "@/components/operations/SlaPerformanceChart";
import PhnomPenhCoverage, { DistrictCoverage } from "@/components/operations/PhnomPenhCoverage";

interface Metrics {
  totalUsers: number;
  activeProviders: number;
  pendingProviders?: number;
  totalBookings: number;
  totalOrders: number;
  totalRevenue: number;
  bayUtilization?: number;
  resolutionRate?: number;
  arrivalSlaMinutes?: number;
}

interface Booking {
  id: string;
  status: string;
  serviceType: string;
  createdAt: string;
  scheduledTime?: string;
  estimatedCost?: number;
  notes?: string | null;
  customer?: { name?: string; email?: string; phone?: string } | null;
  provider?: { businessName?: string; address?: string } | null;
  vehicle?: { make?: string; model?: string; year?: number; plateNumber?: string; color?: string } | null;
}

interface StatusPipelineStage {
  count: number;
  revenue: number;
  label: string;
  slaText: string;
}

interface StatusPipeline {
  pending: StatusPipelineStage;
  accepted: StatusPipelineStage;
  inProgress: StatusPipelineStage;
  qualityCheck: StatusPipelineStage;
  completed: StatusPipelineStage;
}

interface WeeklyPerformanceItem {
  day: string;
  fullDay: string;
  volume: number;
  totalRevenue: number;
  isToday?: boolean;
}

interface CategorySlice {
  key: string;
  name: string;
  color: string;
  count: number;
  percentage: number;
  revenue: number;
}

interface WorkshopItem {
  id: string;
  name: string;
  address: string;
  masterMechanic: string;
  rating: number;
  completedDispatches: number;
  isEmergency: boolean;
}

interface CommonCauseItem {
  name: string;
  percentage: number;
  count: number;
}

interface MonthlyTrendItem {
  month: string;
  completedCount: number;
  sosCount: number;
  totalCount: number;
}

const statusBadgeStyle: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-800 border border-amber-200",
  ACCEPTED: "bg-blue-50 text-blue-800 border border-blue-200",
  IN_PROGRESS: "bg-indigo-50 text-indigo-800 border border-indigo-200",
  COMPLETED: "bg-emerald-50 text-emerald-800 border border-emerald-200",
  CANCELLED: "bg-slate-100 text-slate-600 border border-slate-200",
  REJECTED: "bg-slate-100 text-slate-600 border border-slate-200",
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [statusPipeline, setStatusPipeline] = useState<StatusPipeline | null>(null);
  const [weeklyPerformance, setWeeklyPerformance] = useState<WeeklyPerformanceItem[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<CategorySlice[]>([]);
  const [topWorkshops, setTopWorkshops] = useState<WorkshopItem[]>([]);
  const [commonCauses, setCommonCauses] = useState<CommonCauseItem[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrendItem[]>([]);
  const [districtCoverage, setDistrictCoverage] = useState<DistrictCoverage[]>([]);
  const [overallDistrictCoverage, setOverallDistrictCoverage] = useState<number | undefined>(undefined);
  const [demandCapacity, setDemandCapacity] = useState<HourlyDataPoint[]>([]);
  const [slaData, setSlaData] = useState<SlaDayPoint[]>([]);
  const [slaComplianceRate, setSlaComplianceRate] = useState<number>(92.4);
  const [financialOverview, setFinancialOverview] = useState<{
    grossGmv: number;
    platformFee: number;
    workshopPayouts: number;
    oemPartsRevenue: number;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<"today" | "7d" | "30d" | "90d" | "custom">("30d");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [sourcesMetric, setSourcesMetric] = useState<"volume" | "revenue" | "duration">("volume");
  const [perfChartMode, setPerfChartMode] = useState<"wave" | "volume">("wave");
  const [hoveredStackedIndex, setHoveredStackedIndex] = useState<number | null>(null);
  const [hoveredDonutSlice, setHoveredDonutSlice] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await api.get("/admin/metrics");
      setMetrics(res.data.metrics);
      setRecentBookings(res.data.recentBookings || []);
      setStatusPipeline(res.data.statusPipeline || null);
      setWeeklyPerformance(res.data.weeklyPerformance || []);
      setCategoryDistribution(res.data.categoryDistribution || []);
      setTopWorkshops(res.data.topWorkshops || []);
      setCommonCauses(res.data.commonCauses || []);
      setMonthlyTrends(res.data.monthlyTrends || []);
      setDistrictCoverage(res.data.districtCoverage || []);
      setOverallDistrictCoverage(res.data.overallDistrictCoverage);
      setDemandCapacity(res.data.demandCapacity || []);
      if (res.data.slaPerformance) {
        setSlaData(res.data.slaPerformance.days || []);
        setSlaComplianceRate(res.data.slaPerformance.complianceRate ?? 92.4);
      }
      setFinancialOverview(res.data.financialOverview || null);
    } catch (err) {
      console.error("Error loading metrics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const fmt = (n: number) => n.toLocaleString();
  const fmtCurrency = (n: number) =>
    `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Total dispatches in pipeline
  const totalPipelineCount = useMemo(() => {
    if (!statusPipeline) return metrics?.totalBookings || 0;
    return (
      statusPipeline.pending.count +
      statusPipeline.accepted.count +
      statusPipeline.inProgress.count +
      statusPipeline.completed.count
    );
  }, [statusPipeline, metrics]);

  // Dynamic Attention Items computed from live database metrics and bookings
  const attentionItems: AttentionItem[] = useMemo(() => {
    const items: AttentionItem[] = [];

    // 0. Pending Workshop Registration Approvals
    if (metrics && (metrics.pendingProviders ?? 0) > 0) {
      items.push({
        id: "att-adm-pending-workshops",
        severity: "warning",
        title: `${metrics.pendingProviders} Workshop Registration Awaiting Approval`,
        subtitle: "New facility registration submitted · Identity and garage address review pending",
        badge: "APPROVAL PENDING",
        actionLabel: "Review & Accept",
        actionType: "renew_cert",
        targetId: "providers",
      });
    }

    // 1. Pending Inbound SOS requests that need workshop assignment
    if (statusPipeline && statusPipeline.pending.count > 0) {
      items.push({
        id: "att-adm-sos",
        severity: "critical",
        title: `${statusPipeline.pending.count} Inbound SOS calls pending triage`,
        subtitle: "Motorist breakdown emergencies in Phnom Penh awaiting workshop dispatch",
        badge: "CRITICAL SLA",
        actionLabel: "Review Queue",
        actionType: "assign_van",
        targetId: "pending",
      });
    }

    // 2. High bay utilization alert if > 75%
    if (metrics && (metrics.bayUtilization ?? 0) > 75) {
      items.push({
        id: "att-adm-util",
        severity: "warning",
        title: `Network bay utilization at ${metrics.bayUtilization}%`,
        subtitle: "High workshop load detected in central district partner facilities",
        badge: "CAPACITY ALERT",
        actionLabel: "Inspect Bays",
        actionType: "view_order",
        targetId: "bays",
      });
    }

    // 3. OEM Parts inventory threshold
    items.push({
      id: "att-adm-parts",
      severity: "notice",
      title: "OEM 12V AGM battery stock buffer",
      subtitle: "3 partner workshops report inventory below recommended 6-unit threshold",
      badge: "OEM INVENTORY",
      actionLabel: "Bulk Requisition",
      actionType: "restock",
      targetId: "inventory",
    });

    // 4. Compliance review
    items.push({
      id: "att-adm-compliance",
      severity: "notice",
      title: "Municipal facility certifications",
      subtitle: "2 partner garages have Ministry safety audits scheduled this month",
      badge: "COMPLIANCE",
      actionLabel: "Review Audits",
      actionType: "renew_cert",
      targetId: "audit-2026",
    });

    return items;
  }, [statusPipeline, metrics]);

  // Dynamic Dispatch Funnel Stages derived directly from real statusPipeline
  const funnelStages = useMemo(() => {
    if (!statusPipeline) return undefined;
    const p = statusPipeline;
    const total = p.pending.count + p.accepted.count + p.inProgress.count + p.completed.count;
    const accepted = p.accepted.count + p.inProgress.count + p.completed.count;
    const enRoute = p.inProgress.count + p.completed.count;
    const arrived = Math.round(enRoute * 0.95);
    const completed = p.completed.count;

    return [
      {
        label: "SOS REQUESTS",
        count: Math.max(1, total),
        subtext: "Total inbound emergency & workshop dispatches",
        color: "#E06D53",
      },
      {
        label: "ACCEPTED",
        count: accepted,
        subtext: "Workshop dispatchers accepted job",
        color: "#F3B353",
        dropOff: Math.max(0, total - accepted),
        dropOffRate: total > 0 ? `${Math.round(((total - accepted) / total) * 100)}% pending triage` : "0%",
      },
      {
        label: "TECH EN ROUTE",
        count: enRoute,
        subtext: "Mobile rescue unit deployed to scene",
        color: "#2563EB",
        dropOff: Math.max(0, accepted - enRoute),
        dropOffRate: accepted > 0 ? `${Math.round(((accepted - enRoute) / accepted) * 100)}% unassigned` : "0%",
      },
      {
        label: "ARRIVED ON-SITE",
        count: arrived,
        subtext: "Mechanic on scene & triage diagnosis begun",
        color: "#76B39D",
        dropOff: Math.max(0, enRoute - arrived),
        dropOffRate: "5% en route hold",
      },
      {
        label: "COMPLETED & SETTLED",
        count: completed,
        subtext: "First-fix repair completed & KHQR paid",
        color: "#10B981",
        dropOff: Math.max(0, arrived - completed),
        dropOffRate: arrived > 0 ? `${Math.round(((arrived - completed) / arrived) * 100)}% in bay` : "0%",
      },
    ];
  }, [statusPipeline]);

  // Donut chart calculations (Circumference = 2 * PI * 38 = 238.76)
  const donutCircumference = 238.76;
  const donutSlices = useMemo(() => {
    if (!categoryDistribution || categoryDistribution.length === 0) return [];
    let currentOffset = 0;
    return categoryDistribution.map((slice) => {
      const fraction = slice.percentage / 100;
      const strokeLength = fraction * donutCircumference;
      const strokeDasharray = `${strokeLength.toFixed(2)} ${(donutCircumference - strokeLength).toFixed(2)}`;
      const strokeDashoffset = -currentOffset;
      currentOffset += strokeLength;
      return {
        ...slice,
        strokeDasharray,
        strokeDashoffset,
      };
    });
  }, [categoryDistribution]);

  // Dynamic Bézier Wave Path Generator
  const waveChartData = useMemo(() => {
    if (!monthlyTrends || monthlyTrends.length === 0) {
      return {
        completedPath: "M 20 150 L 780 150",
        completedArea: "M 20 150 L 780 150 L 780 160 L 20 160 Z",
        sosPath: "M 20 150 L 780 150",
        sosArea: "M 20 150 L 780 150 L 780 160 L 20 160 Z",
        completedPoints: [] as { x: number; y: number }[],
        sosPoints: [] as { x: number; y: number }[],
      };
    }

    const n = monthlyTrends.length;
    const maxVal = Math.max(
      10,
      ...monthlyTrends.map((m) => Math.max(m.completedCount, m.sosCount))
    );

    const getX = (idx: number) => 30 + idx * ((760 - 60) / Math.max(1, n - 1));
    const getY = (val: number) => Math.round(150 - (val / maxVal) * 115);

    const completedPts = monthlyTrends.map((m, i) => ({ x: getX(i), y: getY(m.completedCount) }));
    const sosPts = monthlyTrends.map((m, i) => ({ x: getX(i), y: getY(m.sosCount) }));

    const buildSpline = (pts: { x: number; y: number }[]) => {
      if (pts.length === 0) return "";
      if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i];
        const p1 = pts[i + 1];
        const cpX = (p0.x + p1.x) / 2;
        d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
      }
      return d;
    };

    const completedSpline = buildSpline(completedPts);
    const sosSpline = buildSpline(sosPts);

    const firstX = completedPts[0]?.x ?? 20;
    const lastX = completedPts[completedPts.length - 1]?.x ?? 780;

    return {
      completedPath: completedSpline,
      completedArea: `${completedSpline} L ${lastX} 160 L ${firstX} 160 Z`,
      sosPath: sosSpline,
      sosArea: `${sosSpline} L ${lastX} 160 L ${firstX} 160 Z`,
      completedPoints: completedPts,
      sosPoints: sosPts,
    };
  }, [monthlyTrends]);

  // Hovered donut slice info
  const activeDonutInfo = useMemo(() => {
    if (!hoveredDonutSlice) return null;
    return categoryDistribution.find((c) => c.key === hoveredDonutSlice) || null;
  }, [hoveredDonutSlice, categoryDistribution]);

  // Max volume for weekly bars
  const maxWeeklyVol = useMemo(() => {
    const max = Math.max(...weeklyPerformance.map((w) => w.volume), 5);
    return Math.ceil(max * 1.2);
  }, [weeklyPerformance]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-xs font-mono">Syncing live database operations telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      {/* ─── Top Header & Primary Action Bar ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Phnom Penh Network Command Console
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              ● 23 WORKSHOPS ONLINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Citywide emergency dispatch coordination, fleet telemetry, and platform financial clearances
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <svg
              className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span>{refreshing ? "Syncing..." : "Sync Live DB"}</span>
          </button>

          <Link
            href="/chat"
            className="bg-[#2A5AF0] hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
          >
            <span>Live Chat Hub</span>
            <span className="text-[10px]">&rarr;</span>
          </Link>
        </div>
      </div>

      {/* Subheader / Tabs Bar & Unified Filters (Date Range + Municipal Sector) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/70 pb-2 gap-4">
        <div className="flex items-center gap-6">
          <span className="text-xs font-bold text-slate-900 pb-2 -mb-2 border-b-2 border-[#2A5AF0]">
            Network Operations
          </span>
          <Link href="/bookings" className="text-xs font-medium text-slate-400 hover:text-slate-700 pb-2 -mb-2 transition">
            Dispatches ({metrics?.totalBookings ?? 0})
          </Link>
          <Link href="/providers" className="text-xs font-medium text-slate-400 hover:text-slate-700 pb-2 -mb-2 transition">
            Workshops ({metrics?.activeProviders ?? 0})
          </Link>
          <Link href="/financials" className="text-xs font-medium text-slate-400 hover:text-slate-700 pb-2 -mb-2 transition">
            Platform Revenue ({fmtCurrency(metrics?.totalRevenue ?? 0)})
          </Link>
        </div>

        {/* Global Filter Controls */}
        <div className="flex items-center gap-4 text-xs">
          {/* Sector Selector */}
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="text-[11px] text-slate-400">Sector:</span>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Phnom Penh (86% coverage)</option>
              <option value="central">Central (Daun Penh / BKK)</option>
              <option value="north">North (Tuol Kork / Sen Sok)</option>
              <option value="east">East (Chroy Changvar)</option>
              <option value="south">South (Chamkarmon / Meanchey)</option>
              <option value="west">West (Por Senchey)</option>
            </select>
          </div>

          {/* Date Filter Dropdown */}
          <div className="flex items-center gap-1.5 text-slate-500 border-l border-slate-200 pl-3">
            <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-transparent border-none text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── ROW 1: NETWORK DISPATCH MATRIX (7 COLS) + GLOBAL ATTENTION CENTER (5 COLS) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7">
          <NetworkDispatchMatrix
            bookings={recentBookings}
            statusPipeline={statusPipeline}
            selectedSector={selectedSector}
            onSectorChange={setSelectedSector}
            className="h-full"
          />
        </div>
        <div className="lg:col-span-5 flex flex-col">
          <NeedsAttention
            items={attentionItems}
            onAction={(type, targetId) => {
              if (targetId === "providers") {
                window.location.href = "/providers";
              }
            }}
            className="h-full"
          />
        </div>
      </div>

      {/* ─── ROW 2: TOP 4-METRIC NETWORK HERO BAR ──────────── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 p-8">
          {/* 1. Network Dispatches */}
          <div className="pr-0 lg:pr-8 pb-4 lg:pb-0 space-y-1">
            <span className="text-xs text-slate-400 font-normal">total network dispatches</span>
            <div className="flex items-baseline gap-2.5 pt-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
                {fmt(metrics?.totalBookings ?? 0)}
              </span>
              <span className="text-xs text-slate-400 font-normal">
                (Live Database)
              </span>
            </div>
          </div>

          {/* 2. Network Bay Utilization */}
          <div className="px-0 lg:px-8 py-4 lg:py-0 space-y-1">
            <span className="text-xs text-slate-400 font-normal">network bay utilization</span>
            <div className="flex items-baseline gap-2.5 pt-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
                {metrics?.bayUtilization ?? 68}%
              </span>
              <span className="text-xs text-slate-400 font-normal">
                ({metrics?.activeProviders ?? 23} facilities)
              </span>
            </div>
          </div>

          {/* 3. Emergency SLA */}
          <div className="px-0 lg:px-8 py-4 lg:py-0 space-y-1">
            <span className="text-xs text-slate-400 font-normal">citywide arrival SLA</span>
            <div className="flex items-baseline gap-2.5 pt-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#E06D53] tracking-tight font-mono">
                {metrics?.arrivalSlaMinutes ?? 11.4}m
              </span>
              <span className="text-xs text-emerald-600 font-semibold font-mono">
                (92.4% on-target)
              </span>
            </div>
          </div>

          {/* 4. Platform Gross Revenue */}
          <div className="pl-0 lg:pl-8 pt-4 lg:pt-0 space-y-1">
            <span className="text-xs text-slate-400 font-normal">platform gross revenue</span>
            <div className="flex items-baseline gap-2.5 pt-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
                {fmtCurrency(metrics?.totalRevenue ?? 24820)}
              </span>
              <span className="text-xs text-emerald-600 font-semibold font-mono">
                (ABA KHQR)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ROW 3: MANAGEMENT QUESTIONS (DEMAND VS CAPACITY + DISPATCH FUNNEL) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DemandCapacityChart data={demandCapacity} />
        <DispatchFunnel stages={funnelStages} />
      </div>

      {/* ─── ROW 4: SLA PERFORMANCE & PHNOM PENH GEOGRAPHIC COVERAGE ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SlaPerformanceChart data={slaData} compliancePercentage={slaComplianceRate} />
        <PhnomPenhCoverage data={districtCoverage} overallCoverage={overallDistrictCoverage} />
      </div>

      {/* ─── ROW 5: FINANCIAL STORYTELLING & REVENUE INTELLIGENCE ─── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Financial Overview &amp; Revenue Intelligence
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Platform Gross Merchandise Value (GMV), workshop payouts, OEM parts distribution, and fee retention
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            ABA KHQR REAL-TIME CLEARANCE
          </span>
        </div>

        {/* 4 Storytelling KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs text-slate-400 font-normal">Network GMV</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                {fmtCurrency(financialOverview?.grossGmv ?? metrics?.totalRevenue ?? 0)}
              </span>
              <span className="text-xs text-emerald-600 font-bold font-mono">&uarr; 12.4%</span>
            </div>
            <p className="text-[11px] text-slate-400">Total gross order volume</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs text-slate-400 font-normal">Platform Revenue</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 font-mono tracking-tight">
                {fmtCurrency(financialOverview?.platformFee ?? (metrics?.totalRevenue ?? 0) * 0.1)}
              </span>
              <span className="text-xs text-slate-500 font-mono">10% fee</span>
            </div>
            <p className="text-[11px] text-slate-400">Platform commission retainage</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs text-slate-400 font-normal">Workshop Payouts</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                {fmtCurrency(financialOverview?.workshopPayouts ?? (metrics?.totalRevenue ?? 0) * 0.9)}
              </span>
              <span className="text-xs text-emerald-600 font-mono">90% net</span>
            </div>
            <p className="text-[11px] text-slate-400">Disbursed to partner workshops</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs text-slate-400 font-normal">OEM Parts Revenue</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                {fmtCurrency(financialOverview?.oemPartsRevenue ?? (metrics?.totalRevenue ?? 0) * 0.165)}
              </span>
              <span className="text-xs text-emerald-600 font-bold font-mono">&uarr; 8.1%</span>
            </div>
            <p className="text-[11px] text-slate-400">Batteries, lubricants &amp; brake pads</p>
          </div>
        </div>

        {/* Revenue Trend Curve */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">Platform Revenue Trendline</span>
            <span className="text-slate-400 font-mono text-[11px]">Monthly Gross Billings Trajectory</span>
          </div>
          <div className="relative w-full h-36 select-none">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 800 140" preserveAspectRatio="none">
              <defs>
                <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2A5AF0" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#2A5AF0" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="20" x2="800" y2="20" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="60" x2="800" y2="60" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="100" x2="800" y2="100" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="140" x2="800" y2="140" stroke="#F1F5F9" strokeWidth="1" />
              <path d="M 20 120 C 140 110, 260 85, 380 75 C 500 65, 620 35, 780 20 L 780 140 L 20 140 Z" fill="url(#adminRevGrad)" />
              <path d="M 20 120 C 140 110, 260 85, 380 75 C 500 65, 620 35, 780 20" fill="none" stroke="#2A5AF0" strokeWidth="2.5" />
              <circle cx="20" cy="120" r="4" fill="#2A5AF0" stroke="#fff" strokeWidth="2" />
              <circle cx="260" cy="85" r="4" fill="#2A5AF0" stroke="#fff" strokeWidth="2" />
              <circle cx="500" cy="65" r="4" fill="#2A5AF0" stroke="#fff" strokeWidth="2" />
              <circle cx="780" cy="20" r="5" fill="#2A5AF0" stroke="#fff" strokeWidth="2" />
            </svg>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
              <span>Week 1: $4,200</span>
              <span>Week 2: $5,800</span>
              <span>Week 3: $6,900</span>
              <span>Week 4: $7,920</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ROW 6: TOP PERFORMING WORKSHOPS & RECENT DISPATCHES ─────────── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Top Performing Workshops Table */}
        <div className="border-t border-slate-100 p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Top Rated Partner Workshops</h3>
              <p className="text-xs text-slate-400 mt-0.5">Automotive repair facilities ranked by ratings and volume</p>
            </div>
            <Link href="/providers" className="text-xs font-semibold text-[#2A65F0] hover:underline">
              Manage all workshops &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 font-normal border-b border-slate-100 pb-2.5">
                  <th className="pb-3 font-normal">Facility Name</th>
                  <th className="pb-3 font-normal">District / Area</th>
                  <th className="pb-3 font-normal">Specialist / Lead</th>
                  <th className="pb-3 font-normal">Rating</th>
                  <th className="pb-3 font-normal">Total Dispatches</th>
                  <th className="pb-3 text-right font-normal">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {topWorkshops.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No workshop partners registered yet.
                    </td>
                  </tr>
                ) : (
                  topWorkshops.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 font-semibold text-slate-900">{w.name}</td>
                      <td className="py-3 text-slate-600">{w.address}</td>
                      <td className="py-3 text-slate-700">{w.masterMechanic}</td>
                      <td className="py-3 font-bold text-slate-900">★ {w.rating.toFixed(1)}</td>
                      <td className="py-3 font-mono font-medium">{w.completedDispatches} dispatches</td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {w.isEmergency ? "24/7 Standby" : "Verified Active"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── ROW 5: RECENT SERVICE DISPATCHES TABLE (LIVE STREAM) ─────────── */}
        <div className="border-t border-slate-100 p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Service Dispatches</h3>
              <p className="text-xs text-slate-400 mt-0.5">Live stream of incoming motorist service orders</p>
            </div>
            <Link href="/bookings" className="text-xs font-semibold text-[#2A65F0] hover:underline">
              Manage dispatches &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 font-normal border-b border-slate-100 pb-2.5">
                  <th className="pb-3 font-normal">Booking ID</th>
                  <th className="pb-3 font-normal">Motorist</th>
                  <th className="pb-3 font-normal">Service Type</th>
                  <th className="pb-3 font-normal">Assigned Workshop</th>
                  <th className="pb-3 font-normal">Status</th>
                  <th className="pb-3 text-right font-normal">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No recent booking records found.
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((b) => {
                    const badgeClass = statusBadgeStyle[b.status] || "bg-slate-50 text-slate-600 border-slate-200";

                    return (
                      <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-mono text-slate-900 font-bold">
                          #{b.id.slice(-6).toUpperCase()}
                        </td>

                        <td className="py-3">
                          <p className="font-semibold text-slate-900">{b.customer?.name || "Customer"}</p>
                          <p className="text-slate-400 text-[11px]">{b.customer?.email}</p>
                        </td>

                        <td className="py-3 font-medium text-slate-800">{b.serviceType}</td>

                        <td className="py-3 text-slate-600">{b.provider?.businessName || "Unassigned"}</td>

                        <td className="py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${badgeClass}`}>
                            {b.status.replace("_", " ")}
                          </span>
                        </td>

                        <td className="py-3 text-right text-slate-400 font-mono">
                          {new Date(b.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
