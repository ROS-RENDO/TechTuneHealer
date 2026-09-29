# Feature Specification: Full Provider Portal Redesign

**Feature Branch**: `003-provider-portal-redesign`

**Created**: 2026-09-19

**Status**: Draft

**Input**: User description: "all page for provider should all redesign"

## User Scenarios & Testing *(mandatory)*

The Provider Portal serves automotive technicians, mechanics, and workshop owners operating on the TechTune Healer network. This specification encompasses the complete visual overhaul, user experience elevation, and operational synchronization across all 6 dedicated provider screens:
1. **Bookings & Emergency Queue Screen** (`BookingsScreen.tsx`)
2. **Workshop Profile & Settings Screen** (`ProfileScreen.tsx`)
3. **Financial Analytics & Payout Center Screen** (`EarningsScreen.tsx`)
4. **Service Catalog & Pricing Screen** (`ServicesScreen.tsx`)
5. **Operating Hours & Schedule Screen** (`ScheduleScreen.tsx`)
6. **Customer Reviews & Reputation Screen** (`ReviewsScreen.tsx`)

---

### User Story 1 - Unified Bookings & Emergency Dispatch Queue (Priority: P1) 🎯 MVP

As a workshop technician or mobile mechanic, I need a comprehensive, high-contrast bookings hub with real-time status filtering (All, Pending SOS, Active En Route, Completed, Cancelled), quick search by customer name or vehicle plate, and elevated dispatch cards so that I can triage jobs without cognitive overload.

**Why this priority**: Managing appointments and urgent roadside requests is the core daily revenue activity for providers.

**Independent Test**: Sign in as a provider, navigate to the Bookings tab, switch between filters (Pending, Active, Completed), search for a customer by vehicle license plate, and trigger status updates directly from the card.

**Acceptance Scenarios**:

1. **Given** a provider is viewing the Bookings screen, **When** they tap the "Pending SOS" filter pill, **Then** only pending emergency and standard booking requests are displayed with prominent vehicle badge and customer distance.
2. **Given** a provider has active dispatches, **When** they tap on any booking card, **Then** they see full vehicle diagnostic telemetry, customer breakdown notes, and 1-tap direct action buttons (Track Mechanic, Call Customer, Chat).
3. **Given** an emergency booking in the queue, **When** the provider selects "Accept", **Then** the booking immediately transitions to `ACCEPTED` and launches turn-by-turn navigation.

---

### User Story 2 - Workshop Identity, Service Radius & Profile Settings (Priority: P1) 🎯 MVP

As a workshop manager or independent mechanic, I need a modern, automotive-grade Profile Screen that showcases my workshop branding, verified mechanical credentials, operating radius in kilometers, night-shift roadside hotline toggle, KHQR payout configuration, and account preferences so that my business appears authoritative to customers.

**Why this priority**: A complete, verified workshop profile directly drives customer booking confidence and establishes operational parameters (e.g. dispatch coverage radius).

**Independent Test**: Open the Profile tab, verify the hero garage photo and verified badges, adjust the dispatch radius slider, toggle the 24/7 Emergency On-Call switch, and verify that changes persist.

**Acceptance Scenarios**:

1. **Given** a provider opens their Profile screen, **When** the page renders, **Then** it displays a hero workshop cover image, certified technician badges, aggregate customer star rating, and completed job milestone count.
2. **Given** a provider is configuring roadside assistance, **When** they adjust the service radius slider (e.g., from 10 km to 25 km), **Then** the active dispatch boundary updates and confirms via an in-app toast notification.
3. **Given** a provider wants to manage payouts, **When** they tap "KHQR / Bank Settlement", **Then** they can link or review their ABA KHQR Merchant account details.

---

### User Story 3 - Financial Analytics, KHQR Settlement & Payout Hub (Priority: P2)

As a workshop owner, I need an elevated financial control center displaying gross revenue, platform service fee deductions (10%), net withdrawable balance, earnings trend charts (Week/Month/Year), and itemized settlement transaction logs with KHQR and Cash badges so that I have complete transparency over cash flow.

**Why this priority**: Mechanics need clear accounting and frictionless withdrawal mechanisms to maintain trust and ongoing engagement with the platform.

**Independent Test**: Open the Earnings screen, toggle time periods between "This Week", "This Month", and "This Year", verify gross vs net calculation, and test the "Withdraw via KHQR" modal trigger.

