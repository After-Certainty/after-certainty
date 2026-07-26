#!/usr/bin/env python3
"""
Assemble an IngramSpark submission-kit ZIP (or planning cover-preview ZIP).

Supports ebook-only, print-only, or combined packages per book.yml (INGRAM-007).
When print is enabled without ISBN under status: planning, writes
``{book.id}-ingramspark-preview.zip`` for inspection (not for Ingram upload).
Use --preflight-only to run checks without writing a ZIP.
"""

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
from ingramspark.ebook_cover import EbookCoverError, export_ebook_cover_jpg  # noqa: E402
from ingramspark.ebook_export import EbookExportError, export_ingramspark_epub  # noqa: E402
from ingramspark.package import PackageError, package_ingramspark  # noqa: E402
from ingramspark.preflight import (  # noqa: E402
    PreflightError,
    run_preflight,
    write_unified_preflight_reports,
)
from ingramspark.print_export import (  # noqa: E402
    PrintExportError,
    export_ingramspark_print_interior,
)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".")
    parser.add_argument("--book-dir", required=True)
    parser.add_argument("--pandoc", default="pandoc")
    parser.add_argument(
        "--pdf-engine",
        default="",
        help="Override print PDF engine (default: book.yml pdf_engine, else xelatex)",
    )
    parser.add_argument(
        "--ebook-only",
        action="store_true",
        help="Package ebook assets only (omit print/ even if print.enabled)",
    )
    parser.add_argument(
        "--print-only",
        action="store_true",
        help="Package print assets only (omit ebook/ even if ebook.enabled)",
    )
    parser.add_argument("--preflight-only", action="store_true")
    parser.add_argument("--skip-epubcheck", action="store_true")
    parser.add_argument(
        "--allow-cover-upscale",
        action="store_true",
        help="Test/fixture only; do not use for production packaging",
    )
    parser.add_argument(
        "--skip-build",
        action="store_true",
        help="Reuse existing build/ingramspark/ outputs",
    )
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    book_dir = (repo / args.book_dir).resolve()
    try:
        spec = load_spec_for_book_dir(book_dir)
    except (FileNotFoundError, ValueError) as exc:
        raise SystemExit(str(exc)) from exc

    if args.preflight_only:
        if not args.skip_build:
            from book_specs import spec_ingramspark_target

            target = spec_ingramspark_target(spec)
            ebook_on = (
                isinstance(target.get("ebook"), dict) and target["ebook"].get("enabled") is True
            )
            print_on = (
                isinstance(target.get("print"), dict) and target["print"].get("enabled") is True
            )
            run_ebook = ebook_on and not args.print_only
            run_print = print_on and not args.ebook_only
            try:
                if run_ebook:
                    export_ingramspark_epub(
                        repo=repo, book_dir=book_dir, spec=spec, pandoc=args.pandoc
                    )
                    export_ebook_cover_jpg(
                        repo=repo,
                        book_dir=book_dir,
                        spec=spec,
                        allow_upscale=args.allow_cover_upscale,
                    )
                if run_print:
                    export_ingramspark_print_interior(
                        repo=repo,
                        book_dir=book_dir,
                        spec=spec,
                        pandoc=args.pandoc,
                        pdf_engine=args.pdf_engine,
                    )
                    validate_print_cover_or_raise(
                        repo=repo, book_dir=book_dir, spec=spec, stage=True
                    )
            except (
                EbookExportError,
                EbookCoverError,
                PrintExportError,
                CoverValidateError,
                ValueError,
            ) as exc:
                raise SystemExit(str(exc)) from exc
        try:
            report = run_preflight(
                repo=repo,
                book_dir=book_dir,
                spec=spec,
                ebook_only=args.ebook_only,
                print_only=args.print_only,
                skip_epubcheck=args.skip_epubcheck,
            )
        except PreflightError as exc:
            raise SystemExit(str(exc)) from exc
        json_path, text_path = write_unified_preflight_reports(report, repo=repo, spec=spec)
        print(text_path.read_text(encoding="utf-8"))
        print(json_path.as_posix())
        raise SystemExit(0 if report.ok else 1)

    try:
        result = package_ingramspark(
            repo=repo,
            book_dir=book_dir,
            spec=spec,
            ebook_only=args.ebook_only,
            print_only=args.print_only,
            pandoc=args.pandoc,
            pdf_engine=args.pdf_engine,
            skip_epubcheck=args.skip_epubcheck,
            allow_cover_upscale=args.allow_cover_upscale,
            skip_build=args.skip_build,
        )
    except PackageError as exc:
        raise SystemExit(str(exc)) from exc

    print(result.zip_path.as_posix())


if __name__ == "__main__":
    main()
