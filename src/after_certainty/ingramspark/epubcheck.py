"""Run the pinned EPUBCheck tool for IngramSpark ebook validation."""

from __future__ import annotations

import json
import os
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from after_certainty.ingramspark.profile import load_profile

_REPO_ROOT = Path(__file__).resolve().parents[2]
_VENDOR_ROOT = _REPO_ROOT / "tools" / "vendor"


@dataclass(frozen=True)
class EpubcheckResult:
    ok: bool
    tool_version: str
    jar_path: Path
    stdout: str
    stderr: str
    returncode: int
    json_report: dict[str, Any] | None


class EpubcheckError(RuntimeError):
    """EPUBCheck could not be executed or reported fatal errors."""


def expected_epubcheck_version(profile_id: str) -> str:
    profile = load_profile(profile_id)
    version = str(profile.get("epubcheck_tool_version") or "").strip()
    if not version:
        raise EpubcheckError(f"Profile {profile_id!r} missing epubcheck_tool_version")
    return version


def epubcheck_jar_path(version: str) -> Path:
    return (_VENDOR_ROOT / f"epubcheck-{version}" / "epubcheck.jar").resolve()


def ensure_epubcheck(version: str) -> Path:
    jar = epubcheck_jar_path(version)
    if jar.is_file():
        return jar
    install = _REPO_ROOT / "scripts" / "install_epubcheck.sh"
    env = os.environ.copy()
    env["EPUBCHECK_VERSION"] = version
    subprocess.run(
        ["bash", install.as_posix()],
        check=True,
        cwd=_REPO_ROOT.as_posix(),
        env=env,
    )
    if not jar.is_file():
        raise EpubcheckError(f"EPUBCheck install did not produce {jar}")
    return jar


def run_epubcheck(
    epub_path: Path,
    *,
    profile_id: str,
    java: str = "java",
) -> EpubcheckResult:
    version = expected_epubcheck_version(profile_id)
    jar = ensure_epubcheck(version)
    epub_path = epub_path.resolve()
    if not epub_path.is_file():
        raise EpubcheckError(f"EPUB not found: {epub_path}")

    with tempfile.TemporaryDirectory(prefix="epubcheck-") as tmp:
        report_path = Path(tmp) / "report.json"
        cmd = [
            java,
            "-jar",
            jar.as_posix(),
            epub_path.as_posix(),
            "-j",
            report_path.as_posix(),
        ]
        proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
        report: dict[str, Any] | None = None
        if report_path.is_file():
            try:
                report = json.loads(report_path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                report = None

    ok = proc.returncode == 0
    return EpubcheckResult(
        ok=ok,
        tool_version=version,
        jar_path=jar,
        stdout=proc.stdout or "",
        stderr=proc.stderr or "",
        returncode=proc.returncode,
        json_report=report,
    )


def format_epubcheck_failure(result: EpubcheckResult, *, limit: int = 800) -> str:
    """Build an actionable failure summary from EPUBCheck stdout/JSON."""
    parts: list[str] = [f"EPUBCheck {result.tool_version} failed (exit {result.returncode})"]
    if result.json_report and isinstance(result.json_report.get("messages"), list):
        for msg in result.json_report["messages"][:5]:
            if not isinstance(msg, dict):
                continue
            mid = msg.get("ID") or ""
            severity = msg.get("severity") or ""
            text = msg.get("message") or ""
            loc = ""
            locations = msg.get("locations") or []
            if locations and isinstance(locations[0], dict):
                loc = locations[0].get("path") or ""
            parts.append(f"{severity} {mid}: {text}" + (f" ({loc})" if loc else ""))
    detail = (result.stderr or result.stdout or "").strip()
    if detail:
        parts.append(detail[:limit])
    return "; ".join(parts)
