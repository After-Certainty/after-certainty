"""Validate IngramSpark print wrap + template-meta.yml (supplied-wrap PDF or raster-wrap PNG)."""

from __future__ import annotations

import json
import shutil
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from book_specs import spec_ingramspark_enabled, spec_ingramspark_target
from ingramspark.paths import (
    print_cover_pdf_path,
    print_isbn,
    print_output_dir,
    print_page_count_path,
)
from ingramspark.pdf_inspect import inspect_pdf, media_box_matches_trim
from ingramspark.template_meta import (
    TemplateMetaError,
    load_raw_template_meta,
    load_template_meta_schema,
    normalize_template_meta,
)

DEFAULT_TEMPLATE_META_REL = "assets/ingramspark/template-meta.yml"
TRIM_TOLERANCE_INCHES = 0.02
# Paperback spine text is forbidden below this interior page count (IngramSpark guidance).
MIN_PAGES_FOR_SPINE_TEXT = 48


class CoverValidateError(ValueError):
    """Blocking print-cover validation failure."""


@dataclass
class CoverValidateResult:
    ok: bool
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    staged_cover_path: Path | None = None
    report_path: Path | None = None
    template_meta_path: Path | None = None
    wrap_path: Path | None = None
    interior_page_count: int | None = None
    template_page_count: int | None = None
    strategy: str | None = None
    raster_preflight: dict[str, Any] | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "ok": self.ok,
            "errors": list(self.errors),
            "warnings": list(self.warnings),
            "staged_cover_path": (
                self.staged_cover_path.as_posix() if self.staged_cover_path else None
            ),
            "report_path": self.report_path.as_posix() if self.report_path else None,
            "template_meta_path": (
                self.template_meta_path.as_posix() if self.template_meta_path else None
            ),
            "wrap_path": self.wrap_path.as_posix() if self.wrap_path else None,
            "interior_page_count": self.interior_page_count,
            "template_page_count": self.template_page_count,
            "strategy": self.strategy,
            "raster_preflight": self.raster_preflight,
        }


def _as_dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def resolve_template_meta_path(book_dir: Path, *, relative: str | None = None) -> Path:
    rel = (relative or DEFAULT_TEMPLATE_META_REL).strip()
    return (book_dir / rel).resolve()


def load_template_meta(path: Path) -> dict[str, Any]:
    """Load and schema-validate template-meta.yml; returns the raw mapping."""
    try:
        return load_raw_template_meta(path)
    except TemplateMetaError as exc:
        raise CoverValidateError(str(exc)) from exc


def resolve_wrap_path(book_dir: Path, spec: dict[str, Any]) -> Path:
    target = spec_ingramspark_target(spec)
    print_cfg = _as_dict(target.get("print"))
    cover = _as_dict(print_cfg.get("cover"))
    strategy = str(cover.get("strategy") or "").strip()
    if strategy not in {"supplied-wrap", "raster-wrap", "assembled-raster-wrap"}:
        raise CoverValidateError(
            f"print.cover.strategy {strategy!r} is not supported yet; "
            f"use supplied-wrap, raster-wrap, or assembled-raster-wrap"
        )
    if strategy == "assembled-raster-wrap":
        assets = _as_dict(cover.get("assets"))
        for role in ("back", "spine", "front"):
            rel = str(assets.get(role) or "").strip()
            if not rel:
                raise CoverValidateError(
                    f"publishing.targets.ingramspark.print.cover.assets.{role} is required"
                )
            path = (book_dir / rel).resolve()
            if not path.is_file():
                raise CoverValidateError(
                    f"Missing print cover {role} PNG: {rel} (under {book_dir})."
                )
        # Return back panel as the representative source path for reports.
        return (book_dir / str(assets["back"]).strip()).resolve()
    rel = str(cover.get("source") or "").strip()
    if not rel:
        raise CoverValidateError("publishing.targets.ingramspark.print.cover.source is required")
    path = (book_dir / rel).resolve()
    if not path.is_file():
        kind = "PNG" if strategy == "raster-wrap" else "PDF"
        raise CoverValidateError(
            f"Missing print cover wrap {kind}: {rel} (under {book_dir}). "
            f"Supply a full-wrap cover matching the IngramSpark template."
        )
    return path


