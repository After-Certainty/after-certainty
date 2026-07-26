#!/usr/bin/env python3
"""Convert a raster-wrap full-wrap PNG into IngramSpark {isbn}_cvr.pdf."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[1]
_TOOLS = _ROOT / "tools"
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from book_specs import load_spec_for_book_dir  # noqa: E402
from ingramspark.raster_wrap import RasterWrapError, convert_raster_wrap_or_raise  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".")
    parser.add_argument(
        "--book-dir",
        "--book",
        dest="book_dir",
        required=True,
        help="Book directory relative to repo root (or absolute)",
    )
    parser.add_argument(
        "--source",
        default="",
        help="Override PNG path relative to the book directory (default: print.cover.source)",
    )
    parser.add_argument(
        "--template-meta",
        default="",
        help="Override template-meta.yml path relative to the book directory",
    )
    parser.add_argument(
        "--output",
        default="",
        help="Override output PDF path (must still be named {print-isbn}_cvr.pdf)",
    )
    parser.add_argument(
        "--interior-page-count",
        type=int,
        default=None,
        help="Override measured interior page count",
    )
    parser.add_argument(
        "--no-stage",
        action="store_true",
        help="Write work-dir cover.pdf only; do not copy to print/{isbn}_cvr.pdf",
    )
    parser.add_argument(
        "--cleanup-intermediates",
        action="store_true",
        help="Delete converted-cover.tif after a successful conversion",
    )
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    book_arg = Path(args.book_dir)
    book_dir = book_arg if book_arg.is_absolute() else (repo / book_arg).resolve()
    spec = load_spec_for_book_dir(book_dir)

    source = None
    if args.source.strip():
        src = Path(args.source.strip())
        source = src if src.is_absolute() else (book_dir / src).resolve()
    meta = None
    if args.template_meta.strip():
        mp = Path(args.template_meta.strip())
        meta = mp if mp.is_absolute() else (book_dir / mp).resolve()
    output = Path(args.output.strip()).resolve() if args.output.strip() else None

    try:
        result = convert_raster_wrap_or_raise(
            repo=repo,
            book_dir=book_dir,
            spec=spec,
            source=source,
            template_meta_path=meta,
            output_pdf=output,
            interior_page_count=args.interior_page_count,
            stage=not args.no_stage,
            cleanup_intermediates=args.cleanup_intermediates,
        )
    except RasterWrapError as exc:
        raise SystemExit(str(exc)) from exc

    if result.staged_cover_path is not None:
        print(result.staged_cover_path.as_posix())
    elif result.output.get("path"):
        print(result.output["path"])
    if result.preflight_json_path is not None:
        print(result.preflight_json_path.as_posix())
    if result.preflight_txt_path is not None:
        print(result.preflight_txt_path.as_posix())
    for warning in result.warnings:
        print(f"warning: {warning}", file=sys.stderr)


if __name__ == "__main__":
    main()
