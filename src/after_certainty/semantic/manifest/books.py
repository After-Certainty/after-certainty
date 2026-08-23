"""
Shared helpers for aggregate book manifests (books-manifest, semantic-manifest).
"""

from __future__ import annotations

import subprocess
from pathlib import Path
from urllib.parse import urlparse

from after_certainty.core.book_output_stem import stem_for_book_dir
from after_certainty.core.path_safety import (
    PathSafetyError,
    ensure_book_relative,
    ensure_repo_relative,
)
from after_certainty.specs.book_specs import spec_formats


def sanitize_github_repo_slug(raw: str) -> str:
    """
    Normalize owner/repo from a slug, HTTPS URL, or git@github.com URL.

    Strips embedded credentials from authenticated HTTPS git remotes so manifests
    never embed access tokens from `git remote get-url origin`.
    """
    value = raw.strip()
    if not value:
        return ""

    if value.startswith("git@github.com:"):
        value = value.replace("git@github.com:", "", 1)
    elif "://" in value:
        parsed = urlparse(value)
        host = parsed.netloc.rsplit("@", 1)[-1]
        path = parsed.path.lstrip("/")
        if host.endswith("github.com") and path:
            value = path
        elif path:
            value = f"{host}/{path}" if host else path
        else:
            value = host

    if "@" in value:
        value = value.rsplit("@", 1)[-1]

    return value.rstrip("/").removesuffix(".git")


def extract_author_names(book: dict) -> list[str]:
    names: list[str] = []
    author = book.get("author")
    if isinstance(author, dict):
        name = str(author.get("name", "")).strip()
        if name:
            names.append(name)
    authors = book.get("authors")
    if isinstance(authors, list):
        for item in authors:
            if not isinstance(item, dict):
                continue
            name = str(item.get("name", "")).strip()
            if name:
                names.append(name)
    out: list[str] = []
    seen: set[str] = set()
    for name in names:
        if name in seen:
            continue
        seen.add(name)
        out.append(name)
    return out


def resolve_repo_slug(repo: Path, explicit: str) -> str:
    if explicit.strip():
        return sanitize_github_repo_slug(explicit)
    result = subprocess.run(
        ["git", "-C", str(repo), "remote", "get-url", "origin"],
        capture_output=True,
        text=True,
        check=False,
    )
    raw = result.stdout.strip()
    if result.returncode != 0 or not raw:
        return ""
    return sanitize_github_repo_slug(raw)


def to_repo_relative(repo: Path, candidate: Path) -> str | None:
    try:
        return candidate.resolve().relative_to(repo.resolve()).as_posix()
    except ValueError:
        return None


def _title_page_markdown_parent(spec: dict, book_dir: Path) -> Path | None:
    """Directory containing generated title-page markdown, if configured."""
    fm = spec.get("frontmatter")
    if not isinstance(fm, dict):
        return None
    gen = fm.get("generate")
    if not isinstance(gen, dict) or not gen.get("enabled"):
        return None
    block = gen.get("title_page")
    if not isinstance(block, dict):
        return None
    out_rel = str(block.get("output", "")).strip()
    if not out_rel:
        return None
    try:
        title_md = ensure_book_relative(book_dir, out_rel, description="title_page output")
    except PathSafetyError:
        return None
    return title_md.parent


def resolve_cover_path(repo: Path, spec_path: Path, spec: dict, cover_value: str) -> str | None:
    """
    Resolve `book.title_page_cover` to a repo-relative path for raw.githubusercontent URLs.

    Values are usually basenames (e.g. `BookCover.png`) at the book root; resolution
    tries the title-page output directory first, then the book directory, so manifest
    URLs match the on-disk asset. Pandoc exports pass `--resource-path=<book_dir>`,
    which resolves those basenames for DOCX/PDF.
    """
    book_dir = spec_path.parent.resolve()
    anchors: list[Path] = []

    tp_parent = _title_page_markdown_parent(spec, book_dir)
    if tp_parent is not None:
        anchors.append(tp_parent)
    anchors.append(book_dir)

    if cover_value.strip():
        seen: set[Path] = set()
        for base in anchors:
            try:
                candidate = ensure_book_relative(base, cover_value, description="cover image")
            except PathSafetyError:
                continue
            if candidate in seen:
                continue
            seen.add(candidate)
            if candidate.is_file():
                rel = to_repo_relative(repo, candidate)
                if rel:
                    try:
                        ensure_repo_relative(repo, rel, must_exist=True, description="cover image")
                    except PathSafetyError:
                        continue
                    return rel

    for name in ("BookCover.png", "book_cover.png", "book-cover.png"):
        try:
            candidate = ensure_book_relative(book_dir, name, description="cover image")
        except PathSafetyError:
            continue
        if candidate.is_file():
            rel = to_repo_relative(repo, candidate)
            if rel:
                return rel
    return None


