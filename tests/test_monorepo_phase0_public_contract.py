"""Phase 0 public-contract locks for the monorepo migration.

These assertions freeze the representative public entities the migration plan
requires for later parity (fiction, poetry, companion edition, discovery
surfaces, and production smoke-route slugs). They complement
test_discovery_manifest.py and must stay green before Phase 1+.
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parents[1]
BASELINES = REPO / "docs" / "migrations" / "monorepo-phase-0" / "baselines"


def _generate(tmp_path: Path) -> dict:
    out = tmp_path / "semantic-manifest.json"
    r = subprocess.run(
        [
            sys.executable,
            str(REPO / "tools" / "generate_semantic_manifest.py"),
            "--repo",
            str(REPO),
            "--out",
            str(out),
            "--github-repository",
            "ksteffe/after-certainty",
            "--github-ref",
            "main",
            "--release-tag",
            "latest",
            "--no-warn-term-kind",
        ],
        capture_output=True,
        text=True,
        timeout=180,
        cwd=REPO,
    )
    assert r.returncode == 0, r.stderr or r.stdout
    return json.loads(out.read_text(encoding="utf-8"))


@pytest.fixture(scope="module")
def manifest(tmp_path_factory: pytest.TempPathFactory) -> dict:
    return _generate(tmp_path_factory.mktemp("phase0-manifest"))


def test_phase0_baseline_files_exist() -> None:
    for name in (
        "release-manifest-identity.json",
        "site-intended-manifest-release.json",
        "site-fallback-manifest-identity.json",
        "production-smoke-urls.json",
    ):
        path = BASELINES / name
        assert path.is_file(), f"missing Phase 0 baseline: {path}"
        data = json.loads(path.read_text(encoding="utf-8"))
        assert isinstance(data, dict) and data


def test_phase0_schema_and_core_collections(manifest: dict) -> None:
    assert manifest["schemaVersion"] == "2.3"
    assert manifest["manifestVersion"] == 2
    assert manifest.get("sourceCommit")
    for key in (
        "books",
        "glossary",
        "patterns",
        "situations",
        "sources",
        "relationships",
        "thinkers",
        "works",
        "editions",
        "questions",
        "trails",
        "shelves",
        "changeEvents",
        "searchAliases",
        "parts",
        "chapters",
    ):
        assert isinstance(manifest.get(key), list), key
        assert len(manifest[key]) >= 1, key


def test_phase0_representative_content_types(manifest: dict) -> None:
    by_slug = {b["slug"]: b for b in manifest["books"]}
    assert by_slug["after-certainty"].get("contentType", "nonfiction") == "nonfiction"
    assert by_slug["boundary-conditions"]["contentType"] == "fiction"
    assert by_slug["observer-patterns"]["contentType"] == "poetry"
    assert by_slug["before-certainty-arrives"].get("contentType", "nonfiction") == "nonfiction"


def test_phase0_companion_and_superseded_edition_shape(manifest: dict) -> None:
    editions = {e["id"]: e for e in manifest["editions"]}
    assert editions["book-when-others-look-to-you-v1"]["isCanonical"] is True
    assert editions["book-when-others-look-to-you-v2"]["relationship"] == "companion"
    works = {w["id"]: w for w in manifest["works"]}
    assert works["work-when-others-look-to-you"]["currentEditionId"] == (
        "book-when-others-look-to-you-v1"
    )


def test_phase0_discovery_representatives(manifest: dict) -> None:
    # Questions/trails use id fields matching YAML stems in this corpus.
    question_ids = {q.get("id") or q.get("slug") for q in manifest["questions"]}
    assert "trust-survives-disagreement" in question_ids

    trail_ids = {t.get("id") or t.get("slug") for t in manifest["trails"]}
    assert "judgment-before-certainty" in trail_ids

    shelf_slugs = {s.get("slug") or s.get("id") for s in manifest["shelves"]}
    assert "fiction" in shelf_slugs

    assert any(e.get("visibility", "public") != "hidden" for e in manifest["changeEvents"])
    assert any(a.get("terms") or a.get("alias") for a in manifest["searchAliases"])


def test_phase0_chapters_and_roles(manifest: dict) -> None:
    assert len(manifest["chapters"]) >= 1
    assert len(manifest["parts"]) >= 1
    # At least one chapter carries authored enrichment useful to the site.
    enriched = [
        c
        for c in manifest["chapters"]
        if c.get("summary") or c.get("centralQuestion") or c.get("transition")
    ]
    assert enriched, "expected at least one chapter with summary/centralQuestion/transition"

    books_with_roles = [
        b
        for b in manifest["books"]
        if (b.get("overview") or {}).get("selectedConceptRoles")
        or (b.get("overview") or {}).get("selectedPatternRoles")
        or (b.get("overview") or {}).get("selectedConceptIds")
    ]
    assert books_with_roles, "expected overview concept/pattern selection on at least one book"


def test_phase0_smoke_route_entities_exist_in_manifest(manifest: dict) -> None:
    """Entity slugs used by production smoke URLs must remain in the public manifest."""
    smoke = json.loads((BASELINES / "production-smoke-urls.json").read_text(encoding="utf-8"))
    paths = [u["path"] for u in smoke["urls"]]

    book_slugs = {b["slug"] for b in manifest["books"]}
    concept_slugs = {g.get("slug") or g.get("id") for g in manifest["glossary"]}
    pattern_slugs = {p.get("slug") or p.get("id") for p in manifest["patterns"]}
    situation_slugs = {s.get("slug") or s.get("id") for s in manifest["situations"]}
    thinker_slugs = {t.get("slug") or t.get("id") for t in manifest["thinkers"]}
    source_slugs = {s.get("slug") or s.get("id") for s in manifest["sources"]}
    question_ids = {q.get("id") or q.get("slug") for q in manifest["questions"]}
    trail_ids = {t.get("id") or t.get("slug") for t in manifest["trails"]}

    expectations = {
        "/explore/books/after-certainty": ("book", "after-certainty", book_slugs),
        "/explore/books/how-meaning-moves": ("book", "how-meaning-moves", book_slugs),
        "/explore/thinkers/john-dewey": ("thinker", "john-dewey", thinker_slugs),
        "/explore/concepts/certainty": ("concept", "certainty", concept_slugs),
        "/explore/concepts/abstraction": ("concept", "abstraction", concept_slugs),
        "/explore/patterns/attention-finds-a-focus": (
            "pattern",
            "attention-finds-a-focus",
            pattern_slugs,
        ),
        "/explore/situations/temporary-fixes-become-permanent": (
            "situation",
            "temporary-fixes-become-permanent",
            situation_slugs,
        ),
        "/explore/sources/agamben-giorgio-state-of-exception": (
            "source",
            "agamben-giorgio-state-of-exception",
            source_slugs,
        ),
        "/questions/trust-survives-disagreement": (
            "question",
            "trust-survives-disagreement",
            question_ids,
        ),
        "/trails/judgment-before-certainty": (
            "trail",
            "judgment-before-certainty",
            trail_ids,
        ),
    }

    for path in expectations:
        assert path in paths, f"smoke baseline missing path {path}"
        _kind, slug, universe = expectations[path]
        assert slug in universe, f"smoke slug missing from manifest: {_kind} {slug}"


def test_phase0_release_baseline_schema_matches_generator(manifest: dict) -> None:
    release = json.loads((BASELINES / "release-manifest-identity.json").read_text(encoding="utf-8"))
    assert release["schemaVersion"] == manifest["schemaVersion"] == "2.3"
    # Counts may grow; generator must not shrink below the frozen release floor without
    # an intentional baseline refresh.
    for key, floor in release["counts"].items():
        assert len(manifest[key]) >= floor, (
            f"{key}: generated {len(manifest[key])} < baseline {floor}"
        )
