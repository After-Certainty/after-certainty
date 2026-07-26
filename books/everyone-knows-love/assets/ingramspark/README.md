# IngramSpark print-cover panels (Everyone Knows Love)

Production source assets for `assembled-raster-wrap` (not website/ebook covers).

```
back.png    # 1838×2775 @ 300 ppi — left outside bleed + back trim + vertical bleed
spine.png   # 74×2775   @ 300 ppi — exact spine + vertical bleed
front.png   # 1838×2775 @ 300 ppi — front trim + right outside bleed + vertical bleed
template-meta.yml
```

Assembly order: **back → spine → front** → `{print-isbn}_cvr.pdf`.

The IngramSpark target is not enabled in `book.yml` until a real print ISBN and locked interior page count are available. Local conversion test:

```bash
python3 scripts/convert_ingramspark_print_cover.py \
  --book-dir books/everyone-knows-love \
  …
```

(requires a temporary enabled target + print ISBN in the spec used for the run).

See `docs/publishing/ingramspark-raster-wrap.md`.
