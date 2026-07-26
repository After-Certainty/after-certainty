"""Load and normalize IngramSpark template-meta.yml (legacy flat + raster v1)."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit(
        "PyYAML is required for template-meta.yml. Install with: python3 -m pip install pyyaml"
    ) from exc

try:
    import jsonschema
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit(
        "jsonschema is required for template-meta.yml. "
        "Install with: python3 -m pip install jsonschema"
    ) from exc

_REPO_ROOT = Path(__file__).resolve().parents[2]
TEMPLATE_META_SCHEMA_PATH = (
    _REPO_ROOT / "schema" / "profiles" / "ingramspark" / "template-meta.schema.json"
)
POINTS_PER_INCH = 72.0

_TEMPLATE_META_SCHEMA_CACHE: dict[str, Any] | None = None


class TemplateMetaError(ValueError):
    """Invalid or inconsistent template-meta.yml."""


@dataclass(frozen=True)
class BarcodeReserve:
    required: bool
    width_inches: float
    height_inches: float
    x_points: float
    y_points: float

    @property
    def width_points(self) -> float:
        return self.width_inches * POINTS_PER_INCH

    @property
    def height_points(self) -> float:
        return self.height_inches * POINTS_PER_INCH


@dataclass(frozen=True)
class NormalizedTemplateMeta:
    """Common view used by supplied-wrap PDF and raster-wrap PNG paths."""

    form: str  # "legacy" | "raster-v1"
    page_count: int
    trim_width_inches: float
    trim_height_inches: float
    binding: str
    paper: str
    color_mode: str
    media_box_width_inches: float
    media_box_height_inches: float
    media_box_width_points: float
    media_box_height_points: float
    spine_width_inches: float | None
    spine_width_points: float | None
    bleed_points: float | None
    safe_inset_points: float | None
    barcode_supplied: bool | None
    spine_text: bool | None
    required_ppi: int | None
    expected_width_pixels: int | None
    expected_height_pixels: int | None
    barcode_reserve: BarcodeReserve | None
    raw: dict[str, Any]


def load_template_meta_schema() -> dict[str, Any]:
    global _TEMPLATE_META_SCHEMA_CACHE
    if _TEMPLATE_META_SCHEMA_CACHE is not None:
        return _TEMPLATE_META_SCHEMA_CACHE
    with TEMPLATE_META_SCHEMA_PATH.open("r", encoding="utf-8") as f:
        _TEMPLATE_META_SCHEMA_CACHE = json.load(f)
    return _TEMPLATE_META_SCHEMA_CACHE


def load_raw_template_meta(path: Path) -> dict[str, Any]:
    if not path.is_file():
        raise TemplateMetaError(
            f"Missing template-meta.yml at {path}. "
            f"Record observed Cover Template Generator metadata before validating the wrap."
        )
    with path.open("r", encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}
    if not isinstance(data, dict):
        raise TemplateMetaError(f"Expected mapping in {path}")
    schema = load_template_meta_schema()
    try:
        jsonschema.validate(instance=data, schema=schema)
    except jsonschema.ValidationError as exc:
        location = ".".join(str(p) for p in exc.path) or "<root>"
        raise TemplateMetaError(
            f"{path}: template-meta schema validation failed at {location}: {exc.message}"
        ) from exc
    return data


def points_to_inches(points: float) -> float:
    return float(points) / POINTS_PER_INCH


def inches_to_points(inches: float) -> float:
    return float(inches) * POINTS_PER_INCH


def pixels_from_inches(inches: float, ppi: int) -> int:
    """
    Project-approved rounding: nearest integer via Python ``round``
    (IEEE-754 banker's rounding at exact .5).
    """
    return int(round(float(inches) * int(ppi)))


def pixels_from_points(points: float, ppi: int) -> int:
    return pixels_from_inches(points_to_inches(points), ppi)


def normalize_template_meta(raw: dict[str, Any]) -> NormalizedTemplateMeta:
    if int(raw.get("version") or 0) == 1 or "manufacturing" in raw:
        return _normalize_raster_v1(raw)
    return _normalize_legacy(raw)


def _normalize_legacy(raw: dict[str, Any]) -> NormalizedTemplateMeta:
    trim = raw.get("trim") if isinstance(raw.get("trim"), dict) else {}
    box = raw.get("media_box") if isinstance(raw.get("media_box"), dict) else {}
    try:
        tw = float(trim["width_inches"])
        th = float(trim["height_inches"])
        bw = float(box["width_inches"])
        bh = float(box["height_inches"])
    except (KeyError, TypeError, ValueError) as exc:
        raise TemplateMetaError("legacy template-meta missing trim/media_box inches") from exc
    spine_in = raw.get("spine_width_inches")
    spine_w = float(spine_in) if isinstance(spine_in, (int, float)) else None
    return NormalizedTemplateMeta(
        form="legacy",
        page_count=int(raw["page_count"]),
        trim_width_inches=tw,
        trim_height_inches=th,
        binding=str(raw.get("binding") or "").strip(),
        paper=str(raw.get("paper") or "").strip(),
        color_mode=str(raw.get("color_mode") or "").strip(),
        media_box_width_inches=bw,
        media_box_height_inches=bh,
        media_box_width_points=inches_to_points(bw),
        media_box_height_points=inches_to_points(bh),
        spine_width_inches=spine_w,
        spine_width_points=inches_to_points(spine_w) if spine_w is not None else None,
        bleed_points=None,
        safe_inset_points=None,
        barcode_supplied=raw.get("barcode_supplied")
        if isinstance(raw.get("barcode_supplied"), bool)
        else None,
        spine_text=raw.get("spine_text") if isinstance(raw.get("spine_text"), bool) else None,
        required_ppi=None,
        expected_width_pixels=None,
        expected_height_pixels=None,
        barcode_reserve=None,
        raw=raw,
    )


def _normalize_raster_v1(raw: dict[str, Any]) -> NormalizedTemplateMeta:
    mfg = raw.get("manufacturing") if isinstance(raw.get("manufacturing"), dict) else {}
    geo = raw.get("geometry") if isinstance(raw.get("geometry"), dict) else {}
    raster = raw.get("raster") if isinstance(raw.get("raster"), dict) else {}
    try:
        tw = float(mfg["trim_width_inches"])
        th = float(mfg["trim_height_inches"])
        page_count = int(mfg["page_count"])
        box_w_pts = float(geo["media_box_width_points"])
        box_h_pts = float(geo["media_box_height_points"])
        spine_pts = float(geo["spine_width_points"])
        bleed_pts = float(geo["bleed_points"])
        ppi = int(raster["required_ppi"])
        exp_w = int(raster["expected_width_pixels"])
        exp_h = int(raster["expected_height_pixels"])
    except (KeyError, TypeError, ValueError) as exc:
        raise TemplateMetaError(
            "raster v1 template-meta missing manufacturing/geometry/raster fields"
        ) from exc

    if ppi < 72:
        raise TemplateMetaError(f"raster.required_ppi must be >= 72 (got {ppi})")

    derived_w = pixels_from_points(box_w_pts, ppi)
    derived_h = pixels_from_points(box_h_pts, ppi)
    if exp_w != derived_w or exp_h != derived_h:
        raise TemplateMetaError(
            "template-meta raster dimensions are inconsistent with geometry × required_ppi.\n"
            f"  stored expected: {exp_w} × {exp_h} px\n"
            f"  derived from media box {box_w_pts} × {box_h_pts} pt at {ppi} ppi "
            f"(round(inches × ppi)): {derived_w} × {derived_h} px\n"
            "Update expected_*_pixels or geometry so they agree under the project rounding rule."
        )

    reserve: BarcodeReserve | None = None
    reserve_raw = raw.get("barcode_reserve")
    if isinstance(reserve_raw, dict):
        try:
            reserve = BarcodeReserve(
                required=bool(reserve_raw["required"]),
                width_inches=float(reserve_raw["width_inches"]),
                height_inches=float(reserve_raw["height_inches"]),
                x_points=float(reserve_raw["x_points"]),
                y_points=float(reserve_raw["y_points"]),
            )
        except (KeyError, TypeError, ValueError) as exc:
            raise TemplateMetaError("barcode_reserve is incomplete or invalid") from exc

    safe = geo.get("safe_inset_points")
    safe_inset = float(safe) if isinstance(safe, (int, float)) else None

    return NormalizedTemplateMeta(
        form="raster-v1",
        page_count=page_count,
        trim_width_inches=tw,
        trim_height_inches=th,
        binding=str(mfg.get("binding") or "").strip(),
        paper=str(mfg.get("paper") or "").strip(),
        color_mode=str(mfg.get("interior_color_mode") or "").strip(),
        media_box_width_inches=points_to_inches(box_w_pts),
        media_box_height_inches=points_to_inches(box_h_pts),
        media_box_width_points=box_w_pts,
        media_box_height_points=box_h_pts,
        spine_width_inches=points_to_inches(spine_pts),
        spine_width_points=spine_pts,
        bleed_points=bleed_pts,
        safe_inset_points=safe_inset,
        barcode_supplied=raw.get("barcode_supplied")
        if isinstance(raw.get("barcode_supplied"), bool)
        else None,
        spine_text=raw.get("spine_text") if isinstance(raw.get("spine_text"), bool) else None,
        required_ppi=ppi,
        expected_width_pixels=exp_w,
        expected_height_pixels=exp_h,
        barcode_reserve=reserve,
        raw=raw,
    )


def effective_ppi(
    *,
    width_pixels: int,
    height_pixels: int,
    media_box_width_inches: float,
    media_box_height_inches: float,
) -> tuple[float, float]:
    """PPI implied by pixel dimensions over the template media box (not embedded DPI)."""
    if media_box_width_inches <= 0 or media_box_height_inches <= 0:
        raise TemplateMetaError("media box inches must be positive for effective PPI")
    return (
        float(width_pixels) / float(media_box_width_inches),
        float(height_pixels) / float(media_box_height_inches),
    )


def back_cover_panel_points(meta: NormalizedTemplateMeta) -> tuple[float, float, float, float]:
    """
    Return (x0, y0, x1, y1) for the back-cover panel in media-box coordinates.

    Layout assumption (IngramSpark full wrap): left = back, center = spine, right = front.
    Panel includes bleed on the outer left and shares vertical bleed with the wrap.
    """
    if meta.spine_width_points is None or meta.bleed_points is None:
        raise TemplateMetaError(
            "spine_width_points and bleed_points are required to locate the back-cover panel"
        )
    bleed = float(meta.bleed_points)
    spine = float(meta.spine_width_points)
    trim_w_pts = inches_to_points(meta.trim_width_inches)
    # back panel width = bleed (outer) + trim
    x0 = 0.0
    x1 = bleed + trim_w_pts
    # ensure spine starts where we expect
    expected_spine_x0 = x1
    expected_front_x0 = expected_spine_x0 + spine
    expected_media_w = expected_front_x0 + trim_w_pts + bleed
    if abs(expected_media_w - meta.media_box_width_points) > 0.05:
        raise TemplateMetaError(
            "geometry is inconsistent with trim + spine + bleed for a back|spine|front wrap.\n"
            f"  implied media width: {expected_media_w} pt\n"
            f"  stored media_box_width_points: {meta.media_box_width_points} pt"
        )
    y0 = 0.0
    y1 = meta.media_box_height_points
    return (x0, y0, x1, y1)


def validate_barcode_reserve_geometry(meta: NormalizedTemplateMeta) -> list[str]:
    """Return error messages if barcode reserve is missing or outside the back panel/safe area."""
    errors: list[str] = []
    reserve = meta.barcode_reserve
    if reserve is None:
        errors.append(
            "barcode_reserve geometry is required in template-meta.yml for raster-wrap "
            "when barcode_mode is ingram-generated"
        )
        return errors
    if not reserve.required:
        errors.append("barcode_reserve.required must be true for ingram-generated barcode mode")
        return errors

    try:
        bx0, by0, bx1, by1 = back_cover_panel_points(meta)
    except TemplateMetaError as exc:
        errors.append(str(exc))
        return errors

    rx0 = reserve.x_points
    ry0 = reserve.y_points
    rx1 = rx0 + reserve.width_points
    ry1 = ry0 + reserve.height_points

    if rx0 < bx0 - 1e-6 or ry0 < by0 - 1e-6 or rx1 > bx1 + 1e-6 or ry1 > by1 + 1e-6:
        errors.append(
            "barcode_reserve is not entirely within the back-cover panel "
            f"(reserve [{rx0:.2f},{ry0:.2f}]–[{rx1:.2f},{ry1:.2f}] pt; "
            f"back panel [{bx0:.2f},{by0:.2f}]–[{bx1:.2f},{by1:.2f}] pt)"
        )

    bleed = float(meta.bleed_points or 0.0)
    # Must not sit only in bleed-only strip: require intersection with trim (non-bleed) back area.
    trim_x0 = bleed
    trim_x1 = bx1
    trim_y0 = bleed
    trim_y1 = meta.media_box_height_points - bleed
    if rx1 <= trim_x0 or rx0 >= trim_x1 or ry1 <= trim_y0 or ry0 >= trim_y1:
        errors.append(
            "barcode_reserve must intersect the back-cover trim (non-bleed) area; "
            "it must not lie only in bleed, spine, or front cover"
        )

    if meta.spine_width_points is not None:
        spine_x0 = bx1
        if rx1 > spine_x0 + 1e-6:
            errors.append("barcode_reserve overlaps the spine panel")

    if meta.safe_inset_points is not None:
        inset = float(meta.safe_inset_points)
        safe_x0 = trim_x0 + inset
        safe_x1 = trim_x1 - inset
        safe_y0 = trim_y0 + inset
        safe_y1 = trim_y1 - inset
        if (
            rx0 < safe_x0 - 1e-6
            or ry0 < safe_y0 - 1e-6
            or rx1 > safe_x1 + 1e-6
            or ry1 > safe_y1 + 1e-6
        ):
            errors.append(
                "barcode_reserve is outside the back-cover safe area "
                f"(safe [{safe_x0:.2f},{safe_y0:.2f}]–[{safe_x1:.2f},{safe_y1:.2f}] pt)"
            )

    return errors
