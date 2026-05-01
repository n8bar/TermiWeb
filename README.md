# TermiWeb

TermiWeb is a browser-first shared terminal for a Windows host. It keeps the browser UI as the live interface on the host device and any other device you use to reach it, so one terminal session can continue without remoting the whole desktop.

It was created for power users, especially vibe-coders who want to continue "working" when they need to step away from the desk for a few moments. In other words, it was built for people who want to keep a live shell within reach while moving between their desk and the rest of real life.

## Product Features At A Glance

- Live shared terminals in the browser
- Cross-device attachment to the same live shell
- A Windows packaged run surface with setup, start, restart, stop, uninstall, and optional before-sign-in auto-start
- Mobile-oriented terminal controls plus selection/clipboard support
- `0.1.1` includes mobile stabilization fixes for collapsed instance controls and keyboard text-assistance interference.
- `0.1` targets Windows hosts only.
- Every shell in `0.1` is elevated.
- `0.1` assumes a trusted Windows machine on a private network.
- WAN exposure is possible, but you are responsible for securing it.

## Download

The public download path for the packaged release is:

`https://termiweb.com/download/`

Repo users can also build the packaged release locally with:

```bash
npm run package:release
```

That command produces the Windows release folder and zip under `artifacts/release/`.

## Packaged quick start

Once you have the packaged release:

1. Unpack it into a user-writable folder.
2. Open `1.Start-Here.md`. It walks through the rest of the setup path.
3. Run `Set Up TermiWeb.cmd` if you want the guided setup path.
4. Approve the Windows elevation prompt when TermiWeb starts.
5. Open `http://127.0.0.1:22443` if setup does not open it for you.

## What `0.1` supports

- Shared terminal instances through the browser UI
- A Windows packaged run surface with setup, start, restart, stop, uninstall, and optional before-sign-in auto-start
- Elevated-only shell launch path for `0.1`
- One configured app password for local and LAN use
- Authenticated browser sessions that survive normal server restarts until logout or expiry
- Cross-device attachment to the same live shell
- Mobile-oriented terminal controls plus selection/copy support
- Per-instance shared width (as column counts) with `80` as the default for new instances
- Clipboard controls, including a fallback paste field when direct browser paste is blocked

## Constraints

- TermiWeb does not currently ship multi-user auth.
- TermiWeb does not currently ship built-in TLS termination.
- TermiWeb does not currently ship a turnkey public-exposure workflow.
- `0.1` is a trusted-network-first product release, not a whole secure remote-access stack by itself.

## Built with

TermiWeb stands on strong existing work, especially `xterm.js`, `node-pty`, TypeScript, Vite, Express, and the Windows terminal stack they make usable from the browser.

## Repo quick start

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
- `npm run dev:site` starts the single-page release-site dev server from `src/site`.
- `npm run build:site` builds the GitHub Pages site output into `dist/site`.
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

## Additional Info

- [Developer project plan](docs/PLAN.md)
- [Disclaimer](DISCLAIMER.md)
- [Start-here guide](1.Start-Here.md)
- [Third-party notices](THIRD_PARTY_NOTICES.md)

## Shell behavior

`v0.1` prefers PowerShell 7 from `PATH`, then falls back to the standard install path at `C:\Program Files\PowerShell\7\pwsh.exe`, and only then falls back to Windows PowerShell.
