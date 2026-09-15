import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Button from "../../src/components/Button";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
} from "../../src/constants/theme";

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Text style={styles.featureIconText}>
          {icon === "search" ? "🔍" : icon === "alert" ? "🚨" : "🔧"}
        </Text>
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoText}>TH</Text>
            </View>
          </View>
          <Text style={styles.title}>TechTune Healer</Text>
          <Text style={styles.subtitle}>
            Your trusted partner for automotive care
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <FeatureItem
            icon="search"
            title="Find Mechanics"
            description="Locate trusted mechanics near you"
          />
          <FeatureItem
            icon="alert"
            title="Emergency Help"
            description="24/7 roadside assistance"
          />
          <FeatureItem
            icon="diagnostic"
            title="Smart Diagnostics"
            description="AI-powered car problem detection"
          />
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Button
            title="Get Started"
            onPress={() => router.push("/(auth)/role-selection")}
            variant="primary"
            size="large"
            fullWidth
          />
          <Button
            title="I already have an account"
            onPress={() => router.push("/(auth)/login")}
            variant="ghost"
            size="large"
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing["2xl"],
  },
  heroSection: {
    alignItems: "center",
    paddingTop: spacing["5xl"],
    paddingBottom: spacing["3xl"],
  },
  logoContainer: {
    marginBottom: spacing.lg,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primary[600],
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  title: {
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.neutral[500],
    textAlign: "center",
  },
  featuresSection: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.xl,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  featureIconText: {
    fontSize: 20,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[900],
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  actionsSection: {
    paddingBottom: spacing["3xl"],
    gap: spacing.md,
  },
});
