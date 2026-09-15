import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "../../src/store";
import { CustomerNavigator } from "../../src/navigation/CustomerNavigator";
import { colors } from "../../src/constants/theme";

export default function CustomerIndex() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "customer") {
      router.replace("/(auth)/welcome");
      return;
    }
    setIsReady(true);
  }, [isAuthenticated, user?.role]);

  if (!isReady) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <CustomerNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
