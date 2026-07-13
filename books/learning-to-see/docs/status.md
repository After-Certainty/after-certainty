# Learning to See — Drafting Status

## Current phase

**Phase 5 — Promoted to `books/`** (exports enabled; smoke test complete July 2026). See [`phase-5-promotion.md`](phase-5-promotion.md).

## Active branch

`cursor/learning-to-see-draft-cc77` (Phases 0–5)

## Manuscript hub

[`index.md`](../index.md) is the source of truth for reading order and paths.

## Key docs

- [`outline.md`](outline.md) — canonical structural authority (titles synced with index)
- [`book-rules.md`](book-rules.md)
- [`comparative-map.md`](comparative-map.md)
- [`open-questions.md`](open-questions.md)
- [`drafting-process.md`](drafting-process.md)
- [`phase-3-coherence-gates.md`](phase-3-coherence-gates.md)
- [`phase-4-editorial.md`](phase-4-editorial.md)
- [`phase-5-promotion.md`](phase-5-promotion.md)
- [`sensitivity-review.md`](sensitivity-review.md)
- Portfolio rollup: promoted — see [series guide](../../../docs/series-guide.md)

## Unit progress

| Unit | Phase | Notes |
|------|-------|-------|
| Introduction — Learning to See | approved | Phase 5 promote |
| Chapter 1 — The Experiment I Had Never Tried | approved | LDS doorway; Moroni 10 + sediment + AI companion footnotes |
| Chapter 2 — Answers Are Not Enough | approved | Bias/formation (Kahneman, Mercier & Sperber); epistemic spirituality footnote |
| Chapter 3 — The Limits of Seeing Alone | approved | Kahan; Talmud (Eruvin 13b) |
| Chapter 4 — What Attention Makes Visible | approved | James, Berger |
| Chapter 5 — When Being Wrong Becomes Expensive | approved | Popper, Tetlock, Soloveitchik + confession primaries |
| Chapter 6 — Seeing Together | approved | Follett, Janis (groupthink) |
| Chapter 7 — Memory, Ritual, and Tradition | approved | Loftus, Yerushalmi, Haggadah |
| Chapter 8 — Conflict, Confession, and Repair | approved | Zehr, Tutu, Bonhoeffer, Hayner |
| Chapter 9 — Suffering, Meaning, and Moral Imagination | approved | Alter/Sweeney (Job), Didion, Kleinman |
| Part II bridge — What Traditions Carry | approved | |
| Chapter 10 — Cultural Sediment | approved | LDS/LIS hypothesis; Kuhn (paradigm persistence) |
| Chapter 11 — Archaeology Without Contempt | approved | MacIntyre (traditioned reason) |
| Chapter 12 — Integration Without Reduction | approved | Phase 4: experiment recap compressed |
| Part III bridge — The Next Scarcity | approved | |
| Chapter 13 — When Intelligence Becomes Cheap | approved | AI callback; Bender et al., Mitchell et al.; Ch 1 AI disclosure |
| Chapter 14 — Ancient Practices, Future Problems | approved | Phase 4: closing compressed |
| Part IV bridge | — | None; Ch 14 → epilogue |
| Epilogue — Becoming Better Knowers | approved | Phase 4: experiment recap compressed |

**Phase column values:** `reviewed` = agent Phase 2–4 passes complete. `approved` = promoted to `books/` with exports enabled.

## Next actions

1. **Author read-through** sign-off on full manuscript (optional before public release).
2. **Export smoke test** — `make build-book DIR=books/learning-to-see FORMATS="docx epub pdf"` (run in CI on merge).
3. Optional live expert review per [`sensitivity-review.md`](sensitivity-review.md) before publication.

## Exports

`book.yml` has docx, epub, and pdf enabled with `publishing.enabled: true` and GitHub release artifacts.

```bash
make validate-book-specs
make build-book DIR=books/learning-to-see FORMATS="docx epub pdf"
```

## Cover assets

- `book-cover.png` — cover art
- `open-graph.png` — generated via `tools/generate_open_graph.py` + `open-graph.config.yml`

## Open decisions / known issues

- See [`open-questions.md`](open-questions.md) and [`sensitivity-review.md`](sensitivity-review.md).
- Subtitle: *Why Humanity Keeps Rediscovering Practices of Wisdom* (matches cover)

## Rough scale

- Manuscript words (target): ~55,000–70,000
- Current manuscript words: complete draft (Intro + Ch 1–14 + 3 bridges + epilogue)
