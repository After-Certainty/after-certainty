#!/usr/bin/env python3
"""
Split composite multi-author thinker YAML into one thinker per author.

Updates source creatorSlugs/creatorNames, merges graph links into individual
thinkers, and removes composite thinker files.

Usage::

    python3 tools/split_multi_person_thinkers.py --repo . --dry-run
    python3 tools/split_multi_person_thinkers.py --repo . --apply
"""

from __future__ import annotations

import argparse
import sys
from copy import deepcopy
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

_TOOLS_DIR = Path(__file__).resolve().parent
if str(_TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(_TOOLS_DIR))

from semantic_graph_audit import (  # noqa: E402
    _ET_AL_RE,
    _is_multi_person_thinker_name,
    _strip_thinker_role_suffix,
)
from source_metadata import creator_slug_from_name  # noqa: E402
from thinker_concept_audit import load_entity_dir  # noqa: E402

SEMANTIC = Path("semantic")
THINKERS_DIR = SEMANTIC / "thinkers"
SOURCES_DIR = SEMANTIC / "sources"
OVERRIDE_GLOBS = ("thinkers-batch-*-overrides.yml", "thinkers-pilot-overrides.yml")


def parse_author_list(name: str) -> list[str]:
    """Parse a bibliographic author list into First Last display names."""
    clean = _strip_thinker_role_suffix(name)
    if _ET_AL_RE.search(clean):
        clean = _ET_AL_RE.sub("", clean).strip().rstrip(",").strip()
    if ", and " in clean:
        head, tail = clean.rsplit(", and ", 1)
        tail_authors = [tail.strip()]
    else:
        head = clean
        tail_authors = []
    parts = [p.strip() for p in head.split(",") if p.strip()]
    if len(parts) < 2:
        return [clean] if clean else []
    first = f"{parts[1]} {parts[0]}".strip()
    return [first, *parts[2:], *tail_authors]


def _union_sorted(*lists: object) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for lst in lists:
        if not isinstance(lst, list):
            continue
        for item in lst:
            s = str(item).strip()
            if not s or s in seen:
                continue
            seen.add(s)
            out.append(s)
    return sorted(out)


def _load_yaml(path: Path) -> dict:
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    return raw if isinstance(raw, dict) else {}


def _dump_yaml(path: Path, data: dict) -> None:
    path.write_text(
        yaml.safe_dump(data, sort_keys=False, allow_unicode=True, default_flow_style=False).rstrip()
        + "\n",
        encoding="utf-8",
    )


def _blank_thinker(slug: str, name: str, *, template: dict) -> dict:
    record: dict = {
        "slug": slug,
        "name": name,
        "type": "person",
        "summary": str(template.get("summary", "")).strip()
        or "Scholarly source aggregated from thinker split; edit summary.",
        "concepts": [],
        "patterns": [],
        "relatedBooks": [],
        "works": [],
    }
    why = str(template.get("whyThisMatters", "")).strip()
    if why:
        record["whyThisMatters"] = why
    return record


def _merge_thinker(target: dict, source: dict) -> None:
    for key in ("concepts", "patterns", "relatedBooks", "works"):
        target[key] = _union_sorted(target.get(key), source.get(key))
    if not str(target.get("summary", "")).strip():
        target["summary"] = str(source.get("summary", "")).strip()
    if (
        not str(target.get("whyThisMatters", "")).strip()
        and str(source.get("whyThisMatters", "")).strip()
    ):
        target["whyThisMatters"] = str(source["whyThisMatters"]).strip()


def _load_overrides(repo: Path) -> dict[str, dict[str, dict]]:
    by_file: dict[str, dict[str, dict]] = {}
    for pattern in OVERRIDE_GLOBS:
        for path in sorted(repo.glob(f"semantic/{pattern}")):
            raw = _load_yaml(path)
            thinkers = raw.get("thinkers")
            if isinstance(thinkers, dict):
                by_file[str(path.relative_to(repo))] = {
                    str(k).strip(): v for k, v in thinkers.items() if isinstance(v, dict)
                }
    return by_file


def _apply_overrides(record: dict, override: dict | None) -> None:
    if not override:
        return
    for key in ("summary", "whyThisMatters", "type", "name"):
        if key in override and str(override[key]).strip():
            record[key] = str(override[key]).strip()


def build_split_plan(
    thinkers: dict[str, dict], overrides_by_file: dict[str, dict[str, dict]]
) -> tuple[dict[str, list[tuple[str, str]]], dict[str, dict]]:
    split_map: dict[str, list[tuple[str, str]]] = {}
    merged: dict[str, dict] = {}
    composite_slugs = set()

    for slug, data in sorted(thinkers.items()):
        if str(data.get("type", "person")).strip().lower() != "person":
            continue
        name = str(data.get("name", slug)).strip()
        if not _is_multi_person_thinker_name(name):
            continue
        authors = parse_author_list(name)
        if not authors:
            continue
        composite_slugs.add(slug)
        pairs = [(creator_slug_from_name(author), author) for author in authors]
        split_map[slug] = pairs

    all_overrides: dict[str, dict] = {}
    for thinkers_map in overrides_by_file.values():
        all_overrides.update(thinkers_map)

    for old_slug, pairs in split_map.items():
        composite = thinkers[old_slug]
        for author_slug, author_name in pairs:
            if author_slug not in merged:
                if author_slug in thinkers and author_slug not in composite_slugs:
                    merged[author_slug] = deepcopy(thinkers[author_slug])
                else:
                    merged[author_slug] = _blank_thinker(
                        author_slug, author_name, template=composite
                    )
            if author_slug not in thinkers or author_slug in composite_slugs:
                merged[author_slug]["name"] = author_name
            _merge_thinker(merged[author_slug], composite)
            _apply_overrides(merged[author_slug], all_overrides.get(old_slug))

    return split_map, merged


