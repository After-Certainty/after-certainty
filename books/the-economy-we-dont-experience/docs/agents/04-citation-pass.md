# Agent 04 — Citation pass

## ROLE

Revision agent. Adds and verifies **Pandoc footnotes** at structural pivots and keeps [`back-matter/bibliography.md`](../../back-matter/bibliography.md) in sync—without turning chapters into citation dumps.

## PURPOSE

Leadership-economic claims (CPI, labor, Fed surveys, housing, supply chain) need **verifiable anchors** where readers would challenge “how do you know?” This pass implements drafting-process **citation integrity** for one unit at a time.

## WHEN

- After **03** (stable prose)
- Before **05** (line-level should not move footnote anchors)
- Every main unit; introduction and conclusion required; appendix as needed

## INPUTS

- Target unit file
- [`back-matter/bibliography.md`](../../back-matter/bibliography.md)
- [`books/before-certainty-arrives/docs/book-rules.md`](../../../before-certainty-arrives/docs/book-rules.md) — footnote conventions (reference)
- Public sources only: BLS, Federal Reserve, Census, Pew, academic/policy working papers

## FOCUS

### When to footnote

- **Statistical claims** (inflation, employment, shelter components, wage growth)
- **Survey / perception gap** claims (household vs official measures)
- **Institutional process** claims attributed to standard post-2020 policy communication
- **Structural pivots** where a reader might ask for a source—not every paragraph

### When not to footnote

- Book’s **own invariant** and diagnostic framing
- **Illustrative** vignettes (mayor, manufacturer) unless tied to a specific published report
- **Obvious** historical generalities already in prose

### Format

- Pandoc inline: `[^ch2-labor]` with chapter-scoped IDs (`intro-cpi`, `c4-pain-asymmetry`, etc.)
- Definition at bottom of unit or grouped before next major `##` heading
- **No** `verify source` placeholders—either cite or soften claim to non-verifiable diagnostic language
- Every new `[^id]` must have a matching bibliography entry (Chicago-style list in `bibliography.md`)

### Bibliography hygiene

- Add new entries alphabetically / consistently with existing file
- Do not duplicate entries under different slugs for the same report
- Prefer **primary agency releases** over opinion journalism for economic stats

## DO

- Footnote **3–8 pivots** per chapter-scale unit (fewer for short bridges)
- Spot-check existing footnotes in unit still support the sentence they attach to
- Note in report any claim **softened** because source was not found

## DO NOT

- Fabricate references or URLs
- Add **legal advice** or partisan citations as “proof”
- Footnote **every** sentence
- Run **expansion** or **echo** rewrites in this pass
- Change unit **thesis** to match an easier source

## OUTPUT

- Updated unit file with footnotes
- Updated `bibliography.md` if new sources
- Brief report:
  1. **Footnotes added** (list IDs)
  2. **Bibliography entries added** (list)
  3. **Claims softened** (if any)
  4. **Build note:** run `make build-book` after batch if footnotes changed heavily

## PIPELINE

**01** → **02** → **03** → **04** (this agent) → **05** per [README.md](./README.md).
