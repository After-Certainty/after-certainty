# Contributing book overview overlays

Authored orientation fields for redesigned book pages live in `data/book-overviews.json`. Phase G renders the orientation-first overview IA when an overlay exists; other books keep the current layout.

## What belongs here

| Field                         | Notes                                                                  |
| ----------------------------- | ---------------------------------------------------------------------- |
| `centralQuestion`             | One sentence visitors should understand first                          |
| `whyItExists`                 | Why this book is in the project                                        |
| `audience`                    | Who it is for                                                          |
| `nonGoals`                    | 1–6 short “this is not…” lines                                         |
| `selectedConceptIds`          | 3–5 when the book has graph concepts; `[]` when the book has none      |
| `selectedPatternIds`          | Optional, up to 5, must be on the book                                 |
| `readBefore` / `readNext`     | Optional book **slugs**; companions OK; no self; no superseded         |
| `revisedAt` + `changeSummary` | Pair both or neither                                                   |
| `primaryActionPreference`     | Optional: `download_pdf`, `download_epub`, `download_docx`, `purchase` |

**Do not** duplicate title, cover, summary, or download/purchase URLs — those come from `semantic-manifest.json`.

**Do not** auto-generate orientation prose from concept lists.

## Adding or editing an overview

1. Confirm the book `id` and `slug` match the semantic graph.
2. Prefer concepts/patterns already linked on that book.
3. Keep `prioritySlugs` in sync when adding Start Here / core overlays before Phase G.
4. Run:

```bash
npm test -- lib/books/book-overview-schema.test.ts lib/books/validate-book-overviews.test.ts lib/books/book-overview-view-model.test.ts
```

## Related

- Publication status / editions: `docs/contributing-books-catalog.md`
- Roadmap: `docs/roadmaps/canonical-status-whats-new-book-overviews-plan.md` (Phase F/G)
