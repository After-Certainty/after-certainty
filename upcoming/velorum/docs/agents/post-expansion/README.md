# Velorum — post-expansion agents

**Filename prefix = run order** within this folder. Run **after** act expansion meets word targets; run **before** polish and compression passes.

See **[../README.md](../README.md)** for the full agent index.

---

## Why this folder exists

Expansion adds beats under word-count pressure. The result is often **correct but over-proven**: the manuscript repeatedly demonstrates ideas the reader already understands. It also adds **fantasy-shaped texture**—invented labels, thematic crowd beats, institutions that behave like the author's map.

Post-expansion agents fix **structure, believability, escalation, voice, and operational world strain** before line-level polish. Polishing scenes that should be merged, cut, or re-mouthed wastes effort.

---

## Final verification *(after 01 → 05)*

After applying all revision agents on an act, perform a **final verification pass** before polish or compression.

**The goal is no longer to improve the chapter.**

**The goal is to determine whether the chapter feels lived rather than designed.**

Ask:

* Does every detail exist for a reason?
* If so, are there any details that exist simply because people are people?
* Does every conversation advance the story?
* If so, is there room for ordinary human interaction?
* Does every observation reinforce theme?
* If so, what observations would this character notice that have nothing to do with the theme?

Do not add filler. Do not add randomness for its own sake. Add only the kinds of details, reactions, interruptions, frustrations, jokes, and mundane concerns that real people would carry through the scene.

**Agent:** **[06-humanity](./06-humanity-agent.md)** — lightweight final pass; restore randomness, not chaos.

---

## Core agent stack *(complete)*

| # | Agent | Asks | Use when |
|---|--------|------|----------|
| **01** | [narrative-density](./01-narrative-density-agent.md) | *Do we need this?* | **First** — remove redundant proof; flag reinvestment sites |
| **02** | [reality](./02-reality-agent.md) | *Would this actually happen?* | **Second** — human/institutional friction; strip synthetic specificity |
| **03** | [consequence](./03-consequence-agent.md) | *What changed because of this?* | **Third** — reinvest cuts with escalation; preserve novel length (~90k–100k) |
| **04** | [character-voice](./04-character-voice-agent.md) | *Could another character say this?* | **Fourth** — distinct mouths; stop author-voice convergence |
| **05** | [world-pressure](./05-world-pressure-agent.md) | *How is the world adapting?* | **Fifth** — operational strain; living system not symbolic backdrop |
| **06** | [humanity](./06-humanity-agent.md) | *Does this feel lived?* | **Sixth** — final verification; restore human randomness after efficiency passes |

**Full stack:** run **01 → 02 → 03 → 04 → 05 → 06** after act expansion.

### Revision effort budget

Sample chapters suggest **density and reinforcement** are the biggest source of the "AI-expanded" feeling:

| Agent | ~Share |
|--------|--------|
| **01-narrative-density** | **50%** |
| **04-character-voice** | **20%** |
| **02**, **03**, **05**, **06** | **~10% each** |

---

## Recommended stack (after expansion)

1. **01-narrative-density** — what stays, what merges, where words can be reinvested  
2. **02-reality** — cognitive cleanup, scene anchors, believable people and systems  
3. **03-consequence** — fill reclaimed space with chain reactions, adaptations, new conflicts  
4. **04-character-voice** — distinct mouths on new and surviving dialogue; observation ownership  
5. **05-world-pressure** — operational strain; shock → adaptation → workarounds → new normal  
6. **06-humanity** — final verification; lived texture; not over-engineered efficiency  
7. Core chain touch-up (**04** direct-camera, **03** flow) on flagged scenes only  
8. [07-scene-compression](../revision/07-scene-compression-agent.md) **last** — lean toward act density targets (~1,600–2,000/ch where applicable); **after** the full post-expansion stack

---

## Not the same as

| Folder | Role |
|--------|------|
| **initial-drafting/** | Default polish chain on chapters that already belong in the book |
| **revision/** | Targeted depth passes (bond, myth, compression); **05** / **08** redirect here to **post-expansion/05** and **02** |
| **post-expansion/** | **Core structural revision stack** after expansion — determines what deserves polish |
