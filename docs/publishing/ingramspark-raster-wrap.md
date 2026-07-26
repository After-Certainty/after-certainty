# IngramSpark raster print-cover conversion

Operating notes for opt-in raster print covers. Authority for the broader target remains [`docs/roadmaps/ingramspark-distribution-target.md`](../roadmaps/ingramspark-distribution-target.md).

Two strategies share color conversion, PDF generation, preflight, and website exclusion:

| Strategy | Inputs |
|----------|--------|
| `raster-wrap` | One exact-size full-wrap PNG |
| `assembled-raster-wrap` | Separate `back.png`, `spine.png`, `front.png` |

These are **print manufacturing sources**, not website/ebook front covers.

## Why three images?

Design tools often export back, spine, and front separately. Assembling in-repo keeps:

- Exact spine widths tied to page count / paper (regenerate only the spine when the interior length changes)
- Clear bleed ownership per panel
- No silent scaling when one panel is wrong

Order is always left-to-right: **back → spine → front**.

```
┌─────────────────┬───────────┬─────────────────┐
│      BACK       │   SPINE   │      FRONT      │
└─────────────────┴───────────┴─────────────────┘
```

## Bleed ownership

The converter never invents bleed (no edge extend, no background pad).

| Panel | Includes |
|-------|----------|
| **Back** | Left outside bleed + back trim + top/bottom bleed. No horizontal bleed into the spine. |
| **Spine** | Exact spine width + top/bottom bleed. No horizontal bleed beyond spine bounds. |
| **Front** | Front trim + right outside bleed + top/bottom bleed. No horizontal bleed into the spine. |

```
full_wrap_width  = back_w + spine_w + front_w
full_wrap_height = trim_height + top_bleed + bottom_bleed
```

## Example asset layout

```
assets/ingramspark/
├── front.png
├── back.png
├── spine.png
├── template.pdf          # optional local copy of the Ingram template
└── template-meta.yml
```

## Configuration

### Single wrap (`raster-wrap`)

```yaml
cover:
  strategy: raster-wrap
  source: assets/ingramspark/full-wrap.png
  template_metadata: assets/ingramspark/template-meta.yml
  template_page_count: 240
  barcode_mode: ingram-generated
```

### Assembled panels (`assembled-raster-wrap`)

```yaml
cover:
  strategy: assembled-raster-wrap
  template_metadata: assets/ingramspark/template-meta.yml
  template_page_count: 240
  barcode_mode: ingram-generated
  assets:
    back: assets/ingramspark/back.png
    spine: assets/ingramspark/spine.png
    front: assets/ingramspark/front.png
```

Output filename is **derived**:

| Config | Staged name |
|--------|-------------|
| `print.isbn` set | `{print-isbn}_cvr.pdf` (IngramSpark submission name) |
| `print.isbn` omitted, `status: planning` | `{book.id}_cvr.pdf` (local cover preview) |

Omitting the ISBN is allowed only for `status: planning` cover previews (no GitHub release packaging flags). Interior export and submission-kit packaging still require a real print ISBN. Panel assembly does not invent barcodes or ISBNs.

### Planning cover preview (no ISBN yet)

```yaml
publishing:
  targets:
    ingramspark:
      enabled: true
      specification_profile: ingramspark-2026-07
      status: planning
      package:
        github_release: false
        immutable_release: false
      ebook:
        enabled: false
      print:
        enabled: true
        edition: paperback
        # isbn omitted until assigned
        binding: perfect-bound
        trim: { width_inches: 6.0, height_inches: 9.0 }
        interior:
          color_mode: black-and-white
          paper: cream
          bleed: false
        cover:
          strategy: assembled-raster-wrap
          template_metadata: assets/ingramspark/template-meta.yml
          template_page_count: 100
          barcode_mode: ingram-generated
          assets:
            back: assets/ingramspark/back.png
            spine: assets/ingramspark/spine.png
            front: assets/ingramspark/front.png
```

Then:

```bash
make build-ingramspark-print-cover DIR=books/everyone-knows-love
make package-ingramspark DIR=books/everyone-knows-love
```

The package target writes an inspectable **preview** ZIP (not a submission kit):

