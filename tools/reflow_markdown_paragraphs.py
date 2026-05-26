#!/usr/bin/env python3
"""Join hard-wrapped prose lines into flowing paragraphs (After Certainty style)."""
from __future__ import annotations

import argparse
import re
from pathlib import Path

HEADING = re.compile(r"^#{1,6}\s")
FOOTNOTE = re.compile(r"^\[\^")
LIST_ITEM = re.compile(r"^[-*]\s")


def _join_wrapped_lines(parts: list[str]) -> str:
    if not parts:
        return ""
    text = parts[0]
    for piece in parts[1:]:
        if text.endswith(("—", "-")):
            text += piece
        else:
            text += " " + piece
    return re.sub(r"  +", " ", text).strip()


def reflow_text(raw: str) -> str:
    lines = raw.splitlines()
    blocks: list[str] = []
    buf: list[str] = []
    i = 0

    def flush() -> None:
        nonlocal buf
        if buf:
            blocks.append(_join_wrapped_lines(buf))
            buf = []

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if not stripped:
            flush()
            if blocks and blocks[-1] != "":
                blocks.append("")
            i += 1
            continue

        if HEADING.match(stripped) or FOOTNOTE.match(stripped) or LIST_ITEM.match(stripped):
            flush()
            blocks.append(stripped)
            i += 1
            continue

        if stripped.startswith(">"):
            flush()
            bq_parts: list[str] = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                content = lines[i].strip()[1:].strip()
                if content:
                    bq_parts.append(content)
                i += 1
            blocks.append("> " + _join_wrapped_lines(bq_parts))
            continue

        buf.append(stripped)
        i += 1

    flush()
    return "\n".join(blocks) + ("\n" if raw.endswith("\n") else "")


def reflow_file(path: Path) -> bool:
    original = path.read_text(encoding="utf-8")
    updated = reflow_text(original)
    if updated != original:
        path.write_text(updated, encoding="utf-8")
        return True
    return False


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="+", type=Path, help="Markdown files or directories")
    args = parser.parse_args()

    files: list[Path] = []
    for p in args.paths:
        if p.is_dir():
            files.extend(sorted(p.rglob("*.md")))
        else:
            files.append(p)

    for path in files:
        if path.name in ("export-kindle.md",):
            continue
        if path.parts and "docs" in path.parts:
            continue
        if reflow_file(path):
            print(f"reflowed {path}")


if __name__ == "__main__":
    main()
