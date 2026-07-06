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
    "u.s. bureau of labor statistics",
    "u.s. department of defense",
    "u.s. securities and exchange commission",
    "centers for medicare & medicaid services",
    "national aeronautics and space administration",
    "national institute of standards and technology",
    "board of governors of the federal reserve system",
    "international organization for standardization",
    "institute of medicine",
    "federal aviation administration",
    "iso",
    "nasa",
    "noaa",
    "nist",
)

_CITATION_YEAR_RE = re.compile(r"\b(1[0-9]{3}|20[0-9]{2})\s*\.?\s*$")
_PUBLISHER_RE = re.compile(
    r"(?:New York|Chicago|London|Washington(?:,?\s*D\.?C\.?)?|Cambridge|Oxford|Princeton|"
    r"New Haven|Boston|Berkeley|Los Angeles|Philadelphia|Toronto|Paris|Berlin):\s*([^,.\n]+)",
    re.IGNORECASE,
)
_ITALIC_RE = re.compile(r"\*([^*]+)\*")
_FIRST_LINE_RE = re.compile(r"^-\s*", re.MULTILINE)

_SOURCE_KIND_BY_TYPE = {
    "book": "book",
    "article": "article",
}


def strip_markdown_italics(text: str) -> str:
    """Remove ``*italic*`` markers from display fields."""
    return _ITALIC_RE.sub(r"\1", text).strip()


def split_display_name(name: str) -> tuple[str, str]:
    """Split ``Author — Title`` (or hyphen variants) into author and title parts."""
    text = strip_markdown_italics(name.strip())
    for sep in _NAME_SEPARATORS:
        if sep in text:
            author, title = text.split(sep, 1)
            return author.strip(), title.strip()
    return text, ""


def normalize_display_name(author: str, title: str) -> str:
    """Return ``Author — Title`` with stripped italics."""
    author = strip_markdown_italics(author.strip())
    title = strip_markdown_italics(title.strip())
    if author and title:
        return f"{author} — {title}"
    return author or title


def _first_bibliography_line(text: str) -> str:
    line = text.strip().splitlines()[0] if text.strip() else ""
    return _FIRST_LINE_RE.sub("", line).strip()


def _extract_work_title_from_fragment(work_fragment: str) -> str:
    frag = work_fragment.strip()
    if frag.startswith('"'):
        m = re.match(r'^"([^"]+)"', frag)
        return m.group(1).strip() if m else frag.strip('"')
    if frag.startswith("*"):
        m = re.match(r"^\*([^*]+)\*", frag)
        return m.group(1).strip() if m else strip_markdown_italics(frag)
    return ""


def _institutional_org_name(author: str) -> str:
    """Return the institutional org portion of an author string when recognized."""
    low = author.lower()
    for prefix in sorted(_INSTITUTIONAL_PREFIXES, key=len, reverse=True):
        if not low.startswith(prefix):
            continue
        end = len(prefix)
        rest = author[end:]
        if rest.startswith("&"):
            dot = author.find(". ", end)
            if dot != -1:
                return author[:dot].strip()
        if rest.startswith(","):
            comma_end = rest.find(". ")
            if comma_end != -1:
                return author[: end + comma_end].strip()
        return author[:end].strip()
    return author


def _parse_institutional_line(first: str) -> tuple[str, str] | None:
    """Split ``Org. Title`` when the line begins with a known institutional prefix."""
    low = first.lower()
    for prefix in sorted(_INSTITUTIONAL_PREFIXES, key=len, reverse=True):
        if not low.startswith(prefix):
            continue
        dot = first.find(". ", len(prefix))
        if dot == -1:
            continue
        org = first[:dot].strip()
        title = first[dot + 2 :].strip().rstrip(".")
        title = re.sub(r"\s+https?://\S+$", "", title).strip()
        title = re.sub(r",\s*\d{4}(?:\u2013\d{4})?\.\s*$", "", title).strip()
        return org, title
    return None


def _is_institutional_author(author: str) -> bool:
    low = author.lower()
    return any(p in low for p in _INSTITUTIONAL_PREFIXES)