def _expand_creator_slugs(slugs: list, split_map: dict[str, list[tuple[str, str]]]) -> list[str]:
    out: list[str] = []
    for raw in slugs:
        slug = str(raw).strip()
        if not slug:
            continue
        if slug in split_map:
            out.extend(author_slug for author_slug, _ in split_map[slug])
        else:
            out.append(slug)
    return _union_sorted(out)


def apply_split(repo: Path, *, dry_run: bool) -> dict[str, int]:
    thinkers = load_entity_dir(repo, "thinkers")
    overrides_by_file = _load_overrides(repo)
    split_map, merged = build_split_plan(thinkers, overrides_by_file)
    stats = {
        "composite_removed": len(split_map),
        "thinkers_written": len(merged),
        "sources_updated": 0,
        "override_files_updated": 0,
    }

    if dry_run:
        print(f"Would split {len(split_map)} composite thinkers into {len(merged)} author entries")
        for old_slug, pairs in list(split_map.items())[:8]:
            print(f"  {old_slug} -> {[s for s, _ in pairs]}")
        return stats

    for slug, record in sorted(merged.items()):
        path = repo / THINKERS_DIR / f"{slug}.yml"
        _dump_yaml(path, record)

    for old_slug in split_map:
        path = repo / THINKERS_DIR / f"{old_slug}.yml"
        if path.is_file():
            path.unlink()

    for path in sorted((repo / SOURCES_DIR).glob("*.yml")):
        doc = _load_yaml(path)
        slugs = doc.get("creatorSlugs")
        if not isinstance(slugs, list):
            continue
        new_slugs = _expand_creator_slugs(slugs, split_map)
        if new_slugs == _union_sorted(slugs):
            continue
        doc["creatorSlugs"] = new_slugs
        doc["creatorNames"] = [
            str(merged[s]["name"]) if s in merged else s.replace("-", " ").title()
            for s in new_slugs
        ]
        _dump_yaml(path, doc)
        stats["sources_updated"] += 1

    for rel_path, _thinkers_map in overrides_by_file.items():
        path = repo / rel_path
        raw = _load_yaml(path)
        thinkers_section = raw.get("thinkers")
        if not isinstance(thinkers_section, dict):
            continue
        changed = False
        for old_slug, pairs in split_map.items():
            if old_slug not in thinkers_section:
                continue
            override = thinkers_section.pop(old_slug)
            for author_slug, _ in pairs:
                if author_slug not in thinkers_section:
                    thinkers_section[author_slug] = deepcopy(override)
            changed = True
        if changed:
            raw["thinkers"] = dict(sorted(thinkers_section.items()))
            _dump_yaml(path, raw)
            stats["override_files_updated"] += 1

    return stats


def sync_source_display_authors(repo: Path, *, dry_run: bool) -> int:
    """Align source name author portions with creatorNames after thinker splits."""
    updated = 0
    for path in sorted((repo / SOURCES_DIR).glob("*.yml")):
        doc = _load_yaml(path)
        name = str(doc.get("name", "")).strip()
        creator_names = doc.get("creatorNames")
        if not name or not isinstance(creator_names, list) or not creator_names:
            continue
        from source_metadata import normalize_display_name, split_display_name

        author, title = split_display_name(name)
        names = [str(n).strip() for n in creator_names if str(n).strip()]
        if not names:
            continue
        if len(names) == 1:
            new_author = names[0]
        elif len(names) == 2:
            new_author = f"{names[0]} and {names[1]}"
        else:
            new_author = ", ".join(names[:-1]) + f", and {names[-1]}"
        if author == new_author:
            continue
        new_name = normalize_display_name(new_author, title) if title else new_author
        if dry_run:
            print(f"would update {path.name}: {author!r} -> {new_author!r}")
        else:
            doc["name"] = new_name
            _dump_yaml(path, doc)
        updated += 1
    return updated


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument("--dry-run", action="store_true", help="Print plan only")
    parser.add_argument("--apply", action="store_true", help="Apply changes")
    parser.add_argument(
        "--sync-source-names",
        action="store_true",
        help="Align source name author portions with creatorNames (run after --apply)",
    )
    args = parser.parse_args()
    if not args.dry_run and not args.apply and not args.sync_source_names:
        parser.error("Specify --dry-run, --apply, or --sync-source-names")
    repo = Path(args.repo).resolve()
    if args.sync_source_names:
        count = sync_source_display_authors(repo, dry_run=args.dry_run)
        print(f"{'Would update' if args.dry_run else 'Updated'} {count} source display names")
        return
    stats = apply_split(repo, dry_run=args.dry_run)
    if not args.dry_run:
        print(
            f"Split complete: {stats['composite_removed']} composites removed, "
            f"{stats['thinkers_written']} thinkers written/updated, "
            f"{stats['sources_updated']} sources updated, "
            f"{stats['override_files_updated']} override files updated."
        )


if __name__ == "__main__":
    main()
