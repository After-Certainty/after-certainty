# Concept definitions (glossary extract + definitions enrichment)

Brief for writing and revising `semantic/glossary/*.yml` definitions so concepts work as a **reader-facing semantic atlas**, not only a compact glossary.

Used by Cursor skills **glossary-extract** and **semantic-enrichment** (`definitions` type).

## Two-tier model

| Field | Where shown | Target length | Purpose |
|-------|-------------|---------------|---------|
| `shortDefinition` | Concepts index + detail lead | 30–70 words (ordinary); 40–60 for hub terms | One clear general sentence; book-specific only when the term is genuinely book-scoped |
| `longDefinition` | Concept detail page (via manifest `definition`) | 70–140 words (hubs); 40–80 (disambiguation pairs) | General definition, project significance, contrast with nearby concepts, recognition/example when useful |

**Do not duplicate** `shortDefinition` into `longDefinition` — `make verify-semantic-yaml --strict-prose` fails on redundant text.

Manifest bridge: `longDefinition` in YAML → `definition` + `longDefinition` in `semantic-manifest.json` (no site repo change needed).

## Editorial pattern (when it fits)

> "[Concept] names [what it is]. It becomes important when [pressure/condition]. It helps preserve [value/capacity], but can fail when [drift/failure mode]. It differs from [nearby concept] because [distinction]."

Not every term needs every clause. Avoid making every definition sound identical.

## General-first, book-second

When a term is used across books but the manuscript opens with a domain example:

1. **`shortDefinition`** — general human/systems definition
2. **`longDefinition`** — add "In this book…" or "In the authority arc…" with the domain application

Examples from portfolio hub pass: `attention`, `care`, `meaning`, `interpretation`, `boundary`, `alignment`.

## Hub vs ordinary terms

**Hub terms** (core/supporting ontology terms, or terms that anchor a book's argument): invest in both tiers + `relatedConcepts`.

**Ordinary / book-specific terms**: concise `shortDefinition` is enough; add `longDefinition` only when disambiguation or cross-book reuse needs it.

## Disambiguation

Before creating a new slug, search existing glossary for:

- Same English word, different sense (`constraint` vs `constraints`)
- Near-overlap pairs in the same book (`repair` / `witness` / `correction`)
- Portfolio pairs documented in [`docs/portfolio-reader-map.md`](../../portfolio-reader-map.md)

When adding or revising a pair:

1. Add one contrast clause to each `shortDefinition` where helpful
2. Use `longDefinition` when the distinction needs more than one sentence
3. Wire **`relatedConcepts`** bidirectionally when slugs exist
4. Optionally add one-sentence edges to `semantic/relationships.yml` (do not duplicate full definitions)

## `relatedConcepts` and typed relationships

**`relatedConcepts`** (required field):
- Empty list is valid; hub terms should link to 2–5 nearby concepts
- Only reference slugs that exist under `semantic/glossary/`
- Prefer conceptual neighbors over book co-mentions
- Provides undifferentiated adjacency for navigation

**Typed relationships** in `semantic/relationships.yml` (optional but encouraged):
- When definitions say "differs from Y because..." → add `contrasts` relationship
- When definitions describe force dynamics (thins, enables, preserves) → add typed edge
- See **[semantic-relationships skill](../../.cursor/skills/semantic-relationships/SKILL.md)** for workflow
- See **[relationship types guide](../semantic-relationship-types.md)** for complete semantics

**Example disambiguation pair:**
```yaml
# In semantic/glossary/correction.yml
relatedConcepts:
  - repair
  - revisability

# Also add to semantic/relationships.yml:
- source: correction
  target: repair
  relationship: contrasts
  description: Correction updates belief and behavior; repair addresses damaged trust and legitimacy.
```

## Voice and quality bar

- Sound like After Certainty: reflective, precise, humane, systems-aware
- No jargon-only definitions unless the concept is explicitly technical
- No generic dictionary definitions
- Book-grounded when the term is book-scoped; portfolio-aware when reused
- Preserve existing `recognitionSignals`, `trajectory`, etc. — definitions enrichment touches definition fields and `relatedConcepts` only unless the user asks otherwise

## YAML notes

Unquoted colons inside `longDefinition` break YAML parsing. Use:

```yaml
longDefinition: >-
  First sentence without a colon problem.
  Use a semicolon or em dash instead of colon mid-field when possible.
```

Or single-quoted strings when a colon is unavoidable.

## Suggested workflow (per book)

1. **Discover** — `discover_book_glossary_candidates.py` (glossary-extract skill)
2. **Extract** — create entries with two-tier definitions where warranted (glossary-extract)
3. **Definitions pass** — enrich or disambiguate existing book-scoped terms (`semantic-enrichment` → `definitions`)
4. **Enrichment** — recognition signals, trajectories, etc. (`semantic-enrichment` → other types)

## Verification

```bash
make verify-semantic-ontology
```
