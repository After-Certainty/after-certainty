#!/usr/bin/env python3
"""Convert semantic/patterns ``forces`` from a legacy string to a YAML list of bullets."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required.") from exc

from pattern_yaml import normalize_forces_value

SEMANTIC_PATTERNS = Path("semantic/patterns")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    repo = Path(args.repo).resolve()
    pdir = repo / SEMANTIC_PATTERNS
    n = 0
    for path in sorted(pdir.glob("*.yml")):
        raw = yaml.safe_load(path.read_text(encoding="utf-8"))
        if not isinstance(raw, dict):
            continue
        f = raw.get("forces")
        if isinstance(f, list):
            continue
        if not isinstance(f, str) or not f.strip():
            continue
        new_list = normalize_forces_value(f)
        if args.dry_run:
            print(f"{path.name}: {len(new_list)} force(s)")
            n += 1
            continue
        raw["forces"] = new_list
        yml = (
            yaml.safe_dump(
                raw,
                allow_unicode=True,
                default_flow_style=False,
                sort_keys=False,
            ).rstrip()
            + "\n"
        )
        path.write_text(yml, encoding="utf-8")
        n += 1
    print(f"Updated forces in {n} pattern file(s).", file=sys.stderr)


if __name__ == "__main__":
    main()
