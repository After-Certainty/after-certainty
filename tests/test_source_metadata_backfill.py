"""Tests for source metadata backfill and manifest v1.5/v2 emission."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import yaml

_TOOLS = Path(__file__).resolve().parents[1] / "tools"
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from source_metadata import (  # noqa: E402
    enrich_source_record,
    infer_source_kind,
    parse_year_from_citation,
    split_display_name,
)


def test_split_display_name_em_dash() -> None:
    author, title = split_display_name("Hannah Arendt — Between Past and Future")
    assert author == "Hannah Arendt"
    assert title == "Between Past and Future"


def test_enrich_source_record_adds_v15_fields() -> None:
    raw = {
        "slug": "arendt-hannah-between-past-and-future",
        "name": "Hannah Arendt — Between Past and Future",
        "type": "book",
        "summary": "Arendt, Hannah. *Between Past and Future*. New York: Penguin Books, 2006.",
        "concepts": [],
        "patterns": [],
        "relatedBooks": ["living-in-sediment"],
    }
    out = enrich_source_record(raw)
    assert out["title"] == "Between Past and Future"
    assert out["creatorNames"] == ["Hannah Arendt"]
    assert out["creatorSlugs"] == ["hannah-arendt"]
    assert out["citation"] == raw["summary"]
    assert out["sourceKind"] == "book"
    assert out["year"] == 2006
    assert out["publisher"] == "Penguin Books"


def test_enrich_source_record_preserves_existing_fields() -> None:
    raw = {
        "slug": "example",
        "name": "Author — Title",
        "type": "book",
        "summary": "s",
        "concepts": [],
        "patterns": [],
        "relatedBooks": [],
        "creatorSlugs": ["custom-slug"],
        "whyThisMatters": "Already set.",
    }
    out = enrich_source_record(raw, overwrite=False)
    assert out["creatorSlugs"] == ["custom-slug"]
    assert out["whyThisMatters"] == "Already set."


def test_infer_source_kind_institutional() -> None:
    assert infer_source_kind("book", "World Bank", "State and Trends of Carbon Pricing") == "report"


def test_parse_year_from_citation() -> None:
    assert (
        parse_year_from_citation(
            "Arendt, Hannah. *Between Past and Future*. New York: Penguin Books, 2006."
        )
        == 2006
    )


def test_build_sources_preserves_legacy_shape(repo_root: Path) -> None:
    import generate_semantic_manifest as gsm

    sources = gsm.build_sources(repo_root)
    assert sources
    legacy = next(s for s in sources if s["slug"] == "arendt-hannah-between-past-and-future")
    for key in ("id", "slug", "name", "type", "summary", "concepts", "patterns", "relatedBooks"):
        assert key in legacy


def test_build_sources_emits_v15_fields_when_present(tmp_path: Path) -> None:
    import generate_semantic_manifest as gsm

    sources_dir = tmp_path / "semantic" / "sources"
    sources_dir.mkdir(parents=True)
    record = {
        "slug": "sample-enriched",
        "name": "Sample Author — Sample Title",
        "type": "book",
        "sourceKind": "book",
        "creatorNames": ["Sample Author"],
        "creatorSlugs": ["sample-author"],
        "title": "Sample Title",
        "citation": "Sample Author. *Sample Title*. 2020.",
        "year": 2020,
        "summary": "Sample Author. *Sample Title*. 2020.",
        "concepts": [],
        "patterns": [],
        "relatedBooks": [],
    }
    (sources_dir / "sample-enriched.yml").write_text(yaml.safe_dump(record), encoding="utf-8")
    # Minimal dirs so _load_dir_yml works for sources only
    for sub in ("glossary", "patterns", "situations", "thinkers"):
        (tmp_path / "semantic" / sub).mkdir(parents=True, exist_ok=True)

    out = gsm.build_sources(tmp_path)
    assert len(out) == 1
    entry = out[0]
    assert entry["creatorSlugs"] == ["sample-author"]
    assert entry["title"] == "Sample Title"
    assert entry["year"] == 2020


def test_manifest_v2_with_thinkers_on_repo(
    repo_root: Path, semantic_manifest: dict, semantic_manifest_path: Path
) -> None:
    """Canonical semantic/thinkers/*.yml emits manifestVersion 2."""
    thinkers_dir = repo_root / "semantic" / "thinkers"
    if not thinkers_dir.is_dir() or not any(thinkers_dir.glob("*.yml")):
        return

    data = semantic_manifest
    assert data["manifestVersion"] == 2
    assert len(data["thinkers"]) >= 1
    arendt = next((t for t in data["thinkers"] if t["slug"] == "hannah-arendt"), None)
    if arendt:
        assert arendt["id"] == "thinker-hannah-arendt"
        assert arendt["works"][0].startswith("source-")

    val = subprocess.run(
        [
            sys.executable,
            str(repo_root / "tools/validate_semantic_manifest.py"),
            "--repo",
            str(repo_root),
            "--manifest",
            str(semantic_manifest_path),
        ],
        capture_output=True,
        text=True,
        timeout=60,
    )
    assert val.returncode == 0, val.stderr


def test_manifest_v2_with_thinkers_fixture(tmp_path: Path, repo_root: Path) -> None:
    import shutil

    semantic = tmp_path / "semantic"
    for sub in ("glossary", "patterns", "sources", "situations"):
        src = repo_root / "semantic" / sub
        dst = semantic / sub
        if src.is_dir():
            shutil.copytree(src, dst)

    thinkers_dir = semantic / "thinkers"
    thinkers_dir.mkdir()
    thinker = {
        "slug": "hannah-arendt",
        "name": "Hannah Arendt",
        "type": "person",
        "summary": "Political theorist.",
        "concepts": [],
        "patterns": [],
        "relatedBooks": ["after-certainty"],
        "works": ["arendt-hannah-between-past-and-future"],
        "whyThisMatters": "Frames authority and judgment.",
    }
    (thinkers_dir / "hannah-arendt.yml").write_text(yaml.safe_dump(thinker), encoding="utf-8")

    out = tmp_path / "semantic-manifest.json"
    cmd = [
        sys.executable,
        str(repo_root / "tools/generate_semantic_manifest.py"),
        "--repo",
        str(tmp_path),
        "--out",
        str(out),
        "--github-repository",
        "test-owner/test-repo",
        "--no-warn-term-kind",
    ]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
    assert r.returncode == 0, r.stderr
    data = json.loads(out.read_text(encoding="utf-8"))
    assert data["manifestVersion"] == 2
    assert len(data["thinkers"]) == 1
    assert data["thinkers"][0]["id"] == "thinker-hannah-arendt"
    assert data["thinkers"][0]["works"] == ["source-arendt-hannah-between-past-and-future"]

    val = subprocess.run(
        [
            sys.executable,
            str(repo_root / "tools/validate_semantic_manifest.py"),
            "--repo",
            str(repo_root),
            "--manifest",
            str(out),
        ],
        capture_output=True,
        text=True,
        timeout=60,
    )
    assert val.returncode == 0, val.stderr


def test_backfill_cli_dry_run(repo_root: Path) -> None:
    r = subprocess.run(
        [
            sys.executable,
            str(repo_root / "tools/backfill_source_metadata.py"),
            "--repo",
            str(repo_root),
            "--dry-run",
            "--limit",
            "3",
        ],
        capture_output=True,
        text=True,
        timeout=60,
    )
    assert r.returncode == 0, r.stderr
