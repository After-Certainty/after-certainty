# Essay discovery revision — reference

## Book

| book_id | BOOK_DIR |
|---------|----------|
| `after-certainty` | `books/after-certainty` |

## Agent spec

`books/after-certainty/docs/agents/01-essay-discovery-revision.md`

## Unit order

| # | Unit | Path |
|---|------|------|
| — | Introduction | `front-matter/introduction.md` |
| 1 | Ch 1 | `parts/part-1-letting-go/chapter-1-the-end-of-correctness.md` |
| 2 | Ch 2 | `parts/part-1-letting-go/chapter-2-the-cost-of-explanation.md` |
| 3 | Ch 3 | `parts/part-1-letting-go/chapter-3-releasing-heroes-and-villains.md` |
| 4 | Ch 4 | `parts/part-2-what-can-still-be-practiced/chapter-4-judgment-without-finality.md` |
| 5 | Ch 5 | `parts/part-2-what-can-still-be-practiced/chapter-5-responsibility-without-control.md` |
| 6 | Ch 6 | `parts/part-2-what-can-still-be-practiced/chapter-6-speech-that-does-less-harm.md` |
| 7 | Ch 7 | `parts/part-3-living-with-limits/chapter-7-the-discipline-of-not-knowing.md` |
| 8 | Ch 8 | `parts/part-3-living-with-limits/chapter-8-staying-human-at-scale.md` |
| 9 | Ch 9 | `parts/part-3-living-with-limits/chapter-9-when-to-stop-interpreting.md` |
| — | Conclusion | `back-matter/conclusion-enough.md` |

## Example invocations

```text
Run essay-discovery-revision on books/after-certainty/front-matter/introduction.md
```

```text
Run essay-discovery-revision on the next incomplete unit in status.md
```

## Good vs bad overcorrection (Ch 1)

| Bad | Good |
|-----|------|
| "One autumn morning I watched leaves fall from an elm tree…" + five paragraphs of literary wandering | Move existing meeting vignette earlier; 3–4 paragraphs of reflection; then "Correctness feels like safety." |
| Ending loses `**Correctness Hardens Into Identity.**` | Bold compression at chapter end unchanged in meaning and placement |

## Success checklist

- [ ] Opening: inquiry before thesis (3–4 paragraphs concrete entry, not literary drift)
- [ ] Ending: bold compression line still lands
- [ ] Magnitude: mostly reorder + light front-load, not rewrite
- [ ] Voice: systems thinker, not memoir or literary essayist
- [ ] Core invariant preserved
- [ ] Word delta ~0–150 (hard cap ~300)
- [ ] `status.md` updated
- [ ] `make build-book DIR=books/after-certainty` passes (when run)

## Build

```bash
make build-book DIR=books/after-certainty
```
