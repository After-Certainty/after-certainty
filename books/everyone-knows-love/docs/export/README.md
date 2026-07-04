# Export assets — Everyone Knows Love

Per-format support for the **Closing** page (liturgical pause + centered seed quote).

| File | Format | Role |
|------|--------|------|
| `reference.docx` | DOCX | `Closing Page Break` + `Closing Quote Block` paragraph styles (Pandoc `--reference-doc`) |
| `epub.css` | EPUB | Centers `.closing-quote`; page break before `.closing-page-break` |
| `pdf-header.tex` | PDF | LaTeX environments for `closing-page-break` and `closing-quote` |

## Source markup

`back-matter/closing.md` uses Pandoc fenced divs:

```markdown
::: {custom-style="Closing Page Break" .closing-page-break}
:::

::: {custom-style="Closing Quote Block" .closing-quote}
…
:::
```

- **DOCX:** `custom-style` maps to Word paragraph styles in `reference.docx`.
- **EPUB:** `kindle-flatten.py` rewrites to `::: closing-quote` class divs; `export_epub.py` passes `--css=epub.css`.
- **PDF:** `export_pdf.py` passes `--include-in-header=pdf-header.tex` and `markdown+fenced_divs`.

## Regenerate reference.docx

```bash
make generate-reference-docx \
  OUT=books/everyone-knows-love/docs/export/reference.docx
```

## Test exports

```bash
make export-docx DIR=books/everyone-knows-love
make export-kindle-epub DIR=books/everyone-knows-love
make export-pdf DIR=books/everyone-knows-love   # requires xelatex
pytest tests/test_closing_export.py -q
```
