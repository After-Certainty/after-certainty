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
)
from audit_citations import FOOTNOTE_DEF, REF_USE  # noqa: E402

# Review-log statuses. ``proposed`` counts as already queued: ``--unreviewed-only``
# skips it so later batches advance. Transition: (absent) → proposed →
# approved|rejected|skipped|applied. ``deferred`` is *not* terminal — shared or
# ambiguous candidates parked for a later disambiguation batch stay eligible.
# Re-queue by deleting the entry or clearing status.
REVIEW_LOG_TERMINAL = frozenset({"proposed", "approved", "rejected", "applied", "skipped"})
REVIEW_LOG_NONTERMINAL = frozenset({"deferred"})
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
    ref_present: bool = True
    shared_with: list[str] = field(default_factory=list)
    ambiguous: bool = False
    needs_editorial_review: bool = False


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
    fragment_check_skipped: bool = False
    issues: list[str] = field(default_factory=list)

    @property
    def is_structurally_valid(self) -> bool:
        """Chapter/edition/format ok — ignores fragment verification state."""
        structural_issues = {
            "invalid_path_format",
            "chapter_not_found",
            "chapter_not_public",
            "edition_not_in_related_books",
            "related_books_required",
        }
        if not (
            self.valid_format
            and self.chapter_found
            and self.chapter_public
            and self.related_book_ok
        ):
            return False
        return not any(i in structural_issues for i in self.issues)

    @property
    def is_fully_valid(self) -> bool:
        """Structurally valid and fragment verified (or no fragment)."""
        if not self.is_structurally_valid:
            return False
        if self.fragment_check_skipped:
            return False
        if self.fragment is not None and self.fragment_ok is not True:
            return False
        if any(i in {"fragment_missing", "fragment_unvalidated"} for i in self.issues):
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
    fragment_tied_hit: bool = False


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
    # Review-only heuristics; never evidence of citation validity by themselves.
    disambiguation_hints: list[dict[str, str]] = field(default_factory=list)


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


def creator_author_tokens(src: dict[str, Any]) -> set[str]:
    """Author tokens from creatorNames / display-name author only (not title/summary)."""
    parts: list[str] = []
    creators = src.get("creatorNames") or []
    if isinstance(creators, list):
        parts.extend(str(c) for c in creators if str(c).strip())
    author, _title = split_display_name(str(src.get("name") or ""))
    if author:
        parts.append(author)
    tokens: set[str] = set()
    for part in parts:
        for tok in normalize_match_text(part).split():
            # Drop initials / very short tokens that create false positives.
            if len(tok) > 2 and tok not in {"and", "the", "von", "van", "de", "del", "der"}:
                tokens.add(tok)
    return tokens


def score_footnote_vs_source(def_text: str, src: dict[str, Any]) -> tuple[int, str]:
    """Score a footnote definition body against a semantic source.

    The definition text is the evidence side; source metadata is the candidate.
    Never invert this (that would make every source match itself).
    Author evidence uses creator names only — not title/citation/summary blobs.
    """
    def_norm = normalize_match_text(def_text)
    if not def_norm:
        return 0, "none"

    title = str(src.get("title") or "").strip()
    if not title:
        title = split_display_name(str(src.get("name") or ""))[1]
    title = strip_markdown_italics(title).strip()
    title_norm = normalize_match_text(title)
    author_tokens = creator_author_tokens(src)
    has_author = bool(author_tokens) and any(t in def_norm for t in author_tokens)

    # Strong: distinctive title substring + creator author token in the footnote.
    if title_norm and len(title_norm) >= 8 and title_norm in def_norm:
        if has_author:
            return 90, "footnote_title_author"
        # Title alone in a multi-work note is weaker — still evidence, needs review.
        return 72, "footnote_title_only"

    # Medium: first significant title tokens all present + author.
    title_tokens = [t for t in title_norm.split() if len(t) > 3][:5]
    if len(title_tokens) >= 3 and all(t in def_norm for t in title_tokens[:3]):
        if has_author:
            return 80, "footnote_title_tokens_author"
        return 60, "footnote_title_tokens"

    # Fall back to biblio scorer only when the source title is evidenced in the definition.
    if title_norm and len(title_norm) >= 8 and title_norm[:12] in def_norm and has_author:
        pseudo = {
            "workTitle": title,
            "author": " ".join(sorted(author_tokens)[:4]),
            "summary": def_text,
            "slug": "",
        }
        score, method = score_expected_vs_source(pseudo, src)
        if score >= MATCH_THRESHOLD:
            return score, f"biblio_scorer:{method}"
    return 0, "none"


