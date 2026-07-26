# IngramSpark raster full-wrap cover conversion

Operating notes for the opt-in `print.cover.strategy: raster-wrap` path. Authority for the broader target remains [`docs/roadmaps/ingramspark-distribution-target.md`](../roadmaps/ingramspark-distribution-target.md).

## What a production raster wrap PNG is

A **flattened full-wrap PNG** containing back cover, spine, and front cover (plus bleed) as a single image. It is a **print manufacturing source**, not the website/ebook front cover.

- Not generated from the site cover
- Not upscaled from a concept mockup
- Not committed as CMYK intermediates under `apps/site/public`

## Configuration (book.yml)

```yaml
publishing:
  targets:
    ingramspark:
      enabled: true
      specification_profile: ingramspark-2026-07
      print:
        enabled: true
        edition: paperback
        isbn: "978……………"   # real print ISBN before packaging
        binding: perfect-bound
        trim: { width_inches: 6.0, height_inches: 9.0 }
        interior: { color_mode: black-and-white, paper: cream, bleed: false }
        cover:
          strategy: raster-wrap
          source: assets/ingramspark/full-wrap.png
          template_metadata: assets/ingramspark/template-meta.yml
          template_page_count: 240   # must match interior + template-meta
          barcode_mode: ingram-generated
```

Output filename is **derived**: `{print-isbn}_cvr.pdf` under `build/ingramspark/<book-id>/print/`. Artifact names are not configurable.

## template-meta.yml (raster v1)

Prefer storing **exact PDF geometry in points** and **integer expected pixels**:

```yaml
version: 1
source:
  provider: ingramspark
  template_file: ingram-cover-template.pdf
manufacturing:
  trim_width_inches: 6
  trim_height_inches: 9
  binding: perfect-bound
  paper: cream
  interior_color_mode: black-and-white
  page_count: 240
geometry:
  media_box_width_points: …   # from the Ingram template
  media_box_height_points: …
  spine_width_points: …
  bleed_points: 9.0             # 0.125 in
  safe_inset_points: 18.0       # optional; used for overlay / reserve checks
raster:
  required_ppi: 300
  expected_width_pixels: …      # must equal round(media_box_width_inches × ppi)
  expected_height_pixels: …
barcode_reserve:
  required: true
  width_inches: 1.75
  height_inches: 1.0
  x_points: …                   # lower-left in media-box coordinates
  y_points: …
```

Legacy flat `template-meta.yml` (for `supplied-wrap` PDF) remains valid. Raster-wrap requires the versioned form.

### Rounding / consistency

`expected_*_pixels` must equal `round(media_box_inches × required_ppi)` using Python’s `round` (IEEE banker's rounding at exact `.5`). Effective PPI is reported as `pixels / media_box_inches` and is **not** taken from embedded PNG DPI tags.

Manufacturing fields are compared to `print.trim`, `print.binding`, `print.interior.paper`, `print.interior.color_mode`, and measured interior page count. Stale templates fail before conversion.

## Exact dimension rule

The source PNG must match `expected_width_pixels` × `expected_height_pixels` **exactly**.

The converter will **not** stretch, crop, pad, resample, upscale, or downsample. Embedded DPI metadata is ignored for sizing; physical size comes from pixel dimensions + template media box + exact PDF placement.

## Transparency

Meaningful transparency fails. Fully opaque alpha channels are allowed. Silent flatten against an assumed background is not implemented; profile `allow_transparency_flatten` remains false.

## Barcode reserve (`barcode_mode: ingram-generated`)

- Geometry must be present and fully inside the back-cover panel (and safe area when `safe_inset_points` is set).
- Must not overlap spine / front / bleed-only-only placement.
- Inspection overlay draws the reserve; preflight lists it for **manual review**.
- Optional luma heuristic may note “approximately uniform/light” but **does not prove** absence of design content.
- No barcode art and no ISBN invention.

## Color conversion (provisional)

Profile block `print.cover_raster` (status `experimental-warning`):

| Setting | Current candidate |
|--------|-------------------|
| Tool | ImageMagick (`convert` / `magick`) |
| Working RGB ICC | Ghostscript `srgb.icc` |
| Working CMYK ICC | Ghostscript `default_cmyk.icc` |
| Rendering intent | Relative |
| Black-point compensation | on |
| PDF/X output intent | `none-provisional` |

Do **not** label the result fully Ingram-approved. Dimension checks remain blocking; color/PDF/X remain warning / manual-review until account verification.

## Commands

```bash
make build-ingramspark-print-cover DIR=path/to/book-folder
make validate-ingramspark-print-cover DIR=path/to/book-folder

uv run python scripts/convert_ingramspark_print_cover.py \
  --book books/<book-id> \
  --source assets/ingramspark/full-wrap.png \
  --template-meta assets/ingramspark/template-meta.yml
```

Work directory (not website assets):

```
build/ingramspark/<book-id>/print-cover/
  source-inspection.json
  converted-cover.tif
  cover.pdf
  preflight.json
  preflight.txt
  inspection-overlay.png
```

Staged production name: `build/ingramspark/<book-id>/print/{isbn}_cvr.pdf`.

## Website exclusion

Raster covers are only on the IngramSpark packaging path. They are not a `build.formats` entry, not copied into `apps/site/public`, and not listed in public book manifests or download buttons.

## Preparing the RGB PNG

1. Request an IngramSpark Cover Template Generator PDF for the current page count / trim / paper / binding.
2. Record observed geometry in `template-meta.yml` (points + expected pixels at 300 ppi).
3. Design the wrap at those exact pixel dimensions in RGB (or export flattened RGB).
4. Leave the barcode reserve empty when using `ingram-generated`.
5. Run `build-ingramspark-print-cover` and inspect `inspection-overlay.png` + `preflight.txt`.
