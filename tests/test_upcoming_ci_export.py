"""CI export eligibility and rolling-release rules for upcoming books."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import pytest
from tools.book_specs import (
    ci_export_books,
    load_book_spec,
    resolve_spec_path,
    spec_formats,
    spec_in_latest_release,
    upcoming_export_stems,
)


@pytest.fixture(scope="session")
def ci_export_rels(repo_root: Path) -> set[str]:
    return {p.relative_to(repo_root).as_posix() for p in ci_export_books(repo_root)}


@pytest.fixture(scope="session")
def upcoming_stems(repo_root: Path) -> set[str]:
    return upcoming_export_stems(repo_root)


@pytest.fixture(scope="session")
def ci_docx_matrix_payload(repo_root: Path) -> dict:
    """Build the --all/--format=docx matrix once (avoids ~8s subprocess per book)."""
    tools = str(repo_root / "tools")
    if tools not in sys.path:
        sys.path.insert(0, tools)
    import ci_affected_books as cab

    all_books = cab.find_book_dirs(repo_root)
    books = [
        b
        for b in all_books
        if {"docx"}
        & set(
            cab.spec_formats(cab.load_spec_for_rel(repo_root, b.relative_to(repo_root).as_posix()))
        )
    ]
    return {
        "include": cab.matrix_entries(repo_root, books),
        "empty": len(books) == 0,
        "count": len(books),
    }


def test_published_everyone_knows_love_in_ci_matrix(
    repo_root: Path, ci_export_rels: set[str]
) -> None:
    spec_path = resolve_spec_path(repo_root / "books" / "everyone-knows-love")
    assert spec_path is not None
    spec = load_book_spec(spec_path)
    assert spec_formats(spec) == ["docx", "epub", "pdf"]
    assert spec_in_latest_release(spec) is True
    assert "books/everyone-knows-love" in ci_export_rels


def test_upcoming_without_exports_excluded_from_ci_matrix(ci_export_rels: set[str]) -> None:
    # What We Cannot See has been promoted to books/
    assert "upcoming/what-we-cannot-see" not in ci_export_rels


def test_published_the_world_we_make_together_in_ci_matrix(
    repo_root: Path,
    ci_docx_matrix_payload: dict,
    ci_export_rels: set[str],
    upcoming_stems: set[str],
) -> None:
    spec_path = resolve_spec_path(repo_root / "books" / "the-world-we-make-together")
    assert spec_path is not None
    spec = load_book_spec(spec_path)
    assert spec_formats(spec) == ["docx", "epub", "pdf"]
    assert spec_in_latest_release(spec) is True

    assert "books/the-world-we-make-together" in ci_export_rels
    assert "upcoming/the-world-we-make-together" not in ci_export_rels
    assert "the-world-we-make-together" not in upcoming_stems

    row = next(
        e
        for e in ci_docx_matrix_payload["include"]
        if e["dir"] == "books/the-world-we-make-together"
    )
    assert row["has_docx"] == "true"
    assert row["has_epub"] == "true"
    assert row["has_pdf"] == "true"


def test_published_no_time_to_think_in_ci_matrix(
    repo_root: Path,
    ci_docx_matrix_payload: dict,
    ci_export_rels: set[str],
    upcoming_stems: set[str],
) -> None:
    spec_path = resolve_spec_path(repo_root / "books" / "no-time-to-think")
    assert spec_path is not None
    spec = load_book_spec(spec_path)
    assert spec_formats(spec) == ["docx", "epub", "pdf"]
    assert spec_in_latest_release(spec) is True

    assert "books/no-time-to-think" in ci_export_rels
    assert "upcoming/no-time-to-think" not in ci_export_rels
    assert "no-time-to-think" not in upcoming_stems

    row = next(e for e in ci_docx_matrix_payload["include"] if e["dir"] == "books/no-time-to-think")
    assert row["has_docx"] == "true"
    assert row["has_epub"] == "true"
    assert row["has_pdf"] == "true"


def test_published_the_case_that_does_not_fit_in_ci_matrix(
    repo_root: Path,
    ci_docx_matrix_payload: dict,
    ci_export_rels: set[str],
    upcoming_stems: set[str],
) -> None:
    spec_path = resolve_spec_path(repo_root / "books" / "the-case-that-does-not-fit")
    assert spec_path is not None
    spec = load_book_spec(spec_path)
    assert spec_formats(spec) == ["docx", "epub", "pdf"]
    assert spec_in_latest_release(spec) is True

    assert "books/the-case-that-does-not-fit" in ci_export_rels
    assert "upcoming/the-case-that-does-not-fit" not in ci_export_rels
    assert "the-case-that-does-not-fit" not in upcoming_stems

    row = next(
        e
        for e in ci_docx_matrix_payload["include"]
        if e["dir"] == "books/the-case-that-does-not-fit"
    )
    assert row["has_docx"] == "true"
    assert row["has_epub"] == "true"
    assert row["has_pdf"] == "true"


def test_what_we_cannot_see_docx_enabled_in_ci_matrix(
    repo_root: Path, ci_export_rels: set[str]
) -> None:
    spec_path = resolve_spec_path(repo_root / "books" / "what-we-cannot-see")
    assert spec_path is not None
    spec = load_book_spec(spec_path)
    assert spec_formats(spec) == ["docx", "epub", "pdf"]
    assert spec_in_latest_release(spec) is True
    assert "books/what-we-cannot-see" in ci_export_rels


def test_everyone_knows_love_not_in_upcoming_release_stems(upcoming_stems: set[str]) -> None:
    assert "everyone-knows-love" not in upcoming_stems


def test_published_manifest_has_release_urls(repo_root: Path, tmp_path: Path) -> None:
    out = tmp_path / "books-manifest.json"
    gen = subprocess.run(
        [
            sys.executable,
            str(repo_root / "tools/generate_books_manifest.py"),
            "--repo",
            str(repo_root),
            "--out",
            str(out),
            "--github-repository",
            "After-Certainty/after-certainty",
        ],
        capture_output=True,
        text=True,
        timeout=120,
    )
    assert gen.returncode == 0, gen.stderr
    data = json.loads(out.read_text(encoding="utf-8"))
    row = next(b for b in data["books"] if b["slug"] == "everyone-knows-love")
    assert row["source"] == "books"
    assert row["status"] == "published"
    assert row["docx"]["enabled"] is True
    assert row["docx"]["url"] is not None


def test_merge_release_assets_excludes_upcoming_stems(
    tmp_path: Path, repo_root: Path, upcoming_stems: set[str]
) -> None:
    """Upcoming export stems stay off latest even when built on main."""
    prior = tmp_path / "prior"
    built = tmp_path / "built"
    out = tmp_path / "upload"
    prior.mkdir()
    built.mkdir()
    (prior / "after-certainty.docx").write_text("published", encoding="utf-8")
    if upcoming_stems:
        sample = sorted(upcoming_stems)[0]
        (prior / f"{sample}.docx").write_text("stale upcoming", encoding="utf-8")
        (built / f"{sample}.epub").write_text("new upcoming", encoding="utf-8")
    (built / "everyone-knows-love.pdf").write_text("published new", encoding="utf-8")

    merge = subprocess.run(
        [
            sys.executable,
            str(repo_root / "tools/merge_release_assets.py"),
            "--repo",
            str(repo_root),
            "--prior-dir",
            str(prior),
            "--built-dir",
            str(built),
            "--out-dir",
            str(out),
        ],
        capture_output=True,
        text=True,
        timeout=60,
    )
    assert merge.returncode == 0, merge.stderr
    names = {p.name for p in out.iterdir()}
    assert "everyone-knows-love.pdf" in names
    for stem in upcoming_stems:
        assert f"{stem}.docx" not in names
        assert f"{stem}.epub" not in names
