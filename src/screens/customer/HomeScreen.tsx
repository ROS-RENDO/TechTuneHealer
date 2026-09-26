import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import Svg, { Path, Rect, Circle } from "react-native-svg";
import {
  useAuthStore,
  useLocationStore,
  useProviderSearchStore,
  useBookingStore,
  useVehicleStore,
  useTranslation,
} from "../../store";
import { LanguageToggle } from "../../components/LanguageToggle";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  shadows,
} from "../../constants/theme";
import type { CustomerStackScreenProps } from "../../navigation/types";
import type { ServiceProvider, Vehicle, Booking } from "../../types";
import { getFormattedDistance, getProviderAvatarUrl } from "../../utils/helpers";
import api from "../../services/api";
import { AnimatedEntrance } from "../../components/AnimatedEntrance";

const { width } = Dimensions.get("window");

/* ── Bespoke Clean Automotive SVG Icons (Zero Emojis / Zero AI Slop) ─────── */
function CambodiaFlagSvg({ width = 16, height = 11 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 16">
      <Rect width="24" height="4" fill="#032EA6" />
      <Rect y="4" width="24" height="8" fill="#ED1B24" />
      <Rect y="12" width="24" height="4" fill="#032EA6" />
      <Path
        d="M12 5.5 L12.8 7.5 L14.5 7.5 L14.5 10.5 L9.5 10.5 L9.5 7.5 L11.2 7.5 Z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

function DiagnosticChipSvg({ color = "#2563EB", size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="4" width="16" height="16" rx="3" stroke={color} strokeWidth="1.8" />
      <Rect x="8" y="8" width="8" height="8" rx="1.5" stroke={color} strokeWidth="1.5" />
      <Path
        d="M8 1V4M12 1V4M16 1V4M8 20V23M12 20V23M16 20V23M1 8H4M1 12H4M1 16H4M20 8H23M20 12H23M20 16H23"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function RescueShieldSvg({ color = "#2563EB", size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L4 5.5V11.5C4 16.5 7.5 21 12 22C16.5 21 20 16.5 20 11.5V5.5L12 2Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <Path
        d="M13 7L8.5 13H12.5L11 17L15.5 11H11.5L13 7Z"
        fill={color}
      />
    </Svg>
  );
}

function OilLubeSvg({ color = "#2563EB", size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 14C19 17.866 15.866 21 12 21C8.134 21 5 17.866 5 14C5 10 12 3 12 3C12 3 19 10 19 14Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <Path
        d="M10 14C10 12.895 10.895 12 12 12C13.105 12 14 12.895 14 14"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function WheelTireSvg({ color = "#2563EB", size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
      <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.5" />
      <Circle cx="12" cy="12" r="2" fill={color} />
      <Path
        d="M12 3V7M12 17V21M3 12H7M17 12H21M5.6 5.6L8.5 8.5M15.5 15.5L18.4 18.4M18.4 5.6L15.5 8.5M8.5 15.5L5.6 18.4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function BatteryTerminalSvg({ color = "#2563EB", size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="6" width="18" height="14" rx="3" stroke={color} strokeWidth="1.8" />
      <Path d="M7 3V6M17 3V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M6.5 12H9.5M8 10.5V13.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M14.5 12H17.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

function FuelPumpSvg({ color = "#2563EB", size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 21V5C4 3.9 4.9 3 6 3H14C15.1 3 16 3.9 16 5V21"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Path d="M3 21H17" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Rect x="7" y="6" width="6" height="5" rx="1" stroke={color} strokeWidth="1.5" />
      <Path
        d="M16 8H18C19.1 8 20 8.9 20 10V15C20 15.6 19.6 16 19 16C18.4 16 18 15.6 18 15V11"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function EvPlugSvg({ color = "#2563EB", size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 10C5 6.134 8.134 3 12 3C15.866 3 19 6.134 19 10V14C19 16.2 17.2 18 15 18H9C6.8 18 5 16.2 5 14V10Z"
        stroke={color}
        strokeWidth="1.8"
      />
      <Path d="M8 21H16M12 18V21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M12.5 7L9.5 11H13.5L11.5 15" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function AutoGearsSvg({ color = "#2563EB", size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8" />
      <Path
        d="M19.4 15A1.65 1.65 0 0 0 19.7 16.8L19.9 17A2 2 0 0 1 17.1 19.8L16.9 19.6A1.65 1.65 0 0 0 15 19.4A1.65 1.65 0 0 0 13.9 20.9V21.2A2 2 0 0 1 9.9 21.2V20.9A1.65 1.65 0 0 0 8.8 19.4A1.65 1.65 0 0 0 7 19.6L6.8 19.8A2 2 0 0 1 4 17L4.2 16.8A1.65 1.65 0 0 0 4.4 15A1.65 1.65 0 0 0 2.9 13.9H2.6A2 2 0 0 1 2.6 9.9H2.9A1.65 1.65 0 0 0 4.4 8.8A1.65 1.65 0 0 0 4.2 7L4 6.8A2 2 0 0 1 6.8 4L7 4.2A1.65 1.65 0 0 0 8.8 4.4A1.65 1.65 0 0 0 9.9 2.9V2.6A2 2 0 0 1 13.9 2.6V2.9A1.65 1.65 0 0 0 15 4.4A1.65 1.65 0 0 0 16.8 4.2L17 4A2 2 0 0 1 19.8 6.8L19.6 7A1.65 1.65 0 0 0 19.4 8.8A1.65 1.65 0 0 0 20.9 9.9H21.2A2 2 0 0 1 21.2 13.9H20.9A1.65 1.65 0 0 0 19.4 15Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<CustomerStackScreenProps<"CustomerTabs">["navigation"]>();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const { currentLocation, setLocation, setError } = useLocationStore();
  const { searchProviders, providers, isLoading: isLoadingProviders } = useProviderSearchStore();
  const { bookings, fetchBookings } = useBookingStore();
  const {
    vehicles,
    getActiveVehicle,
    fetchVehicles,
    setActiveVehicleId,
    isLoading: isLoadingVehicles,
  } = useVehicleStore();

  const [refreshing, setRefreshing] = useState(false);
  const [locationName, setLocationName] = useState("Olympic Stadium, Phnom Penh");

  // Fetch vehicles for the registered customer
  const loadVehicles = useCallback(async () => {
    try {
      await fetchVehicles();
    } catch {
      // Handled in vehicleStore
    }
  }, [fetchVehicles]);

  // Request location and reverse geocode location title
  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied");
        return;
      }

      let coords = {
        latitude: 11.5564,
        longitude: 104.9282,
      };

      try {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (position?.coords) {
          coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        }
      } catch {
        // Fallback to central Phnom Penh if device GPS unavailable
      }

      setLocation(coords);
      await searchProviders(coords);

      try {
        const reverse = await Location.reverseGeocodeAsync(coords);
        if (reverse && reverse.length > 0) {
          const loc = reverse[0];
          const name = loc.district || loc.subregion || loc.name || loc.city || "Phnom Penh";
          setLocationName(`${name}, Phnom Penh`);
        }
      } catch {
        setLocationName("Olympic Stadium, Phnom Penh");
      }
    } catch {
      setError("Failed to get location");
    }
  }, [setLocation, setError, searchProviders]);

  // Initial load
  useEffect(() => {
    requestLocationPermission();
    loadVehicles();
    fetchBookings().catch(() => {});
  }, [requestLocationPermission, loadVehicles, fetchBookings]);

  // Pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.allSettled([
      requestLocationPermission(),
      loadVehicles(),
      fetchBookings(),
    ]);
    setRefreshing(false);
  };

  // Find active booking for live tracker (pending, accepted, or in_progress)
  const activeBooking = bookings.find(
    (b: Booking) =>
      b.status === "in_progress" || b.status === "accepted" || b.status === "pending"
  );

  const primaryVehicle = getActiveVehicle();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[600]}
            colors={[colors.primary[600]]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Modern Top App Bar (T023) */}
        <AnimatedEntrance delay={0} direction="down">
          <View style={styles.topAppBar}>
            <View style={styles.appBarHeader}>
              <View style={styles.userSection}>
                <Text style={styles.greetingText}>
                  {t("greeting")}, {user?.name ? user.name.split(" ")[0] : t("driver")}
                </Text>
                <TouchableOpacity
                  style={styles.locationChip}
                  onPress={() => navigation.navigate("CustomerTabs", { screen: "Search" })}
                  activeOpacity={0.7}
                  accessibilityLabel={t("changeLocation")}
                >
                  <Ionicons name="location-sharp" size={12} color={colors.primary[600]} />
                  <Text style={styles.locationChipText} numberOfLines={1}>
                    {locationName}
                  </Text>
                  <Ionicons name="chevron-down" size={11} color={colors.neutral[400]} />
                </TouchableOpacity>
              </View>

              <View style={styles.appBarActions}>
                <LanguageToggle compact={true} />
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => navigation.navigate("CustomerTabs", { screen: "Search" })}
                  accessibilityLabel="Search mechanics"
                >
                  <Ionicons name="search-outline" size={20} color={colors.neutral[800]} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => navigation.navigate("Notifications")}
                  accessibilityLabel="Notifications"
                >
                  <Ionicons name="notifications-outline" size={20} color={colors.neutral[800]} />
                  <View style={styles.notificationDot} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => navigation.navigate("CustomerTabs", { screen: "Profile" })}
                  accessibilityLabel="My Profile"
                >
                  <Ionicons name="person-outline" size={20} color={colors.neutral[800]} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </AnimatedEntrance>

        {/* Live Active Booking Tracker (US5 - T020, T021, T022) */}
        {activeBooking && (
          <AnimatedEntrance delay={60} direction="up">
            <View style={styles.activeBookingWrapper}>
              <View style={styles.activeBookingCard}>
                <View style={styles.activeBookingTop}>
                  <View
                    style={[
                      styles.liveBadge,
                      activeBooking.status === "in_progress"
                        ? styles.liveBadgeSuccess
                        : activeBooking.status === "accepted"
                        ? styles.liveBadgeEnRoute
                        : styles.liveBadgePending,
                    ]}
                  >
                    <View
                      style={[
                        styles.liveDot,
                        activeBooking.status === "in_progress"
                          ? { backgroundColor: "#16A34A" }
                          : activeBooking.status === "accepted"
                          ? { backgroundColor: "#2563EB" }
                          : { backgroundColor: "#D97706" },
                      ]}
                    />
                    <Text
                      style={[
                        styles.liveBadgeText,
                        activeBooking.status === "in_progress"
                          ? { color: "#16A34A" }
                          : activeBooking.status === "accepted"
                          ? { color: "#1D4ED8" }
                          : { color: "#B45309" },
                      ]}
                    >
                      {activeBooking.status === "in_progress"
                        ? t("serviceInProgress")
                        : activeBooking.status === "accepted"
                        ? t("mechanicEnRoute")
                        : t("requestDispatched")}
                    </Text>
                  </View>
                  <Text style={styles.activeBookingTime}>
                    {activeBooking.scheduledTime || "Live Dispatch"}
                  </Text>
                </View>

                <View style={styles.activeBookingBody}>
                  <View style={styles.activeBookingIcon}>
                    {activeBooking.provider ? (
                      <Image
                        source={{ uri: getProviderAvatarUrl(activeBooking.provider) }}
                        style={styles.activeBookingAvatarImg}
                      />
                    ) : (
                      <Ionicons name="car-sport" size={22} color="#2563EB" />
                    )}
                  </View>
                  <View style={styles.activeBookingDetails}>
                    <Text style={styles.activeBookingService} numberOfLines={1}>
                      {activeBooking.serviceType || t("emergencySosTitle")}
                    </Text>
                    <Text style={styles.activeBookingProvider} numberOfLines={1}>
                      {activeBooking.provider?.businessName || t("assignedMechanic")}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.chatQuickBtn}
                    onPress={() => navigation.navigate("Chat", { bookingId: activeBooking.id })}
                    accessibilityLabel={t("chat")}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={18} color="#2563EB" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.trackButton}
                  onPress={() =>
                    navigation.navigate("CustomerTracking", {
                      bookingId: activeBooking.id,
                      mechanicName: activeBooking.provider?.businessName,
                    })
                  }
                  activeOpacity={0.88}
                >
                  <View style={styles.trackButtonInner}>
                    <Ionicons name="navigate-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.trackButtonText}>{t("trackLiveStatus")}</Text>
                    <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </AnimatedEntrance>
        )}

        {/* 24/7 Roadside Rescue SOS Banner (US1 - T006, T007, T008) */}
        <AnimatedEntrance delay={100} direction="up">
          <View style={styles.emergencyContainer}>
            <TouchableOpacity
              style={styles.emergencyTouch}
              onPress={() => navigation.navigate("Emergency")}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["#DC2626", "#B91C1C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.emergencyGradient}
              >
                <View style={styles.emergencyGlowRing} />
                
                <View style={styles.emergencyLeft}>
                  <View style={styles.sosPill}>
                    <View style={styles.sosDot} />
                    <Text style={styles.sosPillText}>{t("emergencySosTitle")}</Text>
                  </View>

                  <Text style={styles.emergencyHeading}>{t("breakdownRescue")}</Text>
                  <Text style={styles.emergencySubhead}>
                    {t("emergencySosSub")}
                  </Text>
                </View>

                <View style={styles.emergencyActionPill}>
                  <View style={styles.emergencyIconPulse}>
                    <Ionicons name="flash" size={24} color="#FFFFFF" />
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.9)" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </AnimatedEntrance>

        {/* "My Garage" Vehicle Card - Streamlined Hierarchy */}
        <AnimatedEntrance delay={150} direction="up">
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="shield-checkmark" size={20} color={colors.primary[600]} />
                <Text style={styles.sectionHeading}>{t("myGarage")}</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate("VehicleAdd")}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.sectionActionText}>+ {t("addVehicle")}</Text>
              </TouchableOpacity>
            </View>

            {primaryVehicle ? (
              <View style={styles.garageCard}>

                {/* Hierarchy Level 1: Primary Vehicle Identity & Health */}
                <View style={styles.garageTopRow}>
                  <View style={styles.carIconBox}>
                    <Ionicons name="car-sport" size={22} color="#2563EB" />
                  </View>

                  <View style={styles.vehicleInfoCol}>
                    <Text style={styles.vehicleTitle} numberOfLines={1}>
                      {primaryVehicle.year} {primaryVehicle.make} {primaryVehicle.model}
                    </Text>
                    <View style={styles.vehicleSubRow}>
                      <View style={styles.plateBadge}>
                        <CambodiaFlagSvg width={15} height={10} />
                        <Text style={styles.plateNumber}>
                          {primaryVehicle.plateNumber || primaryVehicle.licensePlate || "2A-8888"}
                        </Text>
                      </View>
                      <Text style={styles.subDot}>•</Text>
                      <Text style={styles.vehicleColorText}>{primaryVehicle.color || "Metallic"}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.healthStatusBadge}
                    onPress={() => navigation.navigate("Garage", { vehicle: primaryVehicle, openModal: true })}
                    activeOpacity={0.8}
                    accessibilityLabel={t("vehicleTelemetry")}
                  >
                    <View style={styles.healthPulseDot} />
                    <Text style={styles.healthStatusText}>96%</Text>
                  </TouchableOpacity>
                </View>

                {/* Direct Screen Actions (3D Studio + AI Diagnostics) */}
                <View style={styles.garageActionsRow}>
                  <TouchableOpacity
                    style={styles.primaryStudioBtn}
                    onPress={() => navigation.navigate("Garage", { vehicle: primaryVehicle })}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={["#2563EB", "#1D4ED8"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.primaryStudioGrad}
                    >
                      <Ionicons name="speedometer-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.primaryStudioBtnText}>{t("vehicleTelemetry")}</Text>
                      <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.85)" />
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryDiagBtn}
                    onPress={() => navigation.navigate("Diagnostics")}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="hardware-chip-outline" size={16} color="#2563EB" />
                    <Text style={styles.secondaryDiagBtnText}>{t("diagnosticsTitle")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.emptyGarageCard}
                onPress={() => navigation.navigate("VehicleAdd")}
                activeOpacity={0.8}
              >
                <View style={styles.emptyGarageIcon}>
                  <Ionicons name="car-outline" size={28} color={colors.primary[600]} />
                </View>
                <View style={styles.emptyGarageContent}>
                  <Text style={styles.emptyGarageTitle}>{t("addVehicle")}</Text>
                  <Text style={styles.emptyGarageDesc}>
                    {t("emergencySosSub")}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
              </TouchableOpacity>
            )}
          </View>
        </AnimatedEntrance>

        {/* Automotive Services Grid (US4 - T017, T018, T019) */}
        <AnimatedEntrance delay={200} direction="up">
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="grid" size={20} color={colors.primary[600]} />
                <Text style={styles.sectionHeading}>{t("quickServices")}</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate("CustomerTabs", { screen: "Search" })}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionActionText}>{t("viewAll")}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.serviceGrid}>
              <ServiceGridTile
                icon={<DiagnosticChipSvg size={20} color="#2563EB" />}
                label={t("diagnosticsAi")}
                sublabel="OBD-II & Sensors"
                onPress={() => navigation.navigate("Diagnostics")}
              />
              <ServiceGridTile
                icon={<RescueShieldSvg size={20} color="#2563EB" />}
                label={t("breakdownRescue")}
                sublabel="Tow & Roadside"
                onPress={() =>
                  navigation.navigate("CustomerTabs", {
                    screen: "Search",
                    params: { category: "emergency" },
                  })
                }
              />
              <ServiceGridTile
                icon={<OilLubeSvg size={20} color="#2563EB" />}
                label={t("oilLube")}
                sublabel="Filter & Fluids"
                onPress={() =>
                  navigation.navigate("CustomerTabs", {
                    screen: "Search",
                    params: { category: "maintenance" },
                  })
                }
              />
              <ServiceGridTile
                icon={<WheelTireSvg size={20} color="#2563EB" />}
                label={t("tiresWheels")}
                sublabel="Patch & Balance"
                onPress={() =>
                  navigation.navigate("CustomerTabs", {
                    screen: "Search",
                    params: { category: "tires" },
                  })
                }
              />
              <ServiceGridTile
                icon={<BatteryTerminalSvg size={20} color="#2563EB" />}
                label={t("batteryCare")}
                sublabel="Test & Replace"
                onPress={() =>
                  navigation.navigate("CustomerTabs", {
                    screen: "Search",
                    params: { category: "battery" },
                  })
                }
              />
              <ServiceGridTile
                icon={<FuelPumpSvg size={20} color="#2563EB" />}
                label={t("gasFuelStations")}
                sublabel="Real-time Gas Prices"
                onPress={() =>
                  navigation.navigate("CustomerTabs", {
                    screen: "Search",
                    params: { category: "fuel" },
                  })
                }
              />
              <ServiceGridTile
                icon={<EvPlugSvg size={20} color="#2563EB" />}
                label={t("evChargingStations")}
                sublabel="Fast DC & Type 2"
                onPress={() =>
                  navigation.navigate("CustomerTabs", {
                    screen: "Search",
                    params: { category: "ev" },
                  })
                }
              />
              <ServiceGridTile
                icon={<AutoGearsSvg size={20} color="#2563EB" />}
                label={t("transmission")}
                sublabel="Genuine Spares"
                onPress={() => navigation.navigate("Shop" as any)}
              />
            </View>
          </View>
        </AnimatedEntrance>

        {/* Nearby Mechanics Feed with Meter/KM Distance (US2 - T009, T010, T011, T012) */}
        <AnimatedEntrance delay={240} direction="up">
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="navigate-circle" size={20} color={colors.primary[600]} />
                <Text style={styles.sectionHeading}>{t("mechanicsNearby")}</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate("CustomerTabs", { screen: "Search" })}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionActionText}>
                  {t("viewAll")} ({providers.length})
                </Text>
              </TouchableOpacity>
            </View>

            {providers.length === 0 && !isLoadingProviders ? (
              <View style={styles.emptyMechanicBox}>
                <View style={styles.emptyMechanicIcon}>
                  <Ionicons name="location-outline" size={36} color={colors.neutral[400]} />
                </View>
                <Text style={styles.emptyMechanicTitle}>{t("noRecentBookings")}</Text>
                <Text style={styles.emptyMechanicDesc}>
                  {t("nearbyPhnomPenh")}
                </Text>
                <TouchableOpacity
                  style={styles.expandSearchButton}
                  onPress={() => navigation.navigate("CustomerTabs", { screen: "Search" })}
                >
                  <Text style={styles.expandSearchButtonText}>{t("tabSearch")}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              providers.slice(0, 5).map((provider: ServiceProvider) => {
                const formattedDist = getFormattedDistance(currentLocation, provider.location);
                return (
                  <EnhancedProviderCard
                    key={provider.id}
                    provider={provider}
                    distance={formattedDist}
                    onPress={() =>
                      navigation.navigate("ProviderDetail", { providerId: provider.id })
                    }
                  />
                );
              })
            )}
          </View>
        </AnimatedEntrance>
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------
 * SUBCOMPONENTS
 * ------------------------------------------------------------------------- */

