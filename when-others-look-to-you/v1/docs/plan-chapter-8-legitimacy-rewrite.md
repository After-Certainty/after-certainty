# Plan: Rewrite Chapter 8 — Legitimacy Over Time

Planning note for manuscript work on **branch `plan/chapter-8-rewrite`**. When this ships, update `v1/docs/status.md` if the editorial tracker covers this chapter.

**Manuscript:** `parts/part-3-harm-effectiveness-legitimacy/chapter-8-legitimacy-over-time.md`

**Related reference:** `back-matter/appendix-a-legitimacy-transfer.md`

**House style:** Plain speak and typographical conventions in `v1/docs/book-rules.md` and `v1/front-matter/typographical-conventions.md`; vignette/pattern/pull-quote rules in `.cursor/rules/when-others-typography.mdc`.

---

## Goal

Rewrite chapter 8 so it follows the chapter rhythm now established across chapters 1-7:
**observation first**, then pattern naming, terms, and definitions.
Keep legitimacy transfer concrete by pairing each form with a short scene or compact example.

---

## What chapters 1-7 establish (reference rhythm)

- **Lead with recognizable moments:** chapters open with concrete scenes or contrasts before framework language.
- **Name structure after evidence:** terms and taxonomy land after the reader has something to attach them to.
- **Keep sections compact:** short moves, plain verbs, and low abstraction density.
- **Use bridge lines lightly:** close with one clean handoff to the next lens, not heavy recap.

Chapter 8 currently opens with concept-forward framing and introduces legitimacy forms quickly. The rewrite should delay category language until after a transfer scene establishes what the reader should watch.

---

## Proposed chapter arc (structure)

1. **Opening transfer observation (no taxonomy yet)**
   - Start with one concrete leadership handoff scene where authority clearly moves and accountability is still uncertain.
   - Add a brief contrast beat showing a second handoff where challenge becomes costly.
   - Hold legitimacy labels for a few paragraphs.

2. **Core chapter question in plain language**
   - State the governing question after the opening:
     why people keep following after authority changes hands.
   - Keep this as a plain-language pivot, not a definition block.

3. **What transfer makes visible**
   - Describe observable cues before terminology:
     who can question the handoff, who is protected by title, what counts as disloyal.
   - Keep this section prose-led, not checklist-led.

4. **Name the four forms after observation**
   - Introduce **example-based**, **procedural**, **office-based**, and **sacralized** legitimacy only after the transfer cues are concrete.
   - Keep each definition short and transfer-specific.

5. **Illustrate each form with a concrete case**
   - For each form, include either:
     - a short vignette, or
     - a compact concrete example paragraph.
   - Use one dominant read per form so readers can identify the form from behavior alone.

6. **Transfer sequence and movement over time**
   - Keep the shift arc (example-based -> procedural -> office-based -> sacralized), but tie each move to repeated behaviors in institutions.
   - Emphasize that the sequence is common, not inevitable.

7. **Selective followership, correction, and circulation**
   - Keep these sections, but anchor them in observed behavior from earlier transfer scenes.
   - Reduce abstract repetition and preserve one clear read for correction signals and permission signals.

8. **Close and bridge to scale**
   - End with a concise synthesis line on legitimacy and accountability over time.
   - Keep one pull quote that compresses the chapter claim.

---

## Illustration strategy for legitimacy transfer forms

Use a pragmatic "vignette budget" so chapter 8 stays concrete without becoming vignette-heavy.

- **Preferred default:** one anchor opening vignette + four compact form illustrations.
- **Per-form illustration length target:** 3-7 sentences each unless one section truly needs a full block.
- **Escalation rule:** use a full `Vignette Block` only when the transfer moment is hard to see in compressed prose.

### Selected approach: Option A (one evolving base vignette)

Use one institutional handoff setup and show four short variations of how the same transfer reads under each legitimacy form.

