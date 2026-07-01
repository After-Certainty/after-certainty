#!/usr/bin/env python3
"""Scan book manuscripts for house layout compliance (parts, front/back matter)."""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
BOOKS = REPO / "books"

H2_RE = re.compile(r"^## (.+)$", re.MULTILINE)
PART_ACT_RE = re.compile(r"^(?:Part|Act)\b", re.IGNORECASE)
SUB_PART_RE = re.compile(r"^### (?:Part|Act)\b", re.IGNORECASE)
NUMBERED_ROOT_RE = re.compile(r"^\d{2}-.+\.md$")


@dataclass
class BookAudit:
    slug: str
    has_front_matter_heading: bool
    has_back_matter_heading: bool
    part_act_h2_count: int
    sub_part_count: int
    uses_sections_heading: bool
    has_parts_dir: bool
    has_manuscript_dir: bool
    has_back_matter_dir: bool
    numbered_root_md_count: int
    status: str
    notes: str


def find_book_dirs() -> list[Path]:
    dirs: list[Path] = []
    for book_yml in sorted(BOOKS.glob("**/book.yml")):
        book_dir = book_yml.parent
        if (book_dir / "index.md").is_file():
            dirs.append(book_dir)
    return dirs


def audit_book(book_dir: Path) -> BookAudit:
    rel = book_dir.relative_to(BOOKS).as_posix()
    index = (book_dir / "index.md").read_text(encoding="utf-8")
    headings = H2_RE.findall(index)

    has_fm = any(h.strip().lower() == "front matter" for h in headings)
    has_bm = any(h.strip().lower() == "back matter" for h in headings)
    part_h2 = sum(1 for h in headings if PART_ACT_RE.match(h.strip()))
    sub_part = len(SUB_PART_RE.findall(index))
    uses_sections = any(h.strip().lower() == "sections" for h in headings)

    has_parts = (book_dir / "parts").is_dir()
    has_manuscript = (book_dir / "manuscript").is_dir()
    has_bm_dir = (book_dir / "back-matter").is_dir()

    numbered_root = sum(
        1
        for p in book_dir.glob("*.md")
        if p.name != "index.md" and NUMBERED_ROOT_RE.match(p.name)
    )

    notes: list[str] = []
    if uses_sections:
        notes.append("## Sections heading (legacy flat)")
    if sub_part and not part_h2:
        notes.append("### Part subheadings only (not export sections)")
    if numbered_root:
        notes.append(f"{numbered_root} numbered root .md files")
    if has_parts and not part_h2:
        notes.append("parts/ dir but no ## Part headings in index")
    if part_h2 and not has_parts and not has_manuscript:
        notes.append("## Part headings but no parts/ or manuscript/")
    if has_bm_dir and not has_bm:
        notes.append("back-matter/ dir without ## Back Matter in index")
    if not has_bm_dir and has_bm:
        notes.append("## Back Matter in index but no back-matter/ dir")

    fiction = has_manuscript and not has_parts
    organized = (
        has_fm
        and part_h2 > 0
        and (has_parts or has_manuscript)
        and not uses_sections
        and sub_part == 0
        and numbered_root == 0
    )

    if organized:
        status = "organized"
        if not has_bm and not fiction:
            status = "organized-minor"
            if not has_bm_dir:
                notes.append("no back matter section/dir")
    elif uses_sections or numbered_root > 0:
        status = "legacy-flat"
    elif has_parts or part_h2 > 0 or sub_part > 0:
        status = "legacy-partial"
    else:
        status = "unknown"

    return BookAudit(
        slug=rel,
        has_front_matter_heading=has_fm,
        has_back_matter_heading=has_bm,
        part_act_h2_count=part_h2,
        sub_part_count=sub_part,
        uses_sections_heading=uses_sections,
        has_parts_dir=has_parts,
        has_manuscript_dir=has_manuscript,
        has_back_matter_dir=has_bm_dir,
        numbered_root_md_count=numbered_root,
        status=status,
        notes="; ".join(notes),
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit JSON instead of a text table",
    )
    parser.add_argument(
        "--legacy-only",
        action="store_true",
        help="Show only legacy-flat and legacy-partial books",
    )
    args = parser.parse_args()

    results = [audit_book(d) for d in find_book_dirs()]
    if args.legacy_only:
        results = [r for r in results if r.status.startswith("legacy")]

    if args.json:
        print(json.dumps([asdict(r) for r in results], indent=2))
        return 0

    legacy_count = sum(1 for r in results if r.status.startswith("legacy"))
    print(f"Audited {len(results)} books ({legacy_count} legacy)\n")
    print(f"{'slug':<45} {'status':<18} notes")
    print("-" * 100)
    for r in results:
        print(f"{r.slug:<45} {r.status:<18} {r.notes}")
    return 1 if legacy_count else 0


if __name__ == "__main__":
    sys.exit(main())
