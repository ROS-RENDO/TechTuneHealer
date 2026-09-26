# API Contracts: Full Provider Portal Redesign

**Feature Branch**: `003-provider-portal-redesign`  
**Date**: 2026-09-19  
**Status**: Completed  
**Spec**: [spec.md](../spec.md) | **Plan**: [plan.md](../plan.md)

---

## 1. Authentication & Security
All provider endpoints require a valid JWT Bearer token:
```http
Authorization: Bearer <jwt_token>
```
Role check: `user.role === 'PROVIDER'`.

---

## 2. Endpoints

### A. Provider Profile & Dispatch Settings
#### `GET /providers/me`
Retrieves authenticated workshop metadata, settings, and credentials.
- **Response 200 OK**:
  ```json
  {
    "id": "prov-123",
    "businessName": "Sokha Auto & Roadside Rescue",
    "phone": "+855 12 889 977",
    "avatarUrl": "https://...",
    "coverImageUrl": "https://...",
    "address": "Russian Blvd, Tuol Kork, Phnom Penh",
    "dispatchRadiusKm": 20,
    "isDutyOnline": true,
    "isEmergencyOnCall": true,
    "rating": 4.9,
    "reviewCount": 128,
    "totalJobs": 342,
    "khqrAccount": {
      "bankName": "ABA Bank",
      "accountName": "SOKHA AUTO REPAIR",
      "accountNumber": "001 234 567"
    }
  }
  ```

#### `PATCH /providers/me/settings`
Updates workshop settings, dispatch radius, or on-call availability.
- **Request Body**:
  ```json
  {
    "dispatchRadiusKm": 25,
    "isEmergencyOnCall": true
  }
  ```
- **Response 200 OK**:
  ```json
  { "success": true, "dispatchRadiusKm": 25, "isEmergencyOnCall": true }
  ```

---

### B. Bookings & Emergency Dispatch Queue
#### `GET /bookings`
Retrieves bookings assigned to or pending for the provider.
- **Query Params**: `status` (optional: `all`, `pending`, `accepted`, `in_progress`, `completed`, `cancelled`)
- **Response 200 OK**:
  ```json
  [
    {
      "id": "b-101",
      "customerName": "Dara Chan",
      "customerPhone": "+855 98 765 432",
      "vehicle": {
        "make": "Lexus",
        "model": "RX350",
        "year": 2024,
        "licensePlate": "2A-8888",
        "color": "Sonic Titanium"
      },
      "serviceType": "Emergency Roadside Assistance",
      "isEmergency": true,
      "symptoms": "Flat tire on front left wheel, vehicle pulled over near bridge",
      "distanceKm": 1.4,
      "estimatedPrice": 45.00,
      "status": "pending",
      "createdAt": "2026-09-19T01:00:00Z"
    }
  ]
  ```

#### `PATCH /bookings/:id/status`
Transitions the booking state.
- **Request Body**:
  ```json
  {
    "status": "accepted"
  }
  ```
- **Response 200 OK**:
  ```json
  { "success": true, "id": "b-101", "status": "accepted" }
  ```

---

### C. Service Catalog Management
#### `GET /providers/me/services`
Retrieves list of services in workshop catalog.
- **Response 200 OK**:
  ```json
  [
    {
      "id": "srv-1",
      "name": "Synthetic Oil & Filter Change",
      "category": "Maintenance",
      "description": "Full synthetic 5W-30 oil replacement and OEM filter change",
      "price": 45.00,
      "durationMinutes": 40,
      "isActive": true
    }
  ]
  ```

#### `PATCH /providers/me/services/:id`
Updates price, duration, or active toggle.
- **Request Body**:
  ```json
  {
    "price": 50.00,
    "isActive": true
  }
  ```
- **Response 200 OK**:
  ```json
  { "success": true, "id": "srv-1", "price": 50.00, "isActive": true }
  ```

---

### D. Financial Analytics & Settlements
#### `GET /providers/me/earnings`
Retrieves revenue summaries and itemized transactions.
- **Query Params**: `period` (`week`, `month`, `year`)
- **Response 200 OK**:
  ```json
  {
    "period": "month",
    "grossEarnings": 1250.00,
    "platformFeeRate": 0.10,
    "platformFee": 125.00,
    "netEarnings": 1125.00,
    "availableBalance": 875.00,
    "pendingSettlement": 250.00,
    "transactions": [
      {
        "id": "tx-1",
        "description": "Brake Inspection - Lexus RX350",
        "amount": 45.00,
        "feeAmount": 4.50,
        "netAmount": 40.50,
        "paymentMethod": "KHQR",
        "status": "completed",
        "createdAt": "2026-09-18T15:30:00Z"
      }
    ]
  }
  ```

#### `POST /providers/me/payouts`
Requests instant ABA KHQR withdrawal.
- **Request Body**:
  ```json
  {
    "amount": 250.00,
    "payoutMethod": "KHQR"
  }
  ```
- **Response 200 OK**:
  ```json
  {
    "success": true,
    "transactionId": "tx-w-99",
    "amount": 250.00,
    "status": "processing",
    "estimatedTransfer": "Instant (< 5 mins via Bakong)"
  }
  ```

---

### E. Customer Reviews & Responses
#### `GET /providers/me/reviews`
Retrieves customer reviews for this workshop.
- **Response 200 OK**:
  ```json
  {
    "averageRating": 4.9,
    "totalReviews": 128,
    "distribution": { "5": 110, "4": 12, "3": 4, "2": 1, "1": 1 },
    "reviews": [
      {
        "id": "rev-1",
        "customerName": "Rithy Seng",
        "vehicleTag": "Lexus RX350 (2024)",
        "rating": 5,
        "comment": "Fastest emergency roadside dispatch in Phnom Penh. Arrived in 12 mins and fixed the tire!",
        "date": "2026-09-18",
        "reply": null
      }
    ]
  }
  ```

#### `POST /providers/me/reviews/:id/reply`
Submits an official workshop reply.
- **Request Body**:
  ```json
  {
    "reply": "Thank you Rithy! Glad we could get you safely back on the road."
  }
  ```
- **Response 200 OK**:
  ```json
  { "success": true, "id": "rev-1", "repliedAt": "2026-09-19T01:00:00Z" }
  ```
