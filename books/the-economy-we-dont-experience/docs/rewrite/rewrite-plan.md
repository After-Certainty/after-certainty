# Parallel Rewrite Plan — *The Economy We Don't Experience*

**Workspace:** [`docs/rewrite/`](./) (non-publishable)  
**Production source of truth:** [`../../index.md`](../../index.md)  
**Factual frame:** preserve the manuscript’s **2020–2024** historical cutoff unless a later phase explicitly authorizes updates  
**This plan phase:** architecture + stubs only — **no full prose drafting**

---

## 1. Purpose of the rewrite

Preserve the book’s intellectual argument while changing how readers encounter it.

**Current default movement:** concept → definition → examples → implications  
**Target movement:** observation → widening frame → factual grounding → complication → return → memorable compression

The deeper claim to protect is stronger than “official statistics do not match people’s feelings”:

> Credibility deteriorates when a necessary summary is presented as though it were the whole reality.

Economic systems require compression. GDP, CPI, unemployment, forecasts, and confidence measures are necessary forms of orientation. The problem begins when a summary becomes a substitute for the experiences it necessarily leaves out.

---

## 2. Voice and structural principles

### Voice (Kevin Steffensen / After Certainty)

- Curious before certain
- Structurally observant rather than accusatory
- Humane toward people who distrust institutions
- Equally cautious about romanticizing lived experience
- Willing to hold two apparently conflicting truths together
- Explanatory without becoming instructional
- Lyrical in moderation
- Grounded in recognizable details
- Skeptical of both institutional abstraction and populist certainty
- Resistant to overly neat conclusions

Sensibility may move like Rebecca Solnit between ordinary observation, systems, and meaning — **do not imitate** her wording or sentence structures.

### Structural rules

- Avoid TOC narration: “Part I showed…”, “The previous chapter established…”, “The next chapter will examine…”, “This bridge introduces…”
- Reduce internal headings: aim for **~3–5 substantial movements** per chapter (current units often have 13–19 `###` sections)
- Part bridges: brief essayistic transitions, not chapter summaries
- Save the strongest compression for the **end** of the chapter; do not scatter bold invariants every few paragraphs
- Prefer flowing paragraphs; avoid frequent single-sentence paragraphs and staccato rhythm
- Repository convention: one flowing line per paragraph in source Markdown
- **Author-supplied drafts:** before filing into this workspace, (1) convert all citations to Pandoc `[^id]` footnotes with bottom-of-unit definitions, and (2) repair single-sentence staccato into flowing paragraphs

### Citation format (Pandoc only)

- Inline marker at the factual hinge: `[^c1-bls-jobs]`
- Definition at unit bottom: `[^c1-bls-jobs]: U.S. Bureau of Labor Statistics, …`
- No APA/MLA parentheticals in body prose; no “verify source” placeholders
- Opening observations and closing compressions ordinarily uncited unless they make specific factual claims
- Follow [`docs/agents/05-citation-pass.md`](../agents/05-citation-pass.md)

### Essay movement template

1. Observation (ordinary life)
2. Widening frame
3. Factual grounding (**citations attach here**)
4. Complication
5. Return
6. Closing compression

---

## 3. Recurring images and motifs

### Primary image: the chart and the receipt

| Chart | Receipt |
|-------|---------|
| Aggregation, coordination, institutions, models | Immediacy, household experience, local variation |
| National indicators; patterns no household can see | Memory; costs averages may conceal |

Neither is sufficient alone. The chart reveals what the receipt cannot see; the receipt reveals what the chart averaged away.

### Related pairs (vary; do not stack all in one chapter)

- Forecast / purchase order
- Employment report / time card
- Inflation rate / renewal letter
- Stress test / credit line
- Campaign speech / grocery cart
- National print / local bill

### Secondary motif

**Two clocks** (national indicator + local transmission) — keep where helpful; demote relative to chart/receipt as the memorable expression.

### Composite / illustrative anchors (must be labeled)

| Anchor | Primary home | Treatment |
|--------|--------------|-----------|
| Midwest manufacturer (credit / forecast response) | Ch 2 → echoes Ch 8 | Labeled **composite** |
| Nurse receipt photo-roll | Ch 3 | Labeled **composite** |
| Regional distributor / specialty valve | Ch 1 (optional compress) | Composite |
| Mayor / chamber / agency briefing | Ch 6 | Composite; prefer observable communication events |
| Creator / pickup-truck inflation video | Ch 5 | Illustrative media pattern |
| County treasurer race | Ch 7 | Composite campaign mechanics |

