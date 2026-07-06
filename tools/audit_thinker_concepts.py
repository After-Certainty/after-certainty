#!/usr/bin/env python3
"""
Audit thinker-to-concept associations (read-only by default).

Writes a markdown report comparing thinker concepts to work concepts,
text matches, and title heuristics.

Typical usage::

    python3 tools/audit_thinker_concepts.py --repo . --out reports/thinker-concept-audit.md
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

_TOOLS_DIR = Path(__file__).resolve().parent
if str(_TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(_TOOLS_DIR))

from thinker_concept_audit import format_report, run_audit  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument(
        "--out",
        default="reports/thinker-concept-audit.md",
        help="Markdown report output path",
    )
    parser.add_argument(
        "--write-report",
        action="store_true",
        help="Write the markdown report (default when --out is set)",
    )
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    result = run_audit(repo)
    report = format_report(result)

    if args.out:
        out = Path(args.out)
        if not out.is_absolute():
            out = repo / out
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(report, encoding="utf-8")
        print(f"Wrote {out.relative_to(repo) if out.is_relative_to(repo) else out}")
        print(
            f"Stats: {result.stats['emptyConceptThinkers']} empty thinkers, "
            f"{result.stats['workConceptOrphans']} work-concept orphans, "
            f"{result.stats['suspiciousAssociations']} suspicious"
        )


if __name__ == "__main__":
    main()
