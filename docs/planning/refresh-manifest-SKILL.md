---
name: refresh-manifest
description: >-
  Pull the latest semantic-manifest.json from the after-certainty content
  repository release and update the bundled fallback. Use when manifest
  changes are deployed upstream, including v1.5 enriched sources or v2
  thinkers array, and need to be synced to the site repo.
---

# Refresh Semantic Manifest

## Purpose

Sync the bundled [`data/semantic-manifest.json`](../../data/semantic-manifest.json) 
with the latest release from `ksteffe/after-certainty`.

Upstream migration: [semantic-thinkers-sources-migration.md](https://github.com/ksteffe/after-certainty/blob/main/docs/semantic-thinkers-sources-migration.md)

## Prerequisites

- GitHub CLI (`gh`) authenticated
- Write access to the site repo
- Site types/parser updated for new manifest fields before relying on them in UI (issues #39–#45)

## When to use this skill

Use when:
- The user asks to "refresh the manifest" or "pull latest semantic manifest"
- Upstream content changes have been published to the after-certainty repo
- You need to sync the bundled fallback with production data
- Enriched `sources[]` (v1.5) or `thinkers[]` (v2) shipped upstream

## Manifest shapes (backward compatible)

| Version | Signals | Site behavior |
|---------|---------|---------------|
| `1` (legacy) | `sources[]` with `name`, `type`, `summary` only | Current `/explore/sources` |
| `1` + v1.5 | Optional source fields: `sourceKind`, `creatorSlugs`, `title`, `citation`, … | Needs issue #39+ for UI |
| `2` | Optional top-level `thinkers[]` | Needs issue #41+ for thinker pages |

The Zod schema in `lib/graph/schemas.ts` must accept new fields before they appear in typed graph output. Refreshing the bundled JSON alone does not enable thinker UI.

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
- Release "latest" exists with the manifest asset

### 2. Validate the downloaded manifest

```bash
jq empty /tmp/semantic-manifest.json
```

Run site validation (required before commit):

```bash
npm test -- lib/graph/manifest.test.ts
```

If `validateSemanticGraph` fails, stop — merge site parser updates (issue #39) before bundling the new manifest.

### 3. Check manifest version and entity counts

```bash
OLD_VER=$(jq '.manifestVersion' data/semantic-manifest.json)
NEW_VER=$(jq '.manifestVersion' /tmp/semantic-manifest.json)
echo "manifestVersion: $OLD_VER → $NEW_VER"

for key in relationships sources thinkers; do
  OLD=$(jq ".${key} | length" data/semantic-manifest.json 2>/dev/null || echo 0)
  NEW=$(jq ".${key} | length" /tmp/semantic-manifest.json 2>/dev/null || echo 0)
  echo "$key: $OLD → $NEW"
done
```

Check enriched sources (v1.5):

```bash
jq '[.sources[] | select(.creatorSlugs != null)] | length' /tmp/semantic-manifest.json
```

Check thinkers (v2):

```bash
jq '.thinkers // [] | length' /tmp/semantic-manifest.json
```

Optionally check for new relationship types:

```bash
jq -r '.relationships[].relationship' /tmp/semantic-manifest.json | sort -u > /tmp/new-types.txt
jq -r '.relationships[].relationship' data/semantic-manifest.json | sort -u > /tmp/old-types.txt
comm -13 /tmp/old-types.txt /tmp/new-types.txt
```

### 4. Replace bundled manifest

```bash
cp /tmp/semantic-manifest.json data/semantic-manifest.json
```

Verify the copy:

```bash
wc -l data/semantic-manifest.json
```

### 5. Commit and push

```bash
git add data/semantic-manifest.json
git commit -m "Update semantic manifest from upstream release

- manifestVersion: $OLD_VER → $NEW_VER
- Relationships: $OLD_COUNT → $NEW_COUNT
- Source: ksteffe/after-certainty@latest"
git push origin $(git branch --show-current)
```

## Output template

Report to the user:

```markdown
✅ Semantic manifest updated successfully

**Manifest:**
- manifestVersion: [OLD] → [NEW]
- Relationships: [OLD_COUNT] → [NEW_COUNT]
- Sources: [OLD] → [NEW]
- Thinkers: [OLD] → [NEW] (0 if absent)
- Enriched sources (creatorSlugs): [N]

**New relationship types (if any):**
- [list any new predicates]

**Commit:** [SHA]

**Next steps:**
1. `npm test` (manifest + json-ld if sources/thinkers changed)
2. `npm run dev` → `/explore/sources` (and `/explore/thinkers` when implemented)
3. Deploy when parser/UI issues for new fields are merged
```

## Notes

- This skill only updates the **bundled fallback** at `data/semantic-manifest.json`
- Production deployments fetch from the GitHub release URL via ISR (see `lib/graph/manifest.ts`)
- Legacy manifests without `thinkers` or `creatorSlugs` remain valid
- After updating, verify:
  - `npm test` passes (`lib/graph/manifest.test.ts`, `lib/seo/json-ld.test.tsx`)
  - Graph and detail pages render without Zod validation errors
- Thinkers/sources site work: issues [#39](https://github.com/ksteffe/after-certainty-site/issues/39)–[#45](https://github.com/ksteffe/after-certainty-site/issues/45)
- If new relationship types are added, you may need to:
  - Add visual styling in `lib/graph/relationshipVisuals.ts`
  - Classify in taxonomy at `lib/graph/relationshipTaxonomy.ts`

## Troubleshooting

**"release not found"**
- Check that the `latest` release exists: `gh release list --repo ksteffe/after-certainty`

**"asset not found"**
- Verify the release contains `semantic-manifest.json`: `gh release view latest --repo ksteffe/after-certainty`

**`validateSemanticGraph` / npm test fails after refresh**
- Upstream manifest includes fields the site parser does not accept yet
- Merge issue #39 (enriched sources) and/or #41 (thinkers) before bundling

**Merge conflicts**
- If the bundled manifest has local changes, resolve manually
- Consider whether local changes should be pushed upstream first
