#!/usr/bin/env python3
"""
Generate semantic-manifest.json: books plus glossary, patterns, sources, relationships,
and ontology metadata. Reuses aggregate book entry fields from manifest_books.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict
from datetime import UTC, datetime
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

from book_specs import (
    discover_book_spec_paths,
    discover_upcoming_spec_paths,
    load_book_spec,
    load_upcoming_spec,
)
from manifest_books import build_book_entry, raw_content_url, resolve_repo_slug
from manifest_markdown import resolve_markdown_units
from pattern_yaml import (
    compose_summary_from_parts,
    normalize_forces_value,
    structured_fields_from_row,
)

SEMANTIC_ROOT = Path("semantic")
ONTOLOGY = SEMANTIC_ROOT / "ontology"


def _load_yaml(path: Path) -> dict:
    if not path.is_file():
        return {}
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    return raw if isinstance(raw, dict) else {}


def concept_id(slug: str) -> str:
    return f"concept-{slug}"


def pattern_id(slug: str) -> str:
    return f"pattern-{slug}"


def situation_id(slug: str) -> str:
    return f"situation-{slug}"


def source_id(slug: str) -> str:
    return f"source-{slug}"


def book_id(slug: str) -> str:
    return f"book-{slug}"


def build_book_media_from_spec(spec: dict) -> dict | None:
    """Map ``book.yml`` ``media`` block to manifest JSON (camelCase keys)."""
    raw = spec.get("media")
    if not isinstance(raw, dict):
        return None
    out: dict = {}
    intro = raw.get("intro")
    if isinstance(intro, dict):
        vid = str(intro.get("youtubeVideoId", "")).strip()
        if vid:
            out["intro"] = {"youtubeVideoId": vid}
    patterns = raw.get("patterns")
    if isinstance(patterns, dict):
        playlist = str(patterns.get("youtubePlaylistUrl", "")).strip()
        if playlist:
            out["patterns"] = {"youtubePlaylistUrl": playlist}
    return out or None


_ISBN_10 = re.compile(r"^\d{9}[\dX]$")
_ISBN_13 = re.compile(r"^97[89]\d{10}$")
_PURCHASE_RETAILERS = frozenset(
    {"amazon", "apple_books", "google_play", "barnes_noble", "bookshop", "other"}
)


def _normalize_isbn(value: str) -> str | None:
    raw = value.strip().replace("-", "").replace(" ", "")
    if not raw:
        return None
    upper = raw.upper()
    if _ISBN_10.match(upper) or _ISBN_13.match(upper):
        return upper
    return None


def build_book_commerce_from_spec(spec: dict) -> dict | None:
    """Map ``book.yml`` ``book.isbns`` / ``book.purchase_links`` to manifest JSON."""
    book = spec.get("book")
    if not isinstance(book, dict):
        return None
    out: dict = {}
    isbns_raw = book.get("isbns")
    if isinstance(isbns_raw, list):
        isbns: list[str] = []
        seen: set[str] = set()
        for item in isbns_raw:
            normalized = _normalize_isbn(str(item))
            if normalized and normalized not in seen:
                seen.add(normalized)
                isbns.append(normalized)
        if isbns:
            out["isbns"] = isbns
    links_raw = book.get("purchase_links")
    if isinstance(links_raw, list):
        purchase_links: list[dict] = []
        for item in links_raw:
            if not isinstance(item, dict):
                continue
            retailer = str(item.get("retailer", "")).strip()
            url = str(item.get("url", "")).strip()
            if retailer not in _PURCHASE_RETAILERS or not url:
                continue
            link: dict = {"retailer": retailer, "url": url}
            label = str(item.get("label", "")).strip()
            if label:
                link["label"] = label
            purchase_links.append(link)
        if purchase_links:
            out["purchaseLinks"] = purchase_links
    return out or None


def _resolve_pattern_media(
    data: dict,
    *,
    repo_slug: str,
    ref: str,
) -> dict:
    """Flatten pattern YAML ``media`` into manifest pattern entry fields."""
    raw = data.get("media")
    if not isinstance(raw, dict):
        return {}
    out: dict = {}
    vid = str(raw.get("youtubeVideoId", "")).strip()
    if vid:
        out["youtubeVideoId"] = vid
    medium = str(raw.get("mediumArticleUrl", "")).strip()
    if medium:
        out["mediumArticleUrl"] = medium
    infographic = raw.get("infographic")
    if isinstance(infographic, dict):
        path = str(infographic.get("path", "")).strip()
        width = infographic.get("width")
        height = infographic.get("height")
        if path and isinstance(width, int) and width > 0 and isinstance(height, int) and height > 0:
            info: dict = {
                "path": path,
                "width": width,
                "height": height,
            }
            if repo_slug:
                info["url"] = raw_content_url(repo_slug, ref, path)
            alt = str(infographic.get("alt", "")).strip()
            if alt:
                info["alt"] = alt
            if "url" in info:
                out["infographic"] = info
    return out


def _normalize_concept_slugs(items: object) -> list[str]:
    if not isinstance(items, list):
        return []
    out: list[str] = []
    for x in items:
        s = str(x).strip()
        if s.startswith("concept-"):
            s = s.removeprefix("concept-")
        if s:
            out.append(s)
    return out


def _normalize_pattern_slugs(items: object) -> list[str]:
    if not isinstance(items, list):
        return []
    out: list[str] = []
    for x in items:
        s = str(x).strip()
        if s.startswith("pattern-"):
            s = s.removeprefix("pattern-")
        if s:
            out.append(s)
    return out


def _normalize_source_slugs(items: object) -> list[str]:
    if not isinstance(items, list):
        return []
    out: list[str] = []
    for x in items:
        s = str(x).strip()
        if s.startswith("source-"):
            s = s.removeprefix("source-")
        if s:
            out.append(s)
    return out


def _normalize_book_slugs(items: object) -> list[str]:
    if not isinstance(items, list):
        return []
    out: list[str] = []
    for x in items:
        s = str(x).strip()
        if s.startswith("book-"):
            s = s.removeprefix("book-")
        if s:
            out.append(s)
    return out


def _mention_pattern_for_title(title: str) -> re.Pattern[str]:
    parts = title.split()
    if len(parts) == 1:
        return re.compile(rf"(?<!\w){re.escape(parts[0])}(?!\w)", re.IGNORECASE)
    inner = r"\s+".join(re.escape(p) for p in parts)
    return re.compile(rf"(?<!\w){inner}(?!\w)", re.IGNORECASE)


def _count_mentions(text: str, title: str) -> int:
    if not title.strip():
        return 0
    pat = _mention_pattern_for_title(title.strip())
    return len(pat.findall(text))


def _collect_book_text(book_dir: Path) -> str:
    parts: list[str] = []
    for unit in resolve_markdown_units(book_dir):
        try:
            parts.append(unit.read_text(encoding="utf-8"))
        except OSError:
            continue
    return "\n".join(parts)


def _load_dir_yml(dir_path: Path) -> dict[str, dict]:
    out: dict[str, dict] = {}
    if not dir_path.is_dir():
        return out
    for path in sorted(dir_path.glob("*.yml")):
        data = _load_yaml(path)
        if not data:
            continue
        slug = str(data.get("slug", path.stem)).strip()
        if slug:
            out[slug] = data
    return out


def _merge_slug_lists(a: list[str], b: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for item in a + b:
        if item in seen:
            continue
        seen.add(item)
        out.append(item)
    return out


def _dynamic_enrichment_fields(data: dict) -> dict:
    """Optional systemic fields (issue #116); included in manifest when present."""
    out: dict = {}
    for key in ("recognitionSignals", "questions", "counterbalances"):
        raw = data.get(key)
        if isinstance(raw, list):
            items = [str(x).strip() for x in raw if str(x).strip()]
            if items:
                out[key] = items
    manifestations = data.get("manifestations")
    if isinstance(manifestations, dict) and manifestations:
        man: dict[str, list[str]] = {}
        for domain, examples in manifestations.items():
            if not isinstance(examples, list):
                continue
            vals = [str(x).strip() for x in examples if str(x).strip()]
            if vals:
                man[str(domain)] = vals
        if man:
            out["manifestations"] = man
    trajectory = data.get("trajectory")
    if isinstance(trajectory, dict) and trajectory:
        traj: dict[str, list[str]] = {}
        for phase in (
            "earlySignals",
            "intensificationSignals",
            "failureModes",
            "restorationPaths",
        ):
            raw = trajectory.get(phase)
            if isinstance(raw, list):
                vals = [str(x).strip() for x in raw if str(x).strip()]
                if vals:
                    traj[phase] = vals
        if traj:
            out["trajectory"] = traj
    return out


def _merge_glossary_entry(base: dict, overlay: dict) -> dict:
    merged = dict(base)
    for key in ("title", "shortDefinition", "longDefinition", "termKind"):
        if key in overlay and overlay[key] not in (None, "", []):
            merged[key] = overlay[key]
    merged.update(_dynamic_enrichment_fields(overlay))

    if overlay.get("relatedConcepts"):
        merged["relatedConcepts"] = _merge_slug_lists(
            merged.get("relatedConcepts", []),
            _normalize_concept_slugs(overlay["relatedConcepts"]),
        )
    if overlay.get("relatedPatterns"):
        merged["relatedPatterns"] = _merge_slug_lists(
            merged.get("relatedPatterns", []),
            _normalize_pattern_slugs(overlay["relatedPatterns"]),
        )
    if overlay.get("relatedBooks"):
        merged["relatedBooks"] = _merge_slug_lists(
            merged.get("relatedBooks", []),
            _normalize_book_slugs(overlay["relatedBooks"]),
        )
    return merged


def build_glossary_entries(
    repo: Path,
    *,
    warn_term_kind: bool,
) -> tuple[dict[str, dict], set[str], set[str]]:
    """Returns (slug -> row with related* as slug lists), core_slugs, supporting_slugs."""
    core_doc = _load_yaml(repo / ONTOLOGY / "core-terms.yml")
    sup_doc = _load_yaml(repo / ONTOLOGY / "supporting-terms.yml")
    core_terms = core_doc.get("terms") if isinstance(core_doc.get("terms"), list) else []
    sup_terms = sup_doc.get("terms") if isinstance(sup_doc.get("terms"), list) else []

    core_slugs: set[str] = set()
    supporting_slugs: set[str] = set()
    by_slug: dict[str, dict] = {}

    for row in core_terms:
        if not isinstance(row, dict):
            continue
        slug = str(row.get("slug", "")).strip()
        title = str(row.get("title", "")).strip() or slug.replace("-", " ").title()
        if not slug:
            continue
        core_slugs.add(slug)
        short = str(row.get("core_concern", "")).strip()
        by_slug[slug] = {
            "slug": slug,
            "title": title,
            "shortDefinition": short,
            "termKind": "core",
            "relatedConcepts": _normalize_concept_slugs(row.get("relatedConcepts")),
            "relatedPatterns": _normalize_pattern_slugs(row.get("relatedPatterns")),
            "relatedBooks": _normalize_book_slugs(row.get("relatedBooks")),
        }

    for row in sup_terms:
        if not isinstance(row, dict):
            continue
        slug = str(row.get("slug", "")).strip()
        title = str(row.get("title", "")).strip() or slug.replace("-", " ").title()
        if not slug:
            continue
        supporting_slugs.add(slug)
        short = str(row.get("why_it_matters", "")).strip()
        by_slug[slug] = {
            "slug": slug,
            "title": title,
            "shortDefinition": short,
            "termKind": "supporting",
            "relatedConcepts": _normalize_concept_slugs(row.get("relatedConcepts")),
            "relatedPatterns": _normalize_pattern_slugs(row.get("relatedPatterns")),
            "relatedBooks": _normalize_book_slugs(row.get("relatedBooks")),
        }

    overlays = _load_dir_yml(repo / SEMANTIC_ROOT / "glossary")
    for slug, ov in overlays.items():
        declared = str(ov.get("termKind", "")).strip().lower()
        if slug in core_slugs:
            base = by_slug.get(slug, {})
            merged = _merge_glossary_entry(base, ov)
            merged["termKind"] = "core"
            if warn_term_kind and declared in ("extended", "supporting"):
                print(
                    f"Warning: glossary/{slug}.yml declares termKind={declared!r} but slug is a core ontology term; forcing core.",
                    file=sys.stderr,
                )
            by_slug[slug] = merged
        elif slug in supporting_slugs:
            base = by_slug.get(slug, {})
            merged = _merge_glossary_entry(base, ov)
            merged["termKind"] = "supporting"
            if warn_term_kind and declared == "extended":
                print(
                    f"Warning: glossary/{slug}.yml declares termKind=extended but slug is a supporting ontology term; forcing supporting.",
                    file=sys.stderr,
                )
            by_slug[slug] = merged
        else:
            entry = {
                "slug": slug,
                "title": str(ov.get("title", slug)).strip(),
                "shortDefinition": str(ov.get("shortDefinition", "")).strip(),
                "termKind": declared
                if declared in ("core", "supporting", "extended")
                else "extended",
                "relatedConcepts": _normalize_concept_slugs(ov.get("relatedConcepts")),
                "relatedPatterns": _normalize_pattern_slugs(ov.get("relatedPatterns")),
                "relatedBooks": _normalize_book_slugs(ov.get("relatedBooks")),
            }
            if ov.get("longDefinition"):
                entry["longDefinition"] = str(ov.get("longDefinition")).strip()
            entry.update(_dynamic_enrichment_fields(ov))
            by_slug[slug] = entry

    return by_slug, core_slugs, supporting_slugs


def _finalize_glossary_list(by_slug: dict[str, dict]) -> list[dict]:
    out: list[dict] = []
    for slug in sorted(by_slug.keys()):
        row = dict(by_slug[slug])
        row["id"] = concept_id(slug)
        row["relatedConcepts"] = [concept_id(s) for s in row.get("relatedConcepts", [])]
        row["relatedPatterns"] = [pattern_id(s) for s in row.get("relatedPatterns", [])]
        row["relatedBooks"] = [book_id(s) for s in row.get("relatedBooks", [])]

        tk = str(row.get("termKind", "extended")).strip()
        if tk not in ("core", "supporting", "extended"):
            tk = "extended"
        row["termKind"] = tk
        row["isCoreTerm"] = tk == "core"
        long_def = str(row.get("longDefinition", "")).strip()
        if long_def:
            row["definition"] = long_def
        row.update(_dynamic_enrichment_fields(row))
        out.append(row)
    return out


def build_patterns(repo: Path, *, repo_slug: str, ref: str) -> list[dict]:
    raw = _load_dir_yml(repo / SEMANTIC_ROOT / "patterns")
    out: list[dict] = []
    for slug in sorted(raw.keys()):
        data = raw[slug]
        parts = structured_fields_from_row(data)
        summary = compose_summary_from_parts(parts)
        forces_list = normalize_forces_value(parts.get("forces"))
        entry = {
            "id": pattern_id(slug),
            "slug": slug,
            "title": str(data.get("title", slug)).strip(),
            "summary": summary,
            "relatedConcepts": [
                concept_id(s) for s in _normalize_concept_slugs(data.get("relatedConcepts"))
            ],
            "relatedPatterns": [
                pattern_id(s) for s in _normalize_pattern_slugs(data.get("relatedPatterns"))
            ],
            "relatedBooks": [book_id(s) for s in _normalize_book_slugs(data.get("relatedBooks"))],
            "relatedSources": [
                source_id(s) for s in _normalize_source_slugs(data.get("relatedSources"))
            ],
        }
        # Optional narrative fields for structured JSON-LD (hasPart/articleSection)
        if setup := str(parts.get("setup", "") or ""):
            entry["setup"] = setup
        if problem := str(parts.get("problem", "") or ""):
            entry["problem"] = problem
        if forces_list:
            entry["forces"] = forces_list
        if observation := str(parts.get("observation", "") or ""):
            entry["observation"] = observation
        if example := str(parts.get("example", "") or ""):
            entry["example"] = example
        entry.update(_resolve_pattern_media(data, repo_slug=repo_slug, ref=ref))
        entry.update(_dynamic_enrichment_fields(data))
        out.append(entry)
    return out


def build_situations(repo: Path) -> list[dict]:
    raw = _load_dir_yml(repo / SEMANTIC_ROOT / "situations")
    out: list[dict] = []
    for slug in sorted(raw.keys()):
        data = raw[slug]
        entry = {
            "id": situation_id(slug),
            "slug": slug,
            "title": str(data.get("title", slug)).strip(),
            "summary": str(data.get("summary", "")).strip(),
            "activePatterns": [
                pattern_id(s) for s in _normalize_pattern_slugs(data.get("activePatterns"))
            ],
            "relatedConcepts": [
                concept_id(s) for s in _normalize_concept_slugs(data.get("relatedConcepts"))
            ],
            "relatedBooks": [book_id(s) for s in _normalize_book_slugs(data.get("relatedBooks"))],
        }
        entry.update(_dynamic_enrichment_fields(data))
        out.append(entry)
    return out


def build_sources(repo: Path) -> list[dict]:
    raw = _load_dir_yml(repo / SEMANTIC_ROOT / "sources")
    out: list[dict] = []
    for slug in sorted(raw.keys()):
        data = raw[slug]
        entry = {
            "id": source_id(slug),
            "slug": slug,
            "name": str(data.get("name", slug)).strip(),
            "type": str(data.get("type", "person")).strip() or "person",
            "summary": str(data.get("summary", "")).strip(),
            "concepts": [concept_id(s) for s in _normalize_concept_slugs(data.get("concepts"))],
            "patterns": [pattern_id(s) for s in _normalize_pattern_slugs(data.get("patterns"))],
            "relatedBooks": [book_id(s) for s in _normalize_book_slugs(data.get("relatedBooks"))],
        }
        out.append(entry)
    return out


def build_relationships(repo: Path) -> list[dict]:
    rels: list[dict] = []

    tensions_doc = _load_yaml(repo / ONTOLOGY / "structural-tensions.yml")
    tensions = (
        tensions_doc.get("tensions") if isinstance(tensions_doc.get("tensions"), list) else []
    )
    for row in tensions:
        if not isinstance(row, dict):
            continue
        a = str(row.get("source", "")).strip()
        b = str(row.get("target", "")).strip()
        desc = str(row.get("description", "")).strip()
        if not a or not b:
            continue
        rels.append(
            {
                "source": concept_id(a),
                "target": concept_id(b),
                "relationship": "structural_tension",
                "description": desc,
            }
        )

    extra = _load_yaml(repo / SEMANTIC_ROOT / "relationships.yml")
    extra_rows = extra.get("relationships") if isinstance(extra.get("relationships"), list) else []
    for row in extra_rows:
        if not isinstance(row, dict):
            continue
        a = str(row.get("source", "")).strip()
        b = str(row.get("target", "")).strip()
        verb = str(row.get("relationship", "")).strip() or "related"
        desc = str(row.get("description", "")).strip()
        sk = str(row.get("sourceKind", "concept")).strip().lower()
        tk = str(row.get("targetKind", "concept")).strip().lower()

        def to_id(kind: str, slug: str) -> str:
            if kind == "pattern":
                return pattern_id(slug)
            if kind == "source":
                return source_id(slug)
            return concept_id(slug)

        if not a or not b:
            continue
        rels.append(
            {
                "source": to_id(sk, a),
                "target": to_id(tk, b),
                "relationship": verb,
                "description": desc,
            }
        )
    return rels


def _reverse_index_entities(
    glossary: list[dict], patterns: list[dict], sources: list[dict]
) -> dict[str, dict[str, set[str]]]:
    idx: dict[str, dict[str, set[str]]] = defaultdict(
        lambda: {"concepts": set(), "patterns": set(), "sources": set()}
    )

    source_by_id = {s["id"]: s for s in sources}

    for g in glossary:
        for bid in g.get("relatedBooks") or []:
            slug = str(bid).removeprefix("book-")
            idx[slug]["concepts"].add(g["id"])

    for p in patterns:
        for bid in p.get("relatedBooks") or []:
            slug = str(bid).removeprefix("book-")
            idx[slug]["patterns"].add(p["id"])

        p_books = {str(bid).removeprefix("book-") for bid in (p.get("relatedBooks") or [])}
        for sid in p.get("relatedSources") or []:
            srow = source_by_id.get(sid)
            if not isinstance(srow, dict):
                continue
            s_books = {str(bid).removeprefix("book-") for bid in (srow.get("relatedBooks") or [])}
            if not s_books:
                continue
            target = (p_books & s_books) if p_books else s_books
            for bslug in target:
                idx[bslug]["sources"].add(sid)

    for s in sources:
        for bid in s.get("relatedBooks") or []:
            slug = str(bid).removeprefix("book-")
            idx[slug]["sources"].add(s["id"])
            for cid in s.get("concepts") or []:
                idx[slug]["concepts"].add(cid)

    return idx


def _book_entry_score(entry: dict) -> int:
    score = 0
    if str(entry.get("source", "")) == "books":
        score += 8
    if str(entry.get("status", "")) == "published":
        score += 4
    for fmt in ("docx", "epub", "pdf"):
        block = entry.get(fmt)
        if isinstance(block, dict) and block.get("enabled") and block.get("url"):
            score += 1
    return score


def _dedupe_book_entries_by_slug(books: list[dict]) -> list[dict]:
    """Prefer promoted `books/` rows when legacy manifests still list `upcoming/` duplicates."""
    by_slug: dict[str, dict] = {}
    for entry in books:
        slug = str(entry.get("slug", "")).strip()
        if not slug:
            continue
        prev = by_slug.get(slug)
        if prev is None or _book_entry_score(entry) > _book_entry_score(prev):
            by_slug[slug] = entry
    return sorted(by_slug.values(), key=lambda item: (item["slug"], item.get("source", "")))


def _enriched_books(
    base_books: list[dict],
    rev: dict[str, dict[str, set[str]]],
    book_media_by_slug: dict[str, dict],
    book_commerce_by_slug: dict[str, dict],
) -> list[dict]:
    out: list[dict] = []
    for b in base_books:
        slug = str(b["slug"])
        nb = dict(b)
        nb["id"] = book_id(slug)
        desc = b.get("description")
        nb["summary"] = desc if isinstance(desc, str) else None
        sets = rev.get(slug, {"concepts": set(), "patterns": set(), "sources": set()})
        nb["concepts"] = sorted(sets["concepts"])
        nb["patterns"] = sorted(sets["patterns"])
        nb["sources"] = sorted(sets["sources"])
        media = book_media_by_slug.get(slug)
        if media:
            nb["media"] = media
        commerce = book_commerce_by_slug.get(slug)
        if commerce:
            if "isbns" in commerce:
                nb["isbns"] = commerce["isbns"]
            if "purchaseLinks" in commerce:
                nb["purchaseLinks"] = commerce["purchaseLinks"]
        out.append(nb)
    out.sort(key=lambda x: (x["slug"], x["source"]))
    return out


def _apply_mentions(
    base_books: list[dict],
    glossary: list[dict],
    repo: Path,
    *,
    scan_slugs: set[str],
) -> None:
    book_dirs: dict[str, Path] = {}
    for b in base_books:
        book_dirs[str(b["slug"])] = (repo / str(b["bookDir"])).resolve()

    for g in glossary:
        slug = g["slug"]
        if slug not in scan_slugs:
            continue
        title = str(g.get("title", ""))
        mentions: dict[str, int] = {}
        for b in base_books:
            slug_b = str(b["slug"])
            bdir = book_dirs.get(slug_b)
            if not bdir or not bdir.is_dir():
                continue
            text = _collect_book_text(bdir)
            c = _count_mentions(text, title)
            if c:
                mentions[book_id(slug_b)] = c
        if mentions:
            g["mentionsByBook"] = mentions


def build_ontology_block(repo: Path) -> dict:
    master_doc = _load_yaml(repo / ONTOLOGY / "master-terms.yml")
    pressure_doc = _load_yaml(repo / ONTOLOGY / "structural-pressures.yml")
    master_entries = (
        master_doc.get("entries") if isinstance(master_doc.get("entries"), list) else []
    )
    pressure_entries = (
        pressure_doc.get("entries") if isinstance(pressure_doc.get("entries"), list) else []
    )

    master_terms: list[dict] = []
    for row in master_entries:
        if not isinstance(row, dict):
            continue
        slug = str(row.get("slug", "")).strip()
        if not slug:
            continue
        master_terms.append(
            {
                "id": concept_id(slug),
                "slug": slug,
                "title": str(row.get("title", "")).strip() or slug.replace("-", " ").title(),
                "preserves": str(row.get("preserves", "")).strip(),
            }
        )

    structural_pressures: list[dict] = []
    for row in pressure_entries:
        if not isinstance(row, dict):
            continue
        slug = str(row.get("slug", "")).strip()
        if not slug:
            continue
        structural_pressures.append(
            {
                "id": concept_id(slug),
                "slug": slug,
                "title": str(row.get("title", "")).strip() or slug.replace("-", " ").title(),
                "effect": str(row.get("effect", "")).strip(),
            }
        )

    return {"masterTerms": master_terms, "structuralPressures": structural_pressures}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument("--out", required=True, help="Output JSON path")
    parser.add_argument(
        "--github-repository",
        default="",
        help="GitHub repository slug (owner/repo). If omitted, derive from git origin.",
    )
    parser.add_argument("--github-ref", default="main", help="Git ref used for raw content URLs")
    parser.add_argument(
        "--release-tag", default="latest", help="GitHub release tag for export assets"
    )
    parser.add_argument(
        "--warn-term-kind",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="Warn when glossary YAML termKind disagrees with ontology (default: true)",
    )
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    repo_slug = resolve_repo_slug(repo, args.github_repository)

    base_books: list[dict] = []
    published_slugs: set[str] = set()
    book_media_by_slug: dict[str, dict] = {}
    book_commerce_by_slug: dict[str, dict] = {}
    for spec_path in discover_book_spec_paths(repo):
        spec = load_book_spec(spec_path)
        entry = build_book_entry(
            repo=repo,
            spec_path=spec_path,
            spec=spec,
            repo_slug=repo_slug,
            ref=args.github_ref,
            release_tag=args.release_tag,
            source="books",
            status="published",
        )
        base_books.append(entry)
        published_slugs.add(str(entry["slug"]))
        media = build_book_media_from_spec(spec)
        if media:
            book_media_by_slug[str(entry["slug"])] = media
        commerce = build_book_commerce_from_spec(spec)
        if commerce:
            book_commerce_by_slug[str(entry["slug"])] = commerce
    for spec_path in discover_upcoming_spec_paths(repo):
        spec = load_upcoming_spec(spec_path)
        book = spec.get("book", {})
        slug = str(book.get("id", "")).strip()
        if slug and slug in published_slugs:
            continue
        upcoming = spec.get("upcoming", {})
        entry = build_book_entry(
            repo=repo,
            spec_path=spec_path,
            spec=spec,
            repo_slug=repo_slug,
            ref=args.github_ref,
            release_tag=args.release_tag,
            source="upcoming",
            status=str(upcoming.get("status", "in_progress")).strip() or "in_progress",
        )
        base_books.append(entry)
        media = build_book_media_from_spec(spec)
        if media:
            book_media_by_slug[str(entry["slug"])] = media
        commerce = build_book_commerce_from_spec(spec)
        if commerce:
            book_commerce_by_slug[str(entry["slug"])] = commerce
    base_books = _dedupe_book_entries_by_slug(base_books)

    by_gloss, core_slugs, supporting_slugs = build_glossary_entries(
        repo, warn_term_kind=args.warn_term_kind
    )
    glossary = _finalize_glossary_list(by_gloss)
    patterns = build_patterns(repo, repo_slug=repo_slug, ref=args.github_ref)
    situations = build_situations(repo)
    sources = build_sources(repo)
    relationships = build_relationships(repo)
    rev = _reverse_index_entities(glossary, patterns, sources)
    books = _enriched_books(base_books, rev, book_media_by_slug, book_commerce_by_slug)

    scan_slugs = set(core_slugs) | set(supporting_slugs)
    _apply_mentions(base_books, glossary, repo, scan_slugs=scan_slugs)

    payload = {
        "manifestVersion": 1,
        "generatedAt": datetime.now(UTC).isoformat(),
        "repository": repo_slug or None,
        "ref": args.github_ref,
        "releaseTag": args.release_tag,
        "books": books,
        "glossary": glossary,
        "patterns": patterns,
        "situations": situations,
        "sources": sources,
        "relationships": relationships,
        "ontology": build_ontology_block(repo),
    }

    out_path = Path(args.out).resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(str(out_path))


if __name__ == "__main__":
    main()
