# Monorepo Phase 7 — Archive former site repository

**Status:** Complete (merged). Archive applied on `after-certainty-site`. Phase 8: [`../monorepo-phase-8/`](../monorepo-phase-8/).  
**Plan:** [`docs/roadmaps/monorepo-migration-plan.md`](../../roadmaps/monorepo-migration-plan.md) §24 Phase 7  
**Predecessor:** [`../monorepo-phase-6/`](../monorepo-phase-6/)

## Goal

Make [`ksteffe/after-certainty-site`](https://github.com/ksteffe/after-certainty-site) a **read-only archive** with a clear pointer to the surviving monorepo path [`apps/site/`](https://github.com/ksteffe/after-certainty/tree/main/apps/site). Issues, PRs, and git history stay on GitHub.

## Preconditions (checked 2026-07-24)

| Check | Status |
|-------|--------|
| Phase 6 merged on `after-certainty` | Yes |
| Open PRs on `after-certainty-site` | **0** |
| Open issues on `after-certainty-site` | **0** |
| Site source of truth | `ksteffe/after-certainty` → `apps/site/` |

## What this PR changes (survivor repo)

| Change | Notes |
|--------|--------|
| Root / `apps/site` READMEs | Point at monorepo site; note old repo is archived (or pending archive) |
| Authoring / ownership docs | `apps/site` instead of separate site repo |
| Phase 6 status | Marked complete |
| Roadmap status | Phase 7 in progress |
| [`archive-readme-banner.md`](./archive-readme-banner.md) | Exact README to place on `after-certainty-site` |
| [`manual-checklist.md`](./manual-checklist.md) | Maintainer steps (banner PR/merge → Archive button) |

## What must be done manually

Code agents in this environment cannot archive a GitHub repository or open PRs on `after-certainty-site` via the usual PR tools. A maintainer should:

1. Apply / merge the archive README banner on `after-certainty-site` (see [`archive-readme-banner.md`](./archive-readme-banner.md)).
2. Confirm Vercel production Git source is already `ksteffe/after-certainty` (Phase 5).
3. GitHub → `after-certainty-site` → **Settings** → **Danger Zone** → **Archive this repository**.
4. Spot-check bookmarks/badges that still link to the old repo clone URL.

## Rollback

GitHub → **Unarchive this repository**. Restore previous README if needed. Vercel can reconnect to the old Git source only as an emergency (prefer monorepo rollback from Phase 5 notes).

## What did **not** change

- Production site URLs / domain
- Public `semantic-manifest.json` releases on `after-certainty`
- npm workspace package **name** `after-certainty-site` (local package id under `apps/site/`)
- Deleting committed `apps/site/data/semantic-manifest.json` (still deferred)

## Next

**Phase 8 (optional):** Turbo remote cache, watch mode, finer affected detection, dependency-group polish.
