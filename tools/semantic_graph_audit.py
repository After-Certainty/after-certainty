"""
Unified semantic graph data-quality audit helpers.

Used by tools/audit_semantic_graph.py (JSON + Markdown reports).
"""

from __future__ import annotations

import json
import re
import statistics
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass, field
from datetime import UTC, datetime
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

from semantic_extract import slugify_heading, transliterate_slug  # noqa: E402
from semantic_metadata_quality_audit import (  # noqa: E402
    QualityIssue,
    run_metadata_quality_audit,
)
from source_metadata import (  # noqa: E402
    is_multi_person_thinker_name,
    parse_year_from_citation,
    split_display_name,
    strip_thinker_role_suffix,
)
from thinker_concept_audit import (  # noqa: E402
    PRIORITY_THINKER_SLUGS,
    collect_concept_slugs,
    find_concept_grounding_gaps,
    load_entity_dir,
)

SEMANTIC = Path("semantic")
MIN_YEAR_DEFAULT = 1500
SHORT_DEFINITION_CHARS = 40
SYMMETRIC_RELATIONSHIPS = frozenset({"complements", "contrasts", "structural_tension"})
ALLOWED_RELATIONSHIP_TYPES = frozenset(
    {
        "calibrates",
        "complements",
        "constrains",
        "contrasts",
        "distorts",
        "enables",
        "grounds",
        "hardens",
        "intensifies",
        "precedes",
        "preserves",
        "pressures",
        "renews",
        "reproduces",
        "requires",
        "shapes",
        "stabilizes",
        "structural_tension",
        "thins",
        "weakens",
        "related",
    }
)
ORG_KEYWORDS = re.compile(
    r"\b(inc|llc|ltd|university|college|institute|bureau|commission|board|"
    r"foundation|department|administration|center|centre|agency|committee|"
    r"organization|organisation|society|press|museum|church|nasa|noaa|nist|iso|"
    r"bank|collaboration|consortium)\b",
    re.I,
)
INSTITUTIONAL_SOURCE_KINDS = frozenset(
    {
        "report",
        "standard",
        "dataset",
        "institutional_document",
        "speech",
        "website",
    }
)
TAUTOLOGY_MIN_REMAINDER_CHARS = 25
_PAGE_RANGE_RE = re.compile(r"\b(\d{3,4})\s*[–\-]\s*(\d{3,4})\b")
_PAREN_YEAR_RE = re.compile(r"\((1[0-9]{3}|20[0-9]{2})\)")
_CITATION_IN_FIELD_RE = re.compile(
    r"https?://|doi\.org|doi:|vol\.|pp\.|no\.\s*\d|^\d+\(\d+\)",
    re.I,
)
_DANGLING_PUNCT_RE = re.compile(r"[,;:]$")
_INSTITUTIONAL_NAME_RE = re.compile(
    r"\b(world bank|census bureau|labor statistics|department of defense|"
    r"securities and exchange|medicare|medicaid|federal reserve|nasa|noaa|nist)\b",
    re.I,
)


@dataclass
class AuditIssue:
    severity: str
    category: str
    entityType: str
    entityId: str | None
    entityTitle: str | None
    field: str | None
    currentValue: object
    reason: str
    suggestedFix: str | None = None


@dataclass
class VocabEntry:
    label: str
    sourceType: str
    targetType: str
    count: int
    examples: list[dict] = field(default_factory=list)


@dataclass
class AuditResult:
    issues: list[AuditIssue] = field(default_factory=list)
    relationship_vocabulary: list[VocabEntry] = field(default_factory=list)
    density_stats: dict[str, list[dict]] = field(default_factory=dict)
    entities_scanned: dict[str, int] = field(default_factory=dict)
    input_files: list[str] = field(default_factory=list)
    repo_type: str = "source"


def get_list(entity: dict, *keys: str) -> list:
    for key in keys:
        value = entity.get(key)
        if isinstance(value, list):
            return value
    return []


def entity_title(entity: dict) -> str:
    for key in ("title", "name", "slug"):
        value = str(entity.get(key, "")).strip()
        if value:
            return value
    return ""


def slug_audit_label(entity: dict, entity_type: str) -> str:
    """Prefer display name over bare title for slug transliteration checks."""
    if entity_type in ("source", "thinker"):
        name = str(entity.get("name", "")).strip()
        if name:
            return name
    return entity_title(entity)


def _collapse_ws(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip()).lower()


def _is_tautological_definition(title: str, definition: str) -> bool:
    """True only when the definition restates the title without substantive content."""
    norm_title = _collapse_ws(title)
    norm_def = _collapse_ws(definition)
    if not norm_title or not norm_def:
        return False
    if norm_def == norm_title:
        return True
    if re.match(rf"^{re.escape(norm_title)}\s+is\s+{re.escape(norm_title)}\b", norm_def):
        return True
    if norm_def.startswith(f"{norm_title} is "):
        remainder = norm_def[len(norm_title) + 4 :].strip()
        if len(remainder) < TAUTOLOGY_MIN_REMAINDER_CHARS:
            return True
        if remainder.startswith(norm_title):
            return True
        return False
    return False


def _institution_duplicates_person_creator(
    institution: str,
    creator_names: list[str],
    *,
    source_kind: str,
) -> bool:
    """Flag when institution mirrors a person-like creator, not org-authored works."""
    if not institution or institution not in creator_names:
        return False
    if source_kind in INSTITUTIONAL_SOURCE_KINDS:
        return False
    if _looks_like_organization(institution) or _INSTITUTIONAL_NAME_RE.search(institution):
        return False
    return _looks_like_person_name(institution) or "," in institution


def _author_looks_institutional(data: dict) -> bool:
    """True when creator/author metadata indicates an institutional publisher."""
    name = str(data.get("name", "")).strip()
    author, _ = split_display_name(name)
    blobs = [author] + [str(c).strip() for c in get_list(data, "creatorNames")]
    return any(
        blob and (_INSTITUTIONAL_NAME_RE.search(blob) or _looks_like_organization(blob))
        for blob in blobs
    )


def _creator_name_looks_like_citation_blob(text: str) -> bool:
    """Conservative: long single-line creator strings that are not author lists."""
    text = text.strip()
    if len(text) <= 120:
        return False
    if text.count(",") >= 4 or text.lower().count(" and ") >= 3:
        return False
    return bool(_CITATION_IN_FIELD_RE.search(text) or re.search(r"\b(19|20)\d{2}\b", text))


def _load_yaml(path: Path) -> dict:
    if not path.is_file():
        return {}
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    return raw if isinstance(raw, dict) else {}


def _load_json(path: Path) -> dict:
    if not path.is_file():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def _issue(
    *,
    severity: str,
    category: str,
    entity_type: str,
    entity_id: str | None,
    entity_title: str | None,
    field: str | None,
    current_value: object,
    reason: str,
    suggested_fix: str | None = None,
) -> AuditIssue:
    return AuditIssue(
        severity=severity,
        category=category,
        entityType=entity_type,
        entityId=entity_id,
        entityTitle=entity_title,
        field=field,
        currentValue=current_value,
        reason=reason,
        suggestedFix=suggested_fix,
    )


def _map_quality_issue(issue: QualityIssue) -> AuditIssue:
    severity = {"critical": "error", "warning": "warning", "info": "info"}.get(
        issue.severity, issue.severity
    )
    return _issue(
        severity=severity,
        category="source-metadata" if issue.entity_kind == "source" else "thinker-metadata",
        entity_type=issue.entity_kind,
        entity_id=issue.slug,
        entity_title=issue.slug,
        field=issue.check,
        current_value=None,
        reason=issue.detail,
    )


