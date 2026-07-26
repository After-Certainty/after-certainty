"""Assembled three-panel raster wrap (back|spine|front) → {isbn}_cvr.pdf."""

from __future__ import annotations

import json
import shutil
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
from ingramspark.raster_wrap import convert_raster_wrap  # noqa: E402
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

# Geometry: trim 6×9, outside/top/bottom bleed 9pt, spine 36pt → media 918×666
# At 72 ppi: back=441, spine=36, front=441, full=918 × 666
FIX_PPI = 72
FIX_OUTSIDE = 9.0
FIX_TOP = 9.0
FIX_BOTTOM = 9.0
FIX_SPINE_PT = 36.0
FIX_TRIM_W = 6.0
FIX_TRIM_H = 9.0
FIX_BOX_W = 918.0
FIX_BOX_H = 666.0
FIX_BACK_W = pixels_from_points(FIX_OUTSIDE + FIX_TRIM_W * 72, FIX_PPI)
FIX_SPINE_W = pixels_from_points(FIX_SPINE_PT, FIX_PPI)
FIX_FRONT_W = pixels_from_points(FIX_TRIM_W * 72 + FIX_OUTSIDE, FIX_PPI)
FIX_H = pixels_from_points(FIX_BOX_H, FIX_PPI)
FIX_FULL_W = FIX_BACK_W + FIX_SPINE_W + FIX_FRONT_W
FIX_ISBN = "9780000000515"


def _temp_repo(tmp_path: Path) -> Path:
    repo = tmp_path / "repo"
    repo.mkdir(parents=True)
    (repo / "schema").symlink_to(_REPO / "schema", target_is_directory=True)
    (repo / "tools").symlink_to(_REPO / "tools", target_is_directory=True)
    (repo / "scripts").symlink_to(_REPO / "scripts", target_is_directory=True)
    return repo


def _assembled_meta(
    *,
    page_count: int = 200,
    back_w: int = FIX_BACK_W,
    spine_w: int = FIX_SPINE_W,
    front_w: int = FIX_FRONT_W,
    height: int = FIX_H,
    full_w: int | None = None,
    include_reserve: bool = True,
    paper: str = "cream",
    color_mode: str = "black-and-white",
    trim_w: float = FIX_TRIM_W,
    spine_pt: float = FIX_SPINE_PT,
) -> dict:
    fw = full_w if full_w is not None else back_w + spine_w + front_w
    meta: dict = {
        "version": 1,
        "source": {"provider": "ingramspark", "template_file": "template.pdf"},
        "manufacturing": {
            "trim_width_inches": trim_w,
            "trim_height_inches": FIX_TRIM_H,
            "binding": "perfect-bound",
            "paper": paper,
            "interior_color_mode": color_mode,
            "page_count": page_count,
        },
        "geometry": {
            "media_box_width_points": FIX_BOX_W,
            "media_box_height_points": FIX_BOX_H,
            "spine_width_points": spine_pt,
            "outside_bleed_points": FIX_OUTSIDE,
            "top_bleed_points": FIX_TOP,
            "bottom_bleed_points": FIX_BOTTOM,
            "safe_inset_points": 18.0,
        },
        "raster": {
            "required_ppi": FIX_PPI,
            "full_wrap": {
                "expected_width_pixels": fw,
                "expected_height_pixels": height,
            },
            "components": {
                "back": {
                    "expected_width_pixels": back_w,
                    "expected_height_pixels": height,
                },
                "spine": {
                    "expected_width_pixels": spine_w,
                    "expected_height_pixels": height,
                },
                "front": {
                    "expected_width_pixels": front_w,
                    "expected_height_pixels": height,
                },
            },
        },
        "barcode_supplied": False,
        "spine_text": False,
    }
    if include_reserve:
        # 1.75×1.0 in at 72 ppi = 126×72; place in back trim area (top-left in panel)
        meta["barcode_reserve"] = {
            "required": True,
            "panel": "back",
            "x_pixels": 40,
            "y_pixels": FIX_H - 9 - 72 - 40,
            "width_pixels": 126,
            "height_pixels": 72,
        }
    return meta


