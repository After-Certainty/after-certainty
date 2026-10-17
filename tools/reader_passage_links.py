"""
Reader passage link audit and candidate discovery (library).

Classifies how bibliographic sources and thinkers connect to published
reader chapters. Evidence levels A–E are intentionally strict: bibliography
membership, keyword overlap, or a surname in prose never count as verified
passage engagement (level A).
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from collections import defaultdict
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Literal

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

_TOOLS_DIR = Path(__file__).resolve().parent
if str(_TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(_TOOLS_DIR))

from audit_bibliography_semantic_drift import (  # noqa: E402
    MATCH_THRESHOLD,
    find_bibliography,
    load_sources,
    load_thinkers,
    match_expected_to_sources,
    normalize_match_text,
    related_books_of,
    score_expected_vs_source,
    source_author_blob,
)
from audit_citations import FOOTNOTE_DEF  # noqa: E402
from bibliography_parse import parse_bibliography  # noqa: E402
from book_specs import discover_book_spec_paths  # noqa: E402
from manuscript_structure import build_structure_for_book, load_chapter_enrichment  # noqa: E402
from source_metadata import split_display_name, strip_markdown_italics  # noqa: E402

EvidenceLevel = Literal["A", "B", "C", "D", "E"]

PASSAGE_PATH_RE = re.compile(
    r"^/explore/books/([a-z0-9-]+)/chapters/([a-z0-9-]+)(?:#([a-z0-9-]+))?$"
)

DEFAULT_REPORT_DIR = Path("reports/reader-passage-links")
GENERIC_WHY_RE = re.compile(
    r"^(this (work|source|paper|book)|important|relevant|key reference)\b",
    re.I,
)

SKIP_STEMS = frozenset(
    {
        "title-page",
        "copyright",
        "about-the-series",
        "about-this-book",
        "note-on-examples",
        "authors-note",
        "how-to-read-this-book",
        "how-to-read-this-history",
        "series-guide",
        "bibliography",
        "references",
        "glossary",
    }
)


# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------


@dataclass
class ChapterRef:
    edition_slug: str
    route_key: str
    title: str
    source_path: str
    book_dir: str
    public: bool
    chapter_id: str


@dataclass
class FootnoteHit:
    edition_slug: str
    route_key: str
    chapter_title: str
    source_path: str
    book_dir: str
    footnote_id: str
    def_text: str
    line_start: int
    line_end: int
    excerpt: str
    score: int
    method: str


@dataclass
class ProseHit:
    edition_slug: str
    route_key: str
    chapter_title: str
    source_path: str
    book_dir: str
    line_start: int
    line_end: int
    excerpt: str
    phrase: str


@dataclass
class PathValidation:
    path: str
    valid_format: bool = False
    edition_slug: str | None = None
    chapter_slug: str | None = None
    fragment: str | None = None
    chapter_found: bool = False
    chapter_public: bool = False
    related_book_ok: bool = False
    fragment_ok: bool | None = None
    fragment_error: str | None = None
    issues: list[str] = field(default_factory=list)

    @property
    def is_fully_valid(self) -> bool:
        if not (
            self.valid_format
            and self.chapter_found
            and self.chapter_public
            and self.related_book_ok
            and not self.issues
        ):
            return False
        if self.fragment is not None and self.fragment_ok is not True:
            return False
        return True


@dataclass
class SourceAudit:
    slug: str
    yaml_path: str
    name: str
    related_books: list[str]
    in_bibliography_books: list[str]
    footnote_hits: list[FootnoteHit] = field(default_factory=list)
    prose_hits: list[ProseHit] = field(default_factory=list)
    reader_passage_path: str | None = None
    path_validation: PathValidation | None = None
    why_this_matters: str | None = None
    why_this_matters_ok: bool = False
    evidence_level: EvidenceLevel = "E"
    status: str = "no_evidence"
    notes: list[str] = field(default_factory=list)
    candidate_path: str | None = None
    recommended_action: str = "none"


@dataclass
class ThinkerAudit:
    slug: str
    yaml_path: str
    name: str
    work_slugs: list[str]
    books: list[str]
    work_passage_links: list[dict[str, Any]] = field(default_factory=list)
    chapters_citing_works: list[dict[str, Any]] = field(default_factory=list)
    direct_mention_chapters: list[dict[str, Any]] = field(default_factory=list)
    evidence_level: EvidenceLevel = "E"
    status: str = "no_evidence"
    has_useful_path: bool = False
    notes: list[str] = field(default_factory=list)
    recommended_action: str = "none"


@dataclass
class Candidate:
    entity_kind: Literal["source", "thinker"]
    slug: str
    yaml_path: str
    book_id: str
    chapter_title: str
    route_key: str
    manuscript_path: str
    line_start: int
    line_end: int
    excerpt: str
    candidate_reader_passage_path: str | None
    evidence_level: EvidenceLevel
    explanation: str
    anchor_exists: bool | None
    recommended_action: str
    needs_editorial_review: bool
    related_work_slug: str | None = None


@dataclass
class AuditResult:
    sources: list[SourceAudit]
    thinkers: list[ThinkerAudit]
    totals: dict[str, Any] = field(default_factory=dict)


# ---------------------------------------------------------------------------
# Loading helpers
# ---------------------------------------------------------------------------


def _load_yaml(path: Path) -> dict[str, Any]:
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    return raw if isinstance(raw, dict) else {}


def phrases_for_source(name: str, summary: str, title: str = "") -> list[str]:
    """Title probes for prose co-occurrence (level C ceiling)."""
    raw: list[str] = []
    titled = strip_markdown_italics(title or "").strip()
    if titled and len(titled) >= 4:
        raw.append(titled)
    if " — " in name:
        t = name.split(" — ", 1)[1].strip()
        if t:
            raw.append(strip_markdown_italics(t))
    if isinstance(summary, str):
        for m in re.finditer(r"\*([^*]+)\*", summary):
            t = m.group(1).strip()
            if len(t) >= 4:
                raw.append(t)
        for m in re.finditer(r'"([^"]+)"', summary):
            t = m.group(1).strip()
            if len(t) >= 4:
                raw.append(t)

    seen_ci: set[str] = set()
    deduped: list[str] = []
    for p in raw:
        key = p.casefold()
        if key in seen_ci:
            continue
        seen_ci.add(key)
        deduped.append(p)
    deduped.sort(key=len, reverse=True)
    return deduped[:6]


def _load_book_yaml(spec_path: Path) -> dict[str, Any] | None:
    """Load book.yml without schema validation (same approach as build_all_structures)."""
    try:
        raw = yaml.safe_load(spec_path.read_text(encoding="utf-8"))
    except (OSError, yaml.YAMLError):
        return None
    return raw if isinstance(raw, dict) else None


def load_published_chapters(repo: Path) -> dict[str, ChapterRef]:
    """Map routeKey → ChapterRef for published manuscript books."""
    out: dict[str, ChapterRef] = {}
    for spec_path in discover_book_spec_paths(repo):
        book_dir = spec_path.parent
        if not (book_dir / "index.md").is_file():
            continue
        spec = _load_book_yaml(spec_path)
        if spec is None:
            continue
        book = spec.get("book") if isinstance(spec, dict) else None
        if not isinstance(book, dict):
            continue
        status = str(book.get("publicStatus") or book.get("status") or "").strip()
        if status in {"archived", "superseded", "draft"}:
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
        rel_book = str(book_dir.relative_to(repo))
        for chapter in chapters:
            route = str(chapter.get("routeKey") or "").strip()
            if not route:
                continue
            out[route] = ChapterRef(
                edition_slug=slug,
                route_key=route,
                title=str(chapter.get("title") or ""),
                source_path=str(chapter.get("sourcePath") or ""),
                book_dir=rel_book,
                public=bool(chapter.get("public")),
                chapter_id=str(chapter.get("id") or ""),
            )
    return out


def load_bibliography_membership(
    repo: Path,
    sources: dict[str, dict[str, Any]],
) -> dict[str, list[str]]:
    """source_slug → book_ids where the work appears in the manuscript bibliography."""
    membership: dict[str, list[str]] = defaultdict(list)
    for spec_path in discover_book_spec_paths(repo):
        book_dir = spec_path.parent
        spec = _load_book_yaml(spec_path)
        if spec is None:
            continue
        book = spec.get("book") if isinstance(spec, dict) else None
        if not isinstance(book, dict):
            continue
        book_id = str(book.get("id") or "").strip()
        if not book_id:
            continue
        bib = find_bibliography(book_dir)
        if bib is None:
            continue
        try:
            parsed = parse_bibliography(bib.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        rows = list(parsed.rows)
        if not rows:
            continue
        related = {
            slug: src
            for slug, src in sources.items()
            if book_id in related_books_of(src) or not related_books_of(src)
        }
        # Prefer sources already linked to this book, then fall back to all.
        candidates = related if related else sources
        hits, _unmatched, _unused = match_expected_to_sources(rows, candidates)
        for hit in hits:
            if book_id not in membership[hit.source_slug]:
                membership[hit.source_slug].append(book_id)
    for slug in membership:
        membership[slug].sort()
    return dict(membership)


def _strip_footnote_defs(text: str) -> str:
    return re.sub(
        r"^\[\^[^\]]+\]:.*$(?:\n(?!\[\^|\n).*)*",
        "",
        text,
        flags=re.M,
    )


def _line_span_for_match(text: str, start: int, end: int) -> tuple[int, int]:
    before = text.count("\n", 0, start)
    after = text.count("\n", 0, end)
    return before + 1, after + 1


def _excerpt_around(text: str, start: int, end: int, *, radius: int = 180) -> str:
    lo = max(0, start - radius)
    hi = min(len(text), end + radius)
    chunk = text[lo:hi].replace("\n", " ")
    return re.sub(r"\s+", " ", chunk).strip()


def _footnote_defs_in_text(text: str) -> list[tuple[str, str, int, int]]:
    """Return (id, definition_body, start, end) for each footnote definition."""
    out: list[tuple[str, str, int, int]] = []
    matches = list(FOOTNOTE_DEF.finditer(text))
    for i, m in enumerate(matches):
        fid = m.group(1)
        start = m.start()
        body_start = m.end()
        body_end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[body_start:body_end].strip()
        # Trim trailing blank lines from span for cleaner excerpts
        end = body_start + len(text[body_start:body_end].rstrip())
        out.append((fid, body, start, end))
    return out


def score_footnote_vs_source(def_text: str, src: dict[str, Any]) -> tuple[int, str]:
    """Score a footnote definition body against a semantic source.

    The definition text is the evidence side; source metadata is the candidate.
    Never invert this (that would make every source match itself).
    """
    def_norm = normalize_match_text(def_text)
    if not def_norm:
        return 0, "none"

    title = str(src.get("title") or "").strip()
    if not title:
        title = split_display_name(str(src.get("name") or ""))[1]
    title = strip_markdown_italics(title).strip()
    title_norm = normalize_match_text(title)

    author_blob = normalize_match_text(source_author_blob(src))
    author_tokens = {t for t in author_blob.split() if len(t) > 2}

    # Strong: distinctive title substring + author token in the footnote.
    if title_norm and len(title_norm) >= 8 and title_norm in def_norm:
        if any(t in def_norm for t in author_tokens):
            return 90, "footnote_title_author"
        return 70, "footnote_title_only"

    # Medium: first significant title tokens all present + author.
    title_tokens = [t for t in title_norm.split() if len(t) > 3][:5]
    if len(title_tokens) >= 3 and all(t in def_norm for t in title_tokens[:3]):
        if any(t in def_norm for t in author_tokens):
            return 75, "footnote_title_tokens_author"
        return 58, "footnote_title_tokens"

    # Citation / name blob containment (source citation string inside def, or vice versa).
    citation_norm = normalize_match_text(f"{src.get('citation', '')} {src.get('summary', '')}")
    if citation_norm and len(citation_norm) >= 24:
        # Overlap of content words
        cite_toks = {t for t in citation_norm.split() if len(t) > 3}
        def_toks = {t for t in def_norm.split() if len(t) > 3}
        if cite_toks and def_toks:
            overlap = cite_toks & def_toks
            if len(overlap) >= 4 and any(t in def_norm for t in author_tokens):
                return 65, "footnote_citation_overlap"

    # Fall back to biblio scorer treating the footnote as a free-text summary row.
    pseudo = {
        "workTitle": title,
        "author": " ".join(sorted(author_tokens)[:4]),
        "summary": def_text,
        "slug": "",
    }
    # Only accept when the source title is evidenced in the definition.
    score, method = score_expected_vs_source(pseudo, src)
    if score >= MATCH_THRESHOLD and title_norm and title_norm[:12] in def_norm:
        return score, f"biblio_scorer:{method}"
    return 0, "none"


def index_chapter_engagement(
    repo: Path,
    chapters: dict[str, ChapterRef],
    sources: dict[str, dict[str, Any]],
) -> tuple[dict[str, list[FootnoteHit]], dict[str, list[ProseHit]]]:
    """Scan published chapters for footnote and prose engagement per source."""
    footnote_by_source: dict[str, list[FootnoteHit]] = defaultdict(list)
    prose_by_source: dict[str, list[ProseHit]] = defaultdict(list)

    # Precompute probes scoped by related books.
    sources_by_book: dict[str, list[str]] = defaultdict(list)
    global_sources: list[str] = []
    phrases: dict[str, list[str]] = {}
    for slug, src in sources.items():
        books = related_books_of(src)
        phrases[slug] = phrases_for_source(
            str(src.get("name") or ""),
            str(src.get("summary") or ""),
            str(src.get("title") or ""),
        )
        if not books:
            global_sources.append(slug)
        else:
            for b in books:
                sources_by_book[b].append(slug)

    for route_key in sorted(chapters.keys()):
        chapter = chapters[route_key]
        path = repo / chapter.book_dir / chapter.source_path
        if not path.is_file():
            continue
        stem = Path(chapter.source_path).stem.lower()
        if stem in SKIP_STEMS or "bibliography" in stem:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except OSError:
            continue

        candidates = list(
            dict.fromkeys(sources_by_book.get(chapter.edition_slug, []) + global_sources)
        )
        if not candidates:
            continue

        for fid, body, start, end in _footnote_defs_in_text(text):
            best_slug = ""
            best_score = 0
            best_method = "none"
            for slug in candidates:
                score, method = score_footnote_vs_source(body, sources[slug])
                if score > best_score:
                    best_score = score
                    best_slug = slug
                    best_method = method
            if best_score >= MATCH_THRESHOLD and best_slug:
                line_start, line_end = _line_span_for_match(text, start, end)
                footnote_by_source[best_slug].append(
                    FootnoteHit(
                        edition_slug=chapter.edition_slug,
                        route_key=route_key,
                        chapter_title=chapter.title,
                        source_path=chapter.source_path,
                        book_dir=chapter.book_dir,
                        footnote_id=fid,
                        def_text=body[:400],
                        line_start=line_start,
                        line_end=line_end,
                        excerpt=_excerpt_around(text, start, end),
                        score=best_score,
                        method=best_method,
                    )
                )

        body_text = _strip_footnote_defs(text)
        for slug in candidates:
            # Skip prose scoring when we already have a strong footnote hit in this chapter.
            if any(h.route_key == route_key for h in footnote_by_source.get(slug, [])):
                continue
            for phrase in phrases.get(slug, []):
                if len(phrase) < 8:
                    continue
                # Word-boundary-ish search; avoid short surname-only matches.
                pattern = re.compile(re.escape(phrase), re.I)
                m = pattern.search(body_text)
                if not m:
                    continue
                line_start, line_end = _line_span_for_match(body_text, m.start(), m.end())
                prose_by_source[slug].append(
                    ProseHit(
                        edition_slug=chapter.edition_slug,
                        route_key=route_key,
                        chapter_title=chapter.title,
                        source_path=chapter.source_path,
                        book_dir=chapter.book_dir,
                        line_start=line_start,
                        line_end=line_end,
                        excerpt=_excerpt_around(body_text, m.start(), m.end()),
                        phrase=phrase,
                    )
                )
                break  # one prose hit per source per chapter

    for slug in footnote_by_source:
        footnote_by_source[slug].sort(key=lambda h: (h.edition_slug, h.route_key, h.footnote_id))
    for slug in prose_by_source:
        prose_by_source[slug].sort(key=lambda h: (h.edition_slug, h.route_key, h.phrase))
    return dict(footnote_by_source), dict(prose_by_source)


# ---------------------------------------------------------------------------
# Path / fragment validation
# ---------------------------------------------------------------------------


def parse_reader_passage_path(path: str) -> tuple[str | None, str | None, str | None]:
    m = PASSAGE_PATH_RE.match(path.strip())
    if not m:
        return None, None, None
    return m.group(1), m.group(2), m.group(3)


def validate_fragment_in_rendered_html(
    repo: Path,
    *,
    book_dir: str,
    source_path: str,
    fragment: str,
    timeout_s: float = 60.0,
) -> tuple[bool, str | None]:
    """
    Validate fragment id against the site reader HTML pipeline.

    Uses apps/site/scripts/validate-reader-passage-fragment.ts via npx tsx.
    """
    script = repo / "apps" / "site" / "scripts" / "validate-reader-passage-fragment.ts"
    if not script.is_file():
        return False, f"missing fragment validator script: {script}"
    markdown_path = repo / book_dir / source_path
    if not markdown_path.is_file():
        return False, f"missing manuscript: {book_dir}/{source_path}"

    cmd = [
        "npx",
        "--yes",
        "tsx",
        str(script),
        "--book-dir",
        book_dir,
        "--source-path",
        source_path,
        "--fragment",
        fragment,
        "--repo",
        str(repo),
    ]
    try:
        proc = subprocess.run(
            cmd,
            cwd=str(repo / "apps" / "site"),
            capture_output=True,
            text=True,
            timeout=timeout_s,
            check=False,
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        return False, f"fragment validator failed to run: {exc}"

    stdout = (proc.stdout or "").strip()
    if not stdout:
        err = (proc.stderr or "").strip() or f"exit {proc.returncode}"
        return False, f"fragment validator produced no JSON: {err}"
    # Last JSON line wins (tsx may print warnings).
    json_line = ""
    for line in reversed(stdout.splitlines()):
        line = line.strip()
        if line.startswith("{"):
            json_line = line
            break
    if not json_line:
        return False, f"fragment validator output not JSON: {stdout[:200]}"
    try:
        payload = json.loads(json_line)
    except json.JSONDecodeError as exc:
        return False, f"fragment validator JSON error: {exc}"
    if payload.get("ok") is True:
        return True, None
    return False, str(payload.get("error") or "fragment not found in rendered HTML")


def markdown_has_footnote_ref(text: str, footnote_id: str) -> bool:
    return bool(re.search(rf"\[\^{re.escape(footnote_id)}\](?!:)", text))


def validate_reader_passage_path(
    path: str,
    *,
    related_books: list[str],
    chapters: dict[str, ChapterRef],
    repo: Path | None = None,
    check_fragment: bool = True,
    fragment_cache: dict[tuple[str, str, str], tuple[bool, str | None]] | None = None,
) -> PathValidation:
    result = PathValidation(path=path)
    edition, chapter_slug, fragment = parse_reader_passage_path(path)
    if edition is None:
        result.issues.append("invalid_path_format")
        return result
    result.valid_format = True
    result.edition_slug = edition
    result.chapter_slug = chapter_slug
    result.fragment = fragment

    route_key = f"/explore/books/{edition}/chapters/{chapter_slug}"
    chapter = chapters.get(route_key)
    if chapter is None:
        result.issues.append("chapter_not_found")
        return result
    result.chapter_found = True
    result.chapter_public = bool(chapter.public)
    if not chapter.public:
        result.issues.append("chapter_not_public")

    if related_books and edition not in related_books:
        result.issues.append("edition_not_in_related_books")
    else:
        result.related_book_ok = True

    if fragment and check_fragment:
        if repo is None:
            result.fragment_ok = False
            result.fragment_error = "repo required for fragment validation"
            result.issues.append("fragment_unvalidated")
        else:
            cache_key = (chapter.book_dir, chapter.source_path, fragment)
            if fragment_cache is not None and cache_key in fragment_cache:
                ok, err = fragment_cache[cache_key]
            else:
                ok, err = validate_fragment_in_rendered_html(
                    repo,
                    book_dir=chapter.book_dir,
                    source_path=chapter.source_path,
                    fragment=fragment,
                )
                if fragment_cache is not None:
                    fragment_cache[cache_key] = (ok, err)
            result.fragment_ok = ok
            result.fragment_error = err
            if not ok:
                result.issues.append("fragment_missing")
    elif not fragment:
        result.fragment_ok = None

    return result


def why_this_matters_looks_ok(text: str | None) -> bool:
    if not text or not str(text).strip():
        return False
    cleaned = re.sub(r"\s+", " ", str(text)).strip()
    if len(cleaned) < 40:
        return False
    if GENERIC_WHY_RE.match(cleaned):
        return False
    return True


def candidate_path_from_footnote(hit: FootnoteHit) -> str:
    return f"{hit.route_key}#user-content-fnref-{hit.footnote_id}"


def candidate_path_from_heading(route_key: str, heading_fragment: str) -> str:
    return f"{route_key}#{heading_fragment}"


# ---------------------------------------------------------------------------
# Classification
# ---------------------------------------------------------------------------


def classify_source(
    src: dict[str, Any],
    *,
    biblio_books: list[str],
    footnote_hits: list[FootnoteHit],
    prose_hits: list[ProseHit],
    chapters: dict[str, ChapterRef],
    repo: Path,
    fragment_cache: dict[tuple[str, str, str], tuple[bool, str | None]],
    check_fragments: bool = True,
) -> SourceAudit:
    slug = str(src.get("slug") or "")
    related = related_books_of(src)
    why = str(src.get("whyThisMatters") or "").strip() or None
    path = str(src.get("readerPassagePath") or "").strip() or None

    audit = SourceAudit(
        slug=slug,
        yaml_path=str(src.get("_path") or f"semantic/sources/{slug}.yml"),
        name=str(src.get("name") or slug),
        related_books=related,
        in_bibliography_books=list(biblio_books),
        footnote_hits=footnote_hits,
        prose_hits=prose_hits,
        reader_passage_path=path,
        why_this_matters=why,
        why_this_matters_ok=why_this_matters_looks_ok(why),
    )

    if path:
        audit.path_validation = validate_reader_passage_path(
            path,
            related_books=related,
            chapters=chapters,
            repo=repo,
            check_fragment=check_fragments,
            fragment_cache=fragment_cache,
        )

    has_footnote = bool(footnote_hits)
    has_prose = bool(prose_hits)
    has_biblio = bool(biblio_books) or bool(related)

    if path and audit.path_validation and audit.path_validation.is_fully_valid:
        # Prefer verified citation engagement for level A.
        path_route = path.split("#", 1)[0]
        cited_here = any(h.route_key == path_route for h in footnote_hits)
        if cited_here or has_footnote:
            audit.evidence_level = "A"
            audit.status = "verified_passage"
            audit.recommended_action = "none"
            if not audit.why_this_matters_ok:
                audit.notes.append("missing_or_weak_whyThisMatters")
                audit.recommended_action = "add_why_this_matters"
        else:
            # Valid deep link without established citation → still surface as
            # verified destination but flag for editorial confirmation.
            audit.evidence_level = "A"
            audit.status = "verified_passage_unconfirmed_citation"
            audit.notes.append("path_valid_but_no_matched_footnote")
            audit.recommended_action = "confirm_citation_relevance"
    elif path and audit.path_validation and not audit.path_validation.is_fully_valid:
        audit.status = "invalid_passage_link"
        audit.notes.extend(audit.path_validation.issues)
        if has_footnote:
            audit.evidence_level = "B"
            hit = footnote_hits[0]
            audit.candidate_path = candidate_path_from_footnote(hit)
            audit.recommended_action = "fix_reader_passage_path"
        elif has_prose:
            audit.evidence_level = "C"
            audit.recommended_action = "editorial_review_prose_hit"
        elif has_biblio:
            audit.evidence_level = "D"
            audit.recommended_action = "do_not_fabricate_citation"
        else:
            audit.evidence_level = "E"
            audit.recommended_action = "remove_or_fix_path"
    elif has_footnote:
        audit.evidence_level = "B"
        audit.status = "strong_candidate"
        hit = footnote_hits[0]
        audit.candidate_path = candidate_path_from_footnote(hit)
        audit.recommended_action = "add_reader_passage_path"
        if not audit.why_this_matters_ok:
            audit.notes.append("missing_or_weak_whyThisMatters")
    elif has_prose:
        audit.evidence_level = "C"
        audit.status = "thematic_connection"
        prose = prose_hits[0]
        audit.candidate_path = prose.route_key
        audit.recommended_action = "editorial_review_consider_citation"
        audit.notes.append("prose_title_match_only")
    elif has_biblio:
        audit.evidence_level = "D"
        audit.status = "bibliography_only"
        audit.recommended_action = "do_not_fabricate_citation"
    else:
        audit.evidence_level = "E"
        audit.status = "no_evidence"
        audit.recommended_action = "none"

    return audit


def thinker_work_slugs(
    thinker: dict[str, Any],
    sources: dict[str, dict[str, Any]],
) -> list[str]:
    works: list[str] = []
    seen: set[str] = set()
    raw_works = thinker.get("works") or []
    if isinstance(raw_works, list):
        for w in raw_works:
            s = str(w).strip().removeprefix("source-")
            if s and s not in seen:
                seen.add(s)
                works.append(s)
    thinker_slug = str(thinker.get("slug") or "")
    for slug, src in sources.items():
        creators = src.get("creatorSlugs") or []
        if isinstance(creators, list) and thinker_slug in [str(c).strip() for c in creators]:
            if slug not in seen:
                seen.add(slug)
                works.append(slug)
    works.sort()
    return works


def classify_thinker(
    thinker: dict[str, Any],
    *,
    sources: dict[str, dict[str, Any]],
    source_audits: dict[str, SourceAudit],
) -> ThinkerAudit:
    slug = str(thinker.get("slug") or "")
    work_slugs = thinker_work_slugs(thinker, sources)
    books: set[str] = set()
    for w in related_books_of(thinker):
        books.add(w)
    work_links: list[dict[str, Any]] = []
    citing: list[dict[str, Any]] = []
    best_level: EvidenceLevel = "E"
    level_rank = {"A": 5, "B": 4, "C": 3, "D": 2, "E": 1}

    for wslug in work_slugs:
        src = sources.get(wslug)
        if src:
            for b in related_books_of(src):
                books.add(b)
        sa = source_audits.get(wslug)
        if not sa:
            continue
        if level_rank[sa.evidence_level] > level_rank[best_level]:
            best_level = sa.evidence_level
        if sa.reader_passage_path and sa.path_validation and sa.path_validation.is_fully_valid:
            work_links.append(
                {
                    "sourceSlug": wslug,
                    "readerPassagePath": sa.reader_passage_path,
                    "whyThisMatters": sa.why_this_matters,
                    "evidenceLevel": sa.evidence_level,
                }
            )
        for hit in sa.footnote_hits:
            citing.append(
                {
                    "sourceSlug": wslug,
                    "routeKey": hit.route_key,
                    "chapterTitle": hit.chapter_title,
                    "footnoteId": hit.footnote_id,
                }
            )
            books.add(hit.edition_slug)

    citing.sort(key=lambda r: (r["routeKey"], r["sourceSlug"], r["footnoteId"]))
    work_links.sort(key=lambda r: (r["sourceSlug"], r["readerPassagePath"]))

    audit = ThinkerAudit(
        slug=slug,
        yaml_path=str(thinker.get("_path") or f"semantic/thinkers/{slug}.yml"),
        name=str(thinker.get("name") or slug),
        work_slugs=work_slugs,
        books=sorted(books),
        work_passage_links=work_links,
        chapters_citing_works=citing,
        evidence_level=best_level,
    )

    if work_links:
        audit.status = "derivable_passages"
        audit.has_useful_path = True
        audit.recommended_action = "surface_derived_passages_on_thinker_page"
        audit.evidence_level = (
            "A" if any(w["evidenceLevel"] == "A" for w in work_links) else best_level
        )
    elif citing:
        audit.status = "works_cited_without_source_path"
        audit.has_useful_path = False
        audit.recommended_action = "enrich_source_passage_links_first"
        audit.evidence_level = "B"
    elif work_slugs and books:
        audit.status = "works_linked_bibliography_only"
        audit.recommended_action = "wait_for_source_engagement"
        audit.evidence_level = "D"
    elif work_slugs:
        audit.status = "works_without_book_path"
        audit.recommended_action = "none"
        audit.evidence_level = "E"
    else:
        audit.status = "no_works"
        audit.recommended_action = "none"
        audit.evidence_level = "E"

    return audit


# ---------------------------------------------------------------------------
# Audit orchestration
# ---------------------------------------------------------------------------


def run_audit(
    repo: Path,
    *,
    check_fragments: bool = True,
    source_slugs: set[str] | None = None,
    thinker_slugs: set[str] | None = None,
    book_id: str | None = None,
) -> AuditResult:
    repo = repo.resolve()
    sources = load_sources(repo)
    thinkers = load_thinkers(repo)
    chapters = load_published_chapters(repo)
    biblio = load_bibliography_membership(repo, sources)
    footnote_idx, prose_idx = index_chapter_engagement(repo, chapters, sources)
    fragment_cache: dict[tuple[str, str, str], tuple[bool, str | None]] = {}

    source_audits: list[SourceAudit] = []
    for slug in sorted(sources.keys()):
        if source_slugs is not None and slug not in source_slugs:
            continue
        src = sources[slug]
        related = related_books_of(src)
        if book_id and book_id not in related and book_id not in biblio.get(slug, []):
            # Still include if engagement hits this book.
            fn_hits = footnote_idx.get(slug, [])
            pr_hits = prose_idx.get(slug, [])
            if not any(h.edition_slug == book_id for h in fn_hits) and not any(
                h.edition_slug == book_id for h in pr_hits
            ):
                continue
        source_audits.append(
            classify_source(
                src,
                biblio_books=biblio.get(slug, []),
                footnote_hits=footnote_idx.get(slug, []),
                prose_hits=prose_idx.get(slug, []),
                chapters=chapters,
                repo=repo,
                fragment_cache=fragment_cache,
                check_fragments=check_fragments,
            )
        )

    by_slug = {s.slug: s for s in source_audits}
    # For thinker classification we need full source audits when filtering;
    # classify remaining sources lightly if needed.
    if source_slugs is not None:
        for slug, src in sources.items():
            if slug in by_slug:
                continue
            by_slug[slug] = classify_source(
                src,
                biblio_books=biblio.get(slug, []),
                footnote_hits=footnote_idx.get(slug, []),
                prose_hits=prose_idx.get(slug, []),
                chapters=chapters,
                repo=repo,
                fragment_cache=fragment_cache,
                check_fragments=False,
            )

    thinker_audits: list[ThinkerAudit] = []
    for slug in sorted(thinkers.keys()):
        if thinker_slugs is not None and slug not in thinker_slugs:
            continue
        ta = classify_thinker(thinkers[slug], sources=sources, source_audits=by_slug)
        if book_id and book_id not in ta.books:
            continue
        thinker_audits.append(ta)

    totals = compute_totals(source_audits, thinker_audits)
    return AuditResult(sources=source_audits, thinkers=thinker_audits, totals=totals)


def compute_totals(sources: list[SourceAudit], thinkers: list[ThinkerAudit]) -> dict[str, Any]:
    def count_levels(items: list[Any], attr: str = "evidence_level") -> dict[str, int]:
        out = {k: 0 for k in ("A", "B", "C", "D", "E")}
        for item in items:
            lvl = getattr(item, attr)
            out[lvl] = out.get(lvl, 0) + 1
        return out

    source_levels = count_levels(sources)
    thinker_levels = count_levels(thinkers)
    with_path = sum(1 for s in sources if s.reader_passage_path)
    valid_path = sum(
        1 for s in sources if s.path_validation is not None and s.path_validation.is_fully_valid
    )
    invalid_path = sum(
        1
        for s in sources
        if s.reader_passage_path
        and s.path_validation is not None
        and not s.path_validation.is_fully_valid
    )
    missing_path_with_footnote = sum(
        1 for s in sources if not s.reader_passage_path and s.footnote_hits
    )
    biblio_only = source_levels["D"]
    thinkers_with_derived = sum(1 for t in thinkers if t.work_passage_links)
    n_sources = max(1, len(sources))
    n_thinkers = max(1, len(thinkers))
    return {
        "sources": {
            "total": len(sources),
            "withReaderPassagePath": with_path,
            "validPassageLinks": valid_path,
            "invalidPassageLinks": invalid_path,
            "missingPathWithFootnote": missing_path_with_footnote,
            "bibliographyOnly": biblio_only,
            "byEvidenceLevel": source_levels,
            "verifiedCoveragePct": round(100.0 * source_levels["A"] / n_sources, 2),
            "whyThisMattersOk": sum(1 for s in sources if s.why_this_matters_ok),
        },
        "thinkers": {
            "total": len(thinkers),
            "withDerivablePassages": thinkers_with_derived,
            "byEvidenceLevel": thinker_levels,
            "usefulPathPct": round(100.0 * thinkers_with_derived / n_thinkers, 2),
        },
    }


# ---------------------------------------------------------------------------
# Serialization / reports
# ---------------------------------------------------------------------------


def _json_ready(obj: Any) -> Any:
    if hasattr(obj, "__dataclass_fields__"):
        return {k: _json_ready(v) for k, v in asdict(obj).items()}
    if isinstance(obj, list):
        return [_json_ready(x) for x in obj]
    if isinstance(obj, dict):
        return {k: _json_ready(v) for k, v in obj.items()}
    return obj


def audit_to_json(result: AuditResult) -> dict[str, Any]:
    return {
        "totals": result.totals,
        "sources": [_json_ready(s) for s in result.sources],
        "thinkers": [_json_ready(t) for t in result.thinkers],
    }


def format_audit_markdown(result: AuditResult) -> str:
    t = result.totals
    s = t.get("sources", {})
    th = t.get("thinkers", {})
    lines: list[str] = [
        "# Reader passage links audit",
        "",
        "Read-only scan of `semantic/sources`, `semantic/thinkers`, and published",
        "manuscripts. Evidence levels A–E follow the reader-passage-enrichment skill:",
        "bibliography-only and keyword overlap never count as verified passages.",
        "",
        "## Coverage summary",
        "",
        "### Sources",
        "",
        f"- Total sources scanned: **{s.get('total', 0)}**",
        f"- With `readerPassagePath`: **{s.get('withReaderPassagePath', 0)}**",
        f"- Valid passage links: **{s.get('validPassageLinks', 0)}**",
        f"- Invalid passage links: **{s.get('invalidPassageLinks', 0)}**",
        f"- Missing path but footnote-cited: **{s.get('missingPathWithFootnote', 0)}**",
        f"- Bibliography only (level D): **{s.get('bibliographyOnly', 0)}**",
        f"- Verified (level A) coverage: **{s.get('verifiedCoveragePct', 0)}%**",
        f"- `whyThisMatters` present/substantive: **{s.get('whyThisMattersOk', 0)}**",
        "",
        "Evidence levels:",
        "",
    ]
    for lvl in ("A", "B", "C", "D", "E"):
        lines.append(f"- {lvl}: {s.get('byEvidenceLevel', {}).get(lvl, 0)}")
    lines.extend(
        [
            "",
            "### Thinkers",
            "",
            f"- Total thinkers scanned: **{th.get('total', 0)}**",
            f"- With derivable work passage links: **{th.get('withDerivablePassages', 0)}**",
            f"- Useful derived path coverage: **{th.get('usefulPathPct', 0)}%**",
            "",
            "Evidence levels:",
            "",
        ]
    )
    for lvl in ("A", "B", "C", "D", "E"):
        lines.append(f"- {lvl}: {th.get('byEvidenceLevel', {}).get(lvl, 0)}")

    # Invalid links
    invalid = [
        src
        for src in result.sources
        if src.reader_passage_path
        and src.path_validation
        and not src.path_validation.is_fully_valid
    ]
    lines.extend(["", "## Unresolved / invalid passage links", ""])
    if not invalid:
        lines.append("_None._")
    else:
        for src in invalid:
            issues = ", ".join(src.path_validation.issues) if src.path_validation else ""
            lines.append(f"- `{src.slug}`: `{src.reader_passage_path}` — {issues}")

    # Ranked opportunities (B then C, then invalid)
    opportunities = [
        src
        for src in result.sources
        if src.evidence_level in {"B", "C"}
        or src.status == "invalid_passage_link"
        or (src.evidence_level == "A" and src.recommended_action != "none")
    ]
    opportunities.sort(
        key=lambda s: (
            {"B": 0, "C": 1, "A": 2, "D": 3, "E": 4}[s.evidence_level],
            0 if s.status == "invalid_passage_link" else 1,
            s.slug,
        )
    )
    lines.extend(["", "## Ranked improvement opportunities", ""])
    if not opportunities:
        lines.append("_None at evidence levels A–C needing action._")
    else:
        for src in opportunities[:50]:
            cand = src.candidate_path or src.reader_passage_path or "—"
            lines.append(
                f"- **{src.evidence_level}** `{src.slug}` — {src.status}; "
                f"action `{src.recommended_action}`; candidate `{cand}`"
            )
        if len(opportunities) > 50:
            lines.append(f"- … and {len(opportunities) - 50} more (see JSON).")

    # Concrete examples: verified A
    verified = [src for src in result.sources if src.evidence_level == "A"]
    lines.extend(["", "## Verified passage examples (level A)", ""])
    if not verified:
        lines.append("_None yet._")
    else:
        for src in verified[:20]:
            lines.append(f"- `{src.slug}` → `{src.reader_passage_path}`")

    # Thinker derived
    derivable = [t for t in result.thinkers if t.work_passage_links]
    lines.extend(["", "## Thinkers with derivable passage links", ""])
    if not derivable:
        lines.append("_None yet._")
    else:
        for t in derivable[:30]:
            links = ", ".join(
                f"`{w['sourceSlug']}` → `{w['readerPassagePath']}`" for w in t.work_passage_links
            )
            lines.append(f"- `{t.slug}`: {links}")

    lines.append("")
    return "\n".join(lines)


def write_audit_reports(
    result: AuditResult,
    *,
    md_out: Path,
    json_out: Path,
) -> None:
    md_out.parent.mkdir(parents=True, exist_ok=True)
    json_out.parent.mkdir(parents=True, exist_ok=True)
    md_out.write_text(format_audit_markdown(result), encoding="utf-8")
    json_out.write_text(
        json.dumps(audit_to_json(result), indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


# ---------------------------------------------------------------------------
# Propose candidates
# ---------------------------------------------------------------------------


def load_review_log(path: Path) -> dict[str, dict[str, Any]]:
    if not path.is_file():
        return {}
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    if isinstance(raw, dict) and isinstance(raw.get("entries"), dict):
        return {str(k): v for k, v in raw["entries"].items() if isinstance(v, dict)}
    if isinstance(raw, dict):
        return {str(k): v for k, v in raw.items() if isinstance(v, dict) and "status" in v}
    return {}


def save_review_log(path: Path, entries: dict[str, dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    ordered = {k: entries[k] for k in sorted(entries.keys())}
    path.write_text(
        json.dumps({"entries": ordered}, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def _candidate_key(kind: str, slug: str, route_key: str) -> str:
    return f"{kind}:{slug}:{route_key}"


def build_candidates(
    result: AuditResult,
    *,
    kind: Literal["sources", "thinkers", "all"] = "all",
    only_missing: bool = False,
    only_invalid: bool = False,
    book_id: str | None = None,
    slugs: set[str] | None = None,
    unreviewed_only: bool = False,
    review_log: dict[str, dict[str, Any]] | None = None,
    batch_size: int = 10,
) -> list[Candidate]:
    review_log = review_log or {}
    out: list[Candidate] = []

    if kind in {"sources", "all"}:
        for src in result.sources:
            if slugs is not None and src.slug not in slugs:
                continue
            if only_invalid and src.status != "invalid_passage_link":
                continue
            if only_missing and src.reader_passage_path:
                continue
            if src.evidence_level not in {"B", "C"} and src.status != "invalid_passage_link":
                if not (src.evidence_level == "A" and src.recommended_action != "none"):
                    continue
            hit = src.footnote_hits[0] if src.footnote_hits else None
            prose = src.prose_hits[0] if src.prose_hits else None
            if hit:
                if book_id and hit.edition_slug != book_id:
                    continue
                route = hit.route_key
                cand_path = src.candidate_path or candidate_path_from_footnote(hit)
                key = _candidate_key("source", src.slug, route)
                if unreviewed_only and review_log.get(key, {}).get("status") in {
                    "approved",
                    "rejected",
                    "applied",
                    "skipped",
                }:
                    continue
                out.append(
                    Candidate(
                        entity_kind="source",
                        slug=src.slug,
                        yaml_path=src.yaml_path,
                        book_id=hit.edition_slug,
                        chapter_title=hit.chapter_title,
                        route_key=route,
                        manuscript_path=f"{hit.book_dir}/{hit.source_path}",
                        line_start=hit.line_start,
                        line_end=hit.line_end,
                        excerpt=hit.excerpt,
                        candidate_reader_passage_path=cand_path,
                        evidence_level=src.evidence_level,
                        explanation=(
                            f"Footnote [^{hit.footnote_id}] matches this source "
                            f"(score {hit.score}, {hit.method})."
                        ),
                        anchor_exists=True,
                        recommended_action=src.recommended_action,
                        needs_editorial_review=src.evidence_level != "B",
                    )
                )
            elif prose:
                if book_id and prose.edition_slug != book_id:
                    continue
                key = _candidate_key("source", src.slug, prose.route_key)
                if unreviewed_only and review_log.get(key, {}).get("status") in {
                    "approved",
                    "rejected",
                    "applied",
                    "skipped",
                }:
                    continue
                out.append(
                    Candidate(
                        entity_kind="source",
                        slug=src.slug,
                        yaml_path=src.yaml_path,
                        book_id=prose.edition_slug,
                        chapter_title=prose.chapter_title,
                        route_key=prose.route_key,
                        manuscript_path=f"{prose.book_dir}/{prose.source_path}",
                        line_start=prose.line_start,
                        line_end=prose.line_end,
                        excerpt=prose.excerpt,
                        candidate_reader_passage_path=prose.route_key,
                        evidence_level="C",
                        explanation=(
                            f"Title phrase {prose.phrase!r} appears in chapter prose; "
                            "needs editorial judgment before citing or deep-linking."
                        ),
                        anchor_exists=None,
                        recommended_action=src.recommended_action,
                        needs_editorial_review=True,
                    )
                )

    if kind in {"thinkers", "all"}:
        for thinker in result.thinkers:
            if slugs is not None and thinker.slug not in slugs:
                continue
            if only_missing and thinker.work_passage_links:
                continue
            if not thinker.chapters_citing_works and not thinker.work_passage_links:
                continue
            # Prefer proposing source enrichment first when works are cited but unlinked.
            if thinker.work_passage_links and not only_missing:
                for link in thinker.work_passage_links:
                    path = str(link["readerPassagePath"])
                    route = path.split("#", 1)[0]
                    if book_id and f"/explore/books/{book_id}/" not in route:
                        continue
                    key = _candidate_key("thinker", thinker.slug, route)
                    if unreviewed_only and review_log.get(key, {}).get("status") in {
                        "approved",
                        "rejected",
                        "applied",
                        "skipped",
                    }:
                        continue
                    out.append(
                        Candidate(
                            entity_kind="thinker",
                            slug=thinker.slug,
                            yaml_path=thinker.yaml_path,
                            book_id=route.split("/")[3] if route.count("/") >= 3 else "",
                            chapter_title="",
                            route_key=route,
                            manuscript_path="",
                            line_start=0,
                            line_end=0,
                            excerpt=str(link.get("whyThisMatters") or ""),
                            candidate_reader_passage_path=path,
                            evidence_level="A",
                            explanation=(
                                "Derive thinker page destination from verified source "
                                f"`{link['sourceSlug']}` passage link."
                            ),
                            anchor_exists=True,
                            recommended_action="surface_derived_passages_on_thinker_page",
                            needs_editorial_review=False,
                            related_work_slug=str(link["sourceSlug"]),
                        )
                    )
            elif thinker.chapters_citing_works:
                cite = thinker.chapters_citing_works[0]
                if book_id and f"/explore/books/{book_id}/" not in cite["routeKey"]:
                    continue
                key = _candidate_key("thinker", thinker.slug, cite["routeKey"])
                if unreviewed_only and review_log.get(key, {}).get("status") in {
                    "approved",
                    "rejected",
                    "applied",
                    "skipped",
                }:
                    continue
                out.append(
                    Candidate(
                        entity_kind="thinker",
                        slug=thinker.slug,
                        yaml_path=thinker.yaml_path,
                        book_id=cite["routeKey"].split("/")[3],
                        chapter_title=str(cite.get("chapterTitle") or ""),
                        route_key=cite["routeKey"],
                        manuscript_path="",
                        line_start=0,
                        line_end=0,
                        excerpt="",
                        candidate_reader_passage_path=(
                            f"{cite['routeKey']}#user-content-fnref-{cite['footnoteId']}"
                        ),
                        evidence_level="B",
                        explanation=(
                            f"Work `{cite['sourceSlug']}` is cited; enrich that source's "
                            "readerPassagePath so the thinker page can derive it."
                        ),
                        anchor_exists=True,
                        recommended_action="enrich_source_passage_links_first",
                        needs_editorial_review=True,
                        related_work_slug=str(cite["sourceSlug"]),
                    )
                )

    def sort_key(c: Candidate) -> tuple:
        return (
            {"B": 0, "A": 1, "C": 2, "D": 3, "E": 4}[c.evidence_level],
            0 if c.entity_kind == "source" else 1,
            c.slug,
            c.route_key,
        )

    out.sort(key=sort_key)
    if batch_size > 0:
        out = out[:batch_size]
    return out


def format_candidates_markdown(candidates: list[Candidate]) -> str:
    lines = [
        "# Reader passage link candidates",
        "",
        "Review queue for editorial enrichment. Mechanical matches are not",
        "philosophical relevance — items flagged `needsEditorialReview` require Cursor review.",
        "",
    ]
    if not candidates:
        lines.append("_No candidates in this batch._")
        lines.append("")
        return "\n".join(lines)

    for i, c in enumerate(candidates, 1):
        lines.extend(
            [
                f"## {i}. `{c.entity_kind}` / `{c.slug}` (level {c.evidence_level})",
                "",
                f"- YAML: `{c.yaml_path}`",
                f"- Book: `{c.book_id}` — {c.chapter_title or '(see route)'}",
                f"- Manuscript: `{c.manuscript_path or '—'}`"
                + (f" lines {c.line_start}–{c.line_end}" if c.line_start else ""),
                f"- Candidate path: `{c.candidate_reader_passage_path or '—'}`",
                f"- Anchor exists: `{c.anchor_exists}`",
                f"- Recommended action: `{c.recommended_action}`",
                f"- Needs editorial review: `{c.needs_editorial_review}`",
                f"- Related work: `{c.related_work_slug or '—'}`",
                f"- Why: {c.explanation}",
                "",
                "Excerpt:",
                "",
                f"> {c.excerpt or '_n/a_'}",
                "",
            ]
        )
    return "\n".join(lines)


def write_candidates(
    candidates: list[Candidate],
    *,
    md_out: Path,
    json_out: Path,
    review_log_path: Path | None = None,
    update_review_log: bool = False,
) -> None:
    md_out.parent.mkdir(parents=True, exist_ok=True)
    json_out.parent.mkdir(parents=True, exist_ok=True)
    md_out.write_text(format_candidates_markdown(candidates), encoding="utf-8")
    payload = {
        "count": len(candidates),
        "candidates": [_json_ready(c) for c in candidates],
    }
    json_out.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    if update_review_log and review_log_path is not None:
        log = load_review_log(review_log_path)
        for c in candidates:
            key = _candidate_key(c.entity_kind, c.slug, c.route_key)
            if key not in log:
                log[key] = {
                    "status": "proposed",
                    "entityKind": c.entity_kind,
                    "slug": c.slug,
                    "routeKey": c.route_key,
                    "evidenceLevel": c.evidence_level,
                    "candidatePath": c.candidate_reader_passage_path,
                }
        save_review_log(review_log_path, log)
