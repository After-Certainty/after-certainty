#!/usr/bin/env python3
"""
Derive IngramSpark assembled-raster-wrap panels from a book's book-cover.png.

Produces (under assets/ingramspark/ by default):
  front.png       — upscaled cover fitted into trim+bleed front panel
  back.png        — blurred atmosphere, ≤3-line back copy, barcode reserve
  spine.png       — edge pattern strip (no spine text below 48 pages)
  spine-source.png — wider master for page-count recrops
  template-meta.yml — geometry matching 6×9 cream perfect-bound

Intended for abstract covers where ~1.8× upscale is acceptable. Always review
visually before IngramSpark upload.
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit("PyYAML required: python3 -m pip install pyyaml") from exc

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

DEFAULT_COVER = "book-cover.png"
DEFAULT_OUT_DIR = "assets/ingramspark"
PPI = 300
TRIM_W_IN = 6.0
TRIM_H_IN = 9.0
BLEED_IN = 0.125  # 9 pt
SAFE_INSET_IN = 0.25  # 18 pt
CREAM_BULK_IN_PER_PAGE = 0.0025
# Ingram-generated barcode reserve (Lightning Source placement size).
# Oversized white boxes are rejected; keep at the approved 1.75" × 1.0".
BARCODE_W_IN = 1.75
BARCODE_H_IN = 1.0
BARCODE_BOTTOM_INSET_IN = 0.55
SPINE_SOURCE_PAD_PX = 20
# Thin-spine type safety: Ingram requires ≥0.03125" side clear when spine < 0.35";
# keep ≥0.04" so center-crops from spine-source retain a pad.
SPINE_SIDE_INSET_IN = 0.04
SPINE_THIN_THRESHOLD_IN = 0.35

# Per-book defaults (override with --back-line). At most three lines.
BACK_LINES_BY_BOOK_ID: dict[str, list[str]] = {
    "observer-patterns": [
        "What takes shape when looking, deciding, and following become decisive?",
        "What is observed repeatedly becomes believed.",
        "Once you see these patterns, they’re hard to ignore.",
    ],
    "when-others-become-leaders": [
        "What kind of leadership increases the capacity of others",
        "to act, care, organize, and lead beyond the originating person?",
        "This book asks what enduring influence leaves behind.",
    ],
}

FONT_PATHS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
]
SERIF_FONT_PATHS = [
    "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf",
]
SANS_BOLD_FONT_PATHS = [
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]

# Labeled spine: dark brown field + cream type (inverted from EKL cream/dark).
SPINE_BG = (58, 42, 28)
SPINE_FG = (246, 229, 203)
MIN_PAGES_FOR_SPINE_TEXT = 48

# Books that get a solid labeled spine with vertical title/author.
LABELED_SPINE_BOOK_IDS = frozenset({"when-others-become-leaders"})


def inches_to_px(inches: float, *, ppi: int = PPI) -> int:
    return int(round(inches * ppi))


def cream_spine_px(page_count: int, *, ppi: int = PPI) -> int:
    return max(1, int(round(page_count * CREAM_BULK_IN_PER_PAGE * ppi)))


def panel_size(*, ppi: int = PPI) -> tuple[int, int]:
    """Front/back panel: outside bleed + trim + top/bottom bleed."""
    w = inches_to_px(TRIM_W_IN + BLEED_IN, ppi=ppi)
    h = inches_to_px(TRIM_H_IN + 2 * BLEED_IN, ppi=ppi)
    return w, h


def fit_cover_to_panel(cover: Image.Image, size: tuple[int, int]) -> Image.Image:
    """Cover-fill the panel (center crop after upscale), LANCZOS."""
    return ImageOps.fit(cover.convert("RGB"), size, method=Image.Resampling.LANCZOS)


def load_font(
    size: int, paths: list[str] | None = None
) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in paths or FONT_PATHS:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def load_back_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    return load_font(size, FONT_PATHS)


def draw_centered_line(
    draw: ImageDraw.ImageDraw,
    *,
    text: str,
    center_x: int,
    y: int,
    font: ImageFont.ImageFont,
    fill: tuple[int, int, int] = (248, 246, 242),
    stroke: tuple[int, int, int] = (16, 20, 32),
    stroke_width: int = 2,
) -> int:
    """Draw one centered line; return the line height used."""
    bbox = draw.textbbox((0, 0), text, font=font, stroke_width=stroke_width)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = center_x - tw // 2
    draw.text(
        (x, y),
        text,
        font=font,
        fill=fill,
        stroke_width=stroke_width,
        stroke_fill=stroke,
    )
    return th


def make_back(
    cover: Image.Image,
    size: tuple[int, int],
    *,
    lines: list[str] | None = None,
) -> tuple[Image.Image, tuple[int, int, int, int]]:
    """Atmosphere field from cover color + ≤3-line back copy + barcode reserve.

    Returns ``(image, (x, y, w, h))`` barcode box in back-panel pixels.
    """
    w, h = size
    src = cover.convert("RGB")
    sw, sh = src.size
    # Prefer lower band so front title/author do not ghost through blur.
    band = src.crop((0, int(sh * 0.62), sw, sh))
    base = ImageOps.fit(band, size, method=Image.Resampling.LANCZOS)
    soft = base.filter(ImageFilter.GaussianBlur(radius=36))
    # Darken for print ink control and back-copy legibility.
    soft = Image.blend(soft, Image.new("RGB", size, (20, 24, 36)), 0.28)

    draw = ImageDraw.Draw(soft)
    bw = inches_to_px(BARCODE_W_IN)
    bh = inches_to_px(BARCODE_H_IN)
    # Bottom-center of the trim area (exclude left outside bleed).
    bleed = inches_to_px(BLEED_IN)
    safe = inches_to_px(SAFE_INSET_IN)
    trim_left = bleed
    trim_w = inches_to_px(TRIM_W_IN)
    cx = trim_left + trim_w // 2
    bottom = h - inches_to_px(BARCODE_BOTTOM_INSET_IN)
    x0 = cx - bw // 2
    y0 = bottom - bh
    # Quiet white/cream reserve for Ingram-generated barcode.
    draw.rounded_rectangle((x0, y0, x0 + bw, y0 + bh), radius=8, fill=(248, 245, 238))

    copy_lines = [ln.strip() for ln in (lines or []) if ln.strip()]
    if len(copy_lines) > 3:
        raise SystemExit(f"back cover allows at most 3 lines (got {len(copy_lines)})")
    if copy_lines:
        # Fit long question on one line inside the safe trim width.
        max_text_w = trim_w - 2 * safe
        question_size = 38
        body_size = 34
        q_font = load_back_font(question_size)
        while question_size >= 28:
            q_font = load_back_font(question_size)
            q_bbox = draw.textbbox((0, 0), copy_lines[0], font=q_font, stroke_width=2)
            if (q_bbox[2] - q_bbox[0]) <= max_text_w:
                break
            question_size -= 1
        body_font = load_back_font(min(body_size, question_size))

        # Upper-middle stack, clear of barcode reserve.
        gap_after_question = inches_to_px(0.28)
        line_gap = inches_to_px(0.14)
        y = int(h * 0.30)
        for idx, line in enumerate(copy_lines):
            font = q_font if idx == 0 else body_font
            th = draw_centered_line(draw, text=line, center_x=cx, y=y, font=font)
            y += th + (gap_after_question if idx == 0 else line_gap)

    return soft, (x0, y0, bw, bh)


def make_spine_source(cover: Image.Image, height: int, width: int) -> Image.Image:
    """Tall strip from a cover edge band (avoid title glyphs on thin spines)."""
    src = cover.convert("RGB")
    sw, sh = src.size
    # Far-left vertical band is usually pattern-only on these covers.
    band_w = max(8, sw // 12)
    left = max(0, sw // 40)
    crop = src.crop((left, 0, left + band_w, sh))
    return crop.resize((width, height), Image.Resampling.LANCZOS)


def _fit_font_to_width(
    text: str,
    *,
    max_width: int,
    max_size: int,
    min_size: int,
    paths: list[str],
) -> ImageFont.ImageFont:
    size = max_size
    font = load_font(size, paths)
    probe = ImageDraw.Draw(Image.new("RGB", (8, 8)))
    while size > min_size:
        font = load_font(size, paths)
        bbox = probe.textbbox((0, 0), text, font=font)
        if (bbox[2] - bbox[0]) <= max_width:
            return font
        size -= 1
    return load_font(min_size, paths)


def _fit_font_to_height(
    text: str,
    *,
    max_height: int,
    max_size: int,
    min_size: int,
    paths: list[str],
) -> ImageFont.ImageFont:
    """Largest font whose glyph bbox height fits the cross-spine safety width."""
    size = max_size
    font = load_font(size, paths)
    probe = ImageDraw.Draw(Image.new("RGB", (8, 8)))
    while size > min_size:
        font = load_font(size, paths)
        bbox = probe.textbbox((0, 0), text, font=font)
        if (bbox[3] - bbox[1]) <= max_height:
            return font
        size -= 1
    return load_font(min_size, paths)


def spine_side_inset_px(spine_px: int, *, ppi: int = PPI) -> int:
    """Side clear on the cropped spine panel (pixels)."""
    spine_in = spine_px / float(ppi)
    # Wider spines get Ingram's 0.0625" band; thin spines use house 0.04" pad.
    if spine_in >= SPINE_THIN_THRESHOLD_IN:
        return max(inches_to_px(0.0625, ppi=ppi), 6)
    return max(inches_to_px(SPINE_SIDE_INSET_IN, ppi=ppi), 6)


def make_labeled_spine_source(
    *,
    width: int,
    height: int,
    title: str,
    author: str,
    spine_px: int | None = None,
    bg: tuple[int, int, int] = SPINE_BG,
    fg: tuple[int, int, int] = SPINE_FG,
) -> Image.Image:
    """Solid labeled spine with vertical title/author, text centered for recrops.

    Glyph size is fitted to the *cropped* spine width (``spine_px``), not the
    wider ``spine-source`` master, so center-crops keep Ingram side clear.
    """
    crop_w = int(spine_px) if spine_px is not None else int(width)
    if crop_w < 1:
        raise ValueError(f"spine_px must be >= 1 (got {crop_w})")
    side_inset = spine_side_inset_px(crop_w)
    max_text_w = max(8, crop_w - 2 * side_inset)

    # Fit by glyph height: after -90° rotation, height becomes cross-spine width.
    title_font = _fit_font_to_height(
        title,
        max_height=max_text_w,
        max_size=min(64, max_text_w + 8),
        min_size=10,
        paths=SERIF_FONT_PATHS,
    )
    author_font = _fit_font_to_height(
        author.upper(),
        max_height=max(8, max_text_w - 2),
        max_size=min(40, max_text_w),
        min_size=9,
        paths=SANS_BOLD_FONT_PATHS,
    )

    # Horizontal band (title — rule — author), then rotate so upright spine reads top→bottom.
    probe = ImageDraw.Draw(Image.new("RGB", (8, 8)))
    t_bbox = probe.textbbox((0, 0), title, font=title_font)
    a_bbox = probe.textbbox((0, 0), author.upper(), font=author_font)
    t_w, t_h = t_bbox[2] - t_bbox[0], t_bbox[3] - t_bbox[1]
    a_w, a_h = a_bbox[2] - a_bbox[0], a_bbox[3] - a_bbox[1]
    gap = inches_to_px(0.22)
    rule_w = max(inches_to_px(0.35), min(t_w, a_w) // 2)
    band_w = t_w + gap + rule_w + gap + a_w + inches_to_px(0.3)
    band_h = max_text_w
    band = Image.new("RGB", (band_w, band_h), bg)
    bdraw = ImageDraw.Draw(band)
    x = inches_to_px(0.08)
    y_t = (band_h - t_h) // 2 - t_bbox[1]
    bdraw.text((x, y_t), title, font=title_font, fill=fg)
    x += t_w + gap
    rule_y = band_h // 2
    bdraw.line((x, rule_y, x + rule_w, rule_y), fill=fg, width=max(2, inches_to_px(0.01)))
    cx, cy = x + rule_w // 2, rule_y
    r = max(2, inches_to_px(0.016))
    bdraw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=fg)
    x += rule_w + gap
    y_a = (band_h - a_h) // 2 - a_bbox[1]
    bdraw.text((x, y_a), author.upper(), font=author_font, fill=fg)

    # Rotate 90° CW: title near the head of the book.
    rotated = band.rotate(-90, expand=True, resample=Image.Resampling.BICUBIC)
    rw, rh = rotated.size
    if rw > max_text_w:
        scale = max_text_w / float(rw)
        rotated = rotated.resize(
            (max_text_w, max(1, int(round(rh * scale)))),
            Image.Resampling.LANCZOS,
        )
        rw, rh = rotated.size
    spine = Image.new("RGB", (width, height), bg)
    ox = (width - rw) // 2
    top_margin = inches_to_px(0.55)
    bottom_margin = inches_to_px(0.55)
    avail = height - top_margin - bottom_margin
    oy = top_margin + max(0, (avail - rh) // 2)
    spine.paste(rotated, (ox, oy))
    return spine


def write_template_meta(
    path: Path,
    *,
    page_count: int,
    spine_px: int,
    front_w: int,
    front_h: int,
    barcode_box: tuple[int, int, int, int],
    spine_text: bool = False,
    ppi: int = PPI,
) -> None:
    spine_pt = round(spine_px / ppi * 72.0, 2)
    full_w = front_w * 2 + spine_px
    media_w = round(full_w / ppi * 72.0, 2)
    media_h = round(front_h / ppi * 72.0, 2)
    bx, by, bw, bh = barcode_box

    payload: dict[str, Any] = {
        "version": 1,
        "source": {
            "provider": "ingramspark",
            "template_file": "derived-from-book-cover.png",
        },
        "manufacturing": {
            "trim_width_inches": TRIM_W_IN,
            "trim_height_inches": TRIM_H_IN,
            "binding": "perfect-bound",
            "paper": "cream",
            "interior_color_mode": "black-and-white",
            "page_count": page_count,
        },
        "geometry": {
            "media_box_width_points": media_w,
            "media_box_height_points": media_h,
            "spine_width_points": spine_pt,
            "outside_bleed_points": BLEED_IN * 72.0,
            "top_bleed_points": BLEED_IN * 72.0,
            "bottom_bleed_points": BLEED_IN * 72.0,
            "safe_inset_points": SAFE_INSET_IN * 72.0,
        },
        "raster": {
            "required_ppi": ppi,
            "full_wrap": {
                "expected_width_pixels": full_w,
                "expected_height_pixels": front_h,
            },
            "components": {
                "back": {
                    "expected_width_pixels": front_w,
                    "expected_height_pixels": front_h,
                },
                "spine": {
                    "expected_width_pixels": spine_px,
                    "expected_height_pixels": front_h,
                },
                "front": {
                    "expected_width_pixels": front_w,
                    "expected_height_pixels": front_h,
                },
            },
        },
        "barcode_reserve": {
            "required": True,
            "panel": "back",
            "x_pixels": bx,
            "y_pixels": by,
            "width_pixels": bw,
            "height_pixels": bh,
        },
        "barcode_supplied": False,
        "spine_text": spine_text,
        "notes": (
            f"Panels derived from book-cover.png for {page_count} cream pages "
            f"(spine {spine_px}px / {spine_pt}pt). "
            + (
                "Spine is solid cream with vertical title/author (EKL-style). "
                if spine_text
                else "Spine is pattern-only (no spine text). "
            )
            + "Confirm geometry against the Cover Template Generator before upload."
        ),
    }
    path.write_text(yaml.safe_dump(payload, sort_keys=False), encoding="utf-8")


def write_ebook_front(front_path: Path, dest: Path, *, ppi: int = PPI) -> Path:
    """Bleed-free 6×9 crop from the front panel (right outside bleed removed)."""
    front = Image.open(front_path).convert("RGB")
    bleed = inches_to_px(BLEED_IN, ppi=ppi)
    trim_w = inches_to_px(TRIM_W_IN, ppi=ppi)
    trim_h = inches_to_px(TRIM_H_IN, ppi=ppi)
    # Front panel is trim + right outside bleed (+ vertical bleed). Crop to trim.
    crop = front.crop((0, bleed, trim_w, bleed + trim_h))
    if crop.size != (trim_w, trim_h):
        crop = crop.resize((trim_w, trim_h), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    crop.save(dest, format="PNG", dpi=(ppi, ppi))
    return dest


def _load_book_section(book_dir: Path) -> dict[str, Any]:
    spec_path = book_dir / "book.yml"
    if not spec_path.is_file():
        return {}
    data = yaml.safe_load(spec_path.read_text(encoding="utf-8")) or {}
    book = data.get("book") if isinstance(data, dict) else {}
    return book if isinstance(book, dict) else {}


def _book_id(book_dir: Path) -> str:
    book = _load_book_section(book_dir)
    if str(book.get("id") or "").strip():
        return str(book["id"]).strip()
    return book_dir.name


def generate(
    *,
    book_dir: Path,
    page_count: int,
    cover_name: str = DEFAULT_COVER,
    out_rel: str = DEFAULT_OUT_DIR,
    back_lines: list[str] | None = None,
    ebook_front: bool = False,
    spine_style: str = "auto",
) -> dict[str, Path]:
    if page_count < 18:
        raise SystemExit(f"page_count must be >= 18 for IngramSpark paperbacks (got {page_count})")
    # Prefer even counts (paperback rule).
    if page_count % 2 != 0:
        page_count += 1

    cover_path = book_dir / cover_name
    if not cover_path.is_file():
        raise SystemExit(f"Missing cover: {cover_path}")

    out_dir = book_dir / out_rel
    out_dir.mkdir(parents=True, exist_ok=True)

    book = _load_book_section(book_dir)
    book_id = str(book.get("id") or "").strip() or book_dir.name
    title = str(book.get("title") or book_id).strip()
    author = str((book.get("author") or {}).get("name") or "").strip() or "Kevin Steffensen"
    lines = back_lines if back_lines is not None else BACK_LINES_BY_BOOK_ID.get(book_id, [])

    style = spine_style.strip().lower()
    if style == "auto":
        style = "labeled" if book_id in LABELED_SPINE_BOOK_IDS else "pattern"
    if style == "labeled" and page_count < MIN_PAGES_FOR_SPINE_TEXT:
        raise SystemExit(
            f"labeled spine requires page_count >= {MIN_PAGES_FOR_SPINE_TEXT} (got {page_count})"
        )

    cover = Image.open(cover_path)
    front_w, front_h = panel_size()
    spine_px = cream_spine_px(page_count)
    source_w = spine_px + SPINE_SOURCE_PAD_PX

    front = fit_cover_to_panel(cover, (front_w, front_h))
    back, barcode_box = make_back(cover, (front_w, front_h), lines=lines)
    if style == "labeled":
        spine_source = make_labeled_spine_source(
            width=source_w,
            height=front_h,
            title=title,
            author=author,
            spine_px=spine_px,
        )
    else:
        spine_source = make_spine_source(cover, front_h, source_w)
    left = (source_w - spine_px) // 2
    spine = spine_source.crop((left, 0, left + spine_px, front_h))

    paths = {
        "front": out_dir / "front.png",
        "back": out_dir / "back.png",
        "spine": out_dir / "spine.png",
        "spine_source": out_dir / "spine-source.png",
        "meta": out_dir / "template-meta.yml",
    }
    dpi = (PPI, PPI)
    front.save(paths["front"], format="PNG", dpi=dpi)
    back.save(paths["back"], format="PNG", dpi=dpi)
    spine.save(paths["spine"], format="PNG", dpi=dpi)
    spine_source.save(paths["spine_source"], format="PNG", dpi=dpi)
    write_template_meta(
        paths["meta"],
        page_count=page_count,
        spine_px=spine_px,
        front_w=front_w,
        front_h=front_h,
        barcode_box=barcode_box,
        spine_text=(style == "labeled"),
    )
    if ebook_front:
        paths["ebook_front"] = write_ebook_front(paths["front"], out_dir / "ebook-front.png")
    return paths


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--book-dir", required=True)
    parser.add_argument(
        "--page-count",
        type=int,
        required=True,
        help="Measured (or provisional even) interior page count for cream spine width",
    )
    parser.add_argument("--cover", default=DEFAULT_COVER)
    parser.add_argument("--out-dir", default=DEFAULT_OUT_DIR)
    parser.add_argument(
        "--back-line",
        action="append",
        default=[],
        help="Back-cover line (repeat up to 3×). Defaults from book id when omitted.",
    )
    parser.add_argument(
        "--ebook-front",
        action="store_true",
        help="Also write ebook-front.png (bleed-free 6×9 crop of front.png)",
    )
    parser.add_argument(
        "--spine-style",
        choices=("auto", "pattern", "labeled"),
        default="auto",
        help="pattern=cover strip; labeled=solid spine with title/author",
    )
    args = parser.parse_args()

    book_dir = Path(args.book_dir).resolve()
    paths = generate(
        book_dir=book_dir,
        page_count=args.page_count,
        cover_name=args.cover,
        out_rel=args.out_dir,
        back_lines=args.back_line or None,
        ebook_front=args.ebook_front,
        spine_style=args.spine_style,
    )
    for key, path in paths.items():
        print(f"{key}={path}")


if __name__ == "__main__":
    main()
