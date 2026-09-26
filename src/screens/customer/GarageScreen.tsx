import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Dimensions,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import type { CustomerStackScreenProps, CustomerStackParamList } from "../../navigation/types";
import type { Vehicle } from "../../types";
import { useVehicleStore, useTranslation } from "../../store";
import { AnimatedEntrance } from "../../components";
import { colors, spacing, fontSize, borderRadius, shadows } from "../../constants/theme";

type GarageScreenRoute = RouteProp<CustomerStackParamList, "Garage">;

export function GarageScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<CustomerStackScreenProps<"Garage">["navigation"]>();
  const route = useRoute<GarageScreenRoute>();

  const { vehicles, setActiveVehicleId, getActiveVehicle } = useVehicleStore();
  const { t, language } = useTranslation();

  const [activeVehicle, setActiveVehicle] = useState<Vehicle>(() => {
    return route.params?.vehicle || getActiveVehicle() || vehicles[0] || {
      id: "veh-default",
      make: "Toyota",
      model: "Camry Hybrid",
      year: 2023,
      plateNumber: "2A-8888",
      color: "Pearl White",
    };
  });

  const [activeTab, setActiveTab] = useState<"telemetry" | "history" | "specs">("telemetry");
  const [fleetModalVisible, setFleetModalVisible] = useState(false);

  const vehicleName = `${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`;
  const plateText = activeVehicle.plateNumber || (activeVehicle as any).licensePlate || "2A-8888";
  const mileageText = (activeVehicle as any).mileage ? `${(activeVehicle as any).mileage.toLocaleString()} km` : "48,250 km";

  const handleSelectFleetVehicle = (v: Vehicle) => {
    setActiveVehicle(v);
    setActiveVehicleId(v.id);
    setFleetModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={colors.neutral[800]} />
          </TouchableOpacity>

          <View style={styles.titleCol}>
            <Text style={styles.screenHeading}>{t("myGarage")}</Text>
            <Text style={styles.vehicleSubHeading} numberOfLines={1}>
              {vehicleName} • {plateText}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.fleetSwitchBtn}
            onPress={() => setFleetModalVisible(true)}
            activeOpacity={0.75}
          >
            <Ionicons name="car-sport" size={15} color={colors.primary[600]} />
            <Text style={styles.fleetSwitchBtnText}>
              {t("myVehicles")} ({vehicles.length || 1})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
      >
        {/* Main Vehicle Identity Card */}
        <AnimatedEntrance delay={0} direction="down">
          <View style={styles.heroIdentityCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.carAvatarBox}>
                <Ionicons name="car-sport" size={28} color="#2563EB" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.heroVehicleTitle}>{vehicleName}</Text>
                <View style={styles.heroMetaRow}>
                  <View style={styles.plateChip}>
                    <Text style={styles.plateChipText}>{plateText}</Text>
                  </View>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.heroColorText}>{activeVehicle.color || "Metallic"}</Text>
                </View>
              </View>

              {/* Health Score Circular Badge */}
              <View style={styles.gaugeContainer}>
                <Svg width={64} height={64} viewBox="0 0 64 64">
                  <Circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="#E2E8F0"
                    strokeWidth="5"
                    fill="none"
                  />
                  <Circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="#16A34A"
                    strokeWidth="5"
                    strokeDasharray={163.36}
                    strokeDashoffset={163.36 * (1 - 0.96)}
                    strokeLinecap="round"
                    fill="none"
                    transform="rotate(-90 32 32)"
                  />
                </Svg>
                <View style={styles.gaugeCenter}>
                  <Text style={styles.gaugePct}>96%</Text>
                  <Text style={styles.gaugeLabel}>{t("healthScore")}</Text>
                </View>
              </View>
            </View>

            {/* Quick Stats Strip */}
            <View style={styles.quickStatsRow}>
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatLabel}>{t("odometer")}</Text>
                <Text style={styles.quickStatValue}>{mileageText}</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatLabel}>{t("range")}</Text>
                <Text style={styles.quickStatValue}>340 km</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatLabel}>{t("nextService")}</Text>
                <Text style={styles.quickStatValue}>1,750 km</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatLabel}>{t("status")}</Text>
                <Text style={[styles.quickStatValue, { color: "#16A34A" }]}>{t("optimal")}</Text>
              </View>
            </View>
          </View>
        </AnimatedEntrance>

        {/* Navigation Segmented Tabs */}
        <AnimatedEntrance delay={40} direction="up">
          <View style={styles.segmentedBar}>
            <TouchableOpacity
              style={[styles.segTab, activeTab === "telemetry" && styles.segTabActive]}
              onPress={() => setActiveTab("telemetry")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="pulse-outline"
                size={15}
                color={activeTab === "telemetry" ? colors.primary[600] : colors.neutral[500]}
              />
              <Text style={[styles.segTabText, activeTab === "telemetry" && styles.segTabTextActive]}>
                {t("liveTelemetry")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segTab, activeTab === "specs" && styles.segTabActive]}
              onPress={() => setActiveTab("specs")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="document-text-outline"
                size={15}
                color={activeTab === "specs" ? colors.primary[600] : colors.neutral[500]}
              />
              <Text style={[styles.segTabText, activeTab === "specs" && styles.segTabTextActive]}>
                {t("specifications")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segTab, activeTab === "history" && styles.segTabActive]}
              onPress={() => setActiveTab("history")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="time-outline"
                size={15}
                color={activeTab === "history" ? colors.primary[600] : colors.neutral[500]}
              />
              <Text style={[styles.segTabText, activeTab === "history" && styles.segTabTextActive]}>
                {t("serviceLog")}
              </Text>
            </TouchableOpacity>
          </View>
        </AnimatedEntrance>

        {/* Tab 1: Live Telemetry Cards */}
        {activeTab === "telemetry" && (
          <AnimatedEntrance delay={80} direction="up">
            <View style={styles.sectionWrap}>
              <Text style={styles.sectionHeaderTitle}>COMPONENT STATUS</Text>

              {/* Engine & Transmission */}
              <View style={styles.telemetryCard}>
                <View style={styles.telemetryTop}>
                  <View style={[styles.componentIcon, { backgroundColor: "#EFF6FF" }]}>
                    <Ionicons name="speedometer" size={18} color="#2563EB" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.componentTitle}>Engine & Powertrain</Text>
                    <Text style={styles.componentSub}>88% Synthetic Oil Life Remaining</Text>
                  </View>
                  <View style={styles.statusPillGood}>
                    <Text style={styles.statusPillGoodText}>OPTIMAL</Text>
                  </View>
                </View>
                <View style={styles.telemetryDetailRow}>
                  <Text style={styles.detailLabel}>Coolant Temp:</Text>
                  <Text style={styles.detailValue}>92°C (Normal)</Text>
                  <Text style={styles.detailDot}>•</Text>
                  <Text style={styles.detailLabel}>Oil Viscosity:</Text>
                  <Text style={styles.detailValue}>5W-30 Full Syn</Text>
                </View>
              </View>

              {/* 12V Battery System */}
              <View style={styles.telemetryCard}>
                <View style={styles.telemetryTop}>
                  <View style={[styles.componentIcon, { backgroundColor: "#FEF3C7" }]}>
                    <Ionicons name="flash" size={18} color="#D97706" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.componentTitle}>12V Battery & Alternator</Text>
                    <Text style={styles.componentSub}>12.6V Resting Voltage • 14.2V Charging</Text>
                  </View>
                  <View style={styles.statusPillGood}>
                    <Text style={styles.statusPillGoodText}>HEALTHY</Text>
                  </View>
                </View>
                <View style={styles.telemetryDetailRow}>
                  <Text style={styles.detailLabel}>CCA Rating:</Text>
                  <Text style={styles.detailValue}>650 A</Text>
                  <Text style={styles.detailDot}>•</Text>
                  <Text style={styles.detailLabel}>State of Health:</Text>
                  <Text style={styles.detailValue}>94% Capacity</Text>
                </View>
              </View>

              {/* Braking System */}
              <View style={styles.telemetryCard}>
                <View style={styles.telemetryTop}>
                  <View style={[styles.componentIcon, { backgroundColor: "#F0FDF4" }]}>
                    <Ionicons name="disc" size={18} color="#16A34A" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.componentTitle}>Braking Circuit</Text>
                    <Text style={styles.componentSub}>Pads Front: 8mm • Rear: 7mm (Safe)</Text>
                  </View>
                  <View style={styles.statusPillGood}>
                    <Text style={styles.statusPillGoodText}>PASS</Text>
                  </View>
                </View>
                <View style={styles.telemetryDetailRow}>
                  <Text style={styles.detailLabel}>Brake Fluid:</Text>
                  <Text style={styles.detailValue}>DOT 4 (Moisture &lt; 1%)</Text>
                  <Text style={styles.detailDot}>•</Text>
                  <Text style={styles.detailLabel}>ABS Module:</Text>
                  <Text style={styles.detailValue}>Calibrated</Text>
                </View>
              </View>

              {/* Tires & TPMS */}
              <View style={styles.telemetryCard}>
                <View style={styles.telemetryTop}>
                  <View style={[styles.componentIcon, { backgroundColor: "#F1F5F9" }]}>
                    <Ionicons name="ellipse-outline" size={18} color="#475569" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.componentTitle}>Tires & TPMS Sensors</Text>
                    <Text style={styles.componentSub}>Front: 32 PSI • Rear: 32 PSI</Text>
                  </View>
                  <View style={styles.statusPillGood}>
                    <Text style={styles.statusPillGoodText}>32 PSI</Text>
                  </View>
                </View>
                <View style={styles.telemetryDetailRow}>
                  <Text style={styles.detailLabel}>Tread Depth:</Text>
                  <Text style={styles.detailValue}>5.5mm (Good)</Text>
                  <Text style={styles.detailDot}>•</Text>
                  <Text style={styles.detailLabel}>Alignment:</Text>
                  <Text style={styles.detailValue}>0.02° Toe</Text>
                </View>
              </View>
            </View>
          </AnimatedEntrance>
        )}

        {/* Tab 2: Vehicle Technical Specs */}
        {activeTab === "specs" && (
          <AnimatedEntrance delay={80} direction="up">
            <View style={styles.sectionWrap}>
              <Text style={styles.sectionHeaderTitle}>FACTORY SPECIFICATIONS</Text>

              <View style={styles.specCard}>
                <View style={styles.specRow}>
                  <Text style={styles.specRowLabel}>Vehicle Make</Text>
                  <Text style={styles.specRowValue}>{activeVehicle.make}</Text>
                </View>
                <View style={styles.specRowDivider} />
                <View style={styles.specRow}>
                  <Text style={styles.specRowLabel}>Model & Trim</Text>
                  <Text style={styles.specRowValue}>{activeVehicle.model}</Text>
                </View>
                <View style={styles.specRowDivider} />
                <View style={styles.specRow}>
                  <Text style={styles.specRowLabel}>Manufacturing Year</Text>
                  <Text style={styles.specRowValue}>{activeVehicle.year}</Text>
                </View>
                <View style={styles.specRowDivider} />
                <View style={styles.specRow}>
                  <Text style={styles.specRowLabel}>Registered License Plate</Text>
                  <Text style={styles.specRowValue}>{plateText}</Text>
                </View>
                <View style={styles.specRowDivider} />
                <View style={styles.specRow}>
                  <Text style={styles.specRowLabel}>Exterior Body Color</Text>
                  <Text style={styles.specRowValue}>{activeVehicle.color || "Metallic"}</Text>
                </View>
                <View style={styles.specRowDivider} />
                <View style={styles.specRow}>
                  <Text style={styles.specRowLabel}>Chassis / VIN</Text>
                  <Text style={styles.specRowValue}>{activeVehicle.vin || "2T1BURHE7PC192842"}</Text>
                </View>
                <View style={styles.specRowDivider} />
                <View style={styles.specRow}>
                  <Text style={styles.specRowLabel}>Engine Powertrain</Text>
                  <Text style={styles.specRowValue}>2.5L Dynamic Force 4-Cylinder</Text>
                </View>
                <View style={styles.specRowDivider} />
                <View style={styles.specRow}>
                  <Text style={styles.specRowLabel}>Transmission</Text>
                  <Text style={styles.specRowValue}>eCVT Automatic Transmission</Text>
                </View>
              </View>
            </View>
          </AnimatedEntrance>
        )}

        {/* Tab 3: Service Log */}
        {activeTab === "history" && (
          <AnimatedEntrance delay={80} direction="up">
            <View style={styles.sectionWrap}>
              <Text style={styles.sectionHeaderTitle}>MAINTENANCE & REPAIR RECORDS</Text>

              <View style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <View style={styles.historyDot} />
                  <Text style={styles.historyDate}>Aug 15, 2026</Text>
                  <Text style={styles.historyCost}>$65.00</Text>
                </View>
                <Text style={styles.historyTitle}>Ceramic Brake Pad & Rotor Resurfacing</Text>
                <Text style={styles.historyGarage}>TechTune Certified Workshop • Phnom Penh</Text>
              </View>

              <View style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <View style={styles.historyDot} />
                  <Text style={styles.historyDate}>Jun 22, 2026</Text>
                  <Text style={styles.historyCost}>$120.00</Text>
                </View>
                <Text style={styles.historyTitle}>40,000 km Major Maintenance & Full Synthetic Oil</Text>
                <Text style={styles.historyGarage}>Sakura Auto Care Center • Toul Kork</Text>
              </View>

              <View style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <View style={styles.historyDot} />
                  <Text style={styles.historyDate}>Mar 10, 2026</Text>
                  <Text style={styles.historyCost}>$30.00</Text>
                </View>
                <Text style={styles.historyTitle}>High-Speed Dynamic Wheel Balancing & Rotation</Text>
                <Text style={styles.historyGarage}>Phnom Penh Express Tire Hub • BKK1</Text>
              </View>
            </View>
          </AnimatedEntrance>
        )}

        {/* Action Buttons */}
        <AnimatedEntrance delay={120} direction="up">
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.primaryBookBtn}
              onPress={() => navigation.navigate("CustomerTabs", { screen: "Search" })}
              activeOpacity={0.85}
            >
              <Ionicons name="calendar-outline" size={17} color="#FFFFFF" />
              <Text style={styles.primaryBookBtnText}>Book Service for this Car</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryScanBtn}
              onPress={() => navigation.navigate("Diagnostics")}
              activeOpacity={0.8}
            >
              <Ionicons name="hardware-chip-outline" size={17} color="#2563EB" />
              <Text style={styles.secondaryScanBtnText}>Run Diagnostics</Text>
            </TouchableOpacity>
          </View>
        </AnimatedEntrance>
      </ScrollView>

      {/* Fleet Switcher Bottom Sheet */}
      <Modal
        visible={fleetModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFleetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setFleetModalVisible(false)} />
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeaderTitle}>Select Vehicle</Text>
              <TouchableOpacity onPress={() => setFleetModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.neutral[600]} />
              </TouchableOpacity>
            </View>

            {vehicles.map((v) => {
              const isSelected = activeVehicle.id === v.id;
              return (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.fleetItem, isSelected && styles.fleetItemActive]}
                  onPress={() => handleSelectFleetVehicle(v)}
                  activeOpacity={0.8}
                >
                  <View style={styles.fleetItemIcon}>
                    <Ionicons name="car-sport" size={20} color={isSelected ? "#2563EB" : colors.neutral[600]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fleetItemTitle, isSelected && { color: "#2563EB" }]}>
                      {v.year} {v.make} {v.model}
                    </Text>
                    <Text style={styles.fleetItemSub}>
                      {v.plateNumber || v.licensePlate || "2A-8888"} • {v.color || "Metallic"}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color="#2563EB" />
                  )}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={styles.addVehicleBtn}
              onPress={() => {
                setFleetModalVisible(false);
                navigation.navigate("VehicleAdd");
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={18} color="#2563EB" />
              <Text style={styles.addVehicleBtnText}>Add Another Vehicle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  topBar: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  topBarRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 10,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
  },
  titleCol: {
    flex: 1,
  },
  screenHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.neutral[900],
  },
  vehicleSubHeading: {
    fontSize: 11,
    color: colors.neutral[500],
    fontWeight: "500",
    marginTop: 1,
  },
  fleetSwitchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  fleetSwitchBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary[700],
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    padding: spacing.lg,
  },

  // Hero Card
  heroIdentityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  carAvatarBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  heroVehicleTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.neutral[900],
  },
  heroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
  },
  plateChip: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  plateChipText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.neutral[800],
    letterSpacing: 0.5,
  },
  metaDot: {
    fontSize: 12,
    color: colors.neutral[400],
  },
  heroColorText: {
    fontSize: 12,
    color: colors.neutral[500],
    fontWeight: "500",
  },
  gaugeContainer: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  gaugePct: {
    fontSize: 14,
    fontWeight: "800",
    color: "#16A34A",
  },
  gaugeLabel: {
    fontSize: 7,
    fontWeight: "800",
    color: colors.neutral[400],
    letterSpacing: 0.5,
  },
  quickStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  quickStatItem: {
    flex: 1,
    alignItems: "center",
  },
  quickStatLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.neutral[400],
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  quickStatValue: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.neutral[800],
  },
  quickStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#E2E8F0",
  },

  // Segmented Bar
  segmentedBar: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    borderRadius: 14,
    padding: 3,
    marginBottom: spacing.md,
  },
  segTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 9,
    borderRadius: 11,
  },
  segTabActive: {
    backgroundColor: "#FFFFFF",
    ...shadows.sm,
  },
  segTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.neutral[600],
  },
  segTabTextActive: {
    fontWeight: "700",
    color: colors.primary[700],
  },

  // Telemetry Section
  sectionWrap: {
    marginBottom: spacing.md,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.neutral[400],
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  telemetryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...shadows.sm,
  },
  telemetryTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  componentIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  componentTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.neutral[900],
  },
  componentSub: {
    fontSize: 11,
    color: colors.neutral[500],
    marginTop: 1,
  },
  statusPillGood: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusPillGoodText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#16A34A",
  },
  telemetryDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  detailLabel: {
    fontSize: 11,
    color: colors.neutral[400],
  },
  detailValue: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.neutral[700],
  },
  detailDot: {
    fontSize: 11,
    color: colors.neutral[300],
  },

  // Specifications
  specCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...shadows.sm,
  },
  specRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  specRowLabel: {
    fontSize: 13,
    color: colors.neutral[500],
  },
  specRowValue: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  specRowDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },

  // Service Log
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...shadows.sm,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  historyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2563EB",
  },
  historyDate: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.neutral[500],
    flex: 1,
  },
  historyCost: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary[700],
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.neutral[900],
    marginBottom: 2,
  },
  historyGarage: {
    fontSize: 11,
    color: colors.neutral[500],
  },

  // Bottom Actions
  actionsContainer: {
    gap: 10,
    marginTop: spacing.sm,
  },
  primaryBookBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 14,
    ...shadows.sm,
  },
  primaryBookBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  secondaryScanBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: "#BFDBFE",
  },
  secondaryScanBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.neutral[900],
  },
  fleetItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  fleetItemActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  fleetItemIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  fleetItemTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.neutral[900],
  },
  fleetItemSub: {
    fontSize: 11,
    color: colors.neutral[500],
    marginTop: 1,
  },
  addVehicleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },
  addVehicleBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },
});
