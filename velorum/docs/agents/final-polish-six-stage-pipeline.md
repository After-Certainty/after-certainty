# Final polish — six-stage pipeline (single prompt)

**Use when:** The chapter is already strong; you want **one Cursor session** that applies **minimal, high-impact** edits in a **fixed order** without merging stages.

**Relation to numbered agents:** Each stage aligns with an existing spec—run this pipeline as **one chained instruction**, or run agents **[02](./02-flow-clarity-editor.md) → [03](./03-embodiment-sensory-grounding.md) → [04](./04-dialogue-voice.md) → [05](./05-thematic-signal.md) → [06](./06-pacing-structural-tension.md) → [10](./10-read-aloud-cadence-clarity-editor.md)** as separate passes. **Optional:** run **[01](./01-cinematic-scene-pass.md)** once **before** stage 1 when the chapter needs **stronger establishing geography / light / “camera”** after the rough draft. **Stage 6** here is the same bar as **[10](./10-read-aloud-cadence-clarity-editor.md)** (audiobook-style cadence); **[07](./07-audio-readaloud.md)** remains the quick listener/TTS tripwire and can run before or alongside that chain.

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
- Preserve **close-third POV** per **[act-chapter-index.md](../act-chapter-index.md)**; fix unclear *he* / wrong-head slips with **minimal** name or beat—**do not** drift omniscient to solve cadence
- Prefer **concrete** rephrasing over **poetic** when fixing clarity or cadence—**do not** add new figurative layers or “literary polish” (**[agents/README.md → Concrete description](./README.md#concrete-description-default)**)
- If a section already works, **DO NOT** change it

All edits must be:

→ **minimal**  
→ **precise**  
→ **justified** by clarity, flow, or cadence

---

## STYLE TARGET

- Accessible, immersive, grounded (Sarah Beth Durst–like clarity)
- **Concrete** sight/sound/motion over decorative figurative stacks (**[agents/README.md → Concrete description](./README.md#concrete-description-default)**)
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
- Reduce **subject–verb streaks** (many bare *He/Name + verb* sentences in a row)—braid with *when/while/until/as…* where beats belong together (**voice-spec → Paragraph shape**)
- **Paragraph merge:** join **single-sentence paragraphs** into **multi-sentence** blocks where the blank line only added staccato—same rules as **[02-flow-clarity-editor.md](./02-flow-clarity-editor.md)** (*paragraph merge pass*); keep **speaker clarity** when dialogue shares a paragraph

**DO:**

- Light restructuring of sentences if needed
- **Allow** re-paragraphing when merging orphans per **02**; preserve beats that **earn** a one-line paragraph

**DO NOT:**

- Change meaning
- Shorten everything
- Merge dialogue without tags/beats where readers would lose the speaker, or merge **intentional** stand-alone lines (openings, punches, staged closings)—see **02** guardrails

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
- **Subject–verb streaks:** same bar as **[10](./10-read-aloud-cadence-clarity-editor.md)**—connective bridges, breath-sized sentences, no misleading *until* chains

**DO:**

- Adjust sentence structure for breath and flow
- Vary sentence openings (especially away from repeated *He… He…* reportorial stacks)
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