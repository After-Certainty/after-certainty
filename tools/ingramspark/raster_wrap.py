"""Convert raster print covers (single wrap or assembled panels) to staged *_cvr.pdf."""

from __future__ import annotations

import io
import json
import shutil
import subprocess
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Literal

from book_specs import spec_ingramspark_enabled, spec_ingramspark_target
from ingramspark.assemble_wrap import (
    PANEL_ORDER,
    AssembleWrapError,
    assemble_rgb_wrap,
    panel_dimension_mismatch_message,
    require_components,
)
from ingramspark.paths import (
    print_cover_basename,
    print_cover_pdf_path,
    print_cover_work_dir,
    print_isbn_optional,
    print_output_dir,
    print_page_count_path,
    sanitize_report_paths,
)
from ingramspark.pdf_inspect import inspect_pdf, media_box_matches_trim
from ingramspark.profile import load_profile
from ingramspark.template_meta import (
    NormalizedTemplateMeta,
    TemplateMetaError,
    effective_ppi,
    load_raw_template_meta,
    normalize_template_meta,
    validate_barcode_reserve_geometry,
)

CheckStatus = Literal["passed", "failed", "warning", "manual-review"]

DEFAULT_TEMPLATE_META_REL = "assets/ingramspark/template-meta.yml"
TRIM_TOLERANCE_INCHES = 0.02
MEDIA_BOX_POINT_TOLERANCE = 0.05


class RasterWrapError(ValueError):
    """Blocking raster-wrap conversion / validation failure."""


@dataclass
class PreflightCheck:
    id: str
    status: CheckStatus
    message: str = ""

    def to_dict(self) -> dict[str, Any]:
        payload: dict[str, Any] = {"id": self.id, "status": self.status}
        if self.message:
            payload["message"] = self.message
        return payload


@dataclass
class RasterWrapResult:
    status: CheckStatus
    strategy: str = ""
    source: dict[str, Any] = field(default_factory=dict)
    sources: dict[str, Any] = field(default_factory=dict)
    assembly: dict[str, Any] = field(default_factory=dict)
    template: dict[str, Any] = field(default_factory=dict)
    output: dict[str, Any] = field(default_factory=dict)
    color: dict[str, Any] = field(default_factory=dict)
    barcode_reserve: dict[str, Any] = field(default_factory=dict)
    checks: list[PreflightCheck] = field(default_factory=list)
    manual_review: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    work_dir: Path | None = None
    staged_cover_path: Path | None = None
    preflight_json_path: Path | None = None
    preflight_txt_path: Path | None = None
    overlay_path: Path | None = None

    @property
    def ok(self) -> bool:
        return self.status == "passed" and not self.errors

    def to_dict(self) -> dict[str, Any]:
        return {
            "status": self.status,
            "strategy": self.strategy,
            "source": self.source,
            "sources": self.sources,
            "assembly": self.assembly,
            "template": self.template,
            "output": self.output,
            "color": self.color,
            "barcode_reserve": self.barcode_reserve,
            "checks": [c.to_dict() for c in self.checks],
            "manualReview": list(self.manual_review),
            "errors": list(self.errors),
            "warnings": list(self.warnings),
            "workDir": self.work_dir.as_posix() if self.work_dir else None,
            "stagedCoverPath": (
                self.staged_cover_path.as_posix() if self.staged_cover_path else None
            ),
            "preflightJsonPath": (
                self.preflight_json_path.as_posix() if self.preflight_json_path else None
            ),
            "preflightTxtPath": (
                self.preflight_txt_path.as_posix() if self.preflight_txt_path else None
            ),
            "overlayPath": self.overlay_path.as_posix() if self.overlay_path else None,
        }

    def human_text(self) -> str:
        lines = [
            "IngramSpark raster-wrap print cover",
            f"status: {self.status}",
            "",
        ]
        if self.errors:
            lines.append("ERRORS")
            lines.append("------")
            for err in self.errors:
                lines.append(err)
                lines.append("")
        if self.strategy:
            lines.append(f"strategy: {self.strategy}")
            lines.append("")
        if self.sources:
            lines.append("Sources")
            lines.append("-------")
            for role, info in self.sources.items():
                lines.append(f"  {role}:")
                if isinstance(info, dict):
                    for key, value in info.items():
                        lines.append(f"    {key}: {value}")
                else:
                    lines.append(f"    {info}")
            lines.append("")
        elif self.source:
            lines.append("Source")
            lines.append("------")
            for key, value in self.source.items():
                lines.append(f"  {key}: {value}")
            lines.append("")
        if self.assembly:
            lines.append("Assembly")
            lines.append("--------")
            for key, value in self.assembly.items():
                lines.append(f"  {key}: {value}")
            lines.append("")
        lines.append("Template")
        lines.append("--------")
        for key, value in self.template.items():
            lines.append(f"  {key}: {value}")
        lines.append("")
        lines.append("Checks")
        lines.append("------")
        for check in self.checks:
            msg = f" — {check.message}" if check.message else ""
            lines.append(f"  [{check.status}] {check.id}{msg}")
        if self.warnings:
            lines.append("")
            lines.append("Warnings")
            lines.append("--------")
            for warning in self.warnings:
                lines.append(f"  {warning}")
        if self.manual_review:
            lines.append("")
            lines.append("Manual review")
            lines.append("-------------")
            for item in self.manual_review:
                lines.append(f"  - {item}")
        if self.output:
            lines.append("")
            lines.append("Output")
            lines.append("------")
            for key, value in self.output.items():
                lines.append(f"  {key}: {value}")
        lines.append("")
        lines.append(
            "This converter never stretches, crops, pads, or resamples the source PNG. "
            "Embedded PNG DPI is not authoritative."
        )
        lines.append(
            "Color conversion and PDF/X/ICC behavior follow the dated profile and may be "
            "provisional (experimental-warning / account-verification-needed)."
        )
        return "\n".join(lines) + "\n"


def _as_dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def _inches_close(a: float, b: float, *, tol: float = TRIM_TOLERANCE_INCHES) -> bool:
    return abs(a - b) <= tol


def _imagemagick_bin() -> str:
    return shutil.which("magick") or shutil.which("convert") or ""


def _tool_version(bin_path: str) -> str:
    if not bin_path:
        return ""
    proc = subprocess.run([bin_path, "-version"], capture_output=True, text=True, check=False)
    first = (proc.stdout or proc.stderr or "").splitlines()
    return first[0].strip() if first else bin_path


