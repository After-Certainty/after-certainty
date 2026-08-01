# The Case That Does Not Fit — Phase 5 Promotion

Promotion report per drafting-process Phase 5. Completed August 2026 on branch
`cursor/the-case-that-does-not-fit-draft-6d58` (PR #440).

## Promotion checklist

| Step | Result |
|------|--------|
| Move `upcoming/the-case-that-does-not-fit/` → `books/the-case-that-does-not-fit/` | **Done** (`git mv`) |
| Migrate to published `book.yml` | **Done** — `publishing.enabled`, `frontmatter.generate` (title/copyright only), `github.release`; docx/epub/pdf; `interior_finish`; book `keywords` |
| Remove `upcoming:` block | **Done** |
| Preserve custom About the Series | **Done** — hand-maintained `front-matter/about-the-series.md` |
| Update `docs/series-guide.md` | **Done** |
| Update `docs/portfolio-reader-map.md` | **Done** |
| Update `upcoming/docs/portfolio-status.md` | **Done** — removed from upcoming table |
| Update `upcoming/README.md` | **Done** |
| Update root `README.md` Books table | **Done** |
| Companion link from No Time to Think | **Done** → `../the-case-that-does-not-fit/` |
| Cover assets present | **Pass** — `book-cover.png`, `open-graph.png`, `open-graph.config.yml` |
| `make validate-book-specs` | Run in this PR |
| `make validate-publication-manuscript` | Run in this PR |
| Export smoke test | Local DOCX with `interior_finish` |

## Path references

`index.md` Related books use `../` peers under `books/` and `../../docs/series-guide.md`.

## Remaining after promote

- Cover strapline vs official subtitle
- Volatile-fact recheck (Acacia successor, school districts, *Panian*, FERP, Title VI)
- Print / ebook / ISBN / BISAC / accessible hyperlinks

## Handoff

Manuscript is in the publishing pipeline. CI book-export workflow builds artifacts on merge to `main` when `books/the-case-that-does-not-fit/` changes and includes them in the rolling `latest` release. Do not claim final-proof publication-ready while production follow-ups remain open.
