#!/usr/bin/env python3
"""Export one book as PDF via pandoc + LaTeX engine."""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[1]
_TOOLS = _ROOT / "tools"
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))
if str(Path(__file__).resolve().parent) not in sys.path:
    sys.path.insert(0, str(Path(__file__).resolve().parent))

from assemble import assemble_markdown_units  # noqa: E402
from book_output_stem import stem_for_book_dir  # noqa: E402
from book_specs import SPEC_FILE_NAME, load_any_book_spec, spec_format_config  # noqa: E402
from diagram_rasterize import rasterize_book_diagrams  # noqa: E402


def run(cmd: list[str]) -> None:
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as exc:
        raise SystemExit(f"PDF export failed (exit {exc.returncode}): {' '.join(cmd)}") from exc


def parse_page_size(page_size: str) -> tuple[str, str] | None:
    value = page_size.strip().lower().replace(" ", "")
    if "x" not in value:
        return None
    left, right = value.split("x", 1)
    if not left or not right:
        return None
    return f"{left}in", f"{right}in"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".")
    parser.add_argument("--book-dir", required=True)
    parser.add_argument("--out-stem", default="")
    parser.add_argument("--page-size", default="")
    parser.add_argument("--pdf-engine", default="")
    parser.add_argument("--pandoc", default="pandoc")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    book_dir = (repo / args.book_dir).resolve()
    spec = load_any_book_spec(book_dir / SPEC_FILE_NAME)
    pdf_cfg = spec_format_config(spec, "pdf")

    stem = args.out_stem.strip() or stem_for_book_dir(book_dir.as_posix(), root=repo)
    out = book_dir / f"{stem}.pdf"
    units = assemble_markdown_units(book_dir)
    if not units:
        raise SystemExit(f"No markdown units found from {book_dir / 'index.md'}")

    rasterize_book_diagrams(book_dir)

    page_size = args.page_size.strip() or str(pdf_cfg.get("page_size", "")).strip()
    margins = pdf_cfg.get("margins", {})
    engine = args.pdf_engine.strip() or str(pdf_cfg.get("pdf_engine", "")).strip() or "xelatex"

    cmd = [
        args.pandoc,
        *[p.as_posix() for p in units],
        f"--resource-path={book_dir}",
        f"--pdf-engine={engine}",
    ]

    parsed = parse_page_size(page_size) if page_size else None
    if parsed:
        width, height = parsed
        cmd.extend(["-V", f"geometry:paperwidth={width}", "-V", f"geometry:paperheight={height}"])

    if isinstance(margins, dict):
        for key in ("top", "bottom", "left", "right"):
            val = str(margins.get(key, "")).strip()
            if val:
                cmd.extend(["-V", f"geometry:{key}={val}"])

    cmd.extend(["-o", out.as_posix()])
    run(cmd)
    print(out.as_posix())


if __name__ == "__main__":
    main()
