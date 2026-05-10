#!/usr/bin/env python3
"""
Resolve markdown source units for a book from index.md links.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


MD_LINK_RE = re.compile(r"\[[^\]]+\]\(([^)]+\.md)\)")


def assemble_markdown_units(book_dir: Path) -> list[Path]:
    index = book_dir / "index.md"
    if not index.exists():
        raise FileNotFoundError(f"Missing index.md in {book_dir}")
    text = index.read_text(encoding="utf-8")
    rels = [m.group(1).strip() for m in MD_LINK_RE.finditer(text)]
    out: list[Path] = []
    for rel in rels:
        path = (book_dir / rel).resolve()
        if path.exists() and path.is_file():
            out.append(path)
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--book-dir", required=True, help="Book directory")
    parser.add_argument("--json", action="store_true", help="Print JSON list")
    args = parser.parse_args()

    units = assemble_markdown_units(Path(args.book_dir).resolve())
    if args.json:
        print(json.dumps([p.as_posix() for p in units]))
        return
    for unit in units:
        print(unit.as_posix())


if __name__ == "__main__":
    main()
