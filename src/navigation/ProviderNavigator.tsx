import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/theme";

// Tab Screens
import DashboardScreen from "../screens/provider/DashboardScreen";
import BookingsScreen from "../screens/provider/BookingsScreen";
import ServicesScreen from "../screens/provider/ServicesScreen";
import ProfileScreen from "../screens/provider/ProfileScreen";

// Stack Screens
import { ChatScreen } from "../screens/shared/ChatScreen";
import ReviewsScreen from "../screens/provider/ReviewsScreen";
import ScheduleScreen from "../screens/provider/ScheduleScreen";
import EarningsScreen from "../screens/provider/EarningsScreen";
import { NotificationsScreen } from "../screens/shared/NotificationsScreen";
import { MechanicTrackingScreen } from "../screens/mechanic/MechanicTrackingScreen";

import type { ProviderTabParamList, ProviderStackParamList } from "./types";

const Tab = createBottomTabNavigator<ProviderTabParamList>();
const Stack = createNativeStackNavigator<ProviderStackParamList>();

function ProviderTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case "Dashboard":
              iconName = focused ? "grid" : "grid-outline";
              break;
            case "Bookings":
              iconName = focused ? "briefcase" : "briefcase-outline";
              break;
            case "Services":
              iconName = focused ? "construct" : "construct-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
            default:
              iconName = "ellipse";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.neutral[400],
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.neutral[200],
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Services" component={ServicesScreen} />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
}

export function ProviderNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTintColor: colors.neutral[900],
        headerTitleStyle: {
          fontWeight: "600",
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="ProviderTabs"
        component={ProviderTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: "Chat", headerShown: false }}
      />
      <Stack.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{ title: "Schedule" }}
      />
      <Stack.Screen
        name="Reviews"
        component={ReviewsScreen}
        options={{ title: "Reviews" }}
      />
      <Stack.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{ title: "Earnings" }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: "Notifications" }}
      />
      <Stack.Screen
        name="MechanicTracking"
        component={MechanicTrackingScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
