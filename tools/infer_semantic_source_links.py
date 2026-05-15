#!/usr/bin/env python3
"""
Infer semantic/sources concepts and patterns, and semantic/patterns relatedSources,
by scanning manuscript markdown.

Heuristic: in each text chunk (paragraph or bibliography-style list line), if a
source work probe (title from ``name`` after em dash, plus titles quoted in
``summary``) co-occurs with a glossary term title or pattern title, count a hit
toward that source's ``concepts`` / ``patterns``.

Symmetrically, when a **pattern title** and a **source probe** co-occur in the
same chunk (with the same book and ``relatedBooks`` scope rules), count a hit
toward that pattern's ``relatedSources``.

Entities are only considered when their ``relatedBooks`` is empty (global) or
intersects the source's ``relatedBooks``, so book-scoped patterns stay on the
right volume.

Excludes units matching ``--exclude-substr`` (default skips bibliography and
glossary markdown so the reference list does not create bogus links).
"""

from __future__ import annotations

import argparse
import re
import sys
from collections import defaultdict
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

_TOOLS_DIR = Path(__file__).resolve().parent
if str(_TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(_TOOLS_DIR))

import generate_semantic_manifest as gsm  # noqa: E402
from book_specs import discover_book_spec_paths, load_book_spec  # noqa: E402
from manifest_markdown import resolve_markdown_units  # noqa: E402

SEMANTIC_SOURCES = Path("semantic/sources")
SEMANTIC_PATTERNS = Path("semantic/patterns")


def _pattern_in_book(pattern_books: set[str], book_id: str) -> bool:
    return not pattern_books or book_id in pattern_books


def _norm_book_slugs(items: object) -> set[str]:
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


def _phrases_for_source(name: str, summary: str) -> list[str]:
    raw: list[str] = []
    if " — " in name:
        t = name.split(" — ", 1)[1].strip()
        if t:
            raw.append(t)
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


def _source_hits_chunk(phrases: list[str], chunk: str) -> bool:
    if not phrases or not chunk.strip():
        return False
    return any(gsm._count_mentions(chunk, p) > 0 for p in phrases)


def _paragraph_chunks(text: str, *, min_chars: int) -> list[str]:
    text = text.replace("\r\n", "\n")
    pieces = re.split(r"\n\n+|\n(?=-\s)", text)
    out: list[str] = []
    for p in pieces:
        p = p.strip()
        if len(p) >= min_chars:
            out.append(p)
    return out


def _book_dirs_by_id(repo: Path) -> dict[str, Path]:
    out: dict[str, Path] = {}
    for spec_path in discover_book_spec_paths(repo):
        spec = load_book_spec(spec_path)
        book = spec.get("book")
        if not isinstance(book, dict):
            continue
        bid = str(book.get("id", "")).strip()
        if bid:
            out[bid] = spec_path.parent.resolve()
    return out


def _load_scan_targets(
    repo: Path,
) -> tuple[list[tuple[str, str, set[str]]], list[tuple[str, str, set[str]]]]:
    """Return ([(concept_slug, title, related_book_slugs)], same for patterns)."""
    by_gloss, _, _ = gsm.build_glossary_entries(repo, warn_term_kind=False)
    concepts: list[tuple[str, str, set[str]]] = []
    for slug in sorted(by_gloss.keys()):
        row = by_gloss[slug]
        title = str(row.get("title", "")).strip()
        if not title:
            continue
        concepts.append((slug, title, _norm_book_slugs(row.get("relatedBooks"))))

    raw_patterns = gsm._load_dir_yml(repo / gsm.SEMANTIC_ROOT / "patterns")
    patterns: list[tuple[str, str, set[str]]] = []
    for slug in sorted(raw_patterns.keys()):
        data = raw_patterns[slug]
        title = str(data.get("title", slug)).strip()
        if not title:
            continue
        patterns.append((slug, title, _norm_book_slugs(data.get("relatedBooks"))))
    return concepts, patterns


def _entity_in_scope(entity_books: set[str], source_books: set[str]) -> bool:
    return not entity_books or bool(entity_books & source_books)


def _title_covered_by_phrases(title: str, phrases: list[str]) -> bool:
    """True when a short concept/pattern title is literally part of a work title phrase."""
    t = title.strip()
    if not t or len(t.split()) > 2:
        return False
    low = t.casefold()
    for ph in phrases:
        if low in ph.casefold():
            return True
    return False


