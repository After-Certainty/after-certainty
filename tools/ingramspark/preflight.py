"""Profile-driven unified IngramSpark preflight (ebook + print)."""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Literal

from book_specs import spec_ingramspark_enabled, spec_ingramspark_target
from ingramspark.cover_validate import validate_print_cover
from ingramspark.ebook_preflight import (
    EbookPreflightReport,
    PreflightIssue,
    run_ebook_preflight,
    write_ebook_preflight_reports,
)
from ingramspark.paths import (
    ebook_output_dir,
    ingramspark_build_dir,
    print_interior_pdf_path,
    print_isbn,
    print_output_dir,
)
from ingramspark.print_export import print_color_mode, print_trim_inches, validate_print_interior
from ingramspark.profile import load_profile

Mode = Literal["ebook", "print"]

# Map runtime issue ids → profile check ids when names differ.
_ISSUE_TO_PROFILE_CHECK: dict[str, str] = {
    "epubcheck": "epubcheck-current",
    "ebook-cover-missing": "ebook-cover-min-pixels",
    "ebook-cover-format": "ebook-cover-rgb-front-only",
    "ebook-cover-rgb": "ebook-cover-rgb-front-only",
    "ebook-cover-front-only": "ebook-cover-rgb-front-only",
    "epub-internal-cover": "ebook-internal-cover-pixel-cap",
    "epub-page-number-refs": "epub-content-version",
    "print-interior-missing": "print-fonts-embedded",
    "print-interior-trim": "print-cover-trim-match",
    "print-interior-fonts": "print-fonts-embedded",
    "print-interior-rgb": "print-fonts-embedded",
    "print-pdfx-output-intent": "print-pdfx-conformance",
    "print-cover-page-count": "print-cover-template-page-count",
    "print-cover-trim": "print-cover-trim-match",
    "print-cover-media-box": "print-cover-trim-match",
    "print-cover-barcode": "print-cover-barcode-mode",
    "print-cover-spine-text": "print-cover-template-page-count",
    "print-cover-missing": "print-cover-template-page-count",
    "print-cover-binding": "print-cover-trim-match",
    "print-cover-paper": "print-cover-trim-match",
    "print-cover-color": "print-cover-trim-match",
}


@dataclass
class UnifiedPreflightReport:
    ok: bool
    specification_profile: str
    modes: list[str]
    issues: list[PreflightIssue] = field(default_factory=list)
    manual_review: list[str] = field(default_factory=list)
    tool_versions: dict[str, str] = field(default_factory=dict)
    ebook: dict[str, Any] | None = None
    print_interior: dict[str, Any] | None = None
    print_cover: dict[str, Any] | None = None
    profile_checks_applied: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "ok": self.ok,
            "specification_profile": self.specification_profile,
            "modes": list(self.modes),
            "issues": [asdict(i) for i in self.issues],
            "manual_review": list(self.manual_review),
            "tool_versions": dict(self.tool_versions),
            "ebook": self.ebook,
            "print_interior": self.print_interior,
            "print_cover": self.print_cover,
            "profile_checks_applied": list(self.profile_checks_applied),
        }

    def human_text(self) -> str:
        lines = [
            "IngramSpark preflight",
            f"profile: {self.specification_profile}",
            f"modes: {', '.join(self.modes) if self.modes else '(none)'}",
            f"result: {'PASS' if self.ok else 'FAIL'}",
            "",
        ]
        blocking = [i for i in self.issues if i.severity == "blocking"]
        warnings = [i for i in self.issues if i.severity == "warning"]
        human = [i for i in self.issues if i.severity == "human-review"]
        info = [i for i in self.issues if i.severity == "informational"]

        def _section(title: str, items: list[PreflightIssue]) -> None:
            lines.append(title)
            lines.append("-" * len(title))
            if not items:
                lines.append("(none)")
            else:
                for issue in items:
                    lines.append(f"[{issue.severity}] {issue.id}: {issue.message}")
            lines.append("")

        _section("Blocking failures", blocking)
        _section("Warnings", warnings)
        _section("Human review", human + [_as_manual_issue(m) for m in self.manual_review])
        if info:
            _section("Informational", info)
        return "\n".join(lines).rstrip() + "\n"


