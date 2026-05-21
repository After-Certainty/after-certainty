# Upcoming nonfiction — portfolio status

Dashboard for eight nonfiction manuscripts under `upcoming/` (Velorum uses a separate fiction doc track). Three Tier A titles are **Phase 5** in `books/` (see table); this dashboard still lists all eight for editorial tracking.

**Refresh rule:** When a book's `docs/status.md` changes phase or next actions materially, update this table in the same PR.

**Portfolio audit (May 2026):** [docs/portfolio-audit/](../../docs/portfolio-audit/) — promotion readiness, differentiation, and follow-up backlog ([#99](https://github.com/ksteffe/after-certainty/issues/99)).

**Series guide:** [docs/series-guide.md](../../docs/series-guide.md) — reading order, clusters, and title-pair boundaries.

**Reader map:** [docs/portfolio-reader-map.md](../../docs/portfolio-reader-map.md) — onboarding and overlap disambiguation.

| Book | Phase | Progress summary | Next action | Status |
|------|-------|------------------|-------------|--------|
| [After Certainty](../../books/after-certainty/) | **Phase 5** (essay) | ~9.7k words; promoted to `books/` | Export smoke test; [author gate](../../books/after-certainty/docs/author-read-through-gate.md) sign-off | [status](../../books/after-certainty/docs/status.md) |
| [Before Certainty Arrives](../../books/before-certainty-arrives/) | **Phase 5** (essay) | ~9.3k words; promoted to `books/` | Export smoke test; [author gate](../../books/before-certainty-arrives/docs/author-read-through-gate.md) sign-off | [status](../../books/before-certainty-arrives/docs/status.md) |
| [When Accountability No Longer Expires](../../books/when-accountability-no-longer-expires/) | **Phase 5** (essay) | ~12.4k words; promoted to `books/` | Export smoke test; [author gate](../../books/when-accountability-no-longer-expires/docs/author-read-through-gate.md) sign-off | [status](../../books/when-accountability-no-longer-expires/docs/status.md) |
| [When Interpretation No Longer Matters](../when-interpretation-no-longer-matters/) | Phase 4 complete | ~13.4k words; Parts I–IV coherence; glossary + footnotes Ch 1–13 | Author read-through Parts III–IV; expansion band decision | [status](../when-interpretation-no-longer-matters/docs/status.md) |
| [When Incentives Become the Moral Language](../when-incentives-become-the-moral-language/) | Phase 2 complete | ~8.4k words; intro + 8 domain chapters; Ch 1–2 anchor footnotes | Phase 3 part gate; author read-through Ch 3–8 | [status](../when-incentives-become-the-moral-language/docs/status.md) |
| [Why Collaboration Is So Hard](../why-collaboration-is-so-hard/) | Phase 2 — Part I complete | ~10.8k words; front matter + Part I depth pass | Part I author read-through; Phase 2 Parts II–IV | [status](../why-collaboration-is-so-hard/docs/status.md) |
| [The Economy We Don't Experience](../the-economy-we-dont-experience/) | Phase 2 in progress | ~7.4k words; intro + Ch 1–8 + conclusion; compression frame | Part I author read-through; Ch 2–3 footnote verify | [status](../the-economy-we-dont-experience/docs/status.md) |
| [The Discipline of Uncertainty](../the-discipline-of-uncertainty/) | Phase 2 — Part I depth complete | ~7.5k words; intro + Ch 1–12 + conclusion | Part I author read-through; Part II–VI echo pass | [status](../the-discipline-of-uncertainty/docs/status.md) |

## Judgment / alignment / compression cluster

These four upcoming titles share vocabulary (compression, alignment, judgment) but serve different questions. Use this map before public promotion or cross-linking:

| Book | Role in cluster |
|------|-----------------|
| [When Interpretation No Longer Matters](../when-interpretation-no-longer-matters/) | Authority types when public understanding collapses |
| [When Incentives Become the Moral Language](../when-incentives-become-the-moral-language/) | Eight domains where metrics replaced judgment |
| [The Economy We Don't Experience](../the-economy-we-dont-experience/) | Lived economy vs aggregate narrative; credibility under pressure |
| [After Certainty](../../books/after-certainty/) | Practice capstone—how to live and judge after frameworks fail |

Echo checks: interpretation Part III–IV pass docs; incentives interlude; economy compression invariant.

## Recommended editorial order

**Completed:** Pass 3 outline expansion (PR #98) — collaboration → economy → discipline, all units outline → prose.

### Pass 4 — Editorial quick wins ✓ (Phase 5 promote)

1. [after-certainty](../../books/after-certainty/) — promoted (essay edition)
2. [before-certainty-arrives](../../books/before-certainty-arrives/) — promoted (essay edition)
3. [when-accountability-no-longer-expires](../../books/when-accountability-no-longer-expires/) — promoted (essay edition)

*Gate:* author read-through sign-off on each ([author gate](../../books/after-certainty/docs/author-read-through-gate.md) docs).

**Completed:** Pass 5 mid-pipeline editorial — interpretation Phase 2–4; incentives Phase 2 + Pandoc citations.

### Pass 5 — Mid-pipeline editorial (structure largely stable) ✓

*Note:* interpretation and incentives share the “judgment / alignment / compression” cluster with after-certainty and economy; echo checks logged in interpretation Part III–IV pass docs.

**Completed:** Pass 6 depth + Phase 2 (Part I) — collaboration (~10.8k), economy (~7.4k), discipline (~7.5k). **Gate:** author Part I read-through before next large expansion toward book-rules bands.

### Pass 6 — Pass 3 follow-through (depth + Phase 2) ✓

Incremental depth pass delivered; full ~50–90k bands remain future work after author Part I approval.

*Cross-book echo:* flagship cases (pandemic forecasts, ED discharge, tech layoffs) avoided or reframed in new Part I material.

## Portfolio notes (May 2026)

| Tier | Books | Approx. words | Gap to typical completion band |
|------|-------|---------------|--------------------------------|
| Promoted (essay) | after-certainty, before-certainty-arrives, accountability | 9–12k each | In `books/`; author gate sign-off + export smoke test |
| Mid editorial | interpretation | ~13k | Phase 4 done; author gate + expansion decision |
| Mid draft | incentives | ~8k | Phase 3–4 before large expansion |
| Pass 3 / Phase 2 | collaboration, economy, discipline | 7–11k each | **Largest** — author Part I gate before expansion |

## Conventions

- Each book: `docs/book-rules.md`, `docs/drafting-process.md`, `docs/status.md`
- Templates: [`_templates/`](_templates/)
- Promote to `books/` when Phase 5 criteria in each book's `drafting-process.md` are met
