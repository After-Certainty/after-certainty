#!/usr/bin/env python3
"""
List book directories affected by a set of changed paths.

Used by GitHub Actions to scope builds to touched books; Makefile, tools, scripts,
schema, templates, and workflow changes rebuild everything.

Paths match the longest book prefix first. Changes under a shared parent that hosts
multiple editions (for example books/when-others-look-to-you/v1 and .../v2) rebuild every
edition under that parent when the path does not lie inside one edition alone.

Emits JSON on stdout for matrix.include (default) or --dirs for plain lines.
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

_TOOLS_DIR = Path(__file__).resolve().parent
if str(_TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(_TOOLS_DIR))

from book_output_stem import stem_for_book_dir  # noqa: E402
from book_specs import (  # noqa: E402
    ci_export_books,
    load_spec_for_book_dir,
    resolve_spec_path,
    spec_formats,
    spec_ingramspark_enabled,
    spec_ingramspark_github_release,
    spec_ingramspark_target,
    spec_pdf_engine,
)


def find_book_dirs(repo: Path) -> list[Path]:
    return ci_export_books(repo)


def load_spec_for_rel(repo: Path, book_rel: str) -> dict:
    """Load published or upcoming specs from either book.yml or upcoming.yml."""
    book_dir = (repo / book_rel).resolve()
    if resolve_spec_path(book_dir) is None:
        return {}
    return load_spec_for_book_dir(book_dir)


def triggers_full_rebuild(path: str) -> bool:
    if path == "Makefile":
        return True
    prefixes = (
        "tools/",
        "scripts/",
        "schema/",
        "templates/",
        ".github/workflows/",
    )
    return any(path.startswith(p) for p in prefixes)


def changed_paths_from_git(repo: Path, before: str, after: str) -> list[str]:
    r = subprocess.run(
        ["git", "-C", str(repo), "diff", "--name-only", before, after],
        capture_output=True,
        text=True,
        check=False,
    )
    if r.returncode != 0:
        print(r.stderr, file=sys.stderr)
        return []
    return [line.strip() for line in r.stdout.splitlines() if line.strip()]


def find_edition_roots(book_rels: list[str]) -> list[str]:
    """
    Parents that contain more than one book folder as a direct child.

    Used when e.g. books/when-others-look-to-you/v1 and .../v2 are separate pipelines:
    a change under the shared prefix (but not inside v1 or v2 alone) rebuilds both.
    """
    from collections import defaultdict

    by_parent: dict[str, list[str]] = defaultdict(list)
    for rel in book_rels:
        parts = rel.split("/")
        if len(parts) < 2:
            continue
        parent = "/".join(parts[:-1])
        by_parent[parent].append(rel)
    return sorted(p for p, kids in by_parent.items() if len(set(kids)) > 1)


def match_book_for_path(changed_file: str, book_rels_longest_first: list[str]) -> str | None:
    """First matching book path wins; sort input longest-first so nested books win."""
    for rel in book_rels_longest_first:
        if changed_file == rel or changed_file.startswith(rel + "/"):
            return rel
    return None


def fan_out_shared_edition_root(
    changed_file: str,
    book_rels: list[str],
    edition_roots: list[str],
) -> list[str]:
    """Rebuild every book under an edition root when the change is not scoped to one edition."""
    out: list[str] = []
    for root in edition_roots:
        if changed_file == root or changed_file.startswith(root + "/"):
            out.extend(b for b in book_rels if b.startswith(root + "/"))
    return sorted(set(out))


def affected_books(repo: Path, changed: list[str], all_books: list[Path]) -> list[Path]:
    if not changed:
        return all_books
    if any(triggers_full_rebuild(p) for p in changed):
        return list(all_books)

    rel_list = sorted({b.relative_to(repo).as_posix() for b in all_books})
    rel_longest_first = sorted(rel_list, key=len, reverse=True)
    edition_roots = find_edition_roots(rel_list)

    matched_rels: set[str] = set()
    for c in changed:
        hit = match_book_for_path(c, rel_longest_first)
        if hit:
            matched_rels.add(hit)
            continue
        for rel in fan_out_shared_edition_root(c, rel_list, edition_roots):
            matched_rels.add(rel)

    rel_to_path = {b.relative_to(repo).as_posix(): b for b in all_books}
    out = [rel_to_path[r] for r in matched_rels if r in rel_to_path]
    return sorted(set(out), key=lambda p: p.as_posix())


def matrix_entries(repo: Path, books: list[Path]) -> list[dict[str, str]]:
    entries = []
    for book in books:
        rel = book.relative_to(repo).as_posix()
        spec = load_spec_for_rel(repo, rel)
        stem = stem_for_book_dir(rel, root=repo)
        slug = stem.replace("/", "-")
        formats = set(spec_formats(spec))
        target = spec_ingramspark_target(spec)
        ebook = target.get("ebook") if isinstance(target.get("ebook"), dict) else {}
        print_cfg = target.get("print") if isinstance(target.get("print"), dict) else {}
        package_ingramspark = spec_ingramspark_enabled(spec)
        entries.append(
            {
                "dir": rel,
                "stem": stem,
                "slug": slug,
                "has_docx": "true" if "docx" in formats else "false",
                "has_epub": "true" if "epub" in formats else "false",
                "has_pdf": "true" if "pdf" in formats else "false",
                "needs_typst": "true" if spec_pdf_engine(spec) == "typst" else "false",
                "package_ingramspark": "true" if package_ingramspark else "false",
                "ingramspark_github_release": (
                    "true" if spec_ingramspark_github_release(spec) else "false"
                ),
                "ingramspark_ebook": (
                    "true" if package_ingramspark and ebook.get("enabled") is True else "false"
                ),
                "ingramspark_print": (
                    "true" if package_ingramspark and print_cfg.get("enabled") is True else "false"
                ),
            }
        )
    return entries


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--repo",
        default=".",
        help="Repository root (default: current directory)",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Ignore git range; list every book dir",
    )
    parser.add_argument(
        "--before",
        default=os.environ.get("GIT_BEFORE", ""),
        help="Old revision for git diff (with --after)",
    )
    parser.add_argument(
        "--after",
        default=os.environ.get("GIT_AFTER", "HEAD"),
        help="New revision for git diff (default: HEAD)",
    )
    parser.add_argument(
        "--dirs",
        action="store_true",
        help="Print one book directory per line instead of JSON",
    )
    parser.add_argument(
        "--format",
        action="append",
        dest="formats",
        default=[],
        help="Filter to books with build.formats.<name>.enabled=true (repeatable).",
    )
    args = parser.parse_args()

    repo = Path(args.repo).resolve()

    all_books = find_book_dirs(repo)
    if args.all:
        books = all_books
    else:
        before = args.before.strip()
        if not before or before == "0" * 40:
            books = all_books
        else:
            changed = changed_paths_from_git(repo, before, args.after)
            books = affected_books(repo, changed, all_books)

    requested_formats = {f.strip().lower() for f in args.formats if f.strip()}
    if not requested_formats:
        requested_formats = {"docx", "epub", "pdf"}
    books = [
        b
        for b in books
        if requested_formats
        & set(spec_formats(load_spec_for_rel(repo, b.relative_to(repo).as_posix())))
    ]

    if args.dirs:
        for b in books:
            print(b.relative_to(repo).as_posix())
        return

    payload = {
        "include": matrix_entries(repo, books),
        "empty": len(books) == 0,
        "count": len(books),
    }
    print(json.dumps(payload))


if __name__ == "__main__":
    main()
