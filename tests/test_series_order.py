"""Tests for series-guide parsing used by books manifest generation."""

from __future__ import annotations

from pathlib import Path

from series_order import enrich_book_entries, parse_series_guide


def test_parse_series_guide_core_and_trust_orders(repo_root: Path) -> None:
    reading_orders, related_by_slug = parse_series_guide(repo_root)
    assert "core" in reading_orders
    assert len(reading_orders["core"]) == 8
    assert reading_orders["core"][0] == "before-certainty-arrives"
    assert reading_orders["core"][-1] == "after-certainty"
    assert "trust" in reading_orders
    assert reading_orders["trust"] == [
        "how-trust-forms",
        "when-trust-stops-tracking-reality",
        "trust-beyond-similarity",
    ]
    assert "how-meaning-moves" in related_by_slug
    assert "before-certainty-arrives" in related_by_slug["how-meaning-moves"]


def test_enrich_book_entries_adds_reading_order_and_related(repo_root: Path) -> None:
    reading_orders, related_by_slug = parse_series_guide(repo_root)
    books = [{"slug": "how-meaning-moves"}, {"slug": "after-certainty"}, {"slug": "coupling"}]
    enrich_book_entries(books, reading_orders, related_by_slug)

    meaning = next(item for item in books if item["slug"] == "how-meaning-moves")
    assert meaning["readingOrder"] == 2
    assert isinstance(meaning.get("relatedSlugs"), list)
    assert "before-certainty-arrives" in meaning["relatedSlugs"]

    capstone = next(item for item in books if item["slug"] == "after-certainty")
    assert capstone["readingOrder"] == 8

    coupling = next(item for item in books if item["slug"] == "coupling")
    assert "readingOrder" not in coupling
