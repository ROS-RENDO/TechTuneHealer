import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "../store/languageStore";
import { colors, borderRadius } from "../constants/theme";

interface LanguageToggleProps {
  compact?: boolean;
  variant?: "pill" | "button" | "row";
}

export function LanguageToggle({ compact = false, variant = "pill" }: LanguageToggleProps) {
  const { language, setLanguage } = useTranslation();

  const handleToggle = () => {
    setLanguage(language === "en" ? "km" : "en");
  };

  if (variant === "button") {
    return (
      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={handleToggle}
        activeOpacity={0.75}
        accessibilityLabel="Toggle Language English / Khmer"
      >
        <Text style={styles.flagEmoji}>{language === "en" ? "🇺🇸" : "🇰🇭"}</Text>
        <Text style={styles.buttonText}>{language === "en" ? "EN" : "ខ្មែរ"}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.pillContainer, compact && styles.compactPill]}>
      <TouchableOpacity
        style={[
          styles.pillSegment,
          language === "en" && styles.pillSegmentActive,
          compact && styles.compactSegment,
        ]}
        onPress={() => setLanguage("en")}
        activeOpacity={0.8}
      >
        <Text style={[styles.pillText, language === "en" && styles.pillTextActive]}>
          EN
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.pillSegment,
          language === "km" && styles.pillSegmentActive,
          compact && styles.compactSegment,
        ]}
        onPress={() => setLanguage("km")}
        activeOpacity={0.8}
      >
        <Text style={[styles.pillText, language === "km" && styles.pillTextActive]}>
          ខ្មែរ
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  pillContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: borderRadius.full,
    padding: 2,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  compactPill: {
    padding: 1.5,
  },
  pillSegment: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  compactSegment: {
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  pillSegmentActive: {
    backgroundColor: colors.primary[600],
    shadowColor: colors.primary[600],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  pillTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 4,
  },
  flagEmoji: {
    fontSize: 12,
  },
  buttonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0F172A",
  },
});
