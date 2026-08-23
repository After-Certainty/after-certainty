"""Prepare manuscript markdown for Kindle/EPUB export."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

from after_certainty.export.diagrams import rasterize_book_diagrams
from after_certainty.manuscript.assemble import resolve_book_markdown
from after_certainty.manuscript.publication_markdown import prepare_manuscript_unit_for_export


def flatten_custom_blocks(text: str) -> str:
    lines = text.splitlines()
    out_lines = []
    i = 0
    closing_style_to_class = {
        "Closing Page Break": "closing-page-break",
        "Closing Quote Block": "closing-quote",
    }
    while i < len(lines):
        line = lines[i]
        m = re.match(r'^:::\s*\{([^}]+)\}\s*$', line)
        if not m:
            out_lines.append(line)
            i += 1
            continue

        attrs = m.group(1)
        style_m = re.search(r'custom-style="([^"]+)"', attrs)
        style = style_m.group(1) if style_m else None
        i += 1
        block = []
        while i < len(lines) and lines[i].strip() != ":::":  # end fence
            block.append(lines[i])
            i += 1
        if i < len(lines) and lines[i].strip() == ":::":  # consume end fence
            i += 1

        content = "\n".join(block).strip("\n")
        if style in closing_style_to_class:
            out_lines.append(f"::: {closing_style_to_class[style]}")
            if content:
                out_lines.extend(content.splitlines())
            out_lines.append(":::")
            out_lines.append("")
        elif style in {"Pattern Block", "Pull Quote Block", "Vignette Block"}:
            for bl in content.splitlines():
                if bl.strip():
                    out_lines.append("> " + bl)
                else:
                    out_lines.append(">")
            out_lines.append("")
        else:
            out_lines.append(content)
            out_lines.append("")

    return "\n".join(out_lines).strip() + "\n"


def parse_index_links_with_part_markers(index_text: str) -> list[tuple[str | None, str]]:
    """
    Walk index.md in order: each linked .md path, optionally preceded by a
    synthetic Part H1 when the link is the first under a ``## Part …`` block.
    """
    lines = index_text.splitlines()
    current_part: str | None = None
    first_in_block = True
    out: list[tuple[str | None, str]] = []

    for line in lines:
        if line.startswith("## Front Matter"):
            current_part = None
            first_in_block = True
            continue
        if line.startswith("## Back Matter"):
            current_part = None
            first_in_block = True
            continue
        if line.startswith("## Part "):
            current_part = line[3:].strip()
            first_in_block = True
            continue

        m = re.search(r"\]\(([^)]+\.md)\)", line)
        if not m:
            continue
        rel = m.group(1).strip()
        part_h1: str | None = None
        if first_in_block and current_part:
            part_h1 = f"# **{current_part}**"
        first_in_block = False
        out.append((part_h1, rel))

    return out


def ensure_blank_line_before_footnote_definitions(text: str) -> str:
    """Backward-compatible alias; prefer prepare_manuscript_unit_for_export."""
    return prepare_manuscript_unit_for_export(text)


def strip_inline_cover_image(text: str) -> str:
    """
    Drop inline BookCover from each chunk (--epub-cover-image supplies the cover).

    Also drops a following ``\\newpage`` that only separated the cover image from
    the typographic title.
    """
    lines = text.splitlines()
    out: list[str] = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if re.search(
            r"!\[[^\]]*\]\(([^)]*(?:BookCover|book_cover|book-cover)\.png)\)",
            line,
        ):
            i += 1
            while i < len(lines) and not lines[i].strip():
                i += 1
            if i < len(lines) and lines[i].strip() == r"\newpage":
                i += 1
                while i < len(lines) and not lines[i].strip():
                    i += 1
            continue
        out.append(line)
        i += 1
    cleaned = "\n".join(out)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned).strip() + "\n"
    return cleaned if cleaned.strip() else ""


def normalize_part_heading(text: str) -> str:
    """Compare Part titles across `# **Part …**` and `# Part …` spellings."""
    value = text.strip()
    value = re.sub(r"^\*+|\*+$", "", value).strip()
    value = value.replace("–", "—").replace("−", "—")
    return re.sub(r"\s+", " ", value).casefold()


def extract_leading_h1(text: str) -> str | None:
    """Return the first markdown H1 title, skipping leading ``\\newpage`` / blanks."""
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or stripped == r"\newpage":
            continue
        match = re.match(r"^#\s+(.+?)\s*$", stripped)
        if match:
            return match.group(1).strip()
        return None
    return None


def body_opens_with_part_heading(body: str) -> bool:
    """True when the unit already starts with a Part opener H1."""
    heading = extract_leading_h1(body)
    if heading is None:
        return False
    return normalize_part_heading(heading).startswith("part ")


def should_inject_part_h1(part_h1: str | None, body: str) -> bool:
    """
    Inject a synthetic Part H1 only when the first unit under a Part block does
    not already open with a Part heading (e.g. a chapter that is not a bridge).
    """
    if not part_h1:
        return False
    if body_opens_with_part_heading(body):
        return False
    injected = extract_leading_h1(part_h1)
    existing = extract_leading_h1(body)
    if injected is None or existing is None:
        return True
    return normalize_part_heading(injected) != normalize_part_heading(existing)


def strip_leading_newpage(text: str) -> str:
    """Remove leading ``\\newpage`` markers (meaningless / harmful in EPUB)."""
    lines = text.splitlines()
    i = 0
    while i < len(lines):
        stripped = lines[i].strip()
        if not stripped or stripped == r"\newpage":
            i += 1
            continue
        break
    return "\n".join(lines[i:]).strip() + ("\n" if lines[i:] else "")


def prepare_kindle_markdown(
    *,
    book_dir: Path,
    index_path: Path,
    out_path: Path,
    flatten_custom_blocks_flag: bool = False,
) -> int:
    """Flatten index-linked units into one markdown file for EPUB export."""
    indexed = parse_index_links_with_part_markers(index_path.read_text(encoding="utf-8"))
    chunks = []
    seen: set[Path] = set()
    for part_h1, rel in indexed:
        fp = resolve_book_markdown(book_dir, rel)
        if fp is None or fp in seen:
            continue
        seen.add(fp)
        text = fp.read_text(encoding="utf-8")
        text = strip_inline_cover_image(text)
        if flatten_custom_blocks_flag:
            text = flatten_custom_blocks(text)
        text = prepare_manuscript_unit_for_export(text)
        body = strip_leading_newpage(text.strip())
        if should_inject_part_h1(part_h1, body):
            body = f"{part_h1}\n\n{body}"
        chunks.append(body)

    combined = "\n\n".join(chunks).strip() + "\n"
    n_diagrams = rasterize_book_diagrams(book_dir)
    if n_diagrams:
        print(f"diagram_pngs={n_diagrams}")
    out_path.write_text(combined, encoding="utf-8")
    print(f"prepared_files={len(chunks)}")
    return len(chunks)


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Prepare manuscript markdown for Kindle export.")
    parser.add_argument("--book-dir", required=True)
    parser.add_argument("--index", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument(
        "--flatten-custom-blocks",
        action="store_true",
        help="Convert custom-style blocks to simpler Kindle-friendly markdown.",
    )
    args = parser.parse_args(argv)

    prepare_kindle_markdown(
        book_dir=Path(args.book_dir),
        index_path=Path(args.index),
        out_path=Path(args.out),
        flatten_custom_blocks_flag=args.flatten_custom_blocks,
    )


if __name__ == "__main__":
    main(sys.argv[1:])
