# TermiWeb

TermiWeb is a browser-first shared terminal for Windows. The browser UI is the same live interface on your workstation and any other device, so one terminal session can be continued anywhere without remoting the whole desktop.

## What's Working

- Node + TypeScript backend with WebSocket-driven terminal sessions
- `xterm.js` client with touch-oriented terminal controls
- Shared instances backed by Windows shell processes
- Single shared-password login for local/LAN use
- Device-local instance selection after initial attach
- Rendered-text select mode for reliable copying after screen clears
- Fixed 80-column terminal width across clients
- One shared layout across workstation and device browsers
- Local-only testing and verification workflow

## Quick start

1. Copy `.env.example` to `.env`.
2. Set `TERMIWEB_PASSWORD`.
3. Install dependencies with `npm install`.
4. Start the app with `npm run dev`.
5. Open `http://127.0.0.1:22443`.

## LAN Access

- TermiWeb binds to your LAN by default.
- Leave `TERMIWEB_HOST` blank unless you want an explicit bind address.
- Browse to `http://<your-pc-lan-ip>:22443` from another device, such as your phone, on the same network.

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
- [Findings log](docs/FINDINGS.md)
- [V1 browser terminal spec](docs/specs/v1-browser-terminal.md)
- [Change log](docs/CHANGELOG.log)

## Shell behavior

TermiWeb prefers PowerShell 7 from `PATH`, then falls back to the standard install path at `C:\Program Files\PowerShell\7\pwsh.exe`, and only then falls back to Windows PowerShell.
