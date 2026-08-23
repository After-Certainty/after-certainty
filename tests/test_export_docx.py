"""Tests for after_certainty.export.docx package module."""

from __future__ import annotations

from pathlib import Path

import pytest

from after_certainty.export.docx import (
    build_pandoc_cmd,
    parse_part_filter,
    stage_docx_units,
)


def test_import_export_docx_module() -> None:
    from after_certainty.export import docx as export_docx

    assert callable(export_docx.export_docx)
    assert callable(export_docx.main)


def test_import_export_assets_from_package() -> None:
    from after_certainty.export.assets import reference_docx, title_page_cover_basename

    assert callable(reference_docx)
    assert callable(title_page_cover_basename)


def test_parse_part_filter_splits_and_strips() -> None:
    assert parse_part_filter(" act-1 , act-2, ") == {"act-1", "act-2"}


def test_build_pandoc_cmd_includes_units_and_output(tmp_path: Path) -> None:
    book_dir = tmp_path / "book"
    book_dir.mkdir()
    unit = book_dir / "chapter.md"
    unit.write_text("# Chapter\n", encoding="utf-8")
    out = book_dir / "book.docx"

    cmd = build_pandoc_cmd(pandoc="pandoc", book_dir=book_dir, units=[unit], out=out)

    assert cmd[0] == "pandoc"
    assert unit.as_posix() in cmd
    assert f"--resource-path={book_dir}" in cmd
    assert cmd[-1] == out.as_posix()


def test_stage_docx_units_empty_cover_alt_on_title_page(tmp_path: Path) -> None:
    book_dir = tmp_path / "book"
    book_dir.mkdir()
    title_page = book_dir / "title-page.md"
    title_page.write_text('![Cover alt](BookCover.png){ width=100% }\n', encoding="utf-8")
    spec = {"book": {"title_page_cover": "BookCover.png"}}

    staged = stage_docx_units([title_page], tmp_path / "staging", spec=spec, book_dir=book_dir)

    assert len(staged) == 1
    text = staged[0].read_text(encoding="utf-8")
    assert "![Cover alt]" not in text
    assert "![](BookCover.png)" in text


def test_export_docx_file_raises_when_no_units(tmp_path: Path) -> None:
    from after_certainty.export.docx import export_docx_file

    book_dir = tmp_path / "book"
    book_dir.mkdir()
    out = book_dir / "test.docx"

    with pytest.raises(SystemExit, match="No markdown units"):
        export_docx_file(
            pandoc="pandoc",
            book_dir=book_dir,
            units=[],
            out=out,
        )
