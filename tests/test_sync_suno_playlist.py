"""Unit tests for tools/songs/sync_suno_playlist.py."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import yaml

REPO = Path(__file__).resolve().parents[1]
SONGS_TOOL = REPO / "tools" / "songs"
if str(SONGS_TOOL) not in sys.path:
    sys.path.insert(0, str(SONGS_TOOL))

import suno_playlist_lib as lib  # noqa: E402
from sync_suno_playlist import main as sync_main  # noqa: E402


def _write_song(path: Path, *, slug: str, title: str, clip_id: str) -> None:
    doc = {
        "slug": slug,
        "title": title,
        "shortDescription": "Test song.",
        "longDescription": "Test song long description.",
        "creatorNames": ["Test"],
        "lyricsPath": f"corpus/songs/{slug}.md",
        "lyricLanguages": ["en"],
        "relatedConcepts": ["certainty"],
        "relatedPatterns": ["contact-keeps-the-read-open"],
        "relatedBooks": ["after-certainty"],
        "recordings": [
            {
                "platform": "suno",
                "externalId": clip_id,
                "primary": True,
                "recordingTitle": title,
            }
        ],
        "generation": {
            "authoredPrompt": "keep me",
            "authoredPromptSource": "master-doc",
            "authoredPromptRetrievedAt": "2026-09-04",
        },
    }
    path.write_text(
        yaml.safe_dump(doc, allow_unicode=True, default_flow_style=False, sort_keys=False),
        encoding="utf-8",
    )


def _write_playlist(path: Path, *, slug: str, clip_id: str) -> None:
    doc = {
        "slug": "after-certainty",
        "title": "After Certainty",
        "description": "Test playlist",
        "platform": "suno",
        "externalId": lib.PLAYLIST_EXTERNAL_ID,
        "snapshotDate": "2026-09-06",
        "tracks": [
            {"position": 1, "songSlug": slug, "recordingExternalId": clip_id},
        ],
    }
    path.write_text(
        yaml.safe_dump(doc, allow_unicode=True, default_flow_style=False, sort_keys=False),
        encoding="utf-8",
    )


def _write_fixture(path: Path, *, title: str, old_id: str, new_id: str) -> None:
    payload = {
        "source": str(path),
        "playlist": {
            "playlist_clips": [
                {
                    "relative_index": 1,
                    "clip": {
                        "id": new_id,
                        "title": title,
                        "created_at": "2026-09-08T12:00:00.000Z",
                        "model_name": "chirp-fenix",
                        "major_model_version": "v5.5",
                        "display_tags": "test tags",
                        "metadata": {
                            "duration": 120.5,
                            "tags": "full style tags",
                            "task": "gen",
                            "type": "gen",
                            "is_remix": False,
                        },
                    },
                }
            ]
        },
    }
    # include old_id only so callers can reference it; fixture uses new_id
    assert old_id != new_id
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def test_sync_apply_swaps_primary_and_playlist(tmp_path: Path) -> None:
    songs_dir = tmp_path / "songs"
    songs_dir.mkdir()
    playlist_path = tmp_path / "after-certainty.yml"
    fixture_path = tmp_path / "fixture.json"

    slug = "again-differently"
    title = "Again, Differently"
    old_id = "11111111-1111-1111-1111-111111111111"
    new_id = "22222222-2222-2222-2222-222222222222"
    song_path = songs_dir / f"{slug}.yml"
    _write_song(song_path, slug=slug, title=title, clip_id=old_id)
    _write_playlist(playlist_path, slug=slug, clip_id=old_id)
    _write_fixture(fixture_path, title=title, old_id=old_id, new_id=new_id)

    before = song_path.read_text(encoding="utf-8")
    rc = sync_main(
        [
            "--fixture",
            str(fixture_path),
            "--songs-dir",
            str(songs_dir),
            "--playlist",
            str(playlist_path),
            "--snapshot-date",
            "2026-09-08",
        ]
    )
    assert rc == 0
    assert song_path.read_text(encoding="utf-8") == before  # dry-run

    rc = sync_main(
        [
            "--fixture",
            str(fixture_path),
            "--songs-dir",
            str(songs_dir),
            "--playlist",
            str(playlist_path),
            "--snapshot-date",
            "2026-09-08",
            "--apply",
        ]
    )
    assert rc == 0

    song = yaml.safe_load(song_path.read_text(encoding="utf-8"))
    assert song["generation"]["authoredPrompt"] == "keep me"
    assert song["generation"]["authoredPromptSource"] == "master-doc"
    primaries = [r for r in song["recordings"] if r.get("primary")]
    assert len(primaries) == 1
    assert primaries[0]["externalId"] == new_id
    assert primaries[0]["modelName"] == "chirp-fenix"
    assert primaries[0]["durationSeconds"] == 120.5
    old = next(r for r in song["recordings"] if r["externalId"] == old_id)
    assert old["primary"] is False
    assert old["supersededBy"] == new_id
    assert "2026-09-08" in old["lineageNote"]

    playlist = yaml.safe_load(playlist_path.read_text(encoding="utf-8"))
    assert playlist["snapshotDate"] == "2026-09-08"
    assert playlist["tracks"][0]["recordingExternalId"] == new_id
    assert playlist["tracks"][0]["songSlug"] == slug


def test_sync_blocks_unmatched_clip(tmp_path: Path) -> None:
    songs_dir = tmp_path / "songs"
    songs_dir.mkdir()
    playlist_path = tmp_path / "after-certainty.yml"
    fixture_path = tmp_path / "fixture.json"
    _write_song(
        songs_dir / "known.yml",
        slug="known",
        title="Known Song",
        clip_id="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    )
    _write_playlist(playlist_path, slug="known", clip_id="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
    payload = {
        "playlist": {
            "playlist_clips": [
                {
                    "relative_index": 1,
                    "clip": {
                        "id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                        "title": "Brand New Unmatched",
                        "metadata": {},
                    },
                }
            ]
        }
    }
    fixture_path.write_text(json.dumps(payload) + "\n", encoding="utf-8")
    before = (songs_dir / "known.yml").read_text(encoding="utf-8")
    rc = sync_main(
        [
            "--fixture",
            str(fixture_path),
            "--songs-dir",
            str(songs_dir),
            "--playlist",
            str(playlist_path),
            "--apply",
        ]
    )
    assert rc == 1
    assert (songs_dir / "known.yml").read_text(encoding="utf-8") == before


def test_recording_from_clip_prefers_full_tags() -> None:
    clip = {
        "id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
        "title": "T",
        "created_at": "2026-09-08T00:00:00.000Z",
        "model_name": "chirp-fenix",
        "model_version": "v5.5",
        "display_tags": "short",
        "metadata": {
            "duration": 10,
            "tags": "long tags",
            "task": "",
            "type": "gen",
            "is_remix": True,
        },
    }
    rec = lib.recording_from_clip(clip, primary=True)
    assert rec["styleTags"] == "long tags"
    assert rec["task"] == "gen"
    assert rec["isRemix"] is True
    assert rec["primary"] is True
