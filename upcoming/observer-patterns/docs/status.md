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
# Linux — download from https://github.com/typst/typst/releases (v0.14.2+)
curl -fsSL https://github.com/typst/typst/releases/download/v0.14.2/typst-x86_64-unknown-linux-musl.tar.xz -o /tmp/typst.tar.xz
tar -xJf /tmp/typst.tar.xz -C /tmp
export PATH="/tmp/typst-x86_64-unknown-linux-musl:$PATH"
typst --version
```

Build PDF from repo root:

```bash
make export-typst-pdf DIR=upcoming/observer-patterns
```

Re-import from Google Doc:

```bash
make import-observer-patterns-html
make split-observer-patterns
make export-typst-pdf DIR=upcoming/observer-patterns
```

## Next actions

1. Verify import counts in `import/import-log.md`
2. Spot-check Part I, Part II multi-pattern, and Part VII closing in PDF
3. Editorial pass on known typos and spacing
