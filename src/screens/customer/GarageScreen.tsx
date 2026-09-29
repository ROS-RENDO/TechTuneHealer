import { useRef, useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  Modal,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { WebView } from "react-native-webview";
import { Asset } from "expo-asset";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import type { CustomerStackScreenProps, CustomerStackParamList } from "../../navigation/types";
import type { Vehicle } from "../../types";
import { useVehicleStore } from "../../store/vehicleStore";
import { AnimatedEntrance } from "../../components";
import { colors, spacing, shadows } from "../../constants/theme";

const { width, height } = Dimensions.get("window");

type GarageScreenRoute = RouteProp<CustomerStackParamList, "Garage">;

// ── Dedicated GLB 3D Studio HTML ─────────────────────────────────────────────
function buildModelViewerHtml(primaryUri: string, fallbackUri?: string, modelTitle?: string): string {
  const displayTitle = modelTitle || "TECHTUNE 3D STUDIO";
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
    html, body {
      width:100%; height:100%;
      background:#F8FAFC;
      overflow:hidden;
    }
    model-viewer {
      width:100%; height:100%;
      background-color:#F8FAFC;
      --poster-color:#F8FAFC;
    }
    #brand {
      position:absolute; top:18px; left:50%; transform:translateX(-50%);
      font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size:12px; font-weight:800;
      color:#94A3B8; letter-spacing:2.5px; text-transform:uppercase;
      pointer-events:none; z-index:5;
    }
    #loading-overlay {
      position:absolute; inset:0;
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      gap:14px; background:#F8FAFC; z-index:10;
      transition: opacity 0.4s ease;
    }
    .ring {
      width:44px; height:44px; border-radius:50%;
      border:3.5px solid #E2E8F0; border-top-color:#2563EB;
      animation:sp 0.85s linear infinite;
    }
    @keyframes sp { to { transform:rotate(360deg); } }
    #loading-overlay p {
      color:#64748B; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size:13px; font-weight:600; letter-spacing:0.3px;
    }
  </style>
</head>
<body>
  <div id="loading-overlay">
    <div class="ring"></div>
    <p>Loading 3D ${displayTitle}…</p>
  </div>
  <div id="brand">${displayTitle}</div>

  <model-viewer
    id="mv"
    src="${primaryUri}"
    alt="${displayTitle} 3D Model"
    auto-rotate
    auto-rotate-delay="800"
    rotation-per-second="20deg"
    camera-controls
    touch-action="pan-y"
    shadow-intensity="1.2"
    shadow-softness="0.75"
    exposure="1.0"
    camera-orbit="35deg 72deg 5.5m"
    field-of-view="32deg"
    min-camera-orbit="auto auto 2m"
    max-camera-orbit="auto auto 12m"
    interaction-prompt="none"
    style="width:100%;height:100%;background:#F8FAFC;"
  ></model-viewer>

  <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"></script>
  <script>
    var mv = document.getElementById('mv');
    var overlay = document.getElementById('loading-overlay');
    var fallbackUri = ${fallbackUri ? JSON.stringify(fallbackUri) : 'null'};
    var triedFallback = false;

    function hideOverlay() {
      if (!overlay) return;
      overlay.style.opacity = '0';
      setTimeout(function() {
        if (overlay) overlay.style.display = 'none';
      }, 350);
    }

    if (mv) {
      mv.addEventListener('load', function() {
        console.log('GLB 3D model loaded successfully!');
        hideOverlay();
      });

      mv.addEventListener('error', function(err) {
        console.warn('GLB error on:', mv.src, err);
        if (fallbackUri && !triedFallback && mv.src !== fallbackUri) {
          triedFallback = true;
          console.log('Trying fallback URI:', fallbackUri);
          mv.src = fallbackUri;
        } else {
          hideOverlay();
        }
      });
    }

    setTimeout(hideOverlay, 6000);
  </script>
