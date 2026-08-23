"""Sync assembled print-cover geometry to the measured interior page count."""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml
from PIL import Image

from after_certainty.ingramspark.template_meta import (
    load_raw_template_meta,
    normalize_template_meta,
    pixels_from_inches,
)
from after_certainty.specs.book_specs import spec_ingramspark_target

# Inches of spine bulk per page (common cream/white paperback rules of thumb).
_PAPER_BULK_INCHES_PER_PAGE = {
    "cream": 0.0025,
    "white": 0.002252,
}


class CoverPageSyncError(ValueError):
    pass


@dataclass(frozen=True)
class CoverPageSyncResult:
    changed: bool
    page_count: int
    spine_width_pixels: int
    spine_width_points: float
    media_box_width_points: float
    full_wrap_width_pixels: int
    message: str


def _as_dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def paper_bulk_inches_per_page(paper: str) -> float:
    key = str(paper or "").strip().lower()
    if key not in _PAPER_BULK_INCHES_PER_PAGE:
        raise CoverPageSyncError(
            f"Unknown print paper {paper!r} for spine bulk; expected one of "
            f"{sorted(_PAPER_BULK_INCHES_PER_PAGE)}"
        )
    return _PAPER_BULK_INCHES_PER_PAGE[key]


def cream_spine_pixels(page_count: int, *, paper: str = "cream", ppi: int = 300) -> int:
    if page_count < 1:
        raise CoverPageSyncError(f"page_count must be >= 1 (got {page_count})")
    inches = page_count * paper_bulk_inches_per_page(paper)
    return pixels_from_inches(inches, ppi)


def _round_points(value: float) -> float:
    return round(float(value), 2)


