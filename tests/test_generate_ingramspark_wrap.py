"""Tests for IngramSpark wrap panel generator helpers."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

_REPO = Path(__file__).resolve().parents[1]
_TOOLS = _REPO / "tools"
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

pil = pytest.importorskip("PIL")

from generate_ingramspark_wrap_from_cover import (  # noqa: E402
    BARCODE_H_IN,
    BARCODE_W_IN,
    cream_spine_px,
    make_labeled_spine_source,
    spine_side_inset_px,
)


def test_barcode_defaults_match_ingram_placement_size() -> None:
    assert BARCODE_W_IN == pytest.approx(1.75)
    assert BARCODE_H_IN == pytest.approx(1.0)


def test_cream_spine_px_80() -> None:
    assert cream_spine_px(80) == 60


def test_labeled_spine_content_fits_cropped_safety() -> None:
    spine_px = 60
    source_w = spine_px + 20
    height = 600
    source = make_labeled_spine_source(
        width=source_w,
        height=height,
        title="Everyone Knows Love",
        author="Kevin Steffensen",
        spine_px=spine_px,
    )
    left = (source_w - spine_px) // 2
    cropped = source.crop((left, 0, left + spine_px, height))
    bg = cropped.getpixel((0, 0))
    cols: set[int] = set()
    for y in range(height):
        for x in range(spine_px):
            px = cropped.getpixel((x, y))
            if sum(abs(int(a) - int(b)) for a, b in zip(px, bg, strict=True)) > 40:
                cols.add(x)
    assert cols, "expected spine type ink"
    c0, c1 = min(cols), max(cols)
    inset = spine_side_inset_px(spine_px)
    assert c0 >= inset - 1
    assert (spine_px - 1 - c1) >= inset - 1
    assert (c1 - c0 + 1) <= spine_px - 2 * inset + 2