def _write_panel(
    path: Path,
    *,
    width: int,
    height: int,
    color: tuple[int, int, int],
    edge_color: tuple[int, int, int] | None = None,
    transparent: bool = False,
    dpi: tuple[int, int] | None = (72, 72),
) -> None:
    from PIL import Image, ImageDraw

    path.parent.mkdir(parents=True, exist_ok=True)
    if transparent:
        im = Image.new("RGBA", (width, height), (*color, 0))
        for x in range(width // 2):
            for y in range(height):
                im.putpixel((x, y), (*color, 255))
    else:
        im = Image.new("RGB", (width, height), color)
        if edge_color is not None:
            draw = ImageDraw.Draw(im)
            draw.line([(width - 1, 0), (width - 1, height - 1)], fill=edge_color)
            draw.line([(0, 0), (0, height - 1)], fill=edge_color)
        # light barcode-ish block near bottom of back-sized panels
        if width == FIX_BACK_W:
            draw = ImageDraw.Draw(im)
            draw.rectangle(
                [40, FIX_H - 9 - 72 - 40, 40 + 126, FIX_H - 9 - 40],
                fill=(250, 250, 250),
            )
    kwargs = {"dpi": dpi} if dpi else {}
    im.save(path, format="PNG", **kwargs)


def _fixture_book(
    root: Path,
    *,
    meta: dict | None = None,
    back_w: int = FIX_BACK_W,
    spine_w: int = FIX_SPINE_W,
    front_w: int = FIX_FRONT_W,
    height: int = FIX_H,
    transparent_role: str | None = None,
    write_panels: bool = True,
    edge_marked: bool = False,
) -> Path:
    book_dir = root / "books" / "ingram-assembled-fixture"
    assets = book_dir / "assets" / "ingramspark"
    assets.mkdir(parents=True)
    meta = meta or _assembled_meta(back_w=back_w, spine_w=spine_w, front_w=front_w, height=height)
    (assets / "template-meta.yml").write_text(
        yaml.safe_dump(meta, sort_keys=False), encoding="utf-8"
    )
    if write_panels:
        _write_panel(
            assets / "back.png",
            width=back_w,
            height=height,
            color=(200, 40, 40),
            edge_color=(255, 0, 0) if edge_marked else None,
            transparent=transparent_role == "back",
        )
        _write_panel(
            assets / "spine.png",
            width=spine_w,
            height=height,
            color=(40, 200, 40),
            edge_color=(0, 255, 0) if edge_marked else None,
            transparent=transparent_role == "spine",
        )
        _write_panel(
            assets / "front.png",
            width=front_w,
            height=height,
            color=(40, 40, 200),
            edge_color=(0, 0, 255) if edge_marked else None,
            transparent=transparent_role == "front",
        )
    (book_dir / "index.md").write_text("# Assembled Fixture\n", encoding="utf-8")
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
                        "isbn": FIX_ISBN,
                        "binding": "perfect-bound",
                        "trim": {"width_inches": FIX_TRIM_W, "height_inches": FIX_TRIM_H},
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
                            "template_page_count": 200,
                            "barcode_mode": "ingram-generated",
                        },
                    },
                }
            },
        },
        "book": {
            "id": "ingram-assembled-fixture",
            "title": "Assembled Fixture",
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


def _page_count(repo: Path, pages: int = 200) -> None:
    path = repo / "build/ingramspark/ingram-assembled-fixture/print/page-count.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"page_count": pages}) + "\n", encoding="utf-8")


@requires_pillow
def test_component_geometry_constants() -> None:
    assert FIX_BACK_W + FIX_SPINE_W + FIX_FRONT_W == FIX_FULL_W == 918
    assert FIX_H == 666
    assert FIX_SPINE_W == 36


@requires_pillow
def test_meta_rejects_width_sum_mismatch() -> None:
    meta = _assembled_meta(front_w=FIX_FRONT_W + 1, full_w=FIX_FULL_W)
    with pytest.raises(TemplateMetaError, match="sum"):
        normalize_template_meta(meta)


@requires_pillow
def test_meta_rejects_height_mismatch() -> None:
    meta = _assembled_meta()
    meta["raster"]["components"]["spine"]["expected_height_pixels"] = FIX_H - 1
    with pytest.raises(TemplateMetaError, match="heights"):
        normalize_template_meta(meta)


@requires_pillow
@requires_im
def test_exact_panels_assemble_and_convert(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo, edge_marked=True)
    _page_count(repo)
    spec = load_spec_for_book_dir(book_dir)
    result = convert_raster_wrap(repo=repo, book_dir=book_dir, spec=spec)
    assert result.ok, result.errors
    assert result.strategy == "assembled-raster-wrap"
    assert result.assembly.get("panelOrder") == ["back", "spine", "front"]
    assert result.assembly.get("resampled") is False
    work = print_cover_work_dir(repo, spec)
    assert (work / "assembled-wrap-rgb.png").is_file()
    assert (work / "assembled-wrap-cmyk.tif").is_file()
    assert (work / "inspection-overlay.png").is_file()
    assert (work / "preflight.json").is_file()
    staged = print_cover_pdf_path(repo, spec)
    assert staged.is_file()
    assert staged.name == f"{FIX_ISBN}_cvr.pdf"
    # Source panels untouched
    assert (book_dir / "assets/ingramspark/back.png").stat().st_size > 0


@requires_pillow
@requires_im
def test_planning_without_isbn_stages_book_id_cover(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo)
    _page_count(repo)
    spec_path = book_dir / "book.yml"
    spec = yaml.safe_load(spec_path.read_text(encoding="utf-8"))
    del spec["publishing"]["targets"]["ingramspark"]["print"]["isbn"]
    spec_path.write_text(yaml.safe_dump(spec, sort_keys=False), encoding="utf-8")
    spec = load_spec_for_book_dir(book_dir)
    result = convert_raster_wrap(repo=repo, book_dir=book_dir, spec=spec)
    assert result.ok, result.errors
    staged = print_cover_pdf_path(repo, spec)
    assert staged.is_file()
    assert staged.name == "ingram-assembled-fixture_cvr.pdf"
    assert result.output.get("printIsbn") is None
    assert any("No print.isbn" in w for w in result.warnings)


@requires_pillow
def test_boundary_pixels_preserved(tmp_path: Path) -> None:
    from PIL import Image

    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo, edge_marked=True)
    _page_count(repo)
    spec = load_spec_for_book_dir(book_dir)
    result = convert_raster_wrap(repo=repo, book_dir=book_dir, spec=spec)
    # May fail color conversion without IM; assembly still runs if dims ok
    work = print_cover_work_dir(repo, spec)
    assembled = work / "assembled-wrap-rgb.png"
    if not assembled.is_file():
        pytest.skip("assembly did not complete")
    with Image.open(assembled) as im:
        mid = FIX_H // 2
        # Distinct edge colors from fixtures
        assert im.getpixel((FIX_BACK_W - 1, mid))[0] >= 200  # red-ish back edge
        assert im.getpixel((FIX_BACK_W, mid))[1] >= 200  # green-ish spine
    assert result.assembly.get("boundarySamplesMatch") is True