- **Why this is strong:** high comparability; low narrative overhead; easier for readers to see the taxonomy as structural differences, not different sectors.
- **Risk to manage:** avoid monotony by changing the decision pressure in each variation.

### Option A implementation blueprint

Use one recurring setting across the chapter (recommended: a regional hospital network administrator handoff, aligned with Appendix A). Keep names and institutions generic.

1. **Opening anchor scene (before terms)**
   - Outgoing administrator hands off during post-surge normalization.
   - Incoming administrator inherits emergency permissions still active on paper.
   - One immediate test decision appears (staffing override, purchasing exception, or centralized sign-off).
   - The scene ends with uncertainty about whether authority is being renewed, merely inherited, or insulated.

2. **Variation for example-based legitimacy**
   - Show the incoming leader taking a visible costly action that matches stated values.
   - Emphasize witnessed conduct over title.
   - Read line: people follow because behavior at handoff is observable and accountable.

3. **Variation for procedural legitimacy**
   - Show formal transfer mechanism doing real work (board vote, review committee, published constraints).
   - Emphasize process as active constraint, not ceremony.
   - Read line: people follow because rules governing transfer still have teeth.

4. **Variation for office-based legitimacy**
   - Show inherited permission being used because the role already carries it.
   - Emphasize continuity of title over fresh evaluation of conduct.
   - Read line: people follow because authority travels with the office.

5. **Variation for sacralized legitimacy**
   - Show challenge to transfer recoded as disloyalty to mission/story.
   - Emphasize social or moral cost of questioning the handoff.
   - Read line: people follow because questioning leadership is treated as crossing a protected boundary.

### Drafting constraints for Option A

- Keep each variation tightly parallel in structure so comparison is obvious.
- Change only one structural variable per variation (source of permission).
- Avoid making one variation read as "good leader / bad leader"; the chapter is about form, not hero/villain narrative.
- Keep the same transfer pressure in view across all four variations so differences remain legible.

---

## Appendix A alignment requirements

Appendix A already provides cross-institution transfer sequences. Chapter 8 should use it as support, not duplicate it.

- Keep chapter 8 focused on legibility: "what to watch in live transfer."
- Keep Appendix A focused on extended illustrations across sectors.
- Reuse the same transfer-specific reads from Appendix A:
  - example-based: conduct at handoff still earns followership,
  - procedural: process still constrains transfer,
  - office-based: permissions travel with title,
  - sacralized: questioning transfer becomes socially or morally costly.
- Add one sentence near the end of chapter 8 pointing readers to Appendix A for scaled sequences.

---

## Section-level rewrite notes on current chapter 8

- **Rework opening order:** move conceptual framing in `Why People Continue to Follow` behind an opening transfer scene.
- **Tighten form sections:** keep the four form sections but trim repeated setup language and increase behavioral specificity.
- **Sharpen transfer section:** `How Legitimacy Transfers and Shifts` should follow examples, not precede them conceptually.
- **Streamline signal sections:** merge overlapping phrasing in `Correction and Circulation`, `Correction Signals`, and `How Correction and Circulation Shape Renewal and Erosion` where possible.
- **Keep bridge intent:** retain the ending movement into scale/distance, but make the close shorter and more observational.

---

## Drafting guardrails for this rewrite

- Use plain declarative sentences and concrete verbs.
- Keep glossary-bold terms only where they carry structural load.
- Avoid moral verdict tone; keep observational register.
- Preserve direction/state discipline (`renewal`/`erosion` vs `vitality`/`decay`).
- Ensure vignette formatting remains compliant (`### **Title**` outside the block; no bold inside `Vignette Block` text).

---

## Mechanical pass after drafting

- Run the script in `v1/docs/typography-check.md` after substantive edits.
- Re-check Pattern Block, Vignette Block, and Pull Quote Block formatting against `v1/docs/book-rules.md`.
- Verify chapter 8 and Appendix A terminology stay aligned after edits.
