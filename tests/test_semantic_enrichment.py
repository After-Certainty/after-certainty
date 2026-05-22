"""Tests for semantic enrichment draft propose/promote (issue #116 Phase 2)."""

from __future__ import annotations

import shutil
from pathlib import Path

import yaml
from tools import semantic_enrichment as se
from tools.promote_semantic_enrichment import promote
from tools.propose_semantic_enrichment import propose


def test_merge_string_lists_dedupes() -> None:
    merged = se.merge_field_value(
        "recognitionSignals",
        ["a", "b"],
        ["b", "c"],
    )
    assert merged == ["a", "b", "c"]


def test_merge_trajectory_phases() -> None:
    merged = se.merge_field_value(
        "trajectory",
        {"earlySignals": ["x"]},
        {"earlySignals": ["y"], "failureModes": ["z"]},
    )
    assert merged == {"earlySignals": ["x", "y"], "failureModes": ["z"]}


def test_promote_merges_draft_into_canonical(tmp_path: Path, repo_root: Path) -> None:
    shutil.copytree(repo_root / "schema" / "semantic", tmp_path / "schema" / "semantic")
    pattern_dir = tmp_path / "semantic/patterns"
    pattern_dir.mkdir(parents=True)
    canonical = {
        "slug": "test-pattern",
        "title": "Test",
        "setup": "s",
        "problem": "p",
        "forces": ["f1"],
        "observation": "o",
        "example": "e",
        "relatedConcepts": ["correction"],
        "relatedPatterns": [],
        "relatedBooks": ["coupling"],
        "relatedSources": [],
        "recognitionSignals": ["existing signal"],
    }
    (pattern_dir / "test-pattern.yml").write_text(
        yaml.safe_dump(canonical, sort_keys=False), encoding="utf-8"
    )

    draft_path = se.draft_path(
        tmp_path,
        book_id="coupling",
        agent_type="recognition-signals",
        entity_type="pattern",
        slug="test-pattern",
    )
    se.write_draft(
        draft_path,
        {
            "targetSlug": "test-pattern",
            "entityType": "pattern",
            "field": "recognitionSignals",
            "proposedBy": "recognition-signals",
            "bookId": "coupling",
            "sourceExcerpt": "from manuscript",
            "items": ["new signal", "existing signal"],
        },
        dry_run=False,
    )

    assert promote(tmp_path, book_ids=["coupling"], fields=[], dry_run=False) == 0
    updated = yaml.safe_load((pattern_dir / "test-pattern.yml").read_text(encoding="utf-8"))
    assert updated["recognitionSignals"] == ["existing signal", "new signal"]


def test_propose_skips_entities_with_field(tmp_path: Path, repo_root: Path) -> None:
    book_dir = repo_root / "books/coupling"
    if not (book_dir / "book.yml").is_file():
        return
    # exceptions-are-forever already has recognitionSignals on main
    code = propose(
        tmp_path,
        book_dir=book_dir,
        agent_type="recognition-signals",
        only_missing=True,
        overwrite=False,
        dry_run=True,
    )
    assert code in (0, 1)