@pytest.mark.parametrize(
    "role,width,height",
    [
        ("back", FIX_BACK_W - 1, FIX_H),
        ("back", FIX_BACK_W + 1, FIX_H),
        ("spine", FIX_SPINE_W - 1, FIX_H),
        ("spine", FIX_SPINE_W + 1, FIX_H),
        ("front", FIX_FRONT_W - 1, FIX_H),
        ("front", FIX_FRONT_W + 1, FIX_H),
        ("front", FIX_FRONT_W // 2, FIX_H // 2),
    ],
)
@requires_pillow
def test_panel_dimension_failures(tmp_path: Path, role: str, width: int, height: int) -> None:
    repo = _temp_repo(tmp_path)
    # Meta expects correct sizes; only the written PNG is wrong.
    book_dir = _fixture_book(repo)
    path = book_dir / "assets" / "ingramspark" / f"{role}.png"
    _write_panel(path, width=width, height=height, color=(10, 10, 10))
    _page_count(repo)
    spec = load_spec_for_book_dir(book_dir)
    result = convert_raster_wrap(repo=repo, book_dir=book_dir, spec=spec)
    assert not result.ok
    blob = "\n".join(result.errors)
    assert "will not scale" in blob or "stale" in blob.lower() or "dimensions" in blob.lower()


@requires_pillow
def test_height_mismatch_fails(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo)
    # Rewrite spine with wrong height but keep meta expecting correct height
    _write_panel(
        book_dir / "assets/ingramspark/spine.png",
        width=FIX_SPINE_W,
        height=FIX_H - 10,
        color=(0, 200, 0),
    )
    _page_count(repo)
    spec = load_spec_for_book_dir(book_dir)
    result = convert_raster_wrap(repo=repo, book_dir=book_dir, spec=spec)
    assert not result.ok
    assert any("Spine" in e or "spine" in e for e in result.errors)


@requires_pillow
def test_stale_spine_message(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo)
    _write_panel(
        book_dir / "assets/ingramspark/spine.png",
        width=FIX_SPINE_W + 8,
        height=FIX_H,
        color=(0, 200, 0),
    )
    _page_count(repo)
    spec = load_spec_for_book_dir(book_dir)
    result = convert_raster_wrap(repo=repo, book_dir=book_dir, spec=spec)
    assert any("stale" in e.lower() and "240" not in e for e in result.errors)
    assert any("200 pages" in e for e in result.errors)


@pytest.mark.parametrize("role", ["back", "spine", "front"])
@requires_pillow
def test_transparent_panel_fails(tmp_path: Path, role: str) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo, transparent_role=role)
    _page_count(repo)
    spec = load_spec_for_book_dir(book_dir)
    result = convert_raster_wrap(repo=repo, book_dir=book_dir, spec=spec)
    assert not result.ok
    assert any("transparent" in e.lower() for e in result.errors)


