"""INGRAM-002: publishing.targets.ingramspark schema, profile, and semantic validation."""

from __future__ import annotations

import copy
import sys
from pathlib import Path

import pytest
import yaml

_REPO = Path(__file__).resolve().parents[1]
_TOOLS = _REPO / "tools"
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from book_specs import (  # noqa: E402
    ingramspark_artifact_name,
    load_book_spec,
    spec_formats,
    spec_ingramspark_enabled,
    spec_ingramspark_target,
    validate_book_spec,
)
from ingramspark.profile import (  # noqa: E402
    load_profile,
    validate_all_profiles,
    validate_profile,
)


def _minimal_book_spec(**publishing_extra: object) -> dict:
    publishing: dict = {"enabled": True}
    publishing.update(publishing_extra)
    return {
        "version": 1,
        "publishing": publishing,
        "book": {
            "id": "fixture-book",
            "title": "Fixture Book",
            "language": "en",
            "copyright_year": 2026,
            "author": {"name": "Test Author"},
        },
        "paths": {"manuscript": "./index.md", "output": "."},
        "frontmatter": {"generate": {"enabled": False}},
        "build": {"formats": {"epub": {"enabled": False}, "pdf": {"enabled": False}}},
        "github": {"release": False, "release_tag": "latest", "artifacts": ["epub"]},
    }


def _write_spec(book_dir: Path, spec: dict) -> Path:
    book_dir.mkdir(parents=True, exist_ok=True)
    path = book_dir / "book.yml"
    path.write_text(yaml.safe_dump(spec, sort_keys=False), encoding="utf-8")
    return path


def test_absent_ingramspark_target_unchanged(tmp_path: Path) -> None:
    path = _write_spec(tmp_path / "book", _minimal_book_spec())
    spec = load_book_spec(path)
    assert spec_ingramspark_target(spec) == {}
    assert spec_ingramspark_enabled(spec) is False
    assert "ingramspark" not in spec_formats(spec)


def test_disabled_ingramspark_target_ok_without_isbns(tmp_path: Path) -> None:
    spec = _minimal_book_spec(
        targets={
            "ingramspark": {
                "enabled": False,
                "specification_profile": "ingramspark-2026-07",
                "status": "planning",
                "ebook": {"enabled": False},
                "print": {"enabled": False},
            }
        }
    )
    path = _write_spec(tmp_path / "book", spec)
    loaded = load_book_spec(path)
    assert spec_ingramspark_enabled(loaded) is False
    assert ingramspark_artifact_name(loaded["book"]["id"]) == "fixture-book-ingramspark.zip"


def test_profile_skeleton_loads_and_separates_epub_versions() -> None:
    profile = load_profile("ingramspark-2026-07")
    assert profile["id"] == "ingramspark-2026-07"
    assert profile["epub_content_version"] == "3.0"
    assert profile["epubcheck_tool_version"] == "5.3.0"
    assert profile["epub_content_version"] != profile["epubcheck_tool_version"]
    assert profile["ebook"]["max_interior_image_pixels"] == 3_200_000
    assert profile["ebook"]["cover_min_longest_side_px"] == 2560
    assert profile["print"]["pdfx_icc_policy"] == "account-verification-needed"
    assert validate_all_profiles() == ["ingramspark-2026-07"]


def test_profile_rejects_epubcheck_tool_version_3_0_0(tmp_path: Path) -> None:
    profile = copy.deepcopy(load_profile("ingramspark-2026-07"))
    profile["epubcheck_tool_version"] = "3.0.0"
    path = tmp_path / "ingramspark-2026-07.yml"
    path.write_text(yaml.safe_dump(profile), encoding="utf-8")
    with pytest.raises(ValueError, match="epubcheck_tool_version"):
        validate_profile(profile, path)


def test_ebook_enabled_requires_isbn(tmp_path: Path) -> None:
    book_dir = tmp_path / "book"
    (book_dir).mkdir()
    (book_dir / "cover.png").write_bytes(b"x")
    spec = _minimal_book_spec(
        targets={
            "ingramspark": {
                "enabled": True,
                "specification_profile": "ingramspark-2026-07",
                "status": "planning",
                "ebook": {
                    "enabled": True,
                    "format": "reflowable",
                    "cover_source": "cover.png",
                },
            }
        }
    )
    path = _write_spec(book_dir, spec)
    with pytest.raises(ValueError, match="schema validation failed"):
        validate_book_spec(spec, path)


