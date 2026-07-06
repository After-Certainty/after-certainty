# Semantic enrichment (issue #116)

Enrichment **proposes** meaning in gitignored drafts; humans **ratify** via `promote_semantic_enrichment` into canonical [`semantic/`](../../../semantic/).

## Preferred workflow: Cursor skills

| Skill | Purpose |
|-------|---------|
| **glossary-extract** | Discover and add new `semantic/glossary/` entries from a book (two-tier definitions) → PR |
| **semantic-enrichment** | Add or revise definitions, enrichment fields on existing glossary/patterns → PR |
| **semantic-sources** | Extract/promote bibliography into `semantic/sources/` (works) with v1.5 metadata → PR |
| **semantic-thinkers** | Derive/promote `semantic/thinkers/` (people/institutions) for manifest v2 → PR |
| **glossary-usage-audit** | Report where existing glossary terms appear in a manuscript → PR |

Paths: `.cursor/skills/<skill-name>/SKILL.md`

## Draft / promote workflow (optional)

1. `make propose-semantic-enrichment BOOK_DIR=books/<id> AGENT_TYPE=<type>`
2. Edit `semantic/_drafts/enrichment/<book-id>/<agent-type>/`
3. `make promote-semantic-enrichment ENRICH_BOOK_ID=<id>`
4. `make verify-semantic-ontology` → PR — [PR-CHECKLIST.md](PR-CHECKLIST.md)

## Agent briefs

| Agent | Field | Brief |
|-------|-------|-------|
| `definitions` | `shortDefinition`, `longDefinition`, `relatedConcepts` | [08-concept-definitions.md](08-concept-definitions.md) |
| `recognition-signals` | `recognitionSignals` | [01-recognition-signals.md](01-recognition-signals.md) |
| `trajectories` | `trajectory` | [02-trajectories.md](02-trajectories.md) |
| `manifestations` | `manifestations` | [03-domain-manifestations.md](03-domain-manifestations.md) |
| `counterbalances` | `counterbalances` | [04-counterbalances.md](04-counterbalances.md) |
| `questions` | `questions` | [05-reflective-questions.md](05-reflective-questions.md) |
| `ontology-lint` | (report only) | [06-ontology-lint.md](06-ontology-lint.md) |
| `discovery` | (report only) | [07-discovery.md](07-discovery.md) |

**Phase 3 CI (optional):** **Actions → Semantic enrichment agent** (`workflow_dispatch`) scaffolds empty drafts only—prefer the Cursor skill for book-grounded content. See [`docs/semantic-graph-evolution.md`](../../semantic-graph-evolution.md).
