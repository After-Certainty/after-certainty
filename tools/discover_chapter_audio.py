#!/usr/bin/env python3
"""Discover enabled chapter-audio units that need generation (secret-free)."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT / "tools") not in sys.path:
    sys.path.insert(0, str(ROOT / "tools"))

from chapter_audio.discover import discover_units_to_generate  # noqa: E402
from chapter_audio.plan import plan_to_dict  # noqa: E402


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--repo", type=Path, default=Path("."), help="Repository root")
    p.add_argument(
        "--edition",
        default="",
        help="Optional edition slug filter (e.g. observer-patterns)",
    )
    p.add_argument(
        "--unit",
        action="append",
        default=[],
        help="Optional explicit unit id (repeatable). When set, only these are considered.",
    )
    p.add_argument(
        "--force",
        action="store_true",
        help="Include enabled units that are already current",
    )
    p.add_argument(
        "--format",
        choices=("ids", "table", "json"),
        default="ids",
        help="ids = one unit id per line (for Actions); table/json for humans",
    )
    return p.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = _parse_args(argv)
    repo = args.repo.resolve()
    try:
        plans = discover_units_to_generate(
            repo,
            edition_slug=(args.edition.strip() or None),
            force=bool(args.force),
            unit_ids=list(args.unit) or None,
        )
    except ValueError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    if args.format == "ids":
        for plan in plans:
            print(plan.unit_id)
        return 0

    if args.format == "json":
        json.dump({"units": [plan_to_dict(p) for p in plans]}, sys.stdout, indent=2)
        sys.stdout.write("\n")
        return 0

    if not plans:
        print("No units need generation.")
        return 0

    print("\t".join(("status", "editionSlug", "unitId", "chars", "regen", "reason")))
    for plan in plans:
        print(
            "\t".join(
                [
                    plan.status,
                    plan.edition_slug,
                    plan.unit_id,
                    str(plan.spoken_characters),
                    "yes" if plan.regenerate_required else "no",
                    plan.status_reason or plan.regenerate_reason,
                ]
            )
        )
    print(f"\n{len(plans)} unit(s)", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
