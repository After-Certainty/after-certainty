#!/usr/bin/env python3
"""Sync Suno playlist clip IDs into semantic song + playlist YAML.

Dev-only tool. Default is dry-run (no YAML writes). Use --apply to update:

  - semantic/songs/<slug>.yml recordings (new primary + superseded lineage)
  - semantic/playlists/after-certainty.yml tracks + snapshotDate

Never overwrites lyricsPath, generation.authoredPrompt, or concept/pattern/book links.
Unmatched clips / songs missing from the playlist abort without writing YAML.

Usage:
  python3 tools/songs/sync_suno_playlist.py --fetch
  python3 tools/songs/sync_suno_playlist.py --fixture tools/songs/fixtures/suno-playlist-2026-09-08.json
  python3 tools/songs/sync_suno_playlist.py --fetch --save-fixture --apply
"""

from __future__ import annotations

import argparse
import sys
from datetime import date
from pathlib import Path
from typing import Any

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required") from exc

_SONGS_DIR = Path(__file__).resolve().parent
if str(_SONGS_DIR) not in sys.path:
    sys.path.insert(0, str(_SONGS_DIR))

import suno_playlist_lib as lib  # noqa: E402


def _resolve_fixture_arg(fixture: Path | None) -> Path | None:
    if fixture is not None:
        return fixture
    if lib.DEFAULT_FIXTURE.is_file():
        return lib.DEFAULT_FIXTURE
    prev = lib.FIXTURES_DIR / "suno-playlist-2026-09-06.json"
    if prev.is_file():
        return prev
    return lib.DEFAULT_FIXTURE


def _plan(
    clips: list[dict[str, Any]],
    songs: dict[str, dict[str, Any]],
) -> tuple[list[str], list[dict[str, Any]], list[str]]:
    errors: list[str] = []
    updates: list[dict[str, Any]] = []
    ok_lines: list[str] = []
    matched: set[str] = set()

    for clip in clips:
        key = lib.norm_title(clip["title"])
        song = songs.get(key)
        if not song:
            errors.append(f"UNMATCHED CLIP #{clip['position']}: {clip['title']} ({clip['id']})")
            continue
        matched.add(key)
        doc = song["doc"]
        slug = doc["slug"]
        recordings = [r for r in (doc.get("recordings") or []) if isinstance(r, dict)]
        ids = {str(r.get("externalId")) for r in recordings}
        primary = next((r for r in recordings if r.get("primary")), None)
        primary_id = str((primary or {}).get("externalId") or "")
        if clip["id"] not in ids:
            updates.append({"slug": slug, "path": song["path"], "clip": clip, "kind": "new"})
            ok_lines.append(f"NEW RECORDING for {slug}: {primary_id or '(none)'} → {clip['id']}")
        elif clip["id"] != primary_id:
            updates.append({"slug": slug, "path": song["path"], "clip": clip, "kind": "promote"})
            ok_lines.append(
                f"PRIMARY DIFFERS for {slug}: playlist={clip['id']} yaml_primary={primary_id}"
            )
        else:
            ok_lines.append(f"OK #{clip['position']:02d} {slug} ← {clip['id']}")

    for key, song in songs.items():
        if key not in matched:
            errors.append(f"SONG WITHOUT PLAYLIST CLIP: {song['doc'].get('slug')}")

    return errors, updates, ok_lines


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--fixture", type=Path, default=None)
    parser.add_argument(
        "--fetch",
        action="store_true",
        help="Fetch live official Suno playlist API",
    )
    parser.add_argument(
        "--save-fixture",
        nargs="?",
        const="AUTO",
        default=None,
        metavar="PATH",
        help=(
            "Write snapshot JSON. If PATH omitted, uses "
            "tools/songs/fixtures/suno-playlist-YYYY-MM-DD.json"
        ),
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Write song + playlist YAML updates (default is dry-run)",
    )
    parser.add_argument("--repo", type=Path, default=None, help="Repo root override (tests)")
    parser.add_argument(
        "--playlist", type=Path, default=None, help="Playlist YAML path override (tests)"
    )
    parser.add_argument(
        "--songs-dir", type=Path, default=None, help="Songs directory override (tests)"
    )
    parser.add_argument(
        "--snapshot-date",
        type=str,
        default=None,
        help="Override snapshotDate (YYYY-MM-DD); default today",
    )
    args = parser.parse_args(argv)

    fixture = None if args.fetch else _resolve_fixture_arg(args.fixture)
    snapshot = lib.load_snapshot(fixture, fetch=args.fetch)
    clips = lib.iter_clips(snapshot)

    if args.songs_dir is not None:
        songs_dir = args.songs_dir
    elif args.repo is not None:
        songs_dir = args.repo / "semantic" / "songs"
    else:
        songs_dir = lib.SONGS_DIR
    songs = lib.load_songs(songs_dir)
    snapshot_day = args.snapshot_date or date.today().isoformat()

    if args.playlist is not None:
        playlist_path = args.playlist
    elif args.repo is not None:
        playlist_path = args.repo / "semantic" / "playlists" / "after-certainty.yml"
    else:
        playlist_path = lib.PLAYLIST_YAML

    print(f"source: {snapshot.get('source') or fixture or lib.DEFAULT_FIXTURE}")
    print(f"playlist clips: {len(clips)}")
    print(f"semantic songs: {len(songs)}")
    print(f"mode: {'apply' if args.apply else 'dry-run'}")
    print()

    errors, updates, ok_lines = _plan(clips, songs)
    for line in ok_lines:
        print(line)
    for err in errors:
        print(err)

    if args.save_fixture is not None:
        save_path = (
            lib.default_fixture_path(date.fromisoformat(snapshot_day))
            if args.save_fixture == "AUTO"
            else Path(args.save_fixture)
        )
        lib.save_fixture(snapshot, save_path)
        print(f"\nsaved fixture: {save_path}")

    if errors:
        print()
        print(f"blocking issues: {len(errors)} (no YAML writes)")
        print(
            "Note: unmatched clips require editorial new-song ingest; see suno-playlist-sync skill."
        )
        return 1

    print()
    print(f"recording updates: {len(updates)}")
    if not args.apply:
        print("dry-run only; re-run with --apply to write YAML")
        print("Note: this tool never overwrites lyrics or authored prompts.")
        return 0

    for item in updates:
        song_doc = yaml.safe_load(item["path"].read_text(encoding="utf-8"))
        updated, action = lib.apply_clip_to_song(song_doc, item["clip"], snapshot_day=snapshot_day)
        lib.dump_yaml(updated, item["path"])
        print(f"wrote {item['path']} ({action})")
        songs[lib.norm_title(str(updated["title"]))] = {
            "path": item["path"],
            "doc": updated,
        }

    playlist_doc = yaml.safe_load(playlist_path.read_text(encoding="utf-8"))
    if not isinstance(playlist_doc, dict):
        raise SystemExit(f"invalid playlist YAML: {playlist_path}")
    playlist_doc["snapshotDate"] = snapshot_day
    playlist_doc["tracks"] = lib.build_playlist_tracks(clips, songs)
    lib.dump_yaml(playlist_doc, playlist_path)
    print(f"wrote {playlist_path}")
    print("Note: this tool never overwrites lyrics or authored prompts.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
