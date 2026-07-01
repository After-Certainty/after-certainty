#!/usr/bin/env python3
"""Audit non-fiction books for Chicago + Pandoc citation compliance."""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import asdict, dataclass
from pathlib import Path

FICTION = {"velorum", "the-relay", "boundary-conditions"}
SUP_RE = re.compile(r"[⁰¹²³⁴⁵⁶⁷⁸⁹]+")
PANDOC_RE = re.compile(r"\[\^[^\]]+\]")
PANDOC_C_RE = re.compile(r"\[\^c\d+")
NOTES_HEADERS = re.compile(
    r"^## (?:Notes|End Notes|Endnotes|Reference|\*\*References\*\*)\s*$",
    re.M | re.I,
)
FOOTNOTE_DEF = re.compile(r"^\[\^([^\]]+)\]:", re.M)
REF_USE = re.compile(r"\[\^([^\]]+)\](?!:)")


@dataclass
class BookAudit:
    slug: str
    tier: str
    has_bibliography: bool
    bib_in_index: bool
    pandoc_files: int
    unicode_files: int
    notes_section_files: int
    refs_section_files: int
    footnote_def_files: int
    missing_defs: int
    unused_defs: int
    action: str


def book_roots(books_dir: Path) -> list[Path]:
    roots: list[Path] = []
    for b in sorted(books_dir.iterdir()):
        if not b.is_dir() or b.name in FICTION:
            continue
        if b.name == "when-others-look-to-you":
            for sub in sorted(b.iterdir()):
                if sub.is_dir():
                    roots.append(sub)
            continue
        roots.append(b)
    return roots


def manuscript_files(book_root: Path) -> list[Path]:
    files: list[Path] = []
    for sub in ("front-matter", "parts", "back-matter"):
        p = book_root / sub
        if p.exists():
            files.extend(p.rglob("*.md"))
    if not (book_root / "parts").exists():
        files.extend(book_root.glob("*.md"))
    return [f for f in files if f.name != "bibliography.md"]


def footnote_integrity(files: list[Path]) -> tuple[int, int]:
    all_refs: set[str] = set()
    all_defs: set[str] = set()
    for f in files:
        text = f.read_text(encoding="utf-8")
        all_defs |= set(FOOTNOTE_DEF.findall(text))
        body = re.sub(
            r"^\[\^[^\]]+\]:.*$(?:\n(?!\[\^|\n).*)*",
            "",
            text,
            flags=re.M,
        )
        all_refs |= set(REF_USE.findall(body))
    return len(all_refs - all_defs), len(all_defs - all_refs)


def classify(book_root: Path) -> BookAudit:
    slug = str(book_root.relative_to(book_root.parent.parent))
    has_bib = (book_root / "back-matter/bibliography.md").exists()
    bib_text = ""
    if has_bib:
        bib_text = (book_root / "back-matter/bibliography.md").read_text(encoding="utf-8")
    bib_chicago = has_bib and bib_text.lstrip().startswith("# **Bibliography**")
    idx = book_root / "index.md"
    bib_in_index = idx.exists() and "bibliography" in idx.read_text(encoding="utf-8").lower()

    files = manuscript_files(book_root)
    pandoc = unicode = notes_sec = refs_sec = foot_defs = 0
    for f in files:
        t = f.read_text(encoding="utf-8")
        if PANDOC_RE.search(t):
            pandoc += 1
        if SUP_RE.search(t):
            unicode += 1
        if NOTES_HEADERS.search(t):
            notes_sec += 1
        if re.search(r"^## Reference\s*$", t, re.M):
            refs_sec += 1
        if FOOTNOTE_DEF.search(t):
            foot_defs += 1

    missing, unused = footnote_integrity(files)
    has_any = pandoc or unicode or notes_sec or refs_sec or foot_defs

    if not has_any:
        tier = "B"
        action = "No citations by design; no changes"
    elif unicode or notes_sec or refs_sec or (has_bib and not bib_chicago):
        tier = "A"
        parts = []
        if unicode:
            parts.append("migrate Unicode superscripts to Pandoc footnotes")
        if notes_sec or refs_sec:
            parts.append("convert endnote sections to [^id]: definitions")
        if not has_bib:
            parts.append("create back-matter/bibliography.md")
        elif not bib_chicago:
            parts.append("reformat bibliography to Chicago dash bullets")
        if not bib_in_index:
            parts.append("link bibliography in index.md")
        action = "; ".join(parts)
    elif pandoc and has_bib and bib_chicago and bib_in_index:
        tier = "C"
        action = "Compliant"
        if missing or unused:
            action += f" (integrity: {missing} missing, {unused} unused)"
    else:
        tier = "?"
        action = "Review manually"

    return BookAudit(
        slug=slug,
        tier=tier,
        has_bibliography=has_bib,
        bib_in_index=bib_in_index,
        pandoc_files=pandoc,
        unicode_files=unicode,
        notes_section_files=notes_sec,
        refs_section_files=refs_sec,
        footnote_def_files=foot_defs,
        missing_defs=missing,
        unused_defs=unused,
        action=action,
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", action="store_true", help="Emit JSON")
    parser.add_argument(
        "--books-dir",
        type=Path,
        default=Path(__file__).resolve().parent.parent / "books",
        help="Books root (default: repo books/)",
    )
    args = parser.parse_args(argv)

    rows = [classify(r) for r in book_roots(args.books_dir)]

    if args.json:
        print(json.dumps([asdict(r) for r in rows], indent=2))
        return 0

    tier_a = [r for r in rows if r.tier == "A"]
    tier_b = [r for r in rows if r.tier == "B"]
    tier_c = [r for r in rows if r.tier == "C"]

    print(f"Non-fiction citation audit ({len(rows)} titles)\n")
    print(f"Tier A (legacy, needs migration): {len(tier_a)}")
    print(f"Tier B (no citations): {len(tier_b)}")
    print(f"Tier C (compliant): {len(tier_c)}\n")

    for r in rows:
        print(
            f"{r.slug:45} tier={r.tier}  "
            f"pandoc={r.pandoc_files:2} unicode={r.unicode_files:2} "
            f"notes={r.notes_section_files:2}  bib={r.has_bibliography}  "
            f"index={r.bib_in_index}"
        )
        if r.tier != "C":
            print(f"  -> {r.action}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
