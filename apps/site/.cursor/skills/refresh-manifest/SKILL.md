---
name: refresh-manifest
description: >-
  Pull the latest semantic-manifest.json from the after-certainty content
  repository release and update the bundled fallback. Use when manifest
  changes are deployed upstream and need to be synced to the site repo.
---

# Refresh Semantic Manifest

## Purpose

Sync the bundled [`data/semantic-manifest.json`](../../data/semantic-manifest.json)
with the latest release from `ksteffe/after-certainty`.

Upstream schema and rollout are documented in
[semantic-thinkers-sources-migration.md](https://github.com/ksteffe/after-certainty/blob/main/docs/semantic-thinkers-sources-migration.md)
(landed in [after-certainty#252](https://github.com/ksteffe/after-certainty/pull/252)).

## Prerequisites

- GitHub CLI (`gh`) authenticated
- Write access to the site repo
- Node dependencies installed (`npm ci`)

## When to use this skill

Use when:

- The user asks to "refresh the manifest" or "pull latest semantic manifest"
- Upstream content changes have been published to the after-certainty repo
- You need to sync the bundled fallback with production data
- Enriched sources (`creatorSlugs`) or manifest v2 `thinkers[]` have shipped upstream

## Manifest versions (what to expect)

| Version | `manifestVersion` | `thinkers[]` | Typical upstream state                                                                                                       |
| ------- | ----------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Legacy  | `1` or absent     | absent       | Pre-enrichment sources                                                                                                       |
| v1.5    | `1`               | absent       | Enriched `sources[]` with optional `creatorSlugs`, `sourceKind`, `citation`, etc. Site derives thinkers from `creatorSlugs`. |
| v2      | `2`               | present      | Canonical thinker YAML under `semantic/thinkers/`; site prefers `graph.thinkers` over derived groupings.                     |

Optional v1.5 source fields the site consumes: `sourceKind`, `creatorNames`, `creatorSlugs`, `title`, `citation`, `year`, `publisher`, `institution`, `url`, `whyThisMatters`. Legacy `name`, `type`, and `summary` remain required fallbacks.

## Steps

### 1. Fetch latest release asset

```bash
gh release download latest \
  --repo ksteffe/after-certainty \
  --pattern "semantic-manifest.json" \
  --dir /tmp \
  --clobber
```

If this fails, check:

- GitHub CLI authentication (`gh auth status`)
- Repository exists and is accessible
- Release `latest` exists with the manifest asset

### 2. Validate the downloaded manifest

```bash
jq empty /tmp/semantic-manifest.json
```

If invalid JSON, stop and report — check the release manually on GitHub.

### 3. Compare manifest metadata and graph counts

Capture baseline from the bundled file, then compare against the download:

```bash
manifest_stats() {
  jq '{
    manifestVersion: (.manifestVersion // 1),
    generatedAt,
    sources: (.sources | length),
    enrichedSources: ([.sources[]? | select((.creatorSlugs // []) | length) > 0)] | length),
    thinkers: ((.thinkers // []) | length),
    relationships: (.relationships | length),
    concepts: (.glossary | length),
    patterns: (.patterns | length),
    books: (.books | length)
  }' "$1"
}

echo "=== Bundled (current) ==="
manifest_stats data/semantic-manifest.json
echo "=== Upstream (latest release) ==="
manifest_stats /tmp/semantic-manifest.json
```

**Sanity checks before replacing:**

- `manifestVersion` should be `1` or `2` (not a higher unexpected value).
- If the site already ships enriched UI, `enrichedSources` should not drop to zero unless upstream intentionally reverted enrichment.
- When upstream adds `semantic/thinkers/` YAML, expect `manifestVersion: 2` and `thinkers > 0`.
- `generatedAt` on the download should generally be newer than the bundled copy.

Optionally diff relationship predicates:

```bash
jq -r '.relationships[].relationship' /tmp/semantic-manifest.json | sort -u > /tmp/new-types.txt
jq -r '.relationships[].relationship' data/semantic-manifest.json | sort -u > /tmp/old-types.txt
comm -13 /tmp/old-types.txt /tmp/new-types.txt
```

### 4. Validate against site Zod schema (required)

Run manifest tests **before** committing. This catches upstream fields the site schema does not yet accept:

```bash
cp /tmp/semantic-manifest.json data/semantic-manifest.json
npm test -- lib/graph/manifest.test.ts
```

If tests fail:

- Read the Zod error output — it names the failing path (e.g. `sources[12].url`, `thinkers[0].type`).
- Compare the offending entry in `/tmp/semantic-manifest.json` with [`lib/graph/schemas.ts`](../../lib/graph/schemas.ts).
- If upstream added a valid field the site should accept, extend the schema and add a test in [`lib/graph/manifest.test.ts`](../../lib/graph/manifest.test.ts) in a separate PR — do not commit a bundled manifest that fails validation.
- If upstream data is malformed, stop and report to the content repo; restore the previous bundled file if you already copied.

### 5. Commit and push

Only after step 4 passes:

```bash
git add data/semantic-manifest.json
git commit -m "Update semantic manifest from upstream release

- manifestVersion: [OLD] → [NEW]
- Enriched sources: [OLD] → [NEW]
- Thinkers: [OLD] → [NEW]
- Relationships: [OLD] → [NEW]
- Source: ksteffe/after-certainty@latest"
git push -u origin $(git branch --show-current)
```

Use a feature branch named `cursor/refresh-manifest-76be` (or similar) — do not commit directly to `main`.

## Output template

Report to the user:

```markdown
✅ Semantic manifest updated successfully

**Manifest:**

- manifestVersion: [OLD] → [NEW]
- generatedAt: [OLD] → [NEW]

**Graph counts:**

- Sources: [OLD] → [NEW] (enriched with creatorSlugs: [OLD] → [NEW])
- Thinkers: [OLD] → [NEW]
- Relationships: [OLD] → [NEW] ([+/-N])

**New relationship types (if any):**

- [list any new predicates]

**Tests:** `npm test -- lib/graph/manifest.test.ts` — passed

**Commit:** [SHA]

**Next steps:**

1. Spot-check `/explore/sources`, `/explore/thinkers`, and a book detail page locally
2. Run broader tests if relationship types changed: `npm test`
3. Deploy when ready; production ISR fetches the release URL (bundled is dev/offline fallback)
```

## Post-update verification

After replacing the bundled manifest:

| Area           | What to check                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| Sources index  | `/explore/sources` loads; enriched cards show citation/title when present                                     |
| Thinkers index | `/explore/thinkers` lists derived or explicit thinkers                                                        |
| Thinker detail | e.g. `/explore/thinkers/john-dewey` — works list and JSON-LD                                                  |
| Book pages     | Thinkers section vs research sources split on enriched books                                                  |
| Stale ISR      | [`pickSemanticGraph()`](../../lib/graph/manifest.ts) prefers bundled when remote lacks enrichment or is older |

With offline dev:

```bash
SEMANTIC_MANIFEST_OFFLINE=1 npm run dev
```

E2E smoke (optional):

```bash
SEMANTIC_MANIFEST_OFFLINE=1 npx playwright test e2e/thinkers.spec.ts e2e/navigation.spec.ts
```

## Notes

- This skill only updates the **bundled fallback** at `data/semantic-manifest.json`.
- Prefer the npm script when available: `npm run sync:semantic-manifest`.
- Production deployments fetch from the GitHub release URL via ISR (see [`lib/graph/manifest.ts`](../../lib/graph/manifest.ts)).
- The bundled manifest ensures dev/offline mode and CI have latest data when `SEMANTIC_MANIFEST_OFFLINE=1`.
- Selection is remote-first; see [`docs/semantic-manifest.md`](../../docs/semantic-manifest.md).
- v1 manifests without `thinkers[]` are valid — the site calls `deriveThinkersFromSources()` when sources have `creatorSlugs`.
- If new **relationship** types are added, you may also need to:
  - Add visual styling in `lib/graph/relationshipVisuals.ts`
  - Classify in taxonomy at `lib/graph/relationshipTaxonomy.ts`
  - Add test coverage

## Troubleshooting

**"release not found"**

- Check that the `latest` release exists: `gh release list --repo ksteffe/after-certainty`
- If using a specific tag, replace `latest` with that tag

**"asset not found"**

- Verify the release contains `semantic-manifest.json`: `gh release view latest --repo ksteffe/after-certainty`
- The asset name must match exactly (case-sensitive)

**JSON validation fails (`jq empty`)**

- The upstream file may be truncated or corrupted
- Re-download or inspect the release on GitHub web UI

**`npm test -- lib/graph/manifest.test.ts` fails (Zod validation)**

- Bundled manifest failed [`semanticGraphSchema`](../../lib/graph/schemas.ts) — do not commit
- Common causes: invalid `url` on a source, unknown `thinker.type`, malformed `sourceKind`
- Fix upstream in after-certainty, or extend the site schema if the upstream shape is intentional
- Restore previous bundle: `git checkout -- data/semantic-manifest.json`

**Enriched source count dropped unexpectedly**

- Upstream may have regressed metadata — compare a few known slugs (e.g. `john-dewey` sources)
- Check whether `creatorSlugs` backfill ran in the content repo

**Thinkers index empty but sources are enriched**

- Expected for v1 manifests — thinkers are derived at runtime from `creatorSlugs`
- If `manifestVersion: 2` and `thinkers` is empty, upstream thinker YAML may not have shipped yet

**Merge conflicts**

- If the bundled manifest has local changes, resolve manually
- Prefer upstream release content unless local changes were intentional experiments

**Site shows stale thinker/source data in production but bundled is current**

- ISR may be serving an older remote release — bundled fallback logic in `pickSemanticGraph()` only applies when remote is poorer
- Trigger cache revalidation via the site's revalidate route or wait for `SEMANTIC_MANIFEST_REVALIDATE_SECONDS`
