import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Button } from "../../components/Button";
import { AnimatedEntrance } from "../../components";
import { useLocationStore, useProviderSearchStore } from "../../store";
import api from "../../services/api";
import type { ServiceProvider } from "../../types";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  shadows,
} from "../../constants/theme";
import type { CustomerStackScreenProps } from "../../navigation/types";
import { getProviderAvatarUrl } from "../../utils/helpers";

const EMERGENCY_ISSUES = [
  { id: "flat_tire", icon: "ellipse-outline", label: "Flat Tire" },
  { id: "dead_battery", icon: "battery-dead-outline", label: "Dead Battery" },
  { id: "engine_failure", icon: "warning-outline", label: "Engine Failure" },
  { id: "accident", icon: "car-outline", label: "Accident" },
  { id: "locked_out", icon: "key-outline", label: "Locked Out" },
  { id: "fuel", icon: "water-outline", label: "Out of Fuel" },
  { id: "overheating", icon: "thermometer-outline", label: "Overheating" },
  { id: "other", icon: "help-circle-outline", label: "Other Issue" },
];

const FALLBACK_EMERGENCY_PROVIDERS: ServiceProvider[] = [
  {
    id: "2b292c6d-c2d3-418e-a0b1-f8ff183daf12",
    email: "mekong@techtune.com",
    name: "Mekong Auto Center",
    businessName: "Mekong Auto Center · 24/7 Mobile Rescue",
    description: "Rapid roadside rescue, flat tire, battery jumpstart, and towing.",
    address: "St. 271, Boeng Tumpun, Phnom Penh",
    phone: "012 345 678",
    role: "provider",
    location: { latitude: 11.55, longitude: 104.915, address: "St. 271, Phnom Penh" },
    services: [],
    rating: 4.9,
    reviewCount: 214,
    isVerified: true,
    isAvailable: true,
    workingHours: {
      monday: { isOpen: true },
      tuesday: { isOpen: true },
      wednesday: { isOpen: true },
      thursday: { isOpen: true },
      friday: { isOpen: true },
      saturday: { isOpen: true },
      sunday: { isOpen: true },
    },
    images: [],
    createdAt: new Date(),
  },
  {
    id: "0a59579c-cae1-4cde-8e5c-e97ed80e9677",
    email: "speedy@techtune.com",
    name: "Speedy Auto Fix",
    businessName: "Speedy Auto Fix · 24/7 Tow & Rescue",
    description: "Emergency dispatch within 15 minutes across Phnom Penh.",
    address: "Preah Sihanouk Blvd, Phnom Penh",
    phone: "012 987 654",
    role: "provider",
    location: { latitude: 11.56, longitude: 104.91, address: "Preah Sihanouk Blvd, Phnom Penh" },
    services: [],
    rating: 4.8,
    reviewCount: 124,
    isVerified: true,
    isAvailable: true,
    workingHours: {
      monday: { isOpen: true },
      tuesday: { isOpen: true },
      wednesday: { isOpen: true },
      thursday: { isOpen: true },
      friday: { isOpen: true },
      saturday: { isOpen: true },
      sunday: { isOpen: true },
    },
    images: [],
    createdAt: new Date(),
  },
  {
    id: "40b04d65-7141-4b16-8d6d-28a0ed0055cc",
    email: "kvtire@techtune.com",
    name: "KV Tire & Wheel",
    businessName: "KV Tire & Wheel · Emergency Mobile Van",
    description: "Specialized mobile tire patching, replacement, and 12V boost.",
    address: "Monivong Blvd, Phnom Penh",
    phone: "011 223 344",
    role: "provider",
    location: { latitude: 11.535, longitude: 104.915, address: "Monivong Blvd, Phnom Penh" },
    services: [],
    rating: 4.7,
    reviewCount: 302,
    isVerified: true,
    isAvailable: true,
    workingHours: {
      monday: { isOpen: true },
      tuesday: { isOpen: true },
      wednesday: { isOpen: true },
      thursday: { isOpen: true },
      friday: { isOpen: true },
      saturday: { isOpen: true },
      sunday: { isOpen: true },
    },
    images: [],
    createdAt: new Date(),
  },
];

