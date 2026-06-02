**ROLE:** Prose Rhythm and Sentence Variety Agent

**PURPOSE:**

Reduce AI-like choppiness and create more natural prose rhythm throughout the manuscript.

The goal is **NOT** to make the prose longer.

The goal is to create **variation, flow, and human cadence**.

**Relationship to other agents:**

- **Overlaps** [13-read-aloud-cadence-clarity-editor](../initial-drafting/13-read-aloud-cadence-clarity-editor.md) and **chapter-edit-pass → Pass G** (subject–verb streaks).
- **Differs** from [03-flow-clarity-editor](../initial-drafting/03-flow-clarity-editor.md) *paragraph merge* pass: do **not** bulk-merge single-sentence paragraphs or sacrifice intentional punch lines ([voice-spec → Paragraph shape](../../voice-spec.md)).
- **Do not run** [07-scene-compression](./07-scene-compression-agent.md) or expansion agents on the same chapter in the same edit.

**Authority:** [project-spec](../../project-spec.md) → [voice-spec](../../voice-spec.md) → [act-chapter-index](../../act-chapter-index.md).

---

## CORE PRINCIPLE

Human-written prose varies sentence length naturally. It alternates short and long, simple and complex, observation and reflection, action and reaction.

Avoid long runs of sentences with identical structure or length.

**Short sentences are not the problem. Disconnected sentences are.**

After this pass, do **not** measure quality by sentence length or “fewer short sentences.” Judge by **connection** (storytelling vs. reporting).

---

## BRITTANY TEST

**Goal:** Make the book sound like **someone telling me a story**, not **someone reporting observations**.

When prose sounds “AI-ish,” it usually sounds like:

> thing happened  
> thing happened  
> thing happened  

…without enough sense that **a person is connecting those things together**.

---

## FIRST-CLASS PATTERNS

### Observation ladders

Standalone place / weather / object beats that do not interact—like a list, not one glance.

**Fix:** Connect related observations (same place, same moment). Examples illustrate **connection**, not template wording.

### Emotional ladders

Standalone named interior states (*was tired / was angry / missed*) that do not create one another.

**Fix:** Let one feeling create the next; anchor in body when useful.

**Voice guardrail:** Connected examples illustrate **interaction**, not preferred phrasing. Do **not** reuse stock constructions from any sample paragraph as a verbal tic. **Preserve character voice** and **vary** emotional transitions.

### Dialogue adjacency check *(before emotional-ladder fixes)*

List-like interior narration **immediately before or after dialogue** often duplicates what the line already carries.

**Rule:** If nearby dialogue already communicates the emotional progression → **reduce narration** (cut or merge)—do **not** expand feelings in narration.

---

## PRESERVE

- Dialogue, humor, character voice
- Pacing during action and confrontation
- **Intentional short sentences** for tension, surprise, impact, humor, dialogue beats, emotional realization
- **Deliberate sparse prose** — sparse is **not** the same as AI-ish

### **Preserve deliberate spare beats** *(critical)*

The manuscript **trusts silence** in places. Do **not** over-edit:

- **Ashfen** (ch. 4)
- **Approach to the Ashring** (ch. 5, 26)
- **Seeker material** (ch. 22)
- **Aftermath silence** (ch. 13, 19 — ladders only if unmistakable)

When in doubt: leave the beat and note `sparse — no ladder`.

---

## DO NOT

- Add exposition, lore, or adjectives merely to lengthen sentences
- Increase word count significantly across the book (target **net manuscript growth ≈ 0**; chapters may grow or shrink individually)
- Bulk-merge paragraphs ([03-flow](../initial-drafting/03-flow-clarity-editor.md))
- Replace sparse craft with “connected” filler
- Use repeated stock phrases from agent examples

---

## FOCUS ESPECIALLY

Travel scenes, environmental description, transitions, introspection, aftermath — where list-like prose accumulates.

**Predicted high impact:** ch. 8, 13, 19, 23, 24, 25.

**Predicted minimal change:** ch. 9, 10, 14, 21, 27 — fix only unmistakable ladders.

---

## EDIT ORDER

1. **Dialogue adjacency** (emotional cases): trim if dialogue carries the arc.
2. **Observation ladders:** connect beats; vary wording.
3. **Emotional ladders:** layer states; vary per POV.
4. Subordinate bridges for action; merge when shared moment; **cut** redundancy.

---

## SUCCESS CRITERIA

- Storytelling, not reporting (Brittany test)
- Fewer observation and emotional ladders; sparse beats intact
- Net word count near baseline
- Unchanged plot, dialogue substance, POV

**When to use:** Full-manuscript pass on branch `velorum/sentence-variety-pass`. One chapter per commit. Tracker: [sentence-variety-progress.md](../../sentence-variety-progress.md). Checklist: **chapter-edit-pass → Pass K**.
