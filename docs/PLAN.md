# TermiWeb Plan

## Current Focus

Dogfood the first usable 0.1 browser terminal, implement per-instance column width as the next shared-session control, and drive the release toward the `0.1` bar defined in [the release standard](RELEASE_STANDARD.md).

## Milestones

- [x] 2026-04-06 M1: Repository bootstrap and docs baseline
- [x] 2026-04-06 M2: Shared terminal backend and session model
- [x] 2026-04-06 M3: Browser UI with instances, auth, and mobile controls
- [x] 2026-04-07 M4: Local verification and launch polish
- [ ] 2026-04-11 M5: Per-instance custom width and release polish
- [ ] 2026-04-18 M6: 0.1 release and GitHub Pages download website
- [ ] 2026-05-16 M7: Marketing for an open-source, free-to-use product

## Future Candidates

- `0.2` candidate: isolated workstation-hosted `Browser` instances with one tab and basic browser chrome

## Release Gate

- `0.1` should ship only when it meets [the release standard](RELEASE_STANDARD.md).
- The most serious known gap against that standard right now is `Finding 5` in [FINDINGS.md](FINDINGS.md): interactive CLI rendering drift and ghost text.

## Next Action

Implement per-instance column width from [the focused spec](specs/v0.1-per-instance-column-width.md): keep `80` as the default for new instances, expose a topbar `Cols N` control for the active instance, and treat width changes as shared session state for all attached devices.
