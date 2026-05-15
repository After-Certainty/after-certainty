#!/usr/bin/env python3
"""
Merge draft semantic source YAML (from extract_semantic_source_drafts.py) into
semantic/sources/.

Reads YAML under semantic/_drafts/generated/sources/<book-id>/*.yml (one or more
book folders), merges rows that share the same slug (union of relatedBooks), strips
draft-only keys, normalizes summaries, and sets name to "Author — Title" when
workTitle is present (otherwise keeps the draft author line as name).

Typical workflow::

    make extract-semantic-source-drafts BIBLIO_IN=.../bibliography.md BOOK_ID=...
    make promote-semantic-source-drafts

With ``--prune`` (default for full-repo ``make promote`` when no book filter is set),
``semantic/sources/*.yml`` that are not produced from the merged drafts are removed so
the directory stays a clean tree. Pruning is not allowed together with ``--book-id``
(partial promotes must not delete other books' sources).
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc


DEFAULT_DRAFT_ROOT = Path("semantic/_drafts/generated/sources")
DEFAULT_DEST = Path("semantic/sources")


def _clean_summary(value: object) -> str:
    if not isinstance(value, str):
        return ""
    text = " ".join(value.split()).strip()
    if text.startswith("- "):
        return text[2:].strip()
    return text


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


def _display_name(rec: dict) -> str:
    author = str(rec.get("name", "")).strip()
    wt = rec.get("workTitle")
    if isinstance(wt, str) and wt.strip():
        return f"{author} — {wt.strip()}"
    return author or str(rec.get("slug", "")).strip()


def _pick_work_title(a: dict, b: dict) -> str:
    for rec in (a, b):
        wt = rec.get("workTitle")
        if isinstance(wt, str) and wt.strip():
            return wt.strip()
    return ""


def _merge_records(a: dict, b: dict) -> dict:
    """Merge two draft dicts with the same slug."""
    slug = str(a.get("slug", b.get("slug", ""))).strip()
    work_title = _pick_work_title(a, b)
    base = dict(a)
    base["slug"] = slug
    base["workTitle"] = work_title
    base["name"] = str(a.get("name", "")).strip() or str(b.get("name", "")).strip()
    typ_a, typ_b = str(a.get("type", "")).strip(), str(b.get("type", "")).strip()
    base["type"] = typ_a or typ_b or "book"
    sa, sb = _clean_summary(a.get("summary", "")), _clean_summary(b.get("summary", ""))
    base["summary"] = sa if len(sa) >= len(sb) else sb
    base["concepts"] = _merge_related_books(a.get("concepts"), b.get("concepts"))
    base["patterns"] = _merge_related_books(a.get("patterns"), b.get("patterns"))
    base["relatedBooks"] = _merge_related_books(a.get("relatedBooks"), b.get("relatedBooks"))
    return base


def _to_canonical(rec: dict) -> dict:
    """Drop draft-only keys and workTitle; set combined display name."""
    out = {
        "slug": str(rec.get("slug", "")).strip(),
        "name": _display_name(rec),
        "type": str(rec.get("type", "book")).strip() or "book",
        "summary": _clean_summary(rec.get("summary", "")),
        "concepts": _merge_related_books(rec.get("concepts")),
        "patterns": _merge_related_books(rec.get("patterns")),
        "relatedBooks": _merge_related_books(rec.get("relatedBooks")),
    }
    if not out["slug"]:
        raise ValueError("record missing slug")
    return out


def _discover_book_dirs(draft_root: Path, book_ids: list[str]) -> list[Path]:
    if book_ids:
        dirs = []
        for bid in book_ids:
            d = (draft_root / bid).resolve()
            if not d.is_dir():
                print(f"Warning: missing draft directory: {d}", file=sys.stderr)
                continue
            dirs.append(d)
        return dirs
    if not draft_root.is_dir():
        return []
    return sorted(p for p in draft_root.iterdir() if p.is_dir() and not p.name.startswith("."))


def collect_merged(draft_root: Path, book_ids: list[str]) -> dict[str, dict]:
    by_slug: dict[str, dict] = {}
    for book_dir in _discover_book_dirs(draft_root, book_ids):
        for path in sorted(book_dir.glob("*.yml")):
            raw = yaml.safe_load(path.read_text(encoding="utf-8"))
            if not isinstance(raw, dict):
                continue
            slug = str(raw.get("slug", path.stem)).strip()
            if not slug:
                continue
            raw["slug"] = slug
            if slug in by_slug:
                by_slug[slug] = _merge_records(by_slug[slug], raw)
            else:
                by_slug[slug] = dict(raw)
    return by_slug


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument(
        "--draft-root",
        default=str(DEFAULT_DRAFT_ROOT),
        help="Directory containing per-book-id subfolders of draft YAML",
    )
    parser.add_argument(
        "--dest",
        default=str(DEFAULT_DEST),
        help="Canonical semantic sources directory",
    )
    parser.add_argument(
        "--book-id",
        action="append",
        default=[],
        metavar="ID",
        help="Limit to this book id folder (repeatable). Default: all subdirs of draft-root.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print actions only; do not write semantic/sources/",
    )
    parser.add_argument(
        "--prune",
        action="store_true",
        help="Remove dest/*.yml whose slug is not in this run's merged set (only without --book-id).",
    )
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    draft_root = (repo / args.draft_root).resolve()
    dest = (repo / args.dest).resolve()

    merged = collect_merged(draft_root, args.book_id)
    if not merged:
        print(
            f"No draft sources found under {draft_root}"
            + (f" for book-id(s): {', '.join(args.book_id)}" if args.book_id else ""),
            file=sys.stderr,
        )
        sys.exit(1)

    if args.prune and args.book_id:
        print(
            "Error: --prune cannot be used with --book-id (would delete sources from other draft folders).",
            file=sys.stderr,
        )
        sys.exit(2)

    if args.dry_run:
        for slug in sorted(merged):
            rec = _to_canonical(merged[slug])
            print(f"would write {dest / (slug + '.yml')}: name={rec['name']!r}")
        if args.prune and dest.is_dir():
            for path in sorted(dest.glob("*.yml")):
                if path.stem not in merged:
                    print(f"would remove {path}")
        print(f"Dry run: {len(merged)} file(s).", file=sys.stderr)
        return

    dest.mkdir(parents=True, exist_ok=True)
    for slug in sorted(merged):
        rec = _to_canonical(merged[slug])
        yml = (
            yaml.safe_dump(
                rec,
                allow_unicode=True,
                default_flow_style=False,
                sort_keys=False,
            ).rstrip()
            + "\n"
        )
        (dest / f"{slug}.yml").write_text(yml, encoding="utf-8")

    print(f"Wrote {len(merged)} canonical source file(s) under {dest}/", file=sys.stderr)

    if args.prune:
        removed: list[str] = []
        for path in sorted(dest.glob("*.yml")):
            if path.stem not in merged:
                path.unlink()
                removed.append(path.name)
        if removed:
            print(f"Pruned {len(removed)} stale file(s) from {dest}/", file=sys.stderr)


if __name__ == "__main__":
    main()
