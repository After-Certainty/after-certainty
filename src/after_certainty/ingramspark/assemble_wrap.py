"""Lossless three-panel assembly for assembled-raster-wrap covers."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

from after_certainty.ingramspark.template_meta import ComponentPixels, NormalizedTemplateMeta


class AssembleWrapError(ValueError):
    """Blocking panel assembly / dimension failure."""


PANEL_ORDER = ("back", "spine", "front")


@dataclass(frozen=True)
class PanelPaths:
    back: Path
    spine: Path
    front: Path

    def as_dict(self) -> dict[str, Path]:
        return {"back": self.back, "spine": self.spine, "front": self.front}


def panel_dimension_mismatch_message(
    *,
    role: str,
    source_path: Path,
    width: int,
    height: int,
    expected_w: int,
    expected_h: int,
    page_count: int | None = None,
) -> str:
    role_title = {"back": "Back", "spine": "Spine", "front": "Front"}.get(role, role.title())
    if role == "spine":
        pages = page_count if page_count is not None else "the configured"
        return (
            "Spine image dimensions are stale.\n"
            "Source:\n"
            f"  {source_path.as_posix()}\n"
            f"  {width} × {height} px\n"
            "Required:\n"
            f"  {expected_w} × {expected_h} px\n"
            f"The current spine geometry is based on {pages} pages.\n"
            "Regenerate the spine image for the current template metadata.\n"
            "The converter will not scale, crop, pad, or extend this image."
        )
    bleed_note = {
        "back": "The back panel must include the configured left, top, and bottom bleed.",
        "front": "The front panel must include the configured right, top, and bottom bleed.",
    }.get(role, "The panel must include its configured bleed.")
    return (
        f"{role_title} cover dimensions do not match the configured IngramSpark geometry.\n"
        "Source:\n"
        f"  {source_path.as_posix()}\n"
        f"  {width} × {height} px\n"
        "Required:\n"
        f"  {expected_w} × {expected_h} px\n"
        f"{bleed_note}\n"
        "The converter will not scale, crop, pad, or extend this image."
    )


def assemble_rgb_wrap(
    *,
    panels: dict[str, Path],
    expected: dict[str, ComponentPixels],
    full_width: int,
    full_height: int,
    output_path: Path,
) -> dict[str, Any]:
    """
    Paste back|spine|front at exact integer coordinates with no resampling.

    Returns assembly metadata including boundary-pixel samples for tests/preflight.
    """
    try:
        from PIL import Image
    except ModuleNotFoundError as exc:  # pragma: no cover
        raise AssembleWrapError(
            "Pillow is required to assemble raster wrap panels. "
            "Install with: uv sync --frozen --group publishing"
        ) from exc

    for role in PANEL_ORDER:
        if role not in panels:
            raise AssembleWrapError(f"Missing {role} panel path for assembly")
        if role not in expected:
            raise AssembleWrapError(f"Missing expected dimensions for {role}")

    images: dict[str, Any] = {}
    try:
        for role in PANEL_ORDER:
            path = panels[role]
            im = Image.open(path)
            im.load()
            if im.size != (expected[role].width, expected[role].height):
                raise AssembleWrapError(
                    f"Refusing to assemble: {role} is {im.size[0]}×{im.size[1]} but expected "
                    f"{expected[role].width}×{expected[role].height}"
                )
            images[role] = im.convert("RGB")

        canvas = Image.new("RGB", (full_width, full_height))
        x = 0
        placements: dict[str, int] = {}
        for role in PANEL_ORDER:
            placements[role] = x
            canvas.paste(images[role], (x, 0))
            x += expected[role].width
        if x != full_width:
            raise AssembleWrapError(
                f"Internal assembly width error: placed {x} px, expected {full_width} px"
            )
        if canvas.size != (full_width, full_height):
            raise AssembleWrapError(
                f"Assembled canvas is {canvas.size[0]}×{canvas.size[1]}, "
                f"expected {full_width}×{full_height}"
            )

        # Boundary preservation samples (mid-height).
        mid_y = full_height // 2
        boundary: dict[str, Any] = {"resampled": False, "panelOrder": list(PANEL_ORDER)}
        back_w = expected["back"].width
        spine_w = expected["spine"].width
        samples = {
            "backRightEdge": canvas.getpixel((back_w - 1, mid_y)),
            "spineLeftEdge": canvas.getpixel((back_w, mid_y)),
            "spineRightEdge": canvas.getpixel((back_w + spine_w - 1, mid_y)),
            "frontLeftEdge": canvas.getpixel((back_w + spine_w, mid_y)),
        }
        source_samples = {
            "backRightEdge": images["back"].getpixel((back_w - 1, mid_y)),
            "spineLeftEdge": images["spine"].getpixel((0, mid_y)),
            "spineRightEdge": images["spine"].getpixel((spine_w - 1, mid_y)),
            "frontLeftEdge": images["front"].getpixel((0, mid_y)),
        }
        if samples != source_samples:
            raise AssembleWrapError(
                "Assembly altered panel-boundary pixels (gap, overlap, or blending detected).\n"
                f"  assembled={samples}\n"
                f"  source={source_samples}"
            )
        boundary["boundarySamples"] = samples
        boundary["sourceBoundarySamples"] = source_samples
        boundary["placementsX"] = placements

        output_path.parent.mkdir(parents=True, exist_ok=True)
        canvas.save(output_path, format="PNG", compress_level=1)
    finally:
        for im in images.values():
            try:
                im.close()
            except Exception:  # noqa: BLE001
                pass

    return {
        "path": output_path.as_posix(),
        "widthPixels": full_width,
        "heightPixels": full_height,
        "panelOrder": list(PANEL_ORDER),
        "resampled": False,
        "placementsX": boundary["placementsX"],
        "boundarySamplesMatch": True,
        "tool": "Pillow.Image.paste",
        "toolVersion": _pillow_version(),
    }


def _pillow_version() -> str:
    try:
        from PIL import Image

        return getattr(Image, "__version__", "unknown")
    except Exception:  # noqa: BLE001
        return "unknown"


def require_components(meta: NormalizedTemplateMeta) -> dict[str, ComponentPixels]:
    if not meta.components:
        raise AssembleWrapError(
            "assembled-raster-wrap requires template-meta raster.components "
            "(back/spine/front expected pixels) and raster.full_wrap"
        )
    return meta.components
