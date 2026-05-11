#!/usr/bin/env python3
"""
Validate every book.yml against schema/book.schema.json.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from book_specs import (
    discover_book_spec_paths,
    discover_upcoming_spec_paths,
    load_book_spec,
    load_upcoming_spec,
)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root (default: current directory)")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    book_specs = discover_book_spec_paths(repo)
    if not book_specs:
        raise SystemExit("No book.yml specs found.")

    for spec_path in book_specs:
        load_book_spec(spec_path)

    upcoming_specs = discover_upcoming_spec_paths(repo)
    for spec_path in upcoming_specs:
        load_upcoming_spec(spec_path)

    print(f"Validated {len(book_specs)} book specs and {len(upcoming_specs)} upcoming specs.")


if __name__ == "__main__":
    main()
