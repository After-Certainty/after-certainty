# Monorepo Phase 4 — Preview uses local manifest (Stage C)

**Status:** Complete (merged). Phase 5: [`../monorepo-phase-5/`](../monorepo-phase-5/).  
**Plan:** [`docs/roadmaps/monorepo-migration-plan.md`](../../roadmaps/monorepo-migration-plan.md) §24 Phase 4  
**Predecessor:** [`../monorepo-phase-3/`](../monorepo-phase-3/)

## Goal

Preview and Site CI consume a **same-checkout** `semantic-manifest.json` (generate → install into gitignored `apps/site/data/local-*.json` → offline build). **Production on `after-certainty-site` still uses the remote release artifact.**

## What changed

| Change | Notes |
|--------|--------|
| [`scripts/install_local_manifest_for_site.py`](../../../scripts/install_local_manifest_for_site.py) | Copies `build/semantic-manifest.json` → `apps/site/data/local-semantic-manifest.json` + intended pin |
| `make install-local-manifest-for-site` / `npm run site:install-local-manifest` | Wrappers |
| [`apps/site/lib/graph/offline-manifest.ts`](../../../apps/site/lib/graph/offline-manifest.ts) | `SEMANTIC_MANIFEST_USE_LOCAL=1` loads local files; else committed fallback |
| Site CI | Generate + install local manifest; `SEMANTIC_MANIFEST_USE_LOCAL=1` + `OFFLINE=1`; path filters include corpus paths that affect the manifest |
| `npm run site:build:preview` | One-shot generate → install → offline/local build |
| Tests | `tests/test_install_local_manifest_for_site.py`, `apps/site/lib/graph/offline-manifest.test.ts` |

## Env contract

| Variable | Preview / Site CI | Production (still) |
|----------|-------------------|--------------------|
| `SEMANTIC_MANIFEST_OFFLINE` | `1` | unset (remote fetch) |
| `SEMANTIC_MANIFEST_USE_LOCAL` | `1` | unset |
| Committed `data/semantic-manifest.json` | Not overwritten | Bundled fallback / sync skill |

Local preview artifacts (gitignored):

- `apps/site/data/local-semantic-manifest.json`
- `apps/site/data/local-intended-manifest-release.json`

## Local commands

```bash
uv sync --frozen
npm ci
npm run corpus:build-manifest
npm run site:install-local-manifest
SEMANTIC_MANIFEST_USE_LOCAL=1 SEMANTIC_MANIFEST_OFFLINE=1 npm run site:dev
# or:
npm run site:build:preview
```

## Vercel preview (monorepo project — when wired)

Root Directory: repository root (or leave empty). Do **not** point production at this yet (Phase 5).

Suggested commands for a **preview** environment only:

| Setting | Value |
|---------|--------|
| Install | `npm ci && bash scripts/ci_uv_sync.sh` (or `uv sync --frozen --only-group semantic` if Python is preinstalled) |
| Build | `npm run corpus:build-manifest && npm run site:install-local-manifest && SEMANTIC_MANIFEST_USE_LOCAL=1 SEMANTIC_MANIFEST_OFFLINE=1 npm run site:build` |
| Env | `SEMANTIC_MANIFEST_USE_LOCAL=1`, `SEMANTIC_MANIFEST_OFFLINE=1` (preview only) |

Until a monorepo Vercel project exists, Site CI is the automated Stage C proof.

## What did **not** change

- Production Vercel project / remote runtime fetch
- Public `semantic-manifest.json` release process
- Committed fallback sync skill (`npm run sync:semantic-manifest`)
- Book export / publishing pipeline
- Archiving `after-certainty-site`

## Verify

```bash
make lint
python3 -m pytest tests/test_install_local_manifest_for_site.py -q
npm run corpus:build-manifest
npm run site:install-local-manifest
test ! -f apps/site/data/semantic-manifest.json.bak   # install must not touch committed fallback
SEMANTIC_MANIFEST_USE_LOCAL=1 SEMANTIC_MANIFEST_OFFLINE=1 npm run site:test
SEMANTIC_MANIFEST_USE_LOCAL=1 SEMANTIC_MANIFEST_OFFLINE=1 npm run site:validate:fallback
# optional smoke:
# npm run site:build:preview
```

## Rollback

1. Revert this PR (or unset `SEMANTIC_MANIFEST_USE_LOCAL` in Site CI / preview).
2. Site CI falls back to committed offline fallback behavior (Phase 2).
3. Production path was never changed.

## Next

**Phase 5:** Production build consumes the local manifest; disable runtime remote fetch (first production behavior change).
