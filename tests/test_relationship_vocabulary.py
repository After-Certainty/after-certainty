"""Tests for relationship vocabulary validation against documented types."""

from __future__ import annotations

from pathlib import Path

import yaml

# Allowed relationship types from docs/semantic-relationship-types.md
ALLOWED_RELATIONSHIP_TYPES = {
    "calibrates",
    "complements",
    "constrains",
    "contrasts",
    "distorts",
    "enables",
    "expresses",
    "grounds",
    "hardens",
    "intensifies",
    "organizes",
    "precedes",
    "preserves",
    "pressures",
    "renews",
    "reproduces",
    "requires",
    "shapes",
    "stabilizes",
    "structural_tension",
    "thins",
    "weakens",
}


def test_relationship_types_are_valid(repo_root: Path) -> None:
    """Validate that all relationship types in relationships.yml are documented."""
    relationships_path = repo_root / "semantic" / "relationships.yml"

    with open(relationships_path) as f:
        data = yaml.safe_load(f)

    relationships = data.get("relationships", [])
    assert len(relationships) > 0, "No relationships found"

    invalid_types = []
    for rel in relationships:
        rel_type = rel.get("relationship")
        if rel_type not in ALLOWED_RELATIONSHIP_TYPES:
            invalid_types.append(
                {
                    "source": rel.get("source"),
                    "target": rel.get("target"),
                    "type": rel_type,
                }
            )

    if invalid_types:
        error_msg = "Found relationships with undocumented types:\n"
        for item in invalid_types:
            error_msg += f"  - {item['source']} {item['type']} {item['target']}\n"
        error_msg += f"\nAllowed types: {sorted(ALLOWED_RELATIONSHIP_TYPES)}"
        raise AssertionError(error_msg)


def test_all_documented_types_exist_in_code(repo_root: Path) -> None:
    """Ensure ALLOWED_RELATIONSHIP_TYPES matches the documentation."""
    docs_path = repo_root / "docs" / "semantic-relationship-types.md"

    with open(docs_path) as f:
        content = f.read()

    # Check that each allowed type is documented
    missing_from_docs = []
    for rel_type in ALLOWED_RELATIONSHIP_TYPES:
        if f"`{rel_type}`" not in content:
            missing_from_docs.append(rel_type)

    if missing_from_docs:
        raise AssertionError(
            f"Types in ALLOWED_RELATIONSHIP_TYPES but not found in docs: {missing_from_docs}"
        )


def test_relationship_types_have_descriptions(repo_root: Path) -> None:
    """Validate that all relationships have non-empty descriptions."""
    relationships_path = repo_root / "semantic" / "relationships.yml"

    with open(relationships_path) as f:
        data = yaml.safe_load(f)

    relationships = data.get("relationships", [])

    missing_descriptions = []
    for rel in relationships:
        description = rel.get("description", "").strip()
        if not description:
            missing_descriptions.append(
                {
                    "source": rel.get("source"),
                    "target": rel.get("target"),
                    "type": rel.get("relationship"),
                }
            )

    if missing_descriptions:
        error_msg = "Found relationships with empty descriptions:\n"
        for item in missing_descriptions:
            error_msg += f"  - {item['source']} {item['type']} {item['target']}\n"
        raise AssertionError(error_msg)


def test_relationship_type_usage_stats(repo_root: Path) -> None:
    """Report relationship type usage statistics (informational)."""
    relationships_path = repo_root / "semantic" / "relationships.yml"

    with open(relationships_path) as f:
        data = yaml.safe_load(f)

    relationships = data.get("relationships", [])

    from collections import Counter

    type_counts = Counter(rel["relationship"] for rel in relationships)

    # Just verify we have relationships, don't enforce specific counts
    assert len(type_counts) > 0, "No relationship types found"
    assert type_counts.most_common(1)[0][1] > 0, "Invalid counts"

    # Print stats for reference (appears in verbose test output)
    total = len(relationships)
    print(f"\nRelationship type usage ({total} total):")
    for rel_type, count in sorted(type_counts.items(), key=lambda x: -x[1]):
        pct = count / total * 100
        print(f"  {rel_type:25} {count:3} ({pct:5.1f}%)")
