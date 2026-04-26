# M8 Marketing Strategy

Status: Working execution strategy for `M8`.

Date: 2026-04-26

## Scope

This strategy prepares the first public growth push, but broad deliberate outreach is deferred to `M10` after the `0.1.1` stabilization release. It should keep TermiWeb positioned as an open-source, free-to-use Windows browser terminal, not as SaaS, SSH hosting, remote-desktop replacement, or enterprise remote-access software.

## Audience Decisions

### Audience 1: Windows power users who want terminal reach from another device

Problem:
- They have a Windows workstation doing real work, but they do not always want to sit at that keyboard.
- They want PowerShell or Windows CLI access from a phone, tablet, or second machine without remoting the whole desktop.

Entry points:
- Search queries around `browser terminal for Windows`, `PowerShell in the browser`, `browser-based PowerShell`, and `Windows CLI in the browser`.
- Direct sharing from people who already use Windows-first local tools.
- GitHub and README discovery.

### Audience 2: Local-first and self-hosted operators who still use Windows hosts

Problem:
- A lot of self-hosted tooling assumes Linux servers, but some real home and workstation setups still run important Windows hosts.
- They need a private-network-first access path that is honest about security boundaries.

Entry points:
- Self-hosted and homelab communities when the post clearly says what TermiWeb is, how it is installed, what it does, and what it does not secure for you.
- Search paths around private-network browser terminal access.
- GitHub repository links and release artifacts.

### Audience 3: Solo builders and maintainers who move between desk and phone

Problem:
- They may start a command, build, package, or release task at the workstation and want to check or continue it from another browser.
- They care more about continuity and low setup friction than collaboration branding.

Entry points:
- Show-and-tell communities, launch posts, and direct shares that demonstrate one live shell across workstation and phone.
- Screenshots and short demos showing the same instance from two devices.

## Message Decisions

Shortest defensible pitch:
- TermiWeb puts a shared Windows terminal in your browser so you can use the same live PowerShell session from your workstation or phone without remoting the desktop.

Longer framing:
- TermiWeb is an open-source browser terminal for a Windows host. It runs on your workstation, exposes authenticated browser access for localhost or trusted private networks, and lets multiple browsers attach to shared live terminal instances. The `0.1` release focuses on a packaged Windows x64 install path, browser-based PowerShell, phone-friendly controls, and honest local/private-network security boundaries.

Repeatable proof points:
- Browser-based PowerShell on a Windows host.
- Shared live terminal instances across attached browsers.
- Phone-friendly modifier, navigation, selection, copy, and paste controls.
- Packaged Windows x64 release with setup, start, restart, stop, uninstall, and optional before-sign-in auto-start.
- Open-source and free-to-use.
- Trusted-private-network-first, with WAN exposure explicitly left to operator-managed security.

Claims to avoid:
- Do not lead with SSH, relay, tunnel, firewall bypass, zero-trust access, remote desktop, enterprise fleet management, or team collaboration.
- Do not imply built-in TLS, multi-user authorization, or session resurrection after server restart.

## Asset Decisions

Existing assets are enough for the minimum M8 push:
- Workstation screenshot: `assets/screenshots/TermiWeb0.1.png`.
- Phone screenshot: `assets/screenshots/TermiWeb0.1mobile.png`.
- Live homepage and `/download/` path.
- README and GitHub release surface.

Assets to add before wider outreach:
- A repository social-preview image so GitHub links do not depend on the owner avatar or accidental repository preview defaults. Candidate asset: `marketing/assets/github-social-preview.png`.
- A short demo asset showing the same live terminal from workstation and phone if Product Hunt, a longer launch writeup, or visual-first social posts become part of the push.
- Reusable announcement copy in `marketing/assets/` for short, medium, and long formats.

## Distribution Decisions

Recommended channel set:
- Live site: canonical landing page and download path.
- GitHub repository: README, topics, description, release, and social preview.
- Search: Google Search Console property, sitemap submission, and homepage indexing request.
- Direct sharing: trusted technical contacts first, because early feedback quality matters more than raw impressions.
- Hacker News `Show HN`: good fit if the post is technically specific and links to the live site or repository.
- Reddit/self-hosted or homelab communities: possible fit only with a value-first post that clearly includes release readiness, docs, features, and boundaries.
- Product Hunt: later option, not the first push, because the current release is a developer/workstation utility and Product Hunt performs better with prepared launch assets and a larger warm network.

Initial sequence:
1. Deploy the M8 SEO/search-discovery site changes.
2. Complete Google Search Console verification, sitemap submission, and homepage indexing request.
3. Polish the GitHub repository surface: description, topics, and social preview.
4. Prepare short, medium, and long announcement copy in `marketing/assets/`.
5. Ship the `0.1.1` stabilization release in `M9`.
6. Share directly with a small technical group and collect first feedback in `M10`.
7. Run one public technical launch post in `M10`, with `Show HN` as the first candidate if the post is ready.
8. Consider one self-hosted/homelab post only after reviewing current community rules and making the post useful without requiring the link.
9. Reassess Product Hunt after the first feedback cycle and demo assets exist.

Cadence:
- Avoid a one-day blast. Use one major public push per week at most during M8, with smaller direct shares and follow-up responses between pushes.
- Do not cross-post the same link dump to multiple communities on the same day.

## Measurement Decisions

Meaningful M8 traction:
- Search Console shows the homepage discovered, indexed, and beginning to collect impressions for Windows/browser-terminal queries.
- GitHub shows new stars, release downloads, clones, visitors, or issues from people outside the immediate working context.
- Public posts produce substantive comments, questions, install attempts, or bug reports.
- Direct shares produce specific feedback about the product, setup path, positioning, or missing trust information.

Collection methods:
- Google Search Console for search discovery, indexing, query impressions, and click-through.
- GitHub repository traffic, stars, issues, discussions if enabled later, and release download counts.
- Manual notes in `docs/FINDINGS.md` for product issues discovered through dogfooding or public feedback.
- `marketing/research/` notes for marketing/channel feedback that does not belong in product findings.

Feedback loop:
- Product bugs or usability problems go to `docs/FINDINGS.md`.
- Positioning, channel, or asset feedback stays in `marketing/research/` unless it changes product scope.
- Public-copy changes that materially alter product claims must be reflected in the site, README, and relevant docs together.

## Source Signals

- GitHub recommends setting a repository social preview image rather than relying on default repository previews: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview
- Current `r/selfhosted` removal messages emphasize that promoted apps should be self-hostable, released, documented, feature-described, and beneficial to users.
- Recent Product Hunt launch guidance continues to frame launch success as preparation-heavy and feedback-oriented rather than a simple traffic switch.
- Google Search Console requires ownership verification before property data and sitemap submission can be managed: https://support.google.com/webmasters/answer/34592
- Google's URL Inspection tool can test live indexability and request indexing, but indexing is not guaranteed: https://support.google.com/webmasters/answer/9012289
