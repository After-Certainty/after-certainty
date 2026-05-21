#!/usr/bin/env python3
"""
Generate an aggregate books manifest for publishable and upcoming books.
"""

from __future__ import annotations

import argparse
import json
from datetime import UTC, datetime
from pathlib import Path

from book_specs import (
    discover_book_spec_paths,
    discover_upcoming_spec_paths,
    load_book_spec,
    load_upcoming_spec,
)
from manifest_books import build_book_entry, resolve_repo_slug


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument("--out", required=True, help="Output JSON path")
    parser.add_argument(
        "--github-repository",
        default="",
        help="GitHub repository slug (owner/repo). If omitted, derive from git origin.",
    )
    parser.add_argument("--github-ref", default="main", help="Git ref used for raw content URLs")
    parser.add_argument(
        "--release-tag", default="latest", help="GitHub release tag for export assets"
    )
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    repo_slug = resolve_repo_slug(repo, args.github_repository)

    books: list[dict] = []
    published_slugs: set[str] = set()

    for spec_path in discover_book_spec_paths(repo):
        spec = load_book_spec(spec_path)
        entry = build_book_entry(
            repo=repo,
            spec_path=spec_path,
            spec=spec,
            repo_slug=repo_slug,
            ref=args.github_ref,
            release_tag=args.release_tag,
            source="books",
            status="published",
        )
        books.append(entry)
        published_slugs.add(str(entry["slug"]))

    for spec_path in discover_upcoming_spec_paths(repo):
        spec = load_upcoming_spec(spec_path)
        book = spec.get("book", {})
        slug = str(book.get("id", "")).strip()
        if slug and slug in published_slugs:
            continue
        upcoming = spec.get("upcoming", {})
        books.append(
            build_book_entry(
                repo=repo,
                spec_path=spec_path,
                spec=spec,
                repo_slug=repo_slug,
                ref=args.github_ref,
                release_tag=args.release_tag,
                source="upcoming",
                status=str(upcoming.get("status", "in_progress")).strip() or "in_progress",
            )
        )

    books.sort(key=lambda item: (item["slug"], item["source"]))
    payload = {
        "manifestVersion": 1,
        "generatedAt": datetime.now(UTC).isoformat(),
        "repository": repo_slug or None,
        "ref": args.github_ref,
        "releaseTag": args.release_tag,
        "books": books,
    }

    out_path = Path(args.out).resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(str(out_path))


if __name__ == "__main__":
    main()
