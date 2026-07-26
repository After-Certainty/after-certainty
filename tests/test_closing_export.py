"""Closing page export assets for Everyone Knows Love."""

from __future__ import annotations

import subprocess
import zipfile
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parents[1]
BOOK = REPO / "books" / "everyone-knows-love"
REF_OUT = BOOK / "docs" / "export" / "reference.docx"
TEMPLATE = REPO / "books" / "when-others-look-to-you" / "v1" / "docs" / "reference.docx"


def _run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True, cwd=REPO)


def _pandoc_available() -> bool:
    try:
        subprocess.run(["pandoc", "--version"], check=True, capture_output=True)
        return True
    except (FileNotFoundError, subprocess.CalledProcessError):
        return False


@pytest.fixture(scope="module")
def reference_docx() -> Path:
    out = REF_OUT
    if not out.is_file():
        _run(
            [
                "python3",
                "tools/generate_reference_docx.py",
                "--template",
                TEMPLATE.as_posix(),
                "--out",
                out.as_posix(),
            ]
        )
    assert out.is_file()
    return out


def test_kindle_flatten_rewrites_closing_blocks(tmp_path: Path) -> None:
    prep = tmp_path / "export-kindle.md"
    _run(
        [
            "python3",
            "tools/kindle-flatten.py",
            "--book-dir",
            BOOK.as_posix(),
            "--index",
            (BOOK / "index.md").as_posix(),
            "--out",
            prep.as_posix(),
            "--flatten-custom-blocks",
        ]
    )
    text = prep.read_text()
    assert "::: closing-quote" in text
    assert "::: closing-page-break" in text
    assert 'custom-style="Closing Quote Block"' not in text
    assert "voluntary inconvenience" in text
    # Single typographic title page (cover + \\newpage already stripped).
    assert text.lstrip().startswith("# **Everyone Knows Love**")
    assert text.count("# **Everyone Knows Love**") == 1
    # Part bridges keep one H1 each (no synthetic duplicate).
    assert text.count("# Part I — Everyone Knows Love") == 1
    assert text.count("# **Part I — Everyone Knows Love**") == 0


def test_reference_docx_has_closing_styles(reference_docx: Path) -> None:
    from docx import Document

    doc = Document(str(reference_docx))
    names = {s.name for s in doc.styles}
    assert "Closing Quote Block" in names
    assert "Closing Page Break" in names


def test_prepare_closing_markdown_for_pdf() -> None:
    from tools.book_export_assets import prepare_closing_markdown_for_pdf

    text = (BOOK / "back-matter" / "closing.md").read_text(encoding="utf-8")
    out = prepare_closing_markdown_for_pdf(text)
    assert "{=latex}" in out
    assert out.count("\\clearpage") >= 2
    assert "\\clearpage" in out.split("\\end{center}")[-1]
    assert "voluntary inconvenience" in out
    assert "free to say no" in out
    assert "how we grow" in out


@pytest.mark.skipif(not _pandoc_available(), reason="pandoc not installed")
def test_docx_export_contains_closing_quote() -> None:
    stem = "test-everyone-knows-love-closing"
    out = BOOK / f"{stem}.docx"
    try:
        _run(
            [
                "python3",
                "scripts/export_docx.py",
                "--repo",
                REPO.as_posix(),
                "--book-dir",
                "books/everyone-knows-love",
                "--out-stem",
                stem,
            ]
        )
        with zipfile.ZipFile(out) as zf:
            xml = zf.read("word/document.xml").decode("utf-8")
        assert "voluntary inconvenience" in xml
        assert "ClosingQuoteBlock" in xml or "Closing Quote Block" in xml
    finally:
        out.unlink(missing_ok=True)


@pytest.mark.skipif(not _pandoc_available(), reason="pandoc not installed")
def test_epub_export_contains_closing_quote_css() -> None:
    stem = "test-everyone-knows-love-closing"
    out = BOOK / f"{stem}.epub"
    try:
        _run(
            [
                "python3",
                "scripts/export_epub.py",
                "--repo",
                REPO.as_posix(),
                "--book-dir",
                "books/everyone-knows-love",
                "--out-stem",
                stem,
            ]
        )
        with zipfile.ZipFile(out) as zf:
            names = zf.namelist()
            css_files = [n for n in names if n.endswith(".css")]
            assert css_files, "expected EPUB stylesheet"
            css_blob = "".join(zf.read(n).decode("utf-8", errors="ignore") for n in css_files)
            assert "closing-quote" in css_blob
            html_blob = "".join(
                zf.read(n).decode("utf-8", errors="ignore")
                for n in names
                if n.endswith((".xhtml", ".html"))
            )
            assert "voluntary inconvenience" in html_blob
            assert "closing-quote" in html_blob
    finally:
        out.unlink(missing_ok=True)


@pytest.mark.skipif(not _pandoc_available(), reason="pandoc not installed")
def test_pdf_export_builds(tmp_path: Path) -> None:
    stem = "test-everyone-knows-love-closing"
    out = BOOK / f"{stem}.pdf"
    try:
        _run(
            [
                "python3",
                "scripts/export_pdf.py",
                "--repo",
                REPO.as_posix(),
                "--book-dir",
                "books/everyone-knows-love",
                "--out-stem",
                stem,
            ]
        )
        assert out.is_file()
        assert out.stat().st_size > 50_000
    finally:
        out.unlink(missing_ok=True)
