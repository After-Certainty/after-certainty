"""Title-page cover preprocessing for unnumbered PDF/DOCX export."""

from __future__ import annotations

import sys
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent.parent / "scripts"
TOOLS = Path(__file__).resolve().parent.parent / "tools"
for path in (SCRIPTS, TOOLS):
    if str(path) not in sys.path:
        sys.path.insert(0, str(path))

from book_export_assets import (  # noqa: E402
    prepare_title_page_for_docx,
    prepare_title_page_for_pdf,
)
from export_docx import stage_docx_units  # noqa: E402
from export_pdf import stage_pdf_units  # noqa: E402

TITLE_PAGE = '![Cover](BookCover.png){ width=100% }\n\n\\newpage\n\n# **Title**\n'


def test_prepare_title_page_for_pdf_replaces_cover_with_latex() -> None:
    out = prepare_title_page_for_pdf(TITLE_PAGE, "BookCover.png")
    assert "Figure" not in out
    assert "![Cover]" not in out
    assert "\\thispagestyle{empty}" in out
    assert "\\includegraphics[width=\\textwidth]{BookCover.png}" in out
    assert "# **Title**" in out


def test_prepare_title_page_for_docx_uses_empty_alt() -> None:
    out = prepare_title_page_for_docx(TITLE_PAGE, "BookCover.png")
    assert "![](BookCover.png){ width=100% }" in out
    assert "![Cover]" not in out


def test_stage_pdf_units_rewrites_title_page_when_flag_set(tmp_path: Path) -> None:
    title_page = tmp_path / "title-page.md"
    title_page.write_text(TITLE_PAGE, encoding="utf-8")
    spec = {
        "book": {
            "title_page_cover": "BookCover.png",
            "title_page_cover_unnumbered": True,
        }
    }
    staged = stage_pdf_units([title_page], tmp_path / "pdf-tmp", spec=spec, book_dir=tmp_path)
    assert staged[0].parent == (tmp_path / "pdf-tmp").resolve()
    assert "\\includegraphics" in staged[0].read_text(encoding="utf-8")


def test_stage_docx_units_rewrites_title_page_when_flag_set(tmp_path: Path) -> None:
    title_page = tmp_path / "title-page.md"
    title_page.write_text(TITLE_PAGE, encoding="utf-8")
    spec = {
        "book": {
            "title_page_cover": "BookCover.png",
            "title_page_cover_unnumbered": True,
        }
    }
    staged = stage_docx_units([title_page], tmp_path / "docx-tmp", spec=spec)
    assert staged[0].parent == (tmp_path / "docx-tmp").resolve()
    assert "![](BookCover.png)" in staged[0].read_text(encoding="utf-8")
