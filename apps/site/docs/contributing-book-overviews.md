# Contributing book overviews

Book orientation fields (central question, audience, read-next, selected concepts) are authored in **after-certainty** on each `book.yml` as `book.overview`, then exported on `books[].overview` in `semantic-manifest.json`.

Site presentation overlays that stay here:

- `primaryActionPreference` — [`lib/books/presentation-overlays.ts`](../lib/books/presentation-overlays.ts)
- Priority slug checklist for validation — `DEFAULT_BOOK_OVERVIEW_PRIORITY_SLUGS` in [`lib/books/book-overview-schema.ts`](../lib/books/book-overview-schema.ts)

## What belongs upstream

| Field                         | Notes                                           |
| ----------------------------- | ----------------------------------------------- |
| `centralQuestion`             | One sentence visitors should understand first   |
| `whyItExists`                 | Why this book is in the project                 |
| `audience`                    | Who it is for                                   |
| `nonGoals`                    | 1–6 short “this is not…” lines                  |
| `selectedConcepts` / ids      | Prefer concepts already linked on that book     |
| `selectedPatterns` / ids      | Optional                                        |
| `readBefore` / `readNext`     | Optional book **slugs**; companions OK; no self |
| `revisedAt` + `changeSummary` | Pair both or neither                            |

**Do not** put CTA preference, badge colors, or layout limits in content YAML.

Upstream authoring: [after-certainty `docs/authoring-discovery-metadata.md`](https://github.com/ksteffe/after-certainty/blob/main/docs/authoring-discovery-metadata.md).

## After upstream changes

Refresh the bundled fallback:

```bash
# see .cursor/skills/refresh-manifest/SKILL.md
gh release download latest --repo ksteffe/after-certainty --pattern semantic-manifest.json --dir /tmp --clobber
cp /tmp/semantic-manifest.json data/semantic-manifest.json
npm test -- lib/graph/manifest.test.ts lib/books/validate-book-overviews.test.ts
```

## Related

- Publication status / editions: `docs/contributing-books-catalog.md`
- Manifest contract: after-certainty `docs/semantic-manifest-contract.md`
