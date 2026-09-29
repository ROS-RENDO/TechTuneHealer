# Research & Technical Decisions: Redesign Customer Home Page

**Feature**: [001-redesign-customer-home](spec.md)

## 1. Automotive UI/UX & Visual Hierarchy

### Context
Automotive assistance and mobility apps (e.g. Uber, Fixd, Tesla, RepairPal) require immediate clarity, low cognitive load during roadside emergencies, and high aesthetic credibility for repair trust.

### Findings
- **App Bar & Header**: Clear location awareness (`📍 Olympic Stadium, Phnom Penh`) reassures customers that emergency dispatch and mechanic proximity are accurate. Greeting + vehicle health status provides daily utility.
- **Hero Rescue SOS Banner**: High-contrast Crimson/Amber gradient with pulsating status beacon provides instant reassurance and 1-tap navigation to emergency dispatch.
- **Garage Vehicle Widget**: Displaying make, model, and plate number connects the customer directly to their car and provides a high-converting entry point into AI diagnostics.
- **Service Pills Grid**: Rounded square cards with recognizable icons (Engine, Battery, Towing, Tires, Oil, Shop) convert better than plain text dropdowns.

---

## 2. Distance Calculation & Unit Formatting

### Context
Users requested distance in meters (`m`) for close proximity and kilometers (`km`) for longer distances.

### Technical Decision
Use the Haversine formula implemented in `src/utils/helpers.ts`:
```ts
if (distanceKm < 1) {
  return `${Math.round(distanceKm * 1000)} m`;
}
return `${distanceKm.toFixed(1)} km`;
```
- When GPS location is active: dynamic distance from `currentLocation` to `provider.location`.
- When GPS is denied/pending: fallback coordinate `11.5564, 104.9282` (central Phnom Penh) ensures distance badges never disappear or error out.

---

## 3. Garage & Vehicle State Management

### Context
Customers may have zero, one, or multiple vehicles saved in MariaDB via `api.vehicles.getAll()`.

### Technical Decision
- Fetch `api.vehicles.getAll()` on home screen mount and pull-to-refresh.
- If vehicles exist (`vehicles.length > 0`): Display primary vehicle with status tags (`Good Condition`, `AI Scan Ready`).
- If no vehicles exist: Display an attractive "Add Your Vehicle" onboarding card with 1-tap route to `VehicleAddScreen`.

---

## 4. Active Booking Tracking Integration

### Context
Customers with an ongoing booking (`CONFIRMED`, `IN_PROGRESS`) should see a persistent status banner without hunting through tabs.

### Technical Decision
- Query `useBookingStore.getState().bookings`.
- Filter for active statuses (`b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS'`).
- Display a floating status card with mechanic name, service type, and link to `CustomerTrackingScreen`.
