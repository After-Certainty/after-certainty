"""Prepare manuscript markdown for reader-facing exports."""

from __future__ import annotations

import re
from pathlib import Path

NOTES_HEADING_RE = re.compile(r"^## (?:End )?Notes\s*$")
FOOTNOTE_DEF_RE = re.compile(r"^\[\^[^\]]+\]:")
EMPTY_NOTES_HEADING_BLOCK_RE = re.compile(
    r"^## (?:End )?Notes\s*\n(?:\s*\n)*(?=\[\^)",
    re.MULTILINE,
)

# Phrases that must not appear in reader-facing manuscript text.
BANNED_PHRASES: tuple[str, ...] = (
    "Planning Docs",
    "research packets",
    "unit mapping",
    "bibliography-guide.md",
    "book-overview",
    "voice-guide",
    "drafting-process",
    "status.md",
    "docs/research/",
    "docs/bibliography-guide",
)

# Allow public URLs containing .md (rare); flag monorepo-style relative paths.
REPO_PATH_RE = re.compile(
    r"(?<![a-zA-Z0-9/])(?:\.\./)+docs/|"
    r"\]\([^)]*(?:\.\./)+[^)]*\.md\)|"
    r"`docs/[^`]+`",
)


def _notes_section_is_footnote_only(lines: list[str], heading_index: int) -> bool:
    """True when ## Notes is followed only by blanks and Pandoc footnote definitions."""
    i = heading_index + 1
    while i < len(lines) and not lines[i].strip():
        i += 1
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
            continue
        if FOOTNOTE_DEF_RE.match(line):
            i += 1
            continue
        return False
    return True


def strip_footnote_only_notes_heading(text: str) -> str:
    """
    Remove ``## Notes`` / ``## End Notes`` when the section contains only
    Pandoc footnote definitions (``[^id]: …``).

    Preserves the heading when non-footnote prose appears beneath it.
    """
    lines = text.splitlines()
    out: list[str] = []
    i = 0
    while i < len(lines):
        if NOTES_HEADING_RE.match(lines[i]) and _notes_section_is_footnote_only(lines, i):
            i += 1
            while i < len(lines) and not lines[i].strip():
                i += 1
            continue
        out.append(lines[i])
        i += 1
    return "\n".join(out).strip() + "\n" if out else ""


def ensure_blank_line_before_footnote_definitions(text: str) -> str:
    """Pandoc requires a blank line before [^id]: definitions."""
    lines = text.splitlines()
    out: list[str] = []
    for i, line in enumerate(lines):
        if (
            i > 0
            and FOOTNOTE_DEF_RE.match(line)
            and lines[i - 1].strip()
            and not FOOTNOTE_DEF_RE.match(lines[i - 1])
            and out
            and out[-1].strip()
        ):
            out.append("")
        out.append(line)
    return "\n".join(out).strip() + "\n" if out else ""


def prepare_manuscript_unit_for_export(text: str) -> str:
    """Publication preprocessing applied to each assembled manuscript unit."""
    text = strip_footnote_only_notes_heading(text)
    text = ensure_blank_line_before_footnote_definitions(text)
    return text


def stage_publication_units(
    units: list[Path],
    tmp_dir: Path,
    *,
    book_dir: Path,
) -> list[Path]:
    """Write export-ready copies of manuscript units (preserves relative paths)."""
    staged: list[Path] = []
    for unit in units:
        rel = unit.relative_to(book_dir)
        dest = tmp_dir / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        text = prepare_manuscript_unit_for_export(unit.read_text(encoding="utf-8"))
        dest.write_text(text, encoding="utf-8")
        staged.append(dest)
    return staged


def find_publication_issues(text: str, *, source: str = "") -> list[str]:
    """Return human-readable validation errors for reader-facing markdown."""
    issues: list[str] = []
    prefix = f"{source}: " if source else ""

    if EMPTY_NOTES_HEADING_BLOCK_RE.search(text):
        issues.append(f"{prefix}empty Notes heading before footnote definitions")

    for match in NOTES_HEADING_RE.finditer(text):
        start = match.end()
        rest = text[start:]
        if not rest.strip():
            issues.append(f"{prefix}empty Notes heading at end of file")
            continue
        # Heading followed only by whitespace until EOF
        trailing = rest.lstrip("\n")
        if not trailing:
            issues.append(f"{prefix}empty Notes heading with no content")

    lowered = text.lower()
    for phrase in BANNED_PHRASES:
        if phrase.lower() in lowered:
            issues.append(f"{prefix}banned internal phrase: {phrase!r}")

    for repo_match in REPO_PATH_RE.finditer(text):
        issues.append(f"{prefix}repository path in reader-facing text: {repo_match.group(0)!r}")

    return issues
