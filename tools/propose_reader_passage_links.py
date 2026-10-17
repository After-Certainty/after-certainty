#!/usr/bin/env python3
"""
Propose a bounded batch of reader passage link candidates (read-only by default).

Typical usage::

    uv run python tools/propose_reader_passage_links.py \\
      --repo . --kind all --batch-size 10 --dry-run

Does not modify semantic YAML or manuscripts. With ``--write-review-log``,
new candidates are recorded as ``proposed`` in the review log for idempotent
follow-up sessions.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Literal

_TOOLS_DIR = Path(__file__).resolve().parent
if str(_TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(_TOOLS_DIR))

from reader_passage_links import (  # noqa: E402
    DEFAULT_REPORT_DIR,
    build_candidates,
    load_review_log,
    run_audit,
    write_candidates,
)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument(
        "--kind",
        choices=("sources", "thinkers", "all"),
        default="all",
        help="Entity kinds to include",
    )
    parser.add_argument("--book", default=None, help="Limit to book id")
    parser.add_argument(
        "--slug",
        action="append",
        default=[],
        help="Limit to entity slug(s); repeatable",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=10,
        help="Maximum candidates in this batch",
    )
    parser.add_argument(
        "--max-per-source",
        type=int,
        default=3,
        help="Maximum alternate chapter/footnote candidates per source",
    )
    parser.add_argument(
        "--only-missing",
        action="store_true",
        help="Only entities lacking a reader passage path / derived links",
    )
    parser.add_argument(
        "--only-invalid",
        action="store_true",
        help="Only sources with an invalid existing readerPassagePath",
    )
    parser.add_argument(
        "--unreviewed-only",
        action="store_true",
        help="Skip candidates already approved/rejected/applied/skipped in review-log",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print summary only; do not write candidate files",
    )
    parser.add_argument(
        "--write-review-log",
        action="store_true",
        help="Record new candidates as proposed in review-log.json",
    )
    parser.add_argument(
        "--skip-fragment-check",
        action="store_true",
        help=(
            "Skip rendered-HTML fragment validation during audit and leave "
            "candidate anchor_exists as unverified (null)"
        ),
    )
    parser.add_argument(
        "--md-out",
        default=None,
        help="Candidates markdown path",
    )
    parser.add_argument(
        "--json-out",
        default=None,
        help="Candidates JSON path",
    )
    parser.add_argument(
        "--review-log",
        default=None,
        help="Review log JSON path",
    )
    args = parser.parse_args(argv)

    repo = Path(args.repo).resolve()
    report_dir = repo / DEFAULT_REPORT_DIR
    md_out = Path(args.md_out) if args.md_out else report_dir / "candidates.md"
    json_out = Path(args.json_out) if args.json_out else report_dir / "candidates.json"
    review_log_path = Path(args.review_log) if args.review_log else report_dir / "review-log.json"
    if not md_out.is_absolute():
        md_out = (repo / md_out).resolve()
    if not json_out.is_absolute():
        json_out = (repo / json_out).resolve()
    if not review_log_path.is_absolute():
        review_log_path = (repo / review_log_path).resolve()

    slugs = set(args.slug) if args.slug else None
    check_fragments = not args.skip_fragment_check
    result = run_audit(
        repo,
        check_fragments=check_fragments,
        source_slugs=slugs if args.kind in {"sources", "all"} else None,
        thinker_slugs=slugs if args.kind in {"thinkers", "all"} else None,
        book_id=args.book,
    )
    review_log = load_review_log(review_log_path)
    kind: Literal["sources", "thinkers", "all"] = args.kind
    candidates = build_candidates(
        result,
        kind=kind,
        only_missing=args.only_missing,
        only_invalid=args.only_invalid,
        book_id=args.book,
        slugs=slugs,
        unreviewed_only=args.unreviewed_only,
        review_log=review_log,
        batch_size=max(0, args.batch_size),
        max_per_source=max(1, args.max_per_source),
        repo=repo,
        check_anchors=check_fragments,
    )

    if args.dry_run:
        print(f"Dry-run: {len(candidates)} candidate(s)")
        for c in candidates:
            print(
                f"  [{c.evidence_level}] {c.entity_kind}/{c.slug} → "
                f"{c.candidate_reader_passage_path or c.route_key} "
                f"(anchor={c.anchor_exists!s}, review={c.needs_editorial_review}, "
                f"{c.recommended_action})"
            )
        return 0

    write_candidates(
        candidates,
        md_out=md_out,
        json_out=json_out,
        review_log_path=review_log_path,
        update_review_log=args.write_review_log,
    )
    print(f"Wrote {md_out}")
    print(f"Wrote {json_out}")
    if args.write_review_log:
        print(f"Updated {review_log_path}")
    print(f"Candidates: {len(candidates)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
