#!/usr/bin/env python3
"""
Generate open-graph.png from a book cover using the house OG layout:

  blurred cropped cover background + title/subtitle on the left + cover thumbnail on the right

Requires Pillow. Reads title/subtitle from book.yml unless overridden.
Optional per-book tuning in open-graph.config.yml next to book-cover.png.
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML required: python3 -m pip install pyyaml") from exc

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

OG_W, OG_H = 1200, 630
DEFAULT_COVER = "book-cover.png"
DEFAULT_OUTPUT = "open-graph.png"
DEFAULT_CONFIG = "open-graph.config.yml"

FONT_PATHS = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/Library/Fonts/Arial Bold.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
]

PALETTE = {
    "white": (245, 245, 242, 255),
    "slate": (96, 122, 148, 255),
    "gold": (218, 178, 72, 255),
    "stroke": (12, 16, 28, 220),
}


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in FONT_PATHS:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def parse_color(value: Any, accent: tuple[int, int, int, int]) -> tuple[int, int, int, int]:
    if isinstance(value, list) and len(value) in (3, 4):
        nums = [int(x) for x in value]
        if len(nums) == 3:
            nums.append(255)
        return tuple(nums)  # type: ignore[return-value]
    if isinstance(value, str):
        key = value.strip().lower()
        if key == "accent":
            return accent
        if key in PALETTE:
            return PALETTE[key]
    raise ValueError(f"Unknown color: {value!r}")


def load_book_yaml(book_dir: Path) -> dict[str, Any]:
    spec_path = book_dir / "book.yml"
    if not spec_path.is_file():
        raise FileNotFoundError(f"Missing {spec_path}")
    data = yaml.safe_load(spec_path.read_text(encoding="utf-8")) or {}
    book = data.get("book") or {}
    if not isinstance(book, dict):
        raise ValueError(f"Invalid book section in {spec_path}")
    return book


def load_config(book_dir: Path) -> dict[str, Any]:
    path = book_dir / DEFAULT_CONFIG
    if not path.is_file():
        return {}
    data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    return data if isinstance(data, dict) else {}


def default_title_lines(title: str) -> list[dict[str, Any]]:
    words = [w for w in title.upper().split() if w]
    lines: list[dict[str, Any]] = []
    for i, word in enumerate(words):
        lines.append({"text": word, "color": "white" if i % 2 == 0 else "accent"})
    return lines


def wrap_subtitle(subtitle: str, max_len: int = 34) -> list[str]:
    words = subtitle.upper().split()
    if not words:
        return []
    lines: list[str] = []
    current: list[str] = []
    for word in words:
        trial = " ".join(current + [word])
        if len(trial) <= max_len:
            current.append(word)
        else:
            if current:
                lines.append(" ".join(current))
            current = [word]
    if current:
        lines.append(" ".join(current))
    return lines


def draw_sharp_text(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    font: ImageFont.ImageFont,
    fill: tuple[int, int, int, int],
    stroke: tuple[int, int, int, int],
    stroke_width: int = 2,
) -> None:
    x, y = xy
    for dx, dy in [
        (-stroke_width, 0),
        (stroke_width, 0),
        (0, -stroke_width),
        (0, stroke_width),
        (-stroke_width, -stroke_width),
        (stroke_width, -stroke_width),
        (-stroke_width, stroke_width),
        (stroke_width, stroke_width),
    ]:
        draw.text((x + dx, y + dy), text, font=font, fill=stroke)
    draw.text((x, y), text, font=font, fill=fill)


def build_open_graph(
    cover_path: Path,
    out_path: Path,
    title_lines: list[dict[str, Any]],
    subtitle_lines: list[str],
    bg_crop: tuple[int, int, int, int],
    tint: tuple[int, int, int, int],
    accent: tuple[int, int, int, int],
    subtitle_color: str | list[int],
    font_title: int,
    font_sub: int,
    title_start_y: int,
    title_line_gap: int,
    rule_width: int,
) -> None:
    cover = Image.open(cover_path).convert("RGBA")
    left, top, right, bottom = bg_crop
    bg_crop_img = cover.crop((left, top, right, bottom))
    bg = bg_crop_img.resize((OG_W, OG_H), Image.LANCZOS).convert("RGBA")
    bg = bg.filter(ImageFilter.GaussianBlur(radius=18))

    tint_layer = Image.new("RGBA", (OG_W, OG_H), tint)
    bg = Image.alpha_composite(bg, tint_layer)

    overlay = Image.new("RGBA", (OG_W, OG_H), (0, 0, 0, 0))
    draw_ov = ImageDraw.Draw(overlay)
    for x in range(980):
        alpha = int(255 * (1 - x / 980) ** 0.85)
        draw_ov.line([(x, 0), (x, OG_H)], fill=(12, 18, 34, alpha))
    bg = Image.alpha_composite(bg, overlay)

    cover_h = OG_H - 24
    cover_w = int(cover.width * cover_h / cover.height)
    thumb = cover.resize((cover_w, cover_h), Image.LANCZOS)
    x_cover = OG_W - cover_w - 18
    y_cover = (OG_H - cover_h) // 2
    shadow = Image.new("RGBA", (cover_w + 16, cover_h + 16), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle((8, 8, cover_w + 8, cover_h + 8), radius=6, fill=(0, 0, 0, 110))
    bg.alpha_composite(shadow, (x_cover - 8, y_cover - 8))
    bg.paste(thumb, (x_cover, y_cover), thumb)

    draw = ImageDraw.Draw(bg)
    title_font = load_font(font_title)
    sub_font = load_font(font_sub)
    stroke = PALETTE["stroke"]
    sub_fill = parse_color(subtitle_color, accent)

    x_text = 56
    y = title_start_y
    for line in title_lines:
        text = str(line.get("text", "")).upper()
        if not text:
            continue
        fill = parse_color(line.get("color", "white"), accent)
        draw_sharp_text(draw, (x_text, y), text, title_font, fill, stroke, stroke_width=2)
        y += title_line_gap

    y += 8
    draw.line([(x_text, y), (x_text + rule_width, y)], fill=accent, width=3)
    y += 14
    for line in subtitle_lines:
        draw_sharp_text(draw, (x_text, y), line.upper(), sub_font, sub_fill, stroke, stroke_width=1)
        y += 24

    out = bg.convert("RGB")
    out = ImageEnhance.Sharpness(out).enhance(1.15)
    out = ImageEnhance.Contrast(out).enhance(1.05)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out.save(out_path, format="PNG", optimize=True)


def resolve_crop(cover: Image.Image, cfg: dict[str, Any]) -> tuple[int, int, int, int]:
    if "bg_crop" in cfg:
        vals = [int(v) for v in cfg["bg_crop"]]
        if len(vals) != 4:
            raise ValueError("bg_crop must be [left, top, right, bottom]")
        return vals[0], vals[1], vals[2], vals[3]
    w, h = cover.size
    # Default: central band below top title area
    return (int(w * 0.04), int(h * 0.27), int(w * 0.96), int(h * 0.86))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--book-dir", required=True, type=Path, help="Book folder containing book.yml and cover"
    )
    parser.add_argument("--cover", default=DEFAULT_COVER, help="Cover filename inside book-dir")
    parser.add_argument("--output", default=DEFAULT_OUTPUT, help="Output filename inside book-dir")
    parser.add_argument(
        "--dry-run", action="store_true", help="Print resolved settings without writing image"
    )
    args = parser.parse_args(argv)

    book_dir = args.book_dir.resolve()
    cover_path = book_dir / args.cover
    out_path = book_dir / args.output
    if not cover_path.is_file():
        raise SystemExit(f"Cover not found: {cover_path}")

    book = load_book_yaml(book_dir)
    cfg = load_config(book_dir)
    cover = Image.open(cover_path)

    title = str(cfg.get("title") or book.get("title") or "").strip()
    subtitle = str(cfg.get("subtitle") or book.get("subtitle") or "").strip()
    if not title:
        raise SystemExit("Title missing in book.yml and open-graph.config.yml")

    accent_vals = cfg.get("accent_color", PALETTE["gold"][:3])
    accent = parse_color(accent_vals, PALETTE["gold"])
    tint = parse_color(cfg.get("tint", [18, 28, 52, 135]), accent)

    title_lines = cfg.get("title_lines") or default_title_lines(title)
    subtitle_lines = cfg.get("subtitle_lines") or wrap_subtitle(subtitle)
    bg_crop = resolve_crop(cover, cfg)

    settings = {
        "book_dir": str(book_dir),
        "cover": str(cover_path),
        "output": str(out_path),
        "title_lines": title_lines,
        "subtitle_lines": subtitle_lines,
        "bg_crop": list(bg_crop),
        "tint": list(tint),
        "accent": list(accent),
    }
    if args.dry_run:
        print(yaml.safe_dump(settings, sort_keys=False))
        return 0

    build_open_graph(
        cover_path=cover_path,
        out_path=out_path,
        title_lines=title_lines,
        subtitle_lines=subtitle_lines,
        bg_crop=bg_crop,
        tint=tint,
        accent=accent,
        subtitle_color=cfg.get("subtitle_color", "accent"),
        font_title=int(cfg.get("font_title", 46)),
        font_sub=int(cfg.get("font_sub", 17)),
        title_start_y=int(cfg.get("title_start_y", 78)),
        title_line_gap=int(cfg.get("title_line_gap", 54)),
        rule_width=int(cfg.get("rule_width", 360)),
    )
    print(f"Wrote {out_path} ({out_path.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
