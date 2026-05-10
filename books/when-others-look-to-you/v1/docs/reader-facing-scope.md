# Reader-facing vs writer-facing scope

## Purpose

This book keeps two audiences straight:

- **Reader-facing** text is written for someone reading the finished book: argument, orientation, definitions, and reference material they are meant to see.
- **Writer-facing** text is written for authors, editors, and tools: house rules, workflow, expansion plans, integration guides, and generated metrics.

When reader-facing files pick up writer-facing phrasing (“bold this in chapters,” “see `book-rules.md`,” “run the checklist in…”), the published voice breaks. This document lists **which paths belong to which audience** and gives a **repeatable pass** to keep the reader-facing tree clean.

**Single source of truth for tone and register:** `docs/book-rules.md` (**Interpretive register** and related sections). This file only scopes **where** those rules apply.

---

## Reader-facing paths (v1)

Treat everything under these roots as **reader-facing**, including navigation and legal front matter:

| Area | Path (under `books/when-others-look-to-you/v1/`) |
|------|--------------------------------------------|
| Reading order hub | `index.md` |
| Front matter | `front-matter/**/*.md` |
| Body | `parts/**/*.md` (bridges and chapters) |
| Back matter | `back-matter/**/*.md` |

**In scope for the reader-facing pass:** all Markdown in those trees.

**Notes:**

- **Glossary** (`back-matter/glossary.md`) defines terms for readers; it should not explain production conventions (bolding rules live in `book-rules.md`; the reader-facing conventions page is a short map only).
- **Typographical conventions** is reader-facing: a **brief** map of pull quotes, Pattern blocks, and vignettes. Full production rules live in `book-rules.md` (**Plain speak (house style)** scopes how short that page stays).
- **Appendix B** is reader-facing **reference** material (catalog layout by design). It still should not address editors (“do not add a second Pattern Block here”) in body text; production rules belong in `book-rules.md` / `pattern-integration-guide.md`.
- **Copyright / title page** stay reader-facing; legal and catalog metadata only.

---

## Writer-facing paths (v1)

Treat as **writer-facing** (not shipped as book argument):

| Area | Path |
|------|------|
| House rules and editorial docs | `docs/**/*.md` **except** anything you explicitly decide to duplicate for readers (none today) |
| Scripts and tooling | `v1/scripts/**` |
| Export / template assets | e.g. `docs/reference.docx`, `docs/diagrams/**`, `export-assets/**` (as referenced from `drafting-process.md`) |

Plans, status logs, readability tables, and integration guides live here by design.

---

## Edge cases

- **`index.md`** — Reader-facing (**Contents** list). It should only link to manuscript paths, not to `docs/` workflow files.
- **Footnotes in chapters** — Reader-facing. Cite external works and URLs; avoid pointing readers at internal repo paths (`docs/…`, `book-rules.md`) unless you intend a private or technical edition.
- **Cross-edition** — `books/when-others-look-to-you/v2/` is a separate manuscript tree; if it ships, apply the same reader/writer split under its own `front-matter/`, `parts/`, `back-matter/`, and `docs/`.

---

## Pass: keep reader-facing prose reader-facing

Run this when editing glossary, front matter, back matter, bridges, or chapters—or before a release build.

### 1. Intent check (quick read)

In reader-facing files, the implied “you” is the **reader** of the book, not the **editor** of the repo. Ask:

- Does this sentence tell someone **how to produce or mark up** the book? → move it to `docs/` or `typographical-conventions.md` / `book-rules.md` as appropriate.
- Does this sentence tell someone **what to notice or what an idea means**? → it belongs in reader-facing prose.

### 2. Grep sweep (leakage from writer docs)

From the repository root, search reader-facing trees for common leakage patterns (adjust path if needed):

```bash
rg -n 'docs/book-rules|docs/editorial-vocabulary|docs/pattern-integration|docs/drafting-process|docs/revision-plan|docs/expansion-plan|manuscript sources|Do not edit by hand|Generated file|\bthe manuscript\b|\bacross the manuscript\b' \
  books/when-others-look-to-you/v1/index.md \
  books/when-others-look-to-you/v1/front-matter \
  books/when-others-look-to-you/v1/parts \
  books/when-others-look-to-you/v1/back-matter
```

Investigate every hit. Most should be **no matches**. Exceptions might include benign phrases—treat any match as a prompt to re-read in context.

Optional: catch instructions about **bolding** or **glossary as an editing tool**:

```bash
rg -n 'bold (in |this |the )(chapter|manuscript|prose)|Use this glossary to|glossary\.md\)|wrap glossary terms in links' \
  books/when-others-look-to-you/v1/front-matter \
  books/when-others-look-to-you/v1/parts \
  books/when-others-look-to-you/v1/back-matter \
  books/when-others-look-to-you/v1/index.md
```

### 3. Link check

Reader-facing Markdown should not link to `docs/` workflow files in the published reading order. Quick check:

```bash
rg -n '\]\([^)]*docs/' \
  books/when-others-look-to-you/v1/index.md \
  books/when-others-look-to-you/v1/front-matter \
  books/when-others-look-to-you/v1/parts \
  books/when-others-look-to-you/v1/back-matter
```

### 4. Register alignment

Reader-facing prose should still follow **Interpretive register (watch, not checklist)** in `book-rules.md`—that is a **substantive** rule, not a separate audience. The pass above is only about **audience leakage** (writer instructions appearing in reader files).

---

## Workflow hook

- After plain-language or **glossary** edits, run **§ Pass** (at least the grep sweeps).
- Optionally add this pass to a release checklist alongside `editorial-vocabulary.md` and export smoke tests (`docs/drafting-process.md`).

---

## Documentation map

- **`book-rules.md`** — Tone, register, bolding, Pattern blocks, circulation/correction/permission.
- **`reader-facing-scope.md` (this file)** — Which directories are for which audience and how to verify no cross-contamination.
- **`drafting-process.md`** — Export, branches, and drafting steps; keep technical commands here, not in chapters.

If `reader-facing-scope.md` and `book-rules.md` conflict on **tone or register**, **`book-rules.md` wins**. This file wins on **path classification** unless `index.md` or packaging explicitly changes what ships as the book.
