# Research: Modern Mechanic Design & Provider Experience

**Feature**: Modern Mechanic Design & Provider Experience  
**Spec**: [specs/002-mechanic-design-view/spec.md](spec.md)  
**Date**: 2026-09-19

## 1. Real-Time Duty Toggle & Availability Architecture

### Decision
Store mechanic duty status (`isOnline: boolean`) in persistent client state via `useAuthStore` and synchronize with the backend provider record (`isAvailable: boolean`).

### Rationale
- Stranded motorists requiring emergency roadside assistance rely on real-time availability indicators.
- Having an explicit visual duty toggle in the mechanic's top app bar gives the mechanic full control over when they are on-call.
- Offline mechanics are omitted from instant roadside SOS dispatch queues, avoiding frustrating unanswered requests for drivers in distress.

### Alternatives Considered
- *Automatic presence based on app foregrounding*: Rejected because mechanics often keep their phone in their pocket or mount it on their vehicle dashboard while on duty or taking a break.
- *Strict shift schedule calendar only*: Rejected because mobile roadside mechanics in Cambodia operate flexibly on-demand.

---

## 2. Emergency Roadside Dispatch Card Aesthetics & UX

### Decision
Implement high-contrast urgent dispatch cards directly in the provider dashboard feed using emergency styling tokens:
- Distinctive warning amber/red badge: `EMERGENCY SOS DISPATCH`
- High-visibility vehicle banner: `Make, Model, Year, Plate Number, Color`
- Breakdown symptoms: Reported issue highlighted in red/amber tag
- Proximity metric: Meter/km distance and estimated drive time (e.g. `1.2 km • 6 min away`)
- 1-Tap actions: "Accept Job" (Prominent `#16A34A` Emerald / `#1E40AF` Primary Blue) and "Decline" (Neutral outline)

### Rationale
- In high-stress roadside emergency scenarios, mobile mechanics must parse critical job parameters in under 2 seconds while preparing tools or driving.
- Placing full breakdown details directly on the card eliminates unnecessary sub-screen navigation taps.

### Alternatives Considered
- *Full-screen modal takeover*: Disruptive if the mechanic is currently checking previous customer records or schedule. A persistent priority top card in the dashboard provides immediate access without locking out navigation.

---

## 3. Step-by-Step Job Lifecycle Transitions

### Decision
Standardize the booking lifecycle into 5 deterministic sequential states:
1. `PENDING`: Request received, awaiting provider acceptance.
2. `ACCEPTED`: Provider accepted; dispatch route unlocked.
3. `HEADING_TO_CUSTOMER`: Provider en route; live GPS tracking active for customer.
4. `ARRIVED`: Provider arrived at vehicle breakdown scene; diagnostic begins.
5. `IN_PROGRESS`: Repair / maintenance active.
6. `COMPLETED`: Work completed, invoice generated, payment collected.

### Rationale
- Eliminates customer anxiety by providing real-time milestones.
- Gives the mechanic clear, intuitive 1-tap progress buttons in `MechanicTrackingScreen.tsx` and `DashboardScreen.tsx`.
- Matches the Prisma backend schema where `BookingStatus` enum is modeled.

---

## 4. Customer-Facing Mechanic Profile Modernization

### Decision
Upgrade [`src/screens/customer/ProviderDetailScreen.tsx`](file:///d:/CamtechUniversity/ProgrammingYearIII/techtune-healer/src/screens/customer/ProviderDetailScreen.tsx) with:
- Automotive hero banner with interactive map preview and verified certification badge.
- Proximity indicator formatted with `getFormattedDistance` (`650 m` or `2.4 km`).
- 3 clear segment tabs: "About Garage", "Services & Pricing", and "Verified Reviews".
- Sticky bottom action bar featuring 1-tap **Call**, **Chat**, and **Book Emergency Rescue**.

### Rationale
- Customers need immediate confidence in a mechanic's credentials, location, and upfront pricing before handing over their vehicle or requesting remote dispatch.

---

## 5. Technology Stack & Platform Compatibility

| Technology | Selection | Purpose |
| :--- | :--- | :--- |
| **Mobile Client** | React Native 0.76+ / Expo SDK 52 | Cross-platform iOS & Android in Expo Go. |
| **Navigation** | React Navigation Native Stack & Bottom Tabs | Smooth, native transition between Dashboard, Dispatch, and Detail views. |
| **State Management** | Zustand (`useBookingStore`, `useAuthStore`) | Instant optimistic UI updates across mechanic and customer flows. |
| **Design Tokens** | TechTune Theme (`colors`, `spacing`, `shadows`) | Consistent automotive-grade visual language. |
| **Backend API** | Node.js / Express / Prisma MariaDB | RESTful status updates and persistent booking records. |
