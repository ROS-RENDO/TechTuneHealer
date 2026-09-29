import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ProviderStackParamList } from "../../navigation/types";
import { AnimatedEntrance } from "../../components";
import { colors, spacing, borderRadius, shadows } from "../../constants/theme";
import { useAuthStore } from "../../store";
import { getProviderAvatarUrl } from "../../utils/helpers";

type NavigationProp = NativeStackNavigationProp<ProviderStackParamList>;

export default function ProviderProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout, dispatchRadiusKm, isEmergencyOnCall, setDispatchSettings } =
    useAuthStore();

  const [khqrModalVisible, setKhqrModalVisible] = useState(false);
  const [bankAccountName, setBankAccountName] = useState("SOKHA AUTO REPAIR");
  const [bankAccountNumber, setBankAccountNumber] = useState("001 234 567");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const radiusOptions = [5, 10, 20, 35, 50];

  const handleRadiusChange = (km: number) => {
    setDispatchSettings({ dispatchRadiusKm: km });
  };

  const handleToggleEmergency = (value: boolean) => {
    setDispatchSettings({ isEmergencyOnCall: value });
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out of your workshop account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

  const avatarUrl =
    user?.avatar ||
    getProviderAvatarUrl({ businessName: user?.name || "Speedy Auto Fix", avatar: user?.avatar });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Sleek Top Header */}
      <AnimatedEntrance delay={0} direction="down">
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account</Text>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => setKhqrModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="qr-code-outline" size={19} color={colors.neutral[800]} />
          </TouchableOpacity>
        </View>
      </AnimatedEntrance>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollInner}
      >
        {/* Executive Profile Card (Apple ID / Uber Pro Style) */}
        <AnimatedEntrance delay={60} direction="up">
          <View style={styles.profileHeaderCard}>
            <View style={styles.profileHeaderTop}>
              <View style={styles.avatarContainer}>
                <Image source={{ uri: avatarUrl }} style={styles.cleanAvatarImage} />
                <View style={styles.avatarProBadge}>
                  <Ionicons name="shield-checkmark" size={10} color={colors.white} />
                </View>
              </View>

              <View style={styles.profileHeaderMeta}>
                <View style={styles.nameRow}>
                  <Text style={styles.cleanName} numberOfLines={1}>
                    {user?.name || "Sokha Auto Repair"}
                  </Text>
                  <View style={styles.proPill}>
                    <Text style={styles.proPillText}>PRO</Text>
                  </View>
                </View>
                <Text style={styles.cleanLocationLine}>
                  Master Specialist • Tuol Kork
                </Text>
              </View>
            </View>

            {/* Quiet Metric Summary Bar */}
            <View style={styles.metricsBar}>
              <TouchableOpacity
                style={styles.metricItem}
                onPress={() => navigation.navigate("Reviews")}
                activeOpacity={0.7}
              >
                <Text style={styles.metricValue}>4.9 ★</Text>
                <Text style={styles.metricLabel}>128 Reviews</Text>
              </TouchableOpacity>

              <View style={styles.metricDivider} />

              <TouchableOpacity
                style={styles.metricItem}
                onPress={() => (navigation as any).navigate("Bookings")}
                activeOpacity={0.7}
              >
                <Text style={styles.metricValue}>342</Text>
                <Text style={styles.metricLabel}>Jobs Done</Text>
              </TouchableOpacity>

              <View style={styles.metricDivider} />

              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>&lt; 15m</Text>
                <Text style={styles.metricLabel}>Response</Text>
              </View>
            </View>
          </View>
        </AnimatedEntrance>

        {/* SECTION 1: DISPATCH & ON-CALL */}
        <Text style={styles.groupHeader}>DISPATCH & AVAILABILITY</Text>
        <View style={styles.groupedCard}>
          {/* Radius Selector Row */}
          <View style={styles.groupedRowColumn}>
            <View style={styles.rowBetween}>
              <View style={styles.rowLeft}>
                <View style={styles.iconBox}>
                  <Ionicons name="radio-outline" size={17} color={colors.neutral[700]} />
                </View>
                <Text style={styles.rowLabel}>Dispatch Radius</Text>
              </View>
              <Text style={styles.rowValueHighlight}>{dispatchRadiusKm} km</Text>
            </View>

            {/* Segmented Radius Chips */}
            <View style={styles.radiusPillsRow}>
              {radiusOptions.map((km) => {
                const isSelected = dispatchRadiusKm === km;
                return (
                  <TouchableOpacity
                    key={km}
                    style={[styles.radiusPill, isSelected && styles.radiusPillActive]}
                    onPress={() => handleRadiusChange(km)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.radiusPillText,
                        isSelected && styles.radiusPillTextActive,
                      ]}
                    >
                      {km}km
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.rowDivider} />

          {/* 24/7 Night Duty Switch */}
          <View style={styles.rowBetween}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Ionicons
                  name={isEmergencyOnCall ? "moon" : "moon-outline"}
                  size={17}
                  color={isEmergencyOnCall ? colors.neutral[900] : colors.neutral[700]}
                />
              </View>
              <Text style={styles.rowLabel}>24/7 Night Duty</Text>
            </View>
            <Switch
              value={isEmergencyOnCall}
              onValueChange={handleToggleEmergency}
              trackColor={{ false: colors.neutral[200], true: colors.neutral[900] }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* SECTION 2: BUSINESS & REVENUE */}
        <Text style={styles.groupHeader}>BUSINESS & REVENUE</Text>
        <View style={styles.groupedCard}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate("Earnings")}
            activeOpacity={0.6}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="wallet-outline" size={17} color={colors.neutral[700]} />
              </View>
              <Text style={styles.rowLabel}>Earnings & Payouts</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValueHighlight}>$1,250</Text>
              <Ionicons name="chevron-forward" size={15} color={colors.neutral[400]} />
            </View>
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setKhqrModalVisible(true)}
            activeOpacity={0.6}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="card-outline" size={17} color={colors.neutral[700]} />
              </View>
              <Text style={styles.rowLabel}>ABA KHQR Settlement</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValueText}>Linked</Text>
              <Ionicons name="chevron-forward" size={15} color={colors.neutral[400]} />
            </View>
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate("Schedule")}
            activeOpacity={0.6}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="time-outline" size={17} color={colors.neutral[700]} />
              </View>
              <Text style={styles.rowLabel}>Working Hours</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValueText}>Mon – Sat</Text>
              <Ionicons name="chevron-forward" size={15} color={colors.neutral[400]} />
            </View>
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate("Reviews")}
            activeOpacity={0.6}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="star-outline" size={17} color={colors.neutral[700]} />
              </View>
              <Text style={styles.rowLabel}>Reviews & Ratings</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValueText}>4.9 ★ (128)</Text>
              <Ionicons name="chevron-forward" size={15} color={colors.neutral[400]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* SECTION 3: PREFERENCES */}
        <Text style={styles.groupHeader}>APP PREFERENCES</Text>
        <View style={styles.groupedCard}>
          <View style={styles.menuRow}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="notifications-outline" size={17} color={colors.neutral[700]} />
              </View>
              <Text style={styles.rowLabel}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.neutral[200], true: colors.neutral[900] }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() =>
              setSelectedLanguage(selectedLanguage === "English" ? "ភាសាខ្មែរ" : "English")
            }
            activeOpacity={0.6}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="globe-outline" size={17} color={colors.neutral[700]} />
              </View>
              <Text style={styles.rowLabel}>Language</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValueText}>{selectedLanguage}</Text>
              <Ionicons name="chevron-forward" size={15} color={colors.neutral[400]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Sign Out Action */}
        <TouchableOpacity
          style={styles.cleanLogoutRow}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={16} color={colors.error[600]} />
          <Text style={styles.cleanLogoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.cleanVersionFooter}>TechTune Healer Pro • v2.4</Text>
      </ScrollView>

      {/* ABA KHQR Account Modal */}
      <Modal
        visible={khqrModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setKhqrModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons name="qr-code" size={22} color={colors.neutral[900]} />
              <Text style={styles.modalTitle}>Payout Account</Text>
            </View>
            <Text style={styles.modalSubtitle}>
              Linked ABA Bank / Bakong merchant account for instant settlements.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account Name</Text>
              <TextInput
                style={styles.inputField}
                value={bankAccountName}
                onChangeText={setBankAccountName}
                placeholder="e.g. SOKHA AUTO REPAIR"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ABA Account Number</Text>
              <TextInput
                style={styles.inputField}
                value={bankAccountNumber}
                onChangeText={setBankAccountNumber}
                placeholder="e.g. 001 234 567"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setKhqrModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={() => setKhqrModalVisible(false)}
              >
                <Text style={styles.modalSaveBtnText}>Save</Text>
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
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.neutral[900],
    letterSpacing: -0.5,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    ...shadows.sm,
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing["4xl"],
  },

  // Executive Profile Card
  profileHeaderCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    ...shadows.sm,
  },
  profileHeaderTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatarContainer: {
    position: "relative",
  },
  cleanAvatarImage: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.neutral[100],
  },
  avatarProBadge: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.neutral[900],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  profileHeaderMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cleanName: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.neutral[900],
    letterSpacing: -0.3,
  },
  proPill: {
    backgroundColor: colors.neutral[900],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proPillText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  cleanLocationLine: {
    fontSize: 13,
    color: colors.neutral[500],
    marginTop: 2,
    fontWeight: "500",
  },

  // Metric Bar
  metricsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.neutral[900],
  },
  metricLabel: {
    fontSize: 11,
    color: colors.neutral[400],
    marginTop: 2,
    fontWeight: "500",
  },
  metricDivider: {
    width: 1,
    height: 22,
    backgroundColor: colors.neutral[200],
  },

  // Section Headers
  groupHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.neutral[400],
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
    marginLeft: 4,
    textTransform: "uppercase",
  },

  // Apple Inset Grouped Card
  groupedCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    ...shadows.sm,
  },
  groupedRowColumn: {
    paddingVertical: spacing.sm,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.neutral[100],
    justifyContent: "center",
    alignItems: "center",
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.neutral[800],
  },
  rowValueHighlight: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  rowValueText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.neutral[500],
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.neutral[100],
    marginLeft: 44,
  },

  // Segmented Radius Selector
  radiusPillsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
    marginLeft: 44,
  },
  radiusPill: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: colors.neutral[100],
  },
  radiusPillActive: {
    backgroundColor: colors.neutral[900],
  },
  radiusPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.neutral[600],
  },
  radiusPillTextActive: {
    color: colors.white,
  },

  // Sign Out & Footer
  cleanLogoutRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  cleanLogoutText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.error[600],
  },
  cleanVersionFooter: {
    textAlign: "center",
    fontSize: 11,
    color: colors.neutral[400],
    marginTop: spacing.xs,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.xl,
    width: "100%",
    maxWidth: 340,
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.neutral[900],
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.neutral[500],
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: spacing.sm,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.neutral[600],
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  inputField: {
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    fontSize: 13,
    color: colors.neutral[900],
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalCancelBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.neutral[100],
  },
  modalCancelBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.neutral[700],
  },
  modalSaveBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.neutral[900],
  },
  modalSaveBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.white,
  },
});
