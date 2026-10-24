"""Phase 15: a large reviewed reader-passage batch must preserve citation identity."""

from __future__ import annotations

import json
import re
from functools import cache
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]

CASES = (
    (
        "jaspers-karl-the-origin-and-goal-of-history",
        "c5-jaspers-origin",
        "Karl Jaspers",
    ),
    (
        "eisenstadt-shmuel-n-ed-the-origins-and-diversity-of-axial-age",
        "c5-axial-debate",
        "Eisenstadt",
    ),
    (
        "albertz-rainer-israel-in-exile-the-history-and-literature-of-the",
        "c5-babylonian-exile",
        "Rainer Albertz",
    ),
    (
        "levenson-jon-d-sinai-and-zion-an-entry-into-the-jewish-bible",
        "c5-sinai-zion",
        "Jon D. Levenson",
    ),
    (
        "lewis-mark-edward-sanctioned-violence-in-early-china",
        "c5-warring-states",
        "Mark Edward Lewis",
    ),
    (
        "puett-michael-j-to-become-a-god-cosmology-sacrifice-and",
        "c5-warring-ritual",
        "Michael J. Puett",
    ),
    (
        "thapar-romila-asoka-and-the-decline-of-the-mauryas",
        "c6-ashoka-edicts",
        "Romila Thapar",
    ),
    (
        "salomon-richard-indian-epigraphy-a-guide-to-the-study-of-inscriptions",
        "c6-ashoka-epigraphy",
        "Richard Salomon",
    ),
    (
        "tov-emanuel-textual-criticism-of-the-hebrew-bible",
        "c6-qumran-canon",
        "Emanuel Tov",
    ),
    (
        "ulrich-eugene-the-dead-sea-scrolls-and-the-developmental-composition",
        "c6-qumran-composition",
        "Eugene Ulrich",
    ),
    (
        "vanderkam-james-c-the-dead-sea-scrolls-today",
        "c6-qumran-scrolls",
        "James C. VanderKam",
    ),
    (
        "basketball-reference-bill-russell",
        "c1-russell-career",
        "Basketball-Reference",
    ),
    (
        "nba-com-legends-profile-bill-russell",
        "c1-blocks-official",
        "NBA.com",
    ),
    (
        "michael-lewis-moneyball-the-art-of-winning-an-unfair-game",
        "c1-lewis-moneyball",
        "Michael Lewis",
    ),
    (
        "jahn-k-hakes-and-raymond-d-sauer-an-economic-evaluation-of-the-moneyball-hypothesis",
        "c1-hakes-evaluation",
        "Jahn K. Hakes",
    ),
    (
        "pro-football-reference-new-england-patriots-franchise-encyclopedia",
        "c2-brady-belichick-era",
        "Pro-Football-Reference",
    ),
    (
        "nbc-sports-boston-who-gets-most-of-the-credit-brady-or-belichick",
        "c2-brady-debate",
        "NBC Sports Boston",
    ),
    (
        "nfl-com-brady-to-have-season-ending-knee-surgery",
        "c2-brady-injury",
        "NFL.com",
    ),
    (
        "pro-football-reference-2008-new-england-patriots",
        "c2-2008-cassel",
        "Pro-Football-Reference",
    ),
    (
        "pro-football-reference-super-bowl-lv-box-score",
        "c2-sb-lv",
        "Pro-Football-Reference",
    ),
    (
        "nfl-com-buccaneers-qb-tom-brady-extends-record-with-fifth-super-bowl-mvp",
        "c2-sb-mvp",
        "NFL.com",
    ),
    (
        "u-s-environmental-protection-agency-notice-of-violation-volkswagen-clean-diesel-vehicles",
        "c4-vw",
        "Environmental Protection Agency",
    ),
    (
        "science-based-targets-initiative-corporate-net-zero-standard",
        "c4-science-targets",
        "Science Based Targets initiative",
    ),
    (
        "integrity-council-for-the-voluntary-carbon-market-core-carbon-principles",
        "c4-credit-integrity",
        "Integrity Council",
    ),
    (
        "voluntary-carbon-markets-integrity-initiative-claims-code-of-practice",
        "c4-vcmi",
        "Voluntary Carbon Markets Integrity Initiative",
    ),
    (
        "international-sustainability-standards-board-issb-ifrs-s1-general-requirements-for-disclosure-of",
        "c4-issb",
        "International Sustainability Standards Board",
    ),
    (
        "european-financial-reporting-advisory-group-efrag-european-sustainability-reporting-standards-es",
        "c4-esrs",
        "European Financial Reporting Advisory Group",
    ),
)


@cache
def _manuscript_for_reader_path(path: str) -> Path:
    match = re.fullmatch(
        r"/explore/books/([^/]+)/chapters/([^#]+)#user-content-fnref-([^#]+)",
        path,
    )
    assert match is not None, path
    book, route, _ = match.groups()
    base = ROOT / "books" / book
    manuscripts = [
        candidate
        for candidate in base.rglob("*.md")
        if candidate.relative_to(base).with_suffix("").as_posix().replace("/", "-") == route
    ]
    assert len(manuscripts) == 1, (path, manuscripts)
    return manuscripts[0]


