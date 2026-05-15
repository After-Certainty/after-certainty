#!/usr/bin/env python3
"""
Extract draft semantic pattern YAML from manuscript appendix markdown.

Expects pattern entries introduced by::

    ## **Pattern Title**
    ## **Pattern Title.**

Cluster section headings (single-word group names like **Forming** or **Formation**)
are skipped unless the following block looks like a pattern (contains **Context:**).

Draft files are meant for human review before moving into semantic/patterns/.
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

PATTERN_HEADING = re.compile(r"^## \*\*(?P<title>.+?)\*\*\s*\.?\s*$")

SKIP_TITLE_SLUGS = frozenset(
    {
        "formation",
        "completion",
        "movement",
        "resolution",
        "reinforcement",
        "forming",
        "adjusting",
        "eroding",
        "circulating",
    }
)


def _short_summary(text: str, limit: int = 700) -> str:
    collapsed = " ".join(text.split())
    if len(collapsed) <= limit:
        return collapsed
    return collapsed[: limit - 1].rstrip() + "…"


def _summary_from_block(block: str) -> str:
    m = re.search(
        r"\*\*Context:\*\*(.*?)(?:\*\*Effect:\*\*|\Z)",
        block,
        flags=re.DOTALL | re.IGNORECASE,
    )
    chunk = m.group(1).strip() if m else block.strip()
    return _short_summary(chunk)


def _related_pattern_slugs(block: str) -> list[str]:
    lines = block.splitlines()
    for i, line in enumerate(lines):
        if not re.match(r"\s*\*\*Related Patterns:\*\*\s*$", line, re.I):
            continue
        buf: list[str] = []
        for j in range(i + 1, len(lines)):
            s = lines[j].strip()
            if not s:
                if buf:
                    break
                continue
            if s.startswith("##"):
                break
            buf.append(s)
        raw = " ".join(buf)
        parts = re.split(r"[;]+", raw)
        out: list[str] = []
        seen: set[str] = set()
        for p in parts:
            name = p.strip().strip("-").strip()
            if not name or name.startswith("**"):
                continue
            slug = slugify_heading(name)
            if slug in seen:
                continue
            seen.add(slug)
            out.append(slug)
        return out
    return []


def split_pattern_blocks(text: str) -> list[tuple[str, str]]:
    """Return (title, block) for each ## **Title** section."""
    lines = text.splitlines()
    headings: list[tuple[int, str]] = []
    for i, line in enumerate(lines):
        m = PATTERN_HEADING.match(line)
        if m:
            title = m.group("title").strip()
            headings.append((i, title))

    out: list[tuple[str, str]] = []
    for j, (start, title) in enumerate(headings):
        end = headings[j + 1][0] if j + 1 < len(headings) else len(lines)
        block = "\n".join(lines[start + 1 : end])
        out.append((title, block))
    return out


def is_pattern_block(title: str, block: str) -> bool:
    slug = slugify_heading(title)
    if slug in SKIP_TITLE_SLUGS:
        return False
    if "**Context:**" not in block and "**context:**" not in block.lower():
        return False
    return True


def build_pattern_record(
    *,
    slug: str,
    title: str,
    block: str,
    book_id: str,
    source_path: Path,
    repo: Path,
) -> dict:
    return {
        "slug": slug,
        "title": title,
        "summary": _summary_from_block(block),
        "relatedConcepts": [],
        "relatedPatterns": _related_pattern_slugs(block),
        "relatedBooks": [book_id],
        "_draft": True,
        "_extracted_from": repo_relative(repo, source_path),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument("--input", required=True, help="Path to appendix markdown")
    parser.add_argument("--book-id", required=True, help="book.id for relatedBooks")
    parser.add_argument(
        "--out-dir",
        default="semantic/_drafts/generated/patterns",
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

    out_dir = (repo / args.out_dir / args.book_id).resolve() if not args.print else None
    if out_dir is not None:
        out_dir.mkdir(parents=True, exist_ok=True)

    written = 0
    for title, block in split_pattern_blocks(text):
        if not is_pattern_block(title, block):
            continue
        title = re.sub(r"\.+\s*$", "", title).strip()
        slug = slugify_heading(title)
        rec = build_pattern_record(
            slug=slug,
            title=title,
            block=block,
            book_id=args.book_id,
            source_path=src.resolve(),
            repo=repo,
        )
        yml = yaml.safe_dump(
            rec,
            allow_unicode=True,
            default_flow_style=False,
            sort_keys=False,
        ).rstrip() + "\n"
        if args.print:
            print(f"# --- {slug}.yml ---\n{yml}")
        else:
            assert out_dir is not None
            out_path = out_dir / f"{slug}.yml"
            out_path.write_text(yml, encoding="utf-8")
            written += 1
            print(str(out_path))

    if not args.print:
        print(f"Wrote {written} draft pattern file(s).", file=sys.stderr)


if __name__ == "__main__":
    main()
