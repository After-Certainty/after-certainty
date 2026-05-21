#!/usr/bin/env python3
"""Migrate Unicode superscript refs and ## References blocks to Pandoc footnotes."""

from __future__ import annotations

import re
import sys
from pathlib import Path

SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹"
DIG = "0123456789"
SUP_RE = re.compile(r"[" + SUP + r"]+")
REF_HEADER = re.compile(r"\n## \*\*References\*\*\s*\n", re.IGNORECASE)
REF_HEADER_ALT = re.compile(r"\n## Reference\s*\n", re.IGNORECASE)
CH_NUM = re.compile(r"chapter-(\d+)-")


def sup_to_int(s: str) -> int:
    return int("".join(DIG[SUP.index(c)] for c in s))


def slugify_ref(num: int, text: str) -> str:
    words = re.sub(r"[^a-zA-Z0-9 ]", "", text).lower().split()[:4]
    tail = "-".join(w for w in words if w) or "source"
    return f"ref-{num}-{tail[:40]}"


def parse_numbered_refs(section: str) -> dict[int, str]:
    refs: dict[int, str] = {}
    current_num: int | None = None
    current_lines: list[str] = []
    for line in section.splitlines():
        m = re.match(r"^(\d+)\.\s+(.*)$", line.strip())
        if m:
            if current_num is not None:
                refs[current_num] = " ".join(current_lines).strip()
            current_num = int(m.group(1))
            current_lines = [m.group(2).strip()]
        elif current_num is not None and line.strip():
            current_lines.append(line.strip())
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


def migrate_file(path: Path, dry_run: bool = False) -> bool:
    text = path.read_text(encoding="utf-8")
    header = REF_HEADER.search(text) or REF_HEADER_ALT.search(text)
    if not header:
        # Still replace superscripts if present without refs section
        if not SUP_RE.search(text):
            return False
        refs = {}
        body = text
    else:
        body = text[: header.start()]
        ref_section = text[header.end() :]
        refs = parse_numbered_refs(ref_section)

    prefix = chapter_prefix(path)

    def replace_sup(match: re.Match[str]) -> str:
        num = sup_to_int(match.group(0))
        if num not in refs and refs:
            return match.group(0)
        slug = slugify_ref(num, refs.get(num, "source"))
        return f"[^{prefix}-{slug}]"

    new_body = SUP_RE.sub(replace_sup, body)

    footnotes: list[str] = []
    for num in sorted(refs):
        slug = slugify_ref(num, refs[num])
        footnotes.append(f"\n[^{prefix}-{slug}]: {refs[num]}")

    if footnotes:
        new_body = new_body.rstrip() + "\n" + "".join(footnotes) + "\n"

    if new_body == text:
        return False
    if not dry_run:
        path.write_text(new_body, encoding="utf-8")
    return True


def main(argv: list[str]) -> int:
    dry_run = "--dry-run" in argv
    roots = [Path(a) for a in argv if not a.startswith("-")]
    if not roots:
        print("Usage: migrate_upcoming_citations.py [--dry-run] <book-dir> ...", file=sys.stderr)
        return 1
    changed = 0
    for root in roots:
        for path in sorted(root.rglob("*.md")):
            if "docs" in path.parts:
                continue
            if migrate_file(path, dry_run=dry_run):
                print(path.relative_to(root.parent.parent))
                changed += 1
    print(f"Updated {changed} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
