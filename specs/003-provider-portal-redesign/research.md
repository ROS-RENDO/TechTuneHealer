# Research & Architecture Decisions: Full Provider Portal Redesign

**Feature Branch**: `003-provider-portal-redesign`  
**Date**: 2026-09-19  
**Status**: Completed  
**Spec**: [spec.md](spec.md)

---

## 1. Executive Summary

This research document analyzes the technical requirements, design patterns, and architectural decisions necessary to execute a comprehensive visual and operational redesign of all 6 dedicated provider screens in TechTune Healer:
1. `src/screens/provider/BookingsScreen.tsx`
2. `src/screens/provider/ProfileScreen.tsx`
3. `src/screens/provider/EarningsScreen.tsx`
4. `src/screens/provider/ServicesScreen.tsx`
5. `src/screens/provider/ScheduleScreen.tsx`
6. `src/screens/provider/ReviewsScreen.tsx`

---

## 2. Architectural Decisions

### Decision 1: Unified Automotive Design System Across All Provider Screens
- **Decision**: Standardize all 6 screens around TechTune's high-contrast automotive design system using Cobalt Blue (`#2563EB`), Emerald Green (`#16A34A`), Dark Slate (`#0F172A`), and Crimson Red (`#DC2626`) alert badges.
- **Rationale**: Previously, provider screens used disparate styles (some used gray initial letters, some had basic flat lists, and some lacked consistent typography or card shadows). Unifying them gives workshop owners and mobile technicians a cohesive, enterprise-grade DMS (Dealer Management System) experience.
- **Alternatives Considered**:
  - *Keep screens isolated with custom colors*: Rejected due to visual inconsistency and maintenance overhead.
  - *Use third-party UI library (e.g. Paper)*: Rejected to preserve lightweight bundle size and zero Expo Go compatibility issues.

---

### Decision 2: High-Contrast Triage in Bookings Screen (`BookingsScreen.tsx`)
- **Decision**:
  - Implement a 5-way segmented status filter pill bar (`All`, `Pending SOS`, `Active En Route`, `Completed`, `Cancelled`).
  - Add a live search bar filtering across customer name, phone number, vehicle license plate, and breakdown symptoms.
  - Elevate booking cards to display customer vehicle make/model, license plate pill, breakdown symptoms tag, and 1-tap quick actions (Accept, Decline, Track/Navigate, Call, Chat).
- **Rationale**: Mechanics in the field need to triage roadside emergencies in seconds. The card layout must prioritize urgency, vehicle type, and customer location.
- **Alternatives Considered**:
  - *Paginated table view*: Rejected because mobile technicians require touch-friendly cards with high thumb accessibility.

---

### Decision 3: Workshop Identity, Service Radius & Settings (`ProfileScreen.tsx`)
- **Decision**:
  - Add workshop hero cover banner with verified technician credential badges (`ASE Certified`, `Master Hybrid Specialist`, `Verified Garage`).
  - Introduce an interactive **Service Radius Slider** (5 km to 50 km) enabling mechanics to control how far they will travel for roadside emergency dispatches.
  - Add a **24/7 Roadside On-Call Switch** and an **ABA KHQR Settlement Account** setup card.
- **Rationale**: Workshop identity establishes customer trust, while service radius and night shift settings prevent technicians from receiving requests outside their physical reach.
- **Alternatives Considered**:
  - *Hardcoding fixed 15 km radius*: Rejected because city mechanics prefer tight 5–10 km radiuses, while provincial mechanics cover up to 50 km.

---

### Decision 4: Financial Analytics & Payout Center (`EarningsScreen.tsx`)
- **Decision**:
  - Surface 3 primary KPI cards: **Gross Revenue**, **Platform Fee (10%)**, and **Net Available Balance**.
  - Provide a 3-tab time period selector (**This Week**, **This Month**, **This Year**) with visual earnings breakdown bars.
  - Integrate an **ABA KHQR & Bakong Settlement Sheet** for instant digital withdrawals.
  - Render an itemized transaction ledger with badges for payment method (`KHQR`, `Cash`, `Card`) and settlement status.
- **Rationale**: Financial transparency builds provider loyalty and prevents confusion over platform commission fees.
- **Alternatives Considered**:
  - *Single raw balance number*: Rejected because mechanics need to see exact gross vs net breakdowns.

---

### Decision 5: Service Catalog Categorization & CRUD (`ServicesScreen.tsx`)
- **Decision**:
  - Organize service items into clear automotive category chips: **All**, **Routine Maintenance**, **Inspection**, **Diagnostics**, **Brakes & Suspension**, **Tires & Wheels**, and **EV / Hybrid**.
  - Provide 1-tap active/inactive toggle switches per service with immediate store persistence.
  - Feature an inline/modal service editor allowing mechanics to modify prices (USD) and estimated duration (minutes) and add custom repair packages.
- **Rationale**: Allows mechanics to quickly update prices during parts price fluctuations or disable services when equipment is unavailable.

---

### Decision 6: Weekly Schedule & Availability Planner (`ScheduleScreen.tsx`)
- **Decision**:
  - Provide a 7-day weekly schedule manager with toggle switches for each day of the week and start/end time pickers.
  - Include an **Emergency Night Shift On-Call Toggle** separate from standard workshop open hours.
  - Display a visual daily appointment timeline showing booked vs available technician slots.
- **Rationale**: Prevents customer bookings when the garage is closed and accommodates 24/7 mobile roadside units.

---

### Decision 7: Customer Reviews & Reputation Management (`ReviewsScreen.tsx`)
- **Decision**:
  - Render an aggregate rating hero card (e.g. 4.9 ★) with 5-star to 1-star visual percentage distribution bars.
  - Render verified customer review cards with vehicle tags (e.g. *Lexus RX350*, *Toyota Land Cruiser*) and service badges.
  - Support an in-app **"Reply to Customer"** composer enabling mechanics to acknowledge reviews publicly.
- **Rationale**: Review responses demonstrate active customer service and improve customer conversion on the platform.

---

## 3. Technology Stack & Constraints Summary

| Layer | Choice | Details |
| :--- | :--- | :--- |
| **Mobile Client** | React Native / Expo 52+ | TypeScript strict typing, zero native pod additions, 100% Expo Go compatible |
| **Styling Tokens** | Theme constants (`src/constants/theme.ts`) | Strict palette indexing (`50`, `100`, `500`, `600`, `700`), `shadows.md`, `borderRadius.xl` |
| **State Management**| Zustand stores (`useAuthStore`, `useBookingStore`) | Optimistic client updates + backend REST sync |
| **Backend Endpoints**| Express.js + Prisma ORM | Modular routes in `backend/src/routes/` |
| **Type Validation** | `npx tsc --noEmit` | Strict 0 errors policy across both client and server |
