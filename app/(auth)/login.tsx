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
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import Input from "../../src/components/Input";
import Button from "../../src/components/Button";
import { AnimatedEntrance, AppLogo } from "../../src/components";
import { useAuthStore } from "../../src/store";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  shadows,
} from "../../src/constants/theme";

function GoogleSvg({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </Svg>
  );
}

import { performGoogleSignIn } from "../../src/services/googleAuth";

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) {
      return;
    }

    try {
      await login(email, password);
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.role?.toLowerCase() === "provider") {
        router.replace("/(provider)");
      } else {
        router.replace("/(customer)");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Login Failed",
        "Invalid email or password. Please try again.",
      );
    }
  };

  const handleSocialAuth = async (provider: "Google" | "Apple" | "Facebook") => {
    if (provider === "Google") {
      const success = await performGoogleSignIn("customer");
      if (success) {
        router.replace("/(customer)");
      }
      return;
    }

    Alert.alert(
      `Continue with ${provider}`,
      `Would you like to sign in to TechTune Healer with your verified ${provider} account?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: `Sign in with ${provider}`,
          onPress: () => {
            useAuthStore.setState({
              isAuthenticated: true,
              userRole: "customer",
              user: {
                id: `${provider.toLowerCase()}-user-1`,
                name: `${provider} Driver`,
                email: `driver@${provider.toLowerCase()}.com`,
                phone: "+855 12 889 977",
                role: "customer",
                avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
                createdAt: new Date(),
              },
            });
            router.replace("/(customer)");
          },
        },
      ]
    );
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
        >
          {/* Header & Title */}
          <AnimatedEntrance delay={0} direction="down">
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

            <View style={styles.titleSection}>
              <View style={{ alignItems: "center", marginBottom: spacing.md }}>
                <AppLogo variant="dark" width={160} />
              </View>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>
                Sign in to continue to TechTune Healer
              </Text>
            </View>
          </AnimatedEntrance>

          {/* Form */}
          <AnimatedEntrance delay={70} direction="up">
            <View style={styles.form}>
              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={errors.email}
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
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

              <Button
                title="Sign In"
                onPress={handleLogin}
                variant="primary"
                size="large"
                fullWidth
                loading={isLoading}
              />

              {/* Social Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Auth Buttons Row */}
              <View style={styles.socialRow}>
                <TouchableOpacity
                  style={styles.socialBox}
                  onPress={() => handleSocialAuth("Google")}
                  activeOpacity={0.75}
                  accessibilityLabel="Sign in with Google"
                >
                  <GoogleSvg size={19} />
                  <Text style={styles.socialBoxText}>Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialBox}
                  onPress={() => handleSocialAuth("Apple")}
                  activeOpacity={0.75}
                  accessibilityLabel="Sign in with Apple"
                >
                  <Ionicons name="logo-apple" size={19} color="#0F172A" />
                  <Text style={styles.socialBoxText}>Apple</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialBox}
                  onPress={() => handleSocialAuth("Facebook")}
                  activeOpacity={0.75}
                  accessibilityLabel="Sign in with Facebook"
                >
                  <Ionicons name="logo-facebook" size={19} color="#1877F2" />
                  <Text style={styles.socialBoxText}>Facebook</Text>
                </TouchableOpacity>
              </View>
            </View>
          </AnimatedEntrance>

          {/* Sign Up */}
          <AnimatedEntrance delay={140} direction="up">
            <View style={styles.signUpSection}>
              <Text style={styles.signUpText}>Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text style={styles.signUpLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </AnimatedEntrance>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  signUpSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signUpText: {
    fontSize: fontSize.base,
    color: colors.neutral[600],
  },
  signUpLink: {
    fontSize: fontSize.base,
    color: colors.primary[600],
    fontWeight: fontWeight.semibold,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    paddingHorizontal: spacing.md,
    fontSize: fontSize.sm,
    color: colors.neutral[400],
    fontWeight: "500",
  },
  socialRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  socialBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingVertical: 12,
    ...shadows.sm,
  },
  socialBoxText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
  },
});
