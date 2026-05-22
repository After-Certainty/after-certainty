---
name: glossary-extract
description: >-
  Discovers new glossary term candidates from a book (manuscript glossary,
  prose patterns, ontology gaps), adds semantic/glossary YAML, verifies, and
  opens a PR. Use when extracting glossary terms from a book or expanding the
  semantic graph for a manuscript.
---

# Glossary extract

Find **new** glossary candidates for a book and add approved entries to `semantic/glossary/*.yml` in a PR.

## 1 — Book

Ask for **book** (`book_id` / `BOOK_DIR`) if missing. See [reference.md](reference.md).

## 2 — Discover candidates

```bash
python3 tools/discover_book_glossary_candidates.py \
  --repo . \
  --book-dir <BOOK_DIR> \
  --write-drafts \
  --out books/<book-id>/semantic-reports/glossary-candidates.md
```

Review the report sections:

- **From manuscript glossary file** — parsed `glossary.md` / `back-matter/glossary.md` entries marked **new**
- **From prose** — `**Term** —` patterns in `parts/` not yet in glossary
- **Ontology terms without glossary overlay** — create `semantic/glossary/<slug>.yml` with matching `termKind`

Draft YAML (gitignored): `semantic/_drafts/generated/glossary/<book-id>/`

## 3 — Add canonical entries

For each **approved** new term (user may narrow the list):

1. Create or promote `semantic/glossary/<slug>.yml` matching [glossary-entry.schema.json](../../../schema/semantic/glossary-entry.schema.json).
2. Required fields: `slug`, `title`, `shortDefinition`, `termKind`, `relatedConcepts`, `relatedPatterns`, `relatedBooks` (include this `book_id`).
3. Set `termKind` from ontology when slug matches (`core` / `supporting`); else `extended`.
4. Prefer `shortDefinition` from manuscript; trim to ~600 chars. Optional `longDefinition` only if clearly useful.
5. Do **not** duplicate an existing slug. Do **not** add enrichment fields unless the user asks (use **semantic-enrichment** after).

Copy from drafts when present; otherwise write from manuscript source.

## 4 — Verify (required)

```bash
make verify-semantic-ontology
```

Fix failures before committing.

## 5 — Open PR

```bash
git checkout main && git pull
git checkout -b semantic-glossary/<book-id>-extract
git add semantic/glossary books/<book-id>/semantic-reports/glossary-candidates.md
git commit -m "feat(semantic): add glossary entries for <book-id>"
git push -u origin HEAD
gh pr create --base main --title "feat(semantic): glossary extract — <book-id>" --body "$(cat <<'EOF'
## Summary
New glossary entries for <book-id> from manuscript / discovery report.

## Report
`books/<book-id>/semantic-reports/glossary-candidates.md`

## Verification
- [x] `make verify-semantic-ontology`

## Review
- Confirm slugs match manuscript intent
- Confirm `relatedBooks` includes <book-id>
EOF
)"
```

Return the PR URL.

## Manuscript glossary only (no new canonical yet)

If the user only wants drafts from an existing `glossary.md`:

```bash
make extract-semantic-glossary-drafts GLOSSARY_IN=<path> BOOK_ID=<book-id>
```

Then review under `semantic/_drafts/generated/glossary/<book-id>/` before step 3.

## Do not

- Skip `make verify-semantic-ontology` before the PR
- Add terms the report marks **exists** without user intent to update
- Use generic placeholder definitions

## Reference

[reference.md](reference.md)
