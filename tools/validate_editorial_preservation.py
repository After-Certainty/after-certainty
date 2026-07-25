#!/usr/bin/env python3
"""Validate verbatim editorial-preservation register entries against manuscript files.

Usage:
  python3 tools/validate_editorial_preservation.py \\
    --book-dir books/when-others-look-to-you/v1

Reads docs/editorial-preservation-register.yml under the book directory.
Only ``verbatim`` entries are enforced as exact text (after soft Markdown
wrapping normalization). ``substantive`` and ``manualReview`` are ignored.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    yaml = None


def normalize_for_match(text: str) -> str:
    """Normalize soft wrapping; strip markdown bold; preserve blank-line paragraphs."""
    text = text.replace("**", "")
    parts = re.split(r"\n\s*\n", text.strip())
    return "\n\n".join(re.sub(r"\s+", " ", part.strip()) for part in parts)


def load_register(path: Path) -> dict:
    if yaml is None:
        raise SystemExit("PyYAML is required to read the preservation register")
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise SystemExit(f"Invalid register (expected mapping): {path}")
    return data


def validate_book(book_dir: Path) -> list[str]:
    register_path = book_dir / "docs" / "editorial-preservation-register.yml"
    if not register_path.is_file():
        return [f"missing register: {register_path}"]

    register = load_register(register_path)
    verbatim = register.get("verbatim") or []
    if not isinstance(verbatim, list) or not verbatim:
        return [f"no verbatim entries in {register_path}"]

    errors: list[str] = []
    for item in verbatim:
        if not isinstance(item, dict):
            errors.append("verbatim entry is not a mapping")
            continue
        entry_id = item.get("id", "<missing-id>")
        rel = item.get("file")
        text = item.get("text")
        if not rel or not isinstance(rel, str):
            errors.append(f"{entry_id}: missing file")
            continue
        if not text or not isinstance(text, str):
            errors.append(f"{entry_id}: missing text")
            continue
        path = book_dir / rel
        if not path.is_file():
            errors.append(f"{entry_id}: file not found: {rel}")
            continue
        body = path.read_text(encoding="utf-8")
        if normalize_for_match(text) not in normalize_for_match(body):
            errors.append(f"{entry_id}: protected text absent from {rel}")
    return errors


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--book-dir",
        required=True,
        type=Path,
        help="Book edition directory containing docs/editorial-preservation-register.yml",
    )
    parser.add_argument(
        "--repo",
        type=Path,
        default=Path("."),
        help="Repository root (default: .)",
    )
    args = parser.parse_args(argv)

    book_dir = args.book_dir
    if not book_dir.is_absolute():
        book_dir = (args.repo / book_dir).resolve()
    else:
        book_dir = book_dir.resolve()

    errors = validate_book(book_dir)
    if errors:
        print(
            f"Editorial preservation check failed for {book_dir} ({len(errors)} issue(s)):",
            file=sys.stderr,
        )
        for err in errors:
            print(f"  - {err}", file=sys.stderr)
        return 1

    register_path = book_dir / "docs" / "editorial-preservation-register.yml"
    register = load_register(register_path)
    count = len(register.get("verbatim") or [])
    print(f"OK: {count} verbatim protection(s) present under {book_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
