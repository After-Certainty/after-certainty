#!/usr/bin/env python3
"""Validate discovery YAML (questions, trails, shelves, change-events, search aliases)
and work/edition invariants on book specs.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

try:
    import jsonschema
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit(
        "PyYAML and jsonschema are required. Install with: python3 -m pip install pyyaml jsonschema"
    ) from exc

from book_specs import discover_book_spec_paths, load_book_spec
from discovery_manifest import (
    CONTENT_TYPES,
    EDITION_RELATIONSHIPS,
    LITERARY_FORMS,
    WORK_RELATIONSHIP_TYPES,
    default_work_slug,
    work_id_for_slug,
)

SEMANTIC = Path("semantic")
SCHEMA_DIR = Path("schema") / "semantic"

DIR_SCHEMA = {
    "questions": "question-entry.schema.json",
    "trails": "trail-entry.schema.json",
    "shelves": "shelf-entry.schema.json",
    "change-events": "change-event-entry.schema.json",
}


def _load_yaml(path: Path) -> object:
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def _schema_store(repo: Path) -> dict[str, object]:
    store: dict[str, object] = {}
    for path in sorted((repo / SCHEMA_DIR).glob("*.json")):
        doc = json.loads(path.read_text(encoding="utf-8"))
        sid = str(doc.get("$id", "")).strip()
        if sid:
            store[sid] = doc
        store[path.name] = doc
        store[path.resolve().as_uri()] = doc
    return store


def _validator(schema: dict, store: dict[str, object]) -> jsonschema.protocols.Validator:
    resolver = jsonschema.RefResolver.from_schema(schema, store=store)
    return jsonschema.Draft202012Validator(schema, resolver=resolver)


def _collect_chapter_ids(repo: Path) -> tuple[set[str], set[str]]:
    """Return (all chapter ids, public chapter ids) from manuscript structure."""
    from manuscript_structure import build_structure_for_book, load_chapter_enrichment

    all_ids: set[str] = set()
    public_ids: set[str] = set()
    for spec_path in discover_book_spec_paths(repo):
        book_dir = spec_path.parent
        if not (book_dir / "index.md").is_file():
            continue
        try:
            spec = load_book_spec(spec_path)
        except (OSError, ValueError):
            continue
        book = spec.get("book") if isinstance(spec, dict) else None
        if not isinstance(book, dict):
            continue
        slug = str(book.get("id") or "").strip()
        if not slug:
            continue
        edition_id = f"book-{slug}"
        work_id = str(book.get("work_id") or f"work-{slug}").strip() or f"work-{slug}"
        book_kind = str(book.get("kind") or "prose").strip() or "prose"
        try:
            _parts, chapters = build_structure_for_book(
                book_dir,
                edition_slug=slug,
                work_id=work_id,
                edition_id=edition_id,
                public=True,
                enrichment=load_chapter_enrichment(book_dir),
                book_kind=book_kind,
            )
        except (OSError, ValueError, FileNotFoundError):
            continue
        for chapter in chapters:
            cid = str(chapter.get("id") or "").strip()
            if not cid:
                continue
            all_ids.add(cid)
            if chapter.get("public"):
                public_ids.add(cid)
    return all_ids, public_ids


def _collect_entity_ids(repo: Path) -> dict[str, set[str]]:
    from book_specs import discover_upcoming_spec_paths, load_upcoming_spec

    books: set[str] = set()
    book_slugs: set[str] = set()
    for spec_path in discover_book_spec_paths(repo):
        spec = load_book_spec(spec_path)
        bid = str(spec.get("book", {}).get("id", "")).strip()
        if bid:
            books.add(f"book-{bid}")
            book_slugs.add(bid)
            for alias in spec.get("book", {}).get("slug_aliases") or []:
                a = str(alias).strip()
                if a:
                    book_slugs.add(a)
    for spec_path in discover_upcoming_spec_paths(repo):
        spec = load_upcoming_spec(spec_path)
        bid = str(spec.get("book", {}).get("id", "")).strip()
        if bid:
            books.add(f"book-{bid}")
            book_slugs.add(bid)

    def slugs(subdir: str, prefix: str) -> set[str]:
        out: set[str] = set()
        root = repo / SEMANTIC / subdir
        if not root.is_dir():
            return out
        for path in root.glob("*.yml"):
            doc = _load_yaml(path)
            if isinstance(doc, dict):
                s = str(doc.get("slug", path.stem)).strip()
                if s:
                    out.add(f"{prefix}{s}")
        return out

    chapter_ids, chapter_public_ids = _collect_chapter_ids(repo)

    return {
        "book": books,
        "book_slugs": book_slugs,
        "chapter": chapter_ids,
        "chapter_public": chapter_public_ids,
        "concept": slugs("glossary", "concept-"),
        "pattern": slugs("patterns", "pattern-"),
        "situation": slugs("situations", "situation-"),
        "source": slugs("sources", "source-"),
        "thinker": slugs("thinkers", "thinker-"),
    }


def _is_known_target(target_id: str, ids: dict[str, set[str]]) -> bool:
    if target_id.startswith("podcast:"):
        return True
    for key in ("book", "concept", "pattern", "situation", "source", "thinker"):
        if target_id in ids[key]:
            return True
    return False


def validate_work_edition_invariants(repo: Path, errors: list[str], warnings: list[str]) -> None:
    by_work: dict[str, list[tuple[str, dict]]] = defaultdict(list)
    known_slugs: set[str] = set()
    specs: list[tuple[Path, dict]] = []
    for spec_path in discover_book_spec_paths(repo):
        spec = load_book_spec(spec_path)
        book = spec.get("book", {})
        if not isinstance(book, dict):
            continue
        slug = str(book.get("id", "")).strip()
        if not slug:
            continue
        known_slugs.add(slug)
        for alias in book.get("slug_aliases") or []:
            a = str(alias).strip()
            if a:
                known_slugs.add(a)
        specs.append((spec_path, book))

    concept_slugs = (
        {p.stem for p in (repo / SEMANTIC / "glossary").glob("*.yml")}
        if (repo / SEMANTIC / "glossary").is_dir()
        else set()
    )
    pattern_slugs = (
        {p.stem for p in (repo / SEMANTIC / "patterns").glob("*.yml")}
        if (repo / SEMANTIC / "patterns").is_dir()
        else set()
    )

    for spec_path, book in specs:
        slug = str(book.get("id", "")).strip()
        work_slug = str(book.get("work_id") or "").strip() or default_work_slug(slug)
        relationship = str(book.get("edition_relationship") or "sole").strip()
        if relationship not in EDITION_RELATIONSHIPS:
            errors.append(f"{spec_path}: invalid edition_relationship {relationship!r}")
            continue
        is_canonical = book.get("is_canonical")
        if is_canonical is None:
            is_canonical = relationship in {"sole", "primary"}
        content_type = str(book.get("content_type") or "nonfiction").strip()
        if content_type not in CONTENT_TYPES:
            errors.append(f"{spec_path}: invalid content_type {content_type!r}")
        literary_form = str(book.get("literary_form") or "").strip()
        if literary_form and literary_form not in LITERARY_FORMS:
            errors.append(f"{spec_path}: invalid literary_form {literary_form!r}")
        kind = str(book.get("kind") or "prose").strip()
        if kind == "poetry" and content_type not in {"poetry"} and book.get("content_type"):
            warnings.append(
                f"{spec_path}: kind=poetry but content_type={content_type!r} (expected poetry)"
            )
        subtitle = str(book.get("subtitle") or "").lower()
        if "fiction" in subtitle and content_type != "fiction":
            warnings.append(
                f"{spec_path}: subtitle suggests fiction but content_type={content_type!r}"
            )
        if relationship == "superseded" and is_canonical:
            errors.append(f"{spec_path}: superseded edition cannot be canonical")
        pub = str(book.get("publication_date") or "").strip()
        edition_pub = str(book.get("edition_published_at") or "").strip()
        revised = str(book.get("substantially_revised_at") or "").strip()
        if not pub:
            warnings.append(f"{spec_path}: publication_date unknown")
        for label, value in (
            ("publication_date", pub),
            ("edition_published_at", edition_pub),
            ("substantially_revised_at", revised),
        ):
            if value and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
                errors.append(f"{spec_path}: invalid {label} {value!r}")
        anchor = pub or edition_pub
        if revised and anchor and revised < anchor:
            errors.append(
                f"{spec_path}: substantially_revised_at {revised} precedes publication {anchor}"
            )
        overview = book.get("overview")
        if isinstance(overview, dict):
            self_refs = set(overview.get("readBefore") or []) | set(overview.get("readNext") or [])
            if slug in self_refs:
                errors.append(f"{spec_path}: overview reading-order self-reference")
            for other in list(overview.get("readBefore") or []) + list(
                overview.get("readNext") or []
            ):
                o = str(other).strip()
                if o and o not in known_slugs:
                    errors.append(f"{spec_path}: overview references unknown book slug {o!r}")
            for raw in overview.get("selectedConcepts") or []:
                s = str(raw).strip()
                if s and s not in concept_slugs:
                    errors.append(f"{spec_path}: overview selectedConcepts unknown {s!r}")
            for raw in overview.get("selectedPatterns") or []:
                s = str(raw).strip()
                if s and s not in pattern_slugs:
                    errors.append(f"{spec_path}: overview selectedPatterns unknown {s!r}")
            selected_concept_set = {
                str(s).strip() for s in (overview.get("selectedConcepts") or []) if str(s).strip()
            }
            selected_pattern_set = {
                str(s).strip() for s in (overview.get("selectedPatterns") or []) if str(s).strip()
            }
            seen_concept_roles: set[str] = set()
            for item in overview.get("selectedConceptRoles") or []:
                if not isinstance(item, dict):
                    errors.append(f"{spec_path}: selectedConceptRoles entry must be a mapping")
                    continue
                cid = str(item.get("conceptId") or "").strip().removeprefix("concept-")
                role = str(item.get("roleInWork") or "").strip()
                if not cid or not role:
                    errors.append(
                        f"{spec_path}: selectedConceptRoles requires conceptId and roleInWork"
                    )
                    continue
                if cid not in selected_concept_set:
                    errors.append(
                        f"{spec_path}: selectedConceptRoles target {cid!r} not in selectedConcepts"
                    )
                if cid in seen_concept_roles:
                    errors.append(f"{spec_path}: duplicate selectedConceptRoles for {cid!r}")
                seen_concept_roles.add(cid)
            for cid in sorted(selected_concept_set - seen_concept_roles):
                warnings.append(
                    f"{spec_path}: selectedConcepts {cid!r} lacks selectedConceptRoles entry"
                )
            seen_pattern_roles: set[str] = set()
            for item in overview.get("selectedPatternRoles") or []:
                if not isinstance(item, dict):
                    errors.append(f"{spec_path}: selectedPatternRoles entry must be a mapping")
                    continue
                pid = str(item.get("patternId") or "").strip().removeprefix("pattern-")
                role = str(item.get("roleInWork") or "").strip()
                if not pid or not role:
                    errors.append(
                        f"{spec_path}: selectedPatternRoles requires patternId and roleInWork"
                    )
                    continue
                if pid not in selected_pattern_set:
                    errors.append(
                        f"{spec_path}: selectedPatternRoles target {pid!r} not in selectedPatterns"
                    )
                if pid in seen_pattern_roles:
                    errors.append(f"{spec_path}: duplicate selectedPatternRoles for {pid!r}")
                seen_pattern_roles.add(pid)
            for pid in sorted(selected_pattern_set - seen_pattern_roles):
                warnings.append(
                    f"{spec_path}: selectedPatterns {pid!r} lacks selectedPatternRoles entry"
                )
            seen_related: set[tuple[str, str]] = set()
            for item in overview.get("relatedWorks") or []:
                if not isinstance(item, dict):
                    errors.append(f"{spec_path}: relatedWorks entry must be a mapping")
                    continue
                work_raw = str(item.get("workId") or "").strip()
                target_work_slug = work_raw.removeprefix("work-")
                rel = str(item.get("relationship") or "").strip()
                reason = str(item.get("reason") or "").strip()
                if not work_raw:
                    errors.append(f"{spec_path}: relatedWorks missing workId")
                    continue
                if rel not in WORK_RELATIONSHIP_TYPES:
                    errors.append(f"{spec_path}: invalid relatedWorks relationship {rel!r}")
                if not reason:
                    errors.append(f"{spec_path}: relatedWorks requires reason")
                if target_work_slug == default_work_slug(slug) or target_work_slug == slug:
                    errors.append(f"{spec_path}: relatedWorks self-reference {work_raw!r}")
                # Target work must have at least one book slug matching work slug or editions
                target_ok = target_work_slug in known_slugs or any(
                    default_work_slug(s) == target_work_slug for s in known_slugs
                )
                if not target_ok:
                    errors.append(f"{spec_path}: relatedWorks unknown workId {work_raw!r}")
                key = (target_work_slug, rel)
                if key in seen_related:
                    warnings.append(
                        f"{spec_path}: duplicate relatedWorks ({target_work_slug}, {rel})"
                    )
                seen_related.add(key)
            if not overview.get("centralQuestion"):
                warnings.append(f"{spec_path}: overview incomplete")
        by_work[work_slug].append((slug, {"canonical": bool(is_canonical), "rel": relationship}))

    for work_slug, members in by_work.items():
        canonicals = [s for s, meta in members if meta["canonical"]]
        if len(canonicals) == 0:
            errors.append(f"work {work_id_for_slug(work_slug)}: no canonical edition")
        elif len(canonicals) > 1:
            errors.append(
                f"work {work_id_for_slug(work_slug)}: multiple canonical editions: {canonicals}"
            )


def validate_path_stops(
    path: Path,
    stops: list,
    *,
    ids: dict[str, set[str]],
    errors: list[str],
    require_transitions: bool,
) -> None:
    if not isinstance(stops, list) or not stops:
        errors.append(f"{path}: pathStops must be a non-empty list")
        return
    positions: set[int] = set()
    ordered = sorted(
        (s for s in stops if isinstance(s, dict)),
        key=lambda s: int(s.get("position") or 0),
    )
    for stop in ordered:
        pos = int(stop.get("position") or 0)
        if pos in positions:
            errors.append(f"{path}: duplicate pathStops position {pos}")
        positions.add(pos)
        etype = str(stop.get("entityType") or "")
        entity_id = str(stop.get("entityId") or "").strip()
        book_slug = str(stop.get("bookSlug") or "").strip()
        if etype == "book":
            if entity_id and entity_id not in ids["book"]:
                errors.append(f"{path}: unknown book entityId {entity_id!r}")
            if book_slug and book_slug not in ids["book_slugs"]:
                errors.append(f"{path}: unknown bookSlug {book_slug!r}")
            if not entity_id and not book_slug:
                errors.append(f"{path}: book stop requires entityId or bookSlug")
        elif etype == "chapter":
            if not entity_id:
                errors.append(f"{path}: chapter stop requires entityId")
            elif entity_id not in ids.get("chapter", set()):
                errors.append(f"{path}: unknown chapter entityId {entity_id!r}")
            elif entity_id not in ids.get("chapter_public", set()):
                errors.append(
                    f"{path}: chapter entityId {entity_id!r} is not a public reader destination"
                )
        elif etype in {"concept", "pattern", "situation", "source", "thinker"}:
            if not entity_id:
                errors.append(f"{path}: {etype} stop requires entityId")
            elif entity_id not in ids[etype]:
                errors.append(f"{path}: unknown {etype} entityId {entity_id!r}")
        elif etype == "external":
            if not str(stop.get("externalUrl") or "").strip():
                errors.append(f"{path}: external stop requires externalUrl")
        elif etype == "podcast_episode":
            pass
        else:
            errors.append(f"{path}: unknown entityType {etype!r}")
        if require_transitions and pos > 1 and not str(stop.get("whyThisFollows") or "").strip():
            errors.append(f"{path}: pathStops[{pos}] missing whyThisFollows")


def validate_discovery_resources(repo: Path, errors: list[str], warnings: list[str]) -> None:
    store = _schema_store(repo)
    ids = _collect_entity_ids(repo)
    question_ids: set[str] = set()
    trail_ids: set[str] = set()
    shelf_ids: set[str] = set()
    event_ids: set[str] = set()

    for subdir, schema_name in DIR_SCHEMA.items():
        schema = json.loads((repo / SCHEMA_DIR / schema_name).read_text(encoding="utf-8"))
        validator = _validator(schema, store)
        root = repo / SEMANTIC / subdir
        if not root.is_dir():
            continue
        for path in sorted(root.glob("*.yml")):
            doc = _load_yaml(path)
            if not isinstance(doc, dict):
                errors.append(f"{path}: expected mapping")
                continue
            for err in sorted(validator.iter_errors(doc), key=lambda e: list(e.path)):
                errors.append(f"{path}: {err.message}")
            slug = str(doc.get("slug") or path.stem).strip()
            if subdir in {"questions", "trails", "shelves"} and slug != path.stem:
                errors.append(f"{path}: slug {slug!r} must match filename stem {path.stem!r}")
            rid = str(doc.get("id") or "").strip()
            if subdir == "questions":
                if rid in question_ids:
                    errors.append(f"{path}: duplicate question id {rid!r}")
                question_ids.add(rid)
                if rid and rid != slug:
                    errors.append(f"{path}: id must equal slug for questions")
                status = str(doc.get("status") or "")
                if status == "published":
                    validate_path_stops(
                        path,
                        doc.get("pathStops") or [],
                        ids=ids,
                        errors=errors,
                        require_transitions=True,
                    )
                    primary = str(doc.get("primaryBookId") or "")
                    if primary and primary not in ids["book"]:
                        errors.append(f"{path}: unknown primaryBookId {primary!r}")
            elif subdir == "trails":
                if rid in trail_ids:
                    errors.append(f"{path}: duplicate trail id {rid!r}")
                trail_ids.add(rid)
                status = str(doc.get("status") or "")
                if status in {"published", "upcoming"}:
                    validate_path_stops(
                        path,
                        doc.get("pathStops") or [],
                        ids=ids,
                        errors=errors,
                        require_transitions=status == "published",
                    )
            elif subdir == "shelves":
                if rid in shelf_ids:
                    errors.append(f"{path}: duplicate shelf id {rid!r}")
                shelf_ids.add(rid)
                selection = doc.get("selection") or {}
                if selection.get("mode") == "curated":
                    seen: set[str] = set()
                    for slug_b in selection.get("bookSlugs") or []:
                        s = str(slug_b).strip()
                        if s in seen:
                            errors.append(f"{path}: duplicate curated member {s!r}")
                        seen.add(s)
                        if s not in ids["book_slugs"]:
                            errors.append(f"{path}: unknown shelf bookSlug {s!r}")
                if doc.get("featured") and selection.get("mode") == "curated":
                    if not (selection.get("bookSlugs") or []):
                        errors.append(f"{path}: featured shelf cannot be empty")
            elif subdir == "change-events":
                if rid in event_ids:
                    errors.append(f"{path}: duplicate event id {rid!r}")
                event_ids.add(rid)
                entity_id = str(doc.get("entityId") or "").strip()
                if (
                    entity_id
                    and str(doc.get("entityType")) == "book"
                    and entity_id not in ids["book"]
                ):
                    errors.append(f"{path}: unknown event entityId {entity_id!r}")
                if (
                    str(doc.get("visibility")) == "public"
                    and not str(doc.get("summary") or "").strip()
                ):
                    errors.append(f"{path}: public event requires summary")

    # related question/trail refs
    for path in (
        sorted((repo / SEMANTIC / "questions").glob("*.yml"))
        if (repo / SEMANTIC / "questions").is_dir()
        else []
    ):
        doc = _load_yaml(path)
        if not isinstance(doc, dict):
            continue
        for rid in doc.get("relatedQuestionIds") or []:
            if str(rid).strip() not in question_ids:
                errors.append(f"{path}: unknown relatedQuestionIds {rid!r}")
            if str(rid).strip() == str(doc.get("id") or "").strip():
                errors.append(f"{path}: relatedQuestionIds self-reference")
    for path in (
        sorted((repo / SEMANTIC / "trails").glob("*.yml"))
        if (repo / SEMANTIC / "trails").is_dir()
        else []
    ):
        doc = _load_yaml(path)
        if not isinstance(doc, dict):
            continue
        for rid in doc.get("relatedTrailIds") or []:
            if str(rid).strip() not in trail_ids:
                errors.append(f"{path}: unknown relatedTrailIds {rid!r}")
            if str(rid).strip() == str(doc.get("id") or "").strip():
                errors.append(f"{path}: relatedTrailIds self-reference")

    aliases_path = repo / SEMANTIC / "search-aliases.yml"
    if aliases_path.is_file():
        schema = json.loads(
            (repo / SCHEMA_DIR / "search-aliases-file.schema.json").read_text(encoding="utf-8")
        )
        validator = _validator(schema, store)
        doc = _load_yaml(aliases_path)
        if not isinstance(doc, dict):
            errors.append(f"{aliases_path}: expected mapping")
        else:
            for err in sorted(validator.iter_errors(doc), key=lambda e: list(e.path)):
                errors.append(f"{aliases_path}: {err.message}")
            global_phrases: dict[str, tuple[int, str]] = {}
            for i, entry in enumerate(doc.get("entries") or []):
                if not isinstance(entry, dict):
                    continue
                terms = entry.get("terms") or []
                if not terms:
                    errors.append(f"{aliases_path}: entries[{i}] empty terms")
                kind = str(entry.get("kind") or "")
                if kind not in {"alias", "related"}:
                    errors.append(f"{aliases_path}: entries[{i}] invalid kind {kind!r}")
                for t in terms:
                    n = " ".join(str(t).lower().split())
                    if not n:
                        errors.append(f"{aliases_path}: entries[{i}] empty phrase")
                        continue
                    if n in global_phrases:
                        prev_i, prev_kind = global_phrases[n]
                        if kind == "alias" and prev_kind == "alias":
                            errors.append(
                                f"{aliases_path}: conflicting exact alias {n!r} "
                                f"(entries[{prev_i}] and entries[{i}])"
                            )
                        else:
                            errors.append(
                                f"{aliases_path}: duplicate normalized phrase {n!r} "
                                f"(entries[{prev_i}] and entries[{i}])"
                            )
                    global_phrases[n] = (i, kind)
                    if len(n.split()) == 1 and n in {"the", "a", "and", "or", "to", "of"}:
                        warnings.append(
                            f"{aliases_path}: entries[{i}] excessively broad phrase {t!r}"
                        )
                for tid in entry.get("targetIds") or []:
                    t = str(tid).strip()
                    if t and not _is_known_target(t, ids):
                        errors.append(f"{aliases_path}: entries[{i}] unknown targetId {t!r}")

    # Completeness warnings (non-fatal)
    try:
        from report_semantic_completeness import build_report, completeness_warnings

        for w in completeness_warnings(build_report(repo)):
            warnings.append(w)
    except Exception as exc:  # pragma: no cover
        warnings.append(f"completeness report unavailable: {exc}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    args = parser.parse_args()
    repo = Path(args.repo).resolve()
    errors: list[str] = []
    warnings: list[str] = []
    validate_work_edition_invariants(repo, errors, warnings)
    validate_discovery_resources(repo, errors, warnings)
    for w in warnings:
        print(f"WARNING: {w}", file=sys.stderr)
    if errors:
        for e in errors:
            print(e, file=sys.stderr)
        return 1
    print("Discovery content validation OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
