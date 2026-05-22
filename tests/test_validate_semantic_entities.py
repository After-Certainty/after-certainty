"""Tests for semantic entity JSON Schema validation."""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

import validate_semantic_entities as vse


def test_validate_real_repo_passes(repo_root: Path) -> None:
    assert (
        vse.validate(
            repo_root,
            include_drafts=False,
            strict_refs=True,
            skip_manifest_round_trip=True,
        )
        == 0
    )


def test_validate_unknown_concept_ref_fails(tmp_path: Path, repo_root: Path) -> None:
    repo = tmp_path / "repo"
    shutil.copytree(repo_root / "schema" / "semantic", repo / "schema" / "semantic")
    gloss = repo / "semantic" / "glossary"
    gloss.mkdir(parents=True)
    (gloss / "bad-ref.yml").write_text(
        "slug: bad-ref\n"
        "title: Bad\n"
        "shortDefinition: x\n"
        "termKind: extended\n"
        "relatedConcepts:\n  - not-a-real-concept\n"
        "relatedPatterns: []\n"
        "relatedBooks: []\n",
        encoding="utf-8",
    )
    (repo / "semantic" / "ontology").mkdir(parents=True)
    (repo / "semantic" / "ontology" / "core-terms.yml").write_text(
        "version: 1\nterms: []\n", encoding="utf-8"
    )
    (repo / "semantic" / "ontology" / "supporting-terms.yml").write_text(
        "version: 1\nterms: []\n", encoding="utf-8"
    )
    assert (
        vse.validate(
            repo,
            include_drafts=False,
            strict_refs=True,
            skip_manifest_round_trip=True,
        )
        == 1
    )


def test_validate_semantic_entities_cli(repo_root: Path) -> None:
    r = subprocess.run(
        [
            sys.executable,
            str(repo_root / "tools" / "validate_semantic_entities.py"),
            "--repo",
            str(repo_root),
            "--strict-refs",
            "--skip-manifest-round-trip",
        ],
        capture_output=True,
        text=True,
        timeout=120,
    )
    assert r.returncode == 0, r.stderr
