# Monorepo Phase 1 — Site import + workspace skeleton

**Status:** Complete (merged). Phase 2: [`../monorepo-phase-2/`](../monorepo-phase-2/).  
**Plan:** [`docs/roadmaps/monorepo-migration-plan.md`](../../roadmaps/monorepo-migration-plan.md) §24 Phase 1  
**Predecessor:** [`../monorepo-phase-0/`](../monorepo-phase-0/)

## Goal

Import `after-certainty-site` under `apps/site/` with preserved Git history, add npm workspaces + thin Turborepo, and keep **production behavior unchanged** (remote semantic manifest + existing site deployment).

## What changed

| Change | Notes |
|--------|--------|
| `apps/site/**` | Full site tree; history rewritten via `git filter-repo --to-subdirectory-filter apps/site` then merged |
| Root `package.json` | npm workspaces (`apps/*`), scripts for site/corpus, Turbo as devDependency |
| `package-lock.json` | Workspace lockfile at repo root (nested site lockfile removed) |
| `turbo.json` | Thin pipelines: `build`, `lint`, `test`, `dev`, validate scripts |
| `.npmrc` / `.gitignore` | Node/`node_modules`/`.turbo`/`.next` ignored at monorepo root |
| Site `prepare` script | No-op (Husky hooks remain under `apps/site/.husky` for later consolidation) |
| Site `overrides` | Moved to root `package.json` (npm workspaces requirement) |

## What did **not** change

- Corpus paths (`books/`, `semantic/`, `schema/`, `tools/`, `Makefile`, …)
- Production Vercel project (still on `after-certainty-site`)
- Runtime remote manifest fetch / ISR / cache revalidate
- Public GitHub release `latest` flow
- Root GitHub Actions (site CI under `apps/site/.github` is not executed by GitHub until Phase 2)

## Verify locally

```bash
uv sync --frozen
npm ci
make check
npm run site:lint
SEMANTIC_MANIFEST_OFFLINE=1 npm run site:test
SEMANTIC_MANIFEST_OFFLINE=1 npm run site:validate:fallback
npx turbo run lint --filter=after-certainty-site
```

## Rollback

See [`../monorepo-phase-0/rollback.md`](../monorepo-phase-0/rollback.md). Revert this merge on `after-certainty`; leave `after-certainty-site` and its Vercel project untouched.

## Next

**Phase 2:** Port site CI into root `.github/workflows` with path filters; production still remote-manifest.
