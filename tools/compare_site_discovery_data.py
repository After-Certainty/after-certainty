#!/usr/bin/env python3
"""
Compare frozen site discovery fixtures against authored content / generated manifest.

Migration aid only — not a runtime dependency on after-certainty-site.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

from discovery_manifest import default_work_slug


def _load_json(path: Path) -> object:
    return json.loads(path.read_text(encoding="utf-8"))


def _load_yaml(path: Path) -> object:
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def compare(repo: Path, fixtures: Path) -> list[str]:
    lines: list[str] = ["# Site discovery parity report", ""]
    findings: list[str] = []

    # Content types
    tax = _load_json(fixtures / "catalog-taxonomy.json")
    expected_types = tax.get("contentTypeBySlug") or {}
    for slug, expected in sorted(expected_types.items()):
        found = None
        for path in (repo / "books").rglob("book.yml"):
            doc = _load_yaml(path)
            if isinstance(doc, dict) and str(doc.get("book", {}).get("id")) == slug:
                found = doc["book"].get("content_type", "nonfiction")
                break
        if found != expected:
            findings.append(f"- contentType mismatch `{slug}`: site={expected} content={found}")

    # Overviews
    site_overviews = {
        o["slug"]: o
        for o in (_load_json(fixtures / "book-overviews.json") or {}).get("overviews", [])
    }
    content_overviews: dict[str, dict] = {}
    for path in (repo / "books").rglob("book.yml"):
        doc = _load_yaml(path)
        if not isinstance(doc, dict):
            continue
        book = doc.get("book") or {}
        slug = str(book.get("id") or "")
        if isinstance(book.get("overview"), dict):
            content_overviews[slug] = book["overview"]
    only_site = sorted(set(site_overviews) - set(content_overviews))
    only_content = sorted(set(content_overviews) - set(site_overviews))
    if only_site:
        findings.append(f"- overviews only in site: {', '.join(only_site)}")
    if only_content:
        findings.append(f"- overviews only in content: {', '.join(only_content)}")
    for slug in sorted(set(site_overviews) & set(content_overviews)):
        sq = site_overviews[slug].get("centralQuestion")
        cq = content_overviews[slug].get("centralQuestion")
        if sq != cq:
            findings.append(f"- overview centralQuestion changed for `{slug}`")

    # Questions / trails
    site_q = {
        q["id"]
        for q in (_load_json(fixtures / "questions-manifest.json") or {}).get("questions", [])
    }
    content_q = {p.stem for p in (repo / "semantic/questions").glob("*.yml")}
    if site_q - content_q:
        findings.append(f"- questions only in site: {', '.join(sorted(site_q - content_q))}")
    if content_q - site_q:
        findings.append(f"- questions only in content: {', '.join(sorted(content_q - site_q))}")

    site_t = {
        t["id"] for t in (_load_json(fixtures / "trails-manifest.json") or {}).get("trails", [])
    }
    content_t = {p.stem for p in (repo / "semantic/trails").glob("*.yml")}
    if site_t - content_t:
        findings.append(f"- trails only in site: {', '.join(sorted(site_t - content_t))}")
    if content_t - site_t:
        findings.append(f"- trails only in content: {', '.join(sorted(content_t - site_t))}")

    # Shelves
    site_shelves = {
        s["id"] for s in (_load_json(fixtures / "shelves.json") or {}).get("shelves", [])
    }
    content_shelves = {p.stem for p in (repo / "semantic/shelves").glob("*.yml")}
    if site_shelves - content_shelves:
        findings.append(
            f"- shelves only in site: {', '.join(sorted(site_shelves - content_shelves))}"
        )
    if content_shelves - site_shelves:
        findings.append(
            f"- shelves only in content: {', '.join(sorted(content_shelves - site_shelves))}"
        )

    # Change events: site book_published vs content
    site_events = {
        e["id"]
        for e in (_load_json(fixtures / "whats-new.json") or {}).get("events", [])
        if e.get("type") == "book_published"
    }
    content_events = set()
    for path in (repo / "semantic/change-events").glob("*.yml"):
        doc = _load_yaml(path)
        if isinstance(doc, dict) and doc.get("id"):
            content_events.add(str(doc["id"]))
    if site_events - content_events:
        findings.append(
            f"- book_published events only in site: {', '.join(sorted(site_events - content_events))}"
        )
    if content_events - site_events:
        findings.append(
            f"- book_published events only in content: {', '.join(sorted(content_events - site_events))}"
        )

    remaining_site = [
        e["id"]
        for e in (_load_json(fixtures / "whats-new.json") or {}).get("events", [])
        if e.get("type") in {"site_feature", "podcast_episode"}
    ]

    # Registry work ids
    registry = _load_json(fixtures / "publication-registry.json") or {}
    for edition in registry.get("editions") or []:
        slug = edition.get("slug")
        expected_work = str(edition.get("workId") or "").removeprefix("work-")
        derived = default_work_slug(str(slug))
        # authored override check
        authored = None
        for path in (repo / "books").rglob("book.yml"):
            doc = _load_yaml(path)
            if isinstance(doc, dict) and str(doc.get("book", {}).get("id")) == slug:
                authored = doc["book"].get("work_id") or derived
                break
        if authored and authored != expected_work:
            findings.append(f"- workId mismatch `{slug}`: site={expected_work} content={authored}")

    lines.append("## Summary")
    lines.append("")
    if not findings:
        lines.append("No corpus-field mismatches detected against frozen site fixtures.")
    else:
        lines.append(f"Found {len(findings)} difference(s):")
        lines.extend(findings)
    lines.append("")
    lines.append("## Intentionally remaining on site")
    lines.append("")
    for eid in remaining_site:
        lines.append(f"- `{eid}` (podcast_episode or site_feature)")
    lines.append("- `primaryActionPreference`, shelf `maxPreview`, catalog recommended rank")
    lines.append("- Site-local JSON copies until a later site migration deletes them")
    lines.append("")
    return lines


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".")
    parser.add_argument(
        "--fixtures",
        default="docs/migrations/fixtures/site-discovery",
    )
    parser.add_argument("--out", default="")
    args = parser.parse_args()
    repo = Path(args.repo).resolve()
    fixtures = Path(args.fixtures)
    if not fixtures.is_absolute():
        fixtures = (repo / fixtures).resolve()
    lines = compare(repo, fixtures)
    text = "\n".join(lines) + "\n"
    if args.out:
        out = Path(args.out)
        if not out.is_absolute():
            out = repo / out
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(text, encoding="utf-8")
        print(str(out))
    else:
        print(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
