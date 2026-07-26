# IngramSpark print-cover panels (Everyone Knows Love)

Production source assets for `assembled-raster-wrap` (not website/ebook covers).

```
back.png    # 1838×2775 @ 300 ppi — left outside bleed + back trim + vertical bleed
spine.png   # 74×2775   @ 300 ppi — exact spine + vertical bleed
front.png   # 1838×2775 @ 300 ppi — front trim + right outside bleed + vertical bleed
template-meta.yml
```

Assembly order: **back → spine → front**.

Print ISBN: `9798256206949` → staged cover `9798256206949_cvr.pdf`.  
Ebook ISBN `9798256206956` is reserved in `book.yml` (ebook target still disabled until the front cover meets pixel minima).

```bash
make build-ingramspark-print-cover DIR=books/everyone-knows-love
make export-ingramspark-print DIR=books/everyone-knows-love
make package-ingramspark DIR=books/everyone-knows-love
```

Lock interior page count against `template_page_count` / `template-meta.yml` (provisional **100**) and regenerate `spine.png` if the measured length differs. Enlarge the back barcode clear area to ≥1.75″ × 1.0″ before IngramSpark upload. See `docs/publishing/ingramspark-raster-wrap.md`.
