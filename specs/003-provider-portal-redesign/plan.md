# Implementation Plan: Full Provider Portal Redesign

**Branch**: `003-provider-portal-redesign` | **Date**: 2026-09-19 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-provider-portal-redesign/spec.md`

## Summary

Deliver a comprehensive visual, user experience, and functional overhaul across all 6 provider screens in the TechTune Healer application (`BookingsScreen.tsx`, `ProfileScreen.tsx`, `EarningsScreen.tsx`, `ServicesScreen.tsx`, `ScheduleScreen.tsx`, `ReviewsScreen.tsx`). The redesigned provider portal standardizes on a unified automotive design system (dark cobalt `#2563EB`, emerald green `#16A34A`, crimson `#DC2626`, and elevated cards with high-contrast borders and zero clipping). It equips mechanics and workshop owners with live emergency queue triage, service radius and night-shift controls, gross/net financial analytics with ABA KHQR settlement, catalog customization, weekly working hour management, and customer review replies.

---

## Technical Context

**Language/Version**: TypeScript 5.3+, Node.js 18+  
**Primary Dependencies**: React Native 0.76+, Expo 52+, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`, `@expo/vector-icons`, Zustand (state management)  
**Storage**: Local Zustand persistent cache + Express.js backend with Prisma ORM (SQLite / PostgreSQL)  
**Testing**: Static type checking (`npx tsc --noEmit`), end-to-end user scenario testing via `quickstart.md`  
**Target Platform**: iOS and Android via Expo Go & React Native Native CLI, responsive for mobile viewports  
**Project Type**: Mobile Application + REST API Backend  
**Performance Goals**: 60 FPS transitions, zero list jank, sub-100ms state updates for duty toggles and filter chips  
**Constraints**: 100% Expo Go compatibility (no custom native CocoaPods or Gradle libraries), zero TypeScript errors  
**Scale/Scope**: 6 mobile provider screens, 5 shared service integrations, 1 unified design language  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Modularity & Separation of Concerns)**: All screen implementations maintain clean modularity with styles and helper utilities encapsulated. **PASS**
- **Principle II (Type Safety & Integrity)**: 100% strict TypeScript types across props, states, and API models. **PASS**
- **Principle III (Zero Regressions & Continuity)**: Existing provider authentication, seed data, and navigation routes remain intact. **PASS**
- **Principle IV (Design System Compliance)**: Strict adherence to existing `theme.ts` tokens (`colors.primary`, `colors.success`, `colors.warning`, `colors.error`). **PASS**

---

## Project Structure

### Documentation (this feature)

```text
specs/003-provider-portal-redesign/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan
├── research.md          # Technical decisions & rationale
├── data-model.md        # Schemas & state transitions
├── contracts/           # API endpoints & payloads
│   └── provider-portal-api.md
├── quickstart.md        # Step-by-step verification guide
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── tasks.md             # Implementation tasks (/speckit-tasks output)
```

### Source Code

```text
src/
├── constants/
│   └── theme.ts                    # Colors, typography, spacing, shadows
├── navigation/
│   ├── ProviderNavigator.tsx       # Bottom tabs & stack configuration
│   └── types.ts                    # Navigation route prop types
├── screens/
│   └── provider/
│       ├── BookingsScreen.tsx      # US1: Bookings & emergency dispatch queue
│       ├── ProfileScreen.tsx       # US2: Workshop profile, radius & settings
│       ├── EarningsScreen.tsx      # US3: Financial analytics & KHQR settlements
│       ├── ServicesScreen.tsx      # US4: Service catalog & pricing manager
│       ├── ScheduleScreen.tsx      # US5: Weekly working hours & availability
│       └── ReviewsScreen.tsx       # US6: Customer reputation & review replies
├── store/
│   └── index.ts                    # Zustand stores (useAuthStore, useBookingStore)
└── types/
    └── index.ts                    # Shared domain models

