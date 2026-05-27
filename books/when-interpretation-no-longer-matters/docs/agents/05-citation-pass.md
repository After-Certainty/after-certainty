# Agent 05 — Bibliography and citation pass

## ROLE

Revision agent. Normalizes **Chicago notes-and-bibliography** footnotes across the manuscript, rebuilds [`back-matter/bibliography.md`](../../back-matter/bibliography.md) from all cited works, and cleans **export split bleed** in footnote blocks—without adding new claims or turning case chapters into citation dumps.

## PURPOSE

The book ships with **~200+ Pandoc footnotes** across thirteen chapters and the conclusion, but early units used inconsistent note forms (title-only portfolio refs, publisher-without-place, placeholder stubs, and pasted TOC fragments from Word splits). This pass is a **dedicated manuscript-wide gate** (not only “add 3–8 pivots per unit”) that makes notes and bibliography **internally consistent** before **06** line-level work.

Run **once across all units** after **04** echo passes stabilize prose, or in **part batches** (I → II → III → IV + conclusion) if coordinating with parallel editing.

## WHEN

- After **04** on the scoped units (stable prose and footnote anchors)
- Before **06** (line-level should not move footnote IDs or reorder note blocks)
- **Required** for: Ch 1–13, conclusion; **optional** for bridges and front matter unless they gain footnotes

## INPUTS

- All manuscript units listed in [README.md](./README.md) unit order (at minimum Ch 1–13 + `back-matter/conclusion-after-interpretation.md`)
- [`back-matter/bibliography.md`](../../back-matter/bibliography.md)
- [`docs/book-rules.md`](../book-rules.md)
- Normalization helper: [`tools/normalize_interpretation_citations.py`](../../../../tools/normalize_interpretation_citations.py) (repo root)

## FOCUS

### Manuscript-wide tasks (this pass)

1. **Normalize every footnote definition** to Chicago NB:
   - First note in a chapter: author, *Title* (Place: Publisher, Year).
   - Repeat notes: author, *Short title* (or portfolio short form).
   - Portfolio cross-refs: `Steffensen, *How Meaning Moves* (after-certainty.com, 2026).` — not bare italic titles.
2. **Rebuild bibliography** — one alphabetical entry per work cited in any unit; no stubs for works only named in prose.
3. **Remove split bleed** — footnote lines polluted with `\ = #` export fragments or pasted part TOCs; truncate to the real note only.
4. **Fix known defect classes**:
   - `Habermas.` / `Arendt; Ellul.` placeholders → proper short notes
   - `Weber; see also authority reproduction…` → `Weber, *Economy and Society*.`
   - Havel essay → chapter in *Living in Truth* (Faber, 1986)
   - Scripture → *Pearl of Great Price* bibliographic entry + note form for *Joseph Smith—History*
5. **Spot-check** sensitive historical and contemporary claims still match the note attached.

### When to add footnotes (if gaps remain)

- Historical dates, events, attributions in Part III cases
- Empirical or institutional claims a reader would challenge
- Direct quotations and close paraphrases of named figures

### When not to footnote

- The book’s **own invariant** and structural definitions
- Illustrative hypotheticals clearly marked as such
- Moral judgment the book owns as diagnostic framing

### Living politics

- Prefer historical and bounded episodes in Part III
- Do not add partisan op-eds as primary proof; soften unsourced claims

### Format

- Pandoc inline: `[^c7-alignment]` with chapter-scoped IDs
- Definitions at bottom of unit
- **No** `verify source` placeholders
- Conclusion may use narrative lead-ins in prose, but **note bodies** stay bibliographic (no “On the limits of…” prefixes in the definition line)

## DO

- Run `python3 tools/normalize_interpretation_citations.py` from repo root, then **manual pass** on outliers the script does not map
- Process **all units** in reading order; update `bibliography.md` once at end (or merge per part batch without duplicates)
- Record **bleeds removed**, **placeholders fixed**, and **bibliography entry count** in report
- Run `make validate-book-specs` after the batch

## DO NOT

- Fabricate references or URLs
- Use citations as partisan weapon
- Footnote every sentence
- Run expansion or echo rewrites in this pass
- Change unit thesis to match an easier source

## OUTPUT

- Updated footnote blocks in all scoped units
- Complete `bibliography.md` (alphabetical, Chicago-style)
- Brief report:
  1. **Units processed** (list)
  2. **Normalization** — script + manual fixes (counts)
  3. **Bleeds removed** (file + footnote ID)
  4. **Bibliography** — entry count; any works dropped or added
  5. **Claims softened / flagged** for author
  6. **Build note:** `make build-book DIR=books/when-interpretation-no-longer-matters` after large footnote edits

## PIPELINE

**01** → **02** → **03** → **04** → **05** (this agent; **manuscript-wide bibliography gate**) → **06** per [README.md](./README.md).
