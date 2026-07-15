@AGENTS.md

# CLAUDE.md — ParkingReminder

## What is this project?

A cross-platform (iOS + Android) parking reminder app built with **React Native + Expo + TypeScript**. Users drop a pin when they park, set a timer, and get notified before their parking expires. They can also navigate back to their car.

## Key Files

- `PROJECT.md` — Full feature roadmap, data model, architecture decisions, v1/v2 split, monetization plan, and open questions. **Read this first** when context is needed about what we're building and why.
- `app.json` — Expo config (permissions, plugins, app identity)
- `app/` — Expo Router screens (file-based routing)
- `app/(tabs)/index.tsx` — Main map screen with parking session UI
- `app/(tabs)/history.tsx` — Past parking sessions list
- `app/(tabs)/settings.tsx` — App settings (reminder time, geofence radius)
- `src/services/` — Business logic (location, notifications, parking orchestration)
- `src/storage/` — Data access layer (repository pattern for future cloud sync)
- `src/types/` — TypeScript interfaces and types

## Tech Stack

- React Native + Expo SDK 54 (managed workflow)
- TypeScript (strict)
- Expo Router 6.x (file-based navigation, tabs layout)
- expo-location (GPS + geofencing)
- expo-notifications (local push)
- expo-image-picker / expo-camera (ticket photos)
- @react-native-async-storage/async-storage (local persistence)

**Why SDK 54 (not 57):** The iOS App Store version of Expo Go only supports SDK 54. SDK 57 requires either a paid Apple Developer Account ($99/year) to use `eas go` / dev builds, or an Android device. We chose SDK 54 so development works for free on a physical iPhone via Expo Go. Upgrade to latest SDK when ready to publish via EAS Build.

## Development

```bash
npm install             # Install dependencies
npx expo start         # Start dev server, scan QR with Expo Go on iPhone
npx tsc --noEmit       # Type check
```

## Architecture Principles

- **Storage abstraction:** All data goes through `src/storage/repository.ts`. Never access AsyncStorage directly from components. This enables swapping to cloud sync later without touching UI code.
- **Service layer:** `src/services/parking.ts` orchestrates location, notifications, and storage. Screens call services, not raw APIs.
- **Geofencing:** Detects arrival near the car — fires a local notification and can auto-clear the session.
- **Navigation to car:** Opens native Maps via deep link. iOS shows "Back to app" banner automatically.
- **Minimal UI, map-centric:** The map IS the primary screen.

## Current State

- **Phase:** v1 MVP scaffolding complete — screens, services, types, storage all wired up
- **Next steps:** Test on device via Expo Go, add ticket photo capture, add real map (needs dev build), polish UI
- **Target:** v1 free tier — drop pin, timer, photo, notifications, navigate to car, geofence arrival

## Known Limitations (Expo Go)

- **No react-native-maps:** MapView requires a native build. Currently using a card-based UI. Will add real map when switching to EAS dev builds.
- **No background geofencing:** Requires background location permission which needs a dev build to test properly.
- **Notifications:** Work in Expo Go on iOS but with limited customization.

## Self-Maintenance Rule

**Whenever a major change happens** — new dependency added, architecture decision changed, folder structure reorganized, feature completed, or v1/v2 scope adjusted — **update this file** to reflect the current state. Keep it concise and accurate. Also update `PROJECT.md` if the roadmap or data model changes.
