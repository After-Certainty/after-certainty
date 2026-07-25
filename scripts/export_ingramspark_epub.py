#!/usr/bin/env python3
"""Export IngramSpark production EPUB + RGB cover JPG for an opted-in book."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[1]
_TOOLS = _ROOT / "tools"
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from book_specs import load_spec_for_book_dir  # noqa: E402
from ingramspark.ebook_cover import EbookCoverError, export_ebook_cover_jpg  # noqa: E402
from ingramspark.ebook_export import EbookExportError, export_ingramspark_epub  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".")
    parser.add_argument("--book-dir", required=True, help="Book directory relative to repo root")
    parser.add_argument("--pandoc", default="pandoc")
    parser.add_argument(
        "--allow-cover-upscale",
        action="store_true",
        help="Test/fixture only: upscale covers below profile minima (never for production)",
    )
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    book_dir = (repo / args.book_dir).resolve()
    spec = load_spec_for_book_dir(book_dir)

    try:
        epub = export_ingramspark_epub(repo=repo, book_dir=book_dir, spec=spec, pandoc=args.pandoc)
        cover = export_ebook_cover_jpg(
            repo=repo,
            book_dir=book_dir,
            spec=spec,
            allow_upscale=args.allow_cover_upscale,
        )
    except (EbookExportError, EbookCoverError, ValueError, FileNotFoundError) as exc:
        raise SystemExit(str(exc)) from exc

    print(epub.epub_path.as_posix())
    print(cover.path.as_posix())


if __name__ == "__main__":
    main()
