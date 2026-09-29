import { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useBookingStore, useVehicleStore } from '../../store';
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  shadows,
} from '../../constants/theme';
import type { CustomerStackScreenProps } from '../../navigation/types';
import { AnimatedEntrance } from '../../components/AnimatedEntrance';

export function ProfileScreen() {
  const navigation =
    useNavigation<CustomerStackScreenProps<'CustomerTabs'>['navigation']>();
  const { user, logout } = useAuthStore();
  const { bookings } = useBookingStore();
  const { vehicles, getActiveVehicle } = useVehicleStore();
  const activeVehicle = getActiveVehicle();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to sign out of your TechTune account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const handleEmergencyCall = () => {
    Alert.alert(
      'Emergency Roadside Hotline',
      'Call Cambodia 24/7 Roadside Rescue dispatch hotline now?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call 119',
          style: 'destructive',
          onPress: () => Linking.openURL('tel:119'),
        },
      ]
    );
  };

  const handlePaymentMethods = () => {
    navigation.navigate('Payment' as any, { totalAmount: 0, items: [] });
  };

  const handleLanguageSwitch = () => {
    Alert.alert('Language & Region', 'Select your preferred language:', [
      { text: 'English (US / KH)', style: 'default' },
      { text: 'ភាសាខ្មែរ (Khmer)', style: 'default' },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleLegalInfo = () => {
    Alert.alert(
      'TechTune Healer Legal',
      'All diagnostic scans and roadside dispatches are governed by TechTune Healer Terms of Service (v2.4) and Privacy Policy.',
      [{ text: 'Close', style: 'default' }]
    );
  };

  const bookingCount = bookings?.length || 4;
  const userInitials = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const defaultAvatar =
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <AnimatedEntrance delay={0} direction="down">
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Account</Text>
            <TouchableOpacity
              style={styles.headerSettingsBtn}
              onPress={() => navigation.navigate('EditProfile')}
              accessibilityLabel="Edit Profile Settings"
            >
              <Ionicons name="settings-outline" size={20} color={colors.neutral[800]} />
            </TouchableOpacity>
          </View>
        </AnimatedEntrance>

        {/* Hero Profile Card */}
        <AnimatedEntrance delay={80} direction="up">
          <View style={styles.profileHeroCard}>
            <View style={styles.avatarWrap}>
              <Image
                source={{ uri: user?.avatar || defaultAvatar }}
                style={styles.avatarImage}
              />
              <TouchableOpacity
                style={styles.cameraBadge}
                onPress={() => navigation.navigate('EditProfile')}
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={14} color={colors.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.heroNameRow}>
              <Text style={styles.userName}>{user?.name || 'Ros Rendo'}</Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle-outline" size={13} color={colors.neutral[600]} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>

            <Text style={styles.userEmail}>{user?.email || 'driver@techtunehealer.com'}</Text>

            <TouchableOpacity
              style={styles.editProfilePill}
              onPress={() => navigation.navigate('EditProfile')}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={14} color={colors.neutral[800]} />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </AnimatedEntrance>

        {/* Activity & Garage Quick Metrics */}
        <AnimatedEntrance delay={140} direction="up">
          <View style={styles.statsContainer}>
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => navigation.navigate('CustomerTabs', { screen: 'Bookings' } as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.statValue}>{bookingCount}</Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </TouchableOpacity>

            <View style={styles.statDivider} />

            <TouchableOpacity
              style={styles.statItem}
              onPress={() => navigation.navigate('Vehicles')}
              activeOpacity={0.7}
            >
              <Text style={styles.statValue}>{vehicles.length}</Text>
              <Text style={styles.statLabel}>
                Vehicles ({activeVehicle ? activeVehicle.make : `${vehicles.length} Total`})
              </Text>
            </TouchableOpacity>

            <View style={styles.statDivider} />

            <TouchableOpacity
              style={styles.statItem}
              onPress={() => navigation.navigate('Garage' as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.statValueGood}>96%</Text>
              <Text style={styles.statLabel}>Health Score</Text>
            </TouchableOpacity>
          </View>
        </AnimatedEntrance>

        {/* SECTION 1: Garage & Vehicle Services */}
        <AnimatedEntrance delay={190} direction="up">
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionHeading}>GARAGE & SERVICES</Text>
            <View style={styles.menuGroup}>
              <TouchableOpacity
                style={styles.cleanRow}
                onPress={() => navigation.navigate('Garage' as any)}
                activeOpacity={0.75}
              >
                <View style={styles.cleanIconBox}>
                  <Ionicons name="cube-outline" size={20} color={colors.neutral[800]} />
                </View>
                <View style={styles.cleanContent}>
                  <Text style={styles.cleanTitle}>Interactive 3D Garage</Text>
                  <Text style={styles.cleanSubtitle}>
                    {activeVehicle
                      ? `${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
                      : 'Digital Twin'}{' '}
                    · 3D Inspection & Telemetry
                  </Text>
                </View>
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>3D</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>

              <View style={styles.rowDivider} />

              <TouchableOpacity
                style={styles.cleanRow}
                onPress={() => navigation.navigate('CustomerTabs', { screen: 'Bookings' } as any)}
                activeOpacity={0.75}
              >
                <View style={styles.cleanIconBox}>
                  <Ionicons name="calendar-outline" size={20} color={colors.neutral[800]} />
                </View>
                <View style={styles.cleanContent}>
                  <Text style={styles.cleanTitle}>My Service Bookings</Text>
                  <Text style={styles.cleanSubtitle}>Track repairs, roadside & schedules</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>

              <View style={styles.rowDivider} />

              <TouchableOpacity
                style={styles.cleanRow}
                onPress={() => navigation.navigate('Vehicles')}
                activeOpacity={0.75}
              >
                <View style={styles.cleanIconBox}>
                  <Ionicons name="car-sport-outline" size={20} color={colors.neutral[800]} />
                </View>
                <View style={styles.cleanContent}>
                  <Text style={styles.cleanTitle}>My Vehicles</Text>
                  <Text style={styles.cleanSubtitle}>{vehicles.length} {vehicles.length === 1 ? 'car' : 'cars'} · Switch active & 3D inspection</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedEntrance>

        {/* SECTION 2: Account & Preferences */}
        <AnimatedEntrance delay={230} direction="up">
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionHeading}>ACCOUNT & PREFERENCES</Text>
            <View style={styles.menuGroup}>
              <TouchableOpacity
                style={styles.cleanRow}
                onPress={() => navigation.navigate('Notifications')}
                activeOpacity={0.75}
              >
                <View style={styles.cleanIconBox}>
                  <Ionicons name="notifications-outline" size={20} color={colors.neutral[800]} />
                </View>
                <View style={styles.cleanContent}>
                  <Text style={styles.cleanTitle}>Notifications</Text>
                  <Text style={styles.cleanSubtitle}>Booking alerts, AI scans & messages</Text>
                </View>
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>2 New</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>

              <View style={styles.rowDivider} />

              <TouchableOpacity
                style={styles.cleanRow}
                onPress={handlePaymentMethods}
                activeOpacity={0.75}
              >
                <View style={styles.cleanIconBox}>
                  <Ionicons name="card-outline" size={20} color={colors.neutral[800]} />
                </View>
                <View style={styles.cleanContent}>
                  <Text style={styles.cleanTitle}>Payment Methods</Text>
                  <Text style={styles.cleanSubtitle}>ABA PAY, KHQR & Card options</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>

              <View style={styles.rowDivider} />

              <TouchableOpacity
                style={styles.cleanRow}
                onPress={handleLanguageSwitch}
                activeOpacity={0.75}
              >
                <View style={styles.cleanIconBox}>
                  <Ionicons name="globe-outline" size={20} color={colors.neutral[800]} />
                </View>
                <View style={styles.cleanContent}>
                  <Text style={styles.cleanTitle}>Language & Region</Text>
                  <Text style={styles.cleanSubtitle}>English (Cambodia)</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedEntrance>

        {/* SECTION 3: Emergency & Legal */}
        <AnimatedEntrance delay={270} direction="up">
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionHeading}>SAFETY & SUPPORT</Text>
            <View style={styles.menuGroup}>
              <TouchableOpacity
                style={styles.cleanRow}
                onPress={handleEmergencyCall}
                activeOpacity={0.75}
              >
                <View style={styles.cleanIconBox}>
                  <Ionicons name="call-outline" size={20} color={colors.neutral[800]} />
                </View>
                <View style={styles.cleanContent}>
                  <Text style={styles.cleanTitle}>24/7 Roadside Hotline</Text>
                  <Text style={styles.cleanSubtitle}>Emergency towing & immediate rescue</Text>
                </View>
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>119</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>

              <View style={styles.rowDivider} />

              <TouchableOpacity
                style={styles.cleanRow}
                onPress={handleLegalInfo}
                activeOpacity={0.75}
              >
                <View style={styles.cleanIconBox}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={colors.neutral[800]} />
                </View>
                <View style={styles.cleanContent}>
                  <Text style={styles.cleanTitle}>Terms & Privacy Policy</Text>
                  <Text style={styles.cleanSubtitle}>Security, warranties & data usage</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedEntrance>

        {/* Clean Modern Logout Button */}
        <AnimatedEntrance delay={310} direction="up">
          <TouchableOpacity
            style={styles.cleanLogoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.neutral[700]} />
            <Text style={styles.cleanLogoutText}>Sign Out</Text>
          </TouchableOpacity>

          {/* App Version & Status */}
          <View style={styles.footerContainer}>
            <Text style={styles.versionText}>TechTune Healer v2.4.0 (Build 2026.09)</Text>
            <Text style={styles.subVersionText}>Connected to Phnom Penh Automotive Telemetry</Text>
          </View>
        </AnimatedEntrance>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.neutral[900],
    letterSpacing: -0.4,
  },
  headerSettingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Hero Profile Card */
  profileHeroCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: 22,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadows.sm,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatarImage: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#F1F5F9',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral[900],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
    ...shadows.sm,
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.neutral[900],
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.neutral[600],
  },
  userEmail: {
    fontSize: 13,
    color: colors.neutral[500],
    marginTop: 2,
    fontWeight: '500',
  },
  editProfilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  editProfileText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral[800],
  },

  /* Activity Quick Stats */
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: 18,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.neutral[900],
  },
  statValueGood: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.neutral[900],
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral[500],
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '60%',
    alignSelf: 'center',
    backgroundColor: '#E2E8F0',
  },

  /* Section Groups */
  sectionWrap: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.neutral[400],
    letterSpacing: 0.8,
    marginBottom: spacing.xs + 2,
    paddingLeft: spacing.xs,
  },
  menuGroup: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...shadows.sm,
  },
  cleanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md + 2,
    gap: spacing.md,
  },
  cleanIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cleanContent: {
    flex: 1,
  },
  cleanTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  cleanSubtitle: {
    fontSize: 11,
    color: colors.neutral[400],
    marginTop: 2,
    fontWeight: '500',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 64,
  },

  /* Badges */
  badgePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.neutral[700],
  },

  /* Logout Button */
  cleanLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing['2xl'],
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  cleanLogoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[800],
  },

  /* Footer */
  footerContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: 2,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[400],
  },
  subVersionText: {
    fontSize: 11,
    color: colors.neutral[300],
  },
});
