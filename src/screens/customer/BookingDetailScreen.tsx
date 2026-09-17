import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useBookingStore } from "../../store";
import { colors, spacing, shadows } from "../../constants/theme";
import { format } from "date-fns";
import type { CustomerStackScreenProps } from "../../navigation/types";

export function BookingDetailScreen() {
  const navigation = useNavigation<CustomerStackScreenProps<"BookingDetail">["navigation"]>();
  const route = useRoute<CustomerStackScreenProps<"BookingDetail">["route"]>();
  const { bookingId } = route.params;

  const { bookings, updateBookingStatus } = useBookingStore();
  const booking = bookings.find((b) => b.id === bookingId);

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
          </TouchableOpacity>
        </View>
        <View style={styles.notFoundContainer}>
          <Ionicons name="file-tray-outline" size={64} color={colors.neutral[300]} />
          <Text style={styles.notFoundText}>Booking not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleCancelBooking = () => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            updateBookingStatus(bookingId, "cancelled");
            navigation.goBack();
          },
        },
      ]
    );
  };

  const normalizedStatus = booking.status?.toLowerCase() ?? "pending";

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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "Pending Confirmation";
      case "accepted": return "Confirmed";
      case "in_progress": return "In Progress";
      case "completed": return "Completed";
      case "cancelled": return "Cancelled";
      case "rejected": return "Rejected";
      default: return status;
    }
  };

  const statusColors = getStatusColor(normalizedStatus);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Top Info Banner */}
        <View style={styles.topBanner}>
          <Text style={styles.serviceType}>{(booking as any).serviceType || 'Custom Service'}</Text>
          <Text style={styles.bookingId}>#{booking.id.slice(-6).toUpperCase()}</Text>
        </View>

        {/* Status Bubble */}
        <View style={styles.statusSection}>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg, borderColor: statusColors.border }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColors.text }]} />
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {getStatusLabel(normalizedStatus)}
            </Text>
          </View>
          {booking.isEmergency && (
            <View style={styles.emergencyBadge}>
              <Ionicons name="warning" size={12} color={colors.error[700]} />
              <Text style={styles.emergencyText}>Emergency</Text>
            </View>
          )}
        </View>

        {/* Schedule Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Schedule</Text>
          <View style={styles.row}>
            <View style={styles.iconBox}>
              <Ionicons name="calendar" size={18} color={colors.primary[600]} />
            </View>
            <View>
              <Text style={styles.rowLabel}>Date</Text>
              <Text style={styles.rowValue}>{format(new Date(booking.scheduledDate), "EEEE, MMMM d, yyyy")}</Text>
            </View>
          </View>
          <View style={[styles.row, { marginTop: spacing.md }]}>
            <View style={styles.iconBox}>
              <Ionicons name="time" size={18} color={colors.primary[600]} />
            </View>
            <View>
              <Text style={styles.rowLabel}>Time</Text>
              <Text style={styles.rowValue}>{format(new Date(booking.scheduledDate), "h:mm a")}</Text>
            </View>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Timeline</Text>
          <View style={styles.timeline}>
            <TimelineItem
              title="Booking Created"
              subtitle={format(new Date(booking.createdAt), "MMM d, yyyy • h:mm a")}
              isCompleted={true}
              isLast={normalizedStatus === "pending"}
            />
            {normalizedStatus !== "pending" && (
              <TimelineItem
                title={booking.status === "rejected" ? "Request Rejected" : "Request Accepted"}
                subtitle="Provider confirmed your booking"
                isCompleted={["accepted", "in_progress", "completed", "rejected"].includes(normalizedStatus)}
                isLast={["accepted", "rejected", "cancelled"].includes(normalizedStatus)}
              />
            )}
            {["in_progress", "completed"].includes(normalizedStatus) && (
              <TimelineItem
                title="Service In Progress"
                subtitle="Your vehicle is being serviced"
                isCompleted={["in_progress", "completed"].includes(normalizedStatus)}
                isLast={normalizedStatus === "in_progress"}
              />
            )}
            {normalizedStatus === "completed" && (
              <TimelineItem
                title="Service Completed"
                subtitle="Your vehicle is ready"
                isCompleted={true}
                isLast={true}
              />
            )}
          </View>
        </View>

        {/* Provider Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Provider</Text>
          <View style={styles.providerRow}>
            <View style={styles.providerAvatar}>
              <Text style={styles.providerAvatarText}>
                {((booking.provider as any)?.user?.name || (booking.provider as any)?.businessName || "P").charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.providerName}>{(booking.provider as any)?.user?.name || (booking.provider as any)?.businessName || "Unknown Provider"}</Text>
              <Text style={styles.providerAddress}>{(booking.provider as any)?.address || "Address not provided"}</Text>
            </View>
            <TouchableOpacity
              style={styles.chatButtonSmall}
              onPress={() => navigation.navigate("Chat", { bookingId })}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color={colors.primary[600]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Vehicle & Notes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Details</Text>
          <View style={styles.detailItem}>
            <Text style={styles.detailKey}>Vehicle</Text>
            <Text style={styles.detailVal}>{booking.vehicleId || "Not specified"}</Text>
          </View>
          {booking.notes && (
            <View style={[styles.detailItem, { marginTop: spacing.md }]}>
              <Text style={styles.detailKey}>Notes</Text>
              <Text style={styles.detailVal}>{booking.notes}</Text>
            </View>
          )}
        </View>

        {/* Price Summary */}
        <View style={[styles.card, { marginBottom: 0 }]}>
          <Text style={styles.cardTitle}>Payment</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Estimated Total</Text>
            <Text style={styles.priceVal}>
              ${(booking.estimatedPrice || 50.00).toFixed(2)}
            </Text>
          </View>
          {booking.finalPrice != null && (
            <View style={styles.priceRowTotal}>
              <Text style={styles.priceLabelTotal}>Final Price</Text>
              <Text style={styles.priceValTotal}>
                ${booking.finalPrice.toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Floating Actions */}
      {["pending", "accepted"].includes(normalizedStatus) && (
        <View style={styles.bottomBar}>
          {normalizedStatus === "pending" && (
            <TouchableOpacity 
              style={[styles.cancelBtn, { backgroundColor: colors.primary[600], borderColor: colors.primary[600], marginBottom: spacing.md }]} 
              onPress={() => {
                const amount = booking.estimatedPrice || 50.00;
                navigation.navigate("Payment", {
                  totalAmount: amount,
                  items: [{ name: (booking as any).serviceType || 'Custom Service', price: amount, quantity: 1 }]
                } as any);
              }}
            >
              <Text style={[styles.cancelBtnText, { color: colors.white }]}>Checkout Payment</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelBooking}>
            <Text style={styles.cancelBtnText}>Cancel Booking</Text>
          </TouchableOpacity>
        </View>
      )}
      {normalizedStatus === "completed" && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: colors.neutral[900], borderWidth: 0 }]} onPress={() => navigation.navigate("ReviewCreate", { bookingId } as any)}>
            <Text style={[styles.cancelBtnText, { color: colors.white }]}>Leave a Review</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Timeline Components ───────────
function TimelineItem({ title, subtitle, isCompleted, isLast }: { title: string; subtitle: string; isCompleted: boolean; isLast: boolean }) {
  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineIndicator}>
        <View style={[styles.timelineDot, isCompleted && styles.timelineDotDone]}>
          {isCompleted && <Ionicons name="checkmark" size={12} color={colors.white} />}
        </View>
        {!isLast && <View style={[styles.timelineLine, isCompleted && styles.timelineLineDone]} />}
      </View>
      <View style={styles.timelineContent}>
        <Text style={[styles.timelineTitle, !isCompleted && { color: colors.neutral[400] }]}>{title}</Text>
        <Text style={styles.timelineSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  notFoundContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundText: { fontSize: 18, color: colors.neutral[500], marginTop: spacing.md },
  
  scrollContent: {
    padding: spacing.lg,
  },
  topBanner: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  serviceType: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.neutral[900],
    marginBottom: 4,
  },
  bookingId: {
    fontSize: 14,
    color: colors.neutral[500],
    fontWeight: '600',
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emergencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.error[50],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  emergencyText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.error[700],
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    ...shadows.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontSize: 12,
    color: colors.neutral[500],
    fontWeight: '500',
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  timeline: {
    marginTop: spacing.xs,
  },
  timelineItem: {
    flexDirection: "row",
    gap: spacing.md,
  },
  timelineIndicator: {
    alignItems: "center",
    width: 20,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.neutral[200],
  },
  timelineDotDone: {
    backgroundColor: colors.success[500],
    borderColor: colors.success[500],
  },
  timelineLine: {
    width: 2,
    height: 30,
    backgroundColor: colors.neutral[200],
    marginVertical: 4,
  },
  timelineLineDone: {
    backgroundColor: colors.success[500],
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 24,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 2,
  },
  timelineSubtitle: {
    fontSize: 13,
    color: colors.neutral[500],
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  providerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
  },
  providerAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary[700],
  },
  providerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 2,
  },
  providerAddress: {
    fontSize: 13,
    color: colors.neutral[500],
  },
  chatButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailKey: {
    fontSize: 14,
    color: colors.neutral[500],
    flex: 1,
  },
  detailVal: {
    fontSize: 14,
    color: colors.neutral[900],
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 15,
    color: colors.neutral[600],
  },
  priceVal: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  priceRowTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  priceLabelTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  priceValTotal: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary[600],
  },
  bottomBar: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    ...shadows.lg,
  },
  cancelBtn: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.error[500],
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error[600],
  },
});
