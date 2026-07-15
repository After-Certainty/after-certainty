#!/usr/bin/env python3
"""
Audit bibliography ↔ semantic sources/thinkers drift (read-only).

Treats manuscript bibliographies as source of truth for which works belong
to each book. Compares parsed biblio entries to ``semantic/sources`` linked via
``relatedBooks``, and derives thinker-side drift from creators / ``relatedBooks``.

Typical usage::

    python3 tools/audit_bibliography_semantic_drift.py --repo .
    make audit-bibliography-semantic-drift
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any

_TOOLS_DIR = Path(__file__).resolve().parent
if str(_TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(_TOOLS_DIR))

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

from bibliography_parse import (  # noqa: E402
    normalize_typography,
    parse_bibliography,
)
from source_metadata import (  # noqa: E402
    creator_slug_from_name,
    split_display_name,
    strip_markdown_italics,
)

MATCH_THRESHOLD = 50


def dedupe_expected_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Drop duplicate bibliography rows (same author+title), keeping the first."""
    out: list[dict[str, Any]] = []
    seen: set[tuple[str, str]] = set()
    for row in rows:
        author = normalize_match_text(str(row.get("author") or row.get("name") or ""))
        title = normalize_match_text(str(row.get("workTitle") or ""))
        if not title:
            # Fall back to summary when title missing so wrapped entries still dedupe.
            title = normalize_match_text(str(row.get("summary") or ""))[:120]
        key = (author, title)
        if key in seen and title:
            continue
        if title:
            seen.add(key)
        out.append(row)
    return out


@dataclass
class MatchHit:
    expected_slug: str
    source_slug: str
    score: int
    method: str


@dataclass
class BookDrift:
    book_id: str
    bibliography: str
    parse_style: str
    parse_warnings: list[str] = field(default_factory=list)
    biblio_count: int = 0
    linked_count: int = 0
    matched: list[dict[str, Any]] = field(default_factory=list)
    missing_in_semantic: list[dict[str, Any]] = field(default_factory=list)
    missing_related_books: list[dict[str, Any]] = field(default_factory=list)
    stale_related_books: list[dict[str, Any]] = field(default_factory=list)
    thinker_stale: list[dict[str, Any]] = field(default_factory=list)
    creator_missing_thinker: list[dict[str, Any]] = field(default_factory=list)
    orphan_creator_slugs: list[dict[str, Any]] = field(default_factory=list)
    weak_parse: bool = False


def _load_yaml(path: Path) -> dict[str, Any]:
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    return raw if isinstance(raw, dict) else {}


def _book_id_from_spec(spec_path: Path) -> str | None:
    doc = _load_yaml(spec_path)
    book = doc.get("book")
    if not isinstance(book, dict):
        return None
    bid = str(book.get("id", "")).strip()
    return bid or None


def find_bibliography(book_dir: Path) -> Path | None:
    candidate = book_dir / "back-matter" / "bibliography.md"
    return candidate if candidate.is_file() else None


def load_sources(repo: Path) -> dict[str, dict[str, Any]]:
    out: dict[str, dict[str, Any]] = {}
    src_dir = repo / "semantic" / "sources"
    if not src_dir.is_dir():
        return out
    for path in sorted(src_dir.glob("*.yml")):
        doc = _load_yaml(path)
        slug = str(doc.get("slug", path.stem)).strip()
        if slug:
            doc["_path"] = str(path.relative_to(repo))
            out[slug] = doc
    return out


def load_thinkers(repo: Path) -> dict[str, dict[str, Any]]:
    out: dict[str, dict[str, Any]] = {}
    th_dir = repo / "semantic" / "thinkers"
    if not th_dir.is_dir():
        return out
    for path in sorted(th_dir.glob("*.yml")):
        doc = _load_yaml(path)
        slug = str(doc.get("slug", path.stem)).strip()
        if slug:
            doc["_path"] = str(path.relative_to(repo))
            out[slug] = doc
    return out


def related_books_of(doc: dict[str, Any]) -> list[str]:
    raw = doc.get("relatedBooks") or []
    if not isinstance(raw, list):
        return []
    out: list[str] = []
    for item in raw:
        s = str(item).strip().removeprefix("book-")
        if s:
            out.append(s)
    return out


