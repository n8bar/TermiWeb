# TermiWeb Plan

## Current Focus

`M5` and `M6` are complete. `M7` is now the active milestone; the README, package-root docs, site structure, screenshots, fresh local release artifact, site implementation, and milestone-calendar generation are in place. The next step is release metadata and final download wiring around publication time.

## Milestones

- [x] M1: Repository bootstrap and docs baseline
  - Summary: Added the initial repo structure, TypeScript/Vite/server scaffolding, baseline docs, and the first environment/runtime conventions. This is the phase that created the project skeleton later milestones could actually build on.
  - Start: 2026-04-06
  - End: 2026-04-06
- [x] M2: Shared terminal backend and session model
  - Summary: Added the server-side PTY/session manager, protocol, auth/session handling, and lightweight workspace persistence. This is where instance creation, attach/select, close, and shared terminal I/O became real code paths instead of placeholders.
  - Start: 2026-04-06
  - End: 2026-04-06
- [x] M3: Browser UI with instances, auth, and mobile controls
  - Summary: Added the browser client, login flow, instance rail, xterm integration, and the first usable mobile control surface. By the end of this phase, desktop and phone clients could both attach to the same live instance through the browser UI.
  - Start: 2026-04-06
  - End: 2026-04-06
- [x] M4: Local verification and launch polish
  - Summary: Added the first serious verification loop, tightened restart/reconnect behavior, and cleaned up the initial launch/run path enough for real local use. This is also where the project stopped feeling like a dev-only prototype and started behaving like an intentional app.
  - Start: 2026-04-07
  - End: 2026-04-07
- [x] M5: 0.1 release polish and rendering integrity
  - Summary: This milestone contains the major UI/layout refinements, per-instance width controls, mobile behavior fixes, local viewport scrolling, shared terminal geometry cleanup, and the current follow-cursor work. It closed after interactive CLI rendering held up in dogfooding and the elevated-only run path passed live packaged verification.
  - Start: 2026-04-08
  - End: 2026-04-17
  - Notes: extended by one week; closed after the packaged run surface and elevated-instance behavior both passed live verification
- [x] M6: Installer and first-run experience
  - Summary: Added packaging, launch scripts, optional startup-task auto-start, uninstall, distribution layout, and first-run docs for a non-dev Windows install path. Verified fresh-machine setup, before-sign-in auto-start, uninstall cleanup, and two-device shared session on real hardware.
  - Start: 2026-04-12
  - End: 2026-04-13
- [ ] M7: 0.1 release and GitHub Pages download website
  - Summary: This milestone should produce the tagged `0.1` release artifacts plus the GitHub Pages download site that points to them. The code/doc work here is release packaging, distribution metadata, the website content that turns the build into an actual downloadable release, and a small amount of private release-support publishing that stays outside the public launch surface.
  - Start: 2026-04-19
  - Target End: 2026-04-25
  - Worklist: [M7 release and download website](worklists/m7-release-and-download-website.md)
- [ ] M8: Marketing for an open-source, free-to-use product
  - Summary: This milestone is the full marketing phase around the product, not just a bundle of launch materials. It includes messaging, positioning, outreach, demos, screenshots, announcements, and the practical work of getting attention on a shipped open-source product.
  - Start: 2026-04-26
  - Target End: 2026-05-23

## Future Candidates

- `0.2` candidate: isolated workstation-hosted `Browser` instances with one tab and basic browser chrome
- `0.2` candidate: side-by-side instance view for very wide workstation windows
- `0.2` candidate: top-bar QR connect affordance when the current access address is not loopback
- `0.2` candidate: Windows-service hosting mode for boot-start installs
- `0.2` candidate: password-change UI for the configured app password
- `0.3+` candidate: Linux host support for TermiWeb, including Linux PTY/process integration, packaged install/run/auto-start path, and cross-platform doc/spec updates

## Release Gate

- `0.1` should ship only when it meets [the release standard](RELEASE_STANDARD.md).
- There are no open release-blocker findings in [FINDINGS.md](FINDINGS.md) right now.

## Next Action

Prepare the GitHub release notes and publication procedure in the [M7 worklist](worklists/m7-release-and-download-website.md), while leaving the final published asset URL wiring and the live `milestones.ics` URL for the actual release step.
