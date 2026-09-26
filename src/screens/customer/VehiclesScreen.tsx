import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useVehicleStore, DEFAULT_PRESET_VEHICLES } from "../../store/vehicleStore";
import type { CustomerStackScreenProps } from "../../navigation/types";
import type { Vehicle } from "../../types";
import { colors, spacing, borderRadius, shadows } from "../../constants/theme";
import { AnimatedEntrance } from "../../components";

export function VehiclesScreen() {
  const navigation =
    useNavigation<CustomerStackScreenProps<"Vehicles">["navigation"]>();
  const {
    vehicles,
    activeVehicleId,
    isLoading,
    fetchVehicles,
    deleteVehicle,
    setActiveVehicleId,
    addVehicle,
  } = useVehicleStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchVehicles().catch(() => {});
  }, [fetchVehicles]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchVehicles().catch(() => {});
    setRefreshing(false);
  }, [fetchVehicles]);

  const handleSetActive = async (vehicle: Vehicle) => {
    await setActiveVehicleId(vehicle.id);
    Alert.alert(
      "Active Vehicle Updated",
      `${vehicle.year} ${vehicle.make} ${vehicle.model} is now your primary garage vehicle.`,
      [{ text: "OK" }]
    );
  };

  const handleInspect3D = (vehicle: Vehicle) => {
    navigation.navigate("Garage", { vehicle });
  };

  const handleDelete = (vehicle: Vehicle) => {
    Alert.alert(
      "Remove Vehicle",
      `Are you sure you want to remove ${vehicle.make} ${vehicle.model} from your garage?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteVehicle(vehicle.id);
            } catch {
              Alert.alert("Error", "Could not remove vehicle. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleLoadDemoFleet = async () => {
    try {
      for (const preset of DEFAULT_PRESET_VEHICLES) {
        await addVehicle({
          make: preset.make,
          model: preset.model,
          year: preset.year,
          plateNumber: preset.plateNumber,
          color: preset.color,
          vin: preset.vin,
        });
      }
    } catch {
      await fetchVehicles();
    }
  };

  const activeVehicle =
    vehicles.find((v) => v.id === activeVehicleId) || vehicles[0];

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
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
        {/* Top Summary Banner */}
        <AnimatedEntrance delay={0} direction="down">
          <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <View style={styles.summaryIconBox}>
                <Ionicons name="car-sport" size={22} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryTitle}>Garage Fleet</Text>
                <Text style={styles.summarySub}>
                  {vehicles.length} {vehicles.length === 1 ? "Vehicle" : "Vehicles"} Registered
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addBtnSmall}
                onPress={() => navigation.navigate("VehicleAdd")}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={18} color="#FFFFFF" />
                <Text style={styles.addBtnSmallText}>Add Car</Text>
              </TouchableOpacity>
            </View>

            {activeVehicle && (
              <View style={styles.activePillRow}>
                <Ionicons name="radio-button-on" size={14} color="#16A34A" />
                <Text style={styles.activePillText}>
                  Active: <Text style={{ fontWeight: "700" }}>{activeVehicle.make} {activeVehicle.model}</Text>
                </Text>
              </View>
            )}
          </View>
        </AnimatedEntrance>

        {/* Fleet List Header */}
        <AnimatedEntrance delay={70} direction="up">
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>REGISTERED FLEET</Text>
            <Text style={styles.sectionHint}>Tap to inspect in 3D or set primary</Text>
          </View>
        </AnimatedEntrance>

        {/* Loading Indicator */}
        {isLoading && vehicles.length === 0 && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary[600]} />
            <Text style={styles.loadingText}>Loading your vehicles…</Text>
          </View>
        )}

        {/* Vehicle Cards */}
        {vehicles.map((v) => {
          const isActive = v.id === activeVehicleId || (vehicles.length === 1 && !activeVehicleId);
          const plate = v.plateNumber || v.licensePlate || "2A-0000";

          return (
            <View
              key={v.id}
              style={[styles.vehicleCard, isActive && styles.vehicleCardActive]}
            >
              {/* Card Header Row */}
              <View style={styles.cardHeader}>
                <View style={styles.carBrandWrap}>
                  <View
                    style={[
                      styles.carIconBox,
                      { backgroundColor: isActive ? "#EFF6FF" : "#F1F5F9" },
                    ]}
                  >
                    <Ionicons
                      name="car"
                      size={24}
                      color={isActive ? "#2563EB" : "#64748B"}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.titleWithBadge}>
                      <Text style={styles.carTitle} numberOfLines={1}>
                        {v.make} {v.model}
                      </Text>
                    </View>
                    <Text style={styles.carYearSpec}>
                      {v.year} · {v.color || "Metallic"}
                    </Text>
                  </View>
                </View>

                {isActive ? (
                  <View style={styles.primaryBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#2563EB" />
                    <Text style={styles.primaryBadgeText}>Primary</Text>
                  </View>
                ) : null}
              </View>

              {/* License Plate & Specs Bar */}
              <View style={styles.plateBar}>
                <View style={styles.plateContainer}>
                  <Text style={styles.plateFlag}>🇰🇭</Text>
                  <Text style={styles.plateText}>{plate}</Text>
                </View>

                <View style={styles.telemetryTag}>
                  <Ionicons name="shield-checkmark" size={14} color="#16A34A" />
                  <Text style={styles.telemetryTagText}>96% Healthy</Text>
                </View>
              </View>

              {/* Action Buttons Row */}
              <View style={styles.cardActions}>
                {/* View Specs Button */}
                <TouchableOpacity
                  style={styles.inspect3dBtn}
                  onPress={() => handleInspect3D(v)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="speedometer-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.inspect3dBtnText}>View Specs</Text>
                </TouchableOpacity>

                {/* Set as Active Button */}
                {!isActive ? (
                  <TouchableOpacity
                    style={styles.setActiveBtn}
                    onPress={() => handleSetActive(v)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark" size={16} color="#2563EB" />
                    <Text style={styles.setActiveBtnText}>Set Active</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.activeIndicator}>
                    <Ionicons name="checkmark-done" size={16} color="#16A34A" />
                    <Text style={styles.activeIndicatorText}>Active Car</Text>
                  </View>
                )}

                {/* Delete Button */}
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(v)}
                  activeOpacity={0.7}
                  accessibilityLabel="Delete vehicle"
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Empty State */}
        {!isLoading && vehicles.length === 0 && (
          <View style={styles.emptyCard}>
            <Ionicons name="car-sport-outline" size={56} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Vehicles in Garage</Text>
            <Text style={styles.emptySub}>
              Register your car, SUV or pickup truck to track diagnostics, roadside assistance and vehicle health.
            </Text>

            <TouchableOpacity
              style={styles.emptyPrimaryBtn}
              onPress={() => navigation.navigate("VehicleAdd")}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.emptyPrimaryBtnText}>Register A Vehicle</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.emptySecondaryBtn}
              onPress={handleLoadDemoFleet}
              activeOpacity={0.8}
            >
              <Text style={styles.emptySecondaryBtnText}>
                Load Popular Models (Lexus, LC300, Tesla)
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Fleet Management Tip */}
        <View style={styles.tipBox}>
          <Ionicons name="information-circle-outline" size={18} color="#2563EB" />
          <Text style={styles.tipText}>
            The active primary vehicle is used automatically for 1-tap roadside dispatch, emergency assistance, and service bookings.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Floating Bottom Add Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bigAddBtn}
          onPress={() => navigation.navigate("VehicleAdd")}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
          <Text style={styles.bigAddBtnText}>Add Another Vehicle</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 90,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  summaryTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  summarySub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  addBtnSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#2563EB",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  addBtnSmallText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  activePillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  activePillText: {
    fontSize: 12,
    color: "#475569",
  },
  sectionHeader: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 1,
  },
  sectionHint: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  centerBox: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: "#64748B",
  },
  vehicleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  vehicleCardActive: {
    borderColor: "#93C5FD",
    backgroundColor: "#FCFDFF",
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  carBrandWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  carIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  titleWithBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  carTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  carYearSpec: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  primaryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  primaryBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
  },
  plateBar: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
  },
  plateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  plateFlag: {
    fontSize: 12,
  },
  plateText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#0F172A",
    fontFamily: "monospace",
  },
  telemetryTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  telemetryTagText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#16A34A",
  },
  vinTag: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  vinText: {
    fontSize: 10,
    color: "#64748B",
    fontFamily: "monospace",
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  inspect3dBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#2563EB",
    paddingVertical: 9,
    borderRadius: 10,
  },
  inspect3dBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  setActiveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingVertical: 9,
    borderRadius: 10,
  },
  setActiveBtnText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "600",
  },
  activeIndicator: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "#F0FDF4",
    paddingVertical: 9,
    borderRadius: 10,
  },
  activeIndicatorText: {
    color: "#16A34A",
    fontSize: 13,
    fontWeight: "600",
  },
  deleteBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 14,
  },
  emptySub: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  emptyPrimaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  emptyPrimaryBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  emptySecondaryBtn: {
    marginTop: 12,
    paddingVertical: 8,
  },
  emptySecondaryBtnText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "600",
  },
  tipBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    padding: 12,
    borderRadius: 12,
    marginTop: spacing.md,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: "#1E40AF",
    lineHeight: 17,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    ...shadows.md,
  },
  bigAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
  },
  bigAddBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
