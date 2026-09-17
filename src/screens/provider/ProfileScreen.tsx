import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  
  Platform,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "../../constants/theme";
import { useAuthStore } from "../../store";

// Conditionally import react-native-maps only on native platforms
let MapView: any = null;
let Marker: any = null;

if (Platform.OS !== "web") {
  const mapsModule = require("react-native-maps");
  MapView = mapsModule.default;
  Marker = mapsModule.Marker;
}

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  showBadge?: boolean;
  badgeCount?: number;
  onPress: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  value,
  showBadge,
  badgeCount,
  onPress,
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemLeft}>
      <View style={styles.menuIconContainer}>
        <Ionicons name={icon} size={20} color={colors.primary[500]} />
      </View>
      <Text style={styles.menuItemLabel}>{label}</Text>
    </View>
    <View style={styles.menuItemRight}>
      {value && <Text style={styles.menuItemValue}>{value}</Text>}
      {showBadge && badgeCount && badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </View>
  </TouchableOpacity>
);

export default function ProviderProfileScreen() {
  const { user, logout } = useAuthStore();

  const [serviceArea, setServiceArea] = React.useState("Phnom Penh");
  const [serviceLocation, setServiceLocation] = React.useState({
    latitude: 11.5564,
    longitude: 104.9282,
  });
  const [showLocationModal, setShowLocationModal] = React.useState(false);
  const [tempLocation, setTempLocation] = React.useState(serviceLocation);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={40} color={colors.primary[500]} />
              </View>
            )}
            <TouchableOpacity style={styles.editImageButton}>
              <Ionicons name="camera" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>
            {user?.name || "Service Provider"}
          </Text>
          <Text style={styles.profileBusiness}>Auto Care Services</Text>
          <View style={styles.verifiedBadge}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={colors.success[500]}
            />
            <Text style={styles.verifiedText}>Verified Provider</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>156</Text>
              <Text style={styles.statLabel}>Jobs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>2yr</Text>
              <Text style={styles.statLabel}>Member</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="person-outline"
              label="Personal Information"
              onPress={() => {}}
            />
            <MenuItem
              icon="business-outline"
              label="Business Details"
              onPress={() => {}}
            />
            <MenuItem
              icon="document-text-outline"
              label="Documents & Certifications"
              value="3 docs"
              onPress={() => {}}
            />
            <MenuItem
              icon="location-outline"
              label="Service Areas"
              value={serviceArea}
              onPress={() => {
                setTempLocation(serviceLocation);
                setShowLocationModal(true);
              }}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="construct-outline"
              label="My Services"
              value="5 active"
              onPress={() => {}}
            />
            <MenuItem
              icon="pricetag-outline"
              label="Pricing"
              onPress={() => {}}
            />
            <MenuItem
              icon="time-outline"
              label="Working Hours"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Payments</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="wallet-outline"
              label="Earnings"
              value="$875.00"
              onPress={() => {}}
            />
            <MenuItem
              icon="card-outline"
              label="Payment Methods"
              value="2 methods"
              onPress={() => {}}
            />
            <MenuItem
              icon="receipt-outline"
              label="Transaction History"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="help-circle-outline"
              label="Help Center"
              onPress={() => {}}
            />
            <MenuItem
              icon="chatbubbles-outline"
              label="Contact Support"
              onPress={() => {}}
            />
            <MenuItem
              icon="document-outline"
              label="Terms & Conditions"
              onPress={() => {}}
            />
            <MenuItem
              icon="shield-outline"
              label="Privacy Policy"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="notifications-outline"
              label="Notifications"
              showBadge
              badgeCount={3}
              onPress={() => {}}
            />
            <MenuItem
              icon="language-outline"
              label="Language"
              value="English"
              onPress={() => {}}
            />
            <MenuItem
              icon="moon-outline"
              label="Appearance"
              value="Light"
              onPress={() => {}}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons
            name="log-out-outline"
            size={20}
            color={colors.error[500]}
          />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>

      <Modal visible={showLocationModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Service Location</Text>
            {MapView && (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: tempLocation.latitude,
                  longitude: tempLocation.longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                onPress={(e: any) => setTempLocation(e.nativeEvent.coordinate)}
              >
                <Marker
                  draggable
                  coordinate={tempLocation}
                  onDragEnd={(e: any) => setTempLocation(e.nativeEvent.coordinate)}
                />
              </MapView>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLocationModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => {
                  setServiceLocation(tempLocation);
                  setServiceArea(
                    `Lat ${tempLocation.latitude.toFixed(2)}, Lng ${tempLocation.longitude.toFixed(2)}`,
                  );
                  setShowLocationModal(false);
                }}
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  settingsButton: {
    padding: spacing.sm,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: "center",
    ...shadows.medium,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: spacing.md,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[500],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.surface,
  },
  profileName: {
    ...typography.h2,
    color: colors.text,
  },
  profileBusiness: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: `${colors.success[500]}15`,
    borderRadius: borderRadius.full,
  },
  verifiedText: {
    ...typography.caption,
    color: colors.success[500],
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.lg,
    width: "100%",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  statValue: {
    ...typography.h2,
    color: colors.primary[500],
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  menuSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    fontSize: 12,
    letterSpacing: 1,
  },
  menuGroup: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemLabel: {
    ...typography.body,
    color: colors.text,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  menuItemValue: {
    ...typography.body,
    color: colors.textSecondary,
  },
  badge: {
    backgroundColor: colors.error[500],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xs,
  },
  badgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: `${colors.error[500]}10`,
    borderRadius: borderRadius.lg,
  },
  logoutText: {
    ...typography.bodyBold,
    color: colors.error[500],
  },
  versionText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
    marginVertical: spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  modalTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    marginBottom: spacing.md,
  },
  map: {
    width: "100%",
    height: 250,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.md,
  },
  modalButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  cancelButton: {
    backgroundColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary[500],
  },
  cancelText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
  saveText: {
    ...typography.bodyBold,
    color: colors.white,
  },
});
