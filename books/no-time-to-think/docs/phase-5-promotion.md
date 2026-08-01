# No Time to Think — Phase 5 Promotion

Promotion report per drafting-process Phase 5. Completed August 2026 on branch
`cursor/no-time-to-think-factual-corrections-6d58` (PR #439).

## Promotion checklist

| Step | Result |
|------|--------|
| Move `upcoming/no-time-to-think/` → `books/no-time-to-think/` | **Done** (`git mv`) |
| Migrate to published `book.yml` | **Done** — `publishing.enabled`, `frontmatter.generate` (title/copyright only), `github.release`; docx/epub/pdf; `interior_finish` |
| Remove `upcoming:` block | **Done** |
| Preserve custom About the Series | **Done** — hand-maintained `front-matter/about-the-series.md` (not generated from series template) |
| Update `docs/series-guide.md` | **Done** |
| Update `docs/portfolio-reader-map.md` | **Done** |
| Update `upcoming/docs/portfolio-status.md` | **Done** — removed from upcoming table |
| Update `upcoming/README.md` | **Done** |
| Update root `README.md` Books table | **Done** |
| Companion link from Case manuscript | **Done** → `../../books/no-time-to-think/` |
| Cover assets present | **Pass** — `book-cover.png`, `open-graph.png`, `open-graph.config.yml` |
| `make validate-book-specs` | Run in this PR |
| `make validate-publication-manuscript` | Run in this PR |
| Export smoke test | Local DOCX with `interior_finish` |

## Path references

`index.md` Related books use `../` peers under `books/` (including promoted companion `../the-case-that-does-not-fit/`) and `../../docs/series-guide.md`.

## Remaining after promote

- Proofread production follow-ups in [`research/proofread-correction-pass-change-log.md`](research/proofread-correction-pass-change-log.md)
- Soft/qualified verification items in the factual-correction change log
- Author sign-off on final print/EPUB proof

## Handoff

Manuscript is in the publishing pipeline. CI book-export workflow builds artifacts on merge to `main` when `books/no-time-to-think/` changes and includes them in the rolling `latest` release. Do not claim final-proof publication-ready while production follow-ups remain open.
