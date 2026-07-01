# Observer Patterns — Status

## Phase

Phase 0 — Structure (import from Google Doc)

## Import

| Step | Status |
|------|--------|
| Google Doc HTML download | done |
| Cover extraction | done |
| HTML → markdown split | done |
| Typst PDF compile | done |

## Typst install

Requires **Typst 0.14+** (for the `cmarker` package).

```bash
make install-typst
typst --version
```

## Export (PDF only)

Poetry books export **PDF via Typst only** (no EPUB/DOCX).

Unified build from repo root:

```bash
make install-typst
make build-book DIR=upcoming/observer-patterns FORMATS="pdf"
```

Output: `build/upcoming-observer-patterns/observer-patterns.pdf` (and manifest JSON).

Legacy direct export:

```bash
make export-typst-pdf DIR=upcoming/observer-patterns
```

Regenerate Typst manifest from `index.md` without re-importing:

```bash
make generate-typst-manifest DIR=upcoming/observer-patterns
```

Re-import from Google Doc:

```bash
make import-observer-patterns-html
make split-observer-patterns
make build-book DIR=upcoming/observer-patterns FORMATS="pdf"
```

## PDF verification checklist

Spot-check after export:

- Line breaks preserved in poems (e.g. Part I `when-trust-builds.md`)
- Two-column arc tables readable
- Part bridge epigraphs centered and italic
- Part VII closing as prose paragraphs
- Page breaks between poems
- Cover image (when `book-cover.png` is present)

## Next actions

1. Verify import counts in `import/import-log.md`
2. Spot-check Part I, Part II multi-pattern, and Part VII closing in PDF
3. Editorial pass on known typos and spacing
