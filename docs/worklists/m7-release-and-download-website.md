# M7 Release And Download Website Worklist

## Scope
This worklist covers the detailed execution layer for milestone `M7`.

Milestone timing, mirrored from [the plan](../PLAN.md):
- Start: `2026-04-19`
- Target End: `2026-04-25`

`M7` includes the public launch surface for `0.1`: the final Windows release artifact, the GitHub release entry, the GitHub Pages download website, the README overhaul that turns the repo root into a clean entrypoint, and the supporting release-facing copy and visuals that make those surfaces feel coherent together.

Read this worklist alongside [the plan](../PLAN.md) for milestone timing and sequencing, [the product spec](../PRODUCT_SPEC.md) for product-level behavior, [the release standard](../RELEASE_STANDARD.md) for the `0.1` release bar, and [the `0.1` release package contract](../specs/v0.1-release-package-contract.md) for the packaged artifact expectations that the site and release notes need to describe honestly.

This worklist does not cover `M8` marketing rollout. `M7` should create a clean public release surface, not a full campaign.

## Desired Outcome
Someone landing on the repo, the GitHub release, or the download website for the first time should be able to understand what TermiWeb is, what `0.1` supports, how to download it, how to start it, and what trust/deployment boundaries still apply.

The public-facing materials should agree with the shipped package exactly. The release artifact, package-root docs, README, GitHub release notes, and download website should all tell the same story with the same filenames, versioning, and product constraints.

The result should feel like an intentional launch surface rather than a source repo that happens to contain a downloadable zip.

## Sequencing Notes
1. Start with the README and package-root doc overhaul, then rebuild the local release artifact before site implementation.
   The website should launch from settled release-facing language and a real current package surface rather than forcing the README and package docs to catch up afterward.

2. Do not publish the GitHub release before the website and package-root docs agree on filenames and onboarding guidance.

3. Keep `M7` release-focused.
   If a task turns into broad marketing, announcement strategy, outreach, or campaign copy, move it to `M8` rather than letting `M7` sprawl.

4. Treat the milestone calendar feed as private release-support plumbing.
   It should stay unlinked from the public launch surface and out of the release-facing copy whether it is published from the repo or alongside the GitHub Pages site.

5. Treat the custom-domain cutover as a launch step, not early setup.
   The root domain is the intended public URL, so the work should talk in terms of GitHub Pages custom-domain and apex DNS records, with `www` redirect behavior handled on top of that instead of reducing the whole step to a `CNAME`. Do that cutover near publication time so the domain does not point at an unfinished release surface.

## 1. Work Breakdown
1. [x] Lock the `0.1` public release contract.
   Capture the release-facing decisions that every `M7` surface depends on: final version string, release artifact name, tag name, GitHub release title, and the exact package-root files that the README and website will reference before the live download URL exists.
   Locked decisions:
   - release version: `0.1.0`
   - git tag: `v0.1.0`
   - GitHub release title: `TermiWeb 0.1.0`
   - primary downloadable asset: `TermiWeb-0.1.0-windows-x64.zip`
   - publicly referenced package-root docs: `1.Start-Here.md`, `DISCLAIMER.md`, `THIRD_PARTY_NOTICES.md`
   - `ReadMe.txt` ships only as an in-package pointer and is not part of the promoted public launch surface

2. [x] Overhaul the README before building the website.
   Make the repo root a clean public entrypoint first.
   1. [x] Rewrite the top of `README.md` around a short product pitch, the packaged quick-start path, and the final download-section shape without pretending the live release URL already exists.
   2. [x] Trim the README's internal-doc links down to a small additional-info section so the README does not open like an internal maintenance index.
   3. [x] Make sure the README language matches the actual `0.1` constraints: Windows host scope, elevated-only shells, trusted-network-first posture, and operator-managed WAN guidance.

3. [x] Align the package-root docs with the public launch surface.
   `1.Start-Here.md`, `DISCLAIMER.md`, `THIRD_PARTY_NOTICES.md`, and the package-root launcher names should read like one release surface instead of separate documents that happen to ship together.

