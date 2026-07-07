"""Tests for bibliography extraction and source metadata normalization."""

from __future__ import annotations

import sys
from pathlib import Path

_TOOLS = Path(__file__).resolve().parents[1] / "tools"
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from extract_semantic_source_drafts import parse_list_bibliography  # noqa: E402
from source_metadata import (  # noqa: E402
    enrich_source_record,
    normalize_display_name,
    parse_bibliography_author_title,
    strip_markdown_italics,
)


def test_strip_markdown_italics() -> None:
    assert strip_markdown_italics("*Defense System Software Development*") == (
        "Defense System Software Development"
    )
    assert strip_markdown_italics(
        "President's Commission on the Space Shuttle *Challenger* Accident"
    ) == ("President's Commission on the Space Shuttle Challenger Accident")


def test_parse_bibliography_comma_before_italic() -> None:
    line = "U.S. Department of Defense. DOD-STD-2167A, *Defense System Software Development*. 1988."
    author, title = parse_bibliography_author_title(line)
    assert author == "U.S. Department of Defense"
    assert title == "Defense System Software Development"


def test_parse_bibliography_institutional_dataset() -> None:
    line = (
        "U.S. Bureau of Labor Statistics. Consumer Price Index (CPI) news releases "
        "and databases, 2020–2024. https://www.bls.gov/cpi/"
    )
    author, title = parse_bibliography_author_title(line)
    assert author == "U.S. Bureau of Labor Statistics"
    assert "Consumer Price Index" in title


def test_parse_bibliography_cms() -> None:
    line = (
        "Centers for Medicare & Medicaid Services. Hospital Readmissions Reduction "
        "Program (HRRP). Program overview and statutory authority. Updated 2023."
    )
    author, title = parse_bibliography_author_title(line)
    assert author == "Centers for Medicare & Medicaid Services"
    assert title.startswith("Hospital Readmissions")


def test_normalize_display_name() -> None:
    assert normalize_display_name("World Bank", "State and Trends of Carbon Pricing") == (
        "World Bank — State and Trends of Carbon Pricing"
    )


def test_extract_dod_bibliography_entry() -> None:
    text = (
        "- U.S. Department of Defense. DOD-STD-2167A, *Defense System Software Development*. 1988."
    )
    rows = parse_list_bibliography(text)
    assert len(rows) == 1
    row = rows[0]
    assert row["workTitle"] == "Defense System Software Development"
    assert "Department of Defense" in row["name"]


def test_enrich_source_record_from_garbled_dod_name() -> None:
    raw = {
        "slug": "u-s-department-of-defense-dod-std-2167a-defense-system-software-development",
        "name": "*Defense System Software Development* U.S. Department of Defense. DOD-STD-2167A",
        "type": "book",
        "summary": (
            "U.S. Department of Defense. DOD-STD-2167A, "
            "*Defense System Software Development*. 1988."
        ),
        "concepts": [],
        "patterns": [],
        "relatedBooks": ["coupling"],
        "creatorNames": [
            "*Defense System Software Development* U.S. Department of Defense. DOD-STD-2167A"
        ],
        "creatorSlugs": [
            "defense-system-software-development-u-s-department-of-defense-dod-std-2167a"
        ],
        "institution": (
            "*Defense System Software Development* U.S. Department of Defense. DOD-STD-2167A"
        ),
        "sourceKind": "institutional_document",
        "year": 1988,
    }
    out = enrich_source_record(raw, overwrite=True)
    assert "*" not in out["name"]
    assert out["title"] == "Defense System Software Development"
    assert out["creatorNames"] == ["U.S. Department of Defense"]
    assert out["institution"] == "U.S. Department of Defense"
    assert out["sourceKind"] == "standard"
