"""Inspect PDF geometry, fonts, and color construction for IngramSpark print work."""

from __future__ import annotations

import json
import re
import subprocess
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any


@dataclass
class PdfInspection:
    path: str
    page_count: int | None = None
    page_size_pts: list[tuple[float, float]] = field(default_factory=list)
    media_box_inches: list[tuple[float, float]] = field(default_factory=list)
    pdf_version: str | None = None
    fonts: list[dict[str, str]] = field(default_factory=list)
    all_fonts_embedded: bool | None = None
    has_output_intent: bool | None = None
    output_intent_info: list[str] = field(default_factory=list)
    mentions_device_gray: bool | None = None
    mentions_device_rgb: bool | None = None
    mentions_device_cmyk: bool | None = None
    mentions_icc_based: bool | None = None
    qpdf_json_ok: bool | None = None
    errors: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def _run(cmd: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, capture_output=True, text=True, check=False)


def _run_bytes(cmd: list[str]) -> subprocess.CompletedProcess[bytes]:
    """Run a command capturing raw bytes (PDF streams may be binary)."""
    return subprocess.run(cmd, capture_output=True, check=False)


def _pdfinfo(path: Path, inspection: PdfInspection) -> None:
    proc = _run(["pdfinfo", path.as_posix()])
    if proc.returncode != 0:
        inspection.errors.append(f"pdfinfo failed: {(proc.stderr or proc.stdout).strip()}")
        return
    for line in (proc.stdout or "").splitlines():
        if line.startswith("Pages:"):
            try:
                inspection.page_count = int(line.split(":", 1)[1].strip())
            except ValueError:
                pass
        elif line.startswith("PDF version:"):
            inspection.pdf_version = line.split(":", 1)[1].strip()
        elif line.startswith("Page size:"):
            # e.g. Page size:      432 x 648 pts
            m = re.search(r"([\d.]+)\s*x\s*([\d.]+)\s*pts", line)
            if m:
                w, h = float(m.group(1)), float(m.group(2))
                inspection.page_size_pts.append((w, h))
                inspection.media_box_inches.append((round(w / 72.0, 4), round(h / 72.0, 4)))


def _pdffonts(path: Path, inspection: PdfInspection) -> None:
    proc = _run(["pdffonts", path.as_posix()])
    if proc.returncode != 0:
        inspection.errors.append(f"pdffonts failed: {(proc.stderr or proc.stdout).strip()}")
        return
    lines = [ln for ln in (proc.stdout or "").splitlines() if ln.strip()]
    # Header is two lines; data follows.
    data_lines = lines[2:] if len(lines) > 2 else []
    embedded_flags: list[bool] = []
    for ln in data_lines:
        parts = ln.split()
        # Columns are space-separated but "type" may contain spaces (e.g. "CID Type 0C").
        # Parse from the right: ... emb sub uni object_id generation
        if len(parts) < 6:
            continue
        emb_tok, sub_tok, uni_tok = parts[-5], parts[-4], parts[-3]
        if not all(tok.lower() in {"yes", "no"} for tok in (emb_tok, sub_tok, uni_tok)):
            continue
        emb = emb_tok.lower() == "yes"
        name = parts[0]
        # Remainder between name and emb is type + encoding (encoding is usually last token).
        middle = parts[1:-5]
        encoding = middle[-1] if middle else ""
        font_type = " ".join(middle[:-1]) if len(middle) > 1 else (middle[0] if middle else "")
        embedded_flags.append(emb)
        inspection.fonts.append(
            {
                "name": name,
                "type": font_type,
                "encoding": encoding,
                "embedded": "yes" if emb else "no",
            }
        )
    if embedded_flags:
        inspection.all_fonts_embedded = all(embedded_flags)
    elif inspection.page_count is not None:
        # No fonts listed can be valid for image-only proofs.
        inspection.all_fonts_embedded = True


def _qpdf_color_hints(path: Path, inspection: PdfInspection) -> None:
    proc = _run(["qpdf", "--json", path.as_posix()])
    if proc.returncode != 0:
        inspection.qpdf_json_ok = False
        inspection.errors.append(
            f"qpdf --json failed: {(proc.stderr or proc.stdout).strip()[:400]}"
        )
        text = ""
    else:
        inspection.qpdf_json_ok = True
        text = proc.stdout or ""
        try:
            payload = json.loads(text)
            text = json.dumps(payload)
        except json.JSONDecodeError:
            pass

    # Uncompressed QDF catches content-stream operators JSON often omits.
    # ICC DestOutputProfile streams are binary — decode as latin-1.
    raw = _run_bytes(
        [
            "qpdf",
            "--qdf",
            "--object-streams=disable",
            "--stream-data=uncompress",
            path.as_posix(),
            "-",
        ]
    )
    qdf = (raw.stdout or b"").decode("latin-1", errors="replace")
    if raw.stderr:
        qdf += "\n" + raw.stderr.decode("latin-1", errors="replace")
    combined = text + "\n" + qdf

    inspection.has_output_intent = "/OutputIntent" in combined or "OutputIntent" in combined
    # Named color spaces and content-stream operators (rg/g/k) both count.
    gray_ops = bool(re.search(r"(?m)(?:^|[^A-Za-z])[0-9.]+\s+g\b", combined)) or " G\n" in combined
    rgb_ops = bool(re.search(r"(?m)(?:^|[^A-Za-z])(?:[0-9.]+\s+){3}rg\b", combined)) or bool(
        re.search(r"(?m)(?:^|[^A-Za-z])(?:[0-9.]+\s+){3}RG\b", combined)
    )
    cmyk_ops = bool(re.search(r"(?m)(?:^|[^A-Za-z])(?:[0-9.]+\s+){4}k\b", combined)) or bool(
        re.search(r"(?m)(?:^|[^A-Za-z])(?:[0-9.]+\s+){4}K\b", combined)
    )
    inspection.mentions_device_gray = (
        "/DeviceGray" in combined or "DeviceGray" in combined or gray_ops
    )
    inspection.mentions_device_rgb = "/DeviceRGB" in combined or "DeviceRGB" in combined or rgb_ops
    inspection.mentions_device_cmyk = (
        "/DeviceCMYK" in combined or "DeviceCMYK" in combined or cmyk_ops
    )
    inspection.mentions_icc_based = "/ICCBased" in combined or "ICCBased" in combined
    if inspection.has_output_intent:
        for m in re.finditer(r"OutputIntent[^\\]{0,200}", combined):
            inspection.output_intent_info.append(m.group(0)[:200])
            if len(inspection.output_intent_info) >= 5:
                break


def inspect_pdf(path: Path) -> PdfInspection:
    path = path.resolve()
    inspection = PdfInspection(path=path.as_posix())
    if not path.is_file():
        inspection.errors.append(f"PDF not found: {path}")
        return inspection
    _pdfinfo(path, inspection)
    _pdffonts(path, inspection)
    _qpdf_color_hints(path, inspection)
    return inspection


def media_box_matches_trim(
    inspection: PdfInspection,
    *,
    width_inches: float,
    height_inches: float,
    tolerance_inches: float = 0.02,
) -> bool:
    if not inspection.media_box_inches:
        return False
    for w, h in inspection.media_box_inches:
        if abs(w - width_inches) <= tolerance_inches and abs(h - height_inches) <= tolerance_inches:
            continue
        # Allow swapped orientation only if explicitly square; otherwise require exact.
        return False
    return True