export function EmergencyScreen() {
  const navigation =
    useNavigation<CustomerStackScreenProps<"Emergency">["navigation"]>();
  const { setLocation, setError } = useLocationStore();
  const { providers, searchProviders, isLoading } = useProviderSearchStore();

  const [selectedIssue, setSelectedIssue] = useState<string | null>("flat_tire");
  const [isLocating, setIsLocating] = useState(false);
  const [locationAddress, setLocationAddress] = useState<string>(
    "Getting your location...",
  );

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    setIsLocating(true);
    let coords = {
      latitude: 11.5564,
      longitude: 104.9282,
    };

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
        } catch {
          // Keep default Phnom Penh coordinates
        }
      }

      setLocation(coords);

      try {
        const [address] = await Location.reverseGeocodeAsync(coords);
        if (address) {
          const addressStr = [address.street, address.district, address.city]
            .filter(Boolean)
            .join(", ");
          setLocationAddress(addressStr || "Phnom Penh, Cambodia");
        } else {
          setLocationAddress("Phnom Penh, Cambodia");
        }
      } catch {
        setLocationAddress("Phnom Penh, Cambodia");
      }

      // Fetch dedicated emergency providers
      try {
        const list = await api.providers.getEmergency(coords.latitude, coords.longitude);
        if (list && list.length > 0) {
          useProviderSearchStore.setState({ providers: list });
        } else {
          const all = await api.providers.getAll({ radius: 100 });
          if (all && all.length > 0) {
            useProviderSearchStore.setState({ providers: all });
          }
        }
      } catch (err) {
        console.warn("Could not fetch emergency API, falling back:", err);
      }
    } catch {
      setError("Failed to get location");
      setLocationAddress("Phnom Penh, Cambodia");
      setLocation(coords);
    } finally {
      setIsLocating(false);
    }
  };

  const handleCallEmergency = () => {
    // Cambodia emergency number
    Linking.openURL("tel:119");
  };

  const emergencyProviders = useMemo(() => {
    const list = providers.filter((p) => p.isAvailable ?? true);
    if (list.length > 0) {
      return list.slice(0, 3);
    }
    return FALLBACK_EMERGENCY_PROVIDERS;
  }, [providers]);

  const handleRequestHelp = () => {
    const target = emergencyProviders[0] || FALLBACK_EMERGENCY_PROVIDERS[0];
    navigation.navigate("BookingCreate", {
      providerId: target.id,
      isEmergency: true,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Emergency Header */}
        <AnimatedEntrance delay={0} direction="down">
          <View style={styles.header}>
            <View style={styles.emergencyIcon}>
              <Ionicons name="warning" size={48} color={colors.white} />
            </View>
            <Text style={styles.headerTitle}>Emergency Assistance</Text>
            <Text style={styles.headerSubtitle}>
              We&apos;ll help you find the nearest available mechanic
            </Text>
          </View>
        </AnimatedEntrance>

        {/* Current Location */}
        <AnimatedEntrance delay={70} direction="up">
          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <Ionicons name="location" size={24} color={colors.error[500]} />
              <Text style={styles.locationTitle}>Your Location</Text>
            </View>
            <View style={styles.locationContent}>
              {isLocating ? (
                <ActivityIndicator color={colors.primary[600]} />
              ) : (
                <Text style={styles.locationAddress}>{locationAddress}</Text>
              )}
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={getLocation}
              >
                <Ionicons name="refresh" size={18} color={colors.primary[600]} />
                <Text style={styles.refreshText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedEntrance>

        {/* Select Issue */}
        <AnimatedEntrance delay={130} direction="up">
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What&apos;s the issue?</Text>
            <View style={styles.issuesGrid}>
              {EMERGENCY_ISSUES.map((issue) => (
                <TouchableOpacity
                  key={issue.id}
                  style={[
                    styles.issueCard,
                    selectedIssue === issue.id && styles.issueCardSelected,
                  ]}
                  onPress={() => setSelectedIssue(issue.id)}
                >
                  <Ionicons
                    name={issue.icon as any}
                    size={28}
                    color={
                      selectedIssue === issue.id
                        ? colors.error[600]
                        : colors.neutral[500]
                    }
                  />
                  <Text
                    style={[
                      styles.issueLabel,
                      selectedIssue === issue.id && styles.issueLabelSelected,
                    ]}
                  >
                    {issue.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </AnimatedEntrance>

        {/* Nearest Providers */}
        <AnimatedEntrance delay={190} direction="up">
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nearest Available Help</Text>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[600]} />
                <Text style={styles.loadingText}>
                  Finding nearby mechanics...
                </Text>
              </View>
            ) : emergencyProviders.length > 0 ? (
              <View style={styles.providersList}>
                {emergencyProviders.map((provider, index) => (
                  <TouchableOpacity
                    key={provider.id}
                    style={styles.providerCard}
                    onPress={() =>
                      navigation.navigate("BookingCreate", {
                        providerId: provider.id,
                        isEmergency: true,
                      })
                    }
                  >
                    <View style={styles.providerAvatarWrapper}>
                      <Image
                        source={{ uri: getProviderAvatarUrl(provider) }}
                        style={styles.providerAvatarImage}
                        resizeMode="cover"
                      />
                      <View style={styles.providerRankBadge}>
                        <Text style={styles.providerRankBadgeText}>#{index + 1}</Text>
                      </View>
                      <View style={styles.avatarOnlineDot} />
                    </View>
                    <View style={styles.providerInfo}>
                      <Text style={styles.providerName}>
                        {provider.businessName}
                      </Text>
                      <Text style={styles.providerAddress}>
                        {provider.address}
                      </Text>
                      <View style={styles.providerMeta}>
                        <View style={styles.ratingContainer}>
                          <Ionicons
                            name="star"
                            size={12}
                            color={colors.warning[500]}
                          />
                          <Text style={styles.ratingText}>
                            {provider.rating.toFixed(1)}
                          </Text>
                        </View>
                        <View style={styles.availableBadge}>
                          <Text style={styles.availableText}>Available Now</Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.callButton}
                      onPress={() => Linking.openURL(`tel:${provider.phone}`)}
                    >
                      <Ionicons
                        name="call"
                        size={20}
                        color={colors.success[600]}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.noProvidersCard}>
                <Ionicons
                  name="search-outline"
                  size={48}
                  color={colors.neutral[300]}
                />
                <Text style={styles.noProvidersText}>
                  No mechanics available nearby
                </Text>
                <Text style={styles.noProvidersSubtext}>
                  Try refreshing your location or call emergency services
                </Text>
              </View>
            )}
          </View>
        </AnimatedEntrance>
      </ScrollView>

      {/* Bottom Actions */}
      <AnimatedEntrance delay={240} direction="up">
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.emergencyCallButton}
            onPress={handleCallEmergency}
          >
            <Ionicons name="call" size={24} color={colors.white} />
            <Text style={styles.emergencyCallText}>Emergency Call</Text>
          </TouchableOpacity>
          <View style={styles.requestHelpContainer}>
            <Button
              title={isLocating ? "Locating Help..." : "Request Help"}
              onPress={handleRequestHelp}
              variant="primary"
              size="large"
              loading={isLocating}
            />
          </View>
        </View>
      </AnimatedEntrance>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    padding: spacing["2xl"],
    backgroundColor: colors.error[500],
  },
  emergencyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: fontSize.base,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: spacing.sm,
  },
  locationCard: {
    backgroundColor: colors.white,
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  locationTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[900],
  },
  locationContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationAddress: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.neutral[600],
    lineHeight: 20,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingLeft: spacing.md,
  },
  refreshText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary[600],
  },
  section: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.lg,
  },
  issuesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  issueCard: {
    width: "22%",
    aspectRatio: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.neutral[200],
    padding: spacing.sm,
  },
  issueCardSelected: {
    borderColor: colors.error[500],
    backgroundColor: colors.error[50],
  },
  issueLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral[600],
    textAlign: "center",
    marginTop: spacing.xs,
  },
  issueLabelSelected: {
    color: colors.error[700],
    fontWeight: fontWeight.medium,
  },
  loadingContainer: {
    alignItems: "center",
    padding: spacing["3xl"],
  },
  loadingText: {
    fontSize: fontSize.base,
    color: colors.neutral[500],
    marginTop: spacing.md,
  },
  providersList: {
    gap: spacing.md,
  },
  providerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.sm,
  },
  providerAvatarWrapper: {
    position: "relative",
  },
  providerAvatarImage: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.primary[100],
    borderWidth: 1.5,
    borderColor: colors.primary[200],
  },
  providerRankBadge: {
    position: "absolute",
    top: -5,
    left: -5,
    backgroundColor: colors.primary[600],
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.white,
    ...shadows.sm,
  },
  providerRankBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.white,
  },
  avatarOnlineDot: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: colors.white,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[900],
  },
  providerAddress: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    marginTop: 2,
  },
  providerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
  },
  availableBadge: {
    backgroundColor: colors.success[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  availableText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.success[700],
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.success[50],
    alignItems: "center",
    justifyContent: "center",
  },
  noProvidersCard: {
    alignItems: "center",
    padding: spacing["3xl"],
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
  },
  noProvidersText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
    marginTop: spacing.md,
  },
  noProvidersSubtext: {
    fontSize: fontSize.sm,
    color: colors.neutral[400],
    textAlign: "center",
    marginTop: spacing.xs,
  },
  bottomActions: {
    flexDirection: "row",
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    gap: spacing.md,
  },
  emergencyCallButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.error[500],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  emergencyCallText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  requestHelpContainer: {
    flex: 1,
  },
});
