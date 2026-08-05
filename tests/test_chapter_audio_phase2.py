"""Phase 2 chapter-audio extract, hash, plan (secret-free)."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
TOOLS = REPO / "tools"
FIXTURES = REPO / "tests" / "fixtures" / "chapter_audio"
if str(TOOLS) not in sys.path:
    sys.path.insert(0, str(TOOLS))

from chapter_audio.estimate import estimate_usage  # noqa: E402
from chapter_audio.extract import extract_spoken_document  # noqa: E402
from chapter_audio.hashing import (  # noqa: E402
    build_generation_hash_payload,
    generation_hash,
)
from chapter_audio.plan import plan_units  # noqa: E402


def _load_fixture(name: str) -> tuple[str, str, list[dict]]:
    md = (FIXTURES / f"{name}.md").read_text(encoding="utf-8")
    spoken = (FIXTURES / f"{name}.spoken.txt").read_text(encoding="utf-8")
    if spoken.endswith("\n"):
        spoken = spoken[:-1]
    segments = json.loads((FIXTURES / f"{name}.segments.json").read_text(encoding="utf-8"))
    return md, spoken, segments


def test_extract_observer_patterns_introduction_golden() -> None:
    md, expected, expected_segs = _load_fixture("observer-patterns-introduction")
    doc = extract_spoken_document(md, include_title=True, include_footnotes=False)
    assert doc.spoken_text == expected
    assert len(doc.spoken_text) == 211
    got = [
        {
            "id": s.id,
            "text": s.text,
            "charStart": s.char_start,
            "charEnd": s.char_end,
        }
        for s in doc.segments
    ]
    assert got == expected_segs


def test_extract_poem_table_rows_left_then_right() -> None:
    md, expected, expected_segs = _load_fixture("observer-patterns-what-love-teaches")
    doc = extract_spoken_document(md, include_title=True, include_footnotes=False)
    assert doc.spoken_text == expected
    assert "Love deepens. Obligation replaces choice." in doc.spoken_text
    assert "| --- |" not in doc.spoken_text
    got = [
        {
            "id": s.id,
            "text": s.text,
            "charStart": s.char_start,
            "charEnd": s.char_end,
        }
        for s in doc.segments
    ]
    assert got == expected_segs


def test_extract_omits_title_when_disabled() -> None:
    md, _expected, _segs = _load_fixture("observer-patterns-what-love-teaches")
    doc = extract_spoken_document(md, include_title=False, include_footnotes=False)
    assert not doc.spoken_text.startswith("What Love Teaches")
    assert "Love is chosen." in doc.spoken_text


def test_hash_stable_and_provider_change_invalidates() -> None:
    payload = build_generation_hash_payload(
        spoken_text="Hello.",
        provider="elevenlabs",
        provider_adapter_version="1",
        model="eleven_flash_v2_5",
        voice_alias="reflective-narrator",
        provider_voice_id="abc",
        output_format="mp3_44100_128",
        language="en",
        include_title=True,
        include_footnotes=False,
        instructions=None,
        provider_options={},
        extractor_version=1,
        alignment_strategy="segment-only",
    )
    h1 = generation_hash(payload)
    h2 = generation_hash(payload)
    assert h1 == h2
    assert h1.startswith("sha256:")

    other = dict(payload)
    other["provider"] = "openai"
    assert generation_hash(other) != h1

    voice = dict(payload)
    voice["providerVoiceId"] = "different"
    assert generation_hash(voice) != h1

    instr = dict(payload)
    instr["instructions"] = "Read calmly."
    assert generation_hash(instr) != h1


def test_estimate_elevenlabs_flash_is_quarter_credit_per_char() -> None:
    est = estimate_usage(provider="elevenlabs", model="eleven_flash_v2_5", spoken_characters=211)
    assert est.unit == "credits"
    assert est.amount == 52.75
    standard = estimate_usage(
        provider="elevenlabs", model="eleven_multilingual_v2", spoken_characters=211
    )
    assert standard.amount == 211.0
    turbo = estimate_usage(provider="elevenlabs", model="eleven_turbo_v2_5", spoken_characters=100)
    assert turbo.amount == 25.0


def test_plan_enabled_units_include_pilot_intro(repo_root: Path) -> None:
    plans = plan_units(repo_root, enabled_only=True)
    assert plans, "expected at least one audio-enabled unit"
    intro = next(
        p for p in plans if p.unit_id == "chapter-observer-patterns-front-matter-introduction"
    )
    assert intro.status.startswith("enabled-")
    assert intro.spoken_characters == 211
    assert intro.estimated_usage_amount == 52.75
    assert intro.generation_hash is not None
    if intro.status == "enabled-missing":
        assert intro.regenerate_required is True
    assert all(p.enabled for p in plans)
    assert any(p.edition_slug == "observer-patterns" for p in plans)


def test_plan_chapter_audio_cli_json(repo_root: Path) -> None:
    r = subprocess.run(
        [
            sys.executable,
            str(repo_root / "tools/plan_chapter_audio.py"),
            "--repo",
            str(repo_root),
            "--enabled",
            "--format",
            "json",
        ],
        capture_output=True,
        text=True,
        timeout=180,
        check=False,
    )
    assert r.returncode == 0, r.stderr
    payload = json.loads(r.stdout)
    assert payload["units"], "expected at least one audio-enabled unit"
    intro = next(
        u
        for u in payload["units"]
        if u["unit_id"] == "chapter-observer-patterns-front-matter-introduction"
    )
    assert intro["spoken_characters"] == 211
    assert intro["status"].startswith("enabled-")
    assert intro["status"] in {
        "enabled-missing",
        "enabled-current",
        "enabled-stale",
        "enabled-invalid",
        "enabled-unconfigured",
    }
