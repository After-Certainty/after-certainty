# Semantic graph evolution

Architecture and workflow for [issue #116](https://github.com/ksteffe/after-certainty/issues/116): evolving the semantic graph from static adjacency toward situational recognition and systemic dynamics.

## Principles

- **YAML is canonical** — [`semantic/`](../semantic/) is the authoritative layer.
- **Agents propose; humans ratify** — enrichment writes to `semantic/_drafts/enrichment/` (gitignored); merge into canonical YAML via review.
- **Manifest is derived** — [`tools/generate_semantic_manifest.py`](../tools/generate_semantic_manifest.py) produces `semantic-manifest.json` for the website and CI.

## Entity model

| Directory | Entity | Manifest ID prefix |
|-----------|--------|-------------------|
| `semantic/glossary/` | Concepts (terms) | `concept-` |
| `semantic/patterns/` | Recurring dynamics | `pattern-` |
| `semantic/sources/` | Thinkers / references | `source-` |
| `semantic/situations/` | Human-oriented entry points | `situation-` |
| `semantic/ontology/` | Core/supporting term registry | (feeds glossary) |
| `semantic/relationships.yml` | Explicit edges | `relationships[]` |

## Dynamic enrichment fields (optional)

Shared optional blocks on concepts, patterns, and situations:

| Field | Purpose |
|-------|---------|
| `recognitionSignals` | Observable signs in real settings |
| `questions` | Reflective prompts for readers |
| `counterbalances` | Restorative forces (anti-fatalism) |
| `manifestations` | Domain-specific examples (software, leadership, …) |
| `trajectory` | `earlySignals`, `intensificationSignals`, `failureModes`, `restorationPaths` |

Schemas: [`schema/semantic/`](../schema/semantic/). Validation: `make validate-semantic-entities`.

## Commands

```bash
make validate-semantic-entities   # JSON Schema + reference integrity
make verify-semantic-yaml         # parse, slug/filename, prose audit
make lint-semantic-graph          # warnings (LINT_STRICT=1 to fail)
make verify-semantic-ontology     # all of the above + manifest round-trip
```

### Enrichment workflow (Phase 2)

Drafts are gitignored under `semantic/_drafts/enrichment/<book-id>/<agent-type>/`.

```bash
make propose-semantic-enrichment BOOK_DIR=books/coupling AGENT_TYPE=recognition-signals
# edit drafts locally
make promote-semantic-enrichment BOOK_ID=coupling FIELD=recognitionSignals
make verify-semantic-ontology
```

Agent briefs and PR checklist: [`docs/agents/semantic/`](agents/semantic/).

### CI agent dispatch (Phase 3)

In GitHub: **Actions → Semantic enrichment agent → Run workflow**.

Inputs: `book_id` (e.g. `coupling`), `agent_type` (`recognition-signals`, `trajectories`, …, `ontology-lint`, `discovery`).

The workflow scaffolds `semantic/_drafts/enrichment/` (force-added on the PR branch), runs `verify-semantic-ontology`, and opens a review PR. Humans fill drafts, then `make promote-semantic-enrichment` on a follow-up branch.

## Branch conventions (issue #116)

| Work | Branch |
|------|--------|
| Phase 1 infrastructure | `issue-116/semantic-phase-1-schema` |
| Phase 2 enrichment tooling | `issue-116/semantic-phase-2-enrichment` |
| Phase 3 scheduled agents | `issue-116/semantic-phase-3-ci-agents` |
| Agent proposals | `semantic-agent/<type>-<book-or-scope>` |

## Phases

- **Phase 1:** schemas, validation, lint, situations in manifest, pilot YAML (merged).
- **Phase 2:** [`tools/propose_semantic_enrichment.py`](../tools/propose_semantic_enrichment.py), [`tools/promote_semantic_enrichment.py`](../tools/promote_semantic_enrichment.py), agent briefs under [`docs/agents/semantic/`](agents/semantic/).
- **Phase 3:** [`.github/workflows/semantic-enrichment.yml`](../.github/workflows/semantic-enrichment.yml) — `workflow_dispatch` runs [`tools/run_semantic_enrichment_ci.py`](../tools/run_semantic_enrichment_ci.py) to commit gitignored drafts and open a `semantic-agent/*` PR (no auto-merge).
- **Phase 4:** Website UX for situations and trajectories (external to this manuscript repo).

## Pilot content

- Pattern: [`semantic/patterns/exceptions-are-forever.yml`](../semantic/patterns/exceptions-are-forever.yml) — enrichment fields exemplar.
- Situation: [`semantic/situations/temporary-fixes-become-permanent.yml`](../semantic/situations/temporary-fixes-become-permanent.yml).
