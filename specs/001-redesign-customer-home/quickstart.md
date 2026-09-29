# Quickstart: Testing the Redesigned Customer Home Page

**Feature**: [001-redesign-customer-home](spec.md)

## Prerequisites
1. Backend running:
   ```bash
   cd backend
   npm run dev
   ```
2. Mobile app running:
   ```bash
   npx expo start
   ```

## Verification Steps
1. Log in with the customer test account:
   - **Email:** `customer@test.com`
   - **Password:** `password123`
2. Arrive at the redesigned Home Page and verify:
   - **App Bar**: Check location pill (`📍 Olympic Stadium, Phnom Penh`) and avatar.
   - **Interactive Search**: Tap the search bar and confirm it opens the Search tab.
   - **24/7 Roadside Rescue Card**: Tap the SOS button and verify navigation to Emergency assistance.
   - **My Garage Card**: Confirm your primary vehicle (`Toyota Camry 2020 • 2A-1234`) is displayed with health status and the 1-tap **AI Diagnostic** button works.
   - **Service Grid**: Tap any service category (e.g., "Tires", "Oil", "Battery") and verify it opens Search pre-filtered.
   - **Nearby Mechanics**: Verify that distance badges appear in **meters (`m`)** or **kilometers (`km`)** (e.g. `450 m`, `1.2 km`) with verified badge and star rating.
