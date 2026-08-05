"""Phase 3 chapter-audio provider interface, mock generate, budgets."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import jsonschema
import pytest

REPO = Path(__file__).resolve().parents[1]
TOOLS = REPO / "tools"
if str(TOOLS) not in sys.path:
    sys.path.insert(0, str(TOOLS))

from chapter_audio.adapters.elevenlabs import (  # noqa: E402
    ElevenLabsProvider,
    MockElevenLabsProvider,
)
from chapter_audio.env_loader import load_env_local, resolve_secret  # noqa: E402
from chapter_audio.generate import GenerateError, generate_unit  # noqa: E402
from chapter_audio.provider import GenerationRequest, TtsProvider  # noqa: E402
from chapter_audio.resolve import ResolvedUnitAudio  # noqa: E402

PILOT_INTRO = "chapter-observer-patterns-front-matter-introduction"
INTRO_MD = (REPO / "books" / "observer-patterns" / "front-matter" / "introduction.md").read_text(
    encoding="utf-8"
)


def _configured_unit(**overrides: object) -> ResolvedUnitAudio:
    base = dict(
        unit_id=PILOT_INTRO,
        edition_slug="observer-patterns",
        title="Introduction",
        source_path="front-matter/introduction.md",
        kind="introduction",
        chapter_slug="front-matter-introduction",
        route_key="/explore/books/observer-patterns/chapters/front-matter-introduction",
        enabled=True,
        inherited_fields=(),
        overridden_fields=("enabled",),
        provider="elevenlabs",
        voice_alias="reflective-narrator",
        provider_voice_id="test-voice-id",
        model="eleven_flash_v2_5",
        output_format="mp3_44100_128",
        language="en",
        include_title=True,
        include_footnotes=False,
        instructions=None,
        max_estimated_usd=1.0,
        max_credits=None,
        provider_options={},
        status="enabled-missing",
        status_reason="test",
        settings={"seed": None},
    )
    base.update(overrides)
    return ResolvedUnitAudio(**base)  # type: ignore[arg-type]


def test_tts_provider_protocol_runtime_check() -> None:
    provider: TtsProvider = MockElevenLabsProvider()
    assert isinstance(provider, TtsProvider)
    assert provider.name == "elevenlabs"
    assert provider.adapter_version == "1"


def test_env_local_loader_and_resolve(tmp_path: Path) -> None:
    (tmp_path / ".env.local").write_text(
        "# comment\nELEVENLABS_API_KEY='secret-from-file'\nEMPTY=\n",
        encoding="utf-8",
    )
    vals = load_env_local(tmp_path)
    assert vals["ELEVENLABS_API_KEY"] == "secret-from-file"
    assert resolve_secret("ELEVENLABS_API_KEY", repo=tmp_path, environ={}) == "secret-from-file"
    assert (
        resolve_secret(
            "ELEVENLABS_API_KEY",
            repo=tmp_path,
            environ={"ELEVENLABS_API_KEY": "from-env"},
        )
        == "from-env"
    )


def test_mock_generate_writes_artifact_trio(tmp_path: Path) -> None:
    repo = tmp_path
    book_audio = repo / "books" / "observer-patterns" / "audio"
    book_audio.mkdir(parents=True)
    unit = _configured_unit()
    provider = MockElevenLabsProvider()
    result = generate_unit(
        repo,
        unit,
        provider,
        dry_run=False,
        manuscript_text=INTRO_MD,
    )
    assert result.action == "generated"
    assert result.generation_hash
    audio = repo / "books" / "observer-patterns" / "audio" / "front-matter-introduction.mp3"
    receipt = (
        repo / "books" / "observer-patterns" / "audio" / "front-matter-introduction.receipt.json"
    )
    alignment = (
        repo / "books" / "observer-patterns" / "audio" / "front-matter-introduction.alignment.json"
    )
    assert audio.is_file()
    assert not audio.read_bytes().startswith(b"version https://git-lfs.github.com/spec/v1")
    assert receipt.is_file()
    assert alignment.is_file()

    receipt_doc = json.loads(receipt.read_text(encoding="utf-8"))
    align_doc = json.loads(alignment.read_text(encoding="utf-8"))
    receipt_schema = json.loads(
        (REPO / "schema" / "chapter-audio-receipt.schema.json").read_text(encoding="utf-8")
    )
    align_schema = json.loads(
        (REPO / "schema" / "chapter-audio-alignment.schema.json").read_text(encoding="utf-8")
    )
    jsonschema.validate(receipt_doc, receipt_schema)
    jsonschema.validate(align_doc, align_schema)
    assert receipt_doc["generationHash"] == result.generation_hash
    assert receipt_doc["spokenCharacters"] == 211
    assert align_doc["granularity"] == "segment-only"
    assert len(align_doc["segments"]) >= 1


def test_skip_when_current_unless_force(tmp_path: Path) -> None:
    repo = tmp_path
    (repo / "books" / "observer-patterns" / "audio").mkdir(parents=True)
    unit = _configured_unit()
    log: list[str] = []
    provider = MockElevenLabsProvider(call_log=log)
    first = generate_unit(repo, unit, provider, manuscript_text=INTRO_MD)
    assert first.action == "generated"
    assert log == [PILOT_INTRO]
    second = generate_unit(repo, unit, provider, manuscript_text=INTRO_MD)
    assert second.action == "skip"
    assert log == [PILOT_INTRO]
    third = generate_unit(repo, unit, provider, force=True, manuscript_text=INTRO_MD)
    assert third.action == "generated"
    assert log == [PILOT_INTRO, PILOT_INTRO]


def test_refuse_disabled_and_unconfigured(tmp_path: Path) -> None:
    provider = MockElevenLabsProvider()
    disabled = _configured_unit(enabled=False, status="disabled")
    with pytest.raises(GenerateError, match="disabled"):
        generate_unit(tmp_path, disabled, provider, manuscript_text=INTRO_MD)

    unconfigured = _configured_unit(
        provider_voice_id="PLACEHOLDER_ELEVENLABS_VOICE_ID",
        status="enabled-unconfigured",
        status_reason="voice catalog still has a PLACEHOLDER provider voice id",
    )
    with pytest.raises(GenerateError, match="PLACEHOLDER|unconfigured"):
        generate_unit(tmp_path, unconfigured, provider, manuscript_text=INTRO_MD)


def test_refuse_over_budget_credits(tmp_path: Path) -> None:
    (tmp_path / "books" / "observer-patterns" / "audio").mkdir(parents=True)
    unit = _configured_unit(max_credits=10)
    provider = MockElevenLabsProvider()
    with pytest.raises(GenerateError, match="max_credits"):
        generate_unit(tmp_path, unit, provider, manuscript_text=INTRO_MD)


def test_dry_run_writes_nothing(tmp_path: Path) -> None:
    (tmp_path / "books" / "observer-patterns" / "audio").mkdir(parents=True)
    unit = _configured_unit()
    provider = MockElevenLabsProvider()
    result = generate_unit(tmp_path, unit, provider, dry_run=True, manuscript_text=INTRO_MD)
    assert result.action == "dry-run"
    audio = tmp_path / "books" / "observer-patterns" / "audio" / "front-matter-introduction.mp3"
    assert not audio.exists()


def test_elevenlabs_adapter_uses_injected_transport() -> None:
    spoken = "Hello world."
    req = GenerationRequest(
        unit_id="u",
        spoken_text=spoken,
        voice_alias="reflective-narrator",
        provider_voice_id="voice123",
        model="eleven_flash_v2_5",
        output_format="mp3_44100_128",
        language="en",
    )

    def transport(
        url: str, body: bytes, headers: dict[str, str]
    ) -> tuple[int, bytes, dict[str, str]]:
        assert "xi-api-key" in headers
        assert headers["xi-api-key"] == "test-key"
        assert "voice123" in url
        assert b"Hello world." in body
        payload = {
            "audio_base64": "SUQz",  # "ID3" in base64-ish short; decode may be short
            "alignment": {
                "characters": list(spoken),
                "character_start_times_seconds": [i * 0.05 for i in range(len(spoken))],
                "character_end_times_seconds": [(i + 1) * 0.05 for i in range(len(spoken))],
            },
            "request_id": "req-1",
        }
        # Proper base64 for b"ID3mock"
        import base64

        payload["audio_base64"] = base64.b64encode(b"ID3mock-audio").decode("ascii")
        return 200, json.dumps(payload).encode("utf-8"), {}

    provider = ElevenLabsProvider("test-key", transport=transport)
    result = provider.generate(req)
    assert result.audio_bytes.startswith(b"ID3mock")
    assert result.provider_generation_id == "req-1"
    assert result.raw_alignment is not None


def test_cli_defaults_to_dry_run_for_configured_pilot() -> None:
    proc = subprocess.run(
        [
            sys.executable,
            str(TOOLS / "generate_chapter_audio.py"),
            "--repo",
            str(REPO),
            "--unit",
            PILOT_INTRO,
            "--format",
            "json",
        ],
        cwd=REPO,
        capture_output=True,
        text=True,
        check=False,
    )
    assert proc.returncode == 0, proc.stderr
    # Safe default when --mock/--real omitted is dry-run; if local artifacts are
    # already current, generate skips before the dry-run write path.
    assert "dry-run" in (proc.stderr + proc.stdout).lower() or "skip" in proc.stdout
    payload = json.loads(proc.stdout)
    assert payload["action"] in {"dry-run", "skip"}
    assert payload["unit_id"] == PILOT_INTRO
    if payload["action"] == "dry-run":
        assert payload["estimated_credits"] == 105.5


def test_make_generate_requires_unit() -> None:
    proc = subprocess.run(
        ["make", "generate-chapter-audio"],
        cwd=REPO,
        capture_output=True,
        text=True,
        check=False,
    )
    assert proc.returncode != 0
