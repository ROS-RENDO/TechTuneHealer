import { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { AnimatedEntrance } from "../../components/AnimatedEntrance";
import { colors, spacing, shadows } from "../../constants/theme";
import { useLocationStore, useProviderSearchStore } from "../../store";
import type { CustomerStackScreenProps } from "../../navigation/types";
import type { ServiceProvider, Review } from "../../types";
import { getFormattedDistance, getProviderAvatarUrl } from "../../utils/helpers";
import api from "../../services/api";

// Conditionally import react-native-maps only on native platforms
let MapView: any = null;
let Marker: any = null;
let PROVIDER_DEFAULT: any = undefined;
let PROVIDER_GOOGLE: any = undefined;

if (Platform.OS !== "web") {
  const mapsModule = require("react-native-maps");
  MapView = mapsModule.default || mapsModule;
  Marker = mapsModule.Marker;
  PROVIDER_DEFAULT = mapsModule.PROVIDER_DEFAULT;
  PROVIDER_GOOGLE = mapsModule.PROVIDER_GOOGLE;
}

export function ProviderDetailScreen() {
  const navigation =
    useNavigation<CustomerStackScreenProps<"ProviderDetail">["navigation"]>();
  const route = useRoute<CustomerStackScreenProps<"ProviderDetail">["route"]>();
  const { providerId } = route.params;
  const { providers } = useProviderSearchStore();
  const { currentLocation } = useLocationStore();

  const provider = useMemo(
    () => providers.find((p) => p.id === providerId),
    [providerId, providers],
  );

  const distance = useMemo(
    () =>
      provider ? getFormattedDistance(currentLocation, provider.location) : null,
    [currentLocation, provider],
  );

  const [activeTab, setActiveTab] = useState<"about" | "services" | "reviews">(
    "about",
  );

  if (!provider) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="storefront" size={64} color={colors.neutral[300]} />
          <Text style={styles.emptyStateText}>Provider not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleCall = () => {
    Linking.openURL(`tel:${provider.phone}`);
  };

  const handleDirections = () => {
    const { latitude, longitude } = provider.location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const handleBookNow = () => {
    navigation.navigate("BookingCreate", { providerId: provider.id } as any);
  };

  const handleEmergencyBook = () => {
    navigation.navigate("BookingCreate", {
      providerId: provider.id,
      isEmergency: true,
    } as any);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Map Header */}
        <View style={styles.mapContainer}>
          {MapView && (
            <>
              <MapView
                style={styles.map}
                provider={Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                initialRegion={{
                  latitude: provider.location.latitude - 0.002,
                  longitude: provider.location.longitude,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: provider.location.latitude,
                    longitude: provider.location.longitude,
                  }}
                />
              </MapView>
            </>
          )}
          {/* Overlay actions */}
          <SafeAreaView edges={["top"]} style={styles.mapHeaderOverlay}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.mapBackButton}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.neutral[900]}
              />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Content Wrapper */}
        <View style={styles.contentWrapper}>
          {/* Floating Info Card */}
          <AnimatedEntrance delay={0} direction="up">
            <View style={styles.infoCard}>
              <View style={styles.infoHeaderRow}>
                <View style={styles.providerAvatar}>
                  <Image
                    source={{ uri: getProviderAvatarUrl(provider) }}
                    style={styles.providerAvatarImg}
                    resizeMode="cover"
                  />
                  {provider.isAvailable && <View style={styles.providerDetailOnlineDot} />}
                </View>
                <View style={styles.infoTextContainer}>
                  <View style={styles.nameRow}>
                    <Text style={styles.providerName} numberOfLines={1}>
                      {provider.businessName}
                    </Text>
                    {provider.isVerified && (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={colors.primary[500]}
                      />
                    )}
                  </View>
                  <Text style={styles.providerAddress} numberOfLines={1}>
                    {provider.address}
                  </Text>

                  <View style={styles.ratingRow}>
                    <View style={styles.ratingInfo}>
                      <Ionicons
                        name="star"
                        size={14}
                        color={colors.warning[500]}
                      />
                      <Text style={styles.ratingText}>
                        {provider.rating.toFixed(1)}
                      </Text>
                      <Text style={styles.reviewCount}>
                        ({provider.reviewCount})
                      </Text>
                    </View>

                    {distance && (
                      <View style={styles.distanceBadge}>
                        <Ionicons name="navigate" size={11} color={colors.primary[600]} />
                        <Text style={styles.distanceText}>{distance}</Text>
                      </View>
                    )}

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: provider.isAvailable
                            ? colors.success[50]
                            : colors.neutral[100],
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor: provider.isAvailable
                              ? colors.success[500]
                              : colors.neutral[400],
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: provider.isAvailable
                              ? colors.success[700]
                              : colors.neutral[600],
                          },
                        ]}
                      >
                        {provider.isAvailable ? "Open" : "Closed"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Quick Actions */}
              <View style={styles.quickActions}>
                <TouchableOpacity style={styles.quickAction} onPress={handleCall}>
                  <View
                    style={[
                      styles.quickActionIcon,
                      { backgroundColor: colors.primary[50] },
                    ]}
                  >
                    <Ionicons name="call" size={20} color={colors.primary[600]} />
                  </View>
                  <Text style={styles.quickActionText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickAction}
                  onPress={handleDirections}
                >
                  <View
                    style={[
                      styles.quickActionIcon,
                      { backgroundColor: colors.secondary[50] },
                    ]}
                  >
                    <Ionicons
                      name="navigate"
                      size={20}
                      color={colors.secondary[600]}
                    />
                  </View>
                  <Text style={styles.quickActionText}>Directions</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAction} onPress={() => {}}>
                  <View
                    style={[
                      styles.quickActionIcon,
                      { backgroundColor: colors.accent + "20" },
                    ]}
                  >
                    <Ionicons name="share" size={20} color={colors.accent} />
                  </View>
                  <Text style={styles.quickActionText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </AnimatedEntrance>

          {/* Tabs */}
          <AnimatedEntrance delay={80} direction="up">
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === "about" && styles.tabActive]}
                onPress={() => setActiveTab("about")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "about" && styles.tabTextActive,
                  ]}
                >
                  About
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === "services" && styles.tabActive]}
                onPress={() => setActiveTab("services")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "services" && styles.tabTextActive,
                  ]}
                >
                  Services
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === "reviews" && styles.tabActive]}
                onPress={() => setActiveTab("reviews")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "reviews" && styles.tabTextActive,
                  ]}
                >
                  Reviews
                </Text>
              </TouchableOpacity>
            </View>
          </AnimatedEntrance>

          {/* Tab Content */}
          <AnimatedEntrance delay={140} direction="up">
            <View style={styles.tabContent}>
              {activeTab === "about" && <AboutTab provider={provider} />}
              {activeTab === "services" && <ServicesTab provider={provider} />}
              {activeTab === "reviews" && <ReviewsTab provider={provider} />}
            </View>
          </AnimatedEntrance>

          {/* Bottom spacing for fixed action bar */}
          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Floating Bottom Bar */}
      <AnimatedEntrance delay={200} direction="up" style={styles.bottomBarWrapper}>
        <SafeAreaView edges={["bottom"]}>
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.callBottomButton}
              onPress={handleCall}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={20} color={colors.primary[700]} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.emergencyButtonPill}
              onPress={handleEmergencyBook}
              activeOpacity={0.8}
            >
              <Ionicons name="flash" size={16} color={colors.white} />
              <Text style={styles.emergencyButtonPillText}>SOS Rescue</Text>
            </TouchableOpacity>

            <View style={styles.bookButtonContainer}>
              <TouchableOpacity
                style={styles.bookButton}
                onPress={handleBookNow}
                activeOpacity={0.8}
              >
                <Text style={styles.bookButtonText}>Book Service</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </AnimatedEntrance>
    </View>
  );
}

