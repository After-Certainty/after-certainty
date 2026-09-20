# Task orchestration

This document maps how corpus and site tasks are invoked across **mise**, Turbo, npm, Make, and Python.

## Responsibility split

| Layer | Owns | Preferred? |
|-------|------|------------|
| **mise** | Developer-facing facade + pinned Python/Node/uv (`mise.toml`); thin wrappers only | **Everyday DX** (`mise run check`, `site:*`, `manifest:*`, `audio:*`, `semantic:*`, …) |
| **Turbo** | Cross-package DAG, remote/local cache keys | Site / corpus-tasks graph |
| **npm scripts** | Workspace aliases (`corpus:*`, `site:*`); canonical for JS and manifest pipeline | **Site + manifest** |
| **`@after-certainty/corpus-tasks`** | Turbo-visible npm tasks; Node/Sharp cover pipeline; manifest CLI wrappers | Implementation for covers/manifest |
| **Make** | Publishing / pandoc / Typst / IngramSpark SOP; remaining compatibility wrappers | **Publishing** |
| **`after_certainty` Python package** | Manifest generation, validation, export domain logic | Implementation |
| **`ac-manifest` CLI** | Thin entrypoint for semantic manifest generate | Implementation |

### Canonical path rule (no wrapper loops)

```text
mise  →  npm | python | shell     ✅
make  →  python | shell | npm     ✅
npm corpus:check → ruff + pytest  ✅  (direct; does not call Make or mise)
```

Forbidden: `mise → make → mise`, `mise → npm → make → mise`.

Python mise tasks invoke **`uv run python …`** so package deps stay in the uv-managed `.venv` while mise still pins the interpreter version via `[tools]`.

## Toolchain

Pins live in [`mise.toml`](../mise.toml) / [`mise.lock`](../mise.lock): Python **3.12.14**,
Node **22.22.2**, uv **0.11.29**. Requires mise **≥ 2025.10.0** (hard minimum in
`mise.toml`; soft recommend ≥ 2026.9.0).

```text
Local / agents     mise.toml + mise.lock → Python, Node, uv (optional DX)
GitHub Actions     mise-action → Python + uv; setup-node → Node + npm cache
Vercel             scripts/vercel_install.sh → checksum uv + semantic group + npm ci
uv                 Python dependency ownership (uv.lock)
npm / Turbo        site + manifest orchestration
Make               publishing / IngramSpark
```

```bash
# https://mise.jdx.dev — then from repo root:
mise trust            # once per clone if prompted
mise install          # Python 3.12.14 + Node 22.22.2 + uv 0.11.29
# Agents / reproducible setups:
mise install --locked # fail if mise.lock lacks this platform's URLs
```

**GitHub Actions** provisions Python and uv from `mise.toml` / `mise.lock` via
SHA-pinned `jdx/mise-action` (`install_args: "python uv"`; lockfile implies
`--locked`). Jobs run **direct** commands (`ruff`, `pytest`, `make`, `npm`, …) —
not `mise run`. Publishing jobs that need Pillow use
`uv sync --frozen --group publishing`. Site CI and book-export prepare jobs use
`actions/setup-node` for npm cache / sharp (`engines.node` is `>=22.22.2`; local
mise pins the exact patch).

**Cursor Cloud** (`.cursor/install.sh`) assumes `uv` is already on PATH and runs
`uv sync --frozen` + `npm ci`.

**Vercel** keeps an environment-specific bootstrap in
[`scripts/vercel_install.sh`](../scripts/vercel_install.sh) (checksum-verified uv,
then `uv sync --frozen --only-group semantic` + `npm ci`).

Discover tasks: `mise tasks` · help for one task: `mise run <task> --help`.

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

Equivalent mise entrypoints: `mise run site:build:local`, `mise run site:dev:watch`, `mise run manifest:build`, `mise run manifest:install`.

### Direct manifest generation (no Turbo)

```
npm run corpus:build-manifest
  → packages/corpus-tasks/scripts/build-manifest.mjs
    → validate-book-specs, verify-semantic-yaml
    → generate-book-cover-assets (unless SKIP_WEB_COVERS=1)
    → uv run ac-manifest …
```

Or: `mise run manifest:build`.

### Vercel production build

```
scripts/vercel_build.sh
  → npm run corpus:build-web-covers
  → SKIP_WEB_COVERS=1 npm run corpus:build-manifest
  → node packages/corpus-tasks/scripts/install-for-site.mjs [--require-deploy-sha …]
  → npm run corpus:validate-web-covers
  → npm run site:build
```

Vercel uses the same manifest+install sequence as Turbo (without Turbo cache).

### Python quality gate

```
mise run check                 →  ruff + pytest          (preferred DX)
make check                     →  ruff + pytest          (compatibility)
npm run corpus:check           →  ruff + pytest          (direct; same argv)
```

## Turbo cache inputs (manifest)

`build-manifest` tracks `$TURBO_ROOT$/src/after_certainty/**` instead of individual `tools/*.py` files. Corpus trees (`books/**`, `semantic/**`, `schema/**`, `upcoming/**`) remain explicit inputs.

Do **not** add mise `sources`/`outputs` caching for manifest or covers — Turbo owns that invalidation model.

## Environment flags

| Flag | Effect |
|------|--------|
| `SEMANTIC_MANIFEST_USE_LOCAL=1` | Site loads installed `data/local-semantic-manifest.json` |
| `SEMANTIC_MANIFEST_OFFLINE=1` | Observability-only; does not change manifest source |
| `SKIP_WEB_COVERS=1` | Manifest build skips `generate-book-cover-assets` (Turbo already built covers) |
| `ALLOW_MISSING_WEB_COVERS=1` | Python-only CI: allow missing Sharp when generating covers |

## Removed Make targets

These Make targets **hard-fail** and redirect to npm / mise:

| Removed | Use instead |
|---------|-------------|
| `make generate-semantic-manifest` | `npm run corpus:build-manifest` · `mise run manifest:build` |
| `make validate-semantic-manifest` | `npm run corpus:validate-manifest` · `mise run manifest:validate` |
| `make install-local-manifest-for-site` | `npm run site:install-local-manifest` · `mise run manifest:install` |
| `make compare-manifest-parity` | `npm run corpus:parity` · `mise run manifest:parity` |

`make verify-semantic-manifest` / `make verify-semantic-ontology` remain as composites and call npm for the manifest steps.

## Publishing

DOCX / EPUB / PDF / Typst / IngramSpark remain **Make-canonical** (see [`publishing/book-export-pipeline.md`](publishing/book-export-pipeline.md)). Optional thin aliases: `mise run publish:docx -- <dir>`, `mise run ingramspark:preflight -- <dir>`, etc. — same underlying scripts.