def parse_bibliography_author_title(line: str) -> tuple[str, str]:
    """
    Parse Chicago list-entry first line into (author, title).

    Supports ``Author. *Title*``, ``Author. "Article."``, ``Org. ID, *Title*``,
    and institutional ``Org. Program Title`` fallbacks.
    """
    first = _first_bibliography_line(line)
    if not first:
        return "", ""

    if '. "' in first:
        author, rest = first.rsplit('. "', 1)
        return author.strip(), _extract_work_title_from_fragment('"' + rest)

    if ". *" in first:
        author, rest = first.rsplit(". *", 1)
        return author.strip(), _extract_work_title_from_fragment("*" + rest)

    if ", *" in first:
        author, rest = first.rsplit(", *", 1)
        org = _institutional_org_name(author.strip())
        title = _extract_work_title_from_fragment("*" + rest)
        return org, title

    institutional = _parse_institutional_line(first)
    if institutional:
        return institutional

    return strip_markdown_italics(first), ""


def creator_slug_from_name(name: str) -> str:
    """Thinker slug: firstname-lastname or organization slug (not source slug prefix)."""
    return slugify_heading(strip_markdown_italics(name))


def infer_source_kind(entry_type: str, author: str, title: str, *, citation: str = "") -> str:
    typ = entry_type.strip().lower()
    if typ in _SOURCE_KIND_BY_TYPE:
        base = _SOURCE_KIND_BY_TYPE[typ]
    else:
        base = "book"
    author_l = author.lower()
    combined = f"{author_l} {title.lower()} {citation.lower()}"
    if "world bank" in author_l:
        return "report"
    if any(combined.startswith(p) or p in author_l for p in _INSTITUTIONAL_PREFIXES):
        if "report" in title.lower() or "annual" in combined:
            return "report"
        if "standard" in title.lower() or "dod-std" in combined or author_l.startswith("iso"):
            return "standard"
        if "dataset" in title.lower() or "data set" in title.lower():
            return "dataset"
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


def _resolve_author_title(
    rec: dict,
    *,
    overwrite: bool,
) -> tuple[str, str, str]:
    """Return (author, title, display_name) for a source record."""
    name = strip_markdown_italics(str(rec.get("name", "")).strip())
    summary = str(rec.get("summary", "")).strip()
    citation = str(rec.get("citation", "")).strip() or summary

    work_title = rec.get("workTitle")
    if isinstance(work_title, str) and work_title.strip():
        title = strip_markdown_italics(work_title.strip())
    else:
        title = ""

    author, parsed_title = split_display_name(name)
    if not title:
        title = parsed_title

    if not title or (author and title == author):
        bib_author, bib_title = parse_bibliography_author_title(citation or summary)
        if bib_title:
            if not title or name.startswith("*"):
                title = bib_title
            if not author or name.startswith("*") or author == name:
                author = bib_author or author

    if not author:
        author, _ = split_display_name(name)

    if _is_institutional_author(author):
        author = _institutional_org_name(author)

    display_name = normalize_display_name(author, title) if title else name
    if title and author and overwrite:
        display_name = normalize_display_name(author, title)

    return author, title, display_name


def enrich_source_record(rec: dict, *, overwrite: bool = False) -> dict:
    """
    Return a copy of *rec* with v1.5 optional fields filled when missing.

    When *overwrite* is false, only adds fields that are absent or empty.
    """
    out = dict(rec)
    summary = str(out.get("summary", "")).strip()
    entry_type = str(out.get("type", "book")).strip() or "book"

    author, title, display_name = _resolve_author_title(out, overwrite=overwrite)

    def _set(key: str, value: object) -> None:
        if value is None or value == "" or value == []:
            return
        if not overwrite and out.get(key) not in (None, "", []):
            return
        out[key] = value

    if display_name and (overwrite or not out.get("name") or "*" in str(out.get("name", ""))):
        _set("name", display_name)

    _set("title", title)
    if author:
        clean_author = strip_markdown_italics(author)
        _set("creatorNames", [clean_author])
        if overwrite or not out.get("creatorSlugs"):
            _set("creatorSlugs", [creator_slug_from_name(clean_author)])

    citation = str(out.get("citation", "")).strip() or summary
    _set("citation", citation)

    _set(
        "sourceKind",
        infer_source_kind(entry_type, author, title or display_name, citation=citation),
    )

    if citation:
        _set("year", parse_year_from_citation(citation))
        _set("publisher", parse_publisher_from_citation(citation))

    if author and _is_institutional_author(author):
        _set("institution", _institutional_org_name(author))

    out.pop("workTitle", None)
    return out
