---
name: suno-playlist-sync
description: >-
  Syncs the After Certainty Suno playlist into semantic song + playlist YAML
  (clip IDs, primary recordings, track order, dated fixtures), verifies, and
  opens a PR. Use when updating Suno song ids, playlist recordings, or
  refreshing the listen graph from the live playlist.
---

# Suno playlist → graph sync

Keep `semantic/songs/*.yml` and `semantic/playlists/after-certainty.yml` aligned
with the official Suno playlist. The playlist is the source of truth for **clip
IDs** and **track order**; song descriptions, lyrics, and concept/pattern/book
links stay editorial.

## Model

| Layer | Path | Role |
|-------|------|------|
| Composition | `semantic/songs/<slug>.yml` | Graph node; `recordings[]` hold Suno clip UUIDs |
| Playlist | `semantic/playlists/after-certainty.yml` | Membership + display order; `recordingExternalId` per track |
| Fixture | `tools/songs/fixtures/suno-playlist-YYYY-MM-DD.json` | Committed API snapshot for offline reconcile |
| Lyrics | `corpus/songs/<slug>.md` | Never overwritten by sync |

Identity rule: playlist position is display order only; site embeds use each
song’s **primary** recording (`apps/site/lib/songs/listen-order.ts`).

## 1 — Inputs

Ask if missing:

| Input | Notes |
|-------|-------|
| **Mode** | `update-recordings` (default) or `new-songs` (editorial; tool will not invent YAML) |
| **Source** | `--fetch` live API, or `FIXTURE=tools/songs/fixtures/….json` |

## 2 — Snapshot + reconcile (read-only)

```bash
export PATH="$HOME/.local/bin:$PWD/.venv/bin:$PATH"

# Live fetch + dry-run plan (also saves dated fixture when SAVE_FIXTURE=1)
make sync-suno-playlist FETCH=1 SAVE_FIXTURE=1 SNAPSHOT_DATE=$(date -u +%F)

# Or read-only report against a fixture
make reconcile-suno-playlist FIXTURE=tools/songs/fixtures/suno-playlist-YYYY-MM-DD.json
```

Interpret the report:

| Message | Action |
|---------|--------|
| `NEW RECORDING` / `PRIMARY DIFFERS` | Safe for `--apply` (clip replacement) |
| `UNMATCHED CLIP` | Stop apply; switch to **new-songs** editorial ingest |
| `SONG WITHOUT PLAYLIST CLIP` | Confirm intentional removal before editing by hand |

## 3 — Apply recording updates

Only when every clip title matches an existing song and issues are clip-ID drift:

```bash
make sync-suno-playlist-apply FETCH=1 SAVE_FIXTURE=1 SNAPSHOT_DATE=$(date -u +%F)

# Or apply a saved fixture without hitting the network
make sync-suno-playlist-apply FIXTURE=tools/songs/fixtures/suno-playlist-YYYY-MM-DD.json SNAPSHOT_DATE=YYYY-MM-DD
```

Apply will:

- Insert the playlist clip as the new **primary** recording (metadata from snapshot)
- Demote the previous primary with `lineageNote` + `supersededBy`
- Rewrite playlist `tracks[]` + bump `snapshotDate`
- **Never** touch `lyricsPath`, `generation.authoredPrompt`, or related\* links

Point reconcile’s default fixture at the new dated file by keeping
`tools/songs/suno_playlist_lib.py` `DEFAULT_FIXTURE` current (update when the
latest fixture lands).

## 4 — New songs (editorial; do not auto-apply)

When reconcile reports `UNMATCHED CLIP`:

1. Do **not** run `--apply` until songs exist for every clip.
2. Create `corpus/songs/<slug>.md` (lyrics) and `semantic/songs/<slug>.yml`
   using an existing song as template (see [reference.md](reference.md)).
3. Fill `shortDescription` / `longDescription` / `relatedConcepts` /
   `relatedPatterns` / `relatedBooks` with human judgment — do not invent links.
4. Set `generation.authoredPromptSource: suno-playlist` when the prompt came from
   the snapshot; never overwrite `master-doc` prompts on existing songs.
5. Re-run reconcile, then `make sync-suno-playlist-apply` to refresh playlist
   membership/order.

Historical example: PR #601 (four new songs from the 2026-09-06 snapshot).

## 5 — Verify (required)

```bash
make validate-semantic-entities
make reconcile-suno-playlist FIXTURE=tools/songs/fixtures/suno-playlist-YYYY-MM-DD.json
python3 -m pytest tests/test_songs_manifest.py tests/test_sync_suno_playlist.py -q
make lint   # when tools/ or tests/ Python changed
```

Optional site check after manifest install:

```bash
make generate-semantic-manifest && make install-local-manifest-for-site
npm run site:dev:local
# /listen and /explore/songs/<slug> should embed the new primary UUIDs
```

## 6 — Open PR

```bash
git checkout main && git pull
git checkout -b cursor/suno-playlist-sync-<short-id>
git add semantic/songs semantic/playlists tools/songs .cursor/skills/suno-playlist-sync
git commit -m "Sync Suno playlist clip IDs into the semantic graph"
git push -u origin HEAD
```

PR body checklist:

## Summary
- Snapshot date + which songs received new primaries (or new song slugs)

## Verification
- [x] `make validate-semantic-entities`
- [x] `make reconcile-suno-playlist` (0 issues against new fixture)
- [x] pytest songs + sync tests
- [x] `make lint` (if Python changed)

## Review
- Confirm superseded recordings keep lineage (`primary: false`, `supersededBy`)
- Confirm playlist order matches Suno
- Confirm no lyrics / master-doc prompt overwrites

## Do not

- Overwrite `generation.authoredPrompt` when `authoredPromptSource: master-doc`
- Auto-create song YAML for unmatched clips without editorial descriptions/links
- Commit secrets or authenticated Suno session cookies (public playlist API only)
- Skip validate/reconcile before opening the PR

## Reference

[reference.md](reference.md) — API URL, superseded template, commands, fixtures
