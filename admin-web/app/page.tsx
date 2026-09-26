"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Reveal, Counter } from "@/components/Reveal";

// Technical OEM Parts Catalog Data
const OEM_PARTS = [
  {
    id: "01",
    name: "Ceramic Brake Pad System",
    brand: "Akebono OEM Spec",
    category: "Braking & Hydraulic",
    image: "/images/parts/brake_pads.png",
    spec: "Ultra-low dust ceramic formulation with chamfered slots. High thermal fade resistance up to 650°C.",
    metrics: [
      { label: "Friction Coeff", val: "0.42 μ" },
      { label: "Operating Temp", val: "Up to 650°C" },
      { label: "Warranty", val: "45,000 km" },
    ],
  },
  {
    id: "02",
    name: "Synthetic Motor Oil 5W-30",
    brand: "Mobil 1 Advanced Full Synthetic",
    category: "Fluids & Lubrication",
    image: "/images/parts/oil_bottle.png",
    spec: "Triple-action formula engineered for severe high-heat tropical driving conditions across Southeast Asia.",
    metrics: [
      { label: "Viscosity", val: "SAE 5W-30" },
      { label: "Standard", val: "API SP / ILSAC GF-6A" },
      { label: "Service Life", val: "10,000 km" },
    ],
  },
  {
    id: "03",
    name: "AGM 12V High-Output Battery",
    brand: "Varta Dynamic AGM",
    category: "Electrical & Ignition",
    image: "/images/parts/car_battery.png",
    spec: "Absorbent Glass Mat design delivering 3x the cycle life of conventional lead-acid batteries with zero spill risk.",
    metrics: [
      { label: "Cold Cranking", val: "850 CCA" },
      { label: "Capacity", val: "80 Ah" },
      { label: "Guarantee", val: "3-Year Direct Swap" },
    ],
  },
  {
    id: "04",
    name: "All-Weather Radial Tires",
    brand: "Michelin Primacy 4",
    category: "Tires & Suspension",
    image: "/images/parts/car_tire.png",
    spec: "EverGrip silica compound providing maximum braking grip on wet Phnom Penh monsoon asphalt.",
    metrics: [
      { label: "Treadwear", val: "UTQG 340 A A" },
      { label: "Wet Braking", val: "Class A Grip" },
      { label: "Lifespan", val: "60,000 km" },
    ],
  },
  {
    id: "05",
    name: "Micro-Pore Engine Air Filter",
    brand: "Denso OEM Certified",
    category: "Air & Fuel Induction",
    image: "/images/parts/air_filter.png",
    spec: "Multi-layered synthetic fibers capturing 99.5% of fine road dust, soot, and particulate debris.",
    metrics: [
      { label: "Efficiency", val: "99.5% at 5μm" },
      { label: "Airflow", val: "High-flow OEM spec" },
      { label: "Service", val: "20,000 km" },
    ],
  },
  {
    id: "06",
    name: "Twin-Tube Gas Shock Absorber",
    brand: "KYB Excel-G Heavy Duty",
    category: "Chassis & Ride Control",
    image: "/images/parts/shock_absorber.png",
    spec: "Nitrogen gas pressurized dual chambers eliminating fluid foaming for predictable steering feedback.",
    metrics: [
      { label: "Damping", val: "Velocity-sensitive" },
      { label: "Pressure", val: "Nitrogen 25 Bar" },
      { label: "Warranty", val: "2-Year Unlimited" },
    ],
  },
];

