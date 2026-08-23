"""Tests for semantic YAML verification (parse + slug rules)."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import verify_semantic_yaml as vs


def test_verify_real_repo_passes(repo_root: Path) -> None:
    assert vs.verify(repo_root, include_drafts=False, strict_prose=False) == 0


def test_verify_slug_mismatch_fails(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    gloss = repo / "semantic" / "glossary"
    gloss.mkdir(parents=True)
    (gloss / "correct-slug.yml").write_text(
        "slug: wrong-slug\ntitle: T\nshortDefinition: x\ntermKind: extended\n"
        "relatedConcepts: []\nrelatedPatterns: []\nrelatedBooks: []\n",
        encoding="utf-8",
    )
    assert vs.verify(repo, include_drafts=False, strict_prose=False) == 1


def test_verify_invalid_yaml_fails(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    gloss = repo / "semantic" / "glossary"
    gloss.mkdir(parents=True)
    (gloss / "broken.yml").write_text("slug: x\n[ invalid", encoding="utf-8")
    assert vs.verify(repo, include_drafts=False, strict_prose=False) == 1


def test_verify_semantic_yaml_cli_help(repo_root: Path) -> None:
    """CLI wiring smoke test — full-repo verify is covered by test_verify_real_repo_passes."""
    r = subprocess.run(
        [
            sys.executable,
            str(repo_root / "tools/verify_semantic_yaml.py"),
            "--help",
        ],
        capture_output=True,
        text=True,
        timeout=30,
    )
    assert r.returncode == 0, r.stderr
    assert "--repo" in r.stdout
