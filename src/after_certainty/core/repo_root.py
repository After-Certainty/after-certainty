"""Repository root discovery for monorepo tooling."""

from __future__ import annotations

import os
from pathlib import Path


def repo_root(start: Path | None = None) -> Path:
    """Return the monorepo repository root."""
    env = os.environ.get("GITHUB_WORKSPACE") or os.environ.get("BOOK_REPO_ROOT")
    if env:
        return Path(env).resolve()

    current = (start or Path(__file__)).resolve()
    if current.is_file():
        current = current.parent

    for candidate in [current, *current.parents]:
        if (candidate / "pyproject.toml").is_file() and (candidate / "books").is_dir():
            return candidate

    return Path(".").resolve()
