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
5. Open `http://127.0.0.1:22443`.

## LAN Access

- Set `TERMIWEB_ALLOW_LAN=true` in `.env`.
- Leave `TERMIWEB_HOST` blank unless you want an explicit bind address.
- Browse to `http://<your-pc-lan-ip>:22443` from your phone on the same network.

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

TermiWeb prefers PowerShell 7 from `PATH`, then falls back to the standard install path at `C:\Program Files\PowerShell\7\pwsh.exe`, and only then falls back to Windows PowerShell.
