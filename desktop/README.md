# BugTracker Enterprise Desktop Companion 🐛

A high-performance Electron + TypeScript desktop companion app for BugTracker, providing an instant defect HUD, global hotkeys, offline queueing, and live sprint telemetry.

## Features

- **Global Hotkey HUD (`Ctrl+Shift+B`)**: Summon the Quick Defect modal from anywhere across Windows (IDE, browser, terminal) to log tickets without breaking flow.
- **Offline Queue & Resilient Sync**: Allows recording bugs without internet or backend connection. All items are saved locally in the secure Electron user store and automatically synced once the cloud backend is reachable.
- **Sprint Burndown & Defect Stream**: Real-time view of active sprint defects, severity levels (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), components, and one-click status transitions (`To Do` -> `In Progress` -> `Code Review` -> `Resolved`).
- **System Tray Integration**: Background execution with minimize-to-tray, quick logger action, and live queue status tooltips.
- **Enterprise SSO & Identity**: Authenticated as Rahul Garg (`rahul@northstardigital.com`), Engineering Lead, Northstar Digital.
- **Dark & Light Mode**: Bespoke enterprise UI with seamless theme toggling.

## Quick Start

### Development Mode
```bash
# From root directory:
npm run desktop:dev

# Or inside the desktop directory:
cd desktop
npm run dev
```

### Build & Package
```bash
# From root directory:
npm run desktop:build

# Generate standalone executable installers:
cd desktop
npm run pack
# or
npm run dist
```
