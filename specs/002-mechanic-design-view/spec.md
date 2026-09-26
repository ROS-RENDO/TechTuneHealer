# Feature Specification: Modern Mechanic Design & Provider Experience

**Feature Branch**: `002-mechanic-design-view`

**Created**: 2026-09-19

**Status**: Draft

**Input**: User description: "/speckit-specify any update on mechanic design view"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Provider Live Operations Dashboard & Duty Toggle (Priority: P1)

As an active automotive mechanic or repair shop owner, I want a dedicated, high-contrast operational dashboard where I can instantly toggle my status between "Online / Ready for Dispatch" and "Offline", see today's incoming emergency and scheduled repair bookings, and view my key performance metrics at a glance.

**Why this priority**: Without an intuitive operational command center, service providers cannot signal their real-time availability to stranded motorists, leading to missed jobs, delayed dispatch times, and poor platform trust.

**Independent Test**: Can be tested independently by logging in as a service provider (e.g., Sokha), toggling duty status between Online/Offline, and verifying that the dashboard immediately reflects operational state and incoming requests.

**Acceptance Scenarios**:
1. **Given** an authenticated mechanic opens their dashboard, **When** they view the header, **Then** they see their workshop identity, current rating badge, notification bell with unread indicator, and a prominent Online/Offline duty switch.
2. **Given** a mechanic toggles their status to "Online", **When** updated, **Then** the UI confirms active availability with an emerald indicator and starts listening for nearby roadside requests.
3. **Given** a mechanic views the daily metrics overview, **When** the page renders, **Then** four primary metrics cards are displayed: "Today's Bookings", "Pending Requests", "Completed (This Month)", and "Customer Rating".

---

### User Story 2 - Urgent Roadside Rescue & Job Acceptance Workflow (Priority: P1)

As a mobile technician or roadside rescuer, I want incoming emergency job cards to appear with high visual urgency (flashing badge, customer breakdown symptoms, distance/ETA to stranded driver, and estimated fare), giving me the ability to Accept or Decline in 1 tap.

**Why this priority**: Emergency roadside breakdowns are time-sensitive situations where drivers are stranded in traffic or remote roads; mechanics need concise, actionable breakdown details to respond rapidly.

**Independent Test**: Can be tested independently by sending an emergency roadside booking and observing the immediate presentation of an urgent action card with full customer vehicle details and 1-tap accept/decline buttons.

**Acceptance Scenarios**:
1. **Given** a customer submits an emergency assistance request within the mechanic's service radius, **When** the mechanic's dashboard updates, **Then** an urgent job card surfaces with high-visibility amber/red styling, displaying vehicle make/model, reported issue (e.g. flat tire, battery dead), and distance.
2. **Given** the mechanic taps "Accept Job", **When** confirmed, **Then** the booking status transitions to Accepted, the customer is notified, and a one-touch shortcut opens navigation directly to the customer's GPS coordinates.
3. **Given** the mechanic taps "Decline", **When** confirmed, **Then** the request is cleared from the queue with an optional reason selector (e.g., "Currently busy", "Out of service area").

---

### User Story 3 - Interactive Turn-by-Turn Mechanic Dispatch & Job Lifecycle (Priority: P2)

As an on-duty mechanic travelling to a customer, I want a unified Dispatch Tracking view displaying the customer's breakdown location on a live interactive map, direct contact actions (Call, In-App Chat), and step-by-step progress buttons ("On My Way", "Arrived at Scene", "Diagnosing", "Repair Complete").

**Why this priority**: Keeps both mechanic and customer in sync during the physical repair journey, reducing frantic phone calls and providing clear audit trails for job completion.

**Independent Test**: Can be tested independently by advancing a booking through each status transition step and verifying that the map route, ETA, and action buttons update dynamically.

**Acceptance Scenarios**:
1. **Given** an accepted job is in progress, **When** the mechanic views the dispatch view, **Then** an interactive map shows the navigation route between mechanic location and customer location with distance and estimated arrival time.
2. **Given** the mechanic reaches the customer's vehicle, **When** they tap "Arrived at Scene", **Then** the customer receives an instant arrival alert and the mechanic's action updates to "Start Diagnosis / Work".
3. **Given** the repair is finalized, **When** the mechanic taps "Complete Job", **Then** a service summary sheet opens showing labor fee, parts used, total amount, and customer payment status (Paid / Pending Cash / KHQR).

---

### User Story 4 - Customer-Facing Mechanic Showcase & Workshop Detail View (Priority: P2)

As a car driver browsing the app, I want to view a mechanic's workshop profile with rich visual presentation: workshop photos, verified badges, distance from my current position, operating hours, comprehensive service pricing menu, and genuine verified reviews.

**Why this priority**: Clear, transparent garage profiles build user trust, allowing drivers to make informed repair decisions based on proximity, credentials, and transparent pricing.

**Independent Test**: Can be tested independently by selecting any mechanic from the home or search screen and inspecting the workshop header, services tabs, contact buttons, and verified reviews.

**Acceptance Scenarios**:
1. **Given** a customer selects a mechanic from the search directory, **When** the profile loads, **Then** a prominent workshop banner, verified mechanic badge, exact distance (in meters or kilometers), and aggregate star rating are displayed.
2. **Given** the customer switches between profile tabs, **When** selecting "Services", **Then** an itemized catalog of automotive services with prices, warranty terms, and estimated durations is presented.
3. **Given** the customer views the bottom action bar, **When** ready to proceed, **Then** they have 1-tap access to "Call", "Direct Message", and "Book Service / Emergency Dispatch".

