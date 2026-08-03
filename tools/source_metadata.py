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

_THINKER_ROLE_SUFFIX_RE = re.compile(r",\s*(ed\.?|eds\.?|editor|editors)\s*$", re.I)
_ET_AL_RE = re.compile(r"\bet\s+al\.?\b", re.I)
_GEN_SUFFIX_RE = re.compile(r"^(Jr\.?|Sr\.?|III|IV|2nd|3rd)$", re.I)


def strip_thinker_role_suffix(name: str) -> str:
    return _THINKER_ROLE_SUFFIX_RE.sub("", name.strip()).strip()


def is_generational_suffix(token: str) -> bool:
    return bool(_GEN_SUFFIX_RE.match(token.strip()))


def format_first_last_author(last: str, first_parts: list[str]) -> str:
    """Build ``First … Last [Jr.]`` from bibliographic fragments."""
    suffix_tokens: list[str] = []
    core = list(first_parts)
    while core and is_generational_suffix(core[-1]):
        suffix_tokens.insert(0, core.pop())
    first = " ".join(core).strip()
    suffix = ""
    if suffix_tokens:
        token = suffix_tokens[-1].rstrip(".")
        suffix = f" {token}." if token.lower() in {"jr", "sr"} else f" {suffix_tokens[-1]}"
    return f"{first} {last}{suffix}".strip()


def parse_bibliographic_author_list(name: str) -> list[str]:
    """Parse a bibliographic author list into First Last display names.

    Supports:
    - bibliographic ``Last, First, and First Last``
    - display-order ``First Last, First Last, and First Last``
    - display-order pair ``First Last and First Last``
    """
    clean = strip_thinker_role_suffix(name)
    if _ET_AL_RE.search(clean):
        clean = _ET_AL_RE.sub("", clean).strip().rstrip(",").strip()
    if not clean:
        return []

    # Display-order pair: "First Last and First Last" (no comma-and).
    if ", and " not in clean and clean.count(" and ") == 1:
        left, right = [p.strip() for p in clean.split(" and ", 1)]
        if len(left.split()) >= 2 and len(right.split()) >= 2:
            return [left, right]

    if ", and " in clean:
        head, tail = clean.rsplit(", and ", 1)
        tail_authors = [tail.strip()] if tail.strip() else []
    else:
        head = clean
        tail_authors = []
    parts = [p.strip() for p in head.split(",") if p.strip()]
    if len(parts) < 2:
        return [clean] if clean else []

    # Already display-order segments ("Betsy Beyer", "Chris Jones", ...).
    candidate = parts + tail_authors
    if all(len(p.split()) >= 2 for p in candidate):
        return candidate

    first_parts = [parts[1]]
    idx = 2
    while idx < len(parts) and is_generational_suffix(parts[idx]):
        first_parts.append(parts[idx])
        idx += 1
    authors = [format_first_last_author(parts[0], first_parts)]
    while idx < len(parts):
        authors.append(parts[idx])
        idx += 1
    authors.extend(tail_authors)
    return [a for a in authors if a]


def is_multi_person_thinker_name(name: str) -> bool:
    """True when a thinker display name lists multiple creators."""
    clean = strip_thinker_role_suffix(name)
    if not clean:
        return False
    if _ET_AL_RE.search(clean):
        return True
    if ", and " in clean:
        return True
    if clean.count(" and ") >= 2:
        return True
    # Display-order pair: "First Last and First Last"
    if clean.count(" and ") == 1 and ", and " not in clean:
        left, right = [p.strip() for p in clean.split(" and ", 1)]
        if len(left.split()) >= 2 and len(right.split()) >= 2:
            return True
    head = clean.split(", and ", 1)[0]
    parts = [p.strip() for p in head.split(",") if p.strip()]
    while len(parts) > 2 and is_generational_suffix(parts[-1]):
        parts = parts[:-1]
    if len(parts) >= 4:
        return True
    if len(parts) == 3 and not is_generational_suffix(parts[2]) and " " in parts[2]:
        return True
    return False


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
    # Strip italics first so ``*Washington: A Life*`` is not parsed as Place: Publisher.
    # Prefer the last Place: Publisher match — titles may contain place names
    # (e.g. ``Washington: A Life`` before ``New York: Penguin Press``).
    matches = list(_PUBLISHER_RE.finditer(strip_markdown_italics(citation)))
    if not matches:
        return None
    publisher = matches[-1].group(1).strip().rstrip("*").strip()
    return publisher or None


