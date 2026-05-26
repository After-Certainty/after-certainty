# Agent 01 — Expansion pass

## ROLE

Drafting/expansion agent. Grows a **single unit** toward the edition target band with **new prose, examples, and section depth**—without changing the chapter’s core idea or adding self-help / statistical pedantry.

## PURPOSE

The promoted manuscript is ~500–600 words per unit while [`book-rules.md`](../book-rules.md) targets **~50–58k** for the first editorial cycle (intro + 6 bridges + 12 chapters + conclusion). This agent adds **substantive** length per unit, distributed as **scenes, cases, and mechanism**—not generic repeated paragraphs.

## WHEN

- First agent in the pipeline for a unit that is **below target** for its role in the arc
- **One unit per agent session** (default)

## INPUTS

- Target unit file (see [README.md](./README.md) unit table)
- [`docs/book-rules.md`](../book-rules.md) — invariant, tone, part arc
- [`index.md`](../../index.md) — prior/next units
- Prior unit in reading order (for handoff, not full rewrite)

## FOCUS

### What to expand

- **Concrete cases** already named or implied (medication shortage, reorg manager, hospital committee, warning-system success, leader under board pressure)—extend with **specific detail**
- **Mechanism paragraphs** — comfort of absolutes; abstraction seduction; pattern as warning vs verdict; probabilistic moral seriousness; institutional drift; false prophecy
- **Institutional and leadership speech** — conditional vs categorical tone; cost of revision
- **Sub-headings** — use **descriptive `###` titles only** (no `1.` `2.` numbering)

### Per-part emphasis

| Part | Expand toward |
|------|----------------|
| I | Psychological comfort of certainty; abstraction and clean answers |
| II | Patterns as warnings; fatalistic pattern recognition |
| III | World refuses absolutes; probabilism ≠ moral relativism |
| IV | Warning systems that incriminate success; collapse into absolutes |
| V | Pressure into certainty; discipline as leadership practice |
| VI | Responsibility after certainty; meaning that survives uncertainty |

### Length discipline

- Aim **~3,500–4,500 words** per chapter
- **~2,000–2,800** for introduction and conclusion
- **Part bridges** (`parts/part-*/bridge.md`): **~600–900 words**—part arc, chapter previews, invariant touch once, handoff to first chapter; **do not** duplicate chapter prose
- Appendix ideas: expand only if prompt includes it

## DO

- Preserve the unit’s **pull-quote / core idea** block if present
- Keep **serious, diagnostic** voice—for leaders, clinicians, institutional readers
- End with a **bridge sentence** to the next unit when appropriate
- Update `status.md` row: approximate word count and “01 expansion complete”

## DO NOT

- Add **Stoic self-help**, **checklists**, or **statistical pedantry** without moral stakes
- Paste **generic invariant paragraphs** in every section
- Reintroduce numbered subsection ladders (`### **1.**`)
- Expand **all units in one session** without explicit request
- Change **book.yml** or portfolio docs

## OUTPUT

- Same unit file, expanded in place
- Brief report: word count, sections deepened, top 2 risks for **02** and **04**

## PIPELINE

**01** (this agent) → **02** → **03** → **04** → **05** → **06** per [README.md](./README.md).
