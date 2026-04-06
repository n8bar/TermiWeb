# AGENTS

## Working Style
- Keep canonical docs in sync with every meaningful scope or architecture change:
  - `docs/PLAN.md` for milestone order, current focus, and the next implementation target
  - `docs/PRODUCT_SPEC.md` for product-level behavior and invariants
  - `docs/specs/**` for focused technical or feature specs
  - `docs/CHANGELOG.log` for chronological project change notes
- Maintain `docs/CHANGELOG.log` as plain text in chronological order with new entries appended at the bottom.
- Specs come first: align on the requirement in the docs, implement, then update docs to match what actually shipped.
- Docs are primarily internal engineering documents for future maintenance, not end-user documentation.
- Keep `AGENTS.md` updated when the repo workflow or project-specific constraints change.
- If the user is asking for input or feedback, answer first and confirm before making changes when the request is still decision-seeking.
- If asked to implement code before a spec exists, recommend capturing the scope in docs first unless the user explicitly wants to skip that step.
- If a new doc or spec materially shapes future implementation scope, pause for user review before treating that doc as approved direction.
- Preserve unrelated local changes. Do not revert work you did not make.
- Use path-scoped git staging and commits so unrelated work is never swept into a change by accident.
- GitHub is used as the canonical remote, but tests stay local by default unless the user explicitly asks for hosted automation.
- Branches for new work should follow `codex/<task>` unless an existing branch/PR already owns the work.
- Keep README documentation links current when adding or renaming docs.

## Testing Strategy
- Use TDD where it materially reduces ambiguity:
  - auth/session logic
  - workspace/tab state transitions
  - protocol parsing and validation
  - key-mapping and mobile modifier logic
  - small persistence/state helpers
- Use spike-first, then add tests for:
  - terminal process integration
  - browser terminal wiring
  - reconnect behavior
  - mobile ergonomics and interaction polish
- Run local verification before closing work:
  - `npm run typecheck`
  - `npm test`
  - any task-specific manual browser checks documented in the relevant spec or README

## Project Rules
- Treat the browser UI as the session of record for both desktop and remote access.
- Do not add a separate native-terminal control path unless the user explicitly changes scope.
- Target Windows hosts first and prefer ConPTY-capable integrations.
- Prefer `pwsh` when available, but keep runtime fallback support for Windows PowerShell so the repo stays usable on machines without PowerShell 7 installed.
- Keep the default security posture local/private: no direct public internet assumptions without explicit scope change.
- Persist only lightweight session metadata in v1; do not claim session resurrection that does not actually exist.
- Mobile terminal controls are part of the core product, not a stretch goal. Preserve usable access to modifiers and navigation keys whenever the terminal UI changes.

## Multi-Agent Coordination
- Use subagents only for path-scoped, non-overlapping work that clearly reduces cycle time.
- Keep the critical path with the primary agent: architecture, integration, final verification, and the user-facing summary stay local.
- Assign concrete ownership when delegating. Avoid overlapping write scopes.
- Expect dirty working trees. Stop only when unexpected changes collide with the exact files you need to edit.
- Leave a short handoff note in the final summary when work is paused or partially complete.

## Handy Commands
```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

## Environment Notes
- The default local URL is `http://127.0.0.1:4317`.
- Runtime configuration lives in `.env`; start from `.env.example`.
- Local state belongs under `.termiweb/` and must stay untracked.
- This project currently assumes a Windows host. If cross-platform support is introduced, update the specs and AGENTS guidance together.
