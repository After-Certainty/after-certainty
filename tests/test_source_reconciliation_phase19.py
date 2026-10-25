"""Phase 19: maintain safe, additive source/book relationships."""

from __future__ import annotations

import pytest
import yaml
from tools.reconcile_phase19_existing_sources import (
    ACCEPTED_METHODS,
    MIN_SCORE,
    append_book_link,
)


def test_phase19_adds_related_book_without_mutating_other_metadata() -> None:
    original = (
        "slug: source\n"
        "name: Author — Work\n"
        "relatedBooks:\n"
        "- first-book\n"
        "readerPassagePath: /explore/books/first-book/chapters/a#user-content-fnref-one\n"
        "whyThisMatters: Substantive existing interpretation.\n"
    )
    modified = append_book_link(original, "when-the-key-changes-hands")
    assert yaml.safe_load(modified)["relatedBooks"] == [
        "first-book",
        "when-the-key-changes-hands",
    ]
    assert "readerPassagePath: /explore/books/first-book/" in modified
    assert append_book_link(modified, "when-the-key-changes-hands") == modified


def test_phase19_adds_to_empty_book_list() -> None:
    modified = append_book_link(
        "slug: source\nrelatedBooks: []\ntitle: Example\n",
        "when-the-key-changes-hands",
    )
    assert yaml.safe_load(modified)["relatedBooks"] == ["when-the-key-changes-hands"]


def test_phase19_rejects_invalid_related_books() -> None:
    with pytest.raises(ValueError, match="Unexpected relatedBooks"):
        append_book_link("slug: source\nrelatedBooks: not-a-list\n", "some-book")


def test_phase19_disallows_weak_fuzzy_source_matches() -> None:
    assert "summary_overlap" not in ACCEPTED_METHODS
    assert "title_author" in ACCEPTED_METHODS
    assert MIN_SCORE >= 85
