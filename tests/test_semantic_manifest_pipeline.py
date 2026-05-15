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
    patterns = gsm.build_patterns(repo_root)
    assert isinstance(patterns, list)
    assert len(patterns) >= 1
    sources = gsm.build_sources(repo_root)
    assert isinstance(sources, list)
    assert len(sources) >= 1
