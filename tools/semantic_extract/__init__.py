"""
Helpers for Phase B semantic draft extractors (slugify, paths).
"""

from __future__ import annotations

import re
from pathlib import Path


def slugify_heading(title: str) -> str:
    s = title.strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s or "item"


def repo_relative(repo: Path, path: Path) -> str:
    try:
        return path.resolve().relative_to(repo.resolve()).as_posix()
    except ValueError:
        return path.as_posix()
