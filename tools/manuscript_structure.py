"""
Parse book manuscript structure (parts/chapters) from index.md for the semantic manifest.

Stable IDs prefer source-path stems so title renames do not break references.
Optional authored enrichment lives in books/<slug>/chapter-enrichment.yml.
"""

from __future__ import annotations

import math
import re
import sys
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

_SCRIPTS = Path(__file__).resolve().parent.parent / "scripts"
if str(_SCRIPTS) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS))

from assemble import (  # noqa: E402
    MD_LINK_RE,
    PART_HEADING_RE,
    assemble_index_sections,
    resolve_book_markdown,
    slugify_heading,
)

WORDS_PER_MINUTE = 220
WORD_RE = re.compile(r"[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)?")

CHAPTER_KINDS = frozenset(
    {
        "introduction",
        "chapter",
        "bridge",
        "interlude",
        "conclusion",
        "appendix",
        "afterword",
        "notes",
        "other",
    }
)

_FRONT_BACK = frozenset(
    {
        "front-matter",
        "front matter",
        "back-matter",
        "back matter",
        "related books",
        "contents",
    }
)


def count_words(text: str) -> int:
    return len(WORD_RE.findall(text))


def reading_minutes(word_count: int, *, wpm: int = WORDS_PER_MINUTE) -> int:
    if word_count <= 0:
        return 0
    return max(1, math.ceil(word_count / wpm))


def infer_unit_kind(rel_path: str, title: str) -> str:
    stem = Path(rel_path).stem.lower()
    lower_title = title.lower()
    combined = f"{stem} {lower_title}"
    if "introduction" in combined or stem.startswith("introduction"):
        return "introduction"
    if "conclusion" in combined or stem.startswith("conclusion"):
        return "conclusion"
    if "epilogue" in combined or "afterword" in combined:
        return "afterword"
    if "appendix" in combined:
        return "appendix"
    if "bridge" in combined or stem == "bridge":
        return "bridge"
    if "interlude" in combined:
        return "interlude"
    if "note" in stem and "authors" not in stem:
        return "notes"
    if "chapter" in stem or re.search(r"\bchapter\b", lower_title):
        return "chapter"
    # Poetry / act units without "chapter" in the name
    if "/parts/" in rel_path.replace("\\", "/") or "/manuscript/" in rel_path.replace("\\", "/"):
        if stem in {"bridge"}:
            return "bridge"
        return "chapter"
    return "other"


def _link_title_map(index_text: str) -> dict[str, str]:
    """Map relative .md targets to display titles from index.md links."""
    out: dict[str, str] = {}
    for m in re.finditer(r"\[([^\]]+)\]\(([^)]+\.md)\)", index_text):
        title = m.group(1).strip()
        rel = m.group(2).strip()
        out[rel] = title
    return out


def _part_slug_for_paths(heading: str, paths: list[Path], book_dir: Path) -> str:
    for path in paths:
        try:
            rel = path.relative_to(book_dir)
        except ValueError:
            continue
        parts = rel.parts
        for marker in ("parts", "manuscript"):
            if marker in parts:
                idx = parts.index(marker)
                if idx + 1 < len(parts):
                    candidate = parts[idx + 1]
                    if path.suffix == ".md" and idx + 1 == len(parts) - 1:
                        # Flat file under parts/ — use heading slug
                        break
                    return candidate
    return slugify_heading(heading)


def load_chapter_enrichment(book_dir: Path) -> dict[str, dict]:
    path = book_dir / "chapter-enrichment.yml"
    if not path.is_file():
        return {}
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(raw, dict):
        return {}
    chapters = raw.get("chapters")
    if not isinstance(chapters, list):
        return {}
    by_key: dict[str, dict] = {}
    for row in chapters:
        if not isinstance(row, dict):
            continue
        cid = str(row.get("id") or "").strip()
        source = str(row.get("sourcePath") or row.get("source") or "").strip()
        if cid:
            by_key[cid] = row
        if source:
            by_key[source] = row
    return by_key