def _as_manual_issue(message: str) -> PreflightIssue:
    return PreflightIssue(id="manual-review", severity="human-review", message=message)


def _as_dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


class PreflightError(ValueError):
    pass


def profile_check_index(profile: dict[str, Any]) -> dict[str, dict[str, Any]]:
    out: dict[str, dict[str, Any]] = {}
    for check in profile.get("checks") or []:
        if isinstance(check, dict) and check.get("id"):
            out[str(check["id"])] = check
    return out


def resolve_severity(
    *,
    profile_checks: dict[str, dict[str, Any]],
    issue_id: str,
    default: str,
) -> str:
    """Prefer dated-profile severity when a matching check exists."""
    check_id = _ISSUE_TO_PROFILE_CHECK.get(issue_id, issue_id)
    check = profile_checks.get(check_id) or profile_checks.get(issue_id)
    if not check:
        return default
    severity = str(check.get("severity") or "").strip()
    return severity if severity else default


def apply_profile_severities(
    issues: list[PreflightIssue],
    profile_checks: dict[str, dict[str, Any]],
) -> tuple[list[PreflightIssue], list[str]]:
    applied: list[str] = []
    remapped: list[PreflightIssue] = []
    for issue in issues:
        check_id = _ISSUE_TO_PROFILE_CHECK.get(issue.id, issue.id)
        severity = resolve_severity(
            profile_checks=profile_checks,
            issue_id=issue.id,
            default=issue.severity,
        )
        if check_id in profile_checks or issue.id in profile_checks:
            applied.append(check_id if check_id in profile_checks else issue.id)
        remapped.append(PreflightIssue(id=issue.id, severity=severity, message=issue.message))
    return remapped, sorted(set(applied))


def _manual_review_checklist(*, ebook: bool, print_on: bool) -> list[str]:
    items: list[str] = [
        "IngramSpark account ingestion may still reject files that pass local preflight.",
    ]
    if ebook:
        items.extend(
            [
                "Confirm EPUB opens on a reader and title/author metadata match the cover.",
                "Confirm the ebook JPG is front-cover-only (no spine/back wrap).",
            ]
        )
    if print_on:
        items.extend(
            [
                "Visually proof interior margins, grayscale conversion, and intentional blank pages.",
                "Visually proof the full-wrap cover (spine text, barcode area, guide layers not printing).",
                "Confirm Cover Template Generator page count still matches the submitted interior.",
            ]
        )
    return items


def _classify_cover_error(message: str) -> str:
    lower = message.lower()
    if "template was generated" in lower or "template_page_count" in lower or "page_count" in lower:
        return "print-cover-page-count"
    if "media box" in lower:
        return "print-cover-media-box"
    if "print.trim" in lower or "trim" in lower:
        return "print-cover-trim"
    if "barcode" in lower:
        return "print-cover-barcode"
    if "spine text" in lower:
        return "print-cover-spine-text"
    if "missing print cover wrap" in lower or "missing template-meta" in lower:
        return "print-cover-missing"
    if "binding" in lower:
        return "print-cover-binding"
    if "paper" in lower:
        return "print-cover-paper"
    if "color_mode" in lower:
        return "print-cover-color"
    if "font" in lower:
        return "print-interior-fonts"
    return "print-cover-trim"


def _classify_interior_error(message: str) -> str:
    lower = message.lower()
    if "font" in lower:
        return "print-interior-fonts"
    if "media box" in lower or "trim" in lower:
        return "print-interior-trim"
    if "devicergb" in lower or "rgb" in lower:
        return "print-interior-rgb"
    if "missing" in lower:
        return "print-interior-missing"
    return "print-interior-trim"


