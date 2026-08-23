"""Build and inspect the isolated grayscale PDF/X proof (INGRAM-004 first gate)."""

from __future__ import annotations

import json
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from after_certainty.ingramspark.pdf_inspect import (
    PdfInspection,
    inspect_pdf,
    media_box_matches_trim,
)

_REPO_ROOT = Path(__file__).resolve().parents[2]
_FIXTURE_DIR = Path(__file__).resolve().parent / "fixtures" / "pdfx"
_DEFAULT_PROOF_DIR = _REPO_ROOT / "build" / "ingramspark" / "_pdfx-proof"


class PdfxProofError(ValueError):
    pass


@dataclass(frozen=True)
class PdfxProofResult:
    pdf_path: Path
    inspection_path: Path
    inspection: PdfInspection
    construction: dict[str, Any]
    ghostscript: str
    icc_profile: Path

    def to_dict(self) -> dict[str, Any]:
        return {
            "pdf_path": self.pdf_path.as_posix(),
            "inspection_path": self.inspection_path.as_posix(),
            "inspection": self.inspection.to_dict(),
            "construction": self.construction,
            "ghostscript": self.ghostscript,
            "icc_profile": self.icc_profile.as_posix(),
        }


def find_ghostscript(gs: str = "gs") -> str:
    path = shutil.which(gs)
    if not path:
        raise PdfxProofError(f"Ghostscript ({gs}) not found on PATH")
    return path


def find_sgray_icc() -> Path:
    """Locate Ghostscript's sgray.icc for PDF/X DestOutputProfile."""
    candidates: list[Path] = []
    # Common Debian/Ubuntu layout.
    share = Path("/usr/share/ghostscript")
    if share.is_dir():
        candidates.extend(sorted(share.glob("*/iccprofiles/sgray.icc"), reverse=True))
    which_gs = shutil.which("gs")
    if which_gs:
        # Some installs keep iccprofiles next to the binary's prefix.
        prefix = Path(which_gs).resolve().parent.parent
        candidates.extend(prefix.glob("share/ghostscript/*/iccprofiles/sgray.icc"))
    for path in candidates:
        if path.is_file():
            return path.resolve()
    raise PdfxProofError(
        "Could not locate Ghostscript sgray.icc (needed for PDF/X DestOutputProfile). "
        "Install ghostscript and its ICC profiles."
    )


def _ghostscript_version(gs: str) -> str:
    proc = subprocess.run([gs, "--version"], capture_output=True, text=True, check=False)
    return (proc.stdout or proc.stderr or "").strip().splitlines()[0] if proc.stdout else "unknown"


def construction_record(*, gs_version: str, icc: Path) -> dict[str, Any]:
    """Documented candidate construction; not yet promoted to blocking profile policy."""
    return {
        "id": "gs-pdfx3-gray-sgray-output-intent",
        "status": "candidate-local-proof",
        "account_upload_status": "pending-human",
        "conformance_target": "PDF/X-3:2002",
        "color_conversion_strategy": "Gray",
        "process_color_model": "DeviceGray",
        "output_intent": {
            "present": True,
            "dest_output_profile": "sgray.icc",
            "note": (
                "Official IngramSpark print guidance requires PDF/X-1a or PDF/X-3 and also "
                "warns against including ICC profiles. This candidate embeds an ICC only as "
                "the PDF/X DestOutputProfile (output intent), not as per-object/raster ICC. "
                "Do not promote pdfx_icc_policy to blocking until account preflight accepts "
                "or rejects this construction."
            ),
        },
        "trim_inches": {"width": 6.0, "height": 9.0},
        "tools": {
            "ghostscript": gs_version,
            "icc_profile_path_example": icc.as_posix(),
        },
        "validators": ["pdfinfo", "pdffonts", "qpdf", "ghostscript-inkcov"],
    }


