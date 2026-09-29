import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, borderRadius, shadows } from "../../constants/theme";
import {
  INITIAL_WEEKLY_SCHEDULE,
  MockDaySchedule,
  MockTimeSlot,
} from "../../data/mockProviderData";
import api from "../../services/api";
import { useBookingStore } from "../../store";
import { AnimatedEntrance } from "../../components/AnimatedEntrance";

export default function ScheduleScreen() {
  const { bookings, fetchBookings } = useBookingStore();
  const [schedule, setSchedule] = useState<MockDaySchedule[]>(INITIAL_WEEKLY_SCHEDULE);
  const [activeTab, setActiveTab] = useState<"weekly" | "timeline">("weekly");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // Mon
  const [timeEditModalVisible, setTimeEditModalVisible] = useState(false);
  const [editingDay, setEditingDay] = useState<MockDaySchedule | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load real provider schedule from backend
  const loadScheduleData = useCallback(async () => {
    try {
      await fetchBookings();
      const me = await api.providers.getMe();
      if (me && me.workingHours) {
        const dayKeys = [
          { key: "monday", day: "Monday", shortDay: "Mon" },
          { key: "tuesday", day: "Tuesday", shortDay: "Tue" },
          { key: "wednesday", day: "Wednesday", shortDay: "Wed" },
          { key: "thursday", day: "Thursday", shortDay: "Thu" },
          { key: "friday", day: "Friday", shortDay: "Fri" },
          { key: "saturday", day: "Saturday", shortDay: "Sat" },
          { key: "sunday", day: "Sunday", shortDay: "Sun" },
        ];
        const mapped: MockDaySchedule[] = dayKeys.map(({ key, day, shortDay }) => {
          const h = (me.workingHours as any)[key];
          return {
            day,
            shortDay,
            isEnabled: h ? Boolean(h.isOpen) : true,
            startTime: h?.openTime || "08:00 AM",
            endTime: h?.closeTime || "06:00 PM",
          };
        });
        setSchedule(mapped);
      }
    } catch {
      // Keep baseline
    }
  }, [fetchBookings]);

  useEffect(() => {
    loadScheduleData();
  }, [loadScheduleData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadScheduleData();
    setRefreshing(false);
  };

  // Build real daily time slots from actual live bookings
  const timeSlots = useMemo<MockTimeSlot[]>(() => {
    const baseHours = [
      "08:00 AM",
      "09:00 AM",
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "01:00 PM",
      "02:00 PM",
      "03:00 PM",
      "04:00 PM",
      "05:00 PM",
    ];

    const activeBookings = bookings.filter((b) => b.status !== "cancelled");

    return baseHours.map((hour, idx) => {
      // Match by hour prefix & AM/PM
      const match = activeBookings.find((b) => {
        if (!b.scheduledTime) return false;
        const bTime = b.scheduledTime.toUpperCase();
        const bHourPrefix = bTime.slice(0, 2);
        const slotHourPrefix = hour.slice(0, 2);
        const bAmPm = bTime.includes("PM") ? "PM" : "AM";
        const slotAmPm = hour.includes("PM") ? "PM" : "AM";
        return bHourPrefix === slotHourPrefix && bAmPm === slotAmPm;
      });

      if (match) {
        const vehicleText = match.vehicle
          ? `${match.vehicle.make} ${match.vehicle.model}`
          : match.vehicleInfo || "Registered Vehicle";
        return {
          id: match.id,
          time: match.scheduledTime || hour,
          isBooked: true,
          customerName: match.customer?.name || match.customerName || "Verified Customer",
          vehicleModel: vehicleText,
          service: match.serviceType || "Emergency Repair & Diagnostics",
        };
      }

      return {
        id: `slot-${idx}`,
        time: hour,
        isBooked: false,
      };
    });
  }, [bookings]);

  const toggleDayEnabled = (index: number) => {
    setSchedule((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, isEnabled: !item.isEnabled } : item))
    );
  };

  const handleOpenTimeModal = (day: MockDaySchedule) => {
    setEditingDay(day);
    setTimeEditModalVisible(true);
  };

  const setHoursPreset = (startTime: string, endTime: string) => {
    if (editingDay) {
      setSchedule((prev) =>
        prev.map((item) =>
          item.day === editingDay.day ? { ...item, startTime, endTime, isEnabled: true } : item
        )
      );
      setTimeEditModalVisible(false);
    }
  };

  const openDaysCount = schedule.filter((d) => d.isEnabled).length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <AnimatedEntrance delay={0} direction="down">
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Hours & Schedule</Text>
            <Text style={styles.headerSubtitle}>
              {openDaysCount} Days Active • Weekly Workshop Operations
            </Text>
          </View>

          {/* Tab Toggle between Weekly Rules and Daily Timeline */}
          <View style={styles.viewToggleContainer}>
            <TouchableOpacity
              style={[styles.viewToggleBtn, activeTab === "weekly" && styles.viewToggleBtnActive]}
              onPress={() => setActiveTab("weekly")}
            >
              <Ionicons
                name="calendar-outline"
                size={14}
                color={activeTab === "weekly" ? colors.white : colors.neutral[600]}
              />
              <Text
                style={[
                  styles.viewToggleBtnText,
                  activeTab === "weekly" && styles.viewToggleBtnTextActive,
                ]}
              >
                Weekly
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.viewToggleBtn, activeTab === "timeline" && styles.viewToggleBtnActive]}
              onPress={() => setActiveTab("timeline")}
            >
              <Ionicons
                name="time-outline"
                size={14}
                color={activeTab === "timeline" ? colors.white : colors.neutral[600]}
              />
              <Text
                style={[
                  styles.viewToggleBtnText,
                  activeTab === "timeline" && styles.viewToggleBtnTextActive,
                ]}
              >
                Timeline
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </AnimatedEntrance>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollInner}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary[600]]}
          />
        }
      >
        {/* 24/7 Emergency Night Shift Hero Banner */}
        <AnimatedEntrance delay={80} direction="up">
          <View style={styles.nightShiftHero}>
            <View style={styles.nightShiftLeft}>
              <View style={styles.nightShiftIconCircle}>
                <Ionicons name="moon" size={18} color="#FBBF24" />
              </View>
              <View>
                <Text style={styles.nightShiftTitle}>24/7 Roadside Night Patrol</Text>
                <Text style={styles.nightShiftSubtitle}>
                  On-call dispatch readiness from 10:00 PM to 06:00 AM
                </Text>
              </View>
            </View>
            <View style={styles.nightShiftPill}>
              <View style={styles.pulseDot} />
              <Text style={styles.nightShiftPillText}>STANDBY</Text>
            </View>
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={140} direction="up">

        {activeTab === "weekly" ? (
          /* WEEKLY OPERATING HOURS VIEW */
          <View style={styles.weeklyCard}>
            <Text style={styles.cardHeaderTitle}>Standard Workshop Operating Hours</Text>
            <Text style={styles.cardHeaderSub}>
              Customers will only be allowed to book regular service appointments during open times.
            </Text>

            {schedule.map((item, index) => {
              return (
                <View key={item.day} style={styles.dayRow}>
                  <View style={styles.dayLeft}>
                    <View
                      style={[
                        styles.dayIndicator,
                        { backgroundColor: item.isEnabled ? colors.primary[600] : colors.neutral[300] },
                      ]}
                    />
                    <View>
                      <Text
                        style={[
                          styles.dayNameText,
                          !item.isEnabled && styles.dayNameTextDisabled,
                        ]}
                      >
                        {item.day}
                      </Text>
                      <Text style={styles.dayStatusSub}>
                        {item.isEnabled ? "Open for Bookings" : "Closed / Off Duty"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.dayRight}>
                    {item.isEnabled ? (
                      <TouchableOpacity
                        style={styles.timeBadgeButton}
                        onPress={() => handleOpenTimeModal(item)}
                      >
                        <Text style={styles.timeBadgeText}>
                          {item.startTime} – {item.endTime}
                        </Text>
                        <Ionicons name="pencil-outline" size={12} color={colors.primary[600]} />
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.closedPill}>
                        <Text style={styles.closedPillText}>CLOSED</Text>
                      </View>
                    )}

                    <Switch
                      value={item.isEnabled}
                      onValueChange={() => toggleDayEnabled(index)}
                      trackColor={{ false: colors.neutral[300], true: colors.primary[600] }}
                      thumbColor={colors.white}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          /* DAILY TIMELINE VIEW */
          <View style={styles.timelineContainer}>
            {/* Horizontal Day Switcher */}
            <View style={styles.daySelectorRow}>
              {schedule.map((d, idx) => {
                const isSelected = selectedDayIndex === idx;
                return (
                  <TouchableOpacity
                    key={d.day}
                    style={[styles.daySelectChip, isSelected && styles.daySelectChipActive]}
                    onPress={() => setSelectedDayIndex(idx)}
                  >
                    <Text
                      style={[
                        styles.daySelectChipDay,
                        isSelected && styles.daySelectChipDayActive,
                      ]}
                    >
                      {d.shortDay}
                    </Text>
                    <View
                      style={[
                        styles.daySelectDot,
                        { backgroundColor: d.isEnabled ? colors.success[500] : colors.neutral[300] },
                      ]}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.timelineCard}>
              <View style={styles.timelineCardHeader}>
                <Text style={styles.timelineCardTitle}>
                  {schedule[selectedDayIndex].day} Appointments
                </Text>
                <Text style={styles.timelineCardHours}>
                  {schedule[selectedDayIndex].isEnabled
                    ? `${schedule[selectedDayIndex].startTime} - ${schedule[selectedDayIndex].endTime}`
                    : "Workshop Closed"}
                </Text>
              </View>

              {/* Time Slots List */}
              {timeSlots.map((slot) => {
                return (
                  <View key={slot.id} style={styles.slotRow}>
                    <View style={styles.slotTimeCol}>
                      <Text style={styles.slotTimeText}>{slot.time}</Text>
                      <View style={styles.slotVerticalLine} />
                    </View>

                    <View
                      style={[
                        styles.slotContentCard,
                        slot.isBooked ? styles.slotBookedCard : styles.slotAvailableCard,
                      ]}
                    >
                      {slot.isBooked ? (
                        <>
                          <View style={styles.slotCustomerRow}>
                            <Text style={styles.slotCustomerName}>{slot.customerName}</Text>
                            <View style={styles.bookedBadge}>
                              <Ionicons name="checkmark-circle" size={11} color={colors.primary[700]} />
                              <Text style={styles.bookedBadgeText}>RESERVED</Text>
                            </View>
                          </View>
                          <Text style={styles.slotVehicleText}>🚗 {slot.vehicleModel}</Text>
                          <Text style={styles.slotServiceText}>🔧 {slot.service}</Text>
                        </>
                      ) : (
                        <View style={styles.availableSlotContent}>
                          <Ionicons name="add-circle-outline" size={18} color={colors.success[600]} />
                          <Text style={styles.availableSlotText}>Available Slot • Open for Booking</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
        </AnimatedEntrance>
      </ScrollView>

      {/* Edit Hours Preset Modal */}
      <Modal
        visible={timeEditModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTimeEditModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons name="time" size={24} color={colors.primary[600]} />
              <Text style={styles.modalTitle}>
                Edit Hours: {editingDay?.day}
              </Text>
            </View>
            <Text style={styles.modalSubtitle}>
              Select standard shift hours for this working day:
            </Text>

            {[
              { label: "Standard Day (08:00 AM – 06:00 PM)", start: "08:00", end: "18:00" },
              { label: "Morning Shift (07:30 AM – 03:30 PM)", start: "07:30", end: "15:30" },
              { label: "Extended Shift (08:00 AM – 08:00 PM)", start: "08:00", end: "20:00" },
              { label: "Weekend Half-Day (08:30 AM – 02:00 PM)", start: "08:30", end: "14:00" },
            ].map((preset, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.presetButton}
                onPress={() => setHoursPreset(preset.start, preset.end)}
              >
                <Text style={styles.presetButtonText}>{preset.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.neutral[400]} />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setTimeEditModalVisible(false)}
            >
              <Text style={styles.modalCloseBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.neutral[900],
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.neutral[500],
    marginTop: 2,
  },
  viewToggleContainer: {
    flexDirection: "row",
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.full,
    padding: 3,
  },
  viewToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  viewToggleBtnActive: {
    backgroundColor: colors.primary[600],
    ...shadows.sm,
  },
  viewToggleBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.neutral[700],
  },
  viewToggleBtnTextActive: {
    color: colors.white,
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["4xl"],
  },
  nightShiftHero: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0F172A",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  nightShiftLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  nightShiftIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  nightShiftTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.white,
  },
  nightShiftSubtitle: {
    fontSize: 10,
    color: colors.neutral[400],
    marginTop: 1,
  },
  nightShiftPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.4)",
    gap: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FBBF24",
  },
  nightShiftPillText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FBBF24",
  },
  weeklyCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: 2,
  },
  cardHeaderSub: {
    fontSize: 11,
    color: colors.neutral[500],
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  dayLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  dayIndicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
  },
  dayNameText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  dayNameTextDisabled: {
    color: colors.neutral[400],
  },
  dayStatusSub: {
    fontSize: 10,
    color: colors.neutral[400],
  },
  dayRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  timeBadgeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary[50],
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary[100],
    gap: 4,
  },
  timeBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.primary[700],
  },
  closedPill: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
  },
  closedPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.neutral[500],
  },
  timelineContainer: {},
  daySelectorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    gap: 6,
  },
  daySelectChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  daySelectChipActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  daySelectChipDay: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.neutral[700],
    marginBottom: 4,
  },
  daySelectChipDayActive: {
    color: colors.white,
  },
  daySelectDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  timelineCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  timelineCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
    marginBottom: spacing.sm,
  },
  timelineCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  timelineCardHours: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.primary[600],
  },
  slotRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  slotTimeCol: {
    width: 65,
    alignItems: "center",
    paddingTop: 4,
  },
  slotTimeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.neutral[600],
  },
  slotVerticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.neutral[200],
    marginTop: 4,
    borderRadius: 1,
  },
  slotContentCard: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  slotBookedCard: {
    backgroundColor: "#F8FAFC",
    borderColor: colors.primary[100],
  },
  slotAvailableCard: {
    backgroundColor: colors.white,
    borderColor: colors.neutral[200],
    borderStyle: "dashed",
    justifyContent: "center",
  },
  slotCustomerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  slotCustomerName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  bookedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary[50],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 3,
  },
  bookedBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.primary[700],
  },
  slotVehicleText: {
    fontSize: 11,
    color: colors.neutral[600],
    marginTop: 1,
  },
  slotServiceText: {
    fontSize: 11,
    color: colors.primary[700],
    fontWeight: "600",
    marginTop: 1,
  },
  availableSlotContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  availableSlotText: {
    fontSize: 11,
    color: colors.neutral[500],
    fontWeight: "500",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: "100%",
    maxWidth: 360,
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.neutral[600],
    marginBottom: spacing.md,
  },
  presetButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  presetButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.neutral[800],
  },
  modalCloseBtn: {
    marginTop: spacing.md,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[100],
  },
  modalCloseBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.neutral[700],
  },
});
