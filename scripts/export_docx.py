#!/usr/bin/env python3
"""
Export one book as DOCX.
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[1]
_TOOLS = _ROOT / "tools"
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))
if str(Path(__file__).resolve().parent) not in sys.path:
    sys.path.insert(0, str(Path(__file__).resolve().parent))

from assemble import assemble_markdown_units  # noqa: E402
from book_output_stem import stem_for_book_dir  # noqa: E402
from diagram_rasterize import rasterize_book_diagrams  # noqa: E402


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".")
    parser.add_argument("--book-dir", required=True)
    parser.add_argument("--out-stem", default="")
    parser.add_argument("--pandoc", default="pandoc")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    book_dir = (repo / args.book_dir).resolve()
    stem = args.out_stem.strip() or stem_for_book_dir(book_dir.as_posix(), root=repo)
    out = book_dir / f"{stem}.docx"

    rasterize_book_diagrams(book_dir)
    units = assemble_markdown_units(book_dir)
    if not units:
        raise SystemExit(f"No markdown units found from {book_dir / 'index.md'}")

    cmd = [args.pandoc, *[p.as_posix() for p in units], f"--resource-path={book_dir}", "-o", out.as_posix()]
    ref_doc = book_dir / "docs" / "reference.docx"
    if ref_doc.exists():
        cmd.insert(-2, f"--reference-doc={ref_doc}")
    run(cmd)
    print(out.as_posix())


if __name__ == "__main__":
    main()
