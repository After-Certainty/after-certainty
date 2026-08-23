# Remaining After Certainty product and corpus roadmap

**Status:** Active — authoritative for *remaining* cross-layer work  
**Created:** 2026-07-24  
**Last audited:** 2026-08-22 (evidence-before-expansion prune; GAME-001e and CORPUS-003/004 marked complete; Observe section added)  
**Surviving repository:** [`After-Certainty/after-certainty`](https://github.com/After-Certainty/after-certainty)  
**Former site repository (archived):** [`ksteffe/after-certainty-site`](https://github.com/ksteffe/after-certainty-site)

**Authority:** This is the sole master backlog for remaining product, corpus, and ops work. Specialized historical plans retain design rationale; living procedures and contracts answer “how” and “what rules,” not “what next.” Index: [`docs/roadmaps/README.md`](README.md).

**Evidence rule:** Code, tests, workflows, and current reports override planning-time snapshots in older documents. Generated reports and empty metadata fields are **evidence**, not automatic commitments.

---

## Operating principles

1. **Evidence before expansion.** Once a surface is shipped, further investment should normally be triggered by observed use, identified reader friction, a concrete editorial objective, or an operational problem — not by completeness alone.
2. **Generated reports are evidence, not commitments.** Saturation targets and gap enumerations do not become roadmap work by default.
3. **Unknown metadata is acceptable.** Prefer honest unknown over invented precision (dates, ASINs, `dateModified`, authority links).
4. **Semantic enrichment is just-in-time.** Grounding, provenance, summaries, and related works are added when actively editing, promoting, or responding to reader/editorial need — not because an audit lists an empty field.
5. **Prefer existing channels before building infrastructure.** Substack, GitHub, email, and local-first surfaces come before accounts, sync, or community platforms.
6. **This roadmap answers “what should we consider next?”** — not “what ideas have we ever recorded?” Historical detail lives in git history and specialized plans.

---

## 1. Project position today

Discovery, catalog orientation, native chapter reading, monorepo same-checkout builds, IngramSpark submission kits, chapter Listen (provider-neutral TTS), and the Pattern Recognition Challenge (through Session Completion Delight) are **shipped**. The useful remaining work is small: contribution hygiene, org/repo settings verification, targeted thinker discoverability, and human GA4 Admin configuration — then **observe** how readers use what already exists.

| Area | Status | Evidence |
|------|--------|----------|
| Monorepo + same-checkout site build | Complete | [`monorepo-migration-plan.md`](monorepo-migration-plan.md); `apps/site/`; `scripts/vercel_build.sh` |
| Discovery (search, questions, trails, Start Here, What’s New, overviews) | Shipped | Live routes under `apps/site/app/`; E2E; contributing guides |
| Native chapter reader | Shipped | `apps/site/app/explore/(browse)/books/[slug]/chapters/`; `lib/reading/*`; reader e2e |
| Offline / PWA | Deferred (no-ship) | [`offline-reading-spike.md`](../../apps/site/docs/offline-reading-spike.md) (READ-017) |
| Corpus contract (manifest 2.3) | Established | [`semantic-manifest-contract.md`](../semantic-manifest-contract.md) |
| IngramSpark packaging | Shipped | `tools/ingramspark/`; pilots production-approved; operating procedure |
| Site analytics (discovery/search/reader/game) | Present | `apps/site/lib/analytics/`; GA4 + Vercel Analytics; `tools/ga_trends_brief.py` |
| Reader funnel events | Shipped | `chapter_open` / `next_chapter` / `file_download` (`location=reader`); consent-gated; GA4 Admin key-event marking remains Kevin |
| Chapter Listen (TTS platform) | Platform complete | [`elevenlabs-tts-pilot.md`](elevenlabs-tts-pilot.md) Phases 0–6; OP + WOLTY v1 full books; CBC intro + Ch.1 artifacts present |
| Pattern Recognition Challenge | Through GAME-001e complete | [`pattern-recognition-challenge.md`](pattern-recognition-challenge.md); enjoyability Observe gate before further game investment |
| Root CONTRIBUTING + issue templates | Missing | Site-only `apps/site/docs/contributing-*.md` |
| Think Together | Marketing only | Quotes on site; no product surface |

---

## 2. Now

Small set of work currently worth doing.

### Roadmap reconciliation / maintenance

This document and the roadmap index are internally consistent as of **2026-08-22**. Further edits should keep Now small and evidence-driven.

### Repository URL hygiene

Operational and current documentation should cite:

`https://github.com/After-Certainty/after-certainty`

Historical migration narratives may retain former `ksteffe/…` names where the history depends on them.

### OPS-001 — Root CONTRIBUTING.md

| Field | Value |
|-------|-------|
| **Problem** | Contributors and agents lack a single root entry for corpus vs site paths, validation commands, and review expectations. |
| **Benefit** | Fewer incorrect PRs; clearer agent routing. |
| **Evidence** | No root `CONTRIBUTING.md`; only `apps/site/docs/contributing-*.md` |
| **Acceptance** | Concise map: corpus/content changes, site changes, validation expectations, key commands. Links schemas, `make check`, site contributing guides. Not a large governance project. |
| **Also** | Briefly note corpus vs site issue routing; optional tiny follow-up **OPS-001b** if `.github/ISSUE_TEMPLATE/` remains empty. |

### OPS-001b — Issue templates (lightweight)

| Field | Value |
|-------|-------|
| **Problem** | No GitHub issue templates separating manuscript/semantic vs `apps/site`. |
| **Acceptance** | Minimal templates distinguishing corpus vs site; do not expand into process bureaucracy. |

### OPS-003 — GitHub organization/repository settings check

| Field | Value |
|-------|-------|
| **Problem** | After the move to the After-Certainty organization, branch protection, required checks, permissions, and related settings need a one-time human verification. |
| **Evidence** | [`github-settings-checklist.md`](../security/github-settings-checklist.md) open checkboxes |
| **Acceptance** | Items checked or waived with notes. **Done once verified** — not recurring roadmap work. |

### PROVENANCE-002 + PROVENANCE-003 — Thinker concepts (paired)

| Field | Value |
|-------|-------|
| **PROVENANCE-002** | Expose linked concepts usefully on thinker pages: coverage panel with honest empty state when linked works have concepts but thinker-level links are thin ([`thinker-concept-site-issues.md`](../audits/thinker-concept-site-issues.md)). Related-concepts lists from `thinker.concepts` alone are not enough. |
| **PROVENANCE-003** | Emit JSON-LD `knowsAbout` only where genuine concept relationships exist. |
| **Why now** | Visible reader navigation plus honest machine-readable structure from data already authored. |
| **Acceptance** | Panel + empty state; `knowsAbout` only when real links exist. |

### GA4 configuration cleanup (human ops)

Application events for the reader funnel are **shipped**. Remaining work is GA4 Admin **key event** marking for `chapter_open`, `next_chapter`, and `file_download`. Do not treat analytics instrumentation as incomplete merely because every event is not marked as a conversion/key event.

---

## 3. Observe

Signals that may create future work. No arbitrary KPI targets. Use existing GA4 / reporting tooling (`apps/site/lib/analytics/`, `tools/ga_trends_brief.py`, site GA scripts, PADE broker) to decide where investment is justified.

| Signal area | What to watch | Notes |
|-------------|---------------|--------|
| **Acquisition / discovery** | Landing pages, search-engine traffic, high-performing book/thinker/pattern pages, referral traffic | |
| **Reader funnel** | Book page → chapter open; chapter continuation (`next_chapter`); reader exits; reading depth where available | Events shipped; Admin key-event marking is Now (ops) |
| **Search** | Search usage; successful result selection; no-result / weak-result queries if available | |
| **Audio / Listen** | Whether chapters are played; which books get Listen use; whether usage justifies more narration cost/storage | Player shipped; **Listen play/complete events are weak or absent** — add minimal instrumentation only if audio investment decisions require it |
| **Game** | Starts, completions, repeat use; whether people return voluntarily | **Enjoyability gate:** after GAME-001e, observe before any further game phases |
| **Outbound / purchase** | Book purchase links; external source clicks; other meaningful outbound actions | |

**Game sequence:** finish was GAME-001e (complete) → **observe** enjoyability/usage → **stop** unless evidence pulls more work. Do not automatically promote Supabase or advanced modes.

---

## 4. Ongoing editorial and operations

Repeatable work that is not a product initiative. Do it when editing, publishing, or operating — not because a report lists gaps.

### Audio

The audio **platform** is complete ([`elevenlabs-tts-pilot.md`](elevenlabs-tts-pilot.md) Phases 0–6). Ongoing work may include:

- Narrating selected books/chapters (credit-bounded)
- Monitoring ElevenLabs cost and Git LFS/storage/bandwidth
- Evaluating actual Listen usage (see Observe)
- Revisiting storage/provider choices only for a real operational reason

A second TTS provider (OpenAI adapter) is **Triggered only** — not active work merely because the architecture supports one.

### Publication metadata (former CORPUS-001 / CORPUS-002 / CORPUS-009)

Keep the ability to add credible publication dates, ASIN/publication identifiers, and historical What’s New entries when evidence exists. **Unknown remains acceptable.** Do not mandate backfilling every historical title. Prefer opportunistic updates where metadata enables honest history or sorting.

### Semantic metadata (former PROVENANCE-005–007 and broad CORPUS chapter/poem fill)

Just-in-time rule: add grounding, provenance, thinker links, concept links, summaries, related works, or other enrichment when actively working on content that matters — not simply because an audit reports an empty field.

Titles that previously appeared as CORPUS-005–008 (`the-economy-we-dont-experience`, `boundary-conditions`, `observer-patterns`, thin `relatedWorks` / situations) receive deeper metadata when being edited, promoted, shown by analytics to matter, enabling a concrete feature, or serving an editorial objective — not as mass-completeness work.

### Purchase metadata

ISBN / purchase links remain useful where books are genuinely for sale. Ordinary publishing maintenance (aligned with issue #109 disposition), not a major product initiative.

### Manuscripts

Do not systematically expand every book toward a target word count. Deepen individual books because the author wants to. [`upcoming/docs/portfolio-status.md`](../../upcoming/docs/portfolio-status.md) may identify possibilities but must not automatically create product work.

### Creator-name cleanup (former PROVENANCE-006)

Normalize multi-author `creatorNames` mismatches opportunistically when touching affected sources or when audit noise blocks trust — not as a standalone saturation project.

---

## 5. Triggered only

Speculative capabilities. Document the **trigger**, not an implementation plan.

| Item | Reconsider when |
|------|-----------------|
| **GAME Phase 8** — Supabase / game accounts / cross-device progress | Anonymous game usage shows meaningful repeat engagement **and** local-only progress is a visible limitation |
| **GAME Phase 9** — Advanced modes, adaptive difficulty, larger achievement/economy systems | Enjoyability/usage evidence after the Observe gate justifies more game surface |
| **OpenAI TTS adapter** (AUDIO Phase 7) | ElevenLabs creates a concrete cost, quality, reliability, licensing, or alignment/timing problem |
| **Alternative audio storage** | Real LFS/bandwidth/ops problem with current Git LFS approach |
| **PROVENANCE-004** — Explore thinkers-by-concept filter | Concept relationship graph is rich enough **and** analytics or editorial demand justifies the filter |
| **PROVENANCE-008** — Relationship provenance UI | Kevin decides public provenance beats a debug dump |
| **TOGETHER-001–003** — Think Together / community infrastructure | Readers demonstrate a collaboration need that Substack, GitHub, email, or existing channels cannot satisfy |
| **Embeddings / vector search** | Real search behavior shows a retrieval problem current indexing cannot solve ([`search-embeddings-evaluation.md`](../../apps/site/docs/roadmaps/search-embeddings-evaluation.md)) |
| **PWA / offline** (READ-017) | Spike reopen criteria in [`offline-reading-spike.md`](../../apps/site/docs/offline-reading-spike.md) |
| **Cloud-synced reading state** | Multi-device sync is an explicit product goal |
| **Broad semantic/provenance saturation** | Specific high-traffic gaps harm discoverability (not graph-completion for its own sake) |
| **Mass concept sameAs / Wikidata / SEP mapping** | Targeted mappings for important concepts are fine; mass ontology maintenance needs a concrete consumer |
| **Schema.org / SKOS predicate mapping** | Demonstrated machine-readable or SEO/LLM consumer need |
| **`dateModified` from git churn** | A trustworthy semantic meaning for the date exists — do not emit false precision |
| **Per-book language / license fields** | First real non-English content or materially different licenses |
| **Structured bibliographic source normalization** | A concrete consumer needs parseable fields beyond citation strings |
| **Generalized publishing** — hardcover, color interiors, PDF/X hardening, `immutable_release` ISBN archives, structured cover-warning IDs | Real print, printer rejection, or archival requirement |

---

## 6. Completed / superseded

Do not reopen these as active product phases. Specialized plans keep implementation history.

| Outcome | Evidence |
|---------|----------|
| Find Your Way (search, questions, trails, Start Here, explore) | Routes + E2E + contributing guides |
| Unify corpus contract (manifest 2.3) | Contract + schemas + generators |
| Monorepo migration Phases 0–8 | [`monorepo-migration-plan.md`](monorepo-migration-plan.md) |
| Cover derivative pipeline | [`book-cover-assets.md`](../book-cover-assets.md) |
| Canonical editions / What’s New / book overviews | Site plan Phases A–H |
| Native Reader V1 + deepen-reading chrome | READ-001–016; READ-017 defer |
| Priority chapter enrichment books 1–5 | Enrichment gaps / coverage reports |
| CORPUS-003 `before-certainty-arrives` chapter enrichment | Coverage audit 2026-08-01: **15/15** |
| CORPUS-004 `living-in-sediment` chapter enrichment | Coverage audit: **21/21** |
| Content-type / literary-form corrections | Migrations note |
| IngramSpark initial packaging (INGRAM-001–011) | [`ingramspark-distribution-target.md`](ingramspark-distribution-target.md) |
| PROVENANCE-001 concept definition helper | `apps/site/lib/graph/conceptFormatting.ts` |
| ANALYTICS-001 reader funnel events | Shipped; Admin key-event marking remains Now (ops) |
| OPS-002 public roadmap pointer from README | Root README → this document |
| AUDIO-001 platform Phases 0–6 + CBC intro/Ch.1 generate slice | [`elevenlabs-tts-pilot.md`](elevenlabs-tts-pilot.md); further narration = Ongoing ops |
| GAME-001a–001e Pattern Recognition Challenge through Session Completion Delight | [`pattern-recognition-challenge.md`](pattern-recognition-challenge.md); further game work = Observe then Triggered only |
| Explore / patterns / books-reader mobile redesigns | Completed specialized site plans under `apps/site/docs/roadmaps/` |

### Completion ledger (retired task IDs)

Preserved for commits, issues, and docs. Do not renumber survivors.

| ID | Status | Note |
|----|--------|------|
| READ-001–016 | Complete | Native reader |
| READ-017 | Complete — defer (no-ship) | Offline spike |
| PROVENANCE-001 | Complete | Concept display helper |
| ANALYTICS-001 | Complete | Reader funnel events (Admin marking = ops Now) |
| OPS-002 | Complete | README → roadmap |
| INGRAM-001–011 | Complete | IngramSpark historical roadmap |
| CORPUS-003 | Complete | `before-certainty-arrives` 15/15 |
| CORPUS-004 | Complete | `living-in-sediment` 21/21 |
| GAME-001a–001e | Complete | Through Session Completion Delight; Observe enjoyability next |
| AUDIO Phases 0–6 | Complete | Platform; selective narration ongoing |
| TOGETHER-002–003 | Triggered only | After TOGETHER-001 |
| PROVENANCE-008 | Triggered only | Kevin product decision |

**Active Now IDs:** OPS-001, OPS-001b, OPS-003, PROVENANCE-002, PROVENANCE-003, GA4 Admin key-event ops.

**Demoted from active backlog (not deleted as ideas):** CORPUS-001/002/005–009 → Ongoing; PROVENANCE-004 → Triggered; PROVENANCE-005–007 → Ongoing JIT; GAME Phase 8–9 → Triggered; AUDIO Phase 7 → Triggered; TOGETHER-001 → Triggered.

---

## 7. Editorial gates (human; not engineering backlog)

From [`upcoming/docs/portfolio-status.md`](../../upcoming/docs/portfolio-status.md):

- **When Interpretation No Longer Matters** — author sign-off Parts III–IV; export smoke
- **Why Diversity Matters** — author intro + chapter drafts (early)
- **Velorum** — beta readers; export smoke
- Author Part I read-through before any large expansion toward book-rules word bands
- Echo checks before promotion/cross-link in judgment / alignment / compression cluster

Do **not** treat “expand essay editions to 50–90k words” as product roadmap work. Expansion is author intent.

---

## 8. GitHub issue reconciliation (2026-08-22)

Roadmap-adjacent open issues reconciled so the tracker does not shadow this backlog:

| Issue | Disposition | Close note (maintainer action — agent lacked `issues: write`) |
|------|-------------|------------------|
| [#108](https://github.com/After-Certainty/after-certainty/issues/108) readingOrder / relatedSlugs | Triggered only / parked — reopen when a concrete site consumer needs the fields | Close as not planned |
| [#109](https://github.com/After-Certainty/after-certainty/issues/109) purchase_links / ISBNs | Ongoing publishing maintenance | Close as not planned (ops practice, not product tracker) |
| [#110](https://github.com/After-Certainty/after-certainty/issues/110) interpretation pull quotes | Editorial polish — not product infrastructure | Close as not planned |
| [#231](https://github.com/After-Certainty/after-certainty/issues/231) structured bibliographic sources | Triggered only — no broad normalization without a consumer | Close as not planned |
| [#232](https://github.com/After-Certainty/after-certainty/issues/232) concept sameAs authorities | Triggered only — targeted mappings OK; not mass ontology work | Close as not planned |
| [#233](https://github.com/After-Certainty/after-certainty/issues/233) predicate → schema.org/SKOS | Triggered only research | Close as not planned |
| [#234](https://github.com/After-Certainty/after-certainty/issues/234) entity dateModified | Reject false precision unless trustworthy semantic date exists | Close as not planned |
| [#235](https://github.com/After-Certainty/after-certainty/issues/235) per-book license + language | Triggered only — first real non-English or license variance | Close as not planned |

This environment’s GitHub token could not comment on or close issues (`Resource not accessible by integration`). A maintainer should apply the close actions above so the issue tracker matches this roadmap.

---

## 9. Links

| Kind | Paths |
|------|-------|
| Index | [`docs/roadmaps/README.md`](README.md) |
| Specialized (active pointers) | [`pattern-recognition-challenge.md`](pattern-recognition-challenge.md); [`elevenlabs-tts-pilot.md`](elevenlabs-tts-pilot.md) |
| Historical | [`monorepo-migration-plan.md`](monorepo-migration-plan.md); [`ingramspark-distribution-target.md`](ingramspark-distribution-target.md); site plans under `apps/site/docs/roadmaps/` |
| Procedures | IngramSpark operating procedure; [`search-quality-workflow.md`](../../apps/site/docs/roadmaps/search-quality-workflow.md) |
| Reports | [`reports/`](../../reports/) (regenerate for truth; do not hand-edit values) |
| Editorial SoT | [`upcoming/docs/portfolio-status.md`](../../upcoming/docs/portfolio-status.md) |
| Security ops | [`github-settings-checklist.md`](../security/github-settings-checklist.md) |
| Deferred spikes | Offline reading spike; search embeddings evaluation |

---

## Document maintenance

When a Now item completes: move its ID to the completion ledger and remove it from §2. Prefer shrinking this document over preserving historical ID catalogs. Specialized plans keep phase history; this master roadmap stays scannable.
