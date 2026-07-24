# Semantic manifest loading

The site consumes the After Certainty corpus through `semantic-manifest.json`.
Corpus meaning and authoritative metadata live in the monorepo root (`books/`,
`semantic/`, `schema/`). The site owns normalization, rendering, and diagnostics.

The site is **local-only at runtime**: it does not fetch the GitHub release
asset and has no semantic cache revalidate target. The public
`semantic-manifest.json` release artifact is still published for external
consumers, traceability, and parity checks; it is not a site runtime dependency.

## Three distinct artifacts

| Artifact                                       | Role                                                  |
| ---------------------------------------------- | ----------------------------------------------------- |
| `build/semantic-manifest.json`                 | Generated same-checkout production input (gitignored) |
| `apps/site/data/local-semantic-manifest.json`  | Installed site build input (gitignored)               |
| Public GitHub release `semantic-manifest.json` | External consumers / parity only                      |
| `apps/site/test/fixtures/semantic-manifest/`   | Non-authoritative unit-test fixtures                  |

There is **no** committed production fallback under `apps/site/data/`.

## Data flow

```text
books/ + semantic/ + schema/
  → make generate-semantic-manifest
  → build/semantic-manifest.json
  → npm run site:install-local-manifest
  → apps/site/data/local-semantic-manifest.json (gitignored)
  → Zod validation (lib/graph/schemas.ts)
  → feature selectors / public registry
  → public components and routes
```

The loader always requires `data/local-semantic-manifest.json`. If generation or
installation fails, the site build fails and the previous successful deployment
remains active. There is no silent fallback to a committed historical manifest
and no remote runtime fetch.

## Local setup

From the repository root:

```bash
npm ci
uv sync --frozen --only-group semantic   # or: npm run corpus:sync-semantic
npm run site:dev:watch                   # generate + install + watch + Next.js
# or step by step:
npm run corpus:build-manifest
npm run site:install-local-manifest
npm run site:dev:local
```

Production-shaped builds use the same flow through `scripts/vercel_build.sh`.

`getSemanticGraphLoadResult()` returns `{ graph, source, diagnostics }` where
`source.kind` is always `"fallback"` (historical provenance label for the
installed local checkout) and `source.cacheIdentity` starts with
`fallback|local:checkout|...` so provenance changes remain observable without a
remote URL.

## Supported schema versions

| Version                  | Policy                                                    |
| ------------------------ | --------------------------------------------------------- |
| **2.3+** (major 2)       | Fully supported — intended production contract            |
| **2.2**                  | Temporary compatibility mode (enrichment optional/absent) |
| Missing `schemaVersion`  | Legacy accepted                                           |
| Major >= 3 / unparseable | Rejected                                                  |

Version comparison uses [`lib/graph/schema-version.ts`](../lib/graph/schema-version.ts) (not string compare).

## Cache and revalidation

- Semantic graph remote fetch/ISR/revalidate paths have been removed.
- `POST /api/cache/revalidate` accepts only the `"podcast"` target.
- All manifest-driven routes should call `getSemanticGraph` /
  `getSemanticGraphLoadResult` / `getExploreSemanticGraph` rather than parsing
  JSON independently.

## Build manifest lock

During production builds (`NEXT_PHASE=phase-production-build` or
`WRITE_MANIFEST_BUILD_LOCK=1`), the loader writes
[`data/build-manifest-lock.json`](../data/build-manifest-lock.json) with schema
version, source commit, generatedAt, manifest source, cache identity, and build
time.

## Staleness and validation

Installed-local age is measured from `generatedAt`.

- Threshold: **30 days** (`SEMANTIC_MANIFEST_FALLBACK_STALE_DAYS`)
- Invalid / incompatible installed manifest -> **error** (hard fail under `USE_LOCAL` / production)
- Local intended release identity comes from
  `data/local-intended-manifest-release.json`
- Strict validation: `npm run validate:fallback -- --strict` or
  `VALIDATE_FALLBACK_STRICT=1`

Visitors are not shown commit hashes or operational banners.

## Test fixtures

Unit tests use purpose-built JSON under
[`test/fixtures/semantic-manifest/`](../test/fixtures/semantic-manifest/).
Full-corpus contract tests load the CI-generated
`data/local-semantic-manifest.json`. See the fixtures README.

## Validate

```bash
npm run validate:fallback
npm run validate:fallback -- --strict
npm run validate:public-corpus
```

## Release checklist

1. Generate: `npm run corpus:build-manifest`
2. Install: `npm run site:install-local-manifest`
3. Validate: `npm run validate:fallback -- --strict`
4. Validate public corpus: `npm run validate:public-corpus`
5. Build with `SEMANTIC_MANIFEST_USE_LOCAL=1 SEMANTIC_MANIFEST_OFFLINE=1`
6. Spot-check: enriched nonfiction book, fiction, poetry, pattern grounding,
   search chapter hit -> book overview

## Public content-type normalization

Central adapter: [`lib/graph/content-type.ts`](../lib/graph/content-type.ts).

- Reads `books[].contentType` and optional `literaryForm`
- Public vocabulary: `fiction`, `nonfiction`, `handbook`, `poetry`, `essay_collection`
- Missing or unsupported values → internal `unknown` (label **Unknown**), never silently Nonfiction
- Unknown types are excluded from catalog type filters
- Content type and literary form stay distinct (e.g. fiction + novel, poetry + poetry_collection)

Labels and filter values must go through this adapter / `CONTENT_TYPE_LABELS`.

URL filter example: `/explore/books?type=poetry`

## Public corpus registry and invariants

- Registry: [`lib/corpus/public-registry.ts`](../lib/corpus/public-registry.ts)
- Integrity: [`lib/corpus/validate-public-corpus.ts`](../lib/corpus/validate-public-corpus.ts)

```bash
npm run validate:public-corpus
```

Checks catalog, questions, trails, shelves, search, sitemap, homepage featured
questions, and front-shelf doorways for cross-feature consistency.

### Intentional exceptions

Document deliberate exclusions as **warnings** in domain validators (search /
sitemap SEO choices, upcoming items). Do not silence broken public routes.

Overview↔book concept/pattern link mismatches are **errors** by default. Temporary
orientation exceptions live in
[`data/overview-concept-link-exceptions.json`](../data/overview-concept-link-exceptions.json)
— see [`docs/contributing-book-overviews.md`](contributing-book-overviews.md).

Non-canonical editions on curated shelves are **errors** by default (shelves are
canonical-only). Temporary exceptions live in
[`data/shelf-edition-exceptions.json`](../data/shelf-edition-exceptions.json)
— see [`docs/contributing-books-catalog.md`](contributing-books-catalog.md).

## Legacy manifest consumers

| Item                                            | Status                          |
| ----------------------------------------------- | ------------------------------- |
| `books-manifest.json` / `lib/books/manifest.ts` | Removed — not used at runtime   |
| `BooksCatalogManifest` in `types/content.ts`    | Stub type only — retain         |
| `getOngoingWorks()`                             | Returns `[]` — retain           |
| `lib/books/generated-manifest.ts`               | Slug helper re-exports — retain |

## Environment variables

See [`.env.example`](../.env.example):

- `SEMANTIC_MANIFEST_OFFLINE`
- `SEMANTIC_MANIFEST_USE_LOCAL`
- `SEMANTIC_MANIFEST_FALLBACK_STALE_DAYS`
- `VALIDATE_FALLBACK_STRICT`
- `WRITE_MANIFEST_BUILD_LOCK`
- `CACHE_REVALIDATE_SECRET`
