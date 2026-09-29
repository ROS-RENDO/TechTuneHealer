import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  shadows,
} from "../../constants/theme";
import { AnimatedEntrance } from "../../components";

interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  type: "booking" | "message" | "update" | "alert";
}

export function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Booking Confirmed",
      description: "Speedy Auto Fix accepted your emergency mobile rescue request.",
      timestamp: new Date(),
      read: false,
      type: "booking",
    },
    {
      id: "2",
      title: "New Message",
      description: "Sokha: I am arriving in approximately 8 minutes at your location.",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      type: "message",
    },
    {
      id: "3",
      title: "AI Diagnostic Scan Complete",
      description: "Your Lexus RX350 health telemetry is nominal at 96% optimal score.",
      timestamp: new Date(Date.now() - 2 * 3600 * 1000),
      read: true,
      type: "update",
    },
    {
      id: "4",
      title: "Maintenance Reminder",
      description: "Motor oil change recommended in 850 km for optimal engine longevity.",
      timestamp: new Date(Date.now() - 24 * 3600 * 1000),
      read: true,
      type: "alert",
    },
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking":
        return "calendar-outline";
      case "message":
        return "chatbubble-ellipses-outline";
      case "update":
        return "shield-checkmark-outline";
      case "alert":
        return "warning-outline";
      default:
        return "notifications-outline";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "booking":
        return colors.primary[600];
      case "message":
        return "#0284C7";
      case "update":
        return colors.success[600];
      case "alert":
        return colors.warning[600];
      default:
        return colors.neutral[500];
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const handleNotificationPress = (item: Notification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );

    if (item.type === "booking") {
      navigation.navigate("CustomerTabs", { screen: "Bookings" });
    } else if (item.type === "message") {
      navigation.navigate("Chat", { bookingId: "active" });
    } else {
      navigation.navigate("CustomerTabs", { screen: "Home" });
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.read && styles.unreadCard]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.iconBox,
          { backgroundColor: !item.read ? `${getNotificationColor(item.type)}18` : "#F1F5F9" },
        ]}
      >
        <Ionicons
          name={getNotificationIcon(item.type) as any}
          size={22}
          color={getNotificationColor(item.type)}
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.title, !item.read && styles.unreadTitle]} numberOfLines={1}>
            {item.title}
          </Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>

        <Text style={styles.description}>{item.description}</Text>

        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleDateString([], { month: "short", day: "numeric" })} •{" "}
          {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => handleDelete(item.id)}
        style={styles.deleteButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={18} color={colors.neutral[400]} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Action Bar */}
      <AnimatedEntrance delay={0} direction="down">
        <View style={styles.actionBar}>
          <View style={styles.badgeCountRow}>
            <Text style={styles.actionBarLabel}>Activity Updates</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount} new</Text>
              </View>
            )}
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.markReadBtn}>
              <Ionicons name="checkmark-done" size={16} color={colors.primary[600]} />
              <Text style={styles.markReadText}>Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>
      </AnimatedEntrance>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name="notifications-off-outline"
                size={36}
                color={colors.neutral[400]}
              />
            </View>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyText}>You&apos;re completely up to date.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  badgeCountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionBarLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.neutral[800],
  },
  unreadBadge: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primary[700],
  },
  markReadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  markReadText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary[600],
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing["3xl"],
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...shadows.sm,
  },
  unreadCard: {
    backgroundColor: "#FFFFFF",
    borderColor: colors.primary[200],
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[600],
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  contentContainer: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: spacing.xs,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.neutral[800],
    flex: 1,
  },
  unreadTitle: {
    fontWeight: "800",
    color: colors.neutral[900],
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[600],
    marginLeft: 6,
  },
  description: {
    fontSize: 13,
    color: colors.neutral[600],
    marginTop: 4,
    lineHeight: 18,
  },
  timestamp: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.neutral[400],
    marginTop: 6,
  },
  deleteButton: {
    padding: 6,
    marginLeft: 4,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.neutral[800],
  },
  emptyText: {
    marginTop: 4,
    fontSize: 13,
    color: colors.neutral[400],
  },
});