def resolve_open_graph_path(repo: Path, spec_path: Path, spec: dict, og_value: str) -> str | None:
    """
    Resolve `book.open_graph_image` to a repo-relative path for raw.githubusercontent URLs.
    """
    book_dir = spec_path.parent.resolve()
    anchors: list[Path] = []

    tp_parent = _title_page_markdown_parent(spec, book_dir)
    if tp_parent is not None:
        anchors.append(tp_parent)
    anchors.append(book_dir)

    if og_value.strip():
        seen: set[Path] = set()
        for base in anchors:
            try:
                candidate = ensure_book_relative(base, og_value, description="open graph image")
            except PathSafetyError:
                continue
            if candidate in seen:
                continue
            seen.add(candidate)
            if candidate.is_file():
                rel = to_repo_relative(repo, candidate)
                if rel:
                    return rel

    for name in ("open-graph.png", "open_graph.png"):
        try:
            candidate = ensure_book_relative(book_dir, name, description="open graph image")
        except PathSafetyError:
            continue
        if candidate.is_file():
            rel = to_repo_relative(repo, candidate)
            if rel:
                return rel
    return None


def _validate_publication_date(date_str: str) -> str | None:
    """Validate and return ISO 8601 date (YYYY-MM-DD) or None if invalid."""
    if not date_str or not isinstance(date_str, str):
        return None
    date_str = date_str.strip()
    if not date_str:
        return None
    # Validate YYYY-MM-DD format
    import re

    if not re.match(r"^\d{4}-\d{2}-\d{2}$", date_str):
        return None
    # Basic validation of month/day ranges
    try:
        year, month, day = map(int, date_str.split("-"))
        if not (1 <= month <= 12 and 1 <= day <= 31):
            return None
    except (ValueError, AttributeError):
        return None
    return date_str


def raw_content_url(repo_slug: str, ref: str, repo_rel_path: str) -> str:
    return f"https://raw.githubusercontent.com/{repo_slug}/{ref}/{repo_rel_path}"


def release_asset_url(repo_slug: str, release_tag: str, filename: str) -> str:
    return f"https://github.com/{repo_slug}/releases/download/{release_tag}/{filename}"


def format_entry(
    repo_slug: str,
    release_tag: str,
    fmt: str,
    stem: str,
    enabled: bool,
    *,
    include_release_url: bool = True,
) -> dict:
    filename = f"{stem}.{fmt}"
    return {
        "enabled": enabled,
        "file": filename,
        "url": release_asset_url(repo_slug, release_tag, filename)
        if enabled and repo_slug and include_release_url
        else None,
    }


def build_book_entry(
    *,
    repo: Path,
    spec_path: Path,
    spec: dict,
    repo_slug: str,
    ref: str,
    release_tag: str,
    source: str,
    status: str,
) -> dict:
    book = spec.get("book", {})
    book_dir = spec_path.parent.resolve()
    stem = stem_for_book_dir(book_dir.as_posix(), root=repo)
    slug = str(book.get("id", "")).strip() or stem
    aliases_raw = book.get("slug_aliases")
    slug_aliases: list[str] = []
    if isinstance(aliases_raw, list):
        for a in aliases_raw:
            s = str(a).strip()
            if s and s != slug:
                slug_aliases.append(s)
    companion_of = str(book.get("companion_of", "")).strip() or None
    companions_raw = book.get("companion_books")
    companion_books: list[str] = []
    if isinstance(companions_raw, list):
        for c in companions_raw:
            s = str(c).strip()
            if s:
                companion_books.append(s)
    enabled_formats = set(spec_formats(spec))
    include_release_urls = source != "upcoming"
    cover_value = str(book.get("title_page_cover", "")).strip()
    cover_repo_path = resolve_cover_path(repo, spec_path, spec, cover_value)
    og_value = str(book.get("open_graph_image", "")).strip()
    og_repo_path = resolve_open_graph_path(repo, spec_path, spec, og_value)

    publication_date_raw = book.get("publication_date")
    publication_date = (
        _validate_publication_date(str(publication_date_raw)) if publication_date_raw else None
    )

    entry: dict = {
        "slug": slug,
        "source": source,
        "status": status,
        "title": str(book.get("title", "")).strip(),
        "subtitle": str(book.get("subtitle", "")).strip() or None,
        "description": str(book.get("description", "")).strip() or None,
        "authors": extract_author_names(book),
        "year": book.get("copyright_year"),
        "publicationDate": publication_date,
        "coverImage": raw_content_url(repo_slug, ref, cover_repo_path)
        if cover_repo_path and repo_slug
        else None,
        "coverImagePath": cover_repo_path,
        "openGraphImage": raw_content_url(repo_slug, ref, og_repo_path)
        if og_repo_path and repo_slug
        else None,
        "openGraphImagePath": og_repo_path,
        "bookDir": book_dir.relative_to(repo).as_posix(),
        "docx": format_entry(
            repo_slug,
            release_tag,
            "docx",
            stem,
            "docx" in enabled_formats,
            include_release_url=include_release_urls,
        ),
        "epub": format_entry(
            repo_slug,
            release_tag,
            "epub",
            stem,
            "epub" in enabled_formats,
            include_release_url=include_release_urls,
        ),
        "pdf": format_entry(
            repo_slug,
            release_tag,
            "pdf",
            stem,
            "pdf" in enabled_formats,
            include_release_url=include_release_urls,
        ),
    }
    if slug_aliases:
        entry["slugAliases"] = slug_aliases
    if companion_of:
        entry["companionOf"] = companion_of
    if companion_books:
        entry["companionBooks"] = companion_books
    return entry