def _resolve_author_title(
    rec: dict,
    *,
    overwrite: bool,
) -> tuple[str, str, str]:
    """Return (author, title, display_name) for a source record."""
    raw_name = str(rec.get("name", "")).strip()
    name = strip_markdown_italics(raw_name)
    summary = str(rec.get("summary", "")).strip()
    citation = str(rec.get("citation", "")).strip() or summary

    work_title = rec.get("workTitle")
    if isinstance(work_title, str) and work_title.strip():
        title = strip_markdown_italics(work_title.strip())
    else:
        title = ""

    existing_title = strip_markdown_italics(str(rec.get("title", "")).strip())
    if existing_title and " — " not in existing_title and " – " not in existing_title:
        if not title or overwrite:
            title = existing_title

    author, parsed_title = split_display_name(name)
    if not title:
        title = parsed_title

    # Collapse duplicated ``Title — Title`` residue from a bad display name.
    if title and (" — " in title or " – " in title):
        title = title.split(" — ", 1)[0].split(" – ", 1)[0].strip()

    needs_bib = (
        not title
        or (author and title == author)
        or raw_name.startswith("*")
        or " — " in parsed_title
        or " – " in parsed_title
    )
    if needs_bib:
        bib_author, bib_title = parse_bibliography_author_title(citation or summary)
        if bib_title:
            if (
                not title
                or raw_name.startswith("*")
                or " — " in parsed_title
                or " – " in parsed_title
            ):
                title = bib_title
            if not author or raw_name.startswith("*") or author == name:
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
    Markdown italics are always stripped from ``summary``, ``citation``, and
    display ``name`` (bibliography markers must not reach the site as plain text).
    Author/title parsing still runs on the raw markdown forms first.
    """
    out = dict(rec)
    entry_type = str(out.get("type", "book")).strip() or "book"

    # Resolve while summary/citation may still contain ``*Title*`` markers.
    author, title, display_name = _resolve_author_title(out, overwrite=overwrite)

    def _set(key: str, value: object) -> None:
        if value is None or value == "" or value == []:
            return
        if not overwrite and out.get(key) not in (None, "", []):
            return
        out[key] = value

    existing_name = str(out.get("name", ""))
    if display_name and (overwrite or not existing_name.strip() or "*" in existing_name):
        # Bypass ``_set`` so markdown-contaminated names are always cleaned.
        out["name"] = display_name

    _set("title", title)
    if author:
        clean_author = strip_markdown_italics(author)
        _set("creatorNames", [clean_author])
        if overwrite or not out.get("creatorSlugs"):
            _set("creatorSlugs", [creator_slug_from_name(clean_author)])

    raw_summary = str(out.get("summary", "")).strip()
    summary = strip_markdown_italics(raw_summary)
    if summary:
        out["summary"] = summary

    citation = strip_markdown_italics(str(out.get("citation", "")).strip() or raw_summary)
    if citation:
        out["citation"] = citation

    _set(
        "sourceKind",
        infer_source_kind(entry_type, author, title or display_name, citation=citation),
    )

    if citation:
        _set("year", parse_year_from_citation(citation))
        parsed_publisher = parse_publisher_from_citation(citation)
        if "*" in str(out.get("publisher", "")):
            if parsed_publisher:
                out["publisher"] = parsed_publisher
            else:
                out.pop("publisher", None)
        else:
            _set("publisher", parsed_publisher)

    if author and _is_institutional_author(author):
        institution = _institutional_org_name(author)
        if "*" in str(out.get("institution", "")):
            if institution:
                out["institution"] = institution
        else:
            _set("institution", institution)

    out.pop("workTitle", None)
    return out
