# Suno playlist sync — reference

## Playlist identity

| Field | Value |
|-------|-------|
| Playlist UUID (`externalId`) | `ac533aa1-6688-4901-833a-ec792bb21e87` |
| Share id | `Nt5n9hMopnROAY8P` |
| API (page 1) | `https://studio-api.prod.suno.com/api/playlist/ac533aa1-6688-4901-833a-ec792bb21e87/?page=1` |
| YAML | `semantic/playlists/after-certainty.yml` |

Public playlist JSON only — no auth cookies. Dev `--fetch` uses a browser UA.

## Commands

```bash
export PATH="$HOME/.local/bin:$PWD/.venv/bin:$PATH"

# Read-only reconcile (default fixture or FIXTURE=…; FETCH=1 for live)
make reconcile-suno-playlist
make reconcile-suno-playlist FETCH=1
make reconcile-suno-playlist FIXTURE=tools/songs/fixtures/suno-playlist-2026-09-09.json

# Dry-run sync plan (+ optional fixture save)
make sync-suno-playlist FETCH=1 SAVE_FIXTURE=1 SNAPSHOT_DATE=2026-09-09

# Apply clip ID / order updates
make sync-suno-playlist-apply FETCH=1 SAVE_FIXTURE=1 SNAPSHOT_DATE=2026-09-09
make sync-suno-playlist-apply FIXTURE=tools/songs/fixtures/suno-playlist-2026-09-09.json SNAPSHOT_DATE=2026-09-09

# Direct Python
python3 tools/songs/reconcile_suno_playlist.py --fetch
python3 tools/songs/sync_suno_playlist.py --fetch --save-fixture --apply --snapshot-date 2026-09-09
```

## Fixtures

Committed under `tools/songs/fixtures/`:

- `suno-playlist-YYYY-MM-DD.json` — full API payload wrapped as
  `{ "playlist": …, "source": …, "fetchedAt": … }`
- Keep the latest date as `DEFAULT_FIXTURE` in `tools/songs/suno_playlist_lib.py`
- Older fixtures may remain for history; CI should not call `--fetch`

## Superseded recording pattern

When the playlist points at a new clip for an existing song:

```yaml
recordings:
  - platform: suno
    externalId: <new-clip-uuid>
    primary: true
    recordingTitle: <title>
    createdAt: '…'
    durationSeconds: 0
    modelName: chirp-fenix
    modelVersion: v5.5
    task: gen
    isRemix: false
    styleTags: '…'
  - platform: suno
    externalId: <old-clip-uuid>
    primary: false
    recordingTitle: <title>
    # …prior metadata preserved…
    lineageNote: Historical playlist recording superseded by the YYYY-MM-DD primary clip.
    supersededBy: <new-clip-uuid>
```

House examples: `semantic/songs/dont-let-the-score-fool-you.yml`,
`semantic/songs/the-grain-remains.yml`.

## New song stub (editorial)

Minimum fields from `schema/semantic/song-entry.schema.json`:

```yaml
slug: example-slug
title: Example Title
shortDescription: One-line reader-facing gloss.
longDescription: Longer editorial description with book/pattern fit.
creatorNames:
  - Kevin Steffensen
lyricsPath: corpus/songs/example-slug.md
lyricLanguages:
  - en
relatedConcepts: []   # fill deliberately
relatedPatterns: []
relatedBooks:
  - after-certainty
recordings:
  - platform: suno
    externalId: <clip-uuid-from-playlist>
    primary: true
    recordingTitle: Example Title
generation:
  authoredPrompt: '…'
  authoredPromptSource: suno-playlist
  authoredPromptRetrievedAt: 'YYYY-MM-DD'
editorialStatus: provisional
grounding:
  type: original_synthesis
  note: After Certainty song composition; …
```

Prefer copying a nearby song YAML and replacing fields over inventing structure.

## Title matching

Sync/reconcile normalize titles (strip trailing `(…)`, fold punctuation/case).
If Suno renames a clip so normalization no longer matches `semantic/songs` title,
fix the song title or add a `searchAliases`-style fix only if the schema already
supports it — otherwise rename carefully and re-run reconcile.

## Site consumers

- `/listen` — persistent Suno embed from primary recording UUIDs
- `/explore/songs` / `/explore/songs/[slug]`
- Embed URL shape: `https://suno.com/embed/{uuid}` (no runtime Suno API)

After YAML changes, regenerate/install the local semantic manifest before site
dev if you need to smoke-test embeds.
