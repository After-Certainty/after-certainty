"""Export IngramSpark print interior PDF (``{isbn}_txt.pdf``)."""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from book_specs import spec_ingramspark_enabled, spec_ingramspark_target
from ingramspark.paths import (
    print_interior_pdf_path,
    print_isbn,
    print_output_dir,
    print_page_count_path,
)
from ingramspark.pdf_inspect import inspect_pdf, media_box_matches_trim
from ingramspark.profile import load_profile

_REPO_ROOT = Path(__file__).resolve().parents[2]
_TOOLS = _REPO_ROOT / "tools"
_SCRIPTS = _REPO_ROOT / "scripts"


class PrintExportError(ValueError):
    pass


@dataclass(frozen=True)
class PrintExportResult:
    pdf_path: Path
    isbn: str
    page_count: int
    trim_width_inches: float
    trim_height_inches: float
    color_mode: str
    page_count_path: Path
    inspection_path: Path


def _as_dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def _run(cmd: list[str]) -> None:
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as exc:
        raise PrintExportError(f"Command failed ({exc.returncode}): {' '.join(cmd)}") from exc


def _require_print_enabled(spec: dict[str, Any]) -> dict[str, Any]:
    if not spec_ingramspark_enabled(spec):
        raise PrintExportError("publishing.targets.ingramspark.enabled must be true")
    target = spec_ingramspark_target(spec)
    print_cfg = _as_dict(target.get("print"))
    if print_cfg.get("enabled", False) is not True:
        raise PrintExportError("publishing.targets.ingramspark.print.enabled must be true")
    return print_cfg


def print_trim_inches(spec: dict[str, Any]) -> tuple[float, float]:
    print_cfg = _as_dict(spec_ingramspark_target(spec).get("print"))
    trim = _as_dict(print_cfg.get("trim"))
    try:
        width = float(trim["width_inches"])
        height = float(trim["height_inches"])
    except (KeyError, TypeError, ValueError) as exc:
        raise PrintExportError(
            "publishing.targets.ingramspark.print.trim.width_inches/height_inches required"
        ) from exc
    if width <= 0 or height <= 0:
        raise PrintExportError(f"Invalid print.trim: {width}x{height}")
    return width, height


def print_color_mode(spec: dict[str, Any]) -> str:
    print_cfg = _as_dict(spec_ingramspark_target(spec).get("print"))
    interior = _as_dict(print_cfg.get("interior"))
    mode = str(interior.get("color_mode") or "").strip()
    if mode not in {"black-and-white", "color"}:
        raise PrintExportError(
            "publishing.targets.ingramspark.print.interior.color_mode must be "
            "black-and-white or color"
        )
    return mode


def _recommended_margin_inches(spec: dict[str, Any]) -> float:
    target = spec_ingramspark_target(spec)
    profile_id = str(target.get("specification_profile") or "").strip()
    if not profile_id:
        return 0.5
    profile = load_profile(profile_id)
    return float(_as_dict(profile.get("print")).get("recommended_margin_inches") or 0.5)


