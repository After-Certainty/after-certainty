"""INGRAM-007: submission-kit ZIP assembly (ebook-only / print-only / combined)."""

from __future__ import annotations

import hashlib
import json
import os
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

import pytest
import yaml

_REPO = Path(__file__).resolve().parents[1]
_TOOLS = _REPO / "tools"
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from book_specs import load_spec_for_book_dir  # noqa: E402
from ingramspark.package import (  # noqa: E402
    package_ingramspark,
    verify_checksums_file,
    write_readme_upload,
)
from ingramspark.paths import package_zip_path  # noqa: E402

pandoc = shutil.which("pandoc")
xelatex = shutil.which("xelatex")
gs = shutil.which("gs")
requires_ebook = pytest.mark.skipif(pandoc is None, reason="pandoc required")
requires_print = pytest.mark.skipif(
    pandoc is None or xelatex is None or gs is None,
    reason="pandoc, xelatex, and ghostscript required",
)


def _temp_repo(tmp_path: Path) -> Path:
    repo = tmp_path / "repo"
    repo.mkdir()
    (repo / "schema").symlink_to(_REPO / "schema", target_is_directory=True)
    (repo / "tools").symlink_to(_REPO / "tools", target_is_directory=True)
    (repo / "scripts").symlink_to(_REPO / "scripts", target_is_directory=True)
    (repo / "templates").mkdir()
    return repo


def _write_cover(path: Path, size: tuple[int, int] = (1600, 2560)) -> None:
    from PIL import Image

    path.parent.mkdir(parents=True, exist_ok=True)
    Image.new("RGB", size, color=(40, 80, 120)).save(path)


def _write_wrap(path: Path, *, w: float = 12.5, h: float = 9.25) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    ps = path.with_suffix(".ps")
    ps.write_text(
        "%!PS-Adobe-3.0\n"
        f"<< /PageSize [{w * 72} {h * 72}] >> setpagedevice\n"
        "0 1 1 0 setcmykcolor\n72 72 80 80 rectfill\nshowpage\n",
        encoding="utf-8",
    )
    subprocess.run(
        [
            "gs",
            "-dBATCH",
            "-dNOPAUSE",
            "-dSAFER",
            "-sDEVICE=pdfwrite",
            "-sColorConversionStrategy=CMYK",
            "-dProcessColorModel=/DeviceCMYK",
            f"-sOutputFile={path.as_posix()}",
            ps.as_posix(),
        ],
        check=True,
        capture_output=True,
    )
    ps.unlink(missing_ok=True)


def _ebook_book(repo: Path, *, isbn: str = "9780000000808") -> Path:
    book_dir = repo / "books" / "ingram-pkg-ebook"
    book_dir.mkdir(parents=True)
    _write_cover(book_dir / "cover.png")
    (book_dir / "index.md").write_text("# Ch\n\nHello package.\n", encoding="utf-8")
    spec = {
        "version": 1,
        "publishing": {
            "enabled": True,
            "targets": {
                "ingramspark": {
                    "enabled": True,
                    "specification_profile": "ingramspark-2026-07",
                    "status": "planning",
                    "package": {"github_release": False, "immutable_release": False},
                    "ebook": {
                        "enabled": True,
                        "isbn": isbn,
                        "format": "reflowable",
                        "cover_source": "cover.png",
                    },
                    "print": {"enabled": False},
                }
            },
        },
        "book": {
            "id": "ingram-pkg-ebook",
            "title": "Package Ebook",
            "language": "en",
            "copyright_year": 2026,
            "author": {"name": "Test Author"},
            "title_page_cover": "cover.png",
        },
        "paths": {"manuscript": "./index.md", "output": "."},
        "frontmatter": {"generate": {"enabled": False}},
        "build": {"formats": {"epub": {"enabled": True}, "pdf": {"enabled": False}}},
        "github": {"release": False, "release_tag": "latest", "artifacts": ["epub"]},
    }
    (book_dir / "book.yml").write_text(yaml.safe_dump(spec, sort_keys=False), encoding="utf-8")
    return book_dir


