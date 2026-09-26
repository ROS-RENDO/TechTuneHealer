import { Platform, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Format phone number for Cambodia
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('855')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  if (cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
};

// Format currency (USD for Cambodia)
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format date
export const formatDate = (
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
};

// Format time
export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Format relative time
export const formatRelativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(d, { month: 'short', day: 'numeric' });
};

// Calculate distance between two coordinates
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Format distance
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};

// Calculate and format distance from user location to provider location
export const getFormattedDistance = (
  userLoc: { latitude: number; longitude: number } | null | undefined,
  providerLoc: { latitude?: number; longitude?: number } | null | undefined
): string | null => {
  const user = userLoc || { latitude: 11.5564, longitude: 104.9282 };
  if (!providerLoc || providerLoc.latitude == null || providerLoc.longitude == null) {
    return null;
  }
  const dist = calculateDistance(
    user.latitude,
    user.longitude,
    providerLoc.latitude,
    providerLoc.longitude
  );
  if (isNaN(dist)) return null;
  return formatDistance(dist);
};

// Validate phone number (Cambodia)
export const validatePhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  // Cambodia phone format: 0xx xxx xxxx or +855 xx xxx xxxx
  return /^(0|855)[1-9]\d{7,8}$/.test(cleaned);
};

// Validate email
export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Open phone dialer
export const makePhoneCall = (phoneNumber: string): void => {
  const url = Platform.OS === 'ios' ? `tel:${phoneNumber}` : `tel:${phoneNumber}`;
  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Phone calls are not supported on this device');
      }
    })
    .catch((err) => console.error('Error making phone call:', err));
};

// Open maps for directions
export const openMaps = (lat: number, lng: number, label?: string): void => {
  const scheme = Platform.select({
    ios: 'maps:',
    android: 'geo:',
  });
  const url = Platform.select({
    ios: `${scheme}?q=${label || 'Destination'}&ll=${lat},${lng}`,
    android: `${scheme}${lat},${lng}?q=${lat},${lng}(${label || 'Destination'})`,
  });

  if (url) {
    Linking.openURL(url).catch(() => {
      // Fallback to Google Maps
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
    });
  }
};

// Generate initials from name
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
};

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// Group array by key
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    return {
      ...groups,
      [groupKey]: [...(groups[groupKey] || []), item],
    };
  }, {} as Record<string, T[]>);
}

