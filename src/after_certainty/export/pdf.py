"""Export one book as PDF via pandoc + LaTeX engine."""

from __future__ import annotations

import argparse
import subprocess
import sys
import tempfile
from pathlib import Path

from after_certainty.core.book_output_stem import stem_for_book_dir
from after_certainty.export.assets import (
    pdf_header_tex,
    prepare_bridge_markdown_for_pdf,
    prepare_closing_markdown_for_pdf,
    prepare_title_page_for_pdf,
    title_page_cover_basename,
    title_page_cover_unnumbered,
)
from after_certainty.export.diagrams import rasterize_book_diagrams
from after_certainty.manuscript.assemble import assemble_markdown_units
from after_certainty.manuscript.publication_markdown import stage_publication_units
from after_certainty.specs.book_specs import load_spec_for_book_dir, spec_format_config


def run(cmd: list[str]) -> None:
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as exc:
        raise SystemExit(f"PDF export failed (exit {exc.returncode}): {' '.join(cmd)}") from exc


def stage_pdf_units(
    units: list[Path],
    tmp_dir: Path,
    *,
    spec: dict,
    book_dir: Path,
) -> list[Path]:
    """
    Return pandoc input paths in manuscript order.

    Units are preprocessed for publication and copied into ``tmp_dir`` so
    duplicate basenames (e.g. part bridges) stay distinct. ``closing.md``,
    ``bridge.md``, and ``title-page.md`` receive format-specific tweaks after
    preprocessing.
    """
    unnumbered_cover = title_page_cover_unnumbered(spec)
    cover_basename = title_page_cover_basename(spec)
    publication_units = stage_publication_units(units, tmp_dir / "manuscript", book_dir=book_dir)

    staged: list[Path] = []
    for unit in publication_units:
        if unit.name == "closing.md":
            text = prepare_closing_markdown_for_pdf(unit.read_text(encoding="utf-8"))
            unit.write_text(text, encoding="utf-8")
            staged.append(unit)
        elif unit.name == "bridge.md":
            text = prepare_bridge_markdown_for_pdf(unit.read_text(encoding="utf-8"))
            unit.write_text(text, encoding="utf-8")
            staged.append(unit)
        elif unit.name == "title-page.md" and unnumbered_cover and cover_basename:
            cover_src = book_dir / cover_basename
            text = prepare_title_page_for_pdf(
                unit.read_text(encoding="utf-8"),
                cover_basename,
                cover_path=cover_src if cover_src.is_file() else None,
            )
            unit.write_text(text, encoding="utf-8")
            staged.append(unit)
        else:
            staged.append(unit)
    return staged


def parse_page_size(page_size: str) -> tuple[str, str] | None:
    value = page_size.strip().lower().replace(" ", "")
    if "x" not in value:
        return None
    left, right = value.split("x", 1)
    if not left or not right:
        return None
    return f"{left}in", f"{right}in"


def export_pdf(
    *,
    repo: Path,
    book_dir: Path,
    book_stem: str,
    page_size: str = "",
    pdf_engine: str = "",
    pandoc: str = "pandoc",
) -> Path:
    """Export PDF for one book directory. Returns output path."""
    spec = load_spec_for_book_dir(book_dir)
    pdf_cfg = spec_format_config(spec, "pdf")

    out = book_dir / f"{book_stem}.pdf"
    units = assemble_markdown_units(book_dir)
    if not units:
        raise SystemExit(f"No markdown units found from {book_dir / 'index.md'}")

    rasterize_book_diagrams(book_dir, spec=spec)

    with tempfile.TemporaryDirectory(prefix="pdf-export-") as tmp:
        pdf_units = stage_pdf_units(units, Path(tmp), spec=spec, book_dir=book_dir)

        resolved_page_size = page_size.strip() or str(pdf_cfg.get("page_size", "")).strip()
        margins = pdf_cfg.get("margins", {})
        engine = pdf_engine.strip() or str(pdf_cfg.get("pdf_engine", "")).strip() or "xelatex"

        cmd = [
            pandoc,
            *[p.as_posix() for p in pdf_units],
            f"--resource-path={book_dir}",
            f"--pdf-engine={engine}",
            "--from=markdown+fenced_divs+raw_tex",
        ]

        if title_page_cover_unnumbered(spec) and title_page_cover_basename(spec):
            cmd.extend(["-V", "graphics"])

        header = pdf_header_tex(book_dir)
        if header is not None:
            cmd.append(f"--include-in-header={header.as_posix()}")

        parsed = parse_page_size(resolved_page_size) if resolved_page_size else None
        if parsed:
            width, height = parsed
            cmd.extend(
                ["-V", f"geometry:paperwidth={width}", "-V", f"geometry:paperheight={height}"]
            )

        if isinstance(margins, dict):
            for key in ("top", "bottom", "left", "right"):
                val = str(margins.get(key, "")).strip()
                if val:
                    cmd.extend(["-V", f"geometry:{key}={val}"])

        cmd.extend(["-o", out.as_posix()])
        run(cmd)
    print(out.as_posix())
    return out


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".")
    parser.add_argument("--book-dir", required=True)
    parser.add_argument("--out-stem", default="")
    parser.add_argument("--page-size", default="")
    parser.add_argument("--pdf-engine", default="")
    parser.add_argument("--pandoc", default="pandoc")
    args = parser.parse_args(argv)

    repo = Path(args.repo).resolve()
    book_dir = (repo / args.book_dir).resolve()
    stem = args.out_stem.strip() or stem_for_book_dir(book_dir.as_posix(), root=repo)

    export_pdf(
        repo=repo,
        book_dir=book_dir,
        book_stem=stem,
        page_size=args.page_size,
        pdf_engine=args.pdf_engine,
        pandoc=args.pandoc,
    )


if __name__ == "__main__":
    main(sys.argv[1:])
