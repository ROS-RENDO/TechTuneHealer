import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useBookingStore, useVehicleStore } from '../../store';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';
import { format } from 'date-fns';
import type { Booking, BookingStatus } from '../../types';
import type { CustomerStackScreenProps } from '../../navigation/types';
import { getProviderAvatarUrl } from '../../utils/helpers';
import { AnimatedEntrance } from '../../components/AnimatedEntrance';

const STATUS_TABS: { key: 'all' | BookingStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'accepted', label: 'Confirmed' },
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export function BookingsScreen() {
  const navigation = useNavigation<CustomerStackScreenProps<'CustomerTabs'>['navigation']>();
  const { bookings, fetchBookings } = useBookingStore();
  const { vehicles } = useVehicleStore();

  const [selectedTab, setSelectedTab] = useState<'all' | BookingStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Refresh bookings on focus
  useFocusEffect(
    useCallback(() => {
      fetchBookings().catch(() => {});
    }, [fetchBookings])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings().catch(() => {});
    setRefreshing(false);
  };

  // Find active booking for hero card
  const activeBooking = useMemo(() => {
    return bookings.find(
      (b) => b.status === 'in_progress' || b.status === 'accepted'
    );
  }, [bookings]);

  // Filter bookings by tab and search query
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const status = (booking.status?.toLowerCase() || 'pending') as BookingStatus;
      const matchesTab =
        selectedTab === 'all' ||
        status === selectedTab ||
        (selectedTab === 'accepted' && (status === 'accepted' || status === 'in_progress'));

      if (!matchesTab) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const service = ((booking as any).serviceType || '').toLowerCase();
      const provider = ((booking as any).provider?.businessName || '').toLowerCase();
      const id = booking.id.toLowerCase();
      return service.includes(q) || provider.includes(q) || id.includes(q);
    });
  }, [bookings, selectedTab, searchQuery]);

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return { bg: '#FFFBEB', text: '#D97706', border: '#FEF3C7', dot: '#F59E0B' };
      case 'accepted':
        return { bg: '#EFF6FF', text: '#2563EB', border: '#DBEAFE', dot: '#3B82F6' };
      case 'in_progress':
        return { bg: '#F0FDF4', text: '#16A34A', border: '#DCFCE7', dot: '#22C55E' };
      case 'completed':
        return { bg: '#F8FAFC', text: '#475569', border: '#E2E8F0', dot: '#10B981' };
      case 'cancelled':
      case 'rejected':
        return { bg: '#FEF2F2', text: '#DC2626', border: '#FEE2E2', dot: '#EF4444' };
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0', dot: '#94A3B8' };
    }
  };

  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Confirmed';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'rejected':
        return 'Declined';
      default:
        return status;
    }
  };

  const getServiceIcon = (serviceType?: string, isEmergency?: boolean) => {
    if (isEmergency) return 'shield-checkmark-outline';
    const s = (serviceType || '').toLowerCase();
    if (s.includes('oil') || s.includes('fluid') || s.includes('lube')) return 'water-outline';
    if (s.includes('tire') || s.includes('wheel')) return 'disc-outline';
    if (s.includes('battery') || s.includes('boost')) return 'battery-charging-outline';
    if (s.includes('diag') || s.includes('scan') || s.includes('obd')) return 'hardware-chip-outline';
    if (s.includes('brake')) return 'speedometer-outline';
    return 'construct-outline';
  };

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const status = (item.status?.toLowerCase() ?? 'pending') as BookingStatus;
    const colorsObj = getStatusColor(status);
    const isLive = status === 'in_progress' || status === 'accepted';

    // Real vehicle details lookup
    const vehicle = vehicles.find((v) => v.id === item.vehicleId);
    const vehicleLabel = vehicle
      ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
      : 'Registered Vehicle';
    const plate = vehicle?.plateNumber;

    const providerName =
      (item as any).provider?.businessName || (item as any).provider?.name || 'Assigned Mechanic';
    const rating = (item as any).provider?.rating ? (item as any).provider.rating.toFixed(1) : '4.9';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.serviceIconWrap}>
            <View style={styles.serviceIconBox}>
              <Ionicons
                name={getServiceIcon((item as any).serviceType, item.isEmergency)}
                size={20}
                color={item.isEmergency ? '#DC2626' : colors.neutral[800]}
              />
            </View>
            <View style={styles.serviceTitleCol}>
              <Text style={styles.serviceTitle} numberOfLines={1}>
                {(item as any).serviceType || 'Automotive Service'}
              </Text>
              <Text style={styles.bookingId}>REF #{item.id.slice(-6).toUpperCase()}</Text>
            </View>
          </View>

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: colorsObj.bg, borderColor: colorsObj.border }]}>
            <View style={[styles.statusDot, { backgroundColor: colorsObj.dot }]} />
            <Text style={[styles.statusText, { color: colorsObj.text }]}>{getStatusLabel(status)}</Text>
          </View>
        </View>

        {/* Emergency Alert Strip if Urgent */}
        {item.isEmergency && (
          <View style={styles.emergencyBanner}>
            <Ionicons name="alert-circle-outline" size={14} color="#DC2626" />
            <Text style={styles.emergencyText}>Priority Emergency Roadside Request</Text>
          </View>
        )}

        {/* Metadata Chips Grid */}
        <View style={styles.metaRow}>
          {/* Scheduled Time Chip */}
          <View style={styles.metaChip}>
            <Ionicons name="calendar-outline" size={13} color={colors.neutral[600]} />
            <Text style={styles.metaChipText}>
              {format(new Date(item.scheduledDate), 'MMM d')} • {item.scheduledTime || 'ASAP'}
            </Text>
          </View>

          {/* Vehicle Chip */}
          <View style={styles.metaChip}>
            <Ionicons name="car-outline" size={13} color={colors.neutral[600]} />
            <Text style={styles.metaChipText} numberOfLines={1}>
              {plate ? `${plate} · ` : ''}{vehicleLabel}
            </Text>
          </View>
        </View>

        {/* Provider Profile Info */}
        <View style={styles.providerRow}>
          <Image
            source={{ uri: getProviderAvatarUrl((item as any).provider) }}
            style={styles.providerAvatar}
          />
          <View style={styles.providerInfoCol}>
            <View style={styles.providerNameRow}>
              <Text style={styles.providerName} numberOfLines={1}>
                {providerName}
              </Text>
              <Ionicons name="checkmark-circle" size={13} color={colors.primary[600]} />
            </View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={11} color="#EAB308" />
              <Text style={styles.ratingText}>{rating}</Text>
              <Text style={styles.ratingSub}>• Certified Mechanic</Text>
            </View>
          </View>

          <Text style={styles.priceTag}>
            {item.estimatedPrice != null ? `$${item.estimatedPrice.toFixed(2)}` : 'Est. $50'}
          </Text>
        </View>

        {/* Footer Quick Action Bar */}
        <View style={styles.cardFooter}>
          {isLive ? (
            <TouchableOpacity
              style={styles.trackLiveBtn}
              onPress={() =>
                navigation.navigate('CustomerTracking', {
                  bookingId: item.id,
                  mechanicName: providerName,
                })
              }
              activeOpacity={0.8}
            >
              <View style={styles.livePulseDot} />
              <Ionicons name="navigate-outline" size={14} color="#FFFFFF" />
              <Text style={styles.trackLiveBtnText}>Track Live GPS</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.viewDetailsBtn}
              onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}
              activeOpacity={0.8}
            >
              <Text style={styles.viewDetailsBtnText}>View Details</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.neutral[700]} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.chatActionBtn}
            onPress={() => navigation.navigate('Chat', { bookingId: item.id })}
            accessibilityLabel="Chat with mechanic"
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.neutral[800]} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top App Header */}
      <AnimatedEntrance delay={0} direction="down">
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View>
              <Text style={styles.headerTitle}>My Bookings</Text>
              <Text style={styles.headerSubtitle}>Manage repairs, road rescue & appointments</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{bookings.length} Total</Text>
            </View>
          </View>

          {/* Clean Search Input */}
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={colors.neutral[500]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by mechanic, service or ID..."
              placeholderTextColor={colors.neutral[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={16} color={colors.neutral[400]} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </AnimatedEntrance>

      {/* Horizontal Filter Tabs */}
      <AnimatedEntrance delay={80} direction="down">
        <View style={styles.tabsContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={STATUS_TABS}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.tabsList}
            renderItem={({ item }) => {
              const isSelected = selectedTab === item.key;
              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.tab, isSelected && styles.tabSelected]}
                  onPress={() => setSelectedTab(item.key)}
                >
                  <Text style={[styles.tabText, isSelected && styles.tabTextSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </AnimatedEntrance>

      {/* Main Bookings List */}
      <AnimatedEntrance delay={140} direction="up" style={{ flex: 1 }}>
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.neutral[700]}
              colors={[colors.neutral[800]]}
            />
          }
          ListHeaderComponent={
            activeBooking && selectedTab === 'all' ? (
              <View style={styles.heroActiveWrapper}>
                <View style={styles.heroActiveCard}>
                  <View style={styles.heroHeaderRow}>
                    <View style={styles.heroBadge}>
                      <View style={styles.heroRadarDot} />
                      <Text style={styles.heroBadgeText}>LIVE SERVICE IN PROGRESS</Text>
                    </View>
                    <Text style={styles.heroRefText}>#{activeBooking.id.slice(-6).toUpperCase()}</Text>
                  </View>

                  <Text style={styles.heroTitle}>
                    {(activeBooking as any).serviceType || 'Emergency Roadside Dispatch'}
                  </Text>

                  <Text style={styles.heroSubtitle}>
                    Mechanic {(activeBooking as any).provider?.businessName || 'Team'} is assigned and active.
                  </Text>

                  <View style={styles.heroActionsRow}>
                    <TouchableOpacity
                      style={styles.heroTrackBtn}
                      activeOpacity={0.85}
                      onPress={() =>
                        navigation.navigate('CustomerTracking', {
                          bookingId: activeBooking.id,
                          mechanicName: (activeBooking as any).provider?.businessName,
                        })
                      }
                    >
                      <Ionicons name="navigate-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.heroTrackText}>Track Live Status</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.heroChatBtn}
                      activeOpacity={0.85}
                      onPress={() => navigation.navigate('Chat', { bookingId: activeBooking.id })}
                    >
                      <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.neutral[800]} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : null
          }
          renderItem={renderBookingCard}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="calendar-clear-outline" size={36} color={colors.neutral[400]} />
              </View>
              <Text style={styles.emptyTitle}>No Bookings Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? `No bookings match "${searchQuery}". Try a different keyword.`
                  : selectedTab === 'all'
                  ? 'You have not booked any auto maintenance or roadside rescue yet.'
                  : `You currently have no ${selectedTab.replace('_', ' ')} bookings.`}
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('CustomerTabs', { screen: 'Search' })}
              >
                <Ionicons name="search" size={16} color="#FFFFFF" />
                <Text style={styles.emptyButtonText}>Find a Mechanic</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </AnimatedEntrance>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: '#FFFFFF',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.neutral[900],
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.neutral[500],
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.neutral[700],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.neutral[900],
    fontWeight: '500',
    padding: 0,
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabsList: {
    paddingHorizontal: spacing.xl,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[600],
  },
  tabTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 40,
  },

  /* Hero Live Card */
  heroActiveWrapper: {
    marginBottom: spacing.md,
  },
  heroActiveCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 16,
    ...shadows.md,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  heroRadarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroRefText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 3,
    marginBottom: 14,
  },
  heroActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroPrimaryBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  heroPrimaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroSecondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  heroSecondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },

  /* Booking Card */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceIconWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  serviceIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceTitleCol: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.neutral[900],
    letterSpacing: -0.2,
  },
  bookingId: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral[400],
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 10,
  },
  emergencyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },

  /* Metadata Chips */
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: '55%',
  },
  metaChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral[600],
  },

  /* Provider Info */
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  providerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E2E8F0',
  },
  providerInfoCol: {
    flex: 1,
  },
  providerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  providerName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.neutral[700],
  },
  ratingSub: {
    fontSize: 11,
    color: colors.neutral[400],
  },
  priceTag: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.neutral[900],
  },

  /* Card Footer */
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 12,
  },
  trackLiveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 9,
    borderRadius: 12,
    gap: 6,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  trackLiveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  viewDetailsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 9,
    borderRadius: 12,
    gap: 4,
  },
  viewDetailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral[800],
  },
  chatActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  /* Empty State */
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: spacing.xl,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.neutral[900],
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
