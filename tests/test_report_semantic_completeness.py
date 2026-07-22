"""Tests for semantic completeness report."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]


def _run(cmd: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, cwd=REPO, capture_output=True, text=True, check=False)


def test_report_generates_deterministic_structure(tmp_path: Path) -> None:
    sys.path.insert(0, str(REPO / "tools"))
    from report_semantic_completeness import build_report, format_markdown

    r1 = build_report(REPO)
    r2 = build_report(REPO)
    assert r1["bookCount"] == r2["bookCount"] >= 1
    assert [b["slug"] for b in r1["books"]] == [b["slug"] for b in r2["books"]]
    assert "summaries" in r1
    assert "orphanedFromDiscovery" in r1["summaries"]
    md = format_markdown(r1)
    assert "Semantic completeness report" in md
    assert "Books missing rich overviews" in md


def test_fiction_and_poetry_profiles() -> None:
    sys.path.insert(0, str(REPO / "tools"))
    from report_semantic_completeness import build_report

    report = build_report(REPO)
    by_slug = {b["slug"]: b for b in report["books"]}
    assert by_slug["boundary-conditions"]["profile"] == "fiction"
    assert by_slug["boundary-conditions"]["fields"]["richOverview"] == "complete"
    assert by_slug["observer-patterns"]["profile"] == "poetry"
    assert by_slug["observer-patterns"]["fields"]["richOverview"] == "complete"
    assert by_slug["before-certainty-arrives"]["profile"] == "nonfiction"


def test_cli_writes_report_without_touching_tracked_outputs(tmp_path: Path) -> None:
    """Write to a temp dir so CI clean-tree checks are not dirtied by generatedAt."""
    md = tmp_path / "semantic-completeness.md"
    js = tmp_path / "semantic-completeness.json"
    r = _run(
        [
            sys.executable,
            "tools/report_semantic_completeness.py",
            "--repo",
            str(REPO),
            "--md-out",
            str(md),
            "--json-out",
            str(js),
        ]
    )
    assert r.returncode == 0, r.stderr or r.stdout
    assert md.is_file()
    assert js.is_file()
    data = json.loads(js.read_text(encoding="utf-8"))
    assert data["bookCount"] >= 30
    # Tracked reports under reports/ must remain unchanged by this test.
    assert _run(["git", "diff", "--quiet", "--", "reports/semantic-completeness.md"]).returncode == 0
    assert (
        _run(["git", "diff", "--quiet", "--", "reports/semantic-completeness.json"]).returncode == 0
    )
