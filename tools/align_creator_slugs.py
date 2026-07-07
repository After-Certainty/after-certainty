#!/usr/bin/env python3
"""
Align source creatorSlugs with canonical thinker slugs.

Pass 2 workflow:
1. Apply curated remaps to existing thinkers (update sources).
2. Create minimal thinker YAML for any remaining unmatched creatorSlugs.

Usage::

    python3 tools/align_creator_slugs.py --repo . --dry-run
    python3 tools/align_creator_slugs.py --repo . --apply
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


SEMANTIC = Path("semantic")

# Map bad creatorSlug -> existing thinker slug(s)
REMAP_TO_EXISTING: dict[str, list[str]] = {
    "ross-lee-and-richard-e-nisbett": ["ross-lee-and-richard-nisbett"],
    "lee-ross": ["ross-lee-and-richard-nisbett"],
    "national-aeronautics-and-space-administration-aviation-safety-reporting-system-asrs-program-materials": [
        "federal-aviation-administration-and-nasa"
    ],
    "yellen-janet-l-speeches-on-inflation-labor-markets-and-financial-stability-board-of-governors-of-the-federal-reserve-system-and-u-s-department-of-the-treasury-2021-2024": [
        "board-of-governors-of-the-federal-reserve-system"
    ],
    "u-s-bureau-of-labor-statistics-consumer-price-index-cpi-news-releases-and-databases-2020-2024-https-www-bls-gov-cpi": [
        "u-s-bureau-of-labor-statistics"
    ],
    "u-s-bureau-of-labor-statistics-employment-situation-news-releases-job-openings-and-labor-turnover-survey-jolts-2020-2024-https-www-bls-gov": [
        "u-s-bureau-of-labor-statistics"
    ],
    "u-s-census-bureau-housing-statistics-and-american-community-survey-materials-on-regional-cost-pressures-2020-2024-https-www-census-gov": [
        "u-s-census-bureau"
    ],
    "u-s-securities-and-exchange-commission-office-of-the-whistleblower-annual-reports-to-congress-https-www-sec-gov-whistleblower": [
        "u-s-securities-and-exchange-commission"
    ],
    "centers-for-medicare-medicaid-services-hospital-readmissions": [
        "centers-for-medicare-medicaid-services"
    ],
}

ORGANIZATION_SLUGS = frozenset(
    {
        "u-s-bureau-of-labor-statistics",
        "u-s-census-bureau",
        "u-s-securities-and-exchange-commission",
        "centers-for-medicare-medicaid-services",
        "freeh-sporkin-sullivan-llc",
        "national-aeronautics-and-space-administration",
    }
)

ORGANIZATION_SOURCE_KINDS = frozenset(
    {"institutional_document", "report", "standard", "dataset", "website"}
)


def _load_yaml(path: Path) -> dict:
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    return raw if isinstance(raw, dict) else {}


def _dump_yaml(path: Path, data: dict) -> None:
    path.write_text(yaml.safe_dump(data, sort_keys=False, allow_unicode=False), encoding="utf-8")


def _thinker_slugs(repo: Path) -> set[str]:
    slugs: set[str] = set()
    thinkers_dir = repo / SEMANTIC / "thinkers"
    if thinkers_dir.is_dir():
        for path in thinkers_dir.glob("*.yml"):
            doc = _load_yaml(path)
            slugs.add(str(doc.get("slug", path.stem)).strip())
    return slugs


def _infer_thinker_type(creator_slug: str, source: dict) -> str:
    if creator_slug in ORGANIZATION_SLUGS:
        return "organization"
    kind = str(source.get("sourceKind", "")).strip().lower()
    if kind in {"institutional_document", "report", "standard", "website"}:
        return "organization"
    name = ""
    names = source.get("creatorNames")
    if isinstance(names, list) and names:
        name = str(names[0])
    lower = f"{name} {creator_slug}".lower()
    if any(
        token in lower
        for token in (
            "llc",
            "commission",
            "administration",
            "bureau",
            "services",
            "nasa",
            "sec ",
            "exchange commission",
        )
    ):
        return "organization"
    return "person"


def _creator_name_for_slug(source: dict, bad_slug: str) -> str:
    names = source.get("creatorNames")
    slugs = source.get("creatorSlugs")
    if isinstance(names, list) and isinstance(slugs, list):
        for name, slug in zip(names, slugs, strict=False):
            if str(slug).strip() == bad_slug:
                return str(name).strip()
    if isinstance(names, list) and names:
        return str(names[0]).strip()
    return bad_slug.replace("-", " ").title()


def find_mismatches(repo: Path) -> list[tuple[Path, str, dict]]:
    thinkers = _thinker_slugs(repo)
    out: list[tuple[Path, str, dict]] = []
    for path in sorted((repo / SEMANTIC / "sources").glob("*.yml")):
        doc = _load_yaml(path)
        for raw in doc.get("creatorSlugs") or []:
            slug = str(raw).strip()
            if slug and slug not in thinkers:
                out.append((path, slug, doc))
    return out


def apply_remaps(repo: Path, *, apply: bool) -> list[str]:
    thinkers = _thinker_slugs(repo)
    actions: list[str] = []
    for path in sorted((repo / SEMANTIC / "sources").glob("*.yml")):
        doc = _load_yaml(path)
        slugs = doc.get("creatorSlugs")
        if not isinstance(slugs, list):
            continue
        changed = False
        new_slugs: list[str] = []
        for raw in slugs:
            slug = str(raw).strip()
            targets = REMAP_TO_EXISTING.get(slug)
            if targets and all(t in thinkers for t in targets):
                new_slugs.extend(targets)
                changed = True
                actions.append(f"remap {path.name}: {slug} -> {targets}")
            else:
                new_slugs.append(slug)
        if changed:
            seen: set[str] = set()
            deduped: list[str] = []
            for s in new_slugs:
                if s and s not in seen:
                    seen.add(s)
                    deduped.append(s)
            doc["creatorSlugs"] = deduped
            if apply:
                _dump_yaml(path, doc)
    return actions


def _remap_created_thinker_slug(repo: Path, old_slug: str, new_slug: str, *, apply: bool) -> None:
    """Point sources at the resolved thinker slug when collision suffix was added."""
    for path in (repo / SEMANTIC / "sources").glob("*.yml"):
        doc = _load_yaml(path)
        slugs = doc.get("creatorSlugs")
        if not isinstance(slugs, list):
            continue
        updated = [new_slug if str(s).strip() == old_slug else str(s).strip() for s in slugs]
        if updated != slugs:
            doc["creatorSlugs"] = updated
            if apply:
                _dump_yaml(path, doc)


def _unique_thinker_slug(repo: Path, slug: str) -> str:
    sources = {p.stem for p in (repo / SEMANTIC / "sources").glob("*.yml")}
    if slug not in sources:
        return slug
    candidate = f"{slug}-group"
    if candidate not in sources:
        return candidate
    n = 2
    while f"{slug}-group-{n}" in sources:
        n += 1
    return f"{slug}-group-{n}"


def create_missing_thinkers(repo: Path, *, apply: bool) -> list[str]:
    thinkers = _thinker_slugs(repo)
    by_slug: dict[str, list[tuple[Path, dict]]] = defaultdict(list)
    for path, slug, doc in find_mismatches(repo):
        if slug in REMAP_TO_EXISTING:
            continue
        by_slug[slug].append((path, doc))

    actions: list[str] = []
    thinkers_dir = repo / SEMANTIC / "thinkers"
    for raw_slug in sorted(by_slug):
        slug = _unique_thinker_slug(repo, raw_slug)
        if slug in thinkers:
            continue
        rows = by_slug[raw_slug]
        sample_path, sample = rows[0]
        name = _creator_name_for_slug(sample, raw_slug)
        thinker_type = _infer_thinker_type(slug, sample)
        works = sorted({path.stem for path, _ in rows})
        related_books: set[str] = set()
        for _, doc in rows:
            for book in doc.get("relatedBooks") or []:
                b = str(book).strip()
                if b:
                    related_books.add(b)

        thinker = {
            "slug": slug,
            "name": name,
            "type": thinker_type,
            "summary": f"{'Institutional' if thinker_type == 'organization' else 'Scholarly'} "
            f"source aggregated from {len(works)} work(s); edit summary before promotion.",
            "concepts": [],
            "patterns": [],
            "relatedBooks": sorted(related_books),
            "works": works,
        }
        if thinker_type == "person":
            thinker["whyThisMatters"] = (
                "Canonical thinker entry for source grouping; refine summary and concepts as needed."
            )

        out_path = thinkers_dir / f"{slug}.yml"
        actions.append(f"create thinker {slug} ({thinker_type}) from {len(works)} source(s)")
        if apply:
            thinkers_dir.mkdir(parents=True, exist_ok=True)
            _dump_yaml(out_path, thinker)
            thinkers.add(slug)
            if slug != raw_slug:
                _remap_created_thinker_slug(repo, raw_slug, slug, apply=True)
    return actions


def augment_thinker_works(repo: Path, *, apply: bool) -> list[str]:
    """Add remapped sources to existing thinkers' works lists."""
    actions: list[str] = []
    additions: dict[str, set[str]] = defaultdict(set)
    additions["ross-lee-and-richard-nisbett"].update(
        {
            "ross-lee-the-intuitive-psychologist-and-his-shortcomings",
        }
    )
    for thinker_slug, work_slugs in additions.items():
        path = repo / SEMANTIC / "thinkers" / f"{thinker_slug}.yml"
        if not path.is_file():
            continue
        doc = _load_yaml(path)
        works = [str(w).strip() for w in doc.get("works") or [] if str(w).strip()]
        merged = sorted(set(works) | work_slugs)
        if merged != works:
            doc["works"] = merged
            actions.append(f"extend works for {thinker_slug}: +{sorted(set(merged) - set(works))}")
            if apply:
                _dump_yaml(path, doc)
    return actions


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument("--apply", action="store_true", help="Write YAML changes")
    parser.add_argument("--dry-run", action="store_true", help="Print planned actions only")
    args = parser.parse_args()
    repo = Path(args.repo).resolve()
    apply = args.apply and not args.dry_run

    remap_actions = apply_remaps(repo, apply=apply)
    create_actions = create_missing_thinkers(repo, apply=apply)
    work_actions = augment_thinker_works(repo, apply=apply)

    remaining = find_mismatches(repo)
    print(f"Remaps: {len(remap_actions)}")
    for line in remap_actions:
        print(f"  {line}")
    print(f"New thinkers: {len(create_actions)}")
    for line in create_actions:
        print(f"  {line}")
    print(f"Work extensions: {len(work_actions)}")
    for line in work_actions:
        print(f"  {line}")
    print(f"Remaining mismatches: {len(remaining)}")
    if remaining:
        for path, slug, _ in remaining[:10]:
            print(f"  {path.name}: {slug}")
        if len(remaining) > 10:
            print(f"  ... and {len(remaining) - 10} more")


if __name__ == "__main__":
    main()
