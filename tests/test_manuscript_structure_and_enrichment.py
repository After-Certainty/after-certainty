"""Tests for manuscript part/chapter structure in the semantic manifest."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parents[1]


def test_parts_and_chapters_present_and_ordered(semantic_manifest: dict) -> None:
    data = semantic_manifest
    assert "parts" in data and "chapters" in data
    assert data["schemaVersion"] == "2.3"
    chapters = [
        c for c in data["chapters"] if c["editionId"] == "book-why-collaboration-is-so-hard"
    ]
    assert chapters
    positions = [c["position"] for c in chapters]
    assert positions == sorted(positions)
    assert positions == list(range(1, len(positions) + 1))
    ids = [c["id"] for c in data["chapters"]]
    assert len(ids) == len(set(ids))


def test_stable_ids_use_source_path_not_title(semantic_manifest: dict) -> None:
    data = semantic_manifest
    ch = next(
        c
        for c in data["chapters"]
        if c["sourcePath"].endswith("chapter-2-we-did-not-agree-to-the-same-thing.md")
    )
    assert ch["id"] == (
        "chapter-why-collaboration-is-so-hard-parts-chapter-2-we-did-not-agree-to-the-same-thing"
    )
    assert ch["wordCount"] > 100
    assert ch["estimatedReadingMinutes"] >= 1
    assert ch["summary"]
    assert ch["kind"] == "chapter"


def test_part_membership_boundary_conditions(semantic_manifest: dict) -> None:
    data = semantic_manifest
    parts = [p for p in data["parts"] if p["editionId"] == "book-boundary-conditions"]
    assert len(parts) == 5
    ch = next(c for c in data["chapters"] if "chapter-16-reliable-person" in c["id"])
    assert ch["partId"]
    assert ch["partId"].startswith("part-boundary-conditions-")


def test_reading_time_and_word_count_helpers() -> None:
    sys.path.insert(0, str(REPO / "tools"))
    from manuscript_structure import count_words, reading_minutes

    assert count_words("one two three") == 3
    assert reading_minutes(0) == 0
    assert reading_minutes(1) == 1
    assert reading_minutes(220) == 1
    assert reading_minutes(221) == 2


def test_duplicate_id_fails(tmp_path: Path) -> None:
    sys.path.insert(0, str(REPO / "tools"))
    from manuscript_structure import build_structure_for_book

    book_dir = REPO / "books" / "why-collaboration-is-so-hard"
    enrichment = {
        "parts/chapter-1-the-show-that-opens-friday.md": {
            "id": "chapter-why-collaboration-is-so-hard-parts-chapter-2-we-did-not-agree-to-the-same-thing"
        }
    }
    with pytest.raises(ValueError, match="duplicate chapter id"):
        build_structure_for_book(
            book_dir,
            edition_slug="why-collaboration-is-so-hard",
            work_id="work-why-collaboration-is-so-hard",
            edition_id="book-why-collaboration-is-so-hard",
            enrichment=enrichment,
        )


def test_docs_links_are_not_emitted_as_chapters(tmp_path: Path) -> None:
    sys.path.insert(0, str(REPO / "tools"))
    from manuscript_structure import build_structure_for_book

    book_dir = tmp_path / "sample-book"
    (book_dir / "manuscript").mkdir(parents=True)
    (book_dir / "docs").mkdir()
    (book_dir / "manuscript" / "chapter-01.md").write_text("# One\n\nHello.\n", encoding="utf-8")
    (book_dir / "docs" / "outline.md").write_text("# Outline\n\nPlanning only.\n", encoding="utf-8")
    (book_dir / "index.md").write_text(
        "# Sample\n\n## Chapters\n\n"
        "- [One](manuscript/chapter-01.md)\n"
        "- [Outline](docs/outline.md)\n",
        encoding="utf-8",
    )

    _parts, chapters = build_structure_for_book(
        book_dir,
        edition_slug="sample-book",
        work_id="work-sample-book",
        edition_id="book-sample-book",
    )
    assert [c["sourcePath"] for c in chapters] == ["manuscript/chapter-01.md"]


def test_content_types_fiction_poetry_nonfiction(semantic_manifest: dict) -> None:
    data = semantic_manifest
    by = {b["slug"]: b for b in data["books"]}
    assert by["boundary-conditions"]["contentType"] == "fiction"
    assert by["boundary-conditions"]["literaryForm"] == "novel"
    assert by["observer-patterns"]["contentType"] == "poetry"
    assert by["observer-patterns"]["literaryForm"] == "poetry_collection"
    assert by["before-certainty-arrives"]["contentType"] == "nonfiction"
    assert by["before-certainty-arrives"]["overview"]["centralQuestion"]
    works = {w["slug"]: w for w in data["works"]}
    assert works["observer-patterns"]["contentType"] == "poetry"
    assert works["boundary-conditions"]["contentType"] == "fiction"


def test_priority_overviews_and_related_works(semantic_manifest: dict) -> None:
    data = semantic_manifest
    by = {b["slug"]: b for b in data["books"]}
    for slug in (
        "the-world-we-make-together",
        "why-collaboration-is-so-hard",
        "learning-to-see",
        "the-game-we-think-we-saw",
        "before-certainty-arrives",
        "living-in-sediment",
        "the-economy-we-dont-experience",
        "boundary-conditions",
        "observer-patterns",
    ):
        ov = by[slug]["overview"]
        assert ov["centralQuestion"]
        assert ov["whyItExists"]
        assert ov["audience"]
        assert ov["nonGoals"]
        assert ov.get("relatedWorks")
        for rel in ov["relatedWorks"]:
            assert rel["workId"].startswith("work-")
            assert rel["relationship"]
            assert rel["reason"]


def test_new_questions_and_trails(semantic_manifest: dict) -> None:
    data = semantic_manifest
    qids = {q["id"] for q in data["questions"]}
    assert "ordinary-people-make-history" in qids
    assert "structures-outlive-reasons" in qids
    assert "reliable-person-becomes-architecture" in qids
    assert "discipline-under-incomplete-information" in qids
    assert "love-hard-to-explain" in qids
    tids = {t["id"] for t in data["trails"]}
    assert "inheritance-and-institutional-sediment" in tids
    assert "the-reliable-person" in tids
    assert "the-result-and-the-experience" in tids
    assert "practices-of-seeing" in tids
    trail = next(t for t in data["trails"] if t["id"] == "the-reliable-person")
    assert trail["pathStops"][0].get("fictionDoorway") is True
    result_trail = next(t for t in data["trails"] if t["id"] == "the-result-and-the-experience")
    assert [s["entityId"] for s in result_trail["pathStops"]] == [
        "book-the-game-we-think-we-saw",
        "book-the-economy-we-dont-experience",
        "book-the-world-we-make-together",
        "book-what-we-cannot-see",
    ]
    seeing = next(t for t in data["trails"] if t["id"] == "practices-of-seeing")
    assert seeing["pathStops"][1]["entityId"] == "book-observer-patterns"
    assert seeing["pathStops"][-1]["entityId"] == "book-everyone-knows-love"


def test_slice2_overview_cluster(semantic_manifest: dict) -> None:
    data = semantic_manifest
    by = {b["slug"]: b for b in data["books"]}
    for slug in (
        "when-incentives-become-the-moral-language",
        "when-interpretation-no-longer-matters",
        "when-others-become-leaders",
        "why-diversity-matters",
        "the-discipline-of-uncertainty",
        "how-trust-forms",
        "when-trust-stops-tracking-reality",
        "when-authority-is-misread",
    ):
        ov = by[slug]["overview"]
        assert ov["centralQuestion"]
        assert ov.get("relatedWorks")
    assert by["the-discipline-of-uncertainty"]["contentType"] == "handbook"
    leadership = next(t for t in data["trails"] if t["id"] == "leadership-after-the-person")
    assert any(
        s.get("entityId") == "book-when-others-become-leaders" for s in leadership["pathStops"]
    )


def test_compatibility_existing_keys_remain(semantic_manifest: dict) -> None:
    data = semantic_manifest
    for key in (
        "manifestVersion",
        "books",
        "glossary",
        "patterns",
        "situations",
        "sources",
        "relationships",
        "ontology",
        "works",
        "editions",
        "questions",
        "trails",
        "shelves",
        "changeEvents",
        "searchAliases",
    ):
        assert key in data
    book = data["books"][0]
    for field in ("id", "slug", "source", "status", "title", "concepts", "patterns", "sources"):
        assert field in book