def _run_print_interior_checks(
    *,
    repo: Path,
    spec: dict[str, Any],
) -> tuple[list[PreflightIssue], dict[str, Any]]:
    issues: list[PreflightIssue] = []
    pdf_path = print_interior_pdf_path(repo, spec)
    payload: dict[str, Any] = {
        "pdf_path": pdf_path.as_posix() if pdf_path.is_file() else None,
        "isbn": print_isbn(spec),
    }
    if not pdf_path.is_file():
        issues.append(
            PreflightIssue(
                id="print-interior-missing",
                severity="blocking",
                message=(
                    f"Missing print interior PDF: {pdf_path}. "
                    f"Run make export-ingramspark-print before print preflight."
                ),
            )
        )
        payload["ok"] = False
        return issues, payload

    width, height = print_trim_inches(spec)
    color_mode = print_color_mode(spec)
    validation = validate_print_interior(
        pdf_path=pdf_path,
        width_inches=width,
        height_inches=height,
        color_mode=color_mode,
    )
    payload.update(validation)
    for message in validation.get("errors") or []:
        issues.append(
            PreflightIssue(
                id=_classify_interior_error(str(message)),
                severity="blocking",
                message=str(message),
            )
        )
    for message in validation.get("warnings") or []:
        issue_id = (
            "print-pdfx-output-intent"
            if "outputintent" in str(message).lower() or "pdf/x" in str(message).lower()
            else "print-interior-color-warning"
        )
        severity = "warning"
        issues.append(PreflightIssue(id=issue_id, severity=severity, message=str(message)))
    return issues, payload


def _run_print_cover_checks(
    *,
    repo: Path,
    book_dir: Path,
    spec: dict[str, Any],
) -> tuple[list[PreflightIssue], dict[str, Any]]:
    # Validate without staging; packaging/cover validate owns staging.
    result = validate_print_cover(
        repo=repo,
        book_dir=book_dir,
        spec=spec,
        stage=False,
    )
    issues: list[PreflightIssue] = []
    for message in result.errors:
        issues.append(
            PreflightIssue(
                id=_classify_cover_error(message),
                severity="blocking",
                message=message,
            )
        )
    for message in result.warnings:
        issues.append(
            PreflightIssue(
                id="print-cover-warning",
                severity="warning",
                message=message,
            )
        )
    return issues, result.to_dict()


def select_modes(
    spec: dict[str, Any],
    *,
    ebook_only: bool = False,
    print_only: bool = False,
) -> list[Mode]:
    if ebook_only and print_only:
        raise PreflightError("Choose at most one of --ebook-only / --print-only")
    if not spec_ingramspark_enabled(spec):
        raise PreflightError("publishing.targets.ingramspark.enabled must be true")
    target = spec_ingramspark_target(spec)
    ebook_on = _as_dict(target.get("ebook")).get("enabled", False) is True
    print_on = _as_dict(target.get("print")).get("enabled", False) is True
    if ebook_only:
        if not ebook_on:
            raise PreflightError(
                "--ebook-only requires publishing.targets.ingramspark.ebook.enabled"
            )
        return ["ebook"]
    if print_only:
        if not print_on:
            raise PreflightError(
                "--print-only requires publishing.targets.ingramspark.print.enabled"
            )
        return ["print"]
    modes: list[Mode] = []
    if ebook_on:
        modes.append("ebook")
    if print_on:
        modes.append("print")
    if not modes:
        raise PreflightError("Neither ebook.enabled nor print.enabled is true")
    return modes


