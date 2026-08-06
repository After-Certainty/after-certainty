# When the Key Changes Hands — Phase 5 Promotion

Promotion report per [`drafting-process.md`](drafting-process.md). Completed August 2026 on branch `cursor/when-the-key-changes-hands-eb03`.

## Promotion checklist

| Step | Result |
|------|--------|
| Move `upcoming/when-the-key-changes-hands/` → `books/when-the-key-changes-hands/` | **Done** (`git mv`) |
| Migrate `upcoming.yml` → `book.yml` | **Done** — `publishing.enabled`, `frontmatter.generate`, `github.release`, overview |
| Remove `upcoming.yml` | **Done** |
| Add generated front matter to `index.md` | **Done** — title page, copyright, about-the-series |
| Update [`docs/series-guide.md`](../../../docs/series-guide.md) | **Done** — Formation entry + catalog + confused-pair note |
| Update [`books/after-certainty/back-matter/series-guide.md`](../../after-certainty/back-matter/series-guide.md) | **Done** |
| Update [`docs/portfolio-reader-map.md`](../../../docs/portfolio-reader-map.md) | **Done** |
| Update [`upcoming/docs/portfolio-status.md`](../../../upcoming/docs/portfolio-status.md) | **Done** — removed from active upcoming |
| Update [`upcoming/README.md`](../../../upcoming/README.md) | **Done** |
| Update root [`README.md`](../../../README.md) | **Done** |
| Cover assets present | **Pass** — `book-cover.png`, `open-graph.png`, `open-graph.config.yml` |
| `make validate-book-specs` | **Pass** (run at promote) |
| Export smoke test | **Deferred to CI** — formats enabled in `book.yml` |

## `book.yml` changes from `upcoming.yml`

- Added `publishing.enabled: true`
- Added `content_type` / `literary_form` / `keywords` / `overview`
- Added `frontmatter.generate` for title page, copyright, and about-the-series
- Enabled `build.formats` docx/epub/pdf (`interior_finish` on docx)
- Added `github.release` with docx, epub, pdf artifacts
- Removed `upcoming.status` block

## Path references

Docs links that pointed at `upcoming/`-relative paths were updated for the `books/` tree.

## Remaining before public release

- Author full-manuscript read-through (optional gate)
- Part coherence / echo passes against companion titles
- Optional semantic bibliography ingest

## Handoff

Manuscript is in the publishing pipeline. CI book-export workflow will build artifacts on merge to `main` when `books/when-the-key-changes-hands/` changes.
