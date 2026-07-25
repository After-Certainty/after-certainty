#!/usr/bin/env python3
"""Export IngramSpark print interior PDF ({isbn}_txt.pdf) for an opted-in book."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[1]
_TOOLS = _ROOT / "tools"
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from book_specs import load_spec_for_book_dir  # noqa: E402
from ingramspark.print_export import (  # noqa: E402
    PrintExportError,
    export_ingramspark_print_interior,
)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".")
    parser.add_argument("--book-dir", required=True, help="Book directory relative to repo root")
    parser.add_argument("--pandoc", default="pandoc")
    parser.add_argument("--pdf-engine", default="xelatex")
    parser.add_argument("--gs", default="gs")
    parser.add_argument(
        "--apply-pdfx-proof-construction",
        action="store_true",
        help=(
            "Apply the INGRAM-004 Ghostscript PDF/X-3 grayscale construction "
            "(advisory; account verification still required)"
        ),
    )
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    book_dir = (repo / args.book_dir).resolve()
    spec = load_spec_for_book_dir(book_dir)

    try:
        result = export_ingramspark_print_interior(
            repo=repo,
            book_dir=book_dir,
            spec=spec,
            pandoc=args.pandoc,
            pdf_engine=args.pdf_engine,
            gs=args.gs,
            apply_pdfx_proof_construction=args.apply_pdfx_proof_construction,
        )
    except (PrintExportError, ValueError, FileNotFoundError) as exc:
        raise SystemExit(str(exc)) from exc

    print(result.pdf_path.as_posix())
    print(f"page_count={result.page_count}")
    print(result.page_count_path.as_posix())


if __name__ == "__main__":
    main()
