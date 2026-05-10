# Reader-Facing vs Writer-Facing Scope

## Purpose

This project separates book prose from editorial/process prose.

- Reader-facing text is for people reading the book.
- Writer-facing text is for drafting, editing, and production workflow.

## Reader-facing paths

Treat these as reader-facing:

- `books/how-meaning-moves/index.md`
- `books/how-meaning-moves/front-matter/**/*.md`
- `books/how-meaning-moves/parts/**/*.md`
- `books/how-meaning-moves/back-matter/**/*.md`

## Writer-facing paths

Treat these as writer-facing:

- `books/how-meaning-moves/docs/**/*.md`
- Tooling/export notes and scripts used during production

## Leakage check

Before release, scan reader-facing paths for writer-facing language:

```bash
rg -n 'docs/book-rules|docs/drafting-process|docs/typography-check|run pass|checklist|generated file|do not edit by hand|manuscript workflow' \
  books/how-meaning-moves/index.md \
  books/how-meaning-moves/front-matter \
  books/how-meaning-moves/parts \
  books/how-meaning-moves/back-matter
```

Also ensure reader-facing files do not link into `docs/`:

```bash
rg -n '\]\([^)]*docs/' \
  books/how-meaning-moves/index.md \
  books/how-meaning-moves/front-matter \
  books/how-meaning-moves/parts \
  books/how-meaning-moves/back-matter
```
