"""Export one book as EPUB."""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

from after_certainty.core.book_output_stem import stem_for_book_dir
from after_certainty.export.assets import epub_css, resolve_title_page_cover_path
from after_certainty.export.epub_postprocess import postprocess_epub
from after_certainty.export.kindle_flatten import prepare_kindle_markdown
from after_certainty.specs.book_specs import load_spec_for_book_dir


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def export_epub(
    *,
    repo: Path,
    book_dir: Path,
    book_stem: str,
    pandoc: str = "pandoc",
) -> Path:
    """Export EPUB for one book directory. Returns output path."""
    spec = load_spec_for_book_dir(book_dir)
    index = book_dir / "index.md"
    if not index.exists():
        raise SystemExit(f"Missing index.md: {index}")

    prep = book_dir / "export-kindle.md"
    out = book_dir / f"{book_stem}.epub"

    prepare_kindle_markdown(
        book_dir=book_dir,
        index_path=index,
        out_path=prep,
        flatten_custom_blocks_flag=True,
    )

    cover_path = resolve_title_page_cover_path(book_dir, spec)
    cover = cover_path.as_posix() if cover_path is not None else ""

    cmd = [
        pandoc,
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
    postprocess_epub(out)
    print(out.as_posix())
    return out


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".")
    parser.add_argument("--book-dir", required=True)
    parser.add_argument("--out-stem", default="")
    parser.add_argument("--pandoc", default="pandoc")
    args = parser.parse_args(argv)

    repo = Path(args.repo).resolve()
    book_dir = (repo / args.book_dir).resolve()
    stem = args.out_stem.strip() or stem_for_book_dir(book_dir.as_posix(), root=repo)

    export_epub(repo=repo, book_dir=book_dir, book_stem=stem, pandoc=args.pandoc)


if __name__ == "__main__":
    main(sys.argv[1:])
