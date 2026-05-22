#!/usr/bin/env python3
"""
Lint the semantic graph for structural quality issues (warnings by default).

Rules: over-connected nodes, duplicate short definitions, ontology terms without glossary
overlay, low-information patterns, empty relationship descriptions.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

SEMANTIC = Path("semantic")
DEGREE_WARN = 12


def _load_yaml(path: Path) -> dict:
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    return raw if isinstance(raw, dict) else {}


def _collapse_ws(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip()).lower()


def _iter_yml(repo: Path) -> list[Path]:
    root = repo / SEMANTIC
    out: list[Path] = []
    for path in sorted(root.rglob("*.yml")):
        if "_drafts" in path.parts:
            continue
        out.append(path)
    return out


def lint(repo: Path, *, strict: bool) -> tuple[list[str], dict]:
    warnings: list[str] = []
    report: dict = {"warnings": [], "stats": {}}

    glossary_defs: dict[str, str] = {}
    pattern_summaries: dict[str, str] = {}
    edge_count: dict[str, int] = defaultdict(int)

    ontology_core: set[str] = set()
    core_path = repo / SEMANTIC / "ontology" / "core-terms.yml"
    if core_path.is_file():
        doc = _load_yaml(core_path)
        for row in doc.get("terms") or []:
            if isinstance(row, dict):
                s = str(row.get("slug", "")).strip()
                if s:
                    ontology_core.add(s)

    glossary_overlay: set[str] = set()
    gloss_dir = repo / SEMANTIC / "glossary"
    if gloss_dir.is_dir():
        for path in gloss_dir.glob("*.yml"):
            glossary_overlay.add(path.stem)
            data = _load_yaml(path)
            sd = _collapse_ws(str(data.get("shortDefinition", "")))
            if sd:
                glossary_defs[path.stem] = sd

    for path in _iter_yml(repo):
        rel = path.relative_to(repo)
        data = _load_yaml(path)
        parts = path.relative_to(repo / SEMANTIC).parts

        if parts and parts[0] == "patterns" and len(parts) == 2:
            slug = path.stem
            forces = data.get("forces")
            if not isinstance(forces, list) or len(forces) < 2:
                warnings.append(f"{rel}: pattern has fewer than two forces")
            summary = _collapse_ws(
                str(data.get("observation", "")) + " " + str(data.get("problem", ""))
            )
            if summary:
                pattern_summaries[slug] = summary

        if path.name == "relationships.yml":
            for row in data.get("relationships") or []:
                if not isinstance(row, dict):
                    continue
                if not str(row.get("description", "")).strip():
                    src = str(row.get("source", "")).strip()
                    tgt = str(row.get("target", "")).strip()
                    warnings.append(f"{rel}: relationship {src!r} -> {tgt!r} has empty description")

        for key in (
            "relatedConcepts",
            "relatedPatterns",
            "relatedSources",
            "relatedBooks",
            "activePatterns",
        ):
            items = data.get(key)
            if not isinstance(items, list):
                continue
            node = path.stem if len(parts) == 2 else ""
            if node:
                edge_count[node] += len(items)
            for item in items:
                s = str(item).strip().removeprefix("concept-").removeprefix("pattern-")
                s = s.removeprefix("source-").removeprefix("book-")
                if s:
                    edge_count[s] += 1

    for slug, degree in sorted(edge_count.items(), key=lambda x: -x[1]):
        if degree >= DEGREE_WARN:
            warnings.append(
                f"over-connected: {slug!r} has {degree} related edges (threshold {DEGREE_WARN})"
            )

    seen_def: dict[str, str] = {}
    for slug, sd in glossary_defs.items():
        if not sd:
            continue
        prev = seen_def.get(sd)
        if prev and prev != slug:
            warnings.append(f"duplicate shortDefinition: {slug!r} and {prev!r}")
        seen_def[sd] = slug

    seen_pat: dict[str, str] = {}
    for slug, text in pattern_summaries.items():
        if len(text) < 40:
            continue
        prev = seen_pat.get(text)
        if prev and prev != slug:
            warnings.append(f"similar pattern summary: {slug!r} and {prev!r}")
        seen_pat[text] = slug

    missing_overlay = sorted(ontology_core - glossary_overlay)
    for slug in missing_overlay[:5]:
        warnings.append(f"ontology core term {slug!r} has no semantic/glossary/{slug}.yml overlay")
    if len(missing_overlay) > 5:
        warnings.append(
            f"ontology: {len(missing_overlay)} core terms lack glossary overlay "
            f"(showing first 5; full list in lint report)"
        )

    report["warnings"] = warnings
    report["stats"] = {
        "glossaryOverlays": len(glossary_overlay),
        "ontologyCoreTerms": len(ontology_core),
        "missingGlossaryOverlays": len(missing_overlay),
        "patterns": len(pattern_summaries),
    }
    return warnings, report


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Exit 1 when any warning is emitted",
    )
    parser.add_argument(
        "--json-out",
        default="",
        help="Write lint report JSON to this path",
    )
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    warnings, report = lint(repo, strict=args.strict)

    if args.json_out:
        out = Path(args.json_out).resolve()
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
        print(str(out))

    if warnings:
        print(f"Semantic lint: {len(warnings)} warning(s)", file=sys.stderr)
        for line in warnings:
            print(f"  {line}", file=sys.stderr)
        if args.strict:
            sys.exit(1)
    else:
        print("Semantic lint: no warnings")
    sys.exit(0)


if __name__ == "__main__":
    main()