@requires_pillow
def test_missing_panel_fails(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo)
    (book_dir / "assets/ingramspark/front.png").unlink()
    _page_count(repo)
    with pytest.raises(ValueError, match="assets.front"):
        load_spec_for_book_dir(book_dir)


@requires_pillow
def test_barcode_reserve_crossing_spine_fails(tmp_path: Path) -> None:
    meta = _assembled_meta()
    # Place reserve so it extends past back width in pixels
    meta["barcode_reserve"] = {
        "required": True,
        "panel": "back",
        "x_pixels": FIX_BACK_W - 20,
        "y_pixels": 100,
        "width_pixels": 126,
        "height_pixels": 72,
    }
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo, meta=meta)
    _page_count(repo)
    spec = load_spec_for_book_dir(book_dir)
    result = convert_raster_wrap(repo=repo, book_dir=book_dir, spec=spec)
    assert not result.ok
    assert any("spine" in e.lower() or "back-cover panel" in e.lower() for e in result.errors)


@requires_pillow
def test_barcode_reserve_too_small_warns(tmp_path: Path) -> None:
    meta = _assembled_meta()
    meta["barcode_reserve"] = {
        "required": True,
        "panel": "back",
        "x_pixels": 40,
        "y_pixels": 100,
        "width_pixels": 50,
        "height_pixels": 40,
    }
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo, meta=meta)
    _page_count(repo)
    spec = load_spec_for_book_dir(book_dir)
    result = convert_raster_wrap(repo=repo, book_dir=book_dir, spec=spec)
    assert any("smaller than the approved minimum" in w for w in result.warnings)
    assert not any("smaller than the approved minimum" in e for e in result.errors)


@requires_pillow
def test_website_exclusion(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo)
    spec = load_spec_for_book_dir(book_dir)
    assert "ingramspark" not in spec_formats(spec)
    entry = format_entry("o/r", "latest", "epub", "ingram-assembled-fixture", True)
    assert "ingramspark" not in entry
    book_entry = build_book_entry(
        repo=repo,
        spec_path=book_dir / "book.yml",
        spec=spec,
        repo_slug="o/r",
        ref="main",
        release_tag="latest",
        source="books",
        status="published",
    )
    assert "ingramspark" not in book_entry
    assert "back.png" not in json.dumps(book_entry)


@requires_pillow
def test_schema_accepts_assembled_strategy(tmp_path: Path) -> None:
    from book_specs import load_book_spec, validate_book_spec

    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo)
    loaded = load_book_spec(book_dir / "book.yml")
    validate_book_spec(loaded, book_dir / "book.yml")
    assert (
        loaded["publishing"]["targets"]["ingramspark"]["print"]["cover"]["strategy"]
        == "assembled-raster-wrap"
    )


@requires_pillow
def test_no_production_book_opted_in() -> None:
    """Only planning cover-preview opt-ins (no print ISBN) are allowed in books/."""
    for book_yml in (_REPO / "books").glob("*/book.yml"):
        data = yaml.safe_load(book_yml.read_text(encoding="utf-8")) or {}
        ingram = ((data.get("publishing") or {}).get("targets") or {}).get("ingramspark") or {}
        if ingram.get("enabled") is not True:
            continue
        assert ingram.get("status") == "planning", book_yml
        print_cfg = ingram.get("print") or {}
        assert print_cfg.get("enabled") is True, book_yml
        assert not str(print_cfg.get("isbn") or "").strip(), book_yml
        assert (ingram.get("package") or {}).get("github_release") is not True, book_yml
        assert (ingram.get("package") or {}).get("immutable_release") is not True, book_yml


@requires_pillow
@requires_im
def test_overlay_has_panel_guides_not_in_production_pdf(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo)
    _page_count(repo)
    spec = load_spec_for_book_dir(book_dir)
    result = convert_raster_wrap(repo=repo, book_dir=book_dir, spec=spec)
    assert result.ok
    overlay = print_cover_work_dir(repo, spec) / "inspection-overlay.png"
    assembled = print_cover_work_dir(repo, spec) / "assembled-wrap-rgb.png"
    # Overlay exists and differs from production assembled RGB (guides drawn)
    assert (
        overlay.stat().st_size != assembled.stat().st_size
        or overlay.read_bytes() != assembled.read_bytes()
    )
