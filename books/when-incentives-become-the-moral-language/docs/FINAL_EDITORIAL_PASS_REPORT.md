# Final Editorial Pass Report

**Date:** July 2026  
**Book:** *When Incentives Become the Moral Language*  
**Scope:** Tasks 1–11 — localized editorial pass only (no structural rewrite)

---

## Files changed

| File | Change |
|------|--------|
| `parts/part-1-the-need-for-translation/bridge.md` | Part I introduction wording (Task 1) |
| `parts/part-1-the-need-for-translation/chapter-2-the-feed-that-never-empties.md` | Subsection merge (Task 2) |
| `parts/part-2-when-the-translation-takes-over/chapter-4-the-target-on-the-wall.md` | Volkswagen analogy qualification (Task 3) |
| `parts/part-3-the-world-the-metric-makes/chapter-7-the-poll-before-the-position.md` | ACA causation revision; newsroom scaffold removed (Tasks 4–5) |
| `back-matter/epilogue-the-blank-column.md` | Cross-domain heading removed (Task 6) |
| `back-matter/appendix-method-and-sources.md` | Reader-facing citation language (Task 7) |
| `back-matter/bibliography.md` | Cohn (2021) added under Chapter 7 |
| `docs/citation-audit.md` | Final-pass citation notes (Task 8) |

**Not edited:** generated DOCX/PDF/EPUB under `build/`; cover assets; Chapter 12 substance.

---

## Part I introduction

**Old:**  
The harm here is often immediate and embodied: a bed, a feed, a shelf.

**New:**  
Part I begins close to the objects through which judgment first becomes portable: a bed, a feed, a shelf.

The revision preserves the bed/feed/shelf triad while shifting the commonality from identical embodied harm to tangible institutional surfaces where judgment first becomes portable.

---

## Chapter 2 smoothing

| Heading | Action |
|---------|--------|
| `### The Impossibility of Neutral Ranking` | **Retained** — short subsection; still marks the conceptual turn that any ordering rule distributes visibility. |
| `### The Platform Knows More Than It Can Say` | **Removed** — merged into `### No Single Moment of Renunciation`. |
| `### The Moderator at the Edge` | **Removed** — merged into `### No Single Moment of Renunciation`. |

Merged content preserves: platforms depend on systems powerful enough to shape attention; public defense often presents those systems as merely responsive; moderators perform human judgment at the edges of scale; that judgment is often classified as operational labor rather than editorial authority.

---

## Chapter 4 qualification

**Revised passage:**

> The pattern is not abstract. When Volkswagen's diesel emissions scandal broke in 2015, investigators found that vehicles met laboratory testing protocols while emitting far more nitrogen oxides on the road—the compliance language and the physical harm had diverged for years.[^c4-vw] Corporate climate accounting usually involves no comparable deception. The structural resemblance is narrower: compliance within a defined reporting frame can diverge from conditions outside it—boundaries shift, methodologies revise, and the curve on the poster can improve while local conditions do not.

**Analogy narrowed:** Volkswagen involved deliberate defeat devices and fraud. The added sentence limits the parallel to frame-versus-conditions divergence (reporting boundaries, methodology changes, Scope 3 uncertainty, offset integrity, delayed verification)—not equivalence with ordinary sustainability reporting.

**Citation:** `[^c4-vw]` — EPA/CARB findings and settlement (2015–2016); investigative reporting on defeat devices and laboratory-vs-road testing gaps. Scope 1/2/3 terminology and Paris/SBTi/ISSB/ESRS/VCMI footnotes unchanged and verified against named frameworks.

---

## Chapter 7 historical revision

**Old:**

> Polling showed the option popular in abstract; vote-count models and fundraising signals showed it costly among senators whose support was required.[^c7-aca] The provision was softened, then dropped—not because no one argued for it on merits, but because the institution learned to defend positions that could survive the next tracking survey and the next news cycle.

**New:**

> Polling showed substantial public support in abstract surveys; Senate vote counts, procedural constraints, and coalition management told a harder story.[^c7-aca] The provision was softened and ultimately dropped as leaders weighed that support against the votes required for passage, industry opposition, and the political cost of prolonging the fight. The episode showed how quickly a policy argument can become an assessment of what the institution can carry—and how measurable viability can begin displacing the underlying question of what representation requires.

**Sources used:**

