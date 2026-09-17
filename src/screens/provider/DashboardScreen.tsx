import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ProviderStackParamList } from "../../navigation/types";
import {
  colors,
  spacing,
  
  shadows,
} from "../../constants/theme";
import { useBookingStore, useAuthStore } from "../../store";
import { Booking } from "../../types";

const { width } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<ProviderStackParamList>;

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color: string;
  trend?: { value: number; isPositive: boolean };
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, trend }) => (
  <View style={styles.statCard}>
    <View style={styles.statHeaderRow}>
      <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      {trend && (
        <View style={styles.trendContainer}>
          <Ionicons
            name={trend.isPositive ? "trending-up" : "trending-down"}
            size={14}
            color={trend.isPositive ? colors.success[500] : colors.error[500]}
          />
          <Text style={[styles.trendText, { color: trend.isPositive ? colors.success[500] : colors.error[500] }]}>
            {trend.value}%
          </Text>
        </View>
      )}
    </View>
    <View style={styles.statContent}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
);

interface BookingItemProps {
  booking: Booking;
  onPress: () => void;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

const BookingItem: React.FC<BookingItemProps> = ({ booking, onPress, onAccept, onDecline }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return { bg: colors.warning[50], text: colors.warning[700], border: colors.warning[100] };
      case "accepted": return { bg: colors.primary[50], text: colors.primary[700], border: colors.primary[100] };
      case "in_progress": return { bg: colors.secondary[50], text: colors.secondary[700], border: colors.secondary[100] };
      case "completed": return { bg: colors.success[50], text: colors.success[700], border: colors.success[100] };
      case "cancelled": return { bg: colors.error[50], text: colors.error[700], border: colors.error[100] };
      default: return { bg: colors.neutral[100], text: colors.neutral[600], border: colors.neutral[200] };
    }
  };

  const colorsObj = getStatusColor(booking.status);

  return (
    <TouchableOpacity style={styles.bookingCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.bookingCardHeader}>
        <View style={styles.customerInfo}>
          <View style={styles.customerAvatar}>
            <Text style={styles.customerAvatarText}>
              {(booking.customer?.name || booking.customerName || "C").charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.customerName}>{booking.customer?.name || booking.customerName || "Customer"}</Text>
            <Text style={styles.bookingId}>#{booking.id.slice(-6).toUpperCase()}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <View style={[styles.statusBadge, { backgroundColor: colorsObj.bg, borderColor: colorsObj.border }]}>
            <View style={[styles.statusDot, { backgroundColor: colorsObj.text }]} />
            <Text style={[styles.statusText, { color: colorsObj.text }]}>
              {booking.status.replace("_", " ")}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.chatIconButton}
            onPress={() => (booking as any).onChatPress?.(booking.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color={colors.primary[600]} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bookingCardBody}>
        <Text style={styles.serviceTitle}>{booking.serviceType}</Text>
        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Ionicons name="calendar" size={16} color={colors.primary[600]} />
          </View>
          <Text style={styles.infoText}>
            {new Date(booking.scheduledDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} • {booking.scheduledTime}
          </Text>
        </View>
      </View>

      {booking.status === "pending" && (
        <View style={styles.bookingActionsRow}>
          <TouchableOpacity style={styles.declineButton} onPress={() => onDecline(booking.id)}>
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptButton} onPress={() => onAccept(booking.id)}>
            <Text style={styles.acceptButtonText}>Accept Job</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const { bookings, fetchBookings, updateBookingStatus } = useBookingStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"pending" | "today">("pending");

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
    if (activeFilter === "pending") return booking.status === "pending";
    if (activeFilter === "today") {
      const today = new Date().toDateString();
      return new Date(booking.scheduledDate).toDateString() === today;
    }
    return true;
  });

  const todayBookings = bookings.filter((booking) => {
    const today = new Date().toDateString();
    return new Date(booking.scheduledDate).toDateString() === today;
  });

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const completedThisMonth = bookings.filter((b) => {
    const thisMonth = new Date().getMonth();
    return (
      b.status === "completed" &&
      new Date(b.scheduledDate).getMonth() === thisMonth
    );
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{user?.name?.charAt(0).toUpperCase() || "P"}</Text>
          </View>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name?.split(' ')[0] || "Partner"}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton} onPress={() => {}}>
          <Ionicons name="notifications-outline" size={24} color={colors.neutral[700]} />
          {pendingBookings.length > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{pendingBookings.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[600]} />}
      >
        <View style={styles.statsGrid}>
          <StatCard
            icon="calendar"
            label="Today's Bookings"
            value={todayBookings.length}
            color={colors.primary[600]}
          />
          <StatCard
            icon="alert-circle"
            label="Pending Requests"
            value={pendingBookings.length}
            color={colors.warning[600]}
          />
          <StatCard
            icon="checkmark-circle"
            label="Completed (Month)"
            value={completedThisMonth.length}
            color={colors.success[600]}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            icon="star"
            label="Rating"
            value="4.8"
            color={colors.secondary[500]}
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Manage Business</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("Services" as never)}>
              <View style={[styles.actionIconOuter, { backgroundColor: `${colors.primary[600]}15` }]}>
                <Ionicons name="construct" size={24} color={colors.primary[600]} />
              </View>
              <Text style={styles.actionText}>Services</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("Schedule")}>
              <View style={[styles.actionIconOuter, { backgroundColor: `${colors.success[600]}15` }]}>
                <Ionicons name="calendar-clear" size={24} color={colors.success[600]} />
              </View>
              <Text style={styles.actionText}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("Earnings")}>
              <View style={[styles.actionIconOuter, { backgroundColor: `${colors.warning[600]}15` }]}>
                <Ionicons name="wallet" size={24} color={colors.warning[600]} />
              </View>
              <Text style={styles.actionText}>Earnings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("Reviews")}>
              <View style={[styles.actionIconOuter, { backgroundColor: `${colors.secondary[600]}15` }]}>
                <Ionicons name="star" size={24} color={colors.secondary[600]} />
              </View>
              <Text style={styles.actionText}>Reviews</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bookingsSection}>
          <View style={styles.bookingsHeader}>
            <Text style={styles.sectionTitle}>Dashboard Bookings</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Bookings" as never)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterTabs}>
            {(["pending", "today"] as const).map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterTab, activeFilter === filter && styles.filterTabActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterTabText, activeFilter === filter && styles.filterTabTextActive]}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {filteredBookings.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="folder-open" size={40} color={colors.neutral[400]} />
              </View>
              <Text style={styles.emptyStateTitle}>No {activeFilter} bookings</Text>
              <Text style={styles.emptyStateSubtitle}>
                You are all caught up for now.
              </Text>
            </View>
          ) : (
            filteredBookings.slice(0, 5).map((booking) => (
              <BookingItem
                key={booking.id}
                booking={{ ...booking, onChatPress: (id: string) => navigation.navigate("Chat", { bookingId: id } as any) } as any}
                onPress={() => navigation.navigate("MechanicTracking", { bookingId: booking.id } as any)}
                onAccept={async (id) => {
                  await updateBookingStatus(id, "accepted");
                  navigation.navigate("MechanicTracking", { bookingId: id } as any);
                }}
                onDecline={(id) => updateBookingStatus(id, "cancelled")}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.02)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatarLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral[900],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
    ...shadows.sm,
  },
  avatarLargeText: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.white,
  },
  greeting: {
    fontSize: 14,
    color: colors.neutral[500],
    fontWeight: "500",
  },
  userName: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.neutral[900],
    letterSpacing: -0.5,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: colors.error[500],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  notificationBadgeText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: "800",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing["4xl"],
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    ...shadows.sm,
  },
  statHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.success[50],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statContent: {
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.neutral[900],
  },
  statLabel: {
    fontSize: 13,
    color: colors.neutral[500],
    fontWeight: "500",
  },
  sectionContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  actionGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    alignItems: "center",
    width: (width - spacing.xl * 2) / 4 - 8,
  },
  actionIconOuter: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.neutral[700],
  },
  bookingsSection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  bookingsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary[600],
    fontWeight: "700",
  },
  filterTabs: {
    flexDirection: "row",
    marginBottom: spacing.lg,
    backgroundColor: colors.neutral[200],
    padding: 4,
    borderRadius: 12,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  filterTabActive: {
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.neutral[600],
  },
  filterTabTextActive: {
    color: colors.neutral[900],
  },
  emptyStateContainer: {
    alignItems: "center",
    backgroundColor: colors.white,
    paddingVertical: 60,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.neutral[100],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: colors.neutral[500],
    marginTop: 4,
  },
  bookingCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    ...shadows.sm,
  },
  bookingCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral[100],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  customerAvatarText: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.neutral[500],
  },
  customerName: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.neutral[900],
  },
  bookingId: {
    fontSize: 12,
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
  chatIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  bookingCardBody: {
    gap: spacing.sm,
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
    marginBottom: spacing.xs,
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
    fontSize: 13,
    color: colors.neutral[700],
    fontWeight: "500",
  },
  bookingActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    gap: spacing.md,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.error[50],
    alignItems: "center",
  },
  declineButtonText: {
    color: colors.error[700],
    fontWeight: "700",
    fontSize: 14,
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.neutral[900],
    alignItems: "center",
  },
  acceptButtonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
  },
});