def _pandoc_pdf(
    *,
    book_dir: Path,
    spec: dict[str, Any],
    out_pdf: Path,
    width_in: float,
    height_in: float,
    margin_in: float,
    pandoc: str,
    pdf_engine: str,
) -> None:
    if str(_SCRIPTS) not in sys.path:
        sys.path.insert(0, str(_SCRIPTS))
    from assemble import assemble_markdown_units  # noqa: PLC0415
    from book_export_assets import (  # noqa: PLC0415
        pdf_header_tex,
        prepare_bridge_markdown_for_pdf,
        prepare_closing_markdown_for_pdf,
        strip_inline_title_page_cover,
        title_page_cover_basename,
    )
    from publication_markdown import stage_publication_units  # noqa: PLC0415

    units = assemble_markdown_units(book_dir)
    if not units:
        raise PrintExportError(f"No markdown units found from {book_dir / 'index.md'}")

    with tempfile.TemporaryDirectory(prefix="ingramspark-print-") as tmp:
        tmp_path = Path(tmp)
        publication_units = stage_publication_units(
            units, tmp_path / "manuscript", book_dir=book_dir
        )
        staged: list[Path] = []
        cover_basename = title_page_cover_basename(spec)
        for unit in publication_units:
            if unit.name == "closing.md":
                unit.write_text(
                    prepare_closing_markdown_for_pdf(unit.read_text(encoding="utf-8")),
                    encoding="utf-8",
                )
            elif unit.name == "bridge.md":
                unit.write_text(
                    prepare_bridge_markdown_for_pdf(unit.read_text(encoding="utf-8")),
                    encoding="utf-8",
                )
            elif unit.name == "title-page.md" and cover_basename:
                # Print cover is a separate IngramSpark upload; do not embed jacket art.
                unit.write_text(
                    strip_inline_title_page_cover(
                        unit.read_text(encoding="utf-8"),
                        cover_basename,
                    ),
                    encoding="utf-8",
                )
            staged.append(unit)

        margin = f"{margin_in}in"
        cmd = [
            pandoc,
            *[p.as_posix() for p in staged],
            f"--resource-path={book_dir}",
            f"--pdf-engine={pdf_engine}",
            "--from=markdown+fenced_divs+raw_tex",
            "-V",
            f"geometry:paperwidth={width_in}in",
            "-V",
            f"geometry:paperheight={height_in}in",
            "-V",
            f"geometry:top={margin}",
            "-V",
            f"geometry:bottom={margin}",
            "-V",
            f"geometry:left={margin}",
            "-V",
            f"geometry:right={margin}",
            "-o",
            out_pdf.as_posix(),
        ]
        header = pdf_header_tex(book_dir)
        if header is not None:
            cmd.insert(-2, f"--include-in-header={header.as_posix()}")
        _run(cmd)


def convert_pdf_to_device_gray(*, src: Path, dest: Path, gs: str = "gs") -> None:
    """Convert any PDF to DeviceGray via Ghostscript (B&W interior policy)."""
    gs_path = shutil.which(gs)
    if not gs_path:
        raise PrintExportError(f"Ghostscript ({gs}) not found on PATH")
    dest.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        gs_path,
        "-dBATCH",
        "-dNOPAUSE",
        "-dSAFER",
        "-sDEVICE=pdfwrite",
        "-sColorConversionStrategy=Gray",
        "-dProcessColorModel=/DeviceGray",
        "-dEmbedAllFonts=true",
        "-dSubsetFonts=true",
        "-dCompatibilityLevel=1.4",
        f"-sOutputFile={dest.as_posix()}",
        src.as_posix(),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if proc.returncode != 0 or not dest.is_file():
        detail = (proc.stderr or proc.stdout or "").strip()
        raise PrintExportError(f"Ghostscript grayscale conversion failed: {detail[:600]}")


def append_blank_pdf_page(
    *,
    pdf_path: Path,
    width_inches: float,
    height_inches: float,
    gs: str = "gs",
) -> None:
    """Append one blank page matching trim size (IngramSpark even page-count rule)."""
    gs_path = shutil.which(gs)
    if not gs_path:
        raise PrintExportError(f"Ghostscript ({gs}) not found on PATH")
    if width_inches <= 0 or height_inches <= 0:
        raise PrintExportError(f"Invalid trim for blank page: {width_inches}x{height_inches}")

    # At 72 dpi, device pixels equal PDF points.
    width_pt = int(round(float(width_inches) * 72.0))
    height_pt = int(round(float(height_inches) * 72.0))
    with tempfile.TemporaryDirectory(prefix="ingram-even-pad-") as tmp:
        tmp_path = Path(tmp)
        blank = tmp_path / "blank.pdf"
        merged = tmp_path / "merged.pdf"
        blank_cmd = [
            gs_path,
            "-dBATCH",
            "-dNOPAUSE",
            "-dSAFER",
            "-sDEVICE=pdfwrite",
            f"-g{width_pt}x{height_pt}",
            "-r72",
            f"-sOutputFile={blank.as_posix()}",
            "-c",
            "showpage",
        ]
        proc = subprocess.run(blank_cmd, capture_output=True, text=True, check=False)
        if proc.returncode != 0 or not blank.is_file():
            detail = (proc.stderr or proc.stdout or "").strip()
            raise PrintExportError(f"Failed to create blank filler page: {detail[:600]}")

        merge_cmd = [
            gs_path,
            "-dBATCH",
            "-dNOPAUSE",
            "-dSAFER",
            "-sDEVICE=pdfwrite",
            "-dCompatibilityLevel=1.4",
            f"-sOutputFile={merged.as_posix()}",
            pdf_path.as_posix(),
            blank.as_posix(),
        ]
        proc = subprocess.run(merge_cmd, capture_output=True, text=True, check=False)
        if proc.returncode != 0 or not merged.is_file():
            detail = (proc.stderr or proc.stdout or "").strip()
            raise PrintExportError(f"Failed to append blank filler page: {detail[:600]}")
        shutil.copy2(merged, pdf_path)


