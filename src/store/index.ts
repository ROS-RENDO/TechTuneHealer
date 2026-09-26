import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  User,
  ServiceProvider,
  Booking,
  Location,
  Notification,
} from "../types";
import api from "../services/api";

// Auth Store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userRole: "customer" | "provider" | null; // Store selected role
  isDutyOnline: boolean;
  dispatchRadiusKm: number;
  isEmergencyOnCall: boolean;
  setDutyOnline: (isOnline: boolean) => Promise<void>;
  setDispatchSettings: (settings: { dispatchRadiusKm?: number; isEmergencyOnCall?: boolean }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: "customer" | "provider";
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  userRole: null,
  isDutyOnline: true, // Default to online when working as a provider
  dispatchRadiusKm: 20, // Default 20 km dispatch coverage
  isEmergencyOnCall: true, // Default 24/7 on call
  setDutyOnline: async (isOnline: boolean) => {
    set({ isDutyOnline: isOnline });
    try {
      await api.providers.updateAvailability(isOnline);
    } catch (e) {
      console.warn("Failed to sync duty availability to backend:", e);
    }
  },
  setDispatchSettings: async (settings) => {
    set((state) => ({
      dispatchRadiusKm: settings.dispatchRadiusKm !== undefined ? settings.dispatchRadiusKm : state.dispatchRadiusKm,
      isEmergencyOnCall: settings.isEmergencyOnCall !== undefined ? settings.isEmergencyOnCall : state.isEmergencyOnCall,
    }));
    try {
      await api.providers.updateSettings(settings);
    } catch (e) {
      console.warn("Failed to sync dispatch settings to backend:", e);
    }
  },
  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        set({ isAuthenticated: false, isLoading: false });
        return;
      }
      const user = await api.auth.getProfile();
      set({ user, isAuthenticated: true, userRole: user.role, isLoading: false });
    } catch {
      await AsyncStorage.removeItem("authToken");
      set({ isAuthenticated: false, isLoading: false, user: null, userRole: null });
    }
  },
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await api.auth.login(email, password);

      await AsyncStorage.setItem("authToken", response.token);
      
      set({
        user: response.user,
        userRole: response.user.role as "customer" | "provider",
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  register: async (data: RegisterData) => {
    set({ isLoading: true });
    try {
      // Create account via API
      const response = await api.auth.register({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
      });
      
      // Store token immediately to log user in
      await AsyncStorage.setItem("authToken", response.token);

      set({ userRole: data.role, isLoading: false, isAuthenticated: true, user: response.user });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  logout: () => {
    AsyncStorage.removeItem("authToken").catch(() => {});
    set({ user: null, isAuthenticated: false, userRole: null });
  },
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },
}));

// Location Store
interface LocationState {
  currentLocation: Location | null;
  isLoading: boolean;
  error: string | null;
  setLocation: (location: Location) => void;
  setError: (error: string | null) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  currentLocation: null,
  isLoading: false,
  error: null,
  setLocation: (location) => set({ currentLocation: location, error: null }),
  setError: (error) => set({ error }),
}));

// Booking Store
interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  isLoading: boolean;
  fetchBookings: () => Promise<void>;
  createBooking: (booking: Partial<Booking>) => Promise<Booking>;
  updateBookingStatus: (id: string, status: Booking["status"]) => Promise<void>;
  setCurrentBooking: (booking: Booking | null) => void;
}

