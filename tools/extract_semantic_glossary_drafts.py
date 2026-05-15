#!/usr/bin/env python3
"""
Extract draft semantic glossary YAML from manuscript markdown.

Supports:
  bold_emdash — paragraphs like ``**Term** — definition...`` (e.g. When Others v1 glossary).
  h2 — ``## Title`` sections with body until the next H2 (e.g. Coupling glossary).

Draft files are meant for human review before moving into semantic/glossary/.
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

BOLD_START = re.compile(
    r"^\s*\*\*(?P<title>[^*]+)\*\*\s*(?:[—:\-]|\u2013)\s*(?P<first>.*)\s*$"
)
H2 = re.compile(r"^## (?P<title>.+?)\s*$")


def _short_definition(body: str, limit: int = 600) -> str:
    text = " ".join(body.split())
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + "…"


def parse_bold_emdash(text: str) -> list[tuple[str, str]]:
    """Return list of (title, full_body) including continuation lines."""
    lines = text.splitlines()
    entries: list[tuple[str, str]] = []
    current_title: str | None = None
    body_lines: list[str] = []

    def flush() -> None:
        nonlocal current_title, body_lines
        if current_title is None:
            return
        body = "\n".join(body_lines).strip()
        entries.append((current_title.strip(), body))
        current_title = None
        body_lines = []

    for line in lines:
        m = BOLD_START.match(line)
        if m:
            flush()
            current_title = m.group("title")
            first = m.group("first").strip()
            body_lines = [first] if first else []
            continue
        if current_title is not None:
            if line.strip() == "" and not body_lines:
                continue
            body_lines.append(line)

    flush()
    return entries


def parse_h2_sections(text: str) -> list[tuple[str, str]]:
    """Return (title, body) for each ## heading; skips preamble before first H2."""
    lines = text.splitlines()
    entries: list[tuple[str, str]] = []
    current_title: str | None = None
    body_lines: list[str] = []

    def flush() -> None:
        nonlocal current_title, body_lines
        if current_title is None:
            return
        body = "\n".join(body_lines).strip()
        entries.append((current_title.strip(), body))
        current_title = None
        body_lines = []

    for line in lines:
        m = H2.match(line)
        if m and not m.group("title").strip().startswith("**"):
            flush()
            current_title = re.sub(r"\*\*(.+?)\*\*", r"\1", m.group("title")).strip()
            body_lines = []
            continue
        if current_title is not None:
            body_lines.append(line)

    flush()
    return entries


def build_draft_record(
    *,
    slug: str,
    title: str,
    body: str,
    book_id: str,
    source_path: Path,
    repo: Path,
) -> dict:
    return {
        "slug": slug,
        "title": title,
        "shortDefinition": _short_definition(body),
        "longDefinition": body.strip() or None,
        "termKind": "extended",
        "relatedConcepts": [],
        "relatedPatterns": [],
        "relatedBooks": [book_id],
        "_draft": True,
        "_extracted_from": repo_relative(repo, source_path),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root (for _extracted_from paths)")
    parser.add_argument("--input", required=True, help="Path to glossary.md")
    parser.add_argument(
        "--book-id",
        required=True,
        help="book.id value for relatedBooks (e.g. when-others-look-to-you-v1)",
    )
    parser.add_argument(
        "--format",
        choices=("bold_emdash", "h2", "auto"),
        default="auto",
        help="Parse style (auto: use bold_emdash if a **Term** — line exists, else h2)",
    )
    parser.add_argument(
        "--out-dir",
        default="semantic/_drafts/generated/glossary",
        help="Base directory; drafts are written to <out-dir>/<book-id>/ (created if missing)",
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

    fmt = args.format
    if fmt == "auto":
        fmt = "bold_emdash" if re.search(r"^\s*\*\*[^*]+\*\*\s*[—:\-\u2013]", text, re.MULTILINE) else "h2"

    if fmt == "bold_emdash":
        raw_entries = parse_bold_emdash(text)
    else:
        raw_entries = parse_h2_sections(text)

    out_dir = (repo / args.out_dir / args.book_id).resolve() if not args.print else None
    if out_dir is not None:
        out_dir.mkdir(parents=True, exist_ok=True)

    written = 0
    for title, body in raw_entries:
        if not title:
            continue
        slug = slugify_heading(title)
        rec = build_draft_record(
            slug=slug,
            title=title,
            body=body,
            book_id=args.book_id,
            source_path=src.resolve(),
            repo=repo,
        )
        if rec.get("longDefinition") is None:
            del rec["longDefinition"]
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
        print(f"Wrote {written} draft glossary file(s) using format={fmt!r}.", file=sys.stderr)


if __name__ == "__main__":
    main()
