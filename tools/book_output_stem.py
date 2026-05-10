#!/usr/bin/env python3
"""
Compute the basename (without extension) for exported .docx / .epub files.

Uses path segments from the repo root. A leading `books/` directory is
omitted from the stem so release filenames stay stable (e.g. `how-meaning-moves.docx`
not `books-how-meaning-moves.docx`). Nested editions stay unique, e.g.
  books/coupling -> coupling
  books/when-others-look-to-you/v1 -> when-others-look-to-you-v1
"""

from __future__ import annotations

import os
import sys
from pathlib import Path


def repo_root() -> Path:
    env = os.environ.get("GITHUB_WORKSPACE") or os.environ.get("BOOK_REPO_ROOT")
    if env:
        return Path(env).resolve()
    return Path(".").resolve()


def stem_for_book_dir(book_dir: str, *, root: Path | None = None) -> str:
    root = root or repo_root()
    book = Path(book_dir)
    if not book.is_absolute():
        book = (root / book).resolve()
    rel = book.relative_to(root)
    parts = list(rel.parts)
    if parts and parts[0] == "books":
        parts = parts[1:]
    if not parts:
        return "book"
    return "-".join(parts)


def main() -> None:
    if len(sys.argv) != 2:
        print("Usage: book_output_stem.py <book-dir>", file=sys.stderr)
        sys.exit(2)
    print(stem_for_book_dir(sys.argv[1]))


if __name__ == "__main__":
    main()