Do not invent named people, quotes, statistics, or case studies. Do not turn composites into implied journalism.

---

## 4. Concepts to preserve (not every chapter as formal labels)

Once established, prefer scenes and echoes over definitions:

- Compression problem; high-dimensional reality / low-dimensional channels
- Orientation versus substitution
- Explanation sliding toward signaling
- National indicators and local transmission on different clocks
- Experiential cross-checking
- Relational credibility
- Pain requiring overlap; improvement requiring alignment
- Recognition preceding explanation
- Resonance becoming dangerous when it never advances toward mechanism
- Repair sequence: recognition → explanation → accountability → update
- Resilience versus flourishing
- Invisible safeguards / counterfactual success
- Forgotten guardrails
- Legitimacy preservation rather than persuasion alone

---

## 5. Proposed manuscript structure

Working titles (sequence locked; only small refinements allowed without explanation):

| Unit | Working title | Target length |
|------|---------------|---------------|
| Introduction | The Chart and the Receipt | ~1,400–1,800 words |
| Part I bridge | The Economy We Describe | ~500–900 (shift attention; do not summarize) |
| Chapter 1 | What the Average Leaves Out | ~2,500–3,500 |
| Chapter 2 | When a Forecast Becomes a Promise | ~2,500–3,500 |
| Chapter 3 | The Economy at the Kitchen Table | ~2,200–3,200 |
| Part II bridge | What Travels | ~500–900 |
| Chapter 4 | Why Pain Moves Faster | ~2,400–3,400 |
| Chapter 5 | The People Who Sound Like They See Us | ~2,200–3,200 |
| Part III bridge | Leadership in a Compressed World | ~500–900 |
| Chapter 6 | Leadership in a One-Sentence World | ~2,000–2,800 |
| Chapter 7 | What Elections Can Reject | ~1,800–2,600 |
| Part IV bridge | What Holds | ~500–900 |
| Chapter 8 | The Guardrails We Notice Only When They Fail | ~2,200–3,000 |
| Conclusion | Two Truths in One Sentence | ~500–700 |
| Appendix | Why “Just Tell the Truth” Is Not a Strategy | Stub retained; see §7 |

**Reading order:** bridges open each part after the preceding unit (Intro → Part I bridge → Ch 1–3 → Part II bridge → Ch 4–5 → Part III bridge → Ch 6–7 → Part IV bridge → Ch 8 → Conclusion).

Edition band after drafting: still aim toward **~28–32k** ([`docs/book-rules.md`](../book-rules.md)). Current production prose undershoots (~18.6k including appendix); rewrite should deepen scenes rather than re-add scaffolding.

---

## 6. What to preserve, condense, move, or remove (by source)

Detail lives in [`migration-map.md`](migration-map.md). Summary:

| Existing | Action |
|----------|--------|
| Introduction | Rewrite as chart/receipt opening; strip full arc TOC, audience menus, “How The Argument Proceeds” scaffolding |
| Part bridges | Keep orientation job; cut chapter-preview laundry lists and “you should leave Part I with…” pedagogy |
| Ch 1 | Preserve orientation vs substitution, jobs-release day, averages/tails, “just add nuance” failure, platform acceleration; cut heading ladder; demote repeated two-clocks formal sections |
| Ch 2 | Preserve conditional vs categorical hearing, manufacturer composite, chamber fan-chart, SHED perception gap, counterfactual success, Beige Book vs headline; seed invisible safeguards lightly toward Ch 8 |
| Ch 3 | Preserve housing referendum, nurse composite, immediacy vs aggregation, relational credibility seed, health/wages/time clocks; move full creator/resonance development to Ch 5 |
| Ch 4 | Soften “always scales” → **moves faster / lower coordination cost**; preserve overlap vs alignment, one-data-point test, inflation memory ratchet, ethics of acknowledging pain first |
| Ch 5 | Organize around **relational credibility**; preserve repair sequence; warn against romanticizing outsiders |
| Ch 6 | Prefer observable briefings over private mind-reading; preserve certainty vs humility, narrative lock-in, performative empathy vs structural recognition, restraint |
| Ch 7 | Keep nonpartisan mechanism frame; preserve split-screen housing, expressive mandates, hundred-day test |
| Ch 8 | Open on ordinary continuance (payroll/deposits/credit); preserve resilience ≠ flourishing, invisible safeguards, forgotten guardrails |
| Conclusion | Shorten substantially; return to chart/receipt; avoid chapter-by-chapter resumé |
| Appendix A | See §7 |
| Title/copyright/about-the-series | Stay generated production front matter |
| Bibliography | Reconcile at migration; track gaps in citation audit |

