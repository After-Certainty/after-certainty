#!/usr/bin/env python3
"""
Validate every book.yml against schema/book.schema.json.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from book_specs import discover_book_spec_paths, load_book_spec


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root (default: current directory)")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    specs = discover_book_spec_paths(repo)
    if not specs:
        raise SystemExit("No book.yml specs found.")

    for spec_path in specs:
        load_book_spec(spec_path)

    print(f"Validated {len(specs)} book specs.")


if __name__ == "__main__":
    main()
