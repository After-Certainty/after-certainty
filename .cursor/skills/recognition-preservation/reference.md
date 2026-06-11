# Recognition preservation — reference

## Book

| book_id | BOOK_DIR |
|---------|----------|
| `after-certainty` | `books/after-certainty` |

## Agent spec

`books/after-certainty/docs/agents/03-recognition-preservation.md`

## Prerequisite

Agent 02 complete on same `TARGET_UNIT`.

## Primary questions

1. What recognition is this section trying to produce?
2. Is that recognition clearer than before?
3. Does the pattern feel discovered?
4. Does the chapter still arrive somewhere?
5. Would a reader remember the pattern after finishing?

## Failure modes

| Mode | Fix |
|------|-----|
| Exploration without discovery | Cut aggressively |
| Delayed arrival (too late) | Trim front; restore predictability before pattern |
| Pattern burial | Restore prominence; pattern is destination |
| Repetition through wandering | Remove duplicate examples/questions/observations |
| Loss of compression | Compress paragraphs that survive 30% deletion test |
| Excessive Solnit-ness | Tighten to Kevin's systems-thinker voice |

## Compression test

> If I deleted 30% of the new words, would the insight survive unchanged?

If yes → cut that 30%.

## Pattern prominence examples

| Bad | Good |
|-----|------|
| **Finality Compensates for Uncertainty.** buried mid-essay after long digression | Pattern on its own line after earned buildup; reader remembers it |
| Longer chapter, weaker recall | Recognition deeper; pattern memorable |
| Repeated "Why does this happen?" without new angle | Each paragraph contributes something new |

## Success checklist

- [ ] Recognition clearer and deeper than pre-02
- [ ] Pattern feels discovered and memorable
- [ ] Chapter still arrives somewhere
- [ ] Net word delta ≤~200 above pre-02 baseline (unless recognition clearly deepened)
- [ ] 30% compression test applied
- [ ] Vignette callbacks and chapter openings preserved
- [ ] Bold compression at chapter end intact
- [ ] `status.md` updated (recognition preservation column)

## Build

```bash
make build-book DIR=books/after-certainty
```
