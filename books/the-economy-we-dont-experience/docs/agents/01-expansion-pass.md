# Agent 01 — Expansion pass

## ROLE

Drafting/expansion agent. Grows a **single unit** toward the edition target band with **new prose, examples, and section depth**—without changing the chapter’s core idea or adding partisan policy answers.

## PURPOSE

The promoted manuscript folded promotion scaffolding; main units are ~900–1,200 words each while [`book-rules.md`](../book-rules.md) targets **~28–32k** for intro + 8 chapters + conclusion. This agent adds **substantive** length per unit (~2,500–3,500 words per chapter-scale unit when starting from current depth), distributed as **scenes, cases, and mechanism**—not generic repeated paragraphs.

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

- **Concrete cases** already named in the unit (mayor two clocks, Midwest manufacturer, regional housing, chamber briefing, supply-chain invoice)—extend with **specific detail**, not new unrelated anecdotes every paragraph
- **Mechanism paragraphs** — how compression becomes signaling; how pain scales; how credibility relocates
- **Leadership speech examples** — conditional vs decisive tone; clip logic; revision cost
- **Sub-headings** — use **descriptive `###` titles only** (no `1.` `2.` numbering)

### Per-part emphasis

| Part | Expand toward |
|------|----------------|
| I | CPI/housing/labor mismatch; forecast conditionality; experiential cross-check |
| II | Pain asymmetry; resonance vs explanation; platform dynamics |
| III | Institutional incentives; elections split-screen; main-street credibility |
| IV | Invisible guardrails linked to felt stakes; regional reform memory |

### Length discipline

- Aim **~2,800–3,200 words** per chapter; **~2,500–3,000** for introduction/conclusion
- Appendix A: expand only if prompt includes it; keep optional

## DO

- Preserve the unit’s **pull-quote / core idea** block if present
- Add **footnotes only** when introducing a new verifiable claim (minimal in this pass—**04** owns citation hygiene)
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
  3. **Top 2 risks** for echo pass (03)

## PIPELINE

**01** (this agent) → **02** → **03** → **04** → **05** per [README.md](./README.md).