def discover_manifest_paths(
    repo: Path,
    *,
    semantic_manifest: Path | None = None,
    books_manifest: Path | None = None,
) -> dict[str, Path | None]:
    repo = repo.resolve()
    candidates_semantic = [
        semantic_manifest,
        repo / "build" / "semantic-manifest.json",
        repo / "docs" / "portfolio-audit" / "data" / "semantic-manifest.json",
    ]
    candidates_books = [
        books_manifest,
        repo / "build" / "books-manifest.json",
        repo / "docs" / "portfolio-audit" / "data" / "books-manifest.json",
    ]

    def _first_existing(paths: list[Path | None]) -> Path | None:
        for p in paths:
            if p is not None and p.is_file():
                return p.resolve()
        return None

    return {
        "semantic": _first_existing(candidates_semantic),
        "books": _first_existing(candidates_books),
        "semantic_build": repo / "build" / "semantic-manifest.json",
        "books_build": repo / "build" / "books-manifest.json",
        "semantic_snapshot": repo / "docs" / "portfolio-audit" / "data" / "semantic-manifest.json",
        "books_snapshot": repo / "docs" / "portfolio-audit" / "data" / "books-manifest.json",
    }


def _infer_entity_type(entity_id: str) -> str:
    for prefix, etype in (
        ("concept-", "concept"),
        ("pattern-", "pattern"),
        ("source-", "source"),
        ("thinker-", "thinker"),
        ("book-", "book"),
        ("situation-", "situation"),
    ):
        if entity_id.startswith(prefix):
            return etype
    return "unknown"


def _strip_id_prefix(entity_id: str) -> str:
    for prefix in ("concept-", "pattern-", "source-", "thinker-", "book-", "situation-"):
        if entity_id.startswith(prefix):
            return entity_id.removeprefix(prefix)
    return entity_id


def _looks_like_person_name(name: str) -> bool:
    tokens = [t for t in re.split(r"\s+", name.strip()) if t]
    if not (2 <= len(tokens) <= 5):
        return False
    if ORG_KEYWORDS.search(name):
        return False
    return all(re.match(r"^[A-Z][a-zA-Z'.-]*$", t) or t in {"et", "al"} for t in tokens[:4])


def _looks_like_organization(name: str) -> bool:
    return bool(ORG_KEYWORDS.search(name))


_LAST_FIRST_NAME_RE = re.compile(r"^[A-Z][A-Za-z'.ëüöáéíóúÄÖÜÀ-ÿ-]+,\s+[A-Z]")
_ET_AL_RE = re.compile(r"\bet\s+al\.?\b", re.I)


def _strip_thinker_role_suffix(name: str) -> str:
    return strip_thinker_role_suffix(name)


def _is_last_first_display_name(name: str) -> bool:
    """Bibliographic ``Last, First`` order (not preferred ``First Last``)."""
    clean = _strip_thinker_role_suffix(name)
    if not clean or _looks_like_organization(clean):
        return False
    return bool(_LAST_FIRST_NAME_RE.match(clean))


def _is_multi_person_thinker_name(name: str) -> bool:
    """Thinker display name lists multiple creators that could be split."""
    if _looks_like_organization(name):
        return False
    return is_multi_person_thinker_name(name)


def _estimate_thinker_author_count(name: str) -> int | None:
    clean = _strip_thinker_role_suffix(name)
    if not _is_multi_person_thinker_name(clean):
        return None
    if _ET_AL_RE.search(clean):
        return None
    if ", and " in clean:
        before, after = clean.split(", and ", 1)
        return max(2, 1 + after.count(" and ") + max(0, before.count(",") - 1))
    if clean.count(" and ") >= 2:
        return clean.count(" and ") + 1
    return max(2, clean.count(",") + 1)


def _thinker_linked_work_slugs(thinker_data: dict, sources: dict[str, dict]) -> list[str]:
    return [slug for slug in get_list(thinker_data, "works") if slug in sources]


def _split_thinker_suggested_fix(
    name: str,
    linked_works: list[str],
    *,
    last_first: bool = False,
    multi_person: bool = False,
) -> str:
    parts: list[str] = []
    if last_first:
        parts.append("Use First Last display order instead of bibliographic Last, First.")
    if multi_person:
        count = _estimate_thinker_author_count(name)
        if count and count > 1:
            parts.append(f"Create {count} separate thinker entries (one per author).")
        else:
            parts.append("Create separate thinker entries (one per author).")
        if linked_works:
            work_list = ", ".join(linked_works[:3])
            if len(linked_works) > 3:
                work_list += f", … (+{len(linked_works) - 3} more)"
            parts.append(
                f"Link each thinker to the shared source(s) via creatorSlugs on: {work_list}."
            )
        else:
            parts.append("Link each thinker to shared sources via creatorSlugs on the work YAML.")
    return " ".join(parts)


def _page_range_tail_year(citation: str) -> int | None:
    matches = _PAGE_RANGE_RE.findall(citation)
    if not matches:
        return None
    return int(matches[-1][1])


def _publication_year_from_citation(citation: str) -> int | None:
    paren_matches = _PAREN_YEAR_RE.findall(citation)
    if paren_matches:
        return int(paren_matches[-1])
    parsed = parse_year_from_citation(citation)
    page_tail = _page_range_tail_year(citation)
    if parsed and page_tail and parsed == page_tail:
        return None
    return parsed


