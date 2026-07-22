# The World We Make Together — Phase 5 Promotion

Promotion report per drafting-process Phase 5. Completed July 2026 on branch `cursor/the-world-we-make-together-publication-3055` (PR #325).

## Promotion checklist

| Step | Result |
|------|--------|
| Move `upcoming/the-world-we-make-together/` → `books/the-world-we-make-together/` | **Done** (`git mv`) |
| Migrate to published `book.yml` | **Done** — `publishing.enabled`, `frontmatter.generate`, `github.release`; docx/epub/pdf; `interior_finish` (no TOC) |
| Remove `upcoming:` block | **Done** |
| Add About the Series | **Done** — generated to `back-matter/about-the-series.md` |
| Update `docs/series-guide.md` | **Done** |
| Update `docs/portfolio-reader-map.md` | **Done** |
| Update `upcoming/docs/portfolio-status.md` | **Done** — removed from upcoming table |
| Update `upcoming/README.md` | **Done** |
| Cover assets present | **Pass** — `book-cover.png`, `open-graph.png`, `open-graph.config.yml` |
| `make validate-book-specs` | **Pass** (this PR) |
| `make validate-publication-manuscript` | **Pass** (this PR) |
| Export smoke test | **Done** — local DOCX; epub/pdf enabled for CI `latest` |

## Path references

`index.md` Related books use `../` peers under `books/` and `../../docs/series-guide.md`.

## Remaining after promote

- Optional semantic bibliography ingest (separate PR)
- Author read on CI export artifacts
- Soft citation verification items in `editorial-report-publication-pass.md`

## Handoff

Manuscript is in the publishing pipeline. CI book-export workflow builds artifacts on merge to `main` when `books/the-world-we-make-together/` changes and includes them in the rolling `latest` release.
