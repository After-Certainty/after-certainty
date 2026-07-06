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

## Prerequisites

- GitHub CLI (`gh`) authenticated
- Write access to the site repo

## When to use this skill

Use when:
- The user asks to "refresh the manifest" or "pull latest semantic manifest"
- Upstream content changes have been published to the after-certainty repo
- You need to sync the bundled fallback with production data

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

If invalid, stop and report:
- The download may have failed
- The upstream manifest may be corrupted
- Check the release manually on GitHub

### 3. Check relationship count and changes

```bash
OLD_COUNT=$(jq '.relationships | length' data/semantic-manifest.json)
NEW_COUNT=$(jq '.relationships | length' /tmp/semantic-manifest.json)
echo "Old: $OLD_COUNT relationships"
echo "New: $NEW_COUNT relationships"
echo "Change: $((NEW_COUNT - OLD_COUNT))"
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

- Relationships: $OLD_COUNT → $NEW_COUNT
- Source: ksteffe/after-certainty@latest"
git push origin $(git branch --show-current)
```

## Output template

Report to the user:

```markdown
✅ Semantic manifest updated successfully

**Changes:**
- Old relationship count: [OLD_COUNT]
- New relationship count: [NEW_COUNT]
- Net change: [+/-N]

**New relationship types (if any):**
- [list any new predicates]

**Commit:** [SHA]

**Next steps:**
1. Test locally: `npm run dev` and navigate to `/explore`
2. Verify new relationships render correctly on graph and detail pages
3. Run tests: `npm test` (especially relationshipVisuals and relationshipTaxonomy)
4. Deploy when ready
```

## Notes

- This skill only updates the **bundled fallback** at `data/semantic-manifest.json`
- Production deployments fetch from the GitHub release URL via ISR (see `lib/graph/manifest.ts`)
- The bundled manifest ensures dev/offline mode has latest data
- After updating, always verify:
  - Graph visualization renders new edges with appropriate styling
  - Detail pages show new relationships in tension/dynamic sections
  - Tests pass (`npm test`)
- If new relationship types are added, you may need to:
  - Add visual styling in `lib/graph/relationshipVisuals.ts`
  - Classify in taxonomy at `lib/graph/relationshipTaxonomy.ts`
  - Add test coverage

## Troubleshooting

**"release not found"**
- Check that the `latest` release exists: `gh release list --repo ksteffe/after-certainty`
- If using a different tag, replace `latest` with the specific tag

**"asset not found"**
- Verify the release contains `semantic-manifest.json`: `gh release view latest --repo ksteffe/after-certainty`
- The asset name must match exactly (case-sensitive)

**Validation fails**
- The upstream JSON may be malformed
- Check the release on GitHub web UI
- Contact the content repo maintainer

**Merge conflicts**
- If the bundled manifest has local changes, resolve manually
- Consider whether local changes should be pushed upstream first