def test_ebook_only_opt_in_ok(tmp_path: Path) -> None:
    book_dir = tmp_path / "book"
    book_dir.mkdir()
    (book_dir / "cover.png").write_bytes(b"x")
    spec = _minimal_book_spec(
        targets={
            "ingramspark": {
                "enabled": True,
                "specification_profile": "ingramspark-2026-07",
                "status": "planning",
                "package": {"github_release": True, "immutable_release": False},
                "ebook": {
                    "enabled": True,
                    "isbn": "9780000000001",
                    "format": "reflowable",
                    "cover_source": "cover.png",
                },
                "print": {"enabled": False},
            }
        }
    )
    path = _write_spec(book_dir, spec)
    loaded = load_book_spec(path)
    assert spec_ingramspark_enabled(loaded) is True
    assert loaded["publishing"]["targets"]["ingramspark"]["ebook"]["isbn"] == "9780000000001"
    assert "ingramspark" not in spec_formats(loaded)


def test_print_only_opt_in_ok(tmp_path: Path) -> None:
    book_dir = tmp_path / "book"
    book_dir.mkdir()
    wrap = book_dir / "assets" / "ingramspark"
    wrap.mkdir(parents=True)
    (wrap / "cover-wrap.pdf").write_bytes(b"%PDF-1.4")
    spec = _minimal_book_spec(
        targets={
            "ingramspark": {
                "enabled": True,
                "specification_profile": "ingramspark-2026-07",
                "status": "planning",
                "ebook": {"enabled": False},
                "print": {
                    "enabled": True,
                    "edition": "paperback",
                    "isbn": "9780000000002",
                    "binding": "perfect-bound",
                    "trim": {"width_inches": 6.0, "height_inches": 9.0},
                    "interior": {
                        "color_mode": "black-and-white",
                        "paper": "cream",
                        "bleed": False,
                    },
                    "cover": {
                        "strategy": "supplied-wrap",
                        "source": "assets/ingramspark/cover-wrap.pdf",
                        "template_page_count": 200,
                        "barcode_mode": "ingram-generated",
                    },
                },
            }
        }
    )
    path = _write_spec(book_dir, spec)
    loaded = load_book_spec(path)
    assert loaded["publishing"]["targets"]["ingramspark"]["print"]["edition"] == "paperback"


def test_duplicate_isbn_rejected(tmp_path: Path) -> None:
    book_dir = tmp_path / "book"
    book_dir.mkdir()
    (book_dir / "cover.png").write_bytes(b"x")
    wrap = book_dir / "assets" / "ingramspark"
    wrap.mkdir(parents=True)
    (wrap / "cover-wrap.pdf").write_bytes(b"%PDF-1.4")
    isbn = "9780000000099"
    spec = _minimal_book_spec(
        targets={
            "ingramspark": {
                "enabled": True,
                "specification_profile": "ingramspark-2026-07",
                "status": "planning",
                "ebook": {
                    "enabled": True,
                    "isbn": isbn,
                    "format": "reflowable",
                    "cover_source": "cover.png",
                },
                "print": {
                    "enabled": True,
                    "edition": "paperback",
                    "isbn": isbn,
                    "binding": "perfect-bound",
                    "trim": {"width_inches": 6.0, "height_inches": 9.0},
                    "interior": {
                        "color_mode": "black-and-white",
                        "paper": "cream",
                        "bleed": False,
                    },
                    "cover": {
                        "strategy": "supplied-wrap",
                        "source": "assets/ingramspark/cover-wrap.pdf",
                        "template_page_count": 200,
                        "barcode_mode": "ingram-generated",
                    },
                },
            }
        }
    )
    path = _write_spec(book_dir, spec)
    with pytest.raises(ValueError, match="must be distinct"):
        validate_book_spec(spec, path)


