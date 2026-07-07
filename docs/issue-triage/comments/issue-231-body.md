## Context

Source entities in the semantic manifest represent **cited works** (e.g. "Hannah Arendt — Eichmann in Jerusalem"), not person profiles. The site maps them to schema.org `Book` or `Article` JSON-LD.

## Completed in v1.5 (PR #253)

Structured fields now on ~411 sources via [`docs/semantic-thinkers-sources-migration.md`](https://github.com/ksteffe/after-certainty/blob/main/docs/semantic-thinkers-sources-migration.md):

- `sourceKind`, `creatorNames`, `creatorSlugs`, `title`, `citation`, `year`, `publisher`, `institution`, `url` (schema support)

Backfill populated `creatorNames`, `title`, `year`, `publisher`, `citation`, `sourceKind`. Schema: [`schema/semantic-manifest.schema.json`](https://github.com/ksteffe/after-certainty/blob/main/schema/semantic-manifest.schema.json) `sourceEntry`.

## Remaining scope

Machine-parseable identifiers not yet structured:

- `isbn?: string`
- `doi?: string`
- `sameAs?: string[]` (WorldCat, OpenLibrary, DOI resolver, etc.)

`url` field exists in schema but is largely unpopulated; DOIs are still embedded in `citation` strings.

## Why

Enables accurate `Book` / `ScholarlyArticle` structured data instead of embedding all metadata in `name` and `description` strings.

## Notes

Keep `summary` as human-readable fallback. `sameAs` requires editorial curation per work.
