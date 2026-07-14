"""Unnumbered PDF covers must force Pandoc's graphics variable."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
for path in (ROOT / "scripts", ROOT / "tools"):
    if str(path) not in sys.path:
        sys.path.insert(0, str(path))

from book_export_assets import (  # noqa: E402
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
    src = (ROOT / "scripts" / "export_pdf.py").read_text(encoding="utf-8")
    assert '-V", "graphics"' in src or "-V', 'graphics'" in src
    assert "title_page_cover_unnumbered(spec)" in src