**Remove or minimize globally:** TOC handoffs, bold invariant stack every section, ten-plus subsection ladders, duplicate re-definitions of two clocks / compression after first establishment.

---

## 7. Appendix recommendation (locked)

**Option 3 — distribute** the strongest appendix arguments into:

- **Introduction** — truth necessary but insufficient; channel mismatch
- **Chapter 6** — dismissive truth / sentence order under interpretive stress
- **Conclusion** — legitimacy as interpretive; “tell the truth in a form that admits who is still paying”

Keep [`appendix.md`](appendix.md) as a stub through drafting/review so nothing is lost. At the **Approved** gate, either:

- drop residual material if fully absorbed, or
- keep a **brief** afterword/appendix only for unrecovered points

Do **not** delete production Appendix A until migration.

---

## 8. Citation strategy

- Retain every existing footnote that supports a factual claim; rewrite the surrounding paragraph, not the source away
- Attach citations at the **factual hinge** (observation → evidence), not at lyrical openings/closings unless those make specific claims
- Keep Pandoc footnotes `[^id]` and Chicago-style bibliography per [`docs/agents/05-citation-pass.md`](../agents/05-citation-pass.md)
- Distinguish documentary vs hypothetical vs composite on the page
- Do not invent sources; do not broaden research unless verifying an existing citation’s accuracy/completeness
- Resolve audit gaps (KFF missing from bibliography; vague economic-voting note; provisional Sunstein entry; agency date-range umbrellas) before migration

Full ledger: [`citation-audit.md`](citation-audit.md)

---

## 9. Drafting order and review gates

1. Confirm [`migration-map.md`](migration-map.md) and [`citation-audit.md`](citation-audit.md) cover all production units (**this pass**).
2. Draft **Introduction** → revise until voice lock (paragraph rhythm, observation density, citation placement, lyricism, closing compression).
3. Draft **Chapter 1** → review Intro + Ch 1 together.
4. Proceed in order: Part I bridge → Ch 2 → Ch 3 → Part II → … → Conclusion → Appendix residual decision.
5. Update [`status.md`](status.md) after every drafting/review step.
6. After Certainty prose skills (essay-discovery, curiosity-expansion, recognition-preservation, experience-deepening, etc.) apply **only after** full prose exists for a unit — not on stubs.
7. Production manuscript unchanged until migration.

---

## 10. Risks and open questions

| Risk | Mitigation |
|------|------------|
| Accidental publication of drafts | Workspace under `docs/rewrite/`; no `book.yml`; never link from production `index.md` |
| Composite vignettes read as journalism | Explicit labels in stubs and drafts |
| Softening Ch 4 claim still over-absolute | Prefer “moves faster / lower coordination cost,” not “always” |
| Partisan reading of elections/Fed chapters | Nonpartisan mechanisms; observable events; historical frame not campaign ops |
| Romanticizing experience or outsider messengers | Equal caution in Ch 3 and Ch 5 |
| Residual scaffolding in early drafts | Stub bans; echo pass before Approved |
| Citation incompleteness | Audit flags; resolve before migrate |
| Undershoot of 28–32k target | Deepen scenes during drafting, not scaffolding |
| Semantic glossary / website manifests outdated vs rewrite | Ignore until migration; then refresh if terms shift |

**Open until drafting:** exact residual length of appendix after distribution; whether “two clocks” remains named vocabulary or becomes purely imagistic under chart/receipt.

---

## 11. Final migration process

Migrate only when:

1. Every required section is drafted, reviewed, and marked **Approved**
2. Citation audit resolved; bibliography reconciled
3. Consecutive read-through for repetition/continuity
4. Front/back matter reviewed
5. Author **explicitly** authorizes migration

Then:

1. Create backup branch containing current production manuscript
2. Assemble approved rewrite into production paths; update `index.md` titles/links
3. Keep generated front matter; reconcile bibliography
4. Run `make validate-book-specs`, publication manuscript validation, and `make build-book` for this book
5. Compare built manuscript against migration map — nothing lost accidentally
6. Retain rewrite history until the new manuscript is accepted; do not delete this folder immediately

---

## 12. What this pass delivers

- This plan
- Citation audit, migration map, status tracker
- Complete set of stubs with planning metadata
- Production manuscript **unchanged** except a pointer in [`docs/status.md`](../status.md)
