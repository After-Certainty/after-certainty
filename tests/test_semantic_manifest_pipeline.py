"""Smoke tests for semantic manifest generation and JSON Schema validation."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path


def test_generate_semantic_manifest_cli(repo_root: Path, tmp_path: Path) -> None:
    out = tmp_path / "semantic-manifest.json"
    cmd = [
        sys.executable,
        str(repo_root / "tools/generate_semantic_manifest.py"),
        "--repo",
        str(repo_root),
        "--out",
        str(out),
        "--github-repository",
        "test-owner/test-repo",
        "--github-ref",
        "main",
        "--release-tag",
        "latest",
        "--no-warn-term-kind",
    ]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
    assert r.returncode == 0, f"stderr:\n{r.stderr}\nstdout:\n{r.stdout}"
    data = json.loads(out.read_text(encoding="utf-8"))
    assert data.get("manifestVersion") == 1
    assert isinstance(data.get("books"), list)
    assert isinstance(data.get("glossary"), list)
    assert isinstance(data.get("patterns"), list)
    assert isinstance(data.get("sources"), list)
    assert isinstance(data.get("relationships"), list)
    assert isinstance(data.get("situations"), list)
    assert isinstance(data.get("ontology"), dict)


def test_validate_semantic_manifest_cli(repo_root: Path, tmp_path: Path) -> None:
    out = tmp_path / "semantic-manifest.json"
    gen = subprocess.run(
        [
            sys.executable,
            str(repo_root / "tools/generate_semantic_manifest.py"),
            "--repo",
            str(repo_root),
            "--out",
            str(out),
            "--github-repository",
            "o/r",
            "--no-warn-term-kind",
        ],
        capture_output=True,
        text=True,
        timeout=180,
    )
    assert gen.returncode == 0, gen.stderr
    val = subprocess.run(
        [
            sys.executable,
            str(repo_root / "tools/validate_semantic_manifest.py"),
            "--repo",
            str(repo_root),
            "--manifest",
            str(out),
        ],
        capture_output=True,
        text=True,
        timeout=60,
    )
    assert val.returncode == 0, val.stderr


def test_import_build_glossary_and_patterns(repo_root: Path) -> None:
    """Faster check that core builders run without raising (uses real repo semantic/)."""
    import generate_semantic_manifest as gsm

    by_gloss, core, supporting = gsm.build_glossary_entries(repo_root, warn_term_kind=False)
    assert isinstance(by_gloss, dict)
    assert len(by_gloss) >= 1
    patterns = gsm.build_patterns(repo_root, repo_slug="test-owner/test-repo", ref="main")
    assert isinstance(patterns, list)
    assert len(patterns) >= 1
    sources = gsm.build_sources(repo_root)
    assert isinstance(sources, list)
    assert len(sources) >= 1


def test_semantic_manifest_includes_wolty_media(repo_root: Path, tmp_path: Path) -> None:
    out = tmp_path / "semantic-manifest.json"
    gen = subprocess.run(
        [
            sys.executable,
            str(repo_root / "tools/generate_semantic_manifest.py"),
            "--repo",
            str(repo_root),
            "--out",
            str(out),
            "--github-repository",
            "ksteffe/after-certainty",
            "--github-ref",
            "main",
            "--no-warn-term-kind",
        ],
        capture_output=True,
        text=True,
        timeout=180,
    )
    assert gen.returncode == 0, gen.stderr
    data = json.loads(out.read_text(encoding="utf-8"))

    wolty = next(b for b in data["books"] if b["slug"] == "when-others-look-to-you-v1")
    assert wolty["media"]["intro"]["youtubeVideoId"] == "ma1UbSajuVI"
    assert "youtube.com/playlist" in wolty["media"]["patterns"]["youtubePlaylistUrl"]
    assert wolty["isbns"] == ["9798257484926"]
    assert wolty["purchaseLinks"][0]["retailer"] == "amazon"
    assert wolty["purchaseLinks"][0]["url"] == "https://www.amazon.com/gp/product/B0GX34SRDJ"
    assert wolty["purchaseLinks"][0]["label"] == "Buy on Amazon"

    coupling = next(b for b in data["books"] if b["slug"] == "coupling")
    assert "isbns" not in coupling
    assert "purchaseLinks" not in coupling

    attention = next(p for p in data["patterns"] if p["slug"] == "attention-finds-a-focus")
    assert attention["youtubeVideoId"] == "3N-vY1i5rg8"
    assert attention["infographic"]["url"].startswith("https://raw.githubusercontent.com/")
    assert attention["infographic"]["path"] == "semantic/media/patterns/attention-finds-a-focus.png"

    dissent = next(p for p in data["patterns"] if p["slug"] == "dissent-is-welcomed")
    assert dissent["mediumArticleUrl"].startswith("https://medium.com/")
    assert dissent["infographic"]["width"] == 1200

    disagreement = next(p for p in data["patterns"] if p["slug"] == "disagreement-is-suppressed")
    assert "youtubeVideoId" not in disagreement
    assert disagreement["mediumArticleUrl"].startswith("https://medium.com/")
