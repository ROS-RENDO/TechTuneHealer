# Implementation Plan: Modern Mechanic Design & Provider Experience

**Branch**: `002-mechanic-design-view` | **Date**: 2026-09-19 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-mechanic-design-view/spec.md`

## Summary

Modernize the comprehensive mechanic and service provider experience across both provider command centers and customer-facing garage profiles. This includes:
1. **Provider Operational Command Center**: A real-time Online/Offline duty toggle switch, daily business KPIs, and quick access to services and earnings.
2. **Emergency Roadside Rescue Job Cards**: Urgent high-contrast cards surfacing breakdown symptoms, vehicle make/model/plate, distance/ETA, and 1-tap Accept/Decline actions.
3. **Dispatch & Tracking Lifecycle**: Turn-by-turn interactive map tracking and clear status progressions (`ACCEPTED` &rarr; `HEADING_TO_CUSTOMER` &rarr; `ARRIVED` &rarr; `IN_PROGRESS` &rarr; `COMPLETED`).
4. **Customer-Facing Mechanic Detail Overhaul**: Clean automotive header, dynamic meter/km proximity formatting, transparent service pricing catalog, and verified reviews.

## Technical Context

**Language/Version**: TypeScript 5.9+, React 19.2, React Native 0.86 (New Architecture enabled), Node.js 20+

**Primary Dependencies**: `expo-router`, `@react-navigation/*`, `react-native-maps`, `expo-location`, `zustand`, `@expo/vector-icons`, `axios`, `express`, `@prisma/client`

**Storage**: AsyncStorage (client session) + MariaDB via Express API (`/providers`, `/bookings`, `/auth`)

**Testing**: Static TypeScript check (`tsc --noEmit`), Expo bundling validation (`npx expo start -c`)

**Target Platform**: iOS (Expo Go physical device & Simulator) and Android

**Project Type**: Mobile React Native App with Express/Prisma Backend

**Performance Goals**: 60 FPS UI transitions, sub-300ms duty status updates, sub-500ms initial screen render

**Constraints**: Strict mobile responsiveness, offline resilience for intermittent road connectivity, Haversine proximity calculations

**Scale/Scope**: Provider dashboard & sub-screens, customer provider detail screen, dispatch tracking screen, backend booking lifecycle routes

## Constitution Check

*GATE: Passed before Phase 0 research and re-validated post-design.*

- **Architecture Boundary**: Provider components remain cleanly separated in `src/screens/provider/` and `src/screens/mechanic/`, while customer-facing detail remains in `src/screens/customer/ProviderDetailScreen.tsx`.
- **State Management**: Uses established Zustand stores (`useBookingStore`, `useAuthStore`, `useLocationStore`, `useProviderSearchStore`) for instantaneous optimistic UI updates.
- **Backward Compatibility**: Fully preserves existing booking records, seed data (`sokha@test.com`), and customer-to-provider routing.
- **Expo Go Portability**: Avoids external native pods or custom modules, ensuring 100% compatibility with Expo Go on physical iPhones and Android devices.

## Project Structure

### Documentation (this feature)

```text
specs/002-mechanic-design-view/
├── plan.md              # This implementation plan
├── research.md          # Phase 0: Automotive provider UX & dispatch architecture
├── data-model.md        # Phase 1: Entity definitions & lifecycle state machine
├── quickstart.md        # Phase 1: Verification scenarios & validation guide
├── contracts/           # Phase 1: API endpoint specifications
│   └── provider-api-contract.md
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── tasks.md             # Phase 2: Actionable task list (created via /speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── screens/
│   ├── provider/
│   │   ├── DashboardScreen.tsx        # Provider command center with duty toggle & KPIs
│   │   ├── BookingsScreen.tsx         # Filterable booking management
│   │   ├── ServicesScreen.tsx         # Itemized workshop services catalog
│   │   ├── EarningsScreen.tsx         # Revenue and payout breakdown
│   │   └── ProfileScreen.tsx          # Provider workshop profile editor
│   ├── mechanic/
│   │   └── MechanicTrackingScreen.tsx # Interactive dispatch map & lifecycle progression
│   └── customer/
│       └── ProviderDetailScreen.tsx   # Customer view of garage, services & reviews
├── navigation/
│   └── ProviderNavigator.tsx          # Provider bottom tabs & stack transitions
├── store/
│   ├── index.ts                       # Zustand stores (Auth, Booking, Location, Providers)
│   └── slices/                        # Modular store slices
└── utils/
    └── helpers.ts                     # Distance and currency formatters

backend/
├── src/
│   ├── routes/
│   │   ├── bookings.ts                # Booking status lifecycle & provider queries
│   │   ├── providers.ts               # Provider profiles, services & availability
│   │   └── auth.ts                    # Authentication & role resolution
│   └── prisma/
│       └── schema.prisma              # Data models (ServiceProvider, Booking, User)
```

**Structure Decision**: Refactor and elevate existing provider and customer screens directly in their modular directories without creating disruptive parallel folder hierarchies.

## Complexity Tracking

*No constitutional violations identified.*
