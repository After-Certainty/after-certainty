"""Scope GitHub Actions book exports to inputs that affect generated artifacts.

This test intentionally does not invoke Pandoc, Typst, Vercel, or releases.
"""

import importlib
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
affected_books_module = importlib.import_module("ci_affected_books")
affected_books = affected_books_module.affected_books
triggers_full_rebuild = affected_books_module.triggers_full_rebuild


def test_reporting_tools_and_other_workflows_do_not_force_a_full_book_matrix() -> None:
    for path in (
        "tools/audit_bibliography_semantic_drift.py",
        "tools/reconcile_phase19_existing_sources.py",
        "tools/report_source_integrity_phase19.py",
        ".github/workflows/site-ci.yml",
        ".github/workflows/python-tests.yml",
        ".github/workflows/codeql.yml",
    ):
        assert not triggers_full_rebuild(path), path


def test_unknown_tools_and_actual_export_dependencies_still_rebuild_all() -> None:
    for path in (
        "tools/ci_affected_books.py",
        "tools/build.py",
        "scripts/build_pdf.sh",
        "schema/book.schema.json",
        "templates/cover.tex",
        ".github/workflows/book-export-release.yml",
        "Makefile",
    ):
        assert triggers_full_rebuild(path), path


def test_report_only_changes_have_zero_export_jobs(tmp_path: Path) -> None:
    books = [tmp_path / "books" / name for name in ("alpha", "beta")]
    assert affected_books(
        tmp_path,
        ["reports/citation-audit.md", "tools/report_source_integrity_phase19.py"],
        books,
    ) == []


def test_reporting_change_plus_one_book_change_builds_only_that_book(tmp_path: Path) -> None:
    books = [tmp_path / "books" / name for name in ("alpha", "beta")]
    assert affected_books(
        tmp_path,
        ["books/alpha/chapters/01.md", "tools/audit_bibliography_semantic_drift.py"],
        books,
    ) == [books[0]]
    assert affected_books(
        tmp_path, ["books/alpha/chapters/01.md", "tools/ci_affected_books.py"], books
    ) == books
