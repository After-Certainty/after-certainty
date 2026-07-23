# Contributing book overviews

Book orientation fields (central question, audience, read-next, selected concepts) are authored in **after-certainty** on each `book.yml` as `book.overview`, then exported on `books[].overview` in `semantic-manifest.json`.

Site presentation overlays that stay here:

- `primaryActionPreference` — [`lib/books/presentation-overlays.ts`](../lib/books/presentation-overlays.ts)
- Priority slug checklist for validation — `DEFAULT_BOOK_OVERVIEW_PRIORITY_SLUGS` in [`lib/books/book-overview-schema.ts`](../lib/books/book-overview-schema.ts)

## What belongs upstream

| Field             | Notes                                         |
| ----------------- | --------------------------------------------- |
| `centralQuestion` | One sentence visitors should understand first |
| `whyItExists`     | Why this book is in the project               |
| `audience`        | Who it is for                                 |
| `nonGoals`        | 1–6 short “this is not…” lines                |

## Selected concepts and patterns

Prefer concepts and patterns already linked on `books[].concepts` /
`books[].patterns` in the semantic manifest.

By default the site treats overview selections that are **not** linked on the
book row as integrity **errors**:

- `concept_not_on_book` / `concepts_selected_on_empty_book`
- `pattern_not_on_book` / `patterns_selected_on_empty_book`

Unknown concept or pattern ids remain hard errors (no exception path).

### Intentional exceptions

When an orientation overlay must temporarily surface glossary entities before
upstream backfill, add a documented exception in
[`data/overview-concept-link-exceptions.json`](../data/overview-concept-link-exceptions.json):

```json
{
  "version": 1,
  "exceptions": [
    {
      "bookSlug": "observer-patterns",
      "conceptIds": "*",
      "patternIds": "*",
      "reason": "Orientation overview pending books[].concepts / patterns backfill upstream."
    }
  ]
}
```

- `conceptIds` / `patternIds`: explicit ids, or `"*"` for any selection on that book
- Excepted mismatches become **warnings** (`*_excepted`) with the reason attached
- Unused exceptions (no longer needed after backfill) emit `unused_link_exception` warnings — remove them
- Exception book/concept/pattern references that do not exist are **errors**

Do not use exceptions to hide broken public routes or unknown ids.

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
