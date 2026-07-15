#!/usr/bin/env python3
"""
Extract draft semantic source YAML from manuscript bibliography markdown.

Supported styles (see ``bibliography_parse``):

- bullet lists (``- Author. *Title*`` / ``- Author. \"Article.\"``)
- Pandoc ``::: {custom-style=\"Bibliography\"}`` divs
- plain Chicago paragraphs under bibliography headings

Draft files include ``workTitle`` (parsed work name) for promotion. After review,
run ``python3 tools/promote_semantic_source_drafts.py`` (or ``make promote-semantic-source-drafts``)
to merge drafts into ``semantic/sources/`` with display names ``Author — Title``.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

from bibliography_parse import parse_bibliography, parse_list_bibliography
from semantic_extract import repo_relative

# Re-export for tests / callers that import from this module.
__all__ = [
    "build_source_record",
    "main",
    "parse_list_bibliography",
]


def build_source_record(
    *,
    row: dict,
    book_id: str,
    source_path: Path,
    repo: Path,
) -> dict:
    rec = {
        "slug": row["slug"],
        "name": row["name"],
        "workTitle": row.get("workTitle", ""),
        "type": row["type"],
        "summary": row["summary"],
        "concepts": [],
        "patterns": [],
        "relatedBooks": [book_id],
        "_draft": True,
        "_extracted_from": repo_relative(repo, source_path),
    }
    return rec


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument("--input", required=True, help="Path to bibliography.md")
    parser.add_argument("--book-id", required=True, help="book.id for relatedBooks")
    parser.add_argument(
        "--out-dir",
        default="semantic/_drafts/generated/sources",
        help="Base directory; drafts go under <out-dir>/<book-id>/",
    )
    parser.add_argument(
        "--print",
        action="store_true",
        help="Print YAML to stdout instead of writing files",
    )
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    src = Path(args.input)
    if not src.is_file():
        print(f"Error: not a file: {src}", file=sys.stderr)
        sys.exit(1)
    text = src.read_text(encoding="utf-8")

    parsed = parse_bibliography(text)
    rows = parsed.rows
    if not rows:
        print(
            "Warning: no bibliography entries found for any supported style.",
            file=sys.stderr,
        )
    else:
        print(
            f"Parsed {len(rows)} entr(ies) via style={parsed.style}.",
            file=sys.stderr,
        )
    for warning in parsed.warnings:
        print(f"Warning: {warning}", file=sys.stderr)

    out_dir = (repo / args.out_dir / args.book_id).resolve() if not args.print else None
    if out_dir is not None:
        out_dir.mkdir(parents=True, exist_ok=True)

    written = 0
    for row in rows:
        rec = build_source_record(
            row=row,
            book_id=args.book_id,
            source_path=src.resolve(),
            repo=repo,
        )
        yml = (
            yaml.safe_dump(
                rec,
                allow_unicode=True,
                default_flow_style=False,
                sort_keys=False,
            ).rstrip()
            + "\n"
        )
        if args.print:
            print(f"# --- {rec['slug']}.yml ---\n{yml}")
        else:
            assert out_dir is not None
            (out_dir / f"{rec['slug']}.yml").write_text(yml, encoding="utf-8")
            written += 1
            print(str(out_dir / f"{rec['slug']}.yml"))

    if not args.print:
        print(f"Wrote {written} draft source file(s).", file=sys.stderr)


if __name__ == "__main__":
    main()