def audit_sources_extended(
    repo: Path,
    sources: dict[str, dict],
    *,
    min_year: int = MIN_YEAR_DEFAULT,
) -> list[AuditIssue]:
    issues: list[AuditIssue] = []
    current_year = datetime.now(UTC).year

    for slug, data in sorted(sources.items()):
        title = entity_title(data)
        year = data.get("year")
        citation = str(data.get("citation", "") or data.get("summary", ""))
        source_kind = str(data.get("sourceKind", "")).strip().lower()
        entry_type = str(data.get("type", "")).strip().lower()

        if isinstance(year, int):
            pub_year = _publication_year_from_citation(citation)
            page_tail = _page_range_tail_year(citation)
            if page_tail and year == page_tail and pub_year and year != pub_year:
                issues.append(
                    _issue(
                        severity="error",
                        category="source-metadata",
                        entity_type="source",
                        entity_id=slug,
                        entity_title=title,
                        field="year",
                        current_value=year,
                        reason="Publication year appears to have been parsed from a page range.",
                        suggested_fix=f"Set year to {pub_year} based on citation.",
                    )
                )
            elif year < min_year:
                issues.append(
                    _issue(
                        severity="warning",
                        category="source-metadata",
                        entity_type="source",
                        entity_id=slug,
                        entity_title=title,
                        field="year",
                        current_value=year,
                        reason=f"Publication year is earlier than {min_year}.",
                        suggested_fix="Verify year or document as ancient/classical source.",
                    )
                )
            elif year > current_year + 1:
                issues.append(
                    _issue(
                        severity="error",
                        category="source-metadata",
                        entity_type="source",
                        entity_id=slug,
                        entity_title=title,
                        field="year",
                        current_value=year,
                        reason="Publication year is in the future.",
                        suggested_fix="Correct the publication year.",
                    )
                )

        for field_name in ("title", "name"):
            value = str(data.get(field_name, "")).strip()
            if value and _DANGLING_PUNCT_RE.search(value):
                issues.append(
                    _issue(
                        severity="warning",
                        category="source-metadata",
                        entity_type="source",
                        entity_id=slug,
                        entity_title=title,
                        field=field_name,
                        current_value=value,
                        reason="Title or name ends with dangling punctuation.",
                        suggested_fix="Remove trailing comma, colon, or semicolon.",
                    )
                )
            if value and value.endswith("-"):
                issues.append(
                    _issue(
                        severity="warning",
                        category="source-metadata",
                        entity_type="source",
                        entity_id=slug,
                        entity_title=title,
                        field=field_name,
                        current_value=value,
                        reason="Title appears truncated (ends with hyphen).",
                        suggested_fix="Complete the title text.",
                    )
                )

        for field_name in ("creatorNames", "publisher", "institution"):
            items = data.get(field_name)
            if isinstance(items, list):
                for idx, raw in enumerate(items):
                    text = str(raw).strip()
                    if text and _CITATION_IN_FIELD_RE.search(text):
                        issues.append(
                            _issue(
                                severity="warning",
                                category="source-metadata",
                                entity_type="source",
                                entity_id=slug,
                                entity_title=title,
                                field=f"{field_name}[{idx}]",
                                current_value=text,
                                reason="Field appears to contain citation or URL fragments.",
                                suggested_fix="Move bibliographic detail to citation/summary.",
                            )
                        )
                    if field_name == "creatorNames" and _creator_name_looks_like_citation_blob(
                        text
                    ):
                        issues.append(
                            _issue(
                                severity="warning",
                                category="source-metadata",
                                entity_type="source",
                                entity_id=slug,
                                entity_title=title,
                                field=f"creatorNames[{idx}]",
                                current_value=text[:80] + "...",
                                reason="Creator name appears to be a full citation string.",
                                suggested_fix="Use a short author display name.",
                            )
                        )
            elif isinstance(items, str) and items.strip():
                text = items.strip()
                if _CITATION_IN_FIELD_RE.search(text):
                    issues.append(
                        _issue(
                            severity="warning",
                            category="source-metadata",
                            entity_type="source",
                            entity_id=slug,
                            entity_title=title,
                            field=field_name,
                            current_value=text,
                            reason="Field appears to contain citation or URL fragments.",
                            suggested_fix="Move bibliographic detail to citation/summary.",
                        )
                    )

        institution = str(data.get("institution", "")).strip()
        creator_names = [str(c).strip() for c in get_list(data, "creatorNames")]
        if _institution_duplicates_person_creator(
            institution, creator_names, source_kind=source_kind
        ):
            issues.append(
                _issue(
                    severity="warning",
                    category="source-metadata",
                    entity_type="source",
                    entity_id=slug,
                    entity_title=title,
                    field="institution",
                    current_value=institution,
                    reason="Institution field duplicates a creator name (person misfiled as org).",
                    suggested_fix="Clear institution or use the actual publishing organization.",
                )
            )

        if (
            source_kind in ("", "book")
            and entry_type == "book"
            and _author_looks_institutional(data)
        ):
            issues.append(
                _issue(
                    severity="warning",
                    category="source-metadata",
                    entity_type="source",
                    entity_id=slug,
                    entity_title=title,
                    field="sourceKind",
                    current_value=source_kind or entry_type,
                    reason="Institutional statistics or report classified like a book.",
                    suggested_fix="Set sourceKind to report or institutional_document.",
                )
            )

        if not get_list(data, "concepts", "patterns") and not get_list(data, "relatedBooks"):
            issues.append(
                _issue(
                    severity="info",
                    category="source-metadata",
                    entity_type="source",
                    entity_id=slug,
                    entity_title=title,
                    field="concepts",
                    current_value=[],
                    reason="Source has no concept, pattern, or book links.",
                    suggested_fix="Link to grounding concepts or books when applicable.",
                )
            )

    return issues


def _is_placeholder_thinker_text(summary: str, why: str) -> bool:
    blob = f"{summary} {why}".lower()
    return ("aggregated from" in blob and "edit summary" in blob) or (
        "canonical thinker entry for source grouping" in blob
    )


def audit_thinkers(
    repo: Path,
    thinkers: dict[str, dict],
    *,
    sources: dict[str, dict] | None = None,
) -> list[AuditIssue]:
    issues: list[AuditIssue] = []
    source_index = sources or {}

    for slug, data in sorted(thinkers.items()):
        name = str(data.get("name", slug)).strip()
        thinker_type = str(data.get("type", "person")).strip().lower()
        summary = str(data.get("summary", "")).strip()
        why = str(data.get("whyThisMatters", "")).strip()
        linked_works = _thinker_linked_work_slugs(data, source_index)

        if thinker_type == "organization" and _looks_like_person_name(name):
            issues.append(
                _issue(
                    severity="warning",
                    category="thinker-metadata",
                    entity_type="thinker",
                    entity_id=slug,
                    entity_title=name,
                    field="type",
                    current_value=thinker_type,
                    reason="Person-like name classified as organization.",
                    suggested_fix="Set type to person.",
                )
            )
        elif (
            thinker_type == "person"
            and _looks_like_organization(name)
            and not _looks_like_person_name(name)
        ):
            issues.append(
                _issue(
                    severity="warning",
                    category="thinker-metadata",
                    entity_type="thinker",
                    entity_id=slug,
                    entity_title=name,
                    field="type",
                    current_value=thinker_type,
                    reason="Organization-like name classified as person.",
                    suggested_fix="Set type to organization.",
                )
            )

        if not summary:
            issues.append(
                _issue(
                    severity="warning",
                    category="thinker-metadata",
                    entity_type="thinker",
                    entity_id=slug,
                    entity_title=name,
                    field="summary",
                    current_value="",
                    reason="Thinker has missing or empty description.",
                    suggested_fix="Add a summary describing why this thinker matters.",
                )
            )

        if summary and _is_placeholder_thinker_text(summary, why):
            issues.append(
                _issue(
                    severity="info",
                    category="thinker-metadata",
                    entity_type="thinker",
                    entity_id=slug,
                    entity_title=name,
                    field="summary",
                    current_value=summary,
                    reason="Thinker summary or whyThisMatters still uses draft promotion placeholder text.",
                    suggested_fix="Replace with an editorial summary and whyThisMatters.",
                )
            )

        has_links = any(
            get_list(data, key) for key in ("concepts", "patterns", "relatedBooks", "works")
        )
        if not has_links:
            severity = "error" if slug in PRIORITY_THINKER_SLUGS else "info"
            issues.append(
                _issue(
                    severity=severity,
                    category="thinker-metadata",
                    entity_type="thinker",
                    entity_id=slug,
                    entity_title=name,
                    field="links",
                    current_value=[],
                    reason="Thinker has no linked concepts, patterns, books, or sources.",
                    suggested_fix="Add works and concept links to ground the thinker in the graph.",
                )
            )

        expected = transliterate_slug(name)
        if expected and slug != expected and slugify_heading(name) == slug:
            issues.append(
                _issue(
                    severity="warning",
                    category="slug-quality",
                    entity_type="thinker",
                    entity_id=slug,
                    entity_title=name,
                    field="slug",
                    current_value=slug,
                    reason="Slug appears damaged by diacritic stripping.",
                    suggested_fix=f"Consider renaming slug to {expected!r} with a redirect strategy.",
                )
            )

        if thinker_type == "person" and _is_multi_person_thinker_name(name):
            count_hint = _estimate_thinker_author_count(name)
            reason = "Thinker name lists multiple people who could be separate thinker entries."
            if count_hint:
                reason = f"Thinker name lists ~{count_hint} people who could be separate thinker entries."
            if _ET_AL_RE.search(name):
                reason = (
                    "Thinker name uses 'et al' and aggregates multiple authors "
                    "who could be separate thinker entries."
                )
            issues.append(
                _issue(
                    severity="warning",
                    category="thinker-metadata",
                    entity_type="thinker",
                    entity_id=slug,
                    entity_title=name,
                    field="name",
                    current_value=name,
                    reason=reason,
                    suggested_fix=_split_thinker_suggested_fix(
                        name,
                        linked_works,
                        multi_person=True,
                    ),
                )
            )

        if thinker_type == "person" and _is_last_first_display_name(name):
            issues.append(
                _issue(
                    severity="info",
                    category="thinker-metadata",
                    entity_type="thinker",
                    entity_id=slug,
                    entity_title=name,
                    field="name",
                    current_value=name,
                    reason="Thinker name uses bibliographic Last, First order instead of First Last.",
                    suggested_fix=_split_thinker_suggested_fix(
                        name,
                        linked_works,
                        last_first=True,
                        multi_person=_is_multi_person_thinker_name(name),
                    ),
                )
            )

    return issues


