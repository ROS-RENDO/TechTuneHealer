import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Input from "../../src/components/Input";
import Button from "../../src/components/Button";
import { useAuthStore } from "../../src/store";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
} from "../../src/constants/theme";

export default function RegisterScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: string }>();
  const { register, isLoading } = useAuthStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreeTerms, setAgreeTerms] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!agreeTerms) {
      newErrors.terms = "You must agree to the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      const userRole = (role as "customer" | "provider") || "customer";
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: userRole,
      });
      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => router.replace("/(auth)/login") },
      ]);
    } catch {
      Alert.alert(
        "Registration Failed",
        "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.neutral[900]}
              />
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>
              Sign up to get started with TechTune Healer
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={(value) => updateField("name", value)}
              autoCapitalize="words"
              autoComplete="name"
              error={errors.name}
            />

            <Input
              label="Email"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(value) => updateField("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email}
            />

            <Input
              label="Phone Number"
              placeholder="+855 XX XXX XXXX"
              value={formData.phone}
              onChangeText={(value) => updateField("phone", value)}
              keyboardType="phone-pad"
              autoComplete="tel"
              error={errors.phone}
            />

            <Input
              label="Password"
              placeholder="Create a password"
              value={formData.password}
              onChangeText={(value) => updateField("password", value)}
              secureTextEntry={!showPassword}
              error={errors.password}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.neutral[400]}
                  />
                </TouchableOpacity>
              }
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={(value) => updateField("confirmPassword", value)}
              secureTextEntry={!showPassword}
              error={errors.confirmPassword}
            />

            {/* Terms Checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreeTerms(!agreeTerms)}
            >
              <View
                style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}
              >
                {agreeTerms && (
                  <Ionicons name="checkmark" size={14} color={colors.white} />
                )}
              </View>
              <Text style={styles.termsText}>
                I agree to the
                <Text style={styles.termsLink}> Terms of Service</Text> and
                <Text style={styles.termsLink}> Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
            {errors.terms && <Text style={styles.error}>{errors.terms}</Text>}

            <Button
              title="Create Account"
              onPress={handleRegister}
              variant="primary"
              size="large"
              fullWidth
              loading={isLoading}
            />
          </View>

          {/* Sign In */}
          <View style={styles.signInSection}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.signInLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing.md,
    paddingBottom: spacing["2xl"],
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
  form: {
    gap: spacing.lg,
    marginBottom: spacing["3xl"],
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[600],
  },
  termsText: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
    flex: 1,
  },
  termsLink: {
    color: colors.primary[600],
    fontWeight: fontWeight.semibold,
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.error[600],
    marginTop: -spacing.md,
  },
  signInSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signInText: {
    fontSize: fontSize.base,
    color: colors.neutral[600],
  },
  signInLink: {
    fontSize: fontSize.base,
    color: colors.primary[600],
    fontWeight: fontWeight.semibold,
  },
});
