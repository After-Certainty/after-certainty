"""
Parse manuscript bibliography markdown into draft source rows.

Supported styles:

- **list** — ``- Author. *Title*`` / ``- Author. "Article."`` (when-others / how-meaning)
- **pandoc_div** — ``::: {custom-style="Bibliography"}`` … ``:::`` blocks
- **plain_chicago** — blank-line-separated Chicago paragraphs under bibliography headings

``parse_bibliography`` picks the richest successful style for a file.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

from semantic_extract import slugify_heading
from source_metadata import parse_bibliography_author_title

_PANDOC_DIV_RE = re.compile(
    r"::: \{"  # opening fence
    r"[^}]*custom-style\s*=\s*[\"']Bibliography[\"']"  # Bibliography style
    r"[^}]*\}\s*\n"  # close attr
    r"(.*?)"  # body
    r"\n:::",
    re.IGNORECASE | re.DOTALL,
)

_HEADING_RE = re.compile(r"^#{1,6}\s+")
_BULLET_RE = re.compile(r"^-\s+")
_FENCE_RE = re.compile(r"^:{3,}")
_NEWPAGE_RE = re.compile(r"^\\newpage\b")
_HR_RE = re.compile(r"^-{3,}\s*$")

_STYLE_PRIORITY = ("list", "pandoc_div", "plain_chicago")


def normalize_typography(text: str) -> str:
    """Normalize smart quotes/dashes so Chicago split heuristics match."""
    return (
        text.replace("\u201c", '"')
        .replace("\u201d", '"')
        .replace("\u2018", "'")
        .replace("\u2019", "'")
        .replace("\u2013", "-")
        .replace("\u2014", "-")
    )


def _split_list_blocks(text: str) -> list[str]:
    """Split into one string per ``-``-started entry."""
    lines = text.splitlines()
    blocks: list[str] = []
    current: list[str] = []
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("- "):
            if current:
                blocks.append("\n".join(current))
            current = [line]
        elif current:
            current.append(line)
    if current:
        blocks.append("\n".join(current))
    return blocks


def _first_line(block: str) -> str:
    return block.splitlines()[0].strip() if block.strip() else ""


def _author_and_title_fragment(first: str) -> tuple[str, str, str]:
    """
    Return (author, work_fragment, entry_kind).

    work_fragment begins with ``"`` (article) or ``*`` (book/chapter in italics)
    or empty if no recognised split.
    """
    first = normalize_typography(first)
    first = re.sub(r"^-\s*", "", first.strip())
    if '. "' in first:
        author, rest = first.rsplit('. "', 1)
        return author.strip(), '"' + rest, "article"
    if ". *" in first:
        author, rest = first.rsplit(". *", 1)
        return author.strip(), "*" + rest, "book"
    if ", *" in first:
        author, rest = first.rsplit(", *", 1)
        return author.strip(), "*" + rest, "book"
    author, title = parse_bibliography_author_title(first)
    if author and title:
        return author, f"*{title}*", "book"
    return first.strip(), "", "unknown"


def _extract_work_title(work_fragment: str) -> str:
    frag = normalize_typography(work_fragment).strip()
    if frag.startswith('"'):
        m = re.match(r'^"([^"]+)"', frag)
        title = m.group(1).strip() if m else frag.strip('"')
        return title.rstrip(".")
    if frag.startswith("*"):
        m = re.match(r"^\*([^*]+)\*", frag)
        return m.group(1).strip() if m else frag.strip("*")
    return ""


def _infer_type(work_title: str, block: str, entry_kind: str) -> str:
    if entry_kind == "article":
        return "article"
    low = block.lower()
    if "journal" in low or re.search(r"\*\s*[^*]+\*\s*\(\s*\d{4}\s*\)", block):
        return "article"
    return "book"


def display_author_name(author_line: str) -> str:
    """Turn ``Last, First`` into ``First Last`` when a single comma pair; else unchanged."""
    s = author_line.strip().rstrip(".")
    if " and " in s or s.count(",") != 1:
        return s
    last, first = [p.strip() for p in s.split(",", 1)]
    if first and last:
        return f"{first} {last}"
    return s


def make_source_slug(author: str, work_title: str, used: set[str]) -> str:
    base = slugify_heading(f"{author} {work_title}")
    if not base:
        base = slugify_heading(author) or "source"
    slug = base[:96].strip("-")
    original = slug
    n = 2
    while slug in used:
        slug = f"{original}-{n}"
        n += 1
    used.add(slug)
    return slug


def _summary(block: str, limit: int = 700) -> str:
    text = " ".join(normalize_typography(block).split())
    # Drop leading bullet marker from summary
    text = re.sub(r"^-\s*", "", text)
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + "…"


def _row_from_block(block: str, used_slugs: set[str]) -> dict | None:
    first = _first_line(block)
    if not first:
        return None
    # Prefer first line; if title missing (common for wrapped list entries),
    # fall back to the whole block (continuation lines hold *Title*).
    author, frag, kind = _author_and_title_fragment(first)
    work_title = _extract_work_title(frag)
    if not work_title:
        compact = " ".join(normalize_typography(block).split())
        compact = re.sub(r"^-\s*", "", compact)
        author2, frag2, kind2 = _author_and_title_fragment(compact)
        work_title2 = _extract_work_title(frag2)
        if work_title2:
            author, frag, kind = author2, frag2, kind2
            work_title = work_title2
    if not author:
        return None
    name = display_author_name(author)
    # Strip trailing editorial role markers from display author when present.
    name = re.sub(r",?\s*eds?\.?\s*$", "", name, flags=re.I).strip().rstrip(",")
    slug = make_source_slug(author, work_title, used_slugs)
    typ = _infer_type(work_title, block, kind)
    return {
        "slug": slug,
        "name": name,
        "author": name,
        "workTitle": work_title,
        "type": typ,
        "summary": _summary(block),
        "concepts": [],
        "patterns": [],
    }


def parse_list_bibliography(text: str) -> list[dict]:
    """Parse when-others / how-meaning style list bibliography."""
    out: list[dict] = []
    used_slugs: set[str] = set()
    for block in _split_list_blocks(text):
        row = _row_from_block(block, used_slugs)
        if row:
            out.append(row)
    return out


def parse_pandoc_div_bibliography(text: str) -> list[dict]:
    """Parse Pandoc ``custom-style=\"Bibliography\"`` divs into rows."""
    text = normalize_typography(text)
    out: list[dict] = []
    used_slugs: set[str] = set()
    for match in _PANDOC_DIV_RE.finditer(text):
        body = match.group(1).strip()
        if not body:
            continue
        row = _row_from_block(body, used_slugs)
        if row:
            out.append(row)
    return out


