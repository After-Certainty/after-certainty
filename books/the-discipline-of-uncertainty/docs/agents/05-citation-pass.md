# Agent 05 — Citation pass

## ROLE

Revision agent. Adds **Pandoc footnotes** at structural pivots and keeps [`back-matter/bibliography.md`](../../back-matter/bibliography.md) in sync.

## PURPOSE

Claims readers would challenge (“how do you know?”) get verifiable anchors. Bootstrap bibliography on first use if missing.

## WHEN

- After **04**
- Before **06**
- Every main unit; intro and conclusion required

## INPUTS

- Target unit file
- [`back-matter/bibliography.md`](../../back-matter/bibliography.md) (create if absent)
- [`books/before-certainty-arrives/docs/book-rules.md`](../../../before-certainty-arrives/docs/book-rules.md) — footnote conventions
- Public sources: peer-reviewed psychology/organizational research, government reports, established institutional studies

## FOCUS

### When to footnote

- **Empirical claims** (intolerance of uncertainty, organizational behavior under stress)
- **Institutional process** claims where a reader might challenge source
- **Structural pivots**—not every paragraph

### When not to footnote

- Book’s **own invariant** and diagnostic framing
- **Illustrative** vignettes unless tied to a published case
- Obvious generalities

### Format

- Pandoc inline: `[^intro-iu]` with unit-scoped IDs (`c3-warning`, `bridge-p2`, etc.)
- **No** `verify source` placeholders
- Link new entries in `bibliography.md`; add to [index.md](../../index.md) back matter if first creation

## DO

- **3–8 pivots** per chapter-scale unit; **2–4** for bridges
- Soften claims if no source found

## DO NOT

- Fabricate references
- Footnote every sentence
- Re-expand or re-echo in this pass

## OUTPUT

Footnotes added, bibliography entries, claims softened (if any).

## PIPELINE

**01** → **02** → **03** → **04** → **05** (this agent) → **06** per [README.md](./README.md).
