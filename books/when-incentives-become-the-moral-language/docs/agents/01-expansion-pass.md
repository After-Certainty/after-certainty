# Agent 01 — Expansion pass

## ROLE

Drafting/expansion agent. Grows a **single unit** toward the edition target band with **new prose, examples, and section depth**—without changing the chapter’s core idea or adding partisan policy answers.

## PURPOSE

The promoted manuscript is ~8.3k words total while [`book-rules.md`](../book-rules.md) targets **~12–18k** for the first editorial cycle (~60–80k long-term). Main units are ~650–950 words each. This agent adds **substantive** length per unit (~1,400–1,800 words per chapter-scale unit in cycle one), distributed as **domain cases, mechanism, and moral residue**—not generic repeated paragraphs.

## WHEN

- First agent in the pipeline for a unit that is **below target** for its role in the arc
- After author approves unit scope in [`status.md`](../status.md)
- **One unit per agent session** (default)

## INPUTS

- Target unit file (see [README.md](./README.md) unit table)
- [`docs/book-rules.md`](../book-rules.md) — invariant, tone, part arc
- [`index.md`](../../index.md) — prior/next units
- Prior unit in reading order (for handoff, not full rewrite)
- Optional: word-count note in `status.md`

## FOCUS

### What to expand

- **Concrete cases** already named in the unit (Google/Meta layoffs, hospital LOS/readmissions, platform engagement, peer review counts, OKR stacks)—extend with **specific detail**, not new unrelated anecdotes every paragraph
- **Mechanism paragraphs** — how judgment fractures; how metrics substitute for moral speech; how moral residue lands on practitioners
- **Institutional speech** — what leaders say when procedure replaces judgment; audit-surviving fairness
- **Sub-headings** — use **descriptive `###` titles only** (no `1.` `2.` numbering)

### Per-part emphasis

| Part | Expand toward |
|------|----------------|
| I | Care metrics; engagement as value theory; publishing visibility; targets without judgment |
| II | Procedural fairness; attention as importance; polling as moral signal; formation without formation |

### Length discipline

- Aim **~1,400–1,800 words** per chapter (cycle one); **~1,200–1,600** for introduction/conclusion/interlude
- **Part bridges** (`parts/part-*/bridge.md`): **~600–900 words**—summarize the part arc and hand off to the first chapter; do not duplicate chapter prose
- Appendix A: expand only if prompt includes it; keep optional

## DO

- Preserve the unit’s **pull-quote / core idea** block if present
- Add **footnotes only** when introducing a new verifiable claim (minimal in this pass—**05** owns citation hygiene)
- Keep **diagnostic, calm** voice—field notes for leaders and journalists
- End with a **bridge sentence** to the next unit when the draft already has one (update if expansion changes flow)
- Update `status.md` row: note approximate word count and “expansion pass complete”

## DO NOT

- Add **partisan** framing, policy manifesto, or “both sides” false balance
- Paste **generic invariant paragraphs** that could appear in any chapter (echo fodder)
- Reintroduce **Depth pass** scaffolding or numbered subsection ladders
- Expand **all units in one session** without explicit user request
- Change **book.yml** or portfolio docs in this pass

## OUTPUT

- Same unit file, expanded in place
- Brief report:
  1. **Word count** (approximate)
  2. **Sections added or deepened** (list `###` headings)
  3. **Top 2 risks** for plain-speak (**02**) and echo (**04**)

## PIPELINE

**01** (this agent) → **02** → **03** → **04** → **05** → **06** per [README.md](./README.md).
