import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, borderRadius, shadows } from "../../constants/theme";
import { MockTransaction } from "../../data/mockProviderData";
import { useBookingStore } from "../../store";
import { AnimatedEntrance } from "../../components/AnimatedEntrance";

type TimePeriod = "week" | "month" | "year";

export default function EarningsScreen() {
  const { bookings } = useBookingStore();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("month");
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("250.00");
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);
  const [withdrawals, setWithdrawals] = useState<MockTransaction[]>([]);

  // Derive transactions dynamically from real seed bookings in the store
  const transactions = useMemo<MockTransaction[]>(() => {
    const bookingTx: MockTransaction[] = bookings.map((b) => {
      const price = Number(b.finalPrice || b.estimatedPrice || (b as any).totalPrice || 45);
      const fee = Math.round(price * 0.1 * 100) / 100;
      const net = Math.round((price - fee) * 100) / 100;
      const isCompleted = b.status === "completed";

      return {
        id: `tx-bk-${b.id}`,
        type: "earning",
        description: `${b.serviceType || "Emergency Roadside Assistance"} — ${b.customerName || "Customer"}`,
        vehicle: b.vehicle?.make ? `${b.vehicle.make} ${b.vehicle.model}` : "Toyota Camry",
        amount: price,
        feeAmount: fee,
        netAmount: net,
        paymentMethod: b.id.includes("1") ? "CASH" : "KHQR",
        date: b.createdAt ? new Date(b.createdAt).toISOString().split("T")[0] : "Today",
        status: isCompleted ? "completed" : b.status === "in_progress" ? "pending" : "completed",
      };
    });

    return [...withdrawals, ...bookingTx];
  }, [bookings, withdrawals]);

  // Compute live financial totals from database seed bookings
  const financialData = useMemo(() => {
    const completedJobs = bookings.filter((b) => b.status === "completed" || b.status === "in_progress");
    const baseGross = completedJobs.reduce((sum, b) => sum + Number(b.finalPrice || b.estimatedPrice || (b as any).totalPrice || 45), 0);
    const totalWithdrawals = withdrawals.reduce((sum, w) => sum + w.amount, 0);

    const weekGross = baseGross > 0 ? baseGross : 320;
    const monthGross = weekGross * 3.5;
    const yearGross = monthGross * 11.8;

    return {
      week: {
        gross: Math.round(weekGross),
        fee: Math.round(weekGross * 0.1),
        net: Math.round(weekGross * 0.9),
        available: Math.max(0, Math.round(weekGross * 0.9 - totalWithdrawals)),
        pending: 45,
      },
      month: {
        gross: Math.round(monthGross),
        fee: Math.round(monthGross * 0.1),
        net: Math.round(monthGross * 0.9),
        available: Math.max(0, Math.round(monthGross * 0.9 - totalWithdrawals)),
        pending: 80,
      },
      year: {
        gross: Math.round(yearGross),
        fee: Math.round(yearGross * 0.1),
        net: Math.round(yearGross * 0.9),
        available: Math.max(0, Math.round(monthGross * 0.9 - totalWithdrawals)),
        pending: 80,
      },
    };
  }, [bookings, withdrawals]);

  const currentData = financialData[selectedPeriod];

  const handleConfirmWithdraw = () => {
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0 || amt > currentData.available) {
      Alert.alert("Invalid Amount", "Please enter a valid amount within your available balance.");
      return;
    }

    setIsProcessingWithdraw(true);
    setTimeout(() => {
      setIsProcessingWithdraw(false);
      setWithdrawModalVisible(false);

      const newTx: MockTransaction = {
        id: `tx-wd-${Date.now()}`,
        type: "withdrawal",
        description: "Bakong ABA KHQR Settlement Transfer",
        amount: amt,
        feeAmount: 0,
        netAmount: amt,
        paymentMethod: "KHQR",
        date: new Date().toISOString().split("T")[0],
        status: "completed",
      };

      setWithdrawals((prev) => [newTx, ...prev]);
      Alert.alert(
        "Withdrawal Complete",
        `$${amt.toFixed(2)} has been successfully transferred to your linked ABA account via Bakong!`
      );
    }, 800);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <AnimatedEntrance delay={0} direction="down">
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Financial Analytics</Text>
            <Text style={styles.headerSubtitle}>Revenue, Platform Fees & Settlements</Text>
          </View>
          <TouchableOpacity
            style={styles.withdrawTopButton}
            onPress={() => setWithdrawModalVisible(true)}
          >
            <Ionicons name="cash-outline" size={16} color={colors.white} />
            <Text style={styles.withdrawTopButtonText}>Cash Out</Text>
          </TouchableOpacity>
        </View>
      </AnimatedEntrance>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollInner}
      >
        {/* Period Segmented Selector & KPI Cards */}
        <AnimatedEntrance delay={80} direction="up">
          <View style={styles.periodSelectorContainer}>
            {(
              [
                { key: "week", label: "This Week" },
                { key: "month", label: "This Month" },
                { key: "year", label: "This Year" },
              ] as { key: TimePeriod; label: string }[]
            ).map((item) => {
              const isSelected = selectedPeriod === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.periodButton, isSelected && styles.periodButtonActive]}
                  onPress={() => setSelectedPeriod(item.key)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.periodButtonText, isSelected && styles.periodButtonTextActive]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 3 Primary Financial Summary Cards */}
          <View style={styles.kpiRow}>
            {/* Gross Revenue */}
            <View style={[styles.kpiCard, { borderColor: colors.primary[100] }]}>
              <View style={styles.kpiHeader}>
                <Text style={styles.kpiLabel}>Gross Revenue</Text>
                <View style={[styles.kpiIconCircle, { backgroundColor: colors.primary[50] }]}>
                  <Ionicons name="trending-up" size={14} color={colors.primary[600]} />
                </View>
              </View>
              <Text style={styles.kpiValue}>${currentData.gross.toFixed(2)}</Text>
              <Text style={styles.kpiSub}>Total customer billings</Text>
            </View>

            {/* Platform Fee 10% */}
            <View style={[styles.kpiCard, { borderColor: colors.warning[100] }]}>
              <View style={styles.kpiHeader}>
                <Text style={styles.kpiLabel}>Fee (10%)</Text>
                <View style={[styles.kpiIconCircle, { backgroundColor: colors.warning[50] }]}>
                  <Ionicons name="pie-chart-outline" size={14} color={colors.warning[600]} />
                </View>
              </View>
              <Text style={[styles.kpiValue, { color: colors.warning[700] }]}>
                -${currentData.fee.toFixed(2)}
              </Text>
              <Text style={styles.kpiSub}>TechTune commission</Text>
            </View>
          </View>
        </AnimatedEntrance>

        {/* Net Withdrawable Balance Banner */}
        <AnimatedEntrance delay={140} direction="up">
          <View style={styles.balanceHeroCard}>
            <View style={styles.balanceHeader}>
              <View>
                <Text style={styles.balanceHeroLabel}>Net Available Withdrawable Balance</Text>
                <Text style={styles.balanceHeroValue}>${currentData.available.toFixed(2)}</Text>
              </View>
              <View style={styles.khqrVerifiedBadge}>
                <Text style={styles.khqrVerifiedText}>🇰🇭 ABA KHQR</Text>
              </View>
            </View>

            <View style={styles.balanceFooterRow}>
              <View style={styles.clearingInfo}>
                <Ionicons name="time-outline" size={14} color={colors.neutral[300]} />
                <Text style={styles.clearingText}>
                  +${currentData.pending.toFixed(2)} pending 24h bank settlement
                </Text>
              </View>

              <TouchableOpacity
                style={styles.withdrawCardButton}
                onPress={() => setWithdrawModalVisible(true)}
              >
                <Ionicons name="flash" size={14} color={colors.primary[700]} />
                <Text style={styles.withdrawCardButtonText}>Instant Transfer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedEntrance>

        {/* Revenue Breakdown Progress Bars & Transactions */}
        <AnimatedEntrance delay={190} direction="up">
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Service Category Revenue Split</Text>

            {[
              { label: "Emergency Roadside SOS", pct: 45, amount: currentData.net * 0.45, color: colors.error[600] },
              { label: "Brake & Mechanical Repair", pct: 30, amount: currentData.net * 0.3, color: colors.primary[600] },
              { label: "Routine Maintenance & Oil", pct: 15, amount: currentData.net * 0.15, color: colors.success[600] },
              { label: "EV / Hybrid Auxiliary Diagnostics", pct: 10, amount: currentData.net * 0.1, color: colors.warning[600] },
            ].map((item, idx) => (
              <View key={idx} style={styles.progressRow}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>{item.label}</Text>
                  <Text style={styles.progressAmount}>${item.amount.toFixed(0)} ({item.pct}%)</Text>
                </View>
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${item.pct}%`, backgroundColor: item.color },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Itemized Transactions Header */}
          <View style={styles.txHeaderRow}>
            <Text style={styles.txHeaderTitle}>Settlement & Payout Logs</Text>
            <Text style={styles.txCount}>{transactions.length} Records</Text>
          </View>

          {/* Transaction Ledger Cards */}
          {transactions.map((tx) => {
            const isWithdrawal = tx.type === "withdrawal";
            const methodColor =
              tx.paymentMethod === "KHQR"
                ? colors.primary[600]
                : tx.paymentMethod === "CASH"
                ? colors.warning[600]
                : colors.neutral[700];

            return (
              <View key={tx.id} style={styles.txCard}>
                <View style={styles.txLeft}>
                  <View
                    style={[
                      styles.txIconBox,
                      {
                        backgroundColor: isWithdrawal ? colors.error[50] : colors.success[50],
                      },
                    ]}
                  >
                    <Ionicons
                      name={isWithdrawal ? "arrow-up-circle" : "arrow-down-circle"}
                      size={22}
                      color={isWithdrawal ? colors.error[600] : colors.success[600]}
                    />
                  </View>

                  <View style={styles.txMeta}>
                    <Text style={styles.txDescription}>{tx.description.split(" - ")[0]}</Text>
                    <View style={styles.txTagRow}>
                      <View style={[styles.methodBadge, { borderColor: methodColor }]}>
                        <Text style={[styles.methodBadgeText, { color: methodColor }]}>
                          {tx.paymentMethod}
                        </Text>
                      </View>
                      <Text style={styles.txDate}>{tx.date}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.txRight}>
                  <Text
                    style={[
                      styles.txAmount,
                      { color: isWithdrawal ? colors.error[600] : colors.success[600] },
                    ]}
                  >
                    {isWithdrawal ? "-" : "+"}${tx.netAmount.toFixed(2)}
                  </Text>
                  {tx.feeAmount > 0 && (
                    <Text style={styles.txFee}>Fee: -${tx.feeAmount.toFixed(2)}</Text>
                  )}
                  <View style={styles.txStatusPill}>
                    <Ionicons name="checkmark-circle" size={10} color={colors.success[600]} />
                    <Text style={styles.txStatusText}>Settled</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </AnimatedEntrance>
      </ScrollView>

      {/* ABA KHQR Cashout Modal Sheet */}
      <Modal
        visible={withdrawModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setWithdrawModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons name="card" size={24} color={colors.primary[600]} />
              <Text style={styles.modalTitle}>Withdraw via ABA KHQR</Text>
            </View>
            <Text style={styles.modalSubtitle}>
              Funds are instantly disbursed to your registered Bakong account.
            </Text>

            {/* Destination Card */}
            <View style={styles.bankPreviewBox}>
              <Text style={styles.bankPreviewLabel}>Recipient Account</Text>
              <Text style={styles.bankPreviewName}>SOKHA AUTO REPAIR</Text>
              <Text style={styles.bankPreviewNumber}>ABA Bank • 001 234 567</Text>
            </View>

            {/* Amount Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Withdrawal Amount (USD)</Text>
              <View style={styles.inputWithPrefix}>
                <Text style={styles.currencyPrefix}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={withdrawAmount}
                  onChangeText={setWithdrawAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                />
              </View>
              <Text style={styles.availableHint}>
                Max available: ${currentData.available.toFixed(2)}
              </Text>
            </View>

            {/* Quick Amount Pills */}
            <View style={styles.quickPillsRow}>
              {[50, 100, 250, currentData.available].map((amt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.quickPill}
                  onPress={() => setWithdrawAmount(amt.toFixed(2))}
                >
                  <Text style={styles.quickPillText}>
                    {amt === currentData.available ? "All ($" + amt.toFixed(0) + ")" : "$" + amt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setWithdrawModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmWithdrawBtn}
                onPress={handleConfirmWithdraw}
                disabled={isProcessingWithdraw}
              >
                <Text style={styles.confirmWithdrawBtnText}>
                  {isProcessingWithdraw ? "Processing..." : "Transfer Now"}
                </Text>
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
  withdrawTopButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary[600],
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    gap: 4,
    ...shadows.sm,
  },
  withdrawTopButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.white,
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["4xl"],
  },
  periodSelectorContainer: {
    flexDirection: "row",
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
    padding: 3,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
    borderRadius: borderRadius.md,
  },
  periodButtonActive: {
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.neutral[600],
  },
  periodButtonTextActive: {
    color: colors.primary[600],
    fontWeight: "700",
  },
  kpiRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    ...shadows.sm,
  },
  kpiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.neutral[600],
  },
  kpiIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutral[900],
    marginVertical: 2,
  },
  kpiSub: {
    fontSize: 10,
    color: colors.neutral[400],
  },
  balanceHeroCard: {
    backgroundColor: "#0F172A",
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  balanceHeroLabel: {
    fontSize: 12,
    color: colors.neutral[400],
    fontWeight: "500",
    marginBottom: 4,
  },
  balanceHeroValue: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: -0.5,
  },
  khqrVerifiedBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  khqrVerifiedText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#38BDF8",
  },
  balanceFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.12)",
  },
  clearingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  clearingText: {
    fontSize: 10,
    color: colors.neutral[300],
  },
  withdrawCardButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  withdrawCardButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  breakdownCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  progressRow: {
    marginBottom: spacing.sm,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  progressLabel: {
    fontSize: 11,
    color: colors.neutral[700],
    fontWeight: "500",
  },
  progressAmount: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.neutral[900],
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.neutral[100],
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  txHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  txHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  txCount: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  txCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  txLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  txIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  txMeta: {
    flex: 1,
  },
  txDescription: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.neutral[900],
  },
  txVehicle: {
    fontSize: 11,
    color: colors.primary[700],
    marginTop: 1,
  },
  txTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
  },
  methodBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  methodBadgeText: {
    fontSize: 9,
    fontWeight: "700",
  },
  txDate: {
    fontSize: 10,
    color: colors.neutral[400],
  },
  txRight: {
    alignItems: "flex-end",
  },
  txAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
  txFee: {
    fontSize: 10,
    color: colors.warning[600],
    marginTop: 1,
  },
  txStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  txStatusText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.success[700],
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
    fontSize: 17,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.neutral[600],
    marginBottom: spacing.md,
  },
  bankPreviewBox: {
    backgroundColor: "#F8FAFC",
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginBottom: spacing.md,
  },
  bankPreviewLabel: {
    fontSize: 10,
    color: colors.neutral[500],
  },
  bankPreviewName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.neutral[900],
    marginTop: 2,
  },
  bankPreviewNumber: {
    fontSize: 11,
    color: colors.primary[700],
    marginTop: 1,
  },
  inputGroup: {
    marginBottom: spacing.sm,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.neutral[700],
    marginBottom: 4,
  },
  inputWithPrefix: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.neutral[700],
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: colors.neutral[900],
    paddingVertical: 8,
  },
  availableHint: {
    fontSize: 10,
    color: colors.neutral[500],
    marginTop: 3,
  },
  quickPillsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: spacing.lg,
  },
  quickPill: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
  },
  quickPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.neutral[700],
  },
  modalActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
  cancelBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.neutral[700],
  },
  confirmWithdrawBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[600],
  },
  confirmWithdrawBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.white,
  },
});
