"""Smoke tests for books manifest generation and validation."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path


def test_generate_and_validate_books_manifest_cli(repo_root: Path, tmp_path: Path) -> None:
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
            "o/r",
        ],
        capture_output=True,
        text=True,
        timeout=120,
    )
    assert gen.returncode == 0, gen.stderr
    data = json.loads(out.read_text(encoding="utf-8"))
    assert isinstance(data.get("books"), list)
    assert len(data["books"]) >= 1

    val = subprocess.run(
        [
            sys.executable,
            str(repo_root / "tools/validate_books_manifest.py"),
            "--repo",
            str(repo_root),
            "--manifest",
            str(out),
        ],
        capture_output=True,
        text=True,
        timeout=60,
    )
    assert val.returncode == 0, val.stderr
