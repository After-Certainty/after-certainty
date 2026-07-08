"""PDF export staging preserves duplicate markdown basenames (e.g. part bridges)."""

from __future__ import annotations

import sys
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent.parent / "scripts"
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))

from export_pdf import stage_pdf_units  # noqa: E402


def test_stage_pdf_units_keeps_distinct_bridge_files(tmp_path: Path) -> None:
    book = tmp_path / "sample-book"
    part1 = book / "parts" / "part-1"
    part5 = book / "parts" / "part-5"
    closing = book / "back-matter"
    part1.mkdir(parents=True)
    part5.mkdir(parents=True)
    closing.mkdir(parents=True)

    bridge1 = part1 / "bridge.md"
    bridge5 = part5 / "bridge.md"
    closing_md = closing / "closing.md"
    bridge1.write_text("# Part I bridge\n", encoding="utf-8")
    bridge5.write_text("# Part V bridge\n", encoding="utf-8")
    closing_md.write_text("::: closing-quote\nQuote\n:::\n", encoding="utf-8")

    staged = stage_pdf_units(
        [bridge1, bridge5, closing_md], tmp_path / "pdf-tmp", spec={}, book_dir=book
    )

    assert staged[0] == bridge1.resolve()
    assert staged[1] == bridge5.resolve()
    assert staged[0].read_text(encoding="utf-8") == "# Part I bridge\n"
    assert staged[1].read_text(encoding="utf-8") == "# Part V bridge\n"
    assert staged[2].parent == (tmp_path / "pdf-tmp").resolve()
    assert staged[2].name == "closing.md"
    assert "```{=latex}" in staged[2].read_text(encoding="utf-8")
