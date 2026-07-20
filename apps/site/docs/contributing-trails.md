# Contributing Curated Reading Trails

Curated Reading Trails are editorially composed paths through the After Certainty corpus. They live in this site repository (not the content repo) alongside [Start with a Question](../data/questions-manifest.json).

## Where definitions live

- **Manifest:** [`data/trails-manifest.json`](../data/trails-manifest.json)
- **Types:** [`types/trails.ts`](../types/trails.ts), shared stops in [`types/paths.ts`](../types/paths.ts)
- **Validation:** [`lib/trails/validate.ts`](../lib/trails/validate.ts)
- **Enrichment:** [`lib/trails/enrichTrails.ts`](../lib/trails/enrichTrails.ts)

## Trails vs questions

|         | Reading Trail                                        | Start with a Question                                   |
| ------- | ---------------------------------------------------- | ------------------------------------------------------- |
| Framing | Title + orientation to a tension                     | Interrogative H1 + what-it-is-not                       |
| Purpose | Reusable sequence for themes, audiences, or revisits | Accessible entrance when you arrive with a felt tension |
| Route   | `/trails/[slug]`                                     | `/questions/[slug]`                                     |

Both use the same **path stop** model under the hood.

## Creating a new trail

1. Add a new object to the `trails` array in `data/trails-manifest.json`.
2. Set `id` and `slug` to the same kebab-case value (e.g. `"judgment-before-certainty"`).
3. Set `status` to `"draft"` while authoring; change to `"published"` when ready.
4. Run `npm test -- lib/trails/validate.test.ts` to verify references.
5. Preview locally with `npm run dev` at `/trails/your-slug`.

## Field reference

### Required (published trails)

| Field               | Description                                                         |
| ------------------- | ------------------------------------------------------------------- |
| `id`, `slug`        | Stable identifier; must match                                       |
| `title`             | Public H1                                                           |
| `summary`           | Card + meta description (≤320 chars)                                |
| `orientation`       | 2–4 sentences on the central tension                                |
| `status`            | `draft`, `published`, `upcoming`, or `archived`                     |
| `themes`            | One or more editorial group labels (e.g. `"Judgment"`, `"Systems"`) |
| `pathStops`         | Ordered stops (3–12; warn above 8)                                  |
| `closingReflection` | Where the path leads; does not claim to settle the tension          |

### Optional

| Field                        | Description                                         |
| ---------------------------- | --------------------------------------------------- |
| `featured`, `featuredRank`   | Surface on index, Start Here (lower rank = earlier) |
| `audience`                   | Eyebrow label (e.g. `"Software engineers"`)         |
| `depth`                      | `introductory`, `intermediate`, or `deep`           |
| `primaryBookId`              | Validation anchor; shown in path overview when set  |
| `suggestedContinuation`      | Plain-text guidance for what to explore next        |
| `relatedTrailIds`            | Up to a few related trail IDs                       |
| `createdDate`, `updatedDate` | ISO dates for editorial tracking                    |
| `reviewNotes`                | Internal; not rendered                              |

### Path stop fields

Each stop in `pathStops` uses the shared [`PathStopInput`](../types/paths.ts) shape:

| Field                    | Required                                  | Notes                                                    |
| ------------------------ | ----------------------------------------- | -------------------------------------------------------- |
| `position`               | Yes                                       | 1-based sequence number; must be unique within the trail |
| `entityType`             | Yes                                       | See supported types below                                |
| `entityId` or `bookSlug` | Yes*                                      | *Not required for `external` (uses `externalUrl`)        |
| `description`            | Yes                                       | Editorial: why this stop belongs                         |
| `whyThisFollows`         | Yes for stops after #1 (published trails) | Sequence rationale                                       |
| `optional`               | No                                        | Mark optional branches; UI shows an "Optional" badge     |
| `estimatedMinutes`       | No                                        | Defaults by type (book 25, concept 5, pattern 8, …)      |
| `titleOverride`          | No                                        | Only when canonical title is misleading                  |
| `fictionDoorway`         | No                                        | Set on fiction books; shows disclaimer                   |
| `excerpt`                | No                                        | Short quoted excerpt                                     |
| `externalUrl`            | For `external` type                       | Must be a valid URL                                      |

## Supported stop types

| `entityType`      | Reference format                         | Resolves to                       |
| ----------------- | ---------------------------------------- | --------------------------------- |
| `book`            | `book-{slug}` or `{slug}` via `bookSlug` | `/explore/books/{canonical-slug}` |
| `concept`         | `concept-{slug}`                         | `/explore/concepts/{slug}`        |
| `pattern`         | `pattern-{slug}`                         | `/explore/patterns/{slug}`        |
| `situation`       | `situation-{slug}`                       | `/explore/situations/{slug}`      |
| `thinker`         | `thinker-{slug}`                         | `/explore/thinkers/{slug}`        |
| `source`          | `source-{slug}`                          | `/explore/sources/{slug}`         |
| `podcast_episode` | `podcast:{episode-id}`                   | External episode URL              |
| `external`        | `externalUrl` required                   | External link (opens in new tab)  |

**Not supported:** book chapters (no stable chapter routes exist).

## Canonical edition behavior

