# Quickstart Validation: Modern Mechanic Design & Provider Experience

**Feature**: Modern Mechanic Design & Provider Experience  
**Spec**: [specs/002-mechanic-design-view/spec.md](spec.md)  
**Date**: 2026-09-19

## Prerequisites
1. Backend server running on `http://192.168.100.171:4000` (or `localhost:4000`).
2. Metro development server running (`npx expo start -c`).
3. Seed accounts available in MariaDB database:
   - **Provider**: `sokha@test.com` / `password123`
   - **Customer**: `customer@test.com` / `password123`

---

## Scenario 1: Provider Duty Switch & Operational Dashboard Verification

1. Open TechTune Healer on mobile or emulator.
2. Sign in with Provider credentials:
   - Email: `sokha@test.com`
   - Password: `password123`
3. **Verify Dashboard Header**:
   - Workshop name ("Sokha Auto Repair" or Provider name) is clearly displayed.
   - The Online/Offline duty switch is visible in the top header.
   - Tapping the switch updates the visual state to "Online" (emerald badge) instantly (<300ms).
4. **Verify Operational Metrics**:
   - 4 primary metric cards are visible: "Today's Bookings", "Pending Requests", "Completed (Month)", and "Rating".
   - Quick action grid provides direct access to Services, Schedule, Earnings, and Reviews.

---

## Scenario 2: Urgent Emergency Roadside Job Acceptance

1. On the provider dashboard, locate a pending emergency booking.
2. **Verify Emergency Card Presentation**:
   - Visual styling has high-contrast priority indicators (warning badge `EMERGENCY SOS`).
   - Customer breakdown details are visible directly on the card: vehicle make/model (e.g. Toyota Prius), reported issue, and distance/ETA.
3. Tap **"Accept Job"**:
   - Status updates optimistically to `Accepted`.
   - Card displays navigation action: "Start Dispatch Navigation".

---

## Scenario 3: Dispatch Lifecycle Progression

1. From the accepted job, navigate to the Dispatch Tracking screen (`MechanicTrackingScreen`).
2. Verify interactive route map between provider base and stranded motorist.
3. Tap **"Heading to Customer"** &rarr; Verify status transition.
4. Tap **"Arrived at Scene"** &rarr; Verify arrival alert.
5. Tap **"Complete Job"** &rarr; Verify invoice summary displays total fare ($ USD) and completes the order.

---

## Scenario 4: Customer-Facing Mechanic Profile Inspection

1. Log out or sign in as customer (`customer@test.com` / `password123` or verified Google account).
2. On Home or Search, tap on "Sokha Auto Repair".
3. **Verify Provider Detail View**:
   - Map header displays workshop GPS marker.
   - Distance pill displays accurate distance formatting (`X m` or `X.X km`).
   - Verified credential badge is rendered.
   - Tabs allow switching smoothly between "About", "Services & Pricing", and "Reviews".
   - Sticky bottom bar provides 1-tap "Call Garage" and "Book Emergency Roadside Rescue".
