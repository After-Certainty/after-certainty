"""CI export eligibility and rolling-release rules for upcoming books."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

from tools.book_specs import (
    ci_export_books,
    load_book_spec,
    resolve_spec_path,
    spec_formats,
    spec_in_latest_release,
    upcoming_export_stems,
)


def test_published_everyone_knows_love_in_ci_matrix(repo_root: Path) -> None:
    spec_path = resolve_spec_path(repo_root / "books" / "everyone-knows-love")
    assert spec_path is not None
    spec = load_book_spec(spec_path)
    assert spec_formats(spec) == ["docx", "epub", "pdf"]
    assert spec_in_latest_release(spec) is True

    rels = {p.relative_to(repo_root).as_posix() for p in ci_export_books(repo_root)}
    assert "books/everyone-knows-love" in rels


def test_upcoming_without_exports_excluded_from_ci_matrix(repo_root: Path) -> None:
    rels = {p.relative_to(repo_root).as_posix() for p in ci_export_books(repo_root)}
    # What We Cannot See has been promoted to books/
    assert "upcoming/what-we-cannot-see" not in rels


def test_published_the_world_we_make_together_in_ci_matrix(repo_root: Path) -> None:
    spec_path = resolve_spec_path(repo_root / "books" / "the-world-we-make-together")
    assert spec_path is not None
    spec = load_book_spec(spec_path)
    assert spec_formats(spec) == ["docx", "epub", "pdf"]
    assert spec_in_latest_release(spec) is True

    rels = {p.relative_to(repo_root).as_posix() for p in ci_export_books(repo_root)}
    assert "books/the-world-we-make-together" in rels
    assert "upcoming/the-world-we-make-together" not in rels
    assert "the-world-we-make-together" not in upcoming_export_stems(repo_root)

    matrix = subprocess.run(
        [
            sys.executable,
            str(repo_root / "tools/ci_affected_books.py"),
            "--repo",
            str(repo_root),
            "--all",
            "--format",
            "docx",
        ],
        capture_output=True,
        text=True,
        timeout=120,
    )
    assert matrix.returncode == 0, matrix.stderr
    payload = json.loads(matrix.stdout)
    row = next(e for e in payload["include"] if e["dir"] == "books/the-world-we-make-together")
    assert row["has_docx"] == "true"
    assert row["has_epub"] == "true"
    assert row["has_pdf"] == "true"


def test_what_we_cannot_see_docx_enabled_in_ci_matrix(repo_root: Path) -> None:
    spec_path = resolve_spec_path(repo_root / "books" / "what-we-cannot-see")
    assert spec_path is not None
    spec = load_book_spec(spec_path)
    assert spec_formats(spec) == ["docx", "epub", "pdf"]
    assert spec_in_latest_release(spec) is True

    rels = {p.relative_to(repo_root).as_posix() for p in ci_export_books(repo_root)}
    assert "books/what-we-cannot-see" in rels


def test_everyone_knows_love_not_in_upcoming_release_stems(repo_root: Path) -> None:
    assert "everyone-knows-love" not in upcoming_export_stems(repo_root)


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
            "ksteffe/after-certainty",
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


def test_merge_release_assets_excludes_upcoming_stems(tmp_path: Path, repo_root: Path) -> None:
    """Upcoming export stems stay off latest even when built on main."""
    prior = tmp_path / "prior"
    built = tmp_path / "built"
    out = tmp_path / "upload"
    prior.mkdir()
    built.mkdir()
    (prior / "after-certainty.docx").write_text("published", encoding="utf-8")
    stems = upcoming_export_stems(repo_root)
    if stems:
        sample = sorted(stems)[0]
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
    for stem in stems:
        assert f"{stem}.docx" not in names
        assert f"{stem}.epub" not in names
