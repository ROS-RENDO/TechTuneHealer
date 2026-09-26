import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { AnimatedEntrance } from "../../components";
import { useVehicleStore } from "../../store/vehicleStore";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  shadows,
} from "../../constants/theme";
import type { CustomerStackScreenProps } from "../../navigation/types";

const YEARS = Array.from({ length: 30 }, (_, i) => 2026 - i);

const MAKES = [
  "Toyota",
  "Lexus",
  "Tesla",
  "Ford",
  "Honda",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Hyundai",
  "Kia",
  "Nissan",
  "Mazda",
  "Chevrolet",
  "Volkswagen",
  "Subaru",
  "Other",
];

const QUICK_PRESETS = [
  {
    name: "Lexus RX350",
    make: "Lexus",
    model: "RX350 Luxury AWD",
    year: "2024",
    licensePlate: "2A-8888",
    color: "Sonic Titanium",
    vin: "JTJBB31U872019482",
    badge: "Popular SUV",
  },
  {
    name: "Land Cruiser 300",
    make: "Toyota",
    model: "Land Cruiser 300 V6",
    year: "2024",
    licensePlate: "2C-9999",
    color: "Pearl White",
    vin: "JTMHY7AJ3M4019284",
    badge: "Off-Road 4x4",
  },
  {
    name: "Tesla Model Y",
    make: "Tesla",
    model: "Model Y Dual Motor AWD",
    year: "2024",
    licensePlate: "2E-7777",
    color: "Deep Blue Metallic",
    vin: "7SAYGDEE1PF829104",
    badge: "Electric EV",
  },
  {
    name: "Ford Ranger Raptor",
    make: "Ford",
    model: "Ranger Raptor 4x4",
    year: "2023",
    licensePlate: "2D-5555",
    color: "Code Orange",
    vin: "1FTER4EH2MLA81923",
    badge: "Performance Pickup",
  },
  {
    name: "Toyota Camry",
    make: "Toyota",
    model: "Camry Hybrid",
    year: "2023",
    licensePlate: "2B-1234",
    color: "Attitude Black",
    vin: "4T1B11HK5PU928172",
    badge: "Executive Sedan",
  },
  {
    name: "Maybach S680",
    make: "Mercedes-Benz",
    model: "Maybach S680 V12",
    year: "2024",
    licensePlate: "2X-1111",
    color: "Obsidian Black",
    vin: "WDD2231761A091823",
    badge: "Ultra Luxury",
  },
];

