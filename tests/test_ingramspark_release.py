"""INGRAM-008: release merge allowlist, CI matrix flags, immutable plan, website exclusion."""

from __future__ import annotations

import json
import subprocess
import sys
import zipfile
from pathlib import Path

import yaml

_REPO = Path(__file__).resolve().parents[1]
_TOOLS = _REPO / "tools"
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from book_specs import (  # noqa: E402
    ingramspark_artifact_name,
    is_ingramspark_release_zip,
    load_book_spec,
    spec_formats,
    spec_ingramspark_github_release,
    spec_ingramspark_immutable_release,
    spec_ingramspark_production_approved,
    validate_book_spec,
)
from ci_affected_books import matrix_entries  # noqa: E402
from merge_release_assets import is_release_asset_name  # noqa: E402
from plan_ingramspark_releases import (  # noqa: E402
    book_id_from_zip_name,
    build_plan,
    immutable_tag_for_spec,
)


def _minimal_spec(**ingram_extra: object) -> dict:
    target = {
        "enabled": True,
        "specification_profile": "ingramspark-2026-07",
        "status": "planning",
        "package": {"github_release": False, "immutable_release": False},
        "ebook": {
            "enabled": True,
            "isbn": "9780000001301",
            "format": "reflowable",
            "cover_source": "cover.png",
        },
        "print": {"enabled": False},
    }
    target.update(ingram_extra)
    return {
        "version": 1,
        "publishing": {"enabled": True, "targets": {"ingramspark": target}},
        "book": {
            "id": "release-fixture",
            "title": "Release Fixture",
            "language": "en",
            "copyright_year": 2026,
            "author": {"name": "Test Author"},
        },
        "paths": {"manuscript": "./index.md", "output": "."},
        "frontmatter": {"generate": {"enabled": False}},
        "build": {
            "formats": {
                "epub": {"enabled": True},
                "pdf": {"enabled": False},
                "docx": {"enabled": False},
            }
        },
        "github": {"release": True, "release_tag": "latest", "artifacts": ["epub"]},
    }


def test_is_ingramspark_release_zip_helpers() -> None:
    assert is_ingramspark_release_zip("everyone-knows-love-ingramspark.zip")
    assert not is_ingramspark_release_zip("everyone-knows-love.zip")
    assert not is_ingramspark_release_zip("notes.zip")
    assert is_release_asset_name("book.epub")
    assert is_release_asset_name("book-ingramspark.zip")
    assert not is_release_asset_name("random.zip")


