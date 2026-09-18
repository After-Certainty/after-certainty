"""Title-page cover preprocessing for unnumbered PDF/DOCX export."""

from __future__ import annotations

from pathlib import Path

from after_certainty.export.assets import (
    prepare_about_the_series_for_print_pdf,
    prepare_bridge_markdown_for_pdf,
    prepare_copyright_for_print_pdf,
    prepare_print_title_page_display,
    prepare_title_page_for_docx,
    prepare_title_page_for_pdf,
    strip_inline_title_page_cover,
    title_page_cover_alt,
)
from after_certainty.export.docx import stage_docx_units
from after_certainty.export.pdf import stage_pdf_units

TITLE_PAGE = '![Book cover](BookCover.png){ width=100% }\n\n\\newpage\n\n# **Title**\n'


def test_strip_inline_title_page_cover_removes_image_and_newpage() -> None:
    out = strip_inline_title_page_cover(TITLE_PAGE, "BookCover.png")
    assert "BookCover.png" not in out
    assert "\\newpage" not in out
    assert out.startswith("# **Title**")


def test_strip_inline_title_page_cover_ignores_other_images() -> None:
    text = "![Diagram](diagram.png)\n\n# **Title**\n"
    assert strip_inline_title_page_cover(text, "BookCover.png") == text


def test_strip_inline_title_page_cover_handles_ekl_style() -> None:
    text = "![Cover](book-cover.png){ width=100% }\n\n\\newpage\n\n# **Everyone Knows Love**\n"
    out = strip_inline_title_page_cover(text, "book-cover.png")
    assert "book-cover.png" not in out
    assert out.startswith("# **Everyone Knows Love**")


def test_prepare_title_page_for_pdf_replaces_cover_with_latex() -> None:
    out = prepare_title_page_for_pdf(TITLE_PAGE, "BookCover.png")
    assert "Figure" not in out
    assert "![Book cover]" not in out
    assert "\\thispagestyle{empty}" in out
    assert "\\includegraphics[width=\\textwidth]{BookCover.png}" in out
    assert "# **Title**" in out


def test_prepare_title_page_for_docx_uses_empty_alt() -> None:
    out = prepare_title_page_for_docx(TITLE_PAGE, "BookCover.png")
    assert "![](BookCover.png){ width=100% }" in out
    assert "![Book cover]" not in out


def test_title_page_cover_alt_extracts_markdown_alt() -> None:
    text = (
        "![Book cover for *Title* by Author, showing a folder.](book-cover.png)"
        "{ width=100% }\n\n\\newpage\n"
    )
    assert title_page_cover_alt(text, "book-cover.png") == (
        "Book cover for *Title* by Author, showing a folder."
    )
    assert title_page_cover_alt(text, "other.png") == ""


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
    assert staged[0].name == "title-page.md"
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
    staged = stage_docx_units([title_page], tmp_path / "docx-tmp", spec=spec, book_dir=tmp_path)
    assert staged[0].name == "title-page.md"
    assert "![](BookCover.png)" in staged[0].read_text(encoding="utf-8")


def test_stage_docx_units_empties_cover_alt_without_unnumbered_flag(tmp_path: Path) -> None:
    """DOCX must not print markdown alt as Image Caption for any cover book."""
    title_page = tmp_path / "title-page.md"
    title_page.write_text(
        "![Book cover for Title, showing a folder.](book-cover.png){ width=100% }\n\n"
        "\\newpage\n\n# **Title**\n",
        encoding="utf-8",
    )
    spec = {"book": {"title_page_cover": "book-cover.png"}}
    staged = stage_docx_units([title_page], tmp_path / "docx-tmp2", spec=spec, book_dir=tmp_path)
    text = staged[0].read_text(encoding="utf-8")
    assert "![](book-cover.png){ width=100% }" in text
    assert "showing a folder" not in text


def test_prepare_bridge_markdown_for_pdf_bottom_aligns() -> None:
    text = "\\newpage\n\n# Part II — How Love Moves\n\nLove does not sit still.\n"
    out = prepare_bridge_markdown_for_pdf(text)
    assert "{=latex}" in out
    assert "\\vspace*{\\fill}" in out
    assert "\\thispagestyle{empty}" in out
    assert "# Part II — How Love Moves" in out
    assert "Love does not sit still." in out
    assert out.strip().startswith("```{=latex}")
    assert out.count("\\clearpage") >= 2


def test_prepare_print_title_page_display_centers_hierarchy() -> None:
    text = (
        "# **Everyone Knows Love**\n\n"
        "## **Why Is It So Hard to Explain?**\n\n"
        "**Kevin Steffensen**\n"
    )
    out = prepare_print_title_page_display(text)
    assert "\\thispagestyle{empty}" in out
    assert "\\vspace*{0.28\\textheight}" in out
    assert "\\LARGE\\bfseries Everyone Knows Love" in out
    assert "\\large Why Is It So Hard to Explain?" in out
    assert "Kevin Steffensen" in out
    assert "# **Everyone Knows Love**" not in out


def test_prepare_copyright_for_print_pdf_suppresses_folio() -> None:
    text = "\\newpage\n\n# Copyright\n\nCopyright © 2026.\n"
    out = prepare_copyright_for_print_pdf(text)
    assert "\\thispagestyle{empty}" in out
    assert "# Copyright" in out
    assert "\\newpage" not in out


def test_prepare_about_the_series_for_print_pdf_keeps_url_together() -> None:
    text = "visit [www.after-certainty.com](https://www.after-certainty.com).\n"
    out = prepare_about_the_series_for_print_pdf(text)
    assert r"\mbox{www.after-certainty.com}" in out
    assert r"\newline\href{https://www.after-certainty.com}" in out
    assert "[www.after-certainty.com]" not in out
    assert "https://www.after-certainty.com" in out
    assert out.index(r"\newline") < out.index(r"\mbox{www.after-certainty.com}")


def test_stage_pdf_units_bottom_aligns_bridge(tmp_path: Path) -> None:
    book_dir = tmp_path / "book"
    bridge = book_dir / "parts" / "part-1" / "bridge.md"
    bridge.parent.mkdir(parents=True)
    bridge.write_text(
        "\\newpage\n\n# Part I — Test\n\nShort bridge.\n",
        encoding="utf-8",
    )
    staged = stage_pdf_units([bridge], tmp_path / "pdf-tmp", spec={}, book_dir=book_dir)
    assert staged[0].name == "bridge.md"
    text = staged[0].read_text(encoding="utf-8")
    assert "\\vspace*{\\fill}" in text
    assert "# Part I — Test" in text
