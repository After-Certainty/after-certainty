#!/usr/bin/env python3
"""
Validate semantic YAML entities against schema/semantic/*.json and reference integrity.

Exit code 1 on schema errors, slug/filename mismatches, or invalid references (--strict-refs).
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path

try:
    import jsonschema
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit(
        "PyYAML and jsonschema are required. Install with: python3 -m pip install pyyaml jsonschema"
    ) from exc

from book_specs import (
    discover_book_spec_paths,
    discover_upcoming_spec_paths,
    load_book_spec,
    load_upcoming_spec,
)

SEMANTIC = Path("semantic")
SCHEMA_DIR = Path("schema") / "semantic"
SLUG_PARENTS = frozenset({"glossary", "patterns", "sources", "situations", "thinkers"})

ONTOLOGY_SCHEMA_BY_NAME = {
    "core-terms.yml": "ontology-core-terms.schema.json",
    "supporting-terms.yml": "ontology-supporting-terms.schema.json",
    "master-terms.yml": "ontology-master-terms.schema.json",
    "structural-pressures.yml": "ontology-structural-pressures.schema.json",
    "structural-tensions.yml": "ontology-structural-tensions.schema.json",
}

DIR_SCHEMA = {
    "glossary": "glossary-entry.schema.json",
    "patterns": "pattern-entry.schema.json",
    "sources": "source-entry.schema.json",
    "situations": "situation-entry.schema.json",
    "thinkers": "thinker-entry.schema.json",
}


def _load_yaml(path: Path) -> object:
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def _schema_store(repo: Path) -> dict[str, object]:
    store: dict[str, object] = {}
    for path in sorted(SCHEMA_DIR.glob("*.json")):
        doc = json.loads(path.read_text(encoding="utf-8"))
        sid = str(doc.get("$id", "")).strip()
        if sid:
            store[sid] = doc
        store[path.name] = doc
        store[path.resolve().as_uri()] = doc
    return store


def _validator(schema: dict, store: dict[str, object]) -> jsonschema.protocols.Validator:
    resolver = jsonschema.RefResolver.from_schema(schema, store=store)
    return jsonschema.Draft202012Validator(schema, resolver=resolver)


def _iter_semantic_yml(repo: Path, *, include_drafts: bool) -> list[Path]:
    root = repo / SEMANTIC
    paths: list[Path] = []
    for path in sorted(root.rglob("*.yml")):
        if not include_drafts and "_drafts" in path.relative_to(root).parts:
            continue
        paths.append(path)
    return paths


def _schema_for_path(repo: Path, path: Path) -> tuple[dict, str] | None:
    rel = path.relative_to(repo / SEMANTIC)
    parts = rel.parts
    if not parts:
        return None
    if parts[0] == "ontology" and len(parts) == 2:
        name = ONTOLOGY_SCHEMA_BY_NAME.get(parts[1])
        if name:
            return json.loads((repo / SCHEMA_DIR / name).read_text(encoding="utf-8")), name
        return None
    if path.name == "relationships.yml" and parts == ("relationships.yml",):
        name = "relationships-file.schema.json"
        return json.loads((repo / SCHEMA_DIR / name).read_text(encoding="utf-8")), name
    if parts[0] in DIR_SCHEMA and len(parts) == 2:
        name = DIR_SCHEMA[parts[0]]
        return json.loads((repo / SCHEMA_DIR / name).read_text(encoding="utf-8")), name
    return None


def _collect_ontology_concept_slugs(repo: Path) -> set[str]:
    slugs: set[str] = set()
    for fname in ("core-terms.yml", "supporting-terms.yml"):
        path = repo / SEMANTIC / "ontology" / fname
        if not path.is_file():
            continue
        doc = _load_yaml(path)
        if not isinstance(doc, dict):
            continue
        for row in doc.get("terms") or []:
            if isinstance(row, dict):
                s = str(row.get("slug", "")).strip()
                if s:
                    slugs.add(s)
    return slugs


def _collect_dir_slugs(repo: Path, subdir: str) -> set[str]:
    slugs: set[str] = set()
    dir_path = repo / SEMANTIC / subdir
    if not dir_path.is_dir():
        return slugs
    for path in dir_path.glob("*.yml"):
        doc = _load_yaml(path)
        if isinstance(doc, dict):
            s = str(doc.get("slug", path.stem)).strip()
            if s:
                slugs.add(s)
    return slugs


def _collect_book_slugs(repo: Path) -> set[str]:
    slugs: set[str] = set()
    for spec_path in discover_book_spec_paths(repo):
        spec = load_book_spec(spec_path)
        book = spec.get("book", {})
        bid = str(book.get("id", "")).strip()
        if bid:
            slugs.add(bid)
        for alias in book.get("slug_aliases") or []:
            a = str(alias).strip()
            if a:
                slugs.add(a)
    for spec_path in discover_upcoming_spec_paths(repo):
        spec = load_upcoming_spec(spec_path)
        book = spec.get("book", {})
        bid = str(book.get("id", "")).strip()
        if bid:
            slugs.add(bid)
    return slugs


def _normalize_ref_slug(raw: str, kind: str) -> str:
    s = str(raw).strip()
    prefix = {"concept": "concept-", "pattern": "pattern-", "source": "source-", "book": "book-"}[
        kind
    ]
    if s.startswith(prefix):
        return s.removeprefix(prefix)
    return s


def _check_refs_in_doc(
    doc: dict,
    *,
    concepts: set[str],
    patterns: set[str],
    sources: set[str],
    books: set[str],
    path: Path,
    errors: list[str],
) -> None:
    ref_fields = (
        ("relatedConcepts", concepts, "concept"),
        ("concepts", concepts, "concept"),
        ("relatedPatterns", patterns, "pattern"),
        ("patterns", patterns, "pattern"),
        ("relatedSources", sources, "source"),
        ("works", sources, "source"),
        ("activePatterns", patterns, "pattern"),
        ("relatedBooks", books, "book"),
    )
    for key, allowed, kind in ref_fields:
        items = doc.get(key)
        if not isinstance(items, list):
            continue
        for raw in items:
            s = _normalize_ref_slug(raw, kind)
            if s and s not in allowed:
                errors.append(f"{path}: {key} references unknown slug {s!r}")


def _check_relationships_file(
    repo: Path,
    path: Path,
    *,
    concepts: set[str],
    errors: list[str],
    strict_refs: bool,
) -> None:
    doc = _load_yaml(path)
    if not isinstance(doc, dict):
        return
    rows = doc.get("relationships")
    if not isinstance(rows, list):
        return
    for i, row in enumerate(rows):
        if not isinstance(row, dict):
            continue
        for side in ("source", "target"):
            s = str(row.get(side, "")).strip()
            if s and s not in concepts:
                msg = f"{path}: relationships[{i}].{side} unknown concept slug {s!r}"
                errors.append(msg)


def _manifest_round_trip(repo: Path, errors: list[str]) -> None:
    gen = repo / "tools" / "generate_semantic_manifest.py"
    val = repo / "tools" / "validate_semantic_manifest.py"
    if not gen.is_file() or not val.is_file():
        return
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "semantic-manifest.json"
        r = subprocess.run(
            [
                sys.executable,
                str(gen),
                "--repo",
                str(repo),
                "--out",
                str(out),
                "--github-repository",
                "test-owner/test-repo",
                "--no-warn-term-kind",
            ],
            capture_output=True,
            text=True,
            timeout=180,
        )
        if r.returncode != 0:
            errors.append(
                "manifest round-trip: generate_semantic_manifest failed:\n"
                + (r.stderr or r.stdout or "")
            )
            return
        r2 = subprocess.run(
            [sys.executable, str(val), "--repo", str(repo), "--manifest", str(out)],
            capture_output=True,
            text=True,
            timeout=60,
        )
        if r2.returncode != 0:
            errors.append(
                "manifest round-trip: validate_semantic_manifest failed:\n"
                + (r2.stderr or r2.stdout or "")
            )


def validate(
    repo: Path,
    *,
    include_drafts: bool,
    strict_refs: bool,
    skip_manifest_round_trip: bool,
) -> int:
    store = _schema_store(repo)
    schema_errors: list[str] = []
    slug_errors: list[str] = []
    ref_errors: list[str] = []

    concepts = _collect_ontology_concept_slugs(repo) | _collect_dir_slugs(repo, "glossary")
    patterns = _collect_dir_slugs(repo, "patterns")
    sources = _collect_dir_slugs(repo, "sources")
    situations = _collect_dir_slugs(repo, "situations")
    books = _collect_book_slugs(repo)

    seen_slugs: dict[str, Path] = {}

    for path in _iter_semantic_yml(repo, include_drafts=include_drafts):
        rel_repo = path.relative_to(repo)
        try:
            rel_sem = path.relative_to(repo / SEMANTIC)
        except ValueError:
            continue

        try:
            data = _load_yaml(path)
        except Exception as exc:
            schema_errors.append(f"{rel_repo}: YAML parse error: {exc}")
            continue

        matched = _schema_for_path(repo, path)
        if matched is not None:
            schema_doc, _name = matched
            validator = _validator(schema_doc, store)
            for err in sorted(validator.iter_errors(data), key=lambda e: e.path):
                schema_errors.append(f"{rel_repo}: {err.message}")

        if rel_sem.parts and rel_sem.parts[0] in SLUG_PARENTS and isinstance(data, dict):
            slug = str(data.get("slug", "")).strip()
            if slug:
                prev = seen_slugs.get(slug)
                if prev is not None and prev != path:
                    schema_errors.append(
                        f"{rel_repo}: duplicate slug {slug!r} (also in {prev.relative_to(repo)})"
                    )
                seen_slugs[slug] = path
                if slug != path.stem:
                    slug_errors.append(f"{rel_repo}: slug {slug!r} != filename stem {path.stem!r}")

        if isinstance(data, dict):
            _check_refs_in_doc(
                data,
                concepts=concepts,
                patterns=patterns,
                sources=sources,
                books=books,
                path=rel_repo,
                errors=ref_errors,
            )

        if path.name == "relationships.yml":
            _check_relationships_file(
                repo, path, concepts=concepts, errors=ref_errors, strict_refs=strict_refs
            )

        if rel_sem.parts and rel_sem.parts[0] == "ontology" and path.name.endswith("-terms.yml"):
            doc = data if isinstance(data, dict) else {}
            for row in doc.get("terms") or []:
                if isinstance(row, dict):
                    _check_refs_in_doc(
                        row,
                        concepts=concepts,
                        patterns=patterns,
                        sources=sources,
                        books=books,
                        path=rel_repo,
                        errors=ref_errors,
                    )

    rc = 0
    if schema_errors:
        rc = 1
        print(f"Schema error(s): {len(schema_errors)}", file=sys.stderr)
        for line in schema_errors:
            print(f"  {line}", file=sys.stderr)
    if slug_errors:
        rc = 1
        print(f"Slug error(s): {len(slug_errors)}", file=sys.stderr)
        for line in slug_errors:
            print(f"  {line}", file=sys.stderr)
    if ref_errors:
        if strict_refs:
            rc = 1
        print(
            f"{'Reference error(s)' if strict_refs else 'Reference warning(s)'}: {len(ref_errors)}",
            file=sys.stderr,
        )
        for line in ref_errors:
            print(f"  {line}", file=sys.stderr)

    if not skip_manifest_round_trip:
        manifest_errors: list[str] = []
        _manifest_round_trip(repo, manifest_errors)
        if manifest_errors:
            rc = 1
            for line in manifest_errors:
                print(f"  {line}", file=sys.stderr)

    if rc == 0:
        n = len(list(_iter_semantic_yml(repo, include_drafts=include_drafts)))
        print(
            f"Validated {n} semantic YAML file(s); "
            f"concepts={len(concepts)} patterns={len(patterns)} sources={len(sources)} "
            f"situations={len(situations)}"
        )
    return rc


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument(
        "--include-drafts",
        action="store_true",
        help="Also validate semantic/_drafts/**/*.yml",
    )
    parser.add_argument(
        "--strict-refs",
        action="store_true",
        help="Treat unknown related* slugs as errors (default: warn only)",
    )
    parser.add_argument(
        "--skip-manifest-round-trip",
        action="store_true",
        help="Skip generate + validate semantic-manifest.json",
    )
    args = parser.parse_args()
    sys.exit(
        validate(
            Path(args.repo).resolve(),
            include_drafts=args.include_drafts,
            strict_refs=args.strict_refs,
            skip_manifest_round_trip=args.skip_manifest_round_trip,
        )
    )


if __name__ == "__main__":
    main()
