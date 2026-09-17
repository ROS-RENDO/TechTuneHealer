import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import {
  useAuthStore,
  useLocationStore,
  useProviderSearchStore,
} from "../../store";
import {
  colors,
  spacing,
  
  shadows,
} from "../../constants/theme";
import type { CustomerStackScreenProps } from "../../navigation/types";

export function HomeScreen() {
  const navigation = useNavigation<CustomerStackScreenProps<"CustomerTabs">["navigation"]>();
  const { user } = useAuthStore();
  const { setLocation, setError } = useLocationStore();
  const { searchProviders, providers, isLoading } = useProviderSearchStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied");
        return;
      }

      // FOR TESTING: Hardcode to center of Phnom Penh (Independence Monument)
      // const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: 11.5556,
        longitude: 104.9282,
      };
      setLocation(coords);
      searchProviders(coords);
    } catch {
      setError("Failed to get location");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await requestLocationPermission();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[600]} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || "C"}</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Hey, {user?.name?.split(' ')[0] || "Guest"}</Text>
              <Text style={styles.subGreeting}>Need help today?</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate("Notifications")}
          >
            <Ionicons name="notifications" size={22} color={colors.neutral[700]} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Emergency Banner */}
        <TouchableOpacity
          style={styles.emergencyBanner}
          onPress={() => navigation.navigate("Emergency")}
          activeOpacity={0.8}
        >
          <View style={styles.emergencyIconContainer}>
            <Ionicons name="warning" size={26} color={colors.white} />
          </View>
          <View style={styles.emergencyContent}>
            <Text style={styles.emergencyTitle}>Emergency Assistance</Text>
            <Text style={styles.emergencySubtitle}>
              Tap for immediate roadside help
            </Text>
          </View>
          <View style={styles.emergencyChevron}>
            <Ionicons name="chevron-forward" size={20} color={colors.error[500]} />
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              icon="search"
              title="Find Mechanic"
              color={colors.primary[600]}
              onPress={() => navigation.navigate("CustomerTabs", { screen: "Search" })}
            />
            <QuickActionCard
              icon="medkit"
              title="Diagnostics"
              color={colors.secondary[500]}
              onPress={() => navigation.navigate("Diagnostics")}
            />
            <QuickActionCard
              icon="calendar"
              title="Bookings"
              color={colors.success[600]}
              onPress={() => navigation.navigate("CustomerTabs", { screen: "Bookings" })}
            />
            <QuickActionCard
              icon="car"
              title="Vehicles"
              color={colors.warning[600]}
              onPress={() => navigation.navigate("VehicleAdd")}
            />
            <QuickActionCard
              icon="cart"
              title="Shop Parts"
              color={colors.info?.[500] || '#3b82f6'}
              onPress={() => navigation.navigate("Shop" as any)}
            />
          </View>
        </View>

        {/* Nearby Providers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Mechanics</Text>
            <TouchableOpacity onPress={() => navigation.navigate("CustomerTabs", { screen: "Search" })}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {providers.length === 0 && !isLoading ? (
            <View style={styles.emptyCard}>
              <Ionicons name="location" size={40} color={colors.neutral[300]} />
              <Text style={styles.emptyCardText}>No mechanics found nearby.</Text>
            </View>
          ) : (
            providers.slice(0, 3).map((provider) => (
              <ProviderCard
                key={provider.id}
                name={provider.businessName}
                address={provider.address}
                rating={provider.rating}
                reviewCount={provider.reviewCount}
                isAvailable={provider.isAvailable}
                isVerified={provider.isVerified}
                onPress={() => navigation.navigate("ProviderDetail", { providerId: provider.id })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface QuickActionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  color: string;
  onPress: () => void;
}

function QuickActionCard({ icon, title, color, onPress }: QuickActionCardProps) {
  return (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={26} color={color} />
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

interface ProviderCardProps {
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  isVerified: boolean;
  onPress: () => void;
}

function ProviderCard({ name, address, rating, reviewCount, isAvailable, isVerified, onPress }: ProviderCardProps) {
  return (
    <TouchableOpacity style={styles.providerCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.providerAvatar}>
        <Text style={styles.providerAvatarText}>{name.charAt(0).toUpperCase()}</Text>
      </View>
      
      <View style={styles.providerContent}>
        <View style={styles.providerHeaderRow}>
          <Text style={styles.providerName} numberOfLines={1}>{name}</Text>
          {isVerified && <Ionicons name="checkmark-circle" size={16} color={colors.primary[500]} />}
        </View>
        
        <Text style={styles.providerAddress} numberOfLines={1}>{address}</Text>
        
        <View style={styles.providerFooterRow}>
          <View style={styles.ratingInfo}>
            <Ionicons name="star" size={14} color={colors.warning[500]} />
            <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
            <Text style={styles.ratingCount}>({reviewCount})</Text>
          </View>
          
          <View style={[styles.availabilityBadge, { backgroundColor: isAvailable ? colors.success[50] : colors.neutral[100] }]}>
            <View style={[styles.availabilityDot, { backgroundColor: isAvailable ? colors.success[500] : colors.neutral[400] }]} />
            <Text style={[styles.availabilityText, { color: isAvailable ? colors.success[700] : colors.neutral[600] }]}>
              {isAvailable ? "Available" : "Busy"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing["4xl"],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.02)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
    ...shadows.sm,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary[700],
  },
  greeting: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.neutral[900],
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.neutral[500],
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error[500],
    borderWidth: 1,
    borderColor: colors.white,
  },
  emergencyBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.error[600],
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: 16,
    gap: spacing.md,
    ...shadows.md,
  },
  emergencyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.white,
  },
  emergencySubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  emergencyChevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginTop: spacing["2xl"],
    paddingHorizontal: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary[600],
  },
  emptyCard: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  emptyCardText: {
    fontSize: 14,
    color: colors.neutral[500],
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  quickActionCard: {
    width: "48%",
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: "flex-start",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    ...shadows.sm,
  },
  quickActionIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.neutral[800],
  },
  providerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    gap: spacing.md,
    ...shadows.sm,
  },
  providerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
  },
  providerAvatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.neutral[400],
  },
  providerContent: {
    flex: 1,
  },
  providerHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  providerName: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.neutral[900],
    flex: 1,
  },
  providerAddress: {
    fontSize: 13,
    color: colors.neutral[500],
    marginTop: 2,
    fontWeight: '500',
  },
  providerFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  ratingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  ratingCount: {
    fontSize: 13,
    color: colors.neutral[500],
    fontWeight: '500',
  },
  availabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: 'uppercase',
  },
});
