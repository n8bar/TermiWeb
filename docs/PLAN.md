# TermiWeb Plan

## Current Focus

Dogfood the first usable 0.1 browser terminal, keep the workstation-first deployment story clear, and implement per-instance column width as the next shared-session control.

## Milestones

- [x] M1: Repository bootstrap and docs baseline
- [x] M2: Shared terminal backend and session model
- [x] M3: Browser UI with instances, auth, and mobile controls
- [x] M4: Local verification and launch polish

## Future Candidates

- `0.2` candidate: isolated workstation-hosted `Browser` instances with one tab and basic browser chrome

## Next Action

Implement per-instance column width from [the focused spec](specs/v0.1-per-instance-column-width.md): keep `80` as the default for new instances, expose a topbar `Cols N` control for the active instance, and treat width changes as shared session state for all attached devices.