const DEFAULT_PROVIDER_BOOKINGS: Booking[] = [
  {
    id: "booking-sos-1",
    customerId: "cust-dara",
    providerId: "prov-1",
    vehicleId: "veh-lexus",
    serviceIds: ["srv-emergency"],
    status: "pending",
    isEmergency: true,
    serviceType: "🚨 24/7 Roadside Emergency Rescue",
    notes: "Flat tire on front left wheel, vehicle stopped near Tuol Kork antenna tower (St 598). Need urgent mobile assistance.",
    estimatedPrice: 45,
    scheduledDate: new Date(),
    scheduledTime: "10:30 AM",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customerName: "Dara Chan",
    customerPhone: "+855 12 998 877",
    customerLocation: {
      latitude: 11.5720,
      longitude: 104.8950,
      address: "St 598 near Antenna Tower, Tuol Kork",
    },
    vehicle: {
      id: "veh-lexus",
      userId: "cust-dara",
      make: "SUV",
      model: "Luxury",
      year: 2024,
      licensePlate: "2A-8888",
      plateNumber: "2A-8888",
      color: "Sonic Titanium",
    } as any,
  },
  {
    id: "booking-sos-2",
    customerId: "cust-vannak",
    providerId: "prov-1",
    vehicleId: "veh-ranger",
    serviceIds: ["srv-battery"],
    status: "pending",
    isEmergency: true,
    serviceType: "⚡ Dead Battery Jumpstart & Alternator Scan",
    notes: "Engine won't turn over at Aeon Mall Sen Sok B2 basement parking (Zone C). Rapid clicking noise from starter motor.",
    estimatedPrice: 35,
    scheduledDate: new Date(),
    scheduledTime: "11:15 AM",
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    customerName: "Vannak Chea",
    customerPhone: "+855 77 445 566",
    customerLocation: {
      latitude: 11.5950,
      longitude: 104.8820,
      address: "Aeon Mall Sen Sok, B2 Zone C",
    },
    vehicle: {
      id: "veh-ranger",
      userId: "cust-vannak",
      make: "Truck",
      model: "4x4",
      year: 2023,
      licensePlate: "2B-4455",
      plateNumber: "2B-4455",
      color: "Cyber Orange",
    } as any,
  },
  {
    id: "booking-sch-3",
    customerId: "cust-sreymom",
    providerId: "prov-1",
    vehicleId: "veh-mazda",
    serviceIds: ["srv-brake"],
    status: "pending",
    isEmergency: false,
    serviceType: "Ceramic Brake Pad Replacement",
    notes: "High-pitched squealing when decelerating from 40km/h. Customer requested premium Akebono ceramic pads.",
    estimatedPrice: 65,
    scheduledDate: new Date(),
    scheduledTime: "02:30 PM",
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    customerName: "Sreymom Ly",
    customerPhone: "+855 10 334 455",
    customerLocation: {
      latitude: 11.5530,
      longitude: 104.9180,
      address: "Street 63, Boeung Keng Kang 1, Phnom Penh",
    },
    vehicle: {
      id: "veh-mazda",
      userId: "cust-sreymom",
      make: "Mazda",
      model: "CX-5 SkyActiv",
      year: 2022,
      licensePlate: "2Z-7788",
      plateNumber: "2Z-7788",
      color: "Soul Red Crystal",
    } as any,
  },
  {
    id: "booking-act-4",
    customerId: "cust-test",
    providerId: "prov-1",
    vehicleId: "veh-camry",
    serviceIds: ["srv-cooling"],
    status: "in_progress",
    isEmergency: true,
    serviceType: "🚨 Emergency Engine Overheating Rescue",
    notes: "Engine temperature gauge maxed out near Riverside Sisowath Quay. Steam emitting from radiator expansion tank.",
    estimatedPrice: 55,
    scheduledDate: new Date(),
    scheduledTime: "09:45 AM",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    customerName: "Test Customer",
    customerPhone: "+855 11 111 111",
    customerLocation: {
      latitude: 11.5680,
      longitude: 104.9330,
      address: "Preah Sisowath Quay, Wat Phnom Area, Phnom Penh",
    },
    vehicle: {
      id: "veh-camry",
      userId: "cust-test",
      make: "Toyota",
      model: "Camry XSE",
      year: 2020,
      licensePlate: "2A-1234",
      plateNumber: "2A-1234",
      color: "Super White",
    } as any,
  },
  {
    id: "booking-act-5",
    customerId: "cust-sophea",
    providerId: "prov-1",
    vehicleId: "veh-landcruiser",
    serviceIds: ["srv-radiator"],
    status: "accepted",
    isEmergency: false,
    serviceType: "Radiator Coolant Flush & Pressure Test",
    notes: "Routine 40,000km cooling system flush and AC condenser inspection at BKK1 residential villa.",
    estimatedPrice: 85,
    scheduledDate: new Date(),
    scheduledTime: "04:00 PM",
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    customerName: "Sophea Pich",
    customerPhone: "+855 98 223 344",
    customerLocation: {
      latitude: 11.5450,
      longitude: 104.9220,
      address: "Street 310, Boeung Keng Kang 1, Phnom Penh",
    },
    vehicle: {
      id: "veh-landcruiser",
      userId: "cust-sophea",
      make: "Toyota",
      model: "Land Cruiser 300",
      year: 2024,
      licensePlate: "2C-9999",
      plateNumber: "2C-9999",
      color: "Pearl White",
    } as any,
  },
  {
    id: "booking-cmp-6",
    customerId: "cust-michael",
    providerId: "prov-1",
    vehicleId: "veh-tesla",
    serviceIds: ["srv-ev"],
    status: "completed",
    isEmergency: false,
    serviceType: "Suspension Check & High Voltage Diagnostics",
    notes: "Rear multi-link suspension bushings inspected and complete 96-cell high voltage battery health scan passed at 98.4%.",
    estimatedPrice: 75,
    scheduledDate: new Date(Date.now() - 86400000),
    scheduledTime: "03:00 PM",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 80000000).toISOString(),
    customerName: "Michael Seng",
    customerPhone: "+855 77 554 433",
    customerLocation: {
      latitude: 11.5600,
      longitude: 104.9100,
      address: "Olympic Stadium Area, Phnom Penh",
    },
    vehicle: {
      id: "veh-tesla",
      userId: "cust-michael",
      make: "Tesla",
      model: "Model Y Dual Motor",
      year: 2024,
      licensePlate: "2E-7777",
      plateNumber: "2E-7777",
      color: "Deep Blue Metallic",
    } as any,
  },
];

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: DEFAULT_PROVIDER_BOOKINGS,
  currentBooking: null,
  isLoading: false,
  fetchBookings: async () => {
    set({ isLoading: true });
    try {
      const bookings = await api.bookings.getAll();
      if (bookings && bookings.length > 0) {
        set({ bookings, isLoading: false });
      } else {
        set((state) => ({
          bookings: state.bookings.length > 0 ? state.bookings : DEFAULT_PROVIDER_BOOKINGS,
          isLoading: false,
        }));
      }
    } catch (error) {
      set((state) => ({
        bookings: state.bookings.length > 0 ? state.bookings : DEFAULT_PROVIDER_BOOKINGS,
        isLoading: false,
      }));
    }
  },
  createBooking: async (bookingData) => {
    set({ isLoading: true });
    try {
      const newBooking = await api.bookings.create({
        providerId: bookingData.providerId!,
        serviceType: bookingData.serviceType || "Custom Service",
        vehicleId: bookingData.vehicleId!,
        scheduledDate: bookingData.scheduledDate ? bookingData.scheduledDate.toISOString() : new Date().toISOString(),
        scheduledTime: bookingData.scheduledTime || "12:00 PM",
        notes: bookingData.notes,
      });

      set((state) => ({
        bookings: [...state.bookings, newBooking],
        isLoading: false,
      }));
      return newBooking;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  updateBookingStatus: async (id, status) => {
    set({ isLoading: true });
    try {
      await api.bookings.updateStatus(id, status);
    } catch (error) {
      console.warn("Backend updateStatus call failed, updating local booking status:", error);
    } finally {
      set((state) => ({
        bookings: state.bookings.map((b) =>
          b.id === id ? { ...b, status, updatedAt: new Date() } : b,
        ),
        currentBooking:
          state.currentBooking?.id === id
            ? { ...state.currentBooking, status, updatedAt: new Date() }
            : state.currentBooking,
        isLoading: false,
      }));
    }
  },
  setCurrentBooking: (booking) => set({ currentBooking: booking }),
}));

