# TermiWeb Plan

## Current Focus

Dogfood the first usable 0.1 browser terminal, implement per-instance column width as the next shared-session control, and drive the release toward the `0.1` bar defined in [the release standard](RELEASE_STANDARD.md).

## Milestones

- [x] M1: Repository bootstrap and docs baseline
- [x] M2: Shared terminal backend and session model
- [x] M3: Browser UI with instances, auth, and mobile controls
- [x] M4: Local verification and launch polish

## Future Candidates

- `0.2` candidate: isolated workstation-hosted `Browser` instances with one tab and basic browser chrome

## Release Gate

- `0.1` should ship only when it meets [the release standard](RELEASE_STANDARD.md).
- The most serious known gap against that standard right now is `Finding 5` in [FINDINGS.md](FINDINGS.md): interactive CLI rendering drift and ghost text.

## Next Action

Implement per-instance column width from [the focused spec](specs/v0.1-per-instance-column-width.md): keep `80` as the default for new instances, expose a topbar `Cols N` control for the active instance, and treat width changes as shared session state for all attached devices.
