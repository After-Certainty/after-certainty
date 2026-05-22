#!/usr/bin/env python3
"""Link and add glossary entries for before-certainty-arrives (glossary-extract test)."""

from __future__ import annotations

import sys
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required.") from exc

REPO = Path(__file__).resolve().parents[1]
GLOSSARY = REPO / "semantic" / "glossary"
BOOK_ID = "before-certainty-arrives"

LINK_EXISTING = (
    "authority",
    "scale",
    "legitimacy",
    "abstraction",
    "judgment",
    "responsibility",
    "stability",
    "system",
    "constraints",
    "accountability",
    "harm",
    "cohesion",
    "feedback",
    "correction",
    "incentives",
)

NEW_ENTRIES: dict[str, dict] = {
    "certainty": {
        "slug": "certainty",
        "title": "Certainty",
        "shortDefinition": (
            "In this history, certainty is an adaptive response to instability—not "
            "truth discovered once and for all, but coordination hardened under pressure: "
            "roles, law, and moral systems that compress choice and make behavior predictable "
            "enough to survive another season of uncertainty."
        ),
        "termKind": "core",
    },
    "uncertainty": {
        "slug": "uncertainty",
        "title": "Uncertainty",
        "shortDefinition": (
            "Uncertainty names what moral and social systems are built to reduce—"
            "fragmented lives, broken coordination, intolerable ambiguity—before "
            "compression and stabilization produce answers that feel obvious."
        ),
        "termKind": "core",
    },
    "interpretation": {
        "slug": "interpretation",
        "title": "Interpretation",
        "shortDefinition": (
            "Interpretation is how meaning is reconstructed under pressure. Sacred authority "
            "compresses interpretation; writing and law later externalize it so disputes "
            "can be settled without shared presence."
        ),
        "termKind": "core",
    },
    "meaning": {
        "slug": "meaning",
        "title": "Meaning",
        "shortDefinition": (
            "Meaning here is what moral systems stabilize—not abstract truth first, but "
            "shared expectation that can accumulate once coordination survives constraint. "
            "Writing preserves meaning when oral tradition fractures at scale."
        ),
        "termKind": "core",
    },
    "consequence": {
        "slug": "consequence",
        "title": "Consequence",
        "shortDefinition": (
            "Consequence is the actual effect of action in the world. As scale and abstraction "
            "grow, distance opens between action and consequence—responsibility diffuses and "
            "feedback slows."
        ),
        "termKind": "core",
    },
    "coordination": {
        "slug": "coordination",
        "title": "Coordination",
        "shortDefinition": (
            "Coordination is collective organization under pressure—the problem certainty "
            "is meant to solve when lives fragment and behavior must still hold across "
            "strangers, distance, and time."
        ),
        "termKind": "supporting",
    },
    "compression": {
        "slug": "compression",
        "title": "Compression",
        "shortDefinition": (
            "Compression reduces moral complexity for transmission at scale: collapse gives "
            "way to compression, compression produces stabilization, and stabilization "
            "hardens into inheritance. Law and canon compress judgment into rule."
        ),
        "termKind": "supporting",
    },
    "constraint": {
        "slug": "constraint",
        "title": "Constraint",
        "shortDefinition": (
            "Constraint names the limits a moral order responds to—scarcity, violence, "
            "population density, abstraction. This book is organized by ages defined by "
            "shared constraints rather than by ideas alone."
        ),
        "termKind": "supporting",
    },
    "inheritance": {
        "slug": "inheritance",
        "title": "Inheritance",
        "shortDefinition": (
            "Inheritance is how stabilized certainty persists after its originating "
            "conditions fade—tools that outlive the pressures that made them workable "
            "and are carried forward without their original context."
        ),
        "termKind": "supporting",
    },
}


def _empty_lists() -> dict:
    return {
        "relatedConcepts": [],
        "relatedPatterns": [],
        "relatedBooks": [BOOK_ID],
    }


def _dump(data: dict, path: Path) -> None:
    body = (
        yaml.safe_dump(data, allow_unicode=True, default_flow_style=False, sort_keys=False).rstrip()
        + "\n"
    )
    path.write_text(body, encoding="utf-8")


def link_existing() -> int:
    updated = 0
    for slug in LINK_EXISTING:
        path = GLOSSARY / f"{slug}.yml"
        if not path.is_file():
            print(f"skip missing: {path}", file=sys.stderr)
            continue
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            continue
        books = list(data.get("relatedBooks") or [])
        if BOOK_ID in books:
            continue
        books.append(BOOK_ID)
        data["relatedBooks"] = books
        _dump(data, path)
        print(f"linked: {slug}")
        updated += 1
    return updated


def add_new() -> int:
    created = 0
    for slug, fields in NEW_ENTRIES.items():
        path = GLOSSARY / f"{slug}.yml"
        if path.is_file():
            data = yaml.safe_load(path.read_text(encoding="utf-8"))
            if not isinstance(data, dict):
                data = {}
            books = list(data.get("relatedBooks") or [])
            if BOOK_ID not in books:
                books.append(BOOK_ID)
                data["relatedBooks"] = books
                _dump({**_empty_lists(), **data, **fields, "relatedBooks": books}, path)
                print(f"updated: {slug}")
                created += 1
            continue
        record = {**_empty_lists(), **fields}
        _dump(record, path)
        print(f"created: {slug}")
        created += 1
    return created


def main() -> int:
    linked = link_existing()
    added = add_new()
    print(f"Done: linked={linked} created_or_updated={added}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