def normalize_match_text(text: str) -> str:
    s = normalize_typography(strip_markdown_italics(text or ""))
    s = s.lower()
    s = re.sub(r"[^a-z0-9\s]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def _author_tokens(author: str) -> set[str]:
    norm = normalize_match_text(author)
    return {t for t in norm.split() if len(t) > 1}


def _title_tokens(title: str) -> set[str]:
    stop = {"the", "a", "an", "of", "and", "in", "on", "for", "to", "with"}
    return {t for t in normalize_match_text(title).split() if t not in stop and len(t) > 1}


def source_author_blob(src: dict[str, Any]) -> str:
    parts: list[str] = []
    creators = src.get("creatorNames") or []
    if isinstance(creators, list):
        parts.extend(str(c) for c in creators)
    name = str(src.get("name", ""))
    author, _ = split_display_name(name)
    if author:
        parts.append(author)
    parts.append(str(src.get("citation", "")))
    parts.append(str(src.get("summary", "")))
    return " ".join(parts)


def source_title_blob(src: dict[str, Any]) -> str:
    parts = [
        str(src.get("title", "")),
        str(src.get("workTitle", "")),
    ]
    name = str(src.get("name", ""))
    _, title = split_display_name(name)
    if title:
        parts.append(title)
    parts.append(str(src.get("citation", "")))
    parts.append(str(src.get("summary", "")))
    return " ".join(parts)


def score_expected_vs_source(expected: dict[str, Any], src: dict[str, Any]) -> tuple[int, str]:
    """Return (score, method) for matching a biblio row to a semantic source."""
    exp_slug = str(expected.get("slug", "")).strip()
    src_slug = str(src.get("slug", "")).strip()
    if exp_slug and exp_slug == src_slug:
        return 100, "exact_slug"

    exp_title = str(expected.get("workTitle") or "").strip()
    exp_author = str(expected.get("author") or expected.get("name") or "").strip()
    exp_summary = str(expected.get("summary") or "").strip()

    src_title_norm = normalize_match_text(source_title_blob(src))
    src_author_norm = normalize_match_text(source_author_blob(src))
    exp_title_norm = normalize_match_text(exp_title)
    exp_author_norm = normalize_match_text(exp_author)

    # Title + author
    if exp_title_norm and exp_title_norm in src_title_norm:
        author_toks = _author_tokens(exp_author)
        if author_toks and any(t in src_author_norm for t in author_toks):
            # Prefer longer title containment
            if len(exp_title_norm) >= 8:
                return 85, "title_author"
            return 70, "title_author_short"

    # Display name Author — Title
    src_name_norm = normalize_match_text(str(src.get("name", "")))
    if exp_title_norm and exp_author_norm:
        combined = f"{exp_author_norm} {exp_title_norm}"
        if combined == src_name_norm or (
            exp_title_norm in src_name_norm
            and any(t in src_name_norm for t in _author_tokens(exp_author))
        ):
            return 75, "display_name"

    # Citation / summary containment
    citation_blob = normalize_match_text(
        f"{src.get('citation', '')} {src.get('summary', '')} {src.get('name', '')}"
    )
    if exp_title_norm and len(exp_title_norm) >= 10 and exp_title_norm in citation_blob:
        if any(t in citation_blob for t in _author_tokens(exp_author)):
            return 60, "citation_containment"

    # Title-less institutional / archival lines: match on summary overlap
    if not exp_title_norm and exp_summary:
        summary_norm = normalize_match_text(exp_summary)
        src_name_norm = normalize_match_text(str(src.get("name", "")))
        src_title_norm = normalize_match_text(str(src.get("title", "")))
        if len(summary_norm) >= 24 and (
            (src_title_norm and src_title_norm in summary_norm)
            or (
                src_name_norm
                and any(tok in summary_norm for tok in src_name_norm.split() if len(tok) > 4)
            )
        ):
            if any(t in citation_blob or t in summary_norm for t in _author_tokens(exp_author)):
                return 58, "summary_overlap"

    # Fuzzy token Jaccard on title (+ light author boost)
    title_a = _title_tokens(exp_title or exp_summary)
    title_b = _title_tokens(str(src.get("title") or "") or source_title_blob(src))
    if title_a and title_b:
        overlap = title_a & title_b
        union = title_a | title_b
        jaccard = len(overlap) / max(1, len(union))
        if jaccard >= 0.7 and len(overlap) >= 2:
            score = 55
            if any(t in src_author_norm for t in _author_tokens(exp_author)):
                score = 65
            return score, "title_jaccard"

    return 0, "none"


def match_expected_to_sources(
    expected_rows: list[dict[str, Any]],
    candidate_sources: dict[str, dict[str, Any]],
) -> tuple[list[MatchHit], list[dict[str, Any]], list[str]]:
    """
    Greedy best-score matching.

    Returns (hits, unmatched_expected, unmatched_source_slugs).
    """
    pairs: list[tuple[int, str, str, str]] = []  # score, method, exp_slug, src_slug
    for exp in expected_rows:
        exp_slug = str(exp.get("slug", ""))
        for src_slug, src in candidate_sources.items():
            score, method = score_expected_vs_source(exp, src)
            if score >= MATCH_THRESHOLD:
                pairs.append((score, method, exp_slug, src_slug))

    pairs.sort(key=lambda p: (-p[0], p[2], p[3]))
    used_exp: set[str] = set()
    used_src: set[str] = set()
    hits: list[MatchHit] = []
    for score, method, exp_slug, src_slug in pairs:
        if exp_slug in used_exp or src_slug in used_src:
            continue
        used_exp.add(exp_slug)
        used_src.add(src_slug)
        hits.append(
            MatchHit(
                expected_slug=exp_slug,
                source_slug=src_slug,
                score=score,
                method=method,
            )
        )

    unmatched_expected = [e for e in expected_rows if str(e.get("slug", "")) not in used_exp]
    unmatched_sources = [s for s in candidate_sources if s not in used_src]
    return hits, unmatched_expected, unmatched_sources


def expected_creator_slugs(row: dict[str, Any]) -> list[str]:
    author = str(row.get("author") or row.get("name") or "").strip()
    if not author:
        return []
    slug = creator_slug_from_name(author)
    return [slug] if slug else []


def audit_book(
    *,
    book_id: str,
    biblio_path: Path,
    repo: Path,
    sources: dict[str, dict[str, Any]],
    thinkers: dict[str, dict[str, Any]],
) -> BookDrift:
    text = biblio_path.read_text(encoding="utf-8")
    parsed = parse_bibliography(text)
    expected_rows = dedupe_expected_rows(parsed.rows)
    rel_biblio = (
        str(biblio_path.relative_to(repo)) if biblio_path.is_relative_to(repo) else str(biblio_path)
    )

    linked = {slug: src for slug, src in sources.items() if book_id in related_books_of(src)}

    hits, unmatched_exp, unmatched_linked = match_expected_to_sources(expected_rows, linked)

    # For unmatched expected, try corpus-wide match (exists but missing relatedBooks)
    other_sources = {s: sources[s] for s in sources if s not in linked}
    global_hits, still_missing, _ = match_expected_to_sources(unmatched_exp, other_sources)

    weak = any("weak_parse" in w for w in parsed.warnings) or (
        parsed.style == "none" and bool(text.strip())
    )

    drift = BookDrift(
        book_id=book_id,
        bibliography=rel_biblio,
        parse_style=parsed.style,
        parse_warnings=list(parsed.warnings),
        biblio_count=len(expected_rows),
        linked_count=len(linked),
        weak_parse=weak,
    )

    exp_by_slug = {str(r.get("slug", "")): r for r in expected_rows}
    for hit in hits:
        exp = exp_by_slug.get(hit.expected_slug, {})
        src = linked.get(hit.source_slug, {})
        drift.matched.append(
            {
                "biblioSlug": hit.expected_slug,
                "sourceSlug": hit.source_slug,
                "score": hit.score,
                "method": hit.method,
                "biblioTitle": exp.get("workTitle"),
                "biblioAuthor": exp.get("author") or exp.get("name"),
                "sourceName": src.get("name"),
            }
        )

    for hit in global_hits:
        exp = exp_by_slug.get(hit.expected_slug, {})
        src = sources.get(hit.source_slug, {})
        drift.missing_related_books.append(
            {
                "biblioSlug": hit.expected_slug,
                "sourceSlug": hit.source_slug,
                "score": hit.score,
                "method": hit.method,
                "biblioTitle": exp.get("workTitle"),
                "biblioAuthor": exp.get("author") or exp.get("name"),
                "sourceName": src.get("name"),
                "sourceRelatedBooks": related_books_of(src),
            }
        )

    matched_exp_slugs = {h.expected_slug for h in hits} | {h.expected_slug for h in global_hits}
    for exp in expected_rows:
        slug = str(exp.get("slug", ""))
        if slug in matched_exp_slugs:
            continue
        drift.missing_in_semantic.append(
            {
                "biblioSlug": slug,
                "biblioTitle": exp.get("workTitle"),
                "biblioAuthor": exp.get("author") or exp.get("name"),
                "summary": (exp.get("summary") or "")[:200],
            }
        )

    matched_src_slugs = {h.source_slug for h in hits}
    for src_slug in unmatched_linked:
        src = linked[src_slug]
        drift.stale_related_books.append(
            {
                "sourceSlug": src_slug,
                "sourceName": src.get("name"),
                "title": src.get("title"),
                "path": src.get("_path"),
            }
        )

    # Thinkers layer
    expected_creators: dict[str, str] = {}
    for row in expected_rows:
        for cslug in expected_creator_slugs(row):
            expected_creators[cslug] = str(row.get("author") or row.get("name") or "")

    matched_creator_slugs: set[str] = set()
    for hit in hits:
        src = linked.get(hit.source_slug, {})
        for raw in src.get("creatorSlugs") or []:
            s = str(raw).strip()
            if s:
                matched_creator_slugs.add(s)

    # Stale thinkers: claim this book but no matched work
    for tslug, thinker in thinkers.items():
        if book_id not in related_books_of(thinker):
            continue
        works = [str(w).strip() for w in (thinker.get("works") or []) if str(w).strip()]
        if not any(w in matched_src_slugs for w in works):
            # Also skip if any work still linked to book (may be unmatched/stale source)
            linked_works = [w for w in works if w in linked]
            if not linked_works or all(w in unmatched_linked for w in linked_works):
                drift.thinker_stale.append(
                    {
                        "thinkerSlug": tslug,
                        "name": thinker.get("name"),
                        "works": works,
                        "linkedWorksOnBook": linked_works,
                    }
                )

    for cslug, cname in sorted(expected_creators.items()):
        if cslug not in thinkers:
            drift.creator_missing_thinker.append(
                {
                    "creatorSlug": cslug,
                    "creatorName": cname,
                }
            )

    # Orphan creatorSlugs on linked sources
    for src_slug, src in linked.items():
        for raw in src.get("creatorSlugs") or []:
            cslug = str(raw).strip()
            if cslug and cslug not in thinkers:
                drift.orphan_creator_slugs.append(
                    {
                        "creatorSlug": cslug,
                        "sourceSlug": src_slug,
                        "sourceName": src.get("name"),
                    }
                )

    return drift


def discover_auditable_books(repo: Path) -> list[tuple[str, Path, Path]]:
    """Return (book_id, book_dir, bibliography_path) for books with a bibliography."""
    out: list[tuple[str, Path, Path]] = []
    books_root = repo / "books"
    if not books_root.is_dir():
        return out
    for spec_path in sorted(books_root.rglob("book.yml")):
        if ".git" in spec_path.parts:
            continue
        book_dir = spec_path.parent.resolve()
        biblio = find_bibliography(book_dir)
        if biblio is None:
            continue
        book_id = _book_id_from_spec(spec_path)
        if not book_id:
            continue
        out.append((book_id, book_dir, biblio))
    return out


def books_with_sources_no_bibliography(
    repo: Path,
    sources: dict[str, dict[str, Any]],
    auditable_ids: set[str],
) -> list[dict[str, Any]]:
    claimed: dict[str, int] = {}
    for src in sources.values():
        for bid in related_books_of(src):
            claimed[bid] = claimed.get(bid, 0) + 1
    out = []
    for bid, count in sorted(claimed.items()):
        if bid in auditable_ids:
            continue
        out.append({"bookId": bid, "linkedSourceCount": count})
    return out


def format_markdown_report(
    *,
    books: list[BookDrift],
    out_of_scope: list[dict[str, Any]],
) -> str:
    lines: list[str] = []
    lines.append("# Bibliography ↔ semantic drift audit")
    lines.append("")
    lines.append(
        "Manuscript bibliographies are the source of truth for which works "
        "(and thus creators) belong to each book. This report is **read-only** — "
        "no `semantic/sources` or `semantic/thinkers` YAML was modified."
    )
    lines.append("")
    lines.append("## Follow-on reconcile rules")
    lines.append("")
    lines.append(
        "1. **missing_in_semantic** — extract drafts for that book → "
        "`make promote-semantic-source-drafts SOURCE_PROMOTE_BOOK_IDS='…'` (no prune) → backfill metadata."
    )
    lines.append(
        "2. **missing_related_books** — add the book id to the existing source’s `relatedBooks` "
        "(do not duplicate the YAML)."
    )
    lines.append(
        "3. **stale_related_books** — remove only that book id from `relatedBooks` "
        "(keep the file if still linked elsewhere)."
    )
    lines.append(
        "4. Re-derive / update thinkers so `works` and `relatedBooks` match reconciled sources; "
        "do not auto-delete multi-book thinker nodes."
    )
    lines.append("5. `make verify-semantic-ontology`.")
    lines.append("")

    total_missing = sum(len(b.missing_in_semantic) for b in books)
    total_missing_rb = sum(len(b.missing_related_books) for b in books)
    total_stale = sum(len(b.stale_related_books) for b in books)
    total_matched = sum(len(b.matched) for b in books)
    weak_books = [b.book_id for b in books if b.weak_parse or b.parse_style == "none"]

    lines.append("## Portfolio summary")
    lines.append("")
    lines.append(f"- Books with bibliography audited: **{len(books)}**")
    lines.append(f"- Matched pairs: **{total_matched}**")
    lines.append(f"- Missing in semantic (no work found): **{total_missing}**")
    lines.append(f"- Exists but missing `relatedBooks` link: **{total_missing_rb}**")
    lines.append(f"- Stale `relatedBooks` links: **{total_stale}**")
    if weak_books:
        lines.append(f"- Weak / failed parse: {', '.join(f'`{b}`' for b in weak_books)}")
    lines.append("")
    lines.append("| Book | Style | Biblio | Linked | Matched | Missing | Missing RB | Stale |")
    lines.append("| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |")
    for b in sorted(books, key=lambda x: x.book_id):
        lines.append(
            f"| `{b.book_id}` | {b.parse_style} | {b.biblio_count} | {b.linked_count} | "
            f"{len(b.matched)} | {len(b.missing_in_semantic)} | "
            f"{len(b.missing_related_books)} | {len(b.stale_related_books)} |"
        )
    lines.append("")

    if out_of_scope:
        lines.append("## Out of audit scope")
        lines.append("")
        lines.append(
            "These book ids appear in source `relatedBooks` but have **no** manuscript "
            "bibliography — no removals recommended from this audit."
        )
        lines.append("")
        for row in out_of_scope:
            lines.append(f"- `{row['bookId']}` — {row['linkedSourceCount']} linked source(s)")
        lines.append("")

    for b in sorted(books, key=lambda x: x.book_id):
        lines.append(f"## `{b.book_id}`")
        lines.append("")
        lines.append(f"- Bibliography: `{b.bibliography}`")
        lines.append(f"- Parse style: `{b.parse_style}` ({b.biblio_count} entries)")
        lines.append(f"- Semantic linked sources: {b.linked_count}")
        if b.parse_warnings:
            for w in b.parse_warnings:
                lines.append(f"- Parse warning: {w}")
        lines.append("")

        def _section(title: str, rows: list[dict[str, Any]], fmt) -> None:
            lines.append(f"### {title} ({len(rows)})")
            lines.append("")
            if not rows:
                lines.append("_None._")
                lines.append("")
                return
            for row in rows[:80]:
                lines.append(f"- {fmt(row)}")
            if len(rows) > 80:
                lines.append(f"- … and {len(rows) - 80} more")
            lines.append("")

        _section(
            "Matched",
            b.matched,
            lambda r: (
                f"`{r['sourceSlug']}` ← biblio `{r['biblioSlug']}` "
                f"({r['method']}, score={r['score']})"
            ),
        )
        _section(
            "Missing in semantic",
            b.missing_in_semantic,
            lambda r: (
                f"{r.get('biblioAuthor') or '?'} — "
                f"*{r.get('biblioTitle') or '(no title)'}* "
                f"(`{r.get('biblioSlug')}`)"
            ),
        )
        _section(
            "Exists but missing relatedBooks",
            b.missing_related_books,
            lambda r: (
                f"`{r['sourceSlug']}` matches biblio `{r['biblioSlug']}` "
                f"({r['method']}; current books: {', '.join(r.get('sourceRelatedBooks') or []) or '—'})"
            ),
        )
        _section(
            "Stale relatedBooks",
            b.stale_related_books,
            lambda r: f"`{r['sourceSlug']}` — {r.get('sourceName') or ''}",
        )
        _section(
            "Thinkers stale for this book",
            b.thinker_stale,
            lambda r: f"`{r['thinkerSlug']}` — {r.get('name') or ''}",
        )
        _section(
            "Biblio creators without thinker node",
            b.creator_missing_thinker,
            lambda r: f"`{r['creatorSlug']}` ({r.get('creatorName') or ''})",
        )
        _section(
            "Orphan creatorSlugs on linked sources",
            b.orphan_creator_slugs,
            lambda r: f"`{r['creatorSlug']}` on `{r['sourceSlug']}`",
        )

    lines.append("---")
    lines.append("")
    lines.append("*Generated by `tools/audit_bibliography_semantic_drift.py`.*")
    lines.append("")
    return "\n".join(lines)


def run_audit(repo: Path) -> dict[str, Any]:
    sources = load_sources(repo)
    thinkers = load_thinkers(repo)
    auditable = discover_auditable_books(repo)
    books: list[BookDrift] = []
    for book_id, _book_dir, biblio in auditable:
        books.append(
            audit_book(
                book_id=book_id,
                biblio_path=biblio,
                repo=repo,
                sources=sources,
                thinkers=thinkers,
            )
        )
    out_of_scope = books_with_sources_no_bibliography(repo, sources, {b for b, _, _ in auditable})
    payload = {
        "generatedBy": "tools/audit_bibliography_semantic_drift.py",
        "bookCount": len(books),
        "books": [asdict(b) for b in books],
        "outOfScope": out_of_scope,
        "totals": {
            "matched": sum(len(b.matched) for b in books),
            "missingInSemantic": sum(len(b.missing_in_semantic) for b in books),
            "missingRelatedBooks": sum(len(b.missing_related_books) for b in books),
            "staleRelatedBooks": sum(len(b.stale_related_books) for b in books),
        },
    }
    return {"payload": payload, "books": books, "outOfScope": out_of_scope}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument(
        "--md-out",
        default="reports/bibliography-semantic-drift.md",
        help="Markdown report path",
    )
    parser.add_argument(
        "--json-out",
        default="reports/bibliography-semantic-drift.json",
        help="JSON report path",
    )
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    result = run_audit(repo)
    md = format_markdown_report(books=result["books"], out_of_scope=result["outOfScope"])

    md_out = Path(args.md_out)
    if not md_out.is_absolute():
        md_out = repo / md_out
    json_out = Path(args.json_out)
    if not json_out.is_absolute():
        json_out = repo / json_out

    md_out.parent.mkdir(parents=True, exist_ok=True)
    json_out.parent.mkdir(parents=True, exist_ok=True)
    md_out.write_text(md, encoding="utf-8")
    json_out.write_text(
        json.dumps(result["payload"], indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    totals = result["payload"]["totals"]
    print(f"Wrote {md_out.relative_to(repo)}")
    print(f"Wrote {json_out.relative_to(repo)}")
    print(
        f"Books={result['payload']['bookCount']} matched={totals['matched']} "
        f"missing={totals['missingInSemantic']} missingRB={totals['missingRelatedBooks']} "
        f"stale={totals['staleRelatedBooks']}"
    )


if __name__ == "__main__":
    main()
