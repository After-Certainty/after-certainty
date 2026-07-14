#!/usr/bin/env python3
"""
Export one book as DOCX (full manuscript or per Part/Act section from index.md).
"""

from __future__ import annotations

import argparse
import subprocess
import sys
import tempfile
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[1]
_TOOLS = _ROOT / "tools"
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))
if str(Path(__file__).resolve().parent) not in sys.path:
    sys.path.insert(0, str(Path(__file__).resolve().parent))

from assemble import assemble_markdown_units, assemble_part_sections  # noqa: E402
from book_export_assets import (  # noqa: E402
    prepare_title_page_for_docx,
    reference_docx,
    replace_newpage_for_docx,
    title_page_cover_basename,
    title_page_cover_unnumbered,
)
from book_output_stem import stem_for_book_dir  # noqa: E402
from book_specs import load_spec_for_book_dir, spec_format_config  # noqa: E402
from diagram_rasterize import rasterize_book_diagrams  # noqa: E402
from publication_markdown import stage_publication_units  # noqa: E402


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def _running_title(spec: dict) -> str:
    book = spec.get("book") if isinstance(spec.get("book"), dict) else {}
    title = str(book.get("title") or "").strip()
    return title or "Manuscript"


def _maybe_finish_interior(out: Path, *, spec: dict) -> None:
    cfg = spec_format_config(spec, "docx")
    if cfg.get("interior_finish") is not True:
        return
    # Lazy: book-export CI installs python-docx only when needed; other books
    # must not import docx_interior_finish at module load.
    from docx_interior_finish import finish_interior_docx

    status = finish_interior_docx(out, running_title=_running_title(spec))
    print(f"interior_finish: {status}")


def stage_docx_units(units: list[Path], tmp_dir: Path, *, spec: dict, book_dir: Path) -> list[Path]:
    publication_units = stage_publication_units(units, tmp_dir / "manuscript", book_dir=book_dir)
    unnumbered_cover = title_page_cover_unnumbered(spec)
    cover_basename = title_page_cover_basename(spec)

    staged: list[Path] = []
    for unit in publication_units:
        text = unit.read_text(encoding="utf-8")
        if unit.name == "title-page.md" and unnumbered_cover and cover_basename:
            text = prepare_title_page_for_docx(text, cover_basename)
        text = replace_newpage_for_docx(text)
        unit.write_text(text, encoding="utf-8")
        staged.append(unit)
    return staged


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
    ref_doc = reference_docx(book_dir)
    if ref_doc is not None:
        cmd.insert(-2, f"--reference-doc={ref_doc}")
    return cmd


def export_docx_file(
    *,
    pandoc: str,
    book_dir: Path,
    units: list[Path],
    out: Path,
    spec: dict | None = None,
) -> None:
    if not units:
        raise SystemExit(f"No markdown units to export for {out.name}")
    run(build_pandoc_cmd(pandoc=pandoc, book_dir=book_dir, units=units, out=out))
    if spec is not None:
        _maybe_finish_interior(out, spec=spec)
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
    spec = load_spec_for_book_dir(book_dir)
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
                spec=spec,
            )
        return

    units = assemble_markdown_units(book_dir)
    if not units:
        raise SystemExit(f"No markdown units found from {book_dir / 'index.md'}")

    with tempfile.TemporaryDirectory(prefix="docx-export-") as tmp:
        docx_units = stage_docx_units(units, Path(tmp), spec=spec, book_dir=book_dir)
        out = book_dir / f"{book_stem}.docx"
        export_docx_file(
            pandoc=args.pandoc,
            book_dir=book_dir,
            units=docx_units,
            out=out,
            spec=spec,
        )


if __name__ == "__main__":
    main()
