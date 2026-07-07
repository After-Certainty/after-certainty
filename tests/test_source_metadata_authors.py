"""Tests for bibliographic author parsing helpers."""

from __future__ import annotations

from source_metadata import is_multi_person_thinker_name, parse_bibliographic_author_list


def test_parse_author_list_two_authors() -> None:
    authors = parse_bibliographic_author_list("Ross, Lee, and Richard Nisbett")
    assert authors == ["Lee Ross", "Richard Nisbett"]


def test_parse_author_list_with_jr_suffix() -> None:
    authors = parse_bibliographic_author_list("Berle, Adolf A., Jr., and Gardiner C. Means")
    assert authors == ["Adolf A. Berle Jr.", "Gardiner C. Means"]


def test_single_author_with_jr_not_multi_person() -> None:
    assert not is_multi_person_thinker_name("King, Martin Luther, Jr")
    assert parse_bibliographic_author_list("King, Martin Luther, Jr") == ["Martin Luther King Jr."]