4. [x] Define the download website structure and copy.
   Set the information architecture before implementation so the site does not drift into generic launch-page filler.
   1. [x] Decide whether the site is a single page or a very small multi-page surface.
      Use a single page for `0.1`, but keep the content structure clean enough that a later release could split sections out if expansion becomes worthwhile.
   2. [x] Define the required sections for the single-page `0.1` site.
      Required sections:
      - Hero
      - What `0.1` Supports
      - Screenshots
      - Download
      - First Run
      - Trust Boundaries
      - Source
   3. [x] Define the website copy boundaries so `M7` does not accidentally absorb `M8` marketing scope.
      `M7` site copy should market the real `0.1` release: clear product framing, strong screenshots, confident positioning, and a clean download/start path. It should stop short of campaign-style claims, comparisons, testimonials, or future-version selling.

5. [x] Produce the release visuals needed by the site and GitHub release.
   Captured the minimum useful visual set in `assets/screenshots/`: one workstation screenshot and one phone screenshot. No separate package-root or setup image was needed for the minimum comprehension bar.

6. [x] Build a fresh local release artifact before site implementation.
   Rebuilt the current `0.1` package locally and used that assembled artifact as the concrete release surface the site and release notes must describe. The packaged client includes the shipped favicon.

7. [x] Implement the GitHub Pages site.
   Built the single-page site in `src/site` with `npm run dev:site` and `npm run build:site`, using the current local release artifact as the source of truth for the copy, screenshots, and placeholder download target.

8. [x] Prepare the GitHub release notes and publication procedure.
   The release notes should state what `0.1` is, what it supports, what the known operational boundaries are, how to get started, and where to find the download website and source repository.
   1. [x] Review and lock the release-note section set.
      Use these sections:
      - short release summary
      - what it supports
      - packaged quick start
      - operating boundaries
      - known issues
      - links
   2. [x] Review and finalize the GitHub release-body draft.
      Use the current draft in [v0.1 release publication draft](../v0.1-release-publication-draft.md).
   3. [x] Follow a deliberate manual publication order instead of publishing ad hoc.
      Use the manual order in [v0.1 release publication draft](../v0.1-release-publication-draft.md).

## 2. Verification Checklist
1. [x] The README works as a public repo landing page instead of an internal engineering index.
2. [x] The public docs and site describe `0.1` honestly: Windows host scope, elevated-only shells, trusted-network-first default, and operator-managed WAN posture.
3. [x] The package-root onboarding path is coherent: `ReadMe.txt`, `1.Start-Here.md`, `DISCLAIMER.md`, and the launcher names all agree and point to the right next step.
4. [x] The website renders cleanly on both workstation and phone browsers.
5. [x] The screenshots and copy reflect the actual shipped UI rather than stale prerelease visuals.

## 3. Publication Runbook
1. [ ] Publish a private milestone calendar feed at a stable public URL.
   Publish `milestones.ics` at its stable public URL and keep that URL out of the public site, README, and release copy. The file may live as a regular repo artifact or alongside the GitHub Pages site; the requirement is a dependable subscription URL, not a specific hosting surface. This is internal support plumbing for private calendar subscription, not part of the launch surface.

2. [ ] Wire the site and README to the real release artifact.
   Once the final published asset URL is real, update every public-facing surface to point at the exact released file rather than local artifact paths or temporary placeholders.

3. [ ] Dry-run the full release surface before publishing.
   Treat the package, README, GitHub release draft, and website as one integrated system and verify them together before the public push.

4. [ ] Publish `0.1` and verify the public surface live.
   Create the tag and GitHub release, upload the final artifact, configure the root custom domain and DNS for the GitHub Pages site, decide how `www` should redirect, deploy the site, and confirm that the live README, release, and website all point to the same real downloadable package. Treat the domain cutover as part of the public launch instead of an early setup step.

5. [ ] Close `M7` cleanly.
   Update the plan, worklist, and changelog with the actual release result, then leave any remaining public-surface polish for `M8` or later findings instead of silently carrying unfinished launch work forward.

6. [ ] Publication Verification
	1. [ ] The packaged release artifact name, version, and download URL match across the package, README, GitHub release, and website.
	2. [ ] The GitHub release notes, release title, and download website all point to the same final release artifact.
	3. [ ] No stale prerelease references remain, including outdated filenames such as `FIRST_RUN.md`, stale blocker language, or temporary placeholder copy.
	4. [ ] The `milestones.ics` feed exists at its stable public URL, stays out of public navigation and copy, and is suitable for private subscription.
	5. [ ] The root custom domain, its DNS records, any `www` redirect behavior, and the Pages HTTPS state are all working as intended at public launch.
