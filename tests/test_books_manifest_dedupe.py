"""Release manifests omit upcoming rows when the same slug is published under books/."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

PROMOTED = (
    "after-certainty",
    "before-certainty-arrives",
    "when-accountability-no-longer-expires",
)


def _assert_single_published_row(data: dict) -> None:
    for slug in PROMOTED:
        rows = [b for b in data["books"] if b["slug"] == slug]
        assert len(rows) == 1, f"expected one manifest row for {slug}, got {len(rows)}"
        row = rows[0]
        assert row["source"] == "books"
        assert row["status"] == "published"
        assert row["docx"]["enabled"] is True
        assert row["epub"]["enabled"] is True
        assert row["pdf"]["enabled"] is True
        assert row["docx"]["url"]
        assert row["epub"]["url"]
        assert row["pdf"]["url"]


def test_upcoming_rows_omitted_when_books_slug_exists(repo_root: Path, tmp_path: Path) -> None:
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
    _assert_single_published_row(data)


def test_semantic_manifest_omits_upcoming_duplicates(semantic_manifest: dict) -> None:
    data = semantic_manifest
    _assert_single_published_row(data)
    for slug in PROMOTED:
        row = next(b for b in data["books"] if b["slug"] == slug)
        assert row["id"] == f"book-{slug}"
