#!/usr/bin/env python3
"""Optional per-book export assets (reference DOCX, EPUB CSS, PDF LaTeX header)."""

from __future__ import annotations

import re
from pathlib import Path


def reference_docx(book_dir: Path) -> Path | None:
    for candidate in (
        book_dir / "docs" / "reference.docx",
        book_dir / "docs" / "export" / "reference.docx",
    ):
        if candidate.is_file():
            return candidate
    return None


def epub_css(book_dir: Path) -> Path | None:
    candidate = book_dir / "docs" / "export" / "epub.css"
    return candidate if candidate.is_file() else None


def pdf_header_tex(book_dir: Path) -> Path | None:
    candidate = book_dir / "docs" / "export" / "pdf-header.tex"
    return candidate if candidate.is_file() else None


_CLOSING_QUOTE_RE = re.compile(
    r'::: \{custom-style="Closing Quote Block" \.closing-quote\}\s*\n(.*?)\n:::',
    re.S,
)


def prepare_closing_markdown_for_pdf(text: str) -> str:
    """Render the closing quote page as raw LaTeX (Pandoc does not emit div environments)."""
    match = _CLOSING_QUOTE_RE.search(text)
    if not match:
        alt = re.search(r"::: closing-quote\s*\n(.*?)\n:::", text, re.S)
        if not alt:
            return text
        body = alt.group(1).strip()
    else:
        body = match.group(1).strip()

    return (
        "```{=latex}\n"
        "\\clearpage\n"
        "\\vspace*{0.32\\textheight}\n"
        "\\begin{center}\n"
        "\\itshape\n"
        f"{body}\n"
        "\\end{center}\n"
        "```\n"
    )
