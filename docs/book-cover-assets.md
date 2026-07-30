# Book cover web assets

**Status:** Living contract (not a roadmap).  
**Remaining product work:** [`docs/roadmaps/remaining-product-roadmap.md`](roadmaps/remaining-product-roadmap.md).

Deterministic WebP derivatives for the public site. Original covers under `books/**`
remain the archival source of truth.

## Variants

| Variant | Max width | Quality | Soft target | Use |
|---|---|---|---|---|
| `detail` | 720px | 84 | &lt;250 KB | Current book hero on the detail page |
| `card` | 640px | 80 | &lt;140 KB | Catalog, shelves, related book cards |
| `thumbnail` | 240px | 76 | &lt;50 KB | Compact recommendations, What’s New, Start Front Shelf |

Resize: aspect-preserving `fit: "inside"` with `withoutEnlargement: true`. No cropping.

## Usage matrix

| Context | Variant |
|---|---|
| Current book hero | detail |
| Catalog and shelf cards | card |
| Related / explore book cards | card |
| Compact thumbnails / What’s New | thumbnail |
| Open Graph metadata | `openGraphImage` → site `/generated/open-graph/<slug>.png` (not web covers) |
| Publishing / downloads | original `title_page_cover` |

## Commands

```bash
make generate-book-cover-assets
make validate-book-cover-assets
# or
npm run corpus:build-web-covers
npm run validate:book-cover-assets
```

Full site pipeline (covers → semantic manifest → install):

```bash
make generate-semantic-manifest
make install-local-manifest-for-site
REQUIRE_INSTALLED=1 REQUIRE_SEMANTIC=1 make validate-book-cover-assets
```

## Outputs

- `build/site-assets/book-covers/<slug>/{detail,card,thumbnail}.webp`
- `build/site-assets/book-covers/manifest.json` (actual dims, bytes, SHA-256)
- Installed: `apps/site/public/generated/book-covers/<slug>/…` (gitignored)
- Installed Open Graph: `apps/site/public/generated/open-graph/<slug>.png` (gitignored; copied from archival `books/**/open-graph.png` during install; local manifest `openGraphImage` rewritten to `/generated/open-graph/<slug>.png`)

## Manifest fields (additive, schemaVersion 2.3)

Each public book with a cover may include:

```json
{
  "coverImages": {
    "detail": { "path": "book-covers/after-certainty/detail.webp", "url": "/generated/book-covers/after-certainty/detail.webp", "width": 720, "height": 1080, "format": "webp", "bytes": 12345, "sha256": "…" },
    "card": { "…": "…" },
    "thumbnail": { "…": "…" }
  },
  "coverImageGeneration": { "sourceSha256": "…", "generatorVersion": 1 }
}
```

Legacy `coverImage` / `coverImagePath` remain. External JSON-only consumers may ignore `coverImages`.

Portable release resolution: `path` is relative to the `book-covers/` tree inside `semantic-cover-assets.tar.gz` published beside `semantic-manifest.json`.

## Site resolver

`resolveBookCover(book, usage)` in `apps/site/lib/books/resolve-book-cover.ts` is the only fallback policy. Components must not invent their own order.

## Changing a cover

1. Replace `books/<book>/book-cover.png` (or update `title_page_cover`).
2. Run `make generate-book-cover-assets` (or `make generate-semantic-manifest`).
3. Install for local site: `make install-local-manifest-for-site`.

Incremental builds skip unchanged sources (matched by source SHA-256 + generator version + variant config).

## Adding a variant later

1. Extend `packages/corpus-tasks/scripts/book-cover-variants.mjs`.
2. Bump `GENERATOR_VERSION`.
3. Extend JSON Schema + Zod + `resolveBookCover` usage union.
4. Regenerate and validate.

## Unusual aspect ratios

Derivatives preserve the source aspect ratio. Site frames use `object-contain` with a neutral elevated background so non-2:3 covers are not cropped.

## Diagnosing stale assets

```bash
make validate-book-cover-assets REQUIRE_INSTALLED=1 REQUIRE_SEMANTIC=1
```

Failures report missing files, hash/dimension mismatches, stale installed directories, and semantic/manifest drift.
