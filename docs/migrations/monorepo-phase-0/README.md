# Monorepo Phase 0 — Preparation

**Status:** Complete (merged). Phase 1: [`../monorepo-phase-1/`](../monorepo-phase-1/).  
**Plan:** [`docs/roadmaps/monorepo-migration-plan.md`](../../roadmaps/monorepo-migration-plan.md) §24 Phase 0  
**Goal:** Freeze baseline production behavior, inventory settings, write rollback notes, and expand contract tests — **without** changing production, Vercel, or repository layout.

## Deliverables in this directory

| Path | Purpose |
|------|---------|
| [`checklist.md`](checklist.md) | Phase 0 acceptance checklist (code + manual) |
| [`inventory.md`](inventory.md) | Workflows, secrets (from code), GitHub facts; Vercel gaps |
| [`rollback.md`](rollback.md) | Rollback procedures for Phase 0–2 |
| [`baselines/`](baselines/) | Frozen manifest identity + smoke URL snapshots |

## Decisions locked (from the plan)

These are treated as settled for subsequent phases:

1. Surviving repository: `ksteffe/after-certainty`
2. Site destination: `apps/site/`
3. Corpus stays at repository root
4. History: `git filter-repo --to-subdirectory-filter apps/site`, then merge
5. Package manager: npm workspaces + thin Turborepo
6. Production remains on `after-certainty-site` until Phase 5

## Automated contract coverage

Corpus CI already validates schema `2.3` and discovery collections. Phase 0 adds:

- `tests/test_monorepo_phase0_public_contract.py` — representative public entities required by the migration plan (fiction, poetry, companion edition, question, trail, shelf, chapters, What’s New event, smoke-route slugs)

Run:

```bash
python3 -m pytest tests/test_monorepo_phase0_public_contract.py -q
make compare-site-discovery   # existing migration parity report
```

## What humans must still do

See the **Manual** section of [`checklist.md`](checklist.md). Vercel MCP and GitHub secrets APIs are not readable from this agent environment (`403` / needsAuth). Dashboard exports must be pasted or attached by a maintainer before Phase 5.

## Exit criteria

Phase 0 is complete when [`checklist.md`](checklist.md) is checked off (automated items via this PR; manual items by a maintainer). Phase 1 (site import under `apps/site`) must not start until the checklist’s “required before Phase 1” items are done.

**Update 2026-07-23:** Maintainer confirmed there are no open site MRs/PRs blocking import. Remaining Phase 1 gate: optional inventory skim for private workflows/apps; then merge this Phase 0 PR.
