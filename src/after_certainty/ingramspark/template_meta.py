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

from after_certainty.core.repo_root import repo_root

_REPO_ROOT = repo_root(Path(__file__))
TEMPLATE_META_SCHEMA_PATH = (
    _REPO_ROOT / "schema" / "profiles" / "ingramspark" / "template-meta.schema.json"
)
POINTS_PER_INCH = 72.0
MIN_BARCODE_WIDTH_INCHES = 1.75
MIN_BARCODE_HEIGHT_INCHES = 1.0
# Ingram places a ~1.755" × 1.0" barcode; oversized clear boxes have been rejected.
MAX_BARCODE_WIDTH_INCHES = 1.76
MAX_BARCODE_HEIGHT_INCHES = 1.05

_TEMPLATE_META_SCHEMA_CACHE: dict[str, Any] | None = None


class TemplateMetaError(ValueError):
    """Invalid or inconsistent template-meta.yml."""


@dataclass(frozen=True)
class ComponentPixels:
    width: int
    height: int


@dataclass(frozen=True)
class BarcodeReserve:
    required: bool
    width_inches: float
    height_inches: float
    x_points: float
    y_points: float
    panel: str = "back"
    # Optional top-left pixel coords within the back panel image (y downward).
    x_pixels: int | None = None
    y_pixels: int | None = None
    width_pixels: int | None = None
    height_pixels: int | None = None

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
    outside_bleed_points: float | None
    top_bleed_points: float | None
    bottom_bleed_points: float | None
    safe_inset_points: float | None
    barcode_supplied: bool | None
    spine_text: bool | None
    required_ppi: int | None
    expected_width_pixels: int | None
    expected_height_pixels: int | None
    components: dict[str, ComponentPixels] | None
    barcode_reserve: BarcodeReserve | None
    raw: dict[str, Any]

    @property
    def has_components(self) -> bool:
        return bool(self.components)


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
        outside_bleed_points=None,
        top_bleed_points=None,
        bottom_bleed_points=None,
        safe_inset_points=None,
        barcode_supplied=raw.get("barcode_supplied")
        if isinstance(raw.get("barcode_supplied"), bool)
        else None,
        spine_text=raw.get("spine_text") if isinstance(raw.get("spine_text"), bool) else None,
        required_ppi=None,
        expected_width_pixels=None,
        expected_height_pixels=None,
        components=None,
        barcode_reserve=None,
        raw=raw,
    )


def resolve_bleed_points(geo: dict[str, Any]) -> tuple[float, float, float, float]:
    """Return (uniform_or_outside_for_legacy, outside, top, bottom)."""
    if "outside_bleed_points" in geo:
        outside = float(geo["outside_bleed_points"])
        top = float(geo["top_bleed_points"])
        bottom = float(geo["bottom_bleed_points"])
        return outside, outside, top, bottom
    bleed = float(geo["bleed_points"])
    return bleed, bleed, bleed, bleed


