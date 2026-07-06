"""
Shared helpers for semantic source metadata (v1.5 backfill and draft promotion).
"""

from __future__ import annotations

import re

from semantic_extract import slugify_heading

_NAME_SEPARATORS = (" — ", " – ", " - ")

_INSTITUTIONAL_PREFIXES = (
    "world bank",
    "u.s. census bureau",
    "u.s. department of defense",
    "international organization for standardization",
    "iso",
    "nasa",
    "noaa",
)

_CITATION_YEAR_RE = re.compile(r"\b(1[0-9]{3}|20[0-9]{2})\s*\.?\s*$")
_PUBLISHER_RE = re.compile(
    r"(?:New York|Chicago|London|Washington(?:,?\s*D\.?C\.?)?|Cambridge|Oxford|Princeton|"
    r"New Haven|Boston|Berkeley|Los Angeles|Philadelphia|Toronto|Paris|Berlin):\s*([^,.\n]+)",
    re.IGNORECASE,
)

_SOURCE_KIND_BY_TYPE = {
    "book": "book",
    "article": "article",
}


def split_display_name(name: str) -> tuple[str, str]:
    """Split ``Author — Title`` (or hyphen variants) into author and title parts."""
    text = name.strip()
    for sep in _NAME_SEPARATORS:
        if sep in text:
            author, title = text.split(sep, 1)
            return author.strip(), title.strip()
    return text, ""


def creator_slug_from_name(name: str) -> str:
    """Thinker slug: firstname-lastname or organization slug (not source slug prefix)."""
    return slugify_heading(name)


def infer_source_kind(entry_type: str, author: str, title: str) -> str:
    typ = entry_type.strip().lower()
    if typ in _SOURCE_KIND_BY_TYPE:
        base = _SOURCE_KIND_BY_TYPE[typ]
    else:
        base = "book"
    author_l = author.lower()
    combined = f"{author_l} {title.lower()}"
    if "world bank" in author_l:
        return "report"
    if any(combined.startswith(p) or p in author_l for p in _INSTITUTIONAL_PREFIXES):
        if "report" in title.lower() or "annual" in combined:
            return "report"
        return "institutional_document"
    if "standard" in title.lower() or author_l.startswith("iso"):
        return "standard"
    if "dataset" in title.lower() or "data set" in title.lower():
        return "dataset"
    return base


def parse_year_from_citation(citation: str) -> int | None:
    matches = _CITATION_YEAR_RE.findall(citation.strip())
    if not matches:
        return None
    year = int(matches[-1])
    if 1000 <= year <= 2100:
        return year
    return None


def parse_publisher_from_citation(citation: str) -> str | None:
    match = _PUBLISHER_RE.search(citation)
    if not match:
        return None
    publisher = match.group(1).strip()
    return publisher or None


def enrich_source_record(rec: dict, *, overwrite: bool = False) -> dict:
    """
    Return a copy of *rec* with v1.5 optional fields filled when missing.

    When *overwrite* is false, only adds fields that are absent or empty.
    """
    out = dict(rec)
    name = str(out.get("name", "")).strip()
    summary = str(out.get("summary", "")).strip()
    entry_type = str(out.get("type", "book")).strip() or "book"

    author, parsed_title = split_display_name(name)
    work_title = out.get("workTitle")
    if isinstance(work_title, str) and work_title.strip():
        title = work_title.strip()
    else:
        title = parsed_title

    def _set(key: str, value: object) -> None:
        if value is None or value == "" or value == []:
            return
        if not overwrite and out.get(key) not in (None, "", []):
            return
        out[key] = value

    _set("title", title)
    if author:
        _set("creatorNames", [author])
        _set("creatorSlugs", [creator_slug_from_name(author)])

    citation = str(out.get("citation", "")).strip() or summary
    _set("citation", citation)

    _set("sourceKind", infer_source_kind(entry_type, author, title or name))

    if citation:
        _set("year", parse_year_from_citation(citation))
        _set("publisher", parse_publisher_from_citation(citation))

    if author and any(
        author.lower().startswith(p) or p in author.lower() for p in _INSTITUTIONAL_PREFIXES
    ):
        _set("institution", author)

    out.pop("workTitle", None)
    return out