**Acceptance Scenarios**:

1. **Given** a provider has completed jobs, **When** they view the Earnings screen, **Then** three prominent metric cards display Total Gross Earnings, Platform Fees (10%), and Available Net Balance.
2. **Given** a provider with an available balance over the withdrawal minimum, **When** they tap "Withdraw via KHQR", **Then** an ABA Bank / Bakong payout sheet opens prefilled with their linked account.
3. **Given** past payouts and job payments, **When** viewing the Transaction History, **Then** each item displays the customer vehicle, date, payment method badge (KHQR, Cash, Card), and settlement status.

---

### User Story 4 - Workshop Service Catalog & Dynamic Pricing Manager (Priority: P2)

As a mechanic, I need an intuitive service management screen organized by automotive categories (Routine Maintenance, Diagnostics, Tires & Wheels, Brakes, EV/Hybrid, Engine Overhaul) where I can toggle service availability, edit standard prices in USD, set estimated labor durations, and add custom repair packages.

**Why this priority**: Accurate service catalogs and pricing are essential for customers to book specific repairs with transparent expectations.

**Independent Test**: Open the Services tab, switch between category filter chips, toggle a service's active switch, edit the price of an "Oil Change" package, and create a new custom service.

**Acceptance Scenarios**:

1. **Given** a list of workshop services, **When** the provider selects an automotive category chip, **Then** the list instantly filters to show only matching services.
2. **Given** a service in the catalog, **When** the provider toggles the active switch off, **Then** the service is immediately hidden from customer booking menus.
3. **Given** the "Add New Service" button is tapped, **When** the provider enters a name, category, price, and estimated duration and saves, **Then** the new service appears in the catalog.

---

### User Story 5 - Weekly Operating Hours, Shift Management & On-Call Schedule (Priority: P3)

As a service technician, I need a streamlined weekly schedule planner where I can set daily open/close hours, enable or disable individual working days, configure an on-call emergency night shift, and view a visual timeline of booked customer appointments.

**Why this priority**: Clear working hours prevent customers from booking during closed times and manage technician workload.

**Independent Test**: Open the Schedule screen, toggle "Sunday" to open with custom hours (09:00 - 16:00), toggle the 24/7 Roadside Night Duty switch, and check time slot occupancy.

**Acceptance Scenarios**:

1. **Given** the weekly schedule view, **When** a provider toggles a day of the week off, **Then** that day is marked "Closed" and customers cannot book standard appointment slots for that day.
2. **Given** a working day, **When** the provider adjusts start and end time pickers, **Then** available booking time slots recalculate accordingly.
3. **Given** the timeline tab, **When** the provider selects a specific calendar date, **Then** a chronological list of booked vehicle repair slots is shown with customer names and service types.

---

### User Story 6 - Customer Reputation, Verified Reviews & Feedback Loop (Priority: P3)

As a workshop owner, I need a dedicated reputation management screen featuring an aggregate star rating card, 5-to-1 star distribution bars, customer sentiment summary, verified vehicle tags on reviews, and an in-app mechanic reply tool so that I can engage with customer feedback and improve workshop reputation.

**Why this priority**: Positive social proof and responsive customer service directly influence customer booking conversion rates.

**Independent Test**: Open the Reviews screen, filter by 5-star or critical reviews, view customer vehicle details on the review card, and submit a mechanic response to a customer review.

**Acceptance Scenarios**:

1. **Given** the Reviews screen, **When** rendered, **Then** it presents an aggregate rating header (e.g. 4.9 ★), total review count, and a visual progress bar breakdown across ratings 1 to 5.
2. **Given** a review list, **When** the provider filters by rating stars (All, 5★, 4★, 3★, 2★, 1★), **Then** only matching customer reviews are displayed.
3. **Given** an unreplied customer review, **When** the provider taps "Reply to Customer", types a response, and posts it, **Then** the reply appears nested under the review with an "Official Workshop Response" badge.

---

### Edge Cases

