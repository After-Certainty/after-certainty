# Plan: Rewrite Chapter 6 — Harm Under Influence

Planning note for manuscript work on **branch `plan/chapter-6-harm-rewrite`**. When this ships, update `v1/docs/status.md` if the book’s editorial status section tracks this chapter.

**Manuscript:** `parts/part-3-harm-effectiveness-legitimacy/chapter-6-harm-under-influence.md`

**House style:** Plain speak and typographical conventions in `v1/docs/book-rules.md` and `v1/front-matter/typographical-conventions.md`; vignette and pattern rules in `.cursor/rules/when-others-typography.mdc`.

---

## Goal

Rewrite chapter 6 so it matches the **flow and plain-language style** of chapters 1–5: **recognizable observations or vignettes first**, then patterns, definitions, and taxonomy—not the reverse.

---

## What chapters 1–5 establish (reference rhythm)

- **Lead with the familiar:** everyday images, parallel scenes, or opening vignettes before heavy framework language.
- **Terms follow recognition:** renewal/erosion, vitality/decay, circulation, etc., land after the reader has something concrete to attach them to.
- **Short sections, concrete verbs:** “watch what happens when…” framing where it helps.

Chapter 6 currently **defines core ideas up front** (harm signal, how harm moves, four postures at length) **before** the first full sustained scene (**The Tournament Weekend**). The rewrite should **invert** that: ground the chapter, then name and order the ideas.

---

## Proposed chapter arc (structure)

1. **New opening (recognition before taxonomy)**  
   - **Option A** (closest to chapter 5): two short **contrasting** vignettes—one where cost and decision stay visibly linked, one where cost slides outward or downward while the official story stays clean.  
   - **Option B** (closest to chapters 3–4): one opening vignette that contains both beats, then one sentence framing the chapter question: where harm lands under influence.

2. **Core claim in plain language** — Leadership routes harm; it does not erase it. Keep tight; **do not** introduce the four posture names yet if the opening is still purely observational.

3. **Observable “how harm moves”** — Keep the vibrant vs. decaying contrast; **tie language to the opening** so it does not read as abstract labels alone.

4. **Harm displacement channels** (downward, outward, forward, inward) — Prefer **anchoring each channel to behavior** (a line or two per channel) rather than a bare bullet list. Placement: **after** opening scenes, or **immediately before** the four postures.

5. **Four harm postures** — **After** scenes and displacement are in view. Keep each posture’s definition **short**; **illustrate each posture with its own vignette** (see below).

6. **Supporting sections** — **Boundaries and Agency** (limits of harm-absorbing leadership), **Selective Followership and Harm**, correction / escalation material: order after postures as nuance and early-warning material, unless a vignette clearly belongs next to one posture only.

7. **How Harm Reads** — Late synthesis; optional one foreshadowing line near the top (“you can already read this by watching…”) so the chapter reads as one thread.

8. **Close** — **Effectiveness Next** (bridge to chapter 7) and the **Pull Quote Block**; keep “follow the damage path” without new jargon.

**Strengths in the current draft to preserve:** displacement channel list; boundaries on harm-absorption; selective followership; link to **Learning Collapses** / correction failure (running prose uses **Learning Collapse** — see `docs/book-rules.md`); citations; bridge to effectiveness.

---

## Requirement: illustrate each of the four harm postures

The chapter’s taxonomy names **four** recurring postures. **Each posture needs a distinct illustration** so readers can connect **label ↔ behavior**. One strong story is not enough: it often maps to displacement or “who pays” generally but does not spell **which** posture unless the behavioral signature is clear.

**Illustration type:** Prefer a **Vignette Block** per posture (or a clearly separated scene each), following chapter 3–5: concrete setting, a decision moment, what the room learns—**interpretation after** the block, not moral theater inside it.

### Posture-by-posture illustration guide

| Posture | What to show (recognizable read) | Pitfall to avoid |
|--------|-----------------------------------|------------------|
| **Harm-absorbing** | Decision rights and **visible** cost stay linked: acknowledgment, scope change, or the decider **in the room** when the bill arrives (no heroic speech required). | Martyrdom narrative—use the chapter’s boundary: absorption that **replaces** others’ responsibility vs absorption that **restores** correction. |
| **Harm-tolerant** | The **same** preventable friction or hurt **recurs**; the group treats it as the cost of keeping things moving (“at this scale,” “season,” “edge cases”). | Collapsing into generic decay—keep **continuity over repair** explicit. |
| **Harm-instrumental** | A **named trade**: protect timeline, center, or budget; a **named population** absorbs the cut. | Generic “bad boss”—show the **efficiency / necessity story** in the scene’s logic. |
| **Harm-blind** | Surface metrics fine; **untracked** load elsewhere (handoffs, exhaustion, fear, silence). Often **no villain**—missed channels, not cruelty. | Overlap with tolerant: tolerant **knows** and normalizes; blind **does not see** or **does not measure**. |

### Section pattern (repeat four times)

For each posture, use a fixed rhythm (mirrors chapters 3–4 per-pattern structure):

- `### **Short Title**` — **outside** the vignette block.
- `::: {custom-style="Vignette Block"}` — scene text with **no** `**` inside the block.
- `:::`
- **Then** two to four sentences tying the scene to **this posture only** (same rhythm as “What matters is…” in neighboring chapters).

### Existing material

- **The Tournament Weekend** can remain but should map to **one** posture only after sharpening (likely **harm-instrumental** or **harm-tolerant**, depending how the president’s logic is drawn). **Do not** let one scene carry all four meanings.
- The **hospital escalation** vignette should **one** primary posture so the taxonomy stays legible (it may also support “correction failure” prose—keep the **dominant** read clear).

### Success criterion

A reader could **name the posture from the vignette alone** before reading the labeled paragraph—same bar as recognizing **Dissent is Welcomed** from the correction-in-public scene in chapter 3.

---

## Mechanical pass after drafting

- Run the script in `v1/docs/typography-check.md` after substantive edits.
- Re-read **Plain speak** and pull-quote / pattern-block rules in `v1/docs/book-rules.md`.
