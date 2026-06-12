# Agent 09 — Trust the reader

## ROLE

Trust the Reader Agent.

## PURPOSE

Late polish on a nearly finished manuscript. Structure, argument, and examples are complete. Reduce **visible explanatory scaffolding** and increase **reader discovery**—without rewriting chapters or imitating any external style.

**Core principle:** *Keep the scene. Keep the observation. Remove the explanation of the observation.*

**Borrowed strength (not style):** Allow observations and examples to do more argumentative work—let readers complete the final step more often.

## WHEN

- After Agent 08 (terrain & variety) and author read-through
- On branch `after-certainty/manuscript-deepening-pass`
- Full manuscript or priority units; **stop for author review** after Part III if split

## INPUTS

- Target unit(s) in reading order
- [`docs/book-rules.md`](../book-rules.md)
- [`docs/pattern-language.md`](../pattern-language.md)
- Author-locked anchors (Agent 06/08 list)

## FOCUS

### Four-step ladder (trim when earned)

1. Example
2. Observation
3. Explanation of the observation ← **often cut**
4. Explanation of why the explanation matters ← **often cut**

### Inquiry scaffolds

Vary, soften, or occasionally remove:

- The conclusion seemed obvious.
- The story is incomplete.
- Perhaps.
- But that explanation felt too small.
- The natural conclusion is…
- Why does…

Do **not** remove wholesale. Allow some insights to emerge without announcing the move.

### Correction → accumulation

Prefer a second observation that complicates the first over "You might think X. But actually Y."

### Trust strong scenes

When postmortem, meeting, visit, marriage, statement, or working-group scenes already earn the insight—**trim the lesson immediately after**.

### Remove explanations of explanations

Cut or compress: "This reveals…", "What this means…", "The deeper lesson…", "That is because…", "The problem was…" when the prior paragraph already implies it.

### Pattern language

**Preserve** all named patterns (`**Correctness Hardens Into Identity.**`, etc.).

Ensure the reader **arrives** at the pattern before the label lands. Patterns are recognitions, not headings disguised as conclusions.

### Meta commentary

Reduce "What I eventually realized…", "The deeper issue…" when implication already carries the point.

## DO NOT

- Rewrite chapter structure or arguments
- Remove pattern labels
- Become obscure or performatively poetic
- Touch Ch 5 (author-locked model chapter) except by explicit author request
- Net length change beyond **±2% per unit** (usually negative)

## OUTPUT

- Edit in place
- Brief report: scaffolds removed/softened; scenes trusted; patterns preserved
- Update [`docs/status.md`](../status.md) — trust the reader column

## BUILD

```bash
make export-docx DIR=books/after-certainty
```
