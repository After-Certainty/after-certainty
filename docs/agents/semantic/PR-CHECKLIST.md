# Semantic enrichment PR checklist

Use for PRs from `semantic-agent/*` or human `issue-116/semantic-pilot-enrich-*` branches.

- [ ] Changes are limited to `semantic/_drafts/enrichment/` **or** canonical YAML after explicit `make promote-semantic-enrichment` (no hand-edits that bypass promote).
- [ ] `make validate-semantic-entities` passes (`--strict-refs`).
- [ ] `make verify-semantic-yaml` passes.
- [ ] `make lint-semantic-graph` reviewed (warnings documented in PR if new).
- [ ] `make verify-semantic-manifest` passes.
- [ ] Draft sidecars include `targetSlug`, `entityType`, `field`, `proposedBy`, `bookId`, and non-empty `items` before promote.
- [ ] Enrichment is **book-scoped** (`relatedBooks` respected); no orphan slugs.
- [ ] PR title/body links [issue #116](https://github.com/After-Certainty/after-certainty/issues/116).