def _print_book(repo: Path, *, isbn: str = "9780000000909", pages_meta: int = 1) -> Path:
    book_dir = repo / "books" / "ingram-pkg-print"
    assets = book_dir / "assets" / "ingramspark"
    assets.mkdir(parents=True)
    _write_wrap(assets / "cover-wrap.pdf")
    meta = {
        "page_count": pages_meta,
        "trim": {"width_inches": 6.0, "height_inches": 9.0},
        "binding": "perfect-bound",
        "paper": "cream",
        "color_mode": "black-and-white",
        "media_box": {"width_inches": 12.5, "height_inches": 9.25},
        "barcode_supplied": False,
        "spine_text": False,
    }
    (assets / "template-meta.yml").write_text(
        yaml.safe_dump(meta, sort_keys=False), encoding="utf-8"
    )
    (book_dir / "chapter-1.md").write_text("# One\n\nBody for print package.\n", encoding="utf-8")
    (book_dir / "index.md").write_text("# Title\n\n[One](chapter-1.md)\n", encoding="utf-8")
    spec = {
        "version": 1,
        "publishing": {
            "enabled": True,
            "targets": {
                "ingramspark": {
                    "enabled": True,
                    "specification_profile": "ingramspark-2026-07",
                    "status": "planning",
                    "package": {"github_release": False, "immutable_release": False},
                    "ebook": {"enabled": False},
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
                            "template_page_count": pages_meta,
                            "barcode_mode": "ingram-generated",
                        },
                    },
                }
            },
        },
        "book": {
            "id": "ingram-pkg-print",
            "title": "Package Print",
            "language": "en",
            "copyright_year": 2026,
            "author": {"name": "Test Author"},
        },
        "paths": {"manuscript": "./index.md", "output": "."},
        "frontmatter": {"generate": {"enabled": False}},
        "build": {"formats": {"pdf": {"enabled": False}}},
        "github": {"release": False, "release_tag": "latest", "artifacts": ["pdf"]},
    }
    (book_dir / "book.yml").write_text(yaml.safe_dump(spec, sort_keys=False), encoding="utf-8")
    return book_dir


def _combined_book(repo: Path) -> Path:
    book_dir = repo / "books" / "ingram-pkg-both"
    assets = book_dir / "assets" / "ingramspark"
    assets.mkdir(parents=True)
    _write_cover(book_dir / "cover.png")
    _write_wrap(assets / "cover-wrap.pdf")
    meta = {
        "page_count": 1,
        "trim": {"width_inches": 6.0, "height_inches": 9.0},
        "binding": "perfect-bound",
        "paper": "white",
        "color_mode": "black-and-white",
        "media_box": {"width_inches": 12.5, "height_inches": 9.25},
        "barcode_supplied": False,
        "spine_text": False,
    }
    (assets / "template-meta.yml").write_text(
        yaml.safe_dump(meta, sort_keys=False), encoding="utf-8"
    )
    (book_dir / "chapter-1.md").write_text("# One\n\nBoth modes.\n", encoding="utf-8")
    (book_dir / "index.md").write_text("# Title\n\n[One](chapter-1.md)\n", encoding="utf-8")
    spec = {
        "version": 1,
        "publishing": {
            "enabled": True,
            "targets": {
                "ingramspark": {
                    "enabled": True,
                    "specification_profile": "ingramspark-2026-07",
                    "status": "planning",
                    "package": {"github_release": False, "immutable_release": False},
                    "ebook": {
                        "enabled": True,
                        "isbn": "9780000001001",
                        "format": "reflowable",
                        "cover_source": "cover.png",
                    },
                    "print": {
                        "enabled": True,
                        "edition": "paperback",
                        "isbn": "9780000001002",
                        "binding": "perfect-bound",
                        "trim": {"width_inches": 6.0, "height_inches": 9.0},
                        "interior": {
                            "color_mode": "black-and-white",
                            "paper": "white",
                            "bleed": False,
                        },
                        "cover": {
                            "strategy": "supplied-wrap",
                            "source": "assets/ingramspark/cover-wrap.pdf",
                            "template_page_count": 1,
                            "barcode_mode": "ingram-generated",
                        },
                    },
                }
            },
        },
        "book": {
            "id": "ingram-pkg-both",
            "title": "Package Both",
            "language": "en",
            "copyright_year": 2026,
            "author": {"name": "Test Author"},
            "title_page_cover": "cover.png",
        },
        "paths": {"manuscript": "./index.md", "output": "."},
        "frontmatter": {"generate": {"enabled": False}},
        "build": {"formats": {"epub": {"enabled": True}, "pdf": {"enabled": False}}},
        "github": {"release": False, "release_tag": "latest", "artifacts": ["epub"]},
    }
    (book_dir / "book.yml").write_text(yaml.safe_dump(spec, sort_keys=False), encoding="utf-8")
    return book_dir


