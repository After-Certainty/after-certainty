"""Tests for Kindle/EPUB flatten: part injection and title-page cover strip."""

from __future__ import annotations

from pathlib import Path

from after_certainty.export import kindle_flatten
from after_certainty.manuscript.assemble import resolve_book_markdown
from after_certainty.manuscript.publication_markdown import prepare_manuscript_unit_for_export

_REPO = Path(__file__).resolve().parents[1]


def test_strip_inline_cover_removes_image_and_following_newpage() -> None:
    text = (
        "![Cover](book-cover.png){ width=100% }\n\n"
        "\\newpage\n\n"
        "# **Everyone Knows Love**\n\n"
        "## **Why Is It So Hard to Explain?**\n\n"
        "**Kevin Steffensen**\n"
    )
    out = kindle_flatten.strip_inline_cover_image(text)
    assert "book-cover.png" not in out
    assert "\\newpage" not in out
    assert out.startswith("# **Everyone Knows Love**")
    assert "Kevin Steffensen" in out


def test_should_inject_part_h1_skips_matching_bridge_heading() -> None:
    part_h1 = "# **Part I — Everyone Knows Love**"
    body = "\\newpage\n\n# Part I — Everyone Knows Love\n\nThe question arrives.\n"
    assert kindle_flatten.should_inject_part_h1(part_h1, body) is False


def test_should_inject_part_h1_skips_bridge_with_different_subtitle() -> None:
    part_h1 = "# **Part V — The Mystery Remains**"
    body = "# Part V — Humanity's Long Conversation About Love\n\nWe have watched.\n"
    assert kindle_flatten.should_inject_part_h1(part_h1, body) is False


def test_should_inject_part_h1_when_unit_lacks_part_title() -> None:
    part_h1 = "# **Part I — Everyone Knows Love**"
    body = "# Chapter 1 — Something Else\n\nBody.\n"
    assert kindle_flatten.should_inject_part_h1(part_h1, body) is True


def test_strip_leading_newpage() -> None:
    assert kindle_flatten.strip_leading_newpage("\\newpage\n\n# Title\n") == "# Title\n"


def test_ekl_flatten_has_single_part_heading_and_title(tmp_path: Path) -> None:
    book_dir = _REPO / "books" / "everyone-knows-love"
    out = tmp_path / "prepared.md"
    # Run flatten main path via helpers to keep the test focused.
    indexed = kindle_flatten.parse_index_links_with_part_markers(
        (book_dir / "index.md").read_text(encoding="utf-8")
    )

    chunks: list[str] = []
    seen: set[Path] = set()
    for part_h1, rel in indexed:
        fp = resolve_book_markdown(book_dir, rel)
        if fp is None or fp in seen:
            continue
        seen.add(fp)
        text = kindle_flatten.strip_inline_cover_image(fp.read_text(encoding="utf-8"))
        text = prepare_manuscript_unit_for_export(text)
        body = kindle_flatten.strip_leading_newpage(text.strip())
        if kindle_flatten.should_inject_part_h1(part_h1, body):
            body = f"{part_h1}\n\n{body}"
        chunks.append(body)

    combined = "\n\n".join(chunks)
    out.write_text(combined + "\n", encoding="utf-8")

    # Title page: typographic title only (no orphan \\newpage / bare duplicate).
    assert combined.lstrip().startswith("# **Everyone Knows Love**")
    assert combined.count("# **Everyone Knows Love**") == 1

    # Five parts, one H1 each (no synthetic duplicate before bridge).
    for part in (
        "Part I — Everyone Knows Love",
        "Part II — How Love Moves",
        "Part III — How Love Deepens",
        "Part IV — Love in Human Life",
        "Part V — Humanity's Long Conversation About Love",
    ):
        assert combined.count(f"# {part}") == 1
        assert combined.count(f"# **{part}**") == 0
    assert "# **Part V — The Mystery Remains**" not in combined
