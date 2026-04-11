# TermiWeb Plan

## Current Focus

Dogfood the first usable 0.1 browser terminal, polish the release-critical auth and rendering gaps, and drive the release toward the `0.1` bar defined in [the release standard](RELEASE_STANDARD.md).

## Milestones

- [x] 2026-04-06 M1: Repository bootstrap and docs baseline
- [x] 2026-04-06 M2: Shared terminal backend and session model
- [x] 2026-04-06 M3: Browser UI with instances, auth, and mobile controls
- [x] 2026-04-07 M4: Local verification and launch polish
- [ ] 2026-04-11 M5: Per-instance custom width and release polish
- [ ] 2026-04-18 M6: Installer experience
- [ ] 2026-04-25 M7: 0.1 release and GitHub Pages download website
- [ ] 2026-05-23 M8: Marketing for an open-source, free-to-use product

## Future Candidates

- `0.2` candidate: isolated workstation-hosted `Browser` instances with one tab and basic browser chrome

## Release Gate

- `0.1` should ship only when it meets [the release standard](RELEASE_STANDARD.md).
- The most serious known gap against that standard right now is `Finding 5` in [FINDINGS.md](FINDINGS.md): interactive CLI rendering drift and ghost text.

## Next Action

Continue `M5` release polish with `Finding 5` in [FINDINGS.md](FINDINGS.md): interactive CLI rendering drift and ghost text, now validating the first xterm repaint plus same-size PTY redraw recovery pass while dogfooding the clarified width-fit behavior from [the focused spec](specs/v0.1-per-instance-column-width.md).
