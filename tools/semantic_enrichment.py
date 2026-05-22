"""
Shared helpers for semantic enrichment drafts (issue #116 Phase 2).

Drafts live under ``semantic/_drafts/enrichment/<book-id>/<agent-type>/`` and are
gitignored. Agents or humans fill sidecar YAML; ``promote_semantic_enrichment.py``
merges approved fields into canonical ``semantic/{glossary,patterns,situations}/``.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

ENRICHMENT_ROOT = Path("semantic/_drafts/enrichment")

AGENT_TYPES = frozenset(
    {
        "recognition-signals",
        "trajectories",
        "manifestations",
        "counterbalances",
        "questions",
    }
)

AGENT_TO_FIELD: dict[str, str] = {
    "recognition-signals": "recognitionSignals",
    "trajectories": "trajectory",
    "manifestations": "manifestations",
    "counterbalances": "counterbalances",
    "questions": "questions",
}

ENTITY_TYPE_TO_DIR: dict[str, Path] = {
    "glossary": Path("semantic/glossary"),
    "pattern": Path("semantic/patterns"),
    "situation": Path("semantic/situations"),
}

TRAJECTORY_PHASES = (
    "earlySignals",
    "intensificationSignals",
    "failureModes",
    "restorationPaths",
)


def book_id_from_spec(spec: dict) -> str:
    book = spec.get("book")
    if isinstance(book, dict):
        bid = str(book.get("id", "")).strip()
        if bid:
            return bid
    upcoming = spec.get("upcoming")
    if isinstance(upcoming, dict):
        bid = str(upcoming.get("id", "")).strip()
        if bid:
            return bid
    raise ValueError("book spec missing book.id or upcoming.id")


def _book_slug_set(items: object) -> set[str]:
    out: set[str] = set()
    if not isinstance(items, list):
        return out
    for x in items:
        s = str(x).strip()
        if s.startswith("book-"):
            s = s.removeprefix("book-")
        if s:
            out.add(s)
    return out


def entity_in_book(data: dict, book_id: str) -> bool:
    books = _book_slug_set(data.get("relatedBooks"))
    return not books or book_id in books


def _load_yml_dir(directory: Path) -> dict[str, dict]:
    out: dict[str, dict] = {}
    if not directory.is_dir():
        return out
    for path in sorted(directory.glob("*.yml")):
        raw = yaml.safe_load(path.read_text(encoding="utf-8"))
        if isinstance(raw, dict):
            slug = str(raw.get("slug", path.stem)).strip() or path.stem
            out[slug] = raw
    return out


def list_book_entities(repo: Path, book_id: str) -> list[tuple[str, str, Path]]:
    """Return (entity_type, slug, canonical_path) for glossary/pattern/situation in book scope."""
    rows: list[tuple[str, str, Path]] = []
    for entity_type, rel_dir in ENTITY_TYPE_TO_DIR.items():
        root = (repo / rel_dir).resolve()
        for slug, data in _load_yml_dir(root).items():
            if entity_in_book(data, book_id):
                rows.append((entity_type, slug, root / f"{slug}.yml"))
    return sorted(rows)


def draft_path(
    repo: Path,
    *,
    book_id: str,
    agent_type: str,
    entity_type: str,
    slug: str,
) -> Path:
    return (
        repo
        / ENRICHMENT_ROOT
        / book_id
        / agent_type
        / entity_type
        / f"{slug}.yml"
    ).resolve()


def _merge_string_lists(existing: object, proposed: object) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()
    for src in (existing, proposed):
        if not isinstance(src, list):
            continue
        for x in src:
            s = str(x).strip()
            if not s or s in seen:
                continue
            seen.add(s)
            out.append(s)
    return out


def _merge_trajectory(existing: object, proposed: object) -> dict[str, list[str]]:
    out: dict[str, list[str]] = {}
    for phase in TRAJECTORY_PHASES:
        merged = _merge_string_lists(
            existing.get(phase) if isinstance(existing, dict) else None,
            proposed.get(phase) if isinstance(proposed, dict) else None,
        )
        if merged:
            out[phase] = merged
    return out


def _merge_manifestations(existing: object, proposed: object) -> dict[str, list[str]]:
    out: dict[str, list[str]] = {}
    domains: set[str] = set()
    if isinstance(existing, dict):
        domains.update(str(k) for k in existing)
    if isinstance(proposed, dict):
        domains.update(str(k) for k in proposed)
    for domain in sorted(domains):
        merged = _merge_string_lists(
            existing.get(domain) if isinstance(existing, dict) else None,
            proposed.get(domain) if isinstance(proposed, dict) else None,
        )
        if merged:
            out[domain] = merged
    return out


def merge_field_value(field: str, existing: object, proposed: object) -> Any:
    if field in ("recognitionSignals", "questions", "counterbalances"):
        merged = _merge_string_lists(existing, proposed)
        return merged or None
    if field == "trajectory":
        merged = _merge_trajectory(existing, proposed)
        return merged or None
    if field == "manifestations":
        merged = _merge_manifestations(existing, proposed)
        return merged or None
    return None


def field_has_content(data: dict, field: str) -> bool:
    val = data.get(field)
    if field in ("recognitionSignals", "questions", "counterbalances"):
        return isinstance(val, list) and any(str(x).strip() for x in val)
    if field == "trajectory" and isinstance(val, dict):
        return any(
            isinstance(val.get(phase), list) and any(str(x).strip() for x in val[phase])
            for phase in TRAJECTORY_PHASES
        )
    if field == "manifestations" and isinstance(val, dict):
        return any(
            isinstance(examples, list) and any(str(x).strip() for x in examples)
            for examples in val.values()
        )
    return False


def proposed_items_from_draft(draft: dict) -> Any:
    """Normalize draft body to the value merged into canonical YAML."""
    field = str(draft.get("field", "")).strip()
    items = draft.get("items")
    if field in ("recognitionSignals", "questions", "counterbalances"):
        if isinstance(items, list):
            return [_s for _s in (str(x).strip() for x in items) if _s]
        return []
    if field == "trajectory" and isinstance(items, dict):
        return {
            phase: [_s for _s in (str(x).strip() for x in items.get(phase, [])) if _s]
            for phase in TRAJECTORY_PHASES
            if isinstance(items.get(phase), list)
        }
    if field == "manifestations" and isinstance(items, dict):
        out: dict[str, list[str]] = {}
        for domain, examples in items.items():
            if not isinstance(examples, list):
                continue
            vals = [str(x).strip() for x in examples if str(x).strip()]
            if vals:
                out[str(domain)] = vals
        return out
    return None


def validate_draft_record(raw: dict, *, expected_field: str | None = None) -> None:
    slug = str(raw.get("targetSlug", "")).strip()
    entity_type = str(raw.get("entityType", "")).strip()
    field = str(raw.get("field", "")).strip()
    proposed_by = str(raw.get("proposedBy", "")).strip()
    if not slug:
        raise ValueError("draft missing targetSlug")
    if entity_type not in ENTITY_TYPE_TO_DIR:
        raise ValueError(f"invalid entityType: {entity_type!r}")
    if field not in AGENT_TO_FIELD.values():
        raise ValueError(f"invalid field: {field!r}")
    if expected_field and field != expected_field:
        raise ValueError(f"draft field {field!r} does not match {expected_field!r}")
    if proposed_by and proposed_by not in AGENT_TYPES:
        raise ValueError(f"invalid proposedBy: {proposed_by!r}")
    if "items" not in raw:
        raise ValueError("draft missing items")


def apply_draft_to_canonical(canonical: dict, draft: dict) -> dict:
    field = str(draft.get("field", "")).strip()
    proposed = proposed_items_from_draft(draft)
    if proposed is None:
        raise ValueError(f"could not parse items for field {field!r}")
    out = dict(canonical)
    merged = merge_field_value(field, out.get(field), proposed)
    if merged:
        out[field] = merged
    elif field in out:
        del out[field]
    return out


def write_draft(path: Path, record: dict, *, dry_run: bool) -> None:
    if dry_run:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    body = (
        yaml.safe_dump(record, allow_unicode=True, default_flow_style=False, sort_keys=False).rstrip()
        + "\n"
    )
    path.write_text(body, encoding="utf-8")


def write_canonical(path: Path, record: dict, *, dry_run: bool) -> None:
    if dry_run:
        return
    body = (
        yaml.safe_dump(record, allow_unicode=True, default_flow_style=False, sort_keys=False).rstrip()
        + "\n"
    )
    path.write_text(body, encoding="utf-8")
