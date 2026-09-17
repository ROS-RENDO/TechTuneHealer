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
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  shadows,
} from "../../constants/theme";
import type { CustomerStackScreenProps } from "../../navigation/types";

const YEARS = Array.from({ length: 30 }, (_, i) => 2025 - i);

const MAKES = [
  "Toyota",
  "Honda",
  "Ford",
  "Chevrolet",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Volkswagen",
  "Hyundai",
  "Kia",
  "Nissan",
  "Mazda",
  "Subaru",
  "Lexus",
  "Other",
];

export function VehicleAddScreen() {
  const navigation =
    useNavigation<CustomerStackScreenProps<"VehicleAdd">["navigation"]>();

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
      // TODO: Implement API call to save vehicle
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert("Success", "Vehicle added successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
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
        {/* Vehicle Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.vehicleIcon}>
            <Ionicons name="car-sport" size={48} color={colors.primary[600]} />
          </View>
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
            placeholder="Enter model (e.g., Camry)"
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
            label="License Plate *"
            placeholder="Enter license plate"
            value={formData.licensePlate}
            onChangeText={(value) =>
              updateField("licensePlate", value.toUpperCase())
            }
            autoCapitalize="characters"
            error={errors.licensePlate}
          />

          {/* Color */}
          <Input
            label="Color"
            placeholder="Enter color (optional)"
            value={formData.color}
            onChangeText={(value) => updateField("color", value)}
          />

          {/* VIN */}
          <Input
            label="VIN Number"
            placeholder="Enter VIN (optional)"
            value={formData.vin}
            onChangeText={(value) => updateField("vin", value.toUpperCase())}
            autoCapitalize="characters"
            maxLength={17}
          />
          <Text style={styles.helpText}>
            17-character Vehicle Identification Number
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Button
          title="Add Vehicle"
          onPress={handleSave}
          variant="primary"
          size="large"
          loading={isLoading}
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
  },
  contentContainer: {
    padding: spacing.xl,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: spacing["2xl"],
  },
  vehicleIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  form: {
    gap: spacing.lg,
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
