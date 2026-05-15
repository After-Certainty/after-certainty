"""Smoke test for book.yml / upcoming spec validation."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def test_validate_book_specs_cli(repo_root: Path) -> None:
    r = subprocess.run(
        [sys.executable, str(repo_root / "tools/validate_book_specs.py"), "--repo", str(repo_root)],
        capture_output=True,
        text=True,
        timeout=120,
    )
    assert r.returncode == 0, r.stderr
