# Trust Beyond Similarity — Rhythm Pass

Revision pass for **uniform staccato**: one sentence per paragraph used as the default beat. Restores **variation**—merged flowing paragraphs where thoughts continue, short lines **reserved** for emphasis—without flattening the book's calm, humane voice.

**When to run:** whenever the author submits draft prose for a unit (introduction, bridge, chapter, conclusion). Re-run after large pastes if one-sentence-per-line rhythm returns.

**Sibling references:** [`books/when-trust-stops-tracking-reality/docs/drafting-process.md`](../../../books/when-trust-stops-tracking-reality/docs/drafting-process.md) (author draft intake); [`books/how-trust-forms/docs/book-rules.md`](../../../books/how-trust-forms/docs/book-rules.md) (paragraph rhythm); [`books/why-diversity-matters/docs/agents/01-rhythm-paragraph-variation.md`](../../../books/why-diversity-matters/docs/agents/01-rhythm-paragraph-variation.md) (detailed procedure).

---

## Purpose

Author drafts—especially pasted outlines or first prose—often arrive with **mechanical staccato**: every sentence isolated, every beat given equal weight. That reads like an expanded outline, not finished nonfiction.

This pass does **not** remove all short sentences. It removes **accidental** staccato while keeping deliberate short lines at hinges (reframes, pattern names, closing returns, the fence motif).

The goal matches Chapter 1's settled voice: reflective, concrete, breathable—not telegraphic, not motivational.

---

## Inputs

- Target unit file (path or pasted draft)
- [`docs/book-rules.md`](book-rules.md) — tone, invariant, paragraph rhythm
- [`docs/character-guide.md`](character-guide.md) — do not flatten character beats into thesis-speak
- Prior unit (skim closing for handoff; do not repeat)

---

## Target rhythm

### Paragraph shape

- **Default:** 2–4 sentences per paragraph when the thought is continuous
- **Single-sentence paragraph:** sparingly—roughly **one per major beat**, not every beat
- **Avoid:** more than three consecutive one-sentence paragraphs unless listing or deliberate acceleration

### Sentence length

- Mix **short** (turn, punch), **medium** (scene, mechanism), and **occasional long** (qualification, synthesis)
- Keep clean short lines **inside** merged paragraphs; do not convert every short sentence into a compound monster

### What to merge

- Adjacent sentences that complete one observation, scene beat, or causal step
- Parallel triples that read like one argument spread across three one-liners
- Character introductions where each sentence could sit in one flowing paragraph (David / Priya / Grace / Jade beats)
- Real-anchor explanations that currently read as bullet prose without bullets
- Fragment lists that are really one thought (`Not a barrier.` / `Not a policy.` → see **What to keep isolated** below)

### What to keep isolated

- **Strong landings** after a longer paragraph (e.g. chapter closing principle)
- **Rhetorical turns** that reframe the chapter
- **Pattern statement** lines when named in prose
- **Deliberate list acceleration**—e.g. introduction fence beats (`Not a barrier.` / `Not a policy.` / `Not a problem.`) when the rhythm is emphatic, not mechanical
- **Pull-quote weight** lines (rare; no bold inside pull-quotes)
- `##` / `###` sub-headings and their following paragraph

### What not to touch

- `#` / `##` unit titles and **Central Question** block
- Footnotes (`[^…]`) and definition blocks at file end
- Generated title/copyright pages
- Facts, character actions, causal claims, or who said what

---

## Procedure

1. **Incorporate** — merge author draft into target file; preserve intent and structure.
2. **Read aloud once** — mark runs of staccato that feel mechanical, not emphatic.
3. **Merge** — join adjacent one-sentence paragraphs; vary sentence length within merged blocks.
4. **Re-read aloud** — restore one isolated line only where emphasis earns it.
5. **Check handoff** — opening connects to prior unit; closing does not over-preview the next chapter.
6. **Confirm** — no meaning, example facts, or causal claims changed.
7. **Reflow** (optional) — if mid-sentence hard wraps appear:

   ```bash
   python3 tools/reflow_markdown_paragraphs.py books/trust-beyond-similarity/PATH/TO/UNIT.md
   ```

8. **Status** — update [`docs/status.md`](status.md): unit `draft`, note `rhythm pass` and `subheads` when applicable.

---

## Book-specific guardrails

### Community center anchor

- Preserve **embodied detail** when merging (model, fence, lot, meetings)—do not compress scene into abstraction.
- Do not make David, Priya, Grace, or Jade sound like case-study labels; keep human motion.

### No villain flattening

- Short moral clarifiers (`None of this was sinister.`) may stay isolated if they land; do not delete the restraint.

### Diagnostic voice

- Do not introduce management-blog tone, jargon stacks, or sermon cadence while smoothing rhythm.
- Do not de-echo repeated phrases in this pass (echo pass is separate).

### Introduction fence sequence

- The four-character fence interpretations may use **controlled** staccato; merge only where repetition feels like outline paste, not where short lines carry contrast (`The same fence.` / `Four different interpretations.`).

---

## DO

- Preserve warm, reflective nonfiction tone established in Chapter 1
- Preserve core invariant and chapter pattern
- Keep bridges concise but not choppy
- Report approximate paragraph count before → after

## DO NOT

- Add new examples, sections, or citations (citation pass is separate)
- Remove all short sentences—variation is the goal
- Over-merge intentional emphasis in introduction or chapter closings
- Change bibliography or footnotes unless fixing a broken merge at a footnote marker

---

## Output

Same unit file, rhythm-polished. Brief report to author:

1. **Staccato severity before** (high / moderate / low)
2. **Paragraph count** (before → after)
3. **Isolated lines kept** (1–3 examples of deliberate singles)
4. **Handoff** — opening/closing adequate / lightly revised
5. **Reflow** — ran script (yes/no)

---

## How to submit a draft

Send the **unit name or file path** and draft text (or confirm the file is already updated).

Optional flags:

- `rhythm only` — skip citation pass this round
- `light rhythm` — author draft already close to Chapter 1 voice; merge only obvious runs
- `preserve staccato` — unit uses deliberate fragment rhythm (note which section)

Default after author draft: **rhythm pass** → **citation pass** (if earned) → **status update**. See [`docs/drafting-process.md`](drafting-process.md).

---

## Reference voice

Compare settled rhythm to [`parts/part-1-the-illusion-of-sufficiency/chapter-1-trusting-people-like-us.md`](../parts/part-1-the-illusion-of-sufficiency/chapter-1-trusting-people-like-us.md): mixed paragraph length, short lines at turns—not as the only setting.

For trust-cluster parallel, see [`books/when-trust-stops-tracking-reality/front-matter/introduction-when-trust-stops-tracking-reality.md`](../../../books/when-trust-stops-tracking-reality/front-matter/introduction-when-trust-stops-tracking-reality.md).
