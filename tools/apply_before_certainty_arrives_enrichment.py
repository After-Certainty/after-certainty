#!/usr/bin/env python3
"""Replace Before Certainty Arrives enrichment on canonical glossary YAML."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "tools"))

from before_certainty_arrives_book_enrichment import (  # noqa: E402
    BCA_GLOSSARY,
    ENRICHMENT_FIELDS,
    enrichment_for,
)

GLOSSARY_DIR = REPO_ROOT / "semantic" / "glossary"
BOOK_ID = "before-certainty-arrives"


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


def apply_entity(path: Path, dry_run: bool) -> bool:
    slug = path.stem
    enrichment = enrichment_for(slug, "glossary")
    if enrichment is None:
        print(f"skip (no book enrichment): {path.relative_to(REPO_ROOT)}")
        return False

    data = _load_yaml(path)
    books = list(data.get("relatedBooks") or [])
    if BOOK_ID not in books:
        print(f"skip (not linked to {BOOK_ID}): {path.relative_to(REPO_ROOT)}")
        return False

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
    for slug in sorted(BCA_GLOSSARY):
        path = GLOSSARY_DIR / f"{slug}.yml"
        if not path.exists():
            print(f"missing glossary: {path}", file=sys.stderr)
            return 1
        if apply_entity(path, args.dry_run):
            updated += 1

    print(f"{'would update' if args.dry_run else 'updated'} {updated} entities")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
