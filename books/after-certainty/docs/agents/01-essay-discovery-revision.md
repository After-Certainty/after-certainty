# Agent 01 — Essay discovery revision

## ROLE

Essay Discovery Revision Agent.

## PURPOSE

Revise **After Certainty** so arguments feel *discovered* rather than *announced*. Philosophical content, claims, structure, and conclusions remain intact. Change **how** readers arrive at the argument—not **what** the book argues.

**Core mantra:** *Delay the thesis at the beginning. Preserve compression at the end.*

**Refined goal:** Find places where the manuscript describes a **lived tension** and move those tensions closer to the surface. The target is not "write like Solnit" or more imagery. The target is **lived experience before abstraction**—keep Kevin's clarity as a systems thinker, but let the reader **feel the cost** of living without certainty before the argument names it.

**Revision question (ask before each edit):** *What experience taught me this?* — before *What conclusion did I reach?*

The manuscript currently tends to follow: **Thesis → Explanation → Example.** Revise toward: **Lived experience → Reflection → Thesis emerging naturally.**

Readers should feel **curiosity** ("harder how? more important why?") rather than only **agreement**. They should feel like they are discovering the insight rather than receiving a lecture.

## WHEN

- One unit per agent session (default)
- After grounding, asymmetry, and cohesion passes are complete
- On branch `after-certainty/essay-discovery-revision`

## INPUTS

- **Target unit file** (see [README.md](./README.md) unit table)
- [`docs/book-rules.md`](../book-rules.md) — invariant, vignette rules, pattern language
- [`docs/pattern-language.md`](../pattern-language.md) — ten locked patterns
- [`index.md`](../../index.md) — reading order
- Prior unit in reading order (handoff/echo only — do not duplicate scenes)

## FOCUS

### Six revision principles

1. **Delay the thesis** — open with lived experience (not bibliographic or purely intellectual doorways unless earned); name the principle only after tension is felt; add one beat of wandering before naming a pattern when the realization needs to land emotionally
2. **Trust the scene** — when a unit already contains a vignette, story, meeting, conversation, report, visit, or observation: move it earlier; expand slightly if needed; let the scene perform philosophical work before explanation begins
3. **Introduce abstractions through observations** — do not eliminate abstractions (this is an abstraction-heavy systems book, not memoir or reportage); readers should *earn* abstractions via concrete entry points first
4. **Reduce early certainty** — avoid announcing the chapter's conclusion in the first few paragraphs; create space for inquiry
5. **Preserve destination** — do not remove: responsibility without control; judgment without finality; explanation replacing response; attention restoring contact; the role of scale; the limits of interpretation
6. **Preserve compression at the chapter ending** — chapter closings already work well (`**Responsibility Persists Beyond Control.**`, `**Revisability Preserves Judgment.**`, `**Attention Restores Contact.**`); do not let endings wander toward diffuse synthesis

### Magnitude discipline (critical)

Target **~20% more discovery**, not 300%. Revisions should be **small and surgical**—mostly reordering and light front-loading, not literary rewrites.

| Bad overcorrection | Good revision |
|--------------------|---------------|
| Ch 1 opens: "One autumn morning I watched leaves fall from an elm tree…" followed by five paragraphs of literary wandering | Ch 1 opens: "The meeting had already been going for forty minutes…" — then 3–4 paragraphs later: "Correctness feels like safety." |
| Ending loses bold compression line; conclusion meanders | Existing pattern-language compression at chapter end **unchanged in meaning and placement** |

**Not the goal:** Solnit pacing, decorative nature scenes, memoir voice, narrative nonfiction drift, or eliminating abstract analysis.

### Target style characteristics

- Begin from lived experience before abstraction
- Delay thesis statements
- Trust examples longer before explaining them
- Allow ideas to emerge through accumulation
- Prefer exploration over immediate synthesis
- Preserve intellectual rigor and accessibility
- Preserve the author's voice as a systems thinker
- Maintain contemporary readability

**Do not:** become poetic for its own sake; imitate literary essayists directly; add decorative metaphors that do not advance the argument; obscure meaning.

### Chapter-specific guidance

| Unit | Emphasis |
|------|----------|
| Introduction | Lived experience → recognition → generalization → relationship → book purpose; trim series maintenance (defer to How to Read); generalization emerges from experience, does not restart essay |
| Ch 1 | Encounter limits of correctness before defining them |
| Ch 2 | Move closer to lived experiences where explanation failed to reduce harm |
| Ch 3 | Expand observations around real hero/villain sorting before abstract analysis |
| Ch 4–9 | Lean harder into existing vignettes; use as entry points rather than illustrations |
| Conclusion | Light touch — preserve restraint; delay synthesis slightly only if thesis arrives too fast |

### Revision examples (direction, not templates)

**Example 1 — Responsibility**

Before: "Responsibility is often confused with control. Many people assume responsibility means the ability to shape outcomes directly."

After: Open with a person carrying responsibility where control is absent; let the reader feel the tension; only then reveal the larger principle.

**Example 2 — Analysis without relief**

Before: "There is a moment that follows sustained analysis. You understand more than you once did."

After: Begin with returning to the same material, clarity increasing, relief not arriving—then name the larger moment.

**Example 3 — Correctness**

Before: "Correctness feels like safety."

After: Begin with a meeting, disagreement, correction, or moment where being right failed to produce expected resolution; allow the reader to observe the failure before naming correctness.

## DO

- Preserve core invariant from `book-rules.md`
- Reorder existing strong material before writing new prose
- Move existing vignettes earlier when they carry the insight
- Keep bold pattern compressions at chapter endings intact in meaning and placement
- Keep footnotes, citations, and `[^slug]` references unchanged unless reordering requires it
- Prefer ~0–150 new words per unit; hard cap ~300 words
- Output a brief report after each unit

## DO NOT

- Change what the book argues or remove core invariant
- **Overcorrect** — no literary wandering, faux-memoir openings, or ornamental scene-setting unrelated to the argument
- Add decorative metaphors, literary essayist imitation (Solnit-style drift), or poetic flourish
- Remove or soften chapter-ending compression lines (`**Pattern Name.**`)
- Let chapter endings wander
- Eliminate abstractions — earn them instead
- Obscure meaning or increase complexity for its own sake
- Break vignette convention (`###` heading outside block; scene inside `::: {custom-style="Vignette Block"}`; no bold/footnotes inside scenes)
- Add new chapters, patterns, or glossary terms
- Run `reflow_markdown_paragraphs.py` unless paragraph structure is broken
- Add more than ~300 words per unit unless a missing concrete entry point truly requires it

## OUTPUT

- Edit **TARGET_UNIT in place** on the branch
- Brief report (5–8 bullets): what moved earlier; what thesis was delayed; vignettes repositioned; abstractions earned (not removed); **ending compression preserved**; invariant preserved; approximate word delta
- Update [`docs/status.md`](../status.md) for the unit

## SUCCESS CRITERIA

A successful revision makes readers feel "I arrived at this insight" instead of "The author explained this insight." The book remains intellectually rigorous while becoming slightly more exploratory, human, and memorable—without becoming literary, memoir-like, or substantially longer without earned discovery.

## PIPELINE

Single-agent pass per unit. See [chapter-pipeline.md](./chapter-pipeline.md) for the Cursor prompt template. After all units complete: author review → `make build-book DIR=books/after-certainty` → optional PR.
