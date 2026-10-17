#!/usr/bin/env python3
"""
Audit source/thinker → reader passage connections (read-only).

Typical usage::

    python3 tools/audit_reader_passage_links.py --repo .
    make audit-reader-passage-links
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

_TOOLS_DIR = Path(__file__).resolve().parent
if str(_TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(_TOOLS_DIR))

from reader_passage_links import (  # noqa: E402
    DEFAULT_REPORT_DIR,
    run_audit,
    write_audit_reports,
)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument(
        "--md-out",
        default=None,
        help="Markdown report path (default: reports/reader-passage-links/audit.md)",
    )
    parser.add_argument(
        "--json-out",
        default=None,
        help="JSON report path (default: reports/reader-passage-links/audit.json)",
    )
    parser.add_argument(
        "--book",
        default=None,
        help="Limit to a single book id (edition slug)",
    )
    parser.add_argument(
        "--slug",
        action="append",
        default=[],
        help="Limit to source/thinker slug(s); repeatable",
    )
    parser.add_argument(
        "--skip-fragment-check",
        action="store_true",
        help="Skip rendered-HTML fragment validation (faster; tests only)",
    )
    args = parser.parse_args(argv)

    repo = Path(args.repo).resolve()
    report_dir = repo / DEFAULT_REPORT_DIR
    md_out = Path(args.md_out) if args.md_out else report_dir / "audit.md"
    json_out = Path(args.json_out) if args.json_out else report_dir / "audit.json"
    if not md_out.is_absolute():
        md_out = (repo / md_out).resolve()
    if not json_out.is_absolute():
        json_out = (repo / json_out).resolve()

    slugs = set(args.slug) if args.slug else None
    result = run_audit(
        repo,
        check_fragments=not args.skip_fragment_check,
        source_slugs=slugs,
        thinker_slugs=slugs,
        book_id=args.book,
    )
    write_audit_reports(result, md_out=md_out, json_out=json_out)

    s = result.totals.get("sources", {})
    th = result.totals.get("thinkers", {})
    print(f"Wrote {md_out}")
    print(f"Wrote {json_out}")
    print(
        "Sources: "
        f"total={s.get('total', 0)} "
        f"valid={s.get('validPassageLinks', 0)} "
        f"invalid={s.get('invalidPassageLinks', 0)} "
        f"missing_path_cited={s.get('missingPathWithFootnote', 0)} "
        f"biblio_only={s.get('bibliographyOnly', 0)} "
        f"A%={s.get('verifiedCoveragePct', 0)}"
    )
    print(
        "Thinkers: "
        f"total={th.get('total', 0)} "
        f"derivable={th.get('withDerivablePassages', 0)} "
        f"useful%={th.get('usefulPathPct', 0)}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
