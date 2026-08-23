"""Tests for scripts/assemble.py Part section parsing."""

from __future__ import annotations

from pathlib import Path

import pytest

from after_certainty.manuscript.assemble import (
    assemble_index_sections,
    assemble_markdown_units,
    assemble_part_sections,
)


@pytest.fixture
def sample_book(tmp_path: Path) -> Path:
    book = tmp_path / "sample-book"
    manuscript = book / "manuscript" / "act-1-alpha"
    manuscript.mkdir(parents=True)
    (manuscript / "chapter-01-one.md").write_text("# One\n", encoding="utf-8")
    (manuscript / "chapter-02-two.md").write_text("# Two\n", encoding="utf-8")

    act2 = book / "manuscript" / "act-2-beta"
    act2.mkdir(parents=True)
    (act2 / "chapter-03-three.md").write_text("# Three\n", encoding="utf-8")

    (book / "front-matter" / "title-page.md").parent.mkdir(parents=True)
    (book / "front-matter" / "title-page.md").write_text("# Title\n", encoding="utf-8")

    (book / "index.md").write_text(
        """# Sample

## Front Matter

- [Title Page](front-matter/title-page.md)

## Part I — Alpha

- [Chapter 1](manuscript/act-1-alpha/chapter-01-one.md)
- [Chapter 2](manuscript/act-1-alpha/chapter-02-two.md)

## Part II — Beta

- [Chapter 3](manuscript/act-2-beta/chapter-03-three.md)
""",
        encoding="utf-8",
    )
    return book


def test_assemble_part_sections_uses_manuscript_folder_slug(sample_book: Path) -> None:
    sections = assemble_part_sections(sample_book)
    assert [section.slug for section in sections] == [
        "act-1-alpha",
        "act-2-beta",
    ]
    assert [len(section.paths) for section in sections] == [2, 1]


@pytest.fixture
def act_headed_book(tmp_path: Path) -> Path:
    """A fiction-style book whose index uses '## Act …' instead of '## Part …'."""
    book = tmp_path / "act-book"
    act1 = book / "manuscript" / "act-1-the-absence"
    act1.mkdir(parents=True)
    (act1 / "chapter-01-one.md").write_text("# One\n", encoding="utf-8")
    (act1 / "chapter-02-two.md").write_text("# Two\n", encoding="utf-8")

    act2 = book / "manuscript" / "act-2-the-cascade"
    act2.mkdir(parents=True)
    (act2 / "chapter-03-three.md").write_text("# Three\n", encoding="utf-8")

    (book / "front-matter").mkdir(parents=True)
    (book / "front-matter" / "title-page.md").write_text("# Title\n", encoding="utf-8")

    (book / "index.md").write_text(
        """# Act Book

## Front Matter

- [Title Page](front-matter/title-page.md)

## Act I — The Absence

- [Chapter 1](manuscript/act-1-the-absence/chapter-01-one.md)
- [Chapter 2](manuscript/act-1-the-absence/chapter-02-two.md)

## Act II — The Cascade

- [Chapter 3](manuscript/act-2-the-cascade/chapter-03-three.md)

## Structure

Some prose, no links.
""",
        encoding="utf-8",
    )
    return book


def test_assemble_part_sections_matches_act_headings(act_headed_book: Path) -> None:
    sections = assemble_part_sections(act_headed_book)
    # Only the Act sections are returned; Front Matter and Structure are excluded.
    assert [section.slug for section in sections] == [
        "act-1-the-absence",
        "act-2-the-cascade",
    ]
    assert [section.heading for section in sections] == [
        "Act I — The Absence",
        "Act II — The Cascade",
    ]
    assert [len(section.paths) for section in sections] == [2, 1]


def test_assemble_index_sections_includes_front_matter(sample_book: Path) -> None:
    sections = assemble_index_sections(sample_book)
    assert sections[0].heading == "Front Matter"
    assert sections[0].slug == "front-matter"


def test_assemble_markdown_units_skips_out_of_book_links(tmp_path: Path) -> None:
    book = tmp_path / "book-a"
    sibling = tmp_path / "book-b"
    (book / "chapters").mkdir(parents=True)
    sibling.mkdir(parents=True)
    (book / "chapters" / "one.md").write_text("# One\n", encoding="utf-8")
    (sibling / "index.md").write_text("# Other book\n", encoding="utf-8")
    (book / "index.md").write_text(
        """# Book A

## Chapters

- [One](chapters/one.md)

## Related books

- [Book B](../book-b/index.md)
""",
        encoding="utf-8",
    )

    units = assemble_markdown_units(book)
    assert [path.name for path in units] == ["one.md"]
