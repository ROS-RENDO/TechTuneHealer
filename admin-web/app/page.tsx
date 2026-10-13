"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Reveal, Counter } from "@/components/Reveal";
import { translations, type Language } from "@/lib/i18n";
import { AiScannerModal } from "@/components/AiScannerModal";

// Technical OEM Parts Catalog Data with Bilingual Details
const OEM_PARTS = [
  {
    id: "01",
    name: { en: "Ceramic Brake Pad System", km: "ប្រព័ន្ធស្បែកហ្វ្រាំងសេរ៉ាមិច" },
    brand: "Akebono OEM Spec",
    category: { en: "Braking & Hydraulic", km: "ប្រព័ន្ធហ្វ្រាំង & ធារាសាស្ត្រ" },
    image: "/images/parts/brake_pads.png",
    spec: {
      en: "Ultra-low dust ceramic formulation with chamfered slots. High thermal fade resistance up to 650°C.",
      km: "រូបមន្តសេរ៉ាមិចធូលីទាបបំផុតជាមួយចង្អូរបន្ទន់កម្តៅ។ ធន់នឹងការឡើងកម្តៅរហូតដល់ ៦៥០°C។",
    },
    metrics: [
      { label: { en: "Friction Coeff", km: "មេគុណកកិត" }, val: "0.42 μ" },
      { label: { en: "Operating Temp", km: "កម្តៅដំណើរការ" }, val: "Up to 650°C" },
      { label: { en: "Warranty", km: "ការធានា" }, val: "45,000 km" },
    ],
  },
  {
    id: "02",
    name: { en: "Synthetic Motor Oil 5W-30", km: "ប្រេងម៉ាស៊ីនសំយោគ 5W-30" },
    brand: "Mobil 1 Advanced Full Synthetic",
    category: { en: "Fluids & Lubrication", km: "ប្រេង & ប្រព័ន្ធរំអិល" },
    image: "/images/parts/oil_bottle.png",
    spec: {
      en: "Triple-action formula engineered for severe high-heat tropical driving conditions across Southeast Asia.",
      km: "រូបមន្តពិសេស ៣ ស្រទាប់រៀបចំឡើងសម្រាប់អាកាសធាតុក្តៅសើមក្នុងតំបន់អាស៊ីអាគ្នេយ៍។",
    },
    metrics: [
      { label: { en: "Viscosity", km: "កម្រិតខាប់" }, val: "SAE 5W-30" },
      { label: { en: "Standard", km: "ស្តង់ដារ" }, val: "API SP / ILSAC GF-6A" },
      { label: { en: "Service Life", km: "អាយុកាលប្រើ" }, val: "10,000 km" },
    ],
  },
  {
    id: "03",
    name: { en: "AGM 12V High-Output Battery", km: "អាគុយ AGM 12V កម្លាំងខ្ពស់" },
    brand: "Varta Dynamic AGM",
    category: { en: "Electrical & Ignition", km: "ប្រព័ន្ធអគ្គិសនី & បញ្ឆេះ" },
    image: "/images/parts/car_battery.png",
    spec: {
      en: "Absorbent Glass Mat design delivering 3x the cycle life of conventional lead-acid batteries with zero spill risk.",
      km: "បច្ចេកវិទ្យា Absorbent Glass Mat ផ្តល់អាយុកាលវែងជាងអាគុយទឹក ៣ ដង ដោយគ្មានហានិភ័យហៀរទឹកអាស៊ីត។",
    },
    metrics: [
      { label: { en: "Cold Cranking", km: "កម្លាំងបញ្ឆេះ" }, val: "850 CCA" },
      { label: { en: "Capacity", km: "ចំណុះថាមពល" }, val: "80 Ah" },
      { label: { en: "Guarantee", km: "ការធានា" }, val: "3-Year Direct Swap" },
    ],
  },
  {
    id: "04",
    name: { en: "All-Weather Radial Tires", km: "សំបកកង់គ្រប់រដូវកាល Radial" },
    brand: "Michelin Primacy 4",
    category: { en: "Tires & Suspension", km: "កង់ & ប្រព័ន្ធជើងក្រោម" },
    image: "/images/parts/car_tire.png",
    spec: {
      en: "EverGrip silica compound providing maximum braking grip on wet Phnom Penh monsoon asphalt.",
      km: "បច្ចេកវិទ្យា EverGrip ស៊ីលីកា ផ្តល់លទ្ធភាពចាប់ហ្វ្រាំងអតិបរិមាលើផ្លូវជ័ររអិលក្នុងរដូវវស្សានៅភ្នំពេញ។",
    },
    metrics: [
      { label: { en: "Treadwear", km: "ភាពធន់កង់" }, val: "UTQG 340 A A" },
      { label: { en: "Wet Braking", km: "ហ្វ្រាំងផ្លូវសើម" }, val: "Class A Grip" },
      { label: { en: "Lifespan", km: "ចម្ងាយប្រើ" }, val: "60,000 km" },
    ],
  },
  {
    id: "05",
    name: { en: "Micro-Pore Engine Air Filter", km: "តម្រងខ្យល់ម៉ាស៊ីន Micro-Pore" },
    brand: "Denso OEM Certified",
    category: { en: "Air & Fuel Induction", km: "ប្រព័ន្ធខ្យល់ & ចំហេះសាំង" },
    image: "/images/parts/air_filter.png",
    spec: {
      en: "Multi-layered synthetic fibers capturing 99.5% of fine road dust, soot, and particulate debris.",
      km: "ស្រទាប់សរសៃសំយោគច្រើនជាន់ ចាប់យកធូលីដីដងផ្លូវ ផ្សែង និងកម្ទេចកំទីល្អិតៗបាន ៩៩.៥%។",
    },
    metrics: [
      { label: { en: "Efficiency", km: "ប្រសិទ្ធភាព" }, val: "99.5% at 5μm" },
      { label: { en: "Airflow", km: "លំហូរខ្យល់" }, val: "High-flow OEM" },
      { label: { en: "Service", km: "ការផ្លាស់ប្តូរ" }, val: "20,000 km" },
    ],
  },
  {
    id: "06",
    name: { en: "Twin-Tube Gas Shock Absorber", km: "បូមហ្គាសទប់លំនឹង Twin-Tube" },
    brand: "KYB Excel-G Heavy Duty",
    category: { en: "Chassis & Ride Control", km: "ជើងក្រោម & ការទប់លំនឹង" },
    image: "/images/parts/shock_absorber.png",
    spec: {
      en: "Nitrogen gas pressurized dual chambers eliminating fluid foaming for predictable steering feedback.",
      km: "បន្ទប់ភ្លោះហ្គាសអាសូតសម្ពាធខ្ពស់ បំបាត់ពពុះប្រេង និងរក្សាលំនឹងចង្កូតរថយន្តបានល្អឥតខ្ចោះ។",
    },
    metrics: [
      { label: { en: "Damping", km: "ការស្រូបទម្ងន់" }, val: "Velocity-sensitive" },
      { label: { en: "Pressure", km: "កម្លាំងសង្កត់" }, val: "Nitrogen 25 Bar" },
      { label: { en: "Warranty", km: "ការធានា" }, val: "2-Year Unlimited" },
    ],
  },
];

