# M7 Release And Download Website Worklist

## Scope
This worklist covers the detailed execution layer for milestone `M7`.

`M7` includes the public launch surface for `0.1`: the final Windows release artifact, the GitHub release entry, the GitHub Pages download website, the README overhaul that turns the repo root into a clean entrypoint, and the supporting release-facing copy and visuals that make those surfaces feel coherent together.

Read this worklist alongside [the plan](../PLAN.md) for milestone timing and sequencing, [the product spec](../PRODUCT_SPEC.md) for product-level behavior, [the release standard](../RELEASE_STANDARD.md) for the `0.1` release bar, and [the `0.1` release package contract](../specs/v0.1-release-package-contract.md) for the packaged artifact expectations that the site and release notes need to describe honestly.

This worklist does not cover `M8` marketing rollout. `M7` should create a clean public release surface, not a full campaign.

## Desired Outcome
Someone landing on the repo, the GitHub release, or the download website for the first time should be able to understand what TermiWeb is, what `0.1` supports, how to download it, how to start it, and what trust/deployment boundaries still apply.

The public-facing materials should agree with the shipped package exactly. The release artifact, package-root docs, README, GitHub release notes, and download website should all tell the same story with the same filenames, versioning, and product constraints.

The result should feel like an intentional launch surface rather than a source repo that happens to contain a downloadable zip.

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

4. [ ] Define the download website structure and copy.
   Set the information architecture before implementation so the site does not drift into generic launch-page filler.
   1. [ ] Decide whether the site is a single page or a very small multi-page surface.
   2. [ ] Define the required sections, likely including: product overview, what `0.1` supports, screenshots, download, first-run path, trust/deployment boundaries, and source/repo links.
   3. [ ] Define the website copy boundaries so `M7` does not accidentally absorb `M8` marketing scope.

5. [ ] Produce the release visuals needed by the site and GitHub release.
   Capture the minimum useful visual set: at least one strong workstation screenshot, one phone or second-device screenshot, and any package-root or setup visual that materially improves comprehension.

6. [ ] Implement the GitHub Pages site.
   Build the actual website surface in-repo, including layout, styling, copy, screenshots, and final download-link targets.

7. [ ] Wire the site and README to the real release artifact.
   Once the final artifact name and GitHub release URL are real, update every public-facing surface to point at the exact published asset rather than local artifact paths or temporary placeholders.

8. [ ] Prepare the GitHub release notes and publication procedure.
   The release notes should state what `0.1` is, what changed, what the known operational boundaries are, how to get started, and where to find the download website and source repository.

9. [ ] Dry-run the full release surface before publishing.
   Treat the package, README, GitHub release draft, and website as one integrated system and verify them together before the public push.

10. [ ] Publish `0.1` and verify the public surface live.
   Create the tag and GitHub release, upload the final artifact, deploy the site, and confirm that the live README, release, and website all point to the same real downloadable package.

11. [ ] Close `M7` cleanly.
   Update the plan, worklist, and changelog with the actual release result, then leave any remaining public-surface polish for `M8` or later findings instead of silently carrying unfinished launch work forward.

## 2. Sequencing Notes
1. [ ] Start with the README and package-root doc overhaul before site implementation.
   The website should launch from settled release-facing language rather than forcing the README and package docs to catch up afterward.

2. [ ] Do not publish the GitHub release before the website and package-root docs agree on filenames and onboarding guidance.

3. [ ] Keep `M7` release-focused.
   If a task turns into broad marketing, announcement strategy, outreach, or campaign copy, move it to `M8` rather than letting `M7` sprawl.

## 3. Verification Checklist
1. [ ] The README works as a public repo landing page instead of an internal engineering index.
2. [ ] The packaged release artifact name, version, and download URL match across the package, README, GitHub release, and website.
3. [ ] The public docs and site describe `0.1` honestly: Windows host scope, elevated-only shells, trusted-network-first default, and operator-managed WAN posture.
4. [ ] The package-root onboarding path is coherent: `ReadMe.txt`, `1.Start-Here.md`, `DISCLAIMER.md`, and the launcher names all agree and point to the right next step.
5. [ ] The website renders cleanly on both workstation and phone browsers.
6. [ ] The screenshots and copy reflect the actual shipped UI rather than stale prerelease visuals.
7. [ ] The GitHub release notes, release title, and download website all point to the same final release artifact.
8. [ ] No stale prerelease references remain, including outdated filenames such as `FIRST_RUN.md`, stale blocker language, or temporary placeholder copy.
