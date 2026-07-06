# Semantic thinkers reference

## Commands

```bash
# Ensure sources have creatorSlugs
python3 tools/backfill_source_metadata.py --repo . --dry-run

# Derive thinker drafts from sources
python3 tools/derive_thinker_drafts.py --repo . --dry-run
python3 tools/derive_thinker_drafts.py --repo .

# Full validation + manifest round-trip
make verify-semantic-ontology
```

## Canonical thinker template

```yaml
slug: hannah-arendt
name: Hannah Arendt
type: person
summary: Political theorist whose work helps frame authority, judgment, responsibility, violence, and public action.
whyThisMatters: Arendt helps distinguish authority from force and responsibility from obedience.
concepts:
  - authority
  - judgment
patterns: []
relatedBooks:
  - after-certainty
  - living-in-sediment
works:
  - arendt-hannah-between-past-and-future
  - arendt-hannah-the-human-condition
  - arendt-hannah-on-violence
```

Organization example:

```yaml
slug: world-bank
name: World Bank
type: organization
summary: Multilateral institution publishing economic and climate policy reports cited across incentive and scale arguments.
concepts: []
patterns: []
relatedBooks:
  - when-incentives-become-the-moral-language
works:
  - world-bank-state-and-trends-of-carbon-pricing
```

## person vs organization

| Signal | `type` |
|--------|--------|
| Individual author in `creatorNames` | `person` |
| World Bank, ISO, U.S. Census Bureau, DoD | `organization` |
| Grouped sources with `sourceKind: institutional_document` or `report` | usually `organization` |

## Manifest shape (v2 excerpt)

```json
{
  "manifestVersion": 2,
  "thinkers": [
    {
      "id": "thinker-hannah-arendt",
      "slug": "hannah-arendt",
      "name": "Hannah Arendt",
      "type": "person",
      "works": ["source-arendt-hannah-between-past-and-future"]
    }
  ]
}
```

When `semantic/thinkers/` is empty, omit `thinkers` and keep `manifestVersion: 1`.

## Related skills

- **semantic-sources** — bibliography works and `creatorSlugs`
- **semantic-enrichment** — concept definitions (not thinkers)
- **glossary-extract** — new concept slugs
