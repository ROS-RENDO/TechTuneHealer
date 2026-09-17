import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useBookingStore } from "../../store";
import { colors, spacing, shadows } from "../../constants/theme";
import type { CustomerStackScreenProps } from "../../navigation/types";

export function ReviewCreateScreen() {
  const navigation = useNavigation<CustomerStackScreenProps<"ReviewCreate">["navigation"]>();
  const route = useRoute<CustomerStackScreenProps<"ReviewCreate">["route"]>();
  const { bookingId } = route.params;

  const { bookings } = useBookingStore();
  const booking = bookings.find((b) => b.id === bookingId);

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const handleSubmit = () => {
    // In a full app, this would call an API to submit the review
    navigation.goBack();
  };

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
          </TouchableOpacity>
        </View>
        <Text style={{ textAlign: "center", marginTop: 40 }}>Booking not found</Text>
      </SafeAreaView>
    );
  }

  const providerName = booking.provider?.businessName || booking.provider?.name || "the provider";

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leave a Review</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          
          <View style={styles.providerCard}>
            <View style={styles.providerAvatar}>
              <Text style={styles.providerAvatarText}>{providerName.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.providerName}>{providerName}</Text>
            <Text style={styles.serviceText}>For {booking.serviceType}</Text>
          </View>

          <View style={styles.ratingSection}>
            <Text style={styles.ratingTitle}>How was your experience?</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={40}
                    color={star <= rating ? colors.warning[500] : colors.neutral[300]}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingDescription}>
              {rating === 0 && "Tap a star to rate"}
              {rating === 1 && "Terrible"}
              {rating === 2 && "Poor"}
              {rating === 3 && "Fair"}
              {rating === 4 && "Good"}
              {rating === 5 && "Excellent"}
            </Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputTitle}>Share your thoughts (Optional)</Text>
            <TextInput
              style={styles.inputArea}
              placeholder="What did you like or dislike? How was the service?"
              placeholderTextColor={colors.neutral[400]}
              multiline
              textAlignVertical="top"
              value={review}
              onChangeText={setReview}
              maxLength={500}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            rating === 0 && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={rating === 0}
        >
          <Text style={styles.submitButtonText}>Submit Review</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.02)",
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  providerCard: {
    alignItems: "center",
    marginBottom: spacing["2xl"],
  },
  providerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  providerAvatarText: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.primary[700],
  },
  providerName: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.neutral[900],
    marginBottom: 4,
  },
  serviceText: {
    fontSize: 14,
    color: colors.neutral[500],
    fontWeight: "500",
  },
  ratingSection: {
    alignItems: "center",
    marginBottom: spacing["2xl"],
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    ...shadows.sm,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: spacing.lg,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  starButton: {
    padding: 4,
  },
  ratingDescription: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary[600],
  },
  inputSection: {
    marginBottom: spacing.xl,
  },
  inputTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  inputArea: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    height: 140,
    fontSize: 15,
    color: colors.neutral[900],
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    ...shadows.sm,
  },
  bottomBar: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  submitButton: {
    height: 56,
    backgroundColor: colors.neutral[900],
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: colors.neutral[300],
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
  },
});
