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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  userRole: null,
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

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  currentBooking: null,
  isLoading: false,
  fetchBookings: async () => {
    set({ isLoading: true });
    try {
      const bookings = await api.bookings.getAll();
      set({ bookings, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
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
      set((state) => ({
        bookings: state.bookings.map((b) =>
          b.id === id ? { ...b, status, updatedAt: new Date() } : b,
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
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
