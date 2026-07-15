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


def test_display_order_pair_is_multi_person() -> None:
    name = "Kelly D. Brownell and Kenneth E. Warner"
    assert is_multi_person_thinker_name(name)
    assert parse_bibliographic_author_list(name) == [
        "Kelly D. Brownell",
        "Kenneth E. Warner",
    ]


def test_display_order_comma_list() -> None:
    name = "Betsy Beyer, Chris Jones, Jennifer Petoff, and Niall Richard Murphy"
    assert is_multi_person_thinker_name(name)
    assert parse_bibliographic_author_list(name) == [
        "Betsy Beyer",
        "Chris Jones",
        "Jennifer Petoff",
        "Niall Richard Murphy",
    ]


def test_display_order_three_with_accents() -> None:
    name = "Anna C. Merritt, Daniel A. Effron, and Benoît Monin"
    assert parse_bibliographic_author_list(name) == [
        "Anna C. Merritt",
        "Daniel A. Effron",
        "Benoît Monin",
    ]
