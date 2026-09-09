"""Shared helpers for Suno playlist reconcile/sync tools."""

from __future__ import annotations

import json
import re
import urllib.request
from datetime import date
from pathlib import Path
from typing import Any

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required") from exc

REPO = Path(__file__).resolve().parents[2]
FIXTURES_DIR = REPO / "tools" / "songs" / "fixtures"
DEFAULT_FIXTURE = FIXTURES_DIR / "suno-playlist-2026-09-09.json"
PLAYLIST_YAML = REPO / "semantic" / "playlists" / "after-certainty.yml"
SONGS_DIR = REPO / "semantic" / "songs"
PLAYLIST_API = (
    "https://studio-api.prod.suno.com/api/playlist/ac533aa1-6688-4901-833a-ec792bb21e87/?page=1"
)
PLAYLIST_EXTERNAL_ID = "ac533aa1-6688-4901-833a-ec792bb21e87"
FETCH_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/128.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json",
    "Referer": "https://suno.com/",
    "Origin": "https://suno.com/",
}


def norm_title(title: str) -> str:
    t = title.replace("’", "'").replace("‘", "'")
    t = re.sub(r"\s*\([^)]*\)\s*$", "", t)
    t = re.sub(r"[^a-z0-9]+", " ", t.lower()).strip()
    return t


def fetch_playlist() -> dict[str, Any]:
    req = urllib.request.Request(PLAYLIST_API, headers=FETCH_HEADERS)
    with urllib.request.urlopen(req, timeout=60) as resp:  # noqa: S310
        data = json.loads(resp.read().decode("utf-8"))
    return {"playlist": data, "source": PLAYLIST_API}


def load_snapshot(path: Path | None, *, fetch: bool) -> dict[str, Any]:
    if fetch:
        return fetch_playlist()
    fixture_path = path or DEFAULT_FIXTURE
    raw = json.loads(fixture_path.read_text(encoding="utf-8"))
    if "playlist" in raw and isinstance(raw["playlist"], dict):
        if "source" not in raw:
            raw = {**raw, "source": str(fixture_path)}
        return raw
    return {"playlist": raw, "source": str(fixture_path)}


def iter_clips(snapshot: dict[str, Any]) -> list[dict[str, Any]]:
    playlist = snapshot.get("playlist") or snapshot
    clips = playlist.get("playlist_clips") or []
    out: list[dict[str, Any]] = []
    for item in clips:
        clip = item.get("clip") if isinstance(item, dict) else None
        if not isinstance(clip, dict):
            continue
        meta = clip.get("metadata") if isinstance(clip.get("metadata"), dict) else {}
        out.append(
            {
                "position": int(item.get("relative_index") or 0),
                "id": str(clip.get("id") or ""),
                "title": str(clip.get("title") or ""),
                "created_at": clip.get("created_at"),
                "model_name": clip.get("model_name"),
                "model_version": clip.get("major_model_version"),
                "display_tags": clip.get("display_tags"),
                "metadata": meta,
                "raw_clip": clip,
            }
        )
    out.sort(key=lambda c: c["position"])
    return out


def load_songs(songs_dir: Path | None = None) -> dict[str, dict[str, Any]]:
    root = songs_dir or SONGS_DIR
    by_norm: dict[str, dict[str, Any]] = {}
    for path in sorted(root.glob("*.yml")):
        doc = yaml.safe_load(path.read_text(encoding="utf-8"))
        if not isinstance(doc, dict):
            continue
        title = str(doc.get("title") or "")
        by_norm[norm_title(title)] = {"path": path, "doc": doc}
    return by_norm


def default_fixture_path(snapshot_day: date | None = None) -> Path:
    day = snapshot_day or date.today()
    return FIXTURES_DIR / f"suno-playlist-{day.isoformat()}.json"


def save_fixture(snapshot: dict[str, Any], path: Path) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "playlist": snapshot.get("playlist") or snapshot,
        "source": snapshot.get("source") or str(path),
        "fetchedAt": date.today().isoformat(),
    }
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return path


def dump_yaml(doc: dict[str, Any], path: Path) -> None:
    text = yaml.safe_dump(
        doc,
        allow_unicode=True,
        default_flow_style=False,
        sort_keys=False,
        width=1000,
    )
    path.write_text(text, encoding="utf-8")


