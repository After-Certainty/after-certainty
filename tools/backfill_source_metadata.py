#!/usr/bin/env python3
"""
Backfill optional v1.5 source metadata on canonical semantic/sources/*.yml.

Parses existing ``name`` (``Author — Title``) and ``summary`` (bibliography) to add
``title``, ``creatorNames``, ``creatorSlugs``, ``citation``, ``sourceKind``, ``year``,
and ``publisher`` when those fields are absent.

Typical workflow::

    python3 tools/backfill_source_metadata.py --repo . --dry-run
    python3 tools/backfill_source_metadata.py --repo .
    make verify-semantic-ontology
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

_TOOLS_DIR = Path(__file__).resolve().parent
if str(_TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(_TOOLS_DIR))

from source_metadata import enrich_source_record  # noqa: E402

DEFAULT_SOURCES = Path("semantic/sources")


def _dump_record(rec: dict) -> str:
    return (
        yaml.safe_dump(
            rec,
            allow_unicode=True,
            default_flow_style=False,
            sort_keys=False,
        ).rstrip()
        + "\n"
    )


def backfill_sources_dir(
    sources_dir: Path,
    *,
    dry_run: bool = False,
    overwrite: bool = False,
    limit: int | None = None,
) -> tuple[int, int]:
    if not sources_dir.is_dir():
        raise FileNotFoundError(f"Missing sources directory: {sources_dir}")

    paths = sorted(sources_dir.glob("*.yml"))
    if limit is not None:
        paths = paths[:limit]

    changed = 0
    for path in paths:
        raw = yaml.safe_load(path.read_text(encoding="utf-8"))
        if not isinstance(raw, dict):
            continue
        enriched = enrich_source_record(raw, overwrite=overwrite)
        if enriched == raw:
            continue
        changed += 1
        if dry_run:
            print(f"would update {path.name}")
            continue
        path.write_text(_dump_record(enriched), encoding="utf-8")

    return len(paths), changed


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument(
        "--sources-dir",
        default=str(DEFAULT_SOURCES),
        help="Canonical semantic sources directory",
    )
    parser.add_argument("--dry-run", action="store_true", help="Print actions only")
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Replace existing optional metadata fields",
    )
    parser.add_argument("--limit", type=int, default=None, help="Process at most N files")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    sources_dir = (repo / args.sources_dir).resolve()
    total, changed = backfill_sources_dir(
        sources_dir,
        dry_run=args.dry_run,
        overwrite=args.overwrite,
        limit=args.limit,
    )
    action = "Would update" if args.dry_run else "Updated"
    print(f"{action} {changed} of {total} source file(s) under {sources_dir}/", file=sys.stderr)


if __name__ == "__main__":
    main()
