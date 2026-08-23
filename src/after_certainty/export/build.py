"""Build selected formats for one book and emit build artifacts."""

from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

from after_certainty.core.book_output_stem import stem_for_book_dir
from after_certainty.core.path_safety import PathSafetyError, ensure_repo_relative, ensure_under
from after_certainty.export.docx import export_docx
from after_certainty.export.epub import export_epub
from after_certainty.export.manifest import write_book_manifest
from after_certainty.export.pdf import export_pdf
from after_certainty.export.typst import export_typst_pdf
from after_certainty.manuscript.frontmatter import generate_frontmatter_for_book
from after_certainty.manuscript.publication_validation import validate_book_for_publication
from after_certainty.specs.book_specs import (
    load_spec_for_book_rel,
    spec_kind,
    spec_pdf_engine,
    spec_publication_boundary_validation,
)


def build_book(
    *,
    repo: Path,
    book_rel: str,
    out_dir: Path,
    formats: list[str],
    out_stem: str = "",
) -> Path:
    """Build requested formats for one book and write artifacts to out_dir."""
    try:
        book_dir = ensure_repo_relative(repo, book_rel, description="book-dir")
        out_arg = Path(out_dir)
        if out_arg.is_absolute():
            resolved_out = out_arg.resolve()
        else:
            try:
                resolved_out = ensure_under(Path.cwd().resolve(), out_dir, description="out-dir")
            except PathSafetyError:
                resolved_out = ensure_repo_relative(repo, str(out_dir), description="out-dir")
    except PathSafetyError as exc:
        raise SystemExit(str(exc)) from exc

    resolved_out.mkdir(parents=True, exist_ok=True)
    stem = out_stem.strip() or stem_for_book_dir(book_dir.as_posix(), root=repo)
    spec = load_spec_for_book_rel(repo, book_rel)

    generate_frontmatter_for_book(repo, book_rel)

    boundary = spec_publication_boundary_validation(spec)
    issues = validate_book_for_publication(book_dir, boundary=boundary)
    if issues:
        print("Publication validation failed:", file=sys.stderr)
        for issue in issues:
            print(f"  - {issue}", file=sys.stderr)
        raise SystemExit(1)

    requested = [f.strip().lower() for f in formats if f.strip()]
    if not requested:
        raise SystemExit("At least one --format is required.")

    for fmt in requested:
        if spec_kind(spec) == "poetry" and fmt in ("epub", "docx"):
            raise SystemExit("Poetry books support PDF (Typst) only.")

        if fmt == "docx":
            export_docx(repo=repo, book_dir=book_dir, book_stem=stem)
            shutil.copy2(book_dir / f"{stem}.docx", resolved_out / f"{stem}.docx")
        elif fmt == "epub":
            export_epub(repo=repo, book_dir=book_dir, book_stem=stem)
            shutil.copy2(book_dir / f"{stem}.epub", resolved_out / f"{stem}.epub")
        elif fmt == "pdf":
            if spec_pdf_engine(spec) == "typst":
                export_typst_pdf(repo=repo, book_dir=book_dir, book_stem=stem)
            else:
                export_pdf(repo=repo, book_dir=book_dir, book_stem=stem)
            shutil.copy2(book_dir / f"{stem}.pdf", resolved_out / f"{stem}.pdf")
        else:
            raise SystemExit(f"Unsupported format: {fmt}")

    write_book_manifest(
        repo=repo,
        book_dir=book_dir,
        out_path=resolved_out / f"{stem}.manifest.json",
        formats=requested,
    )
    print(resolved_out.as_posix())
    return resolved_out


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".")
    parser.add_argument("--book-dir", required=True)
    parser.add_argument("--out-dir", required=True)
    parser.add_argument("--out-stem", default="")
    parser.add_argument("--format", action="append", dest="formats", default=[])
    args = parser.parse_args(argv)

    build_book(
        repo=Path(args.repo).resolve(),
        book_rel=args.book_dir,
        out_dir=Path(args.out_dir),
        formats=args.formats,
        out_stem=args.out_stem,
    )


if __name__ == "__main__":
    main(sys.argv[1:])
