"""Tests for thinker concept audit tooling."""

from __future__ import annotations

from pathlib import Path

import thinker_concept_audit as tca


def _write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def _mini_repo(tmp_path: Path) -> Path:
    repo = tmp_path / "repo"
    _write(
        repo / "semantic/ontology/core-terms.yml",
        "version: 1\nterms: []\n",
    )
    _write(
        repo / "semantic/ontology/supporting-terms.yml",
        "version: 1\nterms: []\n",
    )
    _write(
        repo / "semantic/glossary/agile.yml",
        "slug: agile\ntitle: Agile\nshortDefinition: x\ntermKind: extended\n"
        "relatedConcepts: []\nrelatedPatterns: []\nrelatedBooks: []\n",
    )
    _write(
        repo / "semantic/glossary/guest-leadership.yml",
        "slug: guest-leadership\ntitle: Guest Leadership\nshortDefinition: x\n"
        "termKind: extended\nrelatedConcepts: []\nrelatedPatterns: []\nrelatedBooks: []\n",
    )
    _write(
        repo / "semantic/sources/cockburn-alistair-agile-software-development.yml",
        "slug: cockburn-alistair-agile-software-development\n"
        "name: Cockburn Agile\n"
        "type: book\n"
        "summary: Agile Software Development\n"
        "concepts: []\npatterns: []\nrelatedBooks: []\n"
        "title: Agile Software Development\n"
        "creatorNames:\n- Alistair Cockburn\n"
        "creatorSlugs:\n- alistair-cockburn\n"
        "sourceKind: book\n",
    )
    _write(
        repo / "semantic/sources/cockburn-alistair-how-to-step-up.yml",
        "slug: cockburn-alistair-how-to-step-up\n"
        "name: Cockburn Step Up\n"
        "type: article\n"
        "summary: Promoting Guest Leadership\n"
        "concepts: []\npatterns: []\nrelatedBooks: []\n"
        'title: "How to Step Up: Promoting Guest Leadership"\n'
        "creatorNames:\n- Alistair Cockburn\n"
        "creatorSlugs:\n- alistair-cockburn\n"
        "sourceKind: article\n",
    )
    _write(
        repo / "semantic/thinkers/alistair-cockburn.yml",
        "slug: alistair-cockburn\n"
        "name: Alistair Cockburn\n"
        "type: person\n"
        "summary: Software methodologist of agile practice.\n"
        "concepts:\n- agile\n"
        "patterns: []\nrelatedBooks: []\n"
        "works:\n- cockburn-alistair-agile-software-development\n"
        "- cockburn-alistair-how-to-step-up\n",
    )
    return repo


def test_audit_detects_candidate_missing_and_heuristics(tmp_path: Path) -> None:
    repo = _mini_repo(tmp_path)
    result = tca.run_audit(repo)
    audit = next(a for a in result.thinkers if a.slug == "alistair-cockburn")
    assert "agile" in audit.concepts
    assert "guest-leadership" in audit.candidate_missing
    assert any(s.empty_with_heuristic for s in audit.sources)


def test_format_report_includes_priority_and_summary(tmp_path: Path) -> None:
    repo = _mini_repo(tmp_path)
    result = tca.run_audit(repo)
    report = tca.format_report(result)
    assert "# Thinker concept audit" in report
    assert "alistair-cockburn" in report
    assert "Executive summary" in report
    assert "All thinkers (summary)" in report


def test_collect_advisory_warnings(tmp_path: Path) -> None:
    repo = _mini_repo(tmp_path)
    warnings = tca.collect_advisory_warnings(repo)
    assert any("empty concepts but title suggests" in w for w in warnings)


def test_audit_cli_writes_report(tmp_path: Path) -> None:
    repo = _mini_repo(tmp_path)
    out = repo / "reports/thinker-concept-audit.md"
    import subprocess
    import sys

    r = subprocess.run(
        [
            sys.executable,
            str(Path(__file__).resolve().parents[1] / "tools" / "audit_thinker_concepts.py"),
            "--repo",
            str(repo),
            "--out",
            str(out),
        ],
        capture_output=True,
        text=True,
        timeout=30,
    )
    assert r.returncode == 0, r.stderr
    assert out.is_file()
    assert "Thinker concept audit" in out.read_text(encoding="utf-8")
