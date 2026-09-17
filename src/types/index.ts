// User Types
export type UserRole = "customer" | "provider";

export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
}

export interface Customer extends User {
  role: "customer";
  vehicles: Vehicle[];
}

export interface ServiceProvider extends User {
  role: "provider";
  businessName: string;
  description: string;
  address: string;
  location: Location;
  services: Service[];
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isAvailable: boolean;
  workingHours: WorkingHours;
  images: string[];
}

// Vehicle Types
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  vin?: string;
}

// Location Types
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

// Service Types
export interface Service {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  priceMin: number;
  priceMax: number;
  estimatedDuration: number; // in minutes
}

export type ServiceCategory =
  | "emergency"
  | "maintenance"
  | "repair"
  | "diagnostics"
  | "tires"
  | "battery"
  | "oil_change"
  | "brakes"
  | "ac"
  | "other";

// Booking Types
export type BookingStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  vehicleId: string;
  serviceIds: string[];
  status: BookingStatus;
  scheduledDate: Date;
  estimatedPrice?: number;
  finalPrice?: number;
  notes?: string;
  customerLocation?: Location;
  isEmergency?: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  // Included Relations from API
  provider?: ServiceProvider;
  customer?: User;
  // Optional mock properties for UI display
  customerName?: string;
  vehicleInfo?: string;
  serviceType?: string;
  scheduledTime?: string;
  estimatedCost?: number;
}

// Review Types
export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

// Chat Types
export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

// Diagnostic Types
export interface DiagnosticSymptom {
  id: string;
  category: string;
  symptom: string;
  possibleCauses: string[];
  suggestedActions: string[];
  severity: "low" | "medium" | "high";
}

// Working Hours
export interface WorkingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: "booking" | "chat" | "review" | "system";
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: Date;
}
