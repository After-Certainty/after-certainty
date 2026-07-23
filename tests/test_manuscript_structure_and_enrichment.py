"""Tests for manuscript part/chapter structure in the semantic manifest."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parents[1]


def _generate(tmp_path: Path) -> dict:
    out = tmp_path / "semantic-manifest.json"
    r = subprocess.run(
        [
            sys.executable,
            "tools/generate_semantic_manifest.py",
            "--repo",
            str(REPO),
            "--out",
            str(out),
            "--github-repository",
            "ksteffe/after-certainty",
            "--no-warn-term-kind",
        ],
        cwd=REPO,
        capture_output=True,
        text=True,
        check=False,
    )
    assert r.returncode == 0, r.stderr or r.stdout
    return json.loads(out.read_text(encoding="utf-8"))


def test_parts_and_chapters_present_and_ordered(tmp_path: Path) -> None:
    data = _generate(tmp_path)
    assert "parts" in data and "chapters" in data
    assert data["schemaVersion"] == "2.2"
    chapters = [
        c for c in data["chapters"] if c["editionId"] == "book-why-collaboration-is-so-hard"
    ]
    assert chapters
    positions = [c["position"] for c in chapters]
    assert positions == sorted(positions)
    assert positions == list(range(1, len(positions) + 1))
    ids = [c["id"] for c in data["chapters"]]
    assert len(ids) == len(set(ids))


def test_stable_ids_use_source_path_not_title(tmp_path: Path) -> None:
    data = _generate(tmp_path)
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


def test_part_membership_boundary_conditions(tmp_path: Path) -> None:
    data = _generate(tmp_path)
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


def test_content_types_fiction_poetry_nonfiction(tmp_path: Path) -> None:
    data = _generate(tmp_path)
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


def test_priority_overviews_and_related_works(tmp_path: Path) -> None:
    data = _generate(tmp_path)
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


def test_new_questions_and_trails(tmp_path: Path) -> None:
    data = _generate(tmp_path)
    qids = {q["id"] for q in data["questions"]}
    assert "ordinary-people-make-history" in qids
    assert "structures-outlive-reasons" in qids
    assert "reliable-person-becomes-architecture" in qids
    tids = {t["id"] for t in data["trails"]}
    assert "inheritance-and-institutional-sediment" in tids
    assert "the-reliable-person" in tids
    trail = next(t for t in data["trails"] if t["id"] == "the-reliable-person")
    assert trail["pathStops"][0].get("fictionDoorway") is True


def test_compatibility_existing_keys_remain(tmp_path: Path) -> None:
    data = _generate(tmp_path)
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
