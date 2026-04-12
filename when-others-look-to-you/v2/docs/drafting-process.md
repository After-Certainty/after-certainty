# When Others Look to You (v2) — drafting process

## Purpose

Same workflow philosophy as v1: structured markdown, `index.md` as hub, review in
batches, exports via the repo `Makefile`. This document only records **v2
paths and edition differences**. For branch/PR discipline, long-form checklists,
and section audit steps, read **`../v1/docs/drafting-process.md`** and apply
what fits this four-part manuscript.

**Manuscript root:** `when-others-look-to-you/v2/`

---

## Export and production

- **Word export:**  
  `make export-docx DIR=when-others-look-to-you/v2`  
  Requires `v2/docs/reference.docx` (copy or symlink from `v1/docs/reference.docx` until v2 has its own template).

- **Kindle EPUB:**  
  `make export-kindle-epub DIR=when-others-look-to-you/v2`

- **Import Word → Markdown (single file):**  
  `make docx-to-md IN=when-others-look-to-you/v2/import.docx`  
  Note: `make import-docx` skips folders that already have `index.md`.

- **Diagrams:** SVG sources live in `docs/diagrams/`. Rasterization to
  `export-assets/diagrams/` follows the same rules as v1 (see v1 drafting-process
  for `rsvg-convert` / `magick`).

- **Cover:** If you add `BookCover.png` at the v2 manuscript root, Kindle exports
  pick it up the same way as v1.

---

## Structure expectations (v2)

- **Front matter** under `front-matter/` (subset may differ from v1).
- **Four parts** under `parts/part-1-forming/` … `part-4-repeating/`, each with
  `bridge.md` and chapter files.
- **Chapters 1–10** map to the ten Appendix B patterns in reading order (see
  `when-others-look-to-you-updated-patterns.md`).
- **Back matter** optional; `back-matter/` reserved when you add files.

---

## Branch naming

Use the same `<book-slug>-…` convention as v1 (`book-slug` =
`when-others-look-to-you`). Part branches can be named by v2 part if useful, e.g.
`when-others-look-to-you-v2-part-forming` — not mandatory, but keep one
consolidated commit per approved batch if you mirror v1 practice.

---

## Rule compliance

Run substantive checks against **`../v1/docs/book-rules.md`**, then apply
**`book-rules.md`** in this folder for v2-only structural notes.
