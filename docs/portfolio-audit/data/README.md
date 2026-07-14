# Audit data artifacts

Local snapshots for [portfolio audit #99](https://github.com/ksteffe/after-certainty/issues/99). These JSON files are **gitignored**—regenerate them when needed; do not commit.

| File | Command |
|------|---------|
| `books-manifest.json` | `make generate-books-manifest MANIFEST_OUT=docs/portfolio-audit/data/books-manifest.json` |
| `semantic-manifest.json` | `make generate-semantic-manifest SEMANTIC_MANIFEST_OUT=docs/portfolio-audit/data/semantic-manifest.json` |

Regenerate after `book.yml` or `semantic/` changes.