// Provider Search Store
interface ProviderSearchState {
  providers: ServiceProvider[];
  selectedProvider: ServiceProvider | null;
  filters: SearchFilters;
  isLoading: boolean;
  searchProviders: (location: Location) => Promise<void>;
  setSelectedProvider: (provider: ServiceProvider | null) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
}

interface SearchFilters {
  category?: string;
  maxDistance?: number;
  minRating?: number;
  isAvailable?: boolean;
  isEmergency?: boolean;
}

export const useProviderSearchStore = create<ProviderSearchState>((set, get) => ({
  providers: [],
  selectedProvider: null,
  filters: {},
  isLoading: false,
  searchProviders: async (location) => {
    set({ isLoading: true });
    try {
      const { category, maxDistance, minRating, isEmergency } = get().filters;
      let providers = await api.providers.getAll({
        lat: location.latitude,
        lng: location.longitude,
        radius: maxDistance || 25,
        service: category,
        rating: minRating,
      });
      
      if (isEmergency) {
        providers = await api.providers.getEmergency(location.latitude, location.longitude);
      }
      
      set({ providers, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  setSelectedProvider: (provider) => set({ selectedProvider: provider }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
}));

// Notification Store
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  fetchNotifications: async () => {
    // TODO: Implement actual API call
  },
  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },
}));

export * from './vehicleStore';
export * from './languageStore';
