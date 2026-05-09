#!/usr/bin/env python3
"""
Mechanical typography checks for How Meaning Moves reader-facing markdown.

Same rules as how-meaning-moves/docs/typography-check.md — run from repo root:
  python3 tools/how_meaning_moves_typography_check.py

Exit status: 0 if all checks pass, 1 otherwise (CI-friendly).
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

OPEN_PB = re.compile(r'^(:+)\s*\{custom-style="Pattern Block"\}\s*$')


def manuscript_paths(book_root: Path) -> list[Path]:
    return (
        list((book_root / "front-matter").rglob("*.md"))
        + list((book_root / "parts").rglob("*.md"))
        + list((book_root / "back-matter").rglob("*.md"))
    )


def blocks(style: str):
    if style == "Pattern Block":
        return re.compile(
            r':{3}\s*\{custom-style="Pattern Block"\}\s*\n(.*?)\n:{3}',
            re.DOTALL | re.IGNORECASE,
        )
    return re.compile(
        r':{3,4}\s*\{custom-style="%s"\}\s*\n(.*?)\n:{3,4}' % style,
        re.DOTALL | re.IGNORECASE,
    )


def pattern_block_fence_errors(text: str) -> list[tuple[int, str, str]]:
    """Opening and closing fences must be exactly three colons."""
    errors: list[tuple[int, str, str]] = []
    lines = text.splitlines()
    i = 0
    in_pb = False
    while i < len(lines):
        line = lines[i]
        if not in_pb and '{custom-style="Pattern Block"' in line:
            m = OPEN_PB.match(line)
            if not m:
                errors.append(
                    (
                        i + 1,
                        'Opening must be exactly: ::: {custom-style="Pattern Block"}',
                        line,
                    )
                )
                i += 1
                continue
            if len(m.group(1)) != 3:
                errors.append(
                    (
                        i + 1,
                        f"Opening uses {len(m.group(1))} colons (expected 3)",
                        line,
                    )
                )
                i += 1
                continue
            in_pb = True
            i += 1
            continue
        if in_pb:
            stripped = lines[i].strip()
            if stripped and all(c == ":" for c in stripped):
                if len(stripped) != 3:
                    errors.append(
                        (
                            i + 1,
                            f"Closing uses {len(stripped)} colons (expected 3)",
                            lines[i],
                        )
                    )
                in_pb = False
            i += 1
            continue
        i += 1
    if in_pb:
        errors.append((len(lines), "Unclosed Pattern Block (no closing ::: before EOF)", ""))
    return errors


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--book-root",
        type=Path,
        default=Path("how-meaning-moves"),
        help="Book folder relative to current working directory (default: how-meaning-moves)",
    )
    args = parser.parse_args(argv)
    book_root = args.book_root
    if not book_root.is_dir():
        print(f"error: book root not found: {book_root}", file=sys.stderr)
        return 1

    paths = manuscript_paths(book_root)
    failed = False

    checks = [
        ("Pull Quote Block contains **", "Pull Quote Block", lambda b: "**" in b),
        ("Vignette Block contains **", "Vignette Block", lambda b: "**" in b),
        (
            "Pattern Block body (after title line) contains **",
            "Pattern Block",
            lambda b: "**" in "\n".join(b.splitlines()[1:]),
        ),
    ]

    for name, style, bad in checks:
        hits: list[Path] = []
        for p in paths:
            text = p.read_text(encoding="utf-8")
            for m in blocks(style).finditer(text):
                if bad(m.group(1)):
                    hits.append(p)
                    break
        print(f"{name}: {len(hits)}")
        for p in hits[:20]:
            print(" ", p)
        if hits:
            failed = True

    print()
    fence_hits: list[tuple[Path, int, str, str]] = []
    for p in paths:
        text = p.read_text(encoding="utf-8")
        for line_no, msg, bad_line in pattern_block_fence_errors(text):
            fence_hits.append((p, line_no, msg, bad_line))

    print(
        f"Pattern Block fence colon mismatches / malformed openings: {len(fence_hits)}"
    )
    for p, line_no, msg, bad_line in fence_hits[:40]:
        print(f"  {p}:{line_no}: {msg}")
        if bad_line:
            print(f"    {bad_line!r}")
    if fence_hits:
        failed = True

    if failed:
        print("\nTypography check failed.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
