#!/usr/bin/env python3
"""Tests for tools/list_book_covers.py and cover_assets_manifest.py."""

from __future__ import annotations

import json
from pathlib import Path

from cover_assets_manifest import attach_cover_images_to_books, cover_fields_for_slug
from list_book_covers import list_book_covers

REPO = Path(__file__).resolve().parents[1]


def test_list_book_covers_includes_eligible_public_books() -> None:
    entries = list_book_covers(REPO)
    assert entries
    eligible = [e for e in entries if e["eligible"]]
    assert len(eligible) >= 30
    assert all(e["coverPath"] for e in eligible)
    assert all("/" not in e["slug"] and ".." not in e["slug"] for e in eligible)
    slugs = {e["slug"] for e in eligible}
    assert "after-certainty" in slugs
    assert "when-others-look-to-you-v2" in slugs


def test_attach_cover_images_from_generated_manifest() -> None:
    cover_manifest_path = REPO / "build" / "site-assets" / "book-covers" / "manifest.json"
    if not cover_manifest_path.is_file():
        return
    cover_manifest = json.loads(cover_manifest_path.read_text(encoding="utf-8"))
    fields = cover_fields_for_slug(cover_manifest, "after-certainty", require=True)
    assert fields is not None
    assert set(fields["coverImages"]) == {"detail", "card", "thumbnail"}
    books = [
        {
            "slug": "after-certainty",
            "status": "published",
            "coverImagePath": "books/after-certainty/book-cover.png",
            "coverImage": "https://example.com/x.png",
        }
    ]
    attach_cover_images_to_books(books, cover_manifest, require_for_covered=True)
    assert "coverImages" in books[0]
    assert books[0]["coverImages"]["card"]["url"].startswith("/generated/book-covers/")
