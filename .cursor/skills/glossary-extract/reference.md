# Glossary extract reference

## Commands

```bash
make discover-book-glossary-candidates BOOK_DIR=books/coupling [GLOSSARY_WRITE_DRAFTS=1]

make extract-semantic-glossary-drafts \
  GLOSSARY_IN=books/coupling/glossary.md BOOK_ID=coupling
```

```bash
python3 tools/discover_book_glossary_candidates.py \
  --book-dir books/coupling --write-drafts \
  --out books/coupling/semantic-reports/glossary-candidates.md
```

## Manuscript glossary locations checked

- `glossary.md`
- `back-matter/glossary.md`
- `appendix/glossary.md`
- `back-matter/appendix-a-glossary.md`

## Canonical entry template (two-tier)

```yaml
slug: example-term
title: Example Term
shortDefinition: General definition in 30–70 words—index-safe, one clear sentence
  about what the term names in this portfolio.
longDefinition: >-
  Optional richer detail for hub or disambiguation terms. Names what it is;
  when it matters; what it preserves; failure mode; contrast with nearby slug.
  In this book, the term also marks …
termKind: extended
relatedConcepts:
  - nearby-concept
relatedPatterns: []
relatedBooks:
  - coupling
```

Use `longDefinition` for hub terms, disambiguation pairs, and cross-book concepts. Omit for simple book-local terms.

Definition brief: [docs/agents/semantic/08-concept-definitions.md](../../../docs/agents/semantic/08-concept-definitions.md)

## Disambiguation pairs (portfolio examples)

| Pair | Distinction |
|------|-------------|
| `constraint` / `constraints` | Historical moral pressure vs operational system limits |
| `alignment` / `alignment-at-scale` | Belonging-signal authority vs institutional routinization |
| `correction` / `repair` / `revisability` | Reality update vs trust restoration vs designed openness |
| `proximity` / `contact` / `connection` | Relational nearness vs staying close to what was said vs durable reachability |

Search before inventing: `rg -l 'keyword' semantic/glossary/`

## Book → BOOK_DIR

| book_id | BOOK_DIR |
|---------|----------|
| after-certainty | `books/after-certainty` |
| coupling | `books/coupling` |
| how-meaning-moves | `books/how-meaning-moves` |
| when-others-look-to-you-v1 | `books/when-others-look-to-you/v1` |

## Related skills

- **semantic-enrichment** (`definitions`) — revise definitions and `relatedConcepts` for existing book-scoped terms
- **semantic-enrichment** (other types) — add recognitionSignals, questions, etc. after glossary exists
- **glossary-usage-audit** — where existing terms appear in the manuscript
