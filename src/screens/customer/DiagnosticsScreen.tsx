import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/Button";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  shadows,
} from "../../constants/theme";
import type { CustomerStackScreenProps } from "../../navigation/types";

const SYMPTOM_CATEGORIES = [
  {
    id: "engine",
    title: "Engine",
    icon: "speedometer-outline",
    symptoms: [
      { id: "engine_noise", label: "Strange engine noise" },
      { id: "engine_shake", label: "Engine shaking or vibrating" },
      { id: "engine_stall", label: "Engine stalling" },
      { id: "hard_start", label: "Hard to start" },
      { id: "power_loss", label: "Loss of power" },
    ],
  },
  {
    id: "brakes",
    title: "Brakes",
    icon: "disc-outline",
    symptoms: [
      { id: "brake_squeal", label: "Squealing when braking" },
      { id: "brake_soft", label: "Soft or spongy brake pedal" },
      { id: "brake_pull", label: "Car pulls to one side" },
      { id: "brake_vibrate", label: "Vibration when braking" },
    ],
  },
  {
    id: "steering",
    title: "Steering",
    icon: "navigate-circle-outline",
    symptoms: [
      { id: "steering_noise", label: "Noise when turning" },
      { id: "steering_hard", label: "Hard to turn wheel" },
      { id: "steering_shake", label: "Wheel shakes while driving" },
      { id: "steering_pull", label: "Car drifts or pulls" },
    ],
  },
  {
    id: "electrical",
    title: "Electrical",
    icon: "flash-outline",
    symptoms: [
      { id: "battery_dead", label: "Battery not charging" },
      { id: "lights_dim", label: "Dim lights" },
      { id: "warning_lights", label: "Dashboard warning lights" },
      { id: "ac_not_working", label: "AC not working" },
    ],
  },
  {
    id: "fluids",
    title: "Fluids & Leaks",
    icon: "water-outline",
    symptoms: [
      { id: "oil_leak", label: "Oil leak" },
      { id: "coolant_leak", label: "Coolant leak" },
      { id: "low_oil", label: "Low oil warning" },
      { id: "overheating", label: "Engine overheating" },
    ],
  },
  {
    id: "tires",
    title: "Tires & Wheels",
    icon: "ellipse-outline",
    symptoms: [
      { id: "flat_tire", label: "Flat tire" },
      { id: "tire_wear", label: "Uneven tire wear" },
      { id: "wheel_noise", label: "Wheel noise" },
      { id: "tire_pressure", label: "Low tire pressure warning" },
    ],
  },
];

export function DiagnosticsScreen() {
  const navigation =
    useNavigation<CustomerStackScreenProps<"Diagnostics">["navigation"]>();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((id) => id !== symptomId)
        : [...prev, symptomId],
    );
  };

  const handleDiagnose = () => {
    navigation.navigate("DiagnosticsResult", { symptomIds: selectedSymptoms });
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons
              name="medical-outline"
              size={28}
              color={colors.primary[600]}
            />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Car Symptom Checker</Text>
            <Text style={styles.infoSubtitle}>
              Select the symptoms you&apos;re experiencing and get instant diagnostic
              suggestions
            </Text>
          </View>
        </View>

        {/* AI Photo Scan Section */}
        <View style={styles.aiScanSection}>
          <Text style={styles.sectionTitle}>AI Photo Scanner</Text>
          <Text style={styles.sectionSubtitle}>Take a photo of the damaged part or warning light and let AI diagnose it instantly.</Text>
          <Button 
            title="Scan with AI" 
            variant="outline" 
            onPress={() => navigation.navigate("AiDiagnosisResult" as never)} 
          />
        </View>

        {/* Symptom Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Select Symptoms</Text>

          {SYMPTOM_CATEGORIES.map((category) => (
            <View key={category.id} style={styles.categoryCard}>
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => toggleCategory(category.id)}
              >
                <View style={styles.categoryLeft}>
                  <View style={styles.categoryIcon}>
                    <Ionicons
                      name={category.icon as any}
                      size={22}
                      color={colors.primary[600]}
                    />
                  </View>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                </View>
                <View style={styles.categoryRight}>
                  {category.symptoms.some((s) =>
                    selectedSymptoms.includes(s.id),
                  ) && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>
                        {
                          category.symptoms.filter((s) =>
                            selectedSymptoms.includes(s.id),
                          ).length
                        }
                      </Text>
                    </View>
                  )}
                  <Ionicons
                    name={
                      expandedCategory === category.id
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={20}
                    color={colors.neutral[400]}
                  />
                </View>
              </TouchableOpacity>

              {expandedCategory === category.id && (
                <View style={styles.symptomsList}>
                  {category.symptoms.map((symptom) => {
                    const isSelected = selectedSymptoms.includes(symptom.id);
                    return (
                      <TouchableOpacity
                        key={symptom.id}
                        style={styles.symptomItem}
                        onPress={() => toggleSymptom(symptom.id)}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            isSelected && styles.checkboxSelected,
                          ]}
                        >
                          {isSelected && (
                            <Ionicons
                              name="checkmark"
                              size={14}
                              color={colors.white}
                            />
                          )}
                        </View>
                        <Text
                          style={[
                            styles.symptomLabel,
                            isSelected && styles.symptomLabelSelected,
                          ]}
                        >
                          {symptom.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Selected Summary */}
        {selectedSymptoms.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>
              {selectedSymptoms.length} symptom
              {selectedSymptoms.length > 1 ? "s" : ""} selected
            </Text>
            <TouchableOpacity onPress={() => setSelectedSymptoms([])}>
              <Text style={styles.clearText}>Clear all</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomActions}>
        <Button
          title={`Diagnose${selectedSymptoms.length > 0 ? ` (${selectedSymptoms.length})` : ""}`}
          onPress={handleDiagnose}
          variant="primary"
          size="large"
          disabled={selectedSymptoms.length === 0}
        />
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
  infoCard: {
    flexDirection: "row",
    backgroundColor: colors.primary[50],
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  infoIconContainer: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.primary[900],
  },
  infoSubtitle: {
    fontSize: fontSize.sm,
    color: colors.primary[700],
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  aiScanSection: {
    padding: spacing.lg,
    paddingTop: 0,
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  sectionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  categoriesSection: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.lg,
  },
  categoryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    overflow: "hidden",
    ...shadows.sm,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  categoryTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[900],
  },
  categoryRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  selectedBadge: {
    backgroundColor: colors.primary[600],
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  symptomsList: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    paddingVertical: spacing.sm,
  },
  symptomItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  symptomLabel: {
    fontSize: fontSize.base,
    color: colors.neutral[700],
  },
  symptomLabelSelected: {
    color: colors.primary[700],
    fontWeight: fontWeight.medium,
  },
  summaryCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  summaryTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.neutral[900],
  },
  clearText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.error[600],
  },
  bottomActions: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
});
