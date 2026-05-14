#!/usr/bin/env python3
"""
Render one front-matter template using the same Jinja rules as scripts/build.py.

Either load metadata from a book's book.yml (--book-dir), or pass --title / --author / etc.
Manual flags are ignored when --book-dir is set.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[1]
_TOOLS = _ROOT / "tools"
_SCRIPTS = Path(__file__).resolve().parent
for _p in (_TOOLS, _SCRIPTS):
    if str(_p) not in sys.path:
        sys.path.insert(0, str(_p))

from book_specs import SPEC_FILE_NAME, load_any_book_spec  # noqa: E402
from frontmatter_gen import render_template_path, template_context_from_book  # noqa: E402


def _manual_book(args: argparse.Namespace) -> dict:
    book: dict = {}
    if args.title.strip():
        book["title"] = args.title.strip()
    if args.subtitle.strip():
        book["subtitle"] = args.subtitle.strip()
    if args.year.strip():
        ys = args.year.strip()
        try:
            book["copyright_year"] = int(ys)
        except ValueError:
            book["copyright_year"] = ys
    if args.author.strip():
        book["author"] = {"name": args.author.strip()}
    return book


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root (default: cwd)")
    parser.add_argument(
        "--book-dir",
        default="",
        help="Book folder relative to repo; loads book.yml for placeholders",
    )
    parser.add_argument("--template", required=True, help="Template file (.md.j2)")
    parser.add_argument("--out", required=True, help="Output markdown path")
    parser.add_argument("--title", default="", help="Used only without --book-dir")
    parser.add_argument("--subtitle", default="", help="Used only without --book-dir")
    parser.add_argument("--author", default="", help="Used only without --book-dir")
    parser.add_argument("--year", default="", help="Used only without --book-dir")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    book_rel = args.book_dir.strip()

    if book_rel:
        spec_path = (repo / book_rel / SPEC_FILE_NAME).resolve()
        if not spec_path.is_file():
            raise SystemExit(f"Missing {SPEC_FILE_NAME}: {spec_path}")
        spec = load_any_book_spec(spec_path)
        ctx = template_context_from_book(spec.get("book") or {})
    else:
        ctx = template_context_from_book(_manual_book(args))

    tmpl_arg = Path(args.template)
    tmpl_path = tmpl_arg if tmpl_arg.is_absolute() else (repo / tmpl_arg).resolve()
    if not tmpl_path.is_file():
        raise SystemExit(f"Template not found: {tmpl_path}")
    rendered = render_template_path(repo, tmpl_path, ctx)
    if not rendered.endswith("\n"):
        rendered += "\n"

    out_path = Path(args.out).resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(rendered, encoding="utf-8")
    print(out_path.as_posix())


if __name__ == "__main__":
    main()
