"""Phase 13: cite distinct authorial claims rather than sharing unrelated notes."""

from __future__ import annotations

import json
import re
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
HOSPITAL = ROOT / (
    "books/when-incentives-become-the-moral-language/parts/"
    "part-1-the-need-for-translation/chapter-1-the-bed-someone-else-needs.md"
)
BOWL = ROOT / (
    "books/the-world-we-make-together/parts/"
    "part-4-from-power-over-to-power-with/chapter-10-the-window.md"
)
VICTORY = ROOT / (
    "books/when-others-become-leaders/parts/"
    "part-1-how-influence-begins/chapter-3-victory.md"
)
LINKS = (
    (
        "american-college-of-emergency-physicians-boarding",
        HOSPITAL,
        "c1-boarding",
        "Boarding of Admitted and Intensive Care Patients",
    ),
    (
        "institute-of-medicine-hospital-based-emergency-care-at-the-breaking-point",
        HOSPITAL,
        "c1-capacity",
        "Hospital-Based Emergency Care: At the Breaking Point",
    ),
    (
        "lowcountry-digital-history-initiative-local-and-national-leader-septima-p-clark",
        BOWL,
        "c10-expansion",
        "Local and National Leader: Septima P. Clark",
    ),
    (
        "mandela-nelson-statement-from-the-dock-rivonia-trial-20-april-1964",
        VICTORY,
        "v4",
        "statement from the dock",
    ),
    (
        "sncc-digital-gateway-birth-of-sncc",
        BOWL,
        "c10-shaw",
        "Birth of SNCC",
    ),
)


def _source(slug: str) -> dict:
    return yaml.safe_load(
        (ROOT / "semantic/sources" / f"{slug}.yml").read_text(encoding="utf-8")
    )


def _definition(text: str, note: str) -> str:
    matches = re.findall(rf"^\[\^{re.escape(note)}\]: (.*)$", text, flags=re.M)
    assert len(matches) == 1, (note, matches)
    assert re.search(rf"(?<!\[)\[\^{re.escape(note)}\](?!:)", text)
    return matches[0]


def test_each_phase13_source_has_a_distinct_renderable_footnote() -> None:
    for slug, manuscript, footnote, cited_title in LINKS:
        src = _source(slug)
        assert src["whyThisMatters"].strip()
        assert src["readerPassagePath"].endswith("#user-content-fnref-" + footnote)
        definition = _definition(manuscript.read_text(encoding="utf-8"), footnote)
        assert cited_title.casefold() in definition.casefold(), slug


def test_hospital_citations_separate_system_capacity_and_boarding_policy() -> None:
    text = HOSPITAL.read_text(encoding="utf-8")
    assert "capacity is full.[^c1-capacity]" in text
    assert "solve together.[^c1-boarding]" in text
    assert "American College of Emergency Physicians" not in _definition(text, "c1-capacity")
    assert "Institute of Medicine" not in _definition(text, "c1-boarding")


def test_other_source_mentions_still_have_independent_citations() -> None:
    window = BOWL.read_text(encoding="utf-8")
    victory = VICTORY.read_text(encoding="utf-8")
    assert "The Progressive Club, Johns Island" in _definition(window, "c10-citizenship")
    assert "Ransby" in _definition(window, "c10-autonomy")
    assert "Long Walk to Freedom" in _definition(victory, "v3")
    assert "The Progressive Club" not in _definition(window, "c10-expansion")
    assert "Ransby" not in _definition(window, "c10-shaw")
    assert "Long Walk to Freedom" not in _definition(victory, "v4")


def test_review_log_preserves_the_superseded_iom_candidate() -> None:
    entries = json.loads(
        (ROOT / "reports/reader-passage-links/review-log.json").read_text(encoding="utf-8")
    )["entries"]
    for slug, _, _, _ in LINKS:
        new_path = _source(slug)["readerPassagePath"]
        applied_key = f"source:{slug}:{new_path}"
        assert entries[applied_key]["status"] == "applied", slug
        assert entries[applied_key]["evidenceLevel"] == "A", slug

    iom = "institute-of-medicine-hospital-based-emergency-care-at-the-breaking-point"
    old_keys = [
        key
        for key in entries
        if key.startswith("source:" + iom + ":")
        and key.endswith("#user-content-fnref-c1-boarding")
    ]
    assert len(old_keys) == 1
    assert entries[old_keys[0]]["status"] == "skipped"
    assert entries[old_keys[0]]["supersededBy"] == _source(iom)["readerPassagePath"]
