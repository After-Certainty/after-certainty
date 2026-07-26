# IngramSpark print-cover panels (Everyone Knows Love)

Production source assets for `assembled-raster-wrap` (not website/ebook covers).

```
back.png         # 1838×2775 @ 300 ppi — left outside bleed + back trim + vertical bleed
spine-source.png  # 74×2775 @ 300 ppi — uncropped master for page-count recrops
spine.png        # 57×2775   @ 300 ppi — center-cropped from 74×2775 master (76 cream pages)
front.png        # 1838×2775 @ 300 ppi — front trim + right outside bleed + vertical bleed
ebook-front.png  # 1800×2700 @ 300 ppi — bleed-free 6×9 crop of front.png (ebook cover source)
template-meta.yml
```

Assembly order: **back → spine → front**.

Print ISBN: `9798256206949` → staged cover `9798256206949_cvr.pdf`.  
Ebook ISBN `9798256206956` is enabled in `book.yml` with cover source `ebook-front.png`.

```bash
make build-ingramspark-print-cover DIR=books/everyone-knows-love
make export-ingramspark-print DIR=books/everyone-knows-love
make package-ingramspark DIR=books/everyone-knows-love
```

`template_page_count` / spine geometry sync to the measured interior at package time (from `spine-source.png`). Back barcode clear area is ~2.58″ × 1.52″ (meets ≥1.75″ × 1.0″). See `docs/publishing/ingramspark-raster-wrap.md`.
