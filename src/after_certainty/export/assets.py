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
    r"^!\[([^\]]*)\]\(([^)]+)\)(?:\{[^}]*\})?\s*$",
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


def title_page_cover_alt(text: str, cover_basename: str) -> str:
    """Return the markdown alt text for the configured title-page cover image."""
    cover_name = Path(cover_basename).name
    if not cover_name:
        return ""
    for match in _COVER_IMAGE_RE.finditer(text):
        if Path(match.group(2).strip()).name == cover_name:
            return match.group(1).strip()
    return ""


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
        match = re.match(r"^!\[([^\]]*)\]\(([^)]+)\)(?:\{[^}]*\})?\s*$", line)
        if match and Path(match.group(2).strip()).name == cover_name:
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
        path = match.group(2).strip()
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
    """Use an empty image alt so Word does not render a figure caption.

    Pandoc treats non-empty markdown image alt text as a printed Image Caption.
    Accessibility alt must be re-applied to the drawing ``descr`` after export.
    """

    def replace(match: re.Match[str]) -> str:
        path = match.group(2).strip()
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

# Extra top offset for print display openers (part bridges, front matter except title).
PRINT_DISPLAY_TOP_MARGIN_INCHES = 3.0

_MD_BOLD_RE = re.compile(r"\*\*(.+?)\*\*")
_TITLE_H1_RE = re.compile(r"(?m)^#\s+(.+)$")
_TITLE_H2_RE = re.compile(r"(?m)^##\s+(.+)$")
_AUTHOR_BOLD_LINE_RE = re.compile(r"(?m)^\*\*(.+?)\*\*\s*$")
_SERIES_SITE_LINK_RE = re.compile(
    r"\[www\.after-certainty\.com\]\(https://www\.after-certainty\.com/?\)"
)
_SERIES_VISIT_LINK_RE = re.compile(
    r"visit \[www\.after-certainty\.com\]\(https://www\.after-certainty\.com/?\)\."
)
_CHAPTER_UNIT_RE = re.compile(r"^chapter-.+\.md$", re.I)


def _strip_md_bold(text: str) -> str:
    return _MD_BOLD_RE.sub(r"\1", text).strip()


def _latex_escape(text: str) -> str:
    """Escape LaTeX specials in plain display-page strings."""
    replacements = {
        "\\": r"\textbackslash{}",
        "{": r"\{",
        "}": r"\}",
        "$": r"\$",
        "&": r"\&",
        "#": r"\#",
        "_": r"\_",
        "%": r"\%",
        "~": r"\textasciitilde{}",
        "^": r"\textasciicircum{}",
    }
    return "".join(replacements.get(ch, ch) for ch in text)


def prepare_print_title_page_display(text: str) -> str:
    """Centered typographic title block for IngramSpark print interiors.

    Suppresses the folio and places title / subtitle / author with deliberate
    vertical hierarchy instead of ordinary top-left markdown headings.
    """
    body = text.strip()
    if not body:
        return text
    body = _LEADING_NEWPAGE_RE.sub("", body).strip()
    if not body:
        return text

    title_match = _TITLE_H1_RE.search(body)
    subtitle_match = _TITLE_H2_RE.search(body)
    author_match = _AUTHOR_BOLD_LINE_RE.search(body)
    if title_match is None:
        return text

    title = _latex_escape(_strip_md_bold(title_match.group(1)))
    lines = [
        "```{=latex}",
        "\\thispagestyle{empty}",
        "\\vspace*{0.28\\textheight}",
        "\\begin{center}",
        f"{{\\LARGE\\bfseries {title}}}\\\\[1.25em]",
    ]
    if subtitle_match is not None:
        subtitle = _latex_escape(_strip_md_bold(subtitle_match.group(1)))
        lines.append(f"{{\\large {subtitle}}}\\\\[2.25em]")
    if author_match is not None:
        author = _latex_escape(_strip_md_bold(author_match.group(1)))
        lines.append(f"{author}")
    lines.extend(
        [
            "\\end{center}",
            "\\vspace*{\\fill}",
            "\\clearpage",
            "```",
            "",
        ]
    )
    return "\n".join(lines)


