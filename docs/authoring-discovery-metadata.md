# Authoring discovery metadata

Ownership boundary:

- **after-certainty** owns what the corpus is, means, and how intellectual objects relate.
- **after-certainty-site** owns rendering, layout, URL state, keyboard shortcuts, display limits, analytics, and progressive disclosure.

Do not put presentation settings (badge colors, `maxPreview`, CTA preference, filter defaults) into content YAML.

## Book identity and overview

Edit `books/<book>/book.yml` (or `books/<work>/vN/book.yml`).

Optional fields:

```yaml
book:
  id: when-others-look-to-you-v1
  work_id: when-others-look-to-you
  edition_relationship: primary   # sole | primary | companion | superseded
  is_canonical: true
  edition_label: Primary volume
  content_type: nonfiction        # nonfiction | fiction | handbook | essay_collection | poetry
  literary_form: monograph        # optional: novel | poetry_collection | monograph | handbook | ...
  overview:
    centralQuestion: "..."
    whyItExists: "..."
    audience: "..."
    nonGoals:
      - "..."
    selectedConcepts: [authority, accountability]   # bare glossary slugs
    selectedPatterns: [exceptions-are-forever]
    readBefore: [how-serious-systems-learn]
    readNext: [when-others-look-to-you-v2]
    relatedWorks:
      - workId: coupling
        relationship: deepens   # prepares_for | deepens | applies | historicizes | fictionalizes | contrasts_with | companion_to | continues | reframes
        reason: >
          Short editorial reason grounded in the manuscript or index.
```

Defaults when omitted: `work_id` derived from slug (strip `-vN`), `edition_relationship: sole`, `is_canonical: true`, `content_type: nonfiction` (or `poetry` when `kind: poetry` and content_type omitted).

`kind: prose|poetry` remains a build/format concern, orthogonal to `content_type`. Optional `literary_form` refines public catalog form.

Publication dates (authored only; never from file mtimes):

```yaml
book:
  publication_date: 2026-01-15
  edition_published_at: 2026-01-15   # optional
  substantially_revised_at: null       # optional ISO date when applicable
```

## Search aliases

Edit [`semantic/search-aliases.yml`](../semantic/search-aliases.yml):

```yaml
version: 1
entries:
  - terms: [wolty]
    kind: alias          # true alias
    aliasClass: shortened_name   # optional: previous_title | spelling_variant | shortened_name | vocabulary_bridge
    targetIds: [book-when-others-look-to-you-v1]
  - terms: [temporary rules]
    kind: related        # vocabulary bridge, not a synonym claim
    aliasClass: vocabulary_bridge
    targetIds: [pattern-exceptions-are-forever]
```

## Questions

Add `semantic/questions/<slug>.yml` (filename stem must equal `slug` and `id`):

```yaml
id: trust-survives-disagreement
slug: trust-survives-disagreement
question: How can trust survive disagreement?
summary: "..."
orientation: "..."
whatThisIsNot: ["..."]
status: published
families: [Trust and disagreement]
primaryBookId: book-trust-beyond-similarity
pathStops:
  - position: 1
    entityType: concept
    entityId: concept-trust
    description: "..."
  - position: 2
    entityType: book
    entityId: book-trust-beyond-similarity
    description: "..."
    whyThisFollows: "..."   # required after the first stop when published
closingReflection: "..."
```

Do not duplicate book titles or download URLs; the generator enriches stop titles.

## Trails

Add `semantic/trails/<slug>.yml` with ordered `pathStops` and transition text (`whyThisFollows`). Trails are editorial sequences, not graph edges.

## Shelves

Add `semantic/shelves/<slug>.yml`:

- Curated: `selection.mode: curated` + `bookSlugs`
- Rule: `contentType`, `status`, or `allPublic`

Keep `maxPreview` and layout on the site.

## Change events

Add `semantic/change-events/<name>.yml` only for meaningful public changes (`book_published`, `book_revised`, …). Do not invent events from git file mtimes. Set `visibility: public` and `source: authored`.

Podcast and site-feature announcements may remain site-authored until podcast metadata is owned here.

## Validation

```bash
make validate-book-specs
make validate-discovery-content
make report-semantic-completeness
make verify-semantic-ontology
make compare-site-discovery
```

Broken references, duplicate IDs, invalid canonical state, and hidden public leakage fail the build. Incomplete optional overview coverage and completeness gaps may warn.

See also:

- [semantic-completeness-report.md](semantic-completeness-report.md)
- [semantic-chapter-identity.md](semantic-chapter-identity.md)
- [migrations/enrichment-content-type-corrections.md](migrations/enrichment-content-type-corrections.md)

## Site migration path

1. Site continues reading existing fields.
2. Gradually switch discovery features to new collections.
3. Delete site-local JSON/TS mirrors only after parity is confirmed.
4. Deprecate legacy overlays by documenting unused fields; do not remove manifest fields without a major version plan.
