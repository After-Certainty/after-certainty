"""Ebook-only IngramSpark preflight (JSON + human-readable)."""

from __future__ import annotations

import json
import re
import subprocess
import zipfile
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any
from xml.etree import ElementTree as ET

from after_certainty.ingramspark.epubcheck import (
    EpubcheckError,
    format_epubcheck_failure,
    run_epubcheck,
)
from after_certainty.ingramspark.paths import ebook_isbn, ebook_output_dir
from after_certainty.ingramspark.profile import load_profile
from after_certainty.specs.book_specs import spec_ingramspark_target

_PAGE_REF_RE = re.compile(r"\bpage\s+\d+\b", re.I)


@dataclass
class PreflightIssue:
    id: str
    severity: str  # blocking | warning | human-review | informational
    message: str


@dataclass
class EbookPreflightReport:
    ok: bool
    specification_profile: str
    epub_content_version: str
    epubcheck_tool_version: str
    isbn: str
    epub_path: str | None
    cover_jpg_path: str | None
    issues: list[PreflightIssue] = field(default_factory=list)
    tool_versions: dict[str, str] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "ok": self.ok,
            "specification_profile": self.specification_profile,
            "epub_content_version": self.epub_content_version,
            "epubcheck_tool_version": self.epubcheck_tool_version,
            "isbn": self.isbn,
            "epub_path": self.epub_path,
            "cover_jpg_path": self.cover_jpg_path,
            "issues": [asdict(i) for i in self.issues],
            "tool_versions": self.tool_versions,
        }

    def human_text(self) -> str:
        lines = [
            "IngramSpark ebook preflight",
            f"profile: {self.specification_profile}",
            f"epub_content_version: {self.epub_content_version}",
            f"epubcheck_tool_version: {self.epubcheck_tool_version}",
            f"isbn: {self.isbn}",
            f"result: {'PASS' if self.ok else 'FAIL'}",
            "",
        ]
        if not self.issues:
            lines.append("No issues.")
            return "\n".join(lines) + "\n"
        for issue in self.issues:
            lines.append(f"[{issue.severity}] {issue.id}: {issue.message}")
        return "\n".join(lines) + "\n"


def _issue(issues: list[PreflightIssue], id_: str, severity: str, message: str) -> None:
    issues.append(PreflightIssue(id=id_, severity=severity, message=message))


def _scan_epub_images_and_nav(epub_path: Path, max_pixels: int) -> list[PreflightIssue]:
    found: list[PreflightIssue] = []
    try:
        from PIL import Image
    except ModuleNotFoundError:
        _issue(
            found,
            "pillow-missing",
            "warning",
            "Pillow not installed; skipped interior image pixel checks",
        )
        return found

    try:
        zf_ctx = zipfile.ZipFile(epub_path, "r")
    except zipfile.BadZipFile:
        _issue(found, "epub-unreadable", "blocking", f"EPUB is not a valid zip: {epub_path}")
        return found

    with zf_ctx as zf:
        for name in zf.namelist():
            lower = name.lower()
            if not lower.endswith((".png", ".jpg", ".jpeg", ".gif", ".webp")):
                continue
            with zf.open(name) as fh, Image.open(fh) as im:
                w, h = im.size
                pixels = w * h
                if pixels > max_pixels:
                    _issue(
                        found,
                        "epub-interior-image-pixels",
                        "blocking",
                        f"{name} is {w}x{h} ({pixels} pixels); profile max is {max_pixels}",
                    )
                if im.mode not in {"RGB", "RGBA", "L", "P", "LA"}:
                    _issue(
                        found,
                        "epub-image-mode",
                        "warning",
                        f"{name} has unexpected mode {im.mode!r}; ebook images should remain RGB",
                    )

        # Page-number heuristic in nav documents.
        for name in zf.namelist():
            if not name.lower().endswith((".xhtml", ".html", ".ncx", ".xml")):
                continue
            if "nav" not in name.lower() and "toc" not in name.lower():
                continue
            text = zf.read(name).decode("utf-8", errors="ignore")
            if _PAGE_REF_RE.search(text):
                _issue(
                    found,
                    "epub-page-number-refs",
                    "warning",
                    f"{name} appears to reference print page numbers",
                )

        # Internal cover presence (cover image item or cover xhtml).
        opf_name = next((n for n in zf.namelist() if n.endswith(".opf")), None)
        if opf_name:
            root = ET.fromstring(zf.read(opf_name))
            ns = {"opf": "http://www.idpf.org/2007/opf"}
            has_cover = False
            for item in root.findall(".//opf:item", ns):
                props = (item.attrib.get("properties") or "").lower()
                item_id = (item.attrib.get("id") or "").lower()
                href = (item.attrib.get("href") or "").lower()
                if "cover-image" in props or item_id.startswith("cover") or "cover" in href:
                    has_cover = True
                    break
            if not has_cover:
                _issue(
                    found,
                    "epub-internal-cover",
                    "blocking",
                    "EPUB package appears to lack an internal cover image",
                )
    return found


