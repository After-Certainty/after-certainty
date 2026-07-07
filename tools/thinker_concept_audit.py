"""
Shared thinker/source concept audit helpers.

Used by tools/audit_thinker_concepts.py (markdown report) and
tools/validate_semantic_entities.py (advisory warnings).
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

SEMANTIC = Path("semantic")

PRIORITY_THINKER_SLUGS = frozenset(
    {
        "alistair-cockburn",
        "john-dewey",
        "niklas-luhmann",
        "ronald-a-heifetz",
        "philip-selznick",
        "herbert-a-simon",
        "donella-h-meadows",
        "elinor-ostrom",
        "james-reason",
        "nancy-g-leveson",
        "sidney-dekker",
        "karl-e-weick",
        "chris-argyris",
        "amy-c-edmondson",
        "hannah-arendt",
        "max-weber",
        "james-c-scott",
    }
)

# Conservative title/summary phrase -> concept slug(s). Only existing glossary slugs.
TITLE_HEURISTICS: list[tuple[re.Pattern[str], list[str]]] = [
    (re.compile(r"\bagile\b|heart of agile", re.I), ["agile"]),
    (re.compile(r"hexagonal|ports and adapters", re.I), ["hexagonal-architecture"]),
    (re.compile(r"guest leadership|step(?:ping)? up", re.I), ["guest-leadership"]),
    (re.compile(r"drift into failure", re.I), ["drift"]),
    (re.compile(r"thinking in systems", re.I), ["feedback", "coupling", "system"]),
    (re.compile(r"what is authority", re.I), ["authority"]),
    (re.compile(r"seeing like a state", re.I), ["legibility", "abstraction"]),
    (re.compile(r"trust and power", re.I), ["trust"]),
    (
        re.compile(r"governing the commons", re.I),
        ["governance-coupling", "reciprocity", "coordination"],
    ),
    (re.compile(r"just culture", re.I), ["accountability", "harm", "trust"]),
    (
        re.compile(r"leadership without easy answers", re.I),
        ["authority", "adaptability", "uncertainty"],
    ),
    (
        re.compile(r"administrative behavior", re.I),
        ["judgment", "constraints", "finite-perspective"],
    ),
    (re.compile(r"public and its problems", re.I), ["public-interpretation"]),
    (re.compile(r"quest for certainty", re.I), ["judgment", "correction"]),
    (
        re.compile(r"engineering a safer world", re.I),
        ["consequence-architecture", "coupling", "system"],
    ),
    (re.compile(r"human error", re.I), ["harm", "accountability", "feedback"]),
    (re.compile(r"sensemaking", re.I), ["meaning", "interpretation", "coherence-maintenance"]),
    (re.compile(r"organizational learning", re.I), ["correction", "feedback", "contestability"]),
    (re.compile(r"responsibility and judgment", re.I), ["judgment", "responsibility"]),
    (
        re.compile(r"origins of totalitarianism", re.I),
        ["total-authority", "coercion", "legitimacy"],
    ),
    (re.compile(r"economy and society", re.I), ["authority", "bureaucracy", "legitimacy"]),
    (re.compile(r"politics as a vocation", re.I), ["authority", "legitimacy"]),
    (re.compile(r"psychological safety", re.I), ["trust", "contestability", "correction"]),
    (re.compile(r"social systems", re.I), ["system", "coherence-maintenance"]),
]

MISSING_CONCEPT_CANDIDATES = frozenset(
    {
        "learning",
        "participation",
        "leadership",
        "inquiry",
        "blame",
        "narrative",
        "communication",
        "complexity",
        "local-knowledge",
        "bounded-rationality",
        "rationalization",
        "defensive-routines",
    }
)


def _load_yaml(path: Path) -> dict:
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    return raw if isinstance(raw, dict) else {}


def collect_concept_slugs(repo: Path) -> set[str]:
    slugs: set[str] = set()
    for fname in ("core-terms.yml", "supporting-terms.yml"):
        path = repo / SEMANTIC / "ontology" / fname
        if not path.is_file():
            continue
        doc = _load_yaml(path)
        for row in doc.get("terms") or []:
            if isinstance(row, dict):
                s = str(row.get("slug", "")).strip()
                if s:
                    slugs.add(s)
    gloss_dir = repo / SEMANTIC / "glossary"
    if gloss_dir.is_dir():
        for path in gloss_dir.glob("*.yml"):
            doc = _load_yaml(path)
            s = str(doc.get("slug", path.stem)).strip()
            if s:
                slugs.add(s)
    return slugs


def collect_thinker_slugs(repo: Path) -> set[str]:
    slugs: set[str] = set()
    thinkers_dir = repo / SEMANTIC / "thinkers"
    if not thinkers_dir.is_dir():
        return slugs
    for path in thinkers_dir.glob("*.yml"):
        doc = _load_yaml(path)
        s = str(doc.get("slug", path.stem)).strip()
        if s:
            slugs.add(s)
    return slugs


def load_entity_dir(repo: Path, subdir: str) -> dict[str, dict]:
    out: dict[str, dict] = {}
    dir_path = repo / SEMANTIC / subdir
    if not dir_path.is_dir():
        return out
    for path in sorted(dir_path.glob("*.yml")):
        doc = _load_yaml(path)
        slug = str(doc.get("slug", path.stem)).strip()
        if slug:
            out[slug] = doc
    return out


def _normalize_slug_list(items: object) -> list[str]:
    if not isinstance(items, list):
        return []
    out: list[str] = []
    seen: set[str] = set()
    for raw in items:
        s = str(raw).strip().removeprefix("concept-")
        if s and s not in seen:
            seen.add(s)
            out.append(s)
    return out


def _collapse_ws(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip()).lower()


def title_heuristic_concepts(text: str, *, valid_slugs: set[str]) -> set[str]:
    found: set[str] = set()
    for pattern, concepts in TITLE_HEURISTICS:
        if pattern.search(text):
            for c in concepts:
                if c in valid_slugs:
                    found.add(c)
    return found


def text_match_concepts(text: str, valid_slugs: set[str]) -> set[str]:
    collapsed = _collapse_ws(text)
    if not collapsed:
        return set()
    found: set[str] = set()
    for slug in valid_slugs:
        phrase = slug.replace("-", " ")
        if phrase in collapsed or slug in collapsed:
            found.add(slug)
    return found


def source_text_blob(source: dict) -> str:
    parts = [
        str(source.get("title", "")),
        str(source.get("name", "")),
        str(source.get("summary", "")),
        str(source.get("citation", "")),
        str(source.get("whyThisMatters", "")),
    ]
    return " ".join(parts)


def thinker_text_blob(thinker: dict, works: list[dict]) -> str:
    parts = [
        str(thinker.get("summary", "")),
        str(thinker.get("whyThisMatters", "")),
    ]
    for work in works:
        parts.append(source_text_blob(work))
    return " ".join(parts)


@dataclass
class SourceAudit:
    slug: str
    title: str
    concepts: list[str]
    heuristic_candidates: list[str]
    empty_with_heuristic: bool


@dataclass
class ThinkerAudit:
    slug: str
    name: str
    thinker_type: str
    concepts: list[str]
    works: list[str]
    work_concepts: list[str]
    text_matches: list[str]
    heuristic_matches: list[str]
    candidate_missing: list[str]
    suspicious_current: list[str]
    unknown_slugs: list[str]
    sources: list[SourceAudit] = field(default_factory=list)
    empty_concepts_and_works: bool = False


@dataclass
class AuditResult:
    thinkers: list[ThinkerAudit]
    priority_thinkers: list[ThinkerAudit]
    type_anomalies: list[tuple[str, str, str]]
    creator_slug_mismatches: list[tuple[str, str]]
    missing_concept_mentions: list[tuple[str, str]]
    stats: dict[str, int]


def audit_thinker(
    thinker: dict,
    *,
    sources: dict[str, dict],
    valid_slugs: set[str],
) -> ThinkerAudit:
    slug = str(thinker.get("slug", "")).strip()
    works_slugs = _normalize_slug_list(thinker.get("works"))
    current = _normalize_slug_list(thinker.get("concepts"))

    work_rows: list[dict] = []
    work_concepts_set: set[str] = set()
    source_audits: list[SourceAudit] = []
    heuristic_all: set[str] = set()
    text_all: set[str] = set()

    for work_slug in works_slugs:
        work = sources.get(work_slug, {})
        work_rows.append(work)
        wc = _normalize_slug_list(work.get("concepts"))
        work_concepts_set.update(wc)
        blob = source_text_blob(work)
        heur = title_heuristic_concepts(blob, valid_slugs=valid_slugs)
        heuristic_all.update(heur)
        text_all.update(text_match_concepts(blob, valid_slugs))
        source_audits.append(
            SourceAudit(
                slug=work_slug,
                title=str(work.get("title", work.get("name", work_slug))),
                concepts=wc,
                heuristic_candidates=sorted(heur),
                empty_with_heuristic=not wc and bool(heur),
            )
        )

    thinker_blob = thinker_text_blob(thinker, work_rows)
    text_all.update(text_match_concepts(thinker_blob, valid_slugs))
    heuristic_all.update(title_heuristic_concepts(thinker_blob, valid_slugs=valid_slugs))

    supported = work_concepts_set | text_all | heuristic_all
    candidate_missing = sorted(supported - set(current))
    suspicious = sorted(set(current) - supported)
    unknown = sorted(set(current) - valid_slugs)

    return ThinkerAudit(
        slug=slug,
        name=str(thinker.get("name", slug)),
        thinker_type=str(thinker.get("type", "person")),
        concepts=current,
        works=works_slugs,
        work_concepts=sorted(work_concepts_set),
        text_matches=sorted(text_all),
        heuristic_matches=sorted(heuristic_all),
        candidate_missing=candidate_missing,
        suspicious_current=suspicious,
        unknown_slugs=unknown,
        sources=source_audits,
        empty_concepts_and_works=not current and not work_concepts_set,
    )


def find_creator_slug_mismatches(
    sources: dict[str, dict], thinker_slugs: set[str]
) -> list[tuple[str, str]]:
    mismatches: list[tuple[str, str]] = []
    for slug, data in sorted(sources.items()):
        creator_slugs = data.get("creatorSlugs")
        if not isinstance(creator_slugs, list):
            continue
        for raw in creator_slugs:
            cs = str(raw).strip()
            if cs and cs not in thinker_slugs:
                mismatches.append((slug, cs))
    return mismatches


def find_type_anomalies(thinkers: dict[str, dict]) -> list[tuple[str, str, str]]:
    anomalies: list[tuple[str, str, str]] = []
    org_indicators = re.compile(
        r"\b(foundation|commission|board|administration|bank|church|collaboration|"
        r"institute|organization|department|nasa|faa|owasp|iso)\b",
        re.I,
    )
    for slug, data in sorted(thinkers.items()):
        ttype = str(data.get("type", "person")).strip().lower()
        name = str(data.get("name", "")).strip()
        if ttype == "organization" and not org_indicators.search(name):
            if " and " not in name.lower() and "," not in name:
                anomalies.append((slug, name, ttype))
    return anomalies


def find_missing_concept_mentions(
    thinkers: dict[str, dict], sources: dict[str, dict]
) -> list[tuple[str, str]]:
    mentions: list[tuple[str, str]] = []
    pattern = re.compile(
        r"\b(" + "|".join(re.escape(c) for c in sorted(MISSING_CONCEPT_CANDIDATES)) + r")\b",
        re.I,
    )
    for slug, data in {**thinkers, **sources}.items():
        blob = _collapse_ws(
            str(data.get("summary", ""))
            + " "
            + str(data.get("whyThisMatters", ""))
            + " "
            + str(data.get("title", ""))
        )
        for match in pattern.finditer(blob):
            mentions.append((slug, match.group(1).lower()))
    seen: set[tuple[str, str]] = set()
    out: list[tuple[str, str]] = []
    for item in mentions:
        if item not in seen:
            seen.add(item)
            out.append(item)
    return sorted(out)


def run_audit(repo: Path) -> AuditResult:
    repo = repo.resolve()
    valid_slugs = collect_concept_slugs(repo)
    thinker_slugs = collect_thinker_slugs(repo)
    thinkers = load_entity_dir(repo, "thinkers")
    sources = load_entity_dir(repo, "sources")

    audits: list[ThinkerAudit] = []
    for slug in sorted(thinkers):
        audits.append(audit_thinker(thinkers[slug], sources=sources, valid_slugs=valid_slugs))

    priority = [a for a in audits if a.slug in PRIORITY_THINKER_SLUGS]

    empty_thinkers = sum(1 for a in audits if not a.concepts)
    empty_both = sum(1 for a in audits if a.empty_concepts_and_works)
    work_orphans = sum(1 for a in audits if not a.concepts and a.work_concepts)
    suspicious_count = sum(1 for a in audits if a.suspicious_current)

    return AuditResult(
        thinkers=audits,
        priority_thinkers=priority,
        type_anomalies=find_type_anomalies(thinkers),
        creator_slug_mismatches=find_creator_slug_mismatches(sources, thinker_slugs),
        missing_concept_mentions=find_missing_concept_mentions(thinkers, sources),
        stats={
            "thinkers": len(audits),
            "emptyConceptThinkers": empty_thinkers,
            "emptyConceptAndWorkConcepts": empty_both,
            "workConceptOrphans": work_orphans,
            "suspiciousAssociations": suspicious_count,
            "sources": len(sources),
            "sourcesEmptyConcepts": sum(
                1 for s in sources.values() if not _normalize_slug_list(s.get("concepts"))
            ),
        },
    )


def collect_advisory_warnings(repo: Path) -> list[str]:
    result = run_audit(repo)
    warnings: list[str] = []
    for audit in result.thinkers:
        if audit.empty_concepts_and_works:
            warnings.append(f"thinker {audit.slug!r}: no concepts and no concepts on works")
        for src in audit.sources:
            if src.empty_with_heuristic:
                warnings.append(
                    f"source {src.slug!r}: empty concepts but title suggests "
                    f"{src.heuristic_candidates!r}"
                )
        for concept in audit.suspicious_current:
            warnings.append(
                f"thinker {audit.slug!r}: suspicious concept {concept!r} "
                f"(not supported by works or text matches)"
            )
    return warnings


@dataclass(frozen=True)
class ConceptGroundingGap:
    """Conservative source/thinker concept link missing from the graph."""

    entity_type: str
    entity_id: str
    entity_title: str
    concept: str
    work_slug: str | None
    reason: str


def work_supported_concepts(work: dict, *, valid_slugs: set[str]) -> set[str]:
    """Concepts explicitly on a work plus conservative title-heuristic matches."""
    supported = set(_normalize_slug_list(work.get("concepts")))
    supported.update(title_heuristic_concepts(source_text_blob(work), valid_slugs=valid_slugs))
    return supported


def find_concept_grounding_gaps(repo: Path) -> list[ConceptGroundingGap]:
    """
    Find sources and thinkers that should link a concept based on work metadata.

    Uses explicit work concepts and TITLE_HEURISTICS only (not broad text matching).
    """
    repo = repo.resolve()
    valid_slugs = collect_concept_slugs(repo)
    thinkers = load_entity_dir(repo, "thinkers")
    sources = load_entity_dir(repo, "sources")
    gaps: list[ConceptGroundingGap] = []

    for slug, data in sorted(sources.items()):
        current = set(_normalize_slug_list(data.get("concepts")))
        suggested = work_supported_concepts(data, valid_slugs=valid_slugs)
        title = str(data.get("title", data.get("name", slug))).strip()
        for concept in sorted(suggested - current):
            gaps.append(
                ConceptGroundingGap(
                    entity_type="source",
                    entity_id=slug,
                    entity_title=title,
                    concept=concept,
                    work_slug=None,
                    reason="Source title or summary matches a concept heuristic but concepts is empty.",
                )
            )

    for slug, data in sorted(thinkers.items()):
        current = set(_normalize_slug_list(data.get("concepts")))
        name = str(data.get("name", slug)).strip()
        works = _normalize_slug_list(data.get("works"))
        supported: dict[str, str | None] = {}
        for work_slug in works:
            work = sources.get(work_slug, {})
            for concept in work_supported_concepts(work, valid_slugs=valid_slugs):
                supported.setdefault(concept, work_slug)
        for concept in sorted(set(supported) - current):
            work_slug = supported[concept]
            gaps.append(
                ConceptGroundingGap(
                    entity_type="thinker",
                    entity_id=slug,
                    entity_title=name,
                    concept=concept,
                    work_slug=work_slug,
                    reason="Linked work supports this concept but thinker.concepts omits it.",
                )
            )

    return gaps


def format_thinker_section(audit: ThinkerAudit, *, detailed: bool) -> list[str]:
    lines = [
        f"### {audit.name} (`{audit.slug}`)",
        "",
        f"- **Type:** {audit.thinker_type}",
        f"- **Current concepts:** {', '.join(audit.concepts) or '_(none)_'}",
        f"- **Works:** {len(audit.works)}",
        f"- **Work concepts (union):** {', '.join(audit.work_concepts) or '_(none)_'}",
    ]
    if audit.candidate_missing:
        lines.append(f"- **Candidate missing:** {', '.join(audit.candidate_missing)}")
    if audit.suspicious_current:
        lines.append(f"- **Suspicious current:** {', '.join(audit.suspicious_current)}")
    if audit.unknown_slugs:
        lines.append(f"- **Unknown slugs:** {', '.join(audit.unknown_slugs)}")
    if detailed:
        lines.append("")
        lines.append(
            "**Text/heuristic matches:** "
            + (
                ", ".join(sorted(set(audit.text_matches) | set(audit.heuristic_matches)))
                or "_(none)_"
            )
        )
        if audit.sources:
            lines.append("")
            lines.append("| Work | Concepts | Heuristic candidates |")
            lines.append("|------|----------|----------------------|")
            for src in audit.sources:
                hc = ", ".join(src.heuristic_candidates) or "—"
                concepts = ", ".join(src.concepts) or "_(empty)_"
                title = src.title.replace("|", "\\|")[:60]
                lines.append(f"| {title} | {concepts} | {hc} |")
    lines.append("")
    return lines


def format_report(result: AuditResult) -> str:
    lines = [
        "# Thinker concept audit",
        "",
        "## Executive summary",
        "",
        f"- Thinkers audited: **{result.stats['thinkers']}**",
        f"- Thinkers with empty concepts: **{result.stats['emptyConceptThinkers']}**",
        f"- Thinkers with no concepts on thinker or works: **{result.stats['emptyConceptAndWorkConcepts']}**",
        f"- Thinkers with work concepts but empty thinker concepts: **{result.stats['workConceptOrphans']}**",
        f"- Thinkers with suspicious current concepts: **{result.stats['suspiciousAssociations']}**",
        f"- Sources with empty concepts: **{result.stats['sourcesEmptyConcepts']}** / {result.stats['sources']}",
        "",
        "## Priority thinkers (detailed)",
        "",
    ]
    for audit in sorted(result.priority_thinkers, key=lambda a: a.slug):
        lines.extend(format_thinker_section(audit, detailed=True))

    lines.extend(
        [
            "## All thinkers (summary)",
            "",
            "| Thinker | Concepts | Missing | Suspicious |",
            "|---------|----------|---------|------------|",
        ]
    )
    for audit in result.thinkers:
        concepts = ", ".join(audit.concepts[:4])
        if len(audit.concepts) > 4:
            concepts += "…"
        missing = ", ".join(audit.candidate_missing[:3])
        if len(audit.candidate_missing) > 3:
            missing += "…"
        suspicious = ", ".join(audit.suspicious_current[:3])
        if len(audit.suspicious_current) > 3:
            suspicious += "…"
        lines.append(
            f"| {audit.name} | {concepts or '—'} | {missing or '—'} | {suspicious or '—'} |"
        )

    lines.extend(["", "## Appendix: type anomalies", ""])
    if result.type_anomalies:
        lines.append("| Slug | Name | Type |")
        lines.append("|------|------|------|")
        for slug, name, ttype in result.type_anomalies:
            lines.append(f"| `{slug}` | {name} | {ttype} |")
    else:
        lines.append("_(none detected)_")

    lines.extend(["", "## Appendix: creatorSlugs mismatches", ""])
    if result.creator_slug_mismatches:
        for source_slug, creator_slug in result.creator_slug_mismatches:
            lines.append(f"- `{source_slug}` → `{creator_slug}` (no matching thinker)")
    else:
        lines.append("_(none)_")

    lines.extend(["", "## Appendix: missing concept slugs mentioned in text", ""])
    if result.missing_concept_mentions:
        by_concept: dict[str, list[str]] = {}
        for entity_slug, concept in result.missing_concept_mentions:
            by_concept.setdefault(concept, []).append(entity_slug)
        for concept in sorted(by_concept):
            lines.append(
                f"- **{concept}** — mentioned in: {', '.join(f'`{s}`' for s in by_concept[concept][:8])}"
            )
    else:
        lines.append("_(none)_")

    lines.append("")
    return "\n".join(lines)
