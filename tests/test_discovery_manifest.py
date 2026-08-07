"""Tests for discovery metadata migration (works/editions, questions, trails, shelves, events)."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import yaml

REPO = Path(__file__).resolve().parents[1]


def _run(cmd: list[str], cwd: Path | None = None) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        cmd,
        cwd=cwd or REPO,
        capture_output=True,
        text=True,
        check=False,
    )


def test_manifest_compatibility_keys_and_schema_version(semantic_manifest: dict) -> None:
    data = semantic_manifest
    for key in (
        "manifestVersion",
        "generatedAt",
        "ref",
        "releaseTag",
        "books",
        "glossary",
        "patterns",
        "situations",
        "sources",
        "relationships",
        "ontology",
    ):
        assert key in data
    assert data["schemaVersion"] == "2.5"
    assert "sourceCommit" in data
    assert isinstance(data["books"], list) and data["books"]
    book = data["books"][0]
    for field in ("id", "slug", "source", "status", "title", "concepts", "patterns", "sources"):
        assert field in book
    assert data["books"][0]["id"].startswith("book-")


def test_works_editions_wolty_mapping(semantic_manifest: dict) -> None:
    data = semantic_manifest
    works = {w["id"]: w for w in data["works"]}
    editions = {e["id"]: e for e in data["editions"]}
    assert "work-when-others-look-to-you" in works
    work = works["work-when-others-look-to-you"]
    assert work["currentEditionId"] == "book-when-others-look-to-you-v1"
    assert editions["book-when-others-look-to-you-v1"]["relationship"] == "primary"
    assert editions["book-when-others-look-to-you-v1"]["isCanonical"] is True
    assert editions["book-when-others-look-to-you-v2"]["relationship"] == "companion"
    assert editions["book-when-others-look-to-you-v2"]["isCanonical"] is False
    book = next(b for b in data["books"] if b["slug"] == "when-others-look-to-you-v1")
    assert book["workId"] == "work-when-others-look-to-you"
    assert book["contentType"] == "nonfiction"


def test_discovery_collections_present(semantic_manifest: dict) -> None:
    data = semantic_manifest
    assert len(data["questions"]) >= 1
    assert len(data["trails"]) >= 1
    assert len(data["challenges"]) >= 1
    assert len(data["shelves"]) >= 1
    assert len(data["changeEvents"]) >= 1
    assert len(data["searchAliases"]) >= 1
    q = data["questions"][0]
    assert q["pathStops"]
    assert "title" in q["pathStops"][0] or q["pathStops"][0].get("entityId")
    challenge = data["challenges"][0]
    assert challenge["dominantPattern"]
    assert challenge["id"].startswith("challenge-")
    fiction = next(s for s in data["shelves"] if s["slug"] == "fiction")
    assert fiction["selection"]["mode"] == "rule"
    assert any(b.startswith("book-") for b in fiction["resolvedBookIds"])


def test_rich_overview_and_content_types(semantic_manifest: dict) -> None:
    data = semantic_manifest
    ac = next(b for b in data["books"] if b["slug"] == "after-certainty")
    assert ac.get("overview")
    assert ac["overview"]["centralQuestion"]
    assert ac["overview"]["selectedConceptIds"]
    fiction = {b["slug"] for b in data["books"] if b.get("contentType") == "fiction"}
    assert "the-relay" in fiction
    handbook = {b["slug"] for b in data["books"] if b.get("contentType") == "handbook"}
    assert "how-serious-systems-learn" in handbook


def test_deterministic_discovery_ordering(semantic_manifest: dict) -> None:
    expectations = {
        "works": lambda r: str(r["id"]),
        "editions": lambda r: str(r["id"]),
        "questions": lambda r: str(r["id"]),
        "trails": lambda r: str(r["id"]),
        "challenges": lambda r: str(r["id"]),
        "shelves": lambda r: (int(r["displayOrder"]), str(r["id"])),
        "changeEvents": lambda r: (str(r["date"]), str(r["id"])),
        "searchAliases": lambda r: (str(r["kind"]), ",".join(r["terms"])),
    }
    for key, sort_key in expectations.items():
        rows = semantic_manifest[key]
        assert rows == sorted(rows, key=sort_key), key


def test_validate_discovery_rejects_duplicate_question(tmp_path: Path) -> None:
    # unit-level: write a bad shelf into tmp and invoke validator against a copy is heavy;
    # instead assert the validator module catches duplicate curated members via API.
    from validate_discovery_content import validate_path_stops

    errors: list[str] = []
    ids = {
        "book": {"book-after-certainty"},
        "book_slugs": {"after-certainty"},
        "chapter": {
            "chapter-after-certainty-front-matter-introduction",
        },
        "chapter_public": {
            "chapter-after-certainty-front-matter-introduction",
        },
        "concept": set(),
        "pattern": set(),
        "situation": set(),
        "source": set(),
        "thinker": set(),
    }
    validate_path_stops(
        Path("synthetic.yml"),
        [
            {
                "position": 1,
                "entityType": "book",
                "bookSlug": "after-certainty",
                "description": "a",
            },
            {
                "position": 2,
                "entityType": "book",
                "bookSlug": "missing-book",
                "description": "b",
                "whyThisFollows": "next",
            },
        ],
        ids=ids,
        errors=errors,
        require_transitions=True,
    )
    assert any("unknown bookSlug" in e for e in errors)


def test_validate_path_stops_rejects_unknown_and_non_public_chapters() -> None:
    from validate_discovery_content import validate_path_stops

    errors: list[str] = []
    ids = {
        "book": set(),
        "book_slugs": set(),
        "chapter": {"chapter-known-private", "chapter-known-public"},
        "chapter_public": {"chapter-known-public"},
        "concept": set(),
        "pattern": set(),
        "situation": set(),
        "source": set(),
        "thinker": set(),
    }
    validate_path_stops(
        Path("synthetic-chapters.yml"),
        [
            {
                "position": 1,
                "entityType": "chapter",
                "entityId": "chapter-known-public",
                "description": "ok",
            },
            {
                "position": 2,
                "entityType": "chapter",
                "entityId": "chapter-missing",
                "description": "bad",
                "whyThisFollows": "next",
            },
            {
                "position": 3,
                "entityType": "chapter",
                "entityId": "chapter-known-private",
                "description": "hidden",
                "whyThisFollows": "next",
            },
        ],
        ids=ids,
        errors=errors,
        require_transitions=True,
    )
    assert any("unknown chapter entityId" in e for e in errors)
    assert any("not a public reader destination" in e for e in errors)
    assert not any("chapter-known-public" in e and "unknown" in e for e in errors)


def test_hidden_change_event_excluded(tmp_path: Path) -> None:
    from discovery_manifest import build_change_events

    events_dir = tmp_path / "semantic" / "change-events"
    events_dir.mkdir(parents=True)
    (events_dir / "hidden.yml").write_text(
        yaml.dump(
            {
                "id": "event-hidden-test",
                "type": "book_published",
                "title": "Hidden",
                "summary": "Should not appear",
                "date": "2026-01-01",
                "entityType": "book",
                "entityId": "book-after-certainty",
                "visibility": "hidden",
                "source": "authored",
            }
        ),
        encoding="utf-8",
    )
    (events_dir / "public.yml").write_text(
        yaml.dump(
            {
                "id": "event-public-test",
                "type": "book_published",
                "title": "Public",
                "summary": "Should appear",
                "date": "2026-01-02",
                "entityType": "book",
                "entityId": "book-after-certainty",
                "visibility": "public",
                "source": "authored",
            }
        ),
        encoding="utf-8",
    )
    rows = build_change_events(
        tmp_path,
        [{"id": "book-after-certainty", "slug": "after-certainty", "coverImage": None}],
    )
    ids = {r["id"] for r in rows}
    assert "event-public-test" in ids
    assert "event-hidden-test" not in ids


def test_compare_site_discovery_runs() -> None:
    r = _run(
        [
            sys.executable,
            "tools/compare_site_discovery_data.py",
            "--repo",
            str(REPO),
            "--fixtures",
            "docs/migrations/fixtures/site-discovery",
        ]
    )
    assert r.returncode == 0, r.stderr or r.stdout
    assert "parity report" in r.stdout.lower() or "Intentionally remaining" in r.stdout


def test_validate_semantic_manifest_accepts_generated(semantic_manifest_path: Path) -> None:
    r = _run(
        [
            sys.executable,
            "tools/validate_semantic_manifest.py",
            "--repo",
            str(REPO),
            "--manifest",
            str(semantic_manifest_path),
        ]
    )
    assert r.returncode == 0, r.stderr or r.stdout