def run_ebook_preflight(
    *,
    repo: Path,
    spec: dict[str, Any],
    skip_epubcheck: bool = False,
) -> EbookPreflightReport:
    target = spec_ingramspark_target(spec)
    profile_id = str(target.get("specification_profile") or "").strip()
    if not profile_id:
        raise ValueError("specification_profile is required for ebook preflight")
    profile = load_profile(profile_id)
    ebook_profile = profile.get("ebook") if isinstance(profile.get("ebook"), dict) else {}
    max_bytes = int(ebook_profile.get("max_epub_bytes") or 104_857_600)
    max_pixels = int(ebook_profile.get("max_interior_image_pixels") or 3_200_000)
    min_long = int(ebook_profile.get("cover_min_longest_side_px") or 2560)
    min_short = int(ebook_profile.get("cover_min_shortest_side_px") or 1600)

    isbn = ebook_isbn(spec)
    out_dir = ebook_output_dir(repo, spec)
    epub_path = out_dir / f"{isbn}.epub"
    jpg_path = out_dir / f"{isbn}.jpg"
    issues: list[PreflightIssue] = []
    tool_versions: dict[str, str] = {
        "epub_content_version": str(profile.get("epub_content_version") or ""),
        "epubcheck_tool_version": str(profile.get("epubcheck_tool_version") or ""),
    }

    if not epub_path.is_file():
        _issue(issues, "epub-missing", "blocking", f"Missing EPUB: {epub_path}")
    else:
        size = epub_path.stat().st_size
        if size > max_bytes:
            _issue(
                issues,
                "epub-max-bytes",
                "blocking",
                f"EPUB is {size} bytes; profile max is {max_bytes}",
            )
        issues.extend(_scan_epub_images_and_nav(epub_path, max_pixels))
        if not skip_epubcheck:
            try:
                result = run_epubcheck(epub_path, profile_id=profile_id)
                tool_versions["epubcheck_jar"] = result.jar_path.as_posix()
                if not result.ok:
                    _issue(
                        issues,
                        "epubcheck",
                        "blocking",
                        format_epubcheck_failure(result),
                    )
            except (EpubcheckError, OSError, subprocess.SubprocessError) as exc:
                _issue(issues, "epubcheck", "blocking", f"EPUBCheck could not run: {exc}")

    if not jpg_path.is_file():
        _issue(issues, "ebook-cover-missing", "blocking", f"Missing cover JPG: {jpg_path}")
    else:
        try:
            from PIL import Image

            with Image.open(jpg_path) as im:
                if im.format != "JPEG":
                    _issue(
                        issues,
                        "ebook-cover-format",
                        "blocking",
                        f"Cover must be JPEG; found {im.format!r}",
                    )
                if im.mode != "RGB":
                    _issue(
                        issues,
                        "ebook-cover-rgb",
                        "blocking",
                        f"Cover must be RGB; found mode {im.mode!r}",
                    )
                w, h = im.size
                longest, shortest = max(w, h), min(w, h)
                if longest < min_long or shortest < min_short:
                    _issue(
                        issues,
                        "ebook-cover-min-pixels",
                        "blocking",
                        f"Cover is {w}x{h}px; requires ≥{min_long} longest and ≥{min_short} shortest",
                    )
                # Ultra-wide wraps are unlikely front-only covers.
                if w > h * 1.2:
                    _issue(
                        issues,
                        "ebook-cover-front-only",
                        "warning",
                        f"Cover aspect {w}x{h} looks wide; confirm front-cover-only (no wrap)",
                    )
        except ModuleNotFoundError:
            _issue(issues, "pillow-missing", "blocking", "Pillow required to validate cover JPG")

    blocking = [i for i in issues if i.severity == "blocking"]
    report = EbookPreflightReport(
        ok=not blocking,
        specification_profile=profile_id,
        epub_content_version=str(profile.get("epub_content_version") or ""),
        epubcheck_tool_version=str(profile.get("epubcheck_tool_version") or ""),
        isbn=isbn,
        epub_path=epub_path.as_posix() if epub_path.is_file() else None,
        cover_jpg_path=jpg_path.as_posix() if jpg_path.is_file() else None,
        issues=issues,
        tool_versions=tool_versions,
    )
    return report


def write_ebook_preflight_reports(report: EbookPreflightReport, out_dir: Path) -> tuple[Path, Path]:
    out_dir.mkdir(parents=True, exist_ok=True)
    json_path = out_dir / "preflight.json"
    text_path = out_dir / "preflight-report.txt"
    json_path.write_text(
        json.dumps(report.to_dict(), indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    text_path.write_text(report.human_text(), encoding="utf-8")
    return json_path, text_path
