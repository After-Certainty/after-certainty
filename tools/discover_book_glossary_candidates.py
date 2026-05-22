#!/usr/bin/env python3
"""
Discover glossary term candidates for a book: manuscript glossary files,
bold/emdash entries, and ontology terms missing glossary overlays.

Emits a markdown report and optional draft YAML under semantic/_drafts/generated/glossary/.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

_TOOLS_DIR = Path(__file__).resolve().parent
if str(_TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(_TOOLS_DIR))

from book_specs import load_any_book_spec  # noqa: E402
from extract_semantic_glossary_drafts import (  # noqa: E402
    build_draft_record,
    parse_bold_emdash,
    parse_h2_sections,
)
from semantic_enrichment import book_id_from_spec  # noqa: E402
from semantic_extract import slugify_heading  # noqa: E402

GLOSSARY_DIR = Path("semantic/glossary")
ONTOLOGY_CORE = Path("semantic/ontology/core-terms.yml")
ONTOLOGY_SUPPORTING = Path("semantic/ontology/supporting-terms.yml")
GLOSSARY_CANDIDATE_PATHS = (
    "glossary.md",
    "back-matter/glossary.md",
    "appendix/glossary.md",
    "back-matter/appendix-a-glossary.md",
)


def _rel(path: Path, repo: Path) -> str:
    try:
        return path.resolve().relative_to(repo.resolve()).as_posix()
    except ValueError:
        return path.as_posix()


def _existing_glossary_slugs(repo: Path) -> set[str]:
    root = repo / GLOSSARY_DIR
    if not root.is_dir():
        return set()
    return {p.stem for p in root.glob("*.yml")}


def _ontology_slugs(repo: Path) -> dict[str, str]:
    """slug -> termKind (core|supporting)."""
    out: dict[str, str] = {}
    for path, kind in (
        (repo / ONTOLOGY_CORE, "core"),
        (repo / ONTOLOGY_SUPPORTING, "supporting"),
    ):
        if not path.is_file():
            continue
        raw = yaml.safe_load(path.read_text(encoding="utf-8"))
        if not isinstance(raw, dict):
            continue
        for item in raw.get("terms") or []:
            if isinstance(item, dict):
                slug = str(item.get("slug", "")).strip()
                if slug:
                    out[slug] = kind
    return out


def _find_glossary_markdown(book_dir: Path) -> Path | None:
    for rel in GLOSSARY_CANDIDATE_PATHS:
        p = book_dir / rel
        if p.is_file():
            return p
    return None


def _parse_glossary_file(path: Path) -> list[tuple[str, str, str]]:
    """Return (slug, title, body) from manuscript glossary markdown."""
    text = path.read_text(encoding="utf-8")
    fmt = (
        "bold_emdash"
        if re.search(r"^\s*\*\*[^*]+\*\*\s*[—:\-\u2013]", text, re.MULTILINE)
        else "h2"
    )
    if fmt == "bold_emdash":
        raw = parse_bold_emdash(text)
    else:
        raw = parse_h2_sections(text)
    return [(slugify_heading(title), title.strip(), body) for title, body in raw if title.strip()]


def _manuscript_bold_candidates(book_dir: Path) -> list[tuple[str, str]]:
    """**Term** — lines in parts/ not already a dedicated glossary file."""
    found: list[tuple[str, str]] = []
    seen: set[str] = set()
    parts = book_dir / "parts"
    if not parts.is_dir():
        return found
    pat = re.compile(r"^\s*\*\*(?P<title>[^*]+)\*\*\s*(?:[—:\-]|\u2013)\s*", re.MULTILINE)
    for md in sorted(parts.rglob("*.md")):
        text = md.read_text(encoding="utf-8")
        for m in pat.finditer(text):
            title = m.group("title").strip()
            slug = slugify_heading(title)
            if slug in seen:
                continue
            seen.add(slug)
            found.append((slug, title))
    return found


def discover(
    repo: Path,
    *,
    book_dir: Path,
    book_id: str,
    write_drafts: bool,
) -> tuple[str, int]:
    existing = _existing_glossary_slugs(repo)
    ontology = _ontology_slugs(repo)

    from_file: list[tuple[str, str, str, str]] = []
    glossary_path = _find_glossary_markdown(book_dir)
    if glossary_path is not None:
        for slug, title, body in _parse_glossary_file(glossary_path):
            status = "exists" if slug in existing else "new"
            from_file.append((slug, title, status, _rel(glossary_path, repo)))

    from_prose: list[tuple[str, str, str]] = []
    for slug, title in _manuscript_bold_candidates(book_dir):
        if slug in existing:
            continue
        if any(slug == s for s, _, _, _ in from_file):
            continue
        from_prose.append((slug, title, "prose-bold"))

    ontology_missing = sorted(
        slug for slug in ontology if slug not in existing
    )

    draft_dir = repo / "semantic/_drafts/generated/glossary" / book_id
    drafts_written = 0
    if write_drafts and glossary_path is not None:
        draft_dir.mkdir(parents=True, exist_ok=True)
        for slug, title, body in _parse_glossary_file(glossary_path):
            if slug in existing:
                continue
            rec = build_draft_record(
                slug=slug,
                title=title,
                body=body,
                book_id=book_id,
                source_path=glossary_path.resolve(),
                repo=repo,
            )
            if rec.get("longDefinition") is None:
                del rec["longDefinition"]
            if slug in ontology:
                rec["termKind"] = ontology[slug]
            (draft_dir / f"{slug}.yml").write_text(
                yaml.safe_dump(rec, allow_unicode=True, default_flow_style=False, sort_keys=False)
                + "\n",
                encoding="utf-8",
            )
            drafts_written += 1

    lines: list[str] = [
        f"# Glossary candidates: {book_id}",
        "",
        f"- **Book directory:** `{_rel(book_dir, repo)}`",
        f"- **Existing glossary entries:** {len(existing)}",
        "",
    ]

    if glossary_path:
        lines.append(f"- **Manuscript glossary:** `{_rel(glossary_path, repo)}`")
    else:
        lines.append("- **Manuscript glossary:** _none found (checked glossary.md, back-matter/glossary.md, …)_")
    lines.append("")

    lines.append("## From manuscript glossary file")
    lines.append("")
    if not from_file:
        lines.append("_No entries parsed._")
    else:
        for slug, title, status, src in from_file:
            lines.append(f"- `{slug}` ({title}) — **{status}** — {src}")
    lines.append("")

    lines.append("## From prose (**Term** — in parts/)")
    lines.append("")
    if not from_prose:
        lines.append("_No new bold-term candidates outside existing glossary._")
    else:
        for slug, title, kind in from_prose[:40]:
            lines.append(f"- `{slug}` ({title}) — _{kind}_")
        if len(from_prose) > 40:
            lines.append(f"- _…and {len(from_prose) - 40} more_")
    lines.append("")

    lines.append("## Ontology terms without glossary overlay")
    lines.append("")
    if not ontology_missing:
        lines.append("_All ontology terms have `semantic/glossary/<slug>.yml`._")
    else:
        for slug in ontology_missing:
            kind = ontology.get(slug, "?")
            lines.append(f"- `{slug}` — ontology **{kind}**")
    lines.append("")

    if write_drafts:
        lines.append("## Drafts written")
        lines.append("")
        if drafts_written:
            lines.append(f"- `{_rel(draft_dir, repo)}/` ({drafts_written} file(s))")
        else:
            lines.append("_No new draft files (all entries already exist or no glossary file)._")
        lines.append("")

    return "\n".join(lines), drafts_written


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument("--book-dir", required=True, help="e.g. books/coupling")
    parser.add_argument("--book-id", help="Defaults to book.id from book.yml")
    parser.add_argument(
        "--write-drafts",
        action="store_true",
        help="Write new entries to semantic/_drafts/generated/glossary/<book-id>/",
    )
    parser.add_argument("--out", help="Write report markdown to this path")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    book_dir = (repo / args.book_dir).resolve()
    spec_path = book_dir / "book.yml"
    if not spec_path.is_file():
        print(f"Error: missing {spec_path}", file=sys.stderr)
        return 2

    book_id = args.book_id or book_id_from_spec(load_any_book_spec(spec_path))
    report, _n = discover(
        repo, book_dir=book_dir, book_id=book_id, write_drafts=args.write_drafts
    )

    if args.out:
        out_arg = Path(args.out)
        out_path = out_arg.resolve() if out_arg.is_absolute() else (repo / out_arg).resolve()
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(report + "\n", encoding="utf-8")
        try:
            shown = out_path.relative_to(repo)
        except ValueError:
            shown = out_path
        print(f"Wrote {shown}", file=sys.stderr)
    else:
        print(report)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
