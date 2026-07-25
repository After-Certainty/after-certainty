#!/usr/bin/env python3
"""
Scan a book manuscript for occurrences of existing semantic glossary terms.

Writes a markdown report (stdout or --out) for review or PR attachment.
"""

from __future__ import annotations

import argparse
import re
import sys
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

_TOOLS_DIR = Path(__file__).resolve().parent
if str(_TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(_TOOLS_DIR))

from book_specs import load_any_book_spec  # noqa: E402
from semantic_enrichment import book_id_from_spec, entity_in_book  # noqa: E402

GLOSSARY_DIR = Path("semantic/glossary")
MANUSCRIPT_GLOBS = (
    "parts",
    "manuscript",
    "front-matter",
    "back-matter",
    "interludes",
    "appendix",
)


@dataclass(frozen=True)
class GlossaryTerm:
    slug: str
    title: str
    in_book_scope: bool


@dataclass(frozen=True)
class Hit:
    path: str
    line_no: int
    excerpt: str


def _load_glossary(repo: Path, book_id: str, *, scope: str) -> list[GlossaryTerm]:
    root = (repo / GLOSSARY_DIR).resolve()
    terms: list[GlossaryTerm] = []
    for path in sorted(root.glob("*.yml")):
        raw = yaml.safe_load(path.read_text(encoding="utf-8"))
        if not isinstance(raw, dict):
            continue
        slug = str(raw.get("slug", path.stem)).strip() or path.stem
        title = str(raw.get("title", slug)).strip() or slug
        scoped = entity_in_book(raw, book_id)
        if scope == "book" and not scoped:
            continue
        terms.append(GlossaryTerm(slug=slug, title=title, in_book_scope=scoped))
    return terms


def _manuscript_files(book_dir: Path) -> list[Path]:
    files: list[Path] = []
    for name in MANUSCRIPT_GLOBS:
        sub = book_dir / name
        if sub.is_dir():
            files.extend(sorted(sub.rglob("*.md")))
    for extra in ("glossary.md", "README.md"):
        p = book_dir / extra
        if p.is_file():
            files.append(p)
    return sorted(set(files))


def _search_needles(term: GlossaryTerm) -> list[tuple[str, re.Pattern[str]]]:
    needles: list[tuple[str, re.Pattern[str]]] = []
    phrase = term.slug.replace("-", " ")
    for label, text in (
        ("slug", phrase),
        ("title", term.title),
    ):
        if not text.strip():
            continue
        pat = re.compile(rf"\b{re.escape(text)}\b", re.IGNORECASE)
        needles.append((label, pat))
    if "-" in term.slug:
        pat = re.compile(rf"\b{re.escape(term.slug)}\b", re.IGNORECASE)
        needles.append(("slug-hyphen", pat))
    return needles


def _scan_file(path: Path, needles: list[tuple[str, re.Pattern[str]]]) -> list[Hit]:
    hits: list[Hit] = []
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError:
        return hits
    for i, line in enumerate(lines, start=1):
        if not line.strip():
            continue
        for _label, pat in needles:
            if pat.search(line):
                excerpt = line.strip()
                if len(excerpt) > 120:
                    excerpt = excerpt[:117] + "..."
                hits.append(Hit(path=path.as_posix(), line_no=i, excerpt=excerpt))
                break
    return hits


def scan_book(
    repo: Path,
    *,
    book_dir: Path,
    book_id: str,
    scope: str,
) -> tuple[list[GlossaryTerm], dict[str, list[Hit]], list[Path]]:
    terms = _load_glossary(repo, book_id, scope=scope)
    files = _manuscript_files(book_dir)
    rel_files = [p for p in files]
    by_slug: dict[str, list[Hit]] = defaultdict(list)
    for term in terms:
        needles = _search_needles(term)
        if not needles:
            continue
        for path in rel_files:
            try:
                rel = path.resolve().relative_to(repo.resolve()).as_posix()
            except ValueError:
                rel = path.as_posix()
            for hit in _scan_file(path, needles):
                by_slug[term.slug].append(Hit(path=rel, line_no=hit.line_no, excerpt=hit.excerpt))
    return terms, dict(by_slug), rel_files


def render_report(
    *,
    book_id: str,
    book_dir: Path,
    terms: list[GlossaryTerm],
    hits: dict[str, list[Hit]],
    files: list[Path],
    scope: str,
    repo: Path,
) -> str:
    book_rel = book_dir.relative_to(repo) if book_dir.is_relative_to(repo) else book_dir
    lines: list[str] = [
        f"# Glossary usage: {book_id}",
        "",
        f"- **Book directory:** `{book_rel.as_posix()}`",
        f"- **Glossary scope:** `{scope}`",
        f"- **Terms scanned:** {len(terms)}",
        f"- **Manuscript files:** {len(files)}",
        "",
    ]

    with_hits = [(t, hits.get(t.slug, [])) for t in terms if hits.get(t.slug)]
    with_hits.sort(key=lambda x: (-len(x[1]), x[0].slug))
    without = [t for t in terms if not hits.get(t.slug)]

    lines.append("## Terms with occurrences")
    lines.append("")
    if not with_hits:
        lines.append("_No glossary term matches found in scanned manuscript paths._")
        lines.append("")
    for term, term_hits in with_hits:
        lines.append(f"### {term.slug} ({term.title}) — {len(term_hits)} hit(s)")
        lines.append("")
        shown = term_hits[:25]
        for h in shown:
            lines.append(f"- `{h.path}:{h.line_no}` — {h.excerpt}")
        if len(term_hits) > len(shown):
            lines.append(f"- _…and {len(term_hits) - len(shown)} more_")
        lines.append("")

    lines.append("## Terms with no occurrences")
    lines.append("")
    if not without:
        lines.append("_All scanned terms appear at least once._")
    else:
        for t in without:
            note = "" if t.in_book_scope else " _(not in book `relatedBooks` scope)_"
            lines.append(f"- `{t.slug}` ({t.title}){note}")
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument("--book-dir", required=True, help="e.g. books/coupling")
    parser.add_argument("--book-id", help="Defaults to book.id from book.yml")
    parser.add_argument(
        "--scope",
        choices=("book", "all"),
        default="book",
        help="book: relatedBooks empty or includes book; all: every glossary entry",
    )
    parser.add_argument("--out", help="Write report markdown to this path")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    book_dir = (repo / args.book_dir).resolve()
    spec_path = book_dir / "book.yml"
    if not spec_path.is_file():
        print(f"Error: missing {spec_path}", file=sys.stderr)
        return 2

    book_id = args.book_id or book_id_from_spec(load_any_book_spec(spec_path))
    terms, hits, files = scan_book(repo, book_dir=book_dir, book_id=book_id, scope=args.scope)
    report = render_report(
        book_id=book_id,
        book_dir=book_dir,
        terms=terms,
        hits=hits,
        files=files,
        scope=args.scope,
        repo=repo,
    )

    if args.out:
        out_arg = Path(args.out)
        out_path = out_arg.resolve() if out_arg.is_absolute() else (repo / out_arg).resolve()
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(report + "\n", encoding="utf-8")
        try:
            shown = out_path.relative_to(repo)
        except ValueError:
            shown = out_path
        print(f"Wrote {shown}", file=sys.stderr)
    else:
        print(report)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
