# Remaining After Certainty product and corpus roadmap

**Status:** Active — authoritative for *remaining* cross-layer work  
**Created:** 2026-07-24  
**Last audited:** 2026-08-02 (books/reader redesign specialized plan started)  
**Surviving repository:** [`ksteffe/after-certainty`](https://github.com/ksteffe/after-certainty)  
**Former site repository (archived):** [`ksteffe/after-certainty-site`](https://github.com/ksteffe/after-certainty-site)

**Authority:** This is the sole master backlog for remaining product, corpus, and ops work. Specialized historical plans retain design rationale; living procedures and contracts answer “how” and “what rules,” not “what next.” Index: [`docs/roadmaps/README.md`](README.md).

**Evidence rule:** Code, tests, workflows, and current reports override planning-time snapshots in older documents.

---

## 1. Project position today

Discovery, catalog orientation, native chapter reading, monorepo same-checkout builds, and IngramSpark submission kits are **shipped**. The remaining work is editorial metadata depth, targeted semantic UX, repository contribution hygiene, reader analytics, and a small set of Kevin- or externally gated decisions—not rebuilding the reader or rediscovering search.

| Area | Status | Evidence |
|------|--------|----------|
| Monorepo + same-checkout site build | Complete | [`monorepo-migration-plan.md`](monorepo-migration-plan.md); `apps/site/`; `scripts/vercel_build.sh` |
| Discovery (search, questions, trails, Start Here, What’s New, overviews) | Shipped | Live routes under `apps/site/app/`; E2E; contributing guides |
| Native chapter reader (routes, HTML, footnotes, TOC, prev/next, progress, continue, bookmarks, text size, copy-link, in-book search) | Shipped | `apps/site/app/explore/(browse)/books/[slug]/chapters/`; `lib/reading/*`; reader e2e |
| Offline / PWA | Deferred (no-ship) | [`offline-reading-spike.md`](../../apps/site/docs/offline-reading-spike.md) (READ-017) |
| Corpus contract (manifest 2.3) | Established | [`semantic-manifest-contract.md`](../semantic-manifest-contract.md) |
| IngramSpark packaging | Shipped | `tools/ingramspark/`; pilots `production-approved`; [`ingramspark-operating-procedure.md`](../publishing/ingramspark-operating-procedure.md) |
| Site analytics (discovery/search) | Present | `apps/site/lib/analytics/events.ts`; GA4 + Vercel Analytics |
| Reader funnel events | Shipped | `chapter_open` / `next_chapter` / `file_download` (`location=reader`); consent-gated; GA4 Admin key-event marking remains Kevin |
| Root CONTRIBUTING + issue templates | Missing | Site-only `apps/site/docs/contributing-*.md` |
| Think Together | Marketing only | Quotes on site; no product surface |

---

## 2. What is complete

Do not reopen these as active product phases.

| Outcome | Evidence |
|---------|----------|
| Find Your Way (search, questions, trails, Start Here, explore) | Routes + E2E + contributing guides |
| Unify corpus contract (manifest 2.3) | Contract + schemas + generators |
| Monorepo migration Phases 0–8 | Migration plan + phase records |
| Cover derivative pipeline | [`book-cover-assets.md`](../book-cover-assets.md) |
| Canonical editions / What’s New / book overviews | Site plan Phases A–H landed |
| Native Reader V1 + deepen-reading chrome | READ-001–016 implemented; READ-017 defer |
| Priority chapter enrichment books 1–5 | [`reports/semantic-enrichment-remaining-gaps.md`](../../reports/semantic-enrichment-remaining-gaps.md) |
| Content-type / literary-form corrections | [`enrichment-content-type-corrections.md`](../migrations/enrichment-content-type-corrections.md) |
| IngramSpark initial packaging (INGRAM-001–011) | [`ingramspark-distribution-target.md`](ingramspark-distribution-target.md) |
| Concept definition display helper | `apps/site/lib/graph/conceptFormatting.ts` (PROVENANCE-001) |
| Public roadmap pointer from README | Root README → this document (OPS-002) |

---

## 3. What genuinely remains

| Track | Remaining outcome |
|-------|-------------------|
| **Repository transparency** | Root `CONTRIBUTING.md`; corpus vs site issue templates; GitHub settings checklist (Kevin) |
| **Editorial / historical metadata** | Publication-date evidence workflow; ASIN confirmations; remaining chapter/poem enrichment; historical What’s New where dates are real |
| **Semantic traceability (targeted)** | Thinker concept panel, JSON-LD `knowsAbout`, optional thinkers-by-concept filter; selective grounding—not graph saturation |
| **Think Together** | Product brief only when Kevin chooses a pilot; no social platform build now |

---

## 4. Now / Next / Later

### Now

Highest-value, actionable, clear current benefit.

1. **OPS-001** — Root `CONTRIBUTING.md` + semantic contribution guidelines  
2. **OPS-001b** — Issue templates distinguishing corpus vs `apps/site`

### Next

Valuable work that depends on Now items, Kevin’s decisions, or editorial evidence.

1. **PROVENANCE-002** — Thinker concept coverage panel  
2. **PROVENANCE-003** — JSON-LD `knowsAbout` for thinkers  
3. **CORPUS-001** — Publication-date evidence file + backfill workflow (Kevin)  
4. **CORPUS-002** — Confirm Amazon ASINs for two authority titles (Kevin / external)  
5. **CORPUS-003–008** — Remaining priority chapter/poem enrichment (editorial)  
6. **CORPUS-009** — Historical What’s New backfill where dates are confirmed  
7. **PROVENANCE-004** — Explore thinkers-by-concept filter (after more concept links exist)  
8. **PROVENANCE-005–007** — Targeted grounding / metadata cleanup (quality over quantity)  
9. **OPS-003** — Complete GitHub settings checklist (Kevin / external)

### Specialized site UX (tracked outside this master backlog)

Books index / curated shelves / book detail / native reader redesign is a **completed specialized site plan** (Phases A–G). See [`apps/site/docs/roadmaps/books-reader-redesign.md`](../../apps/site/docs/roadmaps/books-reader-redesign.md). Remaining deferrals (highlights/notes, visual-regression suite, Mobile Safari manual checks) promote here only if they outgrow site-only UX work.

### Later / revisit when triggered

| Item | Trigger |
|------|---------|
| **TOGETHER-001** product brief | Kevin explicitly chooses a Think Together pilot and needs a mechanism that Substack, GitHub issues, email, or existing channels do not already provide |
| **TOGETHER-002 / TOGETHER-003** | Only after TOGETHER-001 accepts a distinct mechanism (or fold simple feedback into OPS/CONTRIBUTING) |
| **PROVENANCE-008** relationship provenance UI | Kevin decides public provenance beats a debug dump |
| Offline / PWA (READ-017) | Criteria in [`offline-reading-spike.md`](../../apps/site/docs/offline-reading-spike.md) |
| Embeddings search | [`search-embeddings-evaluation.md`](../../apps/site/docs/roadmaps/search-embeddings-evaluation.md) decision criteria flip |
| Interior PDF/X hardening | Ingram rejects DeviceGray interiors, or another printer requires PDF/X |
| Hardcover / non-house trims / color interiors | A real hardcover or color book is planned |
| Structured cover-warning IDs | Packaging automation needs machine-readable preview-safe vs submission-block distinction beyond current error IDs |
| `immutable_release` ISBN-tagged archives | Rolling `latest` kits stop meeting the actual archival need |

---

## 5. Editorial and external dependencies

| Need | Who | Related IDs |
|------|-----|-------------|
| Historical publication dates and evidence ranking | Kevin | CORPUS-001, CORPUS-002, CORPUS-009 |
| Amazon/retailer ASIN confirmation | Kevin / external | CORPUS-002 |
| Fiction/poem summary voice and spoiler bounds | Kevin | CORPUS-006, CORPUS-007 |
| Chapter summaries for thin/zero-coverage titles | Editorial (Kevin judgment) | CORPUS-003–005 |
| Priority thinkers for concept grounding | Kevin | PROVENANCE-005 |
| Think Together moderation / public responses | Kevin | TOGETHER-001 |
| Whether relationship provenance deserves public UI | Kevin | PROVENANCE-008 |
| GitHub org/repo settings checklist | Kevin | OPS-003 |
| GA4 Admin key events for reader funnel (`chapter_open`, `next_chapter`, `file_download`) | Kevin / analytics Admin | ANALYTICS-001 (events shipped; Admin marking remains) |

---

## 6. Deferred ideas

Intentionally postponed so they do not re-enter near-term planning:

- User accounts / auth; cloud-synced annotations or reading progress  
- Personal “Add to Reading Trail” / collaborative trails (curated trails remain browseable)  
- Social feed or unmoderated public annotation walls  
- AI-generated chapter or book summaries  
- Runtime database or full CMS; native mobile app  
- Complex recommendation engine  
- Embeddings-backed search (until the evaluation doc says otherwise)  
- Full offline PWA reading (READ-017)  
- Optional Turbo remote cache enablement (ops DX, not product)  
- Mass-filling all empty thinker concepts in one pass  

---

## 7. Not currently worth doing

Protects future agents from re-proposing these without a new trigger.

| Idea | Why not now | Reopen when |
|------|-------------|-------------|
| Generalized hardcover / multi-edition manufacturing | No hardcover in flight; house paperback path works | A hardcover edition is planned |
| Full color-interior pipeline | No color book planned; DeviceGray pilots accepted | A color interior is prepared |
| Interior PDF/X rework as active work | Account uploads succeeded on DeviceGray; PDF/X is opt-in candidate | Ingram rejection or new printer policy |
| Structured cover-warning IDs as product work | Blocking errors already have check IDs; warnings are opportunistic | CI/automation cannot distinguish preview-safe vs block without parsing English |
| Page-count sync “product phase” | Sync exists; residual dirty-tree risk is owned by the operating procedure (commit CI-measured counts) | Packaging unexpectedly mutates sources without a review boundary that procedure cannot cover |
| Cloud accounts / synced reading progress | Local progress meets current need | Multi-device sync is a stated product goal |
| Social feeds / public annotation walls | No moderation capacity; conflicts with lightweight stance | Explicit Think Together pilot requires it |
| Embeddings before search evaluation | Lexical search + aliases still primary | Evaluation criteria flip |
| Offline/PWA after defer spike | Downloads already provide offline reading | Spike reopen criteria met |
| Filling every semantic graph warning / empty thinker | Low reader value; high editorial cost | Specific high-traffic thinker/concept gaps harm discoverability |
| `immutable_release` machinery | Rolling kits meet pilot need | ISBN-tagged archives required |
| Duplicate “roadmap cleanup” task | This consolidation resolves it | — |

---

## 8. Active task catalog

Only genuinely remaining outcomes. Each entry must pass the value test (problem, benefit, who, evidence, consequence).

### OPS-001 — Root CONTRIBUTING + semantic contribution guidelines

| Field | Value |
|-------|-------|
| **Horizon** | Now |
| **Problem** | Contributors and agents lack a single root entry for corpus vs site paths, validation commands, and review expectations. |
| **Benefit** | Fewer incorrect PRs (wrong tree, skipped `make check`, semantic edits without schema awareness). |
| **Who** | Kevin, future contributors, Cursor agents |
| **Evidence** | No root `CONTRIBUTING.md`; only `apps/site/docs/contributing-*.md` |
| **Consequence if skipped** | Repeated agent/contributor mistakes; slower reviews |
| **Why now** | Unblocks clearer issue routing (with OPS-001b) after reader/discovery are stable |
| **Acceptance** | File exists; links schemas, `make check`, site contributing guides |
| **Changes** | author/editor workflow; contribution/community capability |

### OPS-001b — Issue templates for corpus vs site

| Field | Value |
|-------|-------|
| **Horizon** | Now |
| **Problem** | GitHub issues have no templates separating manuscript/semantic vs `apps/site` bugs. |
| **Benefit** | Cleaner triage; agents file in the right lane. |
| **Who** | Kevin, contributors |
| **Evidence** | No `.github/ISSUE_TEMPLATE/` |
| **Consequence if skipped** | Misfiled issues; slower triage |
| **Acceptance** | Templates distinguish corpus vs site; parallel with OPS-001 |
| **Changes** | contribution/community capability |

### PROVENANCE-002 — Thinker concept coverage panel

| Field | Value |
|-------|-------|
| **Horizon** | Next |
| **Problem** | Thinker pages do not clearly show concept coverage vs empty state when linked works have concepts. |
| **Benefit** | Readers understand what a thinker is “about” on-site without hunting works. |
| **Who** | Readers; Kevin evaluating graph usefulness |
| **Evidence** | [`thinker-concept-site-issues.md`](../audits/thinker-concept-site-issues.md); many thinkers still thin in audit reports |
| **Acceptance** | Panel on thinker detail; honest empty state |
| **Changes** | reader experience; discoverability |

### PROVENANCE-003 — JSON-LD `knowsAbout` for thinkers

| Field | Value |
|-------|-------|
| **Horizon** | Next |
| **Problem** | Thinker pages miss structured data for concept associations when `concepts` exist. |
| **Benefit** | Better machine-readable discoverability for thinkers that already have concept links. |
| **Who** | Readers via search engines; site SEO |
| **Evidence** | Thinker routes exist; concept links exist for some thinkers; `knowsAbout` not emitted |
| **Acceptance** | JSON-LD only when real concept links exist |
| **Changes** | discoverability |

### PROVENANCE-004 — Explore thinkers by concept filter

| Field | Value |
|-------|-------|
| **Horizon** | Next (after more concept links) |
| **Problem** | `/explore/thinkers` cannot filter by concept. |
| **Benefit** | Readers find interlocutors for a theme without scanning cards. |
| **Who** | Readers |
| **Evidence** | Thinkers index exists; filter absent; data richness still uneven |
| **Why later** | Filter value rises after PROVENANCE-005 adds links |
| **Acceptance** | URL-shareable filter; empty states |
| **Changes** | reader experience; discoverability |

### PROVENANCE-005 — Targeted thinker↔work concept grounding

| Field | Value |
|-------|-------|
| **Horizon** | Next (editorial) |
| **Problem** | Many public thinkers have empty concept lists; mass-fill would create noise. |
| **Benefit** | Priority thinkers become useful navigation hubs for readers. |
| **Who** | Readers; Kevin (priority list) |
| **Evidence** | [`reports/thinker-concept-audit.md`](../../reports/thinker-concept-audit.md) |
| **Acceptance** | Documented selection criteria; audit shows reduction for selected set; no spam links |
| **Kevin** | Required for priority list |
| **Changes** | data trustworthiness; discoverability |

### PROVENANCE-006 — Normalize multi-author `creatorNames` mismatches

| Field | Value |
|-------|-------|
| **Horizon** | Next |
| **Problem** | ~11 metadata-quality warnings for multi-author display/punctuation. |
| **Benefit** | Cleaner source/thinker attribution on site and in audits; fewer false “data broken” signals for agents. |
| **Who** | Readers (attribution); Kevin/agents (trust in reports) |
| **Evidence** | [`reports/semantic-metadata-quality-audit.md`](../../reports/semantic-metadata-quality-audit.md); enrichment gaps report |
| **Acceptance** | Regenerated audit shows 0 of those warnings |
| **Changes** | data trustworthiness |

### PROVENANCE-007 — Concept grounding + pattern provenance batch

| Field | Value |
|-------|-------|
| **Horizon** | Next (editorial, bounded) |
| **Problem** | Grounding/provenance exists for a representative sample; further coverage is selective. |
| **Benefit** | High-value patterns/concepts show why they appear in the graph—readers can trust the claim. |
| **Who** | Readers; Kevin |
| **Evidence** | Enrichment gaps report (20 patterns / 15 relationships as representative) |
| **Acceptance** | Agreed batch size; coverage gain without quantity spam |
| **Changes** | data trustworthiness |

### CORPUS-001 — Publication-date evidence file + backfill workflow

| Field | Value |
|-------|-------|
| **Horizon** | Next |
| **Problem** | Most books lack authored publication dates; agents must not invent them from Git. |
| **Benefit** | What’s New history and newest sorting become trustworthy where evidence exists. |
| **Who** | Readers; Kevin |
| **Evidence** | [`reports/publication-date-audit.md`](../../reports/publication-date-audit.md) (six dated; most unknown) |
| **Acceptance** | Workflow documented; template + one example; unknown remains allowed |
| **Kevin** | Required for evidence rows |
| **Changes** | discoverability; author/editor workflow |

### CORPUS-002 — Confirm Amazon ASINs for two authority titles

| Field | Value |
|-------|-------|
| **Horizon** | Next |
| **Problem** | Two ASINs need human confirmation before dates/change events can be authored. |
| **Benefit** | Authority titles gain accurate history on What’s New and catalog sorting. |
| **Who** | Kevin / external retailer check |
| **Evidence** | Publication-date audit; enrichment gaps (`B0DWZ2ZFXG`, `B0GJ3QZQ1V`) |
| **Acceptance** | Dates with evidence notes; change events; audit regen |
| **Changes** | discoverability |

### CORPUS-003 — Chapter enrichment: before-certainty-arrives

| Field | Value |
|-------|-------|
| **Horizon** | Next |
| **Problem** | Priority title lacks full chapter summaries used by in-book search and orientation. |
| **Benefit** | Readers find chapters by theme; overviews and search improve. |
| **Who** | Readers; Kevin (editorial judgment) |
| **Evidence** | Enrichment gaps report — deferred priority books 6–9 |
| **Acceptance** | Completeness present==total for the book; manifest regenerates clean |
| **Changes** | reader experience; discoverability |

### CORPUS-004 — Expand living-in-sediment beyond sample

| Field | Value |
|-------|-------|
| **Horizon** | Next |
| **Problem** | Only a sample of chapters has summaries (report: 1/21-class thinness). |
| **Benefit** | Same as CORPUS-003 for this title. |
| **Who** | Readers; Kevin |
| **Evidence** | Enrichment gaps report |
| **Acceptance** | Full coverage for reading units |
| **Changes** | reader experience; discoverability |

### CORPUS-005 — Chapter enrichment: the-economy-we-dont-experience

| Field | Value |
|-------|-------|
| **Horizon** | Next |
| **Problem** | Priority title lacks full chapter enrichment. |
| **Benefit** | In-book search and orientation for economic themes. |
| **Who** | Readers; Kevin |
| **Evidence** | Enrichment gaps report |
| **Acceptance** | Full chapter enrichment; clean manifest |
| **Changes** | reader experience; discoverability |

### CORPUS-006 — Fiction summaries: boundary-conditions

| Field | Value |
|-------|-------|
| **Horizon** | Next |
| **Problem** | Fiction needs anti-proof, low-spoiler summaries—not essay-style claims. |
| **Benefit** | Readers can browse fiction chapters without spoiled plots or wrong genre tone. |
| **Who** | Readers; Kevin (voice/spoiler judgment) |
| **Evidence** | Enrichment gaps; literary form fiction |
| **Acceptance** | Fiction-safe summaries authored |
| **Changes** | reader experience |

### CORPUS-007 — Poem summaries: observer-patterns

| Field | Value |
|-------|-------|
| **Horizon** | Next |
| **Problem** | Poem kinds export without poem-level summaries. |
| **Benefit** | In-book/search orientation for poetry without forcing prose essay tone. |
| **Who** | Readers; Kevin (poetry voice) |
| **Evidence** | Enrichment gaps (20 poems; summaries not authored) |
| **Acceptance** | Poem-level summaries for exported poem kinds |
| **Changes** | reader experience; discoverability |

### CORPUS-008 — relatedWorks + situations for thin titles

| Field | Value |
|-------|-------|
| **Horizon** | Next |
| **Problem** | `trust-beyond-similarity` and `what-we-cannot-see` still miss typed relatedWorks / situationCoverage. |
| **Benefit** | Cross-book discovery and situation browsing improve for thin titles. |
| **Who** | Readers |
| **Evidence** | Enrichment gaps “Thin / partial remaining” |
| **Acceptance** | Typed links present; completeness improves |
| **Changes** | discoverability |

### CORPUS-009 — Historical What’s New backfill

| Field | Value |
|-------|-------|
| **Horizon** | Next |
| **Problem** | What’s New is sparse where real publication dates exist but events were never authored. |
| **Benefit** | Readers see honest project history; newest sorting gains signal. |
| **Who** | Readers; Kevin |
| **Evidence** | Publication-date audit; change-event sparsity |
| **Dependencies** | CORPUS-001/002 where applicable |
| **Acceptance** | Events validate; `/whats-new` shows historical entries; no fabricated dates |
| **Changes** | discoverability |

### OPS-003 — Complete GitHub settings checklist

| Field | Value |
|-------|-------|
| **Horizon** | Next (external) |
| **Problem** | Manual GitHub protections remain unchecked in-repo. |
| **Benefit** | Branch protection and related settings reduce accidental force-pushes and unsafe merges. |
| **Who** | Kevin (org/repo UI) |
| **Evidence** | [`github-settings-checklist.md`](../security/github-settings-checklist.md) open checkboxes |
| **Acceptance** | Items checked or waived with notes |
| **Changes** | repository reliability |

### Later — TOGETHER-001 (trigger-gated)

| Field | Value |
|-------|-------|
| **Horizon** | Later |
| **Problem** | Site marketing says “think together” but no participation product exists. |
| **Benefit** | Only worth building if a mechanism offers something Substack, GitHub issues, email, or existing discussion channels do not—e.g. chapter-tied reflection with editorial curation and no accounts. |
| **Who** | Kevin (policy); readers if piloted |
| **Evidence** | Marketing quotes only; no routes/schema |
| **Trigger** | Kevin chooses a Think Together pilot |
| **Acceptance** | Written brief with in/out of scope; feeds or declines TOGETHER-002/003 |
| **Changes** | contribution/community capability (if accepted) |

---

## 9. Completion ledger (retired task IDs)

Preserved for commits, issues, and docs. Do not renumber survivors. Do not reopen under a new ID unless the remaining outcome is materially different.

| ID | Status | Note |
|----|--------|------|
| READ-001 | Complete | Chapter URL / identity contract |
| READ-002 | Complete | SSR chapter routes |
| READ-003 | Complete | Manuscript HTML pipeline |
| READ-004 | Complete | TOC + prev/next |
| READ-005 | Complete | Search eligibility for live chapters |
| READ-006 | Complete | Overview → chapter links |
| READ-007 | Complete | Footnotes / anchors |
| READ-008 | Complete | Reader a11y baseline |
| READ-009 | Complete | Sitemap + E2E smoke |
| READ-010 | Complete | Cohort = all published catalog editions |
| READ-011 | Complete | Local reading progress |
| READ-012 | Complete | Continue-reading entry points |
| READ-013 | Complete | Local bookmarks |
| READ-014 | Complete | Text size / reading preferences |
| READ-015 | Complete | TOC drawer + copy section link |
| READ-016 | Complete | In-book search (titles/summaries) |
| READ-017 | Complete — defer (no-ship) | Offline spike; reopen per spike doc |
| PROVENANCE-001 | Complete | `getConceptDisplayDefinition` shipped and wired |
| ANALYTICS-001 | Complete | Reader funnel: `chapter_open`, `next_chapter`, `file_download` (`location=reader`); consent-gated; GA4 Admin key-event marking remains Kevin |
| OPS-002 | Complete | README points at this roadmap |
| INGRAM-001–011 | Complete | See IngramSpark historical roadmap |
| TOGETHER-002 | Deferred (gated) | After TOGETHER-001 only |
| TOGETHER-003 | Deferred (gated) | After TOGETHER-001, or fold into OPS feedback path |
| PROVENANCE-008 | Deferred (Kevin) | Ship or permanently defer after product decision |

**Active open IDs:** OPS-001, OPS-001b, OPS-003, PROVENANCE-002–007, CORPUS-001–009, TOGETHER-001 (Later).

---

## 10. Definition of done (current horizon)

The current roadmap horizon is complete when:

1. Root contribution docs and issue templates exist (OPS-001 / OPS-001b).  
2. Reader funnel events shipped privacy-safely (ANALYTICS-001); GA4 Admin key-event marking is Kevin follow-up.  
3. Publication-date workflow exists and known ASIN confirmations are resolved or documented unknown (CORPUS-001/002).  
4. Remaining priority enrichment books/poems in CORPUS-003–008 are done or explicitly deprioritized with reason.  
5. At least PROVENANCE-002/003 land for thinker discoverability; further grounding stays targeted.  
6. Think Together remains brief-gated until Kevin triggers it.  
7. No completed reader/discovery/monorepo/IngramSpark/analytics work is listed as active backlog.

---

## 11. Links

| Kind | Paths |
|------|-------|
| Index | [`docs/roadmaps/README.md`](README.md) |
| Historical plans | [`monorepo-migration-plan.md`](monorepo-migration-plan.md); [`ingramspark-distribution-target.md`](ingramspark-distribution-target.md); site plans under `apps/site/docs/roadmaps/` |
| Procedures | [`ingramspark-operating-procedure.md`](../publishing/ingramspark-operating-procedure.md); [`search-quality-workflow.md`](../../apps/site/docs/roadmaps/search-quality-workflow.md) |
| Contracts | [`semantic-manifest-contract.md`](../semantic-manifest-contract.md); [`semantic-chapter-identity.md`](../semantic-chapter-identity.md); [`book-cover-assets.md`](../book-cover-assets.md) |
| Reports | [`reports/`](../../reports/) (regenerate for truth; do not hand-edit values) |
| Editorial SoT | [`upcoming/docs/portfolio-status.md`](../../upcoming/docs/portfolio-status.md) |
| Security ops | [`github-settings-checklist.md`](../security/github-settings-checklist.md) |
| Deferred spikes | [`offline-reading-spike.md`](../../apps/site/docs/offline-reading-spike.md); [`search-embeddings-evaluation.md`](../../apps/site/docs/roadmaps/search-embeddings-evaluation.md) |

---

## Document maintenance

When a task completes: move its ID to the completion ledger, remove it from §8 and from Now/Next, and update §1 if project position changed. Do not leave phases marked Active with no remaining work.