def _footnote_ref_spans(body_text: str, footnote_id: str) -> list[tuple[int, int]]:
    """Return (start, end) spans for [^id] invocations in body (not definitions)."""
    spans: list[tuple[int, int]] = []
    for m in REF_USE.finditer(body_text):
        if m.group(1) == footnote_id:
            spans.append((m.start(), m.end()))
    return spans


def _invocation_excerpt_and_lines(
    full_text: str, body_text: str, footnote_id: str
) -> tuple[str, int, int, bool]:
    """Excerpt + line span around the first body invocation of [^id]."""
    spans = _footnote_ref_spans(body_text, footnote_id)
    if not spans:
        return "", 0, 0, False
    start, end = spans[0]
    # Map body_text offsets back approximately via searching in full_text.
    needle = full_text.find(body_text[start:end])
    if needle < 0:
        needle = start
        end_pos = end
    else:
        end_pos = needle + (end - start)
    line_start, line_end = _line_span_for_match(full_text, needle, end_pos)
    return _excerpt_around(full_text, needle, end_pos), line_start, line_end, True


def index_chapter_engagement(
    repo: Path,
    chapters: dict[str, ChapterRef],
    sources: dict[str, dict[str, Any]],
) -> tuple[dict[str, list[FootnoteHit]], dict[str, list[ProseHit]]]:
    """Scan published chapters for footnote and prose engagement per source.

    Shared footnotes may independently evidence multiple works. Definitions
    without a body ``[^id]`` invocation are ignored (no reader fnref target).
    Excerpts and line numbers come from the invocation site, not the note body.
    """
    footnote_by_source: dict[str, list[FootnoteHit]] = defaultdict(list)
    prose_by_source: dict[str, list[ProseHit]] = defaultdict(list)

    sources_by_book: dict[str, list[str]] = defaultdict(list)
    phrases: dict[str, list[str]] = {}
    for slug, src in sources.items():
        books = related_books_of(src)
        phrases[slug] = phrases_for_source(
            str(src.get("name") or ""),
            str(src.get("summary") or ""),
            str(src.get("title") or ""),
        )
        # Sources without relatedBooks are not scanned for chapter engagement;
        # deep links require an authored book relationship.
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

        candidates = list(dict.fromkeys(sources_by_book.get(chapter.edition_slug, [])))
        if not candidates:
            continue

        body_text = _strip_footnote_defs(text)

        for fid, body, _start, _end in _footnote_defs_in_text(text):
            excerpt, line_start, line_end, ref_present = _invocation_excerpt_and_lines(
                text, body_text, fid
            )
            if not ref_present:
                # Defined but never invoked → no #user-content-fnref-{id} in reader.
                continue

            scored: list[tuple[str, int, str]] = []
            for slug in candidates:
                score, method = score_footnote_vs_source(body, sources[slug])
                if score >= MATCH_THRESHOLD:
                    scored.append((slug, score, method))
            if not scored:
                continue

            scored.sort(key=lambda t: (-t[1], t[0]))
            top_score = scored[0][1]
            # Independently evidenced matches (threshold), not winner-take-all.
            # Flag ambiguity when several near-top scores lack clear separation.
            near_top = [s for s in scored if s[1] >= top_score - 10]
            ambiguous = len(near_top) > 1 and near_top[0][1] < 90
            matched_slugs = [s[0] for s in scored]

            # A partial-title / same-author hit can accompany an unambiguous
            # work citation (e.g. Arthur's book falsely attracting Pierson,
            # or an IOC medal article attracting other Biles coverage).
            # Let the *only* fully named, high-confidence work retain its
            # own citation. Keep all weaker co-matches as candidates needing
            # review; do not silently promote them to source-specific A.
            # Two explicitly named works must remain a genuinely shared note.
            def_norm = normalize_match_text(body)
            directly_named: list[str] = []
            for hit_slug, hit_score, _ in scored:
                source = sources[hit_slug]
                title = strip_markdown_italics(
                    str(source.get("title") or split_display_name(str(source.get("name") or ""))[1])
                )
                title_norm = normalize_match_text(title)
                if (
                    hit_score >= 80
                    and len(title_norm) >= 8
                    and re.search(r"(?<!\w)" + re.escape(title_norm) + r"(?!\w)", def_norm)
                ):
                    directly_named.append(hit_slug)
            sole_named = directly_named[0] if len(directly_named) == 1 else None

            # A second cited work sometimes appears by abbreviated title but
            # with a fully identified *different* author (e.g. Hood alongside
            # Pollitt). Do not erase that real co-citation merely because
            # only one metadata title occurs verbatim in full.
            if sole_named:
                named_creators = creator_author_tokens(sources[sole_named])
                for candidate_slug, _, _ in scored:
                    if candidate_slug == sole_named:
                        continue
                    distinguishing = creator_author_tokens(sources[candidate_slug]) - named_creators
                    if distinguishing and all(
                        re.search(r"(?<!\w)" + re.escape(token) + r"(?!\w)", def_norm)
                        for token in distinguishing
                    ):
                        sole_named = None
                        break

            for slug, score, method in scored:
                # Asymmetric on purpose: the specifically named work is not
                # shared with speculative matches, but speculative matches
                # still share with the evidenced work and require review.
                others = [] if slug == sole_named else [s for s in matched_slugs if s != slug]
                shared = bool(others)
                footnote_by_source[slug].append(
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
                        excerpt=excerpt,
                        score=score,
                        method=method,
                        ref_present=True,
                        shared_with=sorted(others),
                        ambiguous=ambiguous,
                        needs_editorial_review=shared or ambiguous or score < 80,
                    )
                )

        for slug in candidates:
            if any(h.route_key == route_key for h in footnote_by_source.get(slug, [])):
                continue
            for phrase in phrases.get(slug, []):
                if len(phrase) < 8:
                    continue
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
                break

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

    Uses apps/site/scripts/validate-reader-passage-fragment.mjs with the
    workspace-pinned ``jiti`` loader (no npx / network install).
    """
    script = repo / "apps" / "site" / "scripts" / "validate-reader-passage-fragment.mjs"
    if not script.is_file():
        return False, f"missing fragment validator script: {script}"
    markdown_path = repo / book_dir / source_path
    if not markdown_path.is_file():
        return False, f"missing manuscript: {book_dir}/{source_path}"

    cmd = [
        "node",
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

    if not related_books:
        result.related_book_ok = False
        result.issues.append("related_books_required")
    elif edition not in related_books:
        result.related_book_ok = False
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
    elif fragment and not check_fragment:
        result.fragment_check_skipped = True
        result.fragment_ok = None
        result.issues.append("fragment_check_skipped")
    elif not fragment:
        result.fragment_ok = None

    return result


def hit_matches_passage_path(hit: FootnoteHit, path: str) -> bool:
    """True when the hit's chapter + fnref fragment equal the authored path."""
    expected = candidate_path_from_footnote(hit)
    return path.strip() == expected


