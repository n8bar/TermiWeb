# M8 Marketing And Website Growth

Milestone Timing: Mirrors `M8` in [Project plan](../PLAN.md): start `2026-04-24`, target end `2026-05-23`.

Note: Keep the execution layer inside this worklist or tightly linked docs instead of letting it spill into [Project plan](../PLAN.md).
Note: Shared `M8` marketing materials should live under `marketing/assets/` and `marketing/research/`. Use `.cybercreek/` only for local scratch that should stay untracked.

## Desired Outcome

TermiWeb should leave `M8` with a stronger public website, better search and sharing hygiene, a clearer product story, and a concrete marketing plan for reaching the first real audience of the shipped `0.1` release.

## 1. Work Breakdown

1. [x] Define and implement the live SEO/search-engine strategy.
   1. [x] Research what search intent the live homepage should target and which terms or phrases TermiWeb can realistically try to win first, then capture the decision that follows from that research.
   2. [x] Tweak the homepage copy, section hierarchy, and primary CTA so they better support the chosen search intent.
   3. [x] Add or correct the core metadata: page title, description, canonical URL, Open Graph fields, and any equivalent search or sharing tags the site is still missing.
   4. [x] Add the crawl and discovery files the site should ship with, such as `robots.txt` and a sitemap, if they do not already exist.
   5. [x] Add any structured data, indexing hints, or search-console setup work that the live site should have before wider outreach begins, and expand `M8.2` with the resulting execution tasks instead of leaving them implied.

2. [x] Define the target audiences and their entry points.
   1. [x] Identify the first real audiences worth pursuing.
   2. [x] Capture the problems each audience is likely to care about.
   3. [x] Note the channels, communities, or search paths where each audience is most likely to discover TermiWeb.

3. [x] Define the core marketing message.
   1. [x] Define the shortest defensible pitch for TermiWeb.
   2. [x] Define the longer framing that explains what makes it different without overselling beyond `0.1`.
   3. [x] Define the repeatable proof points that should stay consistent across the website, README, release notes, screenshots, and public posts.

4. [x] Plan the public content and asset set.
   1. [x] Decide if any screenshots, demos, writeups, and supporting visuals are still missing beyond the current release site and what those are specifically.
   2. [x] Define the minimum announcement-copy set: short post, medium post, longer launch writeup, and any reusable blurbs for repo or profile surfaces.
   3. [x] Organize the marketing materials as they are defined so later execution work has a clear tracked home under `marketing/assets/` and `marketing/research/` instead of scattered scratch files.
   4. [x] Decide whether the current site needs any new visual assets before wider outreach starts.

5. [x] Plan the distribution and outreach sequence.
   1. [x] Capture the channels worth using for `M8`: site, repo, GitHub release surface, communities, socials, direct sharing, or anything else that survives scrutiny.
   2. [x] Decide the order of the first public pushes instead of treating outreach as one undifferentiated blast.
   3. [x] Define the cadence for those pushes so `M8` produces a real sequence instead of a one-day spike and silence.
   4. [x] Expand `M8.2` with the resulting channels and their execution tasks once the distribution and outreach strategy is defined, and update `M8.3` too if the new execution work introduces new QA concerns.

6. [x] Define a simple measurement and feedback loop.
   1. [x] Decide what counts as meaningful traction during `M8`.
   2. [x] Decide how those signals will actually be collected.
   3. [x] Define how `M8` feedback should feed back into later website, messaging, or outreach work.

## 2. Execution Plan

1. [x] Finish the live site search-discovery setup.
   1. [x] Verify `https://termiweb.com/robots.txt` and `https://termiweb.com/sitemap.xml` after the next site deployment.
   2. [x] Add `https://termiweb.com/` in Google Search Console with the user present for account/domain access.
   3. [x] Submit `https://termiweb.com/sitemap.xml` in Google Search Console.
   4. [x] Request indexing for the homepage once the updated metadata and structured data are live.
   5. [x] Record any Search Console verification notes or follow-up work in this worklist or a linked `marketing/research/` note.

2. [ ] Polish the GitHub repository discovery surface.
   1. [x] Add or verify a concise repository description aligned with the M8 pitch.
   2. [x] Add or verify GitHub topics that match the Windows browser-terminal search target without implying SSH or remote-desktop scope.
   3. [ ] Add a GitHub social-preview image sized for reliable link previews.
      Candidate asset: `marketing/assets/github-social-preview.png`.

3. [x] Prepare reusable announcement materials.
   1. [x] Draft the short launch post.
   2. [x] Draft the medium launch post.
   3. [x] Draft the longer launch writeup.
   4. [x] Add reusable one-line and paragraph blurbs for repo, profile, and direct-share contexts.

4. [ ] Execute the first outreach sequence.
   1. [ ] Share directly with a small technical group and capture feedback.
   2. [ ] Prepare and post the first public technical launch post if the direct feedback does not expose a blocker.
   3. [ ] Review self-hosted or homelab community rules before posting there.
   4. [ ] Reassess whether Product Hunt belongs in M8 after direct and first-public feedback.

## 3. Verification Checklist


1. [x] Search and sharing surfaces have explicit metadata and intentional preview behavior instead of accidental defaults.
2. [x] The `M8` message is clear enough that later website and outreach edits can reuse it without drifting.
3. [x] The audience, asset, and channel decisions are concrete enough to execute without turning [Project plan](../PLAN.md) into a campaign notebook.
4. [x] The resulting strategy still sounds like an open-source, free-to-use product instead of generic SaaS marketing language.
