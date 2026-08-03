#!/usr/bin/env python3
"""
Derive draft thinker YAML from enriched semantic sources grouped by creatorSlugs.

Writes reviewable drafts under semantic/_drafts/generated/thinkers/*.yml for promotion
into semantic/thinkers/ after human edit.

Typical workflow::

    python3 tools/backfill_source_metadata.py --repo .   # if not already enriched
    python3 tools/derive_thinker_drafts.py --repo . --dry-run
    # edit drafts, then copy approved rows to semantic/thinkers/
    make verify-semantic-ontology
"""

from __future__ import annotations

import argparse
import sys
from collections import defaultdict
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

_TOOLS_DIR = Path(__file__).resolve().parent
if str(_TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(_TOOLS_DIR))

from generate_semantic_manifest import _load_dir_yml  # noqa: E402
from source_metadata import (  # noqa: E402
    creator_slug_from_name,
    split_display_name,
    strip_markdown_italics,
)

SEMANTIC_ROOT = Path("semantic")
DEFAULT_DRAFT_DIR = Path("semantic/_drafts/generated/thinkers")

ORGANIZATION_SOURCE_KINDS = frozenset({"institutional_document", "report", "standard"})


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


def _creator_keys(data: dict) -> list[str]:
    slugs = data.get("creatorSlugs")
    if isinstance(slugs, list):
        keys = [str(s).strip() for s in slugs if str(s).strip()]
        if keys:
            return keys
    names = data.get("creatorNames")
    if isinstance(names, list):
        keys = [creator_slug_from_name(str(n)) for n in names if str(n).strip()]
        if keys:
            return keys
    author, _ = split_display_name(str(data.get("name", "")).strip())
    if author:
        return [creator_slug_from_name(author)]
    return []


def _thinker_type_for_group(rows: list[dict]) -> str:
    kinds = {str(r.get("sourceKind", "")).strip() for r in rows}
    if kinds & ORGANIZATION_SOURCE_KINDS:
        return "organization"
    return "person"


def _thinker_name(rows: list[dict], slug: str) -> str:
    for row in rows:
        names = row.get("creatorNames")
        if isinstance(names, list):
            for name in names:
                if creator_slug_from_name(str(name)) == slug:
                    return strip_markdown_italics(str(name).strip())
        author, _ = split_display_name(str(row.get("name", "")).strip())
        if author and creator_slug_from_name(author) == slug:
            return strip_markdown_italics(author)
    return slug.replace("-", " ").title()


def derive_thinker_records(sources: dict[str, dict]) -> dict[str, dict]:
    by_slug: dict[str, list[dict]] = defaultdict(list)
    for slug, data in sources.items():
        for key in _creator_keys(data):
            by_slug[key].append({**data, "slug": slug})

    out: dict[str, dict] = {}
    for thinker_slug, rows in sorted(by_slug.items()):
        if len(rows) < 1:
            continue
        works = sorted({str(r["slug"]) for r in rows})
        concepts = _union_sorted(*(r.get("concepts") for r in rows))
        patterns = _union_sorted(*(r.get("patterns") for r in rows))
        related_books = _union_sorted(*(r.get("relatedBooks") for r in rows))
        name = _thinker_name(rows, thinker_slug)
        out[thinker_slug] = {
            "slug": thinker_slug,
            "name": name,
            "type": _thinker_type_for_group(rows),
            "summary": f"Thinker draft aggregated from {len(works)} source(s); edit before promotion.",
            "concepts": concepts,
            "patterns": patterns,
            "relatedBooks": related_books,
            "works": works,
        }
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument(
        "--draft-dir",
        default=str(DEFAULT_DRAFT_DIR),
        help="Output directory for derived thinker drafts",
    )
    parser.add_argument("--dry-run", action="store_true", help="Print summary only")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    sources = _load_dir_yml(repo / SEMANTIC_ROOT / "sources")
    thinkers = derive_thinker_records(sources)
    if not thinkers:
        print("No thinker groups derived (add creatorSlugs to sources first).", file=sys.stderr)
        sys.exit(1)

    draft_dir = (repo / args.draft_dir).resolve()
    if args.dry_run:
        for slug in sorted(thinkers):
            rec = thinkers[slug]
            print(f"would write {slug}.yml ({len(rec['works'])} works)")
        print(f"Dry run: {len(thinkers)} thinker draft(s).", file=sys.stderr)
        return

    draft_dir.mkdir(parents=True, exist_ok=True)
    for slug in sorted(thinkers):
        yml = (
            yaml.safe_dump(
                thinkers[slug],
                allow_unicode=True,
                default_flow_style=False,
                sort_keys=False,
            ).rstrip()
            + "\n"
        )
        (draft_dir / f"{slug}.yml").write_text(yml, encoding="utf-8")
    print(f"Wrote {len(thinkers)} thinker draft(s) under {draft_dir}/", file=sys.stderr)


if __name__ == "__main__":
    main()
