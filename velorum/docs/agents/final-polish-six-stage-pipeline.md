# Final polish — six-stage pipeline (single prompt)

**Use when:** The chapter is already strong; you want **one Cursor session** that applies **minimal, high-impact** edits in a **fixed order** without merging stages.

**Relation to numbered agents:** Each stage aligns with an existing spec—run this pipeline as **one chained instruction**, or run agents **[01](./01-flow-clarity-editor.md) → [02](./02-embodiment-sensory-grounding.md) → [03](./03-dialogue-voice.md) → [04](./04-thematic-signal.md) → [05](./05-pacing-structural-tension.md) → [09](./09-read-aloud-cadence-clarity-editor.md)** as separate passes. **Stage 6** here is the same bar as **[09](./09-read-aloud-cadence-clarity-editor.md)** (audiobook-style cadence); **[06](./06-audio-readaloud.md)** remains the quick listener/TTS tripwire and can run before or alongside that chain.

---

Copy everything below the line into your agent prompt (attach the chapter + house docs as usual).

---

You are running a multi-stage editing pipeline on a fantasy novel chapter.

This is a **FINAL POLISH**. The writing is already strong.

Your job is to make **small, high-impact improvements** WITHOUT changing the author’s voice, tone, structure, or meaning.

---

## CRITICAL RULES (apply to ALL stages)

- Do **NOT** rewrite paragraphs wholesale
- Do **NOT** change plot, character intent, or thematic meaning
- Do **NOT** add new ideas, exposition, or imagery
- Do **NOT** simplify the prose excessively
- Do **NOT** make the writing more “modern” or “literary”
- Preserve the author’s natural rhythm and style
- If a section already works, **DO NOT** change it

All edits must be:

→ **minimal**  
→ **precise**  
→ **justified** by clarity, flow, or cadence

---

## STYLE TARGET

- Accessible, immersive, grounded (Sarah Beth Durst–like clarity)
- Natural spoken rhythm
- Emotion carried through action and dialogue, not explanation

---

Run the following stages **IN ORDER**.

Do **not** skip stages. Do **not** merge stages. Apply each one **lightly**.

---

### STAGE 1 — Flow & Clarity Pass

**GOAL:** Improve sentence flow and readability.

**FOCUS:**

- Smooth awkward phrasing
- Improve sentence transitions
- Maintain varied sentence length (avoid choppiness or monotony)

**DO:**

- Light restructuring of sentences if needed
- Preserve pacing and paragraph structure

**DO NOT:**

- Change meaning
- Shorten everything
- Rewrite paragraphs

---

### STAGE 2 — Embodiment & Grounding Pass

**GOAL:** Ensure key emotional or abstract moments are physically grounded.

**FOCUS:**

- Add or strengthen subtle physical anchors (hands, breath, posture, environment)
- Make internal states felt through the body

**DO:**

- Add 1–3 word physical cues if needed

**DO NOT:**

- Add new descriptions or imagery
- Over-describe
- Change scene content

---

### STAGE 3 — Dialogue & Voice Pass

**GOAL:** Ensure dialogue sounds natural when spoken aloud.

**FOCUS:**

- Remove overly “written” or overly polished phrasing
- Preserve distinct voices (Riven vs Cael)
- Tighten exchanges where needed

**DO:**

- Slightly adjust wording for natural speech

**DO NOT:**

- Add speeches
- Add exposition
- Flatten character differences

---

### STAGE 4 — Thematic Signal Pass

**GOAL:** Strengthen theme through consistency, not explanation.

**FOCUS:**

- Reinforce motifs (work, memory, cost, truth vs story)
- Align imagery where already present

**DO:**

- Light adjustments to wording if it strengthens alignment

**DO NOT:**

- Explain themes
- Add new thematic content
- Make subtext explicit

---

### STAGE 5 — Pacing & Tension Pass

**GOAL:** Ensure scenes escalate and land cleanly.

**FOCUS:**

- Strengthen key hinge moments (decisions, reveals)
- Trim minor drag if present

**DO:**

- Slight tightening (1–2 lines max per section if needed)
- Add micro-pauses before important lines

**DO NOT:**

- Remove atmosphere
- Speed up emotional beats
- Add drama

---

### STAGE 6 — Read-Aloud Cadence & Clarity Pass (FINAL)

**GOAL:** Optimize for audiobook-style listening.

**FOCUS:**

- Ensure sentences are clear on first hearing
- Fix ambiguous references (“it,” “they,” unclear nouns)
- Smooth rhythm for natural speech
- Reduce noticeable repetition

**DO:**

- Adjust sentence structure for breath and flow
- Vary sentence openings
- Replace confusing phrasing

**DO NOT:**

- Simplify language excessively
- Change tone or voice
- Add explanation

---

## FINAL CHECK

Before output:

- Ensure no section feels “rewritten”
- Ensure voice is consistent throughout
- Ensure dialogue still sounds like the same characters
- Ensure pacing still matches the original intent

---

## OUTPUT

Return the **FULL updated chapter** with all improvements integrated.

If **fewer than ~5%** of sentences required changes, that is expected and correct.

If **more than ~20%** of sentences changed, you have over-edited. Roll back and reduce changes.
