import { NavigationContainer, NavigationIndependentTree } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/theme";

// Tab Screens
import { HomeScreen } from "../screens/customer/HomeScreen";
import { SearchScreen } from "../screens/customer/SearchScreen";
import { BookingsScreen } from "../screens/customer/BookingsScreen";
import { ProfileScreen } from "../screens/customer/ProfileScreen";

// Stack Screens
import { ProviderDetailScreen } from "../screens/customer/ProviderDetailScreen";
import { BookingCreateScreen } from "../screens/customer/BookingCreateScreen";
import { BookingDetailScreen } from "../screens/customer/BookingDetailScreen";
import { ChatScreen } from "../screens/shared/ChatScreen";
import { NotificationsScreen } from "../screens/shared/NotificationsScreen";
import { DiagnosticsScreen } from "../screens/customer/DiagnosticsScreen";
import { DiagnosticsResultScreen } from "../screens/customer/DiagnosticsResultScreen";
import { AiDiagnosisResultScreen } from "../screens/customer/AiDiagnosisResultScreen";
import { EmergencyScreen } from "../screens/customer/EmergencyScreen";
import { VehicleAddScreen } from "../screens/customer/VehicleAddScreen";
import { VehiclesScreen } from "../screens/customer/VehiclesScreen";
import { EditProfileScreen } from "../screens/customer/EditProfileScreen";
import { ReviewCreateScreen } from "../screens/customer/ReviewCreateScreen";
import { ShopScreen } from "../screens/customer/ShopScreen";
import { ProductDetailScreen } from "../screens/customer/ProductDetailScreen";
import { CartScreen } from "../screens/customer/CartScreen";
import { CustomerTrackingScreen } from "../screens/customer/CustomerTrackingScreen";
import { PaymentScreen } from "../screens/customer/PaymentScreen";
import { GarageScreen } from "../screens/customer/GarageScreen";

import { useTranslation } from "../store";

import type { CustomerTabParamList, CustomerStackParamList } from "./types";

const Tab = createBottomTabNavigator<CustomerTabParamList>();
const Stack = createNativeStackNavigator<CustomerStackParamList>();

function CustomerTabs() {
  const { t, language } = useTranslation();
  return (
    <Tab.Navigator
      key={language}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Search":
              iconName = focused ? "search" : "search-outline";
              break;
            case "Bookings":
              iconName = focused ? "calendar" : "calendar-outline";
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
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: t("tabHome") }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ tabBarLabel: t("tabSearch") }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{ tabBarLabel: t("tabBookings") }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: t("tabProfile") }}
      />
    </Tab.Navigator>
  );
}

export function CustomerNavigator() {
  const { t, language } = useTranslation();
  return (
    <NavigationIndependentTree>
      <NavigationContainer key={language}>
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
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="CustomerTabs"
        component={CustomerTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProviderDetail"
        component={ProviderDetailScreen}
        options={{ title: t("assignedMechanic") }}
      />
      <Stack.Screen
        name="BookingCreate"
        component={BookingCreateScreen}
        options={{ title: t("bookNow") }}
      />
      <Stack.Screen
        name="BookingDetail"
        component={BookingDetailScreen}
        options={{ title: t("bookingDetails"), headerShown: false }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: t("chat"), headerShown: false }}
      />
      <Stack.Screen
        name="Diagnostics"
        component={DiagnosticsScreen}
        options={{ title: t("diagnosticsTitle") }}
      />
      <Stack.Screen
        name="DiagnosticsResult"
        component={DiagnosticsResultScreen}
        options={{ title: t("diagnosticsTitle") }}
      />
      <Stack.Screen
        name="AiDiagnosisResult"
        component={AiDiagnosisResultScreen}
        options={{ title: t("diagnosticsTitle") }}
      />
      <Stack.Screen
        name="Emergency"
        component={EmergencyScreen}
        options={{
          title: t("emergencyTitle"),
          headerStyle: { backgroundColor: colors.error[500] },
          headerTintColor: colors.white,
        }}
      />
      <Stack.Screen
        name="VehicleAdd"
        component={VehicleAddScreen}
        options={{ title: t("addVehicle") }}
      />
      <Stack.Screen
        name="Vehicles"
        component={VehiclesScreen}
        options={{ title: t("myVehicles") }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: t("notifications") }}
      />
      <Stack.Screen
        name="ReviewCreate"
        component={ReviewCreateScreen}
        options={{ title: t("leaveReview"), headerShown: false }}
      />
      <Stack.Screen
        name="Shop"
        component={ShopScreen}
        options={{ title: "Shop", headerShown: false }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: "Product Detail", headerBackTitle: "" }}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: "Your Cart", headerBackTitle: "" }}
      />
      <Stack.Screen
        name="CustomerTracking"
        component={CustomerTrackingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ title: 'Payment', headerShown: false }}
      />
      <Stack.Screen
        name="Garage"
        component={GarageScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
    </NavigationContainer>
    </NavigationIndependentTree>
  );
}
