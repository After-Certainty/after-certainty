#!/usr/bin/env python3
"""
Export one book as DOCX (full manuscript or per Part/Act section from index.md).
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

from assemble import assemble_markdown_units, assemble_part_sections  # noqa: E402
from book_output_stem import stem_for_book_dir  # noqa: E402
from diagram_rasterize import rasterize_book_diagrams  # noqa: E402


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def build_pandoc_cmd(
    *,
    pandoc: str,
    book_dir: Path,
    units: list[Path],
    out: Path,
) -> list[str]:
    cmd = [
        pandoc,
        *[p.as_posix() for p in units],
        f"--resource-path={book_dir}",
        "-o",
        out.as_posix(),
    ]
    ref_doc = book_dir / "docs" / "reference.docx"
    if ref_doc.exists():
        cmd.insert(-2, f"--reference-doc={ref_doc}")
    return cmd


def export_docx_file(
    *,
    pandoc: str,
    book_dir: Path,
    units: list[Path],
    out: Path,
) -> None:
    if not units:
        raise SystemExit(f"No markdown units to export for {out.name}")
    run(build_pandoc_cmd(pandoc=pandoc, book_dir=book_dir, units=units, out=out))
    print(out.as_posix())


def parse_part_filter(raw: str) -> set[str]:
    return {part.strip() for part in raw.split(",") if part.strip()}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".")
    parser.add_argument("--book-dir", required=True)
    parser.add_argument("--out-stem", default="")
    parser.add_argument(
        "--by-part",
        action="store_true",
        help="Export one DOCX per ## Part … / ## Act … section in index.md",
    )
    parser.add_argument(
        "--parts",
        default="",
        help="With --by-part, export only these section slugs (comma-separated)",
    )
    parser.add_argument("--pandoc", default="pandoc")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    book_dir = (repo / args.book_dir).resolve()
    book_stem = args.out_stem.strip() or stem_for_book_dir(book_dir.as_posix(), root=repo)

    rasterize_book_diagrams(book_dir)

    if args.by_part:
        sections = assemble_part_sections(book_dir)
        if not sections:
            raise SystemExit(f"No Part/Act sections found in {book_dir / 'index.md'}")

        part_filter = parse_part_filter(args.parts)
        if part_filter:
            sections = [section for section in sections if section.slug in part_filter]
            if not sections:
                slugs = ", ".join(sorted(part_filter))
                raise SystemExit(f"No Part/Act sections matched --parts {slugs!r}")

        for section in sections:
            out = book_dir / f"{book_stem}-{section.slug}.docx"
            export_docx_file(
                pandoc=args.pandoc,
                book_dir=book_dir,
                units=list(section.paths),
                out=out,
            )
        return

    units = assemble_markdown_units(book_dir)
    if not units:
        raise SystemExit(f"No markdown units found from {book_dir / 'index.md'}")

    out = book_dir / f"{book_stem}.docx"
    export_docx_file(
        pandoc=args.pandoc,
        book_dir=book_dir,
        units=units,
        out=out,
    )


if __name__ == "__main__":
    main()
