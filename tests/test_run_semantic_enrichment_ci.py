"""Tests for Phase 3 semantic enrichment CI runner."""

from __future__ import annotations

from pathlib import Path

from tools.run_semantic_enrichment_ci import _ontology_lint_report, run
from tools.semantic_enrichment import find_book_dir


def test_find_book_dir_coupling(repo_root: Path) -> None:
    rel = find_book_dir(repo_root, "coupling")
    assert rel == Path("books/coupling")


def test_dry_run_discovery_writes_report(repo_root: Path, tmp_path: Path) -> None:
    import shutil

    shutil.copytree(repo_root / "books/coupling", tmp_path / "books/coupling")
    shutil.copytree(repo_root / "schema" / "semantic", tmp_path / "schema" / "semantic")
    for sub in ("glossary", "patterns", "situations", "sources", "ontology"):
        src = repo_root / "semantic" / sub
        if src.is_dir():
            shutil.copytree(src, tmp_path / "semantic" / sub)
    if (repo_root / "semantic/relationships.yml").is_file():
        shutil.copy2(
            repo_root / "semantic/relationships.yml",
            tmp_path / "semantic/relationships.yml",
        )

    code = run(
        tmp_path,
        book_id="coupling",
        agent_type="discovery",
        all_entities=False,
        overwrite=False,
        base_branch="main",
        dry_run=True,
    )
    assert code == 0
    reports = list(
        (tmp_path / "semantic/_drafts/enrichment/coupling/lint-reports").glob("discovery-*.md")
    )
    assert reports


def test_ontology_lint_report_smoke(repo_root: Path, tmp_path: Path) -> None:
    path = _ontology_lint_report(repo_root, "coupling")
    assert path.is_file()
    assert "Ontology lint" in path.read_text(encoding="utf-8")
    path.unlink(missing_ok=True)
