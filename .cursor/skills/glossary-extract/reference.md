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

## Canonical entry template

```yaml
slug: example-term
title: Example Term
shortDefinition: One paragraph from the manuscript, book-specific.
termKind: extended
relatedConcepts: []
relatedPatterns: []
relatedBooks:
  - coupling
```

## Book → BOOK_DIR

| book_id | BOOK_DIR |
|---------|----------|
| after-certainty | `books/after-certainty` |
| coupling | `books/coupling` |
| how-meaning-moves | `books/how-meaning-moves` |
| when-others-look-to-you-v1 | `books/when-others-look-to-you/v1` |

## Related skills

- **glossary-usage-audit** — where existing terms appear in the manuscript
- **semantic-enrichment** — add recognitionSignals, questions, etc. after glossary exists
