# TermiWeb Plan

## Current Focus

Dogfood the now mostly settled 0.1 browser terminal, keep the release-polish work aligned with the docs, and drive the release toward the `0.1` bar defined in [the release standard](RELEASE_STANDARD.md) with interactive CLI rendering integrity as the main blocker.

## Milestones

- [x] 2026-04-06 M1: Repository bootstrap and docs baseline
- [x] 2026-04-06 M2: Shared terminal backend and session model
- [x] 2026-04-06 M3: Browser UI with instances, auth, and mobile controls
- [x] 2026-04-07 M4: Local verification and launch polish
- [ ] 2026-04-11 M5: 0.1 release polish and rendering integrity
- [ ] 2026-04-18 M6: Installer experience
- [ ] 2026-04-25 M7: 0.1 release and GitHub Pages download website
- [ ] 2026-05-23 M8: Marketing for an open-source, free-to-use product

## Future Candidates

- `0.2` candidate: isolated workstation-hosted `Browser` instances with one tab and basic browser chrome
- `0.2` candidate: side-by-side instance view for very wide workstation windows

## Release Gate

- `0.1` should ship only when it meets [the release standard](RELEASE_STANDARD.md).
- The most serious known gap against that standard right now is `Finding 5` in [FINDINGS.md](FINDINGS.md): interactive CLI rendering truth for tools such as Claude Code and Codex.

## Next Action

Keep `M5` focused on `Finding 5` in [FINDINGS.md](FINDINGS.md): wrong-place input, ghost text, and viewport drift in interactive CLI tools such as Claude Code and Codex. The current sub-pass is local cursor-follow and viewport behavior for active typing, followed by more dogfooding of the improved TUI scrolling model before deciding whether remaining CLI rendering defects are release-blocking.
