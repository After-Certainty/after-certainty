#!/usr/bin/env python3
import argparse
import re
from pathlib import Path


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
        if style == "Pattern Block":
            # Keep as plain text emphasis block.
            out_lines.append(content)
            out_lines.append("")
        elif style in {"Pull Quote Block", "Vignette Block"}:
            # Convert to simple blockquote for broad Kindle compatibility.
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

    links = re.findall(r"\]\(([^)]+\.md)\)", index_path.read_text())
    files = [book_dir / rel for rel in links if (book_dir / rel).exists()]

    chunks = []
    for fp in files:
        text = fp.read_text()
        text = strip_inline_cover_image(text)
        if args.flatten_custom_blocks:
            text = flatten_custom_blocks(text)
        chunks.append(text.strip())

    out_path.write_text("\n\n".join(chunks).strip() + "\n")
    print(f"prepared_files={len(files)}")


if __name__ == "__main__":
    main()
