import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useBookingStore } from '../../store';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';
import { format } from 'date-fns';
import type { Booking, BookingStatus } from '../../types';
import type { CustomerStackScreenProps } from '../../navigation/types';

const STATUS_TABS: { key: 'all' | BookingStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Upcoming' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
];

export function BookingsScreen() {
  const navigation = useNavigation<CustomerStackScreenProps<'CustomerTabs'>['navigation']>();
  const { bookings, fetchBookings } = useBookingStore();
  const [selectedTab, setSelectedTab] = useState<'all' | BookingStatus>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Refresh bookings on focus
  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

  const filteredBookings = bookings.filter(
    (booking) => selectedTab === 'all' || (booking.status?.toLowerCase() || 'pending') === selectedTab
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return { bg: colors.warning[50], text: colors.warning[700], border: colors.warning[100] };
      case 'accepted':
        return { bg: colors.primary[50], text: colors.primary[700], border: colors.primary[100] };
      case 'in_progress':
        return { bg: colors.secondary[50], text: colors.secondary[700], border: colors.secondary[100] };
      case 'completed':
        return { bg: colors.success[50], text: colors.success[700], border: colors.success[100] };
      case 'cancelled':
      case 'rejected':
        return { bg: colors.error[50], text: colors.error[700], border: colors.error[100] };
      default:
        return { bg: colors.neutral[100], text: colors.neutral[600], border: colors.neutral[200] };
    }
  };

  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Confirmed';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const status = (item.status?.toLowerCase() ?? 'pending') as BookingStatus;
    const colorsObj = getStatusColor(status);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.serviceTitle}>{(item as any).serviceType || 'Custom Service'}</Text>
            <Text style={styles.bookingId}>#{item.id.slice(-6).toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: colorsObj.bg, borderColor: colorsObj.border }]}>
            <View style={[styles.statusDot, { backgroundColor: colorsObj.text }]} />
            <Text style={[styles.statusText, { color: colorsObj.text }]}>{getStatusLabel(status)}</Text>
          </View>
        </View>

        {item.isEmergency && (
          <View style={styles.emergencyBanner}>
            <Ionicons name="warning" size={14} color={colors.error[700]} />
            <Text style={styles.emergencyText}>Emergency Request</Text>
          </View>
        )}

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Ionicons name="calendar" size={16} color={colors.primary[600]} />
            </View>
            <Text style={styles.infoText}>
              {format(new Date(item.scheduledDate), 'MMM d, yyyy')} • {item.scheduledTime}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Ionicons name="person" size={16} color={colors.primary[600]} />
            </View>
            <Text style={styles.infoText}>
              {(item as any).provider?.businessName || 'Provider'}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.priceText}>
            {item.estimatedPrice != null ? `$${item.estimatedPrice.toFixed(2)}` : 'Pricing pending'}
          </Text>
          <TouchableOpacity
            style={styles.chatButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => navigation.navigate('Chat', { bookingId: item.id })}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color={colors.primary[600]} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_TABS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.tabsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.tab, selectedTab === item.key && styles.tabSelected]}
              onPress={() => setSelectedTab(item.key)}
            >
              <Text style={[styles.tabText, selectedTab === item.key && styles.tabTextSelected]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[600]} />}
        renderItem={renderBookingCard}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="calendar-clear" size={48} color={colors.primary[400]} />
            </View>
            <Text style={styles.emptyTitle}>No bookings found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedTab === 'all' ? "You haven't made any bookings yet." : `No ${selectedTab} bookings right now.`}
            </Text>
            {selectedTab === 'all' && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('CustomerTabs', { screen: 'Search' })}
              >
                <Text style={styles.emptyButtonText}>Find a Mechanic</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Cleaner off-white background
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.neutral[900],
    letterSpacing: -0.5,
  },
  tabsContainer: {
    backgroundColor: colors.white,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  tabsList: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
  },
  tabSelected: {
    backgroundColor: colors.neutral[900],
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[600],
  },
  tabTextSelected: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  serviceTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 2,
  },
  bookingId: {
    fontSize: fontSize.xs,
    color: colors.neutral[400],
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error[50],
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
    gap: 6,
  },
  emergencyText: {
    fontSize: fontSize.sm,
    color: colors.error[700],
    fontWeight: '600',
  },
  cardBody: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.neutral[700],
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  priceText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  chatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: spacing.xl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: colors.neutral[900],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  emptyButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: fontSize.base,
  },
});
