import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';

const { width } = Dimensions.get('window');

interface Transaction {
  id: string;
  type: 'earning' | 'withdrawal' | 'pending';
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'processing';
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'earning',
    description: 'Oil Change - Toyota Camry',
    amount: 45,
    date: '2024-01-15',
    status: 'completed',
  },
  {
    id: '2',
    type: 'earning',
    description: 'Brake Inspection - Honda Civic',
    amount: 35,
    date: '2024-01-14',
    status: 'completed',
  },
  {
    id: '3',
    type: 'withdrawal',
    description: 'Bank Transfer',
    amount: 150,
    date: '2024-01-13',
    status: 'completed',
  },
  {
    id: '4',
    type: 'earning',
    description: 'Engine Diagnostics - BMW X5',
    amount: 75,
    date: '2024-01-12',
    status: 'completed',
  },
  {
    id: '5',
    type: 'pending',
    description: 'Tire Rotation - Ford Focus',
    amount: 25,
    date: '2024-01-16',
    status: 'pending',
  },
];

type TimePeriod = 'week' | 'month' | 'year';

export default function EarningsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month');

  const totalEarnings = 1250;
  const pendingAmount = 125;
  const availableBalance = 875;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earning':
        return 'arrow-down-circle';
      case 'withdrawal':
        return 'arrow-up-circle';
      case 'pending':
        return 'time';
      default:
        return 'cash';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earning':
        return colors.success[500];
      case 'withdrawal':
        return colors.error[500];
      case 'pending':
        return colors.warning[500];
      default:
        return colors.textSecondary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Earnings</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <TouchableOpacity>
              <Ionicons name="eye-outline" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>${availableBalance.toFixed(2)}</Text>
          <View style={styles.balanceDetails}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Total Earned</Text>
              <Text style={styles.balanceItemValue}>${totalEarnings.toFixed(2)}</Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Pending</Text>
              <Text style={styles.balanceItemValue}>${pendingAmount.toFixed(2)}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.withdrawButton}>
            <Ionicons name="wallet-outline" size={20} color={colors.primary[500]} />
            <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.periodSelector}>
            {(['week', 'month', 'year'] as TimePeriod[]).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === period && styles.periodButtonTextActive,
                  ]}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${colors.success[500]}15` }]}>
                <Ionicons name="trending-up" size={24} color={colors.success[500]} />
              </View>
              <Text style={styles.statValue}>$485</Text>
              <Text style={styles.statLabel}>This {selectedPeriod}</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${colors.info[500]}15` }]}>
                <Ionicons name="briefcase" size={24} color={colors.info[600]} />
              </View>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Jobs Completed</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${colors.warning[500]}15` }]}>
                <Ionicons name="time" size={24} color={colors.warning[500]} />
              </View>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Pending Jobs</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${colors.primary[500]}15` }]}>
                <Ionicons name="calculator" size={24} color={colors.primary[500]} />
              </View>
              <Text style={styles.statValue}>$40.42</Text>
              <Text style={styles.statLabel}>Avg per Job</Text>
            </View>
          </View>
        </View>

        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Earnings Overview</Text>
          <View style={styles.chartPlaceholder}>
            <View style={styles.chartBars}>
              {[65, 40, 85, 55, 90, 70, 60].map((height, index) => (
                <View key={index} style={styles.chartBarContainer}>
                  <View
                    style={[
                      styles.chartBar,
                      { height: `${height}%` },
                      index === 4 && styles.chartBarActive,
                    ]}
                  />
                  <Text style={styles.chartLabel}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {MOCK_TRANSACTIONS.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View
                style={[
                  styles.transactionIcon,
                  { backgroundColor: `${getTransactionColor(transaction.type)}15` },
                ]}
              >
                <Ionicons
                  name={getTransactionIcon(transaction.type) as any}
                  size={24}
                  color={getTransactionColor(transaction.type)}
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDescription}>{transaction.description}</Text>
                <Text style={styles.transactionDate}>
                  {new Date(transaction.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              <View style={styles.transactionAmount}>
                <Text
                  style={[
                    styles.amountText,
                    { color: getTransactionColor(transaction.type) },
                  ]}
                >
                  {transaction.type === 'withdrawal' ? '-' : '+'}$
                  {transaction.amount.toFixed(2)}
                </Text>
                {transaction.status === 'pending' && (
                  <Text style={styles.pendingLabel}>Pending</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.paymentMethods}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          <TouchableOpacity style={styles.paymentMethodCard}>
            <View style={styles.bankIcon}>
              <Ionicons name="business-outline" size={24} color={colors.primary[500]} />
            </View>
            <View style={styles.paymentMethodInfo}>
              <Text style={styles.paymentMethodName}>ABA Bank</Text>
              <Text style={styles.paymentMethodNumber}>**** **** **** 4532</Text>
            </View>
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addPaymentButton}>
            <Ionicons name="add-circle-outline" size={24} color={colors.primary[500]} />
            <Text style={styles.addPaymentText}>Add Payment Method</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  balanceCard: {
    backgroundColor: colors.primary[500],
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.medium,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  balanceLabel: {
    ...typography.body,
    color: colors.white,
    opacity: 0.8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.md,
  },
  balanceDetails: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  balanceItemLabel: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.8,
  },
  balanceItemValue: {
    ...typography.bodyBold,
    color: colors.white,
    marginTop: 2,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  withdrawButtonText: {
    ...typography.bodyBold,
    color: colors.primary[500],
  },
  statsSection: {
    paddingHorizontal: spacing.lg,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    marginBottom: spacing.md,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  periodButtonActive: {
    backgroundColor: colors.primary[500],
  },
  periodButtonText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  periodButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    width: (width - spacing.lg * 2 - spacing.sm) / 2,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.small,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    ...typography.h2,
    color: colors.text,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  chartSection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  chartPlaceholder: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    height: 200,
    ...shadows.small,
  },
  chartBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
  },
  chartBarContainer: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: 24,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  chartBarActive: {
    backgroundColor: colors.primary[500],
  },
  chartLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    position: 'absolute',
    bottom: -20,
  },
  transactionsSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  viewAllText: {
    ...typography.body,
    color: colors.primary[500],
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  transactionDescription: {
    ...typography.body,
    color: colors.text,
  },
  transactionDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    ...typography.bodyBold,
  },
  pendingLabel: {
    ...typography.caption,
    color: colors.warning[500],
    marginTop: 2,
  },
  paymentMethods: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.small,
  },
  bankIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentMethodInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  paymentMethodName: {
    ...typography.bodyBold,
    color: colors.text,
  },
  paymentMethodNumber: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  defaultBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  defaultBadgeText: {
    ...typography.caption,
    color: colors.primary[500],
    fontWeight: '600',
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    borderStyle: 'dashed',
  },
  addPaymentText: {
    ...typography.body,
    color: colors.primary[500],
    fontWeight: '600',
  },
});
