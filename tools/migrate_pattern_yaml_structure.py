#!/usr/bin/env python3
"""Migrate semantic/patterns/*.yml from legacy ``summary`` to structured narrative fields."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required.") from exc

from pattern_yaml import structured_fields_from_row

SEMANTIC_PATTERNS = Path("semantic/patterns")


def migrate_file(path: Path, *, dry_run: bool) -> bool:
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(raw, dict):
        return False
    if "summary" not in raw:
        return False

    parts = structured_fields_from_row(raw)
    out: dict = {"slug": raw["slug"], "title": raw["title"]}
    for k in ("setup", "problem", "forces", "observation", "example"):
        if parts.get(k):
            out[k] = parts[k]
    for k in ("relatedConcepts", "relatedPatterns", "relatedBooks", "relatedSources"):
        if k in raw and raw[k] is not None:
            out[k] = raw[k]

    if dry_run:
        print(f"{path.name}: {list(parts.keys())}")
        return True

    yml = (
        yaml.safe_dump(
            out,
            allow_unicode=True,
            default_flow_style=False,
            sort_keys=False,
        ).rstrip()
        + "\n"
    )
    path.write_text(yml, encoding="utf-8")
    return True


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    repo = Path(args.repo).resolve()
    pdir = repo / SEMANTIC_PATTERNS
    n = 0
    for path in sorted(pdir.glob("*.yml")):
        if migrate_file(path, dry_run=args.dry_run):
            n += 1
    print(f"Migrated {n} pattern file(s).", file=sys.stderr)


if __name__ == "__main__":
    main()