---

### User Story 5 - Provider Earnings, Analytics & Service Catalog Management (Priority: P3)

As a mechanic shop manager, I want to view my weekly and monthly earnings breakdown, track completed transaction history, and easily customize my workshop's service offerings and pricing.

**Why this priority**: Empowers service providers to run their business sustainably on the TechTune platform, encouraging long-term partner retention.

**Independent Test**: Can be tested independently by navigating to the Earnings and Services management tabs, viewing revenue charts, and updating service prices.

**Acceptance Scenarios**:
1. **Given** the provider opens the Earnings screen, **When** rendered, **Then** they see gross earnings, completed job count, platform fee deductions, and a chronological history of payouts.
2. **Given** the provider opens the Services management screen, **When** editing a service, **Then** they can toggle service availability and adjust base service pricing.

---

### Edge Cases

- **Offline / Spotty Network on the Road**: When a mobile mechanic enters a cellular dead zone, the dispatch view must cache customer contact details and address locally, synchronizing status updates automatically once connection recovers.
- **Customer Cancels While Mechanic is En Route**: If a customer cancels an accepted request while the mechanic is heading to the scene, the mechanic receives an immediate audio/haptic alert and a cancellation summary modal detailing any applicable cancellation fee.
- **Provider Toggles Offline with Active Jobs**: If a mechanic attempts to switch their duty toggle to "Offline" while an accepted or in-progress booking is active, the system warns them that existing jobs must be completed or formally reassigned before going off-duty.
- **Multiple Concurrent Emergency Requests**: When multiple nearby emergency dispatches arrive simultaneously, the dashboard presents a priority-ranked carousel allowing the mechanic to select the most relevant dispatch without locking the interface.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Provider dashboard MUST render an unmistakable Online/Offline duty toggle reflecting real-time availability.
- **FR-002**: Provider dashboard MUST display daily business KPIs: Today's Bookings count, Pending Requests count, Completed Jobs count, and Average Customer Rating.
- **FR-003**: Provider dashboard MUST provide quick-navigation tiles to Services, Schedule, Earnings, and Customer Reviews.
- **FR-004**: System MUST display incoming bookings with clear priority badges distinguishing Emergency SOS requests from Scheduled Maintenance.
- **FR-005**: Urgent booking cards MUST feature vehicle make, model, reported issue symptom, distance to customer, and instant 1-tap "Accept" and "Decline" actions.
- **FR-006**: Dispatch view MUST render an interactive map displaying the route between the mechanic and the customer with dynamic distance and ETA.
- **FR-007**: Dispatch view MUST provide direct action buttons for one-touch phone calling and real-time in-app chat with the customer.
- **FR-008**: System MUST support sequential job state transitions: `ACCEPTED` &rarr; `HEADING_TO_CUSTOMER` &rarr; `ARRIVED` &rarr; `IN_PROGRESS` &rarr; `COMPLETED`.
- **FR-009**: Customer-facing mechanic detail view MUST display workshop identity, verified credential badge, operating hours, and real-time distance in meters (`<1 km`) or kilometers (`>=1 km`).
- **FR-010**: Customer-facing mechanic detail view MUST include dedicated sub-navigation for "About Workshop", "Services & Pricing", and "Customer Reviews".
- **FR-011**: Customer-facing mechanic detail view MUST provide persistent sticky bottom actions for "Call Garage", "Chat", and "Book Now / Emergency Dispatch".
- **FR-012**: Provider earnings view MUST present daily, weekly, and monthly revenue totals with itemized completed job payout records.

### Key Entities

- **Provider Profile**: Workshop/mechanic business name, owner name, avatar/logo, phone number, operating schedule, verified status, geographical coordinates, average rating, review count.
- **Mechanic Service**: Service title, category (Emergency, Engine, Tires, Electrical, Oil & Lube), base price, estimated turnaround time, description, active status.
- **Job Dispatch**: Booking reference, customer identity, customer vehicle details (make, model, year, license plate, color), breakdown symptoms/notes, pickup/repair location, dispatch status lifecycle, calculated fare.
- **Earnings Record**: Provider ID, booking ID, gross amount, platform service fee, net payout amount, payment method (ABA KHQR, Cash), transaction timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Mechanics can accept an emergency roadside request from the dashboard within 2 seconds of viewing (1 tap).
- **SC-002**: Duty status toggle (Online/Offline) takes effect and updates visual state in under 300 milliseconds.
- **SC-003**: Customer-facing mechanic profile displays full workshop details, services menu, and reviews with 0 layout shift and initial load under 500 milliseconds.
- **SC-004**: Transitioning job lifecycle states ("On the Way", "Arrived", "Completed") updates both provider and customer screens within 1 second.
- **SC-005**: 100% of customer breakdown details (vehicle make/model, symptoms, GPS coordinates) are clearly legible on the mechanic's dispatch screen without requiring multiple taps.

## Assumptions

- Mechanics have location services enabled on their mobile devices to calculate proximity and navigation routes.
- The existing backend endpoints (`/providers`, `/bookings`, `/auth/profile`) serve as the data layer and support status updates (`ACCEPTED`, `IN_PROGRESS`, `COMPLETED`).
- The user interface adheres to TechTune Healer's premium automotive design system: vibrant primary blues (`#1E40AF`), high-visibility emergency ambers/reds (`#DC2626`, `#F59E0B`), crisp emerald accents (`#16A34A`), and modern elevated cards.
- Both mobile mechanics (roadside dispatch) and stationary garage workshops utilize the same unified provider portal with adaptable dispatch features.
