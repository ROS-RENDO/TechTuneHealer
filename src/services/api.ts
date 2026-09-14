import { User, ServiceProvider, Booking, Vehicle, Review } from '../types';

import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.techtunehealer.com';

class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let token = "";
  try {
    token = await AsyncStorage.getItem("authToken") || "";
  } catch {
    console.warn("Failed to get auth token from storage");
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new ApiError(error.message || 'Request failed', response.status);
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    fetchWithAuth<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: 'customer' | 'provider';
  }) =>
    fetchWithAuth<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verifyOtp: (phone: string, otp: string) =>
    fetchWithAuth<{ verified: boolean }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    }),

  sendOtp: (phone: string) =>
    fetchWithAuth<{ sent: boolean }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  logout: () =>
    fetchWithAuth<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    }),

  getProfile: () => fetchWithAuth<User>('/auth/profile'),

  updateProfile: (data: Partial<User>) =>
    fetchWithAuth<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Providers API
export const providersApi = {
  getAll: (params?: {
    lat?: number;
    lng?: number;
    radius?: number;
    service?: string;
    rating?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    return fetchWithAuth<ServiceProvider[]>(`/providers?${searchParams}`);
  },

  getById: (id: string) => fetchWithAuth<ServiceProvider>(`/providers/${id}`),

  search: (query: string) =>
    fetchWithAuth<ServiceProvider[]>(`/providers/search?q=${encodeURIComponent(query)}`),

  getNearby: (lat: number, lng: number, radius: number = 10) =>
    fetchWithAuth<ServiceProvider[]>(`/providers/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),

  getEmergency: (lat: number, lng: number) =>
    fetchWithAuth<ServiceProvider[]>(`/providers/emergency?lat=${lat}&lng=${lng}`),
};

// Bookings API
export const bookingsApi = {
  getAll: () => fetchWithAuth<Booking[]>('/bookings'),

  getById: (id: string) => fetchWithAuth<Booking>(`/bookings/${id}`),

  create: (data: {
    providerId: string;
    serviceType: string;
    vehicleId: string;
    scheduledDate: string;
    scheduledTime: string;
    notes?: string;
  }) =>
    fetchWithAuth<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Booking>) =>
    fetchWithAuth<Booking>(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  cancel: (id: string, reason?: string) =>
    fetchWithAuth<Booking>(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  updateStatus: (id: string, status: Booking['status']) =>
    fetchWithAuth<Booking>(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

// Vehicles API
export const vehiclesApi = {
  getAll: () => fetchWithAuth<Vehicle[]>('/vehicles'),

  getById: (id: string) => fetchWithAuth<Vehicle>(`/vehicles/${id}`),

  create: (data: Omit<Vehicle, 'id'>) =>
    fetchWithAuth<Vehicle>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Vehicle>) =>
    fetchWithAuth<Vehicle>(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchWithAuth<{ success: boolean }>(`/vehicles/${id}`, {
      method: 'DELETE',
    }),
};

// Reviews API
export const reviewsApi = {
  getByProvider: (providerId: string) =>
    fetchWithAuth<Review[]>(`/providers/${providerId}/reviews`),

  create: (data: {
    providerId: string;
    bookingId: string;
    rating: number;
    comment: string;
  }) =>
    fetchWithAuth<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  reply: (reviewId: string, reply: string) =>
    fetchWithAuth<Review>(`/reviews/${reviewId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ reply }),
    }),
};

// Diagnostics API
export const diagnosticsApi = {
  analyze: (symptoms: string[]) =>
    fetchWithAuth<{
      possibleIssues: {
        name: string;
        probability: number;
        description: string;
        severity: 'low' | 'medium' | 'high';
        recommendedAction: string;
      }[];
    }>('/diagnostics/analyze', {
      method: 'POST',
      body: JSON.stringify({ symptoms }),
    }),
};

// Notifications API
export const notificationsApi = {
  getAll: () =>
    fetchWithAuth<
      {
        id: string;
        type: string;
        title: string;
        body: string;
        read: boolean;
        createdAt: string;
      }[]
    >('/notifications'),

  markAsRead: (id: string) =>
    fetchWithAuth<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'POST',
    }),

  markAllAsRead: () =>
    fetchWithAuth<{ success: boolean }>('/notifications/read-all', {
      method: 'POST',
    }),
};

// Chat API
export const chatApi = {
  getMessages: (bookingId: string) =>
    fetchWithAuth<{ id: string; senderId: string; senderName: string; text: string; createdAt: string }[]>(
      `/chat/${bookingId}`
    ),

  sendMessage: (bookingId: string, text: string, senderName: string) =>
    fetchWithAuth<{ id: string; senderId: string; senderName: string; text: string; createdAt: string }>(
      `/chat/${bookingId}`,
      {
        method: "POST",
        body: JSON.stringify({ text, senderName }),
      }
    ),
};

export default {
  auth: authApi,
  providers: providersApi,
  bookings: bookingsApi,
  vehicles: vehiclesApi,
  reviews: reviewsApi,
  diagnostics: diagnosticsApi,
  notifications: notificationsApi,
  chat: chatApi,
};
