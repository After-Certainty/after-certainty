"""Export IngramSpark front-cover-only RGB JPG from a book cover source."""

from __future__ import annotations

import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from after_certainty.ingramspark.paths import ebook_isbn, ebook_output_dir
from after_certainty.ingramspark.profile import load_profile


@dataclass(frozen=True)
class EbookCoverResult:
    path: Path
    width: int
    height: int
    mode: str


class EbookCoverError(ValueError):
    """Blocking cover export/validation failure."""


def _ebook_cfg(spec: dict[str, Any]) -> dict[str, Any]:
    from after_certainty.specs.book_specs import spec_ingramspark_target

    target = spec_ingramspark_target(spec)
    ebook = target.get("ebook")
    return ebook if isinstance(ebook, dict) else {}


def resolve_ebook_cover_source(book_dir: Path, spec: dict[str, Any]) -> Path:
    ebook = _ebook_cfg(spec)
    rel = str(ebook.get("cover_source") or "").strip()
    if not rel:
        raise EbookCoverError("publishing.targets.ingramspark.ebook.cover_source is required")
    path = (book_dir / rel).resolve()
    if not path.is_file():
        raise EbookCoverError(f"ebook cover_source not found: {rel}")
    return path


def _image_size(path: Path) -> tuple[int, int]:
    try:
        from PIL import Image

        with Image.open(path) as im:
            return im.size[0], im.size[1]
    except ModuleNotFoundError:
        pass

    identify = shutil.which("magick") or shutil.which("identify")
    if not identify:
        raise EbookCoverError(
            "Pillow or ImageMagick (magick/identify) is required to inspect ebook covers"
        )
    if Path(identify).name == "magick":
        cmd = [identify, "identify", "-format", "%w %h", path.as_posix()]
    else:
        cmd = [identify, "-format", "%w %h", path.as_posix()]
    out = subprocess.check_output(cmd, text=True).strip().split()
    if len(out) < 2:
        raise EbookCoverError(f"Could not read image geometry for {path}")
    return int(out[0]), int(out[1])


def _export_jpeg(
    source: Path, out_path: Path, *, resize_to: tuple[int, int] | None
) -> tuple[int, int]:
    try:
        from PIL import Image

        with Image.open(source) as im:
            im = im.convert("RGB")
            if resize_to is not None:
                im = im.resize(resize_to, Image.Resampling.LANCZOS)
            im.save(out_path, format="JPEG", quality=95, optimize=True, progressive=True)
            return im.size
    except ModuleNotFoundError:
        pass

    magick = shutil.which("magick") or shutil.which("convert")
    if not magick:
        raise EbookCoverError(
            "Pillow or ImageMagick is required to export IngramSpark ebook cover JPG"
        )
    cmd = [magick, source.as_posix(), "-colorspace", "sRGB"]
    if resize_to is not None:
        cmd.extend(["-resize", f"{resize_to[0]}x{resize_to[1]}!"])
    cmd.extend(["-quality", "95", out_path.as_posix()])
    subprocess.run(cmd, check=True)
    return _image_size(out_path)


def export_ebook_cover_jpg(
    *,
    repo: Path,
    book_dir: Path,
    spec: dict[str, Any],
    profile_id: str | None = None,
    allow_upscale: bool = False,
) -> EbookCoverResult:
    """
    Write ``ebook/<isbn>.jpg`` as front-cover-only RGB.

    Default policy: fail if the source is below profile minimum pixels (do not invent
    detail via naive upscaling). Set ``allow_upscale=True`` only for tests/fixtures.
    """
    from after_certainty.specs.book_specs import spec_ingramspark_target

    target = spec_ingramspark_target(spec)
    pid = profile_id or str(target.get("specification_profile") or "").strip()
    if not pid:
        raise EbookCoverError("specification_profile is required for ebook cover export")
    profile = load_profile(pid)
    ebook_profile = profile.get("ebook") if isinstance(profile.get("ebook"), dict) else {}
    min_long = int(ebook_profile.get("cover_min_longest_side_px") or 2560)
    min_short = int(ebook_profile.get("cover_min_shortest_side_px") or 1600)

    source = resolve_ebook_cover_source(book_dir, spec)
    width, height = _image_size(source)
    longest = max(width, height)
    shortest = min(width, height)
    resize_to: tuple[int, int] | None = None
    if longest < min_long or shortest < min_short:
        if not allow_upscale:
            raise EbookCoverError(
                f"ebook cover {source.name} is {width}x{height}px; IngramSpark profile "
                f"{pid} requires at least {min_long}px on the longest side and "
                f"{min_short}px on the shortest side. Provide a higher-resolution "
                f"front-cover source (do not rely on upscaling)."
            )
        scale = max(min_long / longest, min_short / shortest)
        resize_to = (max(1, int(round(width * scale))), max(1, int(round(height * scale))))

    out_dir = ebook_output_dir(repo, spec)
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{ebook_isbn(spec)}.jpg"
    out_w, out_h = _export_jpeg(source, out_path, resize_to=resize_to)
    return EbookCoverResult(path=out_path, width=out_w, height=out_h, mode="RGB")


def export_epub_internal_cover_image(
    *,
    repo: Path,
    book_dir: Path,
    spec: dict[str, Any],
    profile_id: str | None = None,
) -> Path:
    """
    Write a cover derivative for embedding inside the EPUB.

    Official sources require a large separate JPG cover and also cap any single
    interior image (including the internal cover) at 3.2M pixels in the safer
    profile default. Those constraints cannot be satisfied by one bitmap, so the
    internal cover is a resized RGB JPEG under the interior pixel cap.
    """
    from after_certainty.specs.book_specs import spec_ingramspark_target

    target = spec_ingramspark_target(spec)
    pid = profile_id or str(target.get("specification_profile") or "").strip()
    if not pid:
        raise EbookCoverError("specification_profile is required for internal cover export")
    profile = load_profile(pid)
    ebook_profile = profile.get("ebook") if isinstance(profile.get("ebook"), dict) else {}
    max_pixels = int(ebook_profile.get("max_interior_image_pixels") or 3_200_000)

    source = resolve_ebook_cover_source(book_dir, spec)
    width, height = _image_size(source)
    pixels = width * height
    resize_to: tuple[int, int] | None = None
    if pixels > max_pixels:
        scale = (max_pixels / pixels) ** 0.5
        # Slight shrink to stay strictly under the cap after rounding.
        scale *= 0.999
        resize_to = (max(1, int(width * scale)), max(1, int(height * scale)))

    out_dir = ebook_output_dir(repo, spec)
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "_internal-cover.jpg"
    _export_jpeg(source, out_path, resize_to=resize_to)
    out_w, out_h = _image_size(out_path)
    if out_w * out_h > max_pixels:
        raise EbookCoverError(
            f"internal EPUB cover is still {out_w}x{out_h} ({out_w * out_h} px); "
            f"profile max is {max_pixels}"
        )
    return out_path
