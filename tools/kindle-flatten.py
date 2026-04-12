#!/usr/bin/env python3
import argparse
import re
import sys
from pathlib import Path

_TOOLS_DIR = Path(__file__).resolve().parent
if str(_TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(_TOOLS_DIR))

from diagram_rasterize import rasterize_book_diagrams  # noqa: E402


def flatten_custom_blocks(text: str) -> str:
    lines = text.splitlines()
    out_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        m = re.match(r'^:::\s*\{custom-style="([^"]+)"\}\s*$', line)
        if not m:
            out_lines.append(line)
            i += 1
            continue

        style = m.group(1)
        i += 1
        block = []
        while i < len(lines) and lines[i].strip() != ":::":  # end fence
            block.append(lines[i])
            i += 1
        if i < len(lines) and lines[i].strip() == ":::":  # consume end fence
            i += 1

        content = "\n".join(block).strip("\n")
        if style in {"Pattern Block", "Pull Quote Block", "Vignette Block"}:
            # Convert to simple blockquote for broad Kindle/EPUB compatibility so
            # callout boundaries are visible (same treatment for all three).
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

    Used so Kindle/EPUB ``--toc-depth=1`` can list Part headings plus each
    document's top-level ``#`` title (bridges, chapters, …) without ``##``/``###``
    subsection titles in the navigation TOC.
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


def strip_inline_cover_image(text: str) -> str:
    # Keep the image as EPUB metadata cover, not an in-flow first page image.
    lines = []
    for line in text.splitlines():
        if re.search(r"!\[[^\]]*\]\(([^)]*BookCover\.png)\)", line):
            continue
        lines.append(line)
    cleaned = "\n".join(lines)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned).strip() + "\n"
    return cleaned


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepare manuscript markdown for Kindle export.")
    parser.add_argument("--book-dir", required=True)
    parser.add_argument("--index", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument(
        "--flatten-custom-blocks",
        action="store_true",
        help="Convert custom-style blocks to simpler Kindle-friendly markdown.",
    )
    args = parser.parse_args()

    book_dir = Path(args.book_dir)
    index_path = Path(args.index)
    out_path = Path(args.out)

    indexed = parse_index_links_with_part_markers(index_path.read_text())
    chunks = []
    for part_h1, rel in indexed:
        fp = book_dir / rel
        if not fp.exists():
            continue
        text = fp.read_text()
        text = strip_inline_cover_image(text)
        if args.flatten_custom_blocks:
            text = flatten_custom_blocks(text)
        body = text.strip()
        if part_h1:
            body = f"{part_h1}\n\n{body}"
        chunks.append(body)

    combined = "\n\n".join(chunks).strip() + "\n"
    n_diagrams = rasterize_book_diagrams(book_dir)
    if n_diagrams:
        print(f"diagram_pngs={n_diagrams}")
    out_path.write_text(combined)
    print(f"prepared_files={len(chunks)}")


if __name__ == "__main__":
    main()
