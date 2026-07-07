"""
Parse docs/series-guide.md for portfolio reading orders and related book slugs.

Used by generate_books_manifest.py to populate readingOrders and per-book relatedSlugs.
"""

from __future__ import annotations

import re
from pathlib import Path

from book_output_stem import stem_for_book_dir
from book_specs import discover_book_spec_paths, load_book_spec

BOOK_LINK_RE = re.compile(r"\]\(\.\./books/([^)]+)/index\.md\)")
NUMBERED_LIST_RE = re.compile(r"^\d+\.\s+\*\*")

_CLUSTER_HEADERS = frozenset(
    {
        "formation",
        "stabilization",
        "tension",
        "practice",
    }
)


def build_book_dir_to_slug(repo: Path) -> dict[str, str]:
    """Map repo-relative book directory paths to manifest slugs."""
    mapping: dict[str, str] = {}
    for spec_path in discover_book_spec_paths(repo):
        book_dir = spec_path.parent.resolve().relative_to(repo.resolve()).as_posix()
        spec = load_book_spec(spec_path)
        book = spec.get("book", {})
        slug = str(book.get("id", "")).strip() or stem_for_book_dir(book_dir, root=repo)
        mapping[book_dir] = slug
    return mapping


def _slug_from_link(path_segment: str, book_dir_to_slug: dict[str, str]) -> str | None:
    book_dir = f"books/{path_segment.strip('/')}"
    return book_dir_to_slug.get(book_dir)


def _slugs_from_text(text: str, book_dir_to_slug: dict[str, str]) -> list[str]:
    slugs: list[str] = []
    seen: set[str] = set()
    for match in BOOK_LINK_RE.finditer(text):
        slug = _slug_from_link(match.group(1), book_dir_to_slug)
        if slug and slug not in seen:
            seen.add(slug)
            slugs.append(slug)
    return slugs


def _section_body(lines: list[str], start: int) -> list[str]:
    body: list[str] = []
    for line in lines[start:]:
        if line.startswith("## ") or line.strip() == "---":
            break
        body.append(line)
    return body


def _parse_numbered_order(body: list[str], book_dir_to_slug: dict[str, str]) -> list[str]:
    order: list[str] = []
    seen: set[str] = set()
    for line in body:
        if not NUMBERED_LIST_RE.match(line):
            continue
        for slug in _slugs_from_text(line, book_dir_to_slug):
            if slug not in seen:
                seen.add(slug)
                order.append(slug)
    return order


def _cluster_slugs_from_section(body: list[str], book_dir_to_slug: dict[str, str]) -> list[str]:
    slugs: list[str] = []
    seen: set[str] = set()
    for line in body:
        if not line.startswith("### "):
            continue
        for slug in _slugs_from_text(line, book_dir_to_slug):
            if slug not in seen:
                seen.add(slug)
                slugs.append(slug)
    return slugs


def parse_series_guide(
    repo: Path, guide_path: Path | None = None
) -> tuple[dict[str, list[str]], dict[str, list[str]]]:
    """
    Parse the series guide for reading orders and per-book related slugs.

    Returns:
        reading_orders: named ordered slug lists (e.g. core, trust)
        related_by_slug: slug -> related slugs (same cluster peers, deduped)
    """
    guide_path = guide_path or (repo / "docs" / "series-guide.md")
    text = guide_path.read_text(encoding="utf-8")
    lines = text.splitlines()
    book_dir_to_slug = build_book_dir_to_slug(repo)

    reading_orders: dict[str, list[str]] = {}
    related_by_slug: dict[str, set[str]] = {}

    for index, line in enumerate(lines):
        header = line.removeprefix("## ").strip().lower()

        if header == "suggested reading order":
            order = _parse_numbered_order(_section_body(lines, index + 1), book_dir_to_slug)
            if order:
                reading_orders["core"] = order

        if header == "trust cluster":
            for sub_index in range(index + 1, len(lines)):
                sub_line = lines[sub_index]
                if sub_line.startswith("## "):
                    break
                if sub_line.strip().lower() == "### trust cluster reading order":
                    order = _parse_numbered_order(
                        _section_body(lines, sub_index + 1),
                        book_dir_to_slug,
                    )
                    if order:
                        reading_orders["trust"] = order
                    break

        if header in _CLUSTER_HEADERS:
            cluster_slugs = _cluster_slugs_from_section(
                _section_body(lines, index + 1), book_dir_to_slug
            )
            for slug in cluster_slugs:
                peers = [peer for peer in cluster_slugs if peer != slug]
                related_by_slug.setdefault(slug, set()).update(peers)

    for order in reading_orders.values():
        for slug in order:
            peers = [peer for peer in order if peer != slug]
            related_by_slug.setdefault(slug, set()).update(peers)

    portfolio_slugs = _slugs_from_text(
        _extract_portfolio_table(text),
        book_dir_to_slug,
    )
    for slug in portfolio_slugs:
        peers = [peer for peer in portfolio_slugs if peer != slug]
        related_by_slug.setdefault(slug, set()).update(peers)

    related_sorted = {slug: sorted(peers) for slug, peers in sorted(related_by_slug.items())}
    return reading_orders, related_sorted


def _extract_portfolio_table(text: str) -> str:
    marker = "## Related books in the portfolio"
    start = text.find(marker)
    if start < 0:
        return ""
    section = text[start:]
    end = section.find("\n---\n")
    if end >= 0:
        section = section[:end]
    return section


def enrich_book_entries(
    books: list[dict],
    reading_orders: dict[str, list[str]],
    related_by_slug: dict[str, list[str]],
) -> None:
    """Attach readingOrder index and relatedSlugs to manifest book entries in place."""
    core_order = reading_orders.get("core", [])
    core_index = {slug: position + 1 for position, slug in enumerate(core_order)}

    for entry in books:
        slug = str(entry.get("slug", "")).strip()
        if not slug:
            continue
        if slug in core_index:
            entry["readingOrder"] = core_index[slug]
        related = related_by_slug.get(slug)
        if related:
            entry["relatedSlugs"] = related
