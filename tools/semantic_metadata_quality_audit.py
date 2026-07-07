"""
Shared semantic source/thinker metadata quality audit helpers.

Used by tools/audit_semantic_metadata_quality.py (markdown report) and
tools/validate_semantic_entities.py (advisory warnings).
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path

from source_metadata import (  # noqa: E402
    _NAME_SEPARATORS,
    split_display_name,
    strip_markdown_italics,
)
from thinker_concept_audit import load_entity_dir  # noqa: E402

SEMANTIC = Path("semantic")

_ITALIC_IN_DISPLAY_RE = re.compile(r"\*[^*]+\*")
_PLACEHOLDER_SUMMARY_RE = re.compile(
    r"edit summary before promotion|Canonical thinker entry for source grouping",
    re.I,
)


@dataclass
class QualityIssue:
    entity_kind: str  # "source" | "thinker"
    slug: str
    check: str
    severity: str  # "critical" | "warning" | "info"
    detail: str


@dataclass
class MetadataQualityResult:
    issues: list[QualityIssue] = field(default_factory=list)
    stats: dict[str, int] = field(default_factory=dict)


def _has_name_separator(name: str) -> bool:
    return any(sep in name for sep in _NAME_SEPARATORS)


def _normalize_author_key(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", strip_markdown_italics(name).lower()).strip()


def _markdown_in_display(text: str) -> bool:
    return bool(_ITALIC_IN_DISPLAY_RE.search(text))


def _audit_source(slug: str, data: dict, thinkers: dict[str, dict]) -> list[QualityIssue]:
    issues: list[QualityIssue] = []
    name = str(data.get("name", "")).strip()
    title = str(data.get("title", "")).strip()
    institution = str(data.get("institution", "")).strip()
    creator_names = data.get("creatorNames") or []
    creator_slugs = data.get("creatorSlugs") or []

    for field_name, value in (
        ("name", name),
        ("institution", institution),
    ):
        if value and _markdown_in_display(value):
            issues.append(
                QualityIssue(
                    "source",
                    slug,
                    "markdown_in_display",
                    "critical",
                    f"{field_name} contains markdown italics: {value!r}",
                )
            )

    for idx, cn in enumerate(creator_names):
        cn_s = str(cn).strip()
        if cn_s and _markdown_in_display(cn_s):
            issues.append(
                QualityIssue(
                    "source",
                    slug,
                    "markdown_in_display",
                    "critical",
                    f"creatorNames[{idx}] contains markdown italics: {cn_s!r}",
                )
            )

    if name and not _has_name_separator(name) and (not title or title == name):
        issues.append(
            QualityIssue(
                "source",
                slug,
                "missing_name_separator",
                "warning",
                f"name lacks Author — Title separator and title is missing or equals name: {name!r}",
            )
        )

    if creator_names and name and _has_name_separator(name):
        author, _ = split_display_name(name)
        first_creator = strip_markdown_italics(str(creator_names[0]).strip())
        if author and first_creator and first_creator != author:
            if not _is_institutional_creator_mismatch(author, first_creator):
                issues.append(
                    QualityIssue(
                        "source",
                        slug,
                        "creator_name_mismatch",
                        "warning",
                        f"creatorNames[0] {first_creator!r} != author portion of name {author!r}",
                    )
                )

    if institution and title and title.lower() in institution.lower() and institution != title:
        issues.append(
            QualityIssue(
                "source",
                slug,
                "institution_contains_title",
                "warning",
                f"institution appears to include title text: {institution!r}",
            )
        )

    for cs in creator_slugs:
        cs_s = str(cs).strip()
        if cs_s and cs_s not in thinkers:
            issues.append(
                QualityIssue(
                    "source",
                    slug,
                    "orphan_creator_slug",
                    "warning",
                    f"creatorSlug {cs_s!r} has no matching thinker",
                )
            )

    return issues


def _is_institutional_creator_mismatch(author: str, creator: str) -> bool:
    """Allow creator to be org prefix when name author includes title residue."""
    return creator.lower() in author.lower() or author.lower().startswith(creator.lower())


def _audit_thinker(
    slug: str,
    data: dict,
    sources: dict[str, dict],
) -> list[QualityIssue]:
    issues: list[QualityIssue] = []
    name = str(data.get("name", "")).strip()
    summary = str(data.get("summary", "")).strip()
    why = str(data.get("whyThisMatters", "")).strip()
    works = data.get("works") or []

    if name and _markdown_in_display(name):
        issues.append(
            QualityIssue(
                "thinker",
                slug,
                "markdown_in_display",
                "critical",
                f"name contains markdown italics: {name!r}",
            )
        )

    if _PLACEHOLDER_SUMMARY_RE.search(summary) or _PLACEHOLDER_SUMMARY_RE.search(why):
        issues.append(
            QualityIssue(
                "thinker",
                slug,
                "placeholder_summary",
                "info",
                "summary or whyThisMatters still has auto-generated placeholder text",
            )
        )

    for work_slug in works:
        ws = str(work_slug).strip()
        if ws not in sources:
            issues.append(
                QualityIssue(
                    "thinker",
                    slug,
                    "orphan_work",
                    "warning",
                    f"works references missing source {ws!r}",
                )
            )
            continue
        source = sources[ws]
        creator_slugs = source.get("creatorSlugs") or []
        if slug not in creator_slugs:
            issues.append(
                QualityIssue(
                    "thinker",
                    slug,
                    "work_creator_mismatch",
                    "info",
                    f"work {ws!r} does not list this thinker in creatorSlugs",
                )
            )

    return issues


def _find_near_duplicate_thinkers(thinkers: dict[str, dict]) -> list[QualityIssue]:
    by_key: dict[str, list[str]] = {}
    for slug, data in thinkers.items():
        key = _normalize_author_key(str(data.get("name", slug)))
        if not key:
            continue
        by_key.setdefault(key, []).append(slug)

    issues: list[QualityIssue] = []
    for key, slugs in sorted(by_key.items()):
        if len(slugs) < 2:
            continue
        issues.append(
            QualityIssue(
                "thinker",
                slugs[0],
                "near_duplicate_thinker",
                "info",
                f"normalized name {key!r} shared by slugs: {', '.join(sorted(slugs))}",
            )
        )
    return issues


def run_metadata_quality_audit(repo: Path) -> MetadataQualityResult:
    repo = repo.resolve()
    sources = load_entity_dir(repo, "sources")
    thinkers = load_entity_dir(repo, "thinkers")

    issues: list[QualityIssue] = []
    for slug, data in sorted(sources.items()):
        issues.extend(_audit_source(slug, data, thinkers))
    for slug, data in sorted(thinkers.items()):
        issues.extend(_audit_thinker(slug, data, sources))
    issues.extend(_find_near_duplicate_thinkers(thinkers))

    critical = sum(1 for i in issues if i.severity == "critical")
    warning = sum(1 for i in issues if i.severity == "warning")
    info = sum(1 for i in issues if i.severity == "info")

    return MetadataQualityResult(
        issues=issues,
        stats={
            "sources": len(sources),
            "thinkers": len(thinkers),
            "critical": critical,
            "warnings": warning,
            "info": info,
            "total": len(issues),
        },
    )


def collect_metadata_quality_warnings(repo: Path) -> list[str]:
    result = run_metadata_quality_audit(repo)
    return [
        f"{issue.entity_kind} {issue.slug!r} [{issue.check}]: {issue.detail}"
        for issue in result.issues
        if issue.severity in ("critical", "warning")
    ]


def format_metadata_quality_report(result: MetadataQualityResult) -> str:
    lines = [
        "# Semantic metadata quality audit",
        "",
        "## Summary",
        "",
        f"- Sources: {result.stats.get('sources', 0)}",
        f"- Thinkers: {result.stats.get('thinkers', 0)}",
        f"- Critical issues: {result.stats.get('critical', 0)}",
        f"- Warnings: {result.stats.get('warnings', 0)}",
        f"- Info: {result.stats.get('info', 0)}",
        "",
    ]

    for severity in ("critical", "warning", "info"):
        bucket = [i for i in result.issues if i.severity == severity]
        if not bucket:
            continue
        lines.append(f"## {severity.title()} ({len(bucket)})")
        lines.append("")
        for issue in bucket:
            lines.append(
                f"- **{issue.entity_kind}** `{issue.slug}` — {issue.check}: {issue.detail}"
            )
        lines.append("")

    if not result.issues:
        lines.append("No metadata quality issues found.")
        lines.append("")

    return "\n".join(lines)
