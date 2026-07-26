"""Raster full-wrap PNG → {isbn}_cvr.pdf conversion and validation."""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

import pytest
import yaml

_REPO = Path(__file__).resolve().parents[1]
_TOOLS = _REPO / "tools"
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from book_specs import load_spec_for_book_dir, spec_formats  # noqa: E402
from ingramspark.paths import print_cover_pdf_path, print_cover_work_dir  # noqa: E402
from ingramspark.raster_wrap import (  # noqa: E402
    convert_raster_wrap,
    convert_raster_wrap_or_raise,
    dimension_mismatch_message,
    inspect_png,
)
from ingramspark.template_meta import (  # noqa: E402
    TemplateMetaError,
    normalize_template_meta,
    pixels_from_points,
)
from manifest_books import build_book_entry, format_entry  # noqa: E402

convert = shutil.which("convert") or shutil.which("magick")
requires_im = pytest.mark.skipif(convert is None, reason="ImageMagick required")
requires_pillow = pytest.mark.skipif(
    __import__("importlib").util.find_spec("PIL") is None, reason="Pillow required"
)

# Synthetic geometry consistent with trim + spine + bleed (back|spine|front):
# media_w = 2*9 + 2*(6*72) + 36 = 918 pt; media_h = 9*72 + 2*9 = 666 pt
# At 72 ppi: round(12.75*72)=918 × round(9.25*72)=666 (small enough for unit tests)
FIX_W = 918
FIX_H = 666
FIX_PPI = 72
FIX_BOX_W_PT = 918.0
FIX_BOX_H_PT = 666.0
FIX_SPINE_PT = 36.0
FIX_BLEED_PT = 9.0
FIX_TRIM_W = 6.0
FIX_TRIM_H = 9.0
# Fixture ISBN pattern used elsewhere; not a production title ISBN.
FIX_ISBN = "9780000000505"


def _temp_repo(tmp_path: Path) -> Path:
    repo = tmp_path / "repo"
    repo.mkdir(parents=True)
    (repo / "schema").symlink_to(_REPO / "schema", target_is_directory=True)
    (repo / "tools").symlink_to(_REPO / "tools", target_is_directory=True)
    (repo / "scripts").symlink_to(_REPO / "scripts", target_is_directory=True)
    return repo


