# 3. Public-facing clarity

## Summary

Portfolio copy is generally **clear, non-corporate, and conceptually serious**. Strongest material uses concrete questions and resists hype. Gaps: some `book.description` fields are thin or use “manuscript on…” phrasing; subtitle casing is inconsistent on one upcoming title; the **“When …” title family** burdens discoverability; and several books lack a **how-to-read** page despite dense concepts.

## Evaluation rubric

| Rating | Criteria |
|--------|----------|
| **Strong** | Plain question or stakes in subtitle/description; concrete nouns; no hype; nuance preserved |
| **Adequate** | Clear but generic, short, or slightly abstract; would benefit from one sharper sentence |
| **Gap** | Thin, draft-signaling (“manuscript on…”), or likely confused with sibling title |

## Published books

| Book | Title / subtitle | `book.description` | Index hub | Overall |
|------|------------------|---------------------|-----------|---------|
| coupling | Strong | Strong — framework, cohesion, accountability | Adequate — “manuscript hub” writer tone in index | **Strong** |
| curiosity-before-certainty | Strong | Strong — curiosity as posture | Adequate | **Strong** |
| how-meaning-moves | Strong | Strong — signal, compression, restraint | Adequate | **Strong** |
| how-serious-systems-learn | Strong | Strong — handbook framing | Strong — inline “Reader’s Use” | **Strong** |
| when-authority-is-misread | Strong | Strong — confidence vs legitimacy | Adequate — minimal hub | **Strong** |
| when-authority-outlives-accountability | Strong | Strong — gap after erosion | Adequate | **Strong** |
| when-moral-seriousness-scales | Strong | Strong — scale, distance, pressure | Adequate | **Strong** |
| when-others-look-to-you v1 | Strong | Strong — field guide, renewal/erosion | Strong — full parts TOC | **Strong** |
| when-others-look-to-you v2 | Strong | Strong — companion edition named | Adequate — glossary deferred note | **Adequate** |

**Published gap:** `how-serious-systems-learn` ships with `title_page_footer: "Draft manuscript for editorial development."` — contradicts published status for readers who open generated title pages.

## Upcoming nonfiction

| Book | Title / subtitle | `book.description` | Onboarding | Overall |
|------|------------------|---------------------|------------|---------|
| before-certainty-arrives | Strong | Strong | Strong — how-to-read-this-history | **Strong** |
| when-accountability-no-longer-expires | Strong | **Gap** — “A manuscript on durable accountability…” | Strong — preface resists villain frame | **Adequate** |
| when-interpretation-no-longer-matters | Strong | **Gap** — “A manuscript on meaning collapse…” | Strong — how-to-read + preface | **Adequate** |
| when-incentives-become-the-moral-language | Strong | Adequate — short; could name eight domains | Strong — interlude bounds scope | **Adequate** |
| the-economy-we-dont-experience | Strong | Strong — credibility + leadership | Adequate — intro-led | **Strong** |
| why-collaboration-is-so-hard | Strong | Adequate — coordination/trust list; subtitle lowercase “And” | Strong — three front-matter framers | **Adequate** |
| the-discipline-of-uncertainty | **Adequate** — subtitle uses lowercase “restraint” vs title case elsewhere | Adequate — repeats subtitle | Adequate — intro only | **Adequate** |
| after-certainty | Strong | Adequate — broad “exploring meaning, trust…” | Adequate — introduction; no how-to-read | **Adequate** |

## Voice assessment (spot-check)

**Exemplar — strong Feynman-style clarity without dilution**

From *When Accountability No Longer Expires* preface framing (conceptual accessibility, resists bad-intent diagnosis):

- Stakes are named as **moral persistence under pressure**, not scandal entertainment.
- Reader is invited to recognize institutions that survive outrage—concrete, not abstract moralizing.

**Exemplar — bounded scope (anti-hype)**

From *When Incentives Become the Moral Language* interlude (`front-matter/interlude-what-this-book-is-not.md`):

- Explicitly not anti-metrics or anti-capitalism polemic—reduces generic self-help mis-shelving.

**Flag — draft signaling in metadata**

| Field | Book | Issue |
|-------|------|-------|
| `book.description` | when-interpretation-no-longer-matters | “A manuscript on…” reads as internal status, not reader promise |
| `book.description` | when-accountability-no-longer-expires | Same |
| `title_page_footer` | how-serious-systems-learn (published) | “Draft manuscript…” |

**Recommendation:** Replace “A manuscript on…” with present-tense reader promises (see [05-recommendations.md](05-recommendations.md)).

## Title family confusion

Readers searching the catalog face **seven “When …”** published/upcoming titles plus **Before/After Certainty**. Clarity fix is **structural** (series guide, related books), not renaming books in this audit.

## Onboarding language inventory

| Mechanism | Books with | Books without |
|-----------|------------|---------------|
| How to read (dedicated page) | how-meaning-moves, when-authority-outlives, interpretation, before-certainty-arrives | Most authority/certainty/upcoming except above |
| Reader guide / Reader’s Use | how-serious-systems-learn | — |
| What-this-book-is / scope interlude | collaboration, incentives | — |
| Author’s note | Most published + several upcoming | how-serious-systems-learn |
| Typographical conventions | coupling, when-others v1 | Others |

## SEO / readability notes

- **Summaries for search** should come from `book.description` (manifest + site); index hubs are not optimized (no meta descriptions in Markdown).
- **Consistent subtitle casing** helps SERP presentation—normalize discipline subtitle to title case in `book.yml` only.
- **Avoid repetitive openings** (“This book examines…”) across descriptions—vary with a question or stakes sentence per [02-conceptual-differentiation.md](02-conceptual-differentiation.md) discriminators.

## What to avoid (per issue #99)

Observed compliance is good: little corporate jargon, no generic motivational promises, no obvious AI-template phrasing in `book.yml` descriptions. Continue to guard against **“manuscript on”** and **checklist voice** in future reader-facing front matter.
