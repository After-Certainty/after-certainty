# IngramSpark print-cover panels (Everyone Knows Love)

Production source assets for `assembled-raster-wrap` (not website/ebook covers).

```
back.png    # 1838×2775 @ 300 ppi — left outside bleed + back trim + vertical bleed
spine.png   # 74×2775   @ 300 ppi — exact spine + vertical bleed
front.png   # 1838×2775 @ 300 ppi — front trim + right outside bleed + vertical bleed
template-meta.yml
```

Assembly order: **back → spine → front**.

`book.yml` opts into IngramSpark with `status: planning` and **no** `print.isbn` yet. Cover preview stages as:

`build/ingramspark/everyone-knows-love/print/everyone-knows-love_cvr.pdf`

```bash
make build-ingramspark-print-cover DIR=books/everyone-knows-love
make package-ingramspark DIR=books/everyone-knows-love
```

Preview ZIP (inspectable, not for Ingram upload):

`build/ingramspark/everyone-knows-love/everyone-knows-love-ingramspark-preview.zip`

CI uploads the same file as workflow artifact `ingramspark-preview-everyone-knows-love`.

Assign a real print ISBN (and lock interior page count / regenerate spine if needed) before packaging a submission kit or uploading to IngramSpark. See `docs/publishing/ingramspark-raster-wrap.md`.
