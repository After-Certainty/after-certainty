#!/usr/bin/env python3
"""
List occurrences of recurring thesis / stock phrases in Coupling
reader-facing markdown (sources only—not export-kindle.md or docs/).

Run from repo root:
  python3 tools/coupling_thesis_echo_check.py

Exit 0 always (reporting tool). Pair with human judgment: repetition can be
intentional accretion across parts.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

BOOK = Path("books/coupling")

PHRASES: tuple[tuple[str, str], ...] = (
    ("coordination pressure", "coordination pressure"),
    ("coordination substitute", "coordination substitute(s)"),
    ("coherence maintenance", "coherence maintenance"),
    ("stale representation", "stale representation"),
    ("temporal coupling", "temporal coupling"),
    ("ownership without cohesion", "ownership without cohesion"),
    ("coordination cost", "coordination cost"),
    ("coordination debt", "coordination debt"),
    ("context collapse", "context collapse"),
    ("drift", "drift (broad—review clusters)"),
    ("high cohesion", "high cohesion"),
    ("intentional coupling", "intentional coupling"),
    ("accidental over-coupling", "accidental over-coupling"),
    ("severed coupling", "severed coupling"),
)


def manuscript_files() -> list[Path]:
    paths: list[Path] = []
    for p in sorted(BOOK.rglob("*.md")):
        if "docs" in p.parts:
            continue
        if p.name == "export-kindle.md":
            continue
        paths.append(p)
    return paths


def main() -> int:
    if not BOOK.is_dir():
        print(f"error: expected {BOOK}/", file=sys.stderr)
        return 1

    paths = manuscript_files()
    print(f"Scanning {len(paths)} markdown files under {BOOK}/ (excluding docs/)\n")

    for needle, label in PHRASES:
        rx = re.compile(re.escape(needle), re.IGNORECASE)
        hits: list[tuple[Path, int, str]] = []
        for p in paths:
            for i, line in enumerate(p.read_text(encoding="utf-8").splitlines(), 1):
                if rx.search(line):
                    hits.append((p, i, line.strip()[:200]))
        print(f"--- {label} — {len(hits)} line(s)")
        for p, ln, excerpt in hits[:25]:
            rel = p.relative_to(BOOK)
            print(f"   {rel}:{ln}: {excerpt}")
        if len(hits) > 25:
            print(f"   ... and {len(hits) - 25} more")
        print()

    print("Note: export-kindle.md is generated; counts above are source-only.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
