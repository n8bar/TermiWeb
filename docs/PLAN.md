# TermiWeb Plan

## Current Focus

Finish `M5` through continued dogfooding of interactive CLI rendering integrity while starting `M6` in parallel so installer work does not wait on the final rendering verdict. Keep the release-polish work aligned with the docs and drive the release toward the `0.1` bar defined in [the release standard](RELEASE_STANDARD.md).

## Milestones

- [x] M1: Repository bootstrap and docs baseline
  - Start: 2026-04-06
  - End: 2026-04-06
  - Basis: earliest filesystem creation evidence in the repo is the project root on 2026-04-06
- [x] M2: Shared terminal backend and session model
  - Start: 2026-04-06
  - End: 2026-04-06
  - Basis: git history
- [x] M3: Browser UI with instances, auth, and mobile controls
  - Start: 2026-04-06
  - End: 2026-04-06
  - Basis: git history
- [x] M4: Local verification and launch polish
  - Start: 2026-04-07
  - End: 2026-04-07
  - Basis: git history
- [ ] M5: 0.1 release polish and rendering integrity
  - Start: 2026-04-08
  - Target End: 2026-04-18
  - Notes: extended by one week; still open because dogfooding remains the bottleneck on interactive CLI rendering truth
- [ ] M6: Installer experience
  - Start: 2026-04-12
  - Target End: 2026-04-18
  - Overlap: runs in parallel with the final week of M5
- [ ] M7: 0.1 release and GitHub Pages download website
  - Start: 2026-04-19
  - Target End: 2026-04-25
  - Blocked By: M5 and M6
- [ ] M8: Marketing for an open-source, free-to-use product
  - Start: 2026-04-26
  - Target End: 2026-05-23
  - Blocked By: M7

## Future Candidates

- `0.2` candidate: isolated workstation-hosted `Browser` instances with one tab and basic browser chrome
- `0.2` candidate: side-by-side instance view for very wide workstation windows

## Release Gate

- `0.1` should ship only when it meets [the release standard](RELEASE_STANDARD.md).
- The most serious known gap against that standard right now is `Finding 5` in [FINDINGS.md](FINDINGS.md): interactive CLI rendering truth for tools such as Claude Code and Codex.

## Next Action

Run `M5` and `M6` in parallel. Keep `M5` focused on `Finding 5` in [FINDINGS.md](FINDINGS.md): wrong-place input, ghost text, and viewport drift in interactive CLI tools such as Claude Code and Codex. Start `M6` installer work now while dogfooding continues, but do not let `M7` release work begin until both `M5` and `M6` are genuinely closed.
