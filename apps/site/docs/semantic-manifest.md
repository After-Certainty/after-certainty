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

## Remote versus fallback

| Mode    | Behavior                                                                                              |
| ------- | ----------------------------------------------------------------------------------------------------- |
| Online  | Fetch `SEMANTIC_MANIFEST_URL` (default: GitHub `latest` release asset) with ISR                       |
| Offline | `SEMANTIC_MANIFEST_OFFLINE=1` uses only `data/semantic-manifest.json`                                 |
| Failure | Invalid JSON, HTTP errors, Zod failure, incompatible schema, or empty remote books → bundled fallback |

Selection is **remote-first**. A valid remote with books wins. The site no longer
prefers a “richer” bundled copy over a valid remote.

`getSemanticGraphLoadResult()` returns `{ graph, source, diagnostics }` where
`source` is:

- `{ kind: "remote", schemaVersion?, sourceCommit?, generatedAt? }`
- `{ kind: "fallback", …, stale, ageDays?, reason }`

`getSemanticGraph()` remains graph-only for compatibility.

## Provenance and supported schema versions

Manifest metadata fields: `schemaVersion`, `generatedAt`, `sourceCommit`,
`repository`, `ref`, `releaseTag`, `manifestVersion`.

Supported schema major: **2** (including `2.1`, `2.2`). Major ≥ 3 is refused.
Missing `schemaVersion` is accepted for legacy manifests.

### Schema 2.2 book structure

`parts[]` and `chapters[]` are retained on the typed graph (Zod no longer strips
them). Selectors live in [`lib/graph/chapters.ts`](../lib/graph/chapters.ts).
The public registry indexes chapters as **unlisted** metadata (`searchEligible`
and `sitemapEligible` stay false) until on-site chapter routes ship. Structural
integrity runs through `validate:public-corpus`.

This slice does **not** add chapter reading pages, sitemap entries, or search
documents for chapter bodies.

## Staleness policy

Fallback age is measured from `generatedAt`.

- Threshold: **30 days** (override with `SEMANTIC_MANIFEST_FALLBACK_STALE_DAYS`)
- Missing / unparseable `generatedAt` → treated as stale
- Normal CI / `npm run validate:fallback`: stale is a **warning**
- Release-style: `npm run validate:fallback -- --strict` (or `VALIDATE_FALLBACK_STRICT=1`) → stale is an **error**
- Invalid or incompatible fallback → always **error**

Visitors are not shown commit hashes or operational banners. Diagnostics log once
at the loader boundary when fallback is used.

## Synchronize the bundled fallback

```bash
npm run sync:semantic-manifest
```

Fetches the trusted public release asset (or `SEMANTIC_MANIFEST_URL`), validates
via the site Zod suite, and atomically replaces `data/semantic-manifest.json`.
Does not run during ordinary local development.

## Validate fallback freshness

```bash
npm run validate:fallback
npm run validate:fallback -- --strict
```

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
