"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProviderDispatchTerminal from "@/components/operations/ProviderDispatchTerminal";
import NeedsAttention from "@/components/operations/NeedsAttention";
import SlaPerformanceChart from "@/components/operations/SlaPerformanceChart";
import BayUtilizationChart from "@/components/operations/BayUtilizationChart";
import LiveActivityFeed from "@/components/operations/LiveActivityFeed";

interface Booking {
  id: string;
  serviceType: string;
  status: string;
  createdAt: string;
  scheduledDate?: string;
  scheduledTime?: string;
  estimatedCost?: number;
  estimatedPrice?: number;
  notes?: string;
  customer?: { name: string; email?: string; phone?: string };
  customerName?: string;
  customerPhone?: string;
  customerLocation?: { address?: string; latitude?: number; longitude?: number };
  vehicle?: { make?: string; model?: string; year?: number; plateNumber?: string; color?: string };
  isEmergency?: boolean;
}

interface ProviderUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
}

interface ReviewItem {
  id: string;
  customerName: string;
  vehicleTag: string;
  rating: number;
  date: string;
  service: string;
  comment: string;
  reply?: { text: string; repliedAt?: string };
}

interface DaySchedule {
  day: string;
  shortDay: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface ServiceBay {
  id: number;
  name: string;
  type: string;
  status: "occupied" | "vacant" | "maintenance";
  currentVehicle?: string;
  service?: string;
  technician?: string;
  plate?: string;
  timeInBay?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

const DEFAULT_WEEKLY_SCHEDULE: DaySchedule[] = [
  { day: "Monday", shortDay: "Mon", isOpen: true, openTime: "08:00 AM", closeTime: "06:00 PM" },
  { day: "Tuesday", shortDay: "Tue", isOpen: true, openTime: "08:00 AM", closeTime: "06:00 PM" },
  { day: "Wednesday", shortDay: "Wed", isOpen: true, openTime: "08:00 AM", closeTime: "06:00 PM" },
  { day: "Thursday", shortDay: "Thu", isOpen: true, openTime: "08:00 AM", closeTime: "06:00 PM" },
  { day: "Friday", shortDay: "Fri", isOpen: true, openTime: "08:00 AM", closeTime: "06:00 PM" },
  { day: "Saturday", shortDay: "Sat", isOpen: true, openTime: "08:00 AM", closeTime: "04:00 PM" },
  { day: "Sunday", shortDay: "Sun", isOpen: false, openTime: "09:00 AM", closeTime: "02:00 PM" },
];

const BAY_CONFIGS = [
  { id: 1, name: "Lift A (2-Post)", type: "Rotary Hydraulic 4.5T Lift" },
  { id: 2, name: "Lift B (4-Post)", type: "BendPak Alignment Rack" },
  { id: 3, name: "Lift C (Scissor)", type: "In-Ground Flush Scissor Lift" },
  { id: 4, name: "Bay D (Diagnostic)", type: "OBD Telemetry & Prep Bay" },
];

export default function ProviderDashboardPage() {
  const router = useRouter();

  // Navigation state
  const [activeView, setActiveView] = useState<"overview" | "dispatches" | "bays" | "services" | "settlements" | "reviews" | "settings">("overview");
  const [timeRange, setTimeRange] = useState<"today" | "7d" | "30d">("7d");
  const [categoryMetric, setCategoryMetric] = useState<"volume" | "revenue" | "duration">("volume");
  const [dossierTab, setDossierTab] = useState<"specs" | "chat">("specs");
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);

  // Visual Chart Controls (Clean Minimalist: Wave Spline & Slim Volume)
  const [hoveredDonutSlice, setHoveredDonutSlice] = useState<string | null>(null);
  const [perfChartMode, setPerfChartMode] = useState<"wave" | "volume">("wave");
  const [hoveredStackedIndex, setHoveredStackedIndex] = useState<number | null>(null);

  // Authentication & Facility Profile
  const [, setProviderUser] = useState<ProviderUser | null>(null);
  const [workshopProfile, setWorkshopProfile] = useState({
    businessName: "Speedy Auto Fix Workstation",
    address: "Street 271, Sangkat Olympic, Khan Boeng Keng Kang, Phnom Penh",
    phone: "+855 12 889 900",
    description: "Premier certified automotive diagnostic and emergency repair facility with 4 hydraulic service bays.",
  });
  const [isEmergencyActive, setIsEmergencyActive] = useState(true);
  const [isVerified, setIsVerified] = useState(true);
  const [approvalStatus, setApprovalStatus] = useState<string>("APPROVED");

  // Bookings & Work Orders
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [dispatchSearch, setDispatchSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [assignedBays, setAssignedBays] = useState<Record<string, number>>({});

  // Real-time Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Bays, Services, Settlements, Reviews
  const [bayOverrides, setBayOverrides] = useState<Record<number, { status?: "occupied" | "vacant"; currentVehicle?: string; service?: string; plate?: string; technician?: string }>>({});
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [serviceForm, setServiceForm] = useState({ name: "", category: "Maintenance", price: "", durationMinutes: "45", description: "" });

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [replyModalReview, setReplyModalReview] = useState<ReviewItem | null>(null);
  const [replyInput, setReplyInput] = useState("");

  const [schedule] = useState<DaySchedule[]>(DEFAULT_WEEKLY_SCHEDULE);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutForm, setPayoutForm] = useState({ amount: "450.00", accountNumber: "001 892 411", accountName: "SPEEDY AUTO FIX CO LTD" });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch all Provider Data
  const fetchProviderData = useCallback(async (token: string) => {
    setSyncing(true);
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/+$/, "");

      const resBookings = await fetch(`${baseUrl}/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resBookings.ok) {
        const data = await resBookings.json();
        const list: Booking[] = Array.isArray(data) ? data : data.bookings || [];
        setBookings(list);
        if (list.length > 0 && !selectedBookingId) {
          setSelectedBookingId(list[0].id);
        }
      }

      const resMe = await fetch(`${baseUrl}/providers/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resMe.ok) {
        const meData = await resMe.json();
        if (meData.businessName) {
          setWorkshopProfile((prev) => ({
            ...prev,
            businessName: meData.businessName,
            address: meData.address || meData.location?.address || prev.address,
            description: meData.description || prev.description,
            phone: meData.phone || prev.phone,
          }));
        }
        if (typeof meData.isEmergency === "boolean") {
          setIsEmergencyActive(meData.isEmergency);
        }
        if (typeof meData.isVerified === "boolean") {
          setIsVerified(meData.isVerified);
        }
        if (meData.approvalStatus) {
          setApprovalStatus(meData.approvalStatus);
        }
        if (Array.isArray(meData.services)) {
          const mapped: ServiceItem[] = meData.services.map((s: any) => ({
            id: s.id,
            name: s.name,
            category: "Maintenance",
            description: s.description || "Certified automotive service.",
            price: Number(s.price) || 25,
            durationMinutes: 45,
            isActive: true,
          }));
          setServices(mapped);
        }
      }

      const resReviews = await fetch(`${baseUrl}/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resReviews.ok) {
        const reviewsData = await resReviews.json();
        if (Array.isArray(reviewsData)) {
          const mappedReviews: ReviewItem[] = reviewsData.map((r: any) => ({
            id: r.id,
            customerName: r.customer?.name || "Verified Motorist",
            vehicleTag: r.booking?.vehicle
              ? `${r.booking.vehicle.make} ${r.booking.vehicle.model}`
              : "Registered Vehicle",
            rating: Number(r.rating) || 5,
            date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Recent",
            service: r.booking?.serviceType || "Emergency Roadside Assistance",
            comment: r.comment || "Service completed satisfactorily.",
            reply: r.reply ? { text: r.reply, repliedAt: "Recent" } : undefined,
          }));
          setReviews(mappedReviews);
        }
      }
    } catch (e) {
      console.error("Error loading provider console data:", e);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [selectedBookingId]);

  useEffect(() => {
    let token = localStorage.getItem("provider_token");
    let userStr = localStorage.getItem("provider_user");

    const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const isDemo = searchParams?.get("demo") === "true";

    if ((!token || !userStr) && isDemo) {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/+$/, "");
      fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "sokha@test.com", password: "password123" }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.token && data.user) {
            localStorage.setItem("provider_token", data.token);
            localStorage.setItem("provider_user", JSON.stringify(data.user));
            setProviderUser(data.user);
            fetchProviderData(data.token);
          }
        })
        .catch(() => {});
      return;
    }

    if (!token || !userStr) {
      router.push("/provider/login");
      return;
    }

    try {
      const u = JSON.parse(userStr);
      setProviderUser(u);
      fetchProviderData(token);
    } catch {
      router.push("/provider/login");
    }
  }, [router, fetchProviderData]);

  // Fetch Chat Messages
  const fetchChatMessages = useCallback(async (bookingId: string) => {
    const token = localStorage.getItem("provider_token");
    if (!token || !bookingId) return;

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/+$/, "");
      const res = await fetch(`${baseUrl}/chat/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const msgs = await res.json();
        setChatMessages(msgs);
        setTimeout(() => chatScrollRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (selectedBookingId) {
      fetchChatMessages(selectedBookingId);
      const interval = setInterval(() => {
        fetchChatMessages(selectedBookingId);
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [selectedBookingId, fetchChatMessages]);

  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !selectedBookingId || isSendingChat) return;

    const textToSend = chatInput.trim();
    setChatInput("");
    setIsSendingChat(true);

    const token = localStorage.getItem("provider_token");
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/+$/, "");

    try {
      const res = await fetch(`${baseUrl}/chat/${selectedBookingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          text: textToSend,
          senderName: workshopProfile.businessName || "Speedy Auto Fix",
          senderRole: "provider",
        }),
      });

      if (res.ok) {
        const newMsg = await res.json();
        setChatMessages((prev) => [...prev, newMsg]);
        setTimeout(() => chatScrollRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }
    } catch {
      setChatInput(textToSend);
    } finally {
      setIsSendingChat(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    const token = localStorage.getItem("provider_token");
    if (!token) return;

    setActionLoadingId(bookingId);
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/+$/, "");
      const res = await fetch(`${baseUrl}/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)));
        showToast(`Work order #${bookingId.slice(-6).toUpperCase()} updated to ${newStatus.replace("_", " ")}`);
      }
    } catch (e) {
      console.error("Error updating status:", e);
      showToast("Failed to update status. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAssignBay = (bookingId: string, bayId: number) => {
    setAssignedBays((prev) => ({ ...prev, [bookingId]: bayId }));
    const b = bookings.find((item) => item.id === bookingId);
    if (b) {
      setBayOverrides((prev) => ({
        ...prev,
        [bayId]: {
          status: "occupied",
          currentVehicle: b.vehicle ? `${b.vehicle.make} ${b.vehicle.model}` : (b.customerName || "Customer Vehicle"),
          service: b.serviceType || "Inspection",
          plate: b.vehicle?.plateNumber || "PP Registered",
          technician: "Assigned Tech",
        },
      }));
    }
    showToast(`Assigned Order #${bookingId.slice(-6).toUpperCase()} to Lift 0${bayId}`);
  };

  const toggleEmergencyStandby = async () => {
    const token = localStorage.getItem("provider_token");
    if (!token) return;

    const nextVal = !isEmergencyActive;
    setIsEmergencyActive(nextVal);

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/+$/, "");
      await fetch(`${baseUrl}/providers/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isEmergency: nextVal }),
      });
      showToast(nextVal ? "24/7 Emergency Standby Active" : "Emergency Standby Paused");
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem("provider_token");
    localStorage.removeItem("provider_user");
    router.push("/provider/login");
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard`);
  };

  // Metrics
  const filteredDispatches = useMemo(() => {
    return bookings.filter((b) => {
      if (!dispatchSearch.trim()) return true;
      const q = dispatchSearch.toLowerCase();
      const customer = (b.customerName || b.customer?.name || "").toLowerCase();
      const vehicle = `${b.vehicle?.make || ""} ${b.vehicle?.model || ""} ${b.vehicle?.plateNumber || ""}`.toLowerCase();
      const srv = (b.serviceType || "").toLowerCase();
      const id = b.id.toLowerCase();
      return customer.includes(q) || vehicle.includes(q) || srv.includes(q) || id.includes(q);
    });
  }, [bookings, dispatchSearch]);

  const activeSelectedBooking = useMemo(() => {
    return bookings.find((b) => b.id === selectedBookingId) || bookings[0] || null;
  }, [bookings, selectedBookingId]);

  const pendingBookings = useMemo(() => bookings.filter((b) => b.status.toLowerCase() === "pending"), [bookings]);
  const activeBookings = useMemo(
    () => bookings.filter((b) => ["accepted", "in_progress", "in_bay"].includes(b.status.toLowerCase())),
    [bookings]
  );
  const completedBookings = useMemo(() => bookings.filter((b) => b.status.toLowerCase() === "completed"), [bookings]);

  const grossEarnings = useMemo(() => {
    return bookings
      .filter((b) => b.status.toLowerCase() === "completed")
      .reduce((sum, b) => sum + (Number(b.estimatedPrice ?? b.estimatedCost) || 35), 0);
  }, [bookings]);

  const platformFee = grossEarnings * 0.1;
  const netEarnings = grossEarnings * 0.9;
  const availableBalance = netEarnings;

  // Dynamic Attention Items computed from real database bookings
  const attentionItems = useMemo(() => {
    const items: Array<{
      id: string;
      severity: "critical" | "warning" | "notice";
      title: string;
      subtitle: string;
      badge: string;
      actionLabel: string;
      actionType: "assign_van" | "extend_bay" | "restock" | "renew_cert" | "view_order";
      targetId?: string;
    }> = [];

    const pending = bookings.filter((b) => b.status.toLowerCase() === "pending");
    pending.forEach((b) => {
      const isUrgent =
        b.isEmergency ||
        b.serviceType.toLowerCase().includes("emergency") ||
        b.serviceType.toLowerCase().includes("sos");
      const minsAgo = b.createdAt
        ? Math.max(1, Math.floor((Date.now() - new Date(b.createdAt).getTime()) / 60000))
        : 5;

      items.push({
        id: `att-${b.id}`,
        severity: isUrgent || minsAgo > 10 ? "critical" : "warning",
        title: `${b.serviceType} #${b.id.slice(0, 6)} unassigned`,
        subtitle: `${b.customer?.name || b.customerName || "Motorist"} at ${b.customerLocation?.address || b.notes || "Phnom Penh"} · Waiting ${minsAgo}m`,
        badge: isUrgent ? "CRITICAL SOS" : minsAgo > 10 ? "+10m OVERDUE" : "DISPATCH PENDING",
        actionLabel: "Accept & Deploy",
        actionType: "assign_van",
        targetId: b.id,
      });
    });

    const inProgress = bookings.filter((b) => b.status.toLowerCase() === "in_progress");
    if (inProgress.length >= 3) {
      items.push({
        id: "att-capacity",
        severity: "warning",
        title: "High Workshop Bay Load",
        subtitle: `${inProgress.length} active service jobs running concurrently`,
        badge: "CAPACITY LOAD",
        actionLabel: "View Orders",
        actionType: "view_order",
        targetId: "active",
      });
    }

    return items;
  }, [bookings]);

  // Dynamic Activity Feed events derived from real database bookings
  const liveActivityEvents = useMemo(() => {
    return bookings.slice(0, 8).map((b) => {
      const timeStr = b.createdAt
        ? new Date(b.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "Recent";
      const st = b.status.toLowerCase();
      let type: "sos_accept" | "bay_assign" | "online" | "repair_complete" | "settlement" = "sos_accept";
      let title = `${b.serviceType} #${b.id.slice(0, 6)}`;
      let detail = `${b.customerName || b.customer?.name || "Motorist"} · ${b.vehicle?.plateNumber ? `🇰🇭 ${b.vehicle.plateNumber}` : "Vehicle"}`;

      if (st === "pending") {
        title = `Inbound ${b.serviceType}`;
        detail = `${b.customerName || "Motorist"} requested breakdown rescue · Triage pending`;
        type = "sos_accept";
      } else if (st === "accepted") {
        title = `Tech deployed: ${b.serviceType}`;
        detail = `Mobile rescue unit en route to ${b.customerLocation?.address || "motorist location"}`;
        type = "sos_accept";
      } else if (st === "in_progress") {
        title = `Repair in progress: ${b.serviceType}`;
        detail = `Diagnostic inspection underway for ${b.vehicle?.make || "vehicle"}`;
        type = "bay_assign";
      } else if (st === "completed") {
        title = `Completed: ${b.serviceType}`;
        detail = `Final repair verified & settlement processed`;
        type = "repair_complete";
      }

      return {
        id: `act-${b.id}`,
        time: timeStr,
        title,
        detail,
        type,
        amount: b.estimatedPrice ? `+$${b.estimatedPrice}.00` : undefined,
      };
    });
  }, [bookings]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 5.0;
    return Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) * 10) / 10;
  }, [reviews]);

  // Dynamically derive bay occupancy from active bookings in the DB
  const bays: ServiceBay[] = useMemo(() => {
    const activeJobs = bookings.filter((b) => {
      const st = b.status.toUpperCase();
      return st === "IN_PROGRESS" || st === "ACCEPTED";
    });

    return BAY_CONFIGS.map((cfg, idx) => {
      const override = bayOverrides[cfg.id];
      if (override?.status === "vacant") {
        return { ...cfg, status: "vacant" as const };
      }
      if (override?.status === "occupied") {
        return {
          ...cfg,
          status: "occupied" as const,
          currentVehicle: override.currentVehicle || "Walk-in Inspection",
          service: override.service || "Multi-Point Diagnostic",
          plate: override.plate || "PP Registered",
          technician: override.technician || "Lead Tech Dara",
          timeInBay: "Active in bay",
        };
      }

      const assignedJob =
        activeJobs.find((b) => assignedBays[b.id] === cfg.id) ||
        activeJobs[idx];

      if (assignedJob) {
        const vehicleStr = assignedJob.vehicle
          ? `${assignedJob.vehicle.make || ""} ${assignedJob.vehicle.model || ""} ${assignedJob.vehicle.year || ""}`.trim()
          : assignedJob.customerName || assignedJob.customer?.name
          ? `${assignedJob.customerName || assignedJob.customer?.name}'s Vehicle`
          : "Customer Vehicle";

        return {
          ...cfg,
          status: "occupied" as const,
          currentVehicle: vehicleStr,
          service: assignedJob.serviceType,
          technician: "Lead Tech Dara",
          plate: assignedJob.vehicle?.plateNumber || "PP Registered",
          timeInBay: "Active in bay",
        };
      }

      return {
        ...cfg,
        status: "vacant" as const,
      };
    });
  }, [bookings, assignedBays, bayOverrides]);

  // Dynamically derive last 7 days performance from bookings
  const weeklyPerformance = useMemo(() => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const dayBookings = bookings.filter((b) => {
        const bd = new Date(b.createdAt);
        return bd >= dayStart && bd <= dayEnd;
      });

      const rev = dayBookings.reduce((sum, b) => sum + (Number(b.estimatedPrice ?? b.estimatedCost) || 35), 0);
      days.push({
        day: dayNames[d.getDay()],
        fullDay: d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }),
        volume: dayBookings.length,
        revenue: Math.round(rev),
        isToday: i === 0,
      });
    }
    return days;
  }, [bookings]);

  // Pipeline metrics
  const pipelineStats = useMemo(() => {
    const pending = bookings.filter((b) => b.status.toUpperCase() === "PENDING");
    const accepted = bookings.filter((b) => b.status.toUpperCase() === "ACCEPTED");
    const inProgress = bookings.filter((b) => b.status.toUpperCase() === "IN_PROGRESS");
    const completed = bookings.filter((b) => b.status.toUpperCase() === "COMPLETED");

    const getRev = (list: Booking[]) =>
      list.reduce((sum, b) => sum + (Number(b.estimatedPrice ?? b.estimatedCost) || 35), 0);

    return {
      pending: { count: pending.length, revenue: getRev(pending) },
      accepted: { count: accepted.length, revenue: getRev(accepted) },
      inProgress: { count: inProgress.length, revenue: getRev(inProgress) },
      qualityCheck: {
        count: Math.max(0, Math.floor(inProgress.length * 0.5)),
        revenue: Math.round(getRev(inProgress) * 0.5),
      },
      completed: { count: completed.length, revenue: getRev(completed) },
      total: bookings.length,
    };
  }, [bookings]);

  // Category distribution
  const categoryDistribution = useMemo(() => {
    const categories: Record<string, { count: number; name: string; color: string; revenue: number }> = {
      oil: { count: 0, name: "Synthetic Oil & Filter", color: "#E06D53", revenue: 0 },
      brake: { count: 0, name: "Ceramic Brake Swap", color: "#F3B353", revenue: 0 },
      battery: { count: 0, name: "12V Battery Rescue", color: "#264653", revenue: 0 },
      ecu: { count: 0, name: "ECU Diagnostics", color: "#76B39D", revenue: 0 },
      cooling: { count: 0, name: "AC & Cooling System", color: "#8B3A62", revenue: 0 },
    };

    for (const b of bookings) {
      const text = `${b.serviceType} ${b.notes || ""}`.toLowerCase();
      const cost = Number(b.estimatedPrice ?? b.estimatedCost) || 35;
      if (text.includes("oil") || text.includes("fluid") || text.includes("maintenance")) {
        categories.oil.count++;
        categories.oil.revenue += cost;
      } else if (text.includes("brake") || text.includes("caliper") || text.includes("pad")) {
        categories.brake.count++;
        categories.brake.revenue += cost;
      } else if (text.includes("battery") || text.includes("jumpstart") || text.includes("alternator")) {
        categories.battery.count++;
        categories.battery.revenue += cost;
      } else if (text.includes("radiator") || text.includes("coolant") || text.includes("ac") || text.includes("compressor") || text.includes("overheat")) {
        categories.cooling.count++;
        categories.cooling.revenue += cost;
      } else {
        categories.ecu.count++;
        categories.ecu.revenue += cost;
      }
    }

    const total = Math.max(1, bookings.length);
    return Object.entries(categories).map(([key, item]) => ({
      key,
      name: item.name,
      color: item.color,
      count: item.count,
      percentage: Math.round((item.count / total) * 100),
      revenue: Math.round(item.revenue),
    }));
  }, [bookings]);

  // Donut slices
  const donutCircumference = 238.76;
  const donutSlices = useMemo(() => {
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

  // Dynamic monthly wave chart data
  const waveChartData = useMemo(() => {
    const now = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const months = [];

    for (let m = 5; m >= 0; m--) {
      const targetMonthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - m + 1, 1);
      const mBookings = bookings.filter((b) => {
        const bd = new Date(b.createdAt);
        return bd >= targetMonthDate && bd < nextMonthDate;
      });
      const completed = mBookings.filter((b) => b.status.toUpperCase() === "COMPLETED").length;
      const sos = mBookings.filter((b) => {
        const text = `${b.serviceType} ${b.notes || ""}`.toLowerCase();
        return text.includes("sos") || text.includes("emergency") || text.includes("rescue");
      }).length;

      months.push({
        month: monthNames[targetMonthDate.getMonth()],
        completedCount: completed,
        sosCount: sos,
      });
    }

    const n = months.length;
    const maxVal = Math.max(5, ...months.map((m) => Math.max(m.completedCount, m.sosCount)));
    const getX = (idx: number) => 30 + idx * ((760 - 60) / Math.max(1, n - 1));
    const getY = (val: number) => Math.round(150 - (val / maxVal) * 115);

    const completedPts = months.map((m, i) => ({ x: getX(i), y: getY(m.completedCount) }));
    const sosPts = months.map((m, i) => ({ x: getX(i), y: getY(m.sosCount) }));

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
      months,
      completedPath: completedSpline,
      completedArea: `${completedSpline} L ${lastX} 160 L ${firstX} 160 Z`,
      sosPath: sosSpline,
      sosArea: `${sosSpline} L ${lastX} 160 L ${firstX} 160 Z`,
      completedPoints: completedPts,
      sosPoints: sosPts,
    };
  }, [bookings]);

  // Common failure causes derived from actual bookings
  const commonCauses = useMemo(() => [
    {
      name: "Dead 12V battery & alternator drain",
      percentage: categoryDistribution.find((c) => c.key === "battery")?.percentage || 35,
      count: categoryDistribution.find((c) => c.key === "battery")?.count || 0,
    },
    {
      name: "Ceramic brake pad & rotor resurface",
      percentage: categoryDistribution.find((c) => c.key === "brake")?.percentage || 28,
      count: categoryDistribution.find((c) => c.key === "brake")?.count || 0,
    },
    {
      name: "AC compressor leak & coolant purge",
      percentage: categoryDistribution.find((c) => c.key === "cooling")?.percentage || 20,
      count: categoryDistribution.find((c) => c.key === "cooling")?.count || 0,
    },
    {
      name: "Computer OBD-II telemetry scan",
      percentage: categoryDistribution.find((c) => c.key === "ecu")?.percentage || 17,
      count: categoryDistribution.find((c) => c.key === "ecu")?.count || 0,
    },
  ], [categoryDistribution]);

  // Settlements history derived from completed bookings
  const payoutHistory = useMemo(() => {
    return completedBookings.map((b) => ({
      id: `PAY-${b.id.slice(-6).toUpperCase()}`,
      date: new Date(b.createdAt).toLocaleDateString(),
      amount: Math.round(((Number(b.estimatedPrice ?? b.estimatedCost) || 35) * 0.9) * 100) / 100,
      destination: "ABA Bank KHQR (001 892 411)",
      status: "Settled",
    }));
  }, [completedBookings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-xs">Loading workshop workstation...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-slate-900 flex flex-row antialiased selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-medium shadow-lg flex items-center gap-2 animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SIDEBAR: CLEAN LIGHT MINIMALIST SAAS SIDEBAR
         ══════════════════════════════════════════════════════════════════════ */}
      <aside className="w-64 bg-white border-r border-slate-200/70 flex flex-col shrink-0 h-screen sticky top-0 z-40 select-none">
        {/* Brand Header */}
        <div className="h-18 px-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button className="text-slate-400 hover:text-slate-700 transition cursor-pointer p-1 -ml-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="w-9 h-9 rounded-lg bg-slate-950 p-1.5 flex items-center justify-center shadow-xs">
              <img src="/logo-white.png" alt="TechTune Healer" className="w-full h-auto object-contain" />
            </div>
            <div>
              <p className="text-slate-950 font-bold text-sm leading-tight tracking-tight">TechTune</p>
              <p className="text-slate-400 text-[10px] font-medium">Provider Workstation</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <button
            onClick={() => setActiveView("overview")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
              activeView === "overview"
                ? "bg-[#EBF2FC] text-[#2A65F0] font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveView("dispatches")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
              activeView === "dispatches"
                ? "bg-[#EBF2FC] text-[#2A65F0] font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13" rx="1.5" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <span>Dispatches</span>
            </div>
            {pendingBookings.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#E06D53] text-white text-[10px] font-bold flex items-center justify-center">
                {pendingBookings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView("bays")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
              activeView === "bays"
                ? "bg-[#EBF2FC] text-[#2A65F0] font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
              <span>Hydraulic Bays</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {bays.filter((b) => b.status === "occupied").length}/4
            </span>
          </button>

          <button
            onClick={() => setActiveView("services")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
              activeView === "services"
                ? "bg-[#EBF2FC] text-[#2A65F0] font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <span>Services &amp; Rates</span>
          </button>

          <button
            onClick={() => setActiveView("settlements")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
              activeView === "settlements"
                ? "bg-[#EBF2FC] text-[#2A65F0] font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span>Settlements</span>
            </div>
            <span className="font-mono text-[11px] text-emerald-700 font-semibold">
              ${netEarnings.toFixed(0)}
            </span>
          </button>

          {/* Hairline Divider */}
          <div className="py-2">
            <div className="h-px bg-slate-100" />
          </div>

          <button
            onClick={() => {
              setActiveView("overview");
              setDossierTab("chat");
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <span>Live Chat Hub</span>
            </div>
            {chatMessages.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 text-[10px] font-mono">
                {chatMessages.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView("reviews")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
              activeView === "reviews"
                ? "bg-[#EBF2FC] text-[#2A65F0] font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>Customer Reviews</span>
            </div>
            <span className="text-[11px] font-semibold text-amber-600">
              ★ {avgRating}
            </span>
          </button>

          <button
            onClick={() => setActiveView("settings")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
              activeView === "settings"
                ? "bg-[#EBF2FC] text-[#2A65F0] font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            <span>Operating Hours</span>
          </button>
        </nav>

        {/* 24/7 Roadside Emergency Standby Card */}
        <div className="p-3 mx-3 mb-2 bg-[#F9FAFB] border border-slate-100 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-800">24/7 SOS Standby</span>
            <span className={`w-2 h-2 rounded-full ${isEmergencyActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            {isEmergencyActive ? "Broadcasting mobile rescue units." : "Roadside dispatch offline."}
          </p>
          <button
            onClick={toggleEmergencyStandby}
            className={`w-full py-1 rounded text-[10px] font-semibold transition cursor-pointer ${
              isEmergencyActive
                ? "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            {isEmergencyActive ? "Pause Standby" : "Activate Standby"}
          </button>
        </div>

        {/* Bottom User Area */}
        <div className="p-3.5 border-t border-slate-100 space-y-1">
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <span>Help &amp; Public Home</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN WORKSPACE CANVAS: CLEAN, SPACIOUS, MINIMALIST
         ══════════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 min-w-0 p-8 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto space-y-6">

          {/* Top Title & Primary Action Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {activeView === "overview" && "Dashboard"}
                {activeView === "dispatches" && "Active Dispatches Queue"}
                {activeView === "bays" && "Hydraulic Service Bays"}
                {activeView === "services" && "Services & Rates Catalog"}
                {activeView === "settlements" && "Settlements & Clearances"}
                {activeView === "reviews" && "Customer Testimonials"}
                {activeView === "settings" && "Operating Hours & Facility Profile"}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {workshopProfile.businessName} &bull; Olympic Area, Phnom Penh
              </p>
            </div>

            {/* Create Dropdown matching reference */}
            <div className="relative">
              <button
                onClick={() => setCreateDropdownOpen((prev) => !prev)}
                className="bg-[#2A5AF0] hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                <span>Create</span>
                <span className="text-[10px]">▼</span>
              </button>

              {createDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200/80 py-1.5 z-50 animate-in fade-in duration-150 text-xs">
                  <button
                    onClick={() => {
                      setCreateDropdownOpen(false);
                      setActiveView("dispatches");
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
                  >
                    + New Roadside Dispatch
                  </button>
                  <button
                    onClick={() => {
                      setCreateDropdownOpen(false);
                      setActiveView("bays");
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
                  >
                    + Log Hydraulic Bay Walk-in
                  </button>
                  <button
                    onClick={() => {
                      setCreateDropdownOpen(false);
                      setEditingService(null);
                      setServiceForm({ name: "", category: "Maintenance", price: "", durationMinutes: "45", description: "" });
                      setServiceModalOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
                  >
                    + Add New Service
                  </button>
                  <button
                    onClick={() => {
                      setCreateDropdownOpen(false);
                      setPayoutModalOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-emerald-700 font-semibold border-t border-slate-100 cursor-pointer"
                  >
                    + Request KHQR Payout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Subheader / Tabs Bar matching reference */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/70 pb-2 gap-4">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveView("overview")}
                className={`text-xs font-medium pb-2 -mb-2 transition relative cursor-pointer ${
                  activeView === "overview"
                    ? "text-slate-900 font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#2A5AF0]"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                Operations &amp; Floor
              </button>

              <button
                onClick={() => setActiveView("dispatches")}
                className={`text-xs font-medium pb-2 -mb-2 transition relative cursor-pointer ${
                  activeView === "dispatches"
                    ? "text-slate-900 font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#2A5AF0]"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                Dispatches Queue ({bookings.length})
              </button>

              <button
                onClick={() => setActiveView("bays")}
                className={`text-xs font-medium pb-2 -mb-2 transition relative cursor-pointer ${
                  activeView === "bays"
                    ? "text-slate-900 font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#2A5AF0]"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                Hydraulic Bays ({bays.filter((b) => b.status === "occupied").length}/{bays.length})
              </button>

              <button
                onClick={() => setActiveView("services")}
                className={`text-xs font-medium pb-2 -mb-2 transition relative cursor-pointer ${
                  activeView === "services"
                    ? "text-slate-900 font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#2A5AF0]"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                Services ({services.length})
              </button>

              <button
                onClick={() => setActiveView("settlements")}
                className={`text-xs font-medium pb-2 -mb-2 transition relative cursor-pointer ${
                  activeView === "settlements"
                    ? "text-slate-900 font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#2A5AF0]"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                Settlements (${netEarnings.toFixed(0)})
              </button>
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center gap-2 text-xs text-slate-400 font-normal">
              <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="18" x="3" y="4" rx="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="bg-transparent border-none text-xs text-slate-600 font-medium focus:outline-none cursor-pointer"
              >
                <option value="today">Today</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════════
              UNIFIED CANVAS (SPACIOUS, HAIRLINE DIVIDERS, CLEAN TYPOGRAPHY)
             ══════════════════════════════════════════════════════════════════════ */}
          {activeView === "overview" && (
            <div className="space-y-6">

              {/* Approval Status Alert Banner */}
              {approvalStatus === "PENDING" && (
                <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-xs">
                  <div className="flex items-start gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 animate-pulse shrink-0" />
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-amber-900 uppercase tracking-wider text-xs font-mono">
                        Facility Onboarding: Application Under Administrative Review
                      </h3>
                      <p className="text-amber-700 leading-relaxed">
                        Your workshop registration and business address are currently being verified by platform operations. Once approved, your facility will automatically be activated to receive motorist dispatches.
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 px-3 py-1.5 rounded-xl bg-white font-mono font-bold text-amber-800 border border-amber-300 shadow-2xs">
                    STATUS: AWAITING APPROVAL
                  </span>
                </div>
              )}

              {/* ─── 1. TOP COMMAND CENTER: GREETING & 4 OPERATIONAL MANAGEMENT KPIS ─── */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">
                      Good morning, {workshopProfile.businessName}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tuesday &bull; 23 September &bull; <span className="text-emerald-600 font-semibold font-mono">Live Operations Console</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                      WORKSHOP ONLINE &bull; 4 BAYS ACTIVE
                    </span>
                  </div>
                </div>

                {/* 4 Core Management KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 pt-1">
                  {/* 1. Active Dispatches */}
                  <div className="pr-0 lg:pr-8 pb-4 lg:pb-0 space-y-1">
                    <span className="text-xs text-slate-400 font-normal">active dispatches</span>
                    <div className="flex items-baseline gap-2.5 pt-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
                        {bookings.length}
                      </span>
                      <span className="text-xs text-rose-500 font-semibold font-mono">
                        ({pendingBookings.length} pending SOS)
                      </span>
                    </div>
                  </div>

                  {/* 2. Hydraulic Bays Occupancy */}
                  <div className="px-0 lg:px-8 py-4 lg:py-0 space-y-1">
                    <span className="text-xs text-slate-400 font-normal">hydraulic bays occupied</span>
                    <div className="flex items-baseline gap-2.5 pt-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
                        {bays.filter((b) => b.status === "occupied").length} / {bays.length}
                      </span>
                      <span className="text-xs text-slate-400 font-normal">
                        (50% bay load)
                      </span>
                    </div>
                  </div>

                  {/* 3. Roadside Arrival Velocity */}
                  <div className="px-0 lg:px-8 py-4 lg:py-0 space-y-1">
                    <span className="text-xs text-slate-400 font-normal">avg arrival SLA</span>
                    <div className="flex items-baseline gap-2.5 pt-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-[#E06D53] tracking-tight font-mono">
                        11.4m
                      </span>
                      <span className="text-xs text-emerald-600 font-semibold font-mono">
                        (-3.6m vs SLA)
                      </span>
                    </div>
                  </div>

                  {/* 4. Net Available Balance */}
                  <div className="pl-0 lg:pl-8 pt-4 lg:pt-0 space-y-1">
                    <span className="text-xs text-slate-400 font-normal">available ABA balance</span>
                    <div className="flex items-baseline gap-2.5 pt-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
                        ${netEarnings.toFixed(0)}
                      </span>
                      <span className="text-xs text-emerald-600 font-semibold font-mono">
                        (KHQR ready)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── 2. SPLIT VIEW: LIVE DISPATCH TERMINAL (60%) + DYNAMIC NEEDS ATTENTION (40%) ─── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-7">
                  <ProviderDispatchTerminal
                    bookings={bookings}
                    onAcceptBooking={(id) => updateBookingStatus(id, "accepted")}
                    onUpdateStatus={(id, status) => updateBookingStatus(id, status)}
                    onOpenChat={(b) => {
                      setSelectedBookingId(b.id);
                      setDossierTab("chat");
                      setActiveView("dispatches");
                      showToast(`Opened chat with ${b.customerName || b.customer?.name || "Customer"}`);
                    }}
                    className="h-full"
                  />
                </div>
                <div className="lg:col-span-5 flex flex-col">
                  <NeedsAttention
                    items={attentionItems}
                    onAction={(type, targetId) => {
                      if (type === "assign_van") {
                        if (targetId) {
                          updateBookingStatus(targetId, "accepted");
                        } else {
                          setActiveView("dispatches");
                          showToast("Directing to Dispatch queue...");
                        }
                      } else if (type === "view_order") {
                        setActiveView("dispatches");
                        showToast("Viewing active workshop orders...");
                      } else if (type === "restock") {
                        showToast("Opened OEM Parts Requisition");
                      } else if (type === "renew_cert") {
                        setActiveView("settings");
                        showToast("Viewing Municipal Compliance");
                      } else {
                        setActiveView("dispatches");
                      }
                    }}
                    className="h-full"
                  />
                </div>
              </div>

              {/* ─── 3. OPERATIONS PERFORMANCE: SLA PERFORMANCE & BAY UTILIZATION ─── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SlaPerformanceChart />
                <BayUtilizationChart />
              </div>

              {/* ─── 4. LIVE ACTIVITY FEED & TODAY'S REVENUE STORYTELLING ─── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-7 flex flex-col">
                  <LiveActivityFeed events={liveActivityEvents} className="h-full" />
                </div>

                <div className="lg:col-span-5 flex flex-col">
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 flex flex-col justify-between h-full space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                            Today&apos;s Financial Clearances
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">Real-time ABA KHQR workshop settlements</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        INSTANT PAYOUT
                      </span>
                    </div>

                    <div className="space-y-4 my-auto">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
                            ${netEarnings.toFixed(2)}
                          </span>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                            &uarr; 12.4% vs yesterday
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Net workshop revenue cleared for transfer</p>
                      </div>

                      <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Gross Billings:</span>
                          <span className="font-mono font-semibold text-slate-800">${grossEarnings.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Platform Commission (10%):</span>
                          <span className="font-mono text-rose-600">-${platformFee.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-slate-200 pt-2 flex justify-between font-bold">
                          <span className="text-slate-900">Net ABA Payout:</span>
                          <span className="font-mono text-emerald-600 text-sm">${netEarnings.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-mono">Next auto-clearance: 23:59 ICT</span>
                      <button
                        onClick={() => setPayoutModalOpen(true)}
                        className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                      >
                        Request Payout Now &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── 6. ACTIVE WORK ORDERS QUEUE & MASTER-DETAIL / CHAT ─── */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                {/* Left 7 Cols: Orders Table */}
                <div className="lg:col-span-7 p-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 tracking-tight">Active Work Orders Queue</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Real-time incoming roadside and workshop dispatches</p>
                    </div>

                    <input
                      type="text"
                      value={dispatchSearch}
                      onChange={(e) => setDispatchSearch(e.target.value)}
                      placeholder="Search motorist, vehicle, plate..."
                      className="px-3.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 bg-[#F9FAFB] w-56"
                    />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-slate-400 font-normal border-b border-slate-100 pb-2.5">
                          <th className="pb-3 font-normal">Order</th>
                          <th className="pb-3 font-normal">Motorist &amp; Vehicle</th>
                          <th className="pb-3 font-normal">Service</th>
                          <th className="pb-3 font-normal">Quote</th>
                          <th className="pb-3 font-normal">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-slate-700">
                        {filteredDispatches.map((b) => {
                          const isSelected = activeSelectedBooking?.id === b.id;
                          const price = b.estimatedPrice ?? b.estimatedCost ?? 0;
                          const st = b.status.toLowerCase();

                          return (
                            <tr
                              key={b.id}
                              onClick={() => setSelectedBookingId(b.id)}
                              className={`cursor-pointer transition-colors ${
                                isSelected ? "bg-[#F4F7FC] font-medium" : "hover:bg-slate-50/60"
                              }`}
                            >
                              <td className="py-3 font-mono font-bold text-slate-900">
                                #{b.id.slice(-6).toUpperCase()}
                              </td>
                              <td className="py-3 max-w-[170px]">
                                <p className="font-semibold text-slate-900 truncate">
                                  {b.customerName || b.customer?.name || "Motorist"}
                                </p>
                                <p className="text-[11px] text-slate-400 truncate">
                                  {b.vehicle ? `${b.vehicle.make} ${b.vehicle.model}` : "Vehicle specs"}
                                </p>
                              </td>
                              <td className="py-3 max-w-[140px] truncate text-slate-700">{b.serviceType}</td>
                              <td className="py-3 font-mono font-semibold text-slate-900">
                                ${Number(price).toFixed(2)}
                              </td>
                              <td className="py-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                    st === "pending"
                                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                                      : st === "accepted" || st === "in_progress"
                                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  }`}
                                >
                                  {b.status.replace("_", " ").toLowerCase()}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right 5 Cols: Dossier & Live Chat */}
                <div className="lg:col-span-5 p-8 space-y-4 bg-white">
                  {activeSelectedBooking ? (
                    <div className="space-y-4">
                      {/* Switcher */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div className="flex gap-4 text-xs font-semibold">
                          <button
                            onClick={() => setDossierTab("specs")}
                            className={`cursor-pointer pb-1 transition ${
                              dossierTab === "specs"
                                ? "text-slate-900 border-b-2 border-slate-900"
                                : "text-slate-400 hover:text-slate-700"
                            }`}
                          >
                            Work Order Dossier
                          </button>
                          <button
                            onClick={() => setDossierTab("chat")}
                            className={`cursor-pointer pb-1 flex items-center gap-1.5 transition ${
                              dossierTab === "chat"
                                ? "text-slate-900 border-b-2 border-slate-900"
                                : "text-slate-400 hover:text-slate-700"
                            }`}
                          >
                            <span>Live Chat</span>
                            <span className="px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 text-[10px] font-mono">
                              {chatMessages.length}
                            </span>
                          </button>
                        </div>

                        <span className="text-xs font-mono font-bold text-slate-900">
                          #{activeSelectedBooking.id.slice(-6).toUpperCase()}
                        </span>
                      </div>

                      {dossierTab === "specs" ? (
                        <div className="space-y-4 text-xs">
                          {/* Motorist Card */}
                          <div className="p-3.5 bg-[#F9FAFB] rounded-xl space-y-1.5 border border-slate-100">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 text-sm">
                                {activeSelectedBooking.customerName || activeSelectedBooking.customer?.name || "Motorist"}
                              </span>
                              <div className="flex gap-1.5">
                                <a
                                  href={`tel:${activeSelectedBooking.customerPhone || "+85512345678"}`}
                                  className="px-2.5 py-1 rounded bg-slate-900 text-white font-medium text-[11px]"
                                >
                                  Call
                                </a>
                                <button
                                  onClick={() => copyToClipboard(activeSelectedBooking.customerPhone || "+85512345678", "Phone")}
                                  className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-600 text-[11px] cursor-pointer"
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                            <p className="font-mono text-slate-500 text-[11px]">
                              {activeSelectedBooking.customerPhone || "+855 12 345 678"}
                            </p>
                            <p className="text-slate-600 text-[11px]">
                              <span className="text-slate-400">Location:</span>{" "}
                              {activeSelectedBooking.customerLocation?.address || "Olympic Stadium Area, Phnom Penh"}
                            </p>
                          </div>

                          {/* Vehicle Specs */}
                          <div className="p-3.5 border border-slate-100 rounded-xl space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-900">
                                {activeSelectedBooking.vehicle?.make || "Toyota"} {activeSelectedBooking.vehicle?.model || "Camry"} (
                                {activeSelectedBooking.vehicle?.year || "2019"})
                              </span>
                              <span className="font-mono text-slate-700 font-bold">
                                {activeSelectedBooking.vehicle?.plateNumber || "PP 2BC-8891"}
                              </span>
                            </div>
                            <p className="text-[#2A65F0] font-medium pt-1">{activeSelectedBooking.serviceType}</p>
                            {activeSelectedBooking.notes && (
                              <p className="text-slate-500 text-[11px] italic mt-1 bg-[#F9FAFB] p-2 rounded">
                                &quot;{activeSelectedBooking.notes}&quot;
                              </p>
                            )}
                          </div>

                          {/* Bay Assignment */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-slate-500">Hydraulic Bay Assignment</label>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4].map((bayId) => (
                                <button
                                  key={bayId}
                                  onClick={() => handleAssignBay(activeSelectedBooking.id, bayId)}
                                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer border ${
                                    assignedBays[activeSelectedBooking.id] === bayId
                                      ? "bg-slate-900 text-white border-slate-900"
                                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                  }`}
                                >
                                  Lift {bayId}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Status Workflow Action */}
                          <div className="pt-2">
                            {activeSelectedBooking.status.toLowerCase() === "pending" && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => updateBookingStatus(activeSelectedBooking.id, "ACCEPTED")}
                                  disabled={actionLoadingId === activeSelectedBooking.id}
                                  className="flex-1 py-2 rounded-lg bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 cursor-pointer"
                                >
                                  Accept Order
                                </button>
                                <button
                                  onClick={() => updateBookingStatus(activeSelectedBooking.id, "CANCELLED")}
                                  className="px-3 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs cursor-pointer"
                                >
                                  Decline
                                </button>
                              </div>
                            )}

                            {activeSelectedBooking.status.toLowerCase() === "accepted" && (
                              <button
                                onClick={() => updateBookingStatus(activeSelectedBooking.id, "IN_PROGRESS")}
                                className="w-full py-2.5 rounded-lg bg-[#2A65F0] text-white font-medium text-xs hover:bg-blue-700 cursor-pointer"
                              >
                                Move into Bay &amp; Start Service
                              </button>
                            )}

                            {activeSelectedBooking.status.toLowerCase() === "in_progress" && (
                              <button
                                onClick={() => updateBookingStatus(activeSelectedBooking.id, "COMPLETED")}
                                className="w-full py-2.5 rounded-lg bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-700 cursor-pointer"
                              >
                                Complete Inspection &amp; Mark Paid
                              </button>
                            )}

                            {activeSelectedBooking.status.toLowerCase() === "completed" && (
                              <div className="w-full py-2 rounded-lg bg-emerald-50 text-emerald-800 font-medium text-xs text-center border border-emerald-100">
                                Work Order Settled &amp; Paid
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Live Chat */
                        <div className="flex flex-col h-[320px] text-xs">
                          <div className="flex-1 overflow-y-auto space-y-2.5 p-1">
                            {chatMessages.map((msg) => {
                              const isMe =
                                msg.senderId === "provider" ||
                                msg.senderName.includes(workshopProfile.businessName) ||
                                msg.senderName.includes("Speedy");
                              return (
                                <div
                                  key={msg.id}
                                  className={`flex flex-col max-w-[85%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
                                >
                                  <div
                                    className={`p-2.5 rounded-xl leading-relaxed ${
                                      isMe
                                        ? "bg-slate-900 text-white"
                                        : "bg-[#F9FAFB] border border-slate-200/70 text-slate-800"
                                    }`}
                                  >
                                    {msg.text}
                                  </div>
                                </div>
                              );
                            })}
                            <div ref={chatScrollRef} />
                          </div>

                          <div className="py-1.5 flex flex-wrap gap-1 text-[10px]">
                            <button
                              type="button"
                              onClick={() => setChatInput("En route to your location (ETA ~12 min).")}
                              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                            >
                              &quot;En route (ETA ~12 min)&quot;
                            </button>
                            <button
                              type="button"
                              onClick={() => setChatInput("Technician has arrived at vehicle.")}
                              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                            >
                              &quot;Arrived at vehicle&quot;
                            </button>
                          </div>

                          <form onSubmit={handleSendChatMessage} className="flex gap-2 pt-1">
                            <input
                              type="text"
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              placeholder="Message motorist..."
                              className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 text-xs"
                            />
                            <button
                              type="submit"
                              disabled={isSendingChat || !chatInput.trim()}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-medium text-xs disabled:opacity-50 cursor-pointer"
                            >
                              Send
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-16 text-center text-xs text-slate-400">
                      Select a work order row to view details.
                    </div>
                  )}
                </div>
              </div>

              </div>
            </div>
          )}


          {/* ══════════════════════════════════════════════════════════════════════
              DEDICATED VIEW: DISPATCHES
             ══════════════════════════════════════════════════════════════════════ */}
          {activeView === "dispatches" && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Work Orders &amp; Dispatches Console</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Manage incoming mobile calls, vehicle quotes, and bay job assignments</p>
                </div>
                <span className="text-xs font-mono text-slate-500">{filteredDispatches.length} Total Records</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 font-normal border-b border-slate-100 pb-2.5">
                      <th className="pb-3 font-normal">Order</th>
                      <th className="pb-3 font-normal">Motorist &amp; Vehicle</th>
                      <th className="pb-3 font-normal">Service</th>
                      <th className="pb-3 font-normal">Quote</th>
                      <th className="pb-3 font-normal">Bay Assignment</th>
                      <th className="pb-3 font-normal">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700">
                    {filteredDispatches.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                          No work orders or roadside dispatches currently found.
                        </td>
                      </tr>
                    ) : (
                      filteredDispatches.map((b) => {
                        const price = b.estimatedPrice ?? b.estimatedCost ?? 0;
                        const st = b.status.toLowerCase();

                        return (
                          <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 font-mono font-bold text-slate-900">
                              #{b.id.slice(-6).toUpperCase()}
                            </td>
                            <td className="py-3">
                              <p className="font-semibold text-slate-900">
                                {b.customerName || b.customer?.name || "Motorist"}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {b.vehicle ? `${b.vehicle.make} ${b.vehicle.model}` : "Vehicle specs"}
                              </p>
                            </td>
                            <td className="py-3 text-slate-700">{b.serviceType}</td>
                            <td className="py-3 font-mono font-bold text-slate-900">${Number(price).toFixed(2)}</td>
                            <td className="py-3 font-mono text-slate-500">
                              {assignedBays[b.id] ? `Lift ${assignedBays[b.id]}` : "Unassigned"}
                            </td>
                            <td className="py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  st === "pending"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : st === "accepted" || st === "in_progress"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                }`}
                              >
                                {b.status.replace("_", " ").toLowerCase()}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              DEDICATED VIEW: HYDRAULIC SERVICE BAYS
             ══════════════════════════════════════════════════════════════════════ */}
          {activeView === "bays" && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Hydraulic Service Bays Floor</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Physical workshop vehicle lifts and technician duty status</p>
                </div>
                <span className="text-xs font-mono text-slate-500">4 Heavy Vehicle Lifts</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                {bays.map((bay) => {
                  const isOccupied = bay.status === "occupied";
                  return (
                    <div key={bay.id} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{bay.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isOccupied ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {isOccupied ? "OCCUPIED" : "VACANT"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{bay.type}</p>

                      <div className="py-2 space-y-1 text-xs">
                        {isOccupied ? (
                          <>
                            <p className="font-bold text-slate-900">{bay.currentVehicle}</p>
                            <p className="text-slate-600">{bay.service}</p>
                            <p className="text-slate-400 font-mono text-[11px]">{bay.plate} &bull; {bay.technician}</p>
                          </>
                        ) : (
                          <p className="text-slate-400 italic py-4">Ready for next vehicle</p>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setBayOverrides((prev) => {
                            const isCurrentlyOccupied = bay.status === "occupied";
                            return {
                              ...prev,
                              [bay.id]: {
                                status: isCurrentlyOccupied ? "vacant" : "occupied",
                                currentVehicle: isCurrentlyOccupied ? undefined : "Walk-in Vehicle",
                                service: isCurrentlyOccupied ? undefined : "Inspection",
                                plate: isCurrentlyOccupied ? undefined : "PP 2A-0000",
                                technician: isCurrentlyOccupied ? undefined : "Duty Tech",
                              },
                            };
                          });
                          showToast(`Bay ${bay.id} toggled`);
                        }}
                        className="text-[11px] text-[#2A65F0] hover:underline font-medium cursor-pointer"
                      >
                        Toggle Bay Status
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              DEDICATED VIEW: SERVICES & RATES
             ══════════════════════════════════════════════════════════════════════ */}
          {activeView === "services" && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Services &amp; Standard Rates</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Labor catalog published to motorists booking on TechTune</p>
                </div>

                <button
                  onClick={() => {
                    setEditingService(null);
                    setServiceForm({ name: "", category: "Maintenance", price: "", durationMinutes: "45", description: "" });
                    setServiceModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
                >
                  + Add Service
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 font-normal border-b border-slate-100 pb-2">
                      <th className="pb-2.5 font-normal">Service Name</th>
                      <th className="pb-2.5 font-normal">Category</th>
                      <th className="pb-2.5 font-normal">Standard Rate</th>
                      <th className="pb-2.5 font-normal">Duration</th>
                      <th className="pb-2.5 font-normal">Status</th>
                      <th className="pb-2.5 text-right font-normal">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700">
                    {services.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                          No service items in catalog yet. Click &quot;+ Add Service&quot; above to publish your labor rates.
                        </td>
                      </tr>
                    ) : (
                      services.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/40">
                          <td className="py-3">
                            <p className="font-semibold text-slate-900">{s.name}</p>
                            <p className="text-slate-400 text-[11px]">{s.description}</p>
                          </td>
                          <td className="py-3 text-slate-600">{s.category}</td>
                          <td className="py-3 font-mono font-bold text-slate-900">${s.price.toFixed(2)}</td>
                          <td className="py-3 text-slate-400 font-mono">~{s.durationMinutes} mins</td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                s.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {s.isActive ? "Active" : "Paused"}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => {
                                setEditingService(s);
                                setServiceForm({
                                  name: s.name,
                                  category: s.category,
                                  price: String(s.price),
                                  durationMinutes: String(s.durationMinutes),
                                  description: s.description,
                                });
                                setServiceModalOpen(true);
                              }}
                              className="text-blue-600 hover:underline mr-3 text-xs"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              DEDICATED VIEW: SETTLEMENTS
             ══════════════════════════════════════════════════════════════════════ */}
          {activeView === "settlements" && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Settlements &amp; Financial Clearance</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Automated 90% workshop net earnings and direct ABA Bank KHQR payouts</p>
                </div>

                <button
                  onClick={() => setPayoutModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition cursor-pointer"
                >
                  Request KHQR Payout
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-2">
                <div>
                  <span className="text-xs text-slate-400">gross billed</span>
                  <p className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono mt-0.5">
                    ${grossEarnings.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">10% platform fee</span>
                  <p className="text-3xl font-extrabold text-slate-400 tracking-tight font-mono mt-0.5">
                    -${platformFee.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">net retained</span>
                  <p className="text-3xl font-extrabold text-emerald-700 tracking-tight font-mono mt-0.5">
                    ${netEarnings.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">available for withdrawal</span>
                  <p className="text-3xl font-extrabold text-[#2A65F0] tracking-tight font-mono mt-0.5">
                    ${availableBalance.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Disbursement History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 font-normal border-b border-slate-100 pb-2">
                        <th className="pb-2 font-normal">Reference</th>
                        <th className="pb-2 font-normal">Destination</th>
                        <th className="pb-2 font-normal">Amount</th>
                        <th className="pb-2 font-normal">Date</th>
                        <th className="pb-2 text-right font-normal">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-700">
                      {payoutHistory.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                            No disbursements recorded yet. Payout settlements from completed repairs will show here.
                          </td>
                        </tr>
                      ) : (
                        payoutHistory.map((w) => (
                          <tr key={w.id}>
                            <td className="py-3 font-mono font-bold text-slate-900">{w.id}</td>
                            <td className="py-3 text-slate-700">{w.destination}</td>
                            <td className="py-3 font-mono font-bold text-emerald-700">${w.amount.toFixed(2)}</td>
                            <td className="py-3 text-slate-400 font-mono">{w.date}</td>
                            <td className="py-3 text-right">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                                {w.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              DEDICATED VIEW: REVIEWS
             ══════════════════════════════════════════════════════════════════════ */}
          {activeView === "reviews" && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Motorist Reviews &amp; Facility Score</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Verified customer repair testimonials across Phnom Penh</p>
                </div>
                <span className="text-sm font-bold text-slate-900">★ {avgRating} / 5.0</span>
              </div>

              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                    No motorist reviews received yet. Reviews submitted by motorists after repair completion will be listed here.
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="p-4 border border-slate-100 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-900 text-xs">{rev.customerName}</span>
                          <span className="text-slate-400 text-[11px] ml-2 font-mono">{rev.vehicleTag}</span>
                        </div>
                        <span className="text-amber-500 text-xs">{"★".repeat(rev.rating)}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">&quot;{rev.comment}&quot;</p>
                      {rev.reply ? (
                        <div className="bg-[#F9FAFB] p-2.5 rounded text-xs text-slate-600 italic">
                          <span className="font-semibold text-slate-800 not-italic">Workshop Response: </span>
                          {rev.reply.text}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setReplyModalReview(rev);
                            setReplyInput("");
                          }}
                          className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
                        >
                          Reply to review
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              DEDICATED VIEW: OPERATING HOURS & SETTINGS
             ══════════════════════════════════════════════════════════════════════ */}
          {activeView === "settings" && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Facility Profile &amp; Weekly Hours</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Operating station coordinates and weekly operating schedule</p>
                </div>

                <button
                  onClick={() => showToast("Settings saved successfully")}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
                >
                  Save Settings
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-500 mb-1">Facility Business Name</label>
                    <input
                      type="text"
                      value={workshopProfile.businessName}
                      onChange={(e) => setWorkshopProfile({ ...workshopProfile, businessName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">Station Address</label>
                    <input
                      type="text"
                      value={workshopProfile.address}
                      onChange={(e) => setWorkshopProfile({ ...workshopProfile, address: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">Emergency Hotline</label>
                    <input
                      type="text"
                      value={workshopProfile.phone}
                      onChange={(e) => setWorkshopProfile({ ...workshopProfile, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2 border-l border-slate-100 pl-6">
                  <span className="font-semibold text-slate-700 block mb-2">Weekly Working Hours</span>
                  {schedule.map((d) => (
                    <div key={d.day} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50">
                      <span className="text-slate-600 font-medium">{d.day}</span>
                      {d.isOpen ? (
                        <span className="font-mono text-slate-700">{d.openTime} - {d.closeTime}</span>
                      ) : (
                        <span className="text-slate-400 italic">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ─── MODALS ────────────────────────────────────────────────────────── */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">{editingService ? "Edit Service" : "Add Service"}</h3>
            <div className="space-y-3 text-xs">
              <input
                type="text"
                value={serviceForm.name}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                placeholder="Title"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
              <input
                type="number"
                step="0.01"
                value={serviceForm.price}
                onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                placeholder="Price ($)"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
              />
              <textarea
                rows={3}
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                placeholder="Description"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setServiceModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setServiceModalOpen(false);
                  showToast("Service saved");
                }}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Disburse KHQR Payout</h3>
            <div className="space-y-3 text-xs">
              <input
                type="number"
                value={payoutForm.amount}
                onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                placeholder="Amount ($)"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
              />
              <input
                type="text"
                value={payoutForm.accountNumber}
                onChange={(e) => setPayoutForm({ ...payoutForm, accountNumber: e.target.value })}
                placeholder="Account Number"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
              />
              <input
                type="text"
                value={payoutForm.accountName}
                onChange={(e) => setPayoutForm({ ...payoutForm, accountName: e.target.value })}
                placeholder="Account Name"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg uppercase"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPayoutModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setPayoutModalOpen(false);
                  showToast("Payout requested successfully");
                }}
                className="px-4 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-medium cursor-pointer"
              >
                Confirm Payout
              </button>
            </div>
          </div>
        </div>
      )}

      {replyModalReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Reply to Review</h3>
            <div className="p-3 bg-[#F9FAFB] rounded-lg text-xs italic text-slate-600">
              &quot;{replyModalReview.comment}&quot;
            </div>
            <textarea
              rows={3}
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              placeholder="Type reply..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReplyModalReview(null)}
                className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setReplyModalReview(null);
                  showToast("Reply published");
                }}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium cursor-pointer"
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