def _require_print_enabled(spec: dict[str, Any]) -> dict[str, Any]:
    if not spec_ingramspark_enabled(spec):
        raise CoverValidateError("publishing.targets.ingramspark.enabled must be true")
    target = spec_ingramspark_target(spec)
    print_cfg = _as_dict(target.get("print"))
    if print_cfg.get("enabled", False) is not True:
        raise CoverValidateError("publishing.targets.ingramspark.print.enabled must be true")
    return print_cfg


def _inches_close(a: float, b: float, *, tol: float = TRIM_TOLERANCE_INCHES) -> bool:
    return abs(a - b) <= tol


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


def stale_page_count_message(*, template_pages: int, interior_pages: int) -> str:
    return (
        f"Print cover template was generated for {template_pages} pages, but the interior "
        f"now has {interior_pages} pages. Request or generate a new IngramSpark cover "
        f"template before packaging."
    )


def _validate_supplied_wrap(
    *,
    repo: Path,
    book_dir: Path,
    spec: dict[str, Any],
    print_cfg: dict[str, Any],
    cover: dict[str, Any],
    interior: dict[str, Any],
    trim: dict[str, Any],
    interior_page_count: int | None,
    template_meta_relative: str | None,
    stage: bool,
    result: CoverValidateResult,
) -> CoverValidateResult:
    try:
        wrap_path = resolve_wrap_path(book_dir, spec)
    except CoverValidateError as exc:
        result.ok = False
        result.errors.append(str(exc))
        return result
    result.wrap_path = wrap_path

    meta_rel = template_meta_relative
    if not meta_rel:
        meta_rel = str(cover.get("template_metadata") or "").strip() or None
    meta_path = resolve_template_meta_path(book_dir, relative=meta_rel)
    result.template_meta_path = meta_path
    try:
        raw = load_template_meta(meta_path)
        meta = normalize_template_meta(raw)
    except (CoverValidateError, TemplateMetaError) as exc:
        result.ok = False
        result.errors.append(str(exc))
        return result

    meta_pages = meta.page_count
    result.template_page_count = meta_pages
    book_template_pages = cover.get("template_page_count")
    if isinstance(book_template_pages, int) and book_template_pages != meta_pages:
        result.errors.append(
            f"book.yml print.cover.template_page_count is {book_template_pages}, but "
            f"template-meta.yml page_count is {meta_pages}. Keep them in sync with the "
            f"Cover Template Generator request."
        )

    measured = interior_page_count
    if measured is None:
        measured = _read_interior_page_count(repo, spec)
    result.interior_page_count = measured
    if measured is None:
        result.errors.append(
            "Interior page count is unknown. Export the print interior first "
            f"(expected {print_page_count_path(repo, spec)}) or pass --interior-page-count."
        )
    elif measured != meta_pages:
        result.errors.append(
            stale_page_count_message(template_pages=meta_pages, interior_pages=measured)
        )

    try:
        cfg_w = float(trim["width_inches"])
        cfg_h = float(trim["height_inches"])
    except (KeyError, TypeError, ValueError):
        result.errors.append("publishing.targets.ingramspark.print.trim is missing or invalid")
        cfg_w = None
        cfg_h = None
    if cfg_w is not None and cfg_h is not None:
        same_orientation = _inches_close(cfg_w, meta.trim_width_inches) and _inches_close(
            cfg_h, meta.trim_height_inches
        )
        swapped = _inches_close(cfg_w, meta.trim_height_inches) and _inches_close(
            cfg_h, meta.trim_width_inches
        )
        if not same_orientation and not swapped:
            result.errors.append(
                f"Configured print.trim {cfg_w}x{cfg_h} in does not match "
                f"template-meta.yml trim {meta.trim_width_inches}x{meta.trim_height_inches} in. "
                f"print.trim is authoritative; update the template request or book.yml."
            )

    cfg_binding = str(print_cfg.get("binding") or "").strip()
    if cfg_binding and meta.binding and cfg_binding != meta.binding:
        result.errors.append(
            f"print.binding {cfg_binding!r} does not match template-meta binding {meta.binding!r}"
        )

    cfg_paper = str(interior.get("paper") or "").strip()
    if cfg_paper and meta.paper and cfg_paper != meta.paper:
        result.errors.append(
            f"print.interior.paper {cfg_paper!r} does not match template-meta paper {meta.paper!r}"
        )

    cfg_color = str(interior.get("color_mode") or "").strip()
    if cfg_color and meta.color_mode and cfg_color != meta.color_mode:
        result.errors.append(
            f"print.interior.color_mode {cfg_color!r} does not match "
            f"template-meta color_mode {meta.color_mode!r}"
        )

    barcode_mode = str(cover.get("barcode_mode") or "").strip()
    if barcode_mode not in {"ingram-generated", "supplied"}:
        result.errors.append(
            f"print.cover.barcode_mode must be ingram-generated or supplied (got {barcode_mode!r})"
        )
    else:
        barcode_supplied = meta.barcode_supplied
        if barcode_mode == "supplied" and barcode_supplied is not True:
            result.errors.append(
                "barcode_mode is supplied, but template-meta.yml does not set "
                "barcode_supplied: true. Confirm the wrap includes a 100% K barcode on white "
                "in the reserved area."
            )
        if barcode_mode == "ingram-generated" and barcode_supplied is True:
            result.errors.append(
                "barcode_mode is ingram-generated, but template-meta.yml sets "
                "barcode_supplied: true. Use barcode_mode: supplied or clear barcode_supplied."
            )

    if measured is not None and measured < MIN_PAGES_FOR_SPINE_TEXT and meta.spine_text is True:
        result.errors.append(
            f"Spine text is present in template-meta, but interior page count is {measured} "
            f"(paperback spine text requires at least {MIN_PAGES_FOR_SPINE_TEXT} pages)."
        )

    inspection = inspect_pdf(wrap_path)
    if inspection.errors:
        result.errors.extend(inspection.errors)
    if inspection.page_count is not None and inspection.page_count != 1:
        result.warnings.append(
            f"Cover wrap has {inspection.page_count} pages; IngramSpark expects a single-page wrap"
        )
    box_w = meta.media_box_width_inches
    box_h = meta.media_box_height_inches
    if not media_box_matches_trim(
        inspection,
        width_inches=box_w,
        height_inches=box_h,
        tolerance_inches=TRIM_TOLERANCE_INCHES,
    ):
        result.errors.append(
            f"Cover wrap media box {inspection.media_box_inches!r} does not match "
            f"template-meta.yml media_box {box_w}x{box_h} in. "
            f"Do not scale or crop a stale wrap to force a fit."
        )

    if inspection.mentions_device_rgb is True:
        result.warnings.append(
            "Cover wrap references DeviceRGB; IngramSpark print covers should be CMYK"
        )
    if inspection.all_fonts_embedded is False:
        result.errors.append("Cover wrap has one or more fonts that are not embedded")

    result.ok = not result.errors
    out_dir = print_output_dir(repo, spec)
    out_dir.mkdir(parents=True, exist_ok=True)
    report_path = out_dir / "cover-validation.json"
    if result.ok and stage:
        dest = print_cover_pdf_path(repo, spec)
        shutil.copy2(wrap_path, dest)
        result.staged_cover_path = dest
    report_path.write_text(json.dumps(result.to_dict(), indent=2) + "\n", encoding="utf-8")
    result.report_path = report_path
    return result


