# TermiWeb Plan

## Current Focus

Finish `M5` through continued dogfooding of interactive CLI rendering integrity while starting `M6` in parallel so installer work does not wait on the final rendering verdict. Keep the release-polish work aligned with the docs and drive the release toward the `0.1` bar defined in [the release standard](RELEASE_STANDARD.md).

## Milestones

- [x] M1: Repository bootstrap and docs baseline
  - Summary: Established the repo skeleton, core docs, and the initial product frame so later work had a stable place to land. This phase defined the project as a Windows-first workstation browser terminal rather than a vague remote-shell experiment.
  - Start: 2026-04-06
  - End: 2026-04-06
- [x] M2: Shared terminal backend and session model
  - Summary: Built the shared-session server path, lightweight workspace state, and the core attach/create/close flow for instances. This is the phase that turned TermiWeb into a real multi-client terminal host instead of a static frontend.
  - Start: 2026-04-06
  - End: 2026-04-06
- [x] M3: Browser UI with instances, auth, and mobile controls
  - Summary: Added the browser UI, authenticated access, instance rail, and the first complete mobile control surface. By the end of this phase, the app was usable from both desktop and phone, even if the UX still needed heavy polish.
  - Start: 2026-04-06
  - End: 2026-04-06
- [x] M4: Local verification and launch polish
  - Summary: Tightened the initial run story with local verification, restart handling, and the first launch-quality UX cleanup. This phase made the project feel intentionally runnable instead of only developer-accessible.
  - Start: 2026-04-07
  - End: 2026-04-07
- [ ] M5: 0.1 release polish and rendering integrity
  - Summary: This phase absorbs the concentrated UX polish, cross-device cleanup, and terminal-behavior fixes needed to make `0.1` feel professional. The remaining risk is interactive CLI rendering truth, so dogfooding is still the bottleneck on closing this milestone.
  - Start: 2026-04-08
  - Target End: 2026-04-18
  - Notes: extended by one week; still open because dogfooding remains the bottleneck on interactive CLI rendering truth
- [ ] M6: Installer experience
  - Summary: Package the Windows install/run story so `0.1` does not feel tied to a development workflow. This milestone can overlap with late M5 dogfooding because packaging work is mostly independent of the remaining rendering verdict.
  - Start: 2026-04-12
  - Target End: 2026-04-18
  - Overlap: runs in parallel with the final week of M5
- [ ] M7: 0.1 release and GitHub Pages download website
  - Summary: Cut the actual `0.1` release and publish a simple download/distribution website on GitHub Pages. This milestone should stay blocked until both the release bar and the installer story are genuinely ready.
  - Start: 2026-04-19
  - Target End: 2026-04-25
  - Blocked By: M5 and M6
- [ ] M8: Marketing for an open-source, free-to-use product
  - Summary: Treat launch communication as its own phase rather than an afterthought, with the goal of getting real marketing experience around an open-source free product. This comes after release so messaging is based on a real shipped artifact rather than promises.
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