def recording_from_clip(clip: dict[str, Any], *, primary: bool) -> dict[str, Any]:
    meta = clip.get("metadata") or {}
    tags = meta.get("tags")
    if not (isinstance(tags, str) and tags.strip()):
        tags = clip.get("display_tags") or ""
    task = meta.get("task")
    if not (isinstance(task, str) and task.strip()):
        task = meta.get("type") or "gen"

    recording: dict[str, Any] = {
        "platform": "suno",
        "externalId": clip["id"],
        "primary": primary,
        "recordingTitle": clip["title"] or "Untitled",
    }
    if clip.get("created_at"):
        recording["createdAt"] = str(clip["created_at"])
    duration = meta.get("duration")
    if isinstance(duration, (int, float)):
        recording["durationSeconds"] = float(duration)
    if clip.get("model_name"):
        recording["modelName"] = str(clip["model_name"])
    if clip.get("model_version"):
        recording["modelVersion"] = str(clip["model_version"])
    if task:
        recording["task"] = str(task)
    if "is_remix" in meta:
        recording["isRemix"] = bool(meta["is_remix"])
    if isinstance(tags, str) and tags.strip():
        recording["styleTags"] = tags.strip()
    remix_instruction = meta.get("gpt_description_prompt")
    if isinstance(remix_instruction, str) and remix_instruction.strip():
        recording["remixInstruction"] = remix_instruction.strip()
    for src_key, dst_key in (
        ("cover_clip_id", "coverClipId"),
        ("edited_clip_id", "editedClipId"),
    ):
        value = meta.get(src_key)
        if isinstance(value, str) and value.strip():
            recording[dst_key] = value.strip()
    return recording


def demote_primary(
    recordings: list[dict[str, Any]],
    *,
    new_id: str,
    snapshot_day: str,
) -> list[dict[str, Any]]:
    updated: list[dict[str, Any]] = []
    for rec in recordings:
        if not isinstance(rec, dict):
            continue
        copy = dict(rec)
        if copy.get("primary") is True:
            copy["primary"] = False
            copy["lineageNote"] = (
                f"Historical playlist recording superseded by the {snapshot_day} primary clip."
            )
            copy["supersededBy"] = new_id
        updated.append(copy)
    return updated


def apply_clip_to_song(
    doc: dict[str, Any],
    clip: dict[str, Any],
    *,
    snapshot_day: str,
) -> tuple[dict[str, Any], str]:
    """Return updated song doc and action label (new|promote|unchanged)."""
    recordings = [r for r in (doc.get("recordings") or []) if isinstance(r, dict)]
    ids = {str(r.get("externalId")) for r in recordings}
    primary = next((r for r in recordings if r.get("primary")), None)
    primary_id = str((primary or {}).get("externalId") or "")
    clip_id = clip["id"]

    if clip_id == primary_id:
        return doc, "unchanged"

    if clip_id in ids:
        # Existing non-primary becomes primary; demote current primary.
        new_recordings: list[dict[str, Any]] = []
        for rec in recordings:
            copy = dict(rec)
            if str(copy.get("externalId")) == clip_id:
                copy["primary"] = True
                copy.pop("lineageNote", None)
                copy.pop("supersededBy", None)
            elif copy.get("primary") is True:
                copy["primary"] = False
                copy["lineageNote"] = (
                    f"Historical playlist recording superseded by the {snapshot_day} primary clip."
                )
                copy["supersededBy"] = clip_id
            new_recordings.append(copy)
        out = dict(doc)
        out["recordings"] = new_recordings
        return out, "promote"

    demoted = demote_primary(recordings, new_id=clip_id, snapshot_day=snapshot_day)
    new_rec = recording_from_clip(clip, primary=True)
    out = dict(doc)
    out["recordings"] = [new_rec, *demoted]
    return out, "new"


def build_playlist_tracks(
    clips: list[dict[str, Any]],
    songs_by_norm: dict[str, dict[str, Any]],
) -> list[dict[str, Any]]:
    tracks: list[dict[str, Any]] = []
    for clip in clips:
        song = songs_by_norm[norm_title(clip["title"])]
        tracks.append(
            {
                "position": int(clip["position"]),
                "songSlug": song["doc"]["slug"],
                "recordingExternalId": clip["id"],
            }
        )
    return tracks
