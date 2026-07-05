#!/usr/bin/env python3
"""
Verify every ``*.yml`` under ``semantic/`` (excluding ``semantic/_drafts`` by default).

Checks:

1. **YAML parse** — each file must load with PyYAML.
2. **Slug vs filename** — for ``semantic/glossary``, ``semantic/patterns``, and
   ``semantic/sources``, if the document is a mapping with a non-empty ``slug`` field,
   it must equal the file stem (``foo.yml`` → ``slug: foo``).

Optional:

- ``--include-drafts`` — also scan ``semantic/_drafts/**/*.yml``.
- ``--strict-prose`` — fail if ``tools/audit_semantic_yaml.py`` finds redundant
  ``longDefinition`` text (same as ``shortDefinition`` when whitespace-collapsed).

Exit code **1** if any hard check fails.
"""

from __future__ import annotations

import argparse
import importlib.util
import sys
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required. Install with: python3 -m pip install pyyaml") from exc

_TOOLS_DIR = Path(__file__).resolve().parent
SEMANTIC = Path("semantic")
SLUG_PARENTS = frozenset({"glossary", "patterns", "sources", "situations"})

# Historical example markers that should appear in longDefinition, not shortDefinition
HISTORICAL_EXAMPLE_MARKERS = frozenset(
    {
        "iron age",
        "bronze age",
        "medieval",
        "siege wall",
        "factory floor",
        "factory bell",
        "wartime",
        "ancient",
        "historical",
    }
)


def _load_audit_module():
    spec = importlib.util.spec_from_file_location(
        "audit_semantic_yaml",
        _TOOLS_DIR / "audit_semantic_yaml.py",
    )
    if spec is None or spec.loader is None:  # pragma: no cover
        return None
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _check_short_definition_quality(
    data: dict,
    path: Path,
    repo: Path,
) -> list[str]:
    """Check if shortDefinition contains historical examples that should be in longDefinition."""
    warnings = []

    # Only check glossary entries
    if not any(part == "glossary" for part in path.parts):
        return warnings

    short_def = str(data.get("shortDefinition", "")).strip().lower()
    if not short_def:
        return warnings

    for marker in HISTORICAL_EXAMPLE_MARKERS:
        if marker in short_def:
            rel_path = path.relative_to(repo)
            warnings.append(
                f"{rel_path}: shortDefinition contains historical example "
                f"'{marker}' - consider moving to longDefinition"
            )

    return warnings


def verify(
    repo: Path,
    *,
    include_drafts: bool,
    strict_prose: bool,
) -> int:
    root = repo / SEMANTIC
    if not root.is_dir():
        print(f"Missing {root}/", file=sys.stderr)
        return 1

    parse_errors: list[tuple[Path, str]] = []
    slug_errors: list[str] = []
    definition_quality_warnings: list[str] = []
    n_files = 0

    for path in sorted(root.rglob("*.yml")):
        if not include_drafts and "_drafts" in path.relative_to(root).parts:
            continue
        n_files += 1
        try:
            raw = path.read_text(encoding="utf-8")
            data = yaml.safe_load(raw)
        except Exception as exc:
            parse_errors.append((path, str(exc)))
            continue

        rel = path.relative_to(repo)
        try:
            sem_rel = path.relative_to(root)
        except ValueError:
            continue
        parts = sem_rel.parts
        if (
            parts
            and parts[0] in SLUG_PARENTS
            and isinstance(data, dict)
            and data.get("slug") is not None
        ):
            slug = str(data.get("slug", "")).strip()
            if slug and slug != path.stem:
                slug_errors.append(f"{rel}: slug {slug!r} != stem {path.stem!r}")

        # Check shortDefinition quality for glossary entries
        if isinstance(data, dict):
            definition_quality_warnings.extend(_check_short_definition_quality(data, path, repo))

    rc = 0
    if parse_errors:
        rc = 1
        print(f"YAML parse error(s): {len(parse_errors)}", file=sys.stderr)
        for p, err in parse_errors:
            print(f"  {p.relative_to(repo)}: {err}", file=sys.stderr)
    if slug_errors:
        rc = 1
        print(f"Slug / filename mismatch(es): {len(slug_errors)}", file=sys.stderr)
        for line in slug_errors:
            print(f"  {line}", file=sys.stderr)
    if definition_quality_warnings:
        print(
            f"WARNING: shortDefinition quality issue(s): {len(definition_quality_warnings)}",
            file=sys.stderr,
        )
        for warning in definition_quality_warnings:
            print(f"  {warning}", file=sys.stderr)

    audit_mod = _load_audit_module()
    if audit_mod is not None:
        dupes, audit_parse_fails = audit_mod.audit(repo)
        for p, err in audit_parse_fails:
            print(f"audit_semantic_yaml parse error: {p}: {err}", file=sys.stderr)
            rc = 1
        if dupes:
            msg = f"Redundant longDefinition (see tools/audit_semantic_yaml.py --fix-long-definition-dupes): {len(dupes)} file(s)"
            if strict_prose:
                rc = 1
                print(f"ERROR: {msg}", file=sys.stderr)
            else:
                print(f"WARNING: {msg}", file=sys.stderr)
            for p in dupes:
                print(f"  {p.relative_to(repo)}", file=sys.stderr)
    elif strict_prose:
        print("WARNING: could not load audit_semantic_yaml.py for prose audit", file=sys.stderr)

    print(
        f"Verified {n_files} semantic YAML file(s) under {repo / SEMANTIC}/"
        + (" (including _drafts)" if include_drafts else " (excluding _drafts)"),
        file=sys.stderr,
    )
    return rc


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Repository root")
    parser.add_argument(
        "--include-drafts",
        action="store_true",
        help="Also scan semantic/_drafts/**/*.yml",
    )
    parser.add_argument(
        "--strict-prose",
        action="store_true",
        help="Fail if redundant longDefinition duplicates are found (audit_semantic_yaml).",
    )
    args = parser.parse_args()
    repo = Path(args.repo).resolve()
    sys.exit(verify(repo, include_drafts=args.include_drafts, strict_prose=args.strict_prose))


if __name__ == "__main__":
    main()
