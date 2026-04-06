# TermiWeb

TermiWeb is a browser-first shared terminal for Windows. The web UI is the session of record for both desktop and phone, so one live terminal session can be continued from either device without remoting the whole desktop.

## Current shape

- Node + TypeScript backend with WebSocket-driven terminal sessions
- `xterm.js` client with touch-oriented terminal controls
- Shared workspace tabs backed by Windows shell processes
- Single shared-password login for local/LAN use
- Local-only testing and verification workflow

## Quick start

1. Copy `.env.example` to `.env`.
2. Set `TERMIWEB_PASSWORD`.
3. Install dependencies with `npm install`.
4. Start the app with `npm run dev`.
5. Open `http://127.0.0.1:4317`.

## Scripts

- `npm run dev` starts the integrated dev server.
- `npm run build` builds the client and server output into `dist/`.
- `npm run start` runs the production server from `dist/`.
- `npm run typecheck` runs both client and server TypeScript checks.
- `npm test` runs the local test suite.
- `npm run lint` runs the repo lint rules.

## Documentation

- [Project plan](docs/PLAN.md)
- [Product spec](docs/PRODUCT_SPEC.md)
- [V1 browser terminal spec](docs/specs/v1-browser-terminal.md)
- [Change log](docs/CHANGELOG.log)

## Shell behavior

TermiWeb prefers `pwsh`/PowerShell 7 when available. If it is not installed, the runtime falls back to Windows PowerShell automatically so the app still works on the current machine.
