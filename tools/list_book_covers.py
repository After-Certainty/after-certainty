#!/usr/bin/env python3
"""List public book covers for the web derivative generator (JSON on stdout).

Uses the same book-spec discovery and cover-path resolution as semantic-manifest
generation so Node/Sharp does not re-parse YAML independently.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from book_output_stem import stem_for_book_dir
from book_specs import (
    discover_book_spec_paths,
    discover_upcoming_spec_paths,
    load_book_spec,
    load_upcoming_spec,
)
from manifest_books import resolve_cover_path


def _entries_for_specs(
    *,
    repo: Path,
    spec_paths: list[Path],
    source: str,
    status: str,
    load_fn,
) -> list[dict]:
    out: list[dict] = []
    for spec_path in spec_paths:
        spec = load_fn(spec_path)
        book = spec.get("book", {}) if isinstance(spec.get("book"), dict) else {}
        book_dir = spec_path.parent.resolve()
        stem = stem_for_book_dir(book_dir.as_posix(), root=repo)
        slug = str(book.get("id", "")).strip() or stem
        cover_value = str(book.get("title_page_cover", "")).strip()
        cover_repo_path = resolve_cover_path(repo, spec_path, spec, cover_value)
        out.append(
            {
                "slug": slug,
                "source": source,
                "status": status,
                "specPath": spec_path.relative_to(repo).as_posix(),
                "bookDir": book_dir.relative_to(repo).as_posix(),
                "coverPath": cover_repo_path,
                "eligible": bool(cover_repo_path) and status != "draft",
            }
        )
    return out


def list_book_covers(repo: Path) -> list[dict]:
    repo = repo.resolve()
    entries = _entries_for_specs(
        repo=repo,
        spec_paths=discover_book_spec_paths(repo),
        source="books",
        status="published",
        load_fn=load_book_spec,
    )
    entries.extend(
        _entries_for_specs(
            repo=repo,
            spec_paths=discover_upcoming_spec_paths(repo),
            source="upcoming",
            status="upcoming",
            load_fn=load_upcoming_spec,
        )
    )
    entries.sort(key=lambda e: str(e["slug"]))
    return entries


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--repo",
        type=Path,
        default=Path("."),
        help="Monorepo root (default: cwd)",
    )
    parser.add_argument(
        "--eligible-only",
        action="store_true",
        help="Only emit books that have a cover and are not draft",
    )
    args = parser.parse_args(argv)
    repo = args.repo.resolve()
    if not repo.is_dir():
        print(f"error: repo is not a directory: {repo}", file=sys.stderr)
        return 1

    entries = list_book_covers(repo)
    if args.eligible_only:
        entries = [e for e in entries if e.get("eligible")]

    json.dump(entries, sys.stdout, indent=2, sort_keys=True)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
