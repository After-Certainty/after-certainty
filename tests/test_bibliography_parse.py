"""Tests for bibliography parsers and biblio↔semantic drift matching."""

from __future__ import annotations

import sys
from pathlib import Path

_TOOLS = Path(__file__).resolve().parents[1] / "tools"
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from audit_bibliography_semantic_drift import (  # noqa: E402
    match_expected_to_sources,
    score_expected_vs_source,
)
from bibliography_parse import (  # noqa: E402
    parse_bibliography,
    parse_list_bibliography,
    parse_pandoc_div_bibliography,
    parse_plain_chicago_bibliography,
)
from extract_semantic_source_drafts import parse_list_bibliography as extract_list  # noqa: E402


def test_parse_list_bibliography_basic() -> None:
    text = "- U.S. Department of Defense. DOD-STD-2167A, *Defense System Software Development*. 1988.\n"
    rows = parse_list_bibliography(text)
    assert len(rows) == 1
    assert rows[0]["workTitle"] == "Defense System Software Development"
    assert "Department of Defense" in rows[0]["name"]
    assert "*" not in rows[0]["summary"]
    assert "Defense System Software Development" in rows[0]["summary"]
    # re-export from extract still works
    assert len(extract_list(text)) == 1


def test_parse_pandoc_div_bibliography() -> None:
    text = """
# **Bibliography**

::: {custom-style="Bibliography"}
Bartels, Larry M. "Beyond the Running Tally: Partisan Bias in Political Perceptions." *Political Behavior* 24, no. 2 (2002): 117–150.
:::

::: {custom-style="Bibliography"}
Bernanke, Ben S. *The Courage to Act: A Memoir of a Crisis and Its Aftermath*. New York: W. W. Norton, 2015.
:::
"""
    rows = parse_pandoc_div_bibliography(text)
    assert len(rows) == 2
    titles = {r["workTitle"] for r in rows}
    assert "Beyond the Running Tally: Partisan Bias in Political Perceptions" in titles
    assert "The Courage to Act: A Memoir of a Crisis and Its Aftermath" in titles
    authors = {r["name"] for r in rows}
    assert "Larry M Bartels" in authors or "Larry M. Bartels" in authors
    assert "Ben S Bernanke" in authors or "Ben S. Bernanke" in authors


def test_parse_plain_chicago_bibliography() -> None:
    text = """
# **Bibliography**

## Chapter 1

Institute of Medicine. *Hospital-Based Emergency Care: At the Breaking Point*. Washington, DC: National Academies Press, 2007.

Talbot, S. G., and W. Dean. "Physicians Aren't 'Burning Out.' They're Suffering from Moral Injury." *STAT*, July 26, 2018.

## Chapter 2

Zuckerberg, Mark. Testimony before the U.S. Senate Judiciary and Commerce Committees, April 10–11, 2018.
"""
    rows = parse_plain_chicago_bibliography(text)
    assert len(rows) >= 2
    titles = [r["workTitle"] for r in rows]
    assert any("Hospital-Based Emergency Care" in t for t in titles)
    assert any("Burning Out" in t or "Moral Injury" in t for t in titles)


def test_parse_bibliography_picks_richest_style() -> None:
    text = """
::: {custom-style="Bibliography"}
Arendt, Hannah. *Between Past and Future*. New York: Penguin Books, 2006.
:::
"""
    result = parse_bibliography(text)
    assert result.style == "pandoc_div"
    assert len(result.rows) == 1
    assert result.rows[0]["workTitle"] == "Between Past and Future"


def test_parse_bibliography_prefers_list_on_tie_like_content() -> None:
    text = "- Arendt, Hannah. *The Human Condition*. Chicago: University of Chicago Press, 1958.\n"
    result = parse_bibliography(text)
    assert result.style == "list"
    assert len(result.rows) == 1


def test_score_exact_slug() -> None:
    expected = {
        "slug": "arendt-hannah-between-past-and-future",
        "author": "Hannah Arendt",
        "workTitle": "Between Past and Future",
    }
    src = {
        "slug": "arendt-hannah-between-past-and-future",
        "name": "Hannah Arendt — Between Past and Future",
        "title": "Between Past and Future",
        "creatorNames": ["Hannah Arendt"],
    }
    score, method = score_expected_vs_source(expected, src)
    assert score == 100
    assert method == "exact_slug"


def test_score_title_author() -> None:
    expected = {
        "slug": "arendt-hannah-between-past-and-future-draft",
        "author": "Hannah Arendt",
        "workTitle": "Between Past and Future",
        "summary": "Arendt, Hannah. *Between Past and Future*.",
    }
    src = {
        "slug": "arendt-hannah-between-past-and-future",
        "name": "Hannah Arendt — Between Past and Future",
        "title": "Between Past and Future",
        "creatorNames": ["Hannah Arendt"],
        "citation": "Arendt, Hannah. *Between Past and Future*. New York: Penguin Books, 2006.",
        "summary": "Arendt, Hannah. *Between Past and Future*. New York: Penguin Books, 2006.",
    }
    score, method = score_expected_vs_source(expected, src)
    assert score >= 50
    assert method in {"title_author", "display_name", "citation_containment"}


def test_match_classifies_matched_missing_stale() -> None:
    expected = [
        {
            "slug": "a-one",
            "author": "Alice Author",
            "workTitle": "Known Work Title",
            "summary": "Alice Author. *Known Work Title*. 2020.",
        },
        {
            "slug": "b-two",
            "author": "Bob Builder",
            "workTitle": "Only In Bibliography",
            "summary": "Bob Builder. *Only In Bibliography*. 2021.",
        },
    ]
    linked = {
        "known-work": {
            "slug": "known-work",
            "name": "Alice Author — Known Work Title",
            "title": "Known Work Title",
            "creatorNames": ["Alice Author"],
            "citation": "Alice Author. *Known Work Title*. 2020.",
            "summary": "Alice Author. *Known Work Title*. 2020.",
        },
        "stale-work": {
            "slug": "stale-work",
            "name": "Carol Writer — Gone From Biblio",
            "title": "Gone From Biblio",
            "creatorNames": ["Carol Writer"],
            "citation": "Carol Writer. *Gone From Biblio*. 2019.",
            "summary": "Carol Writer. *Gone From Biblio*. 2019.",
        },
    }
    hits, unmatched_exp, unmatched_src = match_expected_to_sources(expected, linked)
    assert len(hits) == 1
    assert hits[0].source_slug == "known-work"
    assert {e["slug"] for e in unmatched_exp} == {"b-two"}
    assert unmatched_src == ["stale-work"]


def test_dedupe_expected_rows_drops_duplicate_titles() -> None:
    from audit_bibliography_semantic_drift import dedupe_expected_rows

    rows = [
        {
            "slug": "a",
            "author": "Mark Monmonier",
            "workTitle": "How to Lie with Maps",
            "summary": "x",
        },
        {
            "slug": "a-2",
            "author": "Mark Monmonier",
            "workTitle": "How to Lie with Maps",
            "summary": "y",
        },
    ]
    out = dedupe_expected_rows(rows)
    assert len(out) == 1
    assert out[0]["slug"] == "a"


def test_parse_wrapped_list_title() -> None:
    text = (
        "- Beyer, Betsy, Chris Jones, Jennifer Petoff, and Niall Richard Murphy,\n"
        "  eds. *Site Reliability Engineering: How Google Runs Production Systems*.\n"
        "  Sebastopol, CA: O'Reilly Media, 2016.\n"
    )
    rows = parse_list_bibliography(text)
    assert len(rows) == 1
    assert "Site Reliability Engineering" in rows[0]["workTitle"]