def _validate_raster_wrap(
    *,
    repo: Path,
    book_dir: Path,
    spec: dict[str, Any],
    cover: dict[str, Any],
    interior_page_count: int | None,
    template_meta_relative: str | None,
    stage: bool,
    result: CoverValidateResult,
) -> CoverValidateResult:
    from ingramspark.raster_wrap import RasterWrapError, convert_raster_wrap

    meta_rel = template_meta_relative
    if not meta_rel:
        meta_rel = str(cover.get("template_metadata") or "").strip() or None
    meta_path = resolve_template_meta_path(book_dir, relative=meta_rel)
    result.template_meta_path = meta_path
    try:
        source = resolve_wrap_path(book_dir, spec)
    except CoverValidateError as exc:
        result.ok = False
        result.errors.append(str(exc))
        return result
    result.wrap_path = source

    try:
        strategy = str(cover.get("strategy") or "").strip()
        kwargs: dict[str, Any] = {
            "repo": repo,
            "book_dir": book_dir,
            "spec": spec,
            "template_meta_path": meta_path,
            "interior_page_count": interior_page_count,
            "stage": stage,
        }
        if strategy == "raster-wrap":
            kwargs["source"] = source
        raster = convert_raster_wrap(**kwargs)
    except RasterWrapError as exc:
        result.ok = False
        result.errors.append(str(exc))
        return result

    result.raster_preflight = raster.to_dict()
    result.errors.extend(raster.errors)
    result.warnings.extend(raster.warnings)
    result.staged_cover_path = raster.staged_cover_path
    result.template_page_count = (
        int(raster.template["pageCount"]) if "pageCount" in raster.template else None
    )
    result.interior_page_count = interior_page_count
    result.ok = raster.ok and not result.errors

    out_dir = print_output_dir(repo, spec)
    out_dir.mkdir(parents=True, exist_ok=True)
    report_path = out_dir / "cover-validation.json"
    report_path.write_text(json.dumps(result.to_dict(), indent=2) + "\n", encoding="utf-8")
    result.report_path = report_path
    return result


