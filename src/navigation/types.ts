import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import type { Vehicle } from "../types";

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  CustomerMain: NavigatorScreenParams<CustomerTabParamList>;
  ProviderMain: NavigatorScreenParams<ProviderTabParamList>;
};

// Auth Stack
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  RoleSelection: undefined;
};

// Customer Tab Navigator
export type CustomerTabParamList = {
  Home: undefined;
  Search: undefined;
  Bookings: undefined;
  Profile: undefined;
};

// Customer Stack Screens (nested in tabs)
export type CustomerStackParamList = {
  CustomerTabs: NavigatorScreenParams<CustomerTabParamList>;
  ProviderDetail: { providerId: string };
  BookingCreate: { providerId: string; isEmergency?: boolean };
  BookingDetail: { bookingId: string };
  Chat: { bookingId: string };
  Diagnostics: undefined;
  DiagnosticsResult: { symptomIds: string[] };
  AiDiagnosisResult: undefined;
  Emergency: undefined;
  VehicleAdd: undefined;
  VehicleEdit: { vehicle: Vehicle };
  EditProfile: undefined;
  Settings: undefined;
  Notifications: undefined;
  ReviewCreate: { bookingId: string };
  Shop: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
  CustomerTracking: { bookingId: string; mechanicName?: string };
  Payment: { totalAmount: number; items: { name: string; price: number; quantity: number }[] };
};

// Provider Tab Navigator
export type ProviderTabParamList = {
  Dashboard: undefined;
  Bookings: undefined;
  Services: undefined;
  Profile: undefined;
};

// Provider Stack Screens
export type ProviderStackParamList = {
  ProviderTabs: NavigatorScreenParams<ProviderTabParamList>;
  Chat: { bookingId: string };
  Schedule: undefined;
  Reviews: undefined;
  Earnings: undefined;
  Notifications: undefined;
  MechanicTracking: { bookingId: string };
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<AuthStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type CustomerTabScreenProps<T extends keyof CustomerTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<CustomerTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type CustomerStackScreenProps<T extends keyof CustomerStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<CustomerStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type ProviderTabScreenProps<T extends keyof ProviderTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<ProviderTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type ProviderStackScreenProps<T extends keyof ProviderStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ProviderStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

// Declaration merge for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
