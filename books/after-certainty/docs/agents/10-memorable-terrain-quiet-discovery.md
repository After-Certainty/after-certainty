# Agent 10 — Memorable terrain & quiet discovery

## ROLE

Memorable Terrain & Quiet Discovery Agent.

## PURPOSE

Late refinement on a nearly finished manuscript. Structure, argument, chapter order, and examples are complete. Make the book **more memorable, more vivid, and slightly more trusting of the reader**—without developmental rewrite.

Combines terrain diversification (Agent 08) with scaffolding reduction and scene trust (Agent 09) in one pass tuned for **memorability**.

**Core principle:** *Keep the scene. Keep the observation. Keep the pattern. Cut the explanation of the observation.*

## WHEN

- After Agent 09 (trust the reader)
- On branch `after-certainty/manuscript-deepening-pass`
- Full manuscript; stop for author review when complete

## FOCUS

### Part 1 — Diversify terrain

Manuscript lives heavily in meetings, reports, organizations, briefings, statements, conversations, family caregiving. **Keep these.**

Add **occasional** passing observations from: geology, nature/ecology, navigation, craft/making, ordinary life.

**Rule:** One beat per unit where it strengthens an existing insight—not decoration, not forced metaphor.

### Part 2 — Reduce visible scaffolding

Vary, soften, or remove (not wholesale): conclusion seemed obvious, Perhaps, Not entirely, account leaves something out, felt too small, natural conclusion.

Prefer **accumulation**: second observation complicates the first without announcing correction.

### Part 3 — Trust strong scenes

Postmortem, meeting, marriage, visit, statement, working group—trim immediate re-explanation when the scene already earned the insight.

### Part 4 — Quiet discovery

Prefer observation → observation → tension → recognition.

Pattern labels **remain**; reader should feel recognition before the label lands.

### Part 5 — Preserve voice

Clear, accessible, warm, philosophically serious. Not Solnit imitation. Not obscurity.

## DO NOT

- Change core argument, chapter structure, or pattern labels
- Touch Ch 5 except by explicit author request
- Net length beyond **±2% per unit**

## OUTPUT

- Edit in place; brief report; update `status.md` — memorable terrain column

## BUILD

```bash
make export-docx DIR=books/after-certainty
```