def build_structure_for_book(
    book_dir: Path,
    *,
    edition_slug: str,
    work_id: str,
    edition_id: str,
    public: bool = True,
    enrichment: dict[str, dict] | None = None,
) -> tuple[list[dict], list[dict]]:
    """
    Return (parts, chapters) for one book directory.

    Raises FileNotFoundError if index.md is missing.
    Raises ValueError on duplicate IDs or missing linked sources that appear in the index.
    """
    book_dir = book_dir.resolve()
    index = book_dir / "index.md"
    if not index.is_file():
        raise FileNotFoundError(f"Missing index.md in {book_dir}")

    index_text = index.read_text(encoding="utf-8")
    title_by_rel = _link_title_map(index_text)
    enrichment = enrichment if enrichment is not None else load_chapter_enrichment(book_dir)

    # Validate that every in-book .md link resolves (hard fail for missing sources).
    missing: list[str] = []
    for rel in title_by_rel:
        if resolve_book_markdown(book_dir, rel) is None:
            # Out-of-book links (e.g. series guide) are ignored by resolve_book_markdown
            candidate = (book_dir / rel).resolve()
            try:
                candidate.relative_to(book_dir.resolve())
            except ValueError:
                continue
            if not candidate.is_file():
                missing.append(rel)
    if missing:
        raise ValueError(f"{edition_slug}: missing chapter source files: {missing}")

    sections = assemble_index_sections(book_dir)
    parts: list[dict] = []
    chapters: list[dict] = []
    seen_chapter_ids: set[str] = set()
    seen_part_ids: set[str] = set()
    seen_source_paths: set[str] = set()
    chapter_position = 0
    part_position = 0

    for section in sections:
        heading_lower = section.heading.strip().lower()
        is_part = bool(PART_HEADING_RE.match(section.heading))
        is_structural = heading_lower in _FRONT_BACK or is_part

        part_id: str | None = None
        part_title: str | None = None
        if is_part:
            part_position += 1
            part_slug = _part_slug_for_paths(section.heading, list(section.paths), book_dir)
            part_id = f"part-{edition_slug}-{part_slug}"
            if part_id in seen_part_ids:
                part_id = f"{part_id}-{part_position}"
            seen_part_ids.add(part_id)
            part_title = section.heading.strip()
            parts.append(
                {
                    "id": part_id,
                    "workId": work_id,
                    "editionId": edition_id,
                    "title": part_title,
                    "position": part_position,
                    "slug": part_slug,
                }
            )
        elif not is_structural:
            # Non-part section (e.g. "Chapters") — units still exported
            pass

        for path in section.paths:
            try:
                rel = path.relative_to(book_dir).as_posix()
            except ValueError:
                continue
            if rel in seen_source_paths:
                continue
            # Skip generated front-matter boilerplate that is not reading content
            stem = path.stem.lower()
            if stem in {
                "title-page",
                "copyright",
                "about-the-series",
                "about-this-book",
                "note-on-examples",
                "authors-note",
                "how-to-read-this-book",
                "how-to-read-this-history",
                "series-guide",
            }:
                continue
            if "bibliography" in stem or stem == "references":
                continue

            title = title_by_rel.get(rel) or path.stem.replace("-", " ").title()
            kind = infer_unit_kind(rel, title)
            # Prefer full relative path (sans extension) so duplicate stems like bridge.md stay unique.
            source_key = rel.rsplit(".", 1)[0].replace("/", "-").replace("\\", "-")
            chapter_id = f"chapter-{edition_slug}-{source_key}"
            authored = (
                enrichment.get(chapter_id) or enrichment.get(rel) or enrichment.get(path.stem) or {}
            )
            override_id = str(authored.get("id") or "").strip()
            if override_id:
                chapter_id = override_id

            if chapter_id in seen_chapter_ids:
                raise ValueError(f"{edition_slug}: duplicate chapter id {chapter_id!r}")
            seen_chapter_ids.add(chapter_id)
            seen_source_paths.add(rel)

            chapter_position += 1
            text = path.read_text(encoding="utf-8")
            words = count_words(text)
            route_stem = source_key
            entry: dict = {
                "id": chapter_id,
                "workId": work_id,
                "editionId": edition_id,
                "title": title,
                "position": chapter_position,
                "kind": kind if kind in CHAPTER_KINDS else "other",
                "sourcePath": rel,
                "wordCount": words,
                "estimatedReadingMinutes": reading_minutes(words),
                "public": bool(public),
                "routeKey": f"/explore/books/{edition_slug}/chapters/{route_stem}",
            }
            if part_id:
                entry["partId"] = part_id
            if part_title:
                entry["partTitle"] = part_title

            summary = str(authored.get("summary") or "").strip()
            if summary:
                entry["summary"] = summary
            cq = str(authored.get("centralQuestion") or "").strip()
            if cq:
                entry["centralQuestion"] = cq
            concepts = authored.get("selectedConcepts") or []
            if isinstance(concepts, list) and concepts:
                entry["selectedConceptIds"] = [
                    f"concept-{str(c).strip()}" for c in concepts if str(c).strip()
                ]
            patterns = authored.get("selectedPatterns") or []
            if isinstance(patterns, list) and patterns:
                entry["selectedPatternIds"] = [
                    f"pattern-{str(p).strip()}" for p in patterns if str(p).strip()
                ]
            aliases = authored.get("searchAliases") or []
            if isinstance(aliases, list) and aliases:
                entry["searchAliases"] = [str(a).strip() for a in aliases if str(a).strip()]
            situations = authored.get("situations") or authored.get("situationIds") or []
            if isinstance(situations, list) and situations:
                entry["situationIds"] = [
                    (s if str(s).startswith("situation-") else f"situation-{str(s).strip()}")
                    for s in situations
                    if str(s).strip()
                ]
            transition = str(authored.get("readingTransition") or "").strip()
            if transition:
                entry["readingTransition"] = transition

            chapters.append(entry)

    return parts, chapters