function AboutTab({ provider }: { provider: ServiceProvider }) {
  const handleCall = () => {
    if (provider.phone) Linking.openURL(`tel:${provider.phone}`);
  };
  
  const handleEmail = () => {
    if (provider.email) Linking.openURL(`mailto:${provider.email}`);
  };

  return (
    <View style={styles.aboutContainer}>
      <View style={styles.cardSection}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{provider.description}</Text>
      </View>

      <View style={styles.cardSection}>
        <Text style={styles.sectionTitle}>Working Hours</Text>
        <View style={styles.hoursContainer}>
          {provider.workingHours ? (
            Object.entries(provider.workingHours).map(
              ([day, hours]: [string, any], index, arr) => (
                <View
                  key={day}
                  style={[
                    styles.hoursRow,
                    index < arr.length - 1 && styles.borderBottom,
                  ]}
                >
                  <Text style={styles.dayText}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </Text>
                  <Text
                    style={[
                      styles.hoursText,
                      !hours.isOpen && styles.closedText,
                    ]}
                  >
                    {hours.isOpen
                      ? `${hours.openTime} - ${hours.closeTime}`
                      : "Closed"}
                  </Text>
                </View>
              ),
            )
          ) : (
            <Text style={styles.dayText}>Hours not specified</Text>
          )}
        </View>
      </View>

      <View style={styles.cardSection}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <View style={styles.contactContainer}>
          <TouchableOpacity style={[styles.contactRow, styles.borderBottom]} onPress={handleCall} activeOpacity={0.7}>
            <Ionicons name="call" size={20} color={colors.primary[500]} />
            <Text style={styles.contactText}>{provider.phone}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactRow} onPress={handleEmail} activeOpacity={0.7}>
            <Ionicons name="mail" size={20} color={colors.primary[500]} />
            <Text style={styles.contactText}>{provider.email}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function ServicesTab({ provider }: { provider: ServiceProvider }) {
  const services = provider.services || [];

  if (services.length === 0) {
    return (
      <View style={styles.emptyTabState}>
        <Ionicons name="construct-outline" size={48} color={colors.neutral[300]} />
        <Text style={styles.emptyTabTitle}>No Specific Services Listed</Text>
        <Text style={styles.emptyTabSubtitle}>
          Contact {provider.businessName || provider.name} directly for custom quotes and availability.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.servicesContainer}>
      {services.map((service, index) => {
        const priceDisplay =
          (service as any).price !== undefined
            ? `$${(service as any).price}`
            : service.priceMin && service.priceMax && service.priceMin !== service.priceMax
            ? `$${service.priceMin} - $${service.priceMax}`
            : service.priceMin
            ? `$${service.priceMin}`
            : "Quote on Request";

        const durationMinutes =
          (service as any).duration || service.estimatedDuration || 30;
        const durationDisplay =
          durationMinutes >= 60
            ? `${Math.floor(durationMinutes / 60)}h ${
                durationMinutes % 60 ? `${durationMinutes % 60}m` : ""
              }`.trim()
            : `${durationMinutes} min`;

        return (
          <View key={service.id || index} style={styles.serviceCard}>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              {service.description ? (
                <Text style={styles.serviceDescText}>{service.description}</Text>
              ) : null}
              <View style={styles.serviceDetails}>
                <View style={styles.serviceDetail}>
                  <Ionicons name="time-outline" size={14} color={colors.neutral[500]} />
                  <Text style={styles.serviceDetailText}>{durationDisplay}</Text>
                </View>
                {service.category ? (
                  <View style={[styles.serviceDetail, { marginLeft: spacing.md }]}>
                    <Ionicons name="pricetag-outline" size={12} color={colors.neutral[500]} />
                    <Text style={styles.serviceDetailText}>{service.category}</Text>
                  </View>
                ) : null}
              </View>
            </View>
            <Text style={styles.servicePrice}>{priceDisplay}</Text>
          </View>
        );
      })}
    </View>
  );
}

function ReviewsTab({ provider }: { provider: ServiceProvider }) {
  const [reviews, setReviews] = useState<Review[]>(provider.reviews || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchReviews() {
      try {
        setLoading(true);
        const data = await api.reviews.getByProvider(provider.id);
        if (isMounted && data && Array.isArray(data)) {
          setReviews(data);
        }
      } catch {
        // Keep initial reviews if network is slow
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchReviews();
    return () => {
      isMounted = false;
    };
  }, [provider.id]);

  const ratingAvg =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : provider.rating || 5.0;

  const totalReviewsCount =
    reviews.length > 0
      ? reviews.length
      : provider.totalReviews ?? provider.reviewCount ?? 0;

  return (
    <View style={styles.reviewsContainer}>
      <View style={styles.ratingSummaryCard}>
        <Text style={styles.ratingBigValue}>{ratingAvg.toFixed(1)}</Text>
        <View style={styles.starsRowCentered}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= Math.round(ratingAvg) ? "star" : "star-outline"}
              size={18}
              color={colors.warning[500]}
            />
          ))}
        </View>
        <Text style={styles.totalReviewsText}>
          Based on {totalReviewsCount} verified {totalReviewsCount === 1 ? "review" : "reviews"}
        </Text>
      </View>

      {loading && reviews.length === 0 ? (
        <View style={{ padding: spacing.xl, alignItems: "center" }}>
          <ActivityIndicator size="small" color={colors.primary[500]} />
          <Text style={{ marginTop: spacing.sm, color: colors.neutral[500], fontSize: 13 }}>
            Loading verified reviews...
          </Text>
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.emptyTabState}>
          <Ionicons name="chatbox-ellipses-outline" size={44} color={colors.neutral[300]} />
          <Text style={styles.emptyTabTitle}>No Reviews Yet</Text>
          <Text style={styles.emptyTabSubtitle}>
            Be the first motorist to review {provider.businessName || provider.name} after a completed booking!
          </Text>
        </View>
      ) : (
        reviews.map((review) => {
          const reviewerName = review.customer?.name || "Verified Motorist";
          const initial = reviewerName.charAt(0).toUpperCase();
          const reviewDate = review.createdAt
            ? new Date(review.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "Recently";

          return (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewerAvatar}>
                  <Text style={styles.reviewerInitial}>{initial}</Text>
                </View>
                <View style={styles.reviewerInfo}>
                  <Text style={styles.reviewerName}>{reviewerName}</Text>
                  <View style={styles.reviewMeta}>
                    <View style={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= review.rating ? "star" : "star-outline"}
                          size={12}
                          color={colors.warning[500]}
                        />
                      ))}
                    </View>
                    <Text style={styles.reviewDate}>{reviewDate}</Text>
                  </View>
                </View>
              </View>
              {review.comment ? (
                <Text style={styles.reviewComment}>{review.comment}</Text>
              ) : null}

              {review.reply ? (
                <View style={styles.providerReplyBox}>
                  <View style={styles.replyHeaderRow}>
                    <Ionicons
                      name="return-down-forward"
                      size={14}
                      color={colors.primary[600]}
                    />
                    <Text style={styles.replyAuthorText}>
                      {provider.businessName || "Provider"} Response
                    </Text>
                  </View>
                  <Text style={styles.replyContentText}>{review.reply}</Text>
                </View>
              ) : null}
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  backButton: {
    alignSelf: "flex-start",
    padding: spacing.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  emptyStateText: {
    fontSize: 18,
    color: colors.neutral[500],
    textAlign: "center",
  },
  mapContainer: {
    height: 260,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  mapHeaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  mapBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },
  contentWrapper: {
    flex: 1,
    marginTop: -40,
  },
  infoCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    ...shadows.lg,
  },
  infoHeaderRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  providerAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
    ...shadows.sm,
    position: "relative",
  },
  providerAvatarImg: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  providerDetailOnlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: "#22C55E",
    borderWidth: 2.5,
    borderColor: colors.white,
  },
  providerAvatarText: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.primary[700],
  },
  infoTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  providerName: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.neutral[900],
    flexShrink: 1,
  },
  providerAddress: {
    fontSize: 14,
    color: colors.neutral[500],
    fontWeight: "500",
    marginTop: 2,
  },
  ratingRow: {
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
  ratingText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  reviewCount: {
    fontSize: 14,
    color: colors.neutral[500],
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary[50],
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary[700],
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  quickAction: {
    alignItems: "center",
    flex: 1,
    gap: spacing.xs,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.neutral[700],
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#E9ECEF",
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    borderRadius: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.neutral[500],
  },
  tabTextActive: {
    color: colors.neutral[900],
  },
  tabContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  cardSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    ...shadows.sm,
  },
  aboutContainer: {},
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 15,
    color: colors.neutral[700],
    lineHeight: 24,
  },
  hoursContainer: {
    gap: spacing.xs,
  },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  dayText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.neutral[700],
  },
  hoursText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  closedText: {
    color: colors.error[500],
  },
  contactContainer: {
    gap: spacing.xs,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  contactText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.neutral[900],
  },
  servicesContainer: {
    gap: spacing.md,
  },
  serviceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    ...shadows.sm,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  serviceDetails: {
    flexDirection: "row",
    marginTop: spacing.xs,
  },
  serviceDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  serviceDetailText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.neutral[500],
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primary[700],
  },
  reviewsContainer: {
    gap: spacing.md,
  },
  ratingSummaryCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    ...shadows.sm,
    marginBottom: spacing.xs,
  },
  ratingBigValue: {
    fontSize: 48,
    fontWeight: "800",
    color: colors.neutral[900],
    letterSpacing: -1,
  },
  starsRowCentered: {
    flexDirection: "row",
    gap: 4,
    marginVertical: spacing.sm,
  },
  totalReviewsText: {
    fontSize: 14,
    color: colors.neutral[500],
    fontWeight: "500",
  },
  reviewCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    ...shadows.sm,
  },
  reviewHeader: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  reviewerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
  },
  reviewerInitial: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.neutral[400],
  },
  reviewerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  reviewMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: 2,
  },
  reviewStars: {
    flexDirection: "row",
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.neutral[400],
  },
  reviewComment: {
    fontSize: 14,
    color: colors.neutral[700],
    lineHeight: 22,
  },
  bottomBarWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    ...shadows.lg,
  },
  bottomActions: {
    flexDirection: "row",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  callBottomButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  emergencyButtonPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.error[600],
    gap: 6,
    ...shadows.sm,
  },
  emergencyButtonPillText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.white,
  },
  bookButtonContainer: {
    flex: 1,
  },
  bookButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.neutral[900],
    alignItems: "center",
    justifyContent: "center",
  },
  bookButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.white,
  },
  serviceDescText: {
    fontSize: 13,
    color: colors.neutral[500],
    marginTop: 2,
    marginBottom: 4,
    lineHeight: 18,
  },
  emptyTabState: {
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    marginVertical: spacing.md,
  },
  emptyTabTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.neutral[800],
    marginTop: spacing.md,
  },
  emptyTabSubtitle: {
    fontSize: 13,
    color: colors.neutral[500],
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: spacing.lg,
    lineHeight: 18,
  },
  providerReplyBox: {
    marginTop: spacing.sm,
    backgroundColor: "#F0FDF4",
    padding: spacing.sm,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  replyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  replyAuthorText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary[700],
  },
  replyContentText: {
    fontSize: 13,
    color: colors.neutral[700],
    fontStyle: "italic",
    lineHeight: 18,
  },
});
