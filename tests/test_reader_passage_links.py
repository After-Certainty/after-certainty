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
    Mini corpus covering:

    - Valid Goodhart deep link tied to its citation fragment
    - Shared footnote citing Adler + Abate
    - Defined-but-unreferenced footnote
    - Wrong-source authored path (Amershi path → Goodhart fragment)
    - Kahneman missing path but cited in edition-b
    - Empty relatedBooks source
    - Bibliography-only / ambiguous surname
    """
    repo = tmp_path / "repo"

    book_a = repo / "books" / "edition-a"
    _write(book_a / "book.yml", _book_spec("edition-a"))
    _write(
        book_a / "index.md",
        "# Edition A\n\n## Part 1\n\n"
        "- [Effectiveness](parts/part-1/chapter-1-effectiveness.md)\n"
        "- [Clipboard](parts/part-1/chapter-2-clipboard.md)\n"
        "- [Bibliography](back-matter/bibliography.md)\n",
    )
    _write(
        book_a / "parts/part-1/chapter-1-effectiveness.md",
        "# Effectiveness\n\n"
        "## Effective at What\n\n"
        "When a measure becomes a target, it can stop representing the "
        "work.[^c1-goodhart-monetary-management]\n\n"
        "An orphaned note is defined but never invoked.\n\n"
        "[^c1-goodhart-monetary-management]: Goodhart, Charles A. E. "
        '"Problems of Monetary Management: The U.K. Experience." '
        "In Papers in Monetary Economics, 1975.\n"
        "[^c1-orphaned-unused]: Someone, Jane. "
        "*Completely Unrelated Tract*. 1900.\n",
    )
    _write(
        book_a / "parts/part-1/chapter-2-clipboard.md",
        "# Clipboard\n\n"
        "The plant closed after years of struggle.[^c2-nummi-close]\n\n"
        "[^c2-nummi-close]: See Paul S. Adler, "
        "\"The 'Learning Bureaucracy': New United Motor Manufacturing, Inc.\"; "
        "and Tom Abate, \"Nummi workers say their final good-byes,\" "
        "San Francisco Chronicle, April 2, 2010.\n",
    )
    _write(
        book_a / "back-matter/bibliography.md",
        "# **Bibliography**\n\n"
        "- Goodhart, Charles A. E. *Problems of Monetary Management: The U.K.* "
        "Sydney: Reserve Bank of Australia, 1975.\n"
        "- Adler, Paul S. \"The 'Learning Bureaucracy': New United Motor "
        'Manufacturing, Inc."\n'
        '- Abate, Tom. "Nummi workers say their final good-byes." '
        "San Francisco Chronicle, 2010.\n"
        "- Amershi, Saleema, et al. "
        '"Guidelines for Human-AI Interaction." CHI 2019.\n'
        "- Someone, Jane. *Completely Unrelated Tract*. 1900.\n",
    )

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
    # Wrong fragment: path points at Goodhart's fnref, not an Amershi citation.
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
        f"readerPassagePath: {goodhart_path}\n",
    )
    _write(
        repo / "semantic/sources/adler-pilot.yml",
        "slug: adler-pilot\n"
        "name: \"Paul S. Adler — The 'Learning Bureaucracy'\"\n"
        "type: article\n"
        "summary: Learning Bureaucracy NUMMI.\n"
        "concepts: []\npatterns: []\n"
        "relatedBooks:\n- edition-a\n"
        "title: \"The 'Learning Bureaucracy': New United Motor Manufacturing, Inc.\"\n"
        "creatorNames:\n- Paul S. Adler\n"
        "creatorSlugs:\n- paul-s-adler\n"
        "citation: Adler Learning Bureaucracy.\n"
        "sourceKind: article\n",
    )
    _write(
        repo / "semantic/sources/abate-pilot.yml",
        "slug: abate-pilot\n"
        "name: Tom Abate — Nummi workers say their final good-byes\n"
        "type: article\n"
        "summary: Nummi workers say their final good-byes.\n"
        "concepts: []\npatterns: []\n"
        "relatedBooks:\n- edition-a\n"
        "title: Nummi workers say their final good-byes\n"
        "creatorNames:\n- Tom Abate\n"
        "creatorSlugs:\n- tom-abate\n"
        "citation: Abate Nummi workers.\n"
        "sourceKind: article\n",
    )
    _write(
        repo / "semantic/sources/empty-related-books.yml",
        "slug: empty-related-books\n"
        "name: Orphan Work — No Book Link\n"
        "type: book\n"
        "summary: No Book Link.\n"
        "concepts: []\npatterns: []\n"
        "relatedBooks: []\n"
        "title: No Book Link\n"
        "creatorNames:\n- Orphan Author\n"
        "creatorSlugs:\n- orphan-author\n"
        "citation: Orphan Author. No Book Link.\n"
        "sourceKind: book\n"
        "readerPassagePath: /explore/books/edition-a/chapters/"
        "parts-part-1-chapter-1-effectiveness#user-content-fnref-c1-goodhart-monetary-management\n",
    )
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
    if fragment.startswith("user-content-fnref-"):
        return True, None
    if fragment == "effective-at-what":
        return True, None
    return False, "fragment not found in rendered HTML"


def test_valid_deep_link_tied_to_fragment(tmp_path: Path, monkeypatch: Any) -> None:
    repo = _mini_repo(tmp_path)
    monkeypatch.setattr(rpl, "validate_fragment_in_rendered_html", _stub_fragment_ok)
    result = rpl.run_audit(repo, check_fragments=True)
    by_slug = {s.slug: s for s in result.sources}

    goodhart = by_slug["goodhart-pilot"]
    assert goodhart.evidence_level == "A"
    assert goodhart.status == "verified_link_tied_citation"
    assert goodhart.fragment_tied_hit
    assert goodhart.path_validation is not None
    assert goodhart.path_validation.is_fully_valid
    assert goodhart.footnote_hits
    assert goodhart.footnote_hits[0].ref_present
    assert "Effective at What" in goodhart.footnote_hits[0].excerpt or "measure" in (
        goodhart.footnote_hits[0].excerpt
    )
    assert result.totals["sources"]["verifiedLinkTiedCitation"] >= 1

    kk = by_slug["kahneman-klein-pilot"]
    assert kk.evidence_level == "B"
    assert kk.candidate_path
    assert "user-content-fnref-c1-kahneman-klein" in (kk.candidate_path or "")
    assert kk.recommended_action == "editorial_review_then_add_path"


def test_wrong_source_anchor_is_not_level_a(tmp_path: Path, monkeypatch: Any) -> None:
    repo = _mini_repo(tmp_path)
    monkeypatch.setattr(rpl, "validate_fragment_in_rendered_html", _stub_fragment_ok)
    result = rpl.run_audit(repo, check_fragments=True)
    amershi = next(s for s in result.sources if s.slug == "amershi-pilot")
    assert amershi.evidence_level != "A"
    assert amershi.status == "path_valid_needs_editorial_review"
    assert not amershi.fragment_tied_hit


def test_shared_footnote_matches_multiple_works(tmp_path: Path, monkeypatch: Any) -> None:
    repo = _mini_repo(tmp_path)
    monkeypatch.setattr(rpl, "validate_fragment_in_rendered_html", _stub_fragment_ok)
    result = rpl.run_audit(repo, check_fragments=False)
    by_slug = {s.slug: s for s in result.sources}
    adler = by_slug["adler-pilot"]
    abate = by_slug["abate-pilot"]
    assert adler.footnote_hits
    assert abate.footnote_hits
    assert adler.footnote_hits[0].footnote_id == "c2-nummi-close"
    assert abate.footnote_hits[0].footnote_id == "c2-nummi-close"
    assert "abate-pilot" in adler.footnote_hits[0].shared_with
    assert "adler-pilot" in abate.footnote_hits[0].shared_with
    assert adler.footnote_hits[0].needs_editorial_review
    assert abate.footnote_hits[0].needs_editorial_review


def test_defined_but_unreferenced_footnote_ignored(tmp_path: Path, monkeypatch: Any) -> None:
    repo = _mini_repo(tmp_path)
    monkeypatch.setattr(rpl, "validate_fragment_in_rendered_html", _stub_fragment_ok)
    result = rpl.run_audit(repo, check_fragments=False)
    smith = next(s for s in result.sources if s.slug == "smith-common-name")
    assert not any(h.footnote_id == "c1-orphaned-unused" for h in smith.footnote_hits)
    assert smith.evidence_level in {"D", "E"}


def test_empty_related_books_rejected(tmp_path: Path, monkeypatch: Any) -> None:
    repo = _mini_repo(tmp_path)
    monkeypatch.setattr(rpl, "validate_fragment_in_rendered_html", _stub_fragment_ok)
    result = rpl.run_audit(repo, check_fragments=True)
    empty = next(s for s in result.sources if s.slug == "empty-related-books")
    assert empty.path_validation is not None
    assert "related_books_required" in empty.path_validation.issues
    assert not empty.path_validation.related_book_ok
    assert empty.evidence_level != "A"


def test_skip_fragment_check_is_unverified_not_invalid(tmp_path: Path, monkeypatch: Any) -> None:
    repo = _mini_repo(tmp_path)
    monkeypatch.setattr(rpl, "validate_fragment_in_rendered_html", _stub_fragment_ok)
    result = rpl.run_audit(repo, check_fragments=False)
    goodhart = next(s for s in result.sources if s.slug == "goodhart-pilot")
    assert goodhart.status == "passage_link_unverified_fragment"
    assert goodhart.evidence_level != "A"
    assert goodhart.path_validation is not None
    assert goodhart.path_validation.fragment_check_skipped
    assert goodhart.path_validation.is_structurally_valid
    assert not goodhart.path_validation.is_fully_valid
    assert "fragment_missing" not in goodhart.path_validation.issues
    # Must not inflate A coverage when fragments are skipped.
    assert result.totals["sources"]["verifiedLinkTiedCitation"] == 0


def test_skip_fragment_does_not_mask_structural_invalid(tmp_path: Path, monkeypatch: Any) -> None:
    """Skipping fragment checks must not hide invalid edition / non-public chapter."""
    repo = _mini_repo(tmp_path)
    monkeypatch.setattr(rpl, "validate_fragment_in_rendered_html", _stub_fragment_ok)

    src = yaml.safe_load((repo / "semantic/sources/goodhart-pilot.yml").read_text(encoding="utf-8"))
    src["readerPassagePath"] = (
        "/explore/books/edition-a/chapters/parts-part-1-chapter-1-effectiveness"
        "#user-content-fnref-c1-goodhart-monetary-management"
    )
    src["relatedBooks"] = ["edition-b"]  # authored path edition not in relatedBooks
    (repo / "semantic/sources/goodhart-pilot.yml").write_text(
        yaml.safe_dump(src, sort_keys=False), encoding="utf-8"
    )

    result = rpl.run_audit(repo, check_fragments=False)
    g = next(s for s in result.sources if s.slug == "goodhart-pilot")
    assert g.status == "invalid_passage_link"
    assert g.path_validation is not None
    assert "edition_not_in_related_books" in g.path_validation.issues
    assert not g.path_validation.is_structurally_valid
    assert g.evidence_level != "A"
    # Must not fall through to strong_candidate just because fragments were skipped.
    assert g.status != "strong_candidate"


def test_skip_fragment_does_not_mask_non_public_chapter(tmp_path: Path, monkeypatch: Any) -> None:
    repo = _mini_repo(tmp_path)
    monkeypatch.setattr(rpl, "validate_fragment_in_rendered_html", _stub_fragment_ok)

    # Force the Goodhart chapter non-public after structure load by rewriting index
    # with a draft chapter marker if supported, else patch validate via chapters.
    chapters = rpl.load_published_chapters(repo)
    route = "/explore/books/edition-a/chapters/parts-part-1-chapter-1-effectiveness"
    chapters[route].public = False

    src = yaml.safe_load((repo / "semantic/sources/goodhart-pilot.yml").read_text(encoding="utf-8"))
    audit = rpl.classify_source(
        src,
        biblio_books=["edition-a"],
        footnote_hits=[],
        prose_hits=[],
        chapters=chapters,
        repo=repo,
        check_fragments=False,
        fragment_cache={},
    )
    assert audit.status == "invalid_passage_link"
    assert "chapter_not_public" in (audit.path_validation.issues if audit.path_validation else [])


def test_book_filter_selects_matching_edition_evidence(tmp_path: Path, monkeypatch: Any) -> None:
    repo = _mini_repo(tmp_path)
    monkeypatch.setattr(rpl, "validate_fragment_in_rendered_html", _stub_fragment_ok)
    # Give Kahneman a spurious edition-a prose hit by adding relatedBooks both
    # editions and a citation only in edition-b — propose with --book edition-b.
    src_path = repo / "semantic/sources/kahneman-klein-pilot.yml"
    doc = yaml.safe_load(src_path.read_text(encoding="utf-8"))
    doc["relatedBooks"] = ["edition-a", "edition-b"]
    src_path.write_text(yaml.safe_dump(doc, sort_keys=False), encoding="utf-8")

    result = rpl.run_audit(repo, check_fragments=False)
    batch = rpl.build_candidates(
        result,
        kind="sources",
        only_missing=True,
        book_id="edition-b",
        batch_size=20,
        slugs={"kahneman-klein-pilot"},
        repo=repo,
        check_anchors=False,
    )
    assert batch
    assert all(c.book_id == "edition-b" for c in batch)
    assert "edition-b" in (batch[0].candidate_reader_passage_path or "")
    # Skipping the HTML check must leave anchors unverified (not true from Markdown alone).
    assert batch[0].anchor_exists is None
    assert batch[0].needs_editorial_review is True


def test_candidate_anchor_uses_renderer_not_markdown_ref(tmp_path: Path, monkeypatch: Any) -> None:
    repo = _mini_repo(tmp_path)

    def _missing_anchor(*_a: Any, **_k: Any) -> tuple[bool, str | None]:
        return False, "fragment not found in rendered HTML"

    monkeypatch.setattr(rpl, "validate_fragment_in_rendered_html", _missing_anchor)
    result = rpl.run_audit(repo, check_fragments=False)
    batch = rpl.build_candidates(
        result,
        kind="sources",
        only_missing=True,
        batch_size=5,
        slugs={"kahneman-klein-pilot"},
        repo=repo,
        check_anchors=True,
    )
    assert batch
    assert batch[0].anchor_exists is False
    assert batch[0].needs_editorial_review is True


def test_alternate_passage_candidates_per_source(tmp_path: Path, monkeypatch: Any) -> None:
    """After the first footnote is proposed, --unreviewed-only surfaces the next."""
    repo = _mini_repo(tmp_path)
    monkeypatch.setattr(rpl, "validate_fragment_in_rendered_html", _stub_fragment_ok)

    # Second independent citation of Kahneman in another edition-b chapter.
    book_b = repo / "books" / "edition-b"
    index = (book_b / "index.md").read_text(encoding="utf-8")
    index = index.replace(
        "- [Trust](parts/part-1/chapter-1-trust.md)\n",
        "- [Trust](parts/part-1/chapter-1-trust.md)\n"
        "- [Feedback](parts/part-1/chapter-2-feedback.md)\n",
    )
    (book_b / "index.md").write_text(index, encoding="utf-8")
    _write(
        book_b / "parts/part-1/chapter-2-feedback.md",
        "# Feedback\n\n"
        "Intuitive expertise also needs feedback loops."
        "[^c2-kahneman-klein-again]\n\n"
        "[^c2-kahneman-klein-again]: Kahneman, Daniel, and Gary Klein. "
        '"Conditions for Intuitive Expertise: A Failure to Disagree." '
        "American Psychologist 64, no. 6 (2009): 515–526.\n",
    )

    result = rpl.run_audit(repo, check_fragments=False)
    kk = next(s for s in result.sources if s.slug == "kahneman-klein-pilot")
    assert len(kk.footnote_hits) >= 2

    review_log: dict[str, dict] = {}
    first = rpl.build_candidates(
        result,
        kind="sources",
        only_missing=True,
        batch_size=1,
        max_per_source=1,
        unreviewed_only=True,
        review_log=review_log,
        slugs={"kahneman-klein-pilot"},
        repo=repo,
        check_anchors=False,
    )
    assert len(first) == 1
    key1 = rpl._candidate_key(
        "source",
        first[0].slug,
        first[0].route_key,
        footnote_id=(first[0].candidate_reader_passage_path or "").split("user-content-fnref-", 1)[
            -1
        ],
    )
    review_log[key1] = {"status": "proposed"}

    second = rpl.build_candidates(
        result,
        kind="sources",
        only_missing=True,
        batch_size=1,
        max_per_source=2,
        unreviewed_only=True,
        review_log=review_log,
        slugs={"kahneman-klein-pilot"},
        repo=repo,
        check_anchors=False,
    )
    assert len(second) == 1
    assert second[0].slug == "kahneman-klein-pilot"
    assert second[0].candidate_reader_passage_path != first[0].candidate_reader_passage_path
    assert second[0].needs_editorial_review is True


def test_deferred_review_log_status_is_not_terminal(tmp_path: Path, monkeypatch: Any) -> None:
    """``deferred`` parks work for later without suppressing --unreviewed-only."""
    repo = _mini_repo(tmp_path)
    monkeypatch.setattr(rpl, "validate_fragment_in_rendered_html", _stub_fragment_ok)
    result = rpl.run_audit(repo, check_fragments=False)

    assert "deferred" in rpl.REVIEW_LOG_NONTERMINAL
    assert "deferred" not in rpl.REVIEW_LOG_TERMINAL
    assert "skipped" in rpl.REVIEW_LOG_TERMINAL

    batch = rpl.build_candidates(
        result,
        kind="sources",
        only_missing=True,
        batch_size=5,
        unreviewed_only=True,
        review_log={},
        slugs={"kahneman-klein-pilot"},
        repo=repo,
        check_anchors=False,
    )
    assert batch
    key = rpl._candidate_key(
        "source",
        batch[0].slug,
        batch[0].route_key,
        footnote_id=(batch[0].candidate_reader_passage_path or "").split("user-content-fnref-", 1)[
            -1
        ],
    )

    still = rpl.build_candidates(
        result,
        kind="sources",
        only_missing=True,
        batch_size=5,
        unreviewed_only=True,
        review_log={key: {"status": "deferred", "note": "shared footnote; revisit later"}},
        slugs={"kahneman-klein-pilot"},
        repo=repo,
        check_anchors=False,
    )
    assert still
    assert still[0].slug == "kahneman-klein-pilot"

    suppressed = rpl.build_candidates(
        result,
        kind="sources",
        only_missing=True,
        batch_size=5,
        unreviewed_only=True,
        review_log={key: {"status": "skipped"}},
        slugs={"kahneman-klein-pilot"},
        repo=repo,
        check_anchors=False,
    )
    assert not suppressed


def test_propose_batch_advances_past_proposed(tmp_path: Path, monkeypatch: Any) -> None:
    repo = _mini_repo(tmp_path)
    monkeypatch.setattr(rpl, "validate_fragment_in_rendered_html", _stub_fragment_ok)
    before = (repo / "semantic/sources/kahneman-klein-pilot.yml").read_text(encoding="utf-8")
    result = rpl.run_audit(repo, check_fragments=False)
    review_log: dict[str, dict] = {}
    batch1 = rpl.build_candidates(
        result,
        kind="sources",
        only_missing=True,
        batch_size=2,
        unreviewed_only=True,
        review_log=review_log,
    )
    assert len(batch1) == 2
    for c in batch1:
        frag = (c.candidate_reader_passage_path or "").split("#")[-1]
        key = rpl._candidate_key(
            c.entity_kind,
            c.slug,
            c.route_key,
            fragment=frag if "#" in (c.candidate_reader_passage_path or "") else None,
        )
        review_log[key] = {"status": "proposed"}

    batch2 = rpl.build_candidates(
        result,
        kind="sources",
        only_missing=True,
        batch_size=2,
        unreviewed_only=True,
        review_log=review_log,
    )
    keys1 = {
        rpl._candidate_key(
            c.entity_kind,
            c.slug,
            c.route_key,
            fragment=(c.candidate_reader_passage_path or "").split("#")[-1]
            if "#" in (c.candidate_reader_passage_path or "")
            else None,
        )
        for c in batch1
    }
    keys2 = {
        rpl._candidate_key(
            c.entity_kind,
            c.slug,
            c.route_key,
            fragment=(c.candidate_reader_passage_path or "").split("#")[-1]
            if "#" in (c.candidate_reader_passage_path or "")
            else None,
        )
        for c in batch2
    }
    assert keys1.isdisjoint(keys2)
    after = (repo / "semantic/sources/kahneman-klein-pilot.yml").read_text(encoding="utf-8")
    assert before == after


def test_missing_chapter_and_wrong_edition(tmp_path: Path, monkeypatch: Any) -> None:
    repo = _mini_repo(tmp_path)
    monkeypatch.setattr(rpl, "validate_fragment_in_rendered_html", _stub_fragment_ok)
    src = yaml.safe_load((repo / "semantic/sources/goodhart-pilot.yml").read_text(encoding="utf-8"))
    src["readerPassagePath"] = "/explore/books/edition-a/chapters/parts-part-1-chapter-9-missing#x"
    (repo / "semantic/sources/goodhart-pilot.yml").write_text(
        yaml.safe_dump(src, sort_keys=False), encoding="utf-8"
    )
    result = rpl.run_audit(repo, check_fragments=True)
    g = next(s for s in result.sources if s.slug == "goodhart-pilot")
    assert g.status == "invalid_passage_link"
    assert "chapter_not_found" in (g.path_validation.issues if g.path_validation else [])


def test_non_public_chapter(tmp_path: Path, monkeypatch: Any) -> None:
    repo = _mini_repo(tmp_path)
    monkeypatch.setattr(rpl, "validate_fragment_in_rendered_html", _stub_fragment_ok)
    chapters = rpl.load_published_chapters(repo)
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
    row = next(s for s in result.sources if s.slug == "biblio-only-pilot")
    assert row.evidence_level in {"D", "E"}
    assert row.evidence_level != "A"


def test_multiple_editions_keep_distinct_route_keys(tmp_path: Path, monkeypatch: Any) -> None:
    repo = _mini_repo(tmp_path)
    monkeypatch.setattr(rpl, "validate_fragment_in_rendered_html", _stub_fragment_ok)
    chapters = rpl.load_published_chapters(repo)
    a_routes = [k for k in chapters if "/edition-a/" in k]
    b_routes = [k for k in chapters if "/edition-b/" in k]
    assert a_routes
    assert b_routes
    assert not set(a_routes) & set(b_routes)


def test_creator_author_tokens_exclude_title_words() -> None:
    src = {
        "creatorNames": ["Charles A. E Goodhart"],
        "name": "Charles A. E Goodhart — Problems of Monetary Management",
        "title": "Problems of Monetary Management",
        "citation": "Goodhart Problems of Monetary Management 1975",
        "summary": "Problems of Monetary Management experience",
    }
    tokens = rpl.creator_author_tokens(src)
    assert "goodhart" in tokens
    assert "problems" not in tokens
    assert "monetary" not in tokens


def test_report_writers_and_cli(tmp_path: Path, monkeypatch: Any) -> None:
    repo = _mini_repo(tmp_path)
    monkeypatch.setattr(rpl, "validate_fragment_in_rendered_html", _stub_fragment_ok)
    result = rpl.run_audit(repo, check_fragments=False)
    md = repo / "reports/reader-passage-links/audit.md"
    js = repo / "reports/reader-passage-links/audit.summary.json"
    full = repo / "reports/reader-passage-links/audit.full.json"
    rpl.write_audit_reports(result, md_out=md, json_out=js, full_json_out=full)
    text = md.read_text(encoding="utf-8")
    assert "Verified link + mechanically tied citation" in text
    assert "Mechanical footnote candidates" in text
    payload = json.loads(js.read_text(encoding="utf-8"))
    assert "verifiedLinkTiedCitation" in payload["totals"]["sources"]
    assert "rankedOpportunities" in payload
    assert "sources" not in payload  # compact summary, not full corpus
    full_payload = json.loads(full.read_text(encoding="utf-8"))
    assert "sources" in full_payload

    out_md = repo / "reports/reader-passage-links/from-cli.md"
    out_json = repo / "reports/reader-passage-links/from-cli.summary.json"
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
    assert "tied_A=" in proc.stdout


def test_parse_path_regex() -> None:
    ed, ch, frag = rpl.parse_reader_passage_path(
        "/explore/books/coupling/chapters/parts-x#user-content-fnref-c1"
    )
    assert ed == "coupling"
    assert ch == "parts-x"
    assert frag == "user-content-fnref-c1"
    assert rpl.parse_reader_passage_path("/explore/books/X/chapters/y")[0] is None


def test_live_pilot_sources_when_present() -> None:
    repo = Path(__file__).resolve().parents[1]
    goodhart = repo / (
        "semantic/sources/goodhart-charles-a-e-problems-of-monetary-management-the-u-k.yml"
    )
    if not goodhart.is_file():
        return
    doc = yaml.safe_load(goodhart.read_text(encoding="utf-8"))
    path = str(doc.get("readerPassagePath") or "")
    assert path.startswith("/explore/books/")
    ed, ch, frag = rpl.parse_reader_passage_path(path)
    assert ed and ch and frag
    assert frag.startswith("user-content-fnref-")
