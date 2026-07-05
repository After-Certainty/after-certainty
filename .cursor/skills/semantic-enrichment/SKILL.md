---
name: semantic-enrichment
description: >-
  Enriches book-scoped semantic graph YAML from manuscript prose—definitions,
  recognition signals, trajectories, and related fields—runs verify-semantic-ontology,
  and opens a PR. Use when enriching semantic/glossary or patterns, semantic
  enrichment, issue #116, or when the user wants enrichment types (including all)
  for a book.
---

# Semantic enrichment

End-to-end workflow: **edit canonical YAML → verify → open PR**. No draft/propose/promote steps. The user reviews the diff in GitHub.

## 1 — Inputs

Ask if missing:

| Input | Values |
|-------|--------|
| **Book** | `book_id` from `book.yml` (e.g. `coupling`, `after-certainty`) |
| **Enrichment type** | `definitions`, `recognition-signals`, `trajectories`, `manifestations`, `counterbalances`, `questions`, or **`all`** |

Map `book_id` → `BOOK_DIR` (see [reference.md](reference.md)). Accept synonyms (`signals` → `recognition-signals`, `defs` → `definitions`, etc.).

**Not in `all`:** `ontology-lint` / `discovery` → markdown report in the PR description only; do not change canonical enrichment fields.

## 2 — Scope

Entities in scope: `semantic/glossary/`, `semantic/patterns/`, `semantic/situations/` where `relatedBooks` is empty or includes this `book_id`.

List them:

```bash
python3 -c "
from pathlib import Path
import sys
sys.path.insert(0,'tools')
from semantic_enrichment import list_book_entities
for et, slug, path in list_book_entities(Path('.'), '<book_id>'):
    print(et, slug, path)
"
```

Only edit files returned. Do not invent slugs.

## 3 — Enrich canonical YAML

Edit `semantic/glossary/<slug>.yml`, `semantic/patterns/<slug>.yml`, or `semantic/situations/<slug>.yml` **in place**. Touch only the field(s) for the chosen type:

| Type | YAML field(s) |
|------|---------------|
| `definitions` | `shortDefinition`, `longDefinition`, `relatedConcepts` |
| `recognition-signals` | `recognitionSignals` |
| `trajectories` | `trajectory` (`earlySignals`, `intensificationSignals`, `failureModes`, `restorationPaths`) |
| `manifestations` | `manifestations` |
| `counterbalances` | `counterbalances` |
| `questions` | `questions` |
| `all` | definitions + all five enrichment fields above |

**Do not** use `semantic/_drafts/enrichment/` for this workflow.

### Read sources

1. Canonical entity (`shortDefinition`, `longDefinition`, `relatedConcepts`, existing enrichment).
2. Manuscript under `<BOOK_DIR>/` — grep term/slug; read vignettes and pattern appendix.
3. Nearby concepts in `semantic/glossary/` for disambiguation and `relatedConcepts` wiring.

### Quality bar — definitions (`definitions` type or `all`)

Follow [08-concept-definitions.md](../../../docs/agents/semantic/08-concept-definitions.md):

- **Two-tier model:** concise `shortDefinition` (index); optional `longDefinition` (detail via manifest `definition`)
- **General first, book second** when the term is reused across the portfolio
- **Hub terms:** both tiers + 2–5 `relatedConcepts`; wire disambiguation pairs bidirectionally
- **Do not duplicate** `shortDefinition` in `longDefinition`
- **YAML:** use `>-` block scalar when `longDefinition` contains `: `
- Preserve existing enrichment blocks unless the user asks to rewrite them

### Quality bar — other types

Follow the matching brief in [docs/agents/semantic/](../../../docs/agents/semantic/):

- **Book-grounded** prose from *this* manuscript — no generic templates.
- **Falsifiable** recognition signals; **3–6** list items when possible; **2–4** bullets per trajectory phase.
- Do not duplicate pattern `observation` verbatim.
- **Manifestations:** domains the book supports (`leadership`, `organizations`, `politics`, `family`, …).

**After Certainty + `all`:** you may run `python3 tools/apply_after_certainty_book_enrichment.py` for recognition/trajectory fields, then still hand-edit **definitions** and gaps from the manuscript.

## 4 — Verify (required before PR)

```bash
make verify-semantic-ontology
```

Fix all failures. Re-run until clean. Do not open a PR if this fails.

## 5 — Open PR

```bash
git checkout main && git pull
git checkout -b semantic-enrichment/<book-id>-<type>
git add semantic/glossary semantic/patterns semantic/situations semantic/relationships.yml
git commit -m "feat(semantic): enrich <book-id> <type>"
git push -u origin HEAD
gh pr create --base main --title "feat(semantic): enrich <book-id> (<type>)" --body "$(cat <<'EOF'
## Summary
Book-grounded enrichment for <book-id> — <type> (canonical semantic YAML).

## Verification
- [x] `make verify-semantic-ontology`

## Review
Diff is the review surface — check enrichment against manuscript scenes, not templates.

Closes / relates to #116
EOF
)"
```

Return the PR URL to the user.

## Suggested book workflow

1. **glossary-extract** — new slugs + initial two-tier definitions
2. **semantic-enrichment** → `definitions` — revise book-scoped terms, disambiguation, `relatedConcepts`
3. **semantic-enrichment** → `recognition-signals` / `all` — signals, trajectories, manifestations

## Do not

- Commit without passing `make verify-semantic-ontology`
- Edit entities outside book scope
- Push to `main` directly
- Use propose/promote unless the user explicitly asks for the draft workflow
- Rewrite `recognitionSignals` / `trajectory` when the user asked only for `definitions`

## Reference

[reference.md](reference.md) — book ids, field mapping, entity listing

[08-concept-definitions.md](../../../docs/agents/semantic/08-concept-definitions.md) — definition brief
