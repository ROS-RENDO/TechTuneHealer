import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useBookingStore, useVehicleStore } from '../../store';
import { colors, spacing, shadows } from '../../constants/theme';
import { AnimatedEntrance } from '../../components';
import { format } from 'date-fns';
import type { CustomerStackScreenProps } from '../../navigation/types';
import { getProviderAvatarUrl } from '../../utils/helpers';

export function BookingDetailScreen() {
  const navigation = useNavigation<CustomerStackScreenProps<'BookingDetail'>['navigation']>();
  const route = useRoute<CustomerStackScreenProps<'BookingDetail'>['route']>();
  const { bookingId } = route.params;

  const { bookings, updateBookingStatus } = useBookingStore();
  const { vehicles } = useVehicleStore();

  const booking = bookings.find((b) => b.id === bookingId);

  if (!booking) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color={colors.neutral[800]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.notFoundContainer}>
          <View style={styles.notFoundIconCircle}>
            <Ionicons name="document-text-outline" size={48} color={colors.neutral[400]} />
          </View>
          <Text style={styles.notFoundTitle}>Booking Not Found</Text>
          <Text style={styles.notFoundSub}>
            This booking may have been removed or does not exist.
          </Text>
          <TouchableOpacity
            style={styles.notFoundBtn}
            onPress={() => navigation.navigate('CustomerTabs', { screen: 'Bookings' })}
          >
            <Text style={styles.notFoundBtnText}>Back to Bookings</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const normalizedStatus = booking.status?.toLowerCase() ?? 'pending';
  const isLive = normalizedStatus === 'in_progress' || normalizedStatus === 'accepted';

  // Real vehicle details lookup
  const vehicle = vehicles.find((v) => v.id === booking.vehicleId);
  const vehicleName = vehicle
    ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
    : 'Registered Vehicle';
  const vehiclePlate = vehicle?.plateNumber || '2E-7777';
  const vehicleColor = vehicle?.color || 'Black';

  const provider = (booking as any).provider;
  const providerName =
    provider?.businessName || provider?.user?.name || provider?.name || 'Assigned Certified Mechanic';
  const providerAddress = provider?.address || 'Olympic Stadium, Phnom Penh';
  const providerPhone = provider?.user?.phone || provider?.phone || '+85512888999';
  const providerRating = provider?.rating ? Number(provider.rating).toFixed(1) : '4.9';

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking request?',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            updateBookingStatus(bookingId, 'cancelled');
            Alert.alert('Booking Cancelled', 'Your request has been cancelled.');
          },
        },
      ]
    );
  };

  const handleCallProvider = () => {
    Alert.alert(
      'Call Mechanic',
      `Call ${providerName} at ${providerPhone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          onPress: () => Linking.openURL(`tel:${providerPhone.replace(/\s/g, '')}`),
        },
      ]
    );
  };

  const getStatusMeta = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending Confirmation',
          bg: '#FFFBEB',
          text: '#D97706',
          border: '#FEF3C7',
          dot: '#F59E0B',
          explainer: 'Your request has been sent to the mechanic. We will notify you when accepted.',
        };
      case 'accepted':
        return {
          label: 'Confirmed & En Route',
          bg: '#EFF6FF',
          text: '#2563EB',
          border: '#DBEAFE',
          dot: '#3B82F6',
          explainer: 'Mechanic has accepted your booking and is preparing equipment.',
        };
      case 'in_progress':
        return {
          label: 'Service In Progress',
          bg: '#F0FDF4',
          text: '#16A34A',
          border: '#DCFCE7',
          dot: '#22C55E',
          explainer: 'Mechanic is actively inspecting and repairing your vehicle.',
        };
      case 'completed':
        return {
          label: 'Service Completed',
          bg: '#F8FAFC',
          text: '#334155',
          border: '#E2E8F0',
          dot: '#10B981',
          explainer: 'Job finished, inspected, and verified. Warranty telemetry active.',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          bg: '#FEF2F2',
          text: '#DC2626',
          border: '#FEE2E2',
          dot: '#EF4444',
          explainer: 'This booking was cancelled. You can reschedule whenever ready.',
        };
      default:
        return {
          label: status,
          bg: '#F1F5F9',
          text: '#475569',
          border: '#E2E8F0',
          dot: '#94A3B8',
          explainer: 'Booking record updated.',
        };
    }
  };

  const statusMeta = getStatusMeta(normalizedStatus);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Header */}
      <AnimatedEntrance delay={0} direction="down">
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color={colors.neutral[800]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <TouchableOpacity
            style={styles.helpBtn}
            onPress={handleCallProvider}
            accessibilityLabel="Call mechanic directly"
          >
            <Ionicons name="call-outline" size={18} color={colors.neutral[800]} />
          </TouchableOpacity>
        </View>
      </AnimatedEntrance>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Hero Status Card */}
        <AnimatedEntrance delay={60} direction="up">
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.serviceBadge}>
                <Ionicons
                  name={booking.isEmergency ? 'shield-checkmark' : 'construct'}
                  size={14}
                  color={booking.isEmergency ? '#DC2626' : '#2563EB'}
                />
                <Text
                  style={[
                    styles.serviceBadgeText,
                    booking.isEmergency && { color: '#DC2626' },
                  ]}
                >
                  {(booking as any).serviceType || 'Automotive Service'}
                </Text>
              </View>
              <Text style={styles.refCode}>#{booking.id.slice(-6).toUpperCase()}</Text>
            </View>

            <Text style={styles.heroMainTitle}>
              {(booking as any).serviceType || 'Automotive Service'}
            </Text>

            {/* Status Pill */}
            <View style={[styles.statusPill, { backgroundColor: statusMeta.bg, borderColor: statusMeta.border }]}>
              <View style={[styles.statusDot, { backgroundColor: statusMeta.dot }]} />
              <Text style={[styles.statusPillText, { color: statusMeta.text }]}>
                {statusMeta.label}
              </Text>
            </View>

            <Text style={styles.heroExplainer}>{statusMeta.explainer}</Text>
          </View>
        </AnimatedEntrance>

        {/* 2. Live GPS Tracking Hero Banner (when active) */}
        {isLive && (
          <AnimatedEntrance delay={100} direction="up">
            <View style={styles.trackingHeroCard}>
              <View style={styles.trackingHeroTop}>
                <View style={styles.trackingBeacon}>
                  <View style={styles.trackingRadarDot} />
                  <Text style={styles.trackingBeaconText}>LIVE GPS DISPATCH</Text>
                </View>
                <Text style={styles.trackingEtaText}>ETA: ~12 mins</Text>
              </View>

              <Text style={styles.trackingHeroTitle}>
                Mechanic is on the way with emergency mobile diagnostic gear.
              </Text>

              <TouchableOpacity
                style={styles.trackMapBtn}
                onPress={() =>
                  navigation.navigate('CustomerTracking', {
                    bookingId: booking.id,
                    mechanicName: providerName,
                  })
                }
                activeOpacity={0.88}
              >
                <Ionicons name="navigate" size={16} color="#FFFFFF" />
                <Text style={styles.trackMapBtnText}>Track Mechanic Live on Map</Text>
                <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </AnimatedEntrance>
        )}

        {/* 3. Schedule Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>APPOINTMENT SCHEDULE</Text>
          <View style={styles.scheduleRow}>
            <View style={styles.scheduleIconBox}>
              <Ionicons name="calendar-outline" size={20} color={colors.neutral[800]} />
            </View>
            <View style={styles.scheduleCol}>
              <Text style={styles.scheduleTitle}>
                {format(new Date(booking.scheduledDate), 'EEEE, MMMM d, yyyy')}
              </Text>
              <Text style={styles.scheduleSub}>
                Time Window: {booking.scheduledTime || 'Immediate Rescue Dispatch'}
              </Text>
            </View>
          </View>
        </View>

        {/* 4. Registered Vehicle Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>SERVICED VEHICLE</Text>
            {vehicle && (
              <TouchableOpacity
                onPress={() => navigation.navigate('Garage', { vehicle })}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionActionText}>3D Twin</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.vehicleRow}>
            <View style={styles.vehicleIconBox}>
              <Ionicons name="car-sport-outline" size={20} color={colors.neutral[800]} />
            </View>
            <View style={styles.vehicleCol}>
              <Text style={styles.vehicleTitle}>{vehicleName}</Text>
              <Text style={styles.vehicleSub}>
                Plate: {vehiclePlate} • Color: {vehicleColor}
              </Text>
            </View>
            <View style={styles.plateChip}>
              <Text style={styles.plateChipText}>{vehiclePlate}</Text>
            </View>
          </View>

          {booking.notes ? (
            <View style={styles.notesBox}>
              <Ionicons name="information-circle-outline" size={15} color={colors.neutral[500]} />
              <Text style={styles.notesText}>{booking.notes}</Text>
            </View>
          ) : null}
        </View>

        {/* 5. Assigned Mechanic / Provider */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>ASSIGNED SERVICE PROVIDER</Text>
          <View style={styles.providerRow}>
            <Image
              source={{ uri: getProviderAvatarUrl(provider) }}
              style={styles.providerAvatar}
            />
            <View style={styles.providerCol}>
              <View style={styles.providerTitleRow}>
                <Text style={styles.providerTitle} numberOfLines={1}>
                  {providerName}
                </Text>
                <Ionicons name="checkmark-circle" size={15} color={colors.primary[600]} />
              </View>
              <Text style={styles.providerAddr} numberOfLines={1}>
                {providerAddress}
              </Text>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#EAB308" />
                <Text style={styles.ratingNum}>{providerRating}</Text>
                <Text style={styles.ratingLabel}>Verified Automotive Shop</Text>
              </View>
            </View>
          </View>

          {/* Quick Contact Buttons */}
          <View style={styles.providerActionsRow}>
            <TouchableOpacity
              style={styles.providerActionBtn}
              onPress={handleCallProvider}
              activeOpacity={0.8}
            >
              <Ionicons name="call-outline" size={16} color={colors.neutral[800]} />
              <Text style={styles.providerActionBtnText}>Call Direct</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.providerActionBtn}
              onPress={() => navigation.navigate('Chat', { bookingId })}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.neutral[800]} />
              <Text style={styles.providerActionBtnText}>In-App Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 6. Visual Stepper Timeline */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>STATUS PROGRESS TIMELINE</Text>
          <View style={styles.timelineList}>
            <TimelineStep
              title="Booking Requested"
              subtitle={format(new Date(booking.createdAt), 'MMM d, yyyy • h:mm a')}
              isDone={true}
              isCurrent={normalizedStatus === 'pending'}
            />
            <TimelineStep
              title="Mechanic Confirmed"
              subtitle="Mechanic accepted and assigned technicians"
              isDone={['accepted', 'in_progress', 'completed'].includes(normalizedStatus)}
              isCurrent={normalizedStatus === 'accepted'}
            />
            <TimelineStep
              title="Service In Progress"
              subtitle="On-site diagnostic scanning & active repair"
              isDone={['in_progress', 'completed'].includes(normalizedStatus)}
              isCurrent={normalizedStatus === 'in_progress'}
            />
            <TimelineStep
              title="Service Completed"
              subtitle="Inspection signed off and warranty verified"
              isDone={normalizedStatus === 'completed'}
              isCurrent={normalizedStatus === 'completed'}
              isLast={true}
            />
          </View>
        </View>

        {/* 7. Itemized Payment & Receipt Summary */}
        <View style={[styles.sectionCard, { marginBottom: 120 }]}>
          <Text style={styles.sectionHeading}>COST BREAKDOWN & PAYMENT</Text>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Diagnostic & Service Fee</Text>
            <Text style={styles.receiptValue}>${(booking.estimatedPrice || 50).toFixed(2)}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Tools & Equipment Fee</Text>
            <Text style={styles.receiptValue}>Included</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>VAT & Environmental Tax (10%)</Text>
            <Text style={styles.receiptValue}>$0.00 (Exempt)</Text>
          </View>

          <View style={styles.receiptDivider} />

          <View style={styles.receiptRowTotal}>
            <Text style={styles.receiptTotalLabel}>Total Amount</Text>
            <Text style={styles.receiptTotalValue}>
              ${(booking.finalPrice || booking.estimatedPrice || 50).toFixed(2)}
            </Text>
          </View>

          <View style={styles.paymentMethodPill}>
            <Ionicons name="card-outline" size={14} color={colors.neutral[600]} />
            <Text style={styles.paymentMethodPillText}>
              Payment: ABA PAY, KHQR or Cash on Completion
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 8. Bottom Sticky Actions */}
      <AnimatedEntrance delay={160} direction="up">
        <View style={styles.bottomBar}>
          {normalizedStatus === 'pending' && (
            <View style={styles.bottomActionCol}>
              <TouchableOpacity
                style={styles.primaryBottomBtn}
                onPress={() => {
                  const amount = booking.estimatedPrice || 50.0;
                  navigation.navigate('Payment', {
                    bookingId: booking.id,
                    totalAmount: amount,
                    items: [
                      {
                        name: (booking as any).serviceType || 'Automotive Service',
                        price: amount,
                        quantity: 1,
                      },
                    ],
                  });
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="lock-closed" size={16} color="#FFFFFF" />
                <Text style={styles.primaryBottomBtnText}>Checkout Payment Online</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBottomBtn}
                onPress={handleCancelBooking}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBottomBtnText}>Cancel Booking Request</Text>
              </TouchableOpacity>
            </View>
          )}

          {isLive && (
            <View style={styles.bottomActionRow}>
              <TouchableOpacity
                style={styles.liveTrackingBtn}
                onPress={() =>
                  navigation.navigate('CustomerTracking', {
                    bookingId: booking.id,
                    mechanicName: providerName,
                  })
                }
                activeOpacity={0.88}
              >
                <Ionicons name="navigate" size={16} color="#FFFFFF" />
                <Text style={styles.liveTrackingBtnText}>Track Mechanic Live</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryChatBtn}
                onPress={() => navigation.navigate('Chat', { bookingId })}
                activeOpacity={0.85}
              >
                <Ionicons name="chatbubble-ellipses" size={18} color="#0F172A" />
              </TouchableOpacity>
            </View>
          )}

          {normalizedStatus === 'completed' && (
            <View style={styles.bottomActionRow}>
              <TouchableOpacity
                style={styles.reviewBtn}
                onPress={() => navigation.navigate('ReviewCreate', { bookingId } as any)}
                activeOpacity={0.88}
              >
                <Ionicons name="star" size={16} color="#FFFFFF" />
                <Text style={styles.reviewBtnText}>Leave a Review</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBookBtn}
                onPress={() => navigation.navigate('CustomerTabs', { screen: 'Search' })}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryBookBtnText}>Book Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {normalizedStatus === 'cancelled' && (
            <TouchableOpacity
              style={styles.primaryBottomBtn}
              onPress={() => navigation.navigate('CustomerTabs', { screen: 'Search' })}
              activeOpacity={0.88}
            >
              <Ionicons name="search" size={16} color="#FFFFFF" />
              <Text style={styles.primaryBottomBtnText}>Find Another Mechanic</Text>
            </TouchableOpacity>
          )}
        </View>
      </AnimatedEntrance>
    </SafeAreaView>
  );
}

// ─── Timeline Stepper Component ─────────────────────────────────────────────
function TimelineStep({
  title,
  subtitle,
  isDone,
  isCurrent,
  isLast,
}: {
  title: string;
  subtitle: string;
  isDone: boolean;
  isCurrent?: boolean;
  isLast?: boolean;
}) {
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineColIndicator}>
        <View
          style={[
            styles.timelineCircle,
            isDone && styles.timelineCircleDone,
            isCurrent && styles.timelineCircleCurrent,
          ]}
        >
          <Ionicons
            name={isDone ? 'checkmark' : isCurrent ? 'ellipse' : 'ellipse-outline'}
            size={isDone ? 12 : 8}
            color={isDone ? '#FFFFFF' : isCurrent ? '#2563EB' : colors.neutral[300]}
          />
        </View>
        {!isLast && (
          <View
            style={[
              styles.timelineVerticalLine,
              isDone && styles.timelineVerticalLineDone,
            ]}
          />
        )}
      </View>
      <View style={styles.timelineColText}>
        <Text
          style={[
            styles.timelineTitle,
            isDone && styles.timelineTitleDone,
            isCurrent && styles.timelineTitleCurrent,
          ]}
        >
          {title}
        </Text>
        <Text style={styles.timelineSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.neutral[900],
    letterSpacing: -0.3,
  },
  helpBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: spacing.lg,
  },

  /* Not Found */
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  notFoundIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.neutral[900],
  },
  notFoundSub: {
    fontSize: 13,
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  notFoundBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  notFoundBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Hero Status Card */
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  serviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  serviceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  refCode: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral[500],
  },
  heroMainTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.neutral[900],
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroExplainer: {
    fontSize: 12,
    color: colors.neutral[500],
    lineHeight: 18,
  },

  /* Live Tracking Hero Banner */
  trackingHeroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 18,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  trackingHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  trackingBeacon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trackingRadarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  trackingBeaconText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  trackingEtaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
  },
  trackingHeroTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.88)',
    lineHeight: 20,
    marginBottom: 14,
  },
  trackMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 14,
  },
  trackMapBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Section Cards */
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.neutral[400],
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  sectionActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },

  /* Schedule */
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scheduleIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleCol: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  scheduleSub: {
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: 2,
  },

  /* Vehicle */
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vehicleIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleCol: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  vehicleSub: {
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: 2,
  },
  plateChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  plateChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.neutral[700],
  },
  notesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notesText: {
    fontSize: 12,
    color: colors.neutral[600],
    flex: 1,
    lineHeight: 16,
  },

  /* Provider Card */
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  providerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
  },
  providerCol: {
    flex: 1,
  },
  providerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  providerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  providerAddr: {
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  ratingNum: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.neutral[800],
  },
  ratingLabel: {
    fontSize: 11,
    color: colors.neutral[400],
  },
  providerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  providerActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  providerActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral[800],
  },

  /* Stepper Timeline */
  timelineList: {
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 52,
  },
  timelineColIndicator: {
    alignItems: 'center',
    width: 24,
  },
  timelineCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineCircleDone: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  timelineCircleCurrent: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  timelineVerticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 3,
  },
  timelineVerticalLineDone: {
    backgroundColor: '#0F172A',
  },
  timelineColText: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 14,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral[400],
  },
  timelineTitleDone: {
    color: colors.neutral[900],
  },
  timelineTitleCurrent: {
    color: '#2563EB',
  },
  timelineSubtitle: {
    fontSize: 11,
    color: colors.neutral[500],
    marginTop: 2,
  },

  /* Receipt Breakdown */
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  receiptLabel: {
    fontSize: 13,
    color: colors.neutral[600],
  },
  receiptValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  receiptRowTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  receiptTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.neutral[900],
  },
  receiptTotalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.neutral[900],
  },
  paymentMethodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paymentMethodPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral[600],
  },

  /* Bottom Sticky Bar */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: spacing.lg,
    paddingTop: 12,
    paddingBottom: 24,
    ...shadows.lg,
  },
  bottomActionCol: {
    gap: 8,
  },
  bottomActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryBottomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingVertical: 13,
    borderRadius: 14,
  },
  primaryBottomBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelBottomBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelBottomBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  liveTrackingBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 13,
    borderRadius: 14,
  },
  liveTrackingBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryChatBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingVertical: 13,
    borderRadius: 14,
  },
  reviewBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryBookBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryBookBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral[800],
  },
});
