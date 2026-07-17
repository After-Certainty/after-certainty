#!/usr/bin/env python3
"""
Rasterize committed SVG diagrams into export-assets for Pandoc/Kindle EPUB.

Uses rsvg-convert (librsvg) or ImageMagick `magick` when available.

Discovery order (see schema `assets.diagrams`):
1. Explicit `entries` from book.yml (when present).
2. Auto-discover `docs/diagrams/*.svg` → `export-assets/diagrams/<stem>.png` when `auto_discover` is not false.
3. Legacy built-in catalog **only** when `assets.diagrams` omits both an `entries` key and `auto_discover: false`
   (backward compatibility for older specs).
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any

_TOOLS = Path(__file__).resolve().parent
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from path_safety import PathSafetyError, ensure_book_relative  # noqa: E402

# Legacy catalog when book.yml has no assets.diagrams overrides (exact paths + widths).
# (source svg relative to book dir, output png relative to book dir, width px)
DEFAULT_DIAGRAMS: list[tuple[str, str, int]] = [
    (
        "docs/diagrams/pattern-groups.svg",
        "export-assets/diagrams/pattern-groups.png",
        1600,
    ),
    (
        "docs/diagrams/renewal-erosion-map.svg",
        "export-assets/diagrams/renewal-erosion-map.png",
        1000,
    ),
]


def _diagram_jobs(book_dir: Path, spec: dict[str, Any]) -> list[tuple[str, str, int]]:
    root = book_dir.resolve()
    assets = spec.get("assets")
    assets = assets if isinstance(assets, dict) else {}
    has_diagrams_key = "diagrams" in assets
    diagrams_cfg = assets.get("diagrams") if isinstance(assets.get("diagrams"), dict) else {}
    default_width = int(diagrams_cfg.get("default_width", 1600))
    auto_discover = diagrams_cfg.get("auto_discover", True)
    entries_cfg = diagrams_cfg.get("entries")

    by_svg: dict[str, tuple[str, str, int]] = {}

    # Legacy seed only when book.yml does not define assets.diagrams at all.
    if not has_diagrams_key:
        for svg_rel, png_rel, width in DEFAULT_DIAGRAMS:
            if (root / svg_rel).is_file():
                by_svg[svg_rel] = (svg_rel, png_rel, width)

    if isinstance(entries_cfg, list):
        for raw in entries_cfg:
            if not isinstance(raw, dict):
                continue
            svg_rel = str(raw.get("svg", "")).strip()
            png_rel = str(raw.get("png", "")).strip()
            if not svg_rel or not png_rel:
                continue
            w = int(raw.get("width", default_width))
            by_svg[svg_rel] = (svg_rel, png_rel, w)

    if auto_discover is not False:
        dd = root / "docs" / "diagrams"
        if dd.is_dir():
            for svg_path in sorted(dd.glob("*.svg")):
                rel = svg_path.relative_to(root).as_posix()
                if rel in by_svg:
                    continue
                png_rel = f"export-assets/diagrams/{svg_path.stem}.png"
                by_svg[rel] = (rel, png_rel, default_width)

    # Legacy catalog: only when diagrams config does not explicitly opt out.
    if not by_svg and has_diagrams_key and _legacy_fallback_allowed(diagrams_cfg):
        for svg_rel, png_rel, width in DEFAULT_DIAGRAMS:
            if (root / svg_rel).is_file():
                by_svg[svg_rel] = (svg_rel, png_rel, width)

    return [by_svg[k] for k in sorted(by_svg.keys())]


def _legacy_fallback_allowed(diagrams_cfg: dict[str, Any]) -> bool:
    """Explicit `entries` (even []) or `auto_discover: false` disables legacy paths."""
    if "entries" in diagrams_cfg:
        return False
    if diagrams_cfg.get("auto_discover") is False:
        return False
    return True


def rasterize_book_diagrams(
    book_dir: Path,
    *,
    spec: dict[str, Any] | None = None,
    quiet: bool = False,
) -> int:
    """
    For each configured SVG, write a PNG under export-assets if the SVG exists.
    Returns count of PNGs successfully written or refreshed.
    """
    root = book_dir.resolve()
    if spec is None:
        spec_path = root / "book.yml"
        if spec_path.is_file():
            from book_specs import load_any_book_spec

            spec = load_any_book_spec(spec_path)
        else:
            spec = {}

    jobs = _diagram_jobs(root, spec if isinstance(spec, dict) else {})
    done = 0

    for svg_rel, png_rel, width in jobs:
        try:
            svg_path = ensure_book_relative(root, svg_rel, description="diagram svg")
            png_path = ensure_book_relative(root, png_rel, description="diagram png")
        except PathSafetyError as exc:
            if not quiet:
                print(f"diagram_rasterize: rejected path: {exc}", flush=True)
            continue
        if not svg_path.is_file():
            continue
        png_path.parent.mkdir(parents=True, exist_ok=True)

        stale = (not png_path.is_file()) or (png_path.stat().st_mtime < svg_path.stat().st_mtime)

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


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Rasterize committed SVG diagrams into export-assets for Pandoc exports.",
    )
    parser.add_argument(
        "--book-dir",
        type=Path,
        required=True,
        help="Book root (the folder that contains index.md and docs/diagrams/).",
    )
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Suppress skip / failure messages (still refreshes when tools are available).",
    )
    args = parser.parse_args(argv)
    n = rasterize_book_diagrams(args.book_dir, quiet=args.quiet)
    if not args.quiet and n:
        print(f"diagram_pngs_ready={n}", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
