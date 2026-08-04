"""Deterministic Markdown → spoken text + sentence/line segments (extractor v1)."""

from __future__ import annotations

import re
from dataclasses import dataclass

EXTRACTOR_VERSION = 1

_FRONT_MATTER = re.compile(r"^---\r?\n.*?\r?\n---\r?\n", re.DOTALL)
_IMAGE = re.compile(r"!\[([^\]]*)\]\([^)]+\)(?:\{[^}]*\})?")
_LINK = re.compile(r"\[([^\]]+)\]\([^)]+\)")
_FOOTNOTE_REF = re.compile(r"\[\^[^\]]*\]")
_FOOTNOTE_DEF = re.compile(r"^\[\^[^\]]*\]:.*$", re.MULTILINE)
_ATX_HEADING = re.compile(r"^(#{1,6})\s+(.*)$")
_EMPHASIS = re.compile(r"(\*\*|__)(.*?)\1")
_EMPHASIS_SINGLE = re.compile(r"(\*|_)([^*_\n]+?)\1")
_HTML = re.compile(r"</?[^>]+>")
_PANDOc_ATTR = re.compile(r"\{[^}\n]*\}")
_FENCED_DIV = re.compile(r"^:::\s*(?:\{[^}]*\})?\s*$", re.MULTILINE)
_NEWPAGE = re.compile(r"^\\newpage\s*$", re.MULTILINE)
_TABLE_SEP = re.compile(r"^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$")
_TABLE_ROW = re.compile(r"^\|(.+)\|\s*$")
_SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+(?=[A-Z0-9\"“‘(])")


@dataclass(frozen=True)
class SpokenSegment:
    id: str
    text: str
    char_start: int
    char_end: int


@dataclass(frozen=True)
class SpokenDocument:
    spoken_text: str
    segments: tuple[SpokenSegment, ...]
    extractor_version: int = EXTRACTOR_VERSION


def extract_spoken_document(
    markdown: str,
    *,
    include_title: bool = True,
    include_footnotes: bool = False,
    strip_leading_h1: bool = True,
) -> SpokenDocument:
    """Return deterministic spoken text and segments for one manuscript unit."""
    text = markdown.replace("\r\n", "\n").replace("\r", "\n")
    text = _FRONT_MATTER.sub("", text)
    text = _FENCED_DIV.sub("", text)
    text = _NEWPAGE.sub("", text)

    if not include_footnotes:
        text = _FOOTNOTE_DEF.sub("", text)
        text = _FOOTNOTE_REF.sub("", text)

    lines_out: list[str] = []
    skipped_leading_h1 = False
    for raw_line in text.split("\n"):
        line = raw_line.rstrip()
        if not line.strip():
            lines_out.append("")
            continue

        if _TABLE_SEP.match(line.strip()):
            continue

        table = _TABLE_ROW.match(line.strip())
        if table:
            cells = [c.strip() for c in table.group(1).split("|")]
            cells = [c for c in cells if c]
            # Skip empty header rows like "| | |"
            if not cells:
                continue
            # Two-column Observer Patterns pattern tables: left then right.
            spoken_row = " ".join(_inline_to_speech(c) for c in cells).strip()
            if spoken_row:
                lines_out.append(spoken_row)
            continue

        heading = _ATX_HEADING.match(line)
        if heading:
            level = len(heading.group(1))
            title = _inline_to_speech(heading.group(2)).strip()
            if level == 1 and strip_leading_h1 and not skipped_leading_h1:
                skipped_leading_h1 = True
                if include_title and title:
                    lines_out.append(title)
                continue
            if include_title and title:
                lines_out.append(title)
            continue

        # Scene separators
        if re.fullmatch(r"(?:---|\*\*\*|___)\s*", line.strip()):
            continue

        spoken_line = _inline_to_speech(line).strip()
        if spoken_line:
            lines_out.append(spoken_line)

    # Collapse runs of blank lines to a single blank (stanza / paragraph break).
    collapsed: list[str] = []
    blank = False
    for line in lines_out:
        if not line.strip():
            if collapsed and not blank:
                collapsed.append("")
            blank = True
        else:
            collapsed.append(line)
            blank = False
    while collapsed and not collapsed[0].strip():
        collapsed.pop(0)
    while collapsed and not collapsed[-1].strip():
        collapsed.pop()

    spoken_text = "\n".join(collapsed).strip()
    segments = tuple(_segment_spoken_text(spoken_text))
    return SpokenDocument(spoken_text=spoken_text, segments=segments)


def _inline_to_speech(text: str) -> str:
    text = _IMAGE.sub(lambda m: "", text)  # omit images (pilot)
    text = _LINK.sub(r"\1", text)
    text = _EMPHASIS.sub(r"\2", text)
    text = _EMPHASIS_SINGLE.sub(r"\2", text)
    text = _HTML.sub("", text)
    text = _PANDOc_ATTR.sub("", text)
    text = text.replace("`", "")
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()


def _segment_spoken_text(spoken_text: str) -> list[SpokenSegment]:
    if not spoken_text:
        return []
    segments: list[SpokenSegment] = []
    # Paragraphs separated by blank lines.
    parts = re.split(r"\n\s*\n", spoken_text)
    cursor = 0
    idx = 1
    for part in parts:
        part = part.strip("\n")
        if not part.strip():
            continue
        # Locate part within spoken_text from cursor forward.
        found = spoken_text.find(part, cursor)
        if found < 0:
            found = cursor
        # Within a paragraph, prefer sentence splits; otherwise keep non-empty lines.
        if _SENTENCE_SPLIT.search(part) or re.search(r"[.!?]\s*$", part.strip()):
            pieces = _split_sentences(part)
        else:
            pieces = [ln.strip() for ln in part.split("\n") if ln.strip()]

        local = 0
        for piece in pieces:
            if not piece:
                continue
            rel = part.find(piece, local)
            if rel < 0:
                rel = local
            start = found + rel
            end = start + len(piece)
            segments.append(
                SpokenSegment(
                    id=f"s{idx:04d}",
                    text=piece,
                    char_start=start,
                    char_end=end,
                )
            )
            idx += 1
            local = rel + len(piece)
        cursor = found + len(part)
    return segments


def _split_sentences(paragraph: str) -> list[str]:
    # Keep single-line poetry paragraphs intact when no sentence punctuation mid-string.
    if "\n" in paragraph and not _SENTENCE_SPLIT.search(paragraph.replace("\n", " ")):
        return [ln.strip() for ln in paragraph.split("\n") if ln.strip()]
    flat = " ".join(ln.strip() for ln in paragraph.split("\n") if ln.strip())
    parts = _SENTENCE_SPLIT.split(flat)
    return [p.strip() for p in parts if p.strip()]
