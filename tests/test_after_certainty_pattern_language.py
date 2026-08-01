"""Focused checks for The After Certainty Pattern Language."""

from __future__ import annotations

from pathlib import Path

import yaml

REPO = Path(__file__).resolve().parents[1]
SEMANTIC = REPO / "semantic"


def _load_yml(path: Path) -> dict:
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    assert isinstance(data, dict)
    return data


def test_master_and_twelve_supporting_patterns() -> None:
    master = _load_yml(SEMANTIC / "patterns" / "reality-answers-back.yml")
    assert master["patternRole"] == "master"
    assert master["title"] == "Reality Answers Back"

    supporting = sorted(
        p
        for p in (SEMANTIC / "patterns").glob("*.yml")
        if _load_yml(p).get("patternRole") == "supporting"
    )
    assert len(supporting) == 12

    by_force: dict[str, list[str]] = {}
    for path in supporting:
        doc = _load_yml(path)
        force = doc["organizingForce"]
        by_force.setdefault(force, []).append(doc["slug"])
        assert doc["realityDynamic"] in {"obscuring", "corrective"}
        assert "reality-answers-back" in doc["relatedPatterns"]

    assert set(by_force) == {"perception", "power", "time", "contact"}
    for force, slugs in by_force.items():
        assert len(slugs) == 3, force


def test_four_forces_and_organizes_edges() -> None:
    force_slugs = {p.stem for p in (SEMANTIC / "forces").glob("*.yml")}
    assert force_slugs == {"perception", "power", "time", "contact"}

    rels = _load_yml(SEMANTIC / "relationships.yml")["relationships"]
    organizes = [
        r
        for r in rels
        if r.get("relationship") == "organizes"
        and r.get("sourceKind") == "force"
        and r.get("targetKind") == "pattern"
    ]
    assert len(organizes) == 12
    by_force: dict[str, set[str]] = {}
    for row in organizes:
        by_force.setdefault(row["source"], set()).add(row["target"])
    for force in force_slugs:
        assert len(by_force[force]) == 3


def test_expresses_master_and_directional_cross_pattern() -> None:
    rels = _load_yml(SEMANTIC / "relationships.yml")["relationships"]
    expresses = [
        r
        for r in rels
        if r.get("relationship") == "expresses"
        and r.get("target") == "reality-answers-back"
        and r.get("sourceKind") == "pattern"
    ]
    assert len(expresses) == 12

    assert any(
        r.get("source") == "speed-relocates-judgment"
        and r.get("target") == "understanding-circulates"
        and r.get("relationship") == "weakens"
        and r.get("sourceKind") == "pattern"
        for r in rels
    )


def test_pattern_to_book_and_wolty_link() -> None:
    master = _load_yml(SEMANTIC / "patterns" / "reality-answers-back.yml")
    assert "after-certainty" in master["relatedBooks"]

    authority = _load_yml(SEMANTIC / "patterns" / "authority-follows-attention.yml")
    assert "attention-finds-a-focus" in authority["relatedPatterns"]

    rels = _load_yml(SEMANTIC / "relationships.yml")["relationships"]
    assert any(
        r.get("source") == "attention-finds-a-focus"
        and r.get("target") == "authority-follows-attention"
        and r.get("relationship") == "precedes"
        for r in rels
    )


def test_commitment_leaves_room_provisional_name_retained() -> None:
    doc = _load_yml(SEMANTIC / "patterns" / "commitment-leaves-room.yml")
    assert doc["title"] == "Commitment Leaves Room"
    assert doc.get("editorialStatus") == "provisional"


def test_force_contact_distinct_from_glossary_contact() -> None:
    force = _load_yml(SEMANTIC / "forces" / "contact.yml")
    concept = _load_yml(SEMANTIC / "glossary" / "contact.yml")
    assert force["slug"] == concept["slug"] == "contact"
    assert (
        "organizing" in force["description"].lower() or "decision" in force["description"].lower()
    )
    assert (
        "said" in concept["shortDefinition"].lower()
        or "dialogue" in concept.get("longDefinition", "").lower()
        or "meaning" in concept["shortDefinition"].lower()
    )
