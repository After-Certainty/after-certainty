# Glossary usage audit reference

## Command

```bash
make scan-book-glossary-usage BOOK_DIR=books/coupling [GLOSSARY_SCOPE=all]
```

Or:

```bash
python3 tools/scan_book_glossary_usage.py --book-dir books/coupling --scope book \
  --out books/coupling/semantic-reports/glossary-usage.md
```

| Flag | Meaning |
|------|---------|
| `--scope book` | Terms with empty `relatedBooks` or including this book |
| `--scope all` | Every `semantic/glossary/*.yml` entry |

## Book → BOOK_DIR

| book_id | BOOK_DIR |
|---------|----------|
| after-certainty | `books/after-certainty` |
| coupling | `books/coupling` |
| how-meaning-moves | `books/how-meaning-moves` |
| when-others-look-to-you-v1 | `books/when-others-look-to-you/v1` |
| when-others-look-to-you-v2 | `books/when-others-look-to-you/v2` |

Discover others: `rg '^  id:' books/*/book.yml books/*/*/book.yml`

## Report path

`books/<book-id>/semantic-reports/glossary-usage.md`