def expected_component_points(
    *,
    trim_width_inches: float,
    trim_height_inches: float,
    spine_width_points: float,
    outside_bleed_points: float,
    top_bleed_points: float,
    bottom_bleed_points: float,
) -> dict[str, tuple[float, float]]:
    """Exact contiguous panel sizes in points (includes owned bleed only)."""
    trim_w = inches_to_points(trim_width_inches)
    trim_h = inches_to_points(trim_height_inches)
    height = trim_h + top_bleed_points + bottom_bleed_points
    back_w = outside_bleed_points + trim_w
    spine_w = float(spine_width_points)
    front_w = trim_w + outside_bleed_points
    return {
        "back": (back_w, height),
        "spine": (spine_w, height),
        "front": (front_w, height),
        "full_wrap": (back_w + spine_w + front_w, height),
    }


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
        ppi = int(raster["required_ppi"])
    except (KeyError, TypeError, ValueError) as exc:
        raise TemplateMetaError(
            "raster v1 template-meta missing manufacturing/geometry/raster fields"
        ) from exc

    if ppi < 72:
        raise TemplateMetaError(f"raster.required_ppi must be >= 72 (got {ppi})")

    try:
        _uniform, outside, top, bottom = resolve_bleed_points(geo)
    except (KeyError, TypeError, ValueError) as exc:
        raise TemplateMetaError(
            "geometry requires bleed_points or outside/top/bottom_bleed_points"
        ) from exc

    expected = expected_component_points(
        trim_width_inches=tw,
        trim_height_inches=th,
        spine_width_points=spine_pts,
        outside_bleed_points=outside,
        top_bleed_points=top,
        bottom_bleed_points=bottom,
    )
    implied_w, implied_h = expected["full_wrap"]
    # Allow sub-point drift: pixel-rounded panel widths (e.g. 1838+74+1838 @ 300 ppi)
    # can imply 899.76 pt while the template media box is stored as 900.0 pt.
    if abs(implied_w - box_w_pts) > 0.5 or abs(implied_h - box_h_pts) > 0.5:
        raise TemplateMetaError(
            "geometry is inconsistent with trim + spine + bleed for a back|spine|front wrap.\n"
            f"  implied media box: {implied_w} × {implied_h} pt\n"
            f"  stored media box: {box_w_pts} × {box_h_pts} pt"
        )

    components: dict[str, ComponentPixels] | None = None
    comps_raw = raster.get("components")
    full_wrap = raster.get("full_wrap") if isinstance(raster.get("full_wrap"), dict) else None
    if isinstance(comps_raw, dict) and full_wrap is not None:
        try:
            components = {
                "back": ComponentPixels(
                    int(comps_raw["back"]["expected_width_pixels"]),
                    int(comps_raw["back"]["expected_height_pixels"]),
                ),
                "spine": ComponentPixels(
                    int(comps_raw["spine"]["expected_width_pixels"]),
                    int(comps_raw["spine"]["expected_height_pixels"]),
                ),
                "front": ComponentPixels(
                    int(comps_raw["front"]["expected_width_pixels"]),
                    int(comps_raw["front"]["expected_height_pixels"]),
                ),
            }
            exp_w = int(full_wrap["expected_width_pixels"])
            exp_h = int(full_wrap["expected_height_pixels"])
        except (KeyError, TypeError, ValueError) as exc:
            raise TemplateMetaError("raster.components / full_wrap is incomplete") from exc

        # Height consistency + width sum
        heights = {c.height for c in components.values()}
        if len(heights) != 1 or next(iter(heights)) != exp_h:
            raise TemplateMetaError(
                "component heights must match each other and full_wrap height.\n"
                f"  back={components['back'].height}, spine={components['spine'].height}, "
                f"front={components['front'].height}, full_wrap={exp_h}"
            )
        width_sum = components["back"].width + components["spine"].width + components["front"].width
        if width_sum != exp_w:
            raise TemplateMetaError(
                "component widths must sum to full_wrap width.\n"
                f"  back+spine+front={width_sum} px, full_wrap={exp_w} px"
            )

        # Consistency with geometry × PPI
        for role in ("back", "spine", "front"):
            der_w = pixels_from_points(expected[role][0], ppi)
            der_h = pixels_from_points(expected[role][1], ppi)
            got = components[role]
            if got.width != der_w or got.height != der_h:
                raise TemplateMetaError(
                    f"raster.components.{role} pixels are inconsistent with geometry × "
                    f"required_ppi.\n"
                    f"  stored: {got.width} × {got.height} px\n"
                    f"  derived from {expected[role][0]} × {expected[role][1]} pt at {ppi} ppi: "
                    f"{der_w} × {der_h} px"
                )
        der_fw = pixels_from_points(box_w_pts, ppi)
        der_fh = pixels_from_points(box_h_pts, ppi)
        if exp_w != der_fw or exp_h != der_fh:
            raise TemplateMetaError(
                "template-meta full_wrap dimensions are inconsistent with geometry × "
                "required_ppi.\n"
                f"  stored expected: {exp_w} × {exp_h} px\n"
                f"  derived: {der_fw} × {der_fh} px"
            )
    else:
        try:
            exp_w = int(raster["expected_width_pixels"])
            exp_h = int(raster["expected_height_pixels"])
        except (KeyError, TypeError, ValueError) as exc:
            raise TemplateMetaError(
                "raster v1 requires expected_width/height_pixels or full_wrap+components"
            ) from exc
        derived_w = pixels_from_points(box_w_pts, ppi)
        derived_h = pixels_from_points(box_h_pts, ppi)
        if exp_w != derived_w or exp_h != derived_h:
            raise TemplateMetaError(
                "template-meta raster dimensions are inconsistent with geometry × "
                "required_ppi.\n"
                f"  stored expected: {exp_w} × {exp_h} px\n"
                f"  derived from media box {box_w_pts} × {box_h_pts} pt at {ppi} ppi "
                f"(round(inches × ppi)): {derived_w} × {derived_h} px\n"
                "Update expected_*_pixels or geometry so they agree under the project "
                "rounding rule."
            )

    reserve = _normalize_barcode_reserve(
        raw.get("barcode_reserve"),
        ppi=ppi,
        media_box_height_points=box_h_pts,
        back_width_points=expected["back"][0],
        back_height_pixels=components["back"].height if components else exp_h,
    )

    safe = geo.get("safe_inset_points")
    safe_inset = float(safe) if isinstance(safe, (int, float)) else None
    bleed_uniform = float(geo["bleed_points"]) if "bleed_points" in geo else outside

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
        bleed_points=bleed_uniform,
        outside_bleed_points=outside,
        top_bleed_points=top,
        bottom_bleed_points=bottom,
        safe_inset_points=safe_inset,
        barcode_supplied=raw.get("barcode_supplied")
        if isinstance(raw.get("barcode_supplied"), bool)
        else None,
        spine_text=raw.get("spine_text") if isinstance(raw.get("spine_text"), bool) else None,
        required_ppi=ppi,
        expected_width_pixels=exp_w,
        expected_height_pixels=exp_h,
        components=components,
        barcode_reserve=reserve,
        raw=raw,
    )


