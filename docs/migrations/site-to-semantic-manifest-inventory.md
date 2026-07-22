# Site → semantic-manifest migration inventory

**Date:** 2026-07-22  
**Source site snapshot:** [`fixtures/site-discovery/`](fixtures/site-discovery/) (from `ksteffe/after-certainty-site` at migration time)  
**Content repo:** `ksteffe/after-certainty`

Ownership boundary: after-certainty owns what the corpus is and means; after-certainty-site owns how it is rendered. Presentation settings are not migrated.

## Classification legend

| Class | Meaning |
|-------|---------|
| Corpus-authoritative | Author in after-certainty YAML; export via `semantic-manifest.json` |
| Presentation-authoritative | Remain in the site |
| Derived | Computed at manifest generation from other corpus fields |
| Ambiguous | Documented decision; not migrated in this pass |

## Inventory

| Data | Current site source | Proposed content source | Manifest destination | Migration status | Notes |
|------|---------------------|-------------------------|----------------------|------------------|-------|
| Work / edition identity | `data/publication-registry.json` | `book.yml` (`work_id`, `edition_relationship`, `is_canonical`, `edition_label`) + generator defaults | `works[]`, `editions[]`; additive on `books[]` | Ported | WoLTY explicit; sole editions derived |
| Companion / canonical flags | publication-registry + semantic `companionOf`/`companionBooks` | Prefer manuscript `companion_*`; registry flags on `book.yml` | `editions[]` + existing companion fields | Ported | Conflict: registry mirrors content companions |
| Public content type | `lib/books/catalog-taxonomy.ts` | `book.content_type` | `books[].contentType`, `works[].contentType` | Ported | Fiction/handbook overrides; default nonfiction |
| Book overview orientation | `data/book-overviews.json` | `book.overview` in `book.yml` | `books[].overview` | Ported (10) | No HTML; concept/pattern bare slugs |
| Reading order | overview `readBefore`/`readNext` | `book.overview.readBefore`/`readNext` | `books[].overview` | Ported | Book slugs; validated |
| Search aliases | `data/search-aliases.json` | `semantic/search-aliases.yml` | `searchAliases[]` | Ported | `alias` vs `related` preserved |
| Questions + path stops | `data/questions-manifest.json` | `semantic/questions/*.yml` | `questions[]` | Ported (12) | First-class editorial objects |
| Trails + transitions | `data/trails-manifest.json` | `semantic/trails/*.yml` | `trails[]` | Ported (6) | Ordered stops, not graph edges |
| Editorial shelves | `lib/books/shelves.ts`, `lib/start/front-shelf.ts` | `semantic/shelves/*.yml` | `shelves[]` | Ported (9) | `maxPreview` left on site |
| Book published events | `data/whats-new.json` (`book_published`) | `semantic/change-events/*.yml` | `changeEvents[]` | Ported (6) | Authored only; no git-derived events |
| Revision summaries | overview / registry / `book_revised` | `book.overview.changeSummary` / events | overview + `changeEvents` | None seeded | Ready when authored |
| Public status | semantic `Book.status` + upcoming | books/` vs `upcoming/` + upcoming.status | `books[].status`, `publicStatus` | Foundation | `published` / upcoming statuses |
| Availability flags | site `book-metadata.ts` derived | Derived from formats + purchase links | `books[].availability` | Derived | Not authored |
| Open edition | site copy / misleading `"open"` flag | Licensing note only | — | Documented | Not a public status |
| `primaryActionPreference` | book-overviews | — | — | Presentation | CTA preference stays site |
| Shelf `maxPreview` | shelves.ts | — | — | Presentation | Display limit |
| Catalog recommended rank | `RECOMMENDED_RANK_SLUGS` | — | — | Presentation | Sort UX |
| Overview `prioritySlugs` | book-overviews | Covered by Start Here shelf | `shelves` | Presentation/overlap | Shelf is corpus form |
| `site_feature` events | whats-new.json | — | — | Presentation | Site UX launches |
| Podcast episodes / events | podcast JSON + whats-new | — | — | Ambiguous | Podcast remains site-owned for now |
| `collaborative` status | site BookStatus | — | — | Ambiguous | No active upcoming trees |
| Bundled semantic-manifest | `data/semantic-manifest.json` | Release asset from this repo | — | Unchanged | Site continues to consume release |
| Contributors | `data/contributors.json` | — | — | Presentation | Site page |
| Graph entities / relationships | already in after-certainty | `semantic/**` | existing collections | Already authoritative | — |

## Conflicts found

| Item | Site | Content | Resolution |
|------|------|---------|------------|
| WoLTY companions | registry primary/companion + labels | `companion_books` / `companion_of` | Keep companions; add work/edition fields from registry |
| Content type | TS map | absent | Port overrides into `book.yml`; **correct** `before-certainty-arrives` to nonfiction (site wrongly labeled fiction) |
| Overview text | site JSON | absent | Prefer site editorial text into `book.overview` |
| Podcast alias target | `podcast:how-meaning-moves` | N/A | Kept as opaque external target id |

## Remaining on site (intentional)

- All presentation configuration and React components
- `primaryActionPreference`, `maxPreview`, recommended catalog sort
- `site_feature` and `podcast_episode` What’s New rows
- Site-local copies of discovery JSON until a later site migration PR deletes them
- Bundled fallback `semantic-manifest.json` refresh via existing skill

## Parity fixtures

Frozen under [`fixtures/site-discovery/`](fixtures/site-discovery/). Compare with:

```bash
python3 tools/compare_site_discovery_data.py --repo .
```