def _write_png(
    path: Path,
    *,
    width: int,
    height: int,
    mode: str = "RGB",
    color: tuple = (40, 80, 120),
    dpi: tuple[int, int] | None = None,
    transparent: bool = False,
) -> None:
    from PIL import Image

    path.parent.mkdir(parents=True, exist_ok=True)
    if mode == "RGBA" or transparent:
        im = Image.new("RGBA", (width, height), (*color[:3], 0 if transparent else 255))
        if transparent:
            # Opaque left half, transparent right half
            for x in range(width // 2):
                for y in range(height):
                    im.putpixel((x, y), (*color[:3], 255))
    elif mode == "L":
        im = Image.new("L", (width, height), color[0] if color else 128)
    elif mode == "P":
        im = Image.new("P", (width, height), 1)
        im.putpalette([0, 0, 0, 255, 0, 0] + [0] * (256 * 3 - 6))
    else:
        im = Image.new("RGB", (width, height), color[:3])
        # Paint a light barcode reserve region (bottom of back cover).
        # Back panel ≈ left (bleed+trim)/media * width
        from PIL import ImageDraw

        draw = ImageDraw.Draw(im)
        # Approximate reserve in pixels for default meta (x=36pt, y=36pt).
        rx0 = int(36 / FIX_BOX_W_PT * width)
        ry1 = height - int(36 / FIX_BOX_H_PT * height)
        rw = int(1.75 * FIX_PPI)
        rh = int(1.0 * FIX_PPI)
        draw.rectangle([rx0, ry1 - rh, rx0 + rw, ry1], fill=(250, 250, 250))
    save_kwargs: dict = {}
    if dpi is not None:
        save_kwargs["dpi"] = dpi
    im.save(path, format="PNG", **save_kwargs)


def _raster_meta(
    *,
    page_count: int = 200,
    expected_w: int = FIX_W,
    expected_h: int = FIX_H,
    ppi: int = FIX_PPI,
    box_w: float = FIX_BOX_W_PT,
    box_h: float = FIX_BOX_H_PT,
    include_reserve: bool = True,
    trim_w: float = FIX_TRIM_W,
    trim_h: float = FIX_TRIM_H,
    binding: str = "perfect-bound",
    paper: str = "cream",
    color_mode: str = "black-and-white",
) -> dict:
    meta: dict = {
        "version": 1,
        "source": {"provider": "ingramspark", "template_file": "ingram-cover-template.pdf"},
        "manufacturing": {
            "trim_width_inches": trim_w,
            "trim_height_inches": trim_h,
            "binding": binding,
            "paper": paper,
            "interior_color_mode": color_mode,
            "page_count": page_count,
        },
        "geometry": {
            "media_box_width_points": box_w,
            "media_box_height_points": box_h,
            "spine_width_points": FIX_SPINE_PT,
            "bleed_points": FIX_BLEED_PT,
            "safe_inset_points": 18.0,
        },
        "raster": {
            "required_ppi": ppi,
            "expected_width_pixels": expected_w,
            "expected_height_pixels": expected_h,
        },
        "barcode_supplied": False,
        "spine_text": False,
    }
    if include_reserve:
        meta["barcode_reserve"] = {
            "required": True,
            "width_inches": 1.75,
            "height_inches": 1.0,
            "x_points": 36.0,
            "y_points": 36.0,
        }
    return meta


def _fixture_book(
    root: Path,
    *,
    isbn: str = FIX_ISBN,
    width: int = FIX_W,
    height: int = FIX_H,
    dpi: tuple[int, int] | None = (72, 72),
    transparent: bool = False,
    mode: str = "RGB",
    meta: dict | None = None,
    write_png: bool = True,
    template_page_count: int = 200,
) -> Path:
    book_dir = root / "books" / "ingram-raster-fixture"
    assets = book_dir / "assets" / "ingramspark"
    assets.mkdir(parents=True)
    if write_png:
        _write_png(
            assets / "full-wrap.png",
            width=width,
            height=height,
            mode=mode,
            dpi=dpi,
            transparent=transparent,
        )
    (assets / "template-meta.yml").write_text(
        yaml.safe_dump(meta or _raster_meta(page_count=template_page_count), sort_keys=False),
        encoding="utf-8",
    )
    (book_dir / "index.md").write_text("# Raster Fixture\n", encoding="utf-8")
    (book_dir / "cover.png").write_bytes(b"x")
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
                        "trim": {"width_inches": FIX_TRIM_W, "height_inches": FIX_TRIM_H},
                        "interior": {
                            "color_mode": "black-and-white",
                            "paper": "cream",
                            "bleed": False,
                        },
                        "cover": {
                            "strategy": "raster-wrap",
                            "source": "assets/ingramspark/full-wrap.png",
                            "template_metadata": "assets/ingramspark/template-meta.yml",
                            "template_page_count": template_page_count,
                            "barcode_mode": "ingram-generated",
                        },
                    },
                }
            },
        },
        "book": {
            "id": "ingram-raster-fixture",
            "title": "Ingram Raster Fixture",
            "language": "en",
            "copyright_year": 2026,
            "author": {"name": "Test Author"},
        },
        "paths": {"manuscript": "./index.md", "output": "."},
        "build": {"formats": {"epub": {"enabled": False}, "pdf": {"enabled": False}}},
        "frontmatter": {"generate": {"enabled": False}},
        "github": {"release": False, "release_tag": "latest", "artifacts": ["epub"]},
    }
    (book_dir / "book.yml").write_text(yaml.safe_dump(spec, sort_keys=False), encoding="utf-8")
    return book_dir


def _write_page_count(repo: Path, book_id: str, pages: int) -> None:
    path = repo / "build" / "ingramspark" / book_id / "print" / "page-count.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"page_count": pages}) + "\n", encoding="utf-8")


@requires_pillow
def test_pixels_from_points_rounding() -> None:
    assert pixels_from_points(FIX_BOX_W_PT, FIX_PPI) == FIX_W
    assert pixels_from_points(FIX_BOX_H_PT, FIX_PPI) == FIX_H


@requires_pillow
def test_normalize_rejects_inconsistent_pixels() -> None:
    raw = _raster_meta(expected_w=FIX_W + 1)
    with pytest.raises(TemplateMetaError, match="inconsistent"):
        normalize_template_meta(raw)


