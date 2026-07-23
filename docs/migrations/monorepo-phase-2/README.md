# Monorepo Phase 2 — Consolidate CI (no data-flow change)

**Status:** This PR  
**Plan:** [`docs/roadmaps/monorepo-migration-plan.md`](../../roadmaps/monorepo-migration-plan.md) §24 Phase 2  
**Predecessor:** [`../monorepo-phase-1/`](../monorepo-phase-1/)

## Goal

Run site checks from the surviving repository’s root GitHub Actions, with path filters so corpus-only and site-only PRs do not pay for unrelated jobs. **Production behavior unchanged:** remote semantic manifest, existing Vercel project on `after-certainty-site`.

## What changed

| Change | Notes |
|--------|--------|
| [`.github/workflows/site-ci.yml`](../../../.github/workflows/site-ci.yml) | Port of former site `ci.yml`; uses root `npm ci` + `npm run site:*`; `SEMANTIC_MANIFEST_OFFLINE=1` for build/e2e |
| [`.github/dependabot.yml`](../../../.github/dependabot.yml) | npm `/` + github-actions (from former site config) |
| `python-tests.yml` / `book-export-release.yml` | `paths-ignore` for site/workspace-only files |
| `package.json` | `site:test:e2e`, `site:validate:release-identity` scripts |
| `apps/site/.github/` | Nested CI/Dependabot removed; [`README.md`](../../../apps/site/.github/README.md) points at root |

## Path filter summary

| Workflow | Runs when |
|----------|-----------|
| Site CI | `apps/site/**`, root npm/turbo config, or `site-ci.yml` changes |
| Python lint & tests | Anything **except** pure site/workspace npm files (ignored) |
| Book export | Same ignore list as Python tests; `workflow_dispatch` always available |

## What did **not** change

- Runtime remote manifest fetch / ISR / cache revalidate
- Vercel production Git source (`after-certainty-site`)
- Corpus Make targets and publishing secrets model
- Local-manifest generation (Phase 3)

## Verify

On a PR that touches `apps/site/**` or this workflow:

- [ ] **Site CI** job runs (lint, test, validate fallback/public corpus, build, e2e)
- [ ] Corpus-only PR does **not** run Site CI
- [ ] Site-only PR does **not** run book-export / python-tests (paths-ignore)

Locally:

```bash
npm ci
npm run site:lint
SEMANTIC_MANIFEST_OFFLINE=1 npm run site:test
SEMANTIC_MANIFEST_OFFLINE=1 npm run site:validate:fallback
SEMANTIC_MANIFEST_OFFLINE=1 npm run site:build
```

## Rollback

Revert this PR’s workflow/Dependabot commits. Nested site CI was never executed by GitHub from `apps/site/.github`; production deploy path is untouched.

## Next

**Phase 3:** Lightweight semantic dependency group + local manifest generation task + parity reporting (production still remote).
