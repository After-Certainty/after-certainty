# Portfolio Promotion Readiness Audit

**Date:** 2026-05-21  
**Scope:** Published manuscripts (`books/`), upcoming nonfiction (`upcoming/`), shared metadata and semantic layer, reader onboarding paths  
**Coordination hub:** [`upcoming/docs/portfolio-status.md`](../../upcoming/docs/portfolio-status.md)  
**Issue:** [#99 — Portfolio promotion readiness audit](https://github.com/After-Certainty/after-certainty/issues/99)

This audit evaluates discoverability, conceptual clarity, differentiation, onboarding, metadata consistency, and promotion readiness. It does **not** recommend broad manuscript rewrites. Cross-book coherence is treated as a primary constraint.

---

## Executive summary

The **After Certainty** repository is a mature multi-book publishing monorepo with a working CI export pipeline, consistent `book.yml` metadata for all 18 titled works, and a strong internal editorial dashboard for upcoming nonfiction. **Promotion readiness is bifurcated:**

| Segment | State |
|---------|--------|
| **Published cluster** | Seven titles export through CI; four have commerce links; WOLTY v1 is the most promotion-complete (ISBN, media, companion wiring). Coupling awaits PR merge; How Serious Systems Learn carries an explicit draft footer. |
| **Upcoming — promote next** | Three essay-scale manuscripts (After Certainty, Before Certainty Arrives, When Accountability No Longer Expires) are at **Phase 4** and blocked only on **author read-through** before Phase 5 promotion to `books/`. |
| **Upcoming — mid/early** | Five titles remain at 7–13k words against 50–110k book-rules bands; interpretation is Phase 4-complete but portfolio dashboard was stale. |
| **Fiction** | Velorum has 30 chapter files but an Act I–only `index.md`; separate from nonfiction promote path. |

**Highest-leverage gaps (portfolio-wide):**

1. No reader-facing **portfolio map** or suggested reading order at repo root.
2. Root `README.md` lists Velorum from `upcoming/` but omits the eight nonfiction upcoming titles.
3. `upcoming/docs/portfolio-status.md` word counts and phases had drifted from per-book `docs/status.md` (corrected in PR for this audit).
4. Thematic overlap risks in the **certainty / judgment / interpretation / incentives** cluster without explicit positioning copy for new readers.
5. Upcoming nonfiction `book.yml` files omit `author.website` (published books use `https://after-certainty.com`).

---

## 1. Portfolio structure

### Organization

```
after-certainty/
├── books/          # Publish-enabled manuscripts (CI exports)
├── upcoming/       # In-progress nonfiction + Velorum (exports disabled)
├── upcoming/docs/  # Portfolio dashboard, templates
├── semantic/       # Glossary, patterns, ontology, sources (CI manifest)
├── scripts/        # Shared build/export pipeline
└── schema/         # book.yml validation
```

**Strengths**

- Clear separation between **pipeline-ready** (`books/`) and **editorial-in-progress** (`upcoming/`).
- Each upcoming nonfiction title follows `docs/book-rules.md`, `docs/drafting-process.md`, `docs/status.md`.
- [`upcoming/docs/portfolio-status.md`](../../upcoming/docs/portfolio-status.md) provides editorial tiers and recommended pass order.
- CI rebuilds affected books on change; semantic YAML is verified in workflow.

**Friction**

| Issue | Impact |
|-------|--------|
| Issue #99 cites `upcoming/portfolio-status.md` | Wrong path; actual file is `upcoming/docs/portfolio-status.md`. Redirect stub added. |
| Root README book table | Lists 9 published + Velorum only; upcoming nonfiction invisible to GitHub visitors. |
| No `docs/portfolio-reader-map.md` until this audit PR | New readers lack “start here” and series coherence narrative. |
| Velorum excluded from portfolio-status table | Fiction track undocumented in nonfiction dashboard (intentional but splits discoverability). |
| WOLTY v1 + v2 as separate pipeline folders | Correct technically; needs explicit “which edition first” in reader map. |
| Only Coupling + WOLTY have `docs/status.md` among published books | Editorial state for other published titles lives only in git history / memory. |

### Promotion flow (current)

```mermaid
flowchart LR
  A[upcoming/ draft] --> B[Phase 4 editorial]
  B --> C[Author read-through]
  C --> D[Phase 5 promote to books/]
  D --> E[Enable build + publishing in book.yml]
  E --> F[CI export + optional GitHub release]
  F --> G[Purchase links / site / metadata]
```

**Blocker:** Author gates on the Phase 4 trio are the critical path to expanding the **published** portfolio footprint, not tooling.

---

## 2. Conceptual differentiation

The portfolio shares vocabulary: **legitimacy**, **authority**, **certainty**, **interpretation**, **compression**, **coordination**, **consequence distance**, **accountability**, **alignment**. Intentional reuse builds coherence; without reader-facing positioning it risks **blur** for newcomers.

### Cluster map (thematic, not exhaustive)

| Cluster | Anchor titles | Distinct question each book should answer |
|---------|---------------|-------------------------------------------|
| **Structural responsibility** | Coupling | Where are systems joined, and who bears consequence when they drift? |
| **Curiosity & learning posture** | Curiosity Before Certainty; How Serious Systems Learn; The Discipline of Uncertainty (upcoming) | How do we learn and decide when knowing is incomplete? *Risk:* Discipline vs Curiosity vs HSSL — three “uncertainty discipline” framings. |
| **Meaning & communication** | How Meaning Moves; When Authority Is Misread | How does meaning move, compress, and mislead at scale? |
| **Leadership lifecycle** | When Others Look to You (v1/v2); When Authority Outlives Accountability | How does influence form, renew, erode, and reproduce? |
| **Moral judgment at scale** | When Moral Seriousness Scales | What happens to moral judgment under distance and pressure? |
| **Flagship “after certainty” thread** | After Certainty (upcoming); Before Certainty Arrives (upcoming) | How to live/judge when understanding is not enough; how moral order hardened before failure. |
| **Legitimacy & accountability** | When Accountability No Longer Expires (upcoming); When Authority Outlives Accountability (published) | When does legitimacy survive harm without renewal? *Strong sibling pair — clearest cross-link opportunity.* |
| **Interpretation collapse** | When Interpretation No Longer Matters (upcoming); Misread Ch 12 | When does public interpretation stop coordinating authority? |
| **Incentives vs judgment** | When Incentives Become the Moral Language (upcoming); The Economy We Don't Experience (upcoming) | When do systems substitute metrics/narratives for judgment? *Shared pandemic/forecast echo risk — partially mitigated in Pass 6 briefs.* |
| **Coordination** | Why Collaboration Is So Hard (upcoming) | Why is shared work structurally unstable under asymmetry? |
| **Fiction** | Velorum | Mythic tragedy; no conceptual overlap requirement with nonfiction. |

### Overlap risks (document before changing terminology)

1. **After Certainty ↔ The Discipline of Uncertainty ↔ Curiosity Before Certainty** — All address judgment under incomplete understanding. *After Certainty* is the philosophical flagship; *Discipline* is operational/practice; *Curiosity* is accessible entry. **Gap:** No published cross-links stating this ladder.
2. **Before Certainty Arrives ↔ When Interpretation No Longer Matters** — Historical formation of brittle order vs contemporary collapse of interpretation. Complementary time axis; subtitles could confuse (“certainty” in both directions).
3. **When Accountability No Longer Expires ↔ When Authority Outlives Accountability** — Near-title collision. Published book is a **lens**; upcoming book is **durable legitimacy after harm**. Highest priority for explicit differentiation blurbs and cross-links.
4. **When Incentives Become the Moral Language ↔ The Economy We Don't Experience** — Both examine institutional moral language under scale. Economy emphasizes **credibility/compression** of macro narrative; Incentives emphasizes **domain substitution** (care, engagement, targets).
5. **How Serious Systems Learn ↔ Coupling** — Both systems-facing. HSSL is operating disciplines; Coupling is architectural grammar. Distinction holds in manuscripts; not in README one-liners.

### Terminology preservation

Do **not** flatten shared terms (e.g. “legitimacy transfer,” “compression,” “alignment”) for SEO. Instead add **positioning sentences** in indexes and the reader map that anchor each book’s *question* without renaming concepts.

---

## 3. Public-facing clarity

### Titles and subtitles

Subtitles are present on all `book.yml` files and are generally strong: specific, non-generic, avoid self-help tone. Exceptions to watch:

| Book | Note |
|------|------|
| After Certainty | Subtitle uses “Understanding” (capitalization inconsistent with “is not Enough” in subtitle string — minor polish). |
| The Discipline of Uncertainty | Subtitle recently aligned (May 2026); good differentiation from “Curiosity.” |
| When Others Look to You | Two editions need front-and-center “v1 field guide / v2 pattern companion” language on site and README. |

### Summaries (`book.yml` description)

Descriptions are concise but several upcoming descriptions read **generic** relative to manuscript depth:

- *After Certainty*: “Exploring meaning, trust, leadership…” — undersells the judgment-without-finality spine.
- *Why Collaboration*: “coordination failure, misaligned incentives” — accurate but could name **asymmetry** and **residue** (book-specific terms).

**Recommendation:** One-sentence description refresh at promotion gates only (Phase 5), not mid-draft.

### Onboarding language

| Asset | Books with strong onboarding | Gap |
|-------|------------------------------|-----|
| How to read / reader’s use | HMM, Outlives Accountability, HSSL, WOLTY, Interpretation (upcoming) | Published Moral Seriousness, Misread, Curiosity — rely on introduction only |
| Author’s note | Several | Consistent voice; no portfolio-level author’s note |
| Front matter trio | Collaboration (core reframe, what this book is, organizing question) | Model for other upcoming titles at promote time |

### Tone assessment

Manuscript samples and rules docs favor **Feynman-style clarity** without hype. No systemic corporate or self-help drift detected in `book-rules.md` files. **Risk:** `description` fields and future website copy may compress nuance if written for SEO bots rather than readers.

---

## 4. Promotion readiness by segment

Detailed per-title scores: [`upcoming-books-readiness-assessments.md`](upcoming-books-readiness-assessments.md).

### Published books — summary

| Book | Readiness | Blockers |
|------|-----------|----------|
| How Meaning Moves | **High** | Commerce link present; strong index onboarding |
| When Authority Is Misread | **High** | Commerce link; thin front matter |
| When Authority Outlives Accountability | **High** | Commerce link; how-to-read present |
| When Others Look to You v1 | **Highest** | ISBN, Amazon, YouTube, companion links |
| When Others Look to You v2 | **Medium** | Exports on; back matter/glossary open per status |
| Coupling | **Medium–High** | PR to main pending; no purchase links |
| When Moral Seriousness Scales | **Medium** | No purchase links; no cover in book.yml |
| Curiosity Before Certainty | **Medium** | No `title_page_cover`; no purchase links |
| How Serious Systems Learn | **Low for external promo** | Draft footer in book.yml — do not promote as final |

### Upcoming nonfiction — summary

| Tier | Books | Promotion stance |
|------|-------|------------------|
| **Ready after author gate** | after-certainty, before-certainty-arrives, when-accountability-no-longer-expires | Enable exports + move to `books/`; refresh descriptions; add website to book.yml |
| **Not ready — editorial** | when-interpretation-no-longer-matters | Phase 4 complete; expansion decision + author read Parts III–IV |
| **Not ready — mid pipeline** | when-incentives-become-the-moral-language | Phase 2; Phase 3 coherence gate |
| **Not ready — early depth** | why-collaboration-is-so-hard, the-economy-we-dont-experience, the-discipline-of-uncertainty | Part I author gates; 7–11k vs 50–90k targets |

### Velorum (fiction)

| Dimension | Assessment |
|-----------|------------|
| Manuscript | 30 chapters on disk |
| Reader hub | `index.md` lists 6 chapters (Act I only) — **major discoverability bug** |
| Promotion | Separate track; not in portfolio-status; `build.*: false` |

---

## 5. Metadata & discoverability

| Capability | Status |
|------------|--------|
| `book.yml` validation | Strong — schema-enforced |
| Export manifests | CI generates JSON with title, formats, word count, chapters |
| Semantic manifest | Glossary, patterns, ontology — **backend only**, not linked from reader indexes |
| SEO fields in schema | **None** — by design; descriptions serve catalog role |
| `author.website` | Published: yes; Upcoming nonfiction: **missing** |
| Purchase / ISBN | 4 of 9 published pipelines |

**Semantic layer** (`semantic/`) is a portfolio asset for quote extraction, cross-book term consistency, and future site integration. It is underused for **public** discoverability today.

---

## 6. Prioritized recommendations

Ordered by leverage × portfolio impact ÷ implementation effort.

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| P0 | Author read-through on Phase 4 trio → Phase 5 promote | Author time | Adds 3 publishable titles |
| P0 | Sync portfolio-status after every phase change (automate or checklist) | Low | Prevents coordination drift |
| P1 | Add [`docs/portfolio-reader-map.md`](../portfolio-reader-map.md) to site/README | Low | Onboarding, differentiation |
| P1 | Differentiation blurbs: Accountability pair + certainty cluster | Low | Reduces confusion |
| P1 | Add `author.website` to upcoming nonfiction `book.yml` at Phase 5 | Low | Metadata parity |
| P2 | Root README: upcoming nonfiction table + link to reader map | Low | GitHub discoverability |
| P2 | Refresh `description` fields at promotion only | Low | Public clarity |
| P2 | Velorum: complete `index.md` or document preview-only scope | Medium | Fiction discoverability |
| P3 | Published books: `docs/status.md` or single `books/PORTFOLIO.md` rollup | Medium | Editorial memory |
| P3 | Strip HSSL draft footer before external campaign | Low | Trust |
| P3 | Curiosity cover + Moral Seriousness commerce metadata | Medium | Parity with siblings |
| P4 | Surface semantic glossary links from pattern-heavy books | Medium | SEO/readability without new jargon |
| P4 | Extract quote bank per published book (issue backlog) | Medium | Social promotion |

---

## 7. Optional incremental edits in this PR

| Change | Rationale |
|--------|-----------|
| [`docs/portfolio-reader-map.md`](../portfolio-reader-map.md) | Connective tissue for new readers |
| [`upcoming/portfolio-status.md`](../../upcoming/portfolio-status.md) redirect | Fixes issue #99 path |
| [`upcoming/docs/portfolio-status.md`](../../upcoming/docs/portfolio-status.md) sync | Accurate phases/word counts |
| README link to reader map + audits | Discoverability |
| [`follow-up-issues-backlog.md`](follow-up-issues-backlog.md) | Actionable GitHub issue templates |

---

## 8. Proposed follow-up work

See [`follow-up-issues-backlog.md`](follow-up-issues-backlog.md) for titled issues, scope, sequencing, and dependencies.

---

## Appendix: Path correction for issue #99

| Referenced in issue | Canonical path |
|---------------------|----------------|
| `upcoming/portfolio-status.md` | [`upcoming/docs/portfolio-status.md`](../../upcoming/docs/portfolio-status.md) |

A redirect stub at `upcoming/portfolio-status.md` points to the canonical file.
