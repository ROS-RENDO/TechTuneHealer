import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../src/components/Button";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  shadows,
} from "../../src/constants/theme";

type Role = "customer" | "provider";

interface RoleCardProps {
  title: string;
  description: string;
  icon: string;
  isSelected: boolean;
  onPress: () => void;
}

function RoleCard({
  title,
  description,
  icon,
  isSelected,
  onPress,
}: RoleCardProps) {
  return (
    <TouchableOpacity
      style={[styles.roleCard, isSelected && styles.roleCardSelected]}
      onPress={onPress}
    >
      <View style={styles.roleCardContent}>
        <Ionicons
          name={icon as any}
          size={32}
          color={isSelected ? colors.primary[600] : colors.neutral[400]}
        />
        <Text
          style={[styles.roleTitle, isSelected && styles.roleTitleSelected]}
        >
          {title}
        </Text>
        <Text style={styles.roleDescription}>{description}</Text>
      </View>
      <View
        style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}
      >
        {isSelected && (
          <Ionicons name="checkmark" size={16} color={colors.white} />
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function RoleSelectionScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      router.push({
        pathname: "/(auth)/register",
        params: { role: selectedRole },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>How will you use TechTune?</Text>
          <Text style={styles.subtitle}>
            Select your account type to get started
          </Text>
        </View>

        {/* Role Options */}
        <View style={styles.optionsContainer}>
          <RoleCard
            title="Car Owner"
            description="Find mechanics, book services, and get help with car problems"
            icon="car-sport-outline"
            isSelected={selectedRole === "customer"}
            onPress={() => setSelectedRole("customer")}
          />
          <RoleCard
            title="Service Provider"
            description="Offer repair services, manage bookings, and grow your business"
            icon="cog-outline"
            isSelected={selectedRole === "provider"}
            onPress={() => setSelectedRole("provider")}
          />
        </View>

        {/* Action Button */}
        <Button
          title="Continue"
          onPress={handleContinue}
          variant="primary"
          size="large"
          fullWidth
          disabled={!selectedRole}
        />
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
    paddingVertical: spacing.lg,
  },
  header: {
    marginBottom: spacing["2xl"],
  },
  backButton: {
    padding: spacing.md,
    marginLeft: -spacing.md,
  },
  titleSection: {
    marginBottom: spacing["3xl"],
  },
  title: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.neutral[500],
  },
  optionsContainer: {
    flex: 1,
    gap: spacing.lg,
    marginBottom: spacing["2xl"],
  },
  roleCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    padding: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  roleCardSelected: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  roleCardContent: {
    flex: 1,
  },
  roleTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[900],
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  roleTitleSelected: {
    color: colors.primary[600],
  },
  roleDescription: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircleSelected: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[600],
  },
});
