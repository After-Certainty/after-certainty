#!/usr/bin/env python3
"""Report Phase 19 source integrity without manufacturing reader citations.

Reconciles the complete source corpus against Phase 18's *render-verified*
baseline, the live semantic metadata checks, and the bibliography drift audit.
The inventory deliberately distinguishes background references from missing
citation evidence.  This is a read-only audit of sources and manuscripts.
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path

_TOOLS_DIR = Path(__file__).resolve().parent
if str(_TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(_TOOLS_DIR))

from audit_bibliography_semantic_drift import run_audit as run_bibliography_audit  # noqa: E402
from reader_passage_links import run_audit as run_reader_audit  # noqa: E402
from semantic_metadata_quality_audit import run_metadata_quality_audit  # noqa: E402

CATEGORY_LABELS = {
    "B": "footnote_cited_not_linked",
    "C": "thematic_connection_only",
    "D": "bibliography_only",
    "E": "no_detected_evidence",
}


def categorize_unlinked(source: object) -> str:
    """Never upgrade a source from keyword overlap or bibliography membership."""
    if getattr(source, "reader_passage_path", None):
        raise ValueError("Linked source must not enter the unlinked inventory")
    evidence = getattr(source, "evidence_level", None)
    if evidence not in CATEGORY_LABELS:
        raise ValueError(f"Unexpected evidence level for unlinked source: {evidence!r}")
    return CATEGORY_LABELS[evidence]


def _editorial_exclusion(slug: str, exceptions: dict[str, str]) -> str | None:
    matches = [reason for prefix, reason in exceptions.items() if slug.startswith(prefix)]
    if len(matches) > 1:
        raise ValueError(f"Overlapping editorial exceptions for {slug}")
    return matches[0] if matches else None


def create_report(repo: Path) -> tuple[dict, str]:
    audit = json.loads(
        (repo / "reports/reader-passage-links/audit.summary.json").read_text(encoding="utf-8")
    )
    verified = audit["totals"]["sources"]
    if verified["invalidPassageLinks"] or verified["unverifiedFragmentLinks"]:
        raise ValueError("Phase 18 baseline contains unverified or invalid links")

    live = run_reader_audit(repo, check_fragments=False, thinker_slugs=set())
    sources = live.sources
    if len(sources) != verified["total"]:
        raise ValueError("Saved reader audit does not match the current source corpus")

    decision_path = repo / "reports/reader-passage-links/phase18-editorial-decisions.json"
    exceptions = json.loads(decision_path.read_text(encoding="utf-8"))["exclusions"]
    rows: list[dict] = []
    for source in sorted(sources, key=lambda s: s.slug):
        if source.reader_passage_path:
            continue
        rows.append(
            {
                "slug": source.slug,
                "category": categorize_unlinked(source),
                "relatedBooks": list(source.related_books),
                "inBibliographies": list(source.in_bibliography_books),
                "footnoteHitCount": len(source.footnote_hits),
                "editorialExclusion": _editorial_exclusion(source.slug, exceptions),
                "nextAction": (
                    "review_claim_and_source_before_linking"
                    if source.evidence_level == "B"
                    else "review_for_actual_citation_need"
                    if source.evidence_level == "C"
                    else "leave_unlinked_unless_manuscript_cites_work"
                ),
            }
        )

    if len(rows) != verified["total"] - verified["withReaderPassagePath"]:
        raise ValueError("Unlinked inventory does not reconcile with Phase 18 totals")
    counts = Counter(row["category"] for row in rows)
    if sum(counts.values()) != len(rows):
        raise ValueError("Unlinked categories do not account for every source")

    metadata = run_metadata_quality_audit(repo)
    drift = run_bibliography_audit(repo)["payload"]
    drift_books = [
        {
            "book": book["book_id"],
            "missingInSemantic": book["missing_in_semantic"],
            "missingRelatedBooks": book["missing_related_books"],
            "staleRelatedBooks": book["stale_related_books"],
        }
        for book in drift["books"]
        if book["missing_in_semantic"]
        or book["missing_related_books"]
        or book["stale_related_books"]
    ]
    metadata_kinds = dict(Counter(issue.check for issue in metadata.issues))
    payload = {
        "generatedBy": "tools/report_source_integrity_phase19.py",
        "citationAudit": {
            "verifiedCount": verified["verifiedLinkTiedCitation"],
            "totalSources": verified["total"],
            "invalidPassageLinks": verified["invalidPassageLinks"],
            "unverifiedFragmentLinks": verified["unverifiedFragmentLinks"],
            "editorialReviewPendingOnLinks": verified["pathNeedsEditorialReview"],
            "method": "Phase 18 saved rendered-reader audit; not independently re-rendered here",
        },
        "unlinkedCounts": {key: counts.get(key, 0) for key in CATEGORY_LABELS.values()},
        "sourceMetadata": {
            "sources": metadata.stats["sources"],
            "thinkers": metadata.stats["thinkers"],
            "critical": metadata.stats["critical"],
            "warnings": metadata.stats["warnings"],
            "info": metadata.stats["info"],
            "byIssueType": metadata_kinds,
        },
        "bibliographyDrift": {
            "auditedBooks": drift["bookCount"],
            **drift["totals"],
        },
        "bibliographyProblems": drift_books,
        "unlinkedSources": rows,
    }

    lines = [
        "# Phase 19 — source integrity & outstanding evidence",
        "",
        "## Audit scope",
        "",
        "This report reconciles live source records with the saved **Phase 18 rendered-reader**",
        "audit. Metadata and bibliography checks are recomputed from the current corpus.",
        "A correct footnote anchor is *not* independent confirmation that the source",
        "supports every assertion made in a chapter.",
        "",
        f"- Render-verified reader links: **{verified['verifiedLinkTiedCitation']} / {verified['total']}**",
        f"- Invalid reader paths: **{verified['invalidPassageLinks']}**; unverified fragments: **{verified['unverifiedFragmentLinks']}**",
        f"- Unlinked source records: **{len(rows)}**",
        f"- Fresh metadata issues: **{metadata.stats['critical']} critical, {metadata.stats['warnings']} warnings, {metadata.stats['info']} informational**",
        f"- Bibliography drift across **{drift['bookCount']}** audited books: **{drift['totals']['missingInSemantic']} missing sources, {drift['totals']['missingRelatedBooks']} missing book links, {drift['totals']['staleRelatedBooks']} stale book links**",
        "",
        "## Unlinked sources by evidence",
        "",
        "| Class | Count | Decision |",
        "|---|---:|---|",
        f"| Cited footnote without link | {counts.get('footnote_cited_not_linked', 0)} | Recheck the *specific work and claim* before linking |",
        f"| Thematic prose overlap only | {counts.get('thematic_connection_only', 0)} | Do not promote a title mention into a citation |",
        f"| Bibliography only | {counts.get('bibliography_only', 0)} | Accept background reading unless the text specifically relies on it |",
        f"| No detected citation evidence | {counts.get('no_detected_evidence', 0)} | Review corpus relevance; never invent manuscript citations |",
        "",
        "## Current bibliography reconciliation gaps",
        "",
        "Only high-confidence matches to *existing* source records are safe to add",
        "automatically. Remaining references need publication and creator metadata",
        "review, and a weak title-less match must not become a false source link.",
        "",
    ]
    for book in drift_books:
        lines.append(
            f"### {book[\x27book\x27]} — {len(book[\x27missingInSemantic\x27])} absent sources; "
            f"{len(book[\x27missingRelatedBooks\x27])} unmatched book relations"
        )
        lines.append("")
        for missing in book["missingInSemantic"]:
            lines.append(
                f"- **Needs source record:** `{missing[\x27biblioSlug\x27]}` — "
                f"{missing.get(\x27biblioTitle\x27) or missing.get(\x27biblioAuthor\x27) or \x27unparsed reference\x27}"
            )
        for match in book["missingRelatedBooks"]:
            lines.append(
                f"- **Review weak link:** `{match[\x27biblioSlug\x27]}` → "
                f"`{match[\x27sourceSlug\x27]}` (score {match[\x27score\x27]}, "
                f"{match[\x27method\x27]})"
            )
        lines.append("")
    lines += [
        "## Metadata warning classes",
        "",
    ]
    for check, count in sorted(metadata_kinds.items(), key=lambda x: (-x[1], x[0])):
        lines.append(f"- **{check}**: {count}")
    lines += [
        "",
        "## Editorial review queue",
        "",
    ]
    priority = [
        row
        for row in rows
        if row["category"] in ("footnote_cited_not_linked", "thematic_connection_only")
    ]
    for row in priority:
        lines.append(f"- **{row['slug']}** ({row['category']}).")
        lines.append(
            f"  - Related books: {', '.join(row['relatedBooks']) or '(none)'}; "
            f"footnote hits: {row['footnoteHitCount']}"
        )
        if row["editorialExclusion"]:
            lines.append(f"  - **Do not force-link:** {row['editorialExclusion']}")

    lines += [
        "",
        "## Full unlinked inventory",
        "",
        "| Source slug | Evidence class | Related books |",
        "|---|---|---|",
    ]
    for row in rows:
        lines.append(
            f"| `{row['slug']}` | {row['category']} | {', '.join(row['relatedBooks']) or '—'} |"
        )
    lines += [
        "",
        "## Editorial standard",
        "",
        "Unlinked does not mean broken. Check the bibliography and prose before removing",
        "a reference or adding a manuscript note. Do not convert incidental keyword",
        "matches into source relationships, and preserve prior explicit exclusions.",
        "Run `python tools/report_source_integrity_phase19.py --repo .` after",
        "regenerating the reader-passage audit when the corpus changes.",
        "",
    ]
    return payload, "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".")
    args = parser.parse_args()
    repo = Path(args.repo).resolve()
    payload, markdown = create_report(repo)
    directory = repo / "reports/reader-passage-links"
    (directory / "phase19-source-integrity.json").write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    (directory / "phase19-source-integrity.md").write_text(markdown, encoding="utf-8")
    print(
        f"Phase 19: linked {payload['citationAudit']['verifiedCount']} / "
        f"{payload['citationAudit']['totalSources']}; "
        f"unlinked {len(payload['unlinkedSources'])}; "
        f"metadata warnings {payload['sourceMetadata']['warnings']}"
    )


if __name__ == "__main__":
    main()
