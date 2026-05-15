#!/usr/bin/env python3
"""
Scan ``semantic/**/*.yml`` (skips ``semantic/_drafts``) for common prose/YAML issues:

- **longDefinition vs shortDefinition:** after collapsing whitespace, if both exist and
  are the same text, ``longDefinition`` is redundant (often left over from a template
  that duplicated ``shortDefinition`` with awkward quoted newlines in the file).
- **Parse errors:** invalid YAML.

Use ``--fix-long-definition-dupes`` to remove redundant ``longDefinition`` keys in place
(rewrites only files that change).
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

SEMANTIC = Path("semantic")


def _collapse_ws(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip())


def _should_drop_long_definition(data: dict) -> bool:
    sd = data.get("shortDefinition")
    ld = data.get("longDefinition")
    if not isinstance(sd, str) or not isinstance(ld, str):
        return False
    if not sd.strip() or not ld.strip():
        return False
    return _collapse_ws(sd) == _collapse_ws(ld)


def audit(repo: Path) -> tuple[list[Path], list[tuple[Path, str]]]:
    """Returns (paths with redundant longDefinition, parse failures as (path, err))."""
    dupes: list[Path] = []
    fails: list[tuple[Path, str]] = []
    root = repo / SEMANTIC
    for path in sorted(root.rglob("*.yml")):
        if "_drafts" in path.parts:
            continue
        try:
            data = yaml.safe_load(path.read_text(encoding="utf-8"))
        except Exception as exc:  # pragma: no cover
            fails.append((path, str(exc)))
            continue
        if not isinstance(data, dict):
            continue
        if _should_drop_long_definition(data):
            dupes.append(path)
    return dupes, fails


def fix_dupes(repo: Path) -> int:
    """Remove redundant longDefinition; return count of files written."""
    written = 0
    dupes, _ = audit(repo)
    for path in dupes:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
        if not isinstance(data, dict) or not _should_drop_long_definition(data):
            continue
        del data["longDefinition"]
        yml = (
            yaml.safe_dump(
                data,
                allow_unicode=True,
                default_flow_style=False,
                sort_keys=False,
            ).rstrip()
            + "\n"
        )
        path.write_text(yml, encoding="utf-8")
        written += 1
    return written


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument(
        "--fix-long-definition-dupes",
        action="store_true",
        help="Remove longDefinition when it duplicates shortDefinition (collapsed).",
    )
    args = parser.parse_args()
    repo = Path(args.repo).resolve()

    dupes, fails = audit(repo)
    for p in dupes:
        print(f"redundant longDefinition: {p.relative_to(repo)}")
    for p, err in fails:
        print(f"YAML parse error: {p.relative_to(repo)}: {err}", file=sys.stderr)

    print(f"Found {len(dupes)} file(s) with redundant longDefinition.", file=sys.stderr)
    if fails:
        print(f"Found {len(fails)} YAML parse error(s).", file=sys.stderr)

    if args.fix_long_definition_dupes:
        n = fix_dupes(repo)
        print(f"Removed redundant longDefinition in {n} file(s).", file=sys.stderr)


if __name__ == "__main__":
    main()
