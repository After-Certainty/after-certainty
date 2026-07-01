#!/usr/bin/env python3
"""Convert Observer Patterns Google Doc HTML export into markdown manuscript layout."""

from __future__ import annotations

import argparse
import base64
import html as html_module
import re
import sys
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path

_TOOLS_DIR = Path(__file__).resolve().parent
if str(_TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(_TOOLS_DIR))

from generate_typst_manifest import write_typst_manifest  # noqa: E402

ROMAN_PART_RE = re.compile(r"^Part\s+([IVXLC]+)\s*[—–-]\s*(.+)$", re.I)
IMG_DATA_RE = re.compile(
    r'<img[^>]+src="(data:image/[^;]+;base64,[^"]+)"',
    re.IGNORECASE,
)


def slug(text: str) -> str:
    text = re.sub(r"\*+", "", text).strip()
    text = re.sub(r"^(Part\s+[IVXLC]+)\s*[—:–-]\s*", "", text, flags=re.I)
    text = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return text or "section"


def part_dir_name(part_heading: str) -> str:
    match = ROMAN_PART_RE.match(part_heading.strip())
    if not match:
        return f"part-{slug(part_heading)}"
    numeral, title = match.groups()
    return f"part-{numeral.lower()}-{slug(title)}"


def write_file(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = content.strip()
    path.write_text((text + "\n") if text else "\n", encoding="utf-8")


@dataclass
class Cell:
    title: str | None = None
    lines: list[str] = field(default_factory=list)


@dataclass
class Table:
    rows: list[list[Cell]]


@dataclass
class Block:
    kind: str
    text: str = ""
    src: str = ""
    table: Table | None = None


class GoogleDocHtmlParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.blocks: list[Block] = []
        self._in_h1 = False
        self._in_h2 = False
        self._in_td = False
        self._in_prose_p = False
        self._buf: list[str] = []
        self._table: Table | None = None
        self._row: list[Cell] | None = None
        self._cell: Cell | None = None

    def _flush(self) -> str:
        text = html_module.unescape("".join(self._buf).strip())
        self._buf = []
        return text

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_d = {k: v or "" for k, v in attrs}
        if tag == "h1":
            self._in_h1 = True
            self._buf = []
        elif tag == "h2":
            self._in_h2 = True
            self._buf = []
        elif tag == "hr":
            self.blocks.append(Block("hr"))
        elif tag == "table":
            self._table = Table(rows=[])
        elif tag == "tr" and self._table is not None:
            self._row = []
        elif tag == "td" and self._table is not None:
            self._in_td = True
            self._cell = Cell()
        elif tag == "img":
            src = attrs_d.get("src", "")
            if src.startswith("data:image"):
                self.blocks.append(Block("img", src=src))
        elif tag == "p" and not self._in_td:
            self._in_prose_p = True
            self._buf = []

    def handle_endtag(self, tag: str) -> None:
        if tag == "h1":
            self._in_h1 = False
            self.blocks.append(Block("h1", text=self._flush()))
        elif tag == "h2":
            self._in_h2 = False
            title = self._flush()
            if self._in_td and self._cell is not None and title:
                self._cell.title = title
        elif tag == "td" and self._table is not None and self._in_td:
            self._in_td = False
            if self._row is not None and self._cell is not None:
                self._row.append(self._cell)
            self._cell = None
        elif tag == "tr" and self._table is not None and self._row is not None:
            self._table.rows.append(self._row)
            self._row = None
        elif tag == "table" and self._table is not None:
            self.blocks.append(Block("table", table=self._table))
            self._table = None
        elif tag == "p" and self._in_td:
            line = self._flush()
            if line and self._cell is not None:
                self._cell.lines.append(line)
        elif tag == "p" and self._in_prose_p:
            self._in_prose_p = False
            line = self._flush()
            if line:
                self.blocks.append(Block("prose", text=line))

    def handle_data(self, data: str) -> None:
        if self._in_h1 or self._in_h2 or self._in_td or self._in_prose_p:
            self._buf.append(data)


def table_to_markdown(table: Table, *, include_title: bool = True) -> str:
    max_cols = max((len(row) for row in table.rows), default=0)
    if max_cols <= 1:
        chunks: list[str] = []
        for row in table.rows:
            for cell in row:
                if include_title and cell.title:
                    chunks.append(f"## {cell.title}")
                if cell.lines:
                    chunks.append("\n\n".join(cell.lines))
        return "\n\n".join(chunks)

    rows_out: list[str] = ["| | |", "| --- | --- |"]
    for row in table.rows:
        while len(row) < 2:
            row.append(Cell())
        left_lines = list(row[0].lines)
        right_lines = list(row[1].lines)
        if include_title and row[0].title:
            left_lines.insert(0, f"## {row[0].title}")
        max_lines = max(len(left_lines), len(right_lines), 1)
        for i in range(max_lines):
            left = left_lines[i] if i < len(left_lines) else ""
            right = right_lines[i] if i < len(right_lines) else ""
            left = left.replace("|", "\\|")
            right = right.replace("|", "\\|")
            rows_out.append(f"| {left} | {right} |")
    return "\n".join(rows_out)


def poem_title_from_tables(tables: list[Table]) -> str:
    for table in tables:
        for row in table.rows:
            for cell in row:
                if cell.title:
                    return cell.title
    for table in tables:
        for row in table.rows:
            for cell in row:
                for line in cell.lines:
                    if line:
                        return line[:80]
    return "untitled"


def table_title(table: Table) -> str | None:
    for row in table.rows:
        for cell in row:
            if cell.title:
                return cell.title
    return None


def tables_to_poem_markdown(tables: list[Table]) -> tuple[str, str]:
    title = poem_title_from_tables(tables)
    body_parts: list[str] = []
    for table in tables:
        body_parts.append(table_to_markdown(table))
    body = "\n\n".join(part for part in body_parts if part.strip())
    return title, body


def extract_cover_png(html: str, out_path: Path) -> bool:
    match = IMG_DATA_RE.search(html)
    if not match:
        return False
    data_url = match.group(1)
    header, encoded = data_url.split(",", 1)
    if "base64" not in header:
        return False
    out_path.write_bytes(base64.b64decode(encoded))
    return True


def parse_blocks(html: str) -> list[Block]:
    parser = GoogleDocHtmlParser()
    parser.feed(html)
    return parser.blocks


def build_manuscript(book_dir: Path, blocks: list[Block]) -> dict[str, int]:
    stats = {
        "parts": 0,
        "poems": 0,
        "prose_paragraphs": 0,
        "warnings": 0,
    }
    warnings: list[str] = []
    index_entries: list[tuple[str, str, str]] = []

    # Title page and copyright from first metadata tables after cover image.
    title_lines: list[str] = []
    copyright_lines: list[str] = []
    idx = 0
    if blocks and blocks[0].kind == "img":
        idx = 1
    if idx < len(blocks) and blocks[idx].kind == "table":
        for row in blocks[idx].table.rows:  # type: ignore[union-attr]
            for cell in row:
                title_lines.extend(cell.lines)
        idx += 1
    if idx < len(blocks) and blocks[idx].kind == "table":
        for row in blocks[idx].table.rows:  # type: ignore[union-attr]
            for cell in row:
                copyright_lines.extend(cell.lines)
        idx += 1

    title_page = "\n\n".join(title_lines)
    write_file(book_dir / "front-matter" / "title-page.md", title_page)
    index_entries.append(("Front Matter", "Title Page", "front-matter/title-page.md"))

    copyright_md = "\n\n".join(copyright_lines)
    write_file(book_dir / "front-matter" / "copyright.md", copyright_md)
    index_entries.append(("Front Matter", "Copyright", "front-matter/copyright.md"))

    # Introduction
    while idx < len(blocks) and not (
        blocks[idx].kind == "h1" and blocks[idx].text == "Introduction"
    ):
        idx += 1
    if idx >= len(blocks):
        raise SystemExit("Introduction heading not found in HTML export")
    idx += 1
    intro_tables: list[Table] = []
    while idx < len(blocks) and not (
        blocks[idx].kind == "h1" and blocks[idx].text.startswith("Part ")
    ):
        if blocks[idx].kind == "table":
            intro_tables.append(blocks[idx].table)  # type: ignore[arg-type]
        idx += 1
    intro_md = "\n\n".join(table_to_markdown(table, include_title=False) for table in intro_tables)
    write_file(book_dir / "front-matter" / "introduction.md", intro_md)
    index_entries.append(("Front Matter", "Introduction", "front-matter/introduction.md"))

    used_slugs: dict[str, int] = {}

    def unique_slug(name: str) -> str:
        base = slug(name)
        if base not in used_slugs:
            used_slugs[base] = 1
            return base
        used_slugs[base] += 1
        return f"{base}-{used_slugs[base]}"

    # Parts and poems
    while idx < len(blocks):
        block = blocks[idx]
        if block.kind != "h1" or not block.text.startswith("Part "):
            idx += 1
            continue

        part_heading = block.text
        part_slug = part_dir_name(part_heading)
        part_path = book_dir / "parts" / part_slug
        stats["parts"] += 1
        idx += 1

        bridge_tables: list[Table] = []
        if idx < len(blocks) and blocks[idx].kind == "table":
            bridge_tables.append(blocks[idx].table)  # type: ignore[arg-type]
            idx += 1
        bridge_md = "\n\n".join(
            table_to_markdown(table, include_title=False) for table in bridge_tables
        )
        write_file(part_path / "bridge.md", bridge_md)
        index_entries.append((part_heading, part_heading, f"parts/{part_slug}/bridge.md"))

        if part_heading.startswith("Part VII"):
            # Part VII ends with prose after the single poem separator.
            if idx < len(blocks) and blocks[idx].kind == "hr":
                idx += 1
            prose_lines: list[str] = []
            while idx < len(blocks):
                if blocks[idx].kind == "prose":
                    prose_lines.append(blocks[idx].text)
                    stats["prose_paragraphs"] += 1
                idx += 1
            closing_md = "\n\n".join(prose_lines)
            write_file(part_path / "closing.md", closing_md)
            index_entries.append((part_heading, "Closing", f"parts/{part_slug}/closing.md"))
            break

        def flush_poem_tables(
            _path: Path = part_path,
            _heading: str = part_heading,
            _slug: str = part_slug,
        ) -> None:
            nonlocal poem_tables
            if not poem_tables:
                return
            title, body = tables_to_poem_markdown(poem_tables)
            poem_slug = unique_slug(title)
            write_file(_path / f"{poem_slug}.md", body)
            index_entries.append((_heading, title, f"parts/{_slug}/{poem_slug}.md"))
            stats["poems"] += 1
            poem_tables = []

        poem_tables: list[Table] = []
        while idx < len(blocks):
            current = blocks[idx]
            if current.kind == "h1" and current.text.startswith("Part "):
                break
            if current.kind == "hr":
                flush_poem_tables()
                idx += 1
                continue
            if current.kind == "table":
                table = current.table  # type: ignore[assignment]
                if poem_tables and table_title(table):
                    flush_poem_tables()
                poem_tables.append(table)
            idx += 1

        flush_poem_tables()

    write_index(book_dir, "Observer Patterns", index_entries)
    write_import_log(book_dir, stats, warnings)
    stats["warnings"] = len(warnings)
    return stats


def write_index(book_dir: Path, title: str, entries: list[tuple[str, str, str]]) -> None:
    lines = [f"# **{title}**", "", "### **Contents**", ""]
    group: str | None = None
    for section, label, rel in entries:
        if section != group:
            if group is not None:
                lines.append("")
            group = section
            lines.extend([f"## {section}", ""])
        lines.append(f"- [{label}]({rel})")
    lines.append("")
    write_file(book_dir / "index.md", "\n".join(lines))
    write_typst_manifest(
        book_dir,
        header="// Auto-generated by tools/html_to_observer_patterns.py",
    )


def write_import_log(book_dir: Path, stats: dict[str, int], warnings: list[str]) -> None:
    lines = [
        "# Observer Patterns import log",
        "",
        "## Counts",
        "",
        f"- Parts: {stats['parts']}",
        f"- Poems: {stats['poems']}",
        f"- Closing prose paragraphs: {stats['prose_paragraphs']}",
        "",
    ]
    if warnings:
        lines.extend(["## Warnings", ""])
        lines.extend(f"- {warning}" for warning in warnings)
        lines.append("")
    write_file(book_dir / "import" / "import-log.md", "\n".join(lines))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--book-dir", required=True, help="Book directory")
    parser.add_argument(
        "--html",
        default="",
        help="HTML source path (default: <book-dir>/import/source.html)",
    )
    parser.add_argument(
        "--extract-cover",
        action="store_true",
        help="Extract embedded cover image to book-cover.png",
    )
    args = parser.parse_args()

    book_dir = Path(args.book_dir).resolve()
    html_path = Path(args.html) if args.html else book_dir / "import" / "source.html"
    if not html_path.is_file():
        raise SystemExit(f"HTML file not found: {html_path}")

    html = html_path.read_text(encoding="utf-8", errors="replace")
    blocks = parse_blocks(html)

    if args.extract_cover:
        cover_path = book_dir / "book-cover.png"
        if extract_cover_png(html, cover_path):
            print(f"Wrote {cover_path}")
        else:
            print("Warning: no embedded cover image found in HTML", file=sys.stderr)

    stats = build_manuscript(book_dir, blocks)
    print(
        "Imported Observer Patterns: "
        f"{stats['parts']} parts, {stats['poems']} poems, "
        f"{stats['prose_paragraphs']} closing paragraphs"
    )
    if stats["warnings"]:
        print(f"Warnings: {stats['warnings']} (see import/import-log.md)")


if __name__ == "__main__":
    main()
