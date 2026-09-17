import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
} from "../../constants/theme";

interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  type: "booking" | "message" | "update" | "alert";
}

export function NotificationsScreen() {
  const [notifications, setNotifications] = React.useState<Notification[]>([
    {
      id: "1",
      title: "Booking Confirmed",
      description: "Your booking with John has been confirmed",
      timestamp: new Date(),
      read: false,
      type: "booking",
    },
    {
      id: "2",
      title: "New Message",
      description: "You have a new message from your provider",
      timestamp: new Date(Date.now() - 3600000),
      read: true,
      type: "message",
    },
    {
      id: "3",
      title: "Service Update",
      description: "New services are now available",
      timestamp: new Date(Date.now() - 7200000),
      read: true,
      type: "update",
    },
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking":
        return "calendar";
      case "message":
        return "chatbubble";
      case "update":
        return "notifications";
      case "alert":
        return "alert-circle";
      default:
        return "notifications";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "booking":
        return colors.primary[600];
      case "message":
        return colors.secondary[600];
      case "update":
        return colors.success[600];
      case "alert":
        return colors.error[600];
      default:
        return colors.neutral[400];
    }
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <View
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
    >
      <View
        style={[
          styles.iconBox,
          { backgroundColor: getNotificationColor(item.type) },
        ]}
      >
        <Ionicons
          name={getNotificationIcon(item.type)}
          size={24}
          color={colors.white}
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleDateString()}{" "}
          {item.timestamp.toLocaleTimeString()}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleDelete(item.id)}
        style={styles.deleteButton}
      >
        <Ionicons name="close" size={20} color={colors.neutral[400]} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="notifications-off-outline"
              size={48}
              color={colors.neutral[300]}
            />
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  listContent: {
    padding: spacing.md,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.neutral[200],
  },
  unreadNotification: {
    backgroundColor: colors.primary[50],
    borderLeftColor: colors.primary[600],
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  timestamp: {
    fontSize: fontSize.xs,
    color: colors.neutral[400],
  },
  deleteButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: fontSize.base,
    color: colors.neutral[400],
  },
});
