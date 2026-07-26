# IngramSpark print-cover panels (Observer Patterns)

Planning source assets for `assembled-raster-wrap` (not website covers). Derived from
`book-cover.png` via `tools/generate_ingramspark_wrap_from_cover.py` for visual review
before full production packaging.

```
back.png          # 1838×2775 @ 300 ppi — blurred lower-band atmosphere + barcode clear reserve
spine-source.png  # 44×2775 @ 300 ppi — uncropped master for page-count recrops
spine.png         # 24×2775 @ 300 ppi — center-cropped for 32 cream pages (provisional)
front.png         # 1838×2775 @ 300 ppi — upscaled cover fitted into trim+bleed
template-meta.yml
```

Assembly order: **back → spine → front**.

Print ISBN: `9798256208776` → staged cover `9798256208776_cvr.pdf`.  
Provisional interior length: **32** cream pages (Typst print PDF measured ~31, even-padded).
Spine text is off (< 48 pages). Ebook remains disabled (print-only).

```bash
python3 tools/generate_ingramspark_wrap_from_cover.py \
  --book-dir books/observer-patterns --page-count 32
make build-ingramspark-print-cover DIR=books/observer-patterns
make export-ingramspark-print DIR=books/observer-patterns
make package-ingramspark DIR=books/observer-patterns
```

After final interior export, sync `template_page_count` / spine geometry and confirm
against the Cover Template Generator. See `docs/publishing/ingramspark-raster-wrap.md`.
