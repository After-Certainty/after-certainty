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
            strict_audit=False,
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
            strict_audit=False,
            skip_manifest_round_trip=True,
        )
        == 1
    )


def test_validate_semantic_entities_cli_help(repo_root: Path) -> None:
    """CLI wiring smoke test — full-repo validation is covered by test_validate_real_repo_passes."""
    r = subprocess.run(
        [
            sys.executable,
            str(repo_root / "tools" / "validate_semantic_entities.py"),
            "--help",
        ],
        capture_output=True,
        text=True,
        timeout=30,
    )
    assert r.returncode == 0, r.stderr
    assert "--skip-manifest-round-trip" in r.stdout
    assert "--strict-refs" in r.stdout


def test_validate_creator_slug_mismatch_warns(tmp_path: Path, repo_root: Path) -> None:
    repo = tmp_path / "repo"
    shutil.copytree(repo_root / "schema" / "semantic", repo / "schema" / "semantic")
    for sub in ("ontology", "glossary", "thinkers", "sources"):
        (repo / "semantic" / sub).mkdir(parents=True)
    (repo / "semantic" / "ontology" / "core-terms.yml").write_text(
        "version: 1\nterms: []\n", encoding="utf-8"
    )
    (repo / "semantic" / "ontology" / "supporting-terms.yml").write_text(
        "version: 1\nterms: []\n", encoding="utf-8"
    )
    (repo / "semantic" / "glossary" / "agile.yml").write_text(
        "slug: agile\ntitle: Agile\nshortDefinition: x\ntermKind: extended\n"
        "relatedConcepts: []\nrelatedPatterns: []\nrelatedBooks: []\n",
        encoding="utf-8",
    )
    (repo / "semantic" / "thinkers" / "alistair-cockburn.yml").write_text(
        "slug: alistair-cockburn\nname: Alistair Cockburn\ntype: person\n"
        "summary: test\nconcepts: []\npatterns: []\nrelatedBooks: []\nworks: []\n",
        encoding="utf-8",
    )
    (repo / "semantic" / "sources" / "bad-creator.yml").write_text(
        "slug: bad-creator\n"
        "name: Bad Creator\n"
        "type: article\n"
        "summary: test\n"
        "concepts: []\npatterns: []\nrelatedBooks: []\n"
        "creatorNames:\n- Nobody\n"
        "creatorSlugs:\n- not-a-thinker\n"
        "sourceKind: article\n",
        encoding="utf-8",
    )
    rc = vse.validate(
        repo,
        include_drafts=False,
        strict_refs=True,
        strict_audit=False,
        skip_manifest_round_trip=True,
    )
    assert rc == 0


def test_validate_strict_audit_fails_on_empty_thinker(tmp_path: Path, repo_root: Path) -> None:
    repo = tmp_path / "repo"
    shutil.copytree(repo_root / "schema" / "semantic", repo / "schema" / "semantic")
    for sub in ("ontology", "glossary", "thinkers", "sources"):
        (repo / "semantic" / sub).mkdir(parents=True)
    (repo / "semantic" / "ontology" / "core-terms.yml").write_text(
        "version: 1\nterms: []\n", encoding="utf-8"
    )
    (repo / "semantic" / "ontology" / "supporting-terms.yml").write_text(
        "version: 1\nterms: []\n", encoding="utf-8"
    )
    (repo / "semantic" / "thinkers" / "empty-thinker.yml").write_text(
        "slug: empty-thinker\nname: Empty Thinker\ntype: person\n"
        "summary: test\nconcepts: []\npatterns: []\nrelatedBooks: []\nworks: []\n",
        encoding="utf-8",
    )
    rc = vse.validate(
        repo,
        include_drafts=False,
        strict_refs=True,
        strict_audit=True,
        skip_manifest_round_trip=True,
    )
    assert rc == 1