def build_grayscale_pdfx_proof(
    *,
    out_dir: Path | None = None,
    gs: str = "gs",
) -> PdfxProofResult:
    """
    Produce a minimal grayscale PDF/X-3 candidate and write an inspection JSON beside it.

    This is intentionally not a book export — it proves Ghostscript construction before
    production interiors harden PDF/X rules.
    """
    gs_path = find_ghostscript(gs)
    icc = find_sgray_icc()
    out = (out_dir or _DEFAULT_PROOF_DIR).resolve()
    out.mkdir(parents=True, exist_ok=True)

    page_ps = _FIXTURE_DIR / "page.ps"
    template = (_FIXTURE_DIR / "PDFX_def.ps.template").read_text(encoding="utf-8")
    # PostScript string literals treat backslash specially; use forward slashes.
    icc_ps = icc.as_posix()
    pdfx_def = out / "PDFX_def.ps"
    pdfx_def.write_text(template.replace("{{ICC_PROFILE_PATH}}", icc_ps), encoding="utf-8")

    pdf_path = out / "grayscale-pdfx3-proof.pdf"
    cmd = [
        gs_path,
        "-dBATCH",
        "-dNOPAUSE",
        "-dNOSAFER",
        "-sDEVICE=pdfwrite",
        "-dPDFX=true",
        "-sColorConversionStrategy=Gray",
        "-dProcessColorModel=/DeviceGray",
        f"-sOutputFile={pdf_path.as_posix()}",
        f"-I{out.as_posix()}",
        pdfx_def.as_posix(),
        page_ps.as_posix(),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if proc.returncode != 0 or not pdf_path.is_file():
        detail = (proc.stderr or proc.stdout or "").strip()
        raise PdfxProofError(f"Ghostscript PDF/X proof failed ({proc.returncode}): {detail[:800]}")

    inspection = inspect_pdf(pdf_path)
    # Uncompress for color-operator heuristics when JSON missed DeviceGray.
    _enrich_color_from_qdf(pdf_path, inspection)

    if not media_box_matches_trim(inspection, width_inches=6.0, height_inches=9.0):
        raise PdfxProofError(f"Proof media box is not 6x9 in: {inspection.media_box_inches!r}")
    if inspection.has_output_intent is not True:
        raise PdfxProofError("Proof is missing PDF/X OutputIntent")
    if inspection.errors:
        raise PdfxProofError(f"Proof inspection errors: {inspection.errors}")

    gs_version = _ghostscript_version(gs_path)
    construction = construction_record(gs_version=gs_version, icc=icc)
    inspection_path = out / "grayscale-pdfx3-proof.inspection.json"
    payload = {
        "construction": construction,
        "inspection": inspection.to_dict(),
        "ghostscript_command": cmd,
    }
    inspection_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")

    return PdfxProofResult(
        pdf_path=pdf_path,
        inspection_path=inspection_path,
        inspection=inspection,
        construction=construction,
        ghostscript=gs_version,
        icc_profile=icc,
    )


def _enrich_color_from_qdf(path: Path, inspection: PdfInspection) -> None:
    """Best-effort DeviceGray detection from uncompressed QDF when JSON omits operators."""
    proc = subprocess.run(
        [
            "qpdf",
            "--qdf",
            "--object-streams=disable",
            "--stream-data=uncompress",
            path.as_posix(),
            "-",
        ],
        capture_output=True,
        check=False,
    )
    text = (proc.stdout or b"").decode("latin-1", errors="replace")
    if "/DeviceGray" in text or "\n0 g\n" in text or " setgray" in text:
        inspection.mentions_device_gray = True
    if "/DeviceRGB" in text:
        inspection.mentions_device_rgb = True
    if "/DeviceCMYK" in text:
        inspection.mentions_device_cmyk = True
    if "/ICCBased" in text:
        inspection.mentions_icc_based = True
    if "/OutputIntent" in text:
        inspection.has_output_intent = True
