"""Tests for reader passage link audit / propose tooling."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path
from typing import Any

import yaml

import reader_passage_links as rpl


def _write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def _book_spec(book_id: str) -> str:
    return f"book:\n  id: {book_id}\n  title: Test Book {book_id}\n  kind: prose\n"


def _mini_repo(tmp_path: Path) -> Path:
    """
    Mini corpus:

    - edition-a / chapter-1: cites Goodhart-like source via footnote
    - edition-a / chapter-2: bibliography-only mention path
    - edition-b: second edition of a related title family
    - source with valid path, invalid path, missing path, biblio-only
    - thinker with two works
    """
    repo = tmp_path / "repo"

    # --- Book edition-a ---
    book_a = repo / "books" / "edition-a"
    _write(book_a / "book.yml", _book_spec("edition-a"))
    _write(
        book_a / "index.md",
        "# Edition A\n\n## Part 1\n\n"
        "- [Effectiveness](parts/part-1/chapter-1-effectiveness.md)\n"
        "- [Other](parts/part-1/chapter-2-other.md)\n"
        "- [Bibliography](back-matter/bibliography.md)\n",
    )
    _write(
        book_a / "parts/part-1/chapter-1-effectiveness.md",
        "# Effectiveness\n\n"
        "## Effective at What\n\n"
        "When a measure becomes a target, it can stop representing the "
        "work.[^c1-goodhart-monetary-management]\n\n"
        "[^c1-goodhart-monetary-management]: Goodhart, Charles A. E. "
        '"Problems of Monetary Management: The U.K. Experience." '
        "In Papers in Monetary Economics, 1975.\n",
    )
    _write(
        book_a / "parts/part-1/chapter-2-other.md",
        "# Other\n\n"
        "A chapter that only alludes to Conditions for Intuitive Expertise "
        "without a footnote citation.\n",
    )
    _write(
        book_a / "back-matter/bibliography.md",
        "# **Bibliography**\n\n"
        "- Goodhart, Charles A. E. *Problems of Monetary Management: The U.K.* "
        "Sydney: Reserve Bank of Australia, 1975.\n"
        "- Kahneman, Daniel, and Gary Klein. "
        '"Conditions for Intuitive Expertise: A Failure to Disagree." '
        "American Psychologist 64, no. 6 (2009): 515–526.\n"
        "- Amershi, Saleema, et al. "
        '"Guidelines for Human-AI Interaction." CHI 2019.\n',
    )

    # --- Book edition-b (second edition slug) ---
    book_b = repo / "books" / "edition-b"
    _write(book_b / "book.yml", _book_spec("edition-b"))
    _write(
        book_b / "index.md",
        "# Edition B\n\n## Part 1\n\n"
        "- [Trust](parts/part-1/chapter-1-trust.md)\n"
        "- [Bibliography](back-matter/bibliography.md)\n",
    )
    _write(
        book_b / "parts/part-1/chapter-1-trust.md",
        "# Trust\n\n"
        "Expert judgment needs regularity and feedback."
        "[^c1-kahneman-klein-intuitive-expertise]\n\n"
        "[^c1-kahneman-klein-intuitive-expertise]: Kahneman, Daniel, and Gary Klein. "
        '"Conditions for Intuitive Expertise: A Failure to Disagree." '
        "American Psychologist 64, no. 6 (2009): 515–526.\n",
    )
    _write(
        book_b / "back-matter/bibliography.md",
        "# **Bibliography**\n\n"
        "- Kahneman, Daniel, and Gary Klein. "
        '"Conditions for Intuitive Expertise: A Failure to Disagree." '
        "American Psychologist 64, no. 6 (2009): 515–526.\n",
    )

    # --- Sources ---
    goodhart_path = (
        "/explore/books/edition-a/chapters/"
        "parts-part-1-chapter-1-effectiveness"
        "#user-content-fnref-c1-goodhart-monetary-management"
    )
    _write(
        repo / "semantic/sources/goodhart-pilot.yml",
        "slug: goodhart-pilot\n"
        "name: 'Charles A. E Goodhart — Problems of Monetary Management: The U.K.'\n"
        "type: article\n"
        "summary: Goodhart monetary management 1975.\n"
        "concepts: []\npatterns: []\n"
        "relatedBooks:\n- edition-a\n"
        "title: 'Problems of Monetary Management: The U.K.'\n"
        "creatorNames:\n- Charles A. E Goodhart\n"
        "creatorSlugs:\n- charles-goodhart\n"
        "citation: 'Goodhart, Charles A. E. \"Problems of Monetary Management.\" 1975.'\n"
        "sourceKind: article\n"
        "whyThisMatters: >-\n"
        "  Goodhart's work on monetary targets raises a problem that extends beyond\n"
        "  monetary policy into accountability for metric regimes.\n"
        f"readerPassagePath: {goodhart_path}\n",
    )
    _write(
        repo / "semantic/sources/kahneman-klein-pilot.yml",
        "slug: kahneman-klein-pilot\n"
        "name: 'Kahneman, Daniel, and Gary Klein — Conditions for Intuitive Expertise'\n"
        "type: article\n"
        "summary: Conditions for Intuitive Expertise failure to disagree.\n"
        "concepts: []\npatterns: []\n"
        "relatedBooks:\n- edition-b\n"
        "title: 'Conditions for Intuitive Expertise: A Failure to Disagree'\n"
        "creatorNames:\n- Daniel Kahneman\n- Gary Klein\n"
        "creatorSlugs:\n- daniel-kahneman\n- gary-klein\n"
        "citation: Kahneman and Klein 2009.\n"
        "sourceKind: article\n",
    )
    # Missing path but cited → B
    # Invalid path (wrong book)
    _write(
        repo / "semantic/sources/amershi-pilot.yml",
        "slug: amershi-pilot\n"
        "name: Saleema Amershi — Guidelines for Human-AI Interaction\n"
        "type: article\n"
        "summary: Guidelines for Human-AI Interaction CHI.\n"
        "concepts: []\npatterns: []\n"
        "relatedBooks:\n- edition-a\n"
        "title: Guidelines for Human-AI Interaction\n"
        "creatorNames:\n- Saleema Amershi\n"
        "creatorSlugs:\n- saleema-amershi\n"
        "citation: Amershi et al. CHI 2019.\n"
        "sourceKind: article\n"
        "readerPassagePath: /explore/books/edition-b/chapters/parts-part-1-chapter-1-trust#nope\n",
    )
    # Bibliography only (in biblio + relatedBooks, no body engagement)
    _write(
        repo / "semantic/sources/biblio-only-pilot.yml",
        "slug: biblio-only-pilot\n"
        "name: Someone — An Obscure Report Never Discussed\n"
        "type: report\n"
        "summary: An Obscure Report Never Discussed.\n"
        "concepts: []\npatterns: []\n"
        "relatedBooks:\n- edition-a\n"
        "title: An Obscure Report Never Discussed\n"
        "creatorNames:\n- Someone\n"
        "creatorSlugs:\n- someone\n"
        "citation: Someone. An Obscure Report Never Discussed.\n"
        "sourceKind: report\n",
    )
    # Ambiguous short name — surname-only must not become A
    _write(
        repo / "semantic/sources/smith-common-name.yml",
        "slug: smith-common-name\n"
        "name: Jane Smith — Completely Unrelated Tract\n"
        "type: book\n"
        "summary: Completely Unrelated Tract.\n"
        "concepts: []\npatterns: []\n"
        "relatedBooks:\n- edition-a\n"
        "title: Completely Unrelated Tract\n"
        "creatorNames:\n- Jane Smith\n"
        "creatorSlugs:\n- jane-smith\n"
        "citation: Smith, Jane. Completely Unrelated Tract.\n"
        "sourceKind: book\n",
    )

    # --- Thinkers ---
    _write(
        repo / "semantic/thinkers/charles-goodhart.yml",
        "slug: charles-goodhart\n"
        "name: Charles Goodhart\n"
        "type: person\n"
        "summary: Monetary economist.\n"
        "concepts: []\npatterns: []\nrelatedBooks:\n- edition-a\n"
        "works:\n- goodhart-pilot\n"
        "whyThisMatters: Metric regimes and accountability.\n",
    )
    _write(
        repo / "semantic/thinkers/daniel-kahneman.yml",
        "slug: daniel-kahneman\n"
        "name: Daniel Kahneman\n"
        "type: person\n"
        "summary: Psychologist of judgment.\n"
        "concepts: []\npatterns: []\nrelatedBooks:\n- edition-b\n"
        "works:\n- kahneman-klein-pilot\n",
    )
    _write(
        repo / "semantic/thinkers/gary-klein.yml",
        "slug: gary-klein\n"
        "name: Gary Klein\n"
        "type: person\n"
        "summary: Naturalistic decision making.\n"
        "concepts: []\npatterns: []\nrelatedBooks:\n- edition-b\n"
        "works:\n- kahneman-klein-pilot\n",
    )

    return repo


def _stub_fragment_ok(
    repo: Path,
    *,
    book_dir: str,
    source_path: str,
    fragment: str,
    timeout_s: float = 60.0,
) -> tuple[bool, str | None]:
    _ = (repo, book_dir, source_path, timeout_s)
    # Treat footnote-shaped fragments as present for unit tests.
    if fragment.startswith("user-content-fnref-"):
        return True, None
    if fragment == "effective-at-what":
        return True, None
    return False, "fragment not found in rendered HTML"


def test_valid_deep_link_and_pilot_shapes(tmp_path: Path, monkeypatch: Any) -> None:
    repo = _mini_repo(tmp_path)
    monkeypatch.setattr(rpl, "validate_fragment_in_rendered_html", _stub_fragment_ok)
    result = rpl.run_audit(repo, check_fragments=True)
    by_slug = {s.slug: s for s in result.sources}

    goodhart = by_slug["goodhart-pilot"]
    assert goodhart.evidence_level == "A"
    assert goodhart.path_validation is not None
    assert goodhart.path_validation.is_fully_valid
    assert goodhart.footnote_hits
    assert goodhart.why_this_matters_ok

    kk = by_slug["kahneman-klein-pilot"]
    assert kk.evidence_level == "B"
    assert kk.candidate_path
    assert "user-content-fnref-c1-kahneman-klein" in (kk.candidate_path or "")


def test_missing_chapter_and_wrong_edition(tmp_path: Path, monkeypatch: Any) -> None:
    repo = _mini_repo(tmp_path)
    monkeypatch.setattr(rpl, "validate_fragment_in_rendered_html", _stub_fragment_ok)
    # Missing chapter
    src = yaml.safe_load((repo / "semantic/sources/goodhart-pilot.yml").read_text(encoding="utf-8"))
    src["readerPassagePath"] = "/explore/books/edition-a/chapters/parts-part-1-chapter-9-missing#x"
    (repo / "semantic/sources/goodhart-pilot.yml").write_text(
        yaml.safe_dump(src, sort_keys=False), encoding="utf-8"
    )
    result = rpl.run_audit(repo, check_fragments=True)
    g = next(s for s in result.sources if s.slug == "goodhart-pilot")
    assert g.status == "invalid_passage_link"
    assert "chapter_not_found" in (g.path_validation.issues if g.path_validation else [])

    # Wrong edition (amershi points at edition-b while relatedBooks is edition-a)
    amershi = next(s for s in result.sources if s.slug == "amershi-pilot")
    assert amershi.status == "invalid_passage_link"
    assert "edition_not_in_related_books" in (
        amershi.path_validation.issues if amershi.path_validation else []
    )


def test_non_public_chapter(tmp_path: Path, monkeypatch: Any) -> None:
    repo = _mini_repo(tmp_path)
    monkeypatch.setattr(rpl, "validate_fragment_in_rendered_html", _stub_fragment_ok)
    chapters = rpl.load_published_chapters(repo)
    # Force one chapter non-public
    route = "/explore/books/edition-a/chapters/parts-part-1-chapter-1-effectiveness"
    chapters[route].public = False
    src = yaml.safe_load((repo / "semantic/sources/goodhart-pilot.yml").read_text(encoding="utf-8"))
    pv = rpl.validate_reader_passage_path(
        str(src["readerPassagePath"]),
        related_books=["edition-a"],
        chapters=chapters,
        repo=repo,
        check_fragment=True,
        fragment_cache={},
    )
    assert not pv.is_fully_valid
    assert "chapter_not_public" in pv.issues


def test_missing_fragment_is_defect(tmp_path: Path, monkeypatch: Any) -> None:
    repo = _mini_repo(tmp_path)

    def _missing(*_a: Any, **_k: Any) -> tuple[bool, str | None]:
        return False, "fragment not found in rendered HTML"

    monkeypatch.setattr(rpl, "validate_fragment_in_rendered_html", _missing)
    result = rpl.run_audit(repo, check_fragments=True)
    g = next(s for s in result.sources if s.slug == "goodhart-pilot")
    assert g.status == "invalid_passage_link"
    assert "fragment_missing" in (g.path_validation.issues if g.path_validation else [])


def test_heading_anchor_validation(tmp_path: Path, monkeypatch: Any) -> None:
    repo = _mini_repo(tmp_path)
    monkeypatch.setattr(rpl, "validate_fragment_in_rendered_html", _stub_fragment_ok)
    chapters = rpl.load_published_chapters(repo)
    path = (
        "/explore/books/edition-a/chapters/parts-part-1-chapter-1-effectiveness#effective-at-what"
    )
    pv = rpl.validate_reader_passage_path(
        path,
        related_books=["edition-a"],
        chapters=chapters,
        repo=repo,
        check_fragment=True,
        fragment_cache={},
    )
    assert pv.is_fully_valid
    assert pv.fragment == "effective-at-what"


def test_bibliography_only_is_level_d(tmp_path: Path, monkeypatch: Any) -> None:
    repo = _mini_repo(tmp_path)
    monkeypatch.setattr(rpl, "validate_fragment_in_rendered_html", _stub_fragment_ok)
    result = rpl.run_audit(repo, check_fragments=False)
    # biblio-only-pilot may be D if matched into bibliography, else E if unmatched
    row = next(s for s in result.sources if s.slug == "biblio-only-pilot")
    assert row.evidence_level in {"D", "E"}
    assert row.evidence_level != "A"
    assert row.recommended_action in {"do_not_fabricate_citation", "none"}


def test_multiple_works_same_thinker_and_ambiguous_names(tmp_path: Path, monkeypatch: Any) -> None:
    repo = _mini_repo(tmp_path)
    monkeypatch.setattr(rpl, "validate_fragment_in_rendered_html", _stub_fragment_ok)
    result = rpl.run_audit(repo, check_fragments=True)
    # Both Kahneman and Klein derive from the same work once it has a path;
    # currently B-level via citation.
    dk = next(t for t in result.thinkers if t.slug == "daniel-kahneman")
    gk = next(t for t in result.thinkers if t.slug == "gary-klein")
    assert "kahneman-klein-pilot" in dk.work_slugs
    assert "kahneman-klein-pilot" in gk.work_slugs
    assert dk.chapters_citing_works or dk.evidence_level in {"B", "A", "D"}

    smith = next(s for s in result.sources if s.slug == "smith-common-name")
    assert smith.evidence_level in {"D", "E"}
    assert smith.evidence_level != "A"


def test_multiple_editions_keep_distinct_route_keys(tmp_path: Path, monkeypatch: Any) -> None:
    repo = _mini_repo(tmp_path)
    monkeypatch.setattr(rpl, "validate_fragment_in_rendered_html", _stub_fragment_ok)
    chapters = rpl.load_published_chapters(repo)
    a_routes = [k for k in chapters if "/edition-a/" in k]
    b_routes = [k for k in chapters if "/edition-b/" in k]
    assert a_routes
    assert b_routes
    assert not set(a_routes) & set(b_routes)


def test_propose_batch_idempotent_and_preserves_yaml(tmp_path: Path, monkeypatch: Any) -> None:
    repo = _mini_repo(tmp_path)
    monkeypatch.setattr(rpl, "validate_fragment_in_rendered_html", _stub_fragment_ok)
    before = (repo / "semantic/sources/kahneman-klein-pilot.yml").read_text(encoding="utf-8")
    result = rpl.run_audit(repo, check_fragments=False)
    review_log: dict[str, dict] = {}
    batch1 = rpl.build_candidates(
        result,
        kind="sources",
        only_missing=True,
        batch_size=5,
        unreviewed_only=True,
        review_log=review_log,
    )
    assert batch1
    # Simulate logging as proposed then applied
    for c in batch1:
        key = rpl._candidate_key(c.entity_kind, c.slug, c.route_key)
        review_log[key] = {"status": "applied"}
    batch2 = rpl.build_candidates(
        result,
        kind="sources",
        only_missing=True,
        batch_size=5,
        unreviewed_only=True,
        review_log=review_log,
    )
    applied_keys = {rpl._candidate_key(c.entity_kind, c.slug, c.route_key) for c in batch1}
    for c in batch2:
        assert rpl._candidate_key(c.entity_kind, c.slug, c.route_key) not in applied_keys

    after = (repo / "semantic/sources/kahneman-klein-pilot.yml").read_text(encoding="utf-8")
    assert before == after  # propose must not mutate YAML


def test_report_writers_and_cli(tmp_path: Path, monkeypatch: Any) -> None:
    repo = _mini_repo(tmp_path)
    monkeypatch.setattr(rpl, "validate_fragment_in_rendered_html", _stub_fragment_ok)
    result = rpl.run_audit(repo, check_fragments=False)
    md = repo / "reports/reader-passage-links/audit.md"
    js = repo / "reports/reader-passage-links/audit.json"
    rpl.write_audit_reports(result, md_out=md, json_out=js)
    assert "Reader passage links audit" in md.read_text(encoding="utf-8")
    payload = json.loads(js.read_text(encoding="utf-8"))
    assert "totals" in payload
    assert "sources" in payload

    out_md = repo / "reports/reader-passage-links/from-cli.md"
    out_json = repo / "reports/reader-passage-links/from-cli.json"
    proc = subprocess.run(
        [
            sys.executable,
            str(Path(__file__).resolve().parents[1] / "tools" / "audit_reader_passage_links.py"),
            "--repo",
            str(repo),
            "--md-out",
            str(out_md),
            "--json-out",
            str(out_json),
            "--skip-fragment-check",
        ],
        capture_output=True,
        text=True,
        timeout=120,
    )
    assert proc.returncode == 0, proc.stderr
    assert out_md.is_file()


def test_parse_path_regex() -> None:
    ed, ch, frag = rpl.parse_reader_passage_path(
        "/explore/books/coupling/chapters/parts-x#user-content-fnref-c1"
    )
    assert ed == "coupling"
    assert ch == "parts-x"
    assert frag == "user-content-fnref-c1"
    assert rpl.parse_reader_passage_path("/explore/books/X/chapters/y")[0] is None


def test_live_pilot_sources_when_present() -> None:
    """Regression against real Goodhart / Kahneman–Klein / Amershi YAML on this repo."""
    repo = Path(__file__).resolve().parents[1]
    goodhart = repo / (
        "semantic/sources/goodhart-charles-a-e-problems-of-monetary-management-the-u-k.yml"
    )
    if not goodhart.is_file():
        return
    # Path shape only — full fragment check is expensive; covered by site tests.
    doc = yaml.safe_load(goodhart.read_text(encoding="utf-8"))
    path = str(doc.get("readerPassagePath") or "")
    assert path.startswith("/explore/books/")
    ed, ch, frag = rpl.parse_reader_passage_path(path)
    assert ed and ch and frag
    assert frag.startswith("user-content-fnref-")