interface ServiceGridTileProps {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  isUrgent?: boolean;
  onPress: () => void;
}

function ServiceGridTile({
  icon,
  label,
  sublabel,
  isUrgent,
  onPress,
}: ServiceGridTileProps) {
  return (
    <TouchableOpacity
      style={[styles.gridTile, isUrgent && styles.gridTileUrgent]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.gridTileHeader}>
        <View style={[styles.gridIconBox, isUrgent && styles.gridIconBoxUrgent]}>
          {icon}
        </View>
        <Ionicons name="chevron-forward" size={13} color="#94A3B8" />
      </View>
      <Text style={styles.gridTileLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.gridTileSublabel} numberOfLines={1}>
        {sublabel}
      </Text>
    </TouchableOpacity>
  );
}

interface EnhancedProviderCardProps {
  provider: ServiceProvider;
  distance: string | null;
  onPress: () => void;
}

function EnhancedProviderCard({ provider, distance, onPress }: EnhancedProviderCardProps) {
  const isAvailable = provider.isAvailable ?? true;
  const ratingVal = provider.rating ? provider.rating.toFixed(1) : "4.9";
  const reviewsCount = provider.reviewCount || 24;

  return (
    <TouchableOpacity
      style={styles.providerCard}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Mechanic ${provider.businessName}`}
    >
      <View style={styles.providerCardLeft}>
        <View style={styles.providerAvatarContainer}>
          <Image
            source={{ uri: getProviderAvatarUrl(provider) }}
            style={styles.providerAvatarImg}
            resizeMode="cover"
          />
          {isAvailable && <View style={styles.avatarOnlineDot} />}
        </View>

        <View style={styles.providerMetaCol}>
          <View style={styles.providerNameRow}>
            <Text style={styles.providerTitle} numberOfLines={1}>
              {provider.businessName}
            </Text>
            {provider.isVerified && (
              <Ionicons name="checkmark-circle" size={15} color={colors.primary[600]} />
            )}
          </View>

          <Text style={styles.providerAddressSnippet} numberOfLines={1}>
            {provider.address || "Khan 7 Makara, Phnom Penh"}
          </Text>

          <View style={styles.providerPillsRow}>
            {/* Star Rating */}
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#EAB308" />
              <Text style={styles.ratingText}>{ratingVal}</Text>
              <Text style={styles.ratingCountText}>({reviewsCount})</Text>
            </View>

            {/* Proximity Distance in m or km (US2 - T010) */}
            {distance && (
              <View style={styles.distanceBadge}>
                <Ionicons name="navigate-outline" size={11} color={colors.primary[700]} />
                <Text style={styles.distanceBadgeText}>{distance}</Text>
              </View>
            )}

            {/* Availability status */}
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isAvailable ? "#DCFCE7" : "#F4F4F5" },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isAvailable ? "#16A34A" : "#A1A1AA" },
                ]}
              />
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: isAvailable ? "#15803D" : "#52525B" },
                ]}
              >
                {isAvailable ? "Open" : "Busy"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.providerCardRight}>
        <View style={styles.bookCtaPill}>
          <Text style={styles.bookCtaText}>Book</Text>
          <Ionicons name="chevron-forward" size={13} color={colors.primary[700]} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* -------------------------------------------------------------------------
 * STYLES
 * ------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing["5xl"],
  },

  /* Top App Bar */
  topAppBar: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  appBarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userSection: {
    flex: 1,
    justifyContent: "center",
  },
  greetingText: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.neutral[900],
    letterSpacing: -0.3,
  },
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
    maxWidth: width * 0.52,
  },
  locationChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.neutral[600],
  },
  appBarActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error[500],
    borderWidth: 1.5,
    borderColor: colors.white,
  },

  /* Live Booking Tracker (US5) */
  activeBookingWrapper: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  activeBookingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: "#DBEAFE",
    ...shadows.sm,
  },
  activeBookingTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  liveBadgePending: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FEF3C7",
  },
  liveBadgeEnRoute: {
    backgroundColor: "#EFF6FF",
    borderColor: "#DBEAFE",
  },
  liveBadgeSuccess: {
    backgroundColor: "#F0FDF4",
    borderColor: "#DCFCE7",
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  activeBookingTime: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  activeBookingBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  activeBookingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  activeBookingAvatarImg: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  activeBookingDetails: {
    flex: 1,
  },
  activeBookingService: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  activeBookingProvider: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 2,
  },
  chatQuickBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  trackButton: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#0F172A",
  },
  trackButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  trackButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  /* Emergency Roadside SOS Banner (US1) */
  emergencyContainer: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  emergencyTouch: {
    borderRadius: 20,
    overflow: "hidden",
    ...shadows.md,
  },
  emergencyGradient: {
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },
  emergencyGlowRing: {
    position: "absolute",
    right: -30,
    bottom: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  emergencyLeft: {
    flex: 1,
    paddingRight: spacing.md,
  },
  sosPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  sosDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FEE2E2",
  },
  sosPillText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.6,
  },
  emergencyHeading: {
    fontSize: 19,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },
  emergencySubhead: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 3,
    lineHeight: 16,
  },
  emergencyActionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  emergencyIconPulse: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Sections */
  sectionContainer: {
    marginTop: spacing["2xl"],
    paddingHorizontal: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.neutral[900],
    letterSpacing: -0.3,
  },
  sectionActionText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary[600],
  },

  /* "My Garage" Vehicle Card - Streamlined Hierarchy */
  garageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...shadows.sm,
  },

  garageTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  carIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  vehicleInfoCol: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.neutral[900],
    letterSpacing: -0.2,
  },
  vehicleSubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  plateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  plateFlag: {
    fontSize: 10,
  },
  plateNumber: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.neutral[700],
    letterSpacing: 0.5,
  },
  subDot: {
    fontSize: 12,
    color: "#94A3B8",
  },
  vehicleColorText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
  },
  healthStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },
  healthPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#16A34A",
  },
  healthStatusText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#15803D",
  },

  /* Action Buttons Row */
  garageActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },
  primaryStudioBtn: {
    flex: 1.4,
    borderRadius: 12,
    overflow: "hidden",
    ...shadows.sm,
  },
  primaryStudioGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  primaryStudioBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  secondaryDiagBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  secondaryDiagBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },
  emptyGarageCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
  },
  emptyGarageIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  emptyGarageContent: {
    flex: 1,
  },
  emptyGarageTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  emptyGarageDesc: {
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: 2,
    lineHeight: 16,
  },

  /* Automotive Service Grid (US4) */
  serviceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  gridTile: {
    width: "48.5%",
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...shadows.sm,
  },
  gridTileUrgent: {
    borderColor: "#FECACA",
    backgroundColor: "#FFFBFA",
  },
  gridTileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  gridIconBox: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  gridIconBoxUrgent: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FEE2E2",
  },
  gridTileLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.neutral[900],
    letterSpacing: -0.2,
  },
  gridTileSublabel: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.neutral[500],
    marginTop: 2,
    lineHeight: 15,
  },

  /* Nearby Mechanics Feed (US2) */
  providerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 18,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    ...shadows.sm,
  },
  providerCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
    paddingRight: spacing.sm,
  },
  providerAvatarContainer: {
    position: "relative",
  },
  providerAvatarImg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primary[100],
    borderWidth: 1.5,
    borderColor: colors.primary[200],
  },
  providerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  providerAvatarInitial: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.primary[700],
  },
  avatarOnlineDot: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: colors.white,
  },
  providerMetaCol: {
    flex: 1,
  },
  providerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  providerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.neutral[900],
    flex: 1,
  },
  providerAddressSnippet: {
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: 2,
    fontWeight: "500",
  },
  providerPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    flexWrap: "wrap",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  ratingCountText: {
    fontSize: 11,
    color: colors.neutral[400],
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.primary[50],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  distanceBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary[700],
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  providerCardRight: {
    justifyContent: "center",
    alignItems: "center",
  },
  bookCtaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: colors.primary[50],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bookCtaText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary[700],
  },

  /* Empty State */
  emptyMechanicBox: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyMechanicIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyMechanicTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.neutral[800],
    textAlign: "center",
  },
  emptyMechanicDesc: {
    fontSize: 12,
    color: colors.neutral[500],
    textAlign: "center",
    marginTop: 4,
    lineHeight: 16,
    paddingHorizontal: spacing.md,
  },
  expandSearchButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 10,
  },
  expandSearchButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.white,
  },

  /* My Garage 3D hint */
  garage3dHintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    marginTop: spacing.md - 2,
  },
  garage3dIconBadge: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  garage3dHintText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0369A1",
    flex: 1,
  },
});
