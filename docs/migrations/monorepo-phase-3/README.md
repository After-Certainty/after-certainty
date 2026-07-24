# Monorepo Phase 3 — Local manifest generation + Stage B parity

**Status:** Complete (merged). Phase 4: [`../monorepo-phase-4/`](../monorepo-phase-4/).  
**Plan:** [`docs/roadmaps/monorepo-migration-plan.md`](../../roadmaps/monorepo-migration-plan.md) §24 Phase 3  
**Predecessor:** [`../monorepo-phase-2/`](../monorepo-phase-2/)

## Goal

Wire same-checkout `semantic-manifest.json` generation into the monorepo task graph, declare a lightweight **semantic** uv dependency group (no pandoc/DOCX), and publish a **local vs public-release** parity report. **Production still consumes the remote release artifact.**

## What changed

| Change | Notes |
|--------|--------|
| [`pyproject.toml`](../../../pyproject.toml) | `[dependency-groups]` — `semantic`, `test`, `publishing`, `dev`; default `dependencies` unchanged for `uv sync --frozen` |
| [`tools/compare_manifest_parity.py`](../../../tools/compare_manifest_parity.py) | Stage B comparator + `reports/manifest-parity.{json,md}` |
| `make compare-manifest-parity` | Makefile target |
| [`packages/corpus-tasks/`](../../../packages/corpus-tasks/) | Thin workspace package so Turbo can run/cache Make wrappers |
| Root `package.json` / `turbo.json` | `corpus:build-manifest`, `corpus:parity` → `@after-certainty/corpus-tasks` |
| [`.github/workflows/manifest-parity.yml`](../../../.github/workflows/manifest-parity.yml) | Generate local manifest, compare to `latest` release, upload artifacts |
| Tests | `tests/test_compare_manifest_parity.py` |

## Lightweight semantic install

Manifest generation needs only PyYAML + jsonschema (plus stdlib/`git`):

```bash
uv sync --frozen --only-group semantic
GITHUB_REPOSITORY=ksteffe/after-certainty make generate-semantic-manifest
```

Full CI/dev continues to use:

```bash
uv sync --frozen
```

## Task graph

```bash
npm run corpus:build-manifest   # → build/semantic-manifest.json
npm run corpus:parity           # requires local file; compares to GitHub latest
npx turbo run corpus:parity     # build-manifest then parity (cacheable outputs)
```

## Parity policy (Stage B)

| Check | Rule |
|-------|------|
| `schemaVersion` | Must match remote and equal `2.3` |
| Collection counts | Local ≥ remote for each public collection |
| Representatives | Fiction/poetry/smoke entities present locally |
| `sourceCommit` | **May differ** (local tip vs last release) — reported, not an error |

## What did **not** change

- Production Vercel / remote runtime fetch
- Site offline fallback sync skill
- Book export / publishing workflow deps
- Preview local-manifest consumption (now Phase 4)

## Verify

```bash
uv sync --frozen
make generate-semantic-manifest
make compare-manifest-parity
python3 -m pytest tests/test_compare_manifest_parity.py -q
uv sync --frozen --only-group semantic   # optional: prove lightweight path
GITHUB_REPOSITORY=ksteffe/after-certainty make generate-semantic-manifest
```

## Rollback

Revert this PR. Ignore new Make/npm/Turbo tasks; production path untouched.

## Next

**Phase 4:** Preview deployments consume the locally generated manifest; production remains remote.
