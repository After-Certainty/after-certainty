#!/usr/bin/env python3
"""Fold promotion depth-pass scaffolding in The Economy We Don't Experience."""

from __future__ import annotations

import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
BOOK = REPO / "books/the-economy-we-dont-experience"

GLOB = [
    "front-matter/introduction-the-economy-we-argue-about.md",
    "parts/**/*.md",
    "back-matter/conclusion-leadership-after-explanation-stops-scaling.md",
]

HEADING_NUM = re.compile(
    r"^### \*\*(?:\d+[a-z]?\.)\s*(.+?)\*\*\s*$",
    re.MULTILINE,
)


def strip_depth_scaffolding(text: str) -> str:
    # Drop generated bulk depth blocks (and anything after first marker).
    text = re.split(r"<!--\s*bulk-depth-pass", text, maxsplit=1)[0]
    text = re.split(r"<!--\s*pass2-expand", text, maxsplit=1)[0]
    # Remove orphan ## Depth pass* sections if any remain without HTML markers.
    text = re.sub(
        r"\n## \*\*Depth pass[^*]*\*\*[\s\S]*$",
        "",
        text,
        flags=re.IGNORECASE,
    )
    return text


def unnumber_headings(text: str) -> str:
    return HEADING_NUM.sub(r"### **\1**", text)


def normalize_whitespace(text: str) -> str:
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.rstrip() + "\n"


def fold_file(path: Path) -> None:
    original = path.read_text(encoding="utf-8")
    updated = normalize_whitespace(unnumber_headings(strip_depth_scaffolding(original)))
    if updated != original:
        path.write_text(updated, encoding="utf-8")
        print(f"folded {path.relative_to(REPO)}")


def main() -> None:
    for pattern in GLOB:
        for path in sorted(BOOK.glob(pattern)):
            fold_file(path)


if __name__ == "__main__":
    main()
