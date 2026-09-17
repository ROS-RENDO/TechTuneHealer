import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  service: string;
  reply?: string;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    customerName: 'John Smith',
    rating: 5,
    comment: 'Excellent service! Very professional and quick. My car runs perfectly now.',
    date: '2024-01-15',
    service: 'Oil Change',
    reply: 'Thank you for your kind words! We appreciate your business.',
  },
  {
    id: '2',
    customerName: 'Sarah Johnson',
    rating: 4,
    comment: 'Good work on the brake inspection. Only minor issue was the wait time.',
    date: '2024-01-14',
    service: 'Brake Inspection',
  },
  {
    id: '3',
    customerName: 'Mike Chen',
    rating: 5,
    comment: 'Best mechanic in the city! Fair prices and honest assessment.',
    date: '2024-01-12',
    service: 'Engine Diagnostics',
  },
  {
    id: '4',
    customerName: 'Emily Davis',
    rating: 3,
    comment: 'Service was okay, but took longer than expected.',
    date: '2024-01-10',
    service: 'Tire Rotation',
  },
  {
    id: '5',
    customerName: 'David Wilson',
    rating: 5,
    comment: 'Amazing attention to detail. Highly recommend!',
    date: '2024-01-08',
    service: 'AC Service',
  },
];

type FilterType = 'all' | '5' | '4' | '3' | '2' | '1';

export default function ReviewsScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const averageRating = 4.4;
  const totalReviews = MOCK_REVIEWS.length;

  const ratingDistribution = {
    5: 60,
    4: 25,
    3: 10,
    2: 3,
    1: 2,
  };

  const filteredReviews = MOCK_REVIEWS.filter((review) => {
    if (activeFilter === 'all') return true;
    return review.rating === parseInt(activeFilter);
  });

  const renderStars = (rating: number, size: number = 16) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={star <= rating ? colors.accent : colors.border}
          />
        ))}
      </View>
    );
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.customerInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.customerName.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.customerName}>{item.customerName}</Text>
            <Text style={styles.serviceText}>{item.service}</Text>
          </View>
        </View>
        <View style={styles.ratingInfo}>
          {renderStars(item.rating)}
          <Text style={styles.dateText}>
            {new Date(item.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>

      <Text style={styles.commentText}>{item.comment}</Text>

      {item.reply ? (
        <View style={styles.replyContainer}>
          <View style={styles.replyHeader}>
            <Ionicons name="chatbubble-outline" size={16} color={colors.primary[500]} />
            <Text style={styles.replyLabel}>Your Reply</Text>
          </View>
          <Text style={styles.replyText}>{item.reply}</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.replyButton}>
          <Ionicons name="chatbubble-outline" size={18} color={colors.primary[500]} />
          <Text style={styles.replyButtonText}>Reply</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reviews</Text>
      </View>

      <FlatList
        data={filteredReviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReviewItem}
        ListHeaderComponent={
          <>
            <View style={styles.summaryCard}>
              <View style={styles.summaryLeft}>
                <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
                {renderStars(Math.round(averageRating), 20)}
                <Text style={styles.totalReviews}>{totalReviews} reviews</Text>
              </View>
              <View style={styles.summaryRight}>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <View key={rating} style={styles.ratingRow}>
                    <Text style={styles.ratingNumber}>{rating}</Text>
                    <Ionicons name="star" size={12} color={colors.accent} />
                    <View style={styles.ratingBarContainer}>
                      <View
                        style={[
                          styles.ratingBar,
                          { width: `${ratingDistribution[rating as keyof typeof ratingDistribution]}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.ratingPercent}>
                      {ratingDistribution[rating as keyof typeof ratingDistribution]}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.filterContainer}>
              <FlatList
                horizontal
                data={['all', '5', '4', '3', '2', '1'] as FilterType[]}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      activeFilter === item && styles.filterChipActive,
                    ]}
                    onPress={() => setActiveFilter(item)}
                  >
                    {item !== 'all' && (
                      <Ionicons
                        name="star"
                        size={14}
                        color={activeFilter === item ? colors.white : colors.accent}
                      />
                    )}
                    <Text
                      style={[
                        styles.filterChipText,
                        activeFilter === item && styles.filterChipTextActive,
                      ]}
                    >
                      {item === 'all' ? 'All' : item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="star-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Reviews Yet</Text>
            <Text style={styles.emptyText}>
              Reviews from your customers will appear here
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
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
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.medium,
  },
  summaryLeft: {
    alignItems: 'center',
    paddingRight: spacing.lg,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: spacing.xs,
  },
  totalReviews: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryRight: {
    flex: 1,
    paddingLeft: spacing.lg,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingNumber: {
    ...typography.caption,
    color: colors.textSecondary,
    width: 12,
  },
  ratingBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
  },
  ratingBar: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  ratingPercent: {
    ...typography.caption,
    color: colors.textSecondary,
    width: 32,
    textAlign: 'right',
  },
  filterContainer: {
    marginBottom: spacing.md,
  },
  filterList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary[500],
  },
  filterChipText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.bodyBold,
    color: colors.primary[500],
  },
  customerName: {
    ...typography.bodyBold,
    color: colors.text,
  },
  serviceText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  ratingInfo: {
    alignItems: 'flex-end',
  },
  dateText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  commentText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  replyContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  replyLabel: {
    ...typography.caption,
    color: colors.primary[500],
    fontWeight: '600',
  },
  replyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  replyButtonText: {
    ...typography.body,
    color: colors.primary[500],
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