@requires_pillow
@requires_im
def test_exact_match_passes(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo)
    _write_page_count(repo, "ingram-raster-fixture", 200)
    spec = load_spec_for_book_dir(book_dir)
    result = convert_raster_wrap_or_raise(repo=repo, book_dir=book_dir, spec=spec)
    assert result.ok
    assert result.staged_cover_path == print_cover_pdf_path(repo, spec)
    assert result.staged_cover_path.is_file()
    assert result.staged_cover_path.name == f"{FIX_ISBN}_cvr.pdf"
    assert (print_cover_work_dir(repo, spec) / "preflight.json").is_file()
    assert (print_cover_work_dir(repo, spec) / "preflight.txt").is_file()
    assert (print_cover_work_dir(repo, spec) / "inspection-overlay.png").is_file()
    assert result.output["pageCount"] == 1
    assert abs(float(result.output["mediaBoxWidthPoints"]) - FIX_BOX_W_PT) < 0.05
    assert abs(float(result.output["mediaBoxHeightPoints"]) - FIX_BOX_H_PT) < 0.05


@requires_pillow
def test_undersized_1536x1024_fails(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo, width=1536, height=1024, dpi=(300, 300))
    _write_page_count(repo, "ingram-raster-fixture", 200)
    spec = load_spec_for_book_dir(book_dir)
    result = convert_raster_wrap(repo=repo, book_dir=book_dir, spec=spec)
    assert not result.ok
    assert any("Raster wrap dimensions do not match" in e for e in result.errors)
    assert not print_cover_pdf_path(repo, spec).exists()


@pytest.mark.parametrize(
    "width,height",
    [
        (FIX_W - 1, FIX_H),
        (FIX_W + 1, FIX_H),
        (FIX_W, FIX_H - 1),
        (FIX_W, FIX_H + 1),
        (FIX_W - 1, FIX_H - 1),
        (459, 333),  # ~correct ratio but half resolution
    ],
)
@requires_pillow
def test_dimension_mismatches_fail(tmp_path: Path, width: int, height: int) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo, width=width, height=height)
    _write_page_count(repo, "ingram-raster-fixture", 200)
    spec = load_spec_for_book_dir(book_dir)
    result = convert_raster_wrap(repo=repo, book_dir=book_dir, spec=spec)
    assert not result.ok
    blob = "\n".join(result.errors)
    assert "will not stretch" in blob or "Raster wrap dimensions" in blob


@requires_pillow
def test_wrong_embedded_dpi_but_correct_pixels_passes_dimensions(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo, dpi=(72, 72))
    _write_page_count(repo, "ingram-raster-fixture", 200)
    spec = load_spec_for_book_dir(book_dir)
    # Skip full convert if no ImageMagick; still assert dimension check path via inspect
    info = inspect_png(book_dir / "assets/ingramspark/full-wrap.png")
    assert info["widthPixels"] == FIX_W
    assert info["embeddedDpi"] is not None
    assert abs(info["embeddedDpi"][0] - 72.0) < 0.1
    assert abs(info["embeddedDpi"][1] - 72.0) < 0.1
    if convert:
        result = convert_raster_wrap(repo=repo, book_dir=book_dir, spec=spec)
        assert any(c.id == "raster-dimensions" and c.status == "passed" for c in result.checks)


@requires_pillow
def test_correct_embedded_dpi_wrong_pixels_fails(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo, width=200, height=150, dpi=(FIX_PPI, FIX_PPI))
    _write_page_count(repo, "ingram-raster-fixture", 200)
    spec = load_spec_for_book_dir(book_dir)
    result = convert_raster_wrap(repo=repo, book_dir=book_dir, spec=spec)
    assert not result.ok


@requires_pillow
def test_portrait_source_vs_landscape_template_fails(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo, width=FIX_H, height=FIX_W)
    _write_page_count(repo, "ingram-raster-fixture", 200)
    spec = load_spec_for_book_dir(book_dir)
    result = convert_raster_wrap(repo=repo, book_dir=book_dir, spec=spec)
    assert any("orientation" in e.lower() for e in result.errors)


