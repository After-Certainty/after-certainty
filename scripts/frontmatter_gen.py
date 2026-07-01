#!/usr/bin/env python3
"""
Generate front-matter markdown from repo templates using book.yml metadata.

Templates are rendered with Jinja2 (see https://jinja.palletsprojects.com/). Paths in
book.yml `repo_template` are relative to the repository root; `{% include "..." %}`
resolves from that root as well.
"""

from __future__ import annotations

import sys
from collections.abc import Mapping
from pathlib import Path
from typing import Any

_TOOLS = Path(__file__).resolve().parents[1] / "tools"

if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from jinja2 import Environment, FileSystemLoader, StrictUndefined  # noqa: E402

from book_specs import load_any_book_spec, resolve_spec_path  # noqa: E402


def _author_display(book: dict[str, Any]) -> str:
    names: list[str] = []
    a = book.get("author")
    if isinstance(a, dict):
        n = str(a.get("name", "")).strip()
        if n:
            names.append(n)
    authors = book.get("authors")
    if isinstance(authors, list):
        for item in authors:
            if isinstance(item, dict):
                n = str(item.get("name", "")).strip()
                if n:
                    names.append(n)
    out: list[str] = []
    seen: set[str] = set()
    for n in names:
        if n in seen:
            continue
        seen.add(n)
        out.append(n)
    return ", ".join(out)


def _jinja_env(repo: Path) -> Environment:
    return Environment(
        loader=FileSystemLoader(repo),
        autoescape=False,
        undefined=StrictUndefined,
        trim_blocks=True,
        lstrip_blocks=False,
    )


def render_repo_template(repo: Path, template_rel: str, ctx: Mapping[str, Any]) -> str:
    """Load `template_rel` (posix path relative to repo root) and render with Jinja2."""
    repo = repo.resolve()
    key = template_rel.replace("\\", "/").lstrip("/")
    return _jinja_env(repo).get_template(key).render(ctx)


def render_template_path(repo: Path, template_path: Path, ctx: Mapping[str, Any]) -> str:
    """
    Render a template file. If it lies under `repo`, use the filesystem loader (supports
    includes); otherwise render the file as a standalone template string.
    """
    repo = repo.resolve()
    template_path = template_path.resolve()
    try:
        rel = template_path.relative_to(repo).as_posix()
    except ValueError:
        env = Environment(autoescape=False, undefined=StrictUndefined)
        return env.from_string(template_path.read_text(encoding="utf-8")).render(ctx)
    return render_repo_template(repo, rel, ctx)


def _truthy(book: dict[str, Any], key: str) -> bool:
    v = book.get(key)
    if v is True:
        return True
    if v is False or v is None:
        return False
    if isinstance(v, str):
        return v.strip().lower() in ("1", "true", "yes", "y")
    return bool(v)


def template_context_from_book(book: dict[str, Any]) -> dict[str, Any]:
    """Context keys for `templates/*.md.j2` (title and copyright pages)."""
    subtitle = str(book.get("subtitle") or "").strip()
    footer_raw = book.get("title_page_footer")
    if footer_raw is None:
        title_page_footer = ""
    else:
        title_page_footer = str(footer_raw).rstrip()
    ctx: dict[str, Any] = {
        "title": str(book.get("title", "")),
        "subtitle": subtitle,
        # Backward compatibility for custom templates that still use {{ subtitle_line }}.
        "subtitle_line": (f"\n\n*{subtitle}*\n\n" if subtitle else "\n\n"),
        "author": _author_display(book),
        "year": str(book.get("copyright_year", "")),
        "cover_image": str(book.get("title_page_cover") or "").strip(),
        "title_page_footer": title_page_footer,
        "title_page_newpage_after": _truthy(book, "title_page_newpage_after"),
    }
    return ctx


def generate_frontmatter_for_book(repo: Path, book_rel: str) -> list[Path]:
    """
    If book.yml defines frontmatter.generate, write configured outputs under the book dir.
    Returns list of paths written.
    """
    repo = repo.resolve()
    book_dir = (repo / book_rel).resolve()
    spec_path = resolve_spec_path(book_dir)
    if spec_path is None:
        return []

    spec = load_any_book_spec(spec_path)
    fm = spec.get("frontmatter") or {}
    gen = fm.get("generate")
    if not isinstance(gen, dict) or not gen.get("enabled"):
        return []

    book = spec.get("book") or {}
    ctx = template_context_from_book(book)

    written: list[Path] = []
    for key in ("title_page", "copyright", "about_the_series"):
        block = gen.get(key)
        if not isinstance(block, dict):
            continue
        tmpl_rel = str(block.get("repo_template", "")).strip()
        out_rel = str(block.get("output", "")).strip()
        if not tmpl_rel or not out_rel:
            continue
        tmpl_path = (repo / tmpl_rel).resolve()
        if not tmpl_path.is_file():
            raise FileNotFoundError(f"Template not found: {tmpl_path}")
        rendered = render_repo_template(repo, tmpl_rel, ctx)
        if not rendered.endswith("\n"):
            rendered += "\n"
        out_path = (book_dir / out_rel).resolve()
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(rendered, encoding="utf-8")
        written.append(out_path)

    return written
