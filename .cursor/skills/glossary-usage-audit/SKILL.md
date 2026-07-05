---
name: glossary-usage-audit
description: >-
  Scans a book manuscript for where existing semantic glossary terms appear,
  writes a usage report, and opens a PR for review. Use when auditing glossary
  coverage in a book, finding term usage, or mapping manuscript to semantic graph.
---

# Glossary usage audit

Maps **existing** `semantic/glossary/` terms to occurrences in a book manuscript. Output is a markdown report in a PR (no canonical YAML changes unless the user asks).

## 1 — Book

Ask for **book** (`book_id` or `BOOK_DIR`) if missing. Map id → directory (see [reference.md](reference.md)).

Optional: **scope** — `book` (default: `relatedBooks` empty or includes this book) or `all` (entire glossary).

## 2 — Generate report

```bash
python3 tools/scan_book_glossary_usage.py \
  --repo . \
  --book-dir <BOOK_DIR> \
  --scope book \
  --out books/<book-id>/semantic-reports/glossary-usage.md
```

Read the report. Summarize for the user: top terms by hit count, important terms with zero hits, surprises.

## 3 — Open PR

```bash
git checkout main && git pull
git checkout -b semantic-reports/<book-id>-glossary-usage
git add books/<book-id>/semantic-reports/glossary-usage.md
git commit -m "docs(semantic): glossary usage report for <book-id>"
git push -u origin HEAD
gh pr create --base main --title "docs(semantic): glossary usage — <book-id>" --body "$(cat <<'EOF'
## Summary
Manuscript scan of existing semantic glossary term usage for <book-id>.

## Report
`books/<book-id>/semantic-reports/glossary-usage.md`

## How to regenerate
```bash
python3 tools/scan_book_glossary_usage.py --book-dir <BOOK_DIR> --out books/<book-id>/semantic-reports/glossary-usage.md
```
EOF
)"
```

Return the PR URL.

## Follow-ups (when the report surfaces gaps)

| Finding | Skill |
|---------|-------|
| Term used heavily but definition is thin or book-only in `shortDefinition` | **semantic-enrichment** → `definitions` |
| Term in manuscript but missing from glossary | **glossary-extract** |
| Near-overlap with another slug (usage suggests wrong sense) | **semantic-enrichment** → `definitions` + disambiguation — see [08-concept-definitions.md](../../../docs/agents/semantic/08-concept-definitions.md) |

## Do not

- Invent glossary entries (use **glossary-extract** skill for new terms)
- Change `semantic/glossary/*.yml` in this workflow unless the user explicitly asks

## Reference

[reference.md](reference.md)
