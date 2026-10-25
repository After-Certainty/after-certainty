"""Phase 19: preserve distinctions between citations, bibliography, and keyword overlap."""

from __future__ import annotations

from types import SimpleNamespace

import pytest
from tools.report_source_integrity_phase19 import (
    _editorial_exclusion,
    categorize_unlinked,
)


@pytest.mark.parametrize(
    ("level", "category"),
    [
        ("B", "footnote_cited_not_linked"),
        ("C", "thematic_connection_only"),
        ("D", "bibliography_only"),
        ("E", "no_detected_evidence"),
    ],
)
def test_phase19_does_not_promote_uncited_sources(level: str, category: str) -> None:
    entry = SimpleNamespace(evidence_level=level, reader_passage_path=None)
    assert categorize_unlinked(entry) == category


def test_phase19_rejects_linked_sources_in_missing_inventory() -> None:
    entry = SimpleNamespace(
        evidence_level="A",
        reader_passage_path="/explore/books/example/chapters/example#user-content-fnref-a",
    )
    with pytest.raises(ValueError, match="Linked source"):
        categorize_unlinked(entry)


def test_phase19_requires_explicit_evidence_classification() -> None:
    with pytest.raises(ValueError, match="Unexpected evidence level"):
        categorize_unlinked(SimpleNamespace(evidence_level="A", reader_passage_path=None))


def test_phase19_preserves_manual_source_exclusions() -> None:
    note = "Early-life source cannot support late-life narrative"
    assert (
        _editorial_exclusion(
            "guha-ramachandra-gandhi-before-india",
            {"guha-ramachandra-gandhi-before-india": note},
        )
        == note
    )
    assert _editorial_exclusion("some-other-source", {"guha-": note}) is None
