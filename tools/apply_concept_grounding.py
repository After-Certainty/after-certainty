#!/usr/bin/env python3
"""
Apply concept-grounding fixes to semantic sources and thinkers.

Adds missing concept links identified by find_concept_grounding_gaps().

Usage::

    python3 tools/apply_concept_grounding.py --repo . --dry-run
    python3 tools/apply_concept_grounding.py --repo . --apply
"""

from __future__ import annotations

import argparse
import sys
from collections import defaultdict
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

_TOOLS_DIR = Path(__file__).resolve().parent
if str(_TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(_TOOLS_DIR))

from thinker_concept_audit import (  # noqa: E402
    ConceptGroundingGap,
    find_concept_grounding_gaps,
)

SEMANTIC = Path("semantic")


def _load_yaml(path: Path) -> dict:
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    return raw if isinstance(raw, dict) else {}


def _dump_yaml(path: Path, data: dict) -> None:
    path.write_text(
        yaml.safe_dump(data, sort_keys=False, allow_unicode=True, default_flow_style=False).rstrip()
        + "\n",
        encoding="utf-8",
    )


def _union_sorted_concepts(current: object, additions: set[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for lst in (current, sorted(additions)):
        if not isinstance(lst, list):
            lst = sorted(additions) if lst is current else []
        for item in lst:
            s = str(item).strip().removeprefix("concept-")
            if s and s not in seen:
                seen.add(s)
                out.append(s)
    return sorted(out)


def group_gaps(gaps: list[ConceptGroundingGap]) -> dict[tuple[str, str], set[str]]:
    grouped: dict[tuple[str, str], set[str]] = defaultdict(set)
    for gap in gaps:
        grouped[(gap.entity_type, gap.entity_id)].add(gap.concept)
    return grouped


def apply_concept_grounding(repo: Path, *, dry_run: bool) -> dict[str, int]:
    repo = repo.resolve()
    gaps = find_concept_grounding_gaps(repo)
    grouped = group_gaps(gaps)
    stats = {"gaps": len(gaps), "sources_updated": 0, "thinkers_updated": 0, "concepts_added": 0}

    for (entity_type, entity_id), concepts in sorted(grouped.items()):
        subdir = "sources" if entity_type == "source" else "thinkers"
        path = repo / SEMANTIC / subdir / f"{entity_id}.yml"
        if not path.is_file():
            continue
        doc = _load_yaml(path)
        before = set(_union_sorted_concepts(doc.get("concepts"), set()))
        after = _union_sorted_concepts(doc.get("concepts"), concepts)
        added = set(after) - before
        if not added:
            continue
        stats["concepts_added"] += len(added)
        if entity_type == "source":
            stats["sources_updated"] += 1
        else:
            stats["thinkers_updated"] += 1
        if dry_run:
            print(f"would update {entity_type} {entity_id}: +{sorted(added)}")
            continue
        doc["concepts"] = after
        _dump_yaml(path, doc)

    return stats


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument("--dry-run", action="store_true", help="Print planned changes only")
    parser.add_argument("--apply", action="store_true", help="Write YAML changes")
    args = parser.parse_args()
    if not args.dry_run and not args.apply:
        parser.error("Specify --dry-run or --apply")
    repo = Path(args.repo).resolve()
    stats = apply_concept_grounding(repo, dry_run=args.dry_run)
    if args.dry_run:
        print(
            f"Dry run: {stats['gaps']} gap(s) across "
            f"{stats['sources_updated'] + stats['thinkers_updated']} entities would change"
        )
    else:
        print(
            f"Applied {stats['concepts_added']} concept link(s): "
            f"{stats['sources_updated']} source(s), {stats['thinkers_updated']} thinker(s) updated."
        )


if __name__ == "__main__":
    main()
