"""Phase 9 heuristic hints: review cues are not verified source claims."""

from __future__ import annotations

import json
from pathlib import Path

import reader_passage_links as rpl


def _hit(
    fid: str,
    *,
    shared_with: list[str] | None = None,
    score: int = 90,
    method: str = "footnote_title_author",
    route: str = "/explore/books/game/chapters/chapter-7",
    ambiguous: bool = False,
) -> rpl.FootnoteHit:
    return rpl.FootnoteHit(
        edition_slug="game",
        route_key=route,
        chapter_title="Chapter 7",
        source_path="parts/chapter-7.md",
        book_dir="books/game",
        footnote_id=fid,
        def_text="Two named sources.",
        line_start=12,
        line_end=12,
        excerpt="An event became a symbol.[^" + fid + "]",
        score=score,
        method=method,
        shared_with=shared_with or [],
        ambiguous=ambiguous,
    )


def _source(
    slug: str,
    name: str,
    hits: list[rpl.FootnoteHit],
    *,
    path: str | None = None,
) -> rpl.SourceAudit:
    return rpl.SourceAudit(
        slug=slug,
        yaml_path=f"semantic/sources/{slug}.yml",
        name=name,
        related_books=["game"],
        in_bibliography_books=["game"],
        footnote_hits=hits,
        evidence_level="B",
        status="strong_candidate",
        reader_passage_path=path,
        recommended_action="editorial_review_then_add_path",
    )


def test_phase8_event_vs_anniversary_and_sibling_sole_work() -> None:
    event_hit = _hit("smith-carlos", shared_with=["world"])
    world_hit = _hit("smith-carlos", shared_with=["ap"])
    world_sole = _hit("smith-carlos-honor")
    sources = {
        "ap": _source(
            "ap",
            "Associated Press — AP Was There: Smith and Carlos Protest during 1968 Olympics",
            [event_hit],
        ),
        "world": _source(
            "world",
            "World Athletics — Iconic Mexico City Olympic Podium Protest Turns 50",
            [world_hit, world_sole],
        ),
    }

    hints = rpl.disambiguation_hints_for_hit(sources["ap"], event_hit, sources)
    kinds = [hint["kind"] for hint in hints]
    assert "multi_work_footnote" in kinds
    assert "event_versus_retrospective" in kinds
    assert "existing_sole_work_citation" in kinds
    assert any("smith-carlos-honor" in h["evidence"] for h in hints)
    assert hints == rpl.disambiguation_hints_for_hit(sources["ap"], event_hit, sources)
    assert all(h["confidence"] in {"high", "medium", "low"} for h in hints)
    # Cues must never count as source approval.
    assert sources["ap"].evidence_level == "B"


def test_phase8_luck_two_same_event_reports_remain_shared() -> None:
    a = _hit("luck", shared_with=["marot"])
    b = _hit("luck", shared_with=["walker"])
    sources = {
        "walker": _source(
            "walker",
            "Andrew Walker — Andrew Luck Announces His Retirement From the NFL",
            [a],
        ),
        "marot": _source(
            "marot",
            "Michael Marot — Oft-Injured Colts QB Andrew Luck, 29, Announces Retirement",
            [b],
        ),
    }
    hints = rpl.disambiguation_hints_for_hit(sources["walker"], a, sources)
    corroboration = [h for h in hints if h["kind"] == "possible_same_event_corrob"]
    assert len(corroboration) == 1
    assert corroboration[0]["confidence"] == "low"
    assert "may corroborate" in corroboration[0]["reason"]
    assert not any(h["kind"] == "event_versus_retrospective" for h in hints)


def test_weak_attribution_is_only_a_review_cue() -> None:
    hit = _hit("weak", score=72, method="footnote_title_only")
    source = _source("source", "Someone — Shared Study", [hit])
    hints = rpl.disambiguation_hints_for_hit(source, hit, {"source": source})
    assert [h["kind"] for h in hints] == ["verify_work_identity"]
    assert hints[0]["confidence"] == "low"
    assert not rpl.disambiguation_hints_for_hit(source, _hit("strong"), {"source": source})


def test_ambiguous_only_proposal_preserves_review_log_and_yaml(tmp_path: Path) -> None:
    shared_a = _hit("shared", shared_with=["second"])
    shared_b = _hit("shared", shared_with=["first"])
    separate = _hit("clean", route="/explore/books/game/chapters/chapter-8")
    sources = [
        _source("first", "Reporter — Luck Announces Retirement", [shared_a]),
        _source("second", "Journal — Luck Announces Retirement", [shared_b]),
        _source("clean", "Researcher — A Clean Sole-Work Citation", [separate]),
    ]
    result = rpl.AuditResult(sources=sources, thinkers=[])
    batch = rpl.build_candidates(
        result,
        kind="all",
        only_missing=True,
        ambiguous_only=True,
        repo=None,
        check_anchors=False,
    )
    assert {c.slug for c in batch} == {"first", "second"}
    assert all(c.needs_editorial_review for c in batch)
    assert all(c.anchor_exists is None for c in batch)
    assert all(c.disambiguation_hints for c in batch)
    assert "Disambiguation hints:" in rpl.format_candidates_markdown(batch)

    out_json = tmp_path / "candidates.json"
    out_md = tmp_path / "candidates.md"
    rpl.write_candidates(batch, md_out=out_md, json_out=out_json)
    payload = json.loads(out_json.read_text(encoding="utf-8"))
    assert payload["count"] == 2
    assert all(c["disambiguation_hints"] for c in payload["candidates"])

    # Do not silently change candidate statuses, and obey the existing
    # deferred vs. proposed distinction when --unreviewed-only is enabled.
    first = batch[0]
    key = rpl._candidate_key(first.entity_kind, first.slug, first.route_key, footnote_id="shared")
    eligible = rpl.build_candidates(
        result,
        kind="sources",
        ambiguous_only=True,
        only_missing=True,
        unreviewed_only=True,
        review_log={key: {"status": "deferred"}},
        repo=None,
        check_anchors=False,
    )
    assert first.slug in {c.slug for c in eligible}
    not_eligible = rpl.build_candidates(
        result,
        kind="sources",
        ambiguous_only=True,
        only_missing=True,
        unreviewed_only=True,
        review_log={key: {"status": "proposed"}},
        repo=None,
        check_anchors=False,
    )
    assert first.slug not in {c.slug for c in not_eligible}