def build_all_structures(
    repo: Path,
    books: list[dict],
    specs_by_slug: dict[str, dict],
) -> tuple[list[dict], list[dict]]:
    """Build parts/chapters for all public published books; skip upcoming/hidden."""
    from book_specs import discover_book_spec_paths

    all_parts: list[dict] = []
    all_chapters: list[dict] = []
    slug_to_dir: dict[str, Path] = {}
    for spec_path in discover_book_spec_paths(repo):
        book_dir = spec_path.parent
        try:
            raw = yaml.safe_load(spec_path.read_text(encoding="utf-8"))
        except (OSError, yaml.YAMLError):
            continue
        if not isinstance(raw, dict):
            continue
        bid = str((raw.get("book") or {}).get("id") or "").strip()
        if bid:
            slug_to_dir[bid] = book_dir
    _ = specs_by_slug  # reserved for future enrichment from specs

    for book in sorted(books, key=lambda b: str(b.get("slug") or "")):
        if str(book.get("source") or "") != "books":
            continue
        if str(book.get("publicStatus") or book.get("status") or "") in {
            "archived",
            "superseded",
            "draft",
        }:
            continue
        slug = str(book.get("slug") or "")
        book_dir = slug_to_dir.get(slug)
        if book_dir is None or not (book_dir / "index.md").is_file():
            continue
        work_id = str(book.get("workId") or f"work-{slug}")
        edition_id = str(book.get("editionId") or book.get("id") or f"book-{slug}")
        parts, chapters = build_structure_for_book(
            book_dir,
            edition_slug=slug,
            work_id=work_id,
            edition_id=edition_id,
            public=True,
        )
        all_parts.extend(parts)
        all_chapters.extend(chapters)

    all_parts.sort(key=lambda p: (str(p["editionId"]), int(p["position"])))
    all_chapters.sort(key=lambda c: (str(c["editionId"]), int(c["position"])))
    return all_parts, all_chapters


# Silence unused import lint for MD_LINK_RE when only used indirectly
_ = MD_LINK_RE