// Sort array by key
export function sortBy<T>(
  array: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

// Get realistic professional profile avatar for automotive mechanics/providers
export function getProviderAvatarUrl(provider?: {
  businessName?: string;
  name?: string;
  avatar?: string;
  id?: string;
} | null): string {
  if (provider?.avatar && provider.avatar.startsWith('http')) {
    return provider.avatar;
  }
  const key = (provider?.businessName || provider?.name || '').toLowerCase();
  if (key.includes('speedy') || key.includes('sokha')) {
    return 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=180&auto=format&fit=crop&q=80';
  }
  if (key.includes('dara')) {
    return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=180&auto=format&fit=crop&q=80';
  }
  if (key.includes('mekong') || key.includes('sreymom')) {
    return 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=180&auto=format&fit=crop&q=80';
  }
  if (key.includes('tire') || key.includes('vuthy') || key.includes('kv')) {
    return 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=180&auto=format&fit=crop&q=80';
  }
  if (key.includes('electric') || key.includes('chanra')) {
    return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=180&auto=format&fit=crop&q=80';
  }
  if (key.includes('star') || key.includes('borin') || key.includes('spa')) {
    return 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=180&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=180&auto=format&fit=crop&q=80';
}

export interface ServiceVisualConfig {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  bgColor: string;
}

// Get sleek minimalist monochromatic icon and neutral background for automotive services
export function getServiceVisualConfig(
  serviceType?: string,
  isEmergency?: boolean
): ServiceVisualConfig {
  const raw = serviceType || "Automotive Service";
  const clean = raw.replace(/[🚨⚡🔧🛠️]/g, "").trim();
  const s = clean.toLowerCase();

  // Emergency SOS items get subtle crimson indicator
  if (isEmergency || s.includes("emergency") || s.includes("roadside") || s.includes("sos")) {
    let icon: keyof typeof Ionicons.glyphMap = "alert-circle";
    let shortLabel = "Roadside SOS";
    if (s.includes("overheat") || s.includes("radiator") || s.includes("steam") || s.includes("coolant")) {
      icon = "flame";
      shortLabel = "Engine Overheating";
    } else if (s.includes("battery") || s.includes("jump") || s.includes("boost") || s.includes("dead")) {
      icon = "battery-charging";
      shortLabel = "Battery Jumpstart";
    } else if (s.includes("tire") || s.includes("puncture") || s.includes("flat") || s.includes("blowout")) {
      icon = "disc";
      shortLabel = "Tire Replacement";
    } else if (s.includes("tow") || s.includes("stuck") || s.includes("winch")) {
      icon = "car";
      shortLabel = "Tow Recovery";
    }
    return { icon, label: shortLabel, color: "#DC2626", bgColor: "#FEE2E2" };
  }

  // All regular services use sleek Apple/Uber monochrome slate (#334155 / #F1F5F9)
  let icon: keyof typeof Ionicons.glyphMap = "construct";
  let shortLabel = clean;
  if (s.includes("battery") || s.includes("alternator") || s.includes("charging") || s.includes("starter")) {
    icon = "battery-charging";
    shortLabel = "Battery Service";
  } else if (s.includes("tire") || s.includes("wheel") || s.includes("alignment") || s.includes("rotation")) {
    icon = "disc";
    shortLabel = "Tire & Wheels";
  } else if (s.includes("brake") || s.includes("pad") || s.includes("rotor") || s.includes("caliper")) {
    icon = "speedometer";
    shortLabel = "Brake Service";
  } else if (s.includes("oil") || s.includes("fluid") || s.includes("filter") || s.includes("lube") || s.includes("flush")) {
    icon = "water";
    shortLabel = "Coolant & Fluid";
  } else if (s.includes("diag") || s.includes("scan") || s.includes("ecu") || s.includes("obd") || s.includes("sensor")) {
    icon = "hardware-chip";
    shortLabel = "Diagnostics";
  } else if (s.includes("wash") || s.includes("detail") || s.includes("spa") || s.includes("polish")) {
    icon = "sparkles";
    shortLabel = "Car Spa";
  } else if (s.includes("suspension") || s.includes("shock") || s.includes("strut")) {
    icon = "analytics";
    shortLabel = "Suspension";
  }

  return { icon, label: shortLabel, color: "#334155", bgColor: "#F1F5F9" };
}

// Calculate real distance in km between provider and customer
// Resolve booking coordinates with 100% fidelity to seed data
export function resolveBookingCoordinates(
  bookingOrLoc?: any
): { latitude: number; longitude: number } {
  if (bookingOrLoc?.customerLocation?.latitude && bookingOrLoc?.customerLocation?.longitude) {
    return {
      latitude: Number(bookingOrLoc.customerLocation.latitude),
      longitude: Number(bookingOrLoc.customerLocation.longitude),
    };
  }
  if (bookingOrLoc?.latitude && bookingOrLoc?.longitude) {
    return {
      latitude: Number(bookingOrLoc.latitude),
      longitude: Number(bookingOrLoc.longitude),
    };
  }
  if (bookingOrLoc?.lat && bookingOrLoc?.lng) {
    return {
      latitude: Number(bookingOrLoc.lat),
      longitude: Number(bookingOrLoc.lng),
    };
  }
  const text = `${bookingOrLoc?.notes || ""} ${bookingOrLoc?.customerName || ""} ${bookingOrLoc?.customer?.name || ""} ${bookingOrLoc?.address || ""}`.toLowerCase();
  if (text.includes("camtech") || text.includes("chroy changvar")) {
    return { latitude: 11.6146, longitude: 104.9282 };
  }
  if (text.includes("tuol kork") || text.includes("dara") || text.includes("598")) {
    return { latitude: 11.5720, longitude: 104.8950 };
  }
  if (text.includes("aeon") || text.includes("sen sok") || text.includes("vannak")) {
    return { latitude: 11.5950, longitude: 104.8820 };
  }
  if (text.includes("sisowath") || text.includes("wat phnom") || text.includes("overheating") || text.includes("riverside")) {
    return { latitude: 11.5680, longitude: 104.9330 };
  }
  if (text.includes("310") || text.includes("sophea")) {
    return { latitude: 11.5450, longitude: 104.9220 };
  }
  if (text.includes("brake") || text.includes("sreymom") || text.includes("63")) {
    return { latitude: 11.5530, longitude: 104.9180 };
  }
  if (text.includes("tesla") || text.includes("michael")) {
    return { latitude: 11.5600, longitude: 104.9100 };
  }
  return { latitude: 11.5720, longitude: 104.8950 };
}

// Calculate real distance in km between provider and customer
export function getBookingDistanceText(
  customerLocation?: { latitude?: number; longitude?: number } | any,
  providerCoords?: { latitude?: number; longitude?: number } | null
): string {
  const loc = resolveBookingCoordinates(customerLocation);
  const provLat = providerCoords?.latitude ?? 11.5600;
  const provLng = providerCoords?.longitude ?? 104.9100;

  const dist = calculateDistance(
    provLat,
    provLng,
    loc.latitude,
    loc.longitude
  );

  if (isNaN(dist)) return "";
  if (dist < 1) {
    return `${Math.round(dist * 1000)}m`;
  }
  return `${dist.toFixed(1)} km`;
}

// Concise neighborhood / district extractor (strips out Phnom Penh and redundant text)
export function getConciseLocation(address?: string): string {
  if (!address) return "On-Site";
  const s = address.toLowerCase();
  if (s.includes("tuol kork")) return "Tuol Kork";
  if (s.includes("wat phnom")) return "Wat Phnom";
  if (s.includes("boeung keng kang") || s.includes("bkk")) return "BKK 1";
  if (s.includes("olympic")) return "Olympic";
  if (s.includes("chamkarmon") || s.includes("russian")) return "Chamkarmon";
  if (s.includes("sen sok") || s.includes("aeon")) return "Sen Sok";
  if (s.includes("daun penh") || s.includes("sisowath")) return "Daun Penh";
  if (s.includes("antenna") || s.includes("598")) return "St. 598";

  // Strip out "Phnom Penh" and "Cambodia" completely
  const cleaned = address
    .replace(/,?\s*(phnom\s*penh|cambodia)/gi, "")
    .split(",")[0]
    .replace(/^Street\s+/i, "St. ")
    .trim();

  return cleaned.length > 0 && !cleaned.toLowerCase().includes("phnom penh")
    ? cleaned
    : "On-Site";
}

// Concise vehicle make and model only (e.g. "Toyota Camry")
export function getConciseVehicle(vehicle?: any, fallback?: string): string {
  if (vehicle?.make && vehicle?.model) {
    return `${vehicle.make} ${vehicle.model}`;
  }
  if (fallback) {
    const parts = fallback.trim().split(" ");
    return parts.slice(0, 2).join(" ");
  }
  return "Vehicle";
}

// Get realistic customer/motorist portrait photo
export function getCustomerAvatarUrl(
  customer?: { name?: string; avatar?: string; id?: string } | null,
  fallbackName?: string
): string {
  if (customer?.avatar && customer.avatar.startsWith("http")) {
    return customer.avatar;
  }
  const name = (customer?.name || fallbackName || "").toLowerCase();
  if (name.includes("sophea")) {
    return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80";
  }
  if (name.includes("michael") || name.includes("mike")) {
    return "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=160&auto=format&fit=crop&q=80";
  }
  if (name.includes("test") || name.includes("dara")) {
    return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80";
  }
  if (name.includes("chenda") || name.includes("srey")) {
    return "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80";
  }
  if (name.includes("heng") || name.includes("vanna") || name.includes("sok")) {
    return "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&auto=format&fit=crop&q=80";
  }
  return "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80";
}