def sync_assembled_cover_to_page_count(
    *,
    book_dir: Path,
    spec: dict[str, Any],
    page_count: int,
    spine_source_name: str = "spine-source.png",
) -> CoverPageSyncResult:
    """
    Update book.yml template_page_count, template-meta geometry, and spine.png.

    Used after print interior export so packaging matches the measured (and
    even-padded) page count across environments that paginate differently.
    Requires ``assets/ingramspark/spine-source.png`` at least as wide as the
    derived spine.
    """
    print_cfg = _as_dict(spec_ingramspark_target(spec).get("print"))
    cover = _as_dict(print_cfg.get("cover"))
    strategy = str(cover.get("strategy") or "").strip()
    if strategy != "assembled-raster-wrap":
        return CoverPageSyncResult(
            changed=False,
            page_count=page_count,
            spine_width_pixels=0,
            spine_width_points=0.0,
            media_box_width_points=0.0,
            full_wrap_width_pixels=0,
            message=f"cover strategy {strategy!r} does not auto-sync page count",
        )

    current = cover.get("template_page_count")
    if isinstance(current, int) and current == page_count:
        return CoverPageSyncResult(
            changed=False,
            page_count=page_count,
            spine_width_pixels=0,
            spine_width_points=0.0,
            media_box_width_points=0.0,
            full_wrap_width_pixels=0,
            message="template_page_count already matches measured interior",
        )

    meta_rel = str(cover.get("template_metadata") or "assets/ingramspark/template-meta.yml")
    meta_path = (book_dir / meta_rel).resolve()
    if not meta_path.is_file():
        raise CoverPageSyncError(f"template-meta not found: {meta_rel}")

    raw = load_raw_template_meta(meta_path)
    meta = normalize_template_meta(raw)
    if meta.required_ppi is None:
        raise CoverPageSyncError("template-meta is missing raster.required_ppi")
    ppi = int(meta.required_ppi)

    interior = _as_dict(print_cfg.get("interior"))
    paper = str(interior.get("paper") or raw.get("manufacturing", {}).get("paper") or "cream")
    spine_px = cream_spine_pixels(page_count, paper=paper, ppi=ppi)
    spine_pt = _round_points(spine_px / ppi * 72.0)

    assets = _as_dict(cover.get("assets"))
    spine_rel = str(assets.get("spine") or "assets/ingramspark/spine.png")
    spine_path = (book_dir / spine_rel).resolve()
    source_path = spine_path.parent / spine_source_name
    if not source_path.is_file():
        raise CoverPageSyncError(
            f"Missing {source_path.relative_to(book_dir)} needed to recrop spine for "
            f"{page_count} pages ({spine_px}px). Commit the uncropped spine master."
        )

    source = Image.open(source_path).convert("RGB")
    src_w, src_h = source.size
    if spine_px > src_w:
        raise CoverPageSyncError(
            f"spine-source.png is only {src_w}px wide but {page_count} cream pages need "
            f"{spine_px}px; supply a wider master"
        )
    if src_h < 1:
        raise CoverPageSyncError("spine-source.png has invalid height")

    left = (src_w - spine_px) // 2
    cropped = source.crop((left, 0, left + spine_px, src_h))
    # Preserve designed height from template-meta when present.
    expected_h = None
    if meta.components and "spine" in meta.components:
        expected_h = meta.components["spine"].height
    if expected_h is not None and cropped.size[1] != expected_h:
        cropped = cropped.resize((spine_px, expected_h), Image.Resampling.LANCZOS)
    cropped.save(spine_path, format="PNG", dpi=source.info.get("dpi", (ppi, ppi)))

    back_w = meta.components["back"].width if meta.components else None
    front_w = meta.components["front"].width if meta.components else None
    if back_w is None or front_w is None:
        raise CoverPageSyncError("template-meta raster.components back/front required")
    height = meta.components["back"].height
    full_w = back_w + spine_px + front_w
    media_w = _round_points(full_w / ppi * 72.0)
    media_h = float(meta.media_box_height_points)
    mfg = dict(_as_dict(raw.get("manufacturing")))
    mfg["page_count"] = page_count
    geo = dict(_as_dict(raw.get("geometry")))
    geo["media_box_width_points"] = media_w
    geo["spine_width_points"] = spine_pt
    raster = dict(_as_dict(raw.get("raster")))
    full_wrap = dict(_as_dict(raster.get("full_wrap")))
    full_wrap["expected_width_pixels"] = full_w
    full_wrap["expected_height_pixels"] = height
    comps = dict(_as_dict(raster.get("components")))
    spine_comp = dict(_as_dict(comps.get("spine")))
    spine_comp["expected_width_pixels"] = spine_px
    spine_comp["expected_height_pixels"] = height
    comps["spine"] = spine_comp
    raster["full_wrap"] = full_wrap
    raster["components"] = comps
    raw["manufacturing"] = mfg
    raw["geometry"] = geo
    raw["raster"] = raster
    raw["notes"] = (
        f"Panels sourced as production RGB PNGs (back/spine/front). Spine width {spine_pt} pt "
        f"({spine_px} px @ {ppi} ppi) matches {paper} bulk for {page_count} pages; media box "
        f"{media_w}×{media_h} pt matches the {full_w}×{height} assembled wrap. Auto-synced to "
        "measured interior page count at package time."
    )

    # Validate before writing YAML.
    normalize_template_meta(raw)
    meta_path.write_text(yaml.safe_dump(raw, sort_keys=False), encoding="utf-8")

    book_yml = book_dir / "book.yml"
    book_text = book_yml.read_text(encoding="utf-8")
    updated, n_subs = re.subn(
        r"(template_page_count:\s*)\d+",
        rf"\g<1>{page_count}",
        book_text,
        count=1,
    )
    if n_subs != 1:
        raise CoverPageSyncError("Could not update print.cover.template_page_count in book.yml")
    book_yml.write_text(updated, encoding="utf-8")

    return CoverPageSyncResult(
        changed=True,
        page_count=page_count,
        spine_width_pixels=spine_px,
        spine_width_points=spine_pt,
        media_box_width_points=media_w,
        full_wrap_width_pixels=full_w,
        message=(
            f"Synced print cover template from {current!r} to measured {page_count} pages "
            f"(spine {spine_px}px / {spine_pt}pt)"
        ),
    )
