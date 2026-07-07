"""
Helpers for Phase B semantic draft extractors (slugify, paths).
"""

from __future__ import annotations

import re
import unicodedata
from pathlib import Path


def _hyphenate_slug(s: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s or "item"


def slugify_heading(title: str) -> str:
    return _hyphenate_slug(title.strip().lower())


def transliterate_slug(title: str) -> str:
    """Slug with Unicode transliteration (NFKD) instead of dropping accented letters."""
    s = unicodedata.normalize("NFKD", title.strip())
    s = "".join(c for c in s if not unicodedata.combining(c))
    return _hyphenate_slug(s.lower())


def repo_relative(repo: Path, path: Path) -> str:
    try:
        return path.resolve().relative_to(repo.resolve()).as_posix()
    except ValueError:
        return path.as_posix()
