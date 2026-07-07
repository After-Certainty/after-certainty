"""Tests for apply_concept_grounding tooling."""

from __future__ import annotations

from pathlib import Path

import yaml

import apply_concept_grounding as acg
from thinker_concept_audit import find_concept_grounding_gaps


def _write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def test_apply_adds_missing_concepts(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    _write(repo / "semantic/ontology/core-terms.yml", "version: 1\nterms: []\n")
    _write(repo / "semantic/ontology/supporting-terms.yml", "version: 1\nterms: []\n")
    _write(
        repo / "semantic/glossary/agile.yml",
        "slug: agile\ntitle: Agile\nshortDefinition: Agile is iterative development.\n"
        "termKind: extended\nrelatedConcepts: []\nrelatedPatterns: []\nrelatedBooks: []\n",
    )
    _write(
        repo / "semantic/sources/agile-manifesto.yml",
        "slug: agile-manifesto\n"
        "name: Kent Beck — Manifesto for Agile Software Development\n"
        "type: article\nsummary: Manifesto for Agile Software Development.\n"
        "title: Manifesto for Agile Software Development.\n"
        "concepts: []\npatterns: []\nrelatedBooks: []\n"
        "creatorSlugs:\n- kent-beck\n",
    )
    _write(
        repo / "semantic/thinkers/kent-beck.yml",
        "slug: kent-beck\nname: Kent Beck\ntype: person\nsummary: Manifesto signatory.\n"
        "concepts: []\npatterns: []\nrelatedBooks: []\n"
        "works:\n- agile-manifesto\n",
    )

    stats = acg.apply_concept_grounding(repo, dry_run=False)
    assert stats["concepts_added"] >= 2

    source = yaml.safe_load((repo / "semantic/sources/agile-manifesto.yml").read_text())
    thinker = yaml.safe_load((repo / "semantic/thinkers/kent-beck.yml").read_text())
    assert "agile" in source["concepts"]
    assert "agile" in thinker["concepts"]

    assert find_concept_grounding_gaps(repo) == []
