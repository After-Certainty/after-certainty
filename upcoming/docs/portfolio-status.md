# Upcoming nonfiction — portfolio status

Dashboard for eight nonfiction manuscripts under `upcoming/` (Velorum uses a separate fiction doc track).

**Refresh rule:** When a book's `docs/status.md` changes phase or next actions materially, update this table in the same PR.

| Book | Phase | Progress summary | Next action | Status |
|------|-------|------------------|-------------|--------|
| [After Certainty](../after-certainty/) | Phase 4 complete | ~9.7k words; Part I–III cohesion + citations | **Author read-through**; Phase 5 promote prep | [status](../after-certainty/docs/status.md) |
| [Before Certainty Arrives](../before-certainty-arrives/) | Phase 4 complete | ~9.3k words; Ch 8–10 Pandoc footnotes + bibliography | **Author read-through**; Phase 5 promote prep | [status](../before-certainty-arrives/docs/status.md) |
| [When Accountability No Longer Expires](../when-accountability-no-longer-expires/) | Phase 4 complete | ~12.4k words; bridges/interlude continuity; Ch 8–10 cites | **Author read-through**; Phase 5 promote prep | [status](../when-accountability-no-longer-expires/docs/status.md) |
| [When Interpretation No Longer Matters](../when-interpretation-no-longer-matters/) | Phase 2 unit passes | ~13.3k words; Ch 1–13 aligned to index | Glossary + citation pass; Part I–IV coherence gate | [status](../when-interpretation-no-longer-matters/docs/status.md) |
| [When Incentives Become the Moral Language](../when-incentives-become-the-moral-language/) | First draft complete | ~12.5k words; intro + 8 domain chapters in prose | Phase 2 unit passes; author read-through Ch 3–8 | [status](../when-incentives-become-the-moral-language/docs/status.md) |
| [Why Collaboration Is So Hard](../why-collaboration-is-so-hard/) | First draft complete | ~9.3k words; front matter + 14 chapters in prose | Part I read-through; Phase 2 passes; add back matter | [status](../why-collaboration-is-so-hard/docs/status.md) |
| [The Economy We Don't Experience](../the-economy-we-dont-experience/) | First draft complete | ~6.2k words; intro + 8 chapters + back matter | Part I read-through; Phase 2 passes; chapter depth expansion | [status](../the-economy-we-dont-experience/docs/status.md) |
| [The Discipline of Uncertainty](../the-discipline-of-uncertainty/) | First draft complete | ~5.3k words; intro + 12 chapters + conclusion in prose | Part I read-through; Phase 2 passes; chapter depth expansion | [status](../the-discipline-of-uncertainty/docs/status.md) |

## Recommended editorial order

**Completed:** Pass 3 outline expansion (PR #98) — collaboration → economy → discipline, all units outline → prose.

### Pass 4 — Editorial quick wins (closest to Phase 5)

Finish Phase 4 on the mature essay manuscripts; shared branch `upcoming/editorial-quick-wins` is already in use.

1. [after-certainty](../after-certainty/) — Part I–III cohesion, citation pivots, promote prep
2. [before-certainty-arrives](../before-certainty-arrives/) — global copy edit, Ch 8–10 footnotes, bibliography
3. [when-accountability-no-longer-expires](../when-accountability-no-longer-expires/) — bridge/interlude continuity, echo on learning/correction vocabulary

*Gate:* author read-through on each before promotion to `books/`.

### Pass 5 — Mid-pipeline editorial (structure largely stable)

1. [when-interpretation-no-longer-matters](../when-interpretation-no-longer-matters/) — finish Phase 2 (glossary, Pandoc citations), Phase 3 part gates, then Phase 4
2. [when-incentives-become-the-moral-language](../when-incentives-become-the-moral-language/) — Phase 2 unit passes (echo vs Ch 1–2 anchors), editorial + citation at pivots

*Note:* interpretation and incentives share the “judgment / alignment / compression” cluster with after-certainty and economy; run echo checks across them when editing interpretation Part III–IV.

### Pass 6 — Pass 3 follow-through (depth + Phase 2)

First drafts are structurally complete but **well under** book-rules target length (~50–90k). Treat as two sub-tracks per book: **(A)** author Part I read-through + Phase 2 unit passes, **(B)** chapter depth expansion toward target band (prioritize economy and discipline, shortest today).

1. [why-collaboration-is-so-hard](../why-collaboration-is-so-hard/) — Part I voice lock; Phase 2; add conclusion/glossary to `index.md`
2. [the-economy-we-dont-experience](../the-economy-we-dont-experience/) — compression frame in Part I; Phase 2; expand Ch 1–8 depth
3. [the-discipline-of-uncertainty](../the-discipline-of-uncertainty/) — Part I voice lock; Phase 2; expand Ch 1–12 depth

*Cross-book echo:* draft order above; avoid reusing the same flagship cases (pandemic forecasts, ED discharge, tech layoffs) without new angle when expanding.

## Portfolio notes (May 2026)

| Tier | Books | Approx. words | Gap to typical completion band |
|------|-------|---------------|--------------------------------|
| Mature editorial | after-certainty, before-certainty-arrives, accountability | 9–12k each | Moderate expansion or accept essay length |
| Mid draft | interpretation, incentives | 12–13k each | Phase 2–4 before large expansion |
| Pass 3 first draft | collaboration, economy, discipline | 5–9k each | **Largest** — plan explicit depth pass after Part I approval |

## Conventions

- Each book: `docs/book-rules.md`, `docs/drafting-process.md`, `docs/status.md`
- Templates: [`_templates/`](_templates/)
- Promote to `books/` when Phase 5 criteria in each book's `drafting-process.md` are met
