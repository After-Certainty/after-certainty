"""Validate supplied IngramSpark print wrap + template-meta.yml (INGRAM-005)."""

from __future__ import annotations

import json
import shutil
from dataclasses import dataclass, field
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

from book_specs import spec_ingramspark_enabled, spec_ingramspark_target
from ingramspark.paths import (
    print_cover_pdf_path,
    print_isbn,
    print_output_dir,
    print_page_count_path,
)
from ingramspark.pdf_inspect import inspect_pdf, media_box_matches_trim

_REPO_ROOT = Path(__file__).resolve().parents[2]
TEMPLATE_META_SCHEMA_PATH = (
    _REPO_ROOT / "schema" / "profiles" / "ingramspark" / "template-meta.schema.json"
)
DEFAULT_TEMPLATE_META_REL = "assets/ingramspark/template-meta.yml"
TRIM_TOLERANCE_INCHES = 0.02
# Paperback spine text is forbidden below this interior page count (IngramSpark guidance).
MIN_PAGES_FOR_SPINE_TEXT = 48

_TEMPLATE_META_SCHEMA_CACHE: dict[str, Any] | None = None


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
        }


def _as_dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def load_template_meta_schema() -> dict[str, Any]:
    global _TEMPLATE_META_SCHEMA_CACHE
    if _TEMPLATE_META_SCHEMA_CACHE is not None:
        return _TEMPLATE_META_SCHEMA_CACHE
    with TEMPLATE_META_SCHEMA_PATH.open("r", encoding="utf-8") as f:
        _TEMPLATE_META_SCHEMA_CACHE = json.load(f)
    return _TEMPLATE_META_SCHEMA_CACHE


def resolve_template_meta_path(book_dir: Path, *, relative: str | None = None) -> Path:
    rel = (relative or DEFAULT_TEMPLATE_META_REL).strip()
    return (book_dir / rel).resolve()


def load_template_meta(path: Path) -> dict[str, Any]:
    if not path.is_file():
        raise CoverValidateError(
            f"Missing template-meta.yml at {path}. "
            f"Record observed Cover Template Generator metadata before validating the wrap."
        )
    with path.open("r", encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}
    if not isinstance(data, dict):
        raise CoverValidateError(f"Expected mapping in {path}")
    schema = load_template_meta_schema()
    try:
        jsonschema.validate(instance=data, schema=schema)
    except jsonschema.ValidationError as exc:
        location = ".".join(str(p) for p in exc.path) or "<root>"
        raise CoverValidateError(
            f"{path}: template-meta schema validation failed at {location}: {exc.message}"
        ) from exc
    return data


def resolve_wrap_path(book_dir: Path, spec: dict[str, Any]) -> Path:
    target = spec_ingramspark_target(spec)
    print_cfg = _as_dict(target.get("print"))
    cover = _as_dict(print_cfg.get("cover"))
    strategy = str(cover.get("strategy") or "").strip()
    if strategy != "supplied-wrap":
        raise CoverValidateError(
            f"print.cover.strategy {strategy!r} is not supported yet; use supplied-wrap"
        )
    rel = str(cover.get("source") or "").strip()
    if not rel:
        raise CoverValidateError("publishing.targets.ingramspark.print.cover.source is required")
    path = (book_dir / rel).resolve()
    if not path.is_file():
        raise CoverValidateError(
            f"Missing print cover wrap PDF: {rel} (under {book_dir}). "
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
    Validate supplied wrap + template-meta against ``print.trim`` and interior page count.

    When ``stage`` is true and validation passes, copy the wrap to
    ``build/ingramspark/<id>/print/{isbn}_cvr.pdf``.
    """
    result = CoverValidateResult(ok=True)
    print_cfg = _require_print_enabled(spec)
    cover = _as_dict(print_cfg.get("cover"))
    interior = _as_dict(print_cfg.get("interior"))
    trim = _as_dict(print_cfg.get("trim"))

    try:
        wrap_path = resolve_wrap_path(book_dir, spec)
    except CoverValidateError as exc:
        result.ok = False
        result.errors.append(str(exc))
        return result
    result.wrap_path = wrap_path

    meta_path = resolve_template_meta_path(book_dir, relative=template_meta_relative)
    result.template_meta_path = meta_path
    try:
        meta = load_template_meta(meta_path)
    except CoverValidateError as exc:
        result.ok = False
        result.errors.append(str(exc))
        return result

    meta_pages = int(meta["page_count"])
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

    cfg_w: float | None
    cfg_h: float | None
    try:
        cfg_w = float(trim["width_inches"])
        cfg_h = float(trim["height_inches"])
    except (KeyError, TypeError, ValueError):
        result.errors.append("publishing.targets.ingramspark.print.trim is missing or invalid")
        cfg_w = None
        cfg_h = None
    if cfg_w is not None and cfg_h is not None:
        meta_trim = _as_dict(meta.get("trim"))
        try:
            mt_w = float(meta_trim["width_inches"])
            mt_h = float(meta_trim["height_inches"])
        except (KeyError, TypeError, ValueError):
            result.errors.append("template-meta.yml trim is missing width_inches/height_inches")
        else:
            same_orientation = _inches_close(cfg_w, mt_w) and _inches_close(cfg_h, mt_h)
            swapped = _inches_close(cfg_w, mt_h) and _inches_close(cfg_h, mt_w)
            if not same_orientation and not swapped:
                result.errors.append(
                    f"Configured print.trim {cfg_w}x{cfg_h} in does not match "
                    f"template-meta.yml trim {mt_w}x{mt_h} in. "
                    f"print.trim is authoritative; update the template request or book.yml."
                )

    cfg_binding = str(print_cfg.get("binding") or "").strip()
    meta_binding = str(meta.get("binding") or "").strip()
    if cfg_binding and meta_binding and cfg_binding != meta_binding:
        result.errors.append(
            f"print.binding {cfg_binding!r} does not match template-meta binding {meta_binding!r}"
        )

    cfg_paper = str(interior.get("paper") or "").strip()
    meta_paper = str(meta.get("paper") or "").strip()
    if cfg_paper and meta_paper and cfg_paper != meta_paper:
        result.errors.append(
            f"print.interior.paper {cfg_paper!r} does not match template-meta paper {meta_paper!r}"
        )

    cfg_color = str(interior.get("color_mode") or "").strip()
    meta_color = str(meta.get("color_mode") or "").strip()
    if cfg_color and meta_color and cfg_color != meta_color:
        result.errors.append(
            f"print.interior.color_mode {cfg_color!r} does not match "
            f"template-meta color_mode {meta_color!r}"
        )

    barcode_mode = str(cover.get("barcode_mode") or "").strip()
    if barcode_mode not in {"ingram-generated", "supplied"}:
        result.errors.append(
            f"print.cover.barcode_mode must be ingram-generated or supplied (got {barcode_mode!r})"
        )
    else:
        barcode_supplied = meta.get("barcode_supplied")
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

    if (
        measured is not None
        and measured < MIN_PAGES_FOR_SPINE_TEXT
        and meta.get("spine_text") is True
    ):
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
    meta_box = _as_dict(meta.get("media_box"))
    try:
        box_w = float(meta_box["width_inches"])
        box_h = float(meta_box["height_inches"])
    except (KeyError, TypeError, ValueError):
        result.errors.append("template-meta.yml media_box is missing width_inches/height_inches")
    else:
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
