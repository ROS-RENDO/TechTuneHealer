import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ProviderStackParamList } from "../../navigation/types";
import { colors, spacing, fontSize, shadows } from "../../constants/theme";
import { useBookingStore } from "../../store";
import { Booking } from "../../types";

type NavigationProp = NativeStackNavigationProp<ProviderStackParamList>;

type BookingStatus = "all" | "pending" | "accepted" | "in_progress" | "completed" | "cancelled";

const STATUS_FILTERS: { key: BookingStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

export default function ProviderBookingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { bookings, fetchBookings, updateBookingStatus } = useBookingStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<BookingStatus>("all");

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const filteredBookings = bookings.filter((booking) => {
    if (activeFilter === "all") return true;
    return booking.status === activeFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return { bg: colors.warning[50], text: colors.warning[700], border: colors.warning[100] };
      case "accepted": return { bg: colors.primary[50], text: colors.primary[700], border: colors.primary[100] };
      case "in_progress": return { bg: colors.secondary[50], text: colors.secondary[700], border: colors.secondary[100] };
      case "completed": return { bg: colors.success[50], text: colors.success[700], border: colors.success[100] };
      case "cancelled":
      case "rejected":
        return { bg: colors.error[50], text: colors.error[700], border: colors.error[100] };
      default: return { bg: colors.neutral[100], text: colors.neutral[600], border: colors.neutral[200] };
    }
  };

  const handleAccept = async (bookingId: string) => {
    await updateBookingStatus(bookingId, "accepted");
    navigation.navigate("MechanicTracking", { bookingId } as any);
  };

  const handleDecline = async (bookingId: string) => {
    await updateBookingStatus(bookingId, "cancelled");
  };

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const colorsObj = getStatusColor(item.status);
    
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => navigation.navigate("MechanicTracking", { bookingId: item.id } as any)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.customerInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(item.customer?.name || item.customerName || "C").charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.customerName}>{item.customer?.name || item.customerName || "Customer"}</Text>
              <Text style={styles.bookingId}>#{item.id.slice(-6).toUpperCase()}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: colorsObj.bg, borderColor: colorsObj.border }]}>
            <View style={[styles.statusDot, { backgroundColor: colorsObj.text }]} />
            <Text style={[styles.statusText, { color: colorsObj.text }]}>
              {item.status.replace("_", " ")}
            </Text>
          </View>
        </View>

        {item.isEmergency && (
          <View style={styles.emergencyBanner}>
            <Ionicons name="warning" size={14} color={colors.error[700]} />
            <Text style={styles.emergencyText}>Emergency Request</Text>
          </View>
        )}

        <View style={styles.cardBody}>
          <Text style={styles.serviceTitle}>{item.serviceType}</Text>
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Ionicons name="calendar" size={16} color={colors.primary[600]} />
            </View>
            <Text style={styles.infoText}>
              {new Date(item.scheduledDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} • {item.scheduledTime}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Ionicons name="car" size={16} color={colors.primary[600]} />
            </View>
            <Text style={styles.infoText}>{item.vehicleInfo || "No vehicle linked"}</Text>
          </View>
          {item.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesText} numberOfLines={2}>{'\u201C'}{item.notes}{'\u201D'}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.priceText}>
            {item.estimatedCost ? `$${item.estimatedCost}` : "Pricing pending"}
          </Text>
          <TouchableOpacity 
            style={styles.chatIconButton}
            onPress={() => navigation.navigate("Chat", { bookingId: item.id } as any)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color={colors.primary[600]} />
          </TouchableOpacity>
          
          <View style={styles.actionRow}>
            {item.status === "pending" && (
              <>
                <TouchableOpacity style={styles.declineButton} onPress={() => handleDecline(item.id)}>
                  <Text style={styles.declineText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(item.id)}>
                  <Text style={styles.acceptText}>Accept</Text>
                </TouchableOpacity>
              </>
            )}
            {item.status === "accepted" && (
              <TouchableOpacity style={styles.startButton} onPress={() => updateBookingStatus(item.id, "in_progress")}>
                <Text style={styles.startButtonText}>Start Service</Text>
              </TouchableOpacity>
            )}
            {item.status === "in_progress" && (
              <TouchableOpacity style={styles.completeButton} onPress={() => updateBookingStatus(item.id, "completed")}>
                <Text style={styles.completeButtonText}>Complete Service</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Job Requests</Text>
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={STATUS_FILTERS}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.filterChip, activeFilter === item.key && styles.filterChipActive]}
              onPress={() => setActiveFilter(item.key)}
            >
              <Text style={[styles.filterChipText, activeFilter === item.key && styles.filterChipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[600]} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="construct" size={48} color={colors.primary[400]} />
            </View>
            <Text style={styles.emptyTitle}>No requests found</Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === "all" ? "You don't have any bookings yet." : `No ${activeFilter.replace("_", " ")} bookings right now.`}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.neutral[900],
    letterSpacing: -0.5,
  },
  filterContainer: {
    backgroundColor: colors.white,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  filterList: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
  },
  filterChipActive: {
    backgroundColor: colors.neutral[900],
  },
  filterChipText: {
    fontSize: fontSize.sm,
    fontWeight: "500",
    color: colors.neutral[600],
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: "600",
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing["4xl"],
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.neutral[700],
  },
  customerName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  bookingId: {
    fontSize: fontSize.xs,
    color: colors.neutral[400],
    fontWeight: "600",
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  emergencyBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.error[50],
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
    gap: 6,
  },
  emergencyText: {
    fontSize: fontSize.sm,
    color: colors.error[700],
    fontWeight: "600",
  },
  cardBody: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  serviceTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.neutral[700],
    fontWeight: "500",
  },
  notesContainer: {
    marginTop: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.neutral[50],
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.neutral[300],
  },
  notesText: {
    fontSize: 13,
    color: colors.neutral[600],
    fontStyle: "italic",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  priceText: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  chatIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  declineButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.error[50],
  },
  declineText: {
    color: colors.error[700],
    fontWeight: "600",
    fontSize: fontSize.sm,
  },
  acceptButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.neutral[900],
  },
  acceptText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: fontSize.sm,
  },
  startButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary[600],
  },
  startButtonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: fontSize.sm,
  },
  completeButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.success[600],
  },
  completeButtonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: fontSize.sm,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: spacing.xl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    textAlign: "center",
    lineHeight: 20,
  },
});