</body>
</html>`;
}

// ── Bespoke Clean Automotive SVG Icons ──────────────────────────────────────
function EngineSvg({ color = "#2563EB", size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 8V6H10V8H14V6H18V8M3 11H6V18H3V11ZM6 9H18C19.1 9 20 9.9 20 11V17C20 18.1 19.1 19 18 19H6C4.9 19 4 18.1 4 17V11C4 9.9 4.9 9 6 9ZM10 12V16M14 12V16M20 13H22V15H20V13Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function OilSvg({ color = "#2563EB", size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2.5C12 2.5 6 9.5 6 14.5C6 17.81 8.69 20.5 12 20.5C15.31 20.5 18 17.81 18 14.5C18 9.5 12 2.5 12 2.5Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.5 14C9.5 12.6 10.6 11.5 12 11.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function BatterySvg({ color = "#2563EB", size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="6" width="18" height="14" rx="3" stroke={color} strokeWidth="1.8" />
      <Path d="M7 3V6M17 3V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M7 13H11M9 11V15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M15 13H17" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

function CoolantSvg({ color = "#2563EB", size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14 14.76V5C14 3.9 13.1 3 12 3C10.9 3 10 3.9 10 5V14.76C8.79 15.56 8 16.94 8 18.5C8 20.99 10.01 23 12.5 23C14.99 23 17 20.99 17 18.5C17 16.94 16.21 15.56 15 14.76H14Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M12 9V14" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="12.5" cy="18.5" r="2" fill={color} />
    </Svg>
  );
}

function TireSvg({ color = "#D97706", size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
      <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.8" />
      <Circle cx="12" cy="12" r="2" fill={color} />
      <Path d="M12 3V7M12 17V21M3 12H7M17 12H21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function AlternatorSvg({ color = "#2563EB", size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.8" />
      <Path d="M13 7L9 13H14L11 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CarSvg({ color = "#2563EB", size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 16L5.5 10.5C5.8 9.5 6.7 8.8 7.8 8.8H16.2C17.3 8.8 18.2 9.5 18.5 10.5L20 16M4 16H20M4 16C3.4 16 3 16.4 3 17V19C3 19.6 3.4 20 4 20H5C5.6 20 6 19.6 6 19V18H18V19C18 19.6 18.4 20 19 20H20C20.6 20 21 19.6 21 19V17C21 16.4 20.6 16 20 16M7 14H7.01M17 14H17.01"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function renderMetricSvg(id: string, color: string) {
  switch (id) {
    case "engine": return <EngineSvg color={color} size={20} />;
    case "oil": return <OilSvg color={color} size={20} />;
    case "battery": return <BatterySvg color={color} size={20} />;
    case "coolant": return <CoolantSvg color={color} size={20} />;
    case "tires": return <TireSvg color={color} size={20} />;
    case "alternator": return <AlternatorSvg color={color} size={20} />;
    default: return <EngineSvg color={color} size={20} />;
  }
}

type HotspotKey = "engine" | "battery" | "tires";

interface MetricItem {
  id: HotspotKey | "coolant" | "alternator" | "oil";
  label: string;
  value: string;
  sub: string;
  color: string;
  bg: string;
  pct: number;
}

const HEALTH_METRICS: MetricItem[] = [
  { id: "engine",     label: "Engine & ECU",    value: "Optimal", sub: "0 DTC Fault codes · Timing nominal", color: "#2563EB", bg: "#EFF6FF", pct: 1.0 },
  { id: "oil",        label: "Motor Oil",       value: "88%",     sub: "8,450 km until next service",         color: "#2563EB", bg: "#EFF6FF", pct: 0.88 },
  { id: "battery",    label: "12V Battery",     value: "12.6V",   sub: "Charge nominal · 100% Health",        color: "#0284C7", bg: "#F0F9FF", pct: 0.94 },
  { id: "coolant",    label: "Coolant Temp",    value: "89°C",    sub: "Normal operating range (80-95°C)",    color: "#2563EB", bg: "#EFF6FF", pct: 0.86 },
  { id: "tires",      label: "Tire Pressure",   value: "32 PSI",  sub: "Front-left low (35 PSI recommended)", color: "#D97706", bg: "#FFFBEB", pct: 0.72 },
  { id: "alternator", label: "Alternator",      value: "14.2V",   sub: "Charging output nominal",             color: "#2563EB", bg: "#EFF6FF", pct: 1.0 },
];

const SERVICE_HISTORY = [
  { icon: "water",     title: "Oil & Filter Change",     date: "Aug 2026", km: "82,000 km", shop: "TechTune Certified Hub" },
  { icon: "disc",      title: "Tire Rotation & Balance", date: "Jun 2026", km: "78,500 km", shop: "Phnom Penh Auto Care" },
  { icon: "construct", title: "A/C System Service",      date: "Mar 2026", km: "75,200 km", shop: "Master Auto Garage" },
  { icon: "build",     title: "Brake Pad Replacement",   date: "Jan 2026", km: "71,000 km", shop: "Toyota Authorized Service" },
];

const DEFAULT_GARAGE_VEHICLE: Vehicle = {
  id: "lexus-rx350-default",
  make: "Lexus",
  model: "RX350 Luxury AWD",
  year: 2024,
  plateNumber: "2A-8888",
  color: "Sonic Titanium",
};

// Map each vehicle to its dedicated downloaded 3D GLB model in assets/
function getModelAssetForVehicle(v: Vehicle) {
  const text = `${v.make} ${v.model}`.toLowerCase();
  if (
    text.includes("land cruiser") ||
    text.includes("toyota land") ||
    text.includes("lc300") ||
    text.includes("prado")
  ) {
    return require("../../../assets/landcruiser.glb");
  }
  if (
    text.includes("tesla") ||
    text.includes("model y") ||
    text.includes("model 3") ||
    text.includes("cyber")
  ) {
    return require("../../../assets/teslamodely.glb");
  }
  if (
    text.includes("ford") ||
    text.includes("raptor") ||
    text.includes("f150") ||
    text.includes("f-150") ||
    text.includes("ranger")
  ) {
    return require("../../../assets/raptor.glb");
  }
  if (
    text.includes("mercedes") ||
    text.includes("maybach") ||
    text.includes("benz") ||
    text.includes("s680")
  ) {
    return require("../../../assets/maybach.glb");
  }
  return require("../../../assets/car.glb");
}

export function GarageScreen() {
  const navigation = useNavigation<CustomerStackScreenProps<"Garage">["navigation"]>();
  const route = useRoute<GarageScreenRoute>();
  const { vehicles, activeVehicleId, setActiveVehicleId } = useVehicleStore();
  const routeVehicle = route.params?.vehicle;
  const initialVehicle =
    routeVehicle ||
    vehicles.find((v) => v.id === activeVehicleId) ||
    vehicles[0] ||
    DEFAULT_GARAGE_VEHICLE;
  const [vehicle, setVehicle] = useState<Vehicle>(initialVehicle);
  const insets = useSafeAreaInsets();

  const [glbHtml, setGlbHtml] = useState<string | null>(null);
  const [glbLoading, setGlbLoading] = useState(true);

  // My Fleet modal sheet state
  const [modelModalVisible, setModelModalVisible] = useState(false);

  // Sync when route params change
  useEffect(() => {
    if (route.params?.vehicle) {
      setVehicle(route.params.vehicle);
    }
  }, [route.params?.vehicle]);

  // Hotspots state
  const [showHotspots, setShowHotspots] = useState(true);
  const [highlightedPart, setHighlightedPart] = useState<HotspotKey | null>(null);

  // Standard Modal & Tab State
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"health" | "history">("health");

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Hotspot pulse loop
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.25, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1100, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  // Load dedicated GLB 3D model for the active vehicle
  const initGlb = useCallback(async () => {
    try {
      setGlbLoading(true);
      const modelModule = getModelAssetForVehicle(vehicle);
      const asset = Asset.fromModule(modelModule);
      await asset.downloadAsync();
      const primary = asset.uri || asset.localUri;
      const fallback = asset.localUri || asset.uri;
      if (primary) {
        setGlbHtml(
          buildModelViewerHtml(
            primary,
            fallback,
            `${vehicle.make} ${vehicle.model}`.toUpperCase()
          )
        );
      }
    } catch (err) {
      console.warn("Could not load 3D vehicle asset:", err);
    } finally {
      setGlbLoading(false);
    }
  }, [vehicle]);

  useEffect(() => {
    initGlb();
  }, [initGlb]);

  // Switch Active Vehicle in 3D Garage
  const handleSelectVehicle = useCallback(
    async (selectedVehicle: Vehicle) => {
      setVehicle(selectedVehicle);
      setActiveVehicleId(selectedVehicle.id);
      setModelModalVisible(false);

      try {
        setGlbLoading(true);
        const modelModule = getModelAssetForVehicle(selectedVehicle);
        const asset = Asset.fromModule(modelModule);
        await asset.downloadAsync();
        const primary = asset.uri || asset.localUri;
        const fallback = asset.localUri || asset.uri;
        if (primary) {
          setGlbHtml(
            buildModelViewerHtml(
              primary,
              fallback,
              `${selectedVehicle.make} ${selectedVehicle.model}`.toUpperCase()
            )
          );
        }
      } catch (err) {
        console.warn("Could not switch 3D asset:", err);
      } finally {
        setGlbLoading(false);
      }
    },
    [setActiveVehicleId]
  );

  // Open Standard Modal
  const openModal = useCallback((part?: HotspotKey | null) => {
    setHighlightedPart(part ?? null);
    setActiveTab("health");
    setModalVisible(true);
  }, []);

  // Close Standard Modal
  const closeModal = useCallback(() => {
    setModalVisible(false);
    setHighlightedPart(null);
  }, []);

  // Auto-open modal if requested via route params
  useEffect(() => {
    if (route.params?.openModal) {
      openModal(null);
    }
  }, [route.params?.openModal, openModal]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Full-Screen 3D Car View (Dedicated GLB 3D Studio) ─ */}
      {glbHtml ? (
        <WebView
          style={[StyleSheet.absoluteFill, { backgroundColor: "#F8FAFC" }]}
          containerStyle={{ backgroundColor: "#F8FAFC" }}
          originWhitelist={["*", "file://", "http://", "https://"]}
          source={{ html: glbHtml }}
          javaScriptEnabled
          domStorageEnabled
          allowFileAccess
          allowFileAccessFromFileURLs
          allowUniversalAccessFromFileURLs
          mixedContentMode="always"
          scrollEnabled={false}
          overScrollMode="never"
          bounces={false}
          startInLoadingState={false}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={styles.loadingText}>Loading 3D {vehicle.make} {vehicle.model}…</Text>
        </View>
      )}

      {/* ── Top Bar (Clean & Minimal) ────────────────────────── */}
      <AnimatedEntrance
        delay={0}
        direction="down"
        style={[styles.topBar, { paddingTop: insets.top + 6 }]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={colors.neutral[800]} />
        </TouchableOpacity>

        <View style={styles.topTitleBox}>
          <Text style={styles.topTitleMake}>{vehicle.make} {vehicle.model}</Text>
          <Text style={styles.topTitleSub}>{vehicle.year} · {vehicle.plateNumber || vehicle.licensePlate || "2A-8888"}</Text>
        </View>

        <View style={styles.topRightActions}>
          {/* My Vehicles Fleet Switcher Button */}
          <TouchableOpacity
            style={styles.modelSwitcherBtn}
            onPress={() => setModelModalVisible(true)}
            activeOpacity={0.8}
            accessibilityLabel="Switch Fleet Vehicle"
          >
            <Ionicons name="car-sport" size={16} color="#2563EB" />
            <Text style={styles.modelSwitcherBtnText}>My Vehicles ({vehicles.length})</Text>
          </TouchableOpacity>

          {/* Hotspots Visibility Toggle */}
          <TouchableOpacity
            style={[styles.hotspotToggleBtn, !showHotspots && styles.hotspotToggleBtnInactive]}
            onPress={() => setShowHotspots((prev) => !prev)}
            activeOpacity={0.8}
            accessibilityLabel="Toggle 3D Hotspots"
          >
            <Ionicons
              name={showHotspots ? "locate" : "locate-outline"}
              size={18}
              color={showHotspots ? colors.primary[600] : colors.neutral[400]}
            />
          </TouchableOpacity>
        </View>
      </AnimatedEntrance>

      {/* ── Option B: Interactive 3D Hotspots on the Car ─────── */}
      {showHotspots && (
        <>
          {/* Hotspot 1: Engine & Oil */}
          <TouchableOpacity
            style={[styles.hotspotPin, styles.hotspotEngine]}
            activeOpacity={0.85}
            onPress={() => openModal("engine")}
          >
            <View style={styles.hotspotCircleWrapper}>
              <Animated.View
                style={[
                  styles.hotspotRing,
                  { transform: [{ scale: pulseAnim }], borderColor: "#2563EB" },
                ]}
              />
              <View style={[styles.hotspotCore, { backgroundColor: "#2563EB" }]}>
                <EngineSvg color="#FFF" size={14} />
              </View>
            </View>
            <View style={styles.hotspotTag}>
              <Text style={styles.hotspotTagTitle}>Engine & Oil</Text>
              <Text style={styles.hotspotTagSub}>88% · Optimal</Text>
            </View>
          </TouchableOpacity>

          {/* Hotspot 2: Battery */}
          <TouchableOpacity
            style={[styles.hotspotPin, styles.hotspotBattery]}
            activeOpacity={0.85}
            onPress={() => openModal("battery")}
          >
            <View style={styles.hotspotCircleWrapper}>
              <Animated.View
                style={[
                  styles.hotspotRing,
                  { transform: [{ scale: pulseAnim }], borderColor: "#2563EB" },
                ]}
              />
              <View style={[styles.hotspotCore, { backgroundColor: "#2563EB" }]}>
                <BatterySvg color="#FFF" size={14} />
              </View>
            </View>
            <View style={styles.hotspotTag}>
              <Text style={styles.hotspotTagTitle}>Battery</Text>
              <Text style={styles.hotspotTagSub}>12.6V Nominal</Text>
            </View>
          </TouchableOpacity>

          {/* Hotspot 3: Tires */}
          <TouchableOpacity
            style={[styles.hotspotPin, styles.hotspotTires]}
            activeOpacity={0.85}
            onPress={() => openModal("tires")}
          >
            <View style={styles.hotspotCircleWrapper}>
              <Animated.View
                style={[
                  styles.hotspotRing,
                  { transform: [{ scale: pulseAnim }], borderColor: "#D97706" },
                ]}
              />
              <View style={[styles.hotspotCore, { backgroundColor: "#D97706" }]}>
                <TireSvg color="#FFF" size={14} />
              </View>
            </View>
            <View style={styles.hotspotTag}>
              <Text style={styles.hotspotTagTitle}>Tires</Text>
              <Text style={styles.hotspotTagSub}>32 PSI · Check</Text>
            </View>
          </TouchableOpacity>
        </>
      )}

      {/* ── Bottom Action Button ─────────────────────────────── */}
      <AnimatedEntrance
        delay={120}
        direction="up"
        style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 12, 24) }]}
      >
        <TouchableOpacity
          style={styles.inspectButton}
          activeOpacity={0.85}
          onPress={() => openModal(null)}
          accessibilityRole="button"
          accessibilityLabel="Vehicle Health Telemetry Diagnostics"
        >
          <LinearGradient
            colors={["#0F172A", "#1E293B"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.inspectButtonGrad}
          >
            <View style={styles.inspectButtonHealthPill}>
              <View style={styles.inspectButtonPulseDot} />
              <Text style={styles.inspectButtonHealthText}>96%</Text>
            </View>

            <View style={styles.inspectButtonTextBox}>
              <Text style={styles.inspectButtonTitle}>Vehicle Health Telemetry</Text>
              <Text style={styles.inspectButtonSub}>Tap to view diagnostics & status</Text>
            </View>

            <View style={styles.inspectButtonIconCircle}>
              <Ionicons name="chevron-up" size={16} color="#FFF" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </AnimatedEntrance>

      {/* ── Standard Mobile Bottom Sheet Modal (No black side shadows!) ─ */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />

          <View style={[styles.cleanSheet, { paddingBottom: Math.max(insets.bottom + 8, 20) }]}>
            {/* Sheet Handle */}
            <View style={styles.sheetHandle} />

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.carIconBox}>
                  <CarSvg color={colors.primary[600]} size={20} />
                </View>
                <View>
                  <Text style={styles.modalCarTitle}>{vehicle.make} {vehicle.model}</Text>
                  <Text style={styles.modalCarSub}>{vehicle.year} · {vehicle.plateNumber || vehicle.licensePlate || "2A-8888"}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.closeCircleBtn} onPress={closeModal} activeOpacity={0.7}>
                <Ionicons name="close" size={18} color={colors.neutral[600]} />
              </TouchableOpacity>
            </View>

            {/* Clean Segmented Tab Switcher */}
            <View style={styles.segmentedBar}>
              <TouchableOpacity
                style={[styles.segTab, activeTab === "health" && styles.segTabActive]}
                onPress={() => setActiveTab("health")}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="pulse-outline"
                  size={14}
                  color={activeTab === "health" ? colors.primary[600] : colors.neutral[500]}
                />
                <Text style={[styles.segTabText, activeTab === "health" && styles.segTabTextActive]}>
                  Live Telemetry (6)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segTab, activeTab === "history" && styles.segTabActive]}
                onPress={() => setActiveTab("history")}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={activeTab === "history" ? colors.primary[600] : colors.neutral[500]}
                />
                <Text style={[styles.segTabText, activeTab === "history" && styles.segTabTextActive]}>
                  Service Log (4)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab Content List */}
            <ScrollView
              style={styles.sheetScroll}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {activeTab === "health" ? (
                <>
                  {/* ── Circular Progress Hero (96% IN THE MIDDLE OF CIRCLE) ─ */}
                  <View style={styles.circleHeroBanner}>
                    {/* Circular Gauge Ring with 96% in the dead-center */}
                    <View style={styles.gaugeContainer}>
                      <Svg width={94} height={94} viewBox="0 0 94 94">
                        {/* Background Track */}
                        <Circle
                          cx="47"
                          cy="47"
                          r="38"
                          stroke="#E0F2FE"
                          strokeWidth="7"
                          fill="none"
                        />
                        {/* Cobalt Blue Progress Ring (96%) */}
                        <Circle
                          cx="47"
                          cy="47"
                          r="38"
                          stroke="#2563EB"
                          strokeWidth="7"
                          strokeDasharray={238.76}
                          strokeDashoffset={238.76 * (1 - 0.96)}
                          strokeLinecap="round"
                          fill="none"
                          transform="rotate(-90 47 47)"
                        />
                      </Svg>

                      {/* 96% in the MIDDLE of the circle */}
                      <View style={styles.gaugeCenterContent}>
                        <Text style={styles.gaugeCenterPct}>96%</Text>
                        <Text style={styles.gaugeCenterLbl}>Health</Text>
                      </View>
                    </View>

                    {/* Status Info right next to circle */}
                    <View style={styles.circleHeroInfo}>
                      <View style={styles.heroStatusBadge}>
                        <View style={styles.heroStatusDot} />
                        <Text style={styles.heroStatusTitle}>ALL SYSTEMS OPTIMAL</Text>
                      </View>
                      <Text style={styles.heroStatusDesc}>Real-time telemetry synced via OBD-II</Text>
                      <View style={styles.passTagRow}>
                        <Ionicons name="shield-checkmark" size={13} color="#2563EB" />
                        <Text style={styles.passTagText}>0 DTC Fault Codes Detected</Text>
                      </View>
                    </View>
                  </View>
                  {/* Clean SVG Telemetry List */}
                  <View style={styles.cleanListContainer}>
                    {HEALTH_METRICS.map((m, idx) => {
                      const isHighlighted = highlightedPart === m.id;
                      const isLast = idx === HEALTH_METRICS.length - 1;
                      return (
                        <View
                          key={m.id}
                          style={[
                            styles.cleanRow,
                            !isLast && styles.cleanRowBorder,
                            isHighlighted && styles.cleanRowHighlighted,
                          ]}
                        >
                          {/* SVG Icon Container */}
                          <View style={[styles.svgIconBox, { backgroundColor: m.bg }]}>
                            {renderMetricSvg(m.id, m.color)}
                          </View>

                          {/* Info & Gauge Bar */}
                          <View style={styles.cleanRowMiddle}>
                            <View style={styles.cleanRowTitleRow}>
                              <Text style={styles.cleanRowLabel}>{m.label}</Text>
                              {isHighlighted && (
                                <View style={styles.inspectedPill}>
                                  <Text style={styles.inspectedPillText}>INSPECTED</Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.cleanRowSub}>{m.sub}</Text>

                            {/* Mini Progress Track */}
                            <View style={styles.cleanTrack}>
                              <View
                                style={[
                                  styles.cleanFill,
                                  { width: `${m.pct * 100}%`, backgroundColor: m.color },
                                ]}
                              />
                            </View>
                          </View>

                          {/* Value Badge */}
                          <View style={[styles.cleanPill, { backgroundColor: m.bg }]}>
                            <Text style={[styles.cleanPillText, { color: m.color }]}>{m.value}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>

                  {/* Actions */}
                  <View style={styles.sheetActions}>
                    <TouchableOpacity
                      style={styles.primaryActionBtn}
                      onPress={() => {
                        closeModal();
                        navigation.navigate("Diagnostics");
                      }}
                      activeOpacity={0.85}
                    >
                      <LinearGradient
                        colors={[colors.primary[500], colors.primary[700]]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.primaryActionGrad}
                      >
                        <Ionicons name="hardware-chip-outline" size={16} color="#FFF" />
                        <Text style={styles.primaryActionText}>Run Full AI Diagnostic Scan</Text>
                        <Ionicons name="sparkles" size={13} color="#FDE047" />
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.secondaryActionBtn}
                      onPress={() => setActiveTab("history")}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="time-outline" size={15} color={colors.primary[600]} />
                      <Text style={styles.secondaryActionText}>View Maintenance History</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  {/* Service History Records */}
                  <View style={styles.historyBanner}>
                    <Ionicons name="shield-checkmark" size={16} color={colors.primary[600]} />
                    <Text style={styles.historyBannerTitle}>Certified Maintenance Records</Text>
                  </View>

                  <View style={styles.cleanListContainer}>
                    {SERVICE_HISTORY.map((h, i) => (
                      <View
                        key={i}
                        style={[
                          styles.historyRow,
                          i < SERVICE_HISTORY.length - 1 && styles.cleanRowBorder,
                        ]}
                      >
                        <View style={styles.historyIconBox}>
                          <Ionicons name={h.icon as any} size={16} color={colors.primary[600]} />
                        </View>
                        <View style={styles.historyMiddle}>
                          <Text style={styles.historyTitle}>{h.title}</Text>
                          <Text style={styles.historyShop}>{h.shop}</Text>
                          <Text style={styles.historyKm}>{h.km}</Text>
                        </View>
                        <View style={styles.historyDatePill}>
                          <Text style={styles.historyDateText}>{h.date}</Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  <View style={styles.sheetActions}>
                    <TouchableOpacity
                      style={styles.primaryActionBtn}
                      onPress={() => {
                        closeModal();
                        navigation.navigate("CustomerTabs", { screen: "Search" });
                      }}
                      activeOpacity={0.85}
                    >
                      <LinearGradient
                        colors={[colors.primary[600], colors.primary[800]]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.primaryActionGrad}
                      >
                        <Ionicons name="navigate-outline" size={16} color="#FFF" />
                        <Text style={styles.primaryActionText}>Book Verified Nearby Mechanic</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.secondaryActionBtn}
                      onPress={() => setActiveTab("health")}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="pulse-outline" size={15} color={colors.primary[600]} />
                      <Text style={styles.secondaryActionText}>Back to Live Telemetry</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── 3D Vehicle Models & Downloads Bottom Sheet ───────── */}
      <Modal
        visible={modelModalVisible}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => setModelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setModelModalVisible(false)}
          />

          <View style={[styles.cleanSheet, { paddingBottom: Math.max(insets.bottom + 8, 20) }]}>
            <View style={styles.sheetHandle} />

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={[styles.carIconBox, { backgroundColor: "#EFF6FF" }]}>
                  <Ionicons name="car-sport" size={20} color="#2563EB" />
                </View>
                <View>
                  <Text style={styles.modalCarTitle}>My Vehicles</Text>
                  <Text style={styles.modalCarSub}>Select a vehicle to inspect in 3D</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeCircleBtn}
                onPress={() => setModelModalVisible(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={18} color={colors.neutral[600]} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Registered Vehicles List */}
              <Text style={styles.modelSectionTitle}>YOUR VEHICLES ({vehicles.length})</Text>
              {vehicles.map((v) => {
                const isActive = v.id === vehicle.id;
                const plate = v.plateNumber || v.licensePlate || "2A-8888";

                return (
                  <TouchableOpacity
                    key={v.id}
                    style={[styles.modelItemCard, isActive && styles.modelItemCardActive]}
                    onPress={() => handleSelectVehicle(v)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.modelItemTop}>
                      <View style={[styles.modelItemIconBox, { backgroundColor: isActive ? "#EFF6FF" : "#F1F5F9" }]}>
                        <Ionicons name="car" size={22} color={isActive ? "#2563EB" : "#64748B"} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.modelItemName}>{v.make} {v.model}</Text>
                        <Text style={styles.modelItemDesc}>{v.year} · {v.color || "Metallic"}</Text>
                      </View>
                      <View style={styles.modelItemRight}>
                        <View style={[styles.modelBadgePill, { backgroundColor: isActive ? "#DBEAFE" : "#F1F5F9" }]}>
                          <Text style={[styles.modelBadgePillText, { color: isActive ? "#2563EB" : "#475569" }]}>
                            {isActive ? "Active 3D" : "Select"}
                          </Text>
                        </View>
                        <Text style={styles.modelItemSize}>🇰🇭 {plate}</Text>
                      </View>
                    </View>

                    {/* Active Checkmark Pill */}
                    {isActive && (
                      <View style={styles.activeCheckRow}>
                        <Ionicons name="checkmark-circle" size={14} color="#2563EB" />
                        <Text style={styles.activeCheckText}>Currently Visualized in 3D Studio</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}

              {/* Add Vehicle Action Button */}
              <TouchableOpacity
                style={styles.fleetAddFullBtn}
                onPress={() => {
                  setModelModalVisible(false);
                  navigation.navigate("VehicleAdd");
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle" size={18} color="#FFFFFF" />
                <Text style={styles.fleetAddFullBtnText}>+ Add Another Vehicle</Text>
              </TouchableOpacity>

              <View style={{ height: 16 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  loadingContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },

  /* ── Top Bar ─────────────────────────────────────────────── */
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: 10,
    gap: spacing.md,
    zIndex: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  topTitleBox: {
    flex: 1,
  },
  topTitleMake: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.neutral[900],
    letterSpacing: -0.3,
  },
  topTitleSub: {
    fontSize: 11,
    color: colors.neutral[500],
    fontWeight: "600",
    marginTop: 1,
  },
  topRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modelSwitcherBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 10,
    height: 40,
    borderRadius: 20,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  modelSwitcherBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
  },
  hotspotToggleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  hotspotToggleBtnInactive: {
    backgroundColor: "rgba(241,245,249,0.8)",
  },

  /* ── 3D Models & Downloads Sheet Styles ─────────────────── */
  modalScroll: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  modelSectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 10,
  },
  modelItemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
    ...shadows.sm,
  },
  modelItemCardActive: {
    borderColor: "#93C5FD",
    backgroundColor: "#F8FAFF",
    borderWidth: 1.5,
  },
  modelItemTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modelItemIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modelItemName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  modelItemDesc: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  modelItemRight: {
    alignItems: "flex-end",
    gap: 3,
  },
  modelBadgePill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  modelBadgePillText: {
    fontSize: 10,
    fontWeight: "700",
  },
  modelItemSize: {
    fontSize: 10,
    color: "#94A3B8",
    fontFamily: "monospace",
  },
  downloadProgressWrap: {
    marginTop: 10,
    gap: 4,
  },
  downloadProgressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },
  downloadProgressFill: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 3,
  },
  downloadProgressText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#2563EB",
  },
  activeCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#EFF6FF",
  },
  activeCheckText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
  },
  fleetAddFullBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  fleetAddFullBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  /* ── Option B: Interactive Hotspots on 3D Car ────────────── */
  hotspotPin: {
    position: "absolute",
    alignItems: "center",
    zIndex: 15,
  },
  hotspotEngine: {
    top: "34%",
    left: "22%",
  },
  hotspotBattery: {
    top: "43%",
    right: "18%",
  },
  hotspotTires: {
    top: "56%",
    left: "26%",
  },
  hotspotCircleWrapper: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  hotspotRing: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    opacity: 0.6,
  },
  hotspotCore: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    ...shadows.md,
  },
  hotspotTag: {
    marginTop: 4,
    backgroundColor: "rgba(15, 23, 42, 0.88)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  hotspotTagTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFF",
  },
  hotspotTagSub: {
    fontSize: 8,
    fontWeight: "600",
    color: "#94A3B8",
  },

  /* ── Bottom Floating Button ──────────────────────────────── */
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 20,
  },
  inspectButton: {
    width: width - spacing.lg * 2,
    borderRadius: 20,
    overflow: "hidden",
    ...shadows.lg,
  },
  inspectButtonGrad: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  inspectButtonHealthPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(37, 99, 235, 0.2)",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.4)",
  },
  inspectButtonPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3B82F6",
  },
  inspectButtonHealthText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#93C5FD",
  },
  inspectButtonTextBox: {
    flex: 1,
  },
  inspectButtonTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: -0.2,
  },
  inspectButtonSub: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
    marginTop: 1,
  },
  inspectButtonIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* ── Standard Full-Width Bottom Sheet Modal ──────────────── */
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  backdropPress: {
    ...StyleSheet.absoluteFill,
  },
  cleanSheet: {
    ...shadows.lg,
    width: "100%",
    maxHeight: "85%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    zIndex: 10,
    elevation: 24,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  carIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  modalCarTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.neutral[900],
  },
  modalCarSub: {
    fontSize: 11,
    color: colors.neutral[500],
    fontWeight: "600",
    marginTop: 1,
  },
  closeCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  /* ── Hero Banner with 96% directly in the CENTER of the circle ─ */
  circleHeroBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    backgroundColor: "#FAFAFA",
    marginBottom: 14,
    marginTop: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    gap: 16,
  },
  gaugeContainer: {
    width: 94,
    height: 94,
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeCenterContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeCenterPct: {
    fontSize: 22,
    fontWeight: "900",
    color: "#2563EB",
    letterSpacing: -0.5,
  },
  gaugeCenterLbl: {
    fontSize: 9,
    fontWeight: "700",
    color: "#64748B",
    marginTop: -2,
    textTransform: "uppercase",
  },
  circleHeroInfo: {
    flex: 1,
    gap: 4,
  },
  heroStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#2563EB",
  },
  heroStatusTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E40AF",
    letterSpacing: 0.3,
  },
  heroStatusDesc: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  passTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  passTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
  },

  /* ── Segmented Control Bar ───────────────────────────────── */
  segmentedBar: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 3,
  },
  segTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  segTabActive: {
    backgroundColor: "#FFFFFF",
    ...shadows.sm,
  },
  segTabText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.neutral[500],
  },
  segTabTextActive: {
    color: colors.primary[700],
    fontWeight: "800",
  },

  /* ── Sheet Scroll Content ────────────────────────────────── */
  sheetScroll: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 6,
  },

  /* ── Clean SVG Telemetry List ────────────────────────────── */
  cleanListContainer: {
    backgroundColor: "#FAFAFA",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  cleanRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 12,
  },
  cleanRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  cleanRowHighlighted: {
    backgroundColor: "#EFF6FF",
    borderLeftWidth: 3.5,
    borderLeftColor: colors.primary[600],
  },
  svgIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cleanRowMiddle: {
    flex: 1,
    gap: 2,
  },
  cleanRowTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cleanRowLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.neutral[900],
  },
  inspectedPill: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  inspectedPillText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#FFF",
  },
  cleanRowSub: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "500",
  },
  cleanTrack: {
    height: 3.5,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    marginTop: 4,
    overflow: "hidden",
  },
  cleanFill: {
    height: "100%",
    borderRadius: 2,
  },
  cleanPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cleanPillText: {
    fontSize: 11,
    fontWeight: "800",
  },

  /* ── Service History ─────────────────────────────────────── */
  historyBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F0F9FF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BAE6FD",
    marginBottom: 10,
  },
  historyBannerTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.neutral[900],
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  historyIconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  historyMiddle: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.neutral[900],
  },
  historyShop: {
    fontSize: 10,
    color: colors.primary[600],
    fontWeight: "600",
    marginTop: 1,
  },
  historyKm: {
    fontSize: 9,
    color: "#94A3B8",
    marginTop: 1,
  },
  historyDatePill: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
  },
  historyDateText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.neutral[600],
  },

  /* ── Actions ─────────────────────────────────────────────── */
  sheetActions: {
    gap: 8,
    marginTop: 14,
  },
  primaryActionBtn: {
    borderRadius: 14,
    overflow: "hidden",
    ...shadows.sm,
  },
  primaryActionGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
  },
  primaryActionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFF",
  },
  secondaryActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: "#F0F9FF",
    borderWidth: 1.5,
    borderColor: colors.primary[100],
  },
  secondaryActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary[600],
  },
});