backend/
├── src/
│   └── routes/
│       ├── providers.ts            # Provider profile, settings & services API
│       └── bookings.ts             # Booking status transitions
```

---

## Architectural Audit: Navigation Hierarchy & Screen Flows

### 1. Bottom Navigation Hierarchy Evaluation
The current 4-tab bottom navigation hierarchy consists of:
`[Home (Dashboard) | Bookings (Jobs Queue) | Services (Catalog) | Profile (Workshop & Account)]`

#### Verdict: Is it already good?
**Yes, it is clean, intuitive, and production-ready (9/10).**
- **Home (Dashboard)**: Functions as an executive mission control. It gives the technician immediate situational awareness: online/offline toggle, dispatch radius badge, night duty indicator, 4 core KPIs, and live incoming requests.
- **Bookings**: Deep queue management with real-time text search and 5 status filter chips (`All`, `Pending SOS`, `Active`, `Completed`, `Cancelled`). Equipped with dynamic tab badge for pending requests.
- **Services**: Direct catalog pricing and labor duration management with category filters and interactive modal.
- **Profile**: Workshop branding (ASE certifications, cover photo, response time), dispatch radius slider, night duty toggle, and clean sub-hubs for:
  - *Earnings & Settlements*
  - *Weekly Schedule & Appointments*
  - *Customer Reviews & Official Replies*
  - *Notification Center*

### 2. Operational Flow Analysis
1. **Emergency Roadside Dispatch Flow (10/10)**:
   `Incoming SOS Card (Dashboard/Bookings)` → `Accept Job` → `Open Dispatch Route` → `MechanicTrackingScreen (Full-Screen Live GPS Map + Sinusoidal/OSRM Polyline)` → `Slide-to-Confirm: En Route → Arrived → Complete` → `Invoice Settlement & Auto-Update Store/Prisma`.
2. **Financial Management Flow (9.5/10)**:
   `Dashboard Revenue Box / Profile Link` → `EarningsScreen (Gross/Net/Fee KPIs)` → `Instant ABA KHQR Withdrawal Modal` → `Simulated Disbursement to ABA/Bakong Account & Itemized Ledger`.
3. **Weekly Planning Flow (9/10)**:
   `Profile Link` → `ScheduleScreen (Mon–Sun Operating Hours + 24/7 Night Duty Switch + Today's Hourly Appointment Timeline)`.
4. **Reputation & Feedback Flow (9/10)**:
   `Profile Link` → `ReviewsScreen (4.9 Rating Breakdown + 5-to-1 Star Bars + Interactive Reply to Customer Composer)`.

### 3. Comparison of Archetypes & Potential Enhancements
- **Archetype A: Garage / Workshop Manager (Current - Recommended for TechTune)**:
  `[Home | Bookings | Services | Profile]`
  - Best for garage owners who need quick access to service offerings, labor pricing, and job dispatching.
- **Archetype B: Pure Mobile Field Technician (Alternative Option)**:
  `[Home | Bookings | Earnings | Profile]`
  - Swaps `Services` with `Earnings` on the bottom bar and moves `Services` inside Profile alongside Schedule. Useful if the mechanic checks payouts more frequently than pricing packages.

---

## Phases

### Phase 0: Outline & Research *(Completed)*
- Extracted key UX bottlenecks and design disparities across existing screens.
- Formulated architectural decisions in `research.md`.

### Phase 1: Design & Contracts *(Completed)*
- Modeled data structures, state machines, and Mermaid diagrams in `data-model.md`.
- Specified REST contracts in `contracts/provider-portal-api.md`.
- Formulated step-by-step manual and automated test scenarios in `quickstart.md`.

### Phase 2: Tasks & Implementation *(Completed & Verified)*
- Implemented and modernized all 6 provider screens (`BookingsScreen.tsx`, `ProfileScreen.tsx`, `EarningsScreen.tsx`, `ServicesScreen.tsx`, `ScheduleScreen.tsx`, `ReviewsScreen.tsx`).
- Integrated dynamic `tabBarBadge` on the Bookings tab for pending emergency dispatches.
- Verified zero TypeScript compilation errors (`npx tsc --noEmit`).

