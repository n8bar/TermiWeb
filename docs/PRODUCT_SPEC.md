# Product Spec

## Goal

TermiWeb provides a workstation-first browser terminal workflow that can also be reached from other devices without remoting an entire desktop environment.

## Product Direction

- The default product story is simple: one Windows workstation, one private network, and one trusted operator or small trusted group.
- Careful WAN exposure is a legitimate advanced use case for people managing their own workstations remotely.
- The product should remain useful without requiring a homelab or a complex self-hosted access stack.
- Advanced remote or internet-enabled deployments should be documented as operator-managed patterns around the app rather than treated as misuse.
- Future instance types may extend beyond terminals; the current leading candidate after `0.1` is an isolated workstation-hosted browser session.
- Future workstation layouts may also extend beyond a single visible instance; the leading post-`0.1` candidate there is an optional side-by-side instance view for very wide windows.
- Documentation should clearly separate current product behavior from deployment patterns users may layer around the app themselves.

## Core Behavior

This section keeps only the durable product-level invariants. Detailed behavior for each subsection lives in the linked focused specs.

### Session Model

- The browser is the primary interface on every device.
- Multiple clients can attach to the same terminal session and type into it concurrently.
- The app manages named shared instances rather than a single throwaway shell.
- Each device selects its own active instance locally; switching instances on one device does not force-switch others.

Instance naming, auto-renumbering, empty-workspace seeding, default attach behavior, and browser-local UI state are detailed in [the 0.1 browser-terminal spec](specs/v0.1-browser-terminal.md).

### Access And Runtime

- Authentication uses a single configured app password suitable for trusted private deployments in `0.1`.
- Authenticated browser sessions should survive a normal server restart until they expire or are revoked.
- TermiWeb `0.1` targets Windows hosts.
- TermiWeb `0.1` is elevated-only. Every shell it spawns is elevated.

Auth session persistence is detailed in [the 0.1 persistent auth sessions spec](specs/v0.1-persistent-auth-sessions.md). Runtime configuration, shell selection, and other runtime details live in [the 0.1 browser-terminal spec](specs/v0.1-browser-terminal.md).

### Terminal Sizing And Display

- New instances start at 80 columns.
- Terminal width is an instance property shared across all attached devices for that instance.
- Terminal rows are also shared per instance and must not be derived from live device viewport churn.

Baseline geometry, named width presets, font-fit behavior, follow-cursor mode, local viewport scroll, and cursor rendering are detailed in [the 0.1 per-instance column width spec](specs/v0.1-per-instance-column-width.md) and [the 0.1 browser-terminal spec](specs/v0.1-browser-terminal.md).

## 0.1 Constraints

This section keeps only the durable `0.1` boundaries and invariants. Detailed behavior lives in [the 0.1 browser-terminal spec](specs/v0.1-browser-terminal.md).

### Deployment And Security

- The supported default is localhost, LAN, or another trusted private network.
- Careful WAN exposure is allowed as an operator-managed deployment pattern around the app.
- `0.1` expects operators to provide the surrounding WAN controls they need, such as TLS, external auth, ingress policy, VPN or mesh access, or equivalent safeguards.
- No built-in claim that the configured app password by itself is a complete public-internet security story.
- No full account system.
- No built-in multi-user authorization model beyond the configured app password.
- No built-in TLS termination.

### Session Lifetime And Recovery

- No PTY/session resurrection after process or server restart.
- No workspace-instance persistence across server restart; only authenticated browser sessions may survive restart.
- Restart-stable auth state never implies session resurrection for PTYs or shells.

After-restart page recovery behavior is detailed in [the 0.1 browser-terminal spec](specs/v0.1-browser-terminal.md); the auth-session persistence model lives in [the 0.1 persistent auth sessions spec](specs/v0.1-persistent-auth-sessions.md).

### Cross-Device And Mobile Interaction

- Mobile users must have access to terminal-essential keys even when the OS keyboard is limited.
- Workstation and mobile browsers should use the same core layout rather than switching into a separate mobile-specific arrangement.
- The host machine identity and current product version should remain visible before and after login on every device.

Detailed mobile keyboard tray, viewport, instance rail, control surfaces, and text-assistance behavior live in [the 0.1 browser-terminal spec](specs/v0.1-browser-terminal.md) and [the 0.1.1 mobile stabilization spec](specs/v0.1.1-mobile-stabilization.md).