- Use **stable graph IDs** (`book-when-others-look-to-you-v1`, not URL aliases alone).
- [`resolveBookCanonicalSlug`](../lib/books/generated-manifest.ts) maps slug aliases to canonical catalog slugs.
- **Published trails:** all book stops must resolve to published or semantic-graph-present books (build fails otherwise).
- **Upcoming trails:** set `status: "upcoming"` to allow forthcoming book stops; the index shows a **Coming soon** section, cards carry an Upcoming badge, and preview detail pages are `noindex` (not in the sitemap). Book stops show forthcoming badges when the catalog status is not published.
- Non-canonical edition slugs produce a **validation warning** (prefer the canonical edition).

Titles, URLs, and covers are **generated at build time** from the semantic graph and books catalog—do not duplicate them in trail JSON unless using `titleOverride`.

## Status values

| Status      | Visible on site                        | Book stop rules                           |
| ----------- | -------------------------------------- | ----------------------------------------- |
| `draft`     | No                                     | Relaxed; for authoring                    |
| `published` | Yes (`/trails/[slug]`, index, sitemap) | Strict; unpublished books fail validation |
| `upcoming`  | Index + preview detail (`noindex`)     | Forthcoming books allowed                 |
| `archived`  | No                                     | Hidden from browse                        |

## Featuring a trail

```json
"featured": true,
"featuredRank": 1
```

Lower `featuredRank` appears first. Featured trails surface on `/trails`, Start Here, and related sections.

## Related trails

```json
"relatedTrailIds": ["systems-without-correction", "software-judgment-trail"]
```

IDs must exist in the same manifest. Self-reference fails validation.

## Search bridges

Add `searchBridges` at the manifest root to surface curated trails above Global Search results when a query matches authored terms (same pattern as questions):

```json
"searchBridges": [
  {
    "terms": ["reading trail judgment", "judgment before certainty"],
    "trailIds": ["judgment-before-certainty"],
    "note": "Optional editorial note"
  }
]
```

Terms use substring matching (case-insensitive). Up to two matched trails appear in the "Curated reading trails" callout on `/search?q=…`. Unknown `trailIds` fail validation.

Published trails that reference an entity automatically appear on that entity's explore detail page (books, concepts, patterns) under **Reading trails featuring this …**.

Published trails that share path stops with a question (without duplicating more than 60% of the path) automatically appear on that question's detail page under **Continue with a reading trail**.

## Estimated time

Per-stop minutes default by entity type and sum to the trail total shown on cards and detail pages. Override with `estimatedMinutes` on individual stops when you have a reliable estimate.

## Validation

Validation runs in CI via Vitest ([`lib/trails/validate.test.ts`](../lib/trails/validate.test.ts)).

**Fails the build (errors):**

- Duplicate IDs/slugs, invalid slug format, `id !== slug`
- Unknown entity references, unpublished books on published trails
- Missing `whyThisFollows` after stop 1, missing stop descriptions
- Invalid `relatedTrailIds`, self-reference
- Unknown `trailIds` in `searchBridges`

**Warnings (editorial quality):**

- Trail longer than 8 stops, >60% overlap with another trail or question path
- Non-canonical book edition slug
- `primaryBookId` not in path stops

## Complete example

```json
{
  "id": "example-trail",
  "slug": "example-trail",
  "title": "Example Trail Title",
  "summary": "One sentence describing the tension this path explores.",
  "orientation": "Two to four sentences orienting the reader to the question or tension that holds the trail together.",
  "status": "published",
  "featured": false,
  "themes": ["Judgment"],
  "depth": "intermediate",
  "primaryBookId": "book-before-certainty-arrives",
  "relatedTrailIds": ["judgment-before-certainty"],
  "pathStops": [
    {
      "position": 1,
      "entityType": "concept",
      "entityId": "concept-judgment",
      "description": "Begin with judgment as ongoing work—not a one-time verdict."
    },
    {
      "position": 2,
      "entityType": "book",
      "entityId": "book-before-certainty-arrives",
      "description": "See how responsible action begins before the picture is complete.",
      "whyThisFollows": "After naming judgment, this book shows what acting while still learning looks like."
    },
    {
      "position": 3,
      "entityType": "pattern",
      "entityId": "pattern-revisability-preserves-judgment",
      "description": "Notice what keeps claims open to revision.",
      "whyThisFollows": "Judgment that cannot be revised becomes performance."
    }
  ],
  "closingReflection": "The trail does not settle the underlying question—it offers a sequence for moving through it.",
  "suggestedContinuation": "Browse related trails on Systems or search the commons for feedback and coupling."
}
```

## Local preview

```bash
npm run dev
# Visit http://localhost:3000/trails and http://localhost:3000/trails/your-slug
```

## Quality checks before merge

```bash
npm run lint
npm test
npm run build
npm run test:e2e -- e2e/trails.spec.ts
```

## Common validation failures

| Error                             | Fix                                                            |
| --------------------------------- | -------------------------------------------------------------- |
| `unknown_entity`                  | Check `entityId` against bundled `data/semantic-manifest.json` |
| `unknown_book`                    | Verify book slug; use `book-{slug}` form                       |
| `unpublished_book`                | Use a published book, or set trail `status` to `upcoming`      |
| `missing_why_this_follows`        | Add `whyThisFollows` to every stop after position 1            |
| `non_canonical_edition` (warning) | Switch to canonical slug from catalog                          |
