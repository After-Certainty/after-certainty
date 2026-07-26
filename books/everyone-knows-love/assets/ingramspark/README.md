# IngramSpark print-cover panels (Everyone Knows Love)

Production source assets for `assembled-raster-wrap` (not website/ebook covers).

```
back.png         # 1838×2775 @ 300 ppi — left outside bleed + back trim + vertical bleed
spine.png        # 44×2775   @ 300 ppi — exact spine + vertical bleed (59 cream pages)
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

`template_page_count` / `template-meta.yml` are locked to the measured interior (**59**). Regenerate `spine.png` + geometry if the interior length changes. Enlarge the back barcode clear area to ≥1.75″ × 1.0″ before IngramSpark upload. See `docs/publishing/ingramspark-raster-wrap.md`.