def test_enabled_target_requires_at_least_one_mode(tmp_path: Path) -> None:
    spec = _minimal_book_spec(
        targets={
            "ingramspark": {
                "enabled": True,
                "specification_profile": "ingramspark-2026-07",
                "status": "planning",
                "ebook": {"enabled": False},
                "print": {"enabled": False},
            }
        }
    )
    path = _write_spec(tmp_path / "book", spec)
    with pytest.raises(ValueError, match="neither ebook.enabled nor print.enabled"):
        validate_book_spec(spec, path)


def test_unknown_profile_rejected(tmp_path: Path) -> None:
    book_dir = tmp_path / "book"
    book_dir.mkdir()
    (book_dir / "cover.png").write_bytes(b"x")
    spec = _minimal_book_spec(
        targets={
            "ingramspark": {
                "enabled": True,
                "specification_profile": "ingramspark-1999-01",
                "status": "planning",
                "ebook": {
                    "enabled": True,
                    "isbn": "9780000000003",
                    "format": "reflowable",
                    "cover_source": "cover.png",
                },
            }
        }
    )
    path = _write_spec(book_dir, spec)
    with pytest.raises(ValueError, match="Unknown IngramSpark specification_profile"):
        validate_book_spec(spec, path)


def test_missing_cover_source_file_rejected(tmp_path: Path) -> None:
    book_dir = tmp_path / "book"
    book_dir.mkdir()
    spec = _minimal_book_spec(
        targets={
            "ingramspark": {
                "enabled": True,
                "specification_profile": "ingramspark-2026-07",
                "status": "planning",
                "ebook": {
                    "enabled": True,
                    "isbn": "9780000000004",
                    "format": "reflowable",
                    "cover_source": "missing-cover.png",
                },
            }
        }
    )
    path = _write_spec(book_dir, spec)
    with pytest.raises(ValueError, match="cover_source"):
        validate_book_spec(spec, path)


def test_no_hardcover_isbn_or_artifact_name_in_schema(tmp_path: Path) -> None:
    book_dir = tmp_path / "book"
    book_dir.mkdir()
    (book_dir / "cover.png").write_bytes(b"x")
    spec = _minimal_book_spec(
        targets={
            "ingramspark": {
                "enabled": True,
                "specification_profile": "ingramspark-2026-07",
                "status": "planning",
                "package": {"artifact_name": "custom.zip"},
                "ebook": {
                    "enabled": True,
                    "isbn": "9780000000005",
                    "format": "reflowable",
                    "cover_source": "cover.png",
                },
            }
        }
    )
    path = _write_spec(book_dir, spec)
    with pytest.raises(ValueError, match="schema validation failed"):
        validate_book_spec(spec, path)

    spec2 = _minimal_book_spec(
        targets={
            "ingramspark": {
                "enabled": False,
                "print": {
                    "enabled": False,
                    "hardcover_isbn": "9780000000006",
                },
            }
        }
    )
    path2 = _write_spec(tmp_path / "book2", spec2)
    with pytest.raises(ValueError, match="schema validation failed"):
        validate_book_spec(spec2, path2)


def test_print_planning_may_omit_isbn_for_cover_preview(tmp_path: Path) -> None:
    book_dir = tmp_path / "book"
    assets = book_dir / "assets" / "ingramspark"
    assets.mkdir(parents=True)
    for name in ("back.png", "spine.png", "front.png"):
        (assets / name).write_bytes(b"\x89PNG\r\n\x1a\n")
    (assets / "template-meta.yml").write_text("version: 1\n", encoding="utf-8")
    spec = _minimal_book_spec(
        targets={
            "ingramspark": {
                "enabled": True,
                "specification_profile": "ingramspark-2026-07",
                "status": "planning",
                "package": {"github_release": False, "immutable_release": False},
                "ebook": {"enabled": False},
                "print": {
                    "enabled": True,
                    "edition": "paperback",
                    "binding": "perfect-bound",
                    "trim": {"width_inches": 6.0, "height_inches": 9.0},
                    "interior": {
                        "color_mode": "black-and-white",
                        "paper": "cream",
                        "bleed": False,
                    },
                    "cover": {
                        "strategy": "assembled-raster-wrap",
                        "assets": {
                            "back": "assets/ingramspark/back.png",
                            "spine": "assets/ingramspark/spine.png",
                            "front": "assets/ingramspark/front.png",
                        },
                        "template_metadata": "assets/ingramspark/template-meta.yml",
                        "template_page_count": 100,
                        "barcode_mode": "ingram-generated",
                    },
                },
            }
        }
    )
    path = _write_spec(book_dir, spec)
    loaded = load_book_spec(path)
    assert "isbn" not in loaded["publishing"]["targets"]["ingramspark"]["print"]


