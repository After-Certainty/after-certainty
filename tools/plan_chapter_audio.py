#!/usr/bin/env python3
"""Plan chapter-audio generation (secret-free, no network)."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT / "tools") not in sys.path:
    sys.path.insert(0, str(ROOT / "tools"))

from chapter_audio.plan import plan_to_dict, plan_units  # noqa: E402


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--repo", type=Path, default=Path("."), help="Repository root")
    p.add_argument("--unit", default="", help="Single unit id (optional)")
    p.add_argument(
        "--enabled",
        action="store_true",
        help="Only audio-enabled units",
    )
    p.add_argument(
        "--format",
        choices=("table", "json"),
        default="table",
    )
    return p.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = _parse_args(argv)
    repo = args.repo.resolve()
    plans = plan_units(
        repo,
        enabled_only=bool(args.enabled),
        unit_id=(args.unit.strip() or None),
    )
    rows = [plan_to_dict(p) for p in plans]
    if args.format == "json":
        json.dump({"units": rows}, sys.stdout, indent=2)
        sys.stdout.write("\n")
        return 0

    if not rows:
        print("No units matched.")
        return 0

    headers = (
        "status",
        "editionSlug",
        "unitId",
        "chars",
        "estCredits",
        "regen",
        "reason",
    )
    print("\t".join(headers))
    for row in rows:
        est = row.get("estimated_usage_amount")
        est_s = "" if est is None else str(int(est) if float(est).is_integer() else est)
        print(
            "\t".join(
                [
                    str(row.get("status") or ""),
                    str(row.get("edition_slug") or ""),
                    str(row.get("unit_id") or ""),
                    str(row.get("spoken_characters") or 0),
                    est_s,
                    "yes" if row.get("regenerate_required") else "no",
                    str(row.get("status_reason") or ""),
                ]
            )
        )
    print(f"\n{len(rows)} unit(s)", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
