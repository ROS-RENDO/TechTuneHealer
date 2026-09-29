# API Contracts: Customer Home Page

**Feature**: [001-redesign-customer-home](../spec.md)

## 1. Providers Nearby Endpoint

### `GET /providers`
Fetches service providers filtered by location radius and rating.

#### Request Headers
- `Authorization: Bearer <JWT_TOKEN>`

#### Query Parameters
- `lat`: `number` (User latitude, e.g. `11.5564`)
- `lng`: `number` (User longitude, e.g. `104.9282`)
- `radius`: `number` (Radius in km, default: `25`)

#### Response (200 OK)
```json
[
  {
    "id": "560d3e36-a6e7-43cd-8672-9e7f934724f7",
    "businessName": "Speedy Auto Fix",
    "address": "Olympic Stadium Area, Phnom Penh",
    "rating": 4.8,
    "reviewCount": 124,
    "isVerified": true,
    "isAvailable": true,
    "location": {
      "latitude": 11.5600,
      "longitude": 104.9100,
      "address": "Olympic Stadium Area, Phnom Penh"
    },
    "services": [
      {
        "id": "srv-1",
        "name": "Oil Change",
        "price": 25
      }
    ]
  }
]
```

---

## 2. Customer Vehicles Endpoint

### `GET /vehicles`
Fetches registered vehicles for the authenticated user.

#### Request Headers
- `Authorization: Bearer <JWT_TOKEN>`

#### Response (200 OK)
```json
[
  {
    "id": "veh-1",
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "plateNumber": "2A-1234",
    "color": "White"
  }
]
```

---

## 3. Customer Bookings Endpoint

### `GET /bookings`
Fetches all bookings for the customer to detect active roadside/service orders.

#### Request Headers
- `Authorization: Bearer <JWT_TOKEN>`

#### Response (200 OK)
```json
[
  {
    "id": "bk-1",
    "status": "IN_PROGRESS",
    "serviceType": "Towing & Jumpstart",
    "provider": {
      "businessName": "Speedy Auto Fix"
    },
    "scheduledDate": "2026-09-18T12:00:00.000Z"
  }
]
```