@requires_pillow
def test_transparent_pixels_fail(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo, transparent=True)
    _write_page_count(repo, "ingram-raster-fixture", 200)
    spec = load_spec_for_book_dir(book_dir)
    result = convert_raster_wrap(repo=repo, book_dir=book_dir, spec=spec)
    assert not result.ok
    assert any("transparent" in e.lower() for e in result.errors)


@requires_pillow
def test_alpha_fully_opaque_ok_for_dimensions(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo, mode="RGBA", transparent=False)
    _write_page_count(repo, "ingram-raster-fixture", 200)
    info = inspect_png(book_dir / "assets/ingramspark/full-wrap.png")
    assert info["hasAlpha"] is True
    assert info["hasTransparentPixels"] is False


@requires_pillow
def test_indexed_png_fails(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo, mode="P")
    _write_page_count(repo, "ingram-raster-fixture", 200)
    spec = load_spec_for_book_dir(book_dir)
    result = convert_raster_wrap(repo=repo, book_dir=book_dir, spec=spec)
    assert any("Indexed" in e or "palette" in e.lower() for e in result.errors)


@requires_pillow
def test_non_png_fails(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo, write_png=False)
    jpg = book_dir / "assets/ingramspark/full-wrap.jpg"
    _write_png(jpg.with_suffix(".png"), width=FIX_W, height=FIX_H)
    # Write a fake jpg path by renaming content incorrectly
    (book_dir / "assets/ingramspark/full-wrap.png").unlink(missing_ok=True)
    jpg.write_bytes(b"not-a-png")
    # Point source at jpg via book.yml rewrite
    spec_path = book_dir / "book.yml"
    data = yaml.safe_load(spec_path.read_text(encoding="utf-8"))
    data["publishing"]["targets"]["ingramspark"]["print"]["cover"]["source"] = (
        "assets/ingramspark/full-wrap.jpg"
    )
    spec_path.write_text(yaml.safe_dump(data, sort_keys=False), encoding="utf-8")
    _write_page_count(repo, "ingram-raster-fixture", 200)
    spec = load_spec_for_book_dir(book_dir)
    result = convert_raster_wrap(repo=repo, book_dir=book_dir, spec=spec)
    assert any("Non-PNG" in e for e in result.errors)


@requires_pillow
def test_corrupt_png_fails(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo, write_png=False)
    bad = book_dir / "assets/ingramspark/full-wrap.png"
    bad.parent.mkdir(parents=True, exist_ok=True)
    bad.write_bytes(b"\x89PNG\r\n\x1a\ncorrupt")
    _write_page_count(repo, "ingram-raster-fixture", 200)
    spec = load_spec_for_book_dir(book_dir)
    result = convert_raster_wrap(repo=repo, book_dir=book_dir, spec=spec)
    assert any("Corrupt" in e or "unreadable" in e for e in result.errors)


@requires_pillow
@pytest.mark.parametrize(
    "mutate,needle",
    [
        (lambda m: m["raster"].pop("expected_width_pixels"), "schema validation failed"),
        (lambda m: m["raster"].pop("expected_height_pixels"), "schema validation failed"),
        (lambda m: m["raster"].__setitem__("required_ppi", 10), "schema validation failed"),
    ],
)
def test_metadata_schema_failures(tmp_path: Path, mutate, needle: str) -> None:
    repo = _temp_repo(tmp_path)
    meta = _raster_meta()
    mutate(meta)
    book_dir = _fixture_book(repo, meta=meta)
    _write_page_count(repo, "ingram-raster-fixture", 200)
    spec = load_spec_for_book_dir(book_dir)
    result = convert_raster_wrap(repo=repo, book_dir=book_dir, spec=spec)
    assert not result.ok
    assert needle.lower() in "\n".join(result.errors).lower()


@requires_pillow
def test_page_count_trim_paper_color_mismatches(tmp_path: Path) -> None:
    cases = [
        ("pages", _raster_meta(page_count=180), "pages"),
        ("trim", _raster_meta(trim_w=5.0), "trim"),
        (
            "paper",
            {
                **_raster_meta(),
                "manufacturing": {**_raster_meta()["manufacturing"], "paper": "white"},
            },
            "paper",
        ),
        (
            "color",
            {
                **_raster_meta(),
                "manufacturing": {
                    **_raster_meta()["manufacturing"],
                    "interior_color_mode": "color",
                },
            },
            "color_mode",
        ),
    ]
    for label, meta, needle in cases:
        sub = _temp_repo(tmp_path / label)
        book_dir = _fixture_book(sub, meta=meta)
        _write_page_count(sub, "ingram-raster-fixture", 200)
        spec = load_spec_for_book_dir(book_dir)
        result = convert_raster_wrap(repo=sub, book_dir=book_dir, spec=spec)
        assert not result.ok, label
        assert needle in "\n".join(result.errors).lower(), label


