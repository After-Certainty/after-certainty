"""Phase 4 chapter-audio validate/verify (secret-free) and CI publish dry-run."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import jsonschema

REPO = Path(__file__).resolve().parents[1]
TOOLS = REPO / "tools"
if str(TOOLS) not in sys.path:
    sys.path.insert(0, str(TOOLS))

from chapter_audio.validate import (  # noqa: E402
    validate_artifact_tree,
    validate_chapter_audio,
    validate_voice_catalog,
)


def test_validate_voice_catalog_ok() -> None:
    issues = validate_voice_catalog(REPO)
    assert issues == []


def test_validate_chapter_audio_cli_passes_without_artifacts() -> None:
    # Present local OP audio is fine; validate must not require secrets or network.
    r = subprocess.run(
        [sys.executable, str(REPO / "tools/validate_chapter_audio.py"), "--repo", str(REPO)],
        capture_output=True,
        text=True,
        timeout=180,
        check=False,
    )
    assert r.returncode == 0, r.stderr


def test_verify_chapter_audio_writes_manifest(tmp_path: Path) -> None:
    out = tmp_path / "chapter-audio-manifest.json"
    r = subprocess.run(
        [
            sys.executable,
            str(REPO / "tools/verify_chapter_audio.py"),
            "--repo",
            str(REPO),
            "--out",
            str(out),
        ],
        capture_output=True,
        text=True,
        timeout=180,
        check=False,
    )
    assert r.returncode == 0, r.stderr
    assert out.is_file()
    payload = json.loads(out.read_text(encoding="utf-8"))
    schema = json.loads(
        (REPO / "schema/chapter-audio-manifest.schema.json").read_text(encoding="utf-8")
    )
    jsonschema.validate(payload, schema)


def test_validate_rejects_lfs_pointer_audio(tmp_path: Path) -> None:
    audio_dir = tmp_path / "books" / "observer-patterns" / "audio"
    audio_dir.mkdir(parents=True)
    receipt = {
        "schemaVersion": 1,
        "unitId": "chapter-observer-patterns-front-matter-introduction",
        "editionSlug": "observer-patterns",
        "chapterSlug": "front-matter-introduction",
        "sourcePath": "front-matter/introduction.md",
        "sourceHash": "sha256:" + ("a" * 64),
        "spokenTextHash": "sha256:" + ("b" * 64),
        "generationHash": "sha256:" + ("c" * 64),
        "pipelineVersion": 1,
        "extractorVersion": 1,
        "provider": "elevenlabs",
        "providerAdapterVersion": "1",
        "model": "eleven_flash_v2_5",
        "voice": {"alias": "reflective-narrator", "providerVoiceId": "voice"},
        "outputFormat": "mp3_44100_128",
        "spokenCharacters": 10,
        "audioPath": "books/observer-patterns/audio/front-matter-introduction.mp3",
        "generatedAt": "2026-08-05T00:00:00Z",
    }
    (audio_dir / "front-matter-introduction.receipt.json").write_text(
        json.dumps(receipt), encoding="utf-8"
    )
    (audio_dir / "front-matter-introduction.mp3").write_text(
        "version https://git-lfs.github.com/spec/v1\noid sha256:abc\nsize 12\n",
        encoding="utf-8",
    )
    # Minimal schemas + voice catalog for validate_artifact_tree via full validate
    # would need schemas under tmp_path — exercise artifact helper against REPO schemas
    # by copying schema tree is heavy; call validate_artifact_tree with REPO after
    # placing files is wrong path. Instead invoke classify via validate_artifact_tree
    # with a repo that has schemas symlinked.
    for name in (
        "chapter-audio-receipt.schema.json",
        "chapter-audio-alignment.schema.json",
        "chapter-audio-voices.schema.json",
        "chapter-audio-manifest.schema.json",
    ):
        (tmp_path / "schema").mkdir(exist_ok=True)
        (tmp_path / "schema" / name).write_text(
            (REPO / "schema" / name).read_text(encoding="utf-8"), encoding="utf-8"
        )
    (tmp_path / "config").mkdir()
    (tmp_path / "config" / "chapter-audio-voices.yml").write_text(
        (REPO / "config" / "chapter-audio-voices.yml").read_text(encoding="utf-8"),
        encoding="utf-8",
    )
    issues = validate_artifact_tree(tmp_path)
    assert any("LFS pointer" in i.message for i in issues if i.level == "error")


def test_run_chapter_audio_ci_dry_run_no_changes() -> None:
    r = subprocess.run(
        [
            sys.executable,
            str(REPO / "tools/run_chapter_audio_ci.py"),
            "--repo",
            str(REPO),
            "--dry-run",
            "--unit",
            "chapter-observer-patterns-front-matter-introduction",
        ],
        capture_output=True,
        text=True,
        timeout=60,
        check=False,
    )
    assert r.returncode == 0, r.stderr
    assert "No books/*/audio changes" in r.stderr or "dry-run:" in r.stdout + r.stderr


def test_validate_chapter_audio_module_collects_issues() -> None:
    issues = validate_chapter_audio(REPO)
    assert all(i.level in {"error", "warning"} for i in issues)
    assert not any(i.level == "error" for i in issues)