def resolve_cover_cfg(spec: dict[str, Any]) -> dict[str, Any]:
    if not spec_ingramspark_enabled(spec):
        raise RasterWrapError("publishing.targets.ingramspark.enabled must be true")
    target = spec_ingramspark_target(spec)
    print_cfg = _as_dict(target.get("print"))
    if print_cfg.get("enabled", False) is not True:
        raise RasterWrapError("publishing.targets.ingramspark.print.enabled must be true")
    cover = _as_dict(print_cfg.get("cover"))
    strategy = str(cover.get("strategy") or "").strip()
    if strategy not in {"raster-wrap", "assembled-raster-wrap"}:
        raise RasterWrapError(
            f"print.cover.strategy must be raster-wrap or assembled-raster-wrap (got {strategy!r})"
        )
    return cover


def resolve_raster_source(book_dir: Path, spec: dict[str, Any]) -> Path:
    cover = resolve_cover_cfg(spec)
    if str(cover.get("strategy") or "").strip() != "raster-wrap":
        raise RasterWrapError("resolve_raster_source is only for raster-wrap")
    rel = str(cover.get("source") or "").strip()
    if not rel:
        raise RasterWrapError("publishing.targets.ingramspark.print.cover.source is required")
    path = (book_dir / rel).resolve()
    if not path.is_file():
        raise RasterWrapError(f"Missing raster wrap PNG: {rel} (under {book_dir})")
    return path


def resolve_panel_assets(
    book_dir: Path,
    spec: dict[str, Any],
    *,
    back: Path | None = None,
    spine: Path | None = None,
    front: Path | None = None,
) -> dict[str, Path]:
    cover = resolve_cover_cfg(spec)
    assets = _as_dict(cover.get("assets"))
    resolved: dict[str, Path] = {}
    overrides = {"back": back, "spine": spine, "front": front}
    for role in PANEL_ORDER:
        if overrides[role] is not None:
            path = overrides[role]
        else:
            rel = str(assets.get(role) or "").strip()
            if not rel:
                raise RasterWrapError(
                    f"publishing.targets.ingramspark.print.cover.assets.{role} is required"
                )
            path = (book_dir / rel).resolve()
        if not path.is_file():
            raise RasterWrapError(f"Missing {role} panel PNG: {path}")
        resolved[role] = path
    return resolved


def resolve_template_meta_path(
    book_dir: Path, spec: dict[str, Any], *, relative: str | None = None
) -> Path:
    if relative:
        return (book_dir / relative).resolve()
    cover = resolve_cover_cfg(spec)
    rel = str(cover.get("template_metadata") or DEFAULT_TEMPLATE_META_REL).strip()
    return (book_dir / rel).resolve()


def _read_interior_page_count(repo: Path, spec: dict[str, Any]) -> int | None:
    path = print_page_count_path(repo, spec)
    if not path.is_file():
        return None
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None
    if not isinstance(payload, dict):
        return None
    value = payload.get("page_count")
    return int(value) if isinstance(value, int) and value >= 1 else None


def inspect_png(path: Path) -> dict[str, Any]:
    try:
        from PIL import Image, ImageCms
    except ModuleNotFoundError as exc:  # pragma: no cover
        raise RasterWrapError(
            "Pillow is required to inspect raster wrap PNGs. "
            "Install with: uv sync --frozen --group publishing"
        ) from exc

    if not path.is_file():
        raise RasterWrapError(f"PNG not found: {path}")
    suffix = path.suffix.lower()
    if suffix != ".png":
        raise RasterWrapError(
            f"Non-PNG input is not accepted for raster-wrap (got {suffix or 'no extension'})"
        )

    try:
        with Image.open(path) as im:
            im.load()
            width, height = im.size
            mode = im.mode
            fmt = im.format or "PNG"
            info = dict(im.info or {})
            bit_depth = None
            if hasattr(im, "bits"):
                bit_depth = int(im.bits)  # type: ignore[arg-type]
            elif mode in {"RGB", "RGBA", "L", "LA", "P"}:
                bit_depth = 8
            has_alpha_channel = mode in {"RGBA", "LA", "PA"} or (
                mode == "P" and "transparency" in info
            )
            transparent_pixels = False
            if has_alpha_channel:
                rgba = im.convert("RGBA")
                alpha = rgba.getchannel("A")
                extrema = alpha.getextrema()
                transparent_pixels = bool(extrema and extrema[0] < 255)
            dpi = info.get("dpi")
            embedded_dpi = None
            if isinstance(dpi, tuple) and len(dpi) >= 2:
                embedded_dpi = (float(dpi[0]), float(dpi[1]))
            icc = info.get("icc_profile")
            profile_desc = None
            if icc:
                try:
                    profile = ImageCms.ImageCmsProfile(io.BytesIO(icc))
                    profile_desc = ImageCms.getProfileDescription(profile).strip()
                except Exception:  # noqa: BLE001 - inspection only
                    profile_desc = "embedded-icc-present"
            return {
                "path": path.as_posix(),
                "format": fmt,
                "widthPixels": int(width),
                "heightPixels": int(height),
                "colorSpace": mode,
                "colorType": mode,
                "bitDepth": bit_depth,
                "hasAlpha": has_alpha_channel,
                "hasTransparentPixels": transparent_pixels,
                "embeddedColorProfile": profile_desc,
                "embeddedDpi": embedded_dpi,
            }
    except RasterWrapError:
        raise
    except OSError as exc:
        raise RasterWrapError(f"Corrupt or unreadable PNG: {path} ({exc})") from exc


def dimension_mismatch_message(
    *,
    source_path: Path,
    width: int,
    height: int,
    expected_w: int,
    expected_h: int,
    required_ppi: int,
) -> str:
    axes: list[str] = []
    if width != expected_w:
        axes.append("width")
    if height != expected_h:
        axes.append("height")
    axis_note = f"Mismatch on {' and '.join(axes)}." if axes else "Dimensions do not match."
    return (
        "Raster wrap dimensions do not match the IngramSpark template.\n"
        "Source:\n"
        f"  {source_path.as_posix()}\n"
        f"  {width} × {height} px\n"
        "Required:\n"
        f"  {expected_w} × {expected_h} px\n"
        f"  derived from template-meta.yml at {required_ppi} ppi\n"
        f"{axis_note}\n"
        "The converter will not stretch, crop, pad, or upscale a cover.\n"
        "Rebuild the wrap at the required dimensions."
    )


