# TechTune Healer

A mobile app that connects car owners with automotive service providers in Cambodia.
Customers can find providers, book appointments, get AI-assisted diagnostics,
request emergency roadside assistance, and track mechanics live. Providers manage
bookings, services, earnings, and shop products.

## Tech Stack

**Mobile app** (root of this repo)
- Expo / React Native 0.81, TypeScript
- expo-router (file-based) as the app shell, react-navigation for the customer/provider tab + stack flows
- Zustand for state, AsyncStorage for the auth token
- socket.io-client for live mechanic tracking
- react-native-maps (with OSRM for route drawing)

**Backend** (`backend/`)
- Express 5 + TypeScript
- Prisma 7 + MariaDB/MySQL (generated client lives in `backend/src/generated/`, run `prisma generate`)
- Socket.IO location gateway (JWT-authenticated handshake, per-booking membership checks)
- JWT auth (bcrypt 12 rounds, 30-day tokens), express-rate-limit on all routes with stricter auth/OTP limits
- Multer image uploads (10MB cap, JPEG/PNG/WebP whitelist) served from `/uploads`

## Getting Started

### Backend

```bash
cd backend
npm install
cp .env.example .env   # or create backend/.env from the keys below
npx prisma generate    # regenerates backend/src/generated/
npx prisma migrate dev # apply migrations
npm run seed           # optional seed data
npm run dev            # starts on PORT (default 4000)
```

Required env keys (`backend/.env`):

| Key | Purpose |
| --- | --- |
| `DATABASE_URL` | MariaDB/MySQL connection string |
| `JWT_SECRET` | At least 16 chars. **Required** — the server refuses to start without it. |
| `PORT` | API port (default 4000) |
| `NODE_ENV` | `development` / `production` |
| `CORS_ORIGINS` | Optional comma-separated allowlist for browser clients |
| `SOCKET_ORIGINS` | Optional comma-separated allowlist for socket connections |

### Mobile app

```bash
npm install
cp .env.example .env   # set EXPO_PUBLIC_API_URL
npm start              # or: npm run android / ios / web
```

| Key | Purpose |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | API base URL, also used as the socket URL (defaults to `https://api.techtunehealer.com`) |

## Project Layout

```
app/                  expo-router routes (auth, customer, provider groups)
src/
  components/         shared UI components
  constants/theme.ts  design tokens (colors, spacing, typography)
  navigation/         customer/provider navigators + param list types
  screens/            feature screens
  services/api.ts     typed REST client (fetch + bearer token)
  store/              Zustand stores (auth, location, bookings, ...)
  types/              shared TypeScript types
backend/
  prisma/             schema + migrations + seed
  src/
    routes/           REST API routes (all authenticated)
    gateways/         Socket.IO location gateway
    middleware/       JWT auth + role guards
    lib/              prisma client, security helpers
```

## Security Notes

- Every REST route behind `/auth`, `/bookings`, `/providers`, etc. requires a
  bearer token (except the OTP send/verify endpoints, which are rate-limited).
- Socket connections must present a valid JWT in the handshake (`auth.token`);
  `customer:watch`, `mechanic:location`, and `mechanic:arrived` additionally
  verify the user is the booking's customer or provider.
- OTP codes are stored in memory with a 5-minute expiry, a 1-minute resend
  cooldown, a 5-attempt cap, and constant-time comparison. Swap in Redis + a
  real SMS provider for production.
- Checkout validates quantity and stock and reserves stock inside a single
  Prisma transaction.
