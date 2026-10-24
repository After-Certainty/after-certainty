"""Phase 10 editorial regression tests for claim-specific source links.

These check citation identity and linkage; a rendered-HTML audit must still
validate public fragment existence separately.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]

# Source slug, manuscript path, footnote id.
LINKS = (
    (
        "calhoun-craig-neither-gods-nor-emperors-students-and-the-struggle-for-democracy-in-china",
        "books/when-authority-is-misread/parts/part-2-leaders-becoming-legible/chapter-7-deng-xiaoping-the-machine-that-started-working.md",
        "c7-tiananmen-protest",
    ),
    (
        "lim-louisa-the-people-s-republic-of-amnesia-tiananmen-revisited",
        "books/when-authority-is-misread/parts/part-2-leaders-becoming-legible/chapter-7-deng-xiaoping-the-machine-that-started-working.md",
        "c7-tiananmen-memory",
    ),
    (
        "bunkley-nick-g-m-and-toyota-s-joint-venture-ends-in-california",
        "books/the-world-we-make-together/parts/part-2-where-power-gathers/chapter-5-the-clipboard.md",
        "c5-nummi-close",
    ),
    (
        "abate-tom-nummi-workers-say-their-final-good-byes",
        "books/the-world-we-make-together/parts/part-2-where-power-gathers/chapter-5-the-clipboard.md",
        "c5-nummi-workers",
    ),
    (
        "addams-jane-twenty-years-at-hull-house",
        "books/when-others-become-leaders/parts/part-3-how-influence-endures/chapter-7-the-house.md",
        "h1",
    ),
    (
        "branch-taylor-parting-the-waters-america-in-the-king-years-1954-63",
        "books/when-authority-is-misread/parts/part-2-leaders-becoming-legible/chapter-4-martin-luther-king-jr-the-door-marked-not-yet.md",
        "c4-branch-1963",
    ),
    (
        "branch-taylor-pillar-of-fire-america-in-the-king-years-1963-65",
        "books/when-authority-is-misread/parts/part-2-leaders-becoming-legible/chapter-4-martin-luther-king-jr-the-door-marked-not-yet.md",
        "c4-branch-selma",
    ),
    (
        "branch-taylor-at-canaan-s-edge-america-in-the-king-years-1965-68",
        "books/when-authority-is-misread/parts/part-2-leaders-becoming-legible/chapter-4-martin-luther-king-jr-the-door-marked-not-yet.md",
        "c4-branch-chicago",
    ),
)


def _source(slug: str) -> dict:
    return yaml.safe_load(
        (ROOT / "semantic/sources" / f"{slug}.yml").read_text(encoding="utf-8")
    )


def test_all_new_links_have_invocations_and_defined_notes() -> None:
    for slug, chapter, footnote in LINKS:
        src = _source(slug)
        path = src.get("readerPassagePath", "")
        book_id = Path(chapter).parts[1]
        assert book_id in src.get("relatedBooks", [])
        assert path.startswith(f"/explore/books/{book_id}/chapters/")
        assert path.endswith(f"#user-content-fnref-{footnote}")
        assert src.get("whyThisMatters", "").strip()
        text = (ROOT / chapter).read_text(encoding="utf-8")
        defined = re.findall(rf"^\[\^{re.escape(footnote)}\]:", text, re.MULTILINE)
        invoked = re.findall(rf"\[\^{re.escape(footnote)}\](?!:)", text)
        assert len(defined) == 1, slug
        assert len(invoked) >= 1, slug


def test_tiananmen_is_three_claims_and_brook_is_sole_work() -> None:
    path = LINKS[0][1]
    text = (ROOT / path).read_text(encoding="utf-8")
    assert "visible to global media.[^c7-tiananmen-protest]" in text
    assert "threat to that same order.[^c7-tiananmen-memory]" in text
    assert "state violence is not a serious historical dispute.[^c7-tiananmen]" in text
    brook = re.search(r"^\[\^c7-tiananmen\]: ([^\n]+)", text, re.MULTILINE)
    assert brook
    assert "Timothy Brook" in brook.group(1)
    assert "Calhoun" not in brook.group(1)
    assert "Louisa Lim" not in brook.group(1)


def test_nummi_and_king_old_multiwork_notes_not_used() -> None:
    nummi = (ROOT / LINKS[2][1]).read_text(encoding="utf-8")
    assert "[^c5-nummi-close]" in nummi
    assert "[^c5-nummi-workers]" in nummi
    close_note = re.search(r"^\[\^c5-nummi-close\]: ([^\n]+)", nummi, re.MULTILINE)
    assert close_note and "Tom Abate" not in close_note.group(1)

    king = (ROOT / LINKS[5][1]).read_text(encoding="utf-8")
    assert "[^c4-branch-garrow]" not in king
    assert len(re.findall(r"\\[\\^c4-branch-1963\\](?!:)", king)) == 2
    assert "[^c4-branch-selma]" in king
    assert "[^c4-branch-chicago]" in king


def test_review_log_applied_paths_match_canonical_sources() -> None:
    review = json.loads(
        (ROOT / "reports/reader-passage-links/review-log.json").read_text(
            encoding="utf-8"
        )
    )["entries"]
    for slug, _, _ in LINKS:
        target = _source(slug)["readerPassagePath"]
        key = f"source:{slug}:{target}"
        assert review[key]["status"] == "applied", slug
        assert review[key]["candidatePath"] == target, slug

    # These shared-footnote decisions must not be converted to fabricated
    # sole-work links by the editorial batch.
    for slug in (
        "alexander-christopher-the-timeless-way-of-building",
        "andrew-walker-andrew-luck-announces-his-retirement-from-the-nfl",
    ):
        records = [
            value
            for key, value in review.items()
            if key.startswith(f"source:{slug}:")
        ]
        assert records and any(x["status"] == "deferred" for x in records)
