#!/usr/bin/env python3
"""
Rasterize committed SVG diagrams into export-assets for Pandoc/Kindle EPUB.

Uses rsvg-convert (librsvg) or ImageMagick `magick` when available.
"""

from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

# (source svg relative to book dir, output png relative to book dir, width px)
DEFAULT_DIAGRAMS: list[tuple[str, str, int]] = [
    (
        "docs/diagrams/pattern-groups.svg",
        "export-assets/diagrams/pattern-groups.png",
        1000,
    ),
    (
        "docs/diagrams/renewal-erosion-map.svg",
        "export-assets/diagrams/renewal-erosion-map.png",
        1000,
    ),
]


def rasterize_book_diagrams(book_dir: Path, *, quiet: bool = False) -> int:
    """
    For each configured SVG, write a PNG under export-assets if the SVG exists.
    Returns count of PNGs successfully written or refreshed.
    """
    root = book_dir.resolve()
    done = 0
    for svg_rel, png_rel, width in DEFAULT_DIAGRAMS:
        svg_path = root / svg_rel
        png_path = root / png_rel
        if not svg_path.is_file():
            continue
        png_path.parent.mkdir(parents=True, exist_ok=True)

        stale = (not png_path.is_file()) or (
            png_path.stat().st_mtime < svg_path.stat().st_mtime
        )

        if stale:
            if rsvg := shutil.which("rsvg-convert"):
                cmd = [rsvg, "-w", str(width), str(svg_path), "-o", str(png_path)]
            elif magick := shutil.which("magick"):
                cmd = [magick, str(svg_path), "-resize", f"{width}x", str(png_path)]
            else:
                if not quiet:
                    print(
                        "diagram_rasterize: skipped (install librsvg for rsvg-convert "
                        "or ImageMagick for magick)",
                        flush=True,
                    )
                if png_path.is_file():
                    done += 1
                continue

            try:
                r = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
                if r.returncode != 0:
                    if not quiet:
                        err = (r.stderr or r.stdout or "").strip()
                        print(
                            f"diagram_rasterize: failed {svg_rel}: {err[:400]}",
                            flush=True,
                        )
                    if png_path.is_file():
                        done += 1
                    continue
            except (OSError, subprocess.TimeoutExpired) as e:
                if not quiet:
                    print(f"diagram_rasterize: failed {svg_rel}: {e}", flush=True)
                if png_path.is_file():
                    done += 1
                continue

        if png_path.is_file():
            done += 1

    return done
