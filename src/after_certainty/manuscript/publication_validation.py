"""Validate assembled manuscript units for publication hygiene."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from after_certainty.manuscript.assemble import assemble_index_sections, assemble_markdown_units
from after_certainty.manuscript.publication_markdown import (
    EMPTY_NOTES_HEADING_BLOCK_RE,
    NOTES_HEADING_RE,
    find_publication_issues,
    prepare_manuscript_unit_for_export,
)

PLANNING_ONLY_HEADINGS = frozenset({"planning docs"})
BOUNDARY_INDEX_HEADINGS = frozenset({"planning docs", "related books"})


def _manifest_issues(book_dir: Path, *, boundary: bool) -> list[str]:
    issues: list[str] = []
    blocked_headings = BOUNDARY_INDEX_HEADINGS if boundary else PLANNING_ONLY_HEADINGS

    for section in assemble_index_sections(book_dir):
        if section.heading.strip().lower() in blocked_headings:
            issues.append(
                f"index.md includes internal section {section.heading!r} "
                f"({len(section.paths)} linked file(s))"
            )

    for unit in assemble_markdown_units(book_dir):
        rel = unit.relative_to(book_dir).as_posix()
        try:
            unit.relative_to(book_dir / "docs")
            issues.append(f"publication manifest includes planning path: {rel}")
            continue
        except ValueError:
            pass
        if rel.startswith("docs/"):
            issues.append(f"publication manifest includes docs path: {rel}")

    return issues


def validate_export_pipeline(book_dir: Path) -> list[str]:
    """
    Universal export checks (all books): no planning docs in the manifest,
    and footnote-only ``## Notes`` headings are stripped before pandoc runs.
    """
    book_dir = book_dir.resolve()
    if not (book_dir / "index.md").exists():
        return [f"Missing index.md in {book_dir}"]

    issues = _manifest_issues(book_dir, boundary=False)

    for unit in assemble_markdown_units(book_dir):
        rel = unit.relative_to(book_dir).as_posix()
        if rel.startswith("docs/"):
            continue
        try:
            unit.relative_to(book_dir / "docs")
            continue
        except ValueError:
            pass

        raw = unit.read_text(encoding="utf-8")
        prepared = prepare_manuscript_unit_for_export(raw)
        if EMPTY_NOTES_HEADING_BLOCK_RE.search(prepared):
            issues.append(f"{rel}: empty Notes heading remained after export preprocessing")
        if NOTES_HEADING_RE.search(prepared) and "[^" in prepared:
            tail = prepared[prepared.rfind("## Notes") :] if "## Notes" in prepared else ""
            if tail and not any(
                line.strip() and not line.startswith("[^") and not line.startswith("##")
                for line in tail.splitlines()[1:]
            ):
                issues.append(f"{rel}: footnote-only Notes heading not stripped")

    return issues


def validate_publication_boundary(book_dir: Path) -> list[str]:
    """Strict reader-facing checks (opt-in per book via publishing.validate_boundary)."""
    book_dir = book_dir.resolve()
    if not (book_dir / "index.md").exists():
        return [f"Missing index.md in {book_dir}"]

    issues = _manifest_issues(book_dir, boundary=True)

    for unit in assemble_markdown_units(book_dir):
        rel = unit.relative_to(book_dir).as_posix()
        if rel.startswith("docs/"):
            continue
        try:
            unit.relative_to(book_dir / "docs")
            continue
        except ValueError:
            pass

        prepared = prepare_manuscript_unit_for_export(unit.read_text(encoding="utf-8"))
        issues.extend(find_publication_issues(prepared, source=rel))

    return issues


def validate_book_for_publication(book_dir: Path, *, boundary: bool = False) -> list[str]:
    issues = validate_export_pipeline(book_dir)
    if boundary:
        issues.extend(validate_publication_boundary(book_dir))
    return issues


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--book-dir", required=True, help="Book directory")
    parser.add_argument(
        "--boundary",
        action="store_true",
        help="Also run strict publication-boundary checks (internal paths, banned phrases)",
    )
    args = parser.parse_args(argv)

    issues = validate_book_for_publication(Path(args.book_dir), boundary=args.boundary)
    if issues:
        print("Publication validation failed:", file=sys.stderr)
        for issue in issues:
            print(f"  - {issue}", file=sys.stderr)
        raise SystemExit(1)

    scope = "pipeline + boundary" if args.boundary else "pipeline"
    print(f"Publication validation passed ({scope}): {args.book_dir}")


if __name__ == "__main__":
    main(sys.argv[1:])
