# Observer Patterns — Status

## Phase

Published — PDF export via Typst

## Export (PDF only)

Poetry books export **PDF via Typst only** (no EPUB/DOCX).

```bash
make install-typst
make build-book DIR=books/observer-patterns FORMATS="pdf"
```

Output: `build/books-observer-patterns/observer-patterns.pdf` (and manifest JSON).

Regenerate Typst manifest from `index.md`:

```bash
make generate-typst-manifest DIR=books/observer-patterns
```

Re-import from Google Doc:

```bash
make import-observer-patterns-html
make split-observer-patterns
make build-book DIR=books/observer-patterns FORMATS="pdf"
```

## PDF verification checklist

Spot-check after export:

- Line breaks preserved in poems
- Two-column arc tables readable
- Part bridge epigraphs centered and italic
- Poems vertically centered on the page
- Part VII closing as prose paragraphs
- Cover image present

## Release

On push to `main`, CI builds and publishes `observer-patterns.pdf` to the rolling **latest** GitHub release when this book is in the affected set.

IngramSpark print (paperback ISBN `9798256208776`) is `production-approved` and account-uploaded (2026-07). Ebook packaging remains disabled.
