# Monorepo Phase 6 — Remove semantic manifest sync machinery (Stage E)

**Status:** Complete (merged). Phase 7: [`../monorepo-phase-7/`](../monorepo-phase-7/).  
**Plan:** [`docs/roadmaps/monorepo-migration-plan.md`](../../roadmaps/monorepo-migration-plan.md) Phase 6  
**Predecessor:** [`../monorepo-phase-5/`](../monorepo-phase-5/)

## Goal

Finish the site runtime cutover to same-checkout semantic data by removing the
obsolete release-fetch and fallback-sync paths. The site should build and run
from the manifest installed out of this repository, while the public release
artifact remains available for external consumers.

## What changed

- Removed runtime GitHub release fetch from `apps/site/lib/graph/manifest.ts`.
- Removed the `"semantic"` cache revalidate target; podcast revalidation stays.
- Removed the site sync script, release-identity validation CLI, refresh-manifest
  skill, and deleted `data/intended-manifest-release.json`.
- Removed production remote knobs from site env docs (`SEMANTIC_MANIFEST_URL`,
  semantic revalidate seconds).
- Updated tests and docs around local-only manifest loading.

## What stays

- `SEMANTIC_MANIFEST_USE_LOCAL=1` and `SEMANTIC_MANIFEST_OFFLINE=1` local/CI
  paths.
- `scripts/install_local_manifest_for_site.py` and
  `npm run site:install-local-manifest`.
- Public `semantic-manifest.json` publishing in the book export release flow.
- Podcast cache revalidation.
- Committed `apps/site/data/semantic-manifest.json` as a non-synced offline/test
  fixture.

## Deferred

Do not delete `apps/site/data/semantic-manifest.json` in Phase 6. Too many static
imports still rely on that large JSON fixture. A later cleanup should move those
consumers to installed local data or test fixtures before removing it.

## Next

**Phase 7:** Archive `after-certainty-site` with a README pointer (see
[`../monorepo-phase-7/`](../monorepo-phase-7/)).
