import { Redirect } from "expo-router";
import { useAuthStore } from "../src/store";

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (user?.role === "provider") {
    return <Redirect href="/(provider)" />;
  }

  return <Redirect href="/(customer)" />;
}
