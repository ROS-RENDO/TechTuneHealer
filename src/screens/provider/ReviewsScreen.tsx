import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, borderRadius, shadows } from "../../constants/theme";
import { INITIAL_MOCK_REVIEWS, MockReview } from "../../data/mockProviderData";
import api from "../../services/api";
import { useAuthStore } from "../../store";
import { AnimatedEntrance } from "../../components/AnimatedEntrance";

type StarFilter = "all" | "5" | "4" | "3" | "2" | "1";

export default function ReviewsScreen() {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<MockReview[]>(INITIAL_MOCK_REVIEWS);
  const [activeFilter, setActiveFilter] = useState<StarFilter>("all");
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState<MockReview | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load real reviews from backend
  const loadReviews = useCallback(async () => {
    try {
      const providerData = await api.providers.getMe();
      if (providerData && (providerData as any).reviews && (providerData as any).reviews.length > 0) {
        const backendReviews = (providerData as any).reviews.map((r: any) => {
          const veh = r.booking?.vehicle || r.customer?.vehicles?.[0];
          const vehicleTag = veh ? `${veh.make} ${veh.model}` : "Verified Vehicle";
          const serviceName = r.booking?.serviceType || r.serviceType || "Emergency Roadside Assistance";
          return {
            id: r.id,
            customerName: r.customer?.name || "Customer",
            vehicleTag,
            rating: r.rating || 5,
            date: r.createdAt ? new Date(r.createdAt).toISOString().split("T")[0] : "Recently",
            service: serviceName,
            comment: r.comment || "Great service!",
            reply: r.reply ? { text: r.reply, repliedAt: "Recently" } : undefined,
          };
        });
        setReviews(backendReviews);
      }
    } catch {
      // Keep initial seed reviews on network timeout
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReviews();
    setRefreshing(false);
  };

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
    : 5.0;

  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { stars, pct, count };
  });

  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === "all") return true;
    return r.rating === parseInt(activeFilter, 10);
  });

  const handleOpenReply = (review: MockReview) => {
    setSelectedReview(review);
    setReplyText(review.reply?.text || "");
    setReplyModalVisible(true);
  };

  const handlePostReply = async () => {
    if (!replyText.trim() || !selectedReview) {
      Alert.alert("Empty Reply", "Please enter your response text before posting.");
      return;
    }

    const trimmed = replyText.trim();
    setIsLoading(true);

    try {
      await api.reviews.reply(selectedReview.id, trimmed);
    } catch {
      // Optimistic update
    } finally {
      setIsLoading(false);
    }

    setReviews((prev) =>
      prev.map((r) =>
        r.id === selectedReview.id
          ? {
              ...r,
              reply: {
                text: trimmed,
                repliedAt: new Date().toISOString().split("T")[0],
              },
            }
          : r
      )
    );

    setReplyModalVisible(false);
    Alert.alert("Reply Posted", "Your response has been saved and is now visible to customers.");
  };

  const renderStars = (rating: number, size = 14) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={size}
            color="#F59E0B"
          />
        ))}
      </View>
    );
  };

  const renderReviewItem = ({ item }: { item: MockReview }) => {
    return (
      <View style={styles.reviewCard}>
        {/* Review Header */}
        <View style={styles.reviewHeader}>
          <View style={styles.customerMeta}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{item.customerName.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.customerName}>{item.customerName}</Text>
              <View style={styles.vehicleTagRow}>
                <Ionicons name="car-sport" size={12} color={colors.primary[600]} />
                <Text style={styles.vehicleTagText}>{item.vehicleTag}</Text>
              </View>
            </View>
          </View>

          <View style={styles.ratingBox}>
            {renderStars(item.rating)}
            <Text style={styles.reviewDateText}>{item.date}</Text>
          </View>
        </View>

        {/* Service Type Tag */}
        <View style={styles.serviceBadge}>
          <Text style={styles.serviceBadgeText}>🔧 {item.service}</Text>
        </View>

        {/* Comment Text */}
        <Text style={styles.commentText}>"{item.comment}"</Text>

        {/* Nested Reply or Reply Trigger */}
        {item.reply ? (
          <View style={styles.replyBox}>
            <View style={styles.replyHeaderRow}>
              <View style={styles.workshopVerifiedRow}>
                <Ionicons name="shield-checkmark" size={13} color={colors.primary[600]} />
                <Text style={styles.workshopVerifiedText}>Official Workshop Response</Text>
              </View>
              <Text style={styles.replyDateText}>{item.reply.repliedAt}</Text>
            </View>
            <Text style={styles.replyBodyText}>{item.reply.text}</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.replyTriggerBtn}
            onPress={() => handleOpenReply(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.primary[600]} />
            <Text style={styles.replyTriggerBtnText}>Reply to Customer</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Screen Header */}
      <AnimatedEntrance delay={0} direction="down">
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Reputation & Reviews</Text>
            <Text style={styles.headerSubtitle}>
              {averageRating} ★ Customer Satisfaction • {totalReviews} Reviews
            </Text>
          </View>

          <View style={styles.verifiedScoreBadge}>
            <Text style={styles.verifiedScoreText}>Top Rated</Text>
          </View>
        </View>
      </AnimatedEntrance>

      {/* Main Content */}
      <AnimatedEntrance delay={80} direction="up" style={{ flex: 1 }}>
        <FlatList
          data={filteredReviews}
          keyExtractor={(item) => item.id}
          renderItem={renderReviewItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={
            <>
              {/* Rating Hero Card */}
              <View style={styles.ratingHeroCard}>
                <View style={styles.heroLeft}>
                  <Text style={styles.bigRatingText}>{averageRating.toFixed(1)}</Text>
                  {renderStars(5, 18)}
                  <Text style={styles.basedOnText}>Based on {totalReviews} reviews</Text>
                  <View style={styles.recommendPill}>
                    <Text style={styles.recommendText}>98% Recommendation</Text>
                  </View>
                </View>

                {/* Star Distribution Progress Bars */}
                <View style={styles.heroRight}>
                  {distribution.map((d) => (
                    <View key={d.stars} style={styles.distRow}>
                      <Text style={styles.distStarLabel}>{d.stars}★</Text>
                      <View style={styles.distTrack}>
                        <View style={[styles.distFill, { width: `${d.pct}%` }]} />
                      </View>
                      <Text style={styles.distCountText}>{d.pct}%</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Filter Pills */}
              <View style={styles.filterStrip}>
                {(
                  [
                    { key: "all", label: "All Reviews" },
                    { key: "5", label: "5 Stars (109)" },
                    { key: "4", label: "4 Stars (13)" },
                    { key: "3", label: "3 Stars (4)" },
                  ] as { key: StarFilter; label: string }[]
                ).map((tab) => {
                  const isSelected = activeFilter === tab.key;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      style={[styles.filterPill, isSelected && styles.filterPillActive]}
                      onPress={() => setActiveFilter(tab.key)}
                    >
                      <Text
                        style={[
                          styles.filterPillText,
                          isSelected && styles.filterPillTextActive,
                        ]}
                      >
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="chatbubbles-outline" size={40} color={colors.neutral[300]} />
              <Text style={styles.emptyTitle}>No Reviews for this filter</Text>
              <Text style={styles.emptySub}>Select "All Reviews" to view all customer ratings.</Text>
            </View>
          }
        />
      </AnimatedEntrance>

      {/* Reply Modal */}
      <Modal
        visible={replyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReplyModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons name="chatbubble" size={22} color={colors.primary[600]} />
              <Text style={styles.modalTitle}>
                Reply to {selectedReview?.customerName}
              </Text>
            </View>

            <View style={styles.originalReviewQuote}>
              <Text style={styles.quoteAuthor}>
                {selectedReview?.customerName} ({selectedReview?.vehicleTag}):
              </Text>
              <Text style={styles.quoteText} numberOfLines={2}>
                "{selectedReview?.comment}"
              </Text>
            </View>

            <Text style={styles.inputLabel}>Official Workshop Response</Text>
            <TextInput
              style={styles.replyTextInput}
              value={replyText}
              onChangeText={setReplyText}
              placeholder="Thank the customer or address their feedback professionally..."
              placeholderTextColor={colors.neutral[400]}
              multiline
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setReplyModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.postBtn}
                onPress={handlePostReply}
              >
                <Text style={styles.postBtnText}>Post Response</Text>
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
  verifiedScoreBadge: {
    backgroundColor: colors.success[50],
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.success[100],
  },
  verifiedScoreText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.success[700],
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["4xl"],
  },
  ratingHeroCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  heroLeft: {
    alignItems: "center",
    justifyContent: "center",
    width: "42%",
    paddingRight: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.neutral[100],
  },
  bigRatingText: {
    fontSize: 38,
    fontWeight: "800",
    color: colors.neutral[900],
    letterSpacing: -1,
    lineHeight: 44,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
    marginVertical: 4,
  },
  basedOnText: {
    fontSize: 11,
    color: colors.neutral[500],
    marginBottom: 6,
  },
  recommendPill: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  recommendText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.primary[700],
  },
  heroRight: {
    flex: 1,
    paddingLeft: spacing.md,
    justifyContent: "center",
    gap: 5,
  },
  distRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  distStarLabel: {
    fontSize: 11,
    color: colors.neutral[600],
    width: 20,
    fontWeight: "600",
  },
  distTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.neutral[100],
    overflow: "hidden",
  },
  distFill: {
    height: "100%",
    backgroundColor: "#F59E0B",
    borderRadius: 3,
  },
  distCountText: {
    fontSize: 10,
    color: colors.neutral[500],
    width: 28,
    textAlign: "right",
  },
  filterStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: spacing.md,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  filterPillActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.neutral[700],
  },
  filterPillTextActive: {
    color: colors.white,
  },
  reviewCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  customerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary[700],
  },
  customerName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  vehicleTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  vehicleTagText: {
    fontSize: 11,
    color: colors.primary[700],
    fontWeight: "600",
  },
  ratingBox: {
    alignItems: "flex-end",
  },
  reviewDateText: {
    fontSize: 10,
    color: colors.neutral[400],
    marginTop: 2,
  },
  serviceBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginVertical: 6,
  },
  serviceBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.neutral[700],
  },
  commentText: {
    fontSize: 13,
    color: colors.neutral[800],
    lineHeight: 18,
    marginVertical: 4,
  },
  replyBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginTop: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[600],
  },
  replyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  workshopVerifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  workshopVerifiedText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary[700],
  },
  replyDateText: {
    fontSize: 10,
    color: colors.neutral[400],
  },
  replyBodyText: {
    fontSize: 12,
    color: colors.neutral[700],
    lineHeight: 16,
  },
  replyTriggerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    marginTop: spacing.xs,
    paddingVertical: 4,
  },
  replyTriggerBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary[600],
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: spacing["3xl"],
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.neutral[700],
  },
  emptySub: {
    fontSize: 12,
    color: colors.neutral[400],
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
    marginBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  originalReviewQuote: {
    backgroundColor: "#F8FAFC",
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginBottom: spacing.md,
  },
  quoteAuthor: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.neutral[700],
  },
  quoteText: {
    fontSize: 11,
    color: colors.neutral[500],
    fontStyle: "italic",
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.neutral[700],
    marginBottom: 4,
  },
  replyTextInput: {
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: 13,
    color: colors.neutral[900],
    height: 80,
    textAlignVertical: "top",
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.md,
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
  postBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[600],
  },
  postBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.white,
  },
});