def _compare_manufacturing(
    *,
    meta: NormalizedTemplateMeta,
    print_cfg: dict[str, Any],
    cover: dict[str, Any],
    interior_page_count: int | None,
) -> list[str]:
    errors: list[str] = []
    trim = _as_dict(print_cfg.get("trim"))
    interior = _as_dict(print_cfg.get("interior"))
    try:
        cfg_w = float(trim["width_inches"])
        cfg_h = float(trim["height_inches"])
    except (KeyError, TypeError, ValueError):
        errors.append("publishing.targets.ingramspark.print.trim is missing or invalid")
        cfg_w = cfg_h = None  # type: ignore[assignment]
    else:
        same = _inches_close(cfg_w, meta.trim_width_inches) and _inches_close(
            cfg_h, meta.trim_height_inches
        )
        swapped = _inches_close(cfg_w, meta.trim_height_inches) and _inches_close(
            cfg_h, meta.trim_width_inches
        )
        if not same and not swapped:
            errors.append(
                f"Configured print.trim {cfg_w}x{cfg_h} in does not match "
                f"template-meta trim {meta.trim_width_inches}x{meta.trim_height_inches} in. "
                f"print.trim is authoritative; update the template request or book.yml."
            )

    cfg_binding = str(print_cfg.get("binding") or "").strip()
    if cfg_binding and meta.binding and cfg_binding != meta.binding:
        errors.append(
            f"print.binding {cfg_binding!r} does not match template-meta binding {meta.binding!r}"
        )
    cfg_paper = str(interior.get("paper") or "").strip()
    if cfg_paper and meta.paper and cfg_paper != meta.paper:
        errors.append(
            f"print.interior.paper {cfg_paper!r} does not match template-meta paper {meta.paper!r}"
        )
    cfg_color = str(interior.get("color_mode") or "").strip()
    if cfg_color and meta.color_mode and cfg_color != meta.color_mode:
        errors.append(
            f"print.interior.color_mode {cfg_color!r} does not match "
            f"template-meta color_mode {meta.color_mode!r}"
        )

    book_template_pages = cover.get("template_page_count")
    if isinstance(book_template_pages, int) and book_template_pages != meta.page_count:
        errors.append(
            f"book.yml print.cover.template_page_count is {book_template_pages}, but "
            f"template-meta page_count is {meta.page_count}. Keep them in sync with the "
            f"Cover Template Generator request."
        )
    if interior_page_count is not None and interior_page_count != meta.page_count:
        errors.append(
            f"Print cover template was generated for {meta.page_count} pages, but the interior "
            f"now has {interior_page_count} pages. Request or generate a new IngramSpark cover "
            f"template before packaging."
        )
    return errors


def _cover_raster_policy(repo: Path, spec: dict[str, Any]) -> dict[str, Any]:
    target = spec_ingramspark_target(spec)
    pid = str(target.get("specification_profile") or "").strip()
    if not pid:
        raise RasterWrapError("specification_profile is required for raster-wrap conversion")
    profile = load_profile(pid)
    print_prof = _as_dict(profile.get("print"))
    policy = _as_dict(print_prof.get("cover_raster"))
    if not policy:
        # Safe defaults mirroring ingramspark-2026-07 when profile omits the block.
        policy = {
            "status": "experimental-warning",
            "conversion_tool": "imagemagick",
            "working_rgb_icc": "/usr/share/color/icc/ghostscript/srgb.icc",
            "working_cmyk_icc": "/usr/share/color/icc/ghostscript/default_cmyk.icc",
            "rendering_intent": "Relative",
            "black_point_compensation": True,
            "strip_per_object_icc": True,
            "output_intent": "none-provisional",
            "allow_transparency_flatten": False,
        }
    return policy


def _convert_png_to_cmyk_pdf(
    *,
    source: Path,
    tiff_path: Path,
    pdf_path: Path,
    required_ppi: int,
    policy: dict[str, Any],
) -> dict[str, Any]:
    magick = _imagemagick_bin()
    if not magick:
        raise RasterWrapError(
            "ImageMagick (magick or convert) is required for raster-wrap CMYK conversion"
        )
    rgb_icc = Path(str(policy.get("working_rgb_icc") or ""))
    cmyk_icc = Path(str(policy.get("working_cmyk_icc") or ""))
    if not rgb_icc.is_file() or not cmyk_icc.is_file():
        raise RasterWrapError(
            f"Working ICC profiles missing (rgb={rgb_icc}, cmyk={cmyk_icc}). "
            f"Install Ghostscript ICC profiles or update print.cover_raster in the profile."
        )
    intent = str(policy.get("rendering_intent") or "Relative")
    bpc = bool(policy.get("black_point_compensation", True))

    # Color convert without geometry change; write CMYK TIFF intermediate.
    tiff_cmd = [
        magick,
        source.as_posix(),
        "-profile",
        rgb_icc.as_posix(),
        "-profile",
        cmyk_icc.as_posix(),
        "-intent",
        intent,
    ]
    if bpc:
        tiff_cmd.append("-black-point-compensation")
    tiff_cmd.extend(
        [
            "-compress",
            "LZW",
            tiff_path.as_posix(),
        ]
    )
    proc = subprocess.run(tiff_cmd, capture_output=True, text=True, check=False)
    if proc.returncode != 0:
        raise RasterWrapError(
            "CMYK conversion failed:\n" + (proc.stderr or proc.stdout or "").strip()
        )

    # Place at exact media box via density = required_ppi (no -resize).
    pdf_cmd = [
        magick,
        tiff_path.as_posix(),
        "-density",
        str(required_ppi),
        "-units",
        "PixelsPerInch",
        pdf_path.as_posix(),
    ]
    proc = subprocess.run(pdf_cmd, capture_output=True, text=True, check=False)
    if proc.returncode != 0:
        raise RasterWrapError(
            "PDF generation failed:\n" + (proc.stderr or proc.stdout or "").strip()
        )

    return {
        "conversionTool": "imagemagick",
        "toolPath": magick,
        "toolVersion": _tool_version(magick),
        "workingRgbIcc": rgb_icc.as_posix(),
        "workingCmykIcc": cmyk_icc.as_posix(),
        "renderingIntent": intent,
        "blackPointCompensation": bpc,
        "stripPerObjectIccPolicy": bool(policy.get("strip_per_object_icc", True)),
        "outputIntentPolicy": str(policy.get("output_intent") or "none-provisional"),
        "profileStatus": str(policy.get("status") or "experimental-warning"),
        "tiffPath": tiff_path.as_posix(),
        "notes": str(policy.get("notes") or "").strip() or None,
    }


