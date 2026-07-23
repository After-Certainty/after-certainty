# Semantic manifest loading

The site consumes the After Certainty corpus through `semantic-manifest.json`.
Corpus meaning and authoritative metadata live in
[ksteffe/after-certainty](https://github.com/ksteffe/after-certainty). This site
owns normalization, rendering, caching, fallback resilience, and diagnostics.

## Data flow

```text
remote release (or bundled fallback)
  → Zod validation (lib/graph/schemas.ts)
  → remote-first selection + provenance (lib/graph/manifest.ts)
  → feature selectors / public registry (lib/corpus/public-registry.ts)
  → public components and routes
```

## Production source

Default remote URL (override with `SEMANTIC_MANIFEST_URL`):

`https://github.com/ksteffe/after-certainty/releases/download/latest/semantic-manifest.json`

Production expects a **released** schema-**2.3** asset (not an arbitrary branch head).
The sync command refuses releases below schema 2.3.

Pinned identity after sync: [`data/intended-manifest-release.json`](../data/intended-manifest-release.json).

## Remote versus fallback

| Mode    | Behavior                                                                                              |
| ------- | ----------------------------------------------------------------------------------------------------- |
| Online  | Fetch `SEMANTIC_MANIFEST_URL` (default: GitHub `latest` release asset) with ISR                       |
| Offline | `SEMANTIC_MANIFEST_OFFLINE=1` uses only `data/semantic-manifest.json`                                 |
| Failure | Invalid JSON, HTTP errors, Zod failure, incompatible schema, or empty remote books → bundled fallback |

Selection is **remote-first**. A valid remote with books wins.

`getSemanticGraphLoadResult()` returns `{ graph, source, diagnostics }` where
`source` includes:

- `kind`: `"remote"` | `"fallback"`
- `schemaVersion`, `sourceCommit`, `generatedAt`, `contentVersion?`
- `stale`, `cacheIdentity`
- fallback-only: `ageDays`, `reason`

`getSemanticGraph()` remains graph-only for compatibility.

## Supported schema versions

| Version                 | Policy                                                    |
| ----------------------- | --------------------------------------------------------- |
| **2.3+** (major 2)      | Fully supported — intended production contract            |
| **2.2**                 | Temporary compatibility mode (enrichment optional/absent) |
| Missing `schemaVersion` | Legacy accepted                                           |
| Major ≥ 3 / unparseable | Rejected                                                  |

Version comparison uses [`lib/graph/schema-version.ts`](../lib/graph/schema-version.ts) (not string compare).

### Schema 2.3 enrichment (site presentation)

| Manifest fields                                                                                | Site behavior                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parts[]` / `chapters[]` (+ summaries, central questions, kinds including `poem` / `sequence`) | Book overview **Inside this book** via [`lib/books/book-chapter-view-model.ts`](../lib/books/book-chapter-view-model.ts)                                                                           |
| `overview.selectedConceptRoles` / `selectedPatternRoles`                                       | Preferred over global definitions on book central ideas                                                                                                                                            |
| `patterns[].grounding` / `glossary[].grounding`                                                | Restrained grounding on pattern/concept detail pages                                                                                                                                               |
| `relationships[].provenance`                                                                   | Retained in typed model; not rendered on every edge                                                                                                                                                |
| Chapter search metadata                                                                        | Folded into **book** `searchText` (titles, summaries, central questions, aliases). Separate chapter search hits stay deferred until chapter routes ship (public registry `searchEligible: false`). |

No native chapter reader or chapter sitemap URLs in this slice.

## Cache and revalidation

- Shared Next.js fetch tag: `semantic-graph` (+ `semantic-schema:2.3`)
- ISR interval: `SEMANTIC_MANIFEST_REVALIDATE_SECONDS` (default 3600)
- On-demand: `POST /api/cache/revalidate` with target `"semantic"` (see existing secret conventions)
- `source.cacheIdentity` includes URL + schema + commit + content version + generatedAt so release changes are observable

All manifest-driven routes should call `getSemanticGraph` / `getSemanticGraphLoadResult` / `getExploreSemanticGraph` — not parse the JSON independently.

## Build manifest lock

During production builds (`NEXT_PHASE=phase-production-build` or `WRITE_MANIFEST_BUILD_LOCK=1`), the loader writes
[`data/build-manifest-lock.json`](../data/build-manifest-lock.json) with schema version, source commit,
generatedAt, manifest source, cache identity, and build time.

## Staleness and release policy

Fallback age is measured from `generatedAt`.

- Threshold: **30 days** (`SEMANTIC_MANIFEST_FALLBACK_STALE_DAYS`)
- Invalid / incompatible fallback → **error**
- Fallback ≠ intended release identity → **error**
- Strict release: `npm run validate:fallback -- --strict` or `VALIDATE_FALLBACK_STRICT=1`
- Release identity: `npm run validate:release-identity`
- Remote unavailable at runtime → valid fallback + structured diagnostics (logged once)

Visitors are not shown commit hashes or operational banners.

## Synchronize the bundled fallback

```bash
npm run sync:semantic-manifest
# alias:
npm run sync:semantic-manifest-fallback
```

Fetches the trusted public release asset, requires schema 2.3+, validates provenance,
runs the Zod suite, atomically replaces `data/semantic-manifest.json`, and writes
`data/intended-manifest-release.json`. Does **not** run during ordinary `npm run dev`.

## Validate

```bash
npm run validate:fallback
npm run validate:fallback -- --strict
npm run validate:release-identity
npm run validate:public-corpus
```

## Release checklist

1. Confirm upstream `latest` release publishes schema 2.3 `semantic-manifest.json`
2. `npm run sync:semantic-manifest`
3. `npm run validate:fallback -- --strict`
4. `npm run validate:release-identity`
5. `npm run validate:public-corpus`
6. `SEMANTIC_MANIFEST_OFFLINE=1 npm run build` and online build
7. Spot-check: enriched nonfiction book, fiction, poetry, pattern grounding, search chapter hit → book overview

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

- `SEMANTIC_MANIFEST_URL`
- `SEMANTIC_MANIFEST_OFFLINE`
- `SEMANTIC_MANIFEST_REVALIDATE_SECONDS`
- `SEMANTIC_MANIFEST_FALLBACK_STALE_DAYS`
- `VALIDATE_FALLBACK_STRICT`
- `WRITE_MANIFEST_BUILD_LOCK`
- `CACHE_REVALIDATE_SECRET`
