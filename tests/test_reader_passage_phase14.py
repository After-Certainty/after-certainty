"""Phase 14: narrow reader citations to the actual reviewed source works."""

from __future__ import annotations

import json
import re
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
CASES = (
    (
        "california-african-american-museum-free-breakfast-for-school-children-program",
        "books/the-world-we-make-together/parts/part-3-what-shared-power-requires/chapter-8-the-bowl.md",
        "c8-bpp-oakland",
        "California African American Museum",
    ),
    (
        "blackpast-black-panther-party-s-free-breakfast-program-1969-1980",
        "books/the-world-we-make-together/parts/part-3-what-shared-power-requires/chapter-8-the-bowl.md",
        "c8-bpp-legacy",
        "BlackPast",
    ),
    (
        "associated-press-taylor-swift-donates-to-food-banks-on-eras-tour-providing-thousands-of-meals",
        "books/when-others-become-leaders/parts/part-3-how-influence-endures/chapter-9-the-bracelet.md",
        "b3",
        "Stephanie Beasley",
    ),
    (
        "cockburn-alistair-the-heart-of-agile",
        "books/coupling/parts/part-2-software-as-early-laboratory/08-heart-of-agile-returning-to-essentials.md",
        "c8-emergence",
        "Alistair Cockburn",
    ),
    (
        "crawford-kate-atlas-of-ai-power-politics-and-the-planetary-costs-of-artificial",
        "books/living-in-sediment/parts/part-3-fossils-forming-now/chapter-11-delegated-judgment.md",
        "c11-crawford-power",
        "Kate Crawford",
    ),
)


def _source(slug: str) -> dict:
    return yaml.safe_load((ROOT / "semantic/sources" / f"{slug}.yml").read_text(encoding="utf-8"))


def _definition(text: str, note: str) -> str:
    defs = re.findall(rf"^\[\^{re.escape(note)}\]: (.*)$", text, re.M)
    assert len(defs) == 1, (note, defs)
    assert re.search(rf"\[\^{re.escape(note)}\](?!:)", text)
    return defs[0]


def test_source_metadata_resolves_to_its_exact_footnote() -> None:
    reviews = json.loads(
        (ROOT / "reports/reader-passage-links/review-log.json").read_text(encoding="utf-8")
    )["entries"]
    for slug, manuscript_path, note, author in CASES:
        source = _source(slug)
        assert source["readerPassagePath"].endswith("#user-content-fnref-" + note)
        assert source["whyThisMatters"].strip()
        text = (ROOT / manuscript_path).read_text(encoding="utf-8")
        assert author in _definition(text, note)
        key = f"source:{slug}:{source['readerPassagePath']}"
        assert reviews[key]["status"] == "applied"
        assert reviews[key]["evidenceLevel"] == "A"


def test_panther_history_and_federal_program_are_separate() -> None:
    manuscript = (ROOT / CASES[0][1]).read_text(encoding="utf-8")
    assert "expansion.[^c8-bpp-legacy]" in manuscript
    assert "USDA" not in _definition(manuscript, "c8-bpp-legacy")
    assert "BlackPast" not in _definition(manuscript, "c8-usda")
    assert "caamuseum.org/learn/" in _definition(manuscript, "c8-bpp-oakland")


def test_swift_article_identity_date_and_location_corrected() -> None:
    source = _source(CASES[2][0])
    assert source["year"] == 2024
    assert source["creatorNames"] == ["Stephanie Beasley"]
    assert source["title"] == "Did Taylor Swift Create a New Era for Food Bank Donations?"
    manuscript = (ROOT / CASES[2][1]).read_text(encoding="utf-8")
    assert "In Denver, Food Bank of the Rockies" in manuscript
    assert "In New Orleans, one food bank" not in manuscript
    assert "August 25, 2024" in _definition(manuscript, "b3")


def test_cockburn_and_crawford_are_not_shared_with_other_works() -> None:
    heart = (ROOT / CASES[3][1]).read_text(encoding="utf-8")
    crawford = (ROOT / CASES[4][1]).read_text(encoding="utf-8")
    assert _source(CASES[3][0])["title"] == "The Heart of Agile begins"
    assert "Technical Report" not in _definition(heart, "c8-emergence")
    assert _source(CASES[4][0])["title"].endswith("Artificial Intelligence")
    assert "Meadows" not in _definition(crawford, "c11-crawford-power")
    assert "Kate Crawford" not in _definition(crawford, "c11-optimization-authority")
