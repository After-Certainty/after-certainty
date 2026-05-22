# Discovery / interestingness agent

**Agent type:** `discovery` (report-only)

## Task

Surface **emergent structure** in the graph for human review:

- Underlinked high-centrality concepts
- Recurring motifs across book manuscripts (co-mention heuristics via `make infer-semantic-source-links --dry-run`)
- Candidate situation entry points (clusters of active patterns)

## Output

Markdown report under `semantic/_drafts/enrichment/<scope>/lint-reports/discovery-<date>.md` with suggested slugs and rationale.

## Do not

- Auto-create canonical situations or relationships without human review.
