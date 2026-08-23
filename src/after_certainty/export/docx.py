"""Export one book as DOCX (full manuscript or per Part/Act section from index.md)."""

from __future__ import annotations

import argparse
import subprocess
import tempfile
from pathlib import Path

from after_certainty.core.book_output_stem import stem_for_book_dir
from after_certainty.export.assets import (
    prepare_title_page_for_docx,
    reference_docx,
    replace_newpage_for_docx,
    title_page_cover_alt,
    title_page_cover_basename,
)
from after_certainty.export.diagrams import rasterize_book_diagrams
from after_certainty.manuscript.assemble import assemble_markdown_units, assemble_part_sections
from after_certainty.manuscript.publication_markdown import stage_publication_units
from after_certainty.specs.book_specs import load_spec_for_book_dir, spec_format_config


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def _running_title(spec: dict) -> str:
    book = spec.get("book") if isinstance(spec.get("book"), dict) else {}
    title = str(book.get("title") or "").strip()
    return title or "Manuscript"


def _book_subtitle(spec: dict) -> str:
    book = spec.get("book") if isinstance(spec.get("book"), dict) else {}
    return str(book.get("subtitle") or "").strip()


def _book_author(spec: dict) -> str:
    book = spec.get("book") if isinstance(spec.get("book"), dict) else {}
    author = book.get("author")
    if isinstance(author, dict):
        return str(author.get("name") or "").strip()
    return str(author or "").strip()


def _book_keywords(spec: dict) -> str:
    book = spec.get("book") if isinstance(spec.get("book"), dict) else {}
    return str(book.get("keywords") or "").strip()


def _cover_alt_from_units(units: list[Path], *, spec: dict) -> str:
    cover_basename = title_page_cover_basename(spec)
    if not cover_basename:
        return ""
    for unit in units:
        if unit.name != "title-page.md":
            continue
        return title_page_cover_alt(unit.read_text(encoding="utf-8"), cover_basename)
    return ""


def _maybe_finish_interior(out: Path, *, spec: dict, cover_alt: str = "") -> None:
    cfg = spec_format_config(spec, "docx")
    if cfg.get("interior_finish") is not True:
        return
    # Lazy: book-export CI installs python-docx only when needed; other books
    # must not import docx_finish at module load.
    from after_certainty.export.docx_finish import finish_interior_docx

    status = finish_interior_docx(
        out,
        running_title=_running_title(spec),
        subtitle=_book_subtitle(spec),
        author=_book_author(spec),
        keywords=_book_keywords(spec),
        cover_alt=cover_alt,
    )
    print(f"interior_finish: {status}")


def stage_docx_units(units: list[Path], tmp_dir: Path, *, spec: dict, book_dir: Path) -> list[Path]:
    publication_units = stage_publication_units(units, tmp_dir / "manuscript", book_dir=book_dir)
    cover_basename = title_page_cover_basename(spec)

    staged: list[Path] = []
    for unit in publication_units:
        text = unit.read_text(encoding="utf-8")
        # Always empty cover alt for DOCX: Pandoc prints non-empty alt as Image Caption.
        if unit.name == "title-page.md" and cover_basename:
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
    cover_alt: str = "",
) -> None:
    if not units:
        raise SystemExit(f"No markdown units to export for {out.name}")
    run(build_pandoc_cmd(pandoc=pandoc, book_dir=book_dir, units=units, out=out))
    if spec is not None:
        _maybe_finish_interior(out, spec=spec, cover_alt=cover_alt)
    print(out.as_posix())


def parse_part_filter(raw: str) -> set[str]:
    return {part.strip() for part in raw.split(",") if part.strip()}


def export_docx(
    *,
    repo: Path,
    book_dir: Path,
    book_stem: str,
    pandoc: str = "pandoc",
    by_part: bool = False,
    parts: str = "",
) -> None:
    """Export DOCX for one book directory."""
    spec = load_spec_for_book_dir(book_dir)
    rasterize_book_diagrams(book_dir, spec=spec)

    if by_part:
        sections = assemble_part_sections(book_dir)
        if not sections:
            raise SystemExit(f"No Part/Act sections found in {book_dir / 'index.md'}")

        part_filter = parse_part_filter(parts)
        if part_filter:
            sections = [section for section in sections if section.slug in part_filter]
            if not sections:
                slugs = ", ".join(sorted(part_filter))
                raise SystemExit(f"No Part/Act sections matched --parts {slugs!r}")

        for section in sections:
            out = book_dir / f"{book_stem}-{section.slug}.docx"
            export_docx_file(
                pandoc=pandoc,
                book_dir=book_dir,
                units=list(section.paths),
                out=out,
                spec=spec,
            )
        return

    units = assemble_markdown_units(book_dir)
    if not units:
        raise SystemExit(f"No markdown units found from {book_dir / 'index.md'}")

    cover_alt = _cover_alt_from_units(units, spec=spec)

    with tempfile.TemporaryDirectory(prefix="docx-export-") as tmp:
        docx_units = stage_docx_units(units, Path(tmp), spec=spec, book_dir=book_dir)
        out = book_dir / f"{book_stem}.docx"
        export_docx_file(
            pandoc=pandoc,
            book_dir=book_dir,
            units=docx_units,
            out=out,
            spec=spec,
            cover_alt=cover_alt,
        )


def main(argv: list[str] | None = None) -> None:
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
    args = parser.parse_args(argv)

    repo = Path(args.repo).resolve()
    book_dir = (repo / args.book_dir).resolve()
    book_stem = args.out_stem.strip() or stem_for_book_dir(book_dir.as_posix(), root=repo)

    export_docx(
        repo=repo,
        book_dir=book_dir,
        book_stem=book_stem,
        pandoc=args.pandoc,
        by_part=args.by_part,
        parts=args.parts,
    )


if __name__ == "__main__":
    main()