def _load_glossary(repo: Path) -> dict[str, dict]:
    return load_entity_dir(repo, "glossary")


def _load_patterns(repo: Path) -> dict[str, dict]:
    return load_entity_dir(repo, "patterns")


def audit_concepts(
    repo: Path,
    glossary: dict[str, dict],
    *,
    inbound_counts: dict[str, int],
    thinker_concept_refs: dict[str, set[str]],
    source_concept_refs: dict[str, set[str]],
) -> list[AuditIssue]:
    issues: list[AuditIssue] = []
    extended_with_long = sum(
        1
        for g in glossary.values()
        if str(g.get("termKind", "")).strip() == "extended"
        and str(g.get("longDefinition", "")).strip()
    )
    extended_total = sum(
        1 for g in glossary.values() if str(g.get("termKind", "")).strip() == "extended"
    )
    peer_has_long = extended_with_long > extended_total // 2 if extended_total else False

    inbound_values = [v for v in inbound_counts.values() if v > 0]
    p90_inbound = (
        sorted(inbound_values)[int(len(inbound_values) * 0.9)]
        if len(inbound_values) >= 10
        else max(inbound_values, default=0)
    )

    for slug, data in sorted(glossary.items()):
        title = entity_title(data)
        short_def = str(data.get("shortDefinition", "")).strip()
        long_def = str(data.get("longDefinition", "")).strip()

        if not short_def:
            issues.append(
                _issue(
                    severity="error",
                    category="concept-metadata",
                    entity_type="concept",
                    entity_id=slug,
                    entity_title=title,
                    field="shortDefinition",
                    current_value="",
                    reason="Concept has missing definition.",
                    suggested_fix="Add a shortDefinition.",
                )
            )
            continue

        if _is_tautological_definition(title, short_def):
            issues.append(
                _issue(
                    severity="warning",
                    category="concept-metadata",
                    entity_type="concept",
                    entity_id=slug,
                    entity_title=title,
                    field="shortDefinition",
                    current_value=short_def,
                    reason="Definition appears tautological (repeats the title).",
                    suggested_fix="Rewrite to explain the concept without restating the title.",
                )
            )

        if len(short_def) < SHORT_DEFINITION_CHARS:
            issues.append(
                _issue(
                    severity="warning",
                    category="concept-metadata",
                    entity_type="concept",
                    entity_id=slug,
                    entity_title=title,
                    field="shortDefinition",
                    current_value=short_def,
                    reason="Definition is very short and may be insufficient.",
                    suggested_fix="Expand shortDefinition or add longDefinition.",
                )
            )

        term_kind = str(data.get("termKind", "")).strip()
        has_rich = bool(get_list(data, "trajectory", "manifestations", "recognitionSignals"))
        if peer_has_long and term_kind == "extended" and has_rich and not long_def:
            issues.append(
                _issue(
                    severity="info",
                    category="concept-metadata",
                    entity_type="concept",
                    entity_id=slug,
                    entity_title=title,
                    field="longDefinition",
                    current_value="",
                    reason="Comparable extended concepts have longDefinition but this one does not.",
                    suggested_fix="Add longDefinition for editorial parity.",
                )
            )

        related = get_list(data, "relatedConcepts", "concepts")
        books = get_list(data, "relatedBooks", "books")
        thinkers = thinker_concept_refs.get(slug, set())
        sources = source_concept_refs.get(slug, set())
        inbound = inbound_counts.get(slug, 0)

        if not related:
            issues.append(
                _issue(
                    severity="info",
                    category="concept-metadata",
                    entity_type="concept",
                    entity_id=slug,
                    entity_title=title,
                    field="relatedConcepts",
                    current_value=[],
                    reason="Concept has no related concepts.",
                    suggested_fix="Add relatedConcepts edges where appropriate.",
                )
            )

        if not books and not thinkers and not sources and inbound >= 3:
            issues.append(
                _issue(
                    severity="warning",
                    category="concept-metadata",
                    entity_type="concept",
                    entity_id=slug,
                    entity_title=title,
                    field="grounding",
                    current_value={"books": 0, "thinkers": 0, "sources": 0},
                    reason="Concept appears in multiple books but has no source/thinker grounding.",
                    suggested_fix="Link thinkers or sources that ground this concept.",
                )
            )

        if inbound >= p90_inbound and p90_inbound > 0 and len(short_def) < 80:
            issues.append(
                _issue(
                    severity="warning",
                    category="concept-metadata",
                    entity_type="concept",
                    entity_id=slug,
                    entity_title=title,
                    field="shortDefinition",
                    current_value=len(short_def),
                    reason="Concept has many inbound relationships but a thin definition.",
                    suggested_fix="Expand definition to match graph importance.",
                )
            )

    return issues


def audit_patterns(
    patterns: dict[str, dict],
    *,
    source_pattern_refs: dict[str, set[str]],
    thinker_pattern_refs: dict[str, set[str]],
) -> list[AuditIssue]:
    issues: list[AuditIssue] = []
    title_map: dict[str, list[str]] = defaultdict(list)

    for slug, data in sorted(patterns.items()):
        title = entity_title(data)
        norm_title = _collapse_ws(title)
        if norm_title:
            title_map[norm_title].append(slug)

        concepts = get_list(data, "relatedConcepts", "concepts")
        books = get_list(data, "relatedBooks", "books")
        sources = source_pattern_refs.get(slug, set())
        thinkers = thinker_pattern_refs.get(slug, set())

        if not concepts:
            issues.append(
                _issue(
                    severity="info",
                    category="pattern-metadata",
                    entity_type="pattern",
                    entity_id=slug,
                    entity_title=title,
                    field="relatedConcepts",
                    current_value=[],
                    reason="Pattern has no related concepts.",
                    suggested_fix="Link concepts this pattern instantiates.",
                )
            )
        if not books:
            issues.append(
                _issue(
                    severity="info",
                    category="pattern-metadata",
                    entity_type="pattern",
                    entity_id=slug,
                    entity_title=title,
                    field="relatedBooks",
                    current_value=[],
                    reason="Pattern has no related books.",
                )
            )
        if not sources:
            issues.append(
                _issue(
                    severity="info",
                    category="pattern-metadata",
                    entity_type="pattern",
                    entity_id=slug,
                    entity_title=title,
                    field="relatedSources",
                    current_value=[],
                    reason="Pattern has no related sources.",
                )
            )
        if not thinkers:
            issues.append(
                _issue(
                    severity="info",
                    category="pattern-metadata",
                    entity_type="pattern",
                    entity_id=slug,
                    entity_title=title,
                    field="relatedThinkers",
                    current_value=[],
                    reason="Pattern has no related thinkers.",
                )
            )

        observation = str(data.get("observation", "")).strip()
        problem = str(data.get("problem", "")).strip()
        combined = _collapse_ws(f"{observation} {problem}")
        if combined and (len(combined) < SHORT_DEFINITION_CHARS or combined == norm_title):
            issues.append(
                _issue(
                    severity="warning",
                    category="pattern-metadata",
                    entity_type="pattern",
                    entity_id=slug,
                    entity_title=title,
                    field="observation",
                    current_value=combined,
                    reason="Pattern definition is too short or tautological.",
                    suggested_fix="Expand observation and problem fields.",
                )
            )

        has_grounding_field = any(
            data.get(k) for k in ("evidenceType", "grounding", "sourceStatus")
        )
        if not sources and not thinkers and not has_grounding_field:
            issues.append(
                _issue(
                    severity="info",
                    category="pattern-metadata",
                    entity_type="pattern",
                    entity_id=slug,
                    entity_title=title,
                    field="evidenceType",
                    current_value=None,
                    reason="Pattern appears to be original synthesis but does not say so.",
                    suggested_fix="Add optional evidenceType or grounding field marking original synthesis.",
                )
            )

    for norm_title, slugs in title_map.items():
        if len(slugs) > 1:
            issues.append(
                _issue(
                    severity="warning",
                    category="pattern-metadata",
                    entity_type="pattern",
                    entity_id=slugs[0],
                    entity_title=norm_title,
                    field="title",
                    current_value=slugs,
                    reason="Duplicate or near-duplicate pattern titles.",
                    suggested_fix="Differentiate titles or merge patterns.",
                )
            )

    related_edges: dict[str, set[str]] = {}
    for slug, data in patterns.items():
        related_edges[slug] = set(str(x).strip() for x in get_list(data, "relatedPatterns"))
    for slug, targets in related_edges.items():
        for target in targets:
            if target and target not in related_edges.get(target, set()):
                issues.append(
                    _issue(
                        severity="info",
                        category="pattern-metadata",
                        entity_type="pattern",
                        entity_id=slug,
                        entity_title=entity_title(patterns.get(slug, {})),
                        field="relatedPatterns",
                        current_value=target,
                        reason="Pattern relationship appears one-way; inverse may be expected.",
                        suggested_fix=f"Consider adding {slug!r} to relatedPatterns on {target!r}.",
                    )
                )

    return issues


