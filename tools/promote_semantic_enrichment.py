#!/usr/bin/env python3
"""
Merge approved enrichment drafts into canonical semantic YAML.

Reads sidecars under ``semantic/_drafts/enrichment/<book-id>/<agent-type>/`` and
merges ``items`` into the matching glossary/pattern/situation file (union merge).

Typical workflow::

    make propose-semantic-enrichment BOOK_DIR=books/coupling AGENT_TYPE=trajectories
    # edit drafts, then:
    make promote-semantic-enrichment BOOK_ID=coupling
    make verify-semantic-ontology
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

_TOOLS_DIR = Path(__file__).resolve().parent
if str(_TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(_TOOLS_DIR))

from semantic_enrichment import (  # noqa: E402
    AGENT_TO_FIELD,
    ENRICHMENT_ROOT,
    ENTITY_TYPE_TO_DIR,
    apply_draft_to_canonical,
    validate_draft_record,
    write_canonical,
)


def _iter_draft_files(
    enrichment_root: Path,
    *,
    book_ids: list[str],
    fields: list[str],
) -> list[Path]:
    if not enrichment_root.is_dir():
        return []
    book_dirs = (
        [enrichment_root / bid for bid in book_ids]
        if book_ids
        else sorted(p for p in enrichment_root.iterdir() if p.is_dir())
    )
    paths: list[Path] = []
    for book_dir in book_dirs:
        if not book_dir.is_dir():
            continue
        for agent_dir in sorted(book_dir.iterdir()):
            if not agent_dir.is_dir():
                continue
            agent_type = agent_dir.name
            expected_field = AGENT_TO_FIELD.get(agent_type)
            if fields and expected_field and expected_field not in fields:
                continue
            for path in sorted(agent_dir.rglob("*.yml")):
                paths.append(path)
    return paths


def promote(
    repo: Path,
    *,
    book_ids: list[str],
    fields: list[str],
    dry_run: bool,
) -> int:
    enrichment_root = (repo / ENRICHMENT_ROOT).resolve()
    draft_files = _iter_draft_files(enrichment_root, book_ids=book_ids, fields=fields)
    if not draft_files:
        print(f"No enrichment drafts under {enrichment_root}", file=sys.stderr)
        return 1

    promoted = 0
    for draft_path in draft_files:
        raw = yaml.safe_load(draft_path.read_text(encoding="utf-8"))
        if not isinstance(raw, dict):
            print(f"Warning: skipping non-mapping draft {draft_path}", file=sys.stderr)
            continue

        agent_type = draft_path.parent.parent.name
        expected_field = AGENT_TO_FIELD.get(agent_type)
        try:
            validate_draft_record(raw, expected_field=expected_field)
        except ValueError as exc:
            print(f"Error: {draft_path}: {exc}", file=sys.stderr)
            return 2

        entity_type = str(raw["entityType"])
        slug = str(raw["targetSlug"])
        rel_dir = ENTITY_TYPE_TO_DIR.get(entity_type)
        if not rel_dir:
            print(f"Error: unknown entityType in {draft_path}", file=sys.stderr)
            return 2
        canonical_path = (repo / rel_dir / f"{slug}.yml").resolve()

        if not canonical_path.is_file():
            print(f"Error: canonical entity missing: {canonical_path}", file=sys.stderr)
            return 2

        canonical = yaml.safe_load(canonical_path.read_text(encoding="utf-8"))
        if not isinstance(canonical, dict):
            print(f"Error: invalid canonical YAML: {canonical_path}", file=sys.stderr)
            return 2

        items = raw.get("items")
        if not items or items == [] or items == {}:
            print(f"Skipping empty draft: {draft_path.relative_to(repo)}", file=sys.stderr)
            continue

        merged = apply_draft_to_canonical(canonical, raw)
        write_canonical(canonical_path, merged, dry_run=dry_run)
        action = "would promote" if dry_run else "promoted"
        print(f"{action} {draft_path.relative_to(repo)} -> {canonical_path.relative_to(repo)}")
        promoted += 1

    print(f"Promote complete: {promoted} file(s)", file=sys.stderr)
    return 0 if promoted else 1


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument(
        "--book-id",
        action="append",
        default=[],
        metavar="ID",
        help="Limit to drafts under enrichment/<book-id>/ (repeatable)",
    )
    parser.add_argument(
        "--field",
        action="append",
        default=[],
        metavar="NAME",
        help="Limit to drafts for this canonical field (e.g. recognitionSignals)",
    )
    parser.add_argument("--dry-run", action="store_true", help="Print actions only")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    sys.exit(
        promote(
            repo,
            book_ids=args.book_id,
            fields=args.field,
            dry_run=args.dry_run,
        )
    )


if __name__ == "__main__":
    main()
