# Authoring discovery metadata

**Status:** Living authoring guide (not a roadmap)  
**Remaining product work:** [`docs/roadmaps/remaining-product-roadmap.md`](roadmaps/remaining-product-roadmap.md)

Ownership boundary:

- **after-certainty** (corpus at repo root) owns what the corpus is, means, and how intellectual objects relate.
- **`apps/site/`** (same monorepo) owns rendering, layout, URL state, keyboard shortcuts, display limits, analytics, and progressive disclosure.

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
  edition_published_at: 2026-01-15   # optional; defaults conceptually to publication_date
  substantially_revised_at: null       # optional ISO date when applicable
```

### Evidence hierarchy

1. Explicit authored publication metadata already in the repository  
2. Existing public change events  
3. Release records clearly associated with publication (not packaging tags)  
4. ISBN, edition, or retailer metadata already stored in the repository  
5. Existing publication announcements stored in the corpus  
6. A documented editorial record  
7. Unknown — leave the field unset and report it  

Do **not** use Git commit dates, file modification times, manifest generation dates,
or neighboring-book guesswork. See [`reports/publication-date-audit.md`](../reports/publication-date-audit.md).

### Substantial revision criteria

Set `substantially_revised_at` only for a major rewrite, new/reorganized chapters,
changed governing argument, new edition replacing an earlier edition, or significant
structural/scholarly revision. Do **not** set it for typo fixes, formatting, cover
optimization, link repair, metadata normalization, manifest regeneration, or CI.

## Selected concept and pattern roles

Keep the legacy slug arrays. Add parallel role lists so each curated selection
explains its work-specific job:

```yaml
overview:
  selectedConcepts: [partial-coherence]
  selectedConceptRoles:
    - conceptId: partial-coherence
      roleInWork: >
        Names the provisional alignment that allows people to move together
        without sharing one complete interpretation.
  selectedPatterns: [invisible-coordination-work]
  selectedPatternRoles:
    - patternId: invisible-coordination-work
      roleInWork: >
        Explains why collaboration often appears smooth only because one
        participant is absorbing its unresolved costs.
```

Roles must not copy the global glossary definition. Fiction may use dramatizes /
stages / makes visible; do not treat fiction as empirical proof.

## Chapter enrichment

Optional `books/<slug>/chapter-enrichment.yml` (schema:
`schema/semantic/chapter-enrichment.schema.json`):

```yaml
version: 1
chapters:
  - sourcePath: parts/.../chapter-1.md
    summary: >
      What the chapter investigates and the conceptual movement it makes.
    centralQuestion: Narrower than the book question.
    selectedConcepts: [judgment]
    selectedPatterns: [revisability-preserves-judgment]
    situations: [feedback-stops-changing-decisions]
    searchAliases: [judgment without finality]
    transition:
      fromPrevious: Why this chapter follows.
      toNext: What remains open into the next chapter.
```

Poetry collections (`kind: poetry`) export titled units as `poem` rather than
forcing argumentative `chapter` kinds.

## Graph provenance

Patterns and concepts may declare optional grounding:

```yaml
grounding:
  type: original_synthesis  # established_term | adapted_from_source | original_synthesis | composite_pattern | manuscript_specific | historical_term
  developedFrom:
    - work: why-collaboration-is-so-hard
  note: >
    Synthesized across observation and cited literature rather than adopted
    as a named term from one source.
```

Relationships may add:

```yaml
provenance:
  origin: authored  # authored | extracted | inferred | source_grounded
  evidence: [semantic/relationships.yml]
```

## Thinker identity

Thinker `type` may be `person`, `organization`, `author_group`, or `collective`.
Set `citationOnly: true` for citation creators that should not receive a public
thinker page. Use `formerSlugs` / `aliases` when correcting a slug (e.g. Hal Daumé III).

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
  # Optional: deep-link a public chapter (stable ManifestChapter.id, not routeKey):
  # - position: 3
  #   entityType: chapter
  #   entityId: chapter-after-certainty-parts-part-2-what-can-still-be-practiced-chapter-4-judgment-without-finality
  #   description: "..."
  #   whyThisFollows: "..."
closingReflection: "..."
```

Do not duplicate book titles or download URLs; the generator enriches stop titles.

### Chapter path stops (READ-007)

Use `entityType: chapter` with `entityId` set to the chapter’s stable graph id (`chapter-{editionSlug}-…` from `docs/semantic-chapter-identity.md`). The site resolves the stop to the public reader URL (`routeKey`). Only **public** chapters on public books are valid; unknown or non-public ids fail discovery validation.

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