`build/ingramspark/everyone-knows-love/everyone-knows-love-ingramspark-preview.zip`

Contents: staged cover PDF, cover preflight, inspection overlay, README (`NOT FOR INGRAMSPARK UPLOAD`), checksums, and metadata. CI workflow `.github/workflows/ingramspark-preview.yml` uploads the same ZIP as a PR/workflow artifact named `ingramspark-preview-<book-id>`.

## template-meta.yml

### Assembled (preferred for three panels)

```yaml
version: 1
manufacturing: { … page_count, trim, binding, paper, interior_color_mode … }
geometry:
  media_box_width_points: …
  media_box_height_points: …
  spine_width_points: …
  outside_bleed_points: 9.0
  top_bleed_points: 9.0
  bottom_bleed_points: 9.0
raster:
  required_ppi: 300
  full_wrap:
    expected_width_pixels: …
    expected_height_pixels: …
  components:
    back:  { expected_width_pixels: …, expected_height_pixels: … }
    spine: { expected_width_pixels: …, expected_height_pixels: … }
    front: { expected_width_pixels: …, expected_height_pixels: … }
barcode_reserve:
  required: true
  panel: back
  x_pixels: …          # top-left in the back panel image
  y_pixels: …
  width_pixels: …      # must be ≥ 1.75 in at required_ppi
  height_pixels: …     # must be ≥ 1.0 in at required_ppi
```

Uniform `bleed_points` (all sides equal) remains accepted. Single-wrap may still use flat `expected_width_pixels` / `expected_height_pixels` and point-based barcode reserves.

### Consistency

Stored integer pixels must equal `round(inches × required_ppi)` for the media box and each component. Component heights must match; widths must sum to full-wrap width. Embedded PNG DPI is never authoritative.

## Assembly

Lossless Pillow paste at:

- back: `x=0`
- spine: `x=back_width`
- front: `x=back_width+spine_width`
- all: `y=0`

Intermediate: `build/ingramspark/<book-id>/print-cover/assembled-wrap-rgb.png`

Then the shared CMYK path → one-page PDF. Panels are **not** color-converted separately (avoids edge seams).

## Exact dimension rule

Every panel (or the single wrap) must match expected pixels **exactly**. Correct aspect ratio alone is insufficient. The converter will not scale, crop, pad, stretch, resample, rotate, or extend edges.

After page-count changes, regenerate **spine.png** (and update `template-meta.yml` spine geometry); back/front can often stay if trim/bleed are unchanged.

## Barcode reserve

Belongs to the **back** panel when `barcode_mode: ingram-generated`. Validated against back geometry; shown on the inspection overlay; listed for human review. Approximate blankness detection is heuristic only. No barcode is generated.

## Color conversion

Profile-driven ImageMagick path (`print.cover_raster`). Working ICC profiles convert
RGB→CMYK, then `strip_per_object_icc` removes them so the PDF is DeviceCMYK + Flate/Zip
(no LZW). Everyone Knows Love and Observer Patterns cover uploads accepted this
construction (2026-07; `cover_raster.status: account-accepted`). Cover PDF/X
OutputIntent remains `none-provisional`.

## Commands

```bash
make build-ingramspark-print-cover DIR=path/to/book-folder
make validate-ingramspark-print-cover DIR=path/to/book-folder

python3 scripts/convert_ingramspark_print_cover.py \
  --book-dir books/<book-id> \
  --back assets/ingramspark/back.png \
  --spine assets/ingramspark/spine.png \
  --front assets/ingramspark/front.png \
  --template-meta assets/ingramspark/template-meta.yml
```

Work directory:

```
build/ingramspark/<book-id>/print-cover/
  source-inspection.json
  assembled-wrap-rgb.png
  assembled-wrap-cmyk.tif
  cover.pdf
  preflight.json
  preflight.txt
  inspection-overlay.png
```

Staged: `build/ingramspark/<book-id>/print/{isbn}_cvr.pdf`. Overlay guides never enter the production PNG/PDF.

## Website exclusion

Not a `build.formats` entry; not copied to `apps/site/public`; not listed in public manifests. The ebook cover remains a separate front-only RGB JPG under the ebook target.
