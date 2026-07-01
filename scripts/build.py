#!/usr/bin/env python3
"""
Build selected formats for one book and emit build artifacts.
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[1]
_TOOLS = _ROOT / "tools"
_SCRIPTS = Path(__file__).resolve().parent
for _p in (_TOOLS, _SCRIPTS):
    if str(_p) not in sys.path:
        sys.path.insert(0, str(_p))

from book_output_stem import stem_for_book_dir  # noqa: E402
from book_specs import (  # noqa: E402
    load_spec_for_book_rel,
    spec_kind,
    spec_pdf_engine,
)
from frontmatter_gen import generate_frontmatter_for_book  # noqa: E402


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".")
    parser.add_argument("--book-dir", required=True)
    parser.add_argument("--out-dir", required=True)
    parser.add_argument("--out-stem", default="")
    parser.add_argument("--format", action="append", dest="formats", default=[])
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    book_rel = args.book_dir
    book_dir = (repo / book_rel).resolve()
    out_dir = Path(args.out_dir).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    stem = args.out_stem.strip() or stem_for_book_dir(book_dir.as_posix(), root=repo)
    spec = load_spec_for_book_rel(repo, book_rel)

    generate_frontmatter_for_book(repo, book_rel)

    requested = [f.strip().lower() for f in args.formats if f.strip()]
    if not requested:
        raise SystemExit("At least one --format is required.")

    for fmt in requested:
        if spec_kind(spec) == "poetry" and fmt in ("epub", "docx"):
            raise SystemExit("Poetry books support PDF (Typst) only.")

        if fmt == "docx":
            run(
                [
                    sys.executable,
                    (_ROOT / "scripts" / "export_docx.py").as_posix(),
                    "--repo",
                    repo.as_posix(),
                    "--book-dir",
                    book_rel,
                    "--out-stem",
                    stem,
                ]
            )
            shutil.copy2(book_dir / f"{stem}.docx", out_dir / f"{stem}.docx")
        elif fmt == "epub":
            run(
                [
                    sys.executable,
                    (_ROOT / "scripts" / "export_epub.py").as_posix(),
                    "--repo",
                    repo.as_posix(),
                    "--book-dir",
                    book_rel,
                    "--out-stem",
                    stem,
                ]
            )
            shutil.copy2(book_dir / f"{stem}.epub", out_dir / f"{stem}.epub")
        elif fmt == "pdf":
            if spec_pdf_engine(spec) == "typst":
                run(
                    [
                        sys.executable,
                        (_ROOT / "scripts" / "export_typst_pdf.py").as_posix(),
                        "--repo",
                        repo.as_posix(),
                        "--book-dir",
                        book_rel,
                        "--out-stem",
                        stem,
                    ]
                )
            else:
                run(
                    [
                        sys.executable,
                        (_ROOT / "scripts" / "export_pdf.py").as_posix(),
                        "--repo",
                        repo.as_posix(),
                        "--book-dir",
                        book_rel,
                        "--out-stem",
                        stem,
                    ]
                )
            shutil.copy2(book_dir / f"{stem}.pdf", out_dir / f"{stem}.pdf")
        else:
            raise SystemExit(f"Unsupported format: {fmt}")

    manifest_cmd = [
        sys.executable,
        (_ROOT / "tools" / "generate_book_manifest.py").as_posix(),
        "--repo",
        repo.as_posix(),
        "--book-dir",
        book_rel,
        "--out",
        (out_dir / f"{stem}.manifest.json").as_posix(),
    ]
    for fmt in requested:
        manifest_cmd.extend(["--format", fmt])
    run(manifest_cmd)
    print(out_dir.as_posix())


if __name__ == "__main__":
    main()
