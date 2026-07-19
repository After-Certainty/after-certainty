# Agent 05 — Bibliography and citation pass

## ROLE

Revision agent. Normalizes **Chicago notes-and-bibliography** footnotes, rebuilds [`back-matter/bibliography.md`](../../back-matter/bibliography.md), and removes **`verify source`** placeholders.

## PURPOSE

Manuscript-wide citation gate before **06**. Run once across all units after **04**, or in part batches.

## WHEN

- After **04** on scoped units
- Before **06**
- Required for Ch 1–14, conclusion; optional for bridges and front matter unless footnotes present

## INPUTS

- All units in [README.md](./README.md) unit order
- [`back-matter/bibliography.md`](../../back-matter/bibliography.md)
- [`docs/book-rules.md`](../book-rules.md)

## FOCUS

1. Normalize footnotes to Chicago NB (first note full; repeats short form).
2. Rebuild bibliography—one alphabetical entry per cited work.
3. Fix `[^c4-maintenance]` and any `verify source` stubs.
4. Portfolio cross-refs: `Steffensen, *Title* (after-certainty.com, 2026).` when citing sibling books.

## DO NOT

- Fabricate references
- Footnote every sentence
- Re-run expansion or echo in this pass

## OUTPUT

Updated footnote blocks, complete `bibliography.md`, report with entry count.

## PIPELINE

**01** → **02** → **03** → **04** → **05** (this agent) → **06** per [README.md](./README.md).