export default function EditorialLandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  // ─── Language State (Bilingual English & Khmer) ───────────────────────────
  const [lang, setLang] = useState<Language>("en");
  const t = translations[lang];

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("techtune_lang");
      if (savedLang === "en" || savedLang === "km") {
        setLang(savedLang as Language);
      }
    } catch {
      // Ignore if localStorage unavailable
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang: Language = lang === "en" ? "km" : "en";
    setLang(nextLang);
    try {
      localStorage.setItem("techtune_lang", nextLang);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ─── Interactive States ───────────────────────────────────────────────────
  const [activePartIndex, setActivePartIndex] = useState(0);

  // Auth Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"login" | "register">("login");

  // AI Scanner Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

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
    } else if (!isAiModalOpen) {
      document.body.style.overflow = "unset";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen, isAiModalOpen]);

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
        setLoginError(data.message || (lang === "km" ? "អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ" : "Invalid email or password."));
        return;
      }

      if (data.user?.role?.toUpperCase() !== "PROVIDER") {
        setLoginError(lang === "km" ? "ច្រកចូលនេះសម្រាប់តែយានដ្ឋានដៃគូដែលបានចុះឈ្មោះប៉ុណ្ណោះ។" : "This portal is restricted to registered workshop partners.");
        return;
      }

      localStorage.setItem("provider_token", data.token);
      localStorage.setItem("provider_user", JSON.stringify(data.user));
      setIsModalOpen(false);
      router.push("/provider/dashboard");
    } catch {
      setLoginError(lang === "km" ? "មិនអាចភ្ជាប់ទៅកាន់ម៉ាស៊ីនមេបានទេ។ សូមប្រាកដថា Backend កំពុងដំណើរការ។" : "Unable to connect to server. Please ensure backend is running.");
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
      setRegError(lang === "km" ? "ពាក្យសម្ងាត់ទាំងពីរមិនត្រូវគ្នាទេ។" : "Passwords do not match. Please check.");
      return;
    }

    if (regData.password.length < 6) {
      setRegError(lang === "km" ? "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៦ តួអក្សរ។" : "Password must be at least 6 characters.");
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
        setRegError(data.message || (lang === "km" ? "ការចុះឈ្មោះមិនបានជោគជ័យ។ សូមពិនិត្យទិន្នន័យឡើងវិញ។" : "Registration failed. Please check your data."));
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
      setRegError(lang === "km" ? "មិនអាចភ្ជាប់ទៅកាន់ម៉ាស៊ីនមេបានទេ។ សូមព្យាយាមម្តងទៀត។" : "Unable to connect to server. Please try again.");
    } finally {
      setRegLoading(false);
    }
  };

  const activePart = OEM_PARTS[activePartIndex];

  return (
    <div className="min-h-screen bg-white text-slate-950 flex flex-col antialiased selection:bg-slate-950 selection:text-white">
      {/* ─── 01. NAVIGATION (COMPANY ARCHITECTURE & LANGUAGE SWITCHER) ─────── */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md shadow-xs border-b border-slate-200/80 py-0"
            : "bg-white/95 border-b border-slate-100 py-1"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12 h-20 flex items-center justify-between">
          {/* Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="w-9 h-9 rounded-lg bg-slate-950 p-1.5 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-xs">
              <img src="/logo-white.png" alt="TechTune Healer" className="w-full h-auto object-contain" />
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
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold tracking-wider uppercase text-slate-500">
            <a href="#how-it-works" className="hover:text-slate-950 transition-colors">
              {t.navHowItWorks}
            </a>
            <a href="#driver" className="hover:text-slate-950 transition-colors">
              {t.navDriver}
            </a>
            <a href="#operations" className="hover:text-slate-950 transition-colors">
              {t.navOperations}
            </a>
            <a href="#oem-parts" className="hover:text-slate-950 transition-colors">
              {t.navOemParts}
            </a>
            <a href="#workstation" className="hover:text-slate-950 transition-colors">
              {t.navWorkstation}
            </a>
            <a href="#trust" className="hover:text-slate-950 transition-colors">
              {t.navTrust}
            </a>
          </nav>

          {/* Action & Tools (AI Scanner trigger + Language Switcher + Partner Portal) */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* AI Scanner Button */}
            <button
              type="button"
              onClick={() => setIsAiModalOpen(true)}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold tracking-wider uppercase transition cursor-pointer flex items-center gap-1.5 rounded-sm"
              title="Open AI Vehicle Scanner / បើកម៉ាស៊ីនស្កេន AI"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
              </span>
              <span>{t.navAiScan}</span>
            </button>

            {/* Language Switcher Button (EN / ខ្មែរ) */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-2.5 py-1 text-xs font-mono font-bold tracking-wider rounded-sm border border-slate-300 hover:border-slate-950 transition flex items-center gap-1 cursor-pointer bg-white text-slate-800"
              title="Switch language / ប្តូរភាសា"
            >
              <span className={lang === "en" ? "text-blue-600 font-extrabold" : "text-slate-400"}>
                EN
              </span>
              <span className="text-slate-300">/</span>
              <span className={lang === "km" ? "text-blue-600 font-extrabold" : "text-slate-400"}>
                ខ្មែរ
              </span>
            </button>

            <button
              onClick={() => openAuth("login")}
              className="hidden sm:inline-block text-xs font-semibold tracking-wider uppercase text-slate-600 hover:text-slate-950 transition cursor-pointer"
            >
              {t.navSignIn}
            </button>

            <button
              onClick={() => openAuth("register")}
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-slate-950 text-white text-xs font-semibold tracking-wider uppercase hover:bg-slate-800 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              {t.navPartnerPortal}
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
                {t.heroEyebrow}
              </p>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-950 tracking-tight leading-[0.98] uppercase">
                {t.heroTitle1} <br />
                <span className="text-slate-400">{t.heroTitle2}</span>
              </h1>
              <p className="text-slate-600 text-lg sm:text-xl font-normal max-w-2xl mt-6 leading-relaxed">
                {t.heroSubtitle}
              </p>
            </Reveal>

            <Reveal direction="up" delay={150}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                {/* AI Scanner CTA Button */}
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(true)}
                  className="group px-7 py-4 bg-blue-600 text-white text-xs font-black tracking-wider uppercase hover:bg-blue-700 active:scale-[0.98] transition-all inline-flex items-center gap-3 cursor-pointer shadow-sm"
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                  </span>
                  <span>{t.heroCtaAiScan}</span>
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
                </button>

                <a
                  href="#driver"
                  className="group px-8 py-4 bg-slate-950 text-white text-xs font-bold tracking-wider uppercase hover:bg-slate-800 active:scale-[0.98] transition-all inline-flex items-center gap-3 cursor-pointer"
                >
                  <span>{t.heroCtaDriver}</span>
                  <span className="inline-block transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden="true">&darr;</span>
                </a>

                <button
                  onClick={() => openAuth("register")}
                  className="px-8 py-4 bg-transparent border border-slate-300 text-slate-950 text-xs font-bold tracking-wider uppercase hover:border-slate-950 active:scale-[0.98] transition-all cursor-pointer"
                >
                  {t.heroCtaPartner}
                </button>
              </div>
            </Reveal>
          </div>

          {/* Real Technician Photo with Adjacent Technical Annotations */}
          <Reveal direction="up" delay={200}>
            <div className="group relative w-full overflow-hidden bg-slate-950">
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
                    <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">
                      {t.heroRefLabel}
                    </span>
                    <p className="text-sm font-bold tracking-tight mt-1 text-white">
                      {t.heroRefVal}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {t.heroRefSub}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">
                      {t.heroSlaLabel}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                      </span>
                      <p className="text-2xl font-black font-mono tracking-tight text-white">
                        {t.heroSlaVal}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {t.heroSlaSub}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">
                      {t.heroReachLabel}
                    </span>
                    <p className="text-2xl font-black font-mono tracking-tight mt-0.5 text-white">
                      {t.heroReachVal}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {t.heroReachSub}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">
                      {t.heroPayLabel}
                    </span>
                    <p className="text-2xl font-black font-mono tracking-tight mt-0.5 text-emerald-400">
                      {t.heroPayVal}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {t.heroPaySub}
                    </p>
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
                {t.philosophyEyebrow}
              </p>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.05] uppercase">
                {t.philosophyTitle}
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
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950 leading-tight whitespace-pre-line">
                  {t.pillar1Title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal pt-2">
                  {t.pillar1Desc}
                </p>
              </div>
            </Reveal>

            <Reveal delay={150} direction="up" className="group md:border-l md:border-slate-200 md:pl-12 lg:pl-16">
              <div className="space-y-4">
                <span className="text-5xl sm:text-6xl font-black font-mono text-slate-950 block leading-none transition-transform duration-300 group-hover:translate-x-1">
                  02
                </span>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950 leading-tight whitespace-pre-line">
                  {t.pillar2Title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal pt-2">
                  {t.pillar2Desc}
                </p>
              </div>
            </Reveal>

            <Reveal delay={300} direction="up" className="group md:border-l md:border-slate-200 md:pl-12 lg:pl-16">
              <div className="space-y-4">
                <span className="text-5xl sm:text-6xl font-black font-mono text-slate-950 block leading-none transition-transform duration-300 group-hover:translate-x-1">
                  03
                </span>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950 leading-tight whitespace-pre-line">
                  {t.pillar3Title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal pt-2">
                  {t.pillar3Desc}
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
                {t.howEyebrow}
              </p>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight uppercase mt-3">
                {t.howTitle}
              </h2>
              <p className="text-slate-600 text-base mt-4 leading-relaxed">
                {t.howSubtitle}
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 pt-8 border-t border-slate-200">
            {/* Step 1 */}
            <Reveal delay={0} direction="up" className="group">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
                  {t.step1Stage}
                </span>
                <h3 className="text-xl font-bold text-slate-950 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                  {t.step1Title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {t.step1Desc}
                </p>
              </div>
            </Reveal>

            {/* Step 2 */}
            <Reveal delay={150} direction="up" className="group">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
                  {t.step2Stage}
                </span>
                <h3 className="text-xl font-bold text-slate-950 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                  {t.step2Title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {t.step2Desc}
                </p>
              </div>
            </Reveal>

            {/* Step 3 */}
            <Reveal delay={300} direction="up" className="group">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
                  {t.step3Stage}
                </span>
                <h3 className="text-xl font-bold text-slate-950 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                  {t.step3Title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {t.step3Desc}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── 05. DRIVER PLATFORM: PHONE + ANNOTATIONS ──────────────────────── */}
      <section id="driver" className="py-24 sm:py-36 px-6 sm:px-12 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Centered Headline */}
          <Reveal direction="up">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-24">
              <p className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400">
                {t.driverEyebrow}
              </p>
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-950 tracking-tight leading-none uppercase">
                {t.driverTitle}
              </h2>
              <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                {t.driverSubtitle}
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
                        {t.driverRadarTitle}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {t.driverRadarDesc}
                    </p>
                  </div>
                </Reveal>

                <Reveal delay={200} direction="right">
                  <div className="group space-y-2 p-3 -m-3 rounded-lg hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center gap-3 lg:justify-end">
                      <span className="w-2 h-2 rounded-full bg-slate-950 transition-transform duration-300 group-hover:scale-125" />
                      <h4 className="text-sm font-black uppercase tracking-wider text-slate-950">
                        {t.driverSosTitle}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {t.driverSosDesc}
                    </p>
                  </div>
                </Reveal>
              </div>

              {/* Centered Phone Frame with Gentle Ambient Floating Motion */}
              <div className="lg:col-span-4 flex justify-center order-1 lg:order-2">
                <Reveal delay={150} direction="up" className="relative flex justify-center w-full">
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
                  <div
                    onClick={() => setIsAiModalOpen(true)}
                    className="group space-y-2 p-3 -m-3 rounded-lg hover:bg-blue-50/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600 transition-transform duration-300 group-hover:scale-125" />
                      <h4 className="text-sm font-black uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                        <span>{t.driverObdTitle}</span>
                        <span className="text-[10px]">&rarr;</span>
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {t.driverObdDesc}
                    </p>
                  </div>
                </Reveal>

                <Reveal delay={350} direction="left">
                  <div className="group space-y-2 p-3 -m-3 rounded-lg hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-slate-950 transition-transform duration-300 group-hover:scale-125" />
                      <h4 className="text-sm font-black uppercase tracking-wider text-slate-950">
                        {t.driverChatTitle}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {t.driverChatDesc}
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
                {t.opsEyebrow}
              </p>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] uppercase mt-3">
                {t.opsTitle}
              </h2>
              <p className="text-slate-400 text-base mt-4 leading-relaxed max-w-xl">
                {t.opsSubtitle}
              </p>
            </div>
          </Reveal>

          {/* Asymmetric Magazine Composition */}
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
                    {t.ops1Title}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{t.ops1Badge}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-lg mt-2">
                  {t.ops1Desc}
                </p>
              </Reveal>
            </div>

            {/* Right Column: Diagnostics (Clickable AI Trigger) & Workshop Facility */}
            <div className="lg:col-span-5 space-y-12 lg:pt-12">
              {/* Frame 1: Diagnostics (Interactive Scan Link) */}
              <Reveal delay={150} direction="up">
                <div
                  onClick={() => setIsAiModalOpen(true)}
                  className="space-y-3 group cursor-pointer"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                    <img
                      src="/images/diagnostics-scan.jpg"
                      alt="Automotive diagnostic engine scanner tool"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/10 transition-colors flex items-center justify-center">
                      <span className="px-3.5 py-2 bg-blue-600/90 backdrop-blur-xs text-white text-[11px] font-mono font-bold uppercase tracking-wider shadow-sm opacity-90 group-hover:opacity-100 group-hover:scale-105 transition">
                        {lang === "km" ? "បើកម៉ាស៊ីនស្កេន AI ឥឡូវនេះ" : "Launch AI Scanner"} &rarr;
                      </span>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between pt-2 border-t border-slate-800">
                    <span className="text-sm font-bold uppercase tracking-wider text-white group-hover:text-blue-400 transition-colors">
                      {t.ops2Title}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{t.ops2Badge}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t.ops2Desc}
                  </p>
                </div>
              </Reveal>

              {/* Frame 2: Workshop Facility Bays */}
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
                      {t.ops3Title}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{t.ops3Badge}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t.ops3Desc}
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
                  {t.partsEyebrow}
                </p>
                <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight uppercase mt-3">
                  {t.partsTitle}
                </h2>
              </div>
              <p className="text-xs font-mono text-slate-500 max-w-xs">
                {t.partsSubtitle}
              </p>
            </div>
          </Reveal>

          {/* Technical Showroom Stage */}
          <Reveal delay={100} direction="up">
            <div className="border border-slate-200 bg-[#FAFAFA] p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Large Spotlight Part Image */}
              <div className="group lg:col-span-6 flex items-center justify-center h-64 sm:h-80 bg-white border border-slate-200/80 p-8 overflow-hidden">
                <img
                  src={activePart.image}
                  alt={activePart.name[lang]}
                  key={activePart.id}
                  className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out"
                />
              </div>

              {/* Part Specs & Details */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase block">
                    PART {activePart.id} &bull; {activePart.category[lang]}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight mt-1">
                    {activePart.name[lang]}
                  </h3>
                  <p className="text-xs font-mono font-semibold text-slate-600 mt-1">
                    {activePart.brand}
                  </p>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {activePart.spec[lang]}
                </p>

                {/* Technical Spec Metrics */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
                  {activePart.metrics.map((m, idx) => (
                    <div key={idx}>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        {m.label[lang]}
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
                    {part.name[lang]}
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
                  {t.wsEyebrow}
                </p>
                <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight uppercase mt-3">
                  {t.wsTitle}
                </h2>
                <p className="text-slate-600 text-sm sm:text-base mt-4 leading-relaxed font-normal">
                  {t.wsSubtitle}
                </p>
              </div>
              <div className="flex items-center gap-3 self-start md:self-auto">
                <button
                  onClick={() => openAuth("login")}
                  className="px-6 py-3 bg-slate-950 text-white text-xs font-bold tracking-wider uppercase hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
                >
                  {t.wsCtaLaunch}
                </button>
                <button
                  onClick={() => openAuth("register")}
                  className="px-6 py-3 border border-slate-300 text-slate-900 text-xs font-bold tracking-wider uppercase hover:border-slate-900 active:scale-95 transition-all cursor-pointer bg-white"
                >
                  {t.wsCtaRegister}
                </button>
              </div>
            </div>
          </Reveal>

          {/* Architectural Browser Console Frame */}
          <Reveal delay={150} direction="up">
            <div className="border border-slate-300/80 bg-white shadow-xl hover:shadow-2xl transition-shadow duration-500 overflow-hidden">
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
                  <span className="text-slate-700 font-semibold tracking-wide uppercase">
                    {lang === "km" ? "យានដ្ឋានបន្តផ្ទាល់" : "Live Workshop Node"}
                  </span>
                </div>
              </div>

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
                    {t.wsFeature1Title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t.wsFeature1Desc}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                    BAY FLOOR OCCUPANCY
                  </span>
                  <h4 className="text-xs font-bold uppercase text-slate-950">
                    {t.wsFeature2Title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t.wsFeature2Desc}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                    FINANCIAL CLEARANCE
                  </span>
                  <h4 className="text-xs font-bold uppercase text-slate-950">
                    {t.wsFeature3Title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t.wsFeature3Desc}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── 09. TRUST / PROOF ─────────────────────────────────────────────── */}
      <section id="trust" className="py-24 sm:py-36 px-6 sm:px-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto space-y-16">
          <Reveal direction="up">
            <div className="max-w-3xl">
              <p className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400">
                {t.trustEyebrow}
              </p>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.05] uppercase mt-3">
                {t.trustTitle}
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 pt-8 border-t border-slate-200">
            <Reveal delay={0} direction="up" className="group">
              <span className="text-5xl sm:text-6xl font-black font-mono text-slate-950 block transition-transform duration-300 group-hover:translate-x-1">
                <Counter end={50} suffix="+" />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-950 mt-2">
                {t.trustCard1Title}
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                {t.trustCard1Desc}
              </p>
            </Reveal>

            <Reveal delay={100} direction="up" className="group">
              <span className="text-5xl sm:text-6xl font-black font-mono text-slate-950 block transition-transform duration-300 group-hover:translate-x-1">
                <Counter end={20} suffix=" km" />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-950 mt-2">
                {t.trustCard2Title}
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                {t.trustCard2Desc}
              </p>
            </Reveal>

            <Reveal delay={200} direction="up" className="group">
              <span className="text-5xl sm:text-6xl font-black font-mono text-slate-950 block transition-transform duration-300 group-hover:translate-x-1">
                <Counter end={100} suffix="%" />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-950 mt-2">
                {t.trustCard3Title}
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                {t.trustCard3Desc}
              </p>
            </Reveal>

            <Reveal delay={300} direction="up" className="group">
              <span className="text-5xl sm:text-6xl font-black font-mono text-slate-950 block transition-transform duration-300 group-hover:translate-x-1">
                <Counter end={24} suffix="/7" />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-950 mt-2">
                {t.trustCard4Title}
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                {t.trustCard4Desc}
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
                {t.joinEyebrow}
              </p>
              <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.0] uppercase">
                {t.joinTitle}
              </h2>
              <p className="text-slate-400 text-base leading-relaxed">
                {t.joinSubtitle}
              </p>
            </div>
          </Reveal>

          <Reveal delay={150} direction="up">
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => openAuth("register")}
                className="group px-8 py-4 bg-white text-slate-950 text-xs font-bold tracking-widest uppercase hover:bg-slate-200 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>{t.joinBtnRegister}</span>
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
              </button>
              <button
                onClick={() => openAuth("login")}
                className="group px-8 py-4 bg-transparent border border-slate-700 text-white text-xs font-bold tracking-widest uppercase hover:border-white active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>{t.joinBtnLogin}</span>
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
              <div className="w-7 h-7 rounded-md bg-slate-950 p-1 flex items-center justify-center">
                <img src="/logo-white.png" alt="TechTune Healer" className="w-full h-auto object-contain" />
              </div>
              <span className="font-bold text-slate-950">TechTune Healer</span>
              <span>&bull; {t.footerTagline}</span>
            </div>

            <div className="flex items-center gap-6 sm:gap-8 font-mono text-[11px] uppercase tracking-wider">
              <a href="#how-it-works" className="hover:text-slate-950 transition">
                {t.navHowItWorks}
              </a>
              <a href="#driver" className="hover:text-slate-950 transition">
                {t.navDriver}
              </a>
              <button
                type="button"
                onClick={() => setIsAiModalOpen(true)}
                className="hover:text-blue-600 transition cursor-pointer text-blue-600 font-bold"
              >
                {t.navAiScan}
              </button>
              <button onClick={() => openAuth("login")} className="hover:text-slate-950 transition cursor-pointer">
                {t.navPartnerPortal}
              </button>
            </div>

            <p className="font-mono text-slate-400">
              &copy; {new Date().getFullYear()} {t.footerRights}
            </p>
          </div>
        </Reveal>
      </footer>

      {/* ─── INTERACTIVE AI VEHICLE SCANNER MODAL ──────────────────────────── */}
      <AiScannerModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        lang={lang}
        onOpenAuth={openAuth}
      />

      {/* ─── ISOLATED PARTNER AUTH MODAL (CLEAN & FUNCTIONAL) ───────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

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
                  {t.authSignInTab}
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
                  {t.authRegisterTab}
                </button>
              </div>

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
                    <h3 className="text-base font-bold text-slate-950 uppercase tracking-tight">
                      {t.authSignInTitle}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {t.authSignInSub}
                    </p>
                  </div>

                  {loginError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                      {loginError}
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        {t.authEmailLabel}
                      </label>
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
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        {t.authPasswordLabel}
                      </label>
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
                      {loginLoading ? t.authSigningIn : t.authSubmitSignIn}
                    </button>
                  </form>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Demo Account:</span>
                    <button
                      type="button"
                      onClick={autofillProvider}
                      className="font-bold text-slate-950 underline hover:no-underline cursor-pointer"
                    >
                      {t.authDemoFill}
                    </button>
                  </div>
                </div>
              ) : (
                /* ─── Register Form ─── */
                <div>
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-slate-950 uppercase tracking-tight">
                      {t.authRegisterTitle}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {t.authRegisterSub}
                    </p>
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
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          {t.authBusinessNameLabel}
                        </label>
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
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          {t.authFullNameLabel}
                        </label>
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
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          {t.authEmailLabel}
                        </label>
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
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          {t.authPhoneLabel}
                        </label>
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
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        {t.authAddressLabel}
                      </label>
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
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          {t.authPasswordLabel}
                        </label>
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
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          {t.authConfirmPassLabel}
                        </label>
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
                      {regLoading ? t.authRegistering : t.authSubmitRegister}
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