def test_merge_copies_ingramspark_zip_not_arbitrary_zip(tmp_path: Path) -> None:
    prior = tmp_path / "prior"
    built = tmp_path / "built"
    out = tmp_path / "upload"
    prior.mkdir()
    built.mkdir()
    (prior / "keep.docx").write_text("d", encoding="utf-8")
    (prior / "stale-ingramspark.zip").write_bytes(b"PK\x03\x04stale")
    (prior / "noise.zip").write_bytes(b"PK\x03\x04noise")
    (built / "fresh-ingramspark.zip").write_bytes(b"PK\x03\x04fresh")
    (built / "other.zip").write_bytes(b"PK\x03\x04other")

    proc = subprocess.run(
        [
            sys.executable,
            str(_REPO / "tools/merge_release_assets.py"),
            "--repo",
            str(_REPO),
            "--prior-dir",
            str(prior),
            "--built-dir",
            str(built),
            "--out-dir",
            str(out),
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    assert proc.returncode == 0, proc.stderr
    names = {p.name for p in out.iterdir()}
    assert "keep.docx" in names
    assert "stale-ingramspark.zip" in names
    assert "fresh-ingramspark.zip" in names
    assert "noise.zip" not in names
    assert "other.zip" not in names


def test_matrix_flags_for_ingramspark(tmp_path: Path) -> None:
    book_dir = tmp_path / "books" / "release-fixture"
    book_dir.mkdir(parents=True)
    (book_dir / "cover.png").write_bytes(b"x")
    (book_dir / "index.md").write_text("# Hi\n", encoding="utf-8")
    spec = _minimal_spec(
        package={"github_release": True, "immutable_release": False},
        status="planning",
    )
    (book_dir / "book.yml").write_text(yaml.safe_dump(spec, sort_keys=False), encoding="utf-8")
    # Point matrix_entries at a temp repo with schema symlink for load? load_spec_for_rel
    # uses load_spec_for_book_dir which validates against schema — need schema available.
    repo = tmp_path
    (repo / "schema").symlink_to(_REPO / "schema", target_is_directory=True)
    entries = matrix_entries(repo, [book_dir])
    assert len(entries) == 1
    row = entries[0]
    assert row["package_ingramspark"] == "true"
    assert row["ingramspark_github_release"] == "true"
    assert row["ingramspark_ebook"] == "true"
    assert row["ingramspark_print"] == "false"
    assert "ingramspark" not in spec_formats(load_book_spec(book_dir / "book.yml"))


def test_package_flags_helpers(tmp_path: Path) -> None:
    book_dir = tmp_path / "book"
    book_dir.mkdir()
    (book_dir / "cover.png").write_bytes(b"x")
    spec = _minimal_spec(
        status="production-approved",
        package={"github_release": True, "immutable_release": True},
    )
    path = book_dir / "book.yml"
    path.write_text(yaml.safe_dump(spec, sort_keys=False), encoding="utf-8")
    # Validate against real schema by temporarily using repo schema via validate_book_spec
    validate_book_spec(spec, path)
    assert spec_ingramspark_github_release(spec) is True
    assert spec_ingramspark_immutable_release(spec) is True
    assert spec_ingramspark_production_approved(spec) is True
    assert immutable_tag_for_spec(spec, date_stamp="20260725") == (
        "ingramspark/release-fixture/9780000001301"
    )
    assert book_id_from_zip_name(ingramspark_artifact_name("release-fixture")) == "release-fixture"


def test_immutable_plan_skips_planning_status(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    staging = tmp_path / "staging"
    book_dir = repo / "books" / "release-fixture"
    book_dir.mkdir(parents=True)
    staging.mkdir()
    (repo / "schema").symlink_to(_REPO / "schema", target_is_directory=True)
    (book_dir / "cover.png").write_bytes(b"x")
    (book_dir / "index.md").write_text("# Hi\n", encoding="utf-8")
    spec = _minimal_spec(
        status="planning",
        package={"github_release": True, "immutable_release": True},
    )
    (book_dir / "book.yml").write_text(yaml.safe_dump(spec, sort_keys=False), encoding="utf-8")
    zip_name = ingramspark_artifact_name("release-fixture")
    zip_path = staging / zip_name
    with zipfile.ZipFile(zip_path, "w") as zf:
        zf.writestr(
            "package-manifest.json",
            json.dumps({"dirty_tree": False, "book_id": "release-fixture"}),
        )
    plan = build_plan(repo=repo, staging=staging)
    assert zip_name in plan["latest_zips"]
    assert plan["immutable"] == []
    assert plan["errors"] == []


def test_immutable_plan_includes_production_approved(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    staging = tmp_path / "staging"
    book_dir = repo / "books" / "release-fixture"
    book_dir.mkdir(parents=True)
    staging.mkdir()
    (repo / "schema").symlink_to(_REPO / "schema", target_is_directory=True)
    (book_dir / "cover.png").write_bytes(b"x")
    (book_dir / "index.md").write_text("# Hi\n", encoding="utf-8")
    spec = _minimal_spec(
        status="production-approved",
        package={"github_release": True, "immutable_release": True},
    )
    (book_dir / "book.yml").write_text(yaml.safe_dump(spec, sort_keys=False), encoding="utf-8")
    zip_name = ingramspark_artifact_name("release-fixture")
    with zipfile.ZipFile(staging / zip_name, "w") as zf:
        zf.writestr(
            "package-manifest.json",
            json.dumps({"dirty_tree": False, "book_id": "release-fixture"}),
        )
    plan = build_plan(repo=repo, staging=staging)
    assert len(plan["immutable"]) == 1
    assert plan["immutable"][0]["tag"].startswith("ingramspark/release-fixture/")
    assert plan["immutable"][0]["asset"] == zip_name


def test_website_manifest_still_excludes_ingramspark(tmp_path: Path) -> None:
    from manifest_books import build_book_entry, format_entry

    book_dir = tmp_path / "books" / "release-fixture"
    book_dir.mkdir(parents=True)
    (tmp_path / "schema").symlink_to(_REPO / "schema", target_is_directory=True)
    (book_dir / "cover.png").write_bytes(b"x")
    (book_dir / "index.md").write_text("# Hi\n", encoding="utf-8")
    spec = _minimal_spec(package={"github_release": True, "immutable_release": False})
    path = book_dir / "book.yml"
    path.write_text(yaml.safe_dump(spec, sort_keys=False), encoding="utf-8")
    loaded = load_book_spec(path)
    assert "ingramspark" not in spec_formats(loaded)
    entry = format_entry("o/r", "latest", "epub", "release-fixture", True, include_release_url=True)
    assert "ingramspark" not in entry
    book_entry = build_book_entry(
        repo=tmp_path,
        spec_path=path,
        spec=loaded,
        repo_slug="o/r",
        ref="main",
        release_tag="latest",
        source="books",
        status="published",
    )
    assert "ingramspark" not in book_entry


def test_matrix_ingramspark_github_release_flags() -> None:
    # Use pdf (not epub): Observer Patterns is print/PDF-only and omitted from epub matrices.
    matrix = subprocess.run(
        [
            sys.executable,
            str(_REPO / "tools/ci_affected_books.py"),
            "--repo",
            str(_REPO),
            "--all",
            "--format",
            "pdf",
        ],
        capture_output=True,
        text=True,
        check=False,
        timeout=120,
    )
    assert matrix.returncode == 0, matrix.stderr
    payload = json.loads(matrix.stdout)
    assert payload["count"] >= 1
    opted_in = []
    for row in payload["include"]:
        if row["package_ingramspark"] == "true":
            opted_in.append(row)
            assert row["ingramspark_print"] == "true", row
            if row["slug"] == "everyone-knows-love":
                assert row["ingramspark_ebook"] == "true", row
                # EKL pilot is production-approved with rolling release attach.
                assert row["ingramspark_github_release"] == "true", row
            elif row["slug"] == "observer-patterns":
                # Print-only planning; no GitHub Release attach yet.
                assert row["ingramspark_ebook"] == "false", row
                assert row["ingramspark_github_release"] == "false", row
            else:
                raise AssertionError(f"unexpected IngramSpark opt-in: {row}")
        else:
            assert row["ingramspark_github_release"] == "false", row
    slugs = {row["slug"] for row in opted_in}
    assert "everyone-knows-love" in slugs
    assert "observer-patterns" in slugs
