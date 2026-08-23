"""Generate a build metadata manifest for one book directory."""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import UTC, datetime
from pathlib import Path

from after_certainty.manuscript.manifest_markdown import resolve_markdown_units
from after_certainty.semantic.manifest.books import extract_author_names
from after_certainty.specs.book_specs import load_spec_for_book_dir

WORD_RE = re.compile(r"[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)?")


def count_words(files: list[Path]) -> int:
    total = 0
    for path in files:
        text = path.read_text(encoding="utf-8")
        total += len(WORD_RE.findall(text))
    return total


def count_chapters(files: list[Path]) -> int:
    chapter_like = [p for p in files if "chapter" in p.stem.lower()]
    if chapter_like:
        return len(chapter_like)
    return len(files)


def write_book_manifest(
    *,
    repo: Path,
    book_dir: Path,
    out_path: Path,
    formats: list[str],
) -> Path:
    """Write build metadata JSON for one book."""
    spec = load_spec_for_book_dir(book_dir)

    book = spec.get("book", {})
    author_names = extract_author_names(book)
    units = resolve_markdown_units(book_dir)

    payload = {
        "title": book.get("title", ""),
        "author": ", ".join(author_names),
        "authors": author_names,
        "formats": [f.strip().lower() for f in formats if f.strip()],
        "word_count": count_words(units),
        "chapters": count_chapters(units),
        "build_date": datetime.now(UTC).date().isoformat(),
    }

    out_path = out_path.resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(str(out_path))
    return out_path


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root (default: current directory)")
    parser.add_argument("--book-dir", required=True, help="Book directory relative to repo root")
    parser.add_argument("--out", required=True, help="Output JSON file path")
    parser.add_argument(
        "--format",
        action="append",
        dest="formats",
        default=[],
        help="Built format to include (repeatable), e.g. --format docx --format epub",
    )
    args = parser.parse_args(argv)

    repo = Path(args.repo).resolve()
    book_dir = (repo / args.book_dir).resolve()
    write_book_manifest(
        repo=repo,
        book_dir=book_dir,
        out_path=Path(args.out),
        formats=args.formats,
    )


if __name__ == "__main__":
    main(sys.argv[1:])
