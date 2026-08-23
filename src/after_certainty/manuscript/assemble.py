#!/usr/bin/env python3
"""
Resolve markdown source units for a book from index.md links.
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from pathlib import Path

MD_LINK_RE = re.compile(r"\[[^\]]+\]\(([^)]+\.md)\)")
# Top-level structural sections in index.md. Nonfiction volumes head these
# "Part …"; fiction volumes (e.g. The Relay) head them "Act …". Both are treated
# as parts for per-section export; "Front Matter", "Back Matter", etc. are not.
PART_HEADING_RE = re.compile(r"^(?:Part|Act)\b", re.IGNORECASE)


@dataclass(frozen=True)
class IndexSection:
    heading: str
    slug: str
    paths: tuple[Path, ...]


def slugify_heading(heading: str) -> str:
    text = heading.strip()
    text = re.sub(r"[—–]", "-", text)
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"-+", "-", text).strip("-")
    return text or "section"


def section_slug(heading: str, paths: list[Path]) -> str:
    for path in paths:
        parts = path.parts
        try:
            manuscript_idx = parts.index("manuscript")
        except ValueError:
            continue
        if manuscript_idx + 1 < len(parts):
            return parts[manuscript_idx + 1]
    return slugify_heading(heading)


def resolve_book_markdown(book_dir: Path, rel: str) -> Path | None:
    """Resolve a markdown link from index.md; ignore missing or out-of-book targets."""
    path = (book_dir / rel).resolve()
    book_root = book_dir.resolve()
    if not path.is_file():
        return None
    try:
        path.relative_to(book_root)
    except ValueError:
        return None
    return path


def assemble_index_sections(book_dir: Path) -> list[IndexSection]:
    index = book_dir / "index.md"
    if not index.exists():
        raise FileNotFoundError(f"Missing index.md in {book_dir}")
    text = index.read_text(encoding="utf-8")

    sections: list[tuple[str, list[str]]] = []
    current_heading: str | None = None
    current_links: list[str] = []

    for line in text.splitlines():
        if line.startswith("## "):
            if current_heading is not None:
                sections.append((current_heading, current_links))
            current_heading = line[3:].strip()
            current_links = []
            continue
        current_links.extend(m.group(1).strip() for m in MD_LINK_RE.finditer(line))

    if current_heading is not None:
        sections.append((current_heading, current_links))

    out: list[IndexSection] = []
    for heading, rels in sections:
        paths: list[Path] = []
        for rel in rels:
            path = resolve_book_markdown(book_dir, rel)
            if path is not None:
                paths.append(path)
        if not paths:
            continue
        out.append(
            IndexSection(
                heading=heading,
                slug=section_slug(heading, paths),
                paths=tuple(paths),
            )
        )
    return out


def assemble_part_sections(book_dir: Path) -> list[IndexSection]:
    return [
        section
        for section in assemble_index_sections(book_dir)
        if PART_HEADING_RE.match(section.heading)
    ]


def assemble_markdown_units(book_dir: Path) -> list[Path]:
    index = book_dir / "index.md"
    if not index.exists():
        raise FileNotFoundError(f"Missing index.md in {book_dir}")
    text = index.read_text(encoding="utf-8")
    rels = [m.group(1).strip() for m in MD_LINK_RE.finditer(text)]
    out: list[Path] = []
    seen: set[Path] = set()
    for rel in rels:
        path = resolve_book_markdown(book_dir, rel)
        if path is not None and path not in seen:
            seen.add(path)
            out.append(path)
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--book-dir", required=True, help="Book directory")
    parser.add_argument("--json", action="store_true", help="Print JSON list")
    parser.add_argument(
        "--parts",
        action="store_true",
        help="List Part sections (heading, slug, paths) instead of flat units",
    )
    args = parser.parse_args()

    book_dir = Path(args.book_dir).resolve()
    if args.parts:
        sections = assemble_part_sections(book_dir)
        if args.json:
            payload = [
                {
                    "heading": section.heading,
                    "slug": section.slug,
                    "paths": [p.as_posix() for p in section.paths],
                }
                for section in sections
            ]
            print(json.dumps(payload))
            return
        for section in sections:
            print(f"{section.slug}\t{section.heading}")
        return

    units = assemble_markdown_units(book_dir)
    if args.json:
        print(json.dumps([p.as_posix() for p in units]))
        return
    for unit in units:
        print(unit.as_posix())


if __name__ == "__main__":
    main()
