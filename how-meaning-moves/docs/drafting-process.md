# Drafting Process - How Meaning Moves

## Purpose

Define a repeatable drafting and revision loop that keeps style, structure,
and typography consistent.

## Workflow

1. Draft the target section in sequence.
2. Run rule-alignment check against `docs/book-rules.md`.
3. Run Part I voice alignment check (Chapters 1–3: human-scale, observable, restrained).
4. Run an echo pass to reduce accidental repetition.
5. Run an editorial pass (clarity, sentence flow, paragraph flow).
6. Run vignette emphasis pass (identify narrative scenes and apply `Vignette Block` formatting per `docs/book-rules.md`).
7. Run typography checks using `docs/typography-check.md`.
8. Run bibliography/citation checks using `docs/bibliography-pass.md`.
9. Run linkage check (`index.md` and renamed-path references).
10. Summarize issues and fixes before review.

For fast line-edit sessions, use `docs/quick-pass-card.md` during steps 3-6.

## Editorial pass minimums

- Prefer short, direct sentences.
- Split dense multi-clause lines.
- Keep conceptual claims grounded in observable behavior.
- Keep register observational rather than checklist-driven.
- Keep transitions substance-led.

## Part I voice alignment check (Chapters 1–3)

Before finalizing any chapter pass, verify:

- Prose reads like lived observation, not framework instruction.
- Abstract claims reconnect quickly to recognizable behavior.
- Compression language stays human-scale ("what people decide/assume/settle on"; story/certainty phrasing matches Chapter 2 register).
- Where the chapter touches restraint, moral claims stay grounded in behavior (cost, delay, protection certainty gives) and avoid procedural or philosophy-default wording unless a hinge sentence is intentional.
- Explanatory mechanism is not repeated once reader recognition is established.
- Emotional tone remains calm, serious, and non-performative.
- Paragraph flow favors progression over reiteration.
- Form aligns content where relevant: do not over-totalize; leave interpretive space for the reader when the topic is restraint or unfinished meaning.

## Linkage check minimums

- Confirm `index.md` links resolve to current file names.
- Confirm moved/renamed files have no stale references.
- Confirm docs references (if any) are still correct.

## Bibliography/citation pass minimums

- Use Pandoc footnotes with stable chapter-scoped IDs.
- Keep footnote markers after punctuation where possible.
- Ensure every in-text footnote has a definition and no definition is orphaned.
- Keep `back-matter/bibliography.md` synchronized with cited sources.
- Match bibliography formatting conventions in `docs/bibliography-pass.md`.

## Vignette emphasis pass minimums

- Identify short narrative scenes used to concretize conceptual claims.
- Add a concise heading (`### **Short Title**`) immediately before each scene.
- Wrap scene text in `::: {custom-style="Vignette Block"}` ... `:::` blocks.
- Keep analysis outside vignette blocks.
- Prefer subtle stakes and internal or social cost over spectacle; see `docs/book-rules.md` (Vignettes as calibration).
- Apply consistently across all parts as sections are revised.

## Release-readiness sweep

Before final export/release:

- Run a global echo pass.
- Run `docs/typography-check.md` script across manuscript paths.
- Run `docs/bibliography-pass.md` integrity checks.
- Run reader-facing leakage checks from `docs/reader-facing-scope.md`.
- Reconfirm `index.md` as the canonical reading-order hub.
