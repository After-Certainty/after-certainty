# Ontology linter agent

**Agent type:** `ontology-lint` (report-only; no canonical field)

## Task

Run `make lint-semantic-graph` (optionally `LINT_STRICT=1`) and summarize warnings for human triage:

- Over-connected nodes
- Ontology core terms missing glossary overlays
- Weak or low-information entities

## Output

Write reports under `semantic/_drafts/enrichment/<book-id>/lint-reports/` (markdown or JSON). **Do not** promote lint output into canonical YAML.

## PR

Attach the report in the PR body; link proposed fixes to separate enrichment PRs if edits are needed.
