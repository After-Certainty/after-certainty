#!/usr/bin/env python3
"""
DEPRECATED: The v1 manuscript no longer links glossary terms to `glossary.md`
(bold only; see `docs/book-rules.md`, **Circulation and Correction**). This
script remains for historical reference or one-off experiments—do not run it
to “restore” links without an explicit decision.

Previously: wrap glossary **terms** in manuscript markdown with links to
back-matter/glossary.md# anchors. Skips terms already inside a markdown link.
Only touches .md under v1/parts, v1/front-matter, v1/back-matter (including glossary).

List labels must keep the colon outside bold for matching: use `- [**Scalability**](...):` not `- **Scalability:**`.
"""
from __future__ import annotations

import os
import re
import sys
from pathlib import Path

V1 = Path(__file__).resolve().parent.parent
GLOSSARY = V1 / "back-matter" / "glossary.md"

# (display substring in **bold**, anchor slug). Longer phrases first.
TERMS: list[tuple[str, str]] = [
    ("Correction rich; constricted correction", "correction-rich-constricted-correction"),
    ("correction rich", "correction-rich-constricted-correction"),
    ("constricted correction", "correction-rich-constricted-correction"),
    ("Circulation", "circulation"),
    ("Correction", "correction"),
    ("vibrant group", "vibrant-group"),
    ("decaying group", "decaying-group"),
    ("guest leadership", "guest-leadership"),
    ("Regenerative", "regenerative"),
    ("Adaptive", "adaptive"),
    ("Entrenched", "entrenched"),
    ("Stalled", "stalled"),
    ("Adaptability", "adaptability"),
    ("scalability", "scalability"),
    ("Scalability", "scalability"),
    ("adaptability", "adaptability"),
    ("revisability", "revisability"),
    ("Revisability", "revisability"),
    ("Effectiveness", "effectiveness"),
    ("effectiveness", "effectiveness"),
    ("Legitimacy", "legitimacy"),
    ("legitimacy", "legitimacy"),
    ("Vitality", "vitality"),
    ("vitality", "vitality"),
    ("Decay", "decay"),
    ("decay", "decay"),
    ("Harm", "harm"),
    ("harm", "harm"),
    ("Erosion", "erosion"),
    ("erosion", "erosion"),
    ("Renewal", "renewal"),
    ("renewal", "renewal"),
]


def glossary_href_prefix(source: Path) -> str:
    """Return markdown href prefix (file part + #) for links to glossary."""
    if source.resolve() == GLOSSARY.resolve():
        return "#"
    rel = os.path.relpath(GLOSSARY, source.parent).replace("\\", "/")
    return f"{rel}#"


def linkify_line(line: str, href_prefix: str) -> str:
    out = line
    for term, slug in TERMS:
        # Not already inside [**term**](
        pattern = rf"(?<!\[)\*\*{re.escape(term)}\*\*"
        repl = f"[**{term}**]({href_prefix}{slug})"
        out = re.sub(pattern, repl, out)
    return out


def process_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    href_prefix = glossary_href_prefix(path)
    lines = text.splitlines(keepends=True)
    changed = False
    new_lines = []
    for line in lines:
        new_line = linkify_line(line, href_prefix)
        if new_line != line:
            changed = True
        new_lines.append(new_line)
    if changed:
        path.write_text("".join(new_lines), encoding="utf-8")
    return changed


def main() -> int:
    files: list[Path] = []
    for root in (V1 / "parts", V1 / "front-matter", V1 / "back-matter"):
        if root.exists():
            files.extend(sorted(root.rglob("*.md")))
    idx = V1 / "index.md"
    if idx.exists():
        files.append(idx)
    n = 0
    for path in sorted(set(files), key=lambda p: str(p)):
        if process_file(path):
            print(f"linked: {path.relative_to(V1)}")
            n += 1
    print(f"Done. Updated {n} files.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
