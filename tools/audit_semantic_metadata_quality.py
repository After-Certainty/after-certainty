#!/usr/bin/env python3
"""
Audit semantic source and thinker display-field metadata quality (read-only).

Writes a markdown report flagging markdown leaks, name-format issues,
placeholder thinker copy, and orphan references.

Typical usage::

    python3 tools/audit_semantic_metadata_quality.py --repo . \\
        --out reports/semantic-metadata-quality-audit.md
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

_TOOLS_DIR = Path(__file__).resolve().parent
if str(_TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(_TOOLS_DIR))

from semantic_metadata_quality_audit import (  # noqa: E402
    format_metadata_quality_report,
    run_metadata_quality_audit,
)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument(
        "--out",
        default="reports/semantic-metadata-quality-audit.md",
        help="Markdown report output path",
    )
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    result = run_metadata_quality_audit(repo)
    report = format_metadata_quality_report(result)

    out = Path(args.out)
    if not out.is_absolute():
        out = repo / out
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(report, encoding="utf-8")
    print(f"Wrote {out.relative_to(repo) if out.is_relative_to(repo) else out}")
    print(
        f"Stats: {result.stats.get('critical', 0)} critical, "
        f"{result.stats.get('warnings', 0)} warnings, "
        f"{result.stats.get('info', 0)} info"
    )


if __name__ == "__main__":
    main()
