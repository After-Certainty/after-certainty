#!/usr/bin/env python3
"""
Render a manuscript glossary from semantic-manifest.json using templates/glossary.md.j2.

Example:
  python3 tools/render_semantic_glossary.py --repo . --manifest build/semantic-manifest.json \\
    --out books/example/back-matter/glossary.md
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from jinja2 import Environment, FileSystemLoader


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument("--manifest", required=True, help="semantic-manifest.json path")
    parser.add_argument("--out", required=True, help="Output markdown path")
    parser.add_argument(
        "--template",
        default="templates/glossary.md.j2",
        help="Template path relative to repo (default: templates/glossary.md.j2)",
    )
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    manifest_path = Path(args.manifest).resolve()
    out_path = Path(args.out).resolve()

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    glossary = manifest.get("glossary")
    if not isinstance(glossary, list):
        raise SystemExit("Manifest has no glossary array.")

    def by_kind(kind: str) -> list[dict]:
        return [g for g in glossary if isinstance(g, dict) and g.get("termKind") == kind]

    core_terms = sorted(by_kind("core"), key=lambda g: g.get("title", "").lower())
    supporting_terms = sorted(by_kind("supporting"), key=lambda g: g.get("title", "").lower())
    extended_terms = sorted(by_kind("extended"), key=lambda g: g.get("title", "").lower())

    env = Environment(
        loader=FileSystemLoader(str(repo)),
        autoescape=False,
    )
    tpl = env.get_template(args.template)
    text = tpl.render(
        core_terms=core_terms,
        supporting_terms=supporting_terms,
        extended_terms=extended_terms,
    )
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(text.rstrip() + "\n", encoding="utf-8")
    print(str(out_path))


if __name__ == "__main__":
    main()
