# TermiWeb Plan

## Current Focus

Finish `M5` through continued dogfooding of interactive CLI rendering integrity while starting `M6` in parallel so installer and first-run experience work does not wait on the final rendering verdict. Keep the release-polish work aligned with the docs and drive the release toward the `0.1` bar defined in [the release standard](RELEASE_STANDARD.md).

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
- [ ] M5: 0.1 release polish and rendering integrity
  - Summary: This milestone contains the major UI/layout refinements, per-instance width controls, mobile behavior fixes, local viewport scrolling, shared terminal geometry cleanup, and the current follow-cursor work. What remains open here is the rendering-truth problem in interactive CLI tools, which still needs dogfood validation before `0.1` can be called clean.
  - Start: 2026-04-08
  - Target End: 2026-04-18
  - Notes: extended by one week; still open because dogfooding remains the bottleneck on interactive CLI rendering truth
- [ ] M6: Installer and first-run experience
  - Summary: This milestone should add the packaging, launch scripts, optional startup-task auto-start path, uninstall path, distribution layout, and supporting docs needed for a non-dev Windows install/run path. It also includes the first-run walkthrough that gets a newly installed user to one live shared session visible from two devices at the same time.
  - Start: 2026-04-12
  - Target End: 2026-04-18
  - Overlap: runs in parallel with the final week of M5
- [ ] M7: 0.1 release and GitHub Pages download website
  - Summary: This milestone should produce the tagged `0.1` release artifacts plus the GitHub Pages download site that points to them. The code/doc work here is release packaging, distribution metadata, and the website content that turns the build into an actual downloadable release.
  - Start: 2026-04-19
  - Target End: 2026-04-25
  - Blocked By: M5 and M6
- [ ] M8: Marketing for an open-source, free-to-use product
  - Summary: This milestone is the full marketing phase around the product, not just a bundle of launch materials. It includes messaging, positioning, outreach, demos, screenshots, announcements, and the practical work of getting attention on a shipped open-source product.
  - Start: 2026-04-26
  - Target End: 2026-05-23

## Future Candidates

- `0.2` candidate: isolated workstation-hosted `Browser` instances with one tab and basic browser chrome
- `0.2` candidate: side-by-side instance view for very wide workstation windows
- `0.2` candidate: top-bar QR connect affordance when the current access address is not loopback
- `0.2` candidate: Windows-service hosting mode for boot-start installs

## Release Gate

- `0.1` should ship only when it meets [the release standard](RELEASE_STANDARD.md).
- The most serious known gap against that standard right now is `Finding 5` in [FINDINGS.md](FINDINGS.md): interactive CLI rendering truth for tools such as Claude Code and Codex.

## Next Action

Run `M5` and `M6` in parallel. Keep `M5` focused on `Finding 5` in [FINDINGS.md](FINDINGS.md): wrong-place input, ghost text, and viewport drift in interactive CLI tools such as Claude Code and Codex. Start `M6` installer and first-run work now while dogfooding continues, but do not let `M7` release work begin until both `M5` and `M6` are genuinely closed.
