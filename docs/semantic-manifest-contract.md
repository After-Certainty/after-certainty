# Semantic manifest contract (v2.3)

**Status:** Living contract — rules implementations must preserve (not a roadmap).  
**Remaining product work:** [`docs/roadmaps/remaining-product-roadmap.md`](roadmaps/remaining-product-roadmap.md).

`semantic-manifest.json` is a **public, generated API**. YAML under `books/` and `semantic/` is canonical; the manifest is never hand-edited.

## Compatibility policy

1. **Additive only** — existing top-level collections, field names, types, entity IDs, relationship semantics, and slug fields keep their meanings.
2. **No flag-day site break** — consumers that ignore unknown fields continue to work.
3. **Do not repurpose fields** — new meanings get new optional fields or collections.
4. **Integer `manifestVersion`** — remains `1` or `2` (thinkers present → `2`). This is not bumped for additive discovery fields.
5. **String `schemaVersion`** — currently `"2.3"` adds selected concept/pattern roles, grounding provenance, richer chapter transitions, poetry kinds, and thinker identity classes. `"2.2"` documented parts/chapters, literaryForm, and overview `relatedWorks`. `"2.1"` introduced works/editions and discovery collections.
6. **Provenance** — `generatedAt`, `repository`, `ref`, `releaseTag`, and `sourceCommit` (git SHA when available).

## Existing collections (stable)

`books`, `glossary`, `patterns`, `situations`, `sources`, `relationships`, `ontology`, and optional `thinkers`.

## Additive collections (schemaVersion 2.1)

| Collection | Role |
|------------|------|
| `works` | Stable work identity; `currentEditionId` points at the canonical public edition |
| `editions` | Edition rows keyed by existing `book-*` ids |
| `questions` | First-class editorial questions with ordered path stops |
| `trails` | Curated reading trails with transitions |
| `shelves` | Editorial shelves (curated or typed rule); no display limits |
| `changeEvents` | Authored public content-change events |
| `searchAliases` | Alias vs related vocabulary bridges |

## Additive collections (schemaVersion 2.2)

| Collection | Role |
|------------|------|
| `parts` | Stable part identity for parseable manuscripts |
| `chapters` | Stable chapter identity, metrics, optional authored enrichment |

See [semantic-chapter-identity.md](semantic-chapter-identity.md).

## Additive fields (schemaVersion 2.3)

| Location | Fields |
|----------|--------|
| `books[].overview` | `selectedConceptRoles`, `selectedPatternRoles` (legacy `selectedConceptIds` / `selectedPatternIds` retained) |
| `patterns[]` / `glossary[]` | optional `grounding` |
| `relationships[]` | optional `provenance` |
| `thinkers[]` | `author_group` / `collective` types; `aliases`, `formerSlugs`, `canonicalSlug`; `citationOnly` thinkers omitted from public array |
| `chapters[]` | optional structured `transition`; kinds include `poem` / `section` / `sequence` |

## Additive book fields

Optional on each `books[]` entry: `workId`, `editionId`, `isCanonical`, `editionRelationship`, `editionLabel`, `contentType` (includes `poetry`), `literaryForm`, `publicStatus`, `availability`, `overview` (including `relatedWorks`), `searchAliases`.

Legacy `status`, `companionOf`, `companionBooks`, and `slugAliases` are unchanged.

## Open edition

“Open edition” is **not** a public status. Licensing / open-publishing copy and derived download availability are separate from `publicStatus` (`published`, `upcoming` / forthcoming / in_progress, `revised`, `superseded`, `archived`).

## Generation

```bash
make generate-book-cover-assets
make generate-semantic-manifest
make validate-semantic-manifest
make verify-semantic-manifest
make validate-discovery-content
make report-semantic-completeness
```

Release staging regenerates the manifest via `scripts/prepare_release_staging.sh` as before, and packs `semantic-cover-assets.tar.gz` (portable `book-covers/` tree matching `coverImages[].path`). See [`docs/book-cover-assets.md`](book-cover-assets.md).

## Additive book cover fields (schemaVersion 2.3)

Optional on each `books[]` entry when web derivatives exist:

| Field | Role |
|---|---|
| `coverImages` | `detail` / `card` / `thumbnail` records (`path`, `url`, `width`, `height`, `format`, `bytes`, `sha256`) |
| `coverImageGeneration` | `sourceSha256`, `generatorVersion` |

Legacy `coverImage` / `coverImagePath` remain required (nullable). External consumers may ignore the new fields.

Site install (`make install-local-manifest-for-site`) also copies archival `open-graph.png` to `apps/site/public/generated/open-graph/<slug>.png` and rewrites the **local** installed manifest `openGraphImage` to `/generated/open-graph/<slug>.png`. The published release `semantic-manifest.json` may still use absolute GitHub raw URLs for `openGraphImage`; that rewrite is site-build-only.

## Site consumption (monorepo Stage D)

The public site installs the same-checkout artifact into gitignored `apps/site/data/local-semantic-manifest.json` and builds with `SEMANTIC_MANIFEST_USE_LOCAL=1` (remote fetch removed). The GitHub `latest` release asset remains a public API for external consumers and parity checks; it is not required for the site’s own production build after Phase 6 Stage E. See [`docs/migrations/monorepo-phase-6/`](migrations/monorepo-phase-6/).
