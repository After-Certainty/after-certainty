#!/usr/bin/env python3
"""
Create or refresh enrichment draft sidecars for a book-scoped semantic entity set.

Agents (or humans) edit drafts under ``semantic/_drafts/enrichment/``; canonical
YAML is updated only via ``promote_semantic_enrichment.py``.

Typical workflow::

    make propose-semantic-enrichment BOOK_DIR=books/coupling AGENT_TYPE=recognition-signals
    # edit semantic/_drafts/enrichment/coupling/recognition-signals/...
    make promote-semantic-enrichment BOOK_ID=coupling FIELD=recognitionSignals
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

from book_specs import load_any_book_spec  # noqa: E402
from semantic_enrichment import (  # noqa: E402
    AGENT_TO_FIELD,
    ENRICHMENT_AGENT_TYPES,
    book_id_from_spec,
    draft_path,
    field_has_content,
    list_book_entities,
    write_draft,
)


def _scaffold_record(
    *,
    entity_type: str,
    slug: str,
    field: str,
    agent_type: str,
    book_id: str,
) -> dict:
    items: list | dict
    if field == "trajectory":
        items = {
            phase: []
            for phase in (
                "earlySignals",
                "intensificationSignals",
                "failureModes",
                "restorationPaths",
            )
        }
    elif field == "manifestations":
        items = {}
    else:
        items = []
    return {
        "targetSlug": slug,
        "entityType": entity_type,
        "field": field,
        "proposedBy": agent_type,
        "bookId": book_id,
        "sourceExcerpt": "",
        "items": items,
    }


def propose(
    repo: Path,
    *,
    book_dir: Path,
    agent_type: str,
    only_missing: bool,
    overwrite: bool,
    dry_run: bool,
) -> int:
    if agent_type == "all":
        exit_code = 0
        for single in sorted(ENRICHMENT_AGENT_TYPES):
            code = propose(
                repo,
                book_dir=book_dir,
                agent_type=single,
                only_missing=only_missing,
                overwrite=overwrite,
                dry_run=dry_run,
            )
            if code != 0:
                exit_code = code
        return exit_code

    if agent_type not in ENRICHMENT_AGENT_TYPES:
        print(
            f"Error: unknown agent-type {agent_type!r}; expected one of: "
            f"all, {', '.join(sorted(ENRICHMENT_AGENT_TYPES))}",
            file=sys.stderr,
        )
        return 2

    field = AGENT_TO_FIELD[agent_type]
    spec_path = (book_dir / "book.yml").resolve()
    if not spec_path.is_file():
        print(f"Error: missing book spec: {spec_path}", file=sys.stderr)
        return 2

    book_id = book_id_from_spec(load_any_book_spec(spec_path))
    entities = list_book_entities(repo, book_id)
    if not entities:
        print(
            f"No glossary/pattern/situation entities in scope for book {book_id!r}", file=sys.stderr
        )
        return 1

    created = 0
    skipped = 0
    for entity_type, slug, canonical_path in entities:
        canonical = yaml.safe_load(canonical_path.read_text(encoding="utf-8"))
        if not isinstance(canonical, dict):
            continue
        if only_missing and field_has_content(canonical, field):
            skipped += 1
            continue

        out_path = draft_path(
            repo,
            book_id=book_id,
            agent_type=agent_type,
            entity_type=entity_type,
            slug=slug,
        )
        if out_path.is_file() and not overwrite:
            skipped += 1
            continue

        record = _scaffold_record(
            entity_type=entity_type,
            slug=slug,
            field=field,
            agent_type=agent_type,
            book_id=book_id,
        )
        write_draft(out_path, record, dry_run=dry_run)
        action = "would write" if dry_run else "wrote"
        print(f"{action} {out_path.relative_to(repo)}")
        created += 1

    print(
        f"Propose complete: book={book_id} agent={agent_type} field={field} "
        f"created={created} skipped={skipped}",
        file=sys.stderr,
    )
    return 0 if created or skipped else 1


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument(
        "--book-dir",
        required=True,
        help="Book directory containing book.yml (e.g. books/coupling)",
    )
    parser.add_argument(
        "--agent-type",
        required=True,
        choices=["all", *sorted(ENRICHMENT_AGENT_TYPES)],
        help="Enrichment type (maps to a canonical field), or all five fields",
    )
    parser.add_argument(
        "--all-entities",
        action="store_true",
        help="Scaffold even when canonical field already has content (default: skip those)",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Replace existing draft files",
    )
    parser.add_argument("--dry-run", action="store_true", help="Print actions only")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    book_dir = (repo / args.book_dir).resolve()
    only_missing = not args.all_entities
    sys.exit(
        propose(
            repo,
            book_dir=book_dir,
            agent_type=args.agent_type,
            only_missing=only_missing,
            overwrite=args.overwrite,
            dry_run=args.dry_run,
        )
    )


if __name__ == "__main__":
    main()
