#!/usr/bin/env python3
"""Replace After Certainty enrichment on canonical glossary/pattern YAML."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "tools"))

from after_certainty_book_enrichment import (  # noqa: E402
    ENRICHMENT_FIELDS,
    enrichment_for,
)

GLOSSARY_DIR = REPO_ROOT / "semantic" / "glossary"
PATTERNS_DIR = REPO_ROOT / "semantic" / "patterns"

AFTER_CERTAINTY_GLOSSARY = frozenset(
    {
        "judgment",
        "correction",
        "responsibility",
        "accountability",
        "abstraction",
        "legitimacy",
        "authority",
        "authorization",
        "agency",
        "harm",
        "scale",
        "stability",
        "constraints",
        "incentives",
        "circulation",
        "feedback",
        "effectiveness",
        "system",
    }
)

AFTER_CERTAINTY_PATTERNS = frozenset(
    {
        "correctness-hardens-into-identity",
        "explanation-replaces-response",
        "admiration-becomes-insulation",
        "blame-compresses-complexity",
        "revisability-preserves-judgment",
        "responsibility-persists-beyond-control",
        "scrutiny-preserves-trust",
        "attention-restores-contact",
        "finality-compensates-for-uncertainty",
        "speech-escalates-faster-than-meaning",
    }
)


def _load_yaml(path: Path) -> dict:
    with path.open(encoding="utf-8") as f:
        data = yaml.safe_load(f)
    if not isinstance(data, dict):
        raise ValueError(f"expected mapping in {path}")
    return data


def _write_yaml(path: Path, data: dict) -> None:
    with path.open("w", encoding="utf-8") as f:
        yaml.dump(
            data,
            f,
            default_flow_style=False,
            allow_unicode=True,
            sort_keys=False,
            width=88,
        )


def apply_entity(path: Path, entity_type: str, dry_run: bool) -> bool:
    slug = path.stem
    enrichment = enrichment_for(slug, entity_type)
    if enrichment is None:
        print(f"skip (no book enrichment): {path.relative_to(REPO_ROOT)}")
        return False

    data = _load_yaml(path)
    for field in ENRICHMENT_FIELDS:
        data.pop(field, None)
    for field in ENRICHMENT_FIELDS:
        if field in enrichment:
            data[field] = enrichment[field]

    if dry_run:
        print(f"would update: {path.relative_to(REPO_ROOT)}")
        return True

    _write_yaml(path, data)
    print(f"updated: {path.relative_to(REPO_ROOT)}")
    return True


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    updated = 0
    for slug in sorted(AFTER_CERTAINTY_GLOSSARY):
        path = GLOSSARY_DIR / f"{slug}.yml"
        if not path.exists():
            print(f"missing glossary: {path}", file=sys.stderr)
            return 1
        if apply_entity(path, "glossary", args.dry_run):
            updated += 1

    for slug in sorted(AFTER_CERTAINTY_PATTERNS):
        path = PATTERNS_DIR / f"{slug}.yml"
        if not path.exists():
            print(f"missing pattern: {path}", file=sys.stderr)
            return 1
        if apply_entity(path, "pattern", args.dry_run):
            updated += 1

    print(f"{'would update' if args.dry_run else 'updated'} {updated} entities")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
