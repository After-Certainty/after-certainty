# Semantic manifest loading

The site consumes the After Certainty corpus through `semantic-manifest.json`.
Corpus meaning and authoritative metadata live in the monorepo root (`books/`,
`semantic/`, `schema/`). The site owns normalization, rendering, fallback
resilience, and diagnostics.

Stage E is **local-only at runtime**: the site no longer fetches the GitHub
release asset and no longer has a semantic cache revalidate target. The public
`semantic-manifest.json` release artifact is still published for external
consumers, traceability, and parity checks; it is not a site runtime dependency.

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

If `SEMANTIC_MANIFEST_USE_LOCAL=1`, the loader requires
`data/local-semantic-manifest.json`. Otherwise it uses committed
`data/semantic-manifest.json` as an offline/test fixture. That committed JSON is
retained temporarily because several static imports still depend on it; it is no
longer synchronized from the release asset and is not the source of truth.

## Local setup

From the repository root:

```bash
npm run corpus:build-manifest
npm run site:install-local-manifest
SEMANTIC_MANIFEST_USE_LOCAL=1 SEMANTIC_MANIFEST_OFFLINE=1 npm run site:dev
```

Production-shaped builds use the same flow through `scripts/vercel_build.sh`.

`getSemanticGraphLoadResult()` returns `{ graph, source, diagnostics }` where
`source.kind` is always `"fallback"` and `source.cacheIdentity` starts with
`fallback|local:checkout|...` so provenance changes remain observable without a
remote URL.

## Supported schema versions

| Version                 | Policy                                                    |
| ----------------------- | --------------------------------------------------------- |
| **2.3+** (major 2)      | Fully supported — intended production contract            |
| **2.2**                 | Temporary compatibility mode (enrichment optional/absent) |
| Missing `schemaVersion` | Legacy accepted                                           |
| Major >= 3 / unparseable | Rejected                                                 |

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

Fallback age is measured from `generatedAt`.

- Threshold: **30 days** (`SEMANTIC_MANIFEST_FALLBACK_STALE_DAYS`)
- Invalid / incompatible offline manifest -> **error**
- Local intended release identity comes from
  `data/local-intended-manifest-release.json` when `SEMANTIC_MANIFEST_USE_LOCAL=1`
- Strict validation: `npm run validate:fallback -- --strict` or
  `VALIDATE_FALLBACK_STRICT=1`

Visitors are not shown commit hashes or operational banners.

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
