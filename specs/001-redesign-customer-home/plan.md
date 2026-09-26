# Implementation Plan: Redesign Customer Home Page

**Branch**: `001-redesign-customer-home` | **Date**: 2026-09-18 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-redesign-customer-home/spec.md`

## Summary

Redesign the TechTune Healer Customer Home Screen into a modern, automotive-grade home experience. Replaces the basic placeholder layout with a location-aware header, interactive search, high-contrast 24/7 Roadside Rescue SOS card, a "My Garage" vehicle health widget with 1-tap AI Diagnostics, quick-filter service category pills, and enhanced nearby mechanic cards with dynamic meter/km distance formatting.

## Technical Context

**Language/Version**: TypeScript 5.9+, React 19.2, React Native 0.86 (New Architecture enabled)

**Primary Dependencies**: `expo-router`, `@react-navigation/*`, `react-native-maps`, `expo-location`, `zustand`, `@expo/vector-icons`, `expo-linear-gradient`

**Storage**: AsyncStorage (auth session token) + MariaDB via Express API (`/providers`, `/vehicles`, `/bookings`)

**Testing**: Static TypeScript validation (`tsc --noEmit`), Expo bundling validation (`npx expo export --platform ios --no-bytecode`)

**Target Platform**: iOS (Expo Go physical iPhone & Simulator) and Android

**Project Type**: React Native Mobile Client

**Performance Goals**: 60 FPS smooth scrolling, sub-500ms initial screen render, <1s pull-to-refresh

**Constraints**: Strict mobile responsiveness, offline resilience with Phnom Penh fallback coordinates (`11.5564, 104.9282`)

**Scale/Scope**: 1 primary screen overhaul (`HomeScreen.tsx`) + subcomponents/helpers

## Constitution Check

*GATE: Passed before Phase 0 research and re-validated post-design.*

- **Architecture Boundary**: Screen lives cleanly in `src/screens/customer/HomeScreen.tsx` using established Zustand store architecture (`useAuthStore`, `useLocationStore`, `useProviderSearchStore`, `useBookingStore`).
- **Zero Regression**: Preserves all existing navigation targets (`Emergency`, `Diagnostics`, `CustomerTabs`, `ProviderDetail`, `VehicleAdd`, `Shop`).
- **Device Portability**: Runs natively in Expo Go without requiring custom native compilation or CocoaPods linking.

## Project Structure

### Documentation (this feature)

```text
specs/001-redesign-customer-home/
├── plan.md              # This file
├── research.md          # Phase 0: Automotive UX & distance technical research
├── data-model.md        # Phase 1: View models and entities
├── quickstart.md        # Phase 1: Verification and testing walkthrough
├── contracts/           # Phase 1: API endpoints contract
│   └── home-api-contract.md
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code (repository root)

```text
src/
├── screens/customer/
│   └── HomeScreen.tsx       # Overhauled home experience with all widgets
├── utils/
│   └── helpers.ts           # getFormattedDistance (meters and km formatting)
├── store/
│   └── index.ts             # Auth, Location, Providers, Bookings stores
└── services/
    └── api.ts               # providersApi, vehiclesApi, bookingsApi
```

**Structure Decision**: Overhaul `src/screens/customer/HomeScreen.tsx` directly while keeping modular subcomponents (`QuickActionCard`, `ProviderCard`, `GarageCard`, `EmergencyBanner`) organized inside the file for high rendering efficiency.

## Complexity Tracking

*No constitutional violations identified.*