def select_hits_for_book(hits: list[FootnoteHit], book_id: str | None) -> list[FootnoteHit]:
    if not book_id:
        return list(hits)
    return [h for h in hits if h.edition_slug == book_id]


def select_prose_for_book(hits: list[ProseHit], book_id: str | None) -> list[ProseHit]:
    if not book_id:
        return list(hits)
    return [h for h in hits if h.edition_slug == book_id]


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

    # Prefer non-shared, high-score hits for candidate suggestions.
    ranked_hits = sorted(
        footnote_hits,
        key=lambda h: (
            0 if not h.needs_editorial_review else 1,
            -h.score,
            h.edition_slug,
            h.route_key,
            h.footnote_id,
        ),
    )

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
    pv = audit.path_validation

    fragment_tied = bool(path) and any(hit_matches_passage_path(h, path) for h in footnote_hits)
    audit.fragment_tied_hit = fragment_tied

    # Structural defects always win — skipping fragment checks must not mask them.
    if path and pv and not pv.is_structurally_valid:
        audit.status = "invalid_passage_link"
        audit.notes.extend(pv.issues)
        if has_footnote:
            audit.evidence_level = "B"
            audit.candidate_path = candidate_path_from_footnote(ranked_hits[0])
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
    elif path and pv and pv.fragment_check_skipped and pv.is_structurally_valid:
        # Structural path ok but fragment not verified — never inflate to A.
        audit.status = "passage_link_unverified_fragment"
        audit.notes.append("fragment_check_skipped")
        if fragment_tied:
            audit.evidence_level = "B"
            audit.recommended_action = "verify_fragment_then_confirm"
            audit.candidate_path = path
        elif has_footnote:
            audit.evidence_level = "B"
            audit.candidate_path = candidate_path_from_footnote(ranked_hits[0])
            audit.recommended_action = "verify_fragment_and_tie_to_citation"
        elif has_prose:
            audit.evidence_level = "C"
            audit.recommended_action = "editorial_review_prose_hit"
        elif has_biblio:
            audit.evidence_level = "D"
            audit.recommended_action = "do_not_fabricate_citation"
        else:
            audit.evidence_level = "E"
            audit.recommended_action = "remove_or_fix_path"
    elif path and pv and pv.is_fully_valid and fragment_tied:
        # Level A = verified public path + mechanically tied citation fragment.
        # This is not an editorial attestation — enrichment still needs review.
        tied = next(h for h in footnote_hits if hit_matches_passage_path(h, path))
        if tied.shared_with or tied.ambiguous:
            audit.evidence_level = "B"
            audit.status = "path_valid_shared_or_ambiguous_citation"
            audit.notes.append("fragment_tied_but_shared_or_ambiguous")
            if tied.shared_with:
                audit.notes.append(f"shared_footnote_with:{','.join(tied.shared_with)}")
            audit.recommended_action = "editorial_confirm_passage_relevance"
            audit.candidate_path = path
        else:
            audit.evidence_level = "A"
            audit.status = "verified_link_tied_citation"
            audit.recommended_action = "none"
            if not audit.why_this_matters_ok:
                audit.notes.append("missing_or_weak_whyThisMatters")
                audit.recommended_action = "add_why_this_matters"
    elif path and pv and pv.is_fully_valid and not fragment_tied:
        # Working URL without verified intellectual tie to that fragment.
        audit.evidence_level = "B" if has_footnote or has_prose else "C"
        audit.status = "path_valid_needs_editorial_review"
        audit.notes.append("path_valid_but_not_tied_to_matched_citation_fragment")
        audit.recommended_action = "confirm_citation_relevance_or_retarget"
        if has_footnote:
            audit.candidate_path = candidate_path_from_footnote(ranked_hits[0])
            audit.evidence_level = "B"
        elif has_prose:
            audit.candidate_path = prose_hits[0].route_key
    elif path and pv and not pv.is_fully_valid:
        # Fragment missing / unvalidated with structure otherwise ok.
        audit.status = "invalid_passage_link"
        audit.notes.extend(pv.issues)
        if has_footnote:
            audit.evidence_level = "B"
            audit.candidate_path = candidate_path_from_footnote(ranked_hits[0])
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
        hit = ranked_hits[0]
        audit.evidence_level = "B"
        audit.status = "strong_candidate"
        audit.candidate_path = candidate_path_from_footnote(hit)
        # Newly discovered connections always need editorial review.
        audit.recommended_action = "editorial_review_then_add_path"
        if hit.shared_with or hit.ambiguous:
            audit.notes.append("shared_or_ambiguous_footnote")
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
        if (
            sa.evidence_level == "A"
            and sa.reader_passage_path
            and sa.path_validation
            and sa.path_validation.is_fully_valid
            and sa.fragment_tied_hit
        ):
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
    # Level A = verified public path + mechanically tied citation (not editorial approval).
    tied_a = sum(1 for s in sources if s.evidence_level == "A")
    fully_valid_path = sum(
        1 for s in sources if s.path_validation is not None and s.path_validation.is_fully_valid
    )
    unverified_fragment = sum(1 for s in sources if s.status == "passage_link_unverified_fragment")
    path_needs_review = sum(
        1
        for s in sources
        if s.status
        in {
            "path_valid_needs_editorial_review",
            "path_valid_shared_or_ambiguous_citation",
        }
    )
    invalid_path = sum(1 for s in sources if s.status == "invalid_passage_link")
    missing_path_with_footnote = sum(
        1 for s in sources if not s.reader_passage_path and s.footnote_hits
    )
    mechanical_b = sum(
        1 for s in sources if s.evidence_level == "B" and s.status == "strong_candidate"
    )
    biblio_only = source_levels["D"]
    thinkers_with_derived = sum(
        1 for t in thinkers if any(w.get("evidenceLevel") == "A" for w in t.work_passage_links)
    )
    n_sources = max(1, len(sources))
    n_thinkers = max(1, len(thinkers))
    return {
        "sources": {
            "total": len(sources),
            "withReaderPassagePath": with_path,
            "validPassageLinks": fully_valid_path,
            "verifiedLinkTiedCitation": tied_a,
            "mechanicalFootnoteCandidates": mechanical_b,
            "pathNeedsEditorialReview": path_needs_review,
            "unverifiedFragmentLinks": unverified_fragment,
            "invalidPassageLinks": invalid_path,
            "missingPathWithFootnote": missing_path_with_footnote,
            "bibliographyOnly": biblio_only,
            "byEvidenceLevel": source_levels,
            "tiedCitationCoveragePct": round(100.0 * tied_a / n_sources, 2),
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
    """Full corpus dump (large). Prefer ``audit_to_summary_json`` for tracked reports."""
    return {
        "totals": result.totals,
        "sources": [_json_ready(s) for s in result.sources],
        "thinkers": [_json_ready(t) for t in result.thinkers],
    }


def audit_to_summary_json(result: AuditResult, *, opportunity_limit: int = 50) -> dict[str, Any]:
    """Compact machine-readable report suitable for committing to git."""
    opportunities: list[dict[str, Any]] = []
    for src in result.sources:
        if src.evidence_level not in {"B", "C"} and src.status != "invalid_passage_link":
            if src.status not in {
                "path_valid_needs_editorial_review",
                "path_valid_shared_or_ambiguous_citation",
                "passage_link_unverified_fragment",
            }:
                continue
        opportunities.append(
            {
                "slug": src.slug,
                "evidenceLevel": src.evidence_level,
                "status": src.status,
                "recommendedAction": src.recommended_action,
                "candidatePath": src.candidate_path,
                "readerPassagePath": src.reader_passage_path,
                "footnoteHitCount": len(src.footnote_hits),
                "notes": src.notes,
            }
        )
        if len(opportunities) >= opportunity_limit:
            break
    tied_a = [
        {
            "slug": s.slug,
            "readerPassagePath": s.reader_passage_path,
            "status": s.status,
        }
        for s in result.sources
        if s.evidence_level == "A"
    ]
    derivable = [
        {
            "slug": t.slug,
            "workPassageLinks": t.work_passage_links,
        }
        for t in result.thinkers
        if t.work_passage_links
    ]
    return {
        "totals": result.totals,
        "tiedCitationExamples": tied_a,
        "rankedOpportunities": opportunities,
        "thinkersWithDerivablePassages": derivable[:30],
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
        f"- Structurally valid + fragment-checked paths: **{s.get('validPassageLinks', 0)}**",
        f"- Verified link + mechanically tied citation (level A): "
        f"**{s.get('verifiedLinkTiedCitation', 0)}**",
        f"- Mechanical footnote candidates (level B / strong_candidate): "
        f"**{s.get('mechanicalFootnoteCandidates', 0)}**",
        f"- Path present but needs editorial review: **{s.get('pathNeedsEditorialReview', 0)}**",
        f"- Fragment check skipped (unverified): **{s.get('unverifiedFragmentLinks', 0)}**",
        f"- Invalid passage links: **{s.get('invalidPassageLinks', 0)}**",
        f"- Missing path but footnote-cited: **{s.get('missingPathWithFootnote', 0)}**",
        f"- Bibliography only (level D): **{s.get('bibliographyOnly', 0)}**",
        f"- Tied-citation (level A) coverage: **{s.get('tiedCitationCoveragePct', 0)}%**",
        f"- `whyThisMatters` present/substantive: **{s.get('whyThisMattersOk', 0)}**",
        "",
        "Level A means a public path whose fragment is the matched citation "
        "invocation — a *mechanical* condition, not editorial approval of "
        "philosophical relevance. All newly proposed connections still need "
        "editorial review before YAML enrichment.",
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

    # Concrete examples: level A (mechanically tied)
    verified = [src for src in result.sources if src.evidence_level == "A"]
    lines.extend(["", "## Verified link + mechanically tied citation examples (level A)", ""])
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
    full_json_out: Path | None = None,
) -> None:
    """
    Write markdown + compact summary JSON by default.

    Pass ``full_json_out`` (e.g. a gitignored path) for the complete corpus dump.
    """
    md_out.parent.mkdir(parents=True, exist_ok=True)
    json_out.parent.mkdir(parents=True, exist_ok=True)
    md_out.write_text(format_audit_markdown(result), encoding="utf-8")
    json_out.write_text(
        json.dumps(audit_to_summary_json(result), indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    if full_json_out is not None:
        full_json_out.parent.mkdir(parents=True, exist_ok=True)
        full_json_out.write_text(
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


def _candidate_key(
    kind: str,
    slug: str,
    route_key: str,
    *,
    fragment: str | None = None,
    footnote_id: str | None = None,
) -> str:
    """Stable identity when multiple passages compete for one entity."""
    frag = fragment or (f"user-content-fnref-{footnote_id}" if footnote_id else "")
    if frag:
        return f"{kind}:{slug}:{route_key}#{frag}"
    return f"{kind}:{slug}:{route_key}"


def _is_queued(review_log: dict[str, dict[str, Any]], key: str) -> bool:
    status = str(review_log.get(key, {}).get("status") or "")
    return status in REVIEW_LOG_TERMINAL


def _resolve_anchor_exists(
    *,
    repo: Path | None,
    book_dir: str,
    source_path: str,
    fragment: str,
    ref_present: bool,
    check_anchors: bool,
    fragment_cache: dict[tuple[str, str, str], tuple[bool, str | None]],
) -> bool | None:
    """
    ``True`` / ``False`` after rendered-HTML check; ``None`` when unverified.

    Markdown ``ref_present`` alone is never enough to claim the reader anchor exists.
    """
    if not ref_present:
        return False
    if not check_anchors or repo is None:
        return None
    cache_key = (book_dir, source_path, fragment)
    if cache_key in fragment_cache:
        ok, _err = fragment_cache[cache_key]
        return ok
    ok, err = validate_fragment_in_rendered_html(
        repo,
        book_dir=book_dir,
        source_path=source_path,
        fragment=fragment,
    )
    fragment_cache[cache_key] = (ok, err)
    return ok


# Phase 9: bounded, explanation-first heuristics for multi-work citations.
# These hints inform editorial triage only; they do not raise evidence levels,
# accept links, modify YAML/manuscripts, or settle attribution questions.
_ANNIVERSARY_CUE = re.compile(
    r"\b(?:anniversar(?:y|ies)|commemorat\w*|retrospectiv\w*|"
    r"turns?\s+\d+|honou?r(?:ed|ing|s)?|legacy)\b",
    re.I,
)
_EVENT_WORDS = frozenset(
    {
        "announces",
        "announced",
        "retirement",
        "retired",
        "files",
        "filed",
        "grievance",
        "protest",
        "protests",
        "settles",
        "settled",
        "collusion",
        "suspension",
        "death",
        "dies",
        "died",
        "crackdown",
        "election",
    }
)
_TITLE_STOPWORDS = frozenset(
    {
        "the",
        "a",
        "an",
        "and",
        "or",
        "for",
        "of",
        "on",
        "in",
        "at",
        "from",
        "to",
        "with",
        "by",
        "is",
        "was",
        "were",
        "his",
        "her",
        "their",
        "it",
        "as",
        "after",
        "against",
        "during",
        "about",
        "new",
        "says",
    }
)


def _work_tokens(source: SourceAudit) -> set[str]:
    """Crude title keywords from catalog metadata, not verified source content."""
    title = source.name.rsplit(" — ", 1)[-1]
    return {
        token
        for token in normalize_match_text(title).split()
        if len(token) > 2 and token not in _TITLE_STOPWORDS
    }


def disambiguation_hints_for_hit(
    source: SourceAudit,
    hit: FootnoteHit,
    sources_by_slug: dict[str, SourceAudit],
) -> list[dict[str, str]]:
    """Suggest review questions from evidence already present in the audit.

    Confidence describes confidence in a *cue*, NOT confidence that a
    source supports the manuscript's interpretation or deserves a link.
    Hints are deterministic, ordered, and intentionally non-authoritative.
    """
    hints: list[dict[str, str]] = []
    shared = sorted(set(hit.shared_with))
    if shared:
        hints.append(
            {
                "kind": "multi_work_footnote",
                "confidence": "high",
                "reason": (
                    f"[^{hit.footnote_id}] matches multiple catalog works. "
                    "Inspect the invocation and preserve shared corroboration "
                    "unless distinct claims justify separating citations."
                ),
                "evidence": ", ".join(shared),
            }
        )

        # Look for an existing less ambiguous footnote elsewhere in this book,
        # including one for the current work. Never fabricate a new anchor.
        for slug in [source.slug, *shared]:
            other_source = sources_by_slug.get(slug)
            if other_source is None:
                continue
            alternatives = sorted(
                (
                    candidate
                    for candidate in other_source.footnote_hits
                    if candidate.edition_slug == hit.edition_slug
                    and not candidate.shared_with
                    and not candidate.ambiguous
                    and (
                        candidate.route_key != hit.route_key
                        or candidate.footnote_id != hit.footnote_id
                    )
                ),
                key=lambda candidate: (candidate.route_key, candidate.footnote_id),
            )
            if alternatives:
                other = alternatives[0]
                hints.append(
                    {
                        "kind": "existing_sole_work_citation",
                        "confidence": "high",
                        "reason": (
                            f"Work '{slug}' has a separate, mechanically "
                            "matched sole-work citation in this edition. "
                            "Compare its claim before editing the shared footnote."
                        ),
                        "evidence": candidate_path_from_footnote(other),
                    }
                )

        own_title = source.name.rsplit(" — ", 1)[-1]
        own_anniversary = bool(_ANNIVERSARY_CUE.search(own_title))
        own_tokens = _work_tokens(source)
        for slug in shared:
            other_source = sources_by_slug.get(slug)
            if other_source is None:
                continue
            other_title = other_source.name.rsplit(" — ", 1)[-1]
            other_tokens = _work_tokens(other_source)
            if own_anniversary != bool(_ANNIVERSARY_CUE.search(other_title)):
                hints.append(
                    {
                        "kind": "event_versus_retrospective",
                        "confidence": "medium",
                        "reason": (
                            "Work titles suggest event reporting alongside "
                            "later retrospective or commemorative framing. "
                            "Check whether the prose contains separate "
                            "event and later-reception claims."
                        ),
                        "evidence": f"{source.slug}; {slug}",
                    }
                )
                continue
            shared_words = sorted(own_tokens & other_tokens)
            union = own_tokens | other_tokens
            similarity = len(shared_words) / len(union) if union else 0
            if (
                len(shared_words) >= 3
                and similarity >= 0.3
                and bool(set(shared_words) & _EVENT_WORDS)
            ):
                hints.append(
                    {
                        "kind": "possible_same_event_corrob",
                        "confidence": "low",
                        "reason": (
                            "Work titles overlap on event-related terms. "
                            "They may corroborate one event rather than "
                            "support different claims; check dates and bodies."
                        ),
                        "evidence": ", ".join(shared_words),
                    }
                )

    if (
        hit.ambiguous
        or hit.score < 80
        or hit.method
        in {
            "footnote_title_only",
            "footnote_title_tokens",
        }
    ):
        hints.append(
            {
                "kind": "verify_work_identity",
                "confidence": "medium" if hit.ambiguous else "low",
                "reason": (
                    "The match lacks strong independent title-and-creator "
                    "attribution or is marked ambiguous. Confirm title, "
                    "author, year and whether the cited work actually covers "
                    "the invocation claim before approving a path."
                ),
                "evidence": f"score={hit.score}; method={hit.method}",
            }
        )

    # Keep duplicate cues bounded without discarding genuinely different slugs.
    return hints


def build_candidates(
    result: AuditResult,
    *,
    kind: Literal["sources", "thinkers", "all"] = "all",
    only_missing: bool = False,
    only_invalid: bool = False,
    ambiguous_only: bool = False,
    book_id: str | None = None,
    slugs: set[str] | None = None,
    unreviewed_only: bool = False,
    review_log: dict[str, dict[str, Any]] | None = None,
    batch_size: int = 10,
    max_per_source: int = 3,
    repo: Path | None = None,
    check_anchors: bool = True,
    fragment_cache: dict[tuple[str, str, str], tuple[bool, str | None]] | None = None,
) -> list[Candidate]:
    """
    Build a bounded review queue.

    Emits up to ``max_per_source`` footnote alternatives per source (stable
    per-fragment keys) so rejecting the first passage still surfaces others
    under ``--unreviewed-only``.

    ``anchor_exists`` is ``True``/``False`` only after the reader HTML check;
    ``None`` means unverified (check skipped or unavailable).
    """
    review_log = review_log or {}
    fragment_cache = fragment_cache if fragment_cache is not None else {}
    out: list[Candidate] = []
    sources_by_slug = {source.slug: source for source in result.sources}

    if kind in {"sources", "all"}:
        for src in result.sources:
            if slugs is not None and src.slug not in slugs:
                continue
            if only_invalid and src.status != "invalid_passage_link":
                continue
            if only_missing and src.reader_passage_path:
                continue
            if src.evidence_level not in {"B", "C"} and src.status != "invalid_passage_link":
                if src.status not in {
                    "path_valid_needs_editorial_review",
                    "path_valid_shared_or_ambiguous_citation",
                    "passage_link_unverified_fragment",
                }:
                    continue

            book_hits = select_hits_for_book(src.footnote_hits, book_id)
            book_prose = select_prose_for_book(src.prose_hits, book_id)
            book_hits = sorted(
                book_hits,
                key=lambda h: (
                    0 if not (h.shared_with or h.ambiguous) else 1,
                    -h.score,
                    h.route_key,
                    h.footnote_id,
                ),
            )

            emitted = 0
            for hit in book_hits:
                if emitted >= max_per_source:
                    break
                if ambiguous_only and not (hit.shared_with or hit.ambiguous):
                    continue
                route = hit.route_key
                cand_path = candidate_path_from_footnote(hit)
                fragment = f"user-content-fnref-{hit.footnote_id}"
                key = _candidate_key(
                    "source",
                    src.slug,
                    route,
                    footnote_id=hit.footnote_id,
                )
                if unreviewed_only and _is_queued(review_log, key):
                    continue
                shared_note = ""
                if hit.shared_with:
                    shared_note = f" Shared footnote also matches: {', '.join(hit.shared_with)}."
                alt_note = f" Alternative #{emitted + 1} for this source." if emitted else ""
                anchor = _resolve_anchor_exists(
                    repo=repo,
                    book_dir=hit.book_dir,
                    source_path=hit.source_path,
                    fragment=fragment,
                    ref_present=hit.ref_present,
                    check_anchors=check_anchors,
                    fragment_cache=fragment_cache,
                )
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
                        evidence_level=src.evidence_level
                        if src.evidence_level in {"B", "C"}
                        else "B",
                        explanation=(
                            f"Body citation [^{hit.footnote_id}] matches this source "
                            f"(score {hit.score}, {hit.method}). "
                            f"Excerpt is the surrounding argument at the invocation."
                            f"{shared_note}{alt_note}"
                        ),
                        anchor_exists=anchor,
                        recommended_action=src.recommended_action
                        or "editorial_review_then_add_path",
                        # Newly proposed semantic connections always need editorial review.
                        needs_editorial_review=True,
                        disambiguation_hints=disambiguation_hints_for_hit(
                            src, hit, sources_by_slug
                        ),
                    )
                )
                emitted += 1

            if not ambiguous_only and emitted == 0 and book_prose:
                prose = book_prose[0]
                key = _candidate_key("source", src.slug, prose.route_key)
                if not (unreviewed_only and _is_queued(review_log, key)):
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

    if not ambiguous_only and kind in {"thinkers", "all"}:
        for thinker in result.thinkers:
            if slugs is not None and thinker.slug not in slugs:
                continue
            if only_missing and thinker.work_passage_links:
                continue
            if not thinker.chapters_citing_works and not thinker.work_passage_links:
                continue
            if thinker.work_passage_links and not only_missing:
                for link in thinker.work_passage_links:
                    path = str(link["readerPassagePath"])
                    route = path.split("#", 1)[0]
                    frag = path.split("#", 1)[1] if "#" in path else None
                    if book_id and f"/explore/books/{book_id}/" not in route:
                        continue
                    key = _candidate_key("thinker", thinker.slug, route, fragment=frag)
                    if unreviewed_only and _is_queued(review_log, key):
                        continue
                    # Derive from already-tied source A links; still editorial for UX.
                    approved = (
                        review_log.get(key, {}).get("status") == "approved"
                        or review_log.get(key, {}).get("status") == "applied"
                    )
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
                            # Do not claim HTML confirmation without a renderer check.
                            anchor_exists=None,
                            recommended_action="surface_derived_passages_on_thinker_page",
                            needs_editorial_review=not approved,
                            related_work_slug=str(link["sourceSlug"]),
                        )
                    )
            elif thinker.chapters_citing_works:
                cites = [
                    c
                    for c in thinker.chapters_citing_works
                    if not book_id or f"/explore/books/{book_id}/" in c["routeKey"]
                ]
                for cite in cites[:max_per_source]:
                    key = _candidate_key(
                        "thinker",
                        thinker.slug,
                        cite["routeKey"],
                        footnote_id=str(cite["footnoteId"]),
                    )
                    if unreviewed_only and _is_queued(review_log, key):
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
                            anchor_exists=None,
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
            c.candidate_reader_passage_path or "",
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
        "philosophical relevance — newly proposed connections always need editorial",
        "review. `anchor_exists` is true/false only after the reader HTML check;",
        "`null` means unverified.",
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
                "- Disambiguation hints: "
                + (str(len(c.disambiguation_hints)) if c.disambiguation_hints else "none"),
                "",
                *[
                    (
                        f"  - [{hint['confidence']}] {hint['kind']}: "
                        f"{hint['reason']} (cue: {hint['evidence']})"
                    )
                    for hint in c.disambiguation_hints
                ],
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
            frag = None
            footnote_id = None
            if c.candidate_reader_passage_path and "#" in c.candidate_reader_passage_path:
                frag = c.candidate_reader_passage_path.split("#", 1)[1]
                if frag.startswith("user-content-fnref-"):
                    footnote_id = frag.removeprefix("user-content-fnref-")
            key = _candidate_key(
                c.entity_kind,
                c.slug,
                c.route_key,
                fragment=frag,
                footnote_id=footnote_id,
            )
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
