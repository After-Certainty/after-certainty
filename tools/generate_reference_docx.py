#!/usr/bin/env python3
"""
Add house export paragraph styles to a Word reference template.

Copies an existing portfolio reference.docx (default: when-others-look-to-you v1)
and ensures Closing Page Break + Closing Quote Block styles exist for Pandoc DOCX.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from docx import Document
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Pt

_ROOT = Path(__file__).resolve().parents[1]
_DEFAULT_TEMPLATE = _ROOT / "books" / "when-others-look-to-you" / "v1" / "docs" / "reference.docx"

CLOSING_STYLES = (
    ("Closing Page Break", True, Pt(0), Pt(0)),
    ("Closing Quote Block", False, Pt(96), Pt(14)),
)


def ensure_closing_styles(doc: Document) -> list[str]:
    added: list[str] = []
    existing = {s.name for s in doc.styles}
    base = doc.styles["Pull Quote Block"]

    for name, page_break, space_before, space_after in CLOSING_STYLES:
        if name in existing:
            continue
        style = doc.styles.add_style(name, WD_STYLE_TYPE.PARAGRAPH)
        style.base_style = base
        style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        style.paragraph_format.space_before = space_before
        style.paragraph_format.space_after = space_after
        style.paragraph_format.line_spacing = 1.25
        if page_break:
            style.paragraph_format.page_break_before = True
        added.append(name)
    return added


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--template", type=Path, default=_DEFAULT_TEMPLATE)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    template = args.template.resolve()
    out = args.out.resolve()
    if not template.is_file():
        raise SystemExit(f"Missing template: {template}")

    doc = Document(str(template))
    added = ensure_closing_styles(doc)
    out.parent.mkdir(parents=True, exist_ok=True)
    doc.save(str(out))
    print(f"wrote={out}")
    if added:
        print(f"added_styles={','.join(added)}")
    else:
        print("added_styles=none (already present)")


if __name__ == "__main__":
    main()