export function VehicleAddScreen() {
  const navigation =
    useNavigation<CustomerStackScreenProps<"VehicleAdd">["navigation"]>();
  const { addVehicle } = useVehicleStore();

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    licensePlate: "",
    color: "",
    vin: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showMakePicker, setShowMakePicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const applyPreset = (preset: (typeof QUICK_PRESETS)[0]) => {
    setFormData({
      make: preset.make,
      model: preset.model,
      year: preset.year,
      licensePlate: preset.licensePlate,
      color: preset.color,
      vin: preset.vin,
    });
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.make) newErrors.make = "Make is required";
    if (!formData.model) newErrors.model = "Model is required";
    if (!formData.year) newErrors.year = "Year is required";
    if (!formData.licensePlate)
      newErrors.licensePlate = "License plate is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await addVehicle({
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: Number(formData.year),
        plateNumber: formData.licensePlate.trim().toUpperCase(),
        licensePlate: formData.licensePlate.trim().toUpperCase(),
        color: formData.color.trim() || "Black",
        vin: formData.vin?.trim() || undefined,
      });

      Alert.alert(
        "Vehicle Added",
        `${formData.year} ${formData.make} ${formData.model} was successfully registered to your garage!`,
        [
          {
            text: "View My Vehicles",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch {
      Alert.alert("Error", "Failed to add vehicle. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Quick Presets Section */}
        <AnimatedEntrance delay={0} direction="down">
          <View style={styles.presetSection}>
            <View style={styles.presetHeader}>
              <Ionicons name="flash" size={16} color="#2563EB" />
              <Text style={styles.presetHeaderText}>1-TAP POPULAR VEHICLE PRESETS</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.presetScroll}
            >
              {QUICK_PRESETS.map((preset) => {
                const isSelected =
                  formData.make === preset.make && formData.model === preset.model;
                return (
                  <TouchableOpacity
                    key={preset.name}
                    style={[
                      styles.presetCard,
                      isSelected && styles.presetCardSelected,
                    ]}
                    onPress={() => applyPreset(preset)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.presetBadge}>
                      <Text style={styles.presetBadgeText}>{preset.badge}</Text>
                    </View>
                    <Text style={styles.presetName}>{preset.name}</Text>
                    <Text style={styles.presetPlate}>🇰🇭 {preset.licensePlate}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </AnimatedEntrance>

        {/* Vehicle Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.vehicleIcon}>
            <Ionicons name="car-sport" size={38} color={colors.primary[600]} />
          </View>
          <Text style={styles.formSectionTitle}>
            {formData.make ? `${formData.year || "2024"} ${formData.make} ${formData.model}` : "Custom Vehicle Registration"}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Make */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Make *</Text>
            <TouchableOpacity
              style={[
                styles.selectButton,
                errors.make && styles.selectButtonError,
              ]}
              onPress={() => setShowMakePicker(!showMakePicker)}
            >
              <Text
                style={[
                  styles.selectButtonText,
                  !formData.make && styles.selectButtonPlaceholder,
                ]}
              >
                {formData.make || "Select make"}
              </Text>
              <Ionicons
                name={showMakePicker ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.neutral[400]}
              />
            </TouchableOpacity>
            {errors.make && <Text style={styles.errorText}>{errors.make}</Text>}

            {showMakePicker && (
              <View style={styles.pickerDropdown}>
                <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                  {MAKES.map((make) => (
                    <TouchableOpacity
                      key={make}
                      style={[
                        styles.pickerItem,
                        formData.make === make && styles.pickerItemSelected,
                      ]}
                      onPress={() => {
                        updateField("make", make);
                        setShowMakePicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          formData.make === make &&
                            styles.pickerItemTextSelected,
                        ]}
                      >
                        {make}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Model */}
          <Input
            label="Model *"
            placeholder="e.g., RX350, Land Cruiser, Model Y"
            value={formData.model}
            onChangeText={(value) => updateField("model", value)}
            error={errors.model}
          />

          {/* Year */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Year *</Text>
            <TouchableOpacity
              style={[
                styles.selectButton,
                errors.year && styles.selectButtonError,
              ]}
              onPress={() => setShowYearPicker(!showYearPicker)}
            >
              <Text
                style={[
                  styles.selectButtonText,
                  !formData.year && styles.selectButtonPlaceholder,
                ]}
              >
                {formData.year || "Select year"}
              </Text>
              <Ionicons
                name={showYearPicker ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.neutral[400]}
              />
            </TouchableOpacity>
            {errors.year && <Text style={styles.errorText}>{errors.year}</Text>}

            {showYearPicker && (
              <View style={styles.pickerDropdown}>
                <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                  {YEARS.map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.pickerItem,
                        formData.year === year.toString() &&
                          styles.pickerItemSelected,
                      ]}
                      onPress={() => {
                        updateField("year", year.toString());
                        setShowYearPicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          formData.year === year.toString() &&
                            styles.pickerItemTextSelected,
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* License Plate */}
          <Input
            label="Cambodian License Plate *"
            placeholder="e.g., 2A-8888 or 2BC-1234"
            value={formData.licensePlate}
            onChangeText={(value) => updateField("licensePlate", value.toUpperCase())}
            error={errors.licensePlate}
            autoCapitalize="characters"
          />

          {/* Color */}
          <Input
            label="Color"
            placeholder="e.g., Sonic Titanium, White, Black"
            value={formData.color}
            onChangeText={(value) => updateField("color", value)}
          />

          {/* VIN */}
          <Input
            label="VIN (Optional)"
            placeholder="e.g., JTJBB31U872019482"
            value={formData.vin}
            onChangeText={(value) => updateField("vin", value)}
            autoCapitalize="characters"
          />
          <Text style={styles.helpText}>
            17-character Vehicle Identification Number
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <AnimatedEntrance delay={140} direction="up">
        <View style={styles.bottomActions}>
          <Button
            title={isLoading ? "Saving Vehicle…" : "Save Vehicle to Garage"}
            onPress={handleSave}
            loading={isLoading}
          />
        </View>
      </AnimatedEntrance>
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
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  presetSection: {
    marginBottom: spacing.md,
  },
  presetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  presetHeaderText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2563EB",
    letterSpacing: 0.8,
  },
  presetScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  presetCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 10,
    minWidth: 140,
  },
  presetCardSelected: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
    borderWidth: 1.5,
  },
  presetBadge: {
    backgroundColor: "#E2E8F0",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  presetBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#475569",
  },
  presetName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  presetPlate: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
    fontFamily: "monospace",
  },
  iconContainer: {
    alignItems: "center",
    marginVertical: spacing.md,
  },
  vehicleIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  formSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginTop: 8,
  },
  form: {
    gap: spacing.md,
  },
  fieldGroup: {
    position: "relative",
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    height: 52,
  },
  selectButtonError: {
    borderColor: colors.error[500],
  },
  selectButtonText: {
    fontSize: fontSize.base,
    color: colors.neutral[900],
  },
  selectButtonPlaceholder: {
    color: colors.neutral[400],
  },
  pickerDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xs,
    maxHeight: 200,
    zIndex: 100,
    ...shadows.lg,
  },
  pickerScroll: {
    maxHeight: 200,
  },
  pickerItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  pickerItemSelected: {
    backgroundColor: colors.primary[50],
  },
  pickerItemText: {
    fontSize: fontSize.base,
    color: colors.neutral[700],
  },
  pickerItemTextSelected: {
    color: colors.primary[700],
    fontWeight: fontWeight.medium,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error[500],
    marginTop: spacing.xs,
  },
  helpText: {
    fontSize: fontSize.sm,
    color: colors.neutral[400],
    marginTop: -spacing.md,
  },
  bottomActions: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
});
