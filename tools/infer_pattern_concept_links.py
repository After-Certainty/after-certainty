#!/usr/bin/env python3
"""
Infer semantic/patterns ``relatedConcepts`` by scanning manuscript markdown and
pattern YAML fields.

**Manuscript:** in each text chunk, if a **pattern title** (plus setup as a probe)
co-occurs with a **glossary concept title**, count a hit.

**Pattern YAML:** the same glossary title matching runs on each of ``title``,
``setup``, ``problem``, each ``forces`` list item, ``observation``, and ``example``.
Each field (or force line) that mentions a concept adds one hit.

Concepts are only considered when their ``relatedBooks`` is empty (global) or
intersects the pattern's ``relatedBooks``. Pattern chunks are only scanned in
books listed on the pattern.

This does not read the appendices as structured data; manuscript matching is
statistical co-mention. Use ``--dry-run`` to review before writing.

To remove ``**bold**``, ``__bold__``, inline code fences, and markdown links from pattern
narrative YAML (``title``, ``setup``, ``problem``, ``forces``, ``observation``), and
to unwrap redundant outer quotes on ``example``, run with ``--strip-prose-markdown``.
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


def _entity_in_scope(entity_books: set[str], pattern_books: set[str]) -> bool:
    return not entity_books or bool(entity_books & pattern_books)


def _collapse_ws(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip()).strip()


_MD_BOLD_STAR = re.compile(r"\*\*([^*]+)\*\*")
_MD_BOLD_UNDER = re.compile(r"__([^_]+)__")
_MD_CODE = re.compile(r"`([^`]+)`")
_MD_LINK = re.compile(r"\[([^\]]+)\]\([^)]*\)")


def strip_pattern_prose_markdown(text: str) -> str:
    """Remove common inline markdown from pattern narrative fields (bold, code, links)."""
    t = text or ""
    for _ in range(24):
        prev = t
        t = _MD_BOLD_STAR.sub(r"\1", t)
        t = _MD_BOLD_UNDER.sub(r"\1", t)
        t = _MD_CODE.sub(r"\1", t)
        t = _MD_LINK.sub(r"\1", t)
        if t == prev:
            break
    return t


def strip_decorative_outer_quotes(text: str) -> str:
    """Remove matching outer ``"`` or ``'`` wrappers when they enclose the whole string."""
    t = (text or "").strip()
    for _ in range(4):
        if len(t) < 2:
            break
        first, last = t[0], t[-1]
        if first == last and first in "\"'":
            t = t[1:-1].strip()
        else:
            break
    return t


def normalize_pattern_example_field(text: str) -> str:
    """Normalize ``example`` prose: inline markdown, then redundant whole-string quotes."""
    return strip_decorative_outer_quotes(strip_pattern_prose_markdown(text))


def _strip_pattern_file_narrative_fields(data: dict) -> bool:
    """Mutate pattern YAML dict in place; return True if any narrative string changed."""
    changed = False
    for key in ("title", "setup", "problem", "observation"):
        val = data.get(key)
        if not isinstance(val, str) or not val:
            continue
        new = strip_pattern_prose_markdown(val)
        if new != val:
            data[key] = new
            changed = True
    ex = data.get("example")
    if isinstance(ex, str) and ex:
        new_ex = normalize_pattern_example_field(ex)
        if new_ex != ex:
            data["example"] = new_ex
            changed = True
    forces = data.get("forces")
    if isinstance(forces, list):
        new_list: list[object] = []
        for item in forces:
            if isinstance(item, str):
                s2 = strip_pattern_prose_markdown(item)
                if s2 != item:
                    changed = True
                new_list.append(s2)
            else:
                new_list.append(item)
        data["forces"] = new_list
    return changed


def rewrite_pattern_prose_markdown(repo: Path) -> int:
    """Normalize narrative fields in all semantic/patterns/*.yml (markdown + example quotes)."""
    patterns_dir = repo / SEMANTIC_PATTERNS
    updated = 0
    for path in sorted(patterns_dir.glob("*.yml")):
        raw = path.read_text(encoding="utf-8")
        data = yaml.safe_load(raw)
        if not isinstance(data, dict):
            continue
        if not _strip_pattern_file_narrative_fields(data):
            continue
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
    return updated


