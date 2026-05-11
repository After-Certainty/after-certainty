#!/usr/bin/env python3
"""
Generate an aggregate books manifest for publishable and upcoming books.
"""

from __future__ import annotations

import argparse
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

from book_output_stem import stem_for_book_dir
from book_specs import (
    discover_book_spec_paths,
    discover_upcoming_spec_paths,
    load_book_spec,
    load_upcoming_spec,
    spec_formats,
)


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
        return explicit.strip().rstrip("/").removesuffix(".git")
    result = subprocess.run(
        ["git", "-C", str(repo), "remote", "get-url", "origin"],
        capture_output=True,
        text=True,
        check=False,
    )
    raw = result.stdout.strip()
    if result.returncode != 0 or not raw:
        return ""
    if raw.startswith("git@github.com:"):
        raw = raw.replace("git@github.com:", "", 1)
    elif raw.startswith("https://github.com/"):
        raw = raw.replace("https://github.com/", "", 1)
    raw = raw.rstrip("/").removesuffix(".git")
    return raw


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
    title_md = (book_dir / out_rel).resolve()
    return title_md.parent


def resolve_cover_path(repo: Path, spec_path: Path, spec: dict, cover_value: str) -> str | None:
    """
    Resolve `book.title_page_cover` to a repo-relative path for raw.githubusercontent URLs.

    Paths like `../BookCover.png` are authored relative to the generated title page
    (`frontmatter.generate.title_page.output`), not relative to `book.yml`. Pandoc
    resolves images from that markdown file's directory; match that here so URLs
    point at the real asset under the book folder.
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
            candidate = (base / cover_value).resolve()
            if candidate in seen:
                continue
            seen.add(candidate)
            if candidate.is_file():
                rel = to_repo_relative(repo, candidate)
                if rel:
                    return rel

    # No `title_page_cover`, or path did not resolve: discover common filenames (EPUB cover convention).
    for name in ("BookCover.png", "book_cover.png", "book-cover.png"):
        candidate = (book_dir / name).resolve()
        if candidate.is_file():
            rel = to_repo_relative(repo, candidate)
            if rel:
                return rel
    return None


def raw_content_url(repo_slug: str, ref: str, repo_rel_path: str) -> str:
    return f"https://raw.githubusercontent.com/{repo_slug}/{ref}/{repo_rel_path}"


def release_asset_url(repo_slug: str, release_tag: str, filename: str) -> str:
    return f"https://github.com/{repo_slug}/releases/download/{release_tag}/{filename}"


def format_entry(repo_slug: str, release_tag: str, fmt: str, stem: str, enabled: bool) -> dict:
    filename = f"{stem}.{fmt}"
    return {
        "enabled": enabled,
        "file": filename,
        "url": release_asset_url(repo_slug, release_tag, filename) if enabled and repo_slug else None,
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
    cover_value = str(book.get("title_page_cover", "")).strip()
    cover_repo_path = resolve_cover_path(repo, spec_path, spec, cover_value)

    entry: dict = {
        "slug": slug,
        "source": source,
        "status": status,
        "title": str(book.get("title", "")).strip(),
        "subtitle": str(book.get("subtitle", "")).strip() or None,
        "description": str(book.get("description", "")).strip() or None,
        "authors": extract_author_names(book),
        "year": book.get("copyright_year"),
        "coverImage": raw_content_url(repo_slug, ref, cover_repo_path) if cover_repo_path and repo_slug else None,
        "coverImagePath": cover_repo_path,
        "bookDir": book_dir.relative_to(repo).as_posix(),
        "docx": format_entry(repo_slug, release_tag, "docx", stem, "docx" in enabled_formats),
        "epub": format_entry(repo_slug, release_tag, "epub", stem, "epub" in enabled_formats),
        "pdf": format_entry(repo_slug, release_tag, "pdf", stem, "pdf" in enabled_formats),
    }
    if slug_aliases:
        entry["slugAliases"] = slug_aliases
    if companion_of:
        entry["companionOf"] = companion_of
    if companion_books:
        entry["companionBooks"] = companion_books
    return entry


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument("--out", required=True, help="Output JSON path")
    parser.add_argument(
        "--github-repository",
        default="",
        help="GitHub repository slug (owner/repo). If omitted, derive from git origin.",
    )
    parser.add_argument("--github-ref", default="main", help="Git ref used for raw content URLs")
    parser.add_argument("--release-tag", default="latest", help="GitHub release tag for export assets")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    repo_slug = resolve_repo_slug(repo, args.github_repository)

    books: list[dict] = []
    for spec_path in discover_book_spec_paths(repo):
        spec = load_book_spec(spec_path)
        books.append(
            build_book_entry(
                repo=repo,
                spec_path=spec_path,
                spec=spec,
                repo_slug=repo_slug,
                ref=args.github_ref,
                release_tag=args.release_tag,
                source="books",
                status="published",
            )
        )

    for spec_path in discover_upcoming_spec_paths(repo):
        spec = load_upcoming_spec(spec_path)
        upcoming = spec.get("upcoming", {})
        books.append(
            build_book_entry(
                repo=repo,
                spec_path=spec_path,
                spec=spec,
                repo_slug=repo_slug,
                ref=args.github_ref,
                release_tag=args.release_tag,
                source="upcoming",
                status=str(upcoming.get("status", "in_progress")).strip() or "in_progress",
            )
        )

    books.sort(key=lambda item: (item["slug"], item["source"]))
    payload = {
        "manifestVersion": 1,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "repository": repo_slug or None,
        "ref": args.github_ref,
        "releaseTag": args.release_tag,
        "books": books,
    }

    out_path = Path(args.out).resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(str(out_path))


if __name__ == "__main__":
    main()
