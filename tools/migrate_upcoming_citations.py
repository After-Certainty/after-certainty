#!/usr/bin/env python3
"""Migrate Unicode superscript refs and legacy endnote sections to Pandoc footnotes."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹"
DIG = "0123456789"
SUP_RE = re.compile(r"[" + SUP + r"]+")
REF_HEADERS = re.compile(
    r"\n## (?:(?:\*\*References\*\*)|Reference|Notes|End Notes|Endnotes)\s*\n",
    re.IGNORECASE,
)
CH_NUM = re.compile(r"chapter-(\d+)-")
CHAPTER_NOTES = re.compile(r"^## Chapter (\d+)\s*$", re.M)


def sup_to_int(s: str) -> int:
    return int("".join(DIG[SUP.index(c)] for c in s))


def slugify_source(text: str) -> str:
    """Derive author-work slug from note text."""
    clean = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    clean = re.sub(r"\*([^*]+)\*", r"\1", clean)
    clean = re.sub(r"<[^>]+>", "", clean)
    clean = re.sub(r"\s+—.*$", "", clean)
    clean = re.sub(r"\s+--.*$", "", clean)
    clean = clean.strip()

    author = ""
    title = ""
    if m := re.match(r'^([^,]+),\s*(.+)$', clean):
        author = m.group(1).strip()
        title = m.group(2).strip().strip('"').strip("'")
    elif m := re.match(r'^(\d+\.\s+)?(.+)$', clean):
        rest = m.group(2)
        if ";" in rest:
            rest = rest.split(";")[0].strip()
        if "," in rest:
            author, title = [p.strip() for p in rest.split(",", 1)]
        else:
            title = rest

    author_bits = re.sub(r"[^a-zA-Z]", " ", author).lower().split()
    surname = author_bits[-1] if author_bits else "source"
    title_bits = re.sub(r"[^a-zA-Z0-9 ]", " ", title).lower().split()[:3]
    title_slug = "-".join(w for w in title_bits if w) or "work"
    return f"{surname}-{title_slug}"[:50]


def slugify_ref(prefix: str, num: int, text: str) -> str:
    return f"{prefix}-{slugify_source(text)}"


def parse_numbered_refs(section: str) -> dict[int, str]:
    refs: dict[int, str] = {}
    current_num: int | None = None
    current_lines: list[str] = []
    for line in section.splitlines():
        stripped = line.strip()
        m_num = re.match(r"^(\d+)\.\s+(.*)$", stripped)
        m_sup = re.match(r"^([" + SUP + r"]+)\s+(.*)$", stripped)
        if m_num:
            if current_num is not None:
                refs[current_num] = " ".join(current_lines).strip()
            current_num = int(m_num.group(1))
            current_lines = [m_num.group(2).strip()]
        elif m_sup:
            if current_num is not None:
                refs[current_num] = " ".join(current_lines).strip()
            current_num = sup_to_int(m_sup.group(1))
            current_lines = [m_sup.group(2).strip()]
        elif current_num is not None and stripped:
            current_lines.append(stripped)
    if current_num is not None:
        refs[current_num] = " ".join(current_lines).strip()
    return refs


def chapter_prefix(path: Path) -> str:
    m = CH_NUM.search(path.name)
    if m:
        return f"c{m.group(1)}"
    if "glossary" in path.name:
        return "glossary"
    if "conclusion" in path.name:
        return "conclusion"
    return "doc"


def strip_html_bold(text: str) -> str:
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    text = re.sub(r"<u>([^<]+)</u>", r"\1", text)
    text = re.sub(r"\*([^*]+)\*", r"\1", text)
    return text


def note_to_chicago(text: str) -> str:
    """Best-effort conversion of legacy gloss to Chicago NB (may need manual pass)."""
    text = strip_html_bold(text)
    text = re.sub(r"\s+—.*$", "", text)
    text = re.sub(r"\s+--.*$", "", text)
    text = text.strip().rstrip("\\").strip()
    if ";" in text and "," in text.split(";")[0]:
        parts = [p.strip() for p in text.split(";")]
        formatted = []
        for p in parts:
            formatted.append(note_to_chicago(p))
        return "; ".join(formatted)
    return text


def migrate_file(path: Path, dry_run: bool = False, refs_override: dict[int, str] | None = None) -> bool:
    text = path.read_text(encoding="utf-8")
    header = REF_HEADERS.search(text)
    if refs_override is not None:
        refs = refs_override
        body = text
    elif header:
        body = text[: header.start()]
        ref_section = text[header.end() :]
        refs = parse_numbered_refs(ref_section)
    else:
        if not SUP_RE.search(text):
            return False
        refs = {}
        body = text

    prefix = chapter_prefix(path)

    def replace_sup(match: re.Match[str]) -> str:
        num = sup_to_int(match.group(0))
        if num not in refs and refs:
            return match.group(0)
        slug = slugify_ref(prefix, num, refs.get(num, "source"))
        return f"[^{slug}]"

    new_body = SUP_RE.sub(replace_sup, body)

    footnotes: list[str] = []
    for num in sorted(refs):
        slug = slugify_ref(prefix, num, refs[num])
        chicago = note_to_chicago(refs[num])
        footnotes.append(f"\n[^{slug}]: {chicago}")

    if footnotes:
        new_body = new_body.rstrip() + "\n" + "".join(footnotes) + "\n"

    if new_body == text:
        return False
    if not dry_run:
        path.write_text(new_body, encoding="utf-8")
    return True


def parse_notes_md(notes_path: Path) -> dict[int, dict[int, str]]:
    """Parse back-matter/notes.md grouped by ## Chapter N."""
    text = notes_path.read_text(encoding="utf-8")
    chapters: dict[int, dict[int, str]] = {}
    parts = CHAPTER_NOTES.split(text)
    if len(parts) < 2:
        return chapters
    # parts[0] is preamble; then alternating chapter num, content
    i = 1
    while i < len(parts):
        ch_num = int(parts[i])
        section = parts[i + 1] if i + 1 < len(parts) else ""
        chapters[ch_num] = parse_numbered_refs(section)
        i += 2
    return chapters


def chapter_path_for_num(book_root: Path, ch_num: int) -> Path | None:
    pattern = f"chapter-{ch_num}-*.md"
    matches = list((book_root / "parts").rglob(pattern))
    return matches[0] if matches else None


def migrate_notes_md(book_root: Path, dry_run: bool = False) -> int:
    notes_path = book_root / "back-matter/notes.md"
    if not notes_path.exists():
        return 0
    by_chapter = parse_notes_md(notes_path)
    changed = 0
    for ch_num, refs in sorted(by_chapter.items()):
        path = chapter_path_for_num(book_root, ch_num)
        if path is None:
            print(f"Warning: no chapter file for Chapter {ch_num}", file=sys.stderr)
            continue
        if migrate_file(path, dry_run=dry_run, refs_override=refs):
            print(path.relative_to(book_root.parent.parent))
            changed += 1
    return changed


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--notes-md",
        action="store_true",
        help="Inject footnotes from back-matter/notes.md by chapter number",
    )
    parser.add_argument("roots", nargs="+", type=Path, help="Book directory(ies)")
    args = parser.parse_args(argv)

    changed = 0
    for root in args.roots:
        if args.notes_md:
            changed += migrate_notes_md(root, dry_run=args.dry_run)
        for path in sorted(root.rglob("*.md")):
            if "docs" in path.parts:
                continue
            if path.name == "notes.md":
                continue
            if migrate_file(path, dry_run=args.dry_run):
                print(path.relative_to(root.parent.parent))
                changed += 1
    print(f"Updated {changed} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