def ensure_even_print_page_count(
    *,
    pdf_path: Path,
    width_inches: float,
    height_inches: float,
    gs: str = "gs",
) -> bool:
    """
    If the interior page count is odd, append one blank page.

    IngramSpark requires paperback interiors with page counts in [18, 1050] that are
    divisible by 2. Returns True when a filler page was added.
    """
    inspection = inspect_pdf(pdf_path)
    if inspection.errors:
        raise PrintExportError(
            "Cannot measure interior page count for even-pad:\n- " + "\n- ".join(inspection.errors)
        )
    pages = inspection.page_count
    if pages is None or pages < 1:
        raise PrintExportError("Interior PDF has no measurable page count")
    if pages % 2 == 0:
        return False
    append_blank_pdf_page(
        pdf_path=pdf_path,
        width_inches=width_inches,
        height_inches=height_inches,
        gs=gs,
    )
    return True


def validate_print_interior(
    *,
    pdf_path: Path,
    width_inches: float,
    height_inches: float,
    color_mode: str,
    require_even_page_count: bool = True,
) -> dict[str, Any]:
    """
    Basic print-interior gates for INGRAM-004 scaffolding.

    PDF/X / output-intent rules remain advisory until account proof promotes them.
    """
    inspection = inspect_pdf(pdf_path)
    errors: list[str] = []
    warnings: list[str] = []

    if inspection.errors:
        errors.extend(inspection.errors)
    if inspection.page_count is None or inspection.page_count < 1:
        errors.append("Interior PDF has no measurable page count")
    elif require_even_page_count and inspection.page_count % 2 != 0:
        errors.append(
            f"Interior page count is {inspection.page_count} (odd). IngramSpark requires "
            "an even page count between 18 and 1050; the exporter should have appended a "
            "blank filler page."
        )
    if not media_box_matches_trim(
        inspection, width_inches=width_inches, height_inches=height_inches
    ):
        errors.append(
            f"Media box {inspection.media_box_inches!r} does not match configured trim "
            f"{width_inches}x{height_inches} in"
        )
    if inspection.all_fonts_embedded is False:
        errors.append("One or more fonts are not embedded")

    if color_mode == "black-and-white":
        if inspection.mentions_device_rgb is True:
            errors.append("B&W interior still references DeviceRGB")
        if inspection.mentions_device_cmyk is True:
            warnings.append("B&W interior references DeviceCMYK (expected DeviceGray)")
        if (
            inspection.mentions_device_gray is not True
            and inspection.mentions_device_rgb is not True
        ):
            # Pure vector gray may still lack an explicit /DeviceGray token after some engines.
            warnings.append("Could not confirm DeviceGray tokens in interior PDF")
    elif color_mode == "color":
        if inspection.mentions_device_rgb is True:
            errors.append("Color interior still references DeviceRGB (expected CMYK path)")

    if inspection.has_output_intent:
        warnings.append(
            "OutputIntent present; PDF/X/ICC policy remains account-verification-needed"
        )

    return {
        "ok": not errors,
        "errors": errors,
        "warnings": warnings,
        "inspection": inspection.to_dict(),
    }