def infer_links(
    repo: Path,
    *,
    min_chunk_chars: int,
    min_hits_concepts: int,
    min_hits_patterns: int,
    min_hits_pattern_sources: int,
    exclude_substrings: tuple[str, ...],
    max_concepts: int,
    max_patterns: int,
    max_sources_per_pattern: int,
) -> tuple[dict[str, tuple[list[str], list[str]]], dict[str, list[str]]]:
    """Return (source_slug -> (concepts, patterns), pattern_slug -> [source slugs])."""
    book_dirs = _book_dirs_by_id(repo)
    concepts, patterns = _load_scan_targets(repo)

    source_paths = sorted((repo / SEMANTIC_SOURCES).glob("*.yml"))
    sources_meta: list[tuple[str, list[str], set[str]]] = []
    for path in source_paths:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            continue
        slug = str(data.get("slug", path.stem)).strip()
        if not slug:
            continue
        name = str(data.get("name", "")).strip()
        summary = str(data.get("summary", "")).strip()
        phrases = _phrases_for_source(name, summary)
        if not phrases:
            continue
        rel = sorted(_norm_book_slugs(data.get("relatedBooks")))
        sources_meta.append((slug, phrases, set(rel)))

    concept_hits: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    pattern_hits: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    pattern_to_source_hits: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))

    for book_id, book_dir in sorted(book_dirs.items()):
        for unit in resolve_markdown_units(book_dir):
            rel_posix = ""
            try:
                rel_posix = unit.resolve().relative_to(repo).as_posix()
            except ValueError:
                pass
            if rel_posix and any(excl in rel_posix for excl in exclude_substrings):
                continue
            try:
                text = unit.read_text(encoding="utf-8")
            except OSError:
                continue
            for chunk in _paragraph_chunks(text, min_chars=min_chunk_chars):
                for pslug, ptitle, pbooks in patterns:
                    if not _pattern_in_book(pbooks, book_id):
                        continue
                    if gsm._count_mentions(chunk, ptitle) == 0:
                        continue
                    for src_slug, phrases, src_books in sources_meta:
                        if book_id not in src_books:
                            continue
                        if not _entity_in_scope(pbooks, src_books):
                            continue
                        if not _source_hits_chunk(phrases, chunk):
                            continue
                        pattern_to_source_hits[pslug][src_slug] += 1

                for src_slug, phrases, src_books in sources_meta:
                    if book_id not in src_books:
                        continue
                    if not _source_hits_chunk(phrases, chunk):
                        continue
                    for cslug, title, cbooks in concepts:
                        if not _entity_in_scope(cbooks, src_books):
                            continue
                        if _title_covered_by_phrases(title, phrases):
                            continue
                        if gsm._count_mentions(chunk, title) > 0:
                            concept_hits[src_slug][cslug] += 1
                    for pslug, title, pbooks in patterns:
                        if not _entity_in_scope(pbooks, src_books):
                            continue
                        if _title_covered_by_phrases(title, phrases):
                            continue
                        if gsm._count_mentions(chunk, title) > 0:
                            pattern_hits[src_slug][pslug] += 1

    out_sources: dict[str, tuple[list[str], list[str]]] = {}
    for src_slug, _, _ in sources_meta:
        c_sorted = sorted(
            concept_hits[src_slug],
            key=lambda s: (-concept_hits[src_slug][s], s),
        )
        p_sorted = sorted(
            pattern_hits[src_slug],
            key=lambda s: (-pattern_hits[src_slug][s], s),
        )
        c_pick = [s for s in c_sorted if concept_hits[src_slug][s] >= min_hits_concepts][
            :max_concepts
        ]
        p_pick = [s for s in p_sorted if pattern_hits[src_slug][s] >= min_hits_patterns][
            :max_patterns
        ]
        if c_pick or p_pick:
            out_sources[src_slug] = (c_pick, p_pick)

    out_patterns: dict[str, list[str]] = {}
    for pslug in pattern_to_source_hits:
        s_sorted = sorted(
            pattern_to_source_hits[pslug],
            key=lambda s: (-pattern_to_source_hits[pslug][s], s),
        )
        s_pick = [
            s for s in s_sorted if pattern_to_source_hits[pslug][s] >= min_hits_pattern_sources
        ][:max_sources_per_pattern]
        if s_pick:
            out_patterns[pslug] = s_pick

    return out_sources, out_patterns


def _merge_slug_lists(existing: object, inferred: list[str]) -> list[str]:
    base: list[str] = []
    if isinstance(existing, list):
        for x in existing:
            s = str(x).strip().removeprefix("concept-").removeprefix("pattern-")
            if s:
                base.append(s)
    seen: set[str] = set()
    out: list[str] = []
    for s in base + inferred:
        if s in seen:
            continue
        seen.add(s)
        out.append(s)
    return out


