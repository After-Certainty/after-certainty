#!/usr/bin/env python3
"""
Extract draft semantic source YAML from manuscript bibliography markdown.

Supported style (only): bullet list entries like *When Others Look to You* v1 and
*How Meaning Moves* — each entry starts with ``- `` on a new line; works use
``*italics*`` and/or ``"Quoted article title."`` on the first line; publication
details may continue on following lines.

Other bibliography layouts (pipe tables, domain/source grids) are intentionally
unsupported until those books are migrated to this style.

Draft files include ``workTitle`` (parsed work name) for promotion. After review,
run ``python3 tools/promote_semantic_source_drafts.py`` (or ``make promote-semantic-source-drafts``)
to merge drafts into ``semantic/sources/`` with display names ``Author — Title``.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

from semantic_extract import repo_relative, slugify_heading
from source_metadata import parse_bibliography_author_title


def _split_bibliography_blocks(text: str) -> list[str]:
    """Split into one string per ``-``-started entry (when-others / how-meaning style)."""
    lines = text.splitlines()
    blocks: list[str] = []
    current: list[str] = []
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("- "):
            if current:
                blocks.append("\n".join(current))
            current = [line]
        elif current:
            current.append(line)
    if current:
        blocks.append("\n".join(current))
    return blocks


def _first_line(block: str) -> str:
    return block.splitlines()[0].strip() if block.strip() else ""


def _author_and_title_fragment(first: str) -> tuple[str, str, str]:
    """
    Return (author, work_fragment, entry_kind).

    work_fragment begins with ``"`` (article) or ``*`` (book/chapter in italics)
    or empty if no recognised split (caller uses whole block as summary).
    """
    first = re.sub(r"^-\s*", "", first.strip())
    if '. "' in first:
        author, rest = first.rsplit('. "', 1)
        return author.strip(), '"' + rest, "article"
    if ". *" in first:
        author, rest = first.rsplit(". *", 1)
        return author.strip(), "*" + rest, "book"
    if ", *" in first:
        author, rest = first.rsplit(", *", 1)
        return author.strip(), "*" + rest, "book"
    author, title = parse_bibliography_author_title(first)
    if author and title:
        return author, f"*{title}*", "book"
    return first.strip(), "", "unknown"


def _extract_work_title(work_fragment: str) -> str:
    frag = work_fragment.strip()
    if frag.startswith('"'):
        m = re.match(r'^"([^"]+)"', frag)
        return m.group(1).strip() if m else frag.strip('"')
    if frag.startswith("*"):
        m = re.match(r"^\*([^*]+)\*", frag)
        return m.group(1).strip() if m else frag.strip("*")
    return ""


def _infer_type(work_title: str, block: str, entry_kind: str) -> str:
    if entry_kind == "article":
        return "article"
    low = block.lower()
    if "journal" in low or re.search(r"\*\s*[^*]+\*\s*\(\s*\d{4}\s*\)", block):
        return "article"
    return "book"


def _display_name(author_line: str) -> str:
    """Turn ``Last, First`` into ``First Last`` when a single comma pair; else unchanged."""
    s = author_line.strip().rstrip(".")
    if " and " in s or s.count(",") != 1:
        return s
    last, first = [p.strip() for p in s.split(",", 1)]
    if first and last:
        return f"{first} {last}"
    return s


def _make_slug(author: str, work_title: str, used: set[str]) -> str:
    base = slugify_heading(f"{author} {work_title}")
    if not base:
        base = slugify_heading(author) or "source"
    slug = base[:96].strip("-")
    original = slug
    n = 2
    while slug in used:
        slug = f"{original}-{n}"
        n += 1
    used.add(slug)
    return slug


def _summary(block: str, limit: int = 700) -> str:
    text = " ".join(block.split())
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + "…"


def parse_list_bibliography(text: str) -> list[dict]:
    """Parse when-others / how-meaning style list bibliography."""
    out: list[dict] = []
    used_slugs: set[str] = set()
    for block in _split_bibliography_blocks(text):
        first = _first_line(block)
        author, frag, kind = _author_and_title_fragment(first)
        work_title = _extract_work_title(frag)
        if not author:
            continue
        name = _display_name(author)
        slug = _make_slug(author, work_title, used_slugs)
        typ = _infer_type(work_title, block, kind)
        out.append(
            {
                "slug": slug,
                "name": name,
                "workTitle": work_title,
                "type": typ,
                "summary": _summary(block),
                "concepts": [],
                "patterns": [],
            }
        )
    return out


def build_source_record(
    *,
    row: dict,
    book_id: str,
    source_path: Path,
    repo: Path,
) -> dict:
    rec = {
        "slug": row["slug"],
        "name": row["name"],
        "workTitle": row.get("workTitle", ""),
        "type": row["type"],
        "summary": row["summary"],
        "concepts": [],
        "patterns": [],
        "relatedBooks": [book_id],
        "_draft": True,
        "_extracted_from": repo_relative(repo, source_path),
    }
    return rec


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument("--input", required=True, help="Path to bibliography.md")
    parser.add_argument("--book-id", required=True, help="book.id for relatedBooks")
    parser.add_argument(
        "--out-dir",
        default="semantic/_drafts/generated/sources",
        help="Base directory; drafts go under <out-dir>/<book-id>/",
    )
    parser.add_argument(
        "--print",
        action="store_true",
        help="Print YAML to stdout instead of writing files",
    )
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    src = Path(args.input)
    if not src.is_file():
        print(f"Error: not a file: {src}", file=sys.stderr)
        sys.exit(1)
    text = src.read_text(encoding="utf-8")

    rows = parse_list_bibliography(text)
    if not rows:
        print("Warning: no list-style bibliography entries found.", file=sys.stderr)

    out_dir = (repo / args.out_dir / args.book_id).resolve() if not args.print else None
    if out_dir is not None:
        out_dir.mkdir(parents=True, exist_ok=True)

    written = 0
    for row in rows:
        rec = build_source_record(
            row=row,
            book_id=args.book_id,
            source_path=src.resolve(),
            repo=repo,
        )
        yml = (
            yaml.safe_dump(
                rec,
                allow_unicode=True,
                default_flow_style=False,
                sort_keys=False,
            ).rstrip()
            + "\n"
        )
        if args.print:
            print(f"# --- {rec['slug']}.yml ---\n{yml}")
        else:
            assert out_dir is not None
            (out_dir / f"{rec['slug']}.yml").write_text(yml, encoding="utf-8")
            written += 1
            print(str(out_dir / f"{rec['slug']}.yml"))

    if not args.print:
        print(f"Wrote {written} draft source file(s).", file=sys.stderr)


if __name__ == "__main__":
    main()
