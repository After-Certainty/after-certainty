# Coordination Framing Pass

Editorial companion for weaving a distributed-coordination grammar beneath cohesion and coupling. Primary vocabulary stays primary; secondary terms appear sparingly and accumulate meaning across the arc.

**Status (manuscript):**

| Segment | Status |
|---------|--------|
| Introduction, Part I (Ch 1–4) | Integrated |
| Part II bridge, Ch 6–7, 9–11 | Integrated |
| **Part III bridge, Ch 12–16** | **Integrated (May 2026 pass)** |
| Interlude *Coherence Under Scale* | Drafted |
| **Part IV bridge, Ch 17–20** | **Integrated (May 2026 pass)** |
| **Part V bridge, Ch 21–25** | **Integrated (May 2026 pass)** |
| Glossary | Coordination Pressure, Coherence Maintenance, Context Collapse, Consequence Architecture |

## Core claim (deepens invariant)

> As independently changing actors increase, maintaining coherent shared state becomes increasingly expensive.

Equivalently: all sufficiently scaled systems become coordination problems—not because they run on networks, but because no one boundary holds the whole.

## Term budget (whole book; approximate after Part III)

| Term | Target | Notable locations |
|------|--------|-------------------|
| coordination pressure | recurring, light | Intro; Ch 4; Part II bridge; **Part III bridge, Ch 13**; interlude; Part IV bridge |
| synchronization overhead / synchronization cost | use variants; avoid pile-up | Ch 1, 4, 7, 11; **Ch 12–14, 16**; interlude |
| coherence maintenance | 3–4 explicit | Ch 4; **Ch 12, Part III bridge**; interlude; glossary |
| partial information | light, recurring | Ch 3; **Ch 12, 14, Part III bridge**; interlude |
| delayed propagation | 2–3 | Ch 3; **Ch 12**; interlude |
| independently evolving (boundaries/actors) | light | Ch 1; Part II bridge; **Ch 15**; Part IV bridge |
| stale representation | 3–4 | Ch 4; interlude; **Ch 14, 15** |
| coordination substitutes / coordination theater | sparse | Ch 2, 4; **Ch 12, 14, 16** |
| split-brain | 1–2 | Ch 18 stub, interlude only |
| eventual alignment | 1–2 | Interlude only |
| cascading retries | 1–2 | Interlude |
| lock contention | 0–1 | Ch 20 stub |

Avoid: CAP theorem, mutex, race condition (unless single clarifying software example), CS textbook tone.

---

## Tier 1 — Part I (integrated)

See manuscript: `introduction.md`, `part-01-the-structural-grammar/01`–`04`.

---

## Tier 2 — Part II (integrated)

See manuscript: `part-02-software-as-early-laboratory/bridge.md`, Ch 6, 7, 9, 10, 11.

---

## Tier 3 — Part III (integrated May 2026)

**Visibility level:** Medium. Name the coordination grammar where AI acceleration stresses cohesion and coupling; do not turn Part III into a distributed-systems book.

### Part III bridge (`part-03-ai-and-structural-entropy/bridge.md`)

**Integrated:**

- Bullets: acceleration without **coherence maintenance**; **partial information** at boundaries
- Paragraph: coordination problem; **synchronization cost** downstream; frictionless generation vs operation
- Footnote: Simon on partial information

**Pass addition:** explicit **coordination pressure** in bullet list (ties to Introduction vocabulary).

### Chapter 12 — The Frictionless Illusion

**Integrated:**

- Coordination costs deferred to review/on-call
- **Synchronization cost** / **synchronization overhead**; **partial information**; independently produced changes
- **Coordination substitutes** and **coherence maintenance**
- **Coordination load** (incentives section)

**Pass addition:** **delayed propagation** in temporal-coupling discussion (links Ch 3 grammar to AI-era lag).

### Chapter 13 — Monoliths and Context Collapse

**Integrated:**

- Coordination hub (helper module)
- **Synchronization cost** / **synchronization overhead**
- **Coordination pressure**; coordination tax
- Simon/Hayek distributed knowledge (footnotes)

**Pass:** No further insertions required; chapter already at medium–high visibility for Part III.

### Chapter 14 — Guardrails as Constraint Architecture

**Integrated:**

- **Partial information** at boundaries
- **Stale representation(s)** of risk; model cards
- **Coordination theater**; **synchronization overhead**
- Bureaucracy-as-scar-tissue parallel (coordination substitute logic)

**Pass:** No further insertions required.

### Chapter 15 — Architectural Cohesion

**Integrated:**

- **Stale representation** on escalation handoffs
- Adapter/boundary logic echoes Ch 11 (partial information, synchronization cost at boundary)

**Pass addition:** **independently evolving** tool/model/corpus schedules in bounded-contexts section.

### Chapter 16 — The New Professional Literacy

**Integrated:**

- Full **Coordination Literacy** section: independently changing actors; **synchronization cost**; **coordination substitutes**
- Cross-reference Introduction and Ch 4 (**coordination pressure**, **coherence maintenance**)
- Part IV bridge forward

**Pass:** No further insertions required; explicit synthesis chapter for Part III.

---

## Interlude — Coherence Under Scale

**File:** `interlude-coherence-under-scale.md`

Explicit synthesis: coordination pressure, synchronization cost, stale representation, coordination substitutes, eventual alignment, cascading retries.

---

## Tier 4 — Stub guidance (Part IV–V)

**Part IV (high visibility):** fragmented authority, stale ownership pictures, governance queues, split-brain (civic, once), bureaucracy as coordination substitute.

**Part V (practical):** design as re-pricing coordination cost; Ch 22–23 responses to coordination pressure.

---

## Chapters explicitly not changed by framing pass

- Prologue
- Part III chapter bodies beyond light pass additions above (no rewrites)

---

## Part III coordination pass log (May 2026)

**Finding:** Part III drafts already embodied medium-visibility framing from outline notes and Tier 3 stub guidance. Pass focused on vocabulary alignment and three micro-gaps.

**Edits applied:**

1. Part III bridge — add **coordination pressure** bullet
2. Ch 12 — **delayed propagation** in temporal-coupling section
3. Ch 15 — **independently evolving** schedules in bounded-contexts section

**Not added (would over-budget or echo):** split-brain, eventual alignment, race conditions, CAP, extra synchronization-overhead sentences in Ch 13–14.

See also: `docs/part-03-coherence-pass.md` and `docs/part-04-coherence-pass.md` for full editorial/coherence gates.

---

## Part IV coordination pass log (May 2026)

**Finding:** Part IV drafts embodied high-visibility framing from stub guidance and bridge. Chapters 17–20 drafted with coordination pressure, stale representation, coordination substitutes, and civic split-brain (Ch 18) without software lecturing.

**Edits applied during drafting:** None required in post-pass micro-insert pass; terms distributed in chapter bodies at author-approved drafts.

**Term budget:** split-brain used in Ch 18 (civic definition); lock contention reserved to interlude only; coordination substitutes in Ch 17, 19, 20.

See: `docs/part-04-coherence-pass.md`.

---

## Part V coordination pass log (May 2026)

**Finding:** Author drafts embodied practical-visibility framing from stub guidance and Part V bridge (coordination cost, drift, design constraints). Ch 21–25 rewrites strengthened short-paragraph voice and cross-chapter bridges.

**Edits applied during drafting:** None required in post-pass micro-insert pass.

See: `docs/part-05-coherence-pass.md`.
