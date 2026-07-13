# Learning to See — Phase 5 Promotion

Promotion report per [`drafting-process.md`](drafting-process.md). Completed July 2026 on branch `cursor/learning-to-see-draft-cc77`.

## Promotion checklist

| Step | Result |
|------|--------|
| Move `upcoming/learning-to-see/` → `books/learning-to-see/` | **Done** (`git mv`) |
| Migrate `upcoming.yml` → `book.yml` | **Done** — `publishing.enabled`, `frontmatter.generate`, `github.release` added |
| Remove `upcoming.yml` | **Done** |
| Add About the Series to `index.md` | **Done** — generated from house template on build |
| Update [`docs/series-guide.md`](../../../docs/series-guide.md) | **Done** — links to `books/learning-to-see/`; *(upcoming)* labels removed |
| Update [`upcoming/docs/portfolio-status.md`](../../../upcoming/docs/portfolio-status.md) | **Done** — removed from upcoming table; added to promoted list |
| Update [`upcoming/README.md`](../../../upcoming/README.md) | **Done** — no active upcoming nonfiction manuscripts |
| Cover assets present | **Pass** — `book-cover.png`, `open-graph.png`, `open-graph.config.yml` |
| `make validate-book-specs` | **Pass** |
| Export smoke test | **Deferred to CI** — pandoc not available locally; `book.yml` formats match published books |

## `book.yml` changes from `upcoming.yml`

- Added `publishing.enabled: true`
- Added `frontmatter.generate` for title page, copyright, and about-the-series (house templates)
- Added `github.release` with docx, epub, pdf artifacts
- Removed `upcoming.status` block (not used in published specs)

## Path references

Manuscript `index.md` related-book links (`../../books/`, `../../docs/series-guide.md`) remain valid from `books/learning-to-see/` — no change required.

## Remaining before public release

- Author full-manuscript read-through (optional gate)
- Optional live expert review per [`sensitivity-review.md`](sensitivity-review.md)
- Acknowledgements page (deferred)

## Handoff

Manuscript is in the publishing pipeline. CI book-export workflow will build artifacts on merge to `main` when `books/learning-to-see/` changes.
