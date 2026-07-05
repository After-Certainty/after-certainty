---
name: glossary-extract
description: >-
  Discovers new glossary term candidates from a book (manuscript glossary,
  prose patterns, ontology gaps), adds semantic/glossary YAML with two-tier
  definitions where warranted, verifies, and opens a PR. Use when extracting
  glossary terms from a book or expanding the semantic graph for a manuscript.
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

### Disambiguation check (before adding slugs)

Search existing glossary for near-overlaps:

```bash
rg -l '<term-keyword>' semantic/glossary/
```

- Prefer an **existing slug** when the sense matches portfolio usage
- For plural/singular or book-specific variants (`constraint` / `constraints`), create a **distinct slug** only when the sense differs — see [08-concept-definitions.md](../../../docs/agents/semantic/08-concept-definitions.md)
- Note candidate pairs in the PR body for reviewer attention

## 3 — Add canonical entries

For each **approved** new term (user may narrow the list):

1. Create or promote `semantic/glossary/<slug>.yml` matching [glossary-entry.schema.json](../../../schema/semantic/glossary-entry.schema.json).
2. Required fields: `slug`, `title`, `shortDefinition`, `termKind`, `relatedConcepts`, `relatedPatterns`, `relatedBooks` (include this `book_id`).
3. Set `termKind` from ontology when slug matches (`core` / `supporting`); else `extended`.
4. Write definitions using the **two-tier model** — full brief: [08-concept-definitions.md](../../../docs/agents/semantic/08-concept-definitions.md):

   | Field | When to write | Target |
   |-------|---------------|--------|
   | `shortDefinition` | Always | 30–70 words; index-safe; general first |
   | `longDefinition` | Hub terms, disambiguation pairs, or cross-book reuse | 40–140 words; contrasts + book application |

5. Wire **`relatedConcepts`** to 2–5 nearby slugs when the term is a hub or part of a disambiguation pair.
6. Do **not** duplicate an existing slug.
7. Do **not** add `recognitionSignals` / `trajectory` / etc. unless the user asks — use **semantic-enrichment** after definitions exist.

Copy from drafts when present; otherwise write from manuscript source. Prefer manuscript wording for book-specific color; generalize the opening sentence when the term will appear on the portfolio concepts index.

### Definition quality (extract pass)

- General definition before domain example ("In this book…" belongs in `longDefinition` when needed)
- One contrast with a nearby concept when overlap is likely
- After Certainty voice — not dictionary, not template-identical across terms
- Quote or block-scalar `longDefinition` when the text contains `: ` (YAML parse trap)

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

## Definitions
- Two-tier model where warranted (`shortDefinition` + optional `longDefinition`)
- Disambiguation pairs noted: <!-- list any near-overlap slugs -->

## Verification
- [x] `make verify-semantic-ontology`

## Review
- Confirm slugs match manuscript intent
- Confirm `relatedBooks` includes <book-id>
- Confirm hub terms have `relatedConcepts` and readable index cards
EOF
)"
```

Return the PR URL.

## After extract (suggested follow-ups)

| Next step | Skill / type |
|-----------|----------------|
| Revise definitions for book-scoped terms already in glossary | **semantic-enrichment** → `definitions` |
| Add recognition signals, trajectories, etc. | **semantic-enrichment** → `recognition-signals`, `all`, … |
| Report where terms appear in manuscript | **glossary-usage-audit** |

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
- Put book-only domain framing entirely in `shortDefinition` when a general lead is possible
- Duplicate `shortDefinition` text in `longDefinition`

## Reference

[reference.md](reference.md) — templates, commands, book ids

[08-concept-definitions.md](../../../docs/agents/semantic/08-concept-definitions.md) — definition brief