def _pattern_probes(title: str, setup: str) -> list[str]:
    """Title plus setup line (appendix often splits heading from body in different chunks)."""
    raw: list[str] = []
    t = (title or "").strip()
    if t:
        raw.append(t)
    s = _collapse_ws(setup)
    if s and len(s) >= 12 and s.casefold() not in t.casefold():
        raw.append(s)
    seen: set[str] = set()
    out: list[str] = []
    for p in raw:
        k = p.casefold()
        if k in seen:
            continue
        seen.add(k)
        out.append(p)
    out.sort(key=len, reverse=True)
    return out


_APPENDIX_PATTERN_HEAD = re.compile(r"^## \*\*.+\*\*\s*$", re.MULTILINE)


def _paragraph_chunks(text: str, *, min_chars: int) -> list[str]:
    """Split markdown into coarse chunks; merge short pieces so headings are not dropped.

    Appendix pattern blocks often put a ``## **Title.**`` heading in its own paragraph
    under the default ``min_chars`` threshold; dropping it breaks title-based matching
    for the following **Context:** body.

    A heading plus only ``**Context:**`` / ``**Problem:**`` labels can still be under
    ``min_chars`` while already tripping a naive merge; we keep pulling paragraphs
    until the chunk has a line that is not just a ``**Label:**`` marker.
    """
    text = text.replace("\r\n", "\n")
    pieces = [p.strip() for p in re.split(r"\n\n+|\n(?=-\s)", text) if p.strip()]
    merged: list[str] = []
    buf = ""

    def _only_heading_labels(s: str) -> bool:
        lines = [ln.strip() for ln in s.splitlines() if ln.strip()]
        if not lines:
            return True
        if not _APPENDIX_PATTERN_HEAD.match(lines[0]):
            return False
        rest = lines[1:]
        return all(re.fullmatch(r"\*\*[^*]+\*\*", x) for x in rest)

    for p in pieces:
        if not buf:
            buf = p
        else:
            buf = f"{buf}\n\n{p}"
        long_enough = len(buf) >= min_chars
        if long_enough and not _only_heading_labels(buf):
            merged.append(buf)
            buf = ""
    if buf:
        if merged:
            merged[-1] = f"{merged[-1]}\n\n{buf}"
        else:
            merged.append(buf)
    return merged


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


def _pattern_field_texts(data: dict) -> list[str]:
    """Non-empty strings from narrative YAML fields (one entry per forces bullet)."""
    out: list[str] = []
    for key in ("title", "setup", "problem", "observation"):
        val = data.get(key)
        if isinstance(val, str) and val.strip():
            out.append(strip_pattern_prose_markdown(val.strip()))
    ex = data.get("example")
    if isinstance(ex, str) and ex.strip():
        out.append(normalize_pattern_example_field(ex.strip()))
    forces = data.get("forces")
    if isinstance(forces, list):
        for item in forces:
            if isinstance(item, str) and item.strip():
                out.append(strip_pattern_prose_markdown(item.strip()))
    return out


def _load_patterns_for_scan(repo: Path) -> list[tuple[str, str, set[str], str, list[str]]]:
    raw = gsm._load_dir_yml(repo / gsm.SEMANTIC_ROOT / "patterns")
    out: list[tuple[str, str, set[str], str, list[str]]] = []
    for slug in sorted(raw.keys()):
        data = raw[slug]
        title = strip_pattern_prose_markdown(str(data.get("title", slug)).strip())
        if not title:
            continue
        setup = strip_pattern_prose_markdown(str(data.get("setup", "") or ""))
        out.append(
            (
                slug,
                title,
                _norm_book_slugs(data.get("relatedBooks")),
                setup,
                _pattern_field_texts(data),
            )
        )
    return out


def _load_concepts_for_scan(repo: Path) -> list[tuple[str, str, set[str]]]:
    by_gloss, _, _ = gsm.build_glossary_entries(repo, warn_term_kind=False)
    concepts: list[tuple[str, str, set[str]]] = []
    for slug in sorted(by_gloss.keys()):
        row = by_gloss[slug]
        title = str(row.get("title", "")).strip()
        if not title:
            continue
        concepts.append((slug, title, _norm_book_slugs(row.get("relatedBooks"))))
    return concepts


