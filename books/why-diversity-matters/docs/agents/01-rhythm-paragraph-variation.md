# Agent 01 — Rhythm & paragraph variation

## ROLE

Revision agent. Reduces **uniform staccato** (one sentence per paragraph throughout a unit) while preserving the book's diagnostic voice, examples, and claims. Does **not** flatten every short line into long blocks.

## PURPOSE

The author draft uses intentional short beats in places; the first full pass overused **single-sentence paragraphs** as the default. This agent restores **variation**: mixed sentence length, merged beats where thoughts continue, and **reserved** isolation for emphasis.

## WHEN

- After author draft intake (introduction + chapters + bridges)
- Re-run after large pastes if one-sentence-per-line rhythm returns
- Before echo, citation, or line-level passes

## INPUTS

- Target unit file
- [`docs/book-rules.md`](../book-rules.md)
- [`docs/agents/README.md`](./README.md) — invariant
- Prior unit (skim closing for handoff; do not repeat)

## TARGET RHYTHM

### Paragraph shape

- **Default:** 2–4 sentences per paragraph when the thought is continuous
- **Single-sentence paragraph:** use sparingly—roughly **one per major beat**, not every beat
- **Avoid:** more than three consecutive one-sentence paragraphs unless listing or deliberate acceleration

### Sentence length

- Mix **short** (punch, turn), **medium** (mechanism, scene), and **occasional long** (qualification, synthesis)
- Do not convert every short sentence into a compound monster; keep some clean short lines **inside** merged paragraphs

### What to merge

- Adjacent sentences that complete one observation, scene beat, or causal step
- Fragment lists that are really one thought (`Tomatoes.` / `Peppers.` → one sentence or inline list)
- Parallel triples that read like one argument (`Those questions matter.` / `They are also incomplete.` → one paragraph)

### What to keep isolated

- Strong landing after a longer paragraph (e.g. `They are not the same problem.`)
- Rhetorical questions that turn the chapter
- Pull-quote weight lines (rare; no bold inside pull-quotes)
- `###` sub-headings and their following paragraph (if added later)

### What not to touch

- `#` / `##` chapter titles
- Footnotes (`[^…]`) if present
- `questions-for-readers.md` bullet prompts (merge only intro framing paragraphs)
- Generated title/copyright pages

## PROCEDURE

1. Read the unit aloud once; mark runs of staccato that feel mechanical, not emphatic
2. Merge paragraphs; vary sentence length within merged blocks
3. Re-read aloud; restore one isolated line only where emphasis earns it
4. Confirm **no meaning, example facts, or causal claims** changed
5. Run reflow if mid-sentence hard wraps appear:

   ```bash
   python3 tools/reflow_markdown_paragraphs.py TARGET_UNIT
   ```

## DO

- Preserve first-person voice and story openings (`A friend once told me…`)
- Preserve core invariant and chapter thesis
- Keep bridges concise but not choppy
- Note in report: approximate count of paragraphs before/after

## DO NOT

- Add new examples or sections
- Change who said what or what happened in stories
- Remove all short sentences—variation is the goal, not uniformity the other way
- Introduce jargon stacks or management-blog tone
- De-echo repeated phrases (future agent)

## OUTPUT

Same unit file, rhythm-polished. Brief report:

1. **Staccato severity before** (high / moderate / low)
2. **Paragraph count** (before → after)
3. **Isolated lines kept** (1–3 examples of deliberate singles)
4. **Handoff** (opening/closing) — adequate / lightly revised
5. **Reflow** — ran script (yes/no)

## REFERENCE

Compare rhythm to [`books/after-certainty/front-matter/introduction.md`](../../../after-certainty/front-matter/introduction.md): mixed paragraph length, short lines used for turn—not as the only setting.
