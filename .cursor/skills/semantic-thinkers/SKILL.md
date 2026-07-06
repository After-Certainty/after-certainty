---
name: semantic-thinkers
description: >-
  Derives and maintains semantic/thinkers YAML (people and institutions),
  aggregates works from enriched sources, validates manifest v2 thinkers[],
  and opens a PR. Use for thinker nodes, core interlocutors, or grouping
  bibliography by author after source metadata is enriched.
---

# Semantic thinkers (people / institutions)

Manage **thinker nodes** in `semantic/thinkers/` — people and organizations that the portfolio treats as intellectual interlocutors. Works remain in `semantic/sources/`; thinkers aggregate `works[]` and cross-link concepts, patterns, and books.

Requires sources with `creatorSlugs` (run **semantic-sources** backfill/promote first).

Migration spec: [docs/semantic-thinkers-sources-migration.md](../../../docs/semantic-thinkers-sources-migration.md)

## Model (v2)

| Field | Required | Notes |
|-------|----------|-------|
| `slug` | yes | `hannah-arendt`, `world-bank` |
| `name` | yes | Display name |
| `type` | yes | `person` or `organization` |
| `summary` | yes | Reader-facing bio / role |
| `concepts`, `patterns`, `relatedBooks` | yes | Slugs (YAML); manifest uses prefixed ids |
| `works` | yes | Source slugs referencing `semantic/sources/` |
| `whyThisMatters` | optional | Portfolio relevance |

Manifest: `id` = `thinker-{slug}`; emitted when `semantic/thinkers/*.yml` is non-empty → `manifestVersion: 2`.

## 1 — Prerequisite

Sources should have `creatorSlugs` populated:

```bash
python3 tools/backfill_source_metadata.py --repo . --dry-run
```

Or ensure recent `promote-semantic-source-drafts` ran (v1.5 metadata preserved).

## 2 — Derive drafts (review first)

```bash
python3 tools/derive_thinker_drafts.py --repo . --dry-run
python3 tools/derive_thinker_drafts.py --repo .
```

Writes `semantic/_drafts/generated/thinkers/<slug>.yml` with aggregated `works`, `relatedBooks`, `concepts`, `patterns`. **Edit summaries and `whyThisMatters` before promoting.**

## 3 — Promote to canonical thinkers

Copy reviewed drafts to `semantic/thinkers/<slug>.yml` matching [thinker-entry.schema.json](../../../schema/semantic/thinker-entry.schema.json).

**Pilot or batch promotion (recommended):**

```bash
make derive-thinker-drafts
# edit semantic/thinkers-pilot-overrides.yml or semantic/thinkers-batch-2-overrides.yml
make promote-thinker-drafts THINKER_PROMOTE_PILOT_ONLY=1
# batch 2+:
make promote-thinker-drafts THINKER_PROMOTE_OVERRIDES=semantic/thinkers-batch-2-overrides.yml THINKER_PROMOTE_PILOT_ONLY=1
make promote-thinker-drafts THINKER_PROMOTE_OVERRIDES=semantic/thinkers-batch-3-overrides.yml THINKER_PROMOTE_PILOT_ONLY=1
```

Or promote individual slugs:

```bash
python3 tools/promote_thinker_drafts.py --repo . --slug hannah-arendt --slug karl-e-weick
```

For each thinker:

- Replace draft placeholder `summary` with portfolio-grounded prose
- Add `whyThisMatters` when it helps book/site copy
- Set `type: organization` for World Bank, ISO, government bodies, etc.
- Ensure every `works` slug exists in `semantic/sources/`

## 4 — Verify (required)

```bash
make verify-semantic-ontology
```

Confirm manifest round-trip: when thinkers exist, `manifestVersion` should be `2` and `thinkers[]` present.

```bash
python3 tools/generate_semantic_manifest.py --repo . --out /tmp/semantic-manifest.json --no-warn-term-kind
jq '.manifestVersion, (.thinkers | length)' /tmp/semantic-manifest.json
```

## 5 — Open PR

```bash
git checkout main && git pull
git checkout -b semantic-thinkers/<scope>
git add semantic/thinkers
git commit -m "feat(semantic): add thinkers for <scope>"
git push -u origin HEAD
gh pr create --base main --title "feat(semantic): thinkers — <scope>" --body "$(cat <<'EOF'
## Summary
Canonical thinker nodes under `semantic/thinkers/` (manifest v2 when non-empty).

## Verification
- [x] `make verify-semantic-ontology`
- [x] Manifest `manifestVersion: 2` with `thinkers[]` when thinkers added

## Review
- Summaries are reader-facing, not auto-draft placeholders
- `works` lists match enriched sources
- Site issues #39–#45 can consume `creatorSlugs` / `thinkers[]` when deployed
EOF
)"
```

## Site coordination

After thinkers ship in the manifest:

1. Site **#39** — parse optional source v1.5 fields
2. Site **#40–#41** — derived vs canonical thinkers
3. Site **#42** — `/explore/thinkers` pages
4. Refresh bundled manifest on site (**refresh-manifest** skill in after-certainty-site)

## Do not

- Create thinker YAML without corresponding `semantic/sources/` works
- Use source slug prefixes as thinker slugs
- Ship auto-generated placeholder summaries without editorial pass
- Remove or rename `sources[]` — thinkers are additive

## Reference

[reference.md](reference.md) — template, organization vs person guide