def _merge_source_slug_lists(existing: object, inferred: list[str]) -> list[str]:
    base: list[str] = []
    if isinstance(existing, list):
        for x in existing:
            s = str(x).strip().removeprefix("source-")
            if s:
                base.append(s)
    seen: set[str] = set()
    out: list[str] = []
    for s in base + inferred:
        if s in seen:
            continue
        seen.add(s)
        out.append(s)
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print inferred links only; do not modify semantic/sources/ or semantic/patterns/",
    )
    parser.add_argument(
        "--min-chunk-chars",
        type=int,
        default=50,
        help="Ignore chunks shorter than this (noise / headers).",
    )
    parser.add_argument(
        "--min-hits-concepts",
        type=int,
        default=1,
        help="Concept must co-occur with the source in at least this many chunks.",
    )
    parser.add_argument(
        "--min-hits-patterns",
        type=int,
        default=1,
        help="Pattern must co-occur with the source in at least this many chunks.",
    )
    parser.add_argument(
        "--max-concepts",
        type=int,
        default=24,
        help="Cap concepts per source ( strongest first by hit count).",
    )
    parser.add_argument(
        "--max-patterns",
        type=int,
        default=12,
        help="Cap patterns per source.",
    )
    parser.add_argument(
        "--min-hits-pattern-sources",
        type=int,
        default=1,
        help="Source must co-occur with the pattern title in at least this many chunks.",
    )
    parser.add_argument(
        "--max-sources-per-pattern",
        type=int,
        default=24,
        help="Cap relatedSources entries per pattern.",
    )
    parser.add_argument(
        "--no-pattern-sources",
        action="store_true",
        help="Skip inferring semantic/patterns relatedSources (sources only).",
    )
    parser.add_argument(
        "--exclude-substr",
        action="append",
        default=[],
        metavar="SUBSTR",
        help="Skip markdown units whose repo-relative path contains this substring (repeatable).",
    )
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    exclude = tuple(
        dict.fromkeys(
            (
                "/back-matter/bibliography",
                "/glossary.md",
                "front-matter/",
            )
            + tuple(args.exclude_substr)
        )
    )

    inferred_sources, inferred_patterns = infer_links(
        repo,
        min_chunk_chars=args.min_chunk_chars,
        min_hits_concepts=args.min_hits_concepts,
        min_hits_patterns=args.min_hits_patterns,
        min_hits_pattern_sources=args.min_hits_pattern_sources,
        exclude_substrings=exclude,
        max_concepts=args.max_concepts,
        max_patterns=args.max_patterns,
        max_sources_per_pattern=args.max_sources_per_pattern,
    )

    if args.no_pattern_sources:
        inferred_patterns = {}

    if args.dry_run:
        for slug in sorted(inferred_sources):
            c, p = inferred_sources[slug]
            print(f"source {slug}:")
            if c:
                print(f"  concepts: {', '.join(c)}")
            if p:
                print(f"  patterns: {', '.join(p)}")
        for pslug in sorted(inferred_patterns):
            print(f"pattern {pslug}:")
            print(f"  relatedSources: {', '.join(inferred_patterns[pslug])}")
        print(
            f"Dry run: {len(inferred_sources)} source(s), {len(inferred_patterns)} pattern(s).",
            file=sys.stderr,
        )
        return

    updated = 0
    for path in sorted((repo / SEMANTIC_SOURCES).glob("*.yml")):
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            continue
        slug = str(data.get("slug", path.stem)).strip()
        if slug not in inferred_sources:
            continue
        new_c, new_p = inferred_sources[slug]
        merged_c = _merge_slug_lists(data.get("concepts"), new_c)
        merged_p = _merge_slug_lists(data.get("patterns"), new_p)
        if merged_c == list(data.get("concepts") or []) and merged_p == list(
            data.get("patterns") or []
        ):
            continue
        data["concepts"] = merged_c
        data["patterns"] = merged_p
        yml = (
            yaml.safe_dump(
                data,
                allow_unicode=True,
                default_flow_style=False,
                sort_keys=False,
            ).rstrip()
            + "\n"
        )
        path.write_text(yml, encoding="utf-8")
        updated += 1

    print(f"Updated {updated} source file(s) under {repo / SEMANTIC_SOURCES}/", file=sys.stderr)

    p_updated = 0
    patterns_dir = repo / SEMANTIC_PATTERNS
    for path in sorted(patterns_dir.glob("*.yml")):
        slug = path.stem
        if slug not in inferred_patterns:
            continue
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            continue
        merged_rs = _merge_source_slug_lists(data.get("relatedSources"), inferred_patterns[slug])
        existing_norm = _merge_source_slug_lists(data.get("relatedSources"), [])
        if set(merged_rs) == set(existing_norm):
            continue
        data["relatedSources"] = merged_rs
        yml = (
            yaml.safe_dump(
                data,
                allow_unicode=True,
                default_flow_style=False,
                sort_keys=False,
            ).rstrip()
            + "\n"
        )
        path.write_text(yml, encoding="utf-8")
        p_updated += 1

    print(f"Updated {p_updated} pattern file(s) under {patterns_dir}/", file=sys.stderr)


if __name__ == "__main__":
    main()