@requires_pillow
@requires_im
def test_script_and_make_style_cli(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo)
    _write_page_count(repo, "ingram-raster-fixture", 200)
    proc = subprocess.run(
        [
            sys.executable,
            str(_REPO / "scripts/convert_ingramspark_print_cover.py"),
            "--repo",
            str(repo),
            "--book-dir",
            str(book_dir.relative_to(repo)),
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    assert proc.returncode == 0, proc.stderr + proc.stdout
    assert f"{FIX_ISBN}_cvr.pdf" in proc.stdout


@requires_pillow
@requires_im
def test_cover_validate_raster_strategy(tmp_path: Path) -> None:
    from ingramspark.cover_validate import validate_print_cover_or_raise

    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo)
    _write_page_count(repo, "ingram-raster-fixture", 200)
    spec = load_spec_for_book_dir(book_dir)
    result = validate_print_cover_or_raise(repo=repo, book_dir=book_dir, spec=spec)
    assert result.ok
    assert result.strategy == "raster-wrap"
    assert result.staged_cover_path is not None


@requires_pillow
def test_website_manifest_excludes_raster_cover_output(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo)
    spec_path = book_dir / "book.yml"
    spec = load_spec_for_book_dir(book_dir)
    assert "ingramspark" not in spec_formats(spec)
    out = print_cover_pdf_path(repo, spec)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(b"%PDF-1.4 fixture")
    entry = format_entry(
        "owner/repo",
        "latest",
        "epub",
        "ingram-raster-fixture",
        True,
        include_release_url=True,
    )
    assert set(entry.keys()) == {"enabled", "file", "url"}
    book_entry = build_book_entry(
        repo=repo,
        spec_path=spec_path,
        spec=spec,
        repo_slug="owner/repo",
        ref="main",
        release_tag="latest",
        source="books",
        status="published",
    )
    assert "ingramspark" not in book_entry
    blob = json.dumps(book_entry)
    assert f"{FIX_ISBN}_cvr.pdf" not in blob
    assert "full-wrap.png" not in blob
    assert str(out.relative_to(repo)).startswith("build/ingramspark/")


@requires_pillow
def test_dimension_mismatch_message_mentions_axes() -> None:
    msg = dimension_mismatch_message(
        source_path=Path("assets/ingramspark/full-wrap.png"),
        width=1536,
        height=1024,
        expected_w=FIX_W,
        expected_h=FIX_H,
        required_ppi=FIX_PPI,
    )
    assert "1536 × 1024" in msg
    assert "width and height" in msg


@requires_pillow
def test_schema_accepts_raster_wrap_strategy(tmp_path: Path) -> None:
    from book_specs import load_book_spec, validate_book_spec

    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo)
    loaded = load_book_spec(book_dir / "book.yml")
    validate_book_spec(loaded, book_dir / "book.yml")
    assert (
        loaded["publishing"]["targets"]["ingramspark"]["print"]["cover"]["strategy"]
        == "raster-wrap"
    )


@requires_pillow
def test_no_production_book_opted_in() -> None:
    """Only planning cover-preview opt-ins (no print ISBN) are allowed in books/."""
    for book_yml in (_REPO / "books").glob("*/book.yml"):
        data = yaml.safe_load(book_yml.read_text(encoding="utf-8")) or {}
        targets = (data.get("publishing") or {}).get("targets") or {}
        ingram = targets.get("ingramspark") or {}
        if ingram.get("enabled") is not True:
            continue
        assert ingram.get("status") == "planning", book_yml
        print_cfg = ingram.get("print") or {}
        assert print_cfg.get("enabled") is True, book_yml
        assert not str(print_cfg.get("isbn") or "").strip(), book_yml
        assert (ingram.get("package") or {}).get("github_release") is not True, book_yml
        assert (ingram.get("package") or {}).get("immutable_release") is not True, book_yml
