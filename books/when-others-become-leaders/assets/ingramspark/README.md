# IngramSpark print-cover panels (When Others Become Leaders)

Planning source assets for `assembled-raster-wrap` (not website covers). Derived from
`book-cover.png` via `tools/generate_ingramspark_wrap_from_cover.py`.

```
back.png          # 1838×2775 @ 300 ppi — atmosphere + 3-line back copy + barcode reserve
spine-source.png  # wider cream master for page-count recrops (title/author centered)
spine.png         # 96×2775 @ 300 ppi — cream spine + vertical title/author (128 pages)
front.png         # 1838×2775 @ 300 ppi — upscaled cover fitted into trim+bleed
ebook-front.png   # 1800×2700 @ 300 ppi — bleed-free 6×9 crop of front.png
template-meta.yml
```

Assembly order: **back → spine → front**.

Print ISBN: `9798256208912` → staged cover `9798256208912_cvr.pdf`.  
Ebook ISBN: `9798256208929` with cover source `ebook-front.png`.  
Measured interior: **128** cream pages (local XeLaTeX; CI may differ slightly — package-time sync).
Spine matches the EKL cream treatment: solid warm brown/cream field with vertical title + author.

Back copy (≤3 lines; website question + framing):

1. What kind of leadership increases the capacity of others
2. to act, care, organize, and lead beyond the originating person?
3. This book asks what enduring influence leaves behind.

```bash
python3 tools/generate_ingramspark_wrap_from_cover.py \
  --book-dir books/when-others-become-leaders --page-count 128 \
  --ebook-front --spine-style labeled
make build-ingramspark-print-cover DIR=books/when-others-become-leaders
make export-ingramspark-print DIR=books/when-others-become-leaders
make export-ingramspark-epub DIR=books/when-others-become-leaders
make package-ingramspark DIR=books/when-others-become-leaders
```

See `docs/publishing/ingramspark-raster-wrap.md`.
