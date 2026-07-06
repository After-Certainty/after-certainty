---
name: semantic-sources
description: >-
  Extracts bibliography entries into semantic/sources YAML (works/citations),
  promotes drafts with v1.5 metadata, backfills creator fields, infers concept
  links, and opens a PR. Use for bibliography ingest, source enrichment,
  semantic manifest sources, or research references for a book.
---

# Semantic sources (works / citations)

Manage **bibliographic works** in `semantic/sources/` — books, articles, reports, standards, datasets, and institutional documents. These are **not** thinker/person nodes; people and institutions live in `semantic/thinkers/` (see **semantic-thinkers** skill).

Migration spec: [docs/semantic-thinkers-sources-migration.md](../../../docs/semantic-thinkers-sources-migration.md)

## Model (v1.5)

| Layer | Directory | Manifest | Example |
|-------|-----------|----------|---------|
| **Work** | `semantic/sources/` | `sources[]` (`source-*`) | Hannah Arendt — *Between Past and Future* |
| **Thinker** | `semantic/thinkers/` | `thinkers[]` (`thinker-*`) when present | Hannah Arendt (`hannah-arendt`) |

Legacy required fields unchanged: `slug`, `name`, `type`, `summary`, `concepts`, `patterns`, `relatedBooks`.

Optional v1.5 fields (add when promoting or backfilling):

| Field | Purpose |
|-------|---------|
| `sourceKind` | `book`, `article`, `report`, `standard`, `dataset`, `speech`, `case`, `website`, `institutional_document` |
| `creatorNames` | `["Hannah Arendt"]` |
| `creatorSlugs` | `["hannah-arendt"]` — thinker slug (`firstname-lastname`), **not** source slug prefix |
| `title` | Work title separate from author |
| `citation` | Full bibliography string (prefer over `summary` for display when set) |
| `year`, `publisher`, `institution`, `url`, `whyThisMatters` | Bibliographic / reader context |

Keep `name` as `"Author — Title"` for backward compatibility.

## 1 — Inputs

Ask if missing:

| Input | Notes |
|-------|-------|
| **Book** | `book_id` from `book.yml` |
| **Bibliography path** | e.g. `books/<id>/back-matter/bibliography.md` |
| **Task** | `extract`, `promote`, `backfill`, `infer-links`, or full pipeline |

## 2 — Extract drafts from bibliography

Supported bibliography style: bullet list (`- Author. *Title*` or `- Author. "Article."`).

```bash
make extract-semantic-source-drafts \
  BIBLIO_IN=books/<book-dir>/back-matter/bibliography.md \
  BOOK_ID=<book-id>
```

Drafts land in `semantic/_drafts/generated/sources/<book-id>/` (gitignored). Each draft may include `workTitle`.

## 3 — Promote to canonical sources

```bash
# One book
make promote-semantic-source-drafts SOURCE_PROMOTE_BOOK_IDS='<book-id>'

# All draft folders (prunes stale semantic/sources/*.yml unless SOURCE_PROMOTE_NO_PRUNE=1)
make promote-semantic-source-drafts
```

Promotion now:

- Sets `name` to `"Author — Title"`
- Preserves `title`, `creatorNames`, `creatorSlugs`, `citation`, `sourceKind` via `tools/source_metadata.py`
- Merges `relatedBooks` across duplicate slugs
- Runs prefix-chain dedupe (`dedupe_semantic_sources.py`)

Review promoted YAML against [source-entry.schema.json](../../../schema/semantic/source-entry.schema.json).

## 4 — Backfill v1.5 metadata (existing corpus)

When sources lack `creatorSlugs` / `title` / `citation`:

```bash
python3 tools/backfill_source_metadata.py --repo . --dry-run
python3 tools/backfill_source_metadata.py --repo .
```

Use `--limit N` for pilot runs; `--overwrite` only when intentionally replacing fields.

## 5 — Infer concept/pattern links

Scan manuscript markdown for co-mentions:

```bash
python3 tools/infer_semantic_source_links.py --repo . --dry-run
python3 tools/infer_semantic_source_links.py --repo . --book-id <book-id>
```

Updates `concepts`, `patterns`, and pattern `relatedSources` where heuristics match.

## 6 — Verify (required)

```bash
make verify-semantic-ontology
```

## 7 — Open PR

```bash
git checkout main && git pull
git checkout -b semantic-sources/<book-id>
git add semantic/sources books/<book-id>/semantic-reports/  # if reports added
git commit -m "feat(semantic): add/update sources for <book-id>"
git push -u origin HEAD
gh pr create --base main --title "feat(semantic): sources — <book-id>" --body "$(cat <<'EOF'
## Summary
Bibliography sources for <book-id> with v1.5 metadata where applicable.

## Verification
- [x] `make verify-semantic-ontology`

## Review
- Confirm `creatorSlugs` use thinker convention (`hannah-arendt`, not `arendt-hannah`)
- Confirm `sourceKind` fits work type (report vs book vs institutional_document)
- Confirm `relatedBooks` includes <book-id>
EOF
)"
```

## Suggested workflow

1. **semantic-sources** → extract + promote for a new book bibliography
2. **semantic-sources** → `infer-links` for co-mentions
3. **semantic-thinkers** → derive/promote thinker YAML after sources have `creatorSlugs`
4. **glossary-extract** / **semantic-enrichment** — concepts (separate from sources)

## Do not

- Put person/institution summaries in `semantic/sources/` without a work title — use `semantic/thinkers/` for thinker nodes
- Derive `creatorSlugs` from source slug prefixes (`arendt-hannah-*` ≠ `hannah-arendt`)
- Skip `make verify-semantic-ontology` before PR
- Use `--prune` on partial promotes (`SOURCE_PROMOTE_BOOK_IDS` set)

## Reference

[reference.md](reference.md) — templates, commands, `sourceKind` guide
