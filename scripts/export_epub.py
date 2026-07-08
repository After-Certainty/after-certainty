#!/usr/bin/env python3
"""
Export one book as EPUB.
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[1]
_TOOLS = _ROOT / "tools"
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from book_export_assets import epub_css, resolve_title_page_cover_path  # noqa: E402
from book_output_stem import stem_for_book_dir  # noqa: E402
from book_specs import load_spec_for_book_dir  # noqa: E402


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".")
    parser.add_argument("--book-dir", required=True)
    parser.add_argument("--out-stem", default="")
    parser.add_argument("--pandoc", default="pandoc")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    book_dir = (repo / args.book_dir).resolve()
    spec = load_spec_for_book_dir(book_dir)
    index = book_dir / "index.md"
    if not index.exists():
        raise SystemExit(f"Missing index.md: {index}")

    stem = args.out_stem.strip() or stem_for_book_dir(book_dir.as_posix(), root=repo)
    prep = book_dir / "export-kindle.md"
    out = book_dir / f"{stem}.epub"

    run(
        [
            sys.executable,
            (_TOOLS / "kindle-flatten.py").as_posix(),
            "--book-dir",
            book_dir.as_posix(),
            "--index",
            index.as_posix(),
            "--out",
            prep.as_posix(),
            "--flatten-custom-blocks",
        ]
    )

    cover_path = resolve_title_page_cover_path(book_dir, spec)
    cover = cover_path.as_posix() if cover_path is not None else ""

    cmd = [
        args.pandoc,
        prep.as_posix(),
        f"--resource-path={book_dir}",
        "--from=markdown+fenced_divs",
        "--toc",
        "--toc-depth=1",
        "--epub-title-page=false",
        "--metadata=toc-title:Table of Contents",
    ]
    css = epub_css(book_dir)
    if css is not None:
        cmd.append(f"--css={css.as_posix()}")
    if cover:
        cmd.append(f"--epub-cover-image={cover}")
    cmd.extend(["-o", out.as_posix()])
    run(cmd)
    run([sys.executable, (_TOOLS / "epub-postprocess.py").as_posix(), "--epub", out.as_posix()])
    print(out.as_posix())


if __name__ == "__main__":
    main()
