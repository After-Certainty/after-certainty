#!/usr/bin/env python3
"""Reconcile a Suno playlist snapshot against semantic/songs YAML.

Dev-only tool. Does not write semantic files. Never contacts Suno unless
--fetch is passed; default reads the committed fixture.

Usage:
  python3 tools/songs/reconcile_suno_playlist.py
  python3 tools/songs/reconcile_suno_playlist.py --fixture tools/songs/fixtures/suno-playlist-2026-09-08.json
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

_SONGS_DIR = Path(__file__).resolve().parent
if str(_SONGS_DIR) not in sys.path:
    sys.path.insert(0, str(_SONGS_DIR))

import suno_playlist_lib as lib  # noqa: E402


def _resolve_fixture(path: Path | None) -> Path:
    if path is not None:
        return path
    if lib.DEFAULT_FIXTURE.is_file():
        return lib.DEFAULT_FIXTURE
    prev = lib.FIXTURES_DIR / "suno-playlist-2026-09-06.json"
    if prev.is_file():
        return prev
    return lib.DEFAULT_FIXTURE


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--fixture", type=Path, default=None)
    parser.add_argument(
        "--fetch",
        action="store_true",
        help="Fetch live official Suno playlist API (optional; not used in CI)",
    )
    args = parser.parse_args()

    fixture = None if args.fetch else _resolve_fixture(args.fixture)
    snapshot = lib.load_snapshot(fixture, fetch=args.fetch)
    clips = lib.iter_clips(snapshot)
    songs = lib.load_songs()

    print(f"source: {snapshot.get('source') or fixture or lib.DEFAULT_FIXTURE}")
    print(f"playlist clips: {len(clips)}")
    print(f"semantic songs: {len(songs)}")
    print()

    matched: set[str] = set()
    issues = 0
    for clip in clips:
        key = lib.norm_title(clip["title"])
        song = songs.get(key)
        if not song:
            print(f"UNMATCHED CLIP #{clip['position']}: {clip['title']} ({clip['id']})")
            issues += 1
            continue
        matched.add(key)
        doc = song["doc"]
        slug = doc["slug"]
        recordings = doc.get("recordings") or []
        ids = {str(r.get("externalId")) for r in recordings if isinstance(r, dict)}
        primary = next((r for r in recordings if isinstance(r, dict) and r.get("primary")), None)
        primary_id = str((primary or {}).get("externalId") or "")
        if clip["id"] not in ids:
            print(f"NEW RECORDING for {slug}: clip {clip['id']} not in YAML recordings")
            issues += 1
        elif clip["id"] != primary_id:
            print(f"PRIMARY DIFFERS for {slug}: playlist={clip['id']} yaml_primary={primary_id}")
            issues += 1
        else:
            print(f"OK #{clip['position']:02d} {slug} ← {clip['id']}")

    for key, song in songs.items():
        if key not in matched:
            print(f"SONG WITHOUT PLAYLIST CLIP: {song['doc'].get('slug')}")
            issues += 1

    print()
    print(f"issues: {issues}")
    print("Note: this tool never overwrites lyrics or authored prompts.")
    return 1 if issues else 0


if __name__ == "__main__":
    sys.exit(main())
