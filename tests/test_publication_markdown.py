"""Publication markdown preprocessing and validation."""

from __future__ import annotations

import sys
from pathlib import Path

_REPO = Path(__file__).resolve().parents[1]
_TOOLS = _REPO / "tools"
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from publication_markdown import (  # noqa: E402
    find_publication_issues,
    prepare_manuscript_unit_for_export,
    strip_footnote_only_notes_heading,
)
from validate_publication_manuscript import validate_book_for_publication  # noqa: E402

WOBL = _REPO / "books" / "when-others-become-leaders"


def test_strip_footnote_only_notes_heading_removes_heading() -> None:
    raw = """# Chapter

Closing paragraph.

## Notes

[^a1]: First source.
[^a2]: Second source.
"""
    out = strip_footnote_only_notes_heading(raw)
    assert "## Notes" not in out
    assert "[^a1]: First source." in out
    assert "[^a2]: Second source." in out


def test_strip_preserves_notes_heading_with_prose() -> None:
    raw = """# Chapter

Body.

## Notes

Editorial note on disputed reading.

[^a1]: Source.
"""
    out = strip_footnote_only_notes_heading(raw)
    assert "## Notes" in out
    assert "Editorial note" in out


def test_prepare_adds_blank_line_before_footnotes() -> None:
    raw = """Last line of chapter.
[^x1]: Citation here.
"""
    out = prepare_manuscript_unit_for_export(raw)
    assert "Last line of chapter.\n\n[^x1]:" in out


def test_find_publication_issues_flags_internal_bibliography_line() -> None:
    text = "Sources cited in the manuscript and research packets.\n"
    issues = find_publication_issues(text)
    assert any("research packets" in issue for issue in issues)


def test_wobl_chapters_have_no_empty_notes_after_prepare() -> None:
    chapters = sorted((WOBL / "parts").rglob("chapter-*.md"))
    assert len(chapters) == 9
    for path in chapters:
        prepared = prepare_manuscript_unit_for_export(path.read_text(encoding="utf-8"))
        assert "## Notes" not in prepared, f"{path.name} still has Notes heading"
        assert "[^" in prepared, f"{path.name} lost footnote definitions"


def test_wobl_publication_validation_passes() -> None:
    issues = validate_book_for_publication(WOBL)
    assert issues == []


def test_wobl_bibliography_has_no_internal_paths() -> None:
    bib = (WOBL / "back-matter" / "bibliography.md").read_text(encoding="utf-8")
    issues = find_publication_issues(bib, source="bibliography.md")
    assert issues == []
    assert "research packets" not in bib
    assert "bibliography-guide" not in bib
