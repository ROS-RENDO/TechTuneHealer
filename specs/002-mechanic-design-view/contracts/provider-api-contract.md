# API Contract: Modern Mechanic Design & Provider Experience

**Feature**: Modern Mechanic Design & Provider Experience  
**Spec**: [specs/002-mechanic-design-view/spec.md](spec.md)  
**Date**: 2026-09-19

## 1. Provider Availability & Duty Status

### `PATCH /providers/me/availability`
Updates the authenticated provider's real-time duty toggle (Online/Offline).

**Headers**:
- `Authorization: Bearer <JWT_TOKEN>`

**Request Body**:
```json
{
  "isAvailable": true
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "isAvailable": true,
  "updatedAt": "2026-09-19T00:59:00.000Z"
}
```

---

## 2. Provider Dashboard Bookings Feed

### `GET /bookings/provider`
Fetches the active booking queue for the currently authenticated provider, categorized by status and urgency.

**Headers**:
- `Authorization: Bearer <JWT_TOKEN>`

**Query Parameters**:
- `status`: Optional filter (`pending`, `accepted`, `in_progress`, `completed`)
- `isEmergency`: Optional boolean filter

**Response (200 OK)**:
```json
{
  "bookings": [
    {
      "id": "bk-890123",
      "customerName": "Sophea Vann",
      "customerPhone": "+855 12 778 899",
      "serviceType": "Emergency Roadside Assistance",
      "isEmergency": true,
      "status": "pending",
      "scheduledDate": "2026-09-19",
      "scheduledTime": "Immediate Dispatch",
      "totalPrice": 45.00,
      "vehicleMake": "Toyota",
      "vehicleModel": "Prius 2018",
      "vehiclePlate": "Phnom Penh 2AC-1122",
      "notes": "Engine overheating on Russian Blvd near Airport, coolant leaking",
      "customerLocation": {
        "latitude": 11.5542,
        "longitude": 104.8765,
        "address": "Russian Federation Blvd, Phnom Penh"
      },
      "createdAt": "2026-09-19T00:55:00.000Z"
    }
  ],
  "stats": {
    "todayCount": 4,
    "pendingCount": 1,
    "completedMonth": 28,
    "rating": 4.8
  }
}
```

---

## 3. Booking Status Lifecycle Transition

### `PATCH /bookings/:id/status`
Advances the status of a booking throughout the dispatch and repair workflow.

**Headers**:
- `Authorization: Bearer <JWT_TOKEN>`

**Request Body**:
```json
{
  "status": "ACCEPTED"
}
```
*Valid `status` values*: `ACCEPTED`, `HEADING_TO_CUSTOMER`, `ARRIVED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.

**Response (200 OK)**:
```json
{
  "success": true,
  "booking": {
    "id": "bk-890123",
    "status": "ACCEPTED",
    "updatedAt": "2026-09-19T00:59:30.000Z"
  }
}
```

---

## 4. Customer-Facing Provider Profile & Services

### `GET /providers/:id`
Returns public garage profile, verified credentials, location coordinates, itemized service offerings, and recent reviews.

**Response (200 OK)**:
```json
{
  "id": "provider-sokha-01",
  "businessName": "Sokha Auto Repair & Roadside Rescue",
  "rating": 4.8,
  "reviewCount": 128,
  "isVerified": true,
  "isAvailable": true,
  "phone": "+855 12 345 678",
  "address": "Street 271, Boeng Tumpun, Phnom Penh",
  "location": {
    "latitude": 11.5388,
    "longitude": 104.9122
  },
  "operatingHours": "7:30 AM - 8:00 PM (24/7 Emergency Dispatch)",
  "services": [
    {
      "id": "srv-01",
      "title": "Mobile Battery Jumpstart & Diagnostic",
      "category": "Electrical",
      "price": 20.00,
      "estimatedDuration": "25 mins"
    },
    {
      "id": "srv-02",
      "title": "Emergency Flat Tire Replacement",
      "category": "Tires",
      "price": 15.00,
      "estimatedDuration": "30 mins"
    }
  ]
}
```