def _draw_inspection_overlay(
    *,
    source: Path,
    overlay_path: Path,
    meta: NormalizedTemplateMeta,
    source_info: dict[str, Any] | None = None,
) -> None:
    from PIL import Image, ImageDraw, ImageFont

    with Image.open(source) as im:
        base = im.convert("RGBA")
    draw = ImageDraw.Draw(base)
    w_px, h_px = base.size
    sx = w_px / meta.media_box_width_points
    sy = h_px / meta.media_box_height_points

    def pt_rect(x0: float, y0: float, x1: float, y1: float) -> tuple[float, float, float, float]:
        # PDF origin lower-left → image origin upper-left
        left = x0 * sx
        right = x1 * sx
        top = h_px - y1 * sy
        bottom = h_px - y0 * sy
        return (left, top, right, bottom)

    outside = float(
        meta.outside_bleed_points
        if meta.outside_bleed_points is not None
        else (meta.bleed_points or 0.0)
    )
    top = float(meta.top_bleed_points if meta.top_bleed_points is not None else outside)
    bottom = float(meta.bottom_bleed_points if meta.bottom_bleed_points is not None else outside)
    spine = float(meta.spine_width_points or 0.0)
    trim_w = meta.trim_width_inches * 72.0
    # back | spine | front
    back_x1 = outside + trim_w
    spine_x1 = back_x1 + spine
    front_x1 = spine_x1 + trim_w

    # Media box
    draw.rectangle(
        pt_rect(0, 0, meta.media_box_width_points, meta.media_box_height_points),
        outline=(0, 0, 0, 220),
        width=3,
    )
    # Bleed: left outside, right outside, top, bottom
    if outside > 0 or top > 0 or bottom > 0:
        draw.rectangle(
            pt_rect(
                outside,
                bottom,
                meta.media_box_width_points - outside,
                meta.media_box_height_points - top,
            ),
            outline=(255, 140, 0, 200),
            width=2,
        )
    # Back trim right edge (= back/spine boundary when outside bleed is only outer)
    draw.line([(back_x1 * sx, 0), (back_x1 * sx, h_px)], fill=(0, 120, 255, 220), width=2)
    draw.line([(spine_x1 * sx, 0), (spine_x1 * sx, h_px)], fill=(0, 120, 255, 220), width=2)
    # Front trim left is spine_x1; right outer bleed at front_x1
    draw.line([(front_x1 * sx, 0), (front_x1 * sx, h_px)], fill=(0, 160, 200, 180), width=1)
    try:
        font = ImageFont.load_default()
    except Exception:  # noqa: BLE001
        font = None
    mid_y = h_px // 2
    draw.text((8, mid_y), "BACK", fill=(0, 0, 0, 255), font=font)
    draw.text(((back_x1 + spine_x1) / 2 * sx - 10, mid_y), "SPINE", fill=(0, 0, 0, 255), font=font)
    draw.text(((spine_x1 + front_x1) / 2 * sx - 10, mid_y), "FRONT", fill=(0, 0, 0, 255), font=font)
    if meta.safe_inset_points is not None:
        inset = float(meta.safe_inset_points)
        draw.rectangle(
            pt_rect(
                outside + inset,
                bottom + inset,
                back_x1 - inset,
                meta.media_box_height_points - top - inset,
            ),
            outline=(0, 180, 80, 200),
            width=2,
        )
    if meta.barcode_reserve is not None:
        r = meta.barcode_reserve
        draw.rectangle(
            pt_rect(
                r.x_points, r.y_points, r.x_points + r.width_points, r.y_points + r.height_points
            ),
            outline=(220, 0, 0, 230),
            width=3,
        )
    spine_in = meta.spine_width_inches if meta.spine_width_inches is not None else 0.0
    label = (
        f"{w_px}×{h_px}px  ppi={meta.required_ppi}  "
        f"media={meta.media_box_width_points:.1f}×{meta.media_box_height_points:.1f}pt  "
        f"spine={spine_in:.3f}in  pages={meta.page_count}"
    )
    draw.text((8, 8), label, fill=(0, 0, 0, 255), font=font)
    overlay_path.parent.mkdir(parents=True, exist_ok=True)
    base.convert("RGB").save(overlay_path, format="PNG")


def _sample_barcode_reserve_uniformity(
    source: Path, meta: NormalizedTemplateMeta
) -> dict[str, Any] | None:
    """Heuristic only — does not prove absence of meaningful design content."""
    if meta.barcode_reserve is None or meta.required_ppi is None:
        return None
    from PIL import Image, ImageStat

    r = meta.barcode_reserve
    with Image.open(source) as im:
        rgb = im.convert("RGB")
        w_px, h_px = rgb.size
        sx = w_px / meta.media_box_width_points
        sy = h_px / meta.media_box_height_points
        left = int(r.x_points * sx)
        right = int((r.x_points + r.width_points) * sx)
        top = int(h_px - (r.y_points + r.height_points) * sy)
        bottom = int(h_px - r.y_points * sy)
        left = max(0, min(w_px, left))
        right = max(0, min(w_px, right))
        top = max(0, min(h_px, top))
        bottom = max(0, min(h_px, bottom))
        if right <= left or bottom <= top:
            return {"sampled": False, "reason": "empty-region"}
        crop = rgb.crop((left, top, right, bottom))
        stat = ImageStat.Stat(crop)
        means = stat.mean
        stddevs = stat.stddev
        mean_luma = (means[0] + means[1] + means[2]) / 3.0
        std_luma = (stddevs[0] + stddevs[1] + stddevs[2]) / 3.0
        approx_uniform_light = mean_luma >= 230.0 and std_luma <= 12.0
        return {
            "sampled": True,
            "meanLuma": round(mean_luma, 2),
            "stddevLuma": round(std_luma, 2),
            "approximatelyUniformLight": approx_uniform_light,
            "disclaimer": (
                "Automated blankness detection is heuristic only and does not prove "
                "the reserve contains no meaningful design content."
            ),
        }


