#!/usr/bin/env python3
"""List chapter-audio enablement status (secret-free, no network)."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT / "tools") not in sys.path:
    sys.path.insert(0, str(ROOT / "tools"))

from chapter_audio.resolve import iter_resolved_units  # noqa: E402


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--repo", type=Path, default=Path("."), help="Repository root")
    p.add_argument(
        "--filter",
        choices=(
            "all",
            "enabled",
            "available",
            "disabled",
            "stale",
            "missing",
            "unconfigured",
            "invalid",
        ),
        default="all",
        help="Status filter (default: all)",
    )
    p.add_argument(
        "--format",
        choices=("table", "json"),
        default="table",
        help="Output format",
    )
    return p.parse_args(argv)


def _matches_filter(status: str, filt: str) -> bool:
    if filt == "all":
        return True
    if filt == "enabled":
        return status.startswith("enabled-")
    if filt == "available":
        return status == "enabled-current"
    if filt == "disabled":
        return status == "disabled"
    if filt == "stale":
        return status == "enabled-stale"
    if filt == "missing":
        return status == "enabled-missing"
    if filt == "unconfigured":
        return status == "enabled-unconfigured"
    if filt == "invalid":
        return status == "enabled-invalid"
    return False


def _row(unit) -> dict:
    return {
        "unitId": unit.unit_id,
        "editionSlug": unit.edition_slug,
        "bookRelpath": unit.book_relpath,
        "title": unit.title,
        "sourcePath": unit.source_path,
        "kind": unit.kind,
        "enabled": unit.enabled,
        "status": unit.status,
        "reason": unit.status_reason,
        "provider": unit.provider,
        "voiceAlias": unit.voice_alias,
        "providerVoiceId": unit.provider_voice_id,
        "model": unit.model,
        "inheritedFields": list(unit.inherited_fields),
        "overriddenFields": list(unit.overridden_fields),
    }


def main(argv: list[str] | None = None) -> int:
    args = _parse_args(argv)
    repo = args.repo.resolve()
    units = [u for u in iter_resolved_units(repo) if _matches_filter(u.status, args.filter)]
    rows = [_row(u) for u in units]
    if args.format == "json":
        json.dump({"filter": args.filter, "units": rows}, sys.stdout, indent=2)
        sys.stdout.write("\n")
        return 0

    if not rows:
        print(f"No units matched filter={args.filter!r}")
        return 0

    headers = ("status", "editionSlug", "unitId", "provider", "voiceAlias", "reason")
    print("\t".join(headers))
    for row in rows:
        print(
            "\t".join(
                str(row.get(h) or "")
                for h in ("status", "editionSlug", "unitId", "provider", "voiceAlias", "reason")
            )
        )
    print(f"\n{len(rows)} unit(s) (filter={args.filter})", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
