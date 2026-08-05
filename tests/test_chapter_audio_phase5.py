"""Phase 5 chapter-audio site manifest (available units only)."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import jsonschema
import pytest

REPO = Path(__file__).resolve().parents[1]
TOOLS = REPO / "tools"
if str(TOOLS) not in sys.path:
    sys.path.insert(0, str(TOOLS))

from chapter_audio.site_manifest import (  # noqa: E402
    build_chapter_audio_manifest,
    is_lfs_pointer,
)


def test_is_lfs_pointer_detects_stub(tmp_path: Path) -> None:
    pointer = tmp_path / "x.mp3"
    pointer.write_text(
        "version https://git-lfs.github.com/spec/v1\noid sha256:abc\nsize 12\n",
        encoding="utf-8",
    )
    assert is_lfs_pointer(pointer) is True
    real = tmp_path / "y.mp3"
    real.write_bytes(b"ID3" + b"\x00" * 64)
    assert is_lfs_pointer(real) is False


def test_build_manifest_includes_observer_intro_when_available() -> None:
    audio = REPO / "books/observer-patterns/audio/front-matter-introduction.mp3"
    if not audio.is_file() or is_lfs_pointer(audio):
        pytest.skip("local Observer Patterns intro audio not present")
    payload = build_chapter_audio_manifest(REPO)
    schema = json.loads(
        (REPO / "schema/chapter-audio-manifest.schema.json").read_text(encoding="utf-8")
    )
    jsonschema.validate(payload, schema)
    units = payload["units"]
    assert isinstance(units, list)
    intro = next(
        (u for u in units if u["unitId"] == "chapter-observer-patterns-front-matter-introduction"),
        None,
    )
    assert intro is not None
    assert intro["editionSlug"] == "observer-patterns"
    assert intro["bookRelpath"] == "books/observer-patterns"
    assert intro["chapterSlug"] == "front-matter-introduction"
    assert intro["audioUrl"] == "/generated/audio/observer-patterns/front-matter-introduction.mp3"
    assert intro["alignmentUrl"] == (
        "/generated/audio/observer-patterns/front-matter-introduction.alignment.json"
    )
    assert intro["alignmentGranularity"] == "segment-only"
    assert intro["disclosure"]
    assert "provider" not in intro
