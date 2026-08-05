"""Build the site-facing chapter-audio manifest (available units only)."""

from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from chapter_audio.plan import UnitAudioPlan, plan_units
from chapter_audio.receipts import alignment_path_for, load_receipt, receipt_path_for

DEFAULT_DISCLOSURE = "AI-generated narration"
_LFS_POINTER_PREFIX = "version https://git-lfs.github.com/spec/v1"


def is_lfs_pointer(path: Path) -> bool:
    """True when path looks like a Git LFS pointer stub (not real media)."""
    if not path.is_file():
        return False
    size = path.stat().st_size
    if size <= 0 or size > 1024:
        return False
    try:
        head = path.read_bytes()[:120]
    except OSError:
        return False
    try:
        text = head.decode("utf-8")
    except UnicodeDecodeError:
        return False
    return text.startswith(_LFS_POINTER_PREFIX)


def _duration_seconds_from_alignment(path: Path) -> float | None:
    if not path.is_file():
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    segments = data.get("segments") if isinstance(data, dict) else None
    if not isinstance(segments, list) or not segments:
        return None
    last = segments[-1]
    if not isinstance(last, dict):
        return None
    end_ms = last.get("endMs")
    if not isinstance(end_ms, (int, float)) or end_ms < 0:
        return None
    return round(float(end_ms) / 1000.0, 3)


def _unit_entry(repo: Path, plan: UnitAudioPlan) -> dict[str, Any] | None:
    if plan.status != "enabled-current" or not plan.generation_hash:
        return None
    audio = repo / plan.book_relpath / "audio" / f"{plan.chapter_slug}.mp3"
    if not audio.is_file() or is_lfs_pointer(audio):
        return None
    receipt = load_receipt(receipt_path_for(repo, plan.book_relpath, plan.chapter_slug))
    if not isinstance(receipt, dict):
        return None
    align_path = alignment_path_for(repo, plan.book_relpath, plan.chapter_slug)
    align_meta = receipt.get("alignment") if isinstance(receipt.get("alignment"), dict) else {}
    granularity = str(align_meta.get("granularity") or "none")
    alignment_url = None
    if granularity != "none" and align_path.is_file() and not is_lfs_pointer(align_path):
        alignment_url = f"/generated/audio/{plan.edition_slug}/{plan.chapter_slug}.alignment.json"
    duration = _duration_seconds_from_alignment(align_path)
    return {
        "unitId": plan.unit_id,
        "editionSlug": plan.edition_slug,
        "bookRelpath": plan.book_relpath,
        "chapterSlug": plan.chapter_slug,
        "routeKey": plan.route_key,
        "audioUrl": f"/generated/audio/{plan.edition_slug}/{plan.chapter_slug}.mp3",
        "durationSeconds": duration,
        "alignmentUrl": alignment_url,
        "alignmentGranularity": granularity,
        "generationHash": plan.generation_hash,
        "disclosure": DEFAULT_DISCLOSURE,
    }


def build_chapter_audio_manifest(repo: Path) -> dict[str, Any]:
    """Return schema-shaped manifest containing only available (enabled-current) units."""
    repo = repo.resolve()
    plans = plan_units(repo, enabled_only=True)
    units: list[dict[str, Any]] = []
    for plan in plans:
        entry = _unit_entry(repo, plan)
        if entry is not None:
            units.append(entry)
    units.sort(key=lambda u: (str(u["editionSlug"]), str(u["chapterSlug"])))
    return {
        "schemaVersion": 1,
        "generatedAt": datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "units": units,
    }


def write_chapter_audio_manifest(repo: Path, *, out: Path | None = None) -> Path:
    """Write build/chapter-audio-manifest.json (or custom path). Returns path written."""
    repo = repo.resolve()
    dest = out if out is not None else repo / "build" / "chapter-audio-manifest.json"
    dest.parent.mkdir(parents=True, exist_ok=True)
    payload = build_chapter_audio_manifest(repo)
    dest.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    return dest
