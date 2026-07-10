#!/usr/bin/env python3
"""Validate assembled manuscript units for publication hygiene."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

_TOOLS = Path(__file__).resolve().parent
_SCRIPTS = _TOOLS.parent / "scripts"
for _p in (_TOOLS, _SCRIPTS):
    if str(_p) not in sys.path:
        sys.path.insert(0, str(_p))

from assemble import assemble_index_sections, assemble_markdown_units  # noqa: E402
from publication_markdown import (  # noqa: E402
    find_publication_issues,
    prepare_manuscript_unit_for_export,
)

PLANNING_HEADINGS = frozenset({"planning docs", "related books"})


def validate_book_for_publication(book_dir: Path) -> list[str]:
    book_dir = book_dir.resolve()
    issues: list[str] = []

    index = book_dir / "index.md"
    if not index.exists():
        return [f"Missing index.md in {book_dir}"]

    for section in assemble_index_sections(book_dir):
        if section.heading.strip().lower() in PLANNING_HEADINGS:
            issues.append(
                f"index.md includes internal section {section.heading!r} "
                f"({len(section.paths)} linked file(s))"
            )

    for unit in assemble_markdown_units(book_dir):
        rel = unit.relative_to(book_dir).as_posix()
        try:
            unit.relative_to(book_dir / "docs")
            issues.append(f"publication manifest includes planning path: {rel}")
            continue
        except ValueError:
            pass

        raw = unit.read_text(encoding="utf-8")
        prepared = prepare_manuscript_unit_for_export(raw)
        issues.extend(find_publication_issues(prepared, source=rel))

        # Index links to planning markdown outside docs/ (e.g. docs/README.md via hub)
        if rel.startswith("docs/"):
            issues.append(f"publication manifest includes docs path: {rel}")

    return issues


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--book-dir", required=True, help="Book directory")
    args = parser.parse_args()

    issues = validate_book_for_publication(Path(args.book_dir))
    if issues:
        print("Publication validation failed:", file=sys.stderr)
        for issue in issues:
            print(f"  - {issue}", file=sys.stderr)
        raise SystemExit(1)

    print(f"Publication validation passed: {args.book_dir}")


if __name__ == "__main__":
    main()