export default function EditorialLandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ─── Interactive States ───────────────────────────────────────────────────
  const [activePartIndex, setActivePartIndex] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"login" | "register">("login");

  // Login Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register Form State
  const [regData, setRegData] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  const openAuth = (tab: "login" | "register") => {
    setModalTab(tab);
    setLoginError("");
    setRegError("");
    setRegSuccess(false);
    setIsModalOpen(true);
  };

  // ─── Provider Login Handler ───────────────────────────────────────────────
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/+$/, "");
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.message || "Invalid email or password.");
        return;
      }

      if (data.user?.role?.toUpperCase() !== "PROVIDER") {
        setLoginError("This portal is restricted to registered workshop partners.");
        return;
      }

      localStorage.setItem("provider_token", data.token);
      localStorage.setItem("provider_user", JSON.stringify(data.user));
      setIsModalOpen(false);
      router.push("/provider/dashboard");
    } catch {
      setLoginError("Unable to connect to server. Please ensure backend is running.");
    } finally {
      setLoginLoading(false);
    }
  };

  const autofillProvider = () => {
    setLoginEmail("sokha@test.com");
    setLoginPassword("password123");
  };

  // ─── Provider Registration Handler ────────────────────────────────────────
  const handleRegSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    if (regData.password !== regData.confirmPassword) {
      setRegError("Passwords do not match. Please check.");
      return;
    }

    if (regData.password.length < 6) {
      setRegError("Password must be at least 6 characters.");
      return;
    }

    setRegLoading(true);

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/+$/, "");
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regData.name,
          businessName: regData.businessName || regData.name,
          email: regData.email,
          phone: regData.phone,
          address: regData.address,
          password: regData.password,
          role: "PROVIDER",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRegError(data.message || "Registration failed. Please check your data.");
        return;
      }

      if (data.token) {
        localStorage.setItem("provider_token", data.token);
        localStorage.setItem("provider_user", JSON.stringify(data.user));
      }

      setRegSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        router.push("/provider/dashboard");
      }, 1200);
    } catch {
      setRegError("Unable to connect to server. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const activePart = OEM_PARTS[activePartIndex];

  return (
    <div className="min-h-screen bg-white text-slate-950 flex flex-col antialiased selection:bg-slate-950 selection:text-white">
      {/* ─── 01. NAVIGATION (COMPANY ARCHITECTURE) ─────────────────────────── */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-white/85 backdrop-blur-md shadow-xs border-b border-slate-200/80 py-0"
            : "bg-white/95 border-b border-slate-100 py-1"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12 h-20 flex items-center justify-between">
          {/* Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="w-8 h-8 bg-slate-950 text-white flex items-center justify-center font-bold text-xs tracking-widest uppercase transition-transform duration-300 group-hover:scale-105">
              TT
            </div>
            <div>
              <span className="text-slate-950 text-sm font-black tracking-wider uppercase block leading-none transition-colors group-hover:text-slate-700">
                TECHTUNE
              </span>
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mt-0.5 block">
                HEALER
              </span>
            </div>
          </div>

          {/* Clean Company Navigation */}
          <nav className="hidden md:flex items-center gap-10 text-xs font-semibold tracking-wider uppercase text-slate-500">
            <a href="#how-it-works" className="hover:text-slate-950 transition-colors">How It Works</a>
            <a href="#driver" className="hover:text-slate-950 transition-colors">Driver</a>
            <a href="#operations" className="hover:text-slate-950 transition-colors">Operations</a>
            <a href="#oem-parts" className="hover:text-slate-950 transition-colors">OEM Parts</a>
            <a href="#workstation" className="hover:text-slate-950 transition-colors">Service Centers</a>
            <a href="#trust" className="hover:text-slate-950 transition-colors">Trust</a>
          </nav>

          {/* Action */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => openAuth("login")}
              className="text-xs font-semibold tracking-wider uppercase text-slate-600 hover:text-slate-950 transition cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuth("register")}
              className="px-5 py-2.5 bg-slate-950 text-white text-xs font-semibold tracking-wider uppercase hover:bg-slate-800 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              Partner Portal
            </button>
          </div>
        </div>
      </header>

      {/* ─── 02. HERO: DOMINANT PHOTOGRAPHY WITH TECHNICAL ANNOTATION ──────── */}
      <section className="pt-12 sm:pt-20 pb-20 sm:pb-32 px-6 sm:px-12 border-b border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Main Statement & Direct Action */}
          <div className="max-w-4xl mb-12 sm:mb-16">
            <Reveal direction="up" delay={50}>
              <p className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 mb-5">
                AUTOCARE &bull; ON-DEMAND ROADSIDE INFRASTRUCTURE &bull; PHNOM PENH
              </p>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-950 tracking-tight leading-[0.98] uppercase">
                Roadside rescue. <br />
                <span className="text-slate-400">Instantly dispatched.</span>
              </h1>
              <p className="text-slate-600 text-lg sm:text-xl font-normal max-w-2xl mt-6 leading-relaxed">
                When vehicles break down, TechTune Healer connects drivers directly to verified repair facilities, mobile emergency units, and genuine OEM parts.
              </p>
            </Reveal>

            <Reveal direction="up" delay={150}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#driver"
                  className="group px-8 py-4 bg-slate-950 text-white text-xs font-bold tracking-wider uppercase hover:bg-slate-800 active:scale-[0.98] transition-all inline-flex items-center gap-3 cursor-pointer"
                >
                  <span>Explore Driver App</span>
                  <span className="inline-block transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden="true">&darr;</span>
                </a>

                <button
                  onClick={() => openAuth("register")}
                  className="px-8 py-4 bg-transparent border border-slate-300 text-slate-950 text-xs font-bold tracking-wider uppercase hover:border-slate-950 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Onboard Service Center
                </button>
              </div>
            </Reveal>
          </div>

          {/* Dominated Real Technician Photo with Adjacent Technical Annotations */}
          <Reveal direction="up" delay={200}>
            <div className="group relative w-full overflow-hidden bg-slate-950">
              {/* Massive Hero Photo with Smooth Zoom on Hover */}
              <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden">
                <img
                  src="/images/hero-service.jpg"
                  alt="Automotive diagnostic technician servicing vehicle on hydraulic lift"
                  className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              </div>

              {/* Technical Annotations Placed Directly Over Image Bottom */}
              <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 border-t border-white/10 bg-slate-950/60 backdrop-blur-md text-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">Facility Reference</span>
                    <p className="text-sm font-bold tracking-tight mt-1 text-white">Tuol Kork Bay 01 &bull; Active</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">CAN-Bus &bull; OBD-II Telemetry</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">Response SLA</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                      </span>
                      <p className="text-2xl font-black font-mono tracking-tight text-white">&lt; 15 mins</p>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">Average dispatch arrival</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">Municipal Reach</span>
                    <p className="text-2xl font-black font-mono tracking-tight mt-0.5 text-white">20 km Radius</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">Phnom Penh &amp; Kandal border</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">Settlement Protocol</span>
                    <p className="text-2xl font-black font-mono tracking-tight mt-0.5 text-emerald-400">Bakong KHQR</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">Instant ABA Bank clearance</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── 03. THE REALITY: PURE TYPOGRAPHY & WHITESPACE (NO CARDS) ───────── */}
      <section className="py-24 sm:py-36 px-6 sm:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Main Statement */}
          <Reveal direction="up">
            <div className="max-w-3xl">
              <p className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 mb-4">
                THE PHILOSOPHY
              </p>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.05] uppercase">
                Breakdowns happen without warning. Getting help shouldn't take hours.
              </h2>
            </div>
          </Reveal>

          {/* 3 Large Typographic Pillars with Thin Vertical Guide */}
          <div className="mt-20 pt-12 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            <Reveal delay={0} direction="up" className="group">
              <div className="space-y-4">
                <span className="text-5xl sm:text-6xl font-black font-mono text-slate-950 block leading-none transition-transform duration-300 group-hover:translate-x-1">
                  01
                </span>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950 leading-tight">
                  ZERO <br />
                  PHONE CALLS
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal pt-2">
                  GPS dispatch directly connects drivers to the nearest verified technician without haggling or repeating your location.
                </p>
              </div>
            </Reveal>

            <Reveal delay={150} direction="up" className="group md:border-l md:border-slate-200 md:pl-12 lg:pl-16">
              <div className="space-y-4">
                <span className="text-5xl sm:text-6xl font-black font-mono text-slate-950 block leading-none transition-transform duration-300 group-hover:translate-x-1">
                  02
                </span>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950 leading-tight">
                  CERTIFIED <br />
                  BAYS
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal pt-2">
                  50+ vetted repair facilities equipped with heavy hydraulic lifts, precision calibration, and certified mechanics.
                </p>
              </div>
            </Reveal>

            <Reveal delay={300} direction="up" className="group md:border-l md:border-slate-200 md:pl-12 lg:pl-16">
              <div className="space-y-4">
                <span className="text-5xl sm:text-6xl font-black font-mono text-slate-950 block leading-none transition-transform duration-300 group-hover:translate-x-1">
                  03
                </span>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950 leading-tight">
                  GENUINE <br />
                  PARTS
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal pt-2">
                  100% genuine OEM components with verified manufacturer warranties and direct workshop installation.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── 04. HOW IT WORKS: THE 3-STEP REAL-WORLD JOURNEY ────────────────── */}
      <section id="how-it-works" className="py-24 sm:py-32 px-6 sm:px-12 bg-[#FBFBFB] border-y border-slate-100">
        <div className="max-w-7xl mx-auto space-y-16">
          <Reveal direction="up">
            <div className="max-w-2xl">
              <p className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400">
                OPERATIONAL FLOW
              </p>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight uppercase mt-3">
                Request. Dispatch. Resolution.
              </h2>
              <p className="text-slate-600 text-base mt-4 leading-relaxed">
                A transparent 3-step loop that turns emergency roadside anxiety into guaranteed automotive recovery.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 pt-8 border-t border-slate-200">
            {/* Step 1 */}
            <Reveal delay={0} direction="up" className="group">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
                  STAGE 01 &bull; THE INCIDENT
                </span>
                <h3 className="text-xl font-bold text-slate-950 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                  Driver Reports Problem
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  One tap on the mobile app pinpoints breakdown coordinates and vehicle diagnostic symptoms—flat battery, puncture, or engine overheat.
                </p>
              </div>
            </Reveal>

            {/* Step 2 */}
            <Reveal delay={150} direction="up" className="group">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
                  STAGE 02 &bull; TELEMETRY DISPATCH
                </span>
                <h3 className="text-xl font-bold text-slate-950 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                  Nearest Tech Dispatched
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  The closest verified mobile rescue unit or facility manager accepts the job on their workstation, with live GPS routing under 15 minutes.
                </p>
              </div>
            </Reveal>

            {/* Step 3 */}
            <Reveal delay={300} direction="up" className="group">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
                  STAGE 03 &bull; CERTIFIED CLEARANCE
                </span>
                <h3 className="text-xl font-bold text-slate-950 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                  Repaired &amp; Settled
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Fixed on-site or serviced on a hydraulic lift with genuine OEM parts. Final payment clears instantly with transparent Bakong KHQR.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── 05. DRIVER PLATFORM: THE "WOW" SECTION (PHONE + ANNOTATIONS) ───── */}
      <section id="driver" className="py-24 sm:py-36 px-6 sm:px-12 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Centered Headline */}
          <Reveal direction="up">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-24">
              <p className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400">
                DRIVER MOBILE APPLICATION
              </p>
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-950 tracking-tight leading-none uppercase">
                Map. Tap. Rescued.
              </h2>
              <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                Your driver platform in the palm of your hand. Built with Expo React Native for instant roadside responsiveness.
              </p>
            </div>
          </Reveal>

          {/* Centered Phone with Surrounding Technical Annotations */}
          <div className="relative max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Annotations (Desktop) */}
              <div className="lg:col-span-4 space-y-12 text-left lg:text-right order-2 lg:order-1">
                <Reveal delay={100} direction="right">
                  <div className="group space-y-2 p-3 -m-3 rounded-lg hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center gap-3 lg:justify-end">
                      <span className="w-2 h-2 rounded-full bg-slate-950 transition-transform duration-300 group-hover:scale-125" />
                      <h4 className="text-sm font-black uppercase tracking-wider text-slate-950">
                        LIVE RADAR MAP
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Interactive Phnom Penh GPS radar locating mechanics within 5–20 km with verified arrival estimates.
                    </p>
                  </div>
                </Reveal>

                <Reveal delay={200} direction="right">
                  <div className="group space-y-2 p-3 -m-3 rounded-lg hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center gap-3 lg:justify-end">
                      <span className="w-2 h-2 rounded-full bg-slate-950 transition-transform duration-300 group-hover:scale-125" />
                      <h4 className="text-sm font-black uppercase tracking-wider text-slate-950">
                        24/7 ROADSIDE SOS
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Emergency Dead 12V Battery jumpstart, tire puncture repair, and heavy flatbed recovery towing.
                    </p>
                  </div>
                </Reveal>
              </div>

              {/* Centered Phone Frame with Gentle Ambient Floating Motion */}
              <div className="lg:col-span-4 flex justify-center order-1 lg:order-2">
                <Reveal delay={150} direction="up" className="relative flex justify-center w-full">
                  {/* Subtle Glowing Background Aura */}
                  <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full -z-10 animate-pulse-glow pointer-events-none" />

                  <div className="relative w-[280px] sm:w-[320px] bg-slate-950 rounded-[48px] p-3 shadow-2xl border-4 border-slate-800 animate-float-slow hover:-translate-y-2 transition-transform duration-500 cursor-pointer">
                    <div className="rounded-[38px] overflow-hidden bg-white">
                      <img
                        src="/images/mobile-app-screen.png"
                        alt="TechTune Healer Mobile App interface showing real-time garage radar and breakdown dispatch in Phnom Penh"
                        className="w-full h-auto object-cover block select-none"
                      />
                    </div>
                  </div>
                </Reveal>
              </div>

              {/* Right Annotations (Desktop) */}
              <div className="lg:col-span-4 space-y-12 text-left order-3">
                <Reveal delay={250} direction="left">
                  <div className="group space-y-2 p-3 -m-3 rounded-lg hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-slate-950 transition-transform duration-300 group-hover:scale-125" />
                      <h4 className="text-sm font-black uppercase tracking-wider text-slate-950">
                        OBD-II DIAGNOSTICS
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Live sensor scores covering engine oil viscosity, battery drain, coolant temperature, and tire pressure.
                    </p>
                  </div>
                </Reveal>

                <Reveal delay={350} direction="left">
                  <div className="group space-y-2 p-3 -m-3 rounded-lg hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-slate-950 transition-transform duration-300 group-hover:scale-125" />
                      <h4 className="text-sm font-black uppercase tracking-wider text-slate-950">
                        DIRECT MESSENGER
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Direct two-way chat with the responding technician to confirm breakdown landmarks and photo evidence.
                    </p>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 06. OPERATIONS: ASYMMETRIC EDITORIAL PHOTOGRAPHY COMPOSITION ──── */}
      <section id="operations" className="py-24 sm:py-36 bg-[#0B0F19] text-white px-6 sm:px-12">
        <div className="max-w-7xl mx-auto space-y-16">
          <Reveal direction="up">
            <div className="max-w-3xl">
              <p className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400">
                OPERATIONAL CAPACITY
              </p>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] uppercase mt-3">
                Built for real-world mechanical demands.
              </h2>
              <p className="text-slate-400 text-base mt-4 leading-relaxed max-w-xl">
                From dead 12V battery jumpstarts on the roadside to multi-ton hydraulic lift rebuilds inside certified service bays.
              </p>
            </div>
          </Reveal>

          {/* Art-Directed Asymmetric Magazine Composition with Zoom Interaction */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Large Hero Image: Mobile Roadside Rescue */}
            <div className="lg:col-span-7 space-y-4">
              <Reveal delay={0} direction="up">
                <div className="group aspect-[16/10] overflow-hidden bg-slate-900 cursor-pointer">
                  <img
                    src="/images/roadside-assistance.jpg"
                    alt="Roadside emergency mechanic assisting vehicle"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </div>
                <div className="flex items-baseline justify-between pt-2 border-t border-slate-800">
                  <span className="text-sm font-bold uppercase tracking-wider text-white">
                    01 &bull; Mobile Emergency Rescue Units
                  </span>
                  <span className="text-xs font-mono text-slate-400">24/7 Active Fleet</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-lg mt-2">
                  On-site battery swaps, tire puncture repairs, fuel delivery, and flatbed transport to certified partner centers.
                </p>
              </Reveal>
            </div>

            {/* Right Column: Two Offset Visual Frames */}
            <div className="lg:col-span-5 space-y-12 lg:pt-12">
              {/* Offset Frame 1: Diagnostics */}
              <Reveal delay={150} direction="up">
                <div className="space-y-3">
                  <div className="group aspect-[4/3] overflow-hidden bg-slate-900 cursor-pointer">
                    <img
                      src="/images/diagnostics-scan.jpg"
                      alt="Automotive diagnostic engine scanner tool"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </div>
                  <div className="flex items-baseline justify-between pt-2 border-t border-slate-800">
                    <span className="text-sm font-bold uppercase tracking-wider text-white">
                      02 &bull; Digital CAN-Bus Diagnostics
                    </span>
                    <span className="text-xs font-mono text-slate-400">OBD-II Protocol</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Real-time ECU fault code interpretation, sensor telemetry, and hybrid high-voltage battery cell analysis.
                  </p>
                </div>
              </Reveal>

              {/* Offset Frame 2: Workshop Facility Bays */}
              <Reveal delay={250} direction="up">
                <div className="space-y-3">
                  <div className="group aspect-[16/9] overflow-hidden bg-slate-900 cursor-pointer">
                    <img
                      src="/images/workshop-facility.jpg"
                      alt="Modern workshop facility with hydraulic lifts"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </div>
                  <div className="flex items-baseline justify-between pt-2 border-t border-slate-800">
                    <span className="text-sm font-bold uppercase tracking-wider text-white">
                      03 &bull; Heavy Hydraulic Lifts
                    </span>
                    <span className="text-xs font-mono text-slate-400">Up to 4.5 Tons</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Equipped for major suspension rebuilds, ceramic brake overhauls, and complete transmission servicing.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 07. OEM PARTS: TECHNICAL PARTS SHOWROOM & SELECTOR ─────────────── */}
      <section id="oem-parts" className="py-24 sm:py-36 px-6 sm:px-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto space-y-16">
          <Reveal direction="up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400">
                  TECHNICAL PARTS SHOWROOM
                </p>
                <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight uppercase mt-3">
                  Genuine OEM parts. Installed with warranty.
                </h2>
              </div>
              <p className="text-xs font-mono text-slate-500 max-w-xs">
                Every component is verified authentic, distributed on the driver app, and installed by certified mechanics.
              </p>
            </div>
          </Reveal>

          {/* The Technical Showroom Stage */}
          <Reveal delay={100} direction="up">
            <div className="border border-slate-200 bg-[#FAFAFA] p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Large Spotlight Part Image with Interactive Zoom */}
              <div className="group lg:col-span-6 flex items-center justify-center h-64 sm:h-80 bg-white border border-slate-200/80 p-8 overflow-hidden">
                <img
                  src={activePart.image}
                  alt={activePart.name}
                  key={activePart.id}
                  className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out"
                />
              </div>

              {/* Part Specs & Details */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase block">
                    PART {activePart.id} &bull; {activePart.category}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight mt-1">
                    {activePart.name}
                  </h3>
                  <p className="text-xs font-mono font-semibold text-slate-600 mt-1">
                    {activePart.brand}
                  </p>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {activePart.spec}
                </p>

                {/* Technical Spec Metrics */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
                  {activePart.metrics.map((m, idx) => (
                    <div key={idx}>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        {m.label}
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-950 mt-0.5">
                        {m.val}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Technical Selector 01 - 06 along bottom */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {OEM_PARTS.map((part, index) => {
              const isSelected = index === activePartIndex;
              return (
                <button
                  key={part.id}
                  onClick={() => setActivePartIndex(index)}
                  className={`p-4 text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 active:scale-95 ${
                    isSelected
                      ? "border-slate-950 bg-slate-950 text-white shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-400 text-slate-900"
                  }`}
                >
                  <span className={`text-[10px] font-mono font-bold block ${isSelected ? "text-slate-400" : "text-slate-400"}`}>
                    {part.id}
                  </span>
                  <p className="text-xs font-bold uppercase tracking-tight mt-3 leading-snug line-clamp-1">
                    {part.name}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 08. WORKSTATION: PRO B2B CONSOLE IN REAL LIFE ─────────────────── */}
      <section id="workstation" className="py-24 sm:py-36 px-6 sm:px-12 bg-[#FBFBFB]">
        <div className="max-w-7xl mx-auto space-y-12">
          <Reveal direction="up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400">
                  FOR SERVICE CENTERS &bull; B2B STATION CONSOLE
                </p>
                <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight uppercase mt-3">
                  Fill empty bays. Zero paperwork.
                </h2>
                <p className="text-slate-600 text-sm sm:text-base mt-4 leading-relaxed font-normal">
                  From roadside SOS intake to physical hydraulic lift scheduling. Certified service centers manage live telemetry, bay turnover, and instant ABA Bank KHQR settlements in one unified operating system.
                </p>
              </div>
              <div className="flex items-center gap-3 self-start md:self-auto">
                <button
                  onClick={() => openAuth("login")}
                  className="px-6 py-3 bg-slate-950 text-white text-xs font-bold tracking-wider uppercase hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
                >
                  Launch Live Workstation &rarr;
                </button>
                <button
                  onClick={() => openAuth("register")}
                  className="px-6 py-3 border border-slate-300 text-slate-900 text-xs font-bold tracking-wider uppercase hover:border-slate-900 active:scale-95 transition-all cursor-pointer bg-white"
                >
                  Register Workshop
                </button>
              </div>
            </div>
          </Reveal>

          {/* Large Architectural Browser Console Frame with Actual High-Res Screenshot */}
          <Reveal delay={150} direction="up">
            <div className="border border-slate-300/80 bg-white shadow-xl hover:shadow-2xl transition-shadow duration-500 overflow-hidden">
              {/* Minimalist Browser Chrome Bar */}
              <div className="bg-slate-100/90 px-5 py-3 border-b border-slate-200/90 flex items-center justify-between text-xs font-mono select-none">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                  <div className="ml-3 px-3 py-1 bg-white border border-slate-200 text-slate-600 text-[11px] rounded flex items-center gap-2">
                    <span className="text-slate-400">https://</span>
                    <span>techtune.healer/provider/dashboard</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-slate-700 font-semibold tracking-wide uppercase">Live Workshop Node</span>
                </div>
              </div>

              {/* Actual Real Dashboard Screenshot */}
              <div className="relative bg-slate-50 overflow-hidden">
                <img
                  src="/images/console-screenshot.png"
                  alt="TechTune Provider Workstation live interface showing active dispatches, hydraulic bays occupancy, roadside SLA, and revenue breakdown"
                  className="w-full h-auto object-cover object-top block select-none border-b border-slate-200/50"
                />
              </div>

              {/* Bottom Technical Spec Strip */}
              <div className="p-6 sm:p-8 bg-white border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                    DISPATCH ROUTING
                  </span>
                  <h4 className="text-xs font-bold uppercase text-slate-950">
                    Real-Time Proximity Intake
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Automatic GPS matching directs stranded motorists to your facility with vehicle symptoms and pre-cleared pricing.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                    BAY FLOOR OCCUPANCY
                  </span>
                  <h4 className="text-xs font-bold uppercase text-slate-950">
                    Physical Lift Management
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Assign active work orders to 2-post, 4-post, and scissor lifts with live mechanic status and completion alerts.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                    FINANCIAL CLEARANCE
                  </span>
                  <h4 className="text-xs font-bold uppercase text-slate-950">
                    Instant Bakong KHQR Net
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Zero invoicing backlog. Automated 90% workshop settlements clear directly to your local bank account.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── 09. TRUST / PROOF: LARGE TYPOGRAPHIC STATEMENT (NO CARDS) ─────── */}
      <section id="trust" className="py-24 sm:py-36 px-6 sm:px-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto space-y-16">
          <Reveal direction="up">
            <div className="max-w-3xl">
              <p className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400">
                NETWORK STANDARDS
              </p>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.05] uppercase mt-3">
                Built on trust. Backed by verified data.
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 pt-8 border-t border-slate-200">
            <Reveal delay={0} direction="up" className="group">
              <span className="text-5xl sm:text-6xl font-black font-mono text-slate-950 block transition-transform duration-300 group-hover:translate-x-1">
                <Counter end={50} suffix="+" />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-950 mt-2">Verified Facilities</h4>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                Authorized partner workshops equipped with certified heavy hydraulic lifts.
              </p>
            </Reveal>

            <Reveal delay={100} direction="up" className="group">
              <span className="text-5xl sm:text-6xl font-black font-mono text-slate-950 block transition-transform duration-300 group-hover:translate-x-1">
                <Counter end={20} suffix=" km" />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-950 mt-2">Dispatch Radius</h4>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                Guaranteed coverage reaching drivers across Tuol Kork, Chamkarmon, Sen Sok, and Daun Penh.
              </p>
            </Reveal>

            <Reveal delay={200} direction="up" className="group">
              <span className="text-5xl sm:text-6xl font-black font-mono text-slate-950 block transition-transform duration-300 group-hover:translate-x-1">
                <Counter end={100} suffix="%" />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-950 mt-2">OEM Parts</h4>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                Every component distributed is authenticated and backed by workshop warranties.
              </p>
            </Reveal>

            <Reveal delay={300} direction="up" className="group">
              <span className="text-5xl sm:text-6xl font-black font-mono text-slate-950 block transition-transform duration-300 group-hover:translate-x-1">
                <Counter end={24} suffix="/7" />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-950 mt-2">Dispatch Network</h4>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                Round-the-clock emergency assistance with instant Bakong KHQR checkout.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── 10. FINAL ACTION ───────────────────────────────────────────────── */}
      <section className="py-24 sm:py-36 px-6 sm:px-12 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-12">
          <Reveal direction="up">
            <div className="max-w-2xl space-y-4">
              <p className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400">
                JOIN THE NETWORK
              </p>
              <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.0] uppercase">
                Connect your repair facility today.
              </h2>
              <p className="text-slate-400 text-base leading-relaxed">
                No hardware fees. No monthly subscriptions. Approved facilities receive direct customer dispatches within 24 hours of verification.
              </p>
            </div>
          </Reveal>

          <Reveal delay={150} direction="up">
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => openAuth("register")}
                className="group px-8 py-4 bg-white text-slate-950 text-xs font-bold tracking-widest uppercase hover:bg-slate-200 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Register Workshop</span>
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
              </button>
              <button
                onClick={() => openAuth("login")}
                className="group px-8 py-4 bg-transparent border border-slate-700 text-white text-xs font-bold tracking-widest uppercase hover:border-white active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Partner Sign In</span>
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── 11. ARCHITECTURAL FOOTER ───────────────────────────────────────── */}
      <footer className="py-12 px-6 sm:px-12 bg-white border-t border-slate-100 text-xs text-slate-500">
        <Reveal delay={50} direction="up">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-slate-950 text-white flex items-center justify-center font-bold text-[10px]">
                TT
              </div>
              <span className="font-bold text-slate-950">TechTune Healer</span>
              <span>&bull; Automotive Roadside Infrastructure &bull; Phnom Penh</span>
            </div>

            <div className="flex items-center gap-8 font-mono text-[11px] uppercase tracking-wider">
              <a href="#how-it-works" className="hover:text-slate-950 transition">How It Works</a>
              <a href="#driver" className="hover:text-slate-950 transition">Driver</a>
              <a href="#oem-parts" className="hover:text-slate-950 transition">OEM Parts</a>
              <button onClick={() => openAuth("login")} className="hover:text-slate-950 transition cursor-pointer">
                Partner Portal
              </button>
            </div>

            <p className="font-mono text-slate-400">
              &copy; {new Date().getFullYear()} TechTune Healer. All rights reserved.
            </p>
          </div>
        </Reveal>
      </footer>

      {/* ─── ISOLATED PARTNER AUTH MODAL (CLEAN & FUNCTIONAL) ───────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative bg-white rounded-none shadow-2xl border border-slate-300 w-full max-w-md z-10 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header & Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 pt-5 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalTab("login")}
                  className={`text-xs font-bold uppercase tracking-wider pb-1 transition cursor-pointer ${
                    modalTab === "login"
                      ? "text-slate-950 border-b-2 border-slate-950"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Partner Sign In
                </button>
                <span className="text-slate-300 text-xs">/</span>
                <button
                  type="button"
                  onClick={() => setModalTab("register")}
                  className={`text-xs font-bold uppercase tracking-wider pb-1 transition cursor-pointer ${
                    modalTab === "register"
                      ? "text-slate-950 border-b-2 border-slate-950"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Register Facility
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 text-slate-400 hover:text-slate-950 flex items-center justify-center transition cursor-pointer"
                aria-label="Close modal"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              {modalTab === "login" ? (
                /* ─── Sign In Form ─── */
                <div>
                  <div className="mb-5">
                    <h3 className="text-base font-bold text-slate-950 uppercase tracking-tight">Workshop Workstation Sign In</h3>
                    <p className="text-xs text-slate-500 mt-1">Enter your partner credentials to manage active dispatches</p>
                  </div>

                  {loginError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                      {loginError}
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        placeholder="sokha@test.com"
                        className="w-full bg-white border border-slate-300 rounded-none px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-950"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Password</label>
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full bg-white border border-slate-300 rounded-none px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-950"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full bg-slate-950 hover:bg-slate-800 disabled:opacity-60 text-white font-bold tracking-wider uppercase py-3 transition text-xs cursor-pointer mt-2"
                    >
                      {loginLoading ? "Authenticating..." : "Sign In to Workstation"}
                    </button>
                  </form>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Demo Account:</span>
                    <button
                      type="button"
                      onClick={autofillProvider}
                      className="font-bold text-slate-950 underline hover:no-underline cursor-pointer"
                    >
                      Autofill Sokha Auto Clinic
                    </button>
                  </div>
                </div>
              ) : (
                /* ─── Register Form ─── */
                <div>
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-slate-950 uppercase tracking-tight">Workshop Onboarding</h3>
                    <p className="text-xs text-slate-500 mt-1">Join the network to receive automated customer dispatches</p>
                  </div>

                  {regError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                      {regError}
                    </div>
                  )}

                  {regSuccess && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                      Facility registered! Redirecting to workstation...
                    </div>
                  )}

                  <form onSubmit={handleRegSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Facility Name</label>
                        <input
                          type="text"
                          value={regData.businessName}
                          onChange={(e) => setRegData({ ...regData, businessName: e.target.value })}
                          required
                          placeholder="Speedy Auto Fix"
                          className="w-full bg-white border border-slate-300 rounded-none px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-950"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Manager Name</label>
                        <input
                          type="text"
                          value={regData.name}
                          onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                          required
                          placeholder="Sokha Chan"
                          className="w-full bg-white border border-slate-300 rounded-none px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-950"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={regData.email}
                          onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                          required
                          placeholder="sokha@workshop.com"
                          className="w-full bg-white border border-slate-300 rounded-none px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-950"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={regData.phone}
                          onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                          required
                          placeholder="+855 23 888 999"
                          className="w-full bg-white border border-slate-300 rounded-none px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-950"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Address in Phnom Penh</label>
                      <input
                        type="text"
                        value={regData.address}
                        onChange={(e) => setRegData({ ...regData, address: e.target.value })}
                        placeholder="Street 598, Tuol Kork, Phnom Penh"
                        className="w-full bg-white border border-slate-300 rounded-none px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-950"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Password</label>
                        <input
                          type="password"
                          value={regData.password}
                          onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                          required
                          placeholder="Min 6 characters"
                          className="w-full bg-white border border-slate-300 rounded-none px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-950"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Confirm Password</label>
                        <input
                          type="password"
                          value={regData.confirmPassword}
                          onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                          required
                          placeholder="Confirm password"
                          className="w-full bg-white border border-slate-300 rounded-none px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-950"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={regLoading || regSuccess}
                      className="w-full bg-slate-950 hover:bg-slate-800 disabled:opacity-60 text-white font-bold tracking-wider uppercase py-3 transition text-xs mt-3 cursor-pointer"
                    >
                      {regLoading ? "Registering..." : "Complete Registration"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
