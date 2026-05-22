# Semantic enrichment agents (issue #116)

Agents **propose** meaning in gitignored drafts; humans **ratify** via `promote_semantic_enrichment` into canonical [`semantic/`](../../../semantic/).

## Workflow

1. Branch: `semantic-agent/<agent-type>-<book-or-scope>` from updated `main`.
2. Scaffold drafts: `make propose-semantic-enrichment BOOK_DIR=books/<id> AGENT_TYPE=<type>`.
3. Edit YAML under `semantic/_drafts/enrichment/<book-id>/<agent-type>/`.
4. Promote: `make promote-semantic-enrichment BOOK_ID=<id>`.
5. Verify: `make verify-semantic-ontology`.
6. Open PR — use [PR-CHECKLIST.md](PR-CHECKLIST.md).

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

**Phase 3 CI:** run **Actions → Semantic enrichment agent** (`workflow_dispatch`) with `book_id` + `agent_type`. That opens a `semantic-agent/<type>-<book>-<run>` PR with draft scaffolds or lint reports—see [`docs/semantic-graph-evolution.md`](../../semantic-graph-evolution.md).