def _normalize_barcode_reserve(
    reserve_raw: Any,
    *,
    ppi: int,
    media_box_height_points: float,
    back_width_points: float,
    back_height_pixels: int,
) -> BarcodeReserve | None:
    if not isinstance(reserve_raw, dict):
        return None
    required = bool(reserve_raw["required"])
    panel = str(reserve_raw.get("panel") or "back").strip() or "back"
    if panel != "back":
        raise TemplateMetaError(f"barcode_reserve.panel must be 'back' (got {panel!r})")

    if "x_pixels" in reserve_raw:
        try:
            x_px = int(reserve_raw["x_pixels"])
            y_px = int(reserve_raw["y_pixels"])
            w_px = int(reserve_raw["width_pixels"])
            h_px = int(reserve_raw["height_pixels"])
        except (KeyError, TypeError, ValueError) as exc:
            raise TemplateMetaError("barcode_reserve pixel fields are incomplete") from exc
        width_in = w_px / float(ppi)
        height_in = h_px / float(ppi)
        # Convert top-left panel pixels → PDF lower-left points in media box
        # (back panel starts at x=0; image y downward → PDF y upward).
        x_pts = (x_px / float(ppi)) * POINTS_PER_INCH
        y_pts_top = (y_px / float(ppi)) * POINTS_PER_INCH
        height_pts = (h_px / float(ppi)) * POINTS_PER_INCH
        y_pts = media_box_height_points - y_pts_top - height_pts
        return BarcodeReserve(
            required=required,
            width_inches=width_in,
            height_inches=height_in,
            x_points=x_pts,
            y_points=y_pts,
            panel=panel,
            x_pixels=x_px,
            y_pixels=y_px,
            width_pixels=w_px,
            height_pixels=h_px,
        )

    try:
        return BarcodeReserve(
            required=required,
            width_inches=float(reserve_raw["width_inches"]),
            height_inches=float(reserve_raw["height_inches"]),
            x_points=float(reserve_raw["x_points"]),
            y_points=float(reserve_raw["y_points"]),
            panel=panel,
        )
    except (KeyError, TypeError, ValueError) as exc:
        raise TemplateMetaError("barcode_reserve is incomplete or invalid") from exc


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
    """
    outside = meta.outside_bleed_points
    if outside is None:
        outside = meta.bleed_points
    if meta.spine_width_points is None or outside is None:
        raise TemplateMetaError(
            "spine_width_points and bleed (outside or bleed_points) are required "
            "to locate the back-cover panel"
        )
    spine = float(meta.spine_width_points)
    trim_w_pts = inches_to_points(meta.trim_width_inches)
    x0 = 0.0
    x1 = float(outside) + trim_w_pts
    expected_spine_x0 = x1
    expected_front_x0 = expected_spine_x0 + spine
    expected_media_w = expected_front_x0 + trim_w_pts + float(outside)
    if abs(expected_media_w - meta.media_box_width_points) > 0.5:
        raise TemplateMetaError(
            "geometry is inconsistent with trim + spine + bleed for a back|spine|front wrap.\n"
            f"  implied media width: {expected_media_w} pt\n"
            f"  stored media_box_width_points: {meta.media_box_width_points} pt"
        )
    return (x0, 0.0, x1, meta.media_box_height_points)


def validate_barcode_reserve_geometry(
    meta: NormalizedTemplateMeta,
) -> tuple[list[str], list[str]]:
    """
    Return (errors, warnings) for barcode reserve geometry.

    Undersized reserves (below 1.75×1.0 in) and oversized reserves (above ~1.76×1.05 in)
    are warnings so assembly/PDF preflight can still run while flagging artwork that
    needs a clear area matching Ingram's placement size.
    """
    errors: list[str] = []
    warnings: list[str] = []
    reserve = meta.barcode_reserve
    if reserve is None:
        errors.append(
            "barcode_reserve geometry is required in template-meta.yml for raster wraps "
            "when barcode_mode is ingram-generated"
        )
        return errors, warnings
    if not reserve.required:
        errors.append("barcode_reserve.required must be true for ingram-generated barcode mode")
        return errors, warnings
    if reserve.panel != "back":
        errors.append(f"barcode_reserve.panel must be back (got {reserve.panel!r})")

    if reserve.width_inches + 1e-9 < MIN_BARCODE_WIDTH_INCHES:
        warnings.append(
            f"barcode_reserve width {reserve.width_inches:.4f} in is smaller than the "
            f"approved minimum {MIN_BARCODE_WIDTH_INCHES} in; enlarge the clear area on "
            f"the back panel before IngramSpark upload"
        )
    if reserve.height_inches + 1e-9 < MIN_BARCODE_HEIGHT_INCHES:
        warnings.append(
            f"barcode_reserve height {reserve.height_inches:.4f} in is smaller than the "
            f"approved minimum {MIN_BARCODE_HEIGHT_INCHES} in; enlarge the clear area on "
            f"the back panel before IngramSpark upload"
        )
    if reserve.width_inches - 1e-9 > MAX_BARCODE_WIDTH_INCHES:
        warnings.append(
            f"barcode_reserve width {reserve.width_inches:.4f} in is larger than the "
            f"Ingram placement size (~{MAX_BARCODE_WIDTH_INCHES} in); shrink the clear "
            f"box toward 1.75×1.0 in (Ingram may reject oversized barcode boxes)"
        )
    if reserve.height_inches - 1e-9 > MAX_BARCODE_HEIGHT_INCHES:
        warnings.append(
            f"barcode_reserve height {reserve.height_inches:.4f} in is larger than the "
            f"Ingram placement size (~{MAX_BARCODE_HEIGHT_INCHES} in); shrink the clear "
            f"box toward 1.75×1.0 in (Ingram may reject oversized barcode boxes)"
        )

    try:
        bx0, by0, bx1, by1 = back_cover_panel_points(meta)
    except TemplateMetaError as exc:
        errors.append(str(exc))
        return errors, warnings

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

    if rx1 > meta.media_box_width_points + 1e-6 or ry1 > meta.media_box_height_points + 1e-6:
        errors.append("barcode_reserve extends outside the assembled wrap media box")

    outside = float(
        meta.outside_bleed_points
        if meta.outside_bleed_points is not None
        else meta.bleed_points or 0.0
    )
    top = float(meta.top_bleed_points if meta.top_bleed_points is not None else outside)
    bottom = float(meta.bottom_bleed_points if meta.bottom_bleed_points is not None else outside)
    trim_x0 = outside
    trim_x1 = bx1
    trim_y0 = bottom
    trim_y1 = meta.media_box_height_points - top
    if rx1 <= trim_x0 or rx0 >= trim_x1 or ry1 <= trim_y0 or ry0 >= trim_y1:
        errors.append(
            "barcode_reserve must intersect the back-cover trim (non-bleed) area; "
            "it must not lie only in bleed, spine, or front cover"
        )

    if meta.spine_width_points is not None and rx1 > bx1 + 1e-6:
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

    return errors, warnings
