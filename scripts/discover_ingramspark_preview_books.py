#!/usr/bin/env python3
"""List book directories configured for IngramSpark planning cover-preview packaging."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[1]
_TOOLS = _ROOT / "tools"
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from book_specs import discover_book_spec_paths, load_book_spec  # noqa: E402
from ingramspark.paths import book_id, is_print_cover_preview  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".")
    parser.add_argument("--json", action="store_true", help="Emit JSON array of {id,dir}")
    args = parser.parse_args()
    repo = Path(args.repo).resolve()
    found: list[dict[str, str]] = []
    for path in discover_book_spec_paths(repo):
        try:
            spec = load_book_spec(path)
        except ValueError:
            continue
        if not is_print_cover_preview(spec):
            continue
        found.append(
            {
                "id": book_id(spec),
                "dir": path.parent.relative_to(repo).as_posix(),
            }
        )
    if args.json:
        print(json.dumps(found))
    else:
        for item in found:
            print(item["dir"])


if __name__ == "__main__":
    main()