- Congressional Record, 111th Congress — public-option debate and floor proceedings (2009–2010)
- Jonathan Cohn, *The Ten Year War: Obamacare and the Unmaking of American Establishment* (2021) — Senate vote counts, coalition constraints, removal from final legislation
- Existing footnotes retained: Pew polling methodology (`[^c7-pew]`), FEC/OpenSecrets fundraising (`[^c7-fec]`), Hersh on campaign metrics (`[^c7-hersh]`), Pew trust-in-government time series (`[^c7-trust]`)

**Causation:** Revised wording does not claim polling or fundraising alone caused the public option's removal. Multiple forces (vote counts, procedure, coalition management, industry opposition, political cost of prolonging the fight) are named; polling remains one input among others.

---

## Scaffolding removed

| Heading | Action |
|---------|--------|
| `### The Difference From the Newsroom` (Ch 7) | **Removed.** One-sentence transition integrated before the council-member scene; three-domain comparison compressed. |
| `### Cross-Domain Pairs` (epilogue) | **Removed.** Pairs folded into end of `### What a Column Does`; workforce-matrix line dropped to avoid catalogue expansion. |

---

## Appendix cleanup

**Old:**

> Claims that depend on external sources carry Pandoc-style footnotes in the chapter files (`[^id]` markers with definitions at chapter end). A consolidated bibliography appears in [`bibliography.md`](bibliography.md).

**New:**

> Claims that depend on external sources are footnoted. A consolidated bibliography follows.

---

## Citation changes

| Type | Detail |
|------|--------|
| Footnotes revised | `[^c7-aca]` — Congressional Record + Cohn (2021); removed Hersh from ACA note (Hersh remains on `[^c7-hersh]`) |
| Footnotes unchanged | `[^c4-vw]` — EPA/CARB Volkswagen findings |
| Bibliography added | Cohn, Jonathan. *The Ten Year War* (2021) under Chapter 7 |
| Bibliography revised | Congressional Record entry — 111th Congress specified |
| Bibliography removed | None |
| Unresolved factual questions | None for claims revised in this pass. Cohn and Congressional Record support chronology and coalition constraints; private motivations of individual legislators are not inferred in prose. |

---

## Formatting validation

Source Markdown inspected for malformed `[^id]` markers, stranded headings, and paragraph breaks in all seven edited manuscript files. No issues found.

**Generated DOCX** (`build/books-when-incentives-become-the-moral-language/when-incentives-become-the-moral-language.docx`): edited passages render correctly; removed scaffolding headings (`The Difference From the Newsroom`, `Cross-Domain Pairs`) absent; appendix free of Pandoc/`bibliography.md` references; Volkswagen and ACA paragraphs show clean body/footnote separation. No body-text/footnote collisions detected in edited sections.

**Pandoc build warnings (pre-existing, not introduced by this pass):** unused footnote definitions `[^c4-world-bank]` and `[^c4-vcmi]` in Ch 4 (defined at chapter end, not cited inline).

---

## Build verification

| Command | Result |
|---------|--------|
| `python3 tools/audit_citations.py` | **Pass** — Tier C; pandoc notes=0 for this book |
| `make validate-book-specs` | **Pass** — 28 book specs validated |
| Rewrite footnote integrity (43 cite / 43 def) | **Pass** — missing_defs=0, unused_defs=0 |
| `make build-book DIR=books/when-incentives-become-the-moral-language FORMATS="docx epub pdf"` | **Partial** — DOCX and EPUB built successfully; PDF failed (xelatex not installed in build environment) |

**Artifacts:** `build/books-when-incentives-become-the-moral-language/when-incentives-become-the-moral-language.{docx,epub}`

**Not run:** `make lint` (no Python changes under `tools/`, `scripts/`, or `tests/`). Semantic manifest validation requires prior `make generate-semantic-manifest` (not required for manuscript-only prose edits).

---

## Open author decision

**Cover tagline (do not change without author approval):**

Current: *"Care continues. Caring becomes private."*

Editorial concern: The line is strong but may make the full book appear more healthcare-specific than it is.

Alternatives to consider:

- *"Every measure leaves something behind."*
- No bottom tagline
- Retain current tagline (care used in a broad moral sense)

---

## Protected endings (unchanged in substance)

Chapter 12 and epilogue closing lines preserved, including:

- "Incentive systems will remain. So will judgment."
- "The work is to keep them from pretending to be the same thing."
- "The institution remembers what it has learned how to record."
- "A blank column invites an answer. An absent column does something else."
- "The institution completed the decision. The person did not."
- "The work is not to fill every blank. It is to keep the blank visible."
- "Sometimes what was left behind is the very thing we were trying to serve."
