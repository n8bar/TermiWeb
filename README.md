# TermiWeb

TermiWeb is a workstation-first shared terminal for Windows. The browser UI is the live interface on your workstation and any other device you use to reach it, so one terminal session can be continued without remoting the whole desktop.

## Product direction

- The default TermiWeb story is still one trusted Windows machine on a private network.
- Careful WAN exposure is also a legitimate advanced use case for people who want to reach their own workstation remotely.
- In `0.1`, TermiWeb expects operators to supply the outer deployment controls around WAN access rather than trying to be the entire remote-access stack by itself.
- TermiWeb does not currently ship multi-user auth, built-in TLS termination, or a turnkey public-exposure workflow.

## What's Working

- Node + TypeScript backend with WebSocket-driven terminal sessions
- `xterm.js` client with touch-oriented terminal controls
- Shared instances backed by Windows shell processes
- Single shared-password login for local/LAN use
- Empty logins seed `Instance 1` automatically so a fresh browser session never lands on an empty instance rail
- Device-local instance selection after initial attach
- Rendered-text select mode for reliable copying after screen clears
- Fixed 80-column terminal width across clients
- One shared layout across workstation and device browsers
- Collapsible keyboard control tray that trades button space for more visible terminal rows
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

## Advanced deployments

- The supported default is still a trusted private network.
- If you want remote access across the internet or across sites, expose it deliberately behind controls you already trust, such as TLS termination, external auth, a reverse proxy, a VPN or mesh network, IP restrictions, or equivalent safeguards.
- Those are real deployment patterns for `0.1`, but they are operator-managed patterns around the app rather than built-in product features.
- The shared-password gate is part of the access story, not the whole WAN hardening story by itself.

## Scripts

- `npm run dev` starts the integrated dev server.
- `npm run build` builds the client and server output into `dist/`.
- `npm run start` runs the production server from `dist/`.
- `npm run start:hidden` starts the built Windows server in the background without spawning an extra console window.
- `npm run restart:hidden` restarts that hidden Windows background server.
- `npm run stop:hidden` stops that hidden Windows background server.
- `npm run typecheck` runs both client and server TypeScript checks.
- `npm test` runs the local test suite.
- `npm run lint` runs the repo lint rules.

## Documentation

- [Project plan](docs/PLAN.md)
- [Product spec](docs/PRODUCT_SPEC.md)
- [Deployment philosophy](docs/DEPLOYMENT_PHILOSOPHY.md)
- [Findings log](docs/FINDINGS.md)
- [0.1 browser terminal spec](docs/specs/v0.1-browser-terminal.md)
- [Change log](docs/CHANGELOG.log)

## Shell behavior

TermiWeb prefers PowerShell 7 from `PATH`, then falls back to the standard install path at `C:\Program Files\PowerShell\7\pwsh.exe`, and only then falls back to Windows PowerShell.
