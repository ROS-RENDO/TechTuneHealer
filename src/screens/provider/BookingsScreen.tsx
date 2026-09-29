import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  Linking,
  Platform,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ProviderStackParamList } from "../../navigation/types";
import { AnimatedEntrance } from "../../components";
import { colors, spacing, borderRadius, shadows } from "../../constants/theme";
import { useBookingStore } from "../../store";
import { Booking } from "../../types";
import {
  getCustomerAvatarUrl,
  getServiceVisualConfig,
  getConciseLocation,
  getBookingDistanceText,
} from "../../utils/helpers";

type NavigationProp = NativeStackNavigationProp<ProviderStackParamList>;

type FilterTab = "all" | "pending" | "active" | "completed" | "cancelled";

const FILTER_TABS: { key: FilterTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "all", label: "All", icon: "albums-outline" },
  { key: "pending", label: "Pending", icon: "alert-circle-outline" },
  { key: "active", label: "Active", icon: "navigate-outline" },
  { key: "completed", label: "Completed", icon: "checkmark-circle-outline" },
  { key: "cancelled", label: "Cancelled", icon: "close-circle-outline" },
];

export default function ProviderBookingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { bookings, fetchBookings, updateBookingStatus } = useBookingStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [declineModalVisible, setDeclineModalVisible] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

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

  const handleCall = (phone?: string) => {
    const target = phone || "+85512889977";
    Linking.openURL(`tel:${target}`).catch(() => {});
  };

  const handleChat = (booking: Booking) => {
    navigation.navigate("Chat", {
      bookingId: booking.id,
    });
  };

  const handleAccept = async (bookingId: string) => {
    await updateBookingStatus(bookingId, "accepted");
    navigation.navigate("MechanicTracking", { bookingId } as any);
  };

  const confirmDecline = async (reason: string) => {
    if (selectedBookingId) {
      await updateBookingStatus(selectedBookingId, "cancelled");
      setDeclineModalVisible(false);
      setSelectedBookingId(null);
    }
  };

  // Filter and search logic
  const filteredBookings = bookings.filter((b) => {
    // 1. Tab filtering
    if (activeFilter === "pending") {
      if (b.status !== "pending") return false;
    } else if (activeFilter === "active") {
      if (b.status !== "accepted" && b.status !== "in_progress") return false;
    } else if (activeFilter === "completed") {
      if (b.status !== "completed") return false;
    } else if (activeFilter === "cancelled") {
      if (b.status !== "cancelled" && (b.status as any) !== "rejected") return false;
    }

    // 2. Search query filtering
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const customerName = (b.customerName || b.customer?.name || "").toLowerCase();
      const phone = (b.customerPhone || b.customer?.phone || "").toLowerCase();
      const plate = (b.vehicle?.licensePlate || b.vehicle?.plateNumber || "").toLowerCase();
      const vehicleDesc = `${b.vehicle?.make || ""} ${b.vehicle?.model || ""}`.toLowerCase();
      const service = (b.serviceType || "").toLowerCase();
      const notes = (b.notes || "").toLowerCase();

      return (
        customerName.includes(q) ||
        phone.includes(q) ||
        plate.includes(q) ||
        vehicleDesc.includes(q) ||
        service.includes(q) ||
        notes.includes(q)
      );
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return {
          bg: colors.warning[50],
          text: colors.warning[700],
          border: colors.warning[100],
          label: "PENDING DISPATCH",
        };
      case "accepted":
        return {
          bg: colors.primary[50],
          text: colors.primary[700],
          border: colors.primary[100],
          label: "EN ROUTE",
        };
      case "in_progress":
        return {
          bg: colors.primary[100],
          text: colors.primary[700],
          border: colors.primary[500],
          label: "REPAIR IN PROGRESS",
        };
      case "completed":
        return {
          bg: colors.success[50],
          text: colors.success[700],
          border: colors.success[100],
          label: "COMPLETED",
        };
      case "cancelled":
      case "rejected":
        return {
          bg: colors.error[50],
          text: colors.error[700],
          border: colors.error[100],
          label: "CANCELLED",
        };
      default:
        return {
          bg: colors.neutral[100],
          text: colors.neutral[700],
          border: colors.neutral[200],
          label: status.toUpperCase(),
        };
    }
  };

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const isEmergency = Boolean(
      item.isEmergency ||
      item.serviceType?.toLowerCase().includes("emergency") ||
      item.serviceType?.toLowerCase().includes("roadside") ||
      item.notes?.toLowerCase().includes("emergency")
    );

    const serviceVisual = getServiceVisualConfig(item.serviceType, isEmergency);
    const distanceText = getBookingDistanceText(item.customerLocation);
    const conciseLocation = getConciseLocation(item.customerLocation?.address);
    const plateNumber = item.vehicle?.licensePlate || item.vehicle?.plateNumber || "2A-8888";
    const price = item.estimatedPrice || item.estimatedCost || 45;
    const customerName = item.customerName || item.customer?.name || "Customer";

    const getStatusChip = (status: string) => {
      const label =
        status === "pending"
          ? "Pending"
          : status === "accepted"
          ? "En Route"
          : status === "in_progress"
          ? "In Progress"
          : status === "completed"
          ? "Completed"
          : "Cancelled";
      return { label, bg: colors.neutral[100], text: colors.neutral[700] };
    };

    const statusChip = getStatusChip(item.status);

    return (
      <View style={styles.cleanCard}>
        {/* Top Header Row: Customer Name + SOS + Status Pill + Price */}
        <View style={styles.cleanCardHeader}>
          <View style={styles.cleanHeaderLeft}>
            <Image
              source={{ uri: getCustomerAvatarUrl(item.customer, customerName) }}
              style={styles.customerAvatarImage}
            />
            <Text style={styles.cleanCustomerTitle} numberOfLines={1}>
              {customerName}
            </Text>
            {isEmergency && (
              <View style={styles.cleanSosBadge}>
                <Text style={styles.cleanSosBadgeText}>SOS</Text>
              </View>
            )}
          </View>
          <View style={styles.cleanHeaderRight}>
            <View style={[styles.cleanStatusPill, { backgroundColor: statusChip.bg }]}>
              <Text style={[styles.cleanStatusText, { color: statusChip.text }]}>{statusChip.label}</Text>
            </View>
            <Text style={styles.cleanPriceTag}>${price}</Text>
          </View>
        </View>

        {/* 1 Ultra-Clean Subtitle Line: Service • Distance (KM) • Location */}
        <View style={styles.cleanVehicleRow}>
          <Ionicons name={serviceVisual.icon} size={13} color={colors.neutral[500]} />
          <Text style={styles.cleanServiceSubtitle}>{serviceVisual.label}</Text>
          {distanceText ? (
            <>
              <Text style={styles.cleanDot}>•</Text>
              <Ionicons name="navigate" size={11} color={colors.primary[600]} />
              <Text style={styles.cleanDistanceText}>{distanceText}</Text>
            </>
          ) : null}
          <Text style={styles.cleanDot}>•</Text>
          <Ionicons name="location-outline" size={12} color={colors.neutral[400]} />
          <Text style={styles.cleanMetaText} numberOfLines={1}>{conciseLocation}</Text>
        </View>

        {/* Action Row */}
        <View style={styles.cleanActionRow}>
          {item.status === "pending" ? (
            <>
              <TouchableOpacity
                style={styles.cleanDeclineButton}
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedBookingId(item.id);
                  setDeclineModalVisible(true);
                }}
              >
                <Text style={styles.cleanDeclineText}>Decline</Text>
              </TouchableOpacity>
              <View style={styles.cleanActionRight}>
                <TouchableOpacity
                  style={styles.cleanChatButton}
                  activeOpacity={0.7}
                  onPress={() => handleChat(item)}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.neutral[700]} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cleanAcceptButton}
                  activeOpacity={0.8}
                  onPress={() => handleAccept(item.id)}
                >
                  <Text style={styles.cleanAcceptText}>Accept Job</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : item.status === "accepted" || item.status === "in_progress" ? (
            <>
              <TouchableOpacity
                style={styles.cleanDispatchButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate("MechanicTracking", { bookingId: item.id } as any)}
              >
                <Ionicons
                  name={item.status === "in_progress" ? "construct" : "navigate"}
                  size={15}
                  color={colors.white}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.cleanDispatchText}>
                  {item.status === "in_progress" ? "Resume Route" : "Open Route"}
                </Text>
              </TouchableOpacity>
              <View style={styles.cleanActionRight}>
                <TouchableOpacity
                  style={styles.cleanChatButton}
                  activeOpacity={0.7}
                  onPress={() => handleCall(item.customerPhone || item.customer?.phone || "+85512889977")}
                >
                  <Ionicons name="call-outline" size={18} color={colors.neutral[700]} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cleanChatButton}
                  activeOpacity={0.7}
                  onPress={() => handleChat(item)}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.neutral[700]} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity
              style={styles.cleanInvoiceButton}
              activeOpacity={0.8}
              onPress={() => Alert.alert("Service Record", `Job ID: #${item.id.slice(-6).toUpperCase()}\nService: ${item.serviceType}\nTotal Paid: $${price}.00\nCustomer: ${customerName}\nStatus: Completed & Settled via KHQR.`)}
            >
              <Ionicons name="document-text-outline" size={14} color={colors.neutral[700]} style={{ marginRight: 6 }} />
              <Text style={styles.cleanInvoiceText}>Receipt & Invoice</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header & Title */}
      <AnimatedEntrance delay={0} direction="down">
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Bookings</Text>
            <Text style={styles.headerSubtitle}>
              {filteredBookings.length} {filteredBookings.length === 1 ? "booking" : "bookings"}
            </Text>
          </View>
          <TouchableOpacity style={styles.refreshBadgeButton} onPress={onRefresh}>
            <Ionicons name="sync" size={18} color={colors.primary[600]} />
          </TouchableOpacity>
        </View>
      </AnimatedEntrance>

      {/* Live Search Bar */}
      <AnimatedEntrance delay={50} direction="down">
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color={colors.neutral[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search bookings..."
            placeholderTextColor={colors.neutral[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>              
              <Ionicons name="close-circle" size={16} color={colors.neutral[400]} />
            </TouchableOpacity>
          )}
        </View>
      </AnimatedEntrance>

      {/* Filter Tabs Bar */}
      <AnimatedEntrance delay={80} direction="down">
        <View style={styles.filterStripContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={FILTER_TABS}
            keyExtractor={(tab) => tab.key}
            contentContainerStyle={styles.filterStripContent}
            renderItem={({ item: tab }) => {
              const isSelected = activeFilter === tab.key;
              return (
                <TouchableOpacity
                  style={[styles.filterPill, isSelected && styles.filterPillActive]}
                  onPress={() => setActiveFilter(tab.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={tab.icon}
                    size={14}
                    color={isSelected ? colors.white : colors.neutral[600]}
                  />
                  <Text style={[styles.filterPillText, isSelected && styles.filterPillTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </AnimatedEntrance>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[600]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="file-tray-outline" size={36} color={colors.primary[600]} />
            </View>
            <Text style={styles.emptyTitle}>No Bookings Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery.trim().length > 0
                ? "No matching requests for this search query."
                : `No bookings currently under '${activeFilter}'. New requests will appear live.`}
            </Text>
            {searchQuery.length > 0 && (
              <TouchableOpacity style={styles.resetButton} onPress={() => setSearchQuery("")}>
                <Text style={styles.resetButtonText}>Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Decline Reason Modal */}
      <Modal
        visible={declineModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeclineModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons name="alert-circle" size={24} color={colors.error[600]} />
              <Text style={styles.modalTitle}>Decline Dispatch</Text>
            </View>
            <Text style={styles.modalSubtitle}>
              Please select a reason. The dispatch will be routed to the next nearest mechanic.
            </Text>
            {[
              "Location too far (> 15 km)",
              "Currently engaged in active repair",
              "Lacking required diagnostic equipment",
              "Emergency parts out of stock",
              "Taking a rest break",
            ].map((reason, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.reasonOption}
                onPress={() => confirmDecline(reason)}
              >
                <Text style={styles.reasonText}>{reason}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.neutral[400]} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setDeclineModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
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
  refreshBadgeButton: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    gap: spacing.sm,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.neutral[800],
  },
  filterStripContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  filterStripContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginRight: 6,
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.neutral[700],
  },
  filterPillTextActive: {
    color: colors.white,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing["2xl"],
  },
  // Clean Minimalist Card Styles (Uber / Apple style)
  cleanCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    ...shadows.sm,
  },
  cleanEmergencyAccent: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error[500],
  },
  cleanCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cleanHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
    marginRight: spacing.sm,
  },
  customerAvatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral[200],
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  cleanCustomerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.neutral[900],
    flex: 1,
  },
  cleanServiceSubtitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.neutral[800],
  },
  cleanHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cleanSosBadge: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  cleanSosBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.neutral[700],
    letterSpacing: 0.5,
  },
  cleanServiceTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.neutral[900],
    flex: 1,
  },
  cleanStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cleanStatusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  cleanPriceTag: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.neutral[900],
  },
  cleanVehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  cleanVehicleTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.neutral[800],
  },
  cleanDot: {
    fontSize: 12,
    color: colors.neutral[400],
  },
  cleanDistanceText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary[700],
  },
  cleanPlateBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.neutral[600],
  },
  cleanMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  cleanMetaText: {
    fontSize: 12,
    color: colors.neutral[500],
    fontWeight: "500",
  },
  cleanTimeText: {
    fontSize: 12,
    color: colors.neutral[500],
    fontWeight: "500",
  },
  cleanNoteLine: {
    fontSize: 12,
    color: colors.neutral[500],
    fontStyle: "italic",
    marginBottom: spacing.sm,
  },
  cleanActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.04)",
  },
  cleanActionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cleanDeclineButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cleanDeclineText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.neutral[500],
  },
  cleanChatButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.neutral[100],
    justifyContent: "center",
    alignItems: "center",
  },
  cleanAcceptButton: {
    backgroundColor: "#0F172A",
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  cleanAcceptEmergencyButton: {
    backgroundColor: "#0F172A",
  },
  cleanAcceptText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.white,
  },
  cleanDispatchButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F172A",
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: spacing.sm,
  },
  cleanDispatchText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.white,
  },
  cleanInvoiceButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral[100],
    paddingVertical: 10,
    borderRadius: 12,
  },
  cleanInvoiceText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.neutral[700],
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing["2xl"],
    paddingHorizontal: spacing.lg,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.neutral[500],
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 280,
  },
  resetButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[600],
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.white,
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
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.neutral[600],
    lineHeight: 17,
    marginBottom: spacing.md,
  },
  reasonOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  reasonText: {
    fontSize: 13,
    color: colors.neutral[800],
    fontWeight: "500",
  },
  modalCancelButton: {
    marginTop: spacing.md,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[100],
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.neutral[700],
  },
});
