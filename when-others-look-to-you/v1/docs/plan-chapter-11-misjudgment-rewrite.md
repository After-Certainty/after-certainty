# Plan: Rewrite Chapter 11 — Why We Misjudge Leaders

Planning note for manuscript work on **branch `plan/chapter-11-misjudgment-rewrite`**. When this ships, update `v1/docs/status.md` if the editorial tracker covers this chapter.

**Manuscript:** `parts/part-4-scale-pressure-misjudgment/chapter-11-why-we-misjudge-leaders.md`

**Upstream / downstream in Part IV:** Chapter 9 sets distance and signal loss; chapter 10 shows pressure and compressed tradeoffs; this chapter shows how those conditions produce repeatable misreads of leadership.

**House style:** Plain speak and typographical conventions in `v1/docs/book-rules.md` and `v1/front-matter/typographical-conventions.md`; vignette and pull-quote rules in `.cursor/rules/when-others-typography.mdc`.

---

## Goal

Rewrite chapter 11 so it follows the established rhythm from chapters 1-10: **start with observation**, then name the pattern.

Open with a short observational setup, then give each core distortion its own vignette:

- **Outcome bias** vignette in a **regional newsroom** domain.
- **Structural blindness** vignette in an **air traffic flow-control** domain.

Keep the prose plain, direct, and concrete.

---

## What chapters 1-10 establish (reference rhythm)

- Lead with something a reader can watch before theory.
- Name terms after the scene has done the first layer of work.
- Keep bridge lines short and observational.
- End with one pull quote that compresses the chapter claim.

Chapter 11 currently names concepts early and runs long conceptual sections before the chapter's strongest concrete material. The rewrite should invert that order.

---

## Current gap

The chapter opens with framework-first sections (`The Judgment Problem`, then definitions of outcome bias and structural blindness) before the reader has a clear scene-level anchor for each distortion. The existing vignette (`The Missed Quarter`) is strong but arrives too late and carries too much load for both distortions.

**Strengths to preserve:** clear definitions, the link to selection pressure, strong tie-back to scale and pressure, and the closing claim that structure matters more than visible outcomes alone.

---

## Proposed chapter arc (structure)

1. **Light observational open (6-10 lines)**
  - Start with a plain observation about how people judge leadership from what is visible first.
  - Keep this concrete and low-jargon; no taxonomy in the first paragraph.
2. **Vignette 1: Outcome bias (new domain: regional newsroom)**
  - Scene focus: one bureau chief gets praised for fast, high-traffic stories; another slows publication for verification and looks weak on visible metrics.
  - Show why visible win/loss signals are thin evidence about decision quality.
3. **Name outcome bias after the scene**
  - Give a short definition and one paragraph of interpretation tied directly to the newsroom scene.
  - Keep "results are noisy" substance, but in plain prose.
4. **Vignette 2: Structural blindness (new domain: air traffic flow-control)**
  - Scene focus: public messaging shows smooth throughput, while controller escalation paths narrow and local hazard reports are filtered before they reach decision authority.
  - Show the gap between polished surface and how influence is actually organized.
5. **Name structural blindness after the scene**
  - Define briefly, then connect to correction channels, dissent costs, and delayed warning movement.
6. **Synthesis section: the two distortions reinforce each other**
  - Show the loop: visible outcomes drive verdicts; hidden structure blocks corrective evidence.
  - Keep this short and cumulative, not a second introduction.
7. **Keep and tighten mid/late sections**
  - Retain: intention trap, confidence effects, selective followership, misjudgment at scale, misjudgment over time, and selection pressure.
  - Trim repeated setup language now handled by the two opening vignettes.
8. **Close with practical read, then pull quote**
  - Keep "what to watch instead" posture, but ensure it reads as observation guidance, not a checklist.
  - Preserve one final pull quote (no bold inside block).

---

## Vignette blueprints (new domains)

### Outcome Bias vignette blueprint (regional newsroom)

- **Pressure context:** election-night reporting cycle with severe time pressure.
- **Visible metric:** story speed and audience reach by deadline.
- **Hidden variable:** verification depth and correction quality.
- **Misread to show:** fastest output is read as strongest leadership, even when avoidable errors rise.
- **Counter-signal:** slower desk catches a high-impact factual error before publication but appears weak on dashboard rankings.

### Structural Blindness vignette blueprint (air traffic flow-control)

- **Pressure context:** severe weather reroutes and constrained airspace.
- **Visible metric:** on-time throughput and public delay numbers.
- **Hidden structure:** local controller hazard flags require multiple approvals before flow-plan changes.
- **Misread to show:** smooth top-line performance is read as healthy leadership while challenge pathways narrow.
- **Correction signal:** near-miss reports appear in logs but do not alter central routing decisions in time.

---

## Drafting guardrails

- Keep sentence length short by default.
- Prefer concrete verbs (`read`, `watch`, `notice`, `shift`, `hold`).
- Avoid checklist voice; keep observational posture.
- Use glossary-bold terms only when they carry structural meaning.
- Keep transitions plain: one clean handoff from chapter 10, one clean handoff to chapter 12.

---

## Mechanical pass (after substantive draft)

- Vignette format: `### **Short Title`** outside `Vignette Block`; no bold inside scene text.
- Pull quote format: no bold inside `Pull Quote Block`.
- Run checks per `v1/docs/typography-check.md`.

---

## Success criteria

- First page gives the reader concrete observation before conceptual naming.
- Outcome bias and structural blindness each have their own vignette.
- New vignette domains are distinct from earlier chapter domains.
- Mid/late sections are tighter because opening scenes carry initial explanatory load.
- The chapter still lands on misjudgment as selection pressure, not only individual error.