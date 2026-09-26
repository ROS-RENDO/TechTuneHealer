# Feature Specification: Redesign Customer Home Page

**Feature Branch**: `001-redesign-customer-home`

**Created**: 2026-09-18

**Status**: Draft

**Input**: User description: "Redesign customer home page with modern automotive aesthetics, vehicle health garage widget, 24/7 SOS rescue banner, and nearby mechanics with meter/km distance"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Instant Emergency Roadside Rescue (Priority: P1)

When a driver is stranded on the road (flat tire, dead battery, engine overheating), they need to instantly access emergency roadside assistance directly from the home screen in 1 tap without navigating complex menus.

**Why this priority**: Emergency roadside help is the core mission-critical differentiator of TechTune Healer. Drivers in distress require immediate visual recognition and single-tap dispatch.

**Independent Test**: Can be tested independently by launching the app and tapping the Emergency SOS widget; the user is immediately taken to the Emergency Roadside dispatch screen with location pre-filled.

**Acceptance Scenarios**:
1. **Given** a customer is on the home page, **When** they view the screen, **Then** they see an unmistakable, high-contrast 24/7 Emergency Assistance widget featuring roadside dispatch availability.
2. **Given** a customer taps the Emergency widget, **When** the tap registers, **Then** the application navigates immediately to the Emergency dispatch screen without delay.

---

### User Story 2 - Discover Nearby Mechanics with Meter/KM Distance (Priority: P1)

A customer seeking routine maintenance or repair needs to immediately see available mechanics near their physical location, complete with clear distance indicators (in meters if under 1 km, or kilometers if 1 km or more), real-time rating, and availability status.

**Why this priority**: Choosing a mechanic based on proximity and trust is the primary daily action for customer users.

**Independent Test**: Can be tested independently by verifying that the "Nearby Mechanics" section populates with active mechanic cards displaying distance badges (e.g. `650 m` or `1.4 km`), star ratings, and direct tap-to-view.

**Acceptance Scenarios**:
1. **Given** the customer has active location, **When** viewing the home page, **Then** a curated list of nearby mechanics is displayed ordered by proximity.
2. **Given** a mechanic is located 450 meters away, **When** rendered on screen, **Then** their distance badge displays `450 m`.
3. **Given** a mechanic is located 2.3 kilometers away, **When** rendered on screen, **Then** their distance badge displays `2.3 km`.
4. **Given** the customer taps on any mechanic card, **When** clicked, **Then** the customer is taken to that mechanic's full detail and service booking screen.

---

### User Story 3 - "My Garage" Vehicle Health Card & AI Diagnostic (Priority: P2)

A car owner wants a dedicated "My Garage" widget on their home page displaying their registered vehicle (Make, Model, Year, Plate Number), current vehicle health status, and a 1-tap shortcut to launch AI Diagnostics.

**Why this priority**: Encourages preventive car care and habitual engagement with the app beyond one-time emergency breakdowns.

**Independent Test**: Can be tested independently by verifying that a registered customer's vehicle is displayed with health status, or an "Add Vehicle" prompt appears if no vehicle exists.

**Acceptance Scenarios**:
1. **Given** a customer has a saved vehicle (e.g., Toyota Camry 2020), **When** they open the home page, **Then** the "My Garage" card shows their vehicle name, plate number, and status overview.
2. **Given** the customer taps the "AI Diagnostic" action on the garage card, **When** triggered, **Then** the application opens the AI Diagnostic scanner camera.
3. **Given** a new customer with no vehicles registered, **When** viewing the garage card, **Then** an inviting "Add Your Vehicle" prompt is shown that routes to the vehicle registration flow.

---

### User Story 4 - Interactive Automotive Service Category Grid (Priority: P2)

A customer needs to quickly find specific services (e.g., Oil Change, Battery, Tires, Engine, Towing, Auto Parts) through clean, automotive-styled category pills.

**Why this priority**: Speeds up navigation and filters the directory down to exact service requirements in one touch.

**Independent Test**: Can be tested independently by tapping any service category (e.g., "Tires") and verifying the customer is transitioned to the Search page pre-filtered for that category.

**Acceptance Scenarios**:
1. **Given** the customer is browsing the home page, **When** viewing the Quick Services grid, **Then** they see dedicated category cards with recognizable automotive iconography.
2. **Given** the customer taps "Battery", **When** selected, **Then** the application opens the search directory filtered to battery specialists.

---

### User Story 5 - Live Active Booking Tracker Banner (Priority: P3)

If a customer currently has an active, upcoming, or in-progress booking, a persistent tracking banner should appear on the home screen showing mechanic name, status, and ETA.

**Why this priority**: Eliminates user anxiety by providing instant status visibility without having to check the Bookings tab.

**Independent Test**: Can be tested independently by creating a booking and confirming the live status banner appears at the top of the home feed.

**Acceptance Scenarios**:
1. **Given** a customer has an active booking with status `IN_PROGRESS`, **When** they view the home page, **Then** a prominent status card appears showing "Mechanic on the way" and a link to live GPS tracking.
2. **Given** a customer has no active bookings, **When** they view the home page, **Then** no active booking banner is shown and normal content flows seamlessly.

---

### Edge Cases

- **Location Services Disabled / Denied**: Home page defaults to central Phnom Penh coordinates (`11.5564, 104.9282`) and gracefully calculates relative distances without crashing.
- **No Mechanics Found within Radius**: The section displays an informative empty state illustration with a button to expand search radius or browse all providers.
- **Customer with Multiple Vehicles**: The garage card highlights the primary vehicle while providing a subtle switcher pill to view other garage cars.
- **Offline / Network Disconnection**: Cached vehicle and mechanic details are shown where available, with a non-intrusive retry banner.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a personalized top app bar featuring current location address, customer name/greeting, avatar, and notification center shortcut.
- **FR-002**: System MUST render a prominent 24/7 Emergency Assistance hero card that navigates directly to the emergency roadside assistance flow upon press.
- **FR-003**: System MUST calculate distance between customer's current GPS location and each mechanic's coordinates using the Haversine formula.
- **FR-004**: System MUST display distance in meters (`X m`) when distance is strictly less than 1.0 km, and in kilometers (`X.X km`) when distance is 1.0 km or greater.
- **FR-005**: System MUST display a "My Garage" widget highlighting the customer's registered vehicle details (make, model, plate number, health tag).
- **FR-006**: System MUST provide a 1-tap "AI Diagnostics" action inside the garage card directing users to the diagnostics camera and symptom analyzer.
- **FR-007**: System MUST provide an empty-state vehicle card inviting user to "Add Vehicle" if the customer's account has no registered vehicles.
- **FR-008**: System MUST render an interactive automotive service category grid (Emergency, Diagnostics, Oil & Lube, Tires, Battery, Auto Parts).
- **FR-009**: System MUST navigate to the Search & Map directory with pre-selected category filter when a category card is pressed.
- **FR-010**: System MUST display a "Nearby Mechanics" list with mechanic name, address, verified badge, star rating, review count, distance badge, availability tag, and a direct "Book" button.
- **FR-011**: System MUST conditionally display an active booking status banner when an active booking exists (`CONFIRMED`, `IN_PROGRESS`).
- **FR-012**: System MUST support pull-to-refresh to fetch updated nearby mechanics, active vehicle status, and bookings.

### Key Entities

- **Customer Profile**: User identity, display name, avatar, notification preferences.
- **User Vehicle**: Make, model, year, license plate, color, maintenance status.
- **Service Provider**: Business name, verified status, geographical coordinates (`latitude`, `longitude`), rating, review count, availability, supported services.
- **Booking**: Current service state (`PENDING`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`), scheduled time, mechanic assigned.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A customer can trigger emergency roadside assistance from the home screen in under 2 seconds (1 tap).
- **SC-002**: 100% of displayed nearby mechanics show accurate distance units (`m` for <1 km, `km` for >=1 km).
- **SC-003**: Initial home screen rendering and layout completes in under 500ms on standard mobile devices without visual layout shift.
- **SC-004**: Pull-to-refresh re-queries and updates nearby providers and vehicle health data in under 1 second on standard Wi-Fi/4G.
- **SC-005**: Customers can access AI diagnostics from the home page in exactly 1 tap.

## Assumptions

- Customer device has GPS hardware available; when permissions are withheld, central Phnom Penh (`11.5564, 104.9282`) serves as the default reference point.
- Backend API endpoints `/providers`, `/vehicles`, and `/bookings` are active and accessible via `http://192.168.100.171:4000`.
- Dark and light visual balance follows modern automotive mobile standards (deep blues `#1E40AF`, emergency reds `#DC2626`, emerald green `#16A34A`, clean elevated neutral `#FFFFFF` / `#F8F9FA` cards).
