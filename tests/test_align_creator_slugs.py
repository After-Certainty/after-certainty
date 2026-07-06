"""Tests for creatorSlug alignment tooling."""

from __future__ import annotations

from pathlib import Path

import yaml

import align_creator_slugs as acs


def _write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def _mini_repo(tmp_path: Path) -> Path:
    repo = tmp_path / "repo"
    _write(repo / "semantic/ontology/core-terms.yml", "version: 1\nterms: []\n")
    _write(repo / "semantic/ontology/supporting-terms.yml", "version: 1\nterms: []\n")
    _write(
        repo / "semantic/thinkers/ross-lee-and-richard-nisbett.yml",
        "slug: ross-lee-and-richard-nisbett\n"
        "name: Ross and Nisbett\ntype: person\nsummary: test\n"
        "concepts: []\npatterns: []\nrelatedBooks: []\nworks: []\n",
    )
    _write(
        repo / "semantic/sources/ross-lee-the-intuitive-psychologist-and-his-shortcomings.yml",
        "slug: ross-lee-the-intuitive-psychologist-and-his-shortcomings\n"
        "name: Lee Ross paper\ntype: article\nsummary: test\n"
        "concepts: []\npatterns: []\nrelatedBooks: []\n"
        "creatorNames:\n- Lee Ross\n"
        "creatorSlugs:\n- lee-ross\n"
        "sourceKind: article\n",
    )
    return repo


def test_apply_remaps_to_existing_thinker(tmp_path: Path) -> None:
    repo = _mini_repo(tmp_path)
    actions = acs.apply_remaps(repo, apply=True)
    assert any("lee-ross" in line for line in actions)
    doc = yaml.safe_load(
        (
            repo / "semantic/sources/ross-lee-the-intuitive-psychologist-and-his-shortcomings.yml"
        ).read_text(encoding="utf-8")
    )
    assert doc["creatorSlugs"] == ["ross-lee-and-richard-nisbett"]


def test_create_missing_thinker(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    _write(repo / "semantic/ontology/core-terms.yml", "version: 1\nterms: []\n")
    _write(repo / "semantic/ontology/supporting-terms.yml", "version: 1\nterms: []\n")
    _write(
        repo / "semantic/sources/john-carreyrou-bad-blood.yml",
        "slug: john-carreyrou-bad-blood\n"
        "name: John Carreyrou — Bad Blood\ntype: book\nsummary: test\n"
        "concepts: []\npatterns: []\nrelatedBooks: []\n"
        "creatorNames:\n- John Carreyrou\n"
        "creatorSlugs:\n- john-carreyrou\n"
        "sourceKind: book\n",
    )
    actions = acs.create_missing_thinkers(repo, apply=True)
    assert any("john-carreyrou" in line for line in actions)
    thinker = repo / "semantic/thinkers/john-carreyrou.yml"
    assert thinker.is_file()
    assert acs.find_mismatches(repo) == []
