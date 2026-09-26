# Quickstart Validation Guide: Full Provider Portal Redesign

**Feature Branch**: `003-provider-portal-redesign`  
**Date**: 2026-09-19  
**Status**: Completed  
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

---

## 1. Prerequisites & Test Accounts

Start the application with backend API services:
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Mobile App
npx expo start -c
```

### Credentials
- **Provider Account**:
  - Email: `sokha@test.com`
  - Password: `password123`
  - Role: `PROVIDER` (Mechanic / Workshop Owner)
- **Customer Account**:
  - Email: `customer@test.com`
  - Password: `password123`
  - Role: `CUSTOMER`

---

## 2. Validation Scenarios

### Scenario 1: Bookings Queue & Emergency SOS Triage
1. Sign in as `sokha@test.com`.
2. Tap the **"Bookings"** tab in the bottom navigation bar.
3. Switch between filter pills: `All`, `Pending`, `Accepted`, `In Progress`, `Completed`.
4. In the search bar, type `2A-8888` or `Lexus`; verify list filters instantly to matching customer vehicles.
5. On a pending emergency request card, verify that:
   - Vehicle badge (*Lexus RX350 · 2024 · 2A-8888*) is clearly displayed.
   - Breakdown symptom tag (*Flat Tire - Front Left*) is highlighted.
   - Proximity tag (*1.4 km away*) is visible.
6. Tap **"Accept Job"**; verify booking status transitions to `accepted` and tracking launches.

---

### Scenario 2: Workshop Identity, Radius & Settings
1. Tap the **"Profile"** tab in the bottom navigation bar.
2. Verify the hero workshop cover image, garage avatar, verified badges, and aggregate rating.
3. In the **Dispatch Settings** card, drag the Service Radius slider to `25 km`.
4. Toggle the **24/7 Roadside On-Call** switch.
5. Review the linked **ABA KHQR Settlement** details.

---

### Scenario 3: Financial Analytics & Payout Center
1. Navigate to **Earnings** (from the Profile menu or Dashboard link).
2. Verify the 3 elevated summary cards:
   - Total Gross Earnings (e.g. `$1,250.00`)
   - Platform Fee (10% e.g. `-$125.00`)
   - Available Net Balance (e.g. `$875.00`)
3. Toggle between `This Week`, `This Month`, and `This Year` period chips.
4. Tap **"Withdraw via KHQR"**; verify the ABA Bank Bakong withdrawal sheet opens.
5. Scroll through the transaction ledger; verify badges for `KHQR`, `Cash`, or `Card`.

---

### Scenario 4: Service Catalog Management
1. Tap the **"Services"** tab in the bottom navigation bar.
2. Filter services by category chips: `Maintenance`, `Diagnostics`, `Brakes`, `Tires`, `Electric/Hybrid`.
3. Toggle the active switch off for an item; verify it shows inactive styling.
4. Tap **"Edit"** on a service; modify the price to `$50.00` and save.
5. Tap **"Add New Service"** to create a custom service.

---

### Scenario 5: Weekly Schedule & Availability
1. Navigate to **Schedule** from the Profile menu.
2. Toggle individual days (e.g. Sunday) on/off.
3. Tap on Monday's hours to adjust opening/closing times (08:00 - 18:00).
4. Switch to the **Daily Timeline** view; verify chronological customer appointment time slots.

---

### Scenario 6: Customer Reviews & Workshop Reply
1. Navigate to **Reviews** from the Profile menu.
2. Verify the aggregate rating hero card (4.9 ★) with 5★ to 1★ percentage bars.
3. Filter reviews by star count (5★, 4★, etc.).
4. Find an unreplied review, tap **"Reply to Customer"**, type a response, and submit.
5. Verify the reply appears nested under the review with a verified workshop badge.

---

## 3. Automated Validation

Validate type safety and zero regressions:
```bash
# Frontend validation
npx tsc --noEmit

# Backend validation
cd backend && npx tsc --noEmit
```
Both commands must exit with code 0.
