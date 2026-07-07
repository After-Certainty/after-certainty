#!/usr/bin/env python3
"""
Unified semantic graph data-quality audit (read-only).

Writes JSON and Markdown reports covering sources, thinkers, concepts, patterns,
books, relationships, slugs, and manifest consistency.

Typical usage::

    python3 tools/audit_semantic_graph.py --repo .
    make audit-semantic-graph
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

_TOOLS_DIR = Path(__file__).resolve().parent
if str(_TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(_TOOLS_DIR))

from semantic_graph_audit import (  # noqa: E402
    build_json_report,
    format_markdown_report,
    run_audit,
)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument(
        "--semantic-manifest",
        default="",
        help="Path to semantic-manifest.json (auto-discovered if omitted)",
    )
    parser.add_argument(
        "--books-manifest",
        default="",
        help="Path to books-manifest.json (auto-discovered if omitted)",
    )
    parser.add_argument(
        "--json-out",
        default="reports/semantic-graph-audit.json",
        help="JSON report output path",
    )
    parser.add_argument(
        "--md-out",
        default="reports/semantic-graph-audit.md",
        help="Markdown report output path",
    )
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    sem_path = Path(args.semantic_manifest).resolve() if args.semantic_manifest else None
    books_path = Path(args.books_manifest).resolve() if args.books_manifest else None

    result = run_audit(repo, semantic_manifest_path=sem_path, books_manifest_path=books_path)
    report = build_json_report(result)
    markdown = format_markdown_report(result)

    json_out = Path(args.json_out)
    md_out = Path(args.md_out)
    if not json_out.is_absolute():
        json_out = repo / json_out
    if not md_out.is_absolute():
        md_out = repo / md_out
    json_out.parent.mkdir(parents=True, exist_ok=True)
    md_out.parent.mkdir(parents=True, exist_ok=True)

    json_out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    md_out.write_text(markdown, encoding="utf-8")

    def _rel(p: Path) -> str:
        try:
            return p.relative_to(repo).as_posix()
        except ValueError:
            return str(p)

    print(f"Wrote {_rel(json_out)}")
    print(f"Wrote {_rel(md_out)}")
    print(
        f"Summary: {report['summary']['errors']} errors, "
        f"{report['summary']['warnings']} warnings, "
        f"{report['summary']['info']} info"
    )


if __name__ == "__main__":
    main()