def _books_by_slug(manifest: dict) -> dict[str, dict]:
    out: dict[str, dict] = {}
    for book in manifest.get("books") or []:
        if isinstance(book, dict):
            slug = str(book.get("slug", "")).strip()
            if slug:
                out[slug] = book
    return out


def audit_books(
    semantic_manifest: dict,
    books_manifest: dict,
) -> list[AuditIssue]:
    issues: list[AuditIssue] = []
    sem_books = _books_by_slug(semantic_manifest)
    cat_books = _books_by_slug(books_manifest)

    sem_slugs = set(sem_books)
    cat_slugs = set(cat_books)

    for slug in sorted(sem_slugs - cat_slugs):
        issues.append(
            _issue(
                severity="error",
                category="book-metadata",
                entity_type="book",
                entity_id=slug,
                entity_title=entity_title(sem_books[slug]),
                field="manifest",
                current_value="semantic-manifest only",
                reason="Book exists in semantic-manifest but not books-manifest.",
                suggested_fix="Regenerate books-manifest with make generate-books-manifest.",
            )
        )
    for slug in sorted(cat_slugs - sem_slugs):
        issues.append(
            _issue(
                severity="warning",
                category="book-metadata",
                entity_type="book",
                entity_id=slug,
                entity_title=entity_title(cat_books[slug]),
                field="manifest",
                current_value="books-manifest only",
                reason="Book exists in books-manifest but not semantic-manifest.",
                suggested_fix="Regenerate semantic-manifest or add book to semantic graph.",
            )
        )

    for slug in sorted(sem_slugs & cat_slugs):
        sem = sem_books[slug]
        cat = cat_books[slug]
        for fname in ("title", "status", "slug"):
            sem_val = str(sem.get(fname, "")).strip()
            cat_val = str(cat.get(fname, "")).strip()
            if sem_val and cat_val and sem_val != cat_val:
                issues.append(
                    _issue(
                        severity="error" if fname == "slug" else "warning",
                        category="manifest-consistency",
                        entity_type="book",
                        entity_id=slug,
                        entity_title=entity_title(sem),
                        field=fname,
                        current_value={"semantic": sem_val, "books": cat_val},
                        reason=f"Conflicting {fname} between manifests.",
                        suggested_fix="Regenerate manifests from canonical book specs.",
                    )
                )

    title_map: dict[str, list[str]] = defaultdict(list)
    for slug, book in sem_books.items():
        title_map[_collapse_ws(entity_title(book))].append(slug)
    for title, slugs in title_map.items():
        if len(slugs) > 1:
            issues.append(
                _issue(
                    severity="warning",
                    category="book-metadata",
                    entity_type="book",
                    entity_id=slugs[0],
                    entity_title=title,
                    field="title",
                    current_value=slugs,
                    reason="Duplicate or near-duplicate book titles.",
                    suggested_fix="Model editions explicitly or differentiate titles.",
                )
            )

    concept_counts = [len(get_list(b, "concepts")) for b in sem_books.values()]
    if len(concept_counts) >= 5:
        sorted_counts = sorted(concept_counts)
        p10 = sorted_counts[len(sorted_counts) // 10]
        p90 = sorted_counts[int(len(sorted_counts) * 0.9)]
        for slug, book in sem_books.items():
            count = len(get_list(book, "concepts"))
            if count < p10:
                issues.append(
                    _issue(
                        severity="info",
                        category="book-metadata",
                        entity_type="book",
                        entity_id=slug,
                        entity_title=entity_title(book),
                        field="concepts",
                        current_value=count,
                        reason="Book has unusually few concepts compared to peers.",
                    )
                )
            elif count > p90:
                issues.append(
                    _issue(
                        severity="info",
                        category="book-metadata",
                        entity_type="book",
                        entity_id=slug,
                        entity_title=entity_title(book),
                        field="concepts",
                        current_value=count,
                        reason="Book has unusually many concepts compared to peers.",
                    )
                )

    published = [b for b in sem_books.values() if str(b.get("status", "")) == "published"]
    if published:
        avg_sources = statistics.mean(len(get_list(b, "sources")) for b in published)
        avg_patterns = statistics.mean(len(get_list(b, "patterns")) for b in published)
        for slug, book in sem_books.items():
            if str(book.get("status", "")) != "published":
                continue
            if not get_list(book, "sources") and avg_sources > 2:
                issues.append(
                    _issue(
                        severity="info",
                        category="book-metadata",
                        entity_type="book",
                        entity_id=slug,
                        entity_title=entity_title(book),
                        field="sources",
                        current_value=[],
                        reason="Published book has no sources while peers typically do.",
                    )
                )
            if not get_list(book, "patterns") and avg_patterns > 2:
                issues.append(
                    _issue(
                        severity="info",
                        category="book-metadata",
                        entity_type="book",
                        entity_id=slug,
                        entity_title=entity_title(book),
                        field="patterns",
                        current_value=[],
                        reason="Published book has no patterns while peers typically do.",
                    )
                )

    return issues


def audit_manifest_staleness(
    paths: dict[str, Path | None],
    semantic_manifest: dict,
    books_manifest: dict,
) -> list[AuditIssue]:
    issues: list[AuditIssue] = []
    for label, build_key, snap_key in (
        ("semantic", "semantic_build", "semantic_snapshot"),
        ("books", "books_build", "books_snapshot"),
    ):
        build_path = paths.get(build_key)
        snap_path = paths.get(snap_key)
        if not build_path or not snap_path or not build_path.is_file() or not snap_path.is_file():
            continue
        build_doc = _load_json(build_path)
        snap_doc = _load_json(snap_path)
        build_at = str(build_doc.get("generatedAt", ""))
        snap_at = str(snap_doc.get("generatedAt", ""))
        if build_at and snap_at and snap_at < build_at:
            issues.append(
                _issue(
                    severity="info",
                    category="manifest-consistency",
                    entity_type="manifest",
                    entity_id=label,
                    entity_title=label,
                    field="generatedAt",
                    current_value={"build": build_at, "snapshot": snap_at},
                    reason="Portfolio audit snapshot appears older than build manifest.",
                    suggested_fix="Regenerate docs/portfolio-audit/data/* per docs/portfolio-audit/data/README.md.",
                )
            )
        build_count = len(build_doc.get("books") or [])
        snap_count = len(snap_doc.get("books") or [])
        if build_count != snap_count:
            issues.append(
                _issue(
                    severity="info",
                    category="manifest-consistency",
                    entity_type="manifest",
                    entity_id=label,
                    entity_title=label,
                    field="bookCount",
                    current_value={"build": build_count, "snapshot": snap_count},
                    reason="Book counts differ between build and portfolio-audit snapshot.",
                    suggested_fix="Regenerate snapshot manifests.",
                )
            )

    if semantic_manifest and books_manifest:
        sem_book_count = len(semantic_manifest.get("books") or [])
        cat_book_count = len(books_manifest.get("books") or [])
        if sem_book_count != cat_book_count:
            issues.append(
                _issue(
                    severity="warning",
                    category="manifest-consistency",
                    entity_type="manifest",
                    entity_id="books",
                    entity_title="books",
                    field="count",
                    current_value={"semantic": sem_book_count, "books": cat_book_count},
                    reason="Book counts differ between semantic-manifest and books-manifest.",
                    suggested_fix="Regenerate both manifests from canonical book specs.",
                )
            )

    return issues


def _collect_relationship_rows(repo: Path, semantic_manifest: dict) -> list[dict]:
    rows: list[dict] = []
    rel_path = repo / SEMANTIC / "relationships.yml"
    rel_doc = _load_yaml(rel_path)
    for row in rel_doc.get("relationships") or []:
        if isinstance(row, dict):
            rows.append(
                {
                    "source": str(row.get("source", "")).strip(),
                    "target": str(row.get("target", "")).strip(),
                    "relationship": str(row.get("relationship", "")).strip() or "related",
                    "description": str(row.get("description", "")).strip(),
                    "sourceKind": str(row.get("sourceKind", "concept")).strip().lower(),
                    "targetKind": str(row.get("targetKind", "concept")).strip().lower(),
                    "origin": "relationships.yml",
                }
            )

    tensions_doc = _load_yaml(repo / SEMANTIC / "ontology" / "structural-tensions.yml")
    for row in tensions_doc.get("tensions") or []:
        if isinstance(row, dict):
            rows.append(
                {
                    "source": str(row.get("source", "")).strip(),
                    "target": str(row.get("target", "")).strip(),
                    "relationship": "structural_tension",
                    "description": str(row.get("description", "")).strip(),
                    "sourceKind": "concept",
                    "targetKind": "concept",
                    "origin": "structural-tensions.yml",
                }
            )

    for row in semantic_manifest.get("relationships") or []:
        if isinstance(row, dict):
            src = str(row.get("source", "")).strip()
            tgt = str(row.get("target", "")).strip()
            rows.append(
                {
                    "source": _strip_id_prefix(src),
                    "target": _strip_id_prefix(tgt),
                    "relationship": str(row.get("relationship", "")).strip() or "related",
                    "description": str(row.get("description", "")).strip(),
                    "sourceKind": _infer_entity_type(src),
                    "targetKind": _infer_entity_type(tgt),
                    "origin": "semantic-manifest",
                    "sourceId": src,
                    "targetId": tgt,
                }
            )
    return rows


def audit_relationships(
    repo: Path,
    semantic_manifest: dict,
    *,
    concept_slugs: set[str],
    pattern_slugs: set[str],
    source_slugs: set[str],
    thinker_slugs: set[str],
) -> tuple[list[AuditIssue], list[VocabEntry], dict[str, list[dict]]]:
    issues: list[AuditIssue] = []
    rows = _collect_relationship_rows(repo, semantic_manifest)

    slug_index: dict[str, set[str]] = {
        "concept": concept_slugs,
        "pattern": pattern_slugs,
        "source": source_slugs,
        "thinker": thinker_slugs,
    }

    seen_edges: Counter[tuple[str, str, str, str, str]] = Counter()
    vocab_counter: Counter[tuple[str, str, str]] = Counter()
    vocab_examples: dict[tuple[str, str, str], list[dict]] = defaultdict(list)
    degree: dict[str, int] = defaultdict(int)

    for row in rows:
        sk = row["sourceKind"]
        tk = row["targetKind"]
        src = row["source"]
        tgt = row["target"]
        label = row["relationship"]

        if sk in slug_index and src and src not in slug_index[sk]:
            issues.append(
                _issue(
                    severity="error",
                    category="relationship-quality",
                    entity_type="relationship",
                    entity_id=f"{src}->{tgt}",
                    entity_title=label,
                    field="source",
                    current_value=src,
                    reason="Relationship points to missing source entity.",
                    suggested_fix="Fix slug or add missing entity.",
                )
            )
        if tk in slug_index and tgt and tgt not in slug_index[tk]:
            issues.append(
                _issue(
                    severity="error",
                    category="relationship-quality",
                    entity_type="relationship",
                    entity_id=f"{src}->{tgt}",
                    entity_title=label,
                    field="target",
                    current_value=tgt,
                    reason="Relationship points to missing target entity.",
                    suggested_fix="Fix slug or add missing entity.",
                )
            )

        if not label:
            issues.append(
                _issue(
                    severity="warning",
                    category="relationship-quality",
                    entity_type="relationship",
                    entity_id=f"{src}->{tgt}",
                    entity_title="",
                    field="relationship",
                    current_value="",
                    reason="Relationship has missing label.",
                )
            )
        elif label not in ALLOWED_RELATIONSHIP_TYPES:
            issues.append(
                _issue(
                    severity="warning",
                    category="relationship-quality",
                    entity_type="relationship",
                    entity_id=f"{src}->{tgt}",
                    entity_title=label,
                    field="relationship",
                    current_value=label,
                    reason="Unsupported or undocumented relationship label.",
                    suggested_fix="Use a documented type from docs/semantic-relationship-types.md.",
                )
            )

        if not row.get("description"):
            issues.append(
                _issue(
                    severity="info",
                    category="relationship-quality",
                    entity_type="relationship",
                    entity_id=f"{src}->{tgt}",
                    entity_title=label,
                    field="description",
                    current_value="",
                    reason="Relationship has empty description.",
                )
            )

        edge_key = (sk, src, tk, tgt, label)
        seen_edges[edge_key] += 1
        if seen_edges[edge_key] > 1 and row.get("origin") == "relationships.yml":
            issues.append(
                _issue(
                    severity="warning",
                    category="relationship-quality",
                    entity_type="relationship",
                    entity_id=f"{src}->{tgt}",
                    entity_title=label,
                    field="duplicate",
                    current_value=seen_edges[edge_key],
                    reason="Duplicate relationship edge.",
                    suggested_fix="Remove duplicate entry from relationships.yml.",
                )
            )

        vocab_key = (label, sk, tk)
        vocab_counter[vocab_key] += 1
        if len(vocab_examples[vocab_key]) < 3:
            vocab_examples[vocab_key].append({"source": src, "target": tgt})

        if src:
            degree[f"{sk}:{src}"] += 1
        if tgt:
            degree[f"{tk}:{tgt}"] += 1

    for row in rows:
        if row["relationship"] not in SYMMETRIC_RELATIONSHIPS:
            continue
        src, tgt, label = row["source"], row["target"], row["relationship"]
        reverse = any(
            r["source"] == tgt and r["target"] == src and r["relationship"] == label for r in rows
        )
        if not reverse:
            issues.append(
                _issue(
                    severity="info",
                    category="relationship-quality",
                    entity_type="relationship",
                    entity_id=f"{src}->{tgt}",
                    entity_title=label,
                    field="direction",
                    current_value="one-way",
                    reason="Symmetric relationship label used in only one direction.",
                    suggested_fix=f"Consider adding reverse edge {tgt} {label} {src}.",
                )
            )

    vocabulary = [
        VocabEntry(
            label=label,
            sourceType=sk,
            targetType=tk,
            count=count,
            examples=vocab_examples[(label, sk, tk)],
        )
        for (label, sk, tk), count in sorted(vocab_counter.items(), key=lambda x: (-x[1], x[0]))
    ]

    density_stats: dict[str, list[dict]] = {}
    by_type: dict[str, list[int]] = defaultdict(list)
    for key, count in degree.items():
        etype = key.split(":", 1)[0]
        by_type[etype].append(count)

    for etype, counts in by_type.items():
        if not counts:
            continue
        sorted_c = sorted(counts)
        density_stats[etype] = [
            {
                "entityType": etype,
                "min": min(counts),
                "median": statistics.median(counts),
                "max": max(counts),
                "p90": sorted_c[int(len(sorted_c) * 0.9)] if len(sorted_c) >= 10 else max(counts),
                "count": len(counts),
            }
        ]
        p90 = density_stats[etype][0]["p90"]
        for key, count in degree.items():
            if not key.startswith(f"{etype}:"):
                continue
            slug = key.split(":", 1)[1]
            if count >= max(p90, 12) and count == max(
                c for k, c in degree.items() if k.startswith(f"{etype}:")
            ):
                issues.append(
                    _issue(
                        severity="info",
                        category="relationship-quality",
                        entity_type=etype,
                        entity_id=slug,
                        entity_title=slug,
                        field="degree",
                        current_value=count,
                        reason="Entity has extremely high relationship density compared to peers.",
                    )
                )

    return issues, vocabulary, density_stats


def audit_slugs(
    repo: Path,
    *,
    entity_dirs: dict[str, str],
) -> list[AuditIssue]:
    issues: list[AuditIssue] = []
    translit_map: dict[str, dict[str, list[str]]] = defaultdict(lambda: defaultdict(list))

    for etype, subdir in entity_dirs.items():
        dir_path = repo / SEMANTIC / subdir
        if not dir_path.is_dir():
            continue
        for path in sorted(dir_path.glob("*.yml")):
            data = _load_yaml(path)
            slug = str(data.get("slug", path.stem)).strip()
            name = slug_audit_label(data, etype)

            if slug != path.stem:
                issues.append(
                    _issue(
                        severity="error",
                        category="slug-quality",
                        entity_type=etype,
                        entity_id=slug,
                        entity_title=name,
                        field="slug",
                        current_value={"slug": slug, "filename": path.stem},
                        reason="Slug does not match YAML filename stem.",
                        suggested_fix=f"Rename file to {slug}.yml or fix slug field.",
                    )
                )

            if slug != slug.lower():
                issues.append(
                    _issue(
                        severity="warning",
                        category="slug-quality",
                        entity_type=etype,
                        entity_id=slug,
                        entity_title=name,
                        field="slug",
                        current_value=slug,
                        reason="Slug contains unexpected uppercase letters.",
                        suggested_fix="Use lowercase slug.",
                    )
                )
            if slug.startswith("-") or slug.endswith("-") or "--" in slug:
                issues.append(
                    _issue(
                        severity="warning",
                        category="slug-quality",
                        entity_type=etype,
                        entity_id=slug,
                        entity_title=name,
                        field="slug",
                        current_value=slug,
                        reason="Slug has repeated or leading/trailing hyphens.",
                    )
                )
            if re.search(r"[^a-z0-9-]", slug):
                issues.append(
                    _issue(
                        severity="warning",
                        category="slug-quality",
                        entity_type=etype,
                        entity_id=slug,
                        entity_title=name,
                        field="slug",
                        current_value=slug,
                        reason="Slug contains punctuation.",
                    )
                )

            if name:
                expected = transliterate_slug(name)
                translit_map[etype][expected].append(slug)
                if expected and slug != expected and slug == slugify_heading(name):
                    issues.append(
                        _issue(
                            severity="warning",
                            category="slug-quality",
                            entity_type=etype,
                            entity_id=slug,
                            entity_title=name,
                            field="slug",
                            current_value=slug,
                            reason="Slug may be stale after title change (diacritic damage).",
                            suggested_fix=f"Use transliterated slug {expected!r}.",
                        )
                    )

    for etype, by_expected in translit_map.items():
        for expected, slugs in by_expected.items():
            unique = sorted(set(slugs))
            if len(unique) > 1:
                issues.append(
                    _issue(
                        severity="error",
                        category="slug-quality",
                        entity_type=etype,
                        entity_id=unique[0],
                        entity_title=expected,
                        field="slug",
                        current_value=unique,
                        reason="Slug collision after Unicode transliteration normalization.",
                        suggested_fix="Differentiate slugs or merge duplicate entities.",
                    )
                )

    return issues


def _build_ref_indexes(
    sources: dict[str, dict],
    thinkers: dict[str, dict],
    patterns: dict[str, dict],
) -> tuple[dict[str, set[str]], dict[str, set[str]], dict[str, set[str]], dict[str, set[str]]]:
    thinker_concepts: dict[str, set[str]] = defaultdict(set)
    source_concepts: dict[str, set[str]] = defaultdict(set)
    source_patterns: dict[str, set[str]] = defaultdict(set)
    thinker_patterns: dict[str, set[str]] = defaultdict(set)

    for slug, data in thinkers.items():
        for c in get_list(data, "concepts"):
            thinker_concepts[str(c).strip()].add(slug)

    for slug, data in sources.items():
        for c in get_list(data, "concepts"):
            source_concepts[str(c).strip()].add(slug)
        for p in get_list(data, "patterns"):
            source_patterns[str(p).strip()].add(slug)

    for slug, data in patterns.items():
        for s in get_list(data, "relatedSources", "sources"):
            source_patterns[str(s).strip()].add(slug)

    for slug, data in thinkers.items():
        for p in get_list(data, "patterns"):
            thinker_patterns[str(p).strip()].add(slug)

    return thinker_concepts, source_concepts, source_patterns, thinker_patterns


def audit_concept_grounding(repo: Path) -> list[AuditIssue]:
    """Flag sources/thinkers that should link concepts supported by work metadata."""
    issues: list[AuditIssue] = []
    for gap in find_concept_grounding_gaps(repo):
        work_hint = f" (via work {gap.work_slug})" if gap.work_slug else ""
        issues.append(
            _issue(
                severity="warning",
                category="concept-grounding",
                entity_type=gap.entity_type,
                entity_id=gap.entity_id,
                entity_title=gap.entity_title,
                field="concepts",
                current_value=[],
                reason=f"{gap.reason}{work_hint} Suggested concept: {gap.concept!r}.",
                suggested_fix=f"Add {gap.concept!r} to {gap.entity_type} concepts.",
            )
        )
    return issues


def _inbound_concept_counts(repo: Path, concept_slugs: set[str]) -> dict[str, int]:
    counts: dict[str, int] = defaultdict(int)
    rel_doc = _load_yaml(repo / SEMANTIC / "relationships.yml")
    for row in rel_doc.get("relationships") or []:
        if not isinstance(row, dict):
            continue
        for key in ("source", "target"):
            slug = str(row.get(key, "")).strip()
            if slug in concept_slugs:
                counts[slug] += 1

    tensions_doc = _load_yaml(repo / SEMANTIC / "ontology" / "structural-tensions.yml")
    for row in tensions_doc.get("tensions") or []:
        if not isinstance(row, dict):
            continue
        for key in ("source", "target"):
            slug = str(row.get(key, "")).strip()
            if slug in concept_slugs:
                counts[slug] += 1

    glossary = load_entity_dir(repo, "glossary")
    for data in glossary.values():
        for c in get_list(data, "relatedConcepts", "concepts"):
            s = str(c).strip()
            if s in concept_slugs:
                counts[s] += 1

    return dict(counts)


def run_audit(
    repo: Path,
    *,
    semantic_manifest_path: Path | None = None,
    books_manifest_path: Path | None = None,
) -> AuditResult:
    repo = repo.resolve()
    paths = discover_manifest_paths(
        repo,
        semantic_manifest=semantic_manifest_path,
        books_manifest=books_manifest_path,
    )

    input_files: list[str] = []
    for key in ("semantic", "books"):
        p = paths.get(key)
        if p:
            try:
                input_files.append(p.relative_to(repo).as_posix())
            except ValueError:
                input_files.append(p.as_posix())

    semantic_manifest = _load_json(paths["semantic"]) if paths.get("semantic") else {}
    books_manifest = _load_json(paths["books"]) if paths.get("books") else {}

    sources = load_entity_dir(repo, "sources")
    thinkers = load_entity_dir(repo, "thinkers")
    glossary = _load_glossary(repo)
    patterns = _load_patterns(repo)
    concept_slugs = collect_concept_slugs(repo)

    issues: list[AuditIssue] = []

    meta_result = run_metadata_quality_audit(repo)
    issues.extend(_map_quality_issue(i) for i in meta_result.issues)
    issues.extend(audit_sources_extended(repo, sources))
    issues.extend(audit_thinkers(repo, thinkers, sources=sources))
    issues.extend(audit_concept_grounding(repo))

    thinker_concepts, source_concepts, source_patterns, thinker_patterns = _build_ref_indexes(
        sources, thinkers, patterns
    )
    inbound = _inbound_concept_counts(repo, concept_slugs)
    issues.extend(
        audit_concepts(
            repo,
            glossary,
            inbound_counts=inbound,
            thinker_concept_refs=thinker_concepts,
            source_concept_refs=source_concepts,
        )
    )
    issues.extend(
        audit_patterns(
            patterns,
            source_pattern_refs=source_patterns,
            thinker_pattern_refs=thinker_patterns,
        )
    )

    if semantic_manifest and books_manifest:
        issues.extend(audit_books(semantic_manifest, books_manifest))
    issues.extend(audit_manifest_staleness(paths, semantic_manifest, books_manifest))

    rel_issues, vocabulary, density_stats = audit_relationships(
        repo,
        semantic_manifest,
        concept_slugs=concept_slugs,
        pattern_slugs=set(patterns),
        source_slugs=set(sources),
        thinker_slugs=set(thinkers),
    )
    issues.extend(rel_issues)

    issues.extend(
        audit_slugs(
            repo,
            entity_dirs={
                "concept": "glossary",
                "pattern": "patterns",
                "source": "sources",
                "thinker": "thinkers",
                "situation": "situations",
            },
        )
    )

    entities_scanned = {
        "books": len(semantic_manifest.get("books") or []),
        "concepts": len(glossary),
        "patterns": len(patterns),
        "thinkers": len(thinkers),
        "sources": len(sources),
        "relationships": len(semantic_manifest.get("relationships") or []),
    }

    return AuditResult(
        issues=issues,
        relationship_vocabulary=vocabulary,
        density_stats=density_stats,
        entities_scanned=entities_scanned,
        input_files=input_files,
        repo_type="source",
    )


def build_json_report(result: AuditResult) -> dict:
    errors = sum(1 for i in result.issues if i.severity == "error")
    warnings = sum(1 for i in result.issues if i.severity == "warning")
    info = sum(1 for i in result.issues if i.severity == "info")

    return {
        "generatedAt": datetime.now(UTC).isoformat(),
        "repoContext": {
            "detectedRepoType": result.repo_type,
            "inputFiles": result.input_files,
        },
        "summary": {
            "errors": errors,
            "warnings": warnings,
            "info": info,
            "entitiesScanned": result.entities_scanned,
        },
        "issues": [asdict(i) for i in result.issues],
        "relationshipVocabulary": [asdict(v) for v in result.relationship_vocabulary],
        "densityStats": result.density_stats,
    }


def _severity_rank(severity: str) -> int:
    return {"error": 0, "warning": 1, "info": 2}.get(severity, 3)


def format_markdown_report(result: AuditResult) -> str:
    report = build_json_report(result)
    summary = report["summary"]
    lines = [
        "# Semantic graph data-quality audit",
        "",
        "## Executive summary",
        "",
        f"- Repository type: **{result.repo_type}**",
        f"- Input files: {', '.join(result.input_files) or '(YAML only — no manifests found)'}",
        f"- Errors: **{summary['errors']}**",
        f"- Warnings: **{summary['warnings']}**",
        f"- Info: **{summary['info']}**",
        f"- Entities scanned: {summary['entitiesScanned']}",
        "",
    ]

    sorted_issues = sorted(
        result.issues,
        key=lambda i: (_severity_rank(i.severity), i.category, i.entityType, i.entityId or ""),
    )

    lines.extend(["## Top priority issues", ""])
    top = [i for i in sorted_issues if i.severity in ("error", "warning")][:20]
    if top:
        for issue in top:
            fix = f" — *{issue.suggestedFix}*" if issue.suggestedFix else ""
            lines.append(
                f"- **[{issue.severity}]** {issue.category} / {issue.entityType} "
                f"`{issue.entityId}` — {issue.reason}{fix}"
            )
    else:
        lines.append("- No errors or warnings found.")
    lines.append("")

    by_category: Counter[str] = Counter(i.category for i in result.issues)
    lines.extend(["## Issue counts by category", ""])
    for cat, count in sorted(by_category.items(), key=lambda x: (-x[1], x[0])):
        lines.append(f"- {cat}: {count}")
    lines.append("")

    lines.extend(["## Relationship vocabulary (top labels)", ""])
    for entry in result.relationship_vocabulary[:15]:
        lines.append(
            f"- `{entry.label}` ({entry.sourceType} → {entry.targetType}): "
            f"{entry.count} — e.g. {entry.examples[:2]}"
        )
    lines.append("")

    sparse_thinkers = [
        i.entityId
        for i in result.issues
        if i.category == "thinker-metadata" and i.field == "links" and i.severity != "error"
    ][:10]
    if sparse_thinkers:
        lines.extend(["## Sparsely connected thinkers", ""])
        for slug in sparse_thinkers:
            lines.append(f"- `{slug}`")
        lines.append("")

    dupes = [
        i
        for i in result.issues
        if "duplicate" in i.reason.lower() or "near-duplicate" in i.reason.lower()
    ]
    if dupes:
        lines.extend(["## Suspected duplicates", ""])
        for issue in dupes[:15]:
            lines.append(f"- {issue.entityType} `{issue.entityId}`: {issue.reason}")
        lines.append("")

    stale = [i for i in result.issues if i.category == "manifest-consistency"]
    if stale:
        lines.extend(["## Stale or divergent manifests", ""])
        for issue in stale[:15]:
            lines.append(f"- {issue.reason} (`{issue.entityId}`)")
        lines.append("")

    lines.extend(
        [
            "## Recommended next fixes",
            "",
            "1. Fix **error**-severity issues first (dangling refs, manifest divergence, bad years).",
            "2. Address **warning**-severity metadata and slug issues.",
            "3. For original-synthesis patterns, add optional `evidenceType` or `grounding` (no schema break).",
            "4. Regenerate manifests: `make verify-semantic-manifest` and `make verify-books-manifest`.",
            "5. Future: optional `auditWaivers` YAML for known false positives.",
            "",
            "## Full issue list",
            "",
        ]
    )

    current_severity = None
    for issue in sorted_issues:
        if issue.severity != current_severity:
            current_severity = issue.severity
            lines.append(f"### {current_severity.title()}")
            lines.append("")
        title = issue.entityTitle or issue.entityId or "?"
        lines.append(
            f"- **{issue.category}** — {issue.entityType} `{issue.entityId}` ({title}): "
            f"{issue.reason}"
        )
    lines.append("")
    return "\n".join(lines)