def prepare_copyright_for_print_pdf(text: str) -> str:
    """Copyright display page: new page, empty folio, 3in top offset."""
    return prepare_top_margin_display_for_pdf(text, empty_folio=True)


def prepare_about_the_series_for_print_pdf(text: str) -> str:
    """Keep www.after-certainty.com unbroken and within the text block.

    Tie ``visit`` to the domain with a non-breaking space and ``\\mbox`` so the
    URL neither hyphenates mid-domain nor orphans alone on the next page.
    """
    replacement = (
        r"`visit~\href{https://www.after-certainty.com}"
        r"{\mbox{www.after-certainty.com}}.`{=latex}"
    )
    if _SERIES_VISIT_LINK_RE.search(text):
        fixed = _SERIES_VISIT_LINK_RE.sub(lambda _m: replacement, text)
    else:
        fixed = _SERIES_SITE_LINK_RE.sub(
            lambda _m: (
                r"`\href{https://www.after-certainty.com}"
                r"{\mbox{www.after-certainty.com}}`{=latex}"
            ),
            text,
        )
    return prepare_top_margin_display_for_pdf(fixed, empty_folio=False)


def prepare_front_matter_display_for_pdf(text: str) -> str:
    """Top-align non-title front matter with the shared 3in display offset."""
    return prepare_top_margin_display_for_pdf(text, empty_folio=False)


def prepare_top_margin_display_for_pdf(
    text: str,
    *,
    top_inches: float = PRINT_DISPLAY_TOP_MARGIN_INCHES,
    empty_folio: bool = False,
) -> str:
    """Start a display unit on a new page, top-aligned with extra top margin.

    ``top_inches`` is measured from the page trim edge. Geometry already applies
    the profile outside/top margin (0.55in); this inserts the remainder and
    zeroes ``\\topskip`` so Pandoc ``\\section`` before-skip cannot stack on top.
    The leading ``#`` heading is emitted as raw LaTeX for the same reason.
    Does not clear after the unit, so following chapters can continue on the
    same page.
    """
    body = text.strip()
    if not body:
        return text
    body = _LEADING_NEWPAGE_RE.sub("", body).strip()
    if not body:
        return text

    title_match = _TITLE_H1_RE.match(body)
    heading_latex = ""
    rest = body
    if title_match is not None:
        heading = _latex_escape(_strip_md_bold(title_match.group(1)))
        heading_latex = f"\\noindent{{\\Large\\bfseries {heading}\\par}}\n\\vspace{{0.8em}}\n"
        rest = body[title_match.end() :].lstrip("\n")

    folio = "\\thispagestyle{empty}\n" if empty_folio else ""
    # Profile outside/top margin is 0.55in; land the heading at top_inches from trim.
    geometry_top = 0.55
    vspace_in = max(top_inches - geometry_top, 0.0)
    return (
        "```{=latex}\n"
        "\\clearpage\n"
        f"{folio}"
        "\\begingroup\n"
        "\\topskip=0pt\n"
        f"\\vspace*{{{vspace_in:g}in}}\n"
        "\\nointerlineskip\n"
        f"{heading_latex}"
        "\\endgroup\n"
        "```\n\n"
        f"{rest}\n"
    )


def strip_leading_newpage(text: str) -> str:
    """Remove leading ``\\newpage`` markers (e.g. chapter units that should flow)."""
    body = text.strip()
    if not body:
        return text
    stripped = _LEADING_NEWPAGE_RE.sub("", body).strip()
    if not stripped:
        return text
    return stripped + "\n"


def is_chapter_markdown_unit(name: str) -> bool:
    """True for manuscript chapter filenames (``chapter-*.md``)."""
    return bool(_CHAPTER_UNIT_RE.match(Path(name).name))


def prepare_bridge_markdown_for_pdf(text: str) -> str:
    """Top-align a part-bridge opener with extra top margin on its own PDF page.

    Leading ``\\newpage`` markers become ``\\clearpage`` plus a fixed top offset.
    Folios are suppressed. No trailing clear — the first chapter may continue on
    the same page after the part opener.
    """
    return prepare_top_margin_display_for_pdf(text, empty_folio=True)
