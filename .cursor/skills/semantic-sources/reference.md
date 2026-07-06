# Semantic sources reference

## Commands

```bash
# Extract
make extract-semantic-source-drafts \
  BIBLIO_IN=books/after-certainty/back-matter/bibliography.md \
  BOOK_ID=after-certainty

# Promote
make promote-semantic-source-drafts SOURCE_PROMOTE_BOOK_IDS='after-certainty'

# Backfill optional metadata on existing files
python3 tools/backfill_source_metadata.py --repo . --dry-run
python3 tools/backfill_source_metadata.py --repo .

# Infer links from manuscript co-mentions
python3 tools/infer_semantic_source_links.py --repo . --dry-run

# Dedupe prefix-chain slug artifacts
make dedupe-semantic-sources
```

## Canonical source template (v1.5)

```yaml
slug: arendt-hannah-between-past-and-future
name: Hannah Arendt — Between Past and Future
type: book
sourceKind: book
creatorNames:
  - Hannah Arendt
creatorSlugs:
  - hannah-arendt
title: Between Past and Future
citation: 'Arendt, Hannah. *Between Past and Future*. New York: Penguin Books, 2006.'
year: 2006
publisher: Penguin Books
summary: 'Arendt, Hannah. *Between Past and Future*. New York: Penguin Books, 2006.'
concepts: []
patterns: []
relatedBooks:
  - after-certainty
```

Legacy-only entries (still valid) omit optional fields.

## sourceKind guide

| sourceKind | When to use | Examples |
|------------|-------------|----------|
| `book` | Monograph or edited volume | Scott, Weick |
| `article` | Journal article or book chapter | Berlin, "The Hedgehog and the Fox" |
| `report` | Institutional / annual report | World Bank carbon pricing |
| `standard` | ISO, DoD, industry standard | ISO 9001 |
| `dataset` | Published data product | Census tables |
| `speech` | Speeches, testimony | Yellen speeches |
| `case` | Case study source | Branch Davidian conflict volume |
| `website` | Canonical web resource | |
| `institutional_document` | Org-authored doc that is not a formal report | |

Keep legacy `type` as `book` or `article` for site backward compatibility.

## Slug conventions

| Entity | Pattern | Example |
|--------|---------|---------|
| Source (work) | `lastname-firstname-work-fragment` | `arendt-hannah-between-past-and-future` |
| Thinker | `firstname-lastname` or org slug | `hannah-arendt`, `world-bank` |

## Manifest emission

- Optional v1.5 fields pass through `build_sources()` in `tools/generate_semantic_manifest.py`
- `manifestVersion` stays `1` until canonical `semantic/thinkers/` exists
- Books reference works via `books[].sources` → `source-*` ids

## Related skills

- **semantic-thinkers** — aggregate works by `creatorSlugs` into thinker YAML
- **glossary-extract** — concepts (not bibliography works)
- **semantic-enrichment** — concept/pattern enrichment fields
