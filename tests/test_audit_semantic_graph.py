"""Tests for unified semantic graph audit tooling."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

import semantic_graph_audit as sga
from semantic_extract import slugify_heading, transliterate_slug


def _write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def _base_semantic_dirs(repo: Path) -> None:
    _write(repo / "semantic/ontology/core-terms.yml", "version: 1\nterms: []\n")
    _write(repo / "semantic/ontology/supporting-terms.yml", "version: 1\nterms: []\n")
    _write(
        repo / "semantic/ontology/structural-tensions.yml",
        "version: 1\ntensions: []\n",
    )
    _write(
        repo / "semantic/relationships.yml",
        "version: 1\nrelationships: []\n",
    )


def test_transliterate_slug_handles_diacritics() -> None:
    assert transliterate_slug("Václav Havel") == "vaclav-havel"
    assert slugify_heading("Václav Havel") == "v-clav-havel"
    assert transliterate_slug("Václav Havel") != slugify_heading("Václav Havel")


def test_suspicious_year_from_page_range(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    _base_semantic_dirs(repo)
    _write(
        repo / "semantic/sources/wachsmuth-example.yml",
        "slug: wachsmuth-example\n"
        "name: Wachsmuth — Airbnb and the Rent Gap\n"
        "type: article\n"
        "summary: 'Wachsmuth. \"Airbnb.\" *Environment and Planning A* 50, no. 6 (2018): 1147–1170.'\n"
        "concepts: []\npatterns: []\nrelatedBooks: []\n"
        "citation: 'Wachsmuth. \"Airbnb.\" *Environment and Planning A* 50, no. 6 (2018): 1147–1170.'\n"
        "year: 1170\n",
    )
    sources = sga.load_entity_dir(repo, "sources")
    issues = sga.audit_sources_extended(repo, sources)
    assert any(i.field == "year" and i.severity == "error" for i in issues)


def test_person_classified_as_organization(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    _base_semantic_dirs(repo)
    _write(
        repo / "semantic/thinkers/elizabeth-w-morrison.yml",
        "slug: elizabeth-w-morrison\n"
        "name: Elizabeth W Morrison\n"
        "type: organization\n"
        "summary: Scholar of voice and silence.\n"
        "concepts: []\npatterns: []\nrelatedBooks: []\nworks: []\n",
    )
    thinkers = sga.load_entity_dir(repo, "thinkers")
    issues = sga.audit_thinkers(repo, thinkers)
    assert any(i.entityId == "elizabeth-w-morrison" and i.field == "type" for i in issues)


def test_slug_diacritic_damage_flagged(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    _base_semantic_dirs(repo)
    _write(
        repo / "semantic/thinkers/v-clav-havel.yml",
        "slug: v-clav-havel\n"
        "name: Václav Havel\n"
        "type: person\n"
        "summary: Writer and statesman.\n"
        "concepts: []\npatterns: []\nrelatedBooks: []\nworks: []\n",
    )
    thinkers = sga.load_entity_dir(repo, "thinkers")
    issues = sga.audit_thinkers(repo, thinkers)
    assert any(i.field == "slug" and "diacritic" in i.reason.lower() for i in issues)


def test_tautological_concept_definition(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    _base_semantic_dirs(repo)
    _write(
        repo / "semantic/glossary/agile.yml",
        "slug: agile\ntitle: Agile\nshortDefinition: Agile is agile.\n"
        "termKind: extended\nrelatedConcepts: []\nrelatedPatterns: []\nrelatedBooks: []\n",
    )
    glossary = sga._load_glossary(repo)
    issues = sga.audit_concepts(
        repo,
        glossary,
        inbound_counts={},
        thinker_concept_refs={},
        source_concept_refs={},
    )
    assert any("tautological" in i.reason.lower() for i in issues)


def test_missing_linked_entity_in_relationship(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    _base_semantic_dirs(repo)
    _write(
        repo / "semantic/relationships.yml",
        "version: 1\nrelationships:\n"
        "  - source: missing-concept\n    target: also-missing\n"
        "    relationship: complements\n    description: test\n",
    )
    issues, _, _ = sga.audit_relationships(
        repo,
        {},
        concept_slugs=set(),
        pattern_slugs=set(),
        source_slugs=set(),
        thinker_slugs=set(),
    )
    assert any(i.severity == "error" and i.field == "source" for i in issues)


def test_duplicate_relationship(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    _base_semantic_dirs(repo)
    _write(
        repo / "semantic/glossary/foo.yml",
        "slug: foo\ntitle: Foo\nshortDefinition: Foo concept.\n"
        "termKind: extended\nrelatedConcepts: []\nrelatedPatterns: []\nrelatedBooks: []\n",
    )
    _write(
        repo / "semantic/glossary/bar.yml",
        "slug: bar\ntitle: Bar\nshortDefinition: Bar concept.\n"
        "termKind: extended\nrelatedConcepts: []\nrelatedPatterns: []\nrelatedBooks: []\n",
    )
    _write(
        repo / "semantic/relationships.yml",
        "version: 1\nrelationships:\n"
        "  - source: foo\n    target: bar\n    relationship: complements\n    description: one\n"
        "  - source: foo\n    target: bar\n    relationship: complements\n    description: two\n",
    )
    issues, _, _ = sga.audit_relationships(
        repo,
        {},
        concept_slugs={"foo", "bar"},
        pattern_slugs=set(),
        source_slugs=set(),
        thinker_slugs=set(),
    )
    assert any("duplicate" in i.reason.lower() for i in issues)


def test_manifest_book_divergence(tmp_path: Path) -> None:
    sem = {
        "books": [
            {"slug": "book-a", "title": "Book A", "status": "published"},
            {"slug": "book-b", "title": "Book B", "status": "published"},
        ]
    }
    books = {"books": [{"slug": "book-a", "title": "Book A", "status": "published"}]}
    issues = sga.audit_books(sem, books)
    assert any(i.entityId == "book-b" and i.severity == "error" for i in issues)


def test_unlinked_source_info(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    _base_semantic_dirs(repo)
    _write(
        repo / "semantic/sources/orphan.yml",
        "slug: orphan\nname: Orphan — Work\n"
        "type: article\nsummary: An orphan source.\n"
        "concepts: []\npatterns: []\nrelatedBooks: []\n",
    )
    sources = sga.load_entity_dir(repo, "sources")
    issues = sga.audit_sources_extended(repo, sources)
    assert any(i.severity == "info" and i.entityId == "orphan" for i in issues)


def test_disconnected_thinker(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    _base_semantic_dirs(repo)
    _write(
        repo / "semantic/thinkers/lonely.yml",
        "slug: lonely\nname: Lonely Thinker\n"
        "type: person\nsummary: No links.\n"
        "concepts: []\npatterns: []\nrelatedBooks: []\nworks: []\n",
    )
    thinkers = sga.load_entity_dir(repo, "thinkers")
    issues = sga.audit_thinkers(repo, thinkers)
    assert any(i.entityId == "lonely" and i.field == "links" for i in issues)


def test_json_report_shape(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    _base_semantic_dirs(repo)
    result = sga.run_audit(repo)
    report = sga.build_json_report(result)
    assert "generatedAt" in report
    assert "summary" in report
    assert "issues" in report
    assert "relationshipVocabulary" in report
    assert "densityStats" in report
    assert report["repoContext"]["detectedRepoType"] == "source"


def test_markdown_contains_executive_summary(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    _base_semantic_dirs(repo)
    result = sga.run_audit(repo)
    md = sga.format_markdown_report(result)
    assert "## Executive summary" in md
    assert "Semantic graph data-quality audit" in md


def test_audit_cli_writes_reports(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    import subprocess
    import sys

    repo = tmp_path / "repo"
    _base_semantic_dirs(repo)
    tools = Path(__file__).resolve().parents[1] / "tools"
    proc = subprocess.run(
        [
            sys.executable,
            str(tools / "audit_semantic_graph.py"),
            "--repo",
            str(repo),
            "--json-out",
            "reports/semantic-graph-audit.json",
            "--md-out",
            "reports/semantic-graph-audit.md",
        ],
        capture_output=True,
        text=True,
        cwd=tools,
    )
    assert proc.returncode == 0, proc.stderr
    assert (repo / "reports/semantic-graph-audit.json").is_file()
    data = json.loads((repo / "reports/semantic-graph-audit.json").read_text())
    assert "summary" in data


def test_glossary_opener_is_not_tautological(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    _base_semantic_dirs(repo)
    _write(
        repo / "semantic/glossary/agile.yml",
        "slug: agile\ntitle: Agile\n"
        "shortDefinition: Agile is used in a software engineering sense. Agile refers to iterative approaches.\n"
        "termKind: extended\nrelatedConcepts: []\nrelatedPatterns: []\nrelatedBooks: []\n",
    )
    glossary = sga._load_glossary(repo)
    issues = sga.audit_concepts(
        repo,
        glossary,
        inbound_counts={},
        thinker_concept_refs={},
        source_concept_refs={},
    )
    assert not any("tautological" in i.reason.lower() for i in issues)


def test_strict_tautology_is_flagged(tmp_path: Path) -> None:
    assert sga._is_tautological_definition("Agile", "Agile is agile")
    assert not sga._is_tautological_definition(
        "Agile",
        "Agile is used in a software engineering sense with iterative delivery.",
    )


def test_institutional_source_skips_institution_duplicate_warning(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    _base_semantic_dirs(repo)
    _write(
        repo / "semantic/sources/world-bank-example.yml",
        "slug: world-bank-example\n"
        "name: World Bank — State and Trends of Carbon Pricing\n"
        "type: book\nsummary: World Bank report.\n"
        "concepts: []\npatterns: []\nrelatedBooks: []\n"
        "title: State and Trends of Carbon Pricing\n"
        "creatorNames:\n- World Bank\n"
        "creatorSlugs:\n- world-bank\n"
        "sourceKind: report\n"
        "institution: World Bank\n",
    )
    sources = sga.load_entity_dir(repo, "sources")
    issues = sga.audit_sources_extended(repo, sources)
    assert not any("Institution field duplicates" in i.reason for i in issues)


def test_person_institution_duplicate_still_flagged(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    _base_semantic_dirs(repo)
    _write(
        repo / "semantic/sources/haspeslagh-example.yml",
        "slug: haspeslagh-example\n"
        "name: Haspeslagh — Managing Acquisitions\n"
        "type: book\nsummary: Book.\n"
        "concepts: []\npatterns: []\nrelatedBooks: []\n"
        "creatorNames:\n- Haspeslagh, Philippe C., and David B. Jemison\n"
        "institution: Haspeslagh, Philippe C., and David B. Jemison\n"
        "sourceKind: book\n",
    )
    sources = sga.load_entity_dir(repo, "sources")
    issues = sga.audit_sources_extended(repo, sources)
    assert any("Institution field duplicates" in i.reason for i in issues)


def test_org_thinker_not_flagged_as_person_like(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    _base_semantic_dirs(repo)
    _write(
        repo / "semantic/thinkers/world-bank.yml",
        "slug: world-bank\nname: World Bank\ntype: organization\n"
        "summary: Development institution.\n"
        "concepts: []\npatterns: []\nrelatedBooks: []\nworks: []\n",
    )
    thinkers = sga.load_entity_dir(repo, "thinkers")
    issues = sga.audit_thinkers(repo, thinkers)
    assert not any(i.entityId == "world-bank" and i.field == "type" for i in issues)


def test_scholarly_book_with_nasa_in_title_not_misclassified(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    _base_semantic_dirs(repo)
    _write(
        repo / "semantic/sources/vaughan-example.yml",
        "slug: vaughan-example\n"
        "name: Diane Vaughan — The Challenger Launch Decision at NASA\n"
        "type: book\nsummary: University of Chicago Press book.\n"
        "concepts: []\npatterns: []\nrelatedBooks: []\n"
        "title: The Challenger Launch Decision at NASA\n"
        "creatorNames:\n- Diane Vaughan\n"
        "sourceKind: book\n",
    )
    sources = sga.load_entity_dir(repo, "sources")
    issues = sga.audit_sources_extended(repo, sources)
    assert not any("Institutional statistics or report" in i.reason for i in issues)


def test_multi_person_thinker_flagged(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    _base_semantic_dirs(repo)
    _write(
        repo / "semantic/sources/ross-work.yml",
        "slug: ross-work\n"
        "name: Ross, Lee, and Richard Nisbett — The Person and the Situation\n"
        "type: book\nsummary: Social psychology.\n"
        "concepts: []\npatterns: []\nrelatedBooks: []\n"
        "creatorSlugs:\n- ross-lee-and-richard-nisbett\n",
    )
    _write(
        repo / "semantic/thinkers/ross-lee-and-richard-nisbett.yml",
        "slug: ross-lee-and-richard-nisbett\n"
        "name: Ross, Lee, and Richard Nisbett\n"
        "type: person\n"
        "summary: Social psychologists.\n"
        "concepts: []\npatterns: []\nrelatedBooks: []\n"
        "works:\n- ross-work\n",
    )
    thinkers = sga.load_entity_dir(repo, "thinkers")
    sources = sga.load_entity_dir(repo, "sources")
    issues = sga.audit_thinkers(repo, thinkers, sources=sources)
    multi = [
        i
        for i in issues
        if i.entityId == "ross-lee-and-richard-nisbett"
        and i.field == "name"
        and i.severity == "warning"
    ]
    assert len(multi) == 1
    assert "separate thinker" in multi[0].reason.lower()
    assert "creatorSlugs" in (multi[0].suggestedFix or "")
    assert "ross-work" in (multi[0].suggestedFix or "")


def test_last_first_single_thinker_flagged(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    _base_semantic_dirs(repo)
    _write(
        repo / "semantic/thinkers/wright-stuart-a-ed.yml",
        "slug: wright-stuart-a-ed\n"
        "name: Wright, Stuart A., ed\n"
        "type: person\n"
        "summary: Editor.\n"
        "concepts: []\npatterns: []\nrelatedBooks: []\nworks: []\n",
    )
    thinkers = sga.load_entity_dir(repo, "thinkers")
    issues = sga.audit_thinkers(repo, thinkers)
    last_first = [
        i
        for i in issues
        if i.entityId == "wright-stuart-a-ed" and i.field == "name" and i.severity == "info"
    ]
    assert len(last_first) == 1
    assert "last, first" in last_first[0].reason.lower()
    assert "First Last" in (last_first[0].suggestedFix or "")
    assert "separate thinker" not in (last_first[0].suggestedFix or "").lower()


def test_first_last_thinker_not_flagged_for_name_order(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    _base_semantic_dirs(repo)
    _write(
        repo / "semantic/thinkers/elizabeth-w-morrison.yml",
        "slug: elizabeth-w-morrison\n"
        "name: Elizabeth W Morrison\n"
        "type: person\n"
        "summary: Scholar of voice and silence.\n"
        "concepts: []\npatterns: []\nrelatedBooks: []\nworks: []\n",
    )
    thinkers = sga.load_entity_dir(repo, "thinkers")
    issues = sga.audit_thinkers(repo, thinkers)
    name_issues = [i for i in issues if i.entityId == "elizabeth-w-morrison" and i.field == "name"]
    assert not name_issues


def test_et_al_thinker_flagged_as_multi_person(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    _base_semantic_dirs(repo)
    _write(
        repo / "semantic/thinkers/amershi-saleema-et-al.yml",
        "slug: amershi-saleema-et-al\n"
        "name: Amershi, Saleema, et al\n"
        "type: person\n"
        "summary: HCI researchers.\n"
        "concepts: []\npatterns: []\nrelatedBooks: []\nworks: []\n",
    )
    thinkers = sga.load_entity_dir(repo, "thinkers")
    issues = sga.audit_thinkers(repo, thinkers)
    assert any(
        i.entityId == "amershi-saleema-et-al"
        and i.field == "name"
        and i.severity == "warning"
        and "et al" in i.reason.lower()
        for i in issues
    )
