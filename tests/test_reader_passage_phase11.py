"""Phase 11 editorial link identity and deferral regression checks.

These checks prove manuscript/source identity and review-log consistency; a
full rendered-HTML audit verifies public footnote fragments separately.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
KNIGHT = (
    "books/the-game-we-think-we-saw/parts/part-2-why-the-result-counts/"
    "chapter-4-what-winning-is-allowed-to-excuse.md"
)
ANTHEM = (
    "books/the-game-we-think-we-saw/parts/part-4-what-the-result-becomes/"
    "chapter-7-when-a-gesture-becomes-another-message.md"
)

# The subject of each source is the specific manuscript claim, not just a
# bibliographic match to a nearby shared note.
LINKS = (
    (
        "associated-press-bob-knight-s-chair-college-basketball-s-classic-furniture",
        KNIGHT,
        "c4-chair-incident",
        "Bob Knight’s Chair: College Basketball’s Classic Furniture",
    ),
    (
        "los-angeles-times-knight-suspended-for-a-game-by-big-ten-for-throwing-chair",
        KNIGHT,
        "c4-chair-sanction",
        "Knight Suspended for a Game by Big Ten for Throwing Chair",
    ),
    (
        "indiana-university-athletics-coach-bob-knight-passes-away-at-83",
        KNIGHT,
        "c4-knight-record",
        "Coach Bob Knight Passes Away at 83",
    ),
    (
        "nfl-com-nfl-owners-approve-national-anthem-policy-for-2018",
        ANTHEM,
        "c7-policy-approved",
        "NFL Owners Approve National Anthem Policy for 2018",
    ),
    (
        "nfl-com-nfl-anthem-policy-on-hold-under-standstill-agreement",
        ANTHEM,
        "c7-policy-standstill",
        "NFL Anthem Policy on Hold under Standstill Agreement",
    ),
)


def _source(slug: str) -> dict:
    return yaml.safe_load((ROOT / "semantic/sources" / f"{slug}.yml").read_text(encoding="utf-8"))


def test_each_phase11_work_has_its_own_cited_claim_and_path() -> None:
    for slug, chapter, note, cited_title in LINKS:
        source = _source(slug)
        path = source["readerPassagePath"]
        assert "the-game-we-think-we-saw" in source["relatedBooks"]
        assert path.startswith("/explore/books/the-game-we-think-we-saw/chapters/")
        assert path.endswith("#user-content-fnref-" + note)
        assert source["whyThisMatters"].strip()
        text = (ROOT / chapter).read_text(encoding="utf-8")
        assert len(re.findall(rf"^\[\^{re.escape(note)}\]:", text, re.M)) == 1
        assert re.search(rf"\[\^{re.escape(note)}\](?!:)", text)
        definition = re.search(rf"^\[\^{re.escape(note)}\]: ([^\n]+)", text, re.M)
        assert definition is not None
        assert cited_title in definition.group(1)


def test_shared_footnote_supersessions_and_claim_dates() -> None:
    knight = (ROOT / KNIGHT).read_text(encoding="utf-8")
    policy = (ROOT / ANTHEM).read_text(encoding="utf-8")
    assert "[^c4-chair]" not in knight
    assert "[^c7-policy]" not in policy
    assert "and was ejected.[^c4-chair-incident]" in knight
    assert "additional suspension.[^c4-chair-sanction]" in knight
    assert "on-field violations.[^c7-policy-approved]" in policy
    assert "discussions continued.[^c7-policy-standstill]" in policy
    assert "[^c4-knight-method]" in knight


def test_review_decisions_preserve_other_shared_sources() -> None:
    review = json.loads(
        (ROOT / "reports/reader-passage-links/review-log.json").read_text(encoding="utf-8")
    )["entries"]
    for slug, _, _, _ in LINKS:
        path = _source(slug)["readerPassagePath"]
        key = f"source:{slug}:{path}"
        assert review[key]["status"] == "applied", key
        assert review[key]["candidatePath"] == path

    # Indiana's original methods note still cites multiple authors even
    # though its independent record note is now tied to IU's published stats.
    methods = [
        v
        for k, v in review.items()
        if k.startswith("source:indiana-university-athletics-coach-bob-knight-passes-away-at-83:")
        and k.endswith("#user-content-fnref-c4-knight-method")
    ]
    assert len(methods) == 1 and methods[0]["status"] == "deferred"

    # Two independent reports of one Andrew Luck announcement must not be
    # silently promoted merely to increase coverage.
    deferred = [
        v
        for k, v in review.items()
        if k.startswith("source:andrew-walker-andrew-luck-announces-his-retirement-from-the-nfl:")
    ]
    assert deferred and any(v["status"] == "deferred" for v in deferred)