def run_preflight(
    *,
    repo: Path,
    book_dir: Path,
    spec: dict[str, Any],
    ebook_only: bool = False,
    print_only: bool = False,
    skip_epubcheck: bool = False,
) -> UnifiedPreflightReport:
    """
    Run profile-driven preflight for enabled modes.

    ``--ebook-only`` works without print assets. Print mode expects prior
    ``export-ingramspark-print`` output (and cover assets under the book tree).
    """
    modes = select_modes(spec, ebook_only=ebook_only, print_only=print_only)
    target = spec_ingramspark_target(spec)
    profile_id = str(target.get("specification_profile") or "").strip()
    if not profile_id:
        raise PreflightError("specification_profile is required for preflight")
    profile = load_profile(profile_id)
    profile_checks = profile_check_index(profile)

    all_issues: list[PreflightIssue] = []
    applied: list[str] = []
    tool_versions: dict[str, str] = {
        "specification_profile": profile_id,
        "epub_content_version": str(profile.get("epub_content_version") or ""),
        "epubcheck_tool_version": str(profile.get("epubcheck_tool_version") or ""),
    }
    ebook_dict: dict[str, Any] | None = None
    print_interior_dict: dict[str, Any] | None = None
    print_cover_dict: dict[str, Any] | None = None

    if "ebook" in modes:
        ebook_report: EbookPreflightReport = run_ebook_preflight(
            repo=repo, spec=spec, skip_epubcheck=skip_epubcheck
        )
        remapped, ebook_applied = apply_profile_severities(ebook_report.issues, profile_checks)
        ebook_report.issues = remapped
        ebook_report.ok = not any(i.severity == "blocking" for i in remapped)
        write_ebook_preflight_reports(ebook_report, ebook_output_dir(repo, spec))
        ebook_dict = ebook_report.to_dict()
        all_issues.extend(remapped)
        applied.extend(ebook_applied)
        tool_versions.update({str(k): str(v) for k, v in ebook_report.tool_versions.items()})

    if "print" in modes:
        interior_issues, print_interior_dict = _run_print_interior_checks(repo=repo, spec=spec)
        cover_issues, print_cover_dict = _run_print_cover_checks(
            repo=repo, book_dir=book_dir, spec=spec
        )
        remapped_i, applied_i = apply_profile_severities(interior_issues, profile_checks)
        remapped_c, applied_c = apply_profile_severities(cover_issues, profile_checks)
        all_issues.extend(remapped_i)
        all_issues.extend(remapped_c)
        applied.extend(applied_i)
        applied.extend(applied_c)

        print_dir = print_output_dir(repo, spec)
        print_dir.mkdir(parents=True, exist_ok=True)
        print_payload = {
            "ok": not any(i.severity == "blocking" for i in remapped_i + remapped_c),
            "interior": print_interior_dict,
            "cover": print_cover_dict,
            "issues": [asdict(i) for i in remapped_i + remapped_c],
        }
        (print_dir / "preflight.json").write_text(
            json.dumps(print_payload, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )

    # ISBN uniqueness when both modes present in config (even if filtered by flags).
    ebook_cfg = _as_dict(target.get("ebook"))
    print_cfg = _as_dict(target.get("print"))
    if (
        ebook_cfg.get("enabled", False) is True
        and print_cfg.get("enabled", False) is True
        and str(ebook_cfg.get("isbn") or "").strip()
        and str(print_cfg.get("isbn") or "").strip()
        and str(ebook_cfg.get("isbn")).strip() == str(print_cfg.get("isbn")).strip()
    ):
        uniq = PreflightIssue(
            id="package-edition-isbn-unique",
            severity=resolve_severity(
                profile_checks=profile_checks,
                issue_id="package-edition-isbn-unique",
                default="blocking",
            ),
            message="Ebook ISBN and print ISBN must be distinct",
        )
        all_issues.append(uniq)
        applied.append("package-edition-isbn-unique")

    manual = _manual_review_checklist(ebook="ebook" in modes, print_on="print" in modes)
    ok = not any(i.severity == "blocking" for i in all_issues)
    return UnifiedPreflightReport(
        ok=ok,
        specification_profile=profile_id,
        modes=list(modes),
        issues=all_issues,
        manual_review=manual,
        tool_versions=tool_versions,
        ebook=ebook_dict,
        print_interior=print_interior_dict,
        print_cover=print_cover_dict,
        profile_checks_applied=sorted(set(applied)),
    )


def write_unified_preflight_reports(
    report: UnifiedPreflightReport,
    *,
    repo: Path,
    spec: dict[str, Any],
) -> tuple[Path, Path]:
    build_dir = ingramspark_build_dir(repo, spec)
    build_dir.mkdir(parents=True, exist_ok=True)
    json_path = build_dir / "preflight.json"
    text_path = build_dir / "preflight-report.txt"
    json_path.write_text(
        json.dumps(report.to_dict(), indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    text_path.write_text(report.human_text(), encoding="utf-8")
    return json_path, text_path
