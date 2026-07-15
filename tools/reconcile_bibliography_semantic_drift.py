#!/usr/bin/env python3
"""
Apply bibliography ↔ semantic drift reconcile actions (relatedBooks + thinkers).

Reads ``reports/bibliography-semantic-drift.json`` (from audit) and:

1. Adds book ids for ``missing_related_books`` hits on existing sources
2. Removes book ids for ``stale_related_books``
3. Optionally syncs thinker ``works`` / ``relatedBooks`` from source ``creatorSlugs``
   (preserves curated ``summary`` / ``whyThisMatters`` / ``name`` / ``type`` on
   existing thinkers; creates minimal stubs for new creators)

Does **not** create or delete source YAML for missing biblio entries — use
extract + promote for that.

Typical workflow::

    make audit-bibliography-semantic-drift
    python3 tools/reconcile_bibliography_semantic_drift.py --repo . --apply-related-books
    # extract + promote missing books…
    python3 tools/reconcile_bibliography_semantic_drift.py --repo . --sync-thinkers
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

DEFAULT_AUDIT = Path("reports/bibliography-semantic-drift.json")
SOURCES_DIR = Path("semantic/sources")
THINKERS_DIR = Path("semantic/thinkers")


def _load_yaml(path: Path) -> dict[str, Any]:
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    return raw if isinstance(raw, dict) else {}


def _dump_yaml(path: Path, data: dict[str, Any]) -> None:
    path.write_text(
        yaml.safe_dump(
            data,
            allow_unicode=True,
            default_flow_style=False,
            sort_keys=False,
        ).rstrip()
        + "\n",
        encoding="utf-8",
    )


def _norm_books(raw: object) -> list[str]:
    if not isinstance(raw, list):
        return []
    out: list[str] = []
    seen: set[str] = set()
    for item in raw:
        s = str(item).strip().removeprefix("book-")
        if s and s not in seen:
            seen.add(s)
            out.append(s)
    return sorted(out)


def _sorted_slugs(raw: object) -> list[str]:
    if not isinstance(raw, list):
        return []
    out: list[str] = []
    seen: set[str] = set()
    for item in raw:
        s = str(item).strip()
        if s and s not in seen:
            seen.add(s)
            out.append(s)
    return sorted(out)


def apply_related_books(repo: Path, audit: dict[str, Any], *, dry_run: bool) -> dict[str, int]:
    sources_dir = repo / SOURCES_DIR
    adds = 0
    removes = 0
    missing_files = 0

    # Collect mutations per source slug
    to_add: dict[str, set[str]] = defaultdict(set)
    to_remove: dict[str, set[str]] = defaultdict(set)

    for book in audit.get("books") or []:
        book_id = str(book.get("book_id") or "").strip()
        if not book_id:
            continue
        for row in book.get("missing_related_books") or []:
            slug = str(row.get("sourceSlug") or "").strip()
            if slug:
                to_add[slug].add(book_id)
        for row in book.get("stale_related_books") or []:
            slug = str(row.get("sourceSlug") or "").strip()
            if slug:
                to_remove[slug].add(book_id)

    all_slugs = sorted(set(to_add) | set(to_remove))
    for slug in all_slugs:
        path = sources_dir / f"{slug}.yml"
        if not path.is_file():
            missing_files += 1
            print(f"skip missing source file: {slug}", file=sys.stderr)
            continue
        doc = _load_yaml(path)
        books = set(_norm_books(doc.get("relatedBooks")))
        before = set(books)
        books |= to_add.get(slug, set())
        books -= to_remove.get(slug, set())
        if books == before:
            continue
        added = books - before
        removed = before - books
        adds += len(added)
        removes += len(removed)
        doc["relatedBooks"] = sorted(books)
        action = []
        if added:
            action.append(f"+{sorted(added)}")
        if removed:
            action.append(f"-{sorted(removed)}")
        print(f"{'would update' if dry_run else 'update'} {slug}: {', '.join(action)}")
        if not dry_run:
            _dump_yaml(path, doc)

    return {
        "sourcesTouched": len(all_slugs) - missing_files,
        "adds": adds,
        "removes": removes,
        "missingFiles": missing_files,
    }


def load_sources(repo: Path) -> dict[str, dict[str, Any]]:
    out: dict[str, dict[str, Any]] = {}
    src_dir = repo / SOURCES_DIR
    if not src_dir.is_dir():
        return out
    for path in sorted(src_dir.glob("*.yml")):
        doc = _load_yaml(path)
        slug = str(doc.get("slug", path.stem)).strip()
        if slug:
            out[slug] = doc
    return out


def sync_thinkers(repo: Path, *, dry_run: bool) -> dict[str, int]:
    """
    Sync thinker works/relatedBooks (and union concepts/patterns) from sources.

    Existing thinkers keep summary/whyThisMatters/name/type unless empty.
    New thinker stubs are created for creatorSlugs without a thinker file.
    """
    tools_dir = Path(__file__).resolve().parent
    if str(tools_dir) not in sys.path:
        sys.path.insert(0, str(tools_dir))
    from derive_thinker_drafts import derive_thinker_records  # noqa: E402

    sources = load_sources(repo)
    derived = derive_thinker_records(sources)
    thinkers_dir = repo / THINKERS_DIR
    thinkers_dir.mkdir(parents=True, exist_ok=True)

    updated = 0
    created = 0
    unchanged = 0

    for slug, draft in sorted(derived.items()):
        path = thinkers_dir / f"{slug}.yml"
        if path.is_file():
            existing = _load_yaml(path)
            new_works = _sorted_slugs(draft.get("works"))
            new_books = _norm_books(draft.get("relatedBooks"))
            new_concepts = _sorted_slugs(draft.get("concepts"))
            new_patterns = _sorted_slugs(draft.get("patterns"))

            merged_concepts = sorted(
                set(_sorted_slugs(existing.get("concepts"))) | set(new_concepts)
            )
            merged_patterns = sorted(
                set(_sorted_slugs(existing.get("patterns"))) | set(new_patterns)
            )

            changed = (
                new_works != _sorted_slugs(existing.get("works"))
                or new_books != _norm_books(existing.get("relatedBooks"))
                or merged_concepts != _sorted_slugs(existing.get("concepts"))
                or merged_patterns != _sorted_slugs(existing.get("patterns"))
            )
            if not changed:
                unchanged += 1
                continue
            existing["works"] = new_works
            existing["relatedBooks"] = new_books
            existing["concepts"] = merged_concepts
            existing["patterns"] = merged_patterns
            if not str(existing.get("summary", "")).strip():
                existing["summary"] = draft["summary"]
            print(
                f"{'would update' if dry_run else 'update'} thinker {slug}: "
                f"{len(new_works)} works, {len(new_books)} books"
            )
            if not dry_run:
                _dump_yaml(path, existing)
            updated += 1
        else:
            stub = {
                "slug": draft["slug"],
                "name": draft["name"],
                "type": draft["type"],
                "summary": draft["summary"],
                "concepts": draft.get("concepts") or [],
                "patterns": draft.get("patterns") or [],
                "relatedBooks": draft.get("relatedBooks") or [],
                "works": draft.get("works") or [],
            }
            print(
                f"{'would create' if dry_run else 'create'} thinker {slug}: "
                f"{len(stub['works'])} works"
            )
            if not dry_run:
                _dump_yaml(path, stub)
            created += 1

    return {
        "updated": updated,
        "created": created,
        "unchanged": unchanged,
        "derived": len(derived),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument(
        "--audit",
        default=str(DEFAULT_AUDIT),
        help="Path to bibliography-semantic-drift.json",
    )
    parser.add_argument(
        "--apply-related-books",
        action="store_true",
        help="Apply missing/stale relatedBooks patches from the audit JSON",
    )
    parser.add_argument(
        "--sync-thinkers",
        action="store_true",
        help="Sync thinker works/relatedBooks from current semantic/sources",
    )
    parser.add_argument("--dry-run", action="store_true", help="Print actions only")
    args = parser.parse_args()

    if not args.apply_related_books and not args.sync_thinkers:
        parser.error("Specify --apply-related-books and/or --sync-thinkers")

    repo = Path(args.repo).resolve()
    if args.apply_related_books:
        audit_path = Path(args.audit)
        if not audit_path.is_absolute():
            audit_path = repo / audit_path
        if not audit_path.is_file():
            raise SystemExit(f"Missing audit file: {audit_path}")
        audit = json.loads(audit_path.read_text(encoding="utf-8"))
        stats = apply_related_books(repo, audit, dry_run=args.dry_run)
        print(
            f"relatedBooks: touched={stats['sourcesTouched']} "
            f"adds={stats['adds']} removes={stats['removes']} "
            f"missingFiles={stats['missingFiles']}",
            file=sys.stderr,
        )

    if args.sync_thinkers:
        stats = sync_thinkers(repo, dry_run=args.dry_run)
        print(
            f"thinkers: updated={stats['updated']} created={stats['created']} "
            f"unchanged={stats['unchanged']} derived={stats['derived']}",
            file=sys.stderr,
        )


if __name__ == "__main__":
    main()
