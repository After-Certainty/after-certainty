#!/usr/bin/env python3
"""Add high-confidence bibliography relationships for When the Key Changes Hands.

Only exact-slug or title-and-author matches already present in semantic/sources
qualify. Rejects weak heuristics (including a misparsed Federalist No. 51 entry)
and never creates source records or fabricated reader-passage citations.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

import yaml

_TOOLS_DIR = Path(__file__).resolve().parent
if str(_TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(_TOOLS_DIR))

from audit_bibliography_semantic_drift import run_audit  # noqa: E402

TARGET_BOOK = "when-the-key-changes-hands"
ACCEPTED_METHODS = frozenset({"exact_slug", "title_author"})
MIN_SCORE = 85


def append_book_link(source_text: str, book_id: str) -> str:
    """Insert one YAML list member, preserving all existing field formatting."""
    data = yaml.safe_load(source_text)
    if not isinstance(data, dict):
        raise ValueError("Source YAML is not a mapping")
    existing = data.get("relatedBooks")
    if not isinstance(existing, list):
        raise ValueError("Unexpected relatedBooks YAML format")
    if book_id in existing:
        return source_text

    lines = source_text.splitlines(keepends=True)
    start = next(
        (
            i
            for i, line in enumerate(lines)
            if re.fullmatch(r"relatedBooks:\s*(?:\[\])?\s*", line.strip())
        ),
        None,
    )
    if start is None:
        raise ValueError("No recognizable relatedBooks key")
    if "[]" in lines[start]:
        lines[start] = "relatedBooks:\n"
        insert_at = start + 1
    else:
        insert_at = start + 1
        while insert_at < len(lines) and re.match(r"^-\s+\S", lines[insert_at]):
            insert_at += 1
    lines.insert(insert_at, f"- {book_id}\n")
    updated = "".join(lines)
    if book_id not in yaml.safe_load(updated)["relatedBooks"]:
        raise ValueError("Related book insertion was not valid YAML")
    return updated


def reconcile(repo: Path) -> tuple[int, list[str]]:
    results = run_audit(repo)
    target = next((b for b in results["books"] if b.book_id == TARGET_BOOK), None)
    if target is None:
        raise RuntimeError(f"Missing expected bibliography audit: {TARGET_BOOK}")

    applied: list[str] = []
    deferred: list[str] = []
    for entry in target.missing_related_books:
        slug = entry["sourceSlug"]
        score = entry["score"]
        method = entry["method"]
        if score < MIN_SCORE or method not in ACCEPTED_METHODS:
            deferred.append(slug)
            continue
        path = repo / "semantic" / "sources" / f"{slug}.yml"
        if not path.is_file():
            raise RuntimeError(f"Missing matched source YAML {slug}")
        original = path.read_text(encoding="utf-8")
        parsed = yaml.safe_load(original)
        if parsed.get("slug") != slug:
            raise RuntimeError(f"Source slug mismatch: {slug}")
        updated = append_book_link(original, TARGET_BOOK)
        if updated == original:
            raise RuntimeError(f"Audit marked already-linked source: {slug}")
        path.write_text(updated, encoding="utf-8")
        applied.append(slug)

    if len(applied) != 26 or len(deferred) != 1:
        raise RuntimeError(
            f"Expected 26 safe relationships and 1 weak match; "
            f"got applied={len(applied)}, deferred={len(deferred)}."
        )
    return len(applied), deferred


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, default=Path("."))
    args = parser.parse_args()
    applied, deferred = reconcile(args.repo.resolve())
    print(f"Phase 19: linked {applied} existing sources to {TARGET_BOOK}")
    print(f"Deferred weak bibliography matches: {', '.join(deferred)}")


if __name__ == "__main__":
    main()
