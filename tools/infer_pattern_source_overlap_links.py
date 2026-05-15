#!/usr/bin/env python3
"""
Link semantic/patterns ``relatedSources`` and semantic/sources ``patterns`` using
**concept overlap**: a pattern's ``relatedConcepts`` and a source's ``concepts``.

A pair is eligible when ``relatedBooks`` scopes are compatible (empty on either side
means global) and when overlap passes ``--min-shared`` and ``--min-jaccard``.

Edges are kept **reciprocal**: we add (pattern, source) only if the source ranks
among the top ``--max-sources-per-pattern`` for that pattern *and* the pattern ranks
among the top ``--max-patterns-per-source`` for that source, both by
(``|intersection|``, Jaccard) score.

Use ``--dry-run`` to preview counts and sample pairs before writing.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

_TOOLS_DIR = Path(__file__).resolve().parent
if str(_TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(_TOOLS_DIR))

import generate_semantic_manifest as gsm  # noqa: E402

SEMANTIC_PATTERNS = Path("semantic/patterns")
SEMANTIC_SOURCES = Path("semantic/sources")


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


def _concept_slugs(items: object) -> set[str]:
    if not isinstance(items, list):
        return set()
    return {str(x).strip().removeprefix("concept-") for x in items if str(x).strip()}


def _books_compatible(pattern_books: set[str], source_books: set[str]) -> bool:
    if not pattern_books or not source_books:
        return True
    return bool(pattern_books & source_books)


def _score(shared: set[str], pc: set[str], sc: set[str]) -> tuple[int, float]:
    union = pc | sc
    j = len(shared) / len(union) if union else 0.0
    return (len(shared), j)


def _merge_slug_list(existing: object, inferred: list[str]) -> list[str]:
    base: list[str] = []
    if isinstance(existing, list):
        for x in existing:
            s = str(x).strip().removeprefix("source-").removeprefix("pattern-")
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


def infer_overlap_edges(
    repo: Path,
    *,
    min_shared: int,
    min_jaccard: float,
    max_sources_per_pattern: int,
    max_patterns_per_source: int,
) -> tuple[dict[str, list[str]], dict[str, list[str]]]:
    """Returns (pattern_slug -> [source_slug, ...], source_slug -> [pattern_slug, ...])."""
    patterns_raw = gsm._load_dir_yml(repo / gsm.SEMANTIC_ROOT / "patterns")
    sources_raw = gsm._load_dir_yml(repo / gsm.SEMANTIC_ROOT / "sources")

    pc_by_p: dict[str, set[str]] = {}
    pb_by_p: dict[str, set[str]] = {}
    for slug, row in patterns_raw.items():
        pc = _concept_slugs(row.get("relatedConcepts"))
        if not pc:
            continue
        pc_by_p[slug] = pc
        pb_by_p[slug] = _norm_book_slugs(row.get("relatedBooks"))

    sc_by_s: dict[str, set[str]] = {}
    sb_by_s: dict[str, set[str]] = {}
    for slug, row in sources_raw.items():
        sc = _concept_slugs(row.get("concepts"))
        if not sc:
            continue
        sc_by_s[slug] = sc
        sb_by_s[slug] = _norm_book_slugs(row.get("relatedBooks"))

    candidates: list[tuple[tuple[int, float], str, str, frozenset[str]]] = []
    for ps, pc in pc_by_p.items():
        pb = pb_by_p[ps]
        for ss, sc in sc_by_s.items():
            if not _books_compatible(pb, sb_by_s[ss]):
                continue
            shared = pc & sc
            if len(shared) < min_shared:
                continue
            _, j = _score(shared, pc, sc)
            if j < min_jaccard:
                continue
            sz, j2 = _score(shared, pc, sc)
            candidates.append(((sz, j2), ps, ss, frozenset(shared)))

    # pattern -> sorted sources by score desc
    by_pattern: dict[str, list[tuple[tuple[int, float], str]]] = {}
    for (_sz, _j), ps, ss, _sh in candidates:
        by_pattern.setdefault(ps, []).append(((_sz, _j), ss))
    for ps in by_pattern:
        by_pattern[ps].sort(key=lambda t: (-t[0][0], -t[0][1], t[1]))
    pattern_top_sources: dict[str, set[str]] = {}
    for ps, lst in by_pattern.items():
        pattern_top_sources[ps] = {ss for _, ss in lst[:max_sources_per_pattern]}

    # source -> sorted patterns by score desc
    by_source: dict[str, list[tuple[tuple[int, float], str]]] = {}
    for (_sz, _j), ps, ss, _sh in candidates:
        by_source.setdefault(ss, []).append(((_sz, _j), ps))
    for ss in by_source:
        by_source[ss].sort(key=lambda t: (-t[0][0], -t[0][1], t[1]))
    source_top_patterns: dict[str, set[str]] = {}
    for ss, lst in by_source.items():
        source_top_patterns[ss] = {ps for _, ps in lst[:max_patterns_per_source]}

    pattern_to_sources: dict[str, list[str]] = {}
    source_to_patterns: dict[str, list[str]] = {}

    for (_sz, _j), ps, ss, _sh in sorted(
        candidates, key=lambda x: (-x[0][0], -x[0][1], x[1], x[2])
    ):
        if ss not in pattern_top_sources.get(ps, set()):
            continue
        if ps not in source_top_patterns.get(ss, set()):
            continue
        pattern_to_sources.setdefault(ps, []).append(ss)
        source_to_patterns.setdefault(ss, []).append(ps)

    for ps in pattern_to_sources:
        pattern_to_sources[ps] = sorted(set(pattern_to_sources[ps]))
    for ss in source_to_patterns:
        source_to_patterns[ss] = sorted(set(source_to_patterns[ss]))

    return pattern_to_sources, source_to_patterns


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--min-shared", type=int, default=2, help="Minimum |relatedConcepts ∩ concepts|."
    )
    parser.add_argument(
        "--min-jaccard",
        type=float,
        default=0.12,
        help="Minimum Jaccard similarity on the two concept sets.",
    )
    parser.add_argument("--max-sources-per-pattern", type=int, default=6)
    parser.add_argument("--max-patterns-per-source", type=int, default=10)
    parser.add_argument(
        "--sample",
        type=int,
        default=18,
        help="With --dry-run, print this many highest-scoring reciprocal pairs.",
    )
    args = parser.parse_args()
    repo = Path(args.repo).resolve()

    p_to_s, s_to_p = infer_overlap_edges(
        repo,
        min_shared=args.min_shared,
        min_jaccard=args.min_jaccard,
        max_sources_per_pattern=args.max_sources_per_pattern,
        max_patterns_per_source=args.max_patterns_per_source,
    )

    n_edges = sum(len(v) for v in p_to_s.values())
    if args.dry_run:
        print(f"Reciprocal overlap edges: {n_edges} (patterns with ≥1 source: {len(p_to_s)})")
        print(f"Sources gaining ≥1 pattern: {len(s_to_p)}")
        # rescore sample for display
        patterns_raw = gsm._load_dir_yml(repo / gsm.SEMANTIC_ROOT / "patterns")
        sources_raw = gsm._load_dir_yml(repo / gsm.SEMANTIC_ROOT / "sources")
        rows: list[tuple[tuple[int, float], str, str, str]] = []
        for ps, srcs in p_to_s.items():
            pc = _concept_slugs(patterns_raw[ps].get("relatedConcepts"))
            for ss in srcs:
                sc = _concept_slugs(sources_raw[ss].get("concepts"))
                shared = pc & sc
                sz, j = _score(shared, pc, sc)
                rows.append(((sz, j), ps, ss, ", ".join(sorted(shared))))
        rows.sort(key=lambda r: (-r[0][0], -r[0][1], r[1], r[2]))
        for (_sz, _j), ps, ss, sh in rows[: args.sample]:
            print(f"  {ps}  <->  {ss}")
            print(f"      shared: {sh}")
        return

    p_updated = 0
    s_updated = 0
    for path in sorted((repo / SEMANTIC_PATTERNS).glob("*.yml")):
        slug = path.stem
        if slug not in p_to_s:
            continue
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            continue
        merged = _merge_slug_list(data.get("relatedSources"), p_to_s[slug])
        prev = _merge_slug_list(data.get("relatedSources"), [])
        if set(merged) == set(prev):
            continue
        data["relatedSources"] = merged
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

    for path in sorted((repo / SEMANTIC_SOURCES).glob("*.yml")):
        slug = path.stem
        if slug not in s_to_p:
            continue
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            continue
        merged = _merge_slug_list(data.get("patterns"), s_to_p[slug])
        prev = _merge_slug_list(data.get("patterns"), [])
        if set(merged) == set(prev):
            continue
        data["patterns"] = merged
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
        s_updated += 1

    print(
        f"Updated {p_updated} pattern file(s) and {s_updated} source file(s) "
        f"({n_edges} new reciprocal edges merged).",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