def _is_skippable_plain_line(line: str) -> bool:
    stripped = line.strip()
    if not stripped:
        return True
    if _HEADING_RE.match(stripped):
        return True
    if _FENCE_RE.match(stripped):
        return True
    if _NEWPAGE_RE.match(stripped):
        return True
    if _HR_RE.match(stripped):
        return True
    if stripped.startswith("Sources cited") or stripped.startswith("<!--"):
        return True
    return False


def parse_plain_chicago_bibliography(text: str) -> list[dict]:
    """
    Parse blank-line-separated Chicago paragraphs (chapter headings allowed).

    Each non-heading paragraph that looks like a citation becomes one entry.
    """
    text = normalize_typography(text)
    paragraphs: list[str] = []
    current: list[str] = []
    for line in text.splitlines():
        if _is_skippable_plain_line(line):
            if current:
                paragraphs.append("\n".join(current))
                current = []
            continue
        # List bullets belong to list style; skip here to avoid double-count in union paths
        if _BULLET_RE.match(line.strip()):
            if current:
                paragraphs.append("\n".join(current))
                current = []
            continue
        current.append(line.rstrip())
    if current:
        paragraphs.append("\n".join(current))

    out: list[dict] = []
    used_slugs: set[str] = set()
    for para in paragraphs:
        compact = " ".join(para.split())
        if len(compact) < 12:
            continue
        # Require an author/title cue: period after author, or italic/quoted title
        if not (
            ". " in compact
            or "*" in compact
            or '"' in compact
            or ". *" in compact
            or '. "' in compact
        ):
            continue
        row = _row_from_block(compact, used_slugs)
        if row and (row.get("workTitle") or len(row.get("summary", "")) > 20):
            out.append(row)
    return out


@dataclass
class BibliographyParseResult:
    style: str
    rows: list[dict] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    style_counts: dict[str, int] = field(default_factory=dict)


def detect_bibliography_styles(text: str) -> dict[str, int]:
    """Return entry counts for each parser style (0 if none)."""
    return {
        "list": len(parse_list_bibliography(text)),
        "pandoc_div": len(parse_pandoc_div_bibliography(text)),
        "plain_chicago": len(parse_plain_chicago_bibliography(text)),
    }


def parse_bibliography(text: str) -> BibliographyParseResult:
    """
    Parse a bibliography file using the richest successful style.

    Preference on ties: list > pandoc_div > plain_chicago.
    """
    counts = detect_bibliography_styles(text)
    warnings: list[str] = []
    best_style = ""
    best_count = -1
    for style in _STYLE_PRIORITY:
        n = counts.get(style, 0)
        if n > best_count:
            best_count = n
            best_style = style

    if best_count <= 0:
        warnings.append("no bibliography entries found for any supported style")
        return BibliographyParseResult(
            style="none",
            rows=[],
            warnings=warnings,
            style_counts=counts,
        )

    parsers = {
        "list": parse_list_bibliography,
        "pandoc_div": parse_pandoc_div_bibliography,
        "plain_chicago": parse_plain_chicago_bibliography,
    }
    rows = parsers[best_style](text)

    secondary = [(s, n) for s, n in counts.items() if s != best_style and n > 0]
    if secondary:
        warnings.append(
            "other styles also matched: "
            + ", ".join(f"{s}={n}" for s, n in sorted(secondary, key=lambda x: -x[1]))
        )

    # Weak-parse heuristic: many non-empty content lines but few rows
    content_lines = [
        ln
        for ln in text.splitlines()
        if ln.strip()
        and not _HEADING_RE.match(ln.strip())
        and not _FENCE_RE.match(ln.strip())
        and not _NEWPAGE_RE.match(ln.strip())
    ]
    if content_lines and best_count < max(3, len(content_lines) // 4):
        warnings.append(
            f"weak_parse: only {best_count} entries from ~{len(content_lines)} content lines"
        )

    return BibliographyParseResult(
        style=best_style,
        rows=rows,
        warnings=warnings,
        style_counts=counts,
    )
