# M1 Repository Bootstrap And Docs Baseline

Milestone Timing: Mirrors `M1` in [Project plan](../PLAN.md): start `2026-04-06`, end `2026-04-06` (completed same-day).

Status: Completed on 2026-04-06. Reconstructed retroactively on 2026-08-06 from git history and the changelog; the worklist convention did not exist yet during this milestone (it was defined on 2026-04-12), and `M1`-`M4` themselves were backdated onto the 2026-04-06/07 history when the dated roadmap was created. Task boundaries here are thematic, not contemporaneous records.

## Desired Outcome

TermiWeb should leave `M1` with a real project skeleton instead of an empty repository: TypeScript/Vite/server scaffolding that builds and tests locally, the baseline canonical docs, and the environment and runtime conventions that later milestones can rely on without renegotiating them.

## 1. Work Breakdown

1. [x] Bootstrap the canonical docs baseline.
   1. [x] Write the initial project plan with the intended build direction.
   2. [x] Write the initial product spec for the shared browser-terminal concept.
   3. [x] Write the initial README as the repo entrypoint.
   4. [x] Establish the `AGENTS.md`/`CLAUDE.md` working agreement for agent-driven development.
   5. [x] Start the chronological plain-text changelog with new entries appended at the bottom.

2. [x] Scaffold the application skeleton.
   1. [x] Set up the TypeScript/Vite client build.
   2. [x] Set up the Node server entrypoint with its own TypeScript build.
   3. [x] Wire the standard npm scripts: `dev`, `typecheck`, `test`, `build`.
   4. [x] Add the first local tests so `npm test` is real from day one.
   5. [x] Prove the production build path produces a runnable output.

3. [x] Establish the environment and runtime conventions.
   1. [x] Define the `.env` configuration surface with a tracked `.env.example` template and the real `.env` untracked.
   2. [x] Add repo-root `.env` loading so configuration works without shell-level environment setup.
   3. [x] Move the default web port from `4317` to `22443`.
      Decision: `4317` collides with common telemetry ports; `22443` avoids that and matches the preferred app identity.

## 2. Verification Checklist

1. [x] The repository builds, typechecks, and tests locally through the standard npm scripts.
2. [x] The baseline docs (plan, product spec, README, agent working agreement) exist and agree on the project's scope and direction.
3. [x] Runtime configuration flows from `.env` with a tracked example template, and the default port decision is recorded.
