"""
Resolve linked markdown units from a book index (used by manifests and mention scans).
"""

from __future__ import annotations

import re
from pathlib import Path

MD_LINK_RE = re.compile(r"\[[^\]]+\]\(([^)]+\.md)\)")


def resolve_markdown_units(book_dir: Path) -> list[Path]:
    index = book_dir / "index.md"
    if not index.exists():
        return []
    text = index.read_text(encoding="utf-8")
    rels = [m.group(1).strip() for m in MD_LINK_RE.finditer(text)]
    units: list[Path] = []
    for rel in rels:
        candidate = (book_dir / rel).resolve()
        if candidate.exists() and candidate.is_file():
            units.append(candidate)
    return units
