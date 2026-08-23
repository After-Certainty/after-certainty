# Task orchestration

This document maps how corpus and site tasks are invoked across Turbo, npm, Make, and Python.

## Responsibility split

| Layer | Owns |
|-------|------|
| **Turbo** | Cross-package DAG, remote/local cache keys |
| **npm scripts** | Human-facing workspace aliases (`corpus:*`, `site:*`) |
| **`@after-certainty/corpus-tasks`** | Turbo-visible npm tasks; Node/Sharp cover pipeline; manifest CLI wrappers |
| **Make** | Legacy developer compatibility (deprecated manifest shims); pandoc/export long-tail targets |
| **`after_certainty` Python package** | Manifest generation, validation, export domain logic |
| **`ac-manifest` CLI** | Thin entrypoint for semantic manifest generate |

## Common flows

### Local site build with Turbo cache

```
npm run site:build:local
  → turbo run build --filter=after-certainty-site
    → @after-certainty/corpus-tasks#build-web-covers (Node/Sharp)
    → @after-certainty/corpus-tasks#build-manifest (uv run ac-manifest, SKIP_WEB_COVERS=1)
    → @after-certainty/corpus-tasks#install-for-site
        → scripts/install_local_manifest_for_site.py
    → after-certainty-site#build → next build
```

### Direct manifest generation (no Turbo)

```
npm run corpus:build-manifest
  → packages/corpus-tasks/scripts/build-manifest.mjs
    → validate-book-specs, verify-semantic-yaml
    → generate-book-cover-assets (unless SKIP_WEB_COVERS=1)
    → uv run ac-manifest …
```

### Vercel production build

```
scripts/vercel_build.sh
  → npm run corpus:build-web-covers
  → SKIP_WEB_COVERS=1 npm run corpus:build-manifest
  → node packages/corpus-tasks/scripts/install-for-site.mjs [--require-deploy-sha …]
  → npm run corpus:validate-web-covers
  → npm run site:build
```

Vercel uses the same manifest+install sequence as Turbo (without Turbo cache). CI site jobs use Make shims (deprecated) or npm aliases for lint/test separately.

### Python quality gate

```
make check  →  ruff + pytest
npm run corpus:check  →  make check (alias)
```

## Turbo cache inputs (manifest)

`build-manifest` tracks `$TURBO_ROOT$/src/after_certainty/**` instead of individual `tools/*.py` files. Corpus trees (`books/**`, `semantic/**`, `schema/**`, `upcoming/**`) remain explicit inputs.

## Environment flags

| Flag | Effect |
|------|--------|
| `SEMANTIC_MANIFEST_USE_LOCAL=1` | Site loads installed `data/local-semantic-manifest.json` |
| `SEMANTIC_MANIFEST_OFFLINE=1` | Observability-only; does not change manifest source |
| `SKIP_WEB_COVERS=1` | Manifest build skips `generate-book-cover-assets` (Turbo already built covers) |

## Deprecated Make targets

These print a stderr deprecation notice and delegate to `@after-certainty/corpus-tasks`:

- `make generate-semantic-manifest` → `npm run corpus:build-manifest`
- `make validate-semantic-manifest` → `npm run corpus:validate-manifest`
- `make install-local-manifest-for-site` → `npm run site:install-local-manifest`
- `make compare-manifest-parity` → `npm run corpus:parity`
