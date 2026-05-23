# Before Certainty Arrives — Editorial Passes

Focused editing workflow for the editorial grounding branch. One pass at a time; complete scope before starting the next.

## How to use

- Pick scope: single chapter, one part, or full manuscript.
- Run one pass only.
- Update [`grounding-pass-checklist.md`](grounding-pass-checklist.md) as units complete.
- Do not mix passes (no rhythm edits during anchor pass).

## Pass order (grounding branch)

1. **Historical grounding anchors** — 1–3 concrete anchors per chapter (50–120 words each); footnoted.
2. **Chapter identity** — Sharpen central transformation; reduce Ch 2–4 and Ch 9–10 overlap.
3. **Prose rhythm** — Break uniform cadence in ≥3 chapters; expectation reversals; asymmetric openings.
4. **Pattern embodiment** — Intro three patterns; ≤1 bold surfacing per chapter when earned; motif callbacks.
5. **Escalation / repetition** — Cut or deepen recurring phrases; attach new historical consequence.
6. **Citations** — Footnotes + bibliography sync.
7. **Export** — `make build-book`; word count; author gate checklist.

## Pass 1 — Historical grounding anchors

**Goal:** Historical friction without pop-history length.

Check for:

- 1–3 anchors per chapter inline in prose
- Specific place, object, or practice (stele, scriptorium, punch clock)
- Footnote for verifiable claims
- Anchor serves chapter identity and dominant pattern

Edit moves:

- Insert 50–120 word anchor after structural claim or before section break
- Prefer material objects (stone code, census tablet, factory bell)

## Pass 2 — Chapter identity

**Goal:** Each chapter has one unmistakable transformation.

Check for:

- Ch 4 = authority without presence / action–consequence distance
- Ch 6 = material permanence (stone → scroll → archive → office)
- Ch 2 = coordination geometry; Ch 3 = legitimacy transfer
- Ch 9 = procedure; Ch 10 = saturation without re-explaining industry

## Pass 3 — Prose rhythm

**Goal:** Reduce metabolic exhaustion from uniform abstraction.

Check for:

- At least Ch 4, 6, 9 break default opening cadence
- 1–2 expectation-reversal lines per chapter (model: Ch 7 "Collapse does not create openness")
- One short rupturing sentence after long explanatory paragraph
- Trailing `\` line breaks removed in revised prose

## Pass 4 — Pattern embodiment

**Goal:** Memory scaffold without academic framing.

Check for:

- Introduction: quiet three-pattern block; one scaffold (not parallel lists)
- Dominant pattern per chapter (see [`pattern-language.md`](pattern-language.md))
- ≤1 bold pattern surfacing per chapter, prose-first
- Ch 4, 6, 9: action/consequence distance callback in closing bridge
- Conclusion: Pattern 3 recognition + deliberate stop

Avoid:

- Fourth named pattern
- Pattern headers per chapter
- Excessive capitalization

## Pass 5 — Escalation

**Goal:** Advance, don't restate.

Watch phrases:

- "certainty compresses ambiguity"
- "coordination under scale"
- "tools outlive conditions"
- "stabilization under pressure"

Focus: Ch 2–4, 9–10.

## Pass 6 — Citations

- `[^cN-slug]` chapter-scoped IDs
- Every new source in `back-matter/bibliography.md`
- No fabricated references

## Pass 7 — Export

```bash
make build-book DIR=books/before-certainty-arrives
make validate-book-specs
```

Update `status.md` word count; refresh `author-read-through-gate.md` checklist.

## References

- [`book-rules.md`](book-rules.md)
- [`pattern-language.md`](pattern-language.md)
- [`beta-reader-feedback-editorial-2026.md`](beta-reader-feedback-editorial-2026.md)
- [`grounding-pass-checklist.md`](grounding-pass-checklist.md)
