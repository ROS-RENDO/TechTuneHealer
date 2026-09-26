# Data Model: Redesign Customer Home Page

**Feature**: [001-redesign-customer-home](spec.md)

## Entities & View Models

### 1. CustomerHeaderViewModel
Represents the dynamic top app bar state.
```typescript
interface CustomerHeaderViewModel {
  userName: string;
  avatarUrl?: string | null;
  locationName: string; // e.g. "Olympic Stadium, Phnom Penh"
  hasUnreadNotifications: boolean;
}
```

### 2. PrimaryVehicleViewModel
Represents the active vehicle displayed in the "My Garage" card.
```typescript
interface PrimaryVehicleViewModel {
  id: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  color?: string;
  healthScore?: number; // e.g. 98
  healthStatus: "Excellent" | "Good" | "Needs Attention";
  hasAiDiagnostics: boolean;
}
```

### 3. ServiceCategoryItem
Represents an automotive service category tile in the grid.
```typescript
interface ServiceCategoryItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  badge?: string;
  categoryFilter: string; // Used to pre-filter SearchScreen
}
```

### 4. NearbyMechanicCardViewModel
Represents an individual mechanic card in the home screen feed.
```typescript
interface NearbyMechanicCardViewModel {
  id: string;
  businessName: string;
  address: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isAvailable: boolean;
  distanceFormatted: string; // "450 m" or "1.4 km"
  specialtyTag?: string; // e.g. "Engine Specialist"
}
```

### 5. ActiveBookingBannerViewModel
Represents an ongoing roadside or repair booking status.
```typescript
interface ActiveBookingBannerViewModel {
  bookingId: string;
  mechanicName: string;
  serviceName: string;
  status: "CONFIRMED" | "IN_PROGRESS";
  estimatedArrival?: string; // e.g. "12 mins"
}
```
