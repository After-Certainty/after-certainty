"""Phase 12 attribution: full-title evidence versus overlapping-title guesses."""

from __future__ import annotations

import re
from pathlib import Path

import yaml

import reader_passage_links as rpl

ROOT = Path(__file__).resolve().parents[1]

# All were previously reported as shared, although each manuscript footnote
# names the target work and not the overlapping topical candidate.
DIRECTLY_CITED = (
    ("argyris-chris-overcoming-organizational-defenses", "c1-correction-and-insulation"),
    ("arthur-w-brian-increasing-returns-and-path-dependence-in-the-economy", "c1-arthur-lock-in"),
    (
        "church-committee-final-report-of-the-select-committee-to-study-governmental-operations-with-resp",
        "c8-cointelpro",
    ),
    (
        "desai-ashwin-and-goolam-vahed-the-south-african-gandhi-stretcher-bearer-of-empire",
        "s2-8",
    ),
    (
        "international-olympic-committee-simone-biles-all-titles-records-and-medals-complete-list",
        "c6-paris",
    ),
    ("nfl-concussion-protocol-return-to-participation-protocol-overview", "c5-nfl-protocol"),
    ("weick-karl-e-the-social-psychology-of-organizing", "c2-adaptive-systems"),
    ("will-graves-biles-returns-to-olympic-competition-wins-bronze-on-beam", "c6-beam"),
)


def _source(slug: str) -> dict:
    return yaml.safe_load((ROOT / "semantic/sources" / f"{slug}.yml").read_text(encoding="utf-8"))


def test_eight_directly_cited_sources_retain_their_original_reader_paths() -> None:
    for slug, footnote_id in DIRECTLY_CITED:
        src = _source(slug)
        assert src["readerPassagePath"].endswith("#user-content-fnref-" + footnote_id)
        assert src["whyThisMatters"].strip()


def test_full_work_title_dominates_a_loose_similar_title(tmp_path: Path) -> None:
    book = tmp_path / "books" / "edition-x"
    chapter = book / "parts/part-1/chapter-1.md"
    chapter.parent.mkdir(parents=True)
    chapter.write_text(
        "# Example\n\nEarly choices persist.[^example]\n\n"
        "[^example]: W. Brian Arthur, *Increasing Returns and Path Dependence in the Economy* (1994).\n",
        encoding="utf-8",
    )
    route = "/explore/books/edition-x/chapters/parts-part-1-chapter-1"
    chapters = {
        route: rpl.ChapterRef(
            edition_slug="edition-x",
            route_key=route,
            title="Example",
            source_path="parts/part-1/chapter-1.md",
            book_dir="books/edition-x",
            public=True,
            chapter_id="chapter-1",
        )
    }
    sources = {
        "arthur": {
            "slug": "arthur",
            "name": "W. Brian Arthur — Increasing Returns and Path Dependence in the Economy",
            "title": "Increasing Returns and Path Dependence in the Economy",
            "creatorNames": ["W. Brian Arthur"],
            "relatedBooks": ["edition-x"],
        },
        "pierson": {
            "slug": "pierson",
            "name": "Paul Pierson — Increasing Returns, Path Dependence, and the Study of Politics",
            "title": "Increasing Returns, Path Dependence, and the Study of Politics",
            "creatorNames": ["Paul Pierson"],
            "relatedBooks": ["edition-x"],
        },
    }
    footnotes, _ = rpl.index_chapter_engagement(tmp_path, chapters, sources)
    arthur = footnotes["arthur"][0]
    assert arthur.score == 90
    assert arthur.shared_with == []
    # A vague title-token hit must never be upgraded to an independent
    # citation or reader path for another work.
    if footnotes.get("pierson"):
        assert "arthur" in footnotes["pierson"][0].shared_with
        assert footnotes["pierson"][0].needs_editorial_review


def test_explicit_two_work_note_still_requires_editorial_review(tmp_path: Path) -> None:
    book = tmp_path / "books" / "edition-x"
    chapter = book / "parts/part-1/chapter-1.md"
    chapter.parent.mkdir(parents=True)
    chapter.write_text(
        "# Example\n\nLearned practices.[^example]\n\n"
        "[^example]: See Alice Smith, *The First Complete Book* (2001); "
        "and Bob Jones, *The Second Complete Book* (2003).\n",
        encoding="utf-8",
    )
    route = "/explore/books/edition-x/chapters/parts-part-1-chapter-1"
    chapters = {
        route: rpl.ChapterRef(
            edition_slug="edition-x",
            route_key=route,
            title="Example",
            source_path="parts/part-1/chapter-1.md",
            book_dir="books/edition-x",
            public=True,
            chapter_id="chapter-1",
        )
    }
    sources = {
        "first": {
            "slug": "first",
            "name": "Alice Smith — The First Complete Book",
            "title": "The First Complete Book",
            "creatorNames": ["Alice Smith"],
            "relatedBooks": ["edition-x"],
        },
        "second": {
            "slug": "second",
            "name": "Bob Jones — The Second Complete Book",
            "title": "The Second Complete Book",
            "creatorNames": ["Bob Jones"],
            "relatedBooks": ["edition-x"],
        },
    }
    footnotes, _ = rpl.index_chapter_engagement(tmp_path, chapters, sources)
    assert "second" in footnotes["first"][0].shared_with
    assert "first" in footnotes["second"][0].shared_with
    assert footnotes["first"][0].needs_editorial_review
    assert footnotes["second"][0].needs_editorial_review


def test_full_title_for_weick_article_is_not_the_generic_word_organizing() -> None:
    article = _source("weick-karl-e-kathleen-m-sutcliffe-and-david-obstfeld-organizing")
    assert article["title"] == "Organizing and the Process of Sensemaking"
    assert re.search(r"Organizing and the Process of Sensemaking", article["name"])
