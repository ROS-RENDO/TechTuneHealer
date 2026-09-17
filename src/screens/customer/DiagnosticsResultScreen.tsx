import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
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

// Mock diagnostic results based on symptoms
const DIAGNOSTIC_RESULTS: Record<
  string,
  {
    severity: "low" | "medium" | "high";
    possibleCauses: string[];
    suggestedActions: string[];
    estimatedCost: string;
  }
> = {
  engine_noise: {
    severity: "medium",
    possibleCauses: [
      "Worn timing belt or chain",
      "Low oil level",
      "Faulty spark plugs",
      "Loose or damaged belt",
    ],
    suggestedActions: [
      "Check oil level immediately",
      "Listen for where the noise is coming from",
      "Avoid driving until diagnosed by a mechanic",
    ],
    estimatedCost: "$50 - $500",
  },
  brake_squeal: {
    severity: "medium",
    possibleCauses: [
      "Worn brake pads",
      "Glazed brake rotors",
      "Moisture on brakes (temporary)",
      "Faulty brake hardware",
    ],
    suggestedActions: [
      "Have brake pads inspected",
      "Check brake fluid level",
      "Schedule a brake inspection soon",
    ],
    estimatedCost: "$100 - $300",
  },
  battery_dead: {
    severity: "high",
    possibleCauses: [
      "Old battery (3+ years)",
      "Faulty alternator",
      "Parasitic drain",
      "Corroded battery terminals",
    ],
    suggestedActions: [
      "Jump start the vehicle",
      "Clean battery terminals",
      "Test battery and alternator",
      "Replace battery if necessary",
    ],
    estimatedCost: "$100 - $350",
  },
};

