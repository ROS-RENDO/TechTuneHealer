# TechTune Healer

An integrated digital automotive assistance, visual diagnostics, and garage operations ecosystem engineered for Cambodia.

TechTune Healer connects vehicle owners with certified automotive workshops and mobile emergency mechanics across Phnom Penh. The platform features on-demand roadside SOS dispatch with sub-second WebSocket tracking, a visual AI camera scanner for scuff and dashboard fault triage, an interactive 3D virtual garage with live OBD-II diagnostic telemetry, a Phnom Penh EV fast-charging directory, an e-commerce spare parts catalog, and seamless Bakong KHQR / ABA Pay checkout.

---

## Academic Defense Information

* **Event:** Final Defense End-Term Internship Presentation (Term III 2026)
* **Academic Cohort:** Intake 7 — Bachelor of Science in Software Engineering
* **Date:** Wednesday, 30 September 2026
* **Assigned Defense Time Slot:** 15:15 – 15:30 (10-min Presentation + 5-min Committee Q&A)
* **Venue:** FENG and BI Faculty Room, 3rd Floor, CamTech University
* **Documentation Kits:**
  * Master Presentation Deck, Timed Spoken Script & Q&A Prep: [TechTune_Healer_Presentation_Kit.md](file:///d:/TechTuneHealer/TechTune_Healer_Presentation_Kit.md)
  * Comprehensive Academic Internship Final Report: [TechTune_Healer_Internship_Report.md](file:///d:/TechTuneHealer/TechTune_Healer_Internship_Report.md)
  * Multi-Author 18-Day Git Sprint Commit Plan: [TechTune_Healer_Commit_Plan_Sprint.csv](file:///d:/TechTuneHealer/TechTune_Healer_Commit_Plan_Sprint.csv)

---

## Engineering Team & Credentials

| Student Name | Student ID | Academic Email | Domain Role |
| :--- | :--- | :--- | :--- |
| **Ros Rendo** | `RR6024010107` | `rousrendo@gmail.com` | Frontend & Mobile Engineering Lead |
| **Vin Sambrathna** | `SV6024010100` | `sv6024010100@camtech.edu.kh` | Backend & Real-Time Services Lead |
| **Eath Sopheavid** | `SE6024010109` | `se6024010109@camtech.edu.kh` | Database & System Architect |
| **Kuoch Bunpor** | `BK6024010108` | `bk6024010108@camtech.edu.kh` | QA Engineer & Fullstack Web Developer |

* **Host Organization:** TechTune Healer (Automotive Digital Solutions Co., Ltd., Phnom Penh)
* **Company Supervisor:** Dr. Seng Sophal (Lead Engineering Mentor)
* **University Advisor:** Prof. Dr. Chhea Pharith (Faculty of Engineering & Applied Sciences, CamTech University)

---

## System Architecture & Multi-Tier Ecosystem

```
                      ┌──────────────────────────────────────────────┐
                      │              Client Tier                     │
                      │  • Customer Mobile App (React Native / Expo) │
                      │  • Provider Mobile App (React Native / Expo) │
                      │  • Admin Operations Web (Next.js 15 App)     │
                      └──────────────────────┬───────────────────────┘
                                             │
                                    HTTPS    │   WebSockets
                                  (REST API) │ (Socket.IO Live GPS)
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │             API Gateway Tier                 │
                      │  • Node.js 22 LTS / Express 5 Framework      │
                      │  • JWT Auth Middleware & Role Guards (RBAC)  │
                      │  • Socket.IO Real-Time Location Gateway      │
                      │  • Multer Multipart Image Buffer             │
                      │  • Express-Rate-Limit Request Throttling     │
                      └──────────────────────┬───────────────────────┘
                                             │
                                         Prisma 7
                                     Type-Safe Client
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │             Database Tier                    │
                      │  • MariaDB / MySQL 8.0 Relational Engine     │
                      │  • ACID Financial Transactions               │
                      │  • Foreign-Key Cascades & Indexes            │
                      └──────────────────────────────────────────────┘
```

---

## Technology Stack

### 1. Mobile Client (`/`)
* **Framework:** React Native `0.86.3` with Expo SDK `57.0.24` and TypeScript `6.0.3`
* **Navigation:** Expo Router (file-based shell) + React Navigation 7 (nested Customer & Provider stacks)
* **State Management:** Zustand 5 (atomic stores for auth session, coordinates, and cart)
* **Mapping & Telemetry:** React Native Maps with Leaflet / OSRM route geometry
* **Sensors & Hardware:** Expo Location, Expo Camera, Expo Image Picker, Expo Haptics
* **Payment Integration:** National Bank of Cambodia Bakong KHQR deep-linking & ABA Pay

### 2. Admin Operations Web Portal (`admin-web/`)
* **Framework:** Next.js 15 App Router with React 19 and TypeScript
* **Styling:** Tailwind CSS with responsive dark/light mode
* **Operations Modules:** Live Phnom Penh Municipal Dispatch Matrix, dynamic SLA compliance curves, emergency triage terminal, and 1-click workshop license verification

### 3. Backend API Gateway & Real-Time Engine (`backend/`)
* **Server Framework:** Express 5 on Node.js 22 LTS (TypeScript)
* **Real-Time Engine:** Socket.IO 4.8 with room isolation (`customer:watch`, `mechanic:location`, `mechanic:arrived`)
* **ORM & Database:** Prisma 7 ORM connecting to MariaDB / MySQL 8.0
* **Security & Auth:** Bcrypt 12-round password hashing, stateless 30-day JWT tokens, role guards (`CUSTOMER`, `PROVIDER`, `ADMIN`)
* **Rate Limiting:** `express-rate-limit` with specialized buckets for OTP and auth
* **File Uploads:** Multer with a 10MB cap and MIME whitelist (JPEG, PNG, WebP)

---

## Quickstart Guide

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # configure DATABASE_URL and JWT_SECRET
npx prisma generate    # compiles type-safe Prisma client
npx prisma migrate dev # applies database migrations
npm run seed           # seeds mock Phnom Penh garages, products & users
npm run dev            # starts backend on port 4000
```

### 2. Admin Web Portal Setup

```bash
cd admin-web
npm install
npm run dev            # starts Next.js dashboard on http://localhost:3000
```

### 3. Mobile Application Setup

```bash
# In repository root
npm install
cp .env.example .env   # configure EXPO_PUBLIC_API_URL
npm start              # launches Expo Metro Bundler (press 'a' for Android, 'i' for iOS)
```

---

## Code Quality & Verification

To verify that the code compiles cleanly with zero TypeScript errors before defense:

```bash
# Verify mobile application types
npx tsc --noEmit

# Verify Next.js web portal build
cd admin-web && npm run build

# Run SonarQube static analysis
sonar-scanner
```

---

## CI/CD & DevOps Pipeline

TechTune Healer includes automated Continuous Integration and Continuous Deployment pipelines built with GitHub Actions:

### 1. Continuous Integration (`.github/workflows/ci.yml`)
Triggers automatically on every `push` and `pull_request` to `main`, `master`, and `dev`:
* **Mobile CI:** Verifies strict TypeScript type-safety (`tsc --noEmit`), Expo SDK 57 project configuration, and ESLint.
* **Backend CI:** Spins up an ephemeral MariaDB 11.4 service container, validates Prisma schema (`prisma validate`), generates type-safe clients, and compiles TypeScript.
* **Admin Web CI:** Builds production Next.js 16 bundle (`npm run build`) with React 19 and Tailwind CSS v4.
* **Code Quality & Security:** Runs `npm audit` for dependency vulnerability scanning and initiates SonarQube quality gate scans.

### 2. Continuous Deployment (`.github/workflows/deploy.yml`)
Triggers on merge to `main` and version tags (`v*.*.*`):
* **Docker Multi-Stage Builds:** Compiles optimized Alpine images and pushes to GitHub Container Registry (`ghcr.io`).
* **Automated VPS Deployment:** Uses SSH keys to pull updated containers and trigger rolling zero-downtime updates with Docker Compose.
* **Mobile EAS Builds:** Triggers Expo Application Services (EAS) to compile standalone `.apk`/`.aab` and `.ipa` mobile binaries on version tag pushes.

### 3. Docker Compose Orchestration (Local & Server)

To spin up the entire full-stack ecosystem (MariaDB + Backend API + Admin Web) with a single command:

```bash
# Start all services with automated healthchecks
docker compose up -d --build

# View container logs in real time
docker compose logs -f

# Shut down all services
docker compose down
```

