#!/usr/bin/env python3
"""Optional per-book export assets (reference DOCX, EPUB CSS, PDF LaTeX header)."""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any


def _as_dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


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


_COVER_IMAGE_RE = re.compile(
    r"^!\[[^\]]*\]\(([^)]+)\)(?:\{[^}]*\})?\s*$",
    re.M,
)

_NEWPAGE_RE = re.compile(r"(?m)^\\newpage[ \t]*$")

_OPENXML_PAGEBREAK = (
    "```{=openxml}\n<w:p>\n  <w:r>\n    <w:br w:type=\"page\"/>\n  </w:r>\n</w:p>\n```"
)


def replace_newpage_for_docx(text: str) -> str:
    """Translate LaTeX ``\\newpage`` markers into OpenXML page breaks for DOCX."""
    return _NEWPAGE_RE.sub(_OPENXML_PAGEBREAK, text)


def title_page_cover_basename(spec: dict[str, Any]) -> str:
    book = _as_dict(spec.get("book"))
    return str(book.get("title_page_cover") or "").strip()


def title_page_cover_unnumbered(spec: dict[str, Any]) -> bool:
    book = _as_dict(spec.get("book"))
    return book.get("title_page_cover_unnumbered") is True


def resolve_title_page_cover_path(book_dir: Path, spec: dict[str, Any]) -> Path | None:
    """Return an on-disk cover image path for EPUB metadata, if configured."""
    basename = title_page_cover_basename(spec)
    if basename:
        candidate = (book_dir / basename).resolve()
        if candidate.is_file():
            return candidate
    for name in ("book-cover.png", "BookCover.png", "book_cover.png"):
        candidate = (book_dir / name).resolve()
        if candidate.is_file():
            return candidate
    return None


def strip_inline_title_page_cover(text: str, cover_basename: str) -> str:
    """
    Remove the markdown title-page cover image for print interiors.

    IngramSpark expects a separate cover PDF upload; the interior should not
    repeat the jacket art. Also drops a following ``\\newpage`` that only
    separated the cover image from the title text.
    """
    cover_name = Path(cover_basename).name
    if not cover_name:
        return text

    lines = text.splitlines()
    out: list[str] = []
    i = 0
    while i < len(lines):
        line = lines[i]
        match = re.match(r"^!\[[^\]]*\]\(([^)]+)\)(?:\{[^}]*\})?\s*$", line)
        if match and Path(match.group(1).strip()).name == cover_name:
            i += 1
            while i < len(lines) and not lines[i].strip():
                i += 1
            if i < len(lines) and lines[i].strip() == r"\newpage":
                i += 1
                while i < len(lines) and not lines[i].strip():
                    i += 1
            continue
        out.append(line)
        i += 1

    cleaned = "\n".join(out)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned).strip()
    return cleaned + "\n" if cleaned else ""


def prepare_title_page_for_pdf(
    text: str, cover_basename: str, *, cover_path: Path | None = None
) -> str:
    """Replace the markdown cover image with unnumbered raw LaTeX for PDF export."""
    image_ref = cover_path.as_posix() if cover_path is not None else cover_basename

    def replace(match: re.Match[str]) -> str:
        path = match.group(1).strip()
        if Path(path).name != cover_basename:
            return match.group(0)
        # Absolute or book-relative paths work for xelatex; basename alone does not,
        # because raw LaTeX bypasses Pandoc's --resource-path resolution.
        return (
            "```{=latex}\n"
            "\\thispagestyle{empty}\n"
            "\\begin{center}\n"
            f"\\includegraphics[width=\\textwidth]{{{image_ref}}}\n"
            "\\end{center}\n"
            "\\clearpage\n"
            "```\n"
        )

    return _COVER_IMAGE_RE.sub(replace, text)


def prepare_title_page_for_docx(text: str, cover_basename: str) -> str:
    """Use an empty image alt so Word does not render a figure caption."""

    def replace(match: re.Match[str]) -> str:
        path = match.group(1).strip()
        if Path(path).name != cover_basename:
            return match.group(0)
        attrs = ""
        full = match.group(0)
        brace = re.search(r"\{[^}]+\}\s*$", full)
        if brace:
            attrs = brace.group(0).strip()
        return f"![]({cover_basename}){attrs}"

    return _COVER_IMAGE_RE.sub(replace, text)


_CLOSING_QUOTE_RE = re.compile(
    r'::: \{custom-style="Closing Quote Block" \.closing-quote\}\s*\n(.*?)\n:::',
    re.S,
)


def prepare_closing_markdown_for_pdf(text: str) -> str:
    """Render the closing quote as its own PDF page, then clear before the next unit.

    Pandoc does not emit LaTeX environments for the closing fenced divs. Without a
    trailing ``\\clearpage``, short quote pages flow into the following unit
    (e.g. appendix) on the same physical page.
    """
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
        "\\clearpage\n"
        "```\n"
    )


_LEADING_NEWPAGE_RE = re.compile(r"^(?:\\newpage[ \t]*\n+)+")


def prepare_bridge_markdown_for_pdf(text: str) -> str:
    """Bottom-align a short part-bridge opener on its own PDF/print page.

    Part bridges are usually a heading plus a few paragraphs; top alignment leaves
    a large empty lower half. Leading ``\\newpage`` markers are replaced by an
    explicit ``\\clearpage`` plus ``\\vspace*{\\fill}`` so the markdown heading
    still converts normally.
    """
    body = text.strip()
    if not body:
        return text
    body = _LEADING_NEWPAGE_RE.sub("", body).strip()
    if not body:
        return text
    return (
        "```{=latex}\n"
        "\\clearpage\n"
        "\\vspace*{\\fill}\n"
        "```\n\n"
        f"{body}\n\n"
        "```{=latex}\n"
        "\\vspace*{0.12\\textheight}\n"
        "\\clearpage\n"
        "```\n"
    )