export function DiagnosticsResultScreen() {
  const navigation =
    useNavigation<
      CustomerStackScreenProps<"DiagnosticsResult">["navigation"]
    >();
  const route =
    useRoute<CustomerStackScreenProps<"DiagnosticsResult">["route"]>();
  const { symptomIds } = route.params;

  // Get diagnostic info for selected symptoms
  const results = symptomIds
    .map((id) => ({
      symptomId: id,
      ...DIAGNOSTIC_RESULTS[id],
    }))
    .filter((r) => r.possibleCauses);

  const getSeverityColor = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "low":
        return {
          bg: colors.success[50],
          text: colors.success[700],
          border: colors.success[100],
        };
      case "medium":
        return {
          bg: colors.warning[50],
          text: colors.warning[700],
          border: colors.warning[100],
        };
      case "high":
        return {
          bg: colors.error[50],
          text: colors.error[700],
          border: colors.error[100],
        };
    }
  };

  const getSeverityLabel = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "low":
        return "Low Priority";
      case "medium":
        return "Medium Priority";
      case "high":
        return "High Priority";
    }
  };

  const overallSeverity = results.some((r) => r.severity === "high")
    ? "high"
    : results.some((r) => r.severity === "medium")
      ? "medium"
      : "low";

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overall Assessment */}
        <View
          style={[
            styles.assessmentCard,
            { backgroundColor: getSeverityColor(overallSeverity).bg },
          ]}
        >
          <View style={styles.assessmentIcon}>
            <Ionicons
              name={
                overallSeverity === "high"
                  ? "warning"
                  : overallSeverity === "medium"
                    ? "alert-circle"
                    : "checkmark-circle"
              }
              size={40}
              color={getSeverityColor(overallSeverity).text}
            />
          </View>
          <Text
            style={[
              styles.assessmentTitle,
              { color: getSeverityColor(overallSeverity).text },
            ]}
          >
            {overallSeverity === "high"
              ? "Immediate Attention Needed"
              : overallSeverity === "medium"
                ? "Schedule Service Soon"
                : "Minor Issue Detected"}
          </Text>
          <Text style={styles.assessmentSubtitle}>
            Based on {symptomIds.length} symptom
            {symptomIds.length > 1 ? "s" : ""} you reported
          </Text>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.neutral[500]}
          />
          <Text style={styles.disclaimerText}>
            This is an AI-based preliminary assessment. For accurate diagnosis,
            please consult a certified mechanic.
          </Text>
        </View>

        {/* Results */}
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>Diagnostic Results</Text>

          {results.length > 0 ? (
            results.map((result, index) => {
              const severityColors = getSeverityColor(result.severity);
              return (
                <View key={index} style={styles.resultCard}>
                  {/* Header */}
                  <View style={styles.resultHeader}>
                    <View
                      style={[
                        styles.severityBadge,
                        { backgroundColor: severityColors.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.severityText,
                          { color: severityColors.text },
                        ]}
                      >
                        {getSeverityLabel(result.severity)}
                      </Text>
                    </View>
                    <Text style={styles.estimatedCost}>
                      Est. {result.estimatedCost}
                    </Text>
                  </View>

                  {/* Possible Causes */}
                  <View style={styles.resultSection}>
                    <Text style={styles.resultSectionTitle}>
                      Possible Causes
                    </Text>
                    {result.possibleCauses.map((cause, i) => (
                      <View key={i} style={styles.listItem}>
                        <View style={styles.bullet} />
                        <Text style={styles.listItemText}>{cause}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Suggested Actions */}
                  <View style={styles.resultSection}>
                    <Text style={styles.resultSectionTitle}>
                      Suggested Actions
                    </Text>
                    {result.suggestedActions.map((action, i) => (
                      <View key={i} style={styles.listItem}>
                        <View style={styles.actionNumber}>
                          <Text style={styles.actionNumberText}>{i + 1}</Text>
                        </View>
                        <Text style={styles.listItemText}>{action}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.noResultsCard}>
              <Ionicons
                name="search-outline"
                size={48}
                color={colors.neutral[300]}
              />
              <Text style={styles.noResultsText}>
                No diagnostic information available for selected symptoms
              </Text>
            </View>
          )}
        </View>

        {/* Quick Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Quick Tips</Text>
          <View style={styles.tipsGrid}>
            <View style={styles.tipCard}>
              <Ionicons
                name="car-outline"
                size={24}
                color={colors.primary[600]}
              />
              <Text style={styles.tipText}>Don&apos;t ignore warning lights</Text>
            </View>
            <View style={styles.tipCard}>
              <Ionicons
                name="calendar-outline"
                size={24}
                color={colors.primary[600]}
              />
              <Text style={styles.tipText}>
                Regular maintenance prevents issues
              </Text>
            </View>
            <View style={styles.tipCard}>
              <Ionicons
                name="document-text-outline"
                size={24}
                color={colors.primary[600]}
              />
              <Text style={styles.tipText}>Keep service records</Text>
            </View>
            <View style={styles.tipCard}>
              <Ionicons
                name="shield-checkmark-outline"
                size={24}
                color={colors.primary[600]}
              />
              <Text style={styles.tipText}>Use trusted mechanics</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.neutral[700]} />
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.primaryButtonContainer}>
          <Button
            title="Find a Mechanic"
            onPress={() =>
              navigation.navigate("CustomerTabs", { screen: "Search" })
            }
            variant="primary"
            size="large"
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
  assessmentCard: {
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing["2xl"],
    alignItems: "center",
  },
  assessmentIcon: {
    marginBottom: spacing.md,
  },
  assessmentTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    textAlign: "center",
  },
  assessmentSubtitle: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
    marginTop: spacing.xs,
    textAlign: "center",
  },
  disclaimerCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.neutral[100],
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  disclaimerText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.neutral[600],
    lineHeight: 18,
  },
  resultsSection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.lg,
  },
  resultCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  severityBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  severityText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  estimatedCost: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary[600],
  },
  resultSection: {
    marginBottom: spacing.lg,
  },
  resultSectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[500],
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.neutral[400],
    marginTop: 6,
  },
  actionNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
  },
  actionNumberText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primary[600],
  },
  listItemText: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.neutral[700],
    lineHeight: 22,
  },
  noResultsCard: {
    alignItems: "center",
    padding: spacing["3xl"],
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
  },
  noResultsText: {
    fontSize: fontSize.base,
    color: colors.neutral[500],
    textAlign: "center",
    marginTop: spacing.md,
  },
  tipsSection: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  tipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  tipCard: {
    width: "47%",
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  tipText: {
    fontSize: fontSize.sm,
    color: colors.neutral[700],
    textAlign: "center",
    lineHeight: 18,
  },
  bottomActions: {
    flexDirection: "row",
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    gap: spacing.md,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[100],
    gap: spacing.xs,
  },
  secondaryButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
  },
  primaryButtonContainer: {
    flex: 1,
  },
});