- **Zero Bookings or Reviews**: When a new provider signs in, screens must render modern, encouraging empty state illustrations with clear calls to action rather than blank screens.
- **Offline / Low Connectivity**: Any updates to service prices, availability, or schedule made during connectivity dropouts must queue gracefully and show an informative status banner.
- **Simultaneous Emergency Dispatch**: If an emergency SOS is accepted by another provider first, the booking item must transition smoothly with an alert indicating the job was claimed.
- **Large Vehicle Lists**: Bookings with multiple registered fleet vehicles must render clean, readable badges without text truncation or clipping.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a unified, automotive-themed visual design system across all 6 provider screens using consistent color tokens, typography, and card elevation.
- **FR-002**: Bookings screen MUST support filtering by status (`all`, `pending`, `accepted`, `in_progress`, `completed`, `cancelled`).
- **FR-003**: Bookings screen MUST provide live search functionality filtering by customer name, booking ID, or vehicle license plate.
- **FR-004**: Each booking card MUST prominently display vehicle make, model, year, license plate, breakdown symptoms, and customer proximity distance.
- **FR-005**: Bookings screen MUST support 1-tap quick actions: Accept, Decline, Navigate/Track, Call, and In-App Chat.
- **FR-006**: Profile screen MUST display workshop hero cover image, avatar, business name, contact info, physical address, and verified technician certifications.
- **FR-007**: Profile screen MUST allow providers to configure emergency dispatch radius (5 km to 50 km) and toggle 24/7 on-call availability.
- **FR-008**: Profile screen MUST provide account settings including language selection (English / Khmer), push notification preferences, and safe logout.
- **FR-009**: Earnings screen MUST present high-level financial summary cards: Total Gross Earnings, Platform Fee Deductions (10%), and Withdrawable Net Balance.
- **FR-010**: Earnings screen MUST support period filtering between Week, Month, and Year with visual trend comparisons.
- **FR-011**: Earnings screen MUST display an itemized transaction ledger showing payment method (KHQR, Cash, Card), vehicle serviced, timestamp, and status.
- **FR-012**: Services screen MUST organize workshop offerings by automotive categories (Maintenance, Inspection, Diagnostics, Repair, Tires, Electric/Hybrid).
- **FR-013**: Services screen MUST allow providers to toggle service availability on/off, edit prices in USD, edit estimated duration, and create new services.
- **FR-014**: Schedule screen MUST enable providers to configure active operating days and customize daily opening/closing hours.
- **FR-015**: Schedule screen MUST display a daily appointment calendar timeline indicating booked versus available technician time slots.
- **FR-016**: Reviews screen MUST display aggregate rating metrics, 5-star distribution bars, vehicle tags on review cards, and support official mechanic replies.

---

### Key Entities *(include if feature involves data)*

- **ProviderProfile**: Represents the registered workshop or mobile technician (name, garageName, phone, avatar, coverImage, address, latitude, longitude, dispatchRadiusKm, isEmergencyOnCall, rating, totalJobs).
- **BookingRequest**: Represents a customer service or emergency roadside request (id, customerName, customerPhone, vehicleMake, vehicleModel, vehiclePlate, serviceType, symptoms, status, estimatedPrice, distanceKm, createdAt).
- **ServiceOffering**: Represents a workshop service package (id, providerId, name, category, description, price, durationMinutes, isActive).
- **ScheduleRule**: Represents weekly working hours configuration (dayOfWeek, isOpen, openTime, closeTime, hasEmergencyNightShift).
- **PayoutTransaction**: Represents a financial credit or payout settlement (id, providerId, amount, type, method, status, bookingId, createdAt).
- **CustomerReview**: Represents customer feedback on completed service (id, providerId, customerName, vehicleModel, rating, comment, reply, createdAt).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Providers can triage and accept or decline a pending emergency job in under 5 seconds from the Bookings screen.
- **SC-002**: 100% of provider screens (Bookings, Profile, Earnings, Services, Schedule, Reviews) adhere to the dark cobalt/automotive design tokens with zero visual clipping or overflow.
- **SC-003**: Service catalog price and availability changes take effect immediately without requiring app restarts.
- **SC-004**: Payout and earnings calculations accurately reflect the 10% platform fee across all displayed periods.
- **SC-005**: Static TypeScript validation across mobile client and backend completes with 0 errors.

---

## Assumptions

- Providers operate primarily on mobile devices (iOS & Android via Expo React Native).
- Payout transactions are denominated in US Dollars (USD) with KHQR / ABA Bank settlement support standard in Cambodia.
- Provider authentication and session state are managed by `useAuthStore` with role `PROVIDER`.
- Existing backend API endpoints and mock data models support extension for provider schedule and reviews.
