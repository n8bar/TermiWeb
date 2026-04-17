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
- Elevated-only shell launch path for `0.1`
- Login with one configured app password for local/LAN use
- Authenticated browser sessions that survive normal server restarts until logout or expiry
- Empty logins seed `Instance 1` automatically so a fresh browser session never lands on an empty instance rail
- Device-local instance selection after initial attach
- Rendered-text select mode for reliable copying after screen clears
- Per-instance shared column width with `80` as the default for new instances
- One shared layout across workstation and device browsers
- Collapsible keyboard control tray that trades button space for more visible terminal rows
- Local-only testing and verification workflow

## Quick start

1. Copy `.env.example` to `.env`.
2. Set `TERMIWEB_PASSWORD` to the value you want before first run.
3. Install dependencies with `npm install`.
4. Start the app with `npm run dev`.
   Windows will request elevation because `0.1` runs elevated shells only.
5. Open `http://127.0.0.1:22443`.

## Running Two Copies On One Machine

- Keep `.env.example` as the product-default config for packaged or single-copy use.
- If you want a repo checkout to run beside another local TermiWeb copy, start that checkout from `.env.dev.example` instead of `.env.example`.
- `.env.dev.example` moves the repo checkout to port `32443`, which keeps it off the product default port.
- Nondefault ports automatically get a matching session-cookie name, so browser login state does not bleed between the two copies.
- Optional before-sign-in auto-start uses a matching port-derived Task Scheduler name too, so the packaged default and a repo checkout do not fight over one startup-task registration when both keep their supported ports.
- Set `TERMIWEB_SESSION_COOKIE_NAME` explicitly only if you need a custom cookie name instead of the port-based default.

## LAN Access

- TermiWeb binds to your LAN by default.
- On the first LAN-bound launch, Windows may show a firewall prompt for the Node-hosted server process.
- Allow private-network access at that prompt if you want phones or other devices on the same LAN to reach TermiWeb.
- Leave `TERMIWEB_HOST` blank unless you want an explicit bind address.
- Browse to `http://<your-pc-lan-ip>:22443` from another device, such as your phone, on the same network.

## Advanced deployments

- The supported default is still a trusted private network.
- If you want remote access across the internet or across sites, expose it deliberately behind controls you already trust, such as TLS termination, external auth, a reverse proxy, a VPN or mesh network, IP restrictions, or equivalent safeguards.
- Those are real deployment patterns for `0.1`, but they are operator-managed patterns around the app rather than built-in product features.
- The configured app password is part of the access story, not the whole WAN hardening story by itself.

## Scripts

- `npm run dev` starts the integrated dev server and relaunches elevated on Windows when needed.
- `npm run build` builds the client and server output into `dist/`.
- `npm run start` runs the production server from `dist/` and relaunches elevated on Windows when needed.
- `npm run start:hidden` starts the built Windows server in the background without spawning an extra console window and requests elevation when needed.
- `npm run restart:hidden` restarts that hidden Windows background server and requests elevation when needed.
- `npm run stop:hidden` stops that hidden Windows background server and requests elevation when needed.
- `npm run notices:third-party` regenerates `THIRD_PARTY_NOTICES.md` from the installed production dependency graph.
- `npm run package:release` assembles the Windows release folder and zip under `artifacts/release/`.
- `npm run typecheck` runs both client and server TypeScript checks.
- `npm test` runs the local test suite.
- `npm run lint` runs the repo lint rules.
- `Set Up TermiWeb.cmd` is the lightweight packaged setup flow: it creates `.env` if needed, prompts for the app password when still unset, offers before-sign-in auto-start, and can start the app for you.
- `Enable TermiWeb Auto Start.cmd` and `Disable TermiWeb Auto Start.cmd` manage the optional before-sign-in startup task for this copy of TermiWeb.
- `Start TermiWeb.cmd`, `Restart TermiWeb.cmd`, and `Stop TermiWeb.cmd` are the Windows launchers intended for the packaged run surface and also work from a built repo checkout. They request elevation because `0.1` runs elevated shells only.
- `Uninstall TermiWeb.cmd` is the packaged uninstall entry point and intentionally refuses to run from a source checkout.

## Documentation

- [Project plan](docs/PLAN.md)
- [M6 installer and first-run worklist](docs/worklists/m6-installer-and-first-run-experience.md)
- [M7 release and download website worklist](docs/worklists/m7-release-and-download-website.md)
- [Release standard](docs/RELEASE_STANDARD.md)
- [Product spec](docs/PRODUCT_SPEC.md)
- [Deployment philosophy](docs/DEPLOYMENT_PHILOSOPHY.md)
- [Findings log](docs/FINDINGS.md)
- [Disclaimer](DISCLAIMER.md)
- [Start-here guide](1.Start-Here.md)
- [Third-party notices](THIRD_PARTY_NOTICES.md)
- [0.1 browser terminal spec](docs/specs/v0.1-browser-terminal.md)
- [0.1 per-instance column width](docs/specs/v0.1-per-instance-column-width.md)
- [0.1 persistent auth sessions](docs/specs/v0.1-persistent-auth-sessions.md)
- [0.1 release package contract](docs/specs/v0.1-release-package-contract.md)
- [0.2 browser session candidate](docs/specs/v0.2-browser-session-candidate.md)
- [0.2 side-by-side instances candidate](docs/specs/v0.2-side-by-side-instances-candidate.md)
- [Change log](docs/CHANGELOG.log)

## Shell behavior

TermiWeb prefers PowerShell 7 from `PATH`, then falls back to the standard install path at `C:\Program Files\PowerShell\7\pwsh.exe`, and only then falls back to Windows PowerShell.
