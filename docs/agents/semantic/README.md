# Semantic enrichment (issue #116)

Enrichment **proposes** meaning in gitignored drafts; humans **ratify** via `promote_semantic_enrichment` into canonical [`semantic/`](../../../semantic/).

## Preferred workflow: Cursor skill

Use the project skill **semantic-enrichment** (`.cursor/skills/semantic-enrichment/SKILL.md`). It prompts for **book** + **enrichment type** (`all` = all five fields), edits canonical `semantic/` YAML from the manuscript, runs `make verify-semantic-ontology`, and opens a PR for review.

## Draft / promote workflow (optional)

1. `make propose-semantic-enrichment BOOK_DIR=books/<id> AGENT_TYPE=<type>`
2. Edit `semantic/_drafts/enrichment/<book-id>/<agent-type>/`
3. `make promote-semantic-enrichment ENRICH_BOOK_ID=<id>`
4. `make verify-semantic-ontology` → PR — [PR-CHECKLIST.md](PR-CHECKLIST.md)

## Agent briefs

| Agent | Field | Brief |
|-------|-------|-------|
| `recognition-signals` | `recognitionSignals` | [01-recognition-signals.md](01-recognition-signals.md) |
| `trajectories` | `trajectory` | [02-trajectories.md](02-trajectories.md) |
| `manifestations` | `manifestations` | [03-domain-manifestations.md](03-domain-manifestations.md) |
| `counterbalances` | `counterbalances` | [04-counterbalances.md](04-counterbalances.md) |
| `questions` | `questions` | [05-reflective-questions.md](05-reflective-questions.md) |
| `ontology-lint` | (report only) | [06-ontology-lint.md](06-ontology-lint.md) |
| `discovery` | (report only) | [07-discovery.md](07-discovery.md) |

**Phase 3 CI (optional):** **Actions → Semantic enrichment agent** (`workflow_dispatch`) scaffolds empty drafts only—prefer the Cursor skill for book-grounded content. See [`docs/semantic-graph-evolution.md`](../../semantic-graph-evolution.md).
