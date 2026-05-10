#!/usr/bin/env python3
"""
List occurrences of recurring thesis / stock phrases in How Meaning Moves
reader-facing markdown (sources only—not export-kindle.md).

Run from repo root:
  python3 tools/how_meaning_moves_thesis_echo_check.py

Exit 0 always (reporting tool). Pair with human judgment: repetition can be
intentional accretion (see docs/quick-pass-card.md §14 thesis echo).
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

BOOK = Path("books/how-meaning-moves")

# Lowercase substring match unless pattern starts with "(?".)"
PHRASES: tuple[tuple[str, str], ...] = (
    ("meaning outruns understanding", "meaning outruns understanding"),
    ("meaning outruns the words", "meaning outruns the words (pattern title / appendix)"),
    ("certainty feels stabilizing", "certainty feels stabilizing"),
    ("certainty can feel like safety", "certainty can feel like safety"),
    ("first story hardens", "first story hardens"),
    ("meaning hardens", "meaning hardens"),
    ("close ambiguity", "close ambiguity / closes ambiguity"),
    ("meaning races ahead", "meaning races ahead (of contact)"),
    ("so reads tighten sooner", "So reads tighten sooner"),
    ("speed buys closure before doubt", "Speed buys closure… (Ch7 bold lead)"),
)


def manuscript_files() -> list[Path]:
    paths: list[Path] = []
    for sub in ("front-matter", "parts", "back-matter"):
        root = BOOK / sub
        if root.is_dir():
            paths.extend(sorted(root.rglob("*.md")))
    return paths


def main() -> int:
    if not BOOK.is_dir():
        print(f"error: expected {BOOK}/", file=sys.stderr)
        return 1

    paths = manuscript_files()
    print(f"Scanning {len(paths)} markdown files under {BOOK}/front-matter, parts, back-matter\n")

    for needle, label in PHRASES:
        rx = re.compile(re.escape(needle), re.IGNORECASE)
        hits: list[tuple[Path, int, str]] = []
        for p in paths:
            for i, line in enumerate(p.read_text(encoding="utf-8").splitlines(), 1):
                if rx.search(line):
                    hits.append((p, i, line.strip()[:200]))
        print(f"--- {label} — {len(hits)} line(s)")
        for p, ln, excerpt in hits:
            rel = p.relative_to(BOOK)
            print(f"   {rel}:{ln}: {excerpt}")
        print()

    print("Note: export-kindle.md is generated; counts above are source-only.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
