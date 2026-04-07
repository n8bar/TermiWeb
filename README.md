# TermiWeb

TermiWeb is a workstation-first shared terminal for Windows. The browser UI is the live interface on your workstation and any other device you use to reach it, so one terminal session can be continued without remoting the whole desktop.

## Product direction

- The default TermiWeb story is one trusted Windows machine on a private network.
- The product should stay practical for a single user or small trusted group without assuming a homelab or a full self-hosted access stack.
- Advanced remote access is still part of the direction, but in `0.1` that means operator-managed deployment guidance, not built-in internet-ready hosting features.
- TermiWeb does not currently ship multi-user auth, built-in TLS termination, or turnkey public exposure.

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
- If you want remote access across the internet or across sites, layer TermiWeb behind infrastructure you already manage, such as a private VPN, a mesh network, or a reverse proxy with TLS and external auth.
- Those deployment patterns are valid directionally, but they are not built-in `0.1` product features.

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
- [Deployment philosophy](docs/DEPLOYMENT_PHILOSOPHY.md)
- [Findings log](docs/FINDINGS.md)
- [0.1 browser terminal spec](docs/specs/v0.1-browser-terminal.md)
- [Change log](docs/CHANGELOG.log)

## Shell behavior

TermiWeb prefers PowerShell 7 from `PATH`, then falls back to the standard install path at `C:\Program Files\PowerShell\7\pwsh.exe`, and only then falls back to Windows PowerShell.
