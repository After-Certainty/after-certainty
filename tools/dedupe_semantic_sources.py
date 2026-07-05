#!/usr/bin/env python3
"""
Merge duplicate semantic source YAML entries created when bibliography titles
truncate to different slug lengths.

Groups sources whose slugs form a prefix chain (``short`` + ``-`` is prefix of
``long``) with the same author anchor (first three slug segments). Keeps the
longest slug as canonical, unions relatedBooks/concepts/patterns, rewrites
pattern relatedSources references, and removes duplicate files.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

SOURCES_DIR = Path("semantic/sources")
PATTERNS_DIR = Path("semantic/patterns")
GLOSSARY_DIR = Path("semantic/glossary")
SITUATIONS_DIR = Path("semantic/situations")


def _author_anchor(slug: str) -> str:
    parts = slug.split("-")
    return "-".join(parts[:3]) if len(parts) >= 3 else slug


def _load_yaml(path: Path) -> dict:
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    return raw if isinstance(raw, dict) else {}


def _merge_lists(*lists: object) -> list[str]:
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


def _best_name(records: list[dict]) -> str:
    names = [str(r.get("name", "")).strip() for r in records if r.get("name")]
    return max(names, key=len) if names else ""


def _best_summary(records: list[dict]) -> str:
    summaries = [str(r.get("summary", "")).strip() for r in records if r.get("summary")]
    return max(summaries, key=len) if summaries else ""


def find_duplicate_groups(slugs: list[str]) -> list[list[str]]:
    """Return groups of slug prefix chains sharing author anchor."""
    by_anchor: dict[str, list[str]] = {}
    for slug in slugs:
        by_anchor.setdefault(_author_anchor(slug), []).append(slug)

    groups: list[list[str]] = []
    for _anchor, anchor_slugs in by_anchor.items():
        sorted_slugs = sorted(anchor_slugs, key=len)
        used: set[str] = set()
        for slug in sorted_slugs:
            if slug in used:
                continue
            chain = [slug]
            for other in sorted_slugs:
                if other == slug:
                    continue
                if other.startswith(slug + "-"):
                    chain.append(other)
            if len(chain) == 1:
                continue
            chain = sorted(set(chain), key=len)
            canonical = chain[-1]
            group = [canonical]
            for s in chain[:-1]:
                if s not in group:
                    group.insert(0, s)
            for s in group:
                used.add(s)
            groups.append(group)
    return groups


def build_redirect_map(groups: list[list[str]]) -> dict[str, str]:
    redirect: dict[str, str] = {}
    for group in groups:
        canonical = group[-1]
        for slug in group[:-1]:
            redirect[slug] = canonical
    return redirect


def merge_group(records: dict[str, dict], canonical: str, members: list[str]) -> dict:
    rows = [records[canonical]] + [records[s] for s in members if s != canonical]
    out = {
        "slug": canonical,
        "name": _best_name(rows),
        "type": str(rows[0].get("type", "book")).strip() or "book",
        "summary": _best_summary(rows),
        "concepts": _merge_lists(*(r.get("concepts") for r in rows)),
        "patterns": _merge_lists(*(r.get("patterns") for r in rows)),
        "relatedBooks": _merge_lists(*(r.get("relatedBooks") for r in rows)),
    }
    return out


def rewrite_related_sources(repo: Path, redirect: dict[str, str], *, dry_run: bool) -> int:
    changed = 0
    for root in (PATTERNS_DIR, GLOSSARY_DIR, SITUATIONS_DIR):
        for path in sorted((repo / root).glob("*.yml")):
            data = _load_yaml(path)
            rel = data.get("relatedSources")
            if not isinstance(rel, list):
                continue
            new_rel: list[str] = []
            touched = False
            for item in rel:
                s = str(item).strip()
                target = redirect.get(s, s)
                if target != s:
                    touched = True
                if target not in new_rel:
                    new_rel.append(target)
            if not touched:
                continue
            data["relatedSources"] = new_rel
            changed += 1
            if not dry_run:
                path.write_text(
                    yaml.safe_dump(
                        data,
                        allow_unicode=True,
                        default_flow_style=False,
                        sort_keys=False,
                    )
                    + "\n",
                    encoding="utf-8",
                )
    return changed


def collapse_prefix_duplicates(records: dict[str, dict]) -> dict[str, dict]:
    """Merge in-memory source records whose slugs form prefix chains."""
    if not records:
        return records
    slugs = sorted(records.keys())
    groups = find_duplicate_groups(slugs)
    if not groups:
        return records
    out = dict(records)
    for group in groups:
        canonical = group[-1]
        rec = merge_group(out, canonical, group)
        out[canonical] = rec
        for slug in group[:-1]:
            out.pop(slug, None)
    return out


def dedupe(repo: Path, *, dry_run: bool) -> tuple[int, int, dict[str, str]]:
    src_root = repo / SOURCES_DIR
    slugs = sorted(p.stem for p in src_root.glob("*.yml"))
    records = {s: _load_yaml(src_root / f"{s}.yml") for s in slugs}
    groups = find_duplicate_groups(slugs)
    redirect = build_redirect_map(groups)

    if not redirect:
        return 0, 0, {}

    merged = 0
    removed = 0
    for group in groups:
        canonical = group[-1]
        dupes = [s for s in group if s != canonical]
        if not dupes:
            continue
        rec = merge_group(records, canonical, group)
        merged += 1
        if dry_run:
            print(f"canonical {canonical} <- {', '.join(dupes)}")
            continue
        (src_root / f"{canonical}.yml").write_text(
            yaml.safe_dump(rec, allow_unicode=True, default_flow_style=False, sort_keys=False)
            + "\n",
            encoding="utf-8",
        )
        for slug in dupes:
            path = src_root / f"{slug}.yml"
            if path.is_file():
                path.unlink()
                removed += 1

    refs = rewrite_related_sources(repo, redirect, dry_run=dry_run)
    if refs:
        print(f"Updated relatedSources in {refs} entity file(s)", file=sys.stderr)

    return merged, removed, redirect


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    merged, removed, redirect = dedupe(Path(args.repo).resolve(), dry_run=args.dry_run)
    if args.dry_run:
        print(
            f"Dry run: {merged} group(s), {len(redirect)} slug(s) would redirect", file=sys.stderr
        )
    else:
        print(f"Merged {merged} group(s), removed {removed} duplicate file(s)", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