def _source(slug: str) -> dict:
    return yaml.safe_load((ROOT / "semantic/sources" / f"{slug}.yml").read_text(encoding="utf-8"))


def _note(text: str, note: str) -> str:
    matches = re.findall(rf"^\[\^{re.escape(note)}\]: (.*)$", text, re.M)
    assert len(matches) == 1, (note, matches)
    # The source must be an actual in-prose footnote invocation, not an
    # unused definition appended just to satisfy a citation audit.
    assert re.search(rf"\[\^{re.escape(note)}\](?!:)", text), note
    return matches[0]


def test_all_27_source_links_are_substantive_reviewed_citations() -> None:
    reviews = json.loads(
        (ROOT / "reports/reader-passage-links/review-log.json").read_text(encoding="utf-8")
    )["entries"]
    assert len(CASES) == 27
    assert len({slug for slug, _, _ in CASES}) == 27

    for slug, note, fingerprint in CASES:
        source = _source(slug)
        path = source["readerPassagePath"]
        assert path.endswith("#user-content-fnref-" + note)
        assert len(source["whyThisMatters"]) >= 120, slug
        manuscript = _manuscript_for_reader_path(path)
        chapter = manuscript.read_text(encoding="utf-8")
        assert fingerprint.casefold() in _note(chapter, note).casefold(), slug
        book = path.split("/books/")[1].split("/chapters/")[0]
        assert book in source["relatedBooks"], slug
        review = reviews[f"source:{slug}:{path}"]
        assert review["status"] == "applied", slug
        assert review["evidenceLevel"] == "A", slug


def test_historical_books_remain_distinct_and_uncertainties_preserved() -> None:
    before5 = (
        ROOT
        / "books/before-certainty-arrives/parts/part-2-compression-under-scale/chapter-5-shared-conditions-not-shared-revelation.md"
    ).read_text(encoding="utf-8")
    before6 = (
        ROOT
        / "books/before-certainty-arrives/parts/part-2-compression-under-scale/chapter-6-writing-as-moral-stabilizer.md"
    ).read_text(encoding="utf-8")
    assert "Eisenstadt" not in _note(before5, "c5-jaspers-origin")
    assert "Jaspers" not in _note(before5, "c5-axial-debate")
    assert "Levenson" not in _note(before5, "c5-babylonian-exile")
    assert "Albertz" not in _note(before5, "c5-sinai-zion")
    assert "Puett" not in _note(before5, "c5-warring-states")
    assert "Lewis" not in _note(before5, "c5-warring-ritual")
    assert "Salomon" not in _note(before6, "c6-ashoka-edicts")
    assert "Thapar" not in _note(before6, "c6-ashoka-epigraphy")
    assert "Ulrich" not in _note(before6, "c6-qumran-canon")
    assert "VanderKam" not in _note(before6, "c6-qumran-canon")
    assert "Kuhn" in _note(before6, "c6-tools-outliving")


def test_sports_numbers_and_media_analysis_are_cited_separately() -> None:
    sports1 = (
        ROOT
        / "books/the-game-we-think-we-saw/parts/part-1-what-the-result-shows/chapter-1-what-the-scoreboard-leaves-out.md"
    ).read_text(encoding="utf-8")
    sports2 = (
        ROOT
        / "books/the-game-we-think-we-saw/parts/part-1-what-the-result-shows/chapter-2-when-the-star-becomes-the-explanation.md"
    ).read_text(encoding="utf-8")
    assert "NBA.com" not in _note(sports1, "c1-russell-career")
    assert "Hakes" not in _note(sports1, "c1-lewis-moneyball")
    assert "Michael Lewis" not in _note(sports1, "c1-hakes-evaluation")
    assert "NBC Sports Boston" not in _note(sports2, "c2-brady-belichick-era")
    assert "NFL.com" not in _note(sports2, "c2-2008-cassel")
    assert "Pro-Football-Reference" not in _note(sports2, "c2-brady-injury")
    assert "NFL.com" not in _note(sports2, "c2-sb-lv")
    assert "Pro-Football-Reference" not in _note(sports2, "c2-sb-mvp")


def test_climate_credit_criteria_and_claims_regimes_stay_distinct() -> None:
    climate = (
        ROOT
        / "books/when-incentives-become-the-moral-language/parts/part-2-when-the-translation-takes-over/chapter-4-the-target-on-the-wall.md"
    ).read_text(encoding="utf-8")
    assert "Science Based Targets" not in _note(climate, "c4-paris")
    assert "Integrity Council" not in _note(climate, "c4-vcmi")
    assert "Voluntary Carbon Markets Integrity Initiative" not in _note(
        climate, "c4-credit-integrity"
    )
    assert "European Financial Reporting Advisory Group" not in _note(climate, "c4-issb")
    assert "International Sustainability Standards Board" not in _note(climate, "c4-esrs")
    assert "California Air Resources Board" not in _note(climate, "c4-vw")
    assert "California Air Resources Board" in _note(climate, "c4-vw-settlements")
    assert "World Bank" in _note(climate, "c4-world-bank")