def test_print_isbn_required_when_production_approved(tmp_path: Path) -> None:
    book_dir = tmp_path / "book"
    assets = book_dir / "assets" / "ingramspark"
    assets.mkdir(parents=True)
    for name in ("back.png", "spine.png", "front.png"):
        (assets / name).write_bytes(b"\x89PNG\r\n\x1a\n")
    (assets / "template-meta.yml").write_text("version: 1\n", encoding="utf-8")
    spec = _minimal_book_spec(
        targets={
            "ingramspark": {
                "enabled": True,
                "specification_profile": "ingramspark-2026-07",
                "status": "production-approved",
                "ebook": {"enabled": False},
                "print": {
                    "enabled": True,
                    "edition": "paperback",
                    "binding": "perfect-bound",
                    "trim": {"width_inches": 6.0, "height_inches": 9.0},
                    "interior": {
                        "color_mode": "black-and-white",
                        "paper": "cream",
                        "bleed": False,
                    },
                    "cover": {
                        "strategy": "assembled-raster-wrap",
                        "assets": {
                            "back": "assets/ingramspark/back.png",
                            "spine": "assets/ingramspark/spine.png",
                            "front": "assets/ingramspark/front.png",
                        },
                        "template_metadata": "assets/ingramspark/template-meta.yml",
                        "template_page_count": 100,
                        "barcode_mode": "ingram-generated",
                    },
                },
            }
        }
    )
    path = _write_spec(book_dir, spec)
    with pytest.raises(ValueError, match="print.isbn is required"):
        validate_book_spec(spec, path)


def test_print_isbn_required_when_github_release_packaging(tmp_path: Path) -> None:
    book_dir = tmp_path / "book"
    assets = book_dir / "assets" / "ingramspark"
    assets.mkdir(parents=True)
    for name in ("back.png", "spine.png", "front.png"):
        (assets / name).write_bytes(b"\x89PNG\r\n\x1a\n")
    (assets / "template-meta.yml").write_text("version: 1\n", encoding="utf-8")
    spec = _minimal_book_spec(
        targets={
            "ingramspark": {
                "enabled": True,
                "specification_profile": "ingramspark-2026-07",
                "status": "planning",
                "package": {"github_release": True, "immutable_release": False},
                "ebook": {"enabled": False},
                "print": {
                    "enabled": True,
                    "edition": "paperback",
                    "binding": "perfect-bound",
                    "trim": {"width_inches": 6.0, "height_inches": 9.0},
                    "interior": {
                        "color_mode": "black-and-white",
                        "paper": "cream",
                        "bleed": False,
                    },
                    "cover": {
                        "strategy": "assembled-raster-wrap",
                        "assets": {
                            "back": "assets/ingramspark/back.png",
                            "spine": "assets/ingramspark/spine.png",
                            "front": "assets/ingramspark/front.png",
                        },
                        "template_metadata": "assets/ingramspark/template-meta.yml",
                        "template_page_count": 100,
                        "barcode_mode": "ingram-generated",
                    },
                },
            }
        }
    )
    path = _write_spec(book_dir, spec)
    with pytest.raises(ValueError, match="print.isbn is required"):
        validate_book_spec(spec, path)


def test_existing_repo_books_still_validate(repo_root: Path) -> None:
    """Every current book.yml remains schema-valid; only planning cover previews may opt in."""
    from book_specs import discover_book_spec_paths

    paths = discover_book_spec_paths(repo_root)
    assert paths
    opted_in = []
    for path in paths:
        spec = load_book_spec(path)
        if spec_ingramspark_enabled(spec):
            opted_in.append(path)
            target = spec_ingramspark_target(spec)
            assert target.get("status") == "planning"
            assert target.get("print", {}).get("enabled") is True
            assert not str(target.get("print", {}).get("isbn") or "").strip()
    assert any(p.name == "book.yml" and "everyone-knows-love" in p.as_posix() for p in opted_in)
