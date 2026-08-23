"""Unnumbered PDF covers must force Pandoc's graphics variable."""

from __future__ import annotations

from after_certainty.export.assets import (
    title_page_cover_basename,
    title_page_cover_unnumbered,
)


def test_unnumbered_cover_flags_are_true_when_set() -> None:
    spec = {
        "book": {
            "title_page_cover": "book-cover.png",
            "title_page_cover_unnumbered": True,
        }
    }
    assert title_page_cover_unnumbered(spec) is True
    assert title_page_cover_basename(spec) == "book-cover.png"


def test_export_pdf_source_forces_graphics_for_unnumbered_cover() -> None:
    from pathlib import Path

    src = (
        Path(__file__).resolve().parents[1] / "src" / "after_certainty" / "export" / "pdf.py"
    ).read_text(encoding="utf-8")
    assert '-V", "graphics"' in src or "-V', 'graphics'" in src
    assert "title_page_cover_unnumbered(spec)" in src
