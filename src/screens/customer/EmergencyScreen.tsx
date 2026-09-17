import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Button } from "../../components/Button";
import { useLocationStore, useProviderSearchStore } from "../../store";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  shadows,
} from "../../constants/theme";
import type { CustomerStackScreenProps } from "../../navigation/types";

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

export function EmergencyScreen() {
  const navigation =
    useNavigation<CustomerStackScreenProps<"Emergency">["navigation"]>();
  const { setLocation, setError } = useLocationStore();
  const { providers, searchProviders, isLoading } = useProviderSearchStore();

  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationAddress, setLocationAddress] = useState<string>(
    "Getting your location...",
  );

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied");
        setLocationAddress("Location permission denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setLocation(coords);

      // Reverse geocode to get address
      const [address] = await Location.reverseGeocodeAsync(coords);
      if (address) {
        const addressStr = [address.street, address.district, address.city]
          .filter(Boolean)
          .join(", ");
        setLocationAddress(addressStr || "Location found");
      }

      // Search for nearby emergency providers
      searchProviders(coords);
    } catch {
      setError("Failed to get location");
      setLocationAddress("Failed to get location");
    } finally {
      setIsLocating(false);
    }
  };

  const handleCallEmergency = () => {
    // Cambodia emergency number
    Linking.openURL("tel:119");
  };

  const handleRequestHelp = () => {
    if (providers.length > 0) {
      navigation.navigate("BookingCreate", {
        providerId: providers[0].id,
        isEmergency: true,
      });
    }
  };

  const emergencyProviders = providers.filter((p) => p.isAvailable).slice(0, 3);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Emergency Header */}
        <View style={styles.header}>
          <View style={styles.emergencyIcon}>
            <Ionicons name="warning" size={48} color={colors.white} />
          </View>
          <Text style={styles.headerTitle}>Emergency Assistance</Text>
          <Text style={styles.headerSubtitle}>
            We&apos;ll help you find the nearest available mechanic
          </Text>
        </View>

        {/* Current Location */}
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

        {/* Select Issue */}
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

        {/* Nearest Providers */}
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
                  <View style={styles.providerRank}>
                    <Text style={styles.providerRankText}>{index + 1}</Text>
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
      </ScrollView>

      {/* Bottom Actions */}
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
            title="Request Help"
            onPress={handleRequestHelp}
            variant="primary"
            size="large"
            disabled={!selectedIssue || emergencyProviders.length === 0}
          />
        </View>
      </View>
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
  providerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
  },
  providerRankText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.primary[600],
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