def convert_raster_wrap(
    *,
    repo: Path,
    book_dir: Path,
    spec: dict[str, Any],
    source: Path | None = None,
    back: Path | None = None,
    spine: Path | None = None,
    front: Path | None = None,
    template_meta_path: Path | None = None,
    output_pdf: Path | None = None,
    interior_page_count: int | None = None,
    stage: bool = True,
    cleanup_intermediates: bool = False,
) -> RasterWrapResult:
    """
    Validate raster cover sources against template-meta and convert to a staged ``*_cvr.pdf``.

    With ``print.isbn``: ``{isbn}_cvr.pdf``. Without ISBN in ``status: planning``:
    ``{book.id}_cvr.pdf``. Supports ``raster-wrap`` and ``assembled-raster-wrap``.
    Never stretches, crops, pads, or resamples. Embedded PNG DPI is ignored for sizing.
    """
    result = RasterWrapResult(status="failed")
    cover = resolve_cover_cfg(spec)
    strategy = str(cover.get("strategy") or "").strip()
    result.strategy = strategy
    print_cfg = _as_dict(spec_ingramspark_target(spec).get("print"))
    policy = _cover_raster_policy(repo, spec)

    meta_path = template_meta_path or resolve_template_meta_path(book_dir, spec)
    work_dir = print_cover_work_dir(repo, spec)
    work_dir.mkdir(parents=True, exist_ok=True)
    result.work_dir = work_dir

    try:
        raw_meta = load_raw_template_meta(meta_path)
        meta = normalize_template_meta(raw_meta)
    except TemplateMetaError as exc:
        result.errors.append(str(exc))
        result.checks.append(PreflightCheck("template-meta", "failed", str(exc)))
        _write_reports(result, work_dir, repo=repo)
        return result

    if meta.form != "raster-v1" or meta.required_ppi is None:
        msg = (
            f"{strategy} requires versioned template-meta.yml with geometry + raster "
            "(expected pixels / required_ppi)"
        )
        result.errors.append(msg)
        result.checks.append(PreflightCheck("template-meta", "failed", msg))
        _write_reports(result, work_dir, repo=repo)
        return result

    assert meta.expected_width_pixels is not None
    assert meta.expected_height_pixels is not None

    measured_pages = interior_page_count
    if measured_pages is None:
        measured_pages = _read_interior_page_count(repo, spec)

    mfg_errors = _compare_manufacturing(
        meta=meta,
        print_cfg=print_cfg,
        cover=cover,
        interior_page_count=measured_pages,
    )
    for err in mfg_errors:
        result.errors.append(err)
    result.checks.append(
        PreflightCheck(
            "template-manufacturing-match",
            "failed" if mfg_errors else "passed",
            "; ".join(mfg_errors) if mfg_errors else "",
        )
    )
    # Keep legacy check id alias for preflight mapping
    result.checks.append(
        PreflightCheck(
            "manufacturing-match",
            "failed" if mfg_errors else "passed",
            "; ".join(mfg_errors) if mfg_errors else "",
        )
    )

    inspection_payload: dict[str, Any] = {}
    src: Path

    if strategy == "assembled-raster-wrap":
        try:
            components = require_components(meta)
            panel_paths = resolve_panel_assets(book_dir, spec, back=back, spine=spine, front=front)
        except (AssembleWrapError, RasterWrapError) as exc:
            result.errors.append(str(exc))
            result.checks.append(PreflightCheck("panel-assets", "failed", str(exc)))
            _write_reports(result, work_dir, repo=repo)
            return result

        sources_out: dict[str, Any] = {}
        height_ok = True
        widths = []
        for role in PANEL_ORDER:
            path = panel_paths[role]
            try:
                info = inspect_png(path)
            except RasterWrapError as exc:
                result.errors.append(str(exc))
                sources_out[role] = {"path": path.as_posix(), "status": "failed", "error": str(exc)}
                result.checks.append(PreflightCheck(f"{role}-dimensions", "failed", str(exc)))
                continue
            exp = components[role]
            info = {
                **info,
                "role": role,
                "expectedWidthPixels": exp.width,
                "expectedHeightPixels": exp.height,
                "status": "passed",
            }
            # Effective PPI from this panel's segment geometry
            if role == "spine" and meta.spine_width_inches:
                seg_w_in = meta.spine_width_inches
            elif role in {"back", "front"}:
                outside_in = (meta.outside_bleed_points or meta.bleed_points or 0) / 72.0
                seg_w_in = meta.trim_width_inches + outside_in
            else:
                seg_w_in = meta.media_box_width_inches
            seg_h_in = meta.media_box_height_inches
            try:
                info["effectiveHorizontalPpi"] = round(info["widthPixels"] / seg_w_in, 4)
                info["effectiveVerticalPpi"] = round(info["heightPixels"] / seg_h_in, 4)
            except Exception:  # noqa: BLE001
                pass

            if info["widthPixels"] != exp.width or info["heightPixels"] != exp.height:
                msg = panel_dimension_mismatch_message(
                    role=role,
                    source_path=path,
                    width=int(info["widthPixels"]),
                    height=int(info["heightPixels"]),
                    expected_w=exp.width,
                    expected_h=exp.height,
                    page_count=meta.page_count,
                )
                result.errors.append(msg)
                info["status"] = "failed"
                result.checks.append(PreflightCheck(f"{role}-dimensions", "failed", msg))
            else:
                result.checks.append(PreflightCheck(f"{role}-dimensions", "passed"))
                emb = info.get("embeddedDpi")
                if emb and (
                    abs(float(emb[0]) - float(meta.required_ppi)) > 0.5
                    or abs(float(emb[1]) - float(meta.required_ppi)) > 0.5
                ):
                    result.warnings.append(
                        f"{role}: embedded PNG DPI {emb} differs from required_ppi "
                        f"{meta.required_ppi}; pixels match (embedded DPI not authoritative)."
                    )

            # Transparency per panel
            if info.get("hasTransparentPixels"):
                msg = (
                    f"{role} PNG contains transparent or partially transparent pixels. "
                    "The converter will not silently flatten transparency against an "
                    "assumed background."
                )
                result.errors.append(msg)
                result.checks.append(PreflightCheck(f"{role}-transparency", "failed", msg))
                info["status"] = "failed"
            elif info.get("hasAlpha"):
                result.warnings.append(
                    f"{role}: alpha channel present but all pixels are fully opaque"
                )
                result.checks.append(
                    PreflightCheck(
                        f"{role}-transparency",
                        "warning",
                        "Opaque alpha channel",
                    )
                )
            else:
                result.checks.append(PreflightCheck(f"{role}-transparency", "passed"))

            mode = str(info.get("colorSpace") or "")
            if mode == "P":
                msg = f"{role}: indexed PNG is not accepted; export flattened RGB."
                result.errors.append(msg)
                result.checks.append(PreflightCheck(f"{role}-color-type", "failed", msg))
                info["status"] = "failed"
            elif mode not in {"RGB", "RGBA"} and mode not in {"L", "LA"}:
                msg = f"{role}: unsupported PNG color type {mode!r}"
                result.errors.append(msg)
                result.checks.append(PreflightCheck(f"{role}-color-type", "failed", msg))
                info["status"] = "failed"
            else:
                result.checks.append(PreflightCheck(f"{role}-color-type", "passed"))

            sources_out[role] = info
            widths.append(int(info["widthPixels"]))
            if int(info["heightPixels"]) != meta.expected_height_pixels:
                height_ok = False

        result.sources = sources_out
        inspection_payload = {"strategy": strategy, "panels": sources_out}

        if height_ok and len(sources_out) == 3:
            result.checks.append(PreflightCheck("component-height-consistency", "passed"))
        else:
            if not any("height" in e.lower() for e in result.errors):
                result.errors.append(
                    "All panels must share the exact full-wrap height "
                    f"({meta.expected_height_pixels} px)"
                )
            result.checks.append(PreflightCheck("component-height-consistency", "failed"))

        if len(widths) == 3 and sum(widths) == meta.expected_width_pixels:
            result.checks.append(PreflightCheck("component-width-sum", "passed"))
        elif len(widths) == 3:
            msg = (
                f"Panel widths sum to {sum(widths)} px but full_wrap width is "
                f"{meta.expected_width_pixels} px"
            )
            result.errors.append(msg)
            result.checks.append(PreflightCheck("component-width-sum", "failed", msg))

        result.checks.append(
            PreflightCheck(
                "component-transparency",
                "failed"
                if any(
                    c.id.endswith("-transparency") and c.status == "failed" for c in result.checks
                )
                else "passed",
            )
        )

        if result.errors:
            result.status = "failed"
            (work_dir / "source-inspection.json").write_text(
                json.dumps(sanitize_report_paths(inspection_payload, repo=repo), indent=2) + "\n",
                encoding="utf-8",
            )
            _write_reports(result, work_dir, repo=repo)
            return result

        assembled_path = work_dir / "assembled-wrap-rgb.png"
        try:
            assembly_meta = assemble_rgb_wrap(
                panels=panel_paths,
                expected=components,
                full_width=meta.expected_width_pixels,
                full_height=meta.expected_height_pixels,
                output_path=assembled_path,
            )
        except AssembleWrapError as exc:
            result.errors.append(str(exc))
            result.checks.append(PreflightCheck("assembly-dimensions", "failed", str(exc)))
            (work_dir / "source-inspection.json").write_text(
                json.dumps(sanitize_report_paths(inspection_payload, repo=repo), indent=2) + "\n",
                encoding="utf-8",
            )
            _write_reports(result, work_dir, repo=repo)
            return result

        result.assembly = assembly_meta
        result.checks.append(PreflightCheck("assembly-dimensions", "passed"))
        result.checks.append(PreflightCheck("assembly-panel-order", "passed", "back,spine,front"))
        result.checks.append(PreflightCheck("assembly-no-resampling", "passed"))
        result.manual_review.extend(
            [
                "Confirm panel boundaries align correctly.",
                "Confirm spine text is centered and upright.",
            ]
        )
        src = assembled_path
        try:
            source_info = inspect_png(src)
        except RasterWrapError as exc:
            result.errors.append(str(exc))
            _write_reports(result, work_dir, repo=repo)
            return result
        result.source = dict(source_info)
        inspection_payload["assembled"] = source_info
        (work_dir / "source-inspection.json").write_text(
            json.dumps(sanitize_report_paths(inspection_payload, repo=repo), indent=2) + "\n",
            encoding="utf-8",
        )
    else:
        # Single full-wrap PNG
        src = source or resolve_raster_source(book_dir, spec)
        try:
            source_info = inspect_png(src)
        except RasterWrapError as exc:
            result.errors.append(str(exc))
            result.checks.append(PreflightCheck("png-inspect", "failed", str(exc)))
            _write_reports(result, work_dir, repo=repo)
            return result

        result.source = dict(source_info)
        (work_dir / "source-inspection.json").write_text(
            json.dumps(sanitize_report_paths(source_info, repo=repo), indent=2) + "\n",
            encoding="utf-8",
        )

    eff_x, eff_y = effective_ppi(
        width_pixels=int(source_info["widthPixels"]),
        height_pixels=int(source_info["heightPixels"]),
        media_box_width_inches=meta.media_box_width_inches,
        media_box_height_inches=meta.media_box_height_inches,
    )
    result.template = {
        "path": meta_path.as_posix(),
        "mediaBoxWidthPoints": meta.media_box_width_points,
        "mediaBoxHeightPoints": meta.media_box_height_points,
        "requiredPpi": meta.required_ppi,
        "expectedWidthPixels": meta.expected_width_pixels,
        "expectedHeightPixels": meta.expected_height_pixels,
        "pageCount": meta.page_count,
        "effectiveHorizontalPpi": round(eff_x, 4),
        "effectiveVerticalPpi": round(eff_y, 4),
    }

    width = int(source_info["widthPixels"])
    height = int(source_info["heightPixels"])
    exp_w = meta.expected_width_pixels
    exp_h = meta.expected_height_pixels
    # Orientation: landscape wrap expected when media width > height.
    src_landscape = width >= height
    meta_landscape = meta.media_box_width_points >= meta.media_box_height_points
    if src_landscape != meta_landscape:
        msg = (
            "Source orientation does not match template orientation "
            f"(source {width}×{height} px vs media "
            f"{meta.media_box_width_points}×{meta.media_box_height_points} pt). "
            "The converter will not silently rotate the source."
        )
        result.errors.append(msg)
        result.checks.append(PreflightCheck("orientation", "failed", msg))
    else:
        result.checks.append(PreflightCheck("orientation", "passed"))

    if width != exp_w or height != exp_h:
        msg = dimension_mismatch_message(
            source_path=src,
            width=width,
            height=height,
            expected_w=exp_w,
            expected_h=exp_h,
            required_ppi=meta.required_ppi,
        )
        result.errors.append(msg)
        result.checks.append(PreflightCheck("raster-dimensions", "failed", msg))
    else:
        result.checks.append(PreflightCheck("raster-dimensions", "passed"))
        # Embedded DPI may be wrong; ignore when pixels match.
        emb = source_info.get("embeddedDpi")
        if emb and (
            abs(float(emb[0]) - float(meta.required_ppi)) > 0.5
            or abs(float(emb[1]) - float(meta.required_ppi)) > 0.5
        ):
            result.warnings.append(
                f"Embedded PNG DPI {emb} differs from required_ppi {meta.required_ppi}; "
                f"pixels match, so conversion proceeds (embedded DPI is not authoritative)."
            )

    # Alpha / transparency policy
    allow_flatten = bool(policy.get("allow_transparency_flatten", False))
    if source_info.get("hasTransparentPixels"):
        msg = (
            "Source PNG contains transparent or partially transparent pixels. "
            "The converter will not silently flatten transparency against an assumed background."
        )
        if allow_flatten:
            result.warnings.append(
                msg + " Profile allow_transparency_flatten is true (not used yet)."
            )
            result.checks.append(PreflightCheck("transparency", "warning", msg))
        else:
            result.errors.append(msg)
            result.checks.append(PreflightCheck("transparency", "failed", msg))
    elif source_info.get("hasAlpha"):
        result.checks.append(
            PreflightCheck(
                "transparency",
                "passed",
                "Alpha channel present but all pixels are fully opaque",
            )
        )
    else:
        result.checks.append(PreflightCheck("transparency", "passed"))

    mode = str(source_info.get("colorSpace") or "")
    if mode not in {"RGB", "RGBA"}:
        if mode in {"L", "LA"}:
            result.warnings.append(
                f"Grayscale PNG mode {mode!r} accepted with warning; prefer RGB wrap art."
            )
            result.checks.append(PreflightCheck("png-color-type", "warning", mode))
        elif mode == "P":
            msg = (
                "Indexed PNG (palette) is not accepted for raster-wrap; export a flattened RGB PNG."
            )
            result.errors.append(msg)
            result.checks.append(PreflightCheck("png-color-type", "failed", msg))
        else:
            msg = f"Unsupported PNG color type {mode!r}; export a flattened RGB PNG."
            result.errors.append(msg)
            result.checks.append(PreflightCheck("png-color-type", "failed", msg))
    else:
        result.checks.append(PreflightCheck("png-color-type", "passed"))

    barcode_mode = str(cover.get("barcode_mode") or "").strip()
    if barcode_mode == "ingram-generated":
        reserve_errors, reserve_warnings = validate_barcode_reserve_geometry(meta)
        for err in reserve_errors:
            result.errors.append(err)
        for warning in reserve_warnings:
            result.warnings.append(warning)
        result.checks.append(
            PreflightCheck(
                "barcode-reserve-geometry",
                "failed" if reserve_errors else ("warning" if reserve_warnings else "passed"),
                "; ".join(reserve_errors or reserve_warnings),
            )
        )
        if meta.barcode_reserve is not None:
            r = meta.barcode_reserve
            result.barcode_reserve = {
                "required": r.required,
                "panel": r.panel,
                "widthInches": r.width_inches,
                "heightInches": r.height_inches,
                "xPoints": r.x_points,
                "yPoints": r.y_points,
                "widthPoints": r.width_points,
                "heightPoints": r.height_points,
                "xPixels": r.x_pixels,
                "yPixels": r.y_pixels,
                "widthPixels": r.width_pixels,
                "heightPixels": r.height_pixels,
            }
            sample = _sample_barcode_reserve_uniformity(src, meta)
            if sample:
                result.barcode_reserve["contentHeuristic"] = sample
                if sample.get("approximatelyUniformLight") is False:
                    result.checks.append(
                        PreflightCheck(
                            "barcode-reserve-content",
                            "manual-review",
                            "Reserve region does not look approximately uniform/light; human review required.",
                        )
                    )
                else:
                    result.checks.append(
                        PreflightCheck(
                            "barcode-reserve-content",
                            "manual-review",
                            "Heuristic suggests a light uniform region; still requires human confirmation.",
                        )
                    )
        result.manual_review.extend(
            [
                "Confirm the barcode reserve contains no text or important artwork.",
                "Inspect front, spine, and back alignment against the original Ingram template.",
                "Confirm IngramSpark will generate the barcode in the reserved area "
                "(barcode_mode: ingram-generated); this tool does not invent ISBNs or barcodes.",
            ]
        )
    elif barcode_mode == "supplied":
        result.manual_review.append(
            "Confirm the supplied barcode is 100% K on white in the reserved area."
        )
        result.checks.append(PreflightCheck("barcode-reserve-geometry", "manual-review"))
    else:
        result.errors.append(
            f"print.cover.barcode_mode must be ingram-generated or supplied (got {barcode_mode!r})"
        )

    try:
        _draw_inspection_overlay(
            source=src,
            overlay_path=work_dir / "inspection-overlay.png",
            meta=meta,
            source_info=source_info,
        )
        result.overlay_path = work_dir / "inspection-overlay.png"
        result.checks.append(PreflightCheck("inspection-overlay", "passed"))
    except Exception as exc:  # noqa: BLE001
        result.warnings.append(f"Failed to write inspection overlay: {exc}")
        result.checks.append(PreflightCheck("inspection-overlay", "warning", str(exc)))

    # Abort before color conversion if blocking errors already recorded.
    if result.errors:
        result.status = "failed"
        result.color = {
            "profileStatus": policy.get("status"),
            "provisional": True,
            "skipped": True,
            "reason": "blocking validation errors",
        }
        _write_reports(result, work_dir, repo=repo)
        return result

    isbn = print_isbn_optional(spec)
    expected_name = print_cover_basename(spec)
    staged = output_pdf or print_cover_pdf_path(repo, spec)
    if staged.name != expected_name:
        if isbn:
            msg = (
                f"Output filename must be derived from the print ISBN ({expected_name}); "
                f"got {staged.name}"
            )
        else:
            msg = (
                f"Output filename must be derived from book.id without print.isbn "
                f"({expected_name}); got {staged.name}"
            )
        result.errors.append(msg)
        result.status = "failed"
        _write_reports(result, work_dir, repo=repo)
        return result
    if not isbn:
        result.warnings.append(
            f"No print.isbn configured; staging cover preview as {expected_name}. "
            "Assign a print ISBN before packaging or IngramSpark upload."
        )

    tiff_path = work_dir / "assembled-wrap-cmyk.tif"
    intermediate_pdf = work_dir / "cover.pdf"
    try:
        color_meta = _convert_png_to_cmyk_pdf(
            source=src,
            tiff_path=tiff_path,
            pdf_path=intermediate_pdf,
            required_ppi=meta.required_ppi,
            policy=policy,
        )
    except RasterWrapError as exc:
        result.errors.append(str(exc))
        result.checks.append(PreflightCheck("color-conversion", "failed", str(exc)))
        result.status = "failed"
        _write_reports(result, work_dir, repo=repo)
        return result

    result.color = color_meta
    result.color["provisional"] = str(policy.get("status") or "") != "production-blocking"
    result.checks.append(
        PreflightCheck(
            "color-conversion",
            "warning" if result.color["provisional"] else "passed",
            f"status={policy.get('status')}; not labeled fully Ingram-approved",
        )
    )

    inspection = inspect_pdf(intermediate_pdf)
    detected: list[str] = []
    if inspection.mentions_device_cmyk:
        detected.append("DeviceCMYK")
    if inspection.mentions_device_rgb:
        detected.append("DeviceRGB")
    if inspection.mentions_device_gray:
        detected.append("DeviceGray")
    if inspection.mentions_icc_based:
        detected.append("ICCBased")
    result.output = {
        "path": staged.as_posix() if stage else intermediate_pdf.as_posix(),
        "pageCount": inspection.page_count,
        "mediaBoxWidthPoints": (
            inspection.page_size_pts[0][0] if inspection.page_size_pts else None
        ),
        "mediaBoxHeightPoints": (
            inspection.page_size_pts[0][1] if inspection.page_size_pts else None
        ),
        "detectedColorSpaces": detected,
        "rotation": 0,
        "filename": staged.name,
        "printIsbn": isbn,
    }

    if inspection.errors:
        result.errors.extend(inspection.errors)
    if inspection.page_count != 1:
        result.errors.append(f"Output PDF must be exactly one page (got {inspection.page_count})")
        result.checks.append(PreflightCheck("pdf-page-count", "failed"))
    else:
        result.checks.append(PreflightCheck("pdf-page-count", "passed"))

    if inspection.page_size_pts:
        out_w, out_h = inspection.page_size_pts[0]
        if (
            abs(out_w - meta.media_box_width_points) > MEDIA_BOX_POINT_TOLERANCE
            or abs(out_h - meta.media_box_height_points) > MEDIA_BOX_POINT_TOLERANCE
        ):
            msg = (
                f"Output media box {out_w}×{out_h} pt does not match template "
                f"{meta.media_box_width_points}×{meta.media_box_height_points} pt"
            )
            result.errors.append(msg)
            result.checks.append(PreflightCheck("pdf-media-box", "failed", msg))
        else:
            result.checks.append(PreflightCheck("pdf-media-box", "passed"))
        if not media_box_matches_trim(
            inspection,
            width_inches=meta.media_box_width_inches,
            height_inches=meta.media_box_height_inches,
            tolerance_inches=TRIM_TOLERANCE_INCHES,
        ):
            result.errors.append("Output media box inches do not match template-meta media box")
    else:
        result.errors.append("Could not read output PDF media box")
        result.checks.append(PreflightCheck("pdf-media-box", "failed"))

    if inspection.mentions_device_rgb:
        result.warnings.append(
            "Output PDF still references DeviceRGB; CMYK conversion may be incomplete"
        )
        result.checks.append(PreflightCheck("pdf-no-rgb", "warning"))
    else:
        result.checks.append(PreflightCheck("pdf-no-rgb", "passed"))

    if not inspection.mentions_device_cmyk and not inspection.mentions_icc_based:
        result.warnings.append("Could not confirm CMYK/ICCBased color in output PDF")
        result.checks.append(PreflightCheck("pdf-cmyk", "warning"))
    else:
        result.checks.append(PreflightCheck("pdf-cmyk", "passed"))

    # PDF/X / output intent remain provisional.
    if inspection.has_output_intent:
        result.checks.append(
            PreflightCheck(
                "pdfx-output-intent",
                "manual-review",
                "OutputIntent present; account verification still required",
            )
        )
    else:
        result.checks.append(
            PreflightCheck(
                "pdfx-output-intent",
                "warning",
                "No PDF/X OutputIntent embedded (profile output_intent=none-provisional)",
            )
        )
        result.warnings.append(
            "PDF/X output-intent / ICC policy remains provisional "
            f"(cover_raster.status={policy.get('status')})"
        )

    result.manual_review.append(
        "Do not treat this PDF as IngramSpark-ready until account preflight accepts "
        "the color/PDF/X construction."
    )

    if result.errors:
        result.status = "failed"
        _write_reports(result, work_dir, repo=repo)
        return result

    if stage:
        print_output_dir(repo, spec).mkdir(parents=True, exist_ok=True)
        shutil.copy2(intermediate_pdf, staged)
        result.staged_cover_path = staged
        result.output["path"] = staged.as_posix()

    if cleanup_intermediates:
        tiff_path.unlink(missing_ok=True)

    # passed with warnings still "passed" for dimension-correct experimental color path
    result.status = "passed"
    _write_reports(result, work_dir, repo=repo)
    return result


def _write_reports(result: RasterWrapResult, work_dir: Path, *, repo: Path | None = None) -> None:
    work_dir.mkdir(parents=True, exist_ok=True)
    json_path = work_dir / "preflight.json"
    txt_path = work_dir / "preflight.txt"
    payload = result.to_dict()
    text = result.human_text()
    if repo is not None:
        payload = sanitize_report_paths(payload, repo=repo)
        # human_text embeds absolute paths; rewrite repo root for packaged reports.
        root = repo.resolve().as_posix().rstrip("/")
        text = text.replace(root + "/", "").replace(root, ".")
    json_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    txt_path.write_text(text, encoding="utf-8")
    result.preflight_json_path = json_path
    result.preflight_txt_path = txt_path


def convert_raster_wrap_or_raise(**kwargs: Any) -> RasterWrapResult:
    result = convert_raster_wrap(**kwargs)
    if not result.ok:
        detail = "\n- ".join(result.errors) if result.errors else result.human_text()
        raise RasterWrapError("Raster wrap conversion failed:\n- " + detail)
    return result
