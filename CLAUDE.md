# AGENTS

## 1. Working Style
1. Keep canonical docs in sync with every meaningful scope or architecture change:
   1. `docs/PLAN.md` for milestone order, current focus, and the next implementation target
   2. `docs/PRODUCT_SPEC.md` for product-level behavior and invariants
   3. `docs/FINDINGS.md` for dogfood findings and deferred polish work
   4. `docs/RELEASE_STANDARD.md` for the current `0.1` quality/completeness bar
   5. `docs/specs/**` for focused technical or feature specs
   6. `docs/worklists/**` for detailed execution docs and todo lists
   7. `docs/CHANGELOG.log` for chronological project change notes
2. Maintain `docs/CHANGELOG.log` as plain text in chronological order with new entries appended at the bottom.
3. Specs come first: align on the requirement in the docs, implement, then update docs to match what actually shipped.
4. Docs are primarily internal engineering documents for future maintenance, not end-user documentation.
5. Keep `AGENTS.md` and `CLAUDE.md` in sync — they are mirrors of each other for different agent runtimes (Codex reads `AGENTS.md`; Claude Code reads `CLAUDE.md`). Update both when rules change.
6. When adding or editing rules, avoid overly restrictive or micromanaging wording. Prefer the minimum rule needed to protect the repo's actual workflow and quality bar.
7. During dogfooding, log issues in `docs/FINDINGS.md` instead of treating every observation as an immediate implementation task.
8. During release polish, keep `docs/PLAN.md`, `docs/FINDINGS.md`, and `docs/RELEASE_STANDARD.md` aligned on the actual blocker instead of letting milestone text drift behind reality.
9. Run commands directly using available tools. Do not ask the user to open a terminal or run something the agent can run itself.
10. If the user is asking for input or feedback, answer first and confirm before making changes when the request is still decision-seeking.
11. If asked to implement code before a spec exists, recommend capturing the scope in docs first unless the user explicitly wants to skip that step.
12. If a new doc or spec materially shapes future implementation scope, pause for user review before treating that doc as approved direction.
13. Preserve unrelated local changes. Do not revert work you did not make.
14. Use path-scoped git staging and commits so unrelated work is never swept into a change by accident.
15. GitHub is used as the canonical remote, but tests stay local by default unless the user explicitly asks for hosted automation.
16. Branches for new work should follow `codex/<task>` unless an existing branch/PR already owns the work.
17. Keep README documentation links current when adding or renaming docs.
18. Do not add artificial numbering to a document's lone title heading.
19. If a document uses numbered headings, the first numbered heading at any tier starts at `1`.
20. Heading level choice should follow the document structure; numbering rules do not imply a required heading depth.
21. Avoid vague placeholder words such as `shape` when a more concrete term would say what is actually meant. Prefer specific terms like `layout`, `structure`, `contents`, `plan`, `scope`, `behavior`, or another word that names the real thing directly.
22. Keep substantial drafts such as release-note bodies, announcement copy, or long procedures in their own docs and have worklists reference them instead of embedding them inline.

## 2. Worklists
1. Use `docs/worklists/` for worklists: execution docs and todo lists.
2. `docs/PLAN.md` remains the high-level execution document:
   1. milestone order
   2. milestone timing
   3. current focus
   4. short milestone summaries only
3. Worklists hold the detailed execution layer that does not belong in `docs/PLAN.md`.
4. A worklist may include:
   1. task breakdown
   2. sequencing
   3. verification checklist
   4. blockers
   5. partial completion notes
   6. handoff notes
5. When worklist items are actionable tasks or verification points, use numbered checkboxes so they can carry both status and referenceability.
6. Default to worklist order execution except for parallel work or explicit user requests.
7. Worklists must not replace specs.
8. Specs define requirements, scope, constraints, and acceptance criteria.
9. Plans define milestone-level schedule and focus.
10. Changelog records what already happened.
11. A worklist may target:
   1. one whole milestone
   2. one clearly bounded portion of one milestone when that milestone is large enough to justify separate execution tracking
12. A worklist must never span multiple milestones.
13. In `docs/worklists/**`, purely descriptive headings may stay unnumbered; numbered headings should reflect only the actionable section sequence.
14. Each worklist should include the milestone timing it mirrors from `docs/PLAN.md`, while `docs/PLAN.md` remains the canonical schedule source.

## 3. Testing Strategy
1. Use TDD where it materially reduces ambiguity:
   1. auth/session logic
   2. workspace/tab state transitions
   3. protocol parsing and validation
   4. key-mapping and mobile modifier logic
   5. small persistence/state helpers
2. Use spike-first, then add tests for:
   1. terminal process integration
   2. browser terminal wiring
   3. reconnect behavior
   4. mobile ergonomics and interaction polish
3. Run local verification before closing work:
   1. `npm run typecheck`
   2. `npm test`
   3. any task-specific manual browser checks documented in the relevant spec or README

## 4. Project Rules
1. Treat the browser UI as the session of record for both desktop and remote access.
2. Do not add a separate native-terminal control path unless the user explicitly changes scope.
3. Target Windows hosts first and prefer ConPTY-capable integrations.
4. Prefer `pwsh` when available, but keep runtime fallback support for Windows PowerShell so the repo stays usable on machines without PowerShell 7 installed.
5. Keep the default security posture local/private: no direct public internet assumptions without explicit scope change.
6. Persist only lightweight session metadata in v1; do not claim session resurrection that does not actually exist.
7. Mobile terminal controls are part of the core product, not a stretch goal. Preserve usable access to modifiers and navigation keys whenever the terminal UI changes.

## 5. Multi-Agent Coordination
1. Use subagents only for path-scoped, non-overlapping work that clearly reduces cycle time.
2. Keep the critical path with the primary agent: architecture, integration, final verification, and the user-facing summary stay local.
3. Assign concrete ownership when delegating. Avoid overlapping write scopes.
4. Expect dirty working trees. Stop only when unexpected changes collide with the exact files you need to edit.
5. Leave a short handoff note in the final summary when work is paused or partially complete.

## 6. Handy Commands
```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

## 7. Environment Notes
1. The default local URL is `http://127.0.0.1:22443`.
2. Runtime configuration lives in `.env`; start from `.env.example`.
3. Local state belongs under `.termiweb/` and must stay untracked.
4. Local marketing scratch files and other dev-environment-specific material belong under `.cybercreek/` and must stay untracked.
5. This project currently assumes a Windows host. If cross-platform support is introduced, update the specs and AGENTS guidance together.