def infer_pattern_concepts(
    repo: Path,
    *,
    min_chunk_chars: int,
    min_hits: int,
    max_concepts: int,
    exclude_substrings: tuple[str, ...],
) -> dict[str, list[str]]:
    """pattern_slug -> concept slugs to add."""
    book_dirs = _book_dirs_by_id(repo)
    patterns = _load_patterns_for_scan(repo)
    concepts = _load_concepts_for_scan(repo)
    hits: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))

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
                for pslug, ptitle, pbooks, psetup, _field_texts in patterns:
                    if not _pattern_in_book(pbooks, book_id):
                        continue
                    probes = _pattern_probes(ptitle, psetup)
                    if not any(gsm._count_mentions(chunk, p) for p in probes):
                        continue
                    for cslug, ctitle, cbooks in concepts:
                        if not _entity_in_scope(cbooks, pbooks):
                            continue
                        if book_id not in cbooks and cbooks:
                            continue
                        if gsm._count_mentions(chunk, ctitle) > 0:
                            hits[pslug][cslug] += 1

    for pslug, _ptitle, pbooks, _psetup, field_texts in patterns:
        for field in field_texts:
            for cslug, ctitle, cbooks in concepts:
                if not _entity_in_scope(cbooks, pbooks):
                    continue
                if gsm._count_mentions(field, ctitle) > 0:
                    hits[pslug][cslug] += 1

    out: dict[str, list[str]] = {}
    for pslug, _ptitle, _, _, _ in patterns:
        ranked = sorted(hits[pslug], key=lambda s: (-hits[pslug][s], s))
        pick = [s for s in ranked if hits[pslug][s] >= min_hits][:max_concepts]
        if pick:
            out[pslug] = pick
    return out


def _merge_concept_slugs(existing: object, inferred: list[str]) -> list[str]:
    base: list[str] = []
    if isinstance(existing, list):
        for x in existing:
            s = str(x).strip().removeprefix("concept-")
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
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--min-chunk-chars", type=int, default=50)
    parser.add_argument(
        "--min-hits",
        type=int,
        default=2,
        help="Total hits required per concept (manuscript chunks + pattern YAML fields).",
    )
    parser.add_argument("--max-concepts", type=int, default=16, help="Cap concepts per pattern.")
    parser.add_argument(
        "--exclude-substr",
        action="append",
        default=[],
        metavar="SUBSTR",
        help="Skip markdown units whose repo-relative path contains this substring (repeatable).",
    )
    parser.add_argument(
        "--strip-prose-markdown",
        action="store_true",
        help="Rewrite semantic/patterns/*.yml: strip **bold**, __bold__, `code`, [text](url); unwrap decorative outer quotes on ``example``.",
    )
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    if args.strip_prose_markdown:
        n = rewrite_pattern_prose_markdown(repo)
        print(f"Normalized narrative fields in {n} pattern file(s).", file=sys.stderr)
        return

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

    inferred = infer_pattern_concepts(
        repo,
        min_chunk_chars=args.min_chunk_chars,
        min_hits=args.min_hits,
        max_concepts=args.max_concepts,
        exclude_substrings=exclude,
    )

    if args.dry_run:
        for pslug in sorted(inferred):
            print(f"{pslug}: {', '.join(inferred[pslug])}")
        print(f"Dry run: {len(inferred)} pattern(s) with inferred concepts.", file=sys.stderr)
        return

    updated = 0
    for path in sorted((repo / SEMANTIC_PATTERNS).glob("*.yml")):
        slug = path.stem
        if slug not in inferred:
            continue
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            continue
        merged = _merge_concept_slugs(data.get("relatedConcepts"), inferred[slug])
        prev = _merge_concept_slugs(data.get("relatedConcepts"), [])
        if set(merged) == set(prev):
            continue
        data["relatedConcepts"] = merged
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

    print(f"Updated {updated} pattern file(s) under {repo / SEMANTIC_PATTERNS}/", file=sys.stderr)


if __name__ == "__main__":
    main()
