---
name: open-graph-cover
description: >-
  Generates open-graph.png from a book cover using the house layout (blurred
  cropped background, title/subtitle left, cover thumbnail right). Use when
  adding or updating book covers, open_graph_image, OG images, or social preview
  assets for books in this repo.
---

# Open graph cover

Generate `open-graph.png` (1200×630) from `book-cover.png` using the same layout as *How Trust Forms*, *When Trust Stops Tracking Reality*, and *Trust Beyond Similarity*.

## Layout (do not simplify)

1. **Background** — crop a band from the cover art, resize to 1200×630, Gaussian blur, dark tint, left-to-right gradient for text legibility.
2. **Left** — stacked title lines + accent rule + subtitle (uppercase).
3. **Right** — full cover thumbnail with rounded shadow.

Do **not** use a plain center-crop of the cover as the OG image.

## Quick start

```bash
# From repo root — book dir must contain book-cover.png and book.yml
python3 tools/generate_open_graph.py --book-dir books/how-trust-forms
python3 tools/generate_open_graph.py --book-dir books/trust-beyond-similarity
```

Requires **Pillow** and **PyYAML** (`python3 -m pip install pillow pyyaml`).

Preview resolved settings without writing:

```bash
python3 tools/generate_open_graph.py --book-dir <BOOK_DIR> --dry-run
```

## Per-book tuning

Optional `open-graph.config.yml` in the book folder (same level as `book-cover.png`). See [reference.md](reference.md) for all keys.

**Trust Beyond Similarity** already has a tuned config: `books/trust-beyond-similarity/open-graph.config.yml`.

Without a config file, the script:

- Reads `title` / `subtitle` from `book.yml`
- Splits title words onto separate lines (alternating white / accent)
- Wraps subtitle to ~34 characters per line
- Uses a default central crop below the cover title area

Inspect the cover image and adjust `bg_crop` and `title_lines` until the blurred background and text balance match the cover palette.

## book.yml wiring

After generating the image, ensure `book.yml` includes:

```yaml
book:
  title_page_cover: book-cover.png
  open_graph_image: open-graph.png
```

Regenerate the title page if needed:

```bash
python3 -c "
from pathlib import Path
from scripts.frontmatter_gen import generate_frontmatter_for_book
generate_frontmatter_for_book(Path('.'), '<book-dir-relative-to-repo>')
"
```

## Workflow checklist

```
- [ ] Copy or confirm book-cover.png in book folder (basename for Pandoc resource-path)
- [ ] Add or tune open-graph.config.yml (title lines, colors, bg_crop)
- [ ] Run tools/generate_open_graph.py --book-dir <BOOK_DIR>
- [ ] Open open-graph.png — text readable, thumbnail not clipped, colors match cover
- [ ] Confirm book.yml title_page_cover + open_graph_image
- [ ] Regenerate front-matter/title-page.md if cover is new
```

## Reference covers

| Book | Path | Notes |
|------|------|-------|
| How Trust Forms | `books/how-trust-forms/` | Orange accent, porch crop |
| When Trust Stops Tracking Reality | `books/when-trust-stops-tracking-reality/` | Slate blue accent, hallway crop |
| Trust Beyond Similarity | `books/trust-beyond-similarity/` | Gold accent, community-night crop; has config file |

## Additional resources

- Config keys and color tokens: [reference.md](reference.md)
