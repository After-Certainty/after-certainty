#!/usr/bin/env python3
"""
Normalize display-field metadata on canonical semantic sources and thinkers.

Strips markdown italics from names, re-runs source enrichment from bibliography
text, and rebuilds ``Author — Title`` display names when both parts are known.

Typical usage::

    python3 tools/normalize_semantic_metadata.py --repo . --dry-run
    python3 tools/normalize_semantic_metadata.py --repo .
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

from semantic_metadata_quality_audit import run_metadata_quality_audit  # noqa: E402
from source_metadata import enrich_source_record, strip_markdown_italics  # noqa: E402

DEFAULT_SOURCES = Path("semantic/sources")
DEFAULT_THINKERS = Path("semantic/thinkers")


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


def normalize_thinker_record(rec: dict) -> dict:
    out = dict(rec)
    name = str(out.get("name", "")).strip()
    if name and name != strip_markdown_italics(name):
        out["name"] = strip_markdown_italics(name)
    return out


def normalize_sources_dir(
    sources_dir: Path,
    *,
    dry_run: bool = False,
    only_flagged: bool = True,
) -> tuple[int, int]:
    flagged: set[str] = set()
    if only_flagged:
        audit = run_metadata_quality_audit(sources_dir.parent.parent)
        flagged = {
            issue.slug
            for issue in audit.issues
            if issue.entity_kind == "source"
            and issue.check
            in ("markdown_in_display", "missing_name_separator", "creator_name_mismatch")
        }

    paths = sorted(sources_dir.glob("*.yml"))
    changed = 0
    for path in paths:
        if only_flagged and path.stem not in flagged:
            continue
        raw = yaml.safe_load(path.read_text(encoding="utf-8"))
        if not isinstance(raw, dict):
            continue
        enriched = enrich_source_record(raw, overwrite=True)
        if enriched == raw:
            continue
        changed += 1
        if dry_run:
            print(f"would update source {path.name}")
            continue
        path.write_text(_dump_record(enriched), encoding="utf-8")
    return len(paths), changed


def normalize_thinkers_dir(
    thinkers_dir: Path,
    *,
    dry_run: bool = False,
    only_flagged: bool = True,
) -> tuple[int, int]:
    flagged: set[str] = set()
    if only_flagged:
        audit = run_metadata_quality_audit(thinkers_dir.parent.parent)
        flagged = {
            issue.slug
            for issue in audit.issues
            if issue.entity_kind == "thinker" and issue.check == "markdown_in_display"
        }

    paths = sorted(thinkers_dir.glob("*.yml"))
    changed = 0
    for path in paths:
        if only_flagged and path.stem not in flagged:
            continue
        raw = yaml.safe_load(path.read_text(encoding="utf-8"))
        if not isinstance(raw, dict):
            continue
        normalized = normalize_thinker_record(raw)
        if normalized == raw:
            continue
        changed += 1
        if dry_run:
            print(f"would update thinker {path.name}")
            continue
        path.write_text(_dump_record(normalized), encoding="utf-8")
    return len(paths), changed


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument("--sources-dir", default=str(DEFAULT_SOURCES))
    parser.add_argument("--thinkers-dir", default=str(DEFAULT_THINKERS))
    parser.add_argument("--dry-run", action="store_true", help="Print actions only")
    parser.add_argument(
        "--all",
        action="store_true",
        help="Process all records, not only audit-flagged ones",
    )
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    only_flagged = not args.all
    src_total, src_changed = normalize_sources_dir(
        (repo / args.sources_dir).resolve(),
        dry_run=args.dry_run,
        only_flagged=only_flagged,
    )
    thinker_total, thinker_changed = normalize_thinkers_dir(
        (repo / args.thinkers_dir).resolve(),
        dry_run=args.dry_run,
        only_flagged=only_flagged,
    )
    action = "Would update" if args.dry_run else "Updated"
    print(
        f"{action} {src_changed} source(s) and {thinker_changed} thinker(s)",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
