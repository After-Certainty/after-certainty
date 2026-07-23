#!/usr/bin/env python3
"""
Semantic completeness and coverage report for public canonical works.

Classifies discovery fields as complete / missing / generated-only / incomplete /
potentially-incorrect / not-applicable. Warnings only — never fails the build
for optional enrichment gaps.

Typical usage::

    python3 tools/report_semantic_completeness.py --repo .
    make report-semantic-completeness
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import defaultdict
from datetime import UTC, datetime
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

_TOOLS = Path(__file__).resolve().parent
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from book_specs import discover_book_spec_paths, load_book_spec  # noqa: E402
from discovery_manifest import (  # noqa: E402
    CONTENT_TYPES,
    default_work_slug,
    work_id_for_slug,
)

FIELD_STATUSES = frozenset(
    {
        "complete",
        "missing",
        "generated-only",
        "incomplete",
        "potentially-incorrect",
        "not-applicable",
    }
)

PROFILE_FIELDS = (
    "stableWorkId",
    "stableCanonicalEditionId",
    "publicStatus",
    "contentType",
    "literaryForm",
    "publicationDate",
    "substantialRevisionDate",
    "richOverview",
    "centralQuestion",
    "whyItExists",
    "audience",
    "nonGoals",
    "selectedConcepts",
    "selectedPatterns",
    "readingRelationships",
    "typedWorkRelationships",
    "searchAliases",
    "questionCoverage",
    "trailCoverage",
    "shelfCoverageBeyondCatalog",
    "publicChangeEvent",
    "partStructure",
    "chapterStructure",
    "chapterSummaries",
    "situationCoverage",
    "selectedThinkersOrSources",
)


def _load_yaml(path: Path) -> object:
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def _status(value: str) -> str:
    if value not in FIELD_STATUSES:
        raise ValueError(f"invalid field status {value!r}")
    return value


def infer_profile(content_type: str, literary_form: str | None, kind: str) -> str:
    if content_type == "poetry" or kind == "poetry" or literary_form == "poetry_collection":
        return "poetry"
    if content_type == "fiction" or literary_form == "novel":
        return "fiction"
    if content_type == "handbook" or literary_form == "handbook":
        return "handbook"
    return "nonfiction"


def _has_overview(overview: object) -> bool:
    return isinstance(overview, dict) and bool(str(overview.get("centralQuestion") or "").strip())


def evaluate_book(
    *,
    spec_path: Path,
    book: dict,
    content_type: str,
    literary_form: str | None,
    kind: str,
    overview: dict | None,
    publication_date: str | None,
    revised_at: str | None,
    book_aliases: list[str],
    global_alias_targets: set[str],
    question_books: set[str],
    trail_books: set[str],
    shelf_books: set[str],
    change_event_books: set[str],
    situation_books: set[str],
    has_parts: bool,
    has_chapters: bool,
    has_chapter_summaries: bool,
    curated_concepts: bool,
    generated_concepts: bool,
    curated_patterns: bool,
    generated_patterns: bool,
    has_sources_or_thinkers: bool,
    suspicious_content_type: bool,
) -> dict:
    profile = infer_profile(content_type, literary_form, kind)
    slug = str(book.get("id") or "").strip()
    work_slug = str(book.get("work_id") or "").strip() or default_work_slug(slug)
    fields: dict[str, str] = {}

    fields["stableWorkId"] = _status("complete")
    fields["stableCanonicalEditionId"] = _status("complete")
    fields["publicStatus"] = _status("complete")

    if suspicious_content_type:
        fields["contentType"] = _status("potentially-incorrect")
    elif content_type in CONTENT_TYPES:
        fields["contentType"] = _status("complete")
    else:
        fields["contentType"] = _status("missing")

    if literary_form:
        fields["literaryForm"] = _status("complete")
    elif profile in {"fiction", "poetry"}:
        fields["literaryForm"] = _status("missing")
    else:
        fields["literaryForm"] = _status("not-applicable")

    fields["publicationDate"] = _status("complete" if publication_date else "missing")
    if revised_at:
        fields["substantialRevisionDate"] = _status("complete")
    else:
        fields["substantialRevisionDate"] = _status("not-applicable")

    if _has_overview(overview):
        assert overview is not None
        fields["richOverview"] = _status("complete")
        fields["centralQuestion"] = _status(
            "complete" if overview.get("centralQuestion") else "missing"
        )
        fields["whyItExists"] = _status("complete" if overview.get("whyItExists") else "missing")
        fields["audience"] = _status("complete" if overview.get("audience") else "missing")
        non_goals = overview.get("nonGoals") or []
        if profile == "poetry" and not non_goals:
            fields["nonGoals"] = _status("not-applicable")
        else:
            fields["nonGoals"] = _status("complete" if non_goals else "missing")
        if curated_concepts:
            fields["selectedConcepts"] = _status("complete")
        elif generated_concepts:
            fields["selectedConcepts"] = _status("generated-only")
        else:
            fields["selectedConcepts"] = _status("missing")
        if curated_patterns:
            fields["selectedPatterns"] = _status("complete")
        elif generated_patterns:
            fields["selectedPatterns"] = _status("generated-only")
        else:
            fields["selectedPatterns"] = _status(
                "not-applicable" if profile == "poetry" else "missing"
            )
        reading = (overview.get("readBefore") or []) or (overview.get("readNext") or [])
        related = overview.get("relatedWorks") or []
        fields["readingRelationships"] = _status("complete" if reading or related else "missing")
        fields["typedWorkRelationships"] = _status("complete" if related else "missing")
    else:
        fields["richOverview"] = _status("missing")
        for key in (
            "centralQuestion",
            "whyItExists",
            "audience",
            "nonGoals",
            "selectedConcepts",
            "selectedPatterns",
            "readingRelationships",
            "typedWorkRelationships",
        ):
            if (
                key in {"selectedConcepts", "selectedPatterns"}
                and generated_concepts
                and key == "selectedConcepts"
            ):
                fields[key] = _status("generated-only")
            elif key == "selectedPatterns" and generated_patterns:
                fields[key] = _status("generated-only")
            else:
                fields[key] = _status("missing")

    book_id = f"book-{slug}"
    has_aliases = bool(book_aliases) or book_id in global_alias_targets
    fields["searchAliases"] = _status("complete" if has_aliases else "missing")
    fields["questionCoverage"] = _status(
        "complete" if slug in question_books or book_id in question_books else "missing"
    )
    fields["trailCoverage"] = _status(
        "complete" if slug in trail_books or book_id in trail_books else "missing"
    )
    fields["shelfCoverageBeyondCatalog"] = _status("complete" if slug in shelf_books else "missing")
    fields["publicChangeEvent"] = _status(
        "complete" if book_id in change_event_books else "missing"
    )
    fields["partStructure"] = _status("complete" if has_parts else "missing")
    fields["chapterStructure"] = _status("complete" if has_chapters else "missing")
    if not has_chapters:
        fields["chapterSummaries"] = _status("not-applicable")
    else:
        fields["chapterSummaries"] = _status("complete" if has_chapter_summaries else "missing")
    fields["situationCoverage"] = _status("complete" if slug in situation_books else "missing")
    fields["selectedThinkersOrSources"] = _status(
        "complete" if has_sources_or_thinkers else "not-applicable"
    )

    return {
        "slug": slug,
        "workId": work_id_for_slug(work_slug),
        "editionId": book_id,
        "specPath": str(spec_path.as_posix()),
        "profile": profile,
        "contentType": content_type,
        "literaryForm": literary_form,
        "fields": fields,
    }


def _collect_discovery_indexes(repo: Path) -> dict:
    question_books: set[str] = set()
    trail_books: set[str] = set()
    shelf_books: set[str] = set()
    change_event_books: set[str] = set()
    situation_books: set[str] = set()
    global_alias_targets: set[str] = set()

    qdir = repo / "semantic" / "questions"
    if qdir.is_dir():
        for path in qdir.glob("*.yml"):
            doc = _load_yaml(path)
            if not isinstance(doc, dict):
                continue
            primary = str(doc.get("primaryBookId") or "").strip()
            if primary:
                question_books.add(primary)
                if primary.startswith("book-"):
                    question_books.add(primary.removeprefix("book-"))
            for stop in doc.get("pathStops") or []:
                if isinstance(stop, dict) and stop.get("entityType") == "book":
                    eid = str(stop.get("entityId") or "").strip()
                    if eid:
                        question_books.add(eid)
                        question_books.add(eid.removeprefix("book-"))

    tdir = repo / "semantic" / "trails"
    if tdir.is_dir():
        for path in tdir.glob("*.yml"):
            doc = _load_yaml(path)
            if not isinstance(doc, dict):
                continue
            primary = str(doc.get("primaryBookId") or "").strip()
            if primary:
                trail_books.add(primary)
                trail_books.add(primary.removeprefix("book-"))
            for stop in doc.get("pathStops") or []:
                if isinstance(stop, dict) and stop.get("entityType") == "book":
                    eid = str(stop.get("entityId") or "").strip()
                    if eid:
                        trail_books.add(eid)
                        trail_books.add(eid.removeprefix("book-"))

    sdir = repo / "semantic" / "shelves"
    if sdir.is_dir():
        for path in sdir.glob("*.yml"):
            if path.stem == "complete-catalog":
                continue
            doc = _load_yaml(path)
            if not isinstance(doc, dict):
                continue
            selection = doc.get("selection") or {}
            if selection.get("mode") == "curated":
                for slug in selection.get("bookSlugs") or []:
                    shelf_books.add(str(slug).strip())

    edir = repo / "semantic" / "change-events"
    if edir.is_dir():
        for path in edir.glob("*.yml"):
            doc = _load_yaml(path)
            if not isinstance(doc, dict):
                continue
            if str(doc.get("visibility") or "") != "public":
                continue
            if str(doc.get("entityType") or "") == "book":
                eid = str(doc.get("entityId") or "").strip()
                if eid:
                    change_event_books.add(eid)

    situ = repo / "semantic" / "situations"
    if situ.is_dir():
        for path in situ.glob("*.yml"):
            doc = _load_yaml(path)
            if not isinstance(doc, dict):
                continue
            for slug in doc.get("relatedBooks") or []:
                situation_books.add(str(slug).strip())

    aliases_path = repo / "semantic" / "search-aliases.yml"
    if aliases_path.is_file():
        doc = _load_yaml(aliases_path)
        if isinstance(doc, dict):
            for entry in doc.get("entries") or []:
                if not isinstance(entry, dict):
                    continue
                for tid in entry.get("targetIds") or []:
                    global_alias_targets.add(str(tid).strip())

    return {
        "question_books": question_books,
        "trail_books": trail_books,
        "shelf_books": shelf_books,
        "change_event_books": change_event_books,
        "situation_books": situation_books,
        "global_alias_targets": global_alias_targets,
    }


def _suspicious_content_type(book: dict, content_type: str, kind: str) -> bool:
    subtitle = str(book.get("subtitle") or "").lower()
    title = str(book.get("title") or "").lower()
    if "fiction" in subtitle and content_type != "fiction":
        return True
    if kind == "poetry" and content_type not in {"poetry"}:
        return True
    if content_type == "fiction" and "handbook" in subtitle:
        return True
    if "poetry" in title and content_type not in {"poetry", "nonfiction"}:
        return False
    return False


def build_report(repo: Path, *, manifest: dict | None = None) -> dict:
    indexes = _collect_discovery_indexes(repo)
    chapters_by_edition: dict[str, list[dict]] = defaultdict(list)
    parts_by_edition: dict[str, list[dict]] = defaultdict(list)
    if isinstance(manifest, dict):
        for ch in manifest.get("chapters") or []:
            if isinstance(ch, dict):
                chapters_by_edition[str(ch.get("editionId") or "")].append(ch)
        for part in manifest.get("parts") or []:
            if isinstance(part, dict):
                parts_by_edition[str(part.get("editionId") or "")].append(part)

    books_out: list[dict] = []
    for spec_path in discover_book_spec_paths(repo):
        spec = load_book_spec(spec_path)
        book = spec.get("book") or {}
        if not isinstance(book, dict):
            continue
        slug = str(book.get("id") or "").strip()
        if not slug:
            continue
        content_type = str(book.get("content_type") or "nonfiction").strip()
        literary_form = str(book.get("literary_form") or "").strip() or None
        kind = str(book.get("kind") or "prose").strip()
        overview = book.get("overview") if isinstance(book.get("overview"), dict) else None
        publication_date = str(book.get("publication_date") or "").strip() or None
        revised_at = None
        if overview:
            revised_at = str(overview.get("revisedAt") or "").strip() or None
        revised_at = revised_at or (str(book.get("substantially_revised_at") or "").strip() or None)
        book_aliases = [
            str(a).strip() for a in (book.get("search_aliases") or []) if str(a).strip()
        ]
        edition_id = f"book-{slug}"
        chs = chapters_by_edition.get(edition_id) or []
        parts = parts_by_edition.get(edition_id) or []
        # Fallback: detect manuscript structure without manifest
        has_chapters = bool(chs) or (spec_path.parent / "index.md").is_file()
        has_parts = bool(parts)
        if not parts and (spec_path.parent / "index.md").is_file():
            text = (spec_path.parent / "index.md").read_text(encoding="utf-8")
            has_parts = any(
                line.startswith("## Part") or line.startswith("## Act")
                for line in text.splitlines()
            )
        has_chapter_summaries = any(str(c.get("summary") or "").strip() for c in chs)
        summaries_present = sum(1 for c in chs if str(c.get("summary") or "").strip())
        chapter_count = len(chs)
        curated_concepts = bool(overview and (overview.get("selectedConcepts") or []))
        curated_patterns = bool(overview and (overview.get("selectedPatterns") or []))
        generated_concepts = False
        generated_patterns = False
        if isinstance(manifest, dict):
            mbook = next((b for b in manifest.get("books") or [] if b.get("slug") == slug), None)
            if isinstance(mbook, dict):
                if mbook.get("concepts") and not curated_concepts:
                    generated_concepts = True
                if mbook.get("patterns") and not curated_patterns:
                    generated_patterns = True
                if mbook.get("sources"):
                    has_sources = True
                else:
                    has_sources = False
            else:
                has_sources = False
        else:
            has_sources = False

        row = evaluate_book(
            spec_path=spec_path.relative_to(repo) if spec_path.is_relative_to(repo) else spec_path,
            book=book,
            content_type=content_type,
            literary_form=literary_form,
            kind=kind,
            overview=overview,
            publication_date=publication_date,
            revised_at=revised_at,
            book_aliases=book_aliases,
            global_alias_targets=indexes["global_alias_targets"],
            question_books=indexes["question_books"],
            trail_books=indexes["trail_books"],
            shelf_books=indexes["shelf_books"],
            change_event_books=indexes["change_event_books"],
            situation_books=indexes["situation_books"],
            has_parts=has_parts,
            has_chapters=has_chapters,
            has_chapter_summaries=has_chapter_summaries,
            curated_concepts=curated_concepts,
            generated_concepts=generated_concepts,
            curated_patterns=curated_patterns,
            generated_patterns=generated_patterns,
            has_sources_or_thinkers=has_sources,
            suspicious_content_type=_suspicious_content_type(book, content_type, kind),
        )
        row["chapterSummaryCoverage"] = {
            "present": summaries_present,
            "total": chapter_count,
        }
        books_out.append(row)

    books_out.sort(key=lambda b: b["slug"])

    def _slugs_where(field: str, status: str) -> list[str]:
        return [b["slug"] for b in books_out if b["fields"].get(field) == status]

    summaries = {
        "booksMissingRichOverviews": _slugs_where("richOverview", "missing"),
        "booksMissingSearchAliases": _slugs_where("searchAliases", "missing"),
        "booksAbsentFromQuestions": _slugs_where("questionCoverage", "missing"),
        "booksAbsentFromTrails": _slugs_where("trailCoverage", "missing"),
        "booksAbsentFromEditorialShelves": _slugs_where("shelfCoverageBeyondCatalog", "missing"),
        "booksWithoutPublicationDates": _slugs_where("publicationDate", "missing"),
        "booksWithSuspiciousContentTypes": _slugs_where("contentType", "potentially-incorrect"),
        "booksWithNoChapterStructure": _slugs_where("chapterStructure", "missing"),
        "booksWithOnlyGeneratedSemanticAssociations": sorted(
            {
                b["slug"]
                for b in books_out
                if b["fields"].get("selectedConcepts") == "generated-only"
                or b["fields"].get("selectedPatterns") == "generated-only"
            }
        ),
        "booksWithNoPublicChangeEvent": _slugs_where("publicChangeEvent", "missing"),
        "booksWithPartialChapterSummaries": sorted(
            {
                b["slug"]
                for b in books_out
                if (b.get("chapterSummaryCoverage") or {}).get("total", 0) > 0
                and (b.get("chapterSummaryCoverage") or {}).get("present", 0)
                < (b.get("chapterSummaryCoverage") or {}).get("total", 0)
            }
        ),
        "orphanedFromDiscovery": sorted(
            {
                b["slug"]
                for b in books_out
                if b["fields"].get("richOverview") == "missing"
                and b["fields"].get("questionCoverage") == "missing"
                and b["fields"].get("trailCoverage") == "missing"
                and b["fields"].get("searchAliases") == "missing"
            }
        ),
    }

    manifest_meta: dict = {}
    if isinstance(manifest, dict):
        manifest_meta = {
            "schemaVersion": manifest.get("schemaVersion"),
            "sourceCommit": manifest.get("sourceCommit"),
            "generatedAt": manifest.get("generatedAt"),
        }

    return {
        "generatedAt": datetime.now(UTC).isoformat(),
        "manifest": manifest_meta,
        "bookCount": len(books_out),
        "books": books_out,
        "summaries": summaries,
    }


def format_markdown(report: dict) -> str:
    lines: list[str] = [
        "# Semantic completeness report",
        "",
        f"Generated: `{report['generatedAt']}`",
        "",
    ]
    manifest_meta = report.get("manifest") or {}
    if manifest_meta:
        lines.extend(
            [
                "## Manifest provenance",
                "",
                f"- schemaVersion: `{manifest_meta.get('schemaVersion')}`",
                f"- sourceCommit: `{manifest_meta.get('sourceCommit')}`",
                f"- manifest generatedAt: `{manifest_meta.get('generatedAt')}`",
                "",
            ]
        )
    lines.extend(
        [
            f"Public canonical works evaluated: **{report['bookCount']}**",
            "",
            "Field statuses: `complete`, `missing`, `generated-only`, `incomplete`, "
            "`potentially-incorrect`, `not-applicable`.",
            "",
            "## Summary",
            "",
        ]
    )
    summaries = report.get("summaries") or {}
    for key, label in (
        ("booksMissingRichOverviews", "Books missing rich overviews"),
        ("booksMissingSearchAliases", "Books missing search aliases"),
        ("booksAbsentFromQuestions", "Books absent from questions"),
        ("booksAbsentFromTrails", "Books absent from trails"),
        ("booksAbsentFromEditorialShelves", "Books absent from editorial shelves"),
        ("booksWithoutPublicationDates", "Books without publication dates"),
        ("booksWithSuspiciousContentTypes", "Books with suspicious content types"),
        ("booksWithNoChapterStructure", "Books with no chapter structure"),
        (
            "booksWithOnlyGeneratedSemanticAssociations",
            "Books with only generated semantic associations",
        ),
        ("booksWithNoPublicChangeEvent", "Books with no public change event"),
        ("booksWithPartialChapterSummaries", "Books with partial chapter summary coverage"),
        ("orphanedFromDiscovery", "Books orphaned from discovery features"),
    ):
        items = summaries.get(key) or []
        lines.append(f"### {label}")
        lines.append("")
        if not items:
            lines.append("_None._")
        else:
            for slug in items:
                lines.append(f"- `{slug}`")
        lines.append("")

    lines.extend(["## Per-book field matrix", ""])
    for book in report.get("books") or []:
        lines.append(
            f"### `{book['slug']}` ({book['profile']}, contentType=`{book['contentType']}`)"
        )
        lines.append("")
        lines.append(f"- Spec: `{book['specPath']}`")
        lines.append(f"- Work: `{book['workId']}` · Edition: `{book['editionId']}`")
        lines.append("")
        lines.append("| Field | Status |")
        lines.append("| --- | --- |")
        for field in PROFILE_FIELDS:
            status = book["fields"].get(field, "missing")
            lines.append(f"| `{field}` | `{status}` |")
        lines.append("")
    return "\n".join(lines) + "\n"


def completeness_warnings(report: dict) -> list[str]:
    """Actionable warning strings for CI / discovery validation (non-fatal)."""
    warnings: list[str] = []
    for book in report.get("books") or []:
        spec = book["specPath"]
        fields = book["fields"]
        if fields.get("richOverview") == "missing":
            warnings.append(f"{spec}: missing rich overview (edit book.overview)")
        if fields.get("searchAliases") == "missing":
            warnings.append(
                f"{spec}: no search aliases (add book.search_aliases or semantic/search-aliases.yml)"
            )
        if fields.get("publicationDate") == "missing":
            warnings.append(f"{spec}: no publication_date")
        if fields.get("publicChangeEvent") == "missing":
            warnings.append(
                f"{spec}: no public change event (add semantic/change-events/*.yml when date is reliable)"
            )
        cov = book.get("chapterSummaryCoverage") or {}
        if cov.get("total") and cov.get("present", 0) < cov.get("total", 0):
            warnings.append(
                f"{spec}: chapter summaries partial "
                f"({cov.get('present', 0)}/{cov.get('total', 0)}; edit chapter-enrichment.yml)"
            )
        if fields.get("contentType") == "potentially-incorrect":
            warnings.append(f"{spec}: suspicious content_type={book['contentType']!r}")
        if fields.get("selectedConcepts") == "generated-only":
            warnings.append(
                f"{spec}: concept associations are generated-only (curate selectedConcepts)"
            )
        if (
            fields.get("questionCoverage") == "missing"
            and fields.get("trailCoverage") == "missing"
            and fields.get("shelfCoverageBeyondCatalog") == "missing"
        ):
            warnings.append(
                f"{spec}: absent from curated discovery paths (questions/trails/shelves)"
            )
    return warnings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument(
        "--manifest",
        default="",
        help="Optional semantic-manifest.json for generated-only detection",
    )
    parser.add_argument(
        "--md-out",
        default="reports/semantic-completeness.md",
        help="Markdown output path",
    )
    parser.add_argument(
        "--json-out",
        default="reports/semantic-completeness.json",
        help="JSON output path",
    )
    parser.add_argument(
        "--print-warnings",
        action="store_true",
        help="Print actionable warnings to stderr (always exits 0)",
    )
    args = parser.parse_args()
    repo = Path(args.repo).resolve()
    manifest = None
    if args.manifest:
        mpath = Path(args.manifest)
        if not mpath.is_absolute():
            mpath = repo / mpath
        if mpath.is_file():
            manifest = json.loads(mpath.read_text(encoding="utf-8"))

    report = build_report(repo, manifest=manifest)
    md = format_markdown(report)

    md_out = Path(args.md_out)
    json_out = Path(args.json_out)
    if not md_out.is_absolute():
        md_out = repo / md_out
    if not json_out.is_absolute():
        json_out = repo / json_out
    md_out.parent.mkdir(parents=True, exist_ok=True)
    json_out.parent.mkdir(parents=True, exist_ok=True)
    md_out.write_text(md, encoding="utf-8")
    json_out.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    def _display(path: Path) -> str:
        try:
            return path.relative_to(repo).as_posix()
        except ValueError:
            return str(path)

    print(_display(md_out))
    print(_display(json_out))

    if args.print_warnings:
        for w in completeness_warnings(report):
            print(f"WARNING: {w}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
