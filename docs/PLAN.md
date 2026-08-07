# TermiWeb Plan

## Current Focus

`M1` through `M9` are complete. `0.1.1` is publicly released, the download site is live at `https://termiweb.com`, and the search/discovery foundation is in place for later outreach. `M10` is drafted to ship `0.1.2` covering a mobile Select-mode blocker, a real Windows installer with a passwordless auto-start fix, the instance-titles spec, terminal bell behavior, and verification closure of the lingering `0.1.1` mobile stabilization issues. `M11` holds the deliberate public outreach lane, resequenced behind the `0.1.2` release on 2026-08-06 so first impressions land on the improved install experience. `M12` is drafted as the `0.2` milestone, with the QR connect affordance pulled in as the first included feature candidate without defining the whole version scope.

## Milestones

- [x] M1: Repository bootstrap and docs baseline
  - Summary: Added the initial repo structure, TypeScript/Vite/server scaffolding, baseline docs (including the initial `AGENTS.md`/`CLAUDE.md` working agreement), and the first environment/runtime conventions. This is the phase that created the project skeleton later milestones could actually build on.
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
- [x] M7: 0.1 release and GitHub Pages download website
  - Summary: This milestone produced the tagged `0.1` release artifacts, the live `https://termiweb.com` download site, the public GitHub release entry, the canonical download path at `/download/`, the private milestone-calendar feed, and the launch-surface docs that now describe the shipped release honestly.
  - Start: 2026-04-19
  - End: 2026-04-23
  - Worklist: [M7 release and download website](worklists/m7-release-and-download-website.md)
- [x] M8: Search and discovery foundation for an open-source, free-to-use product
  - Summary: This milestone prepares the public surface without pushing broad attention yet. It includes website search hygiene, metadata, sitemap/Search Console setup, GitHub discovery polish, positioning decisions, and reusable announcement copy that can wait for the post-`0.1.1` outreach lane.
  - Start: 2026-04-24
  - End: 2026-04-26
  - Worklist: [M8 marketing and website growth](worklists/m8-marketing-and-website-growth.md)
- [x] M9: `0.1.1` mobile stabilization
  - Summary: This milestone shipped `0.1.1`, pulling the must-have mobile fixes from Findings `13` and `14` into the release line while keeping release verification local and explicit for the current one-maintainer workflow.
  - Start: 2026-04-27
  - End: 2026-05-01
  - Worklist: [M9 0.1.1 mobile stabilization](worklists/m9-0.1.1-mobile-stabilization.md)
- [ ] M10: `0.1.2` Select fix, Windows installer, instance titles, and bell
  - Summary: This milestone ships `0.1.2` covering the mobile Select-mode release-blocker first, then verification closure of the lingering `0.1.1` mobile stabilization issues, a real Windows installer with a passwordless `SYSTEM` auto-start fix per [the Windows-installer spec](specs/windows-installer.md), implementation of the instance-titles spec, and a new bell-behavior spec plus implementation. Blocked by [#5 mobile Select](https://github.com/n8bar/TermiWeb/issues/5) until that fix lands; the rest of scope follows behind it.
  - Start: 2026-07-24
  - Target End: 2026-09-25
  - Notes: six-week window chosen on 2026-05-23 because the maintainer expects scope to expand beyond the initial drafted breakdown; extended by three weeks on 2026-08-06 when the Windows-installer scope joined after two real-world Windows 11 install failures ([#9](https://github.com/n8bar/TermiWeb/issues/9)); renumbered from M11 to M10 on 2026-08-06 when the release was resequenced ahead of outreach
  - Worklist: [M10 0.1.2 Select fix and titles](worklists/m10-0.1.2-select-fix-and-titles.md)
- [ ] M11: Post-`0.1.1` public outreach
  - Summary: This milestone turns the M8 positioning and reusable copy into deliberate outreach once the `0.1.2` release has shipped, so first impressions land on the improved install experience. It includes direct sharing, feedback capture, first public technical post preparation, community-rule review, and a later Product Hunt decision.
  - Start: 2026-09-25
  - Target End: 2026-10-09
  - Notes: originally scheduled 2026-05-11 to 2026-07-24 (after a two-month extension on 2026-05-23 so other projects could take priority); renumbered from M10 to M11 and resequenced behind the `0.1.2` release on 2026-08-06 because the observed install failures ([#9](https://github.com/n8bar/TermiWeb/issues/9), [#10](https://github.com/n8bar/TermiWeb/issues/10)) would undermine outreach first impressions
  - Worklist: [M11 post-0.1.1 public outreach](worklists/m11-post-0.1.1-public-outreach.md)
- [ ] M12: `0.2`
  - Summary: This milestone ships the first `0.2` release. The QR connect affordance is already pulled in as the easiest included feature candidate, and the milestone leaves room to add other bounded `0.2` features before the release surface is locked.
  - Start: 2026-10-09
  - Target End: 2026-11-06
  - Notes: four-week window chosen on 2026-07-11 with QR already included because the first `0.2` scope should stay bounded even if more small feature candidates join behind it; start and target end shifted on 2026-08-06 to follow the extended `0.1.2` window and the resequenced `M11` outreach milestone
  - Worklist: [M12 0.2](worklists/m12-0.2.md)

## Future Candidates

These are feature candidates for later version scope. Here, `candidate` means a possible feature or release-scope item to pull into a future version, not a release-candidate build.

- `0.2` feature candidate: isolated workstation-hosted `Browser` instances with one tab and basic browser chrome
- `0.2` feature candidate: side-by-side instance view for very wide workstation windows
- `0.2` feature candidate: Windows-service hosting mode for boot-start installs
- `0.2` feature candidate: password-change UI for the configured app password
- Contributor-readiness scope candidate: hosted CI for typecheck, tests, build, site build, and release-candidate checks before accepting outside PRs or when the project has multiple active contributors
- Distribution candidate: code-sign the Windows installer (free open-source tier or low-cost option) to remove the SmartScreen warning, once the unsigned-with-documented-bypass path proves insufficient
- `0.3+` feature candidate: Linux host support for TermiWeb, including Linux PTY/process integration, packaged install/run/auto-start path, and cross-platform doc/spec updates

## Release Gate

- Future releases should ship only after their documented local release checks pass.
- Open release-blocker issues for the next release (`0.1.2` via `M10`): [#5 mobile Select button exits selection mode immediately on tap](https://github.com/n8bar/TermiWeb/issues/5), [#9 packaged setup fails on Windows 11 at the auto-start password step](https://github.com/n8bar/TermiWeb/issues/9), and [#10 failure-prone packaged zip setup](https://github.com/n8bar/TermiWeb/issues/10). ([FINDINGS.md](FINDINGS.md) is the closed historical archive of pre-`0.1.1` findings.)

## Next Action

Start [M10 0.1.2 Select fix and titles](worklists/m10-0.1.2-select-fix-and-titles.md), beginning with the [#5](https://github.com/n8bar/TermiWeb/issues/5) Select-mode reproduction on a real mobile browser. User review of [the Windows-installer spec](specs/windows-installer.md) is the standing gate before installer implementation begins.
