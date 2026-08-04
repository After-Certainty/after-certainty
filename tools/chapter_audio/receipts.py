"""Load and compare chapter-audio generation receipts."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def receipt_path_for(repo: Path, edition_slug: str, chapter_slug: str) -> Path:
    return repo / "books" / edition_slug / "audio" / f"{chapter_slug}.receipt.json"


def audio_path_for(repo: Path, edition_slug: str, chapter_slug: str) -> Path:
    return repo / "books" / edition_slug / "audio" / f"{chapter_slug}.mp3"


def alignment_path_for(repo: Path, edition_slug: str, chapter_slug: str) -> Path:
    return repo / "books" / edition_slug / "audio" / f"{chapter_slug}.alignment.json"


def load_receipt(path: Path) -> dict[str, Any] | None:
    if not path.is_file():
        return None
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    return raw if isinstance(raw, dict) else None


def is_lfs_pointer(path: Path) -> bool:
    if not path.is_file():
        return False
    try:
        head = path.read_bytes()[:200]
    except OSError:
        return False
    return head.startswith(b"version https://git-lfs.github.com/spec/v1")


def classify_artifacts(
    *,
    repo: Path,
    edition_slug: str,
    chapter_slug: str,
    expected_generation_hash: str,
) -> tuple[bool, bool, bool, str]:
    """Return (has_artifacts, hash_matches, invalid, reason)."""
    receipt = load_receipt(receipt_path_for(repo, edition_slug, chapter_slug))
    audio = audio_path_for(repo, edition_slug, chapter_slug)
    if receipt is None and not audio.is_file():
        return False, False, False, "no receipt or audio"
    if receipt is None:
        return True, False, True, "audio present without readable receipt"
    if is_lfs_pointer(audio):
        return True, False, True, "audio is a Git LFS pointer stub (not smudged)"
    got = str(receipt.get("generationHash") or "").strip()
    if not got:
        return True, False, True, "receipt missing generationHash"
    if got != expected_generation_hash:
        return True, False, False, "receipt generationHash does not match current plan"
    if not audio.is_file():
        return True, False, True, "receipt present but audio file missing"
    return True, True, False, "artifacts current"
