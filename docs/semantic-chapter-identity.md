# Chapter identity in the semantic manifest

Additive collections `parts[]` and `chapters[]` (schemaVersion **2.2+**) export manuscript structure without embedding full chapter text.

## Generation

```bash
make generate-semantic-manifest
```

Structure is parsed from each published book’s `index.md` (same link resolution as export assembly). Generator: [`tools/manuscript_structure.py`](../tools/manuscript_structure.py).

## Stable IDs

| Entity | Pattern |
|--------|---------|
| Part | `part-{editionSlug}-{partSlug}` |
| Chapter | `chapter-{editionSlug}-{relativePathWithoutExtAsDashes}` |

Examples:

- `part-boundary-conditions-act-3-realization`
- `chapter-why-collaboration-is-so-hard-parts-chapter-2-we-did-not-agree-to-the-same-thing`

**Rules**

1. Prefer an authored override `id` in `books/<slug>/chapter-enrichment.yml` when present.
2. Otherwise derive from the **source path**, not the display title — renaming a chapter title does not change the ID.
3. Duplicate stems (e.g. multiple `bridge.md` files) stay unique because the full relative path is encoded.
4. Position is ordinal within the edition only; do not use position alone as an external reference.

## Public chapter URL contract (READ-001)

**Status:** Frozen for Native Reader V1 and later. Site helpers live in [`apps/site/lib/graph/chapters.ts`](../apps/site/lib/graph/chapters.ts). Live App Router pages are **not** required by this contract (see roadmap READ-002).

### Canonical path

```text
/explore/books/{editionSlug}/chapters/{chapterSlug}
```

| Segment | Source | Notes |
|---------|--------|-------|
| `editionSlug` | Book catalog `slug` (manuscript folder / `book.yml` slug) | Same segment used by `/explore/books/{slug}`. **Not** the graph `editionId` (usually `book-{slug}`). |
| `chapterSlug` | Relative manuscript path without extension, `/` → `-` | Same stem encoded in default `chapter.id` after `chapter-{editionSlug}-`. |

Examples:

| `sourcePath` | `chapterSlug` | `routeKey` |
|--------------|---------------|------------|
| `front-matter/introduction.md` | `front-matter-introduction` | `/explore/books/after-certainty/chapters/front-matter-introduction` |
| `parts/part-1-letting-go/chapter-1-the-end-of-correctness.md` | `parts-part-1-letting-go-chapter-1-the-end-of-correctness` | `/explore/books/after-certainty/chapters/parts-part-1-letting-go-chapter-1-the-end-of-correctness` |

### Identity keys (do not conflate)

| Key | Role | Stable for |
|-----|------|------------|
| `workId` | Work identity across editions | Cross-edition relationships |
| `editionId` | Edition / book graph id (`book.id`) | Progress, bookmarks, TOC within an edition |
| `chapter.id` | Canonical chapter graph id | Enrichment, relationships, storage keys |
| `routeKey` | Reserved public pathname (equals the canonical path above) | Links, sitemap, search `canonicalUrl` once routes ship |
| `chapterSlug` | Last path segment of `routeKey` | App Router `[chapterSlug]` param |
| `sourcePath` | Manuscript file relative to the book root | Rendering pipeline (READ-003); not a URL |

**Rules**

1. `routeKey` **is** the public pathname. Do not invent a second URL shape for the reader.
2. Do **not** use `chapter.id` as a URL segment (ids are long and include the edition slug prefix).
3. Do **not** use ordinal `position` alone in URLs or storage keys.
4. Section deep links (once headings exist) append `#` fragment ids: `{routeKey}#{headingId}` — fragment format is owned by the HTML pipeline (READ-003), not this contract.
5. Multi-edition works (e.g. When Others Look to You v1/v2) use **distinct** `editionSlug` values and therefore distinct `routeKey`s.

### Mapping `ManifestChapter` → public path

```text
publicPath(chapter) = chapter.routeKey
chapterSlug(chapter) = last segment of chapter.routeKey
```

Generator invariant (must hold for every exported chapter):

```text
routeKey === "/explore/books/" + editionSlug + "/chapters/" + chapterSlugFromSourcePath(sourcePath)
```

unless an authored override later changes only `chapter.id` / enrichment fields — **`routeKey` stays path-derived**, not title-derived.

Site reconstruction helpers:

- `buildChapterRouteKey(editionSlug, chapterSlug)`
- `parseChapterRouteKey(routeKey)` → `{ editionSlug, chapterSlug } | null`
- `chapterSlugFromRouteKey(routeKey)`
- `assertChapterRouteKeyMatchesBook(routeKey, book.slug)` (validation)

### Eligibility and HTTP semantics (when routes ship)

| Condition | Expected behavior |
|-----------|-------------------|
| Unknown book slug or chapter slug | `404` / `notFound()` |
| Chapter exists but `public: false` | `404` (do not leak private units) |
| Chapter `routeKey` malformed or book-slug mismatch | Treat as data error in corpus validation; do not publish a link |
| Manuscript HTML | Rendered via sanitized remark/rehype pipeline (READ-003); missing file → alert state, not a blank page |
| Routes not yet shipping manuscript HTML | Shell page may render; body placeholder until READ-003 |
| Overview TOC links | Remain unset until READ-006 (`publicUrl` stays undefined) |
| Search / sitemap eligibility | Unlocked for public chapters on public books (READ-005 / READ-009) |

Downloads (EPUB/PDF/DOCX) remain valid reading paths alongside the native reader.

**V1 cohort (READ-010):** All published catalog editions with manuscript chapters are in scope — no download-only holdout list. See [`native-reader-v1-cohort.md`](native-reader-v1-cohort.md).

### Client storage keys (READ-011+)

Prefer opaque graph ids, not URL strings:

```text
readingProgress:{editionId}:{chapterId}
bookmark:{editionId}:{chapterId}[:{fragmentId}]
```

URLs may change presentation hosts; `editionId` + `chapter.id` must not.

**READ-011 (shipped):** Site stores one last-position entry per edition under localStorage key `ac_reading_progress`, keyed by `editionId`. Each entry includes `identityKey` = `readingProgress:{editionId}:{chapterId}`, plus optional `fragmentId` / `scrollY`. No server sync — clearing site data resets. See [`apps/site/lib/reading/readingProgress.ts`](../apps/site/lib/reading/readingProgress.ts).

**READ-012 (shipped):** Continue-reading CTAs on `/start` and book overview/detail resolve stored progress against a server-built catalog of public chapter routes (`apps/site/lib/reading/continueReading.ts`). Invalid or stale chapter ids produce no CTA.

**READ-013 (shipped):** Local bookmarks under `ac_reading_bookmarks`, identity `bookmark:{editionId}:{chapterId}[:{fragmentId}]`. Reader chrome toggles chapter or current `#` section; book overview/detail lists resolved bookmarks. See [`apps/site/lib/reading/readingBookmarks.ts`](../apps/site/lib/reading/readingBookmarks.ts).

### Out of scope for this contract

- Account-synced progress
- Alternate pretty URLs based on chapter titles
- Chapter search documents and sitemap eligibility shipped (READ-005 / READ-009)
- Overview / entity deep links shipped (READ-006)
- Manuscript HTML rendering (READ-003)

## Chapter kinds

`introduction` | `chapter` | `bridge` | `interlude` | `conclusion` | `appendix` | `afterword` | `notes` | `poem` | `section` | `sequence` | `other`

Poetry collections (`book.kind: poetry`) map titled part units to `poem` unless overridden.

## Authored enrichment (optional)

Create `books/<slug>/chapter-enrichment.yml`:

```yaml
version: 1
chapters:
  - sourcePath: parts/part-1/chapter-1.md
    summary: >
      Conceptual movement of the chapter (not a title paraphrase).
    centralQuestion: Narrower than the book question.
    selectedConcepts: [judgment]
    selectedPatterns: [revisability-preserves-judgment]
    situations: [feedback-stops-changing-decisions]
    searchAliases: [judgment without finality]
    transition:
      fromPrevious: Why this follows the previous unit.
      toNext: What remains open into the next unit.
```

Summaries must be manuscript-grounded. Fiction summaries should avoid spoiling more than needed for navigation and must not treat fictional events as empirical proof.

Schema: [`schema/semantic/chapter-enrichment.schema.json`](../schema/semantic/chapter-enrichment.schema.json).

## Report coverage

Completeness reports should be generated with `--manifest build/semantic-manifest.json` (Makefile default). Per-book `chapterSummaryCoverage` reports `present/total`.
