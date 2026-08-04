"""Phase 1 chapter-audio schemas, resolve, and list (secret-free)."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import jsonschema
import yaml

REPO = Path(__file__).resolve().parents[1]
TOOLS = REPO / "tools"
if str(TOOLS) not in sys.path:
    sys.path.insert(0, str(TOOLS))

from chapter_audio.resolve import (  # noqa: E402
    classify_status,
    merge_audio_settings,
    resolve_unit_audio,
)


def _load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def test_voice_catalog_matches_schema() -> None:
    schema = _load_json(REPO / "schema/chapter-audio-voices.schema.json")
    data = yaml.safe_load((REPO / "config/chapter-audio-voices.yml").read_text(encoding="utf-8"))
    jsonschema.Draft202012Validator(schema).validate(data)


def test_receipt_alignment_manifest_schemas_accept_examples() -> None:
    receipt_schema = _load_json(REPO / "schema/chapter-audio-receipt.schema.json")
    alignment_schema = _load_json(REPO / "schema/chapter-audio-alignment.schema.json")
    manifest_schema = _load_json(REPO / "schema/chapter-audio-manifest.schema.json")
    digest = "a" * 64
    receipt = {
        "schemaVersion": 1,
        "unitId": "chapter-after-certainty-front-matter-introduction",
        "generationHash": f"sha256:{digest}",
        "provider": "elevenlabs",
        "providerAdapterVersion": "1",
        "model": "eleven_flash_v2_5",
        "voice": {"alias": "reflective-narrator", "providerVoiceId": "abc"},
        "outputFormat": "mp3_44100_128",
        "spokenCharacters": 10,
        "audioPath": "books/after-certainty/audio/front-matter-introduction.mp3",
        "generatedAt": "2026-08-04T00:00:00Z",
        "alignment": {"granularity": "segment-only", "path": None},
    }
    alignment = {
        "schemaVersion": 1,
        "unitId": "chapter-after-certainty-front-matter-introduction",
        "generationHash": f"sha256:{digest}",
        "granularity": "segment-only",
        "segments": [{"id": "s0001", "text": "Hi.", "startMs": 0, "endMs": 100}],
    }
    manifest = {
        "schemaVersion": 1,
        "generatedAt": "2026-08-04T00:00:00Z",
        "units": [
            {
                "unitId": "chapter-after-certainty-front-matter-introduction",
                "editionSlug": "after-certainty",
                "chapterSlug": "front-matter-introduction",
                "routeKey": "/explore/books/after-certainty/chapters/front-matter-introduction",
                "audioUrl": "/generated/audio/after-certainty/front-matter-introduction.mp3",
                "alignmentGranularity": "none",
                "generationHash": f"sha256:{digest}",
                "disclosure": "AI-generated narration",
            }
        ],
    }
    jsonschema.Draft202012Validator(receipt_schema).validate(receipt)
    jsonschema.Draft202012Validator(alignment_schema).validate(alignment)
    jsonschema.Draft202012Validator(manifest_schema).validate(manifest)


def test_merge_requires_explicit_unit_enabled() -> None:
    merged, _inh, over = merge_audio_settings(
        {"enabled": True, "provider": "elevenlabs", "voice": "reflective-narrator"},
        {"max_credits": 100},
    )
    assert merged["enabled"] is False
    assert "enabled" not in over
    merged2, _i2, over2 = merge_audio_settings(
        {"enabled": False, "provider": "elevenlabs", "voice": "reflective-narrator"},
        {"enabled": True, "max_credits": 100},
    )
    assert merged2["enabled"] is True
    assert "enabled" in over2
    assert merged2["max_credits"] == 100


def test_placeholder_voice_is_unconfigured() -> None:
    status, reason = classify_status(
        enabled=True,
        provider="elevenlabs",
        voice_alias="reflective-narrator",
        provider_voice_id="PLACEHOLDER_ELEVENLABS_VOICE_ID",
        model="eleven_flash_v2_5",
    )
    assert status == "enabled-unconfigured"
    assert "PLACEHOLDER" in reason


def test_resolve_pilot_introduction_unconfigured_until_voice(repo_root: Path) -> None:
    unit = resolve_unit_audio(
        repo=repo_root,
        edition_slug="after-certainty",
        chapter={
            "id": "chapter-after-certainty-front-matter-introduction",
            "title": "Introduction",
            "sourcePath": "front-matter/introduction.md",
            "kind": "introduction",
            "chapterSlug": "front-matter-introduction",
            "routeKey": "/explore/books/after-certainty/chapters/front-matter-introduction",
        },
        book_defaults={
            "enabled": False,
            "provider": "elevenlabs",
            "voice": "reflective-narrator",
            "model": "eleven_flash_v2_5",
            "output_format": "mp3_44100_128",
        },
        unit_audio={"enabled": True, "max_credits": 9000},
    )
    assert unit.enabled is True
    assert unit.status == "enabled-unconfigured"
    assert unit.provider == "elevenlabs"
    assert unit.voice_alias == "reflective-narrator"
    assert "max_credits" in unit.overridden_fields


def test_list_chapter_audio_enabled_filter(repo_root: Path) -> None:
    r = subprocess.run(
        [
            sys.executable,
            str(repo_root / "tools/list_chapter_audio.py"),
            "--repo",
            str(repo_root),
            "--filter",
            "enabled",
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
    units = payload["units"]
    assert len(units) >= 1
    ids = {u["unitId"] for u in units}
    assert "chapter-after-certainty-front-matter-introduction" in ids
    # Pilot only: no other enabled units yet
    assert ids == {"chapter-after-certainty-front-matter-introduction"}
    pilot = next(
        u for u in units if u["unitId"] == "chapter-after-certainty-front-matter-introduction"
    )
    assert pilot["status"] == "enabled-unconfigured"


def test_after_certainty_book_spec_still_validates(repo_root: Path) -> None:
    r = subprocess.run(
        [
            sys.executable,
            str(repo_root / "tools/validate_book_specs.py"),
            "--repo",
            str(repo_root),
        ],
        capture_output=True,
        text=True,
        timeout=120,
        check=False,
    )
    assert r.returncode == 0, r.stderr


def test_chapter_enrichment_with_audio_validates() -> None:
    schema = _load_json(REPO / "schema/semantic/chapter-enrichment.schema.json")
    # Resolve common.json relative to schema dir via RefResolver
    schema_dir = REPO / "schema/semantic"
    store = {}
    common = _load_json(schema_dir / "common.json")
    store[common["$id"]] = common
    store[schema["$id"]] = schema
    resolver = jsonschema.RefResolver.from_schema(schema, store=store)
    validator = jsonschema.Draft202012Validator(schema, resolver=resolver)
    data = yaml.safe_load(
        (REPO / "books/after-certainty/chapter-enrichment.yml").read_text(encoding="utf-8")
    )
    validator.validate(data)
