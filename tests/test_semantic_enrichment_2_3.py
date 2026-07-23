"""Tests for additive 2.3 semantic enrichment fields."""

from __future__ import annotations

from pathlib import Path

import yaml

from discovery_manifest import SCHEMA_VERSION, build_overview_manifest
from manuscript_structure import CHAPTER_KINDS, build_structure_for_book, infer_unit_kind


def test_schema_version_is_23() -> None:
    assert SCHEMA_VERSION == "2.3"


def test_overview_roles_preserve_legacy_id_arrays() -> None:
    overview = {
        "centralQuestion": "Q?",
        "whyItExists": "Why",
        "audience": "Readers",
        "nonGoals": ["Not X"],
        "selectedConcepts": ["agency", "accountability"],
        "selectedConceptRoles": [
            {"conceptId": "agency", "roleInWork": "Names practical stake."},
            {"conceptId": "accountability", "roleInWork": "Anchors answerability."},
        ],
        "selectedPatterns": ["exceptions-are-forever"],
        "selectedPatternRoles": [
            {
                "patternId": "exceptions-are-forever",
                "roleInWork": "Shows temporary rules hardening.",
            }
        ],
    }
    out = build_overview_manifest(overview)
    assert out["selectedConceptIds"] == ["concept-agency", "concept-accountability"]
    assert out["selectedPatternIds"] == ["pattern-exceptions-are-forever"]
    assert out["selectedConceptRoles"][0]["conceptId"] == "concept-agency"
    assert "practical stake" in out["selectedConceptRoles"][0]["roleInWork"]
    assert out["selectedPatternRoles"][0]["patternId"] == "pattern-exceptions-are-forever"


def test_role_target_dedupes() -> None:
    overview = {
        "centralQuestion": "Q?",
        "whyItExists": "Why",
        "audience": "Readers",
        "nonGoals": ["Not X"],
        "selectedConceptRoles": [
            {"conceptId": "agency", "roleInWork": "First"},
            {"conceptId": "agency", "roleInWork": "Duplicate"},
        ],
    }
    out = build_overview_manifest(overview)
    assert len(out["selectedConceptRoles"]) == 1
    assert out["selectedConceptRoles"][0]["roleInWork"] == "First"


def test_poetry_kinds_supported() -> None:
    assert "poem" in CHAPTER_KINDS
    assert "sequence" in CHAPTER_KINDS
    assert infer_unit_kind("parts/part-i/what-love-teaches.md", "What Love Teaches") == "chapter"
    assert infer_unit_kind("front-matter/introduction.md", "Introduction") == "introduction"


def test_chapter_transition_object_exports(tmp_path: Path) -> None:
    book_dir = tmp_path / "demo"
    (book_dir / "parts" / "p1").mkdir(parents=True)
    chapter = book_dir / "parts" / "p1" / "chapter-1.md"
    chapter.write_text("# One\n\nBody text here for word count.\n" * 20, encoding="utf-8")
    (book_dir / "index.md").write_text(
        "## Part I\n\n- [One](parts/p1/chapter-1.md)\n",
        encoding="utf-8",
    )
    (book_dir / "chapter-enrichment.yml").write_text(
        yaml.safe_dump(
            {
                "version": 1,
                "chapters": [
                    {
                        "sourcePath": "parts/p1/chapter-1.md",
                        "summary": "Investigates provisional alignment.",
                        "centralQuestion": "What holds without shared certainty?",
                        "transition": {
                            "fromPrevious": "After the opening stakes.",
                            "toNext": "Opens into responsibility.",
                        },
                    }
                ],
            },
            sort_keys=False,
        ),
        encoding="utf-8",
    )
    _parts, chapters = build_structure_for_book(
        book_dir,
        edition_slug="demo",
        work_id="work-demo",
        edition_id="book-demo",
    )
    assert len(chapters) == 1
    ch = chapters[0]
    assert ch["summary"].startswith("Investigates")
    assert ch["transition"]["fromPrevious"].startswith("After")
    assert "responsibility" in ch["readingTransition"]


def test_pattern_grounding_projects(repo_root: Path | None = None) -> None:
    repo = Path(__file__).resolve().parents[1]
    pattern = repo / "semantic" / "patterns" / "exceptions-are-forever.yml"
    data = yaml.safe_load(pattern.read_text(encoding="utf-8"))
    grounding = data.get("grounding") or {}
    assert grounding.get("type") == "original_synthesis"
    assert grounding.get("developedFrom")


def test_hal_daume_former_slug() -> None:
    repo = Path(__file__).resolve().parents[1]
    thinker = repo / "semantic" / "thinkers" / "hal-daume-iii.yml"
    assert thinker.is_file()
    assert not (repo / "semantic" / "thinkers" / "hal-daum-iii.yml").exists()
    data = yaml.safe_load(thinker.read_text(encoding="utf-8"))
    assert "hal-daum-iii" in (data.get("formerSlugs") or [])


def test_et_al_thinkers_are_citation_only() -> None:
    repo = Path(__file__).resolve().parents[1]
    path = repo / "semantic" / "thinkers" / "moore-et-al.yml"
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    assert data.get("type") == "author_group"
    assert data.get("citationOnly") is True
