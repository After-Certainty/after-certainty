# Coordination Framing Pass

Editorial companion for weaving a distributed-coordination grammar beneath cohesion and coupling. Primary vocabulary unchanged; secondary terms used sparingly.

**Status:** Integrated into manuscript per plan (Introduction, Ch 1–4, Part II bridge, Ch 6–7, 9–11, interlude, stubs, glossary).

## Core claim (deepens invariant)

> As independently changing actors increase, maintaining coherent shared state becomes increasingly expensive.

Equivalently: all sufficiently scaled systems become coordination problems—not because they are machines, but because no one boundary holds the whole.

## Term budget (whole book)

| Term | Max uses | Primary locations |
|------|----------|-------------------|
| coordination pressure | recurring, light | Intro, Ch 4, Part II bridge, interlude |
| synchronization overhead | 4–6 | Ch 1, 4, 7, interlude |
| coherence maintenance | 3–4 | Ch 4, interlude, glossary |
| stale representation | 3–4 | Ch 4, interlude, Ch 17 stub |
| split-brain | 1–2 | Ch 18 stub, interlude (civic language) |
| eventual alignment | 1–2 | Interlude only |
| cascading retries | 1–2 | Interlude |
| lock contention | 0–1 | Ch 20 stub (bureaucracy freeze) |

Avoid: CAP theorem, mutex, race condition (unless single software example), CS textbook tone.

---

## Tier 1 — Part I (integrated)

### Introduction — after "Units of Analysis"

**Rationale:** Seed grammar once beneath invariant.

**Text:** See `introduction.md` new paragraph after line 27.

### Ch 1 — after tight-coupling paragraph

**Rationale:** Link independent modules to later institutional scale.

**Text:** One sentence on hidden synchronization cost.

### Ch 2 — after coordination overhead sentence

**Rationale:** Explain why queues appear before Ch 4 names substitutes.

**Text:** Two sentences on coherence maintenance spend.

### Ch 3 — "Why Delayed Feedback Corrupts Behavior"

**Rationale:** Delayed propagation + partial information without "eventual consistency."

**Text:** Two sentences after governance-variable paragraph.

### Ch 4 — three anchors

1. After coordination-as-substitute (line ~21): coherence maintenance sentence.
2. After knowledge-limits paragraph (~37): stale representation sentence.
3. Transition to Part II (~67): software history as synchronization-overhead reduction.

---

## Tier 2 — Part II (integrated)

### Part II bridge — bullet under "What This Part Tests"

### Ch 6 — "What Agile Did Not Solve"

### Ch 7 — "Why DevOps Emerged"

### Ch 9 — "Metrics as Coupling Diagnostics"

### Ch 10 — after opening vignette

### Ch 11 — "Ports and Adapters"

---

## Interlude — Coherence Under Scale

**File:** `interlude-coherence-under-scale.md`

**Placement:** After Part IV, before Part V (no chapter renumbering).

---

## Tier 3 — Stub guidance (embedded in chapter files)

Part III: medium visibility (acceleration without coherence maintenance; partial information).

Part IV: high visibility (fragmented authority, stale representations, governance queues).

Part V: design as re-pricing coordination cost.

---

## Chapters explicitly not changed

- Prologue
- Preface (optional future clause only)
- Epilogue (optional single line after interlude stable)
