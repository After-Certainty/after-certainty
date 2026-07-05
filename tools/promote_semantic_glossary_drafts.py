#!/usr/bin/env python3
"""
Merge draft semantic glossary YAML into semantic/glossary/.

Reads semantic/_drafts/generated/glossary/<book-id>/*.yml, strips draft-only keys,
and writes or merges into canonical glossary entries (union relatedBooks).
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

DEFAULT_DRAFT_ROOT = Path("semantic/_drafts/generated/glossary")
DEFAULT_DEST = Path("semantic/glossary")
DRAFT_KEYS = frozenset({"_draft", "_extracted_from", "longDefinition"})


def _merge_related_books(*lists: object) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()
    for lst in lists:
        if not isinstance(lst, list):
            continue
        for x in lst:
            s = str(x).strip()
            if not s or s in seen:
                continue
            seen.add(s)
            out.append(s)
    return sorted(out)


def _to_canonical(rec: dict) -> dict:
    out = {k: v for k, v in rec.items() if k not in DRAFT_KEYS}
    out["relatedBooks"] = _merge_related_books(rec.get("relatedBooks"))
    return out


def _merge_existing(existing: dict, draft: dict) -> dict:
    out = dict(existing)
    out["relatedBooks"] = _merge_related_books(
        existing.get("relatedBooks"), draft.get("relatedBooks")
    )
    return out


def promote(
    repo: Path,
    *,
    book_ids: list[str] | None,
    dry_run: bool,
) -> tuple[int, int]:
    draft_root = repo / DEFAULT_DRAFT_ROOT
    dest = repo / DEFAULT_DEST
    created = 0
    merged = 0

    if not draft_root.is_dir():
        print(f"No draft root: {draft_root}", file=sys.stderr)
        return 0, 0

    book_dirs = sorted(p for p in draft_root.iterdir() if p.is_dir())
    if book_ids:
        allowed = set(book_ids)
        book_dirs = [p for p in book_dirs if p.name in allowed]

    for book_dir in book_dirs:
        for draft_path in sorted(book_dir.glob("*.yml")):
            raw = yaml.safe_load(draft_path.read_text(encoding="utf-8"))
            if not isinstance(raw, dict):
                continue
            slug = str(raw.get("slug", draft_path.stem)).strip()
            if not slug:
                continue
            canonical = _to_canonical(raw)
            dest_path = dest / f"{slug}.yml"
            if dest_path.is_file():
                existing = yaml.safe_load(dest_path.read_text(encoding="utf-8"))
                if not isinstance(existing, dict):
                    existing = {}
                merged_rec = _merge_existing(existing, canonical)
                if merged_rec != existing:
                    merged += 1
                    if not dry_run:
                        dest_path.write_text(
                            yaml.safe_dump(
                                merged_rec,
                                allow_unicode=True,
                                default_flow_style=False,
                                sort_keys=False,
                            )
                            + "\n",
                            encoding="utf-8",
                        )
                    print(f"merge {slug} (+ relatedBooks)")
            else:
                created += 1
                if not dry_run:
                    dest_path.write_text(
                        yaml.safe_dump(
                            canonical,
                            allow_unicode=True,
                            default_flow_style=False,
                            sort_keys=False,
                        )
                        + "\n",
                        encoding="utf-8",
                    )
                print(f"create {slug}")

    return created, merged


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument(
        "--book-id",
        action="append",
        dest="book_ids",
        help="Limit to one or more book-id folders (repeatable)",
    )
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    created, merged = promote(
        Path(args.repo).resolve(),
        book_ids=args.book_ids,
        dry_run=args.dry_run,
    )
    print(f"Created {created}, merged {merged}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