def export_ingramspark_print_interior(
    *,
    repo: Path,
    book_dir: Path,
    spec: dict[str, Any],
    pandoc: str = "pandoc",
    pdf_engine: str = "xelatex",
    gs: str = "gs",
    apply_pdfx_proof_construction: bool = False,
) -> PrintExportResult:
    """
    Produce ``build/ingramspark/<book-id>/print/{isbn}_txt.pdf`` at configured trim.

    For ``black-and-white``, always convert through Ghostscript DeviceGray. Full PDF/X
    packaging from the isolated proof remains opt-in via ``apply_pdfx_proof_construction``
    and does not yet harden blocking profile rules.
    """
    print_cfg = _require_print_enabled(spec)
    index = book_dir / "index.md"
    if not index.is_file():
        raise PrintExportError(f"Missing index.md: {index}")

    isbn = print_isbn(spec)
    width, height = print_trim_inches(spec)
    color_mode = print_color_mode(spec)
    margin = _recommended_margin_inches(spec)

    out_dir = print_output_dir(repo, spec)
    out_dir.mkdir(parents=True, exist_ok=True)
    final_pdf = print_interior_pdf_path(repo, spec)

    with tempfile.TemporaryDirectory(prefix="ingram-print-raw-") as tmp:
        raw_pdf = Path(tmp) / "interior-raw.pdf"
        _pandoc_pdf(
            book_dir=book_dir,
            spec=spec,
            out_pdf=raw_pdf,
            width_in=width,
            height_in=height,
            margin_in=margin,
            pandoc=pandoc,
            pdf_engine=pdf_engine,
        )
        if color_mode == "black-and-white":
            if apply_pdfx_proof_construction:
                from ingramspark.pdfx_proof import (  # noqa: PLC0415
                    find_ghostscript,
                    find_sgray_icc,
                )

                # Re-run the proven Ghostscript PDF/X flags on the book PDF.
                gs_path = find_ghostscript(gs)
                icc = find_sgray_icc()
                work = Path(tmp) / "pdfx-work"
                work.mkdir()
                template = (
                    _TOOLS / "ingramspark" / "fixtures" / "pdfx" / "PDFX_def.ps.template"
                ).read_text(encoding="utf-8")
                pdfx_def = work / "PDFX_def.ps"
                pdfx_def.write_text(
                    template.replace("{{ICC_PROFILE_PATH}}", icc.as_posix()),
                    encoding="utf-8",
                )
                cmd = [
                    gs_path,
                    "-dBATCH",
                    "-dNOPAUSE",
                    "-dNOSAFER",
                    "-sDEVICE=pdfwrite",
                    "-dPDFX=true",
                    "-sColorConversionStrategy=Gray",
                    "-dProcessColorModel=/DeviceGray",
                    f"-sOutputFile={final_pdf.as_posix()}",
                    f"-I{work.as_posix()}",
                    pdfx_def.as_posix(),
                    raw_pdf.as_posix(),
                ]
                proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
                if proc.returncode != 0 or not final_pdf.is_file():
                    detail = (proc.stderr or proc.stdout or "").strip()
                    raise PrintExportError(f"PDF/X construction on interior failed: {detail[:600]}")
            else:
                convert_pdf_to_device_gray(src=raw_pdf, dest=final_pdf, gs=gs)
        else:
            # Color interiors: keep Pandoc/XeLaTeX output for now; CMYK path is later work.
            shutil.copy2(raw_pdf, final_pdf)

    blank_page_appended = ensure_even_print_page_count(
        pdf_path=final_pdf,
        width_inches=width,
        height_inches=height,
        gs=gs,
    )

    validation = validate_print_interior(
        pdf_path=final_pdf,
        width_inches=width,
        height_inches=height,
        color_mode=color_mode,
    )
    if not validation["ok"]:
        raise PrintExportError(
            "Print interior validation failed:\n- " + "\n- ".join(validation["errors"])
        )

    inspection = validation["inspection"]
    page_count = int(inspection["page_count"] or 0)
    page_count_path = print_page_count_path(repo, spec)
    page_count_path.write_text(
        json.dumps(
            {
                "isbn": isbn,
                "page_count": page_count,
                "blank_page_appended": blank_page_appended,
                "trim_inches": {"width": width, "height": height},
                "color_mode": color_mode,
                "edition": print_cfg.get("edition"),
                "binding": print_cfg.get("binding"),
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    inspection_path = out_dir / f"{isbn}_txt.inspection.json"
    inspection_path.write_text(
        json.dumps(validation, indent=2) + "\n",
        encoding="utf-8",
    )

    return PrintExportResult(
        pdf_path=final_pdf,
        isbn=isbn,
        page_count=page_count,
        trim_width_inches=width,
        trim_height_inches=height,
        color_mode=color_mode,
        page_count_path=page_count_path,
        inspection_path=inspection_path,
    )