def validate_print_cover(
    *,
    repo: Path,
    book_dir: Path,
    spec: dict[str, Any],
    interior_page_count: int | None = None,
    template_meta_relative: str | None = None,
    stage: bool = True,
) -> CoverValidateResult:
    """
    Validate print cover + template-meta against ``print.trim`` and interior page count.

    ``supplied-wrap``: validate PDF wrap and optionally stage to ``{isbn}_cvr.pdf``.
    ``raster-wrap`` / ``assembled-raster-wrap``: convert PNG(s) → print cover PDF, then stage.
    """
    result = CoverValidateResult(ok=True)
    print_cfg = _require_print_enabled(spec)
    cover = _as_dict(print_cfg.get("cover"))
    interior = _as_dict(print_cfg.get("interior"))
    trim = _as_dict(print_cfg.get("trim"))
    strategy = str(cover.get("strategy") or "").strip()
    result.strategy = strategy

    if strategy in {"raster-wrap", "assembled-raster-wrap"}:
        return _validate_raster_wrap(
            repo=repo,
            book_dir=book_dir,
            spec=spec,
            cover=cover,
            interior_page_count=interior_page_count,
            template_meta_relative=template_meta_relative,
            stage=stage,
            result=result,
        )
    if strategy == "supplied-wrap":
        return _validate_supplied_wrap(
            repo=repo,
            book_dir=book_dir,
            spec=spec,
            print_cfg=print_cfg,
            cover=cover,
            interior=interior,
            trim=trim,
            interior_page_count=interior_page_count,
            template_meta_relative=template_meta_relative,
            stage=stage,
            result=result,
        )

    result.ok = False
    result.errors.append(
        f"print.cover.strategy {strategy!r} is not supported yet; "
        f"use supplied-wrap, raster-wrap, or assembled-raster-wrap"
    )
    return result


def validate_print_cover_or_raise(
    *,
    repo: Path,
    book_dir: Path,
    spec: dict[str, Any],
    interior_page_count: int | None = None,
    template_meta_relative: str | None = None,
    stage: bool = True,
) -> CoverValidateResult:
    result = validate_print_cover(
        repo=repo,
        book_dir=book_dir,
        spec=spec,
        interior_page_count=interior_page_count,
        template_meta_relative=template_meta_relative,
        stage=stage,
    )
    if not result.ok:
        raise CoverValidateError("Print cover validation failed:\n- " + "\n- ".join(result.errors))
    return result


def isbn_for_cover(spec: dict[str, Any]) -> str:
    return print_isbn(spec)


# Re-export for tests/tools that imported the schema helper from this module.
__all__ = [
    "CoverValidateError",
    "CoverValidateResult",
    "DEFAULT_TEMPLATE_META_REL",
    "isbn_for_cover",
    "load_template_meta",
    "load_template_meta_schema",
    "resolve_template_meta_path",
    "resolve_wrap_path",
    "stale_page_count_message",
    "validate_print_cover",
    "validate_print_cover_or_raise",
]
