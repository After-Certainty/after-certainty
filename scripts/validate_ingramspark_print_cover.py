#!/usr/bin/env python3
"""Validate IngramSpark print wrap + template-meta.yml and stage {isbn}_cvr.pdf."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[1]
_TOOLS = _ROOT / "tools"
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from book_specs import load_spec_for_book_dir  # noqa: E402
from ingramspark.cover_validate import (  # noqa: E402
    CoverValidateError,
    validate_print_cover_or_raise,
)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".")
    parser.add_argument("--book-dir", required=True, help="Book directory relative to repo root")
    parser.add_argument(
        "--interior-page-count",
        type=int,
        default=None,
        help="Override measured interior page count (otherwise read print/page-count.json)",
    )
    parser.add_argument(
        "--template-meta",
        default="",
        help="Path to template-meta.yml relative to the book directory "
        "(default: assets/ingramspark/template-meta.yml)",
    )
    parser.add_argument(
        "--no-stage",
        action="store_true",
        help="Validate only; do not copy wrap to build/ingramspark/.../{isbn}_cvr.pdf",
    )
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    book_dir = (repo / args.book_dir).resolve()
    spec = load_spec_for_book_dir(book_dir)

    try:
        result = validate_print_cover_or_raise(
            repo=repo,
            book_dir=book_dir,
            spec=spec,
            interior_page_count=args.interior_page_count,
            template_meta_relative=args.template_meta.strip() or None,
            stage=not args.no_stage,
        )
    except CoverValidateError as exc:
        raise SystemExit(str(exc)) from exc

    if result.staged_cover_path is not None:
        print(result.staged_cover_path.as_posix())
    if result.report_path is not None:
        print(result.report_path.as_posix())
    for warning in result.warnings:
        print(f"warning: {warning}", file=sys.stderr)


if __name__ == "__main__":
    main()