def _sync_template_pages(book_dir: Path, pages: int) -> None:
    """Update template-meta + book.yml template_page_count after interior export."""
    meta_path = book_dir / "assets" / "ingramspark" / "template-meta.yml"
    meta = yaml.safe_load(meta_path.read_text(encoding="utf-8"))
    meta["page_count"] = pages
    meta_path.write_text(yaml.safe_dump(meta, sort_keys=False), encoding="utf-8")
    spec_path = book_dir / "book.yml"
    spec = yaml.safe_load(spec_path.read_text(encoding="utf-8"))
    spec["publishing"]["targets"]["ingramspark"]["print"]["cover"]["template_page_count"] = pages
    spec_path.write_text(yaml.safe_dump(spec, sort_keys=False), encoding="utf-8")


@requires_ebook
def test_ebook_only_zip_layout_and_checksums(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _ebook_book(repo)
    spec = load_spec_for_book_dir(book_dir)
    os.environ["SOURCE_DATE_EPOCH"] = "1700000000"
    try:
        result = package_ingramspark(
            repo=repo,
            book_dir=book_dir,
            spec=spec,
            ebook_only=True,
            allow_cover_upscale=True,
            skip_epubcheck=True,
        )
    finally:
        os.environ.pop("SOURCE_DATE_EPOCH", None)

    assert result.zip_path.name == "ingram-pkg-ebook-ingramspark.zip"
    assert result.modes == ["ebook"]
    with zipfile.ZipFile(result.zip_path, "r") as zf:
        names = set(zf.namelist())
    assert "ebook/9780000000808.epub" in names
    assert "ebook/9780000000808.jpg" in names
    assert "ebook/preflight.json" in names
    assert "README-UPLOAD.txt" in names
    assert "package-manifest.json" in names
    assert "checksums.sha256" in names
    assert "metadata/tool-versions.json" in names
    assert not any(n.startswith("print/") for n in names)

    build_dir = result.zip_path.parent
    mismatches = verify_checksums_file(build_dir / "checksums.sha256", root=build_dir)
    assert mismatches == []

    manifest = json.loads((build_dir / "package-manifest.json").read_text(encoding="utf-8"))
    assert manifest["artifact_name"] == "ingram-pkg-ebook-ingramspark.zip"
    assert manifest["modes"] == ["ebook"]
    assert manifest["build_timestamp"] == "2023-11-14T22:13:20Z"
    assert "ebook/9780000000808.epub" in manifest["files"]


@requires_print
def test_print_only_zip_omits_ebook(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _print_book(repo, pages_meta=1)
    # First export to learn real page count, then sync template meta.
    from ingramspark.print_export import export_ingramspark_print_interior

    spec = load_spec_for_book_dir(book_dir)
    exported = export_ingramspark_print_interior(repo=repo, book_dir=book_dir, spec=spec)
    _sync_template_pages(book_dir, exported.page_count)
    spec = load_spec_for_book_dir(book_dir)

    result = package_ingramspark(
        repo=repo,
        book_dir=book_dir,
        spec=spec,
        print_only=True,
        skip_build=False,
        skip_epubcheck=True,
    )
    assert result.zip_path.name == "ingram-pkg-print-ingramspark.zip"
    with zipfile.ZipFile(result.zip_path, "r") as zf:
        names = set(zf.namelist())
        readme = zf.read("README-UPLOAD.txt").decode("utf-8")
    assert "print/9780000000909_txt.pdf" in names
    assert "print/9780000000909_cvr.pdf" in names
    assert "print/preflight.json" in names
    assert not any(n.startswith("ebook/") for n in names)
    assert "Print ISBN:" in readme
    assert "Interior (PDF):" in readme
    assert "Not included in this package." in readme  # ebook section

    manifest = result.manifest
    assert manifest["modes"] == ["print"]
    assert manifest["print"]["interior_page_count"] == exported.page_count
    assert manifest["isbns"]["print"] == "9780000000909"


@requires_print
@requires_ebook
def test_combined_package_contains_both_trees(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _combined_book(repo)
    from ingramspark.print_export import export_ingramspark_print_interior

    spec = load_spec_for_book_dir(book_dir)
    exported = export_ingramspark_print_interior(repo=repo, book_dir=book_dir, spec=spec)
    _sync_template_pages(book_dir, exported.page_count)
    spec = load_spec_for_book_dir(book_dir)

    result = package_ingramspark(
        repo=repo,
        book_dir=book_dir,
        spec=spec,
        allow_cover_upscale=True,
        skip_epubcheck=True,
    )
    assert set(result.modes) == {"ebook", "print"}
    with zipfile.ZipFile(result.zip_path, "r") as zf:
        names = set(zf.namelist())
    assert "ebook/9780000001001.epub" in names
    assert "ebook/9780000001001.jpg" in names
    assert "print/9780000001002_txt.pdf" in names
    assert "print/9780000001002_cvr.pdf" in names
    assert result.zip_path.name == "ingram-pkg-both-ingramspark.zip"


@requires_ebook
def test_package_cli_ebook_only(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    _ebook_book(repo, isbn="9780000001101")
    proc = subprocess.run(
        [
            sys.executable,
            str(_REPO / "scripts/package_ingramspark.py"),
            "--repo",
            str(repo),
            "--book-dir",
            "books/ingram-pkg-ebook",
            "--ebook-only",
            "--allow-cover-upscale",
            "--skip-epubcheck",
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    assert proc.returncode == 0, proc.stderr + proc.stdout
    zip_path = Path(proc.stdout.strip().splitlines()[-1])
    assert zip_path == package_zip_path(
        repo, load_spec_for_book_dir(repo / "books/ingram-pkg-ebook")
    )


def test_readme_maps_upload_fields() -> None:
    spec = {
        "book": {"title": "T", "author": {"name": "A"}},
        "publishing": {
            "targets": {
                "ingramspark": {
                    "ebook": {"isbn": "9780000001201"},
                    "print": {
                        "isbn": "9780000001202",
                        "edition": "paperback",
                        "binding": "perfect-bound",
                        "trim": {"width_inches": 6, "height_inches": 9},
                        "interior": {
                            "paper": "cream",
                            "color_mode": "black-and-white",
                            "bleed": False,
                        },
                        "cover": {"barcode_mode": "ingram-generated", "template_page_count": 10},
                    },
                }
            }
        },
    }
    text = write_readme_upload(
        spec=spec,
        profile_id="ingramspark-2026-07",
        modes=["ebook", "print"],
        warnings=["sample warning"],
        manual_review=["Check spine"],
        print_meta={"page_count": 10},
    )
    assert "ebook/9780000001201.epub" in text
    assert "print/9780000001202_txt.pdf" in text
    assert "print/9780000001202_cvr.pdf" in text
    assert "sample warning" in text
    assert "Check spine" in text


def test_verify_checksums_detects_mismatch(tmp_path: Path) -> None:
    root = tmp_path / "kit"
    root.mkdir()
    f = root / "ebook" / "a.epub"
    f.parent.mkdir(parents=True)
    f.write_bytes(b"abc")
    digest = hashlib.sha256(b"abc").hexdigest()
    (root / "checksums.sha256").write_text(f"{digest}  ebook/a.epub\n", encoding="utf-8")
    assert verify_checksums_file(root / "checksums.sha256", root=root) == []
    f.write_bytes(b"abcd")
    assert verify_checksums_file(root / "checksums.sha256", root=root)


convert = shutil.which("convert") or shutil.which("magick")
requires_im = pytest.mark.skipif(convert is None, reason="ImageMagick required")
requires_pillow = pytest.mark.skipif(
    __import__("importlib").util.find_spec("PIL") is None, reason="Pillow required"
)


@requires_pillow
@requires_im
def test_planning_cover_preview_zip_without_isbn(tmp_path: Path) -> None:
    from PIL import Image

    from ingramspark.template_meta import pixels_from_points

    repo = _temp_repo(tmp_path)
    book_dir = repo / "books" / "ingram-pkg-preview"
    assets = book_dir / "assets" / "ingramspark"
    assets.mkdir(parents=True)
    ppi = 72
    outside = 9.0
    top = 9.0
    bottom = 9.0
    spine_pt = 36.0
    trim_w = 6.0
    trim_h = 9.0
    box_w = 918.0
    box_h = 666.0
    back_w = pixels_from_points(outside + trim_w * 72, ppi)
    spine_w = pixels_from_points(spine_pt, ppi)
    front_w = pixels_from_points(trim_w * 72 + outside, ppi)
    height = pixels_from_points(box_h, ppi)
    for name, width, color in (
        ("back.png", back_w, (200, 40, 40)),
        ("spine.png", spine_w, (40, 200, 40)),
        ("front.png", front_w, (40, 40, 200)),
    ):
        Image.new("RGB", (width, height), color).save(assets / name, format="PNG", dpi=(ppi, ppi))
    meta = {
        "version": 1,
        "source": {"provider": "ingramspark", "template_file": "template.pdf"},
        "manufacturing": {
            "trim_width_inches": trim_w,
            "trim_height_inches": trim_h,
            "binding": "perfect-bound",
            "paper": "cream",
            "interior_color_mode": "black-and-white",
            "page_count": 100,
        },
        "geometry": {
            "media_box_width_points": box_w,
            "media_box_height_points": box_h,
            "spine_width_points": spine_pt,
            "outside_bleed_points": outside,
            "top_bleed_points": top,
            "bottom_bleed_points": bottom,
            "safe_inset_points": 18.0,
        },
        "raster": {
            "required_ppi": ppi,
            "full_wrap": {
                "expected_width_pixels": back_w + spine_w + front_w,
                "expected_height_pixels": height,
            },
            "components": {
                "back": {"expected_width_pixels": back_w, "expected_height_pixels": height},
                "spine": {"expected_width_pixels": spine_w, "expected_height_pixels": height},
                "front": {"expected_width_pixels": front_w, "expected_height_pixels": height},
            },
        },
        "barcode_supplied": False,
        "spine_text": False,
        "barcode_reserve": {
            "required": True,
            "panel": "back",
            "x_pixels": 40,
            "y_pixels": max(0, height - 9 - 72 - 40),
            "width_pixels": 126,
            "height_pixels": 72,
        },
    }
    (assets / "template-meta.yml").write_text(
        yaml.safe_dump(meta, sort_keys=False), encoding="utf-8"
    )
    (book_dir / "index.md").write_text("# Preview\n", encoding="utf-8")
    spec = {
        "version": 1,
        "publishing": {
            "enabled": True,
            "targets": {
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
                        "trim": {"width_inches": trim_w, "height_inches": trim_h},
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
            },
        },
        "book": {
            "id": "ingram-pkg-preview",
            "title": "Preview Book",
            "language": "en",
            "copyright_year": 2026,
            "author": {"name": "Test Author"},
        },
        "paths": {"manuscript": "./index.md", "output": "."},
        "frontmatter": {"generate": {"enabled": False}},
        "build": {"formats": {"epub": {"enabled": False}, "pdf": {"enabled": False}}},
        "github": {"release": False, "release_tag": "latest", "artifacts": ["epub"]},
    }
    (book_dir / "book.yml").write_text(yaml.safe_dump(spec, sort_keys=False), encoding="utf-8")
    loaded = load_spec_for_book_dir(book_dir)
    result = package_ingramspark(repo=repo, book_dir=book_dir, spec=loaded)
    assert result.zip_path.name == "ingram-pkg-preview-ingramspark-preview.zip"
    assert result.modes == ["print-cover-preview"]
    assert result.manifest.get("preview") is True
    assert result.manifest.get("isbns") == {}
    with zipfile.ZipFile(result.zip_path, "r") as zf:
        names = set(zf.namelist())
        readme = zf.read("README-UPLOAD.txt").decode("utf-8")
    assert "print/ingram-pkg-preview_cvr.pdf" in names
    assert "print-cover/preflight.json" in names
    assert "print-cover/inspection-overlay.png" in names
    assert "NOT FOR INGRAMSPARK UPLOAD" in readme
    assert not any("_txt.pdf" in n for n in names)
