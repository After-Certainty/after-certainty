# After Certainty — agent specs

**Ten revision agents** for the manuscript. Copy a spec into a Cursor agent prompt with the **target unit file** and linked docs, or use a pipeline template.

**Default (current phase):** run **[10](./10-memorable-terrain-quiet-discovery.md)** memorable terrain & quiet discovery (after Agent 09).

**Prior passes:** **[01](./01-essay-discovery-revision.md)** essay discovery; **[02](./02-curiosity-expansion.md)** + **[03](./03-recognition-preservation.md)** curiosity + recognition; **[04](./04-experience-deepening-v2.md)** experience deepening v2; **[05](./05-terrain-voice-diversity.md)** terrain & voice diversity; **[06](./06-terrain-thematic-deepening.md)** terrain thematic deepening; **[07](./07-echo-pass.md)** echo pass.

**House rules (agents do not override):**  
[`docs/book-rules.md`](../book-rules.md) → [`docs/drafting-process.md`](../drafting-process.md) → [`index.md`](../../index.md)

---

## Core invariant (carry on every pass)

> Understanding alone cannot settle how to live, judge, or act. What remains practicable is judgment without finality, responsibility without control, and speech that does less harm—under limits we cannot remove.

**Core mantra for agents 02–03:** *Expand the investigation. Earn the pattern. Preserve recognition.*

**Core mantra for agent 04:** *Recognition before explanation. Experience carries the philosophy.*

**Core mantra for agent 05:** *Preserve the insight. Vary the terrain.*

**Core mantra for agent 06:** *Discover the pattern in the terrain. Do not decorate the argument with it.*

**Core mantra for agent 07:** *Assign ownership. Point, don't repeat.*

**Core mantra for agent 08:** *Jazz variation, not elimination. Discover in terrain, do not decorate.*

**Core mantra for agent 09:** *Keep the scene. Keep the observation. Remove the explanation of the observation.*

**Core mantra for agent 10:** *Keep the scene. Keep the observation. Keep the pattern. Cut the explanation of the observation.*

---

## Agents

| # | Agent | Responsibility |
|---|--------|----------------|
| **01** | [Essay discovery revision](./01-essay-discovery-revision.md) | *(complete)* Reorder openings for discovery; surgical pass (~20% more discovery) |
| **02** | [Curiosity expansion](./02-curiosity-expansion.md) | *(complete)* Expand intellectual wandering between interesting questions and their answers |
| **03** | [Recognition preservation](./03-recognition-preservation.md) | *(complete)* Protect recognitions and pattern prominence; compress over-expansion without cutting earned investigation |
| **04** | [Experience deepening v2](./04-experience-deepening-v2.md) | *(complete)* Transform abstract argument into lived recognition before patterns land |
| **05** | [Terrain & voice diversity](./05-terrain-voice-diversity.md) | *(complete)* Enrich examples, inquiry pivots, and texture without changing structure or arguments |
| **06** | [Terrain thematic deepening](./06-terrain-thematic-deepening.md) | *(complete)* Place each unit in theme-native terrain; discover patterns, do not decorate |
| **07** | [Echo pass](./07-echo-pass.md) | *(complete)* Resolve within-book and cluster repetition; assign ownership across manuscript |
| **08** | [Terrain & variety](./08-terrain-variety.md) | *(complete)* Late polish: passing terrain, rhetorical variation, Ch 7–9 de-abstraction |
| **09** | [Trust the reader](./09-trust-the-reader.md) | *(complete)* Reduce scaffolding; trust scenes; preserve pattern labels |
| **10** | [Memorable terrain & quiet discovery](./10-memorable-terrain-quiet-discovery.md) | Terrain diversity + memorability + quiet discovery |

**Pipeline per unit:** 02 → 03 → 04 → author lock → 05 → 06 → **07** → **08** → **09** → **10** → export.

**Agent 08 core principle:** Polish only; no developmental rewrite; priority Ch 7–9.

---

## Unit order (reading order)

Work **one file per agent session** unless author requests a batch. **Stop for author review** after each unit.

| # | Unit | Path |
|---|------|------|
| — | Introduction | `front-matter/introduction.md` |
| — | Part I bridge | `parts/part-1-letting-go/bridge.md` |
| 1 | Ch 1 — The End of Correctness | `parts/part-1-letting-go/chapter-1-the-end-of-correctness.md` |
| 2 | Ch 2 — The Cost of Explanation | `parts/part-1-letting-go/chapter-2-the-cost-of-explanation.md` |
| 3 | Ch 3 — Releasing Heroes and Villains | `parts/part-1-letting-go/chapter-3-releasing-heroes-and-villains.md` |
| — | Part II bridge | `parts/part-2-what-can-still-be-practiced/bridge.md` |
| 4 | Ch 4 — Judgment Without Finality | `parts/part-2-what-can-still-be-practiced/chapter-4-judgment-without-finality.md` |
| 5 | Ch 5 — Responsibility Without Control | `parts/part-2-what-can-still-be-practiced/chapter-5-responsibility-without-control.md` |
| 6 | Ch 6 — Speech That Does Less Harm | `parts/part-2-what-can-still-be-practiced/chapter-6-speech-that-does-less-harm.md` |
| — | Part III bridge | `parts/part-3-living-with-limits/bridge.md` |
| 7 | Ch 7 — The Discipline of Not Knowing | `parts/part-3-living-with-limits/chapter-7-the-discipline-of-not-knowing.md` |
| 8 | Ch 8 — Staying Human at Scale | `parts/part-3-living-with-limits/chapter-8-staying-human-at-scale.md` |
| 9 | Ch 9 — When to Stop Interpreting | `parts/part-3-living-with-limits/chapter-9-when-to-stop-interpreting.md` |
| — | Conclusion | `back-matter/conclusion-enough.md` |

**Out of scope for Agent 06:** generated title/copyright, `how-to-read-this-book.md` (unless requested), appendix, bibliography.

**Branch naming:** `after-certainty/manuscript-deepening-pass` (Agents 04–07 since PR #188)

**Status:** Update [`docs/status.md`](../status.md) when a unit finishes Agent 06.

**Validate:**

```bash
make build-book DIR=books/after-certainty
```

---

## Cluster echo (sibling books)

When revising, avoid re-teaching diagnostic mechanisms from sibling volumes. This book's distinct lens: **practice capstone** — how to live and judge after diagnosis.

Skim for overlap with:

- [`books/how-meaning-moves/`](../../../how-meaning-moves/) — signal/compression/restraint
- [`books/when-interpretation-no-longer-matters/`](../../../when-interpretation-no-longer-matters/) — authority after interpretation fails
- [`books/when-incentives-become-the-moral-language/`](../../../when-incentives-become-the-moral-language/) — metrics replacing judgment

---

## Files

| # | File |
|---|------|
| **01** | `01-essay-discovery-revision.md` |
| **02** | `02-curiosity-expansion.md` |
| **03** | `03-recognition-preservation.md` |
| **04** | `04-experience-deepening-v2.md` |
| **05** | `05-terrain-voice-diversity.md` |
| **06** | `06-terrain-thematic-deepening.md` |
| **07** | `07-echo-pass.md` |
| — | `chapter-pipeline.md` |
| — | `experience-deepening-pipeline.md` |
| — | `terrain-voice-diversity-pipeline.md` |
| — | `terrain-thematic-deepening-pipeline.md` |
| — | `echo-pass-pipeline.md` |
| — | `terrain-variety-pipeline.md` |
| — | `trust-the-reader-pipeline.md` |
| — | `memorable-terrain-quiet-discovery-pipeline.md` |
