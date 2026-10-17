# Vercel reader analytics migration

**Status:** Specialized plan — **PR 2 in progress** (reporting + `reader-analytics` skill); PR 0–1 merged  
**Created:** 2026-10-17  
**Revised:** 2026-10-17 (PR 2: Web Analytics API client, weekly brief, PADE `vercel.analytics.read`)  
**Location:** `docs/roadmaps/vercel-reader-analytics-migration.md`  
**Authority:** Specialized cross-layer plan. Does **not** replace [`remaining-product-roadmap.md`](remaining-product-roadmap.md). Unfinished follow-ups after each PR merge belong on the master roadmap Observe / Now sections, not as a second backlog.

**Document role:** Executable migration roadmap from Google Analytics 4 (GA4) as the primary analytics platform to **Vercel Web Analytics**, with Google Search Console retained for search discovery. The goal is a smaller, privacy-conscious system that answers questions about discovery, intellectual exploration, and meaningful readership — not feature parity with GA4.

> **Evidence rule:** Live code, schemas, tests, Vercel dashboard/API data, and production observation override planning-time snapshots in this document.

> **Safety rule:** Do not commit API tokens or credentials. Cloud Agents use PADE broker material only (`pade exec`). Do not remove GA4 until PR 3 validation is approved explicitly.

> **Stop rule:** Implementation branches are created only when that stage is ready. This document may describe all future PRs; only the current stage’s branch should exist as active work.

---

## 0. Guiding question

**Are people discovering After Certainty’s ideas, finding their way into the books, and choosing to explore further?**

Analytics inform editorial judgment. They do not substitute for it. A correctly authored source→chapter link remains valuable even when few people click it.

---

## 1. Executive summary

| Item | Decision |
|------|----------|
| Primary analytics after migration | Vercel Web Analytics (+ Speed Insights unchanged) |
| Search discovery | Google Search Console (unchanged; out of migration scope) |
| GA4 | Parallel measurement until PR 3 approval gate; retire only in PR 4 |
| New infrastructure | None — no warehouse, event DB, or third-party analytics vendor |
| Reporting | Small scripts + Cursor skill (`reader-analytics`), mirroring `ga-trends` / PADE |
| Consent stance | Cookie choice continues to gate **GA4 only** during parallel measurement; privacy/cookie copy must say so accurately starting in PR 1; re-evaluate banner necessity only in PR 4 |

**Feasibility:** Confirmed against live account entitlements and existing instrumentation (see §3–§4). Custom events and the aggregate Web Analytics API already work for this project.

**Largest risks:**

1. **Consent / disclosure mismatch** — Vercel Analytics is always-on today while the privacy page still says analytics is off by default (GA4-only framing). **Fix copy in PR 1 (or an immediate privacy PR)** — do not wait for PR 4.
2. **Aggregate-only honesty** — Vercel APIs provide counts and visitors, not session-level journeys; reports must not invent funnels they cannot measure.
3. **Property budget** — Base Pro allows 2 custom properties; Web Analytics Plus (dated account observation — see §4) allows 8. Schemas must degrade safely if Plus is disabled.
4. **Type-level vs specific-chapter attribution** — Current `corpus_navigation` cannot prove which chapter a particular source/thinker page sent a reader to without a bounded target ID or equivalent evidence.
5. **Anomalous traffic** — Recent data shows Singapore-heavy desktop traffic on research surfaces; treat as heuristic classification, never silent exclusion.
6. **Cost** — Every pageview and custom event is billed on Pro; prefer meaningful actions over indiscriminate click tracking.

---

## 2. Outcomes we care about

| # | Question | Primary measurement approach |
|---|----------|------------------------------|
| 1 | How do people discover After Certainty? | Vercel visits: `referrerHostname`, country, device, UTM (Plus); GSC for queries/rankings |
| 2 | Which research sources and thinker pages attract visitors? | Visits by `requestPath` / `route` for `/explore/sources/*`, `/explore/thinkers/*` |
| 3 | Do visitors follow links from sources and thinkers into books / **specific chapters**? | Type-level: `corpus_navigation` (`from_type`/`to_type`/`relation`). Specific chapter: only after PR 1 attribution spike (§6.5) — either prove `requestPath` + event data suffice, or add a minimal privacy-safe `to_id` on source/thinker → chapter edges |
| 4 | Which books and chapters are opened? | Custom `chapter_open` + book/chapter path pageviews |
| 5 | Are readers continuing into subsequent chapters? | Custom `chapter_advance` with **destination chapter** in properties or proven via event `requestPath`; compare aggregate counts to `chapter_open` (ratio — not session conversion) |
| 6 | Downloads or chapter audio? | Custom `book_download`; `reader_audio_started` must identify book/chapter via bounded ID and/or automatic path dimensions — not constant props alone |
| 7 | Do questions, trails, and search help? | Custom `reading_path_started`; search events with buckets only; path pageviews |
| 8 | Plausible human vs anomalous traffic? | Heuristic report slices: country × device × path family × referrer emptiness |

**Explicit non-claims:**

- Do not claim session-level conversion, retention, or user journeys from aggregate event counts alone.
- Do not derive exact “completion rates” unless the data model supports them (it currently does not).
- Distinguish **event counts** from **unique visitors** in every report section.
- Without a target chapter ID (or proven path attribution), do **not** claim that a specific source/thinker page led readers into a specific chapter — only type-level navigation (`source`→`chapter`) is supported today.

---

## 3. Current architecture (verified 2026-10-17)

```mermaid
flowchart LR
  subgraph consentGated [Consent-gated]
    Banner[CookieBanner]
    GA[GoogleAnalyticsLoader]
    TrackGA[trackEvent / TrackedLink]
    Banner --> GA
    Banner --> TrackGA
    TrackGA --> GA4[GA4]
  end
  subgraph alwaysOn [Always on]
    VA["Analytics + SpeedInsights"]
    Intent[trackVercelIntent]
    VA --> VercelWA[Vercel Web Analytics]
    Intent --> VercelWA
  end
  UI[Site UI] --> TrackGA
  UI --> Intent
```

| Layer | Paths | Behavior |
|-------|-------|----------|
| GA4 load | `apps/site/components/analytics/google-analytics.tsx`, `apps/site/app/layout.tsx` | Production only; preview opt-in via `NEXT_PUBLIC_GA_ENABLE_PREVIEW`; Consent Mode deny-until-Accept |
| GA4 events | `apps/site/lib/analytics/events.ts`, `track.ts`, `track-reader.ts`, `track-books-catalog.ts` | Rich taxonomy; IDs and buckets only; never manuscript text or raw queries |
| Vercel | `<Analytics />` + `<SpeedInsights />` in layout; `apps/site/lib/analytics/vercel-intent.ts` | Always mounted; custom intents via `track()` with try/catch isolation |
| Consent | `apps/site/lib/consent/*`, `apps/site/components/consent/*` | Cookie `ac_cookie_consent`; gates GA only |
| CSP | `apps/site/lib/security/headers.ts` | Allows GA hosts + `va.vercel-scripts.com` + `vitals.vercel-insights.com` |
| Privacy copy | `apps/site/app/privacy/page.tsx` | Documents GA4 only — **omits Vercel Analytics / Speed Insights** |
| GA reporting | `apps/site/.cursor/skills/ga-trends/`, `tools/ga_trends_brief.py`, `apps/site/scripts/ga4-*.sh` | PADE capability `google-analytics.read` |
| Vercel diagnostics | `apps/site/.cursor/skills/vercel-diagnostics/` | PADE capability `vercel.diagnostics` (CLI whoami/ls/inspect/logs) |
| Vercel reader reporting | `apps/site/.cursor/skills/reader-analytics/`, `tools/reader_analytics_brief.py`, `apps/site/scripts/vercel-web-analytics-query.sh`, `scripts/reader-analytics-test.sh` | PADE `vercel.analytics.read` (fallback `vercel.diagnostics`) |

### Environment separation (preserve)

| Environment | GA4 | Vercel Analytics |
|-------------|-----|------------------|
| `next dev` (`NODE_ENV !== production`) | Off | Script present; platform typically ignores non-deploy traffic |
| Vercel preview | Off unless `NEXT_PUBLIC_GA_ENABLE_PREVIEW` | Collected under `environment=preview` (filterable in API) |
| Vercel production | On (consent-gated events) | On |

---

## 4. Confirmed Vercel entitlements and constraints

Live probe via PADE (`vercel.diagnostics`) against team `ksteffes-projects` / project `after-certainty` (`prj_RgOjCRadnw2ILa8vK9jy4GqipdLl`) on **2026-10-17**:

| Fact | Evidence | Status |
|------|----------|--------|
| Plan | **Pro** (`billing.plan`) | Account observation |
| Web Analytics Plus | Appeared enabled (~$10/mo `invoiceItems.analytics` quantity 1) | **Dated account-specific observation** — re-verify in dashboard before assuming 8 properties in PR 1; not an invariant of the codebase |
| Custom event properties | **Up to 8** with Plus; **2** on base Pro per [Vercel pricing docs](https://vercel.com/docs/analytics/limits-and-pricing) | Doc limit vs account entitlement — design for the stricter of the two after re-check |
| Value types | `string`, `number`, `boolean`, `null`; no nested objects | Platform constraint |
| Name/key/value length | ≤ 255 characters each | Platform constraint |
| Reporting window | **24 months** with Plus (12 months base Pro; 1 month Hobby) | Doc / entitlement |
| Event pricing | Metered on Pro (~$0.03 per 1K events per docs); pageviews + custom events both count | Aligns with public pricing docs |
| Aggregate API | `GET /v1/query/web-analytics/visits/{count,aggregate}` and `…/events/{count,aggregate}` — works with broker token | Verified 2026-10-17 |
| Recent volume (approx.) | ~1.7k visitors / ~6.2k pageviews since mid-May 2026; custom events still sparse (~11 lifetime at probe time) | Snapshot |
| Anomaly signal (30d probe) | **SG ~830 visitors** vs **US ~91**; empty `referrerHostname` dominates | Snapshot |

**Design rule:** Prefer ≤2 properties per custom event so schemas remain valid if Plus is disabled or was never present. Use additional properties only when a primary outcome requires them, and re-confirm Plus in the Vercel billing UI before shipping a 3+ property shape.

**API honesty:** Aggregate endpoints return `count` / `pageviews` and `visitors`. They are **not** a session journey database. Multi-step “funnels” in reports must be framed as **comparable aggregate ratios**, not per-visitor paths.

---

## 5. Event inventory and classification

### 5.1 Already on Vercel (custom)

| Event | Properties | Source | Classification |
|-------|------------|--------|----------------|
| `corpus_navigation` | `from_type`, `to_type`, `relation` (3) | `CorpusNavigationRegion` → `trackVercelIntent` | **Retain** (Plus-dependent 3-prop shape; see fallback in §6) |
| `listen_item_selected` | `location`, `method` | Listen library | **Retain** (secondary; keep for Listen UX) |
| `listen_started` | `location`, `media_type` | Chapter audio player | **Consolidate** → facade name `reader_audio_started` in PR 1 |

Automatic Vercel pageviews, referrers, geo, device, browser, route, and UTM (Plus) are **retain** as the discovery/traffic backbone.

### 5.2 GA4 events — primary reader vocabulary

| GA4 event | Wired? | Destination today | Classification for Vercel migration |
|-----------|--------|-------------------|-------------------------------------|
| `chapter_open` | Yes — `RecordChapterOpen` | GA4 | **Retain** → dual-write as `chapter_open` |
| `next_chapter` | Yes — adjacent nav Next | GA4 | **Retain** → dual-write as `chapter_advance` (GA name kept during parallel run) |
| `file_download` | Yes — reader + overview | GA4 | **Retain** → dual-write as `book_download` (subset: book formats) |
| `question_path_start` / `trail_path_start` | Yes | GA4 | **Consolidate** → `reading_path_started` |
| `search_*` (open/query/select/refine/no_results/expand) | Yes | GA4 | **Investigate** for PR 1 minimal port (buckets only) vs path aggregates |
| `select_content` | Yes — Observatory / detail | GA4 | **Consolidate** — path aggregates + corpus edges often enough |
| `click` (outbound) | Yes — many CTAs | GA4 | **Investigate** — keep on GA during parallel; Vercel may not need parity |
| `page_view` | Consent Accept + Enhanced Measurement | GA4 | **Retire** on Vercel side (automatic visits) |

### 5.3 GA4 events — secondary / catalog / game

| Area | Events | Classification |
|------|--------|----------------|
| Books catalog | `books_catalog_view`, shelf/filter/sort/card selects | **Consolidate** → path aggregates; card select optional later |
| Books helpers unwired | `books_search`, `books_no_match`, `books_start_here_select` | **Retire** (dead helpers) unless wired for a real need |
| Editions / overview | edition notice/select; overview primary/concept/related/history | **Consolidate** |
| What’s New | `whats_new_*` | **Consolidate** |
| Questions extras | section view, stop open, related, continue book, observatory | **Consolidate**; keep path-start in primary vocab |
| Questions dead | `question_path_complete` (typed, no callers); `question_select` / `question_search_handoff` mostly unwired | **Retire** or wire only if Observe demand |
| Trails extras | select, stop, related, continue, handoff, observatory | **Consolidate** |
| Pattern Recognition game | `game_started`, challenge_*, `session_*` | **Investigate** — keep GA during parallel; Vercel port only if game Observe needs it |

### 5.4 Neither system today

| Gap | Notes |
|-----|-------|
| App-side bot / anomaly tagging | No `beforeSend` filters, honeypots, or custom “suspicious” events |
| Entity IDs on corpus edges | Vercel sends types only (`source`→`chapter`), not `source_id` / `book_id` |
| Session journeys | Unavailable on Vercel aggregate API by design |
| Privacy disclosure for Vercel | User-facing copy missing |

### 5.5 Coverage vs product questions

| Question | Today | Gap for Vercel-primary |
|----------|-------|------------------------|
| Discovery | GA + Vercel visits/referrers/UTM | Channel taxonomy in reports; GSC remains separate |
| Sources / thinkers | Path pageviews + type edges | Optional entity IDs (investigate); paths often enough |
| Source/thinker → books | `corpus_navigation` types | No IDs on edges; path co-occurrence is approximate |
| Books / chapters opened | GA `chapter_open` | Dual-write required |
| Continuation | GA `next_chapter` | Dual-write; report as aggregate ratio |
| Downloads / audio | GA downloads; Vercel listen | Dual-write downloads; align audio name |
| Questions / trails / search | Mostly GA | Minimal Vercel path-start + optional search buckets |
| Anomalous traffic | Platform filters only | Heuristic report slices (SG × desktop × research paths) |

---

## 6. Proposed minimal event schema

### 6.1 Typed facade and consent-preserving dispatch (PR 1)

Components call a **typed facade** (provider-agnostic). They must not know which provider receives an event.

**Dispatch order (required):**

1. Resolve the canonical event + normalized properties once.
2. **Vercel path** — always attempt `track()` / current `trackVercelIntent` equivalent, independent of cookie consent (matches today’s always-on Web Analytics pageviews). Failures swallowed; never block UI.
3. **GA4 path** — call existing consent-gated helpers (`isAnalyticsEnabled()` / `trackEvent` family) **separately**. If consent is denied or unknown, skip GA only.

Do **not** implement dual-write by nesting Vercel sends inside the GA-gated `trackEvent()` helper. That would incorrectly suppress Vercel custom events until Accept.

**Once-per-action / no duplicates:**

- Migrate call sites so each intended action hits the facade **once**.
- Do not leave parallel direct `trackVercelIntent('corpus_navigation'|'listen_started'|…)` calls beside the facade for the same click/play.
- Tests must cover **accepted**, **rejected**, and **unknown** consent: Vercel still fires; GA fires only when accepted (and production gates allow).

### 6.2 Primary vocabulary (PR 1)

| Canonical name | Reconciles with | Vercel properties (prefer ≤2; Plus only when justified) | Purpose |
|----------------|-----------------|--------------------------------------------------------|---------|
| `corpus_navigation` | existing Vercel event | Default: `from_type`, `to_type`, `relation` (3 — Plus-dependent). **Fallback** if Plus unavailable: `edge` (`source>chapter`) + `relation`. Optional **PR 1 spike outcome**: add privacy-safe `to_id` (stable chapter/book id) only on source/thinker → chapter/book edges — see §6.5 | Type-level graph navigation; specific-target only if spike requires `to_id` |
| `chapter_open` | GA `chapter_open` | `book_id`, `chapter_id` | Chapter opened |
| `chapter_advance` | GA `next_chapter` | **Must support destination insight:** prefer `from_chapter_id` + `to_chapter_id` (2 props; drop redundant `book_id` on Vercel if needed — book is implied by chapter id prefix / subsequent path). Do **not** ship `book_id` + `from_chapter_id` alone and claim chapter-to-chapter transitions | Continue to next chapter |
| `book_download` | GA `file_download` (book formats) | `book_id`, `format` | Download EPUB/PDF/DOCX/etc. |
| `reader_audio_started` | Vercel `listen_started` | Prefer `book_id` + `chapter_id` (or prove event `requestPath` reliably identifies the chapter). Constant-only `location`/`media_type` are **insufficient** to distinguish which book was heard | Chapter audio started |
| `reading_path_started` | GA `question_path_start` / `trail_path_start` | `path_kind` (`question`\|`trail`), `path_id` | Exploration path started |

During parallel measurement, GA may keep existing names (`next_chapter`, `file_download`, `listen_started` emit shape) while the facade uses canonical names toward Vercel.

### 6.3 Privacy constraints (non-negotiable)

- Never transmit manuscript text, titles as free text, summaries, raw search queries, personal information, or arbitrary URLs.
- Use normalized content types, stable IDs, and bounded enums/buckets only.
- Tracking failures must never block navigation, downloads, or playback (preserve try/catch / best-effort pattern).
- Preview vs production must remain distinguishable in queries (`environment` dimension).

### 6.4 High-cardinality avoidance

- Do not put full paths, referrer URLs, or query strings in custom properties (use automatic visit dimensions instead).
- Do not over-collect all navigation; prefer meaningful edges (especially source/thinker → book/chapter from semantic enrichment).
- Search (if ported): keep existing length/result/rank **buckets** only.

### 6.5 PR 1 validation spike — source/thinker → specific chapter

**Problem:** Today’s `corpus_navigation` proves only *type-level* navigation (e.g. `source`→`chapter`). It does **not** prove which chapter was selected from a particular source page. Pageview co-occurrence across paths also does **not** establish that click relationship.

**Spike (acceptance gate inside PR 1, before declaring editorial attribution solved):**

1. Query production (or preview with known fixtures) Vercel **events** and **visits** APIs: combine origin page context where available with `eventName eq 'corpus_navigation'` and `eventData/*`, plus `requestPath` / `route` aggregates for source, thinker, book, and chapter families.
2. Document what is and is not attributable with type-only properties.
3. If the editorial question (“this source → this chapter”) still cannot be answered, propose a **minimal** addition:
   - Privacy-safe `to_id` (stable semantic chapter or book id) on the relevant source/thinker → chapter/book events only — **not** arbitrary URLs, titles, or all-nav tracking.
   - Explicit property-budget tradeoff: adding `to_id` may require dropping one of `from_type` / `to_type` / `relation`, encoding an `edge` string, or confirming Plus (8 props) after billing re-check.
4. Default reporting language until the spike lands: **type-level only**.

**PR 1 outcome:** Spike complete — see [`apps/site/docs/reader-analytics-attribution-spike.md`](../../apps/site/docs/reader-analytics-attribution-spike.md). Type-only properties cannot prove source X → chapter Y. Instrumentation now attaches privacy-safe `to_id` on source/thinker → book/chapter edges only.

### 6.6 Reusable instrumentation to keep

| Path | Role in PR 1+ |
|------|----------------|
| `CorpusNavigationRegion` | Keep; route through facade once (no duplicate direct Vercel call) |
| `RecordChapterOpen`, `ChapterAdjacentNav` | Dual-write via facade; advance must carry destination chapter for Vercel |
| Reader / overview download handlers | Dual-write book downloads |
| Chapter audio player / listen library | Align names; ensure book/chapter identifiable; keep isolation |
| Question/trail path analytics beacons | Emit `reading_path_started` |
| `TrackedLink` | Remains GA-oriented during parallel run; do not duplicate blindly onto Vercel |
| Consent stack | Behavior unchanged for GA gating; privacy **copy** updated in PR 1 (see §7) |

---

## 7. Privacy, consent, and disclosure

| Topic | Current state | Migration implication |
|-------|---------------|------------------------|
| GA4 | Consent Mode deny-until-Accept; cookie banner | Keep through PR 3; cookie choice continues to control GA4 |
| Vercel Web Analytics | Always loaded; no consent gate in app code | Remains ungated during parallel measurement; **disclose accurately** |
| Speed Insights | Always loaded | Disclose alongside Web Analytics |
| Privacy page / cookie banner copy | Implies analytics off by default / clearing `ac_cookie_consent` stops analytics | **Inaccurate for deployed tracking.** Schedule a small, accurate copy fix **at the start of PR 1**, or as a separate immediate privacy PR before other PR 1 instrumentation. State clearly: cookie choice controls GA4; Vercel Web Analytics and Speed Insights collect aggregate first-party metrics regardless of that choice (until a future legal decision changes that) |
| Cookie banner after GA4 retirement | Unknown | **Decide explicitly in PR 4** after legal/privacy review — do not assume cookie-free analytics eliminates every notice obligation |

---

## 8. Cost awareness

| Cost driver | Notes |
|-------------|-------|
| Pageviews | Automatic; largest volume; avoid fake SPA double-counting |
| Custom events | Each `track()` counts; keep the primary vocabulary small |
| Web Analytics Plus | ~$10/mo team add-on per public docs; enables 8 properties, 24-month window, UTM — **re-verify entitlement before PR 1** (see §4) |
| Pro metered events | Roughly $0.03 / 1K events per public docs — monitor Usage dashboard during parallel measurement |
| GA4 | Free tier usage today; cost of **operational complexity** and consent surface more than dollars |

**Do not** introduce a data warehouse or third-party analytics provider without a clear need and approval.

---

## 9. Reporting vision (PR 2 — documented only)

### 9.1 Cursor skill: `reader-analytics`

Follow conventions from `apps/site/.cursor/skills/ga-trends/` and `vercel-diagnostics/`:

- `SKILL.md` + companion report payload doc
- Primary auth: PADE on Cloud Agents
- Fallback: local logged-in / token workflow without committing secrets
- Propose dedicated PADE capability **`vercel.analytics.read`** (read-only Web Analytics API) rather than permanently overloading `vercel.diagnostics`
- Never echo tokens; fail loudly with helpful errors; no invented data on API failure
- Rate-limit / backoff handling

### 9.2 Suggested weekly brief sections

1. Visitors and pageviews  
2. Discovery channels and referrers (classified — see §9.3)  
3. Most visited books, chapters, sources, thinkers (`requestPath` / `route`)  
4. Source/thinker → book/chapter navigation (`corpus_navigation` aggregates)  
5. Reader continuation and downloads (event counts + visitors; ratio caveats)  
6. Audio and exploration activity  
7. Traffic anomalies (heuristic)  
8. Changes vs previous comparable period  

Timezone: document explicitly (recommend **America/Denver** for continuity with `ga-trends`, with UTC bounds stated in the brief).

### 9.3 Referrer / channel heuristics

| Class | Heuristic (illustrative) |
|-------|--------------------------|
| Organic search referral | `referrerHostname` matches known search hosts (`google.*`, etc.) |
| Social or newsletter | Known social hosts, mail app hostnames, newsletter domains |
| Other external referral | Non-empty referrer not in above sets |
| No recorded referrer | Empty `referrerHostname` |
| Suspicious / automated-looking | Concentrated geo (e.g. SG) + desktop + research/thinker path family + empty referrer + low engagement custom events — **heuristic only** |

Never silently drop classified traffic from headline totals; show it as a breakdown.

### 9.4 Scripts

Small Python and/or shell clients (repo-local) producing Markdown and optional JSON. Unit-test formatting and client error paths offline. Prefer Make / mise entrypoints consistent with `ga-trends-test`.

---

## 10. Validation strategy and migration gates

### Gate 0 — Architecture plan (this PR)

- Inventory and schema reviewed
- Entitlements and property limits documented
- No production analytics behavior change

### Gate 1 — Instrumentation

- Core events fire once per intended action (both consent-accepted and consent-rejected/unknown)
- GA4 still works and remains consent-gated; Vercel customs are not suppressed by GA consent
- Privacy/cookie copy accurately describes which tools the cookie controls (start of PR 1 or preceding privacy PR)
- Source→chapter attribution spike completed and documented (§6.5); type-level vs `to_id` decision recorded
- `chapter_advance` and `reader_audio_started` properties (or proven path dimensions) support the stated reader outcomes
- Vercel payloads respect confirmed property limits after Plus re-check
- Automated tests pass
- Production verification instructions included

### Gate 2 — Reporting

- Weekly brief from **real** Vercel data
- Limitations section mandatory
- Skill documents run/interpret steps
- Client + formatter tests

### Gate 3 — Parallel measurement (**mandatory approval**)

Observation window: **2–4 weeks** of production data after PR 1 is live (extend if traffic is too sparse).

Compare (directional, not exact numeric parity):

- Google-referred visits  
- Reader actions recorded  
- Chapter opens / continuation  
- Downloads  
- Source→chapter navigation  
- Geography and anomalous traffic  
- Event collection gaps  
- Privacy / consent differences  
- Reporting usefulness  
- Unexpected costs  

Deliver a **decision report** covering:

1. What Vercel measures reliably  
2. What differs from GA4  
3. What would be lost by retiring GA4  
4. Whether remaining gaps matter to After Certainty  
5. Cost outcomes  
6. Explicit recommendation: retire GA4 / corrective PR / keep parallel longer  

**Do not start PR 4 without explicit human approval of this report.**

### Gate 4 — Retire GA4

Only after Gate 3 approval. Remove GA runtime completely; update privacy, CSP, env, skills, PADE, tests, docs. Document rollback (re-enable GA loader + measurement ID + Consent Mode from git history / prior release).

---

## 11. PR sequence

| PR | Branch | Base | Deliverables | Behavior change? |
|----|--------|------|--------------|------------------|
| **0** | `docs/vercel-reader-analytics-migration` | `main` | This plan + roadmap index registration | **No** |
| **1** | `feat/vercel-reader-instrumentation` | latest `main` after PR 0 merges | Accurate privacy/cookie copy first (or prior privacy PR); typed facade with consent-split dispatch; dual-write primary events; §6.5 attribution spike; tests (incl. consent states); verification notes | Yes (additive + copy) |
| **2** | `feat/vercel-reader-analytics-reporting` | latest `main` after PR 1 merges | API client, brief scripts, `reader-analytics` skill, tests | Reporting only |
| **3** | `test/vercel-reader-analytics-parity` | latest `main` after PR 2 merges | Validation artifacts + decision report | Docs/artifacts; no GA removal |
| **4** | `chore/retire-ga4` | latest `main` after PR 3 **approved** | Remove GA4; privacy/CSP/consent decision; skill cleanup | Yes (destructive) |

### Branch discipline

1. One focused branch per stage.  
2. Never commit directly to `main`.  
3. Start each implementation branch from latest `main` after the prerequisite merges.  
4. Avoid long-lived divergent branches.  
5. Do not combine stages into one enormous PR.  
6. Do not merge PRs automatically.  
7. Do not begin destructive work without approval.  
8. Include tests, manual verification, and rollback notes in each PR.  
9. Use GitHub CI and Vercel preview deployments for verification.  
10. Report blockers rather than weakening tests or silently changing scope.

### PR 1 acceptance criteria (preview)

- Privacy/cookie copy states that the cookie controls GA4 and that Vercel Web Analytics / Speed Insights are separate always-on aggregate tools (until a later legal decision)  
- Typed facade dispatches Vercel independently of GA consent; GA remains gated  
- Core reader events fire once per intended action in accepted **and** rejected/unknown consent tests (no duplicate `corpus_navigation` / audio events)  
- Existing GA4 functionality preserved  
- §6.5 spike documents what source/thinker → specific chapter measurement can prove; if `to_id` is required, schema + property-budget tradeoff is explicit  
- `chapter_advance` includes destination chapter (property or proven `requestPath`); `reader_audio_started` can distinguish books/chapters  
- Vercel custom-event payloads satisfy confirmed plan limits  
- Automated tests pass  
- Production verification instructions included  
- Source→chapter and thinker→chapter links from semantic enrichment emit `corpus_navigation` once via the facade  

### PR 2 acceptance criteria (preview)

- Reporting script generates a useful weekly brief from real Vercel data  
- Reports explain limitations  
- Cursor skill documents how to run and interpret reports  
- API client and formatting logic have tests  
- GA4 remains operational  

### PR 3 acceptance criteria (preview)

- Decision report addresses all six questions in Gate 3  
- Gaps either accepted or routed to a corrective PR  
- Explicit approval recorded before PR 4  

### PR 4 acceptance criteria (preview)

- No GA4 runtime network requests  
- Vercel Web Analytics and Speed Insights continue  
- Reader events remain functional  
- Privacy disclosures match implementation  
- No unnecessary GA credentials/runtime config  
- Relevant tests pass  
- Rollback plan documented  
- Historical GA reporting artifacts preserved as **legacy** where useful (`ga-trends` marked legacy or archived)  

---

## 12. Rollback plans (by stage)

| Stage | Rollback |
|-------|----------|
| PR 0 | Revert docs PR |
| PR 1 | Revert instrumentation PR; GA4 path unchanged by design — dual-write can be feature-flagged or removed while leaving GA helpers intact |
| PR 2 | Disable/ignore reporting scripts and skill; no production reader impact |
| PR 3 | Documentation only |
| PR 4 | Revert merge or redeploy prior release; restore GA measurement ID, Consent Mode defaults, CSP GA hosts, and `GoogleAnalyticsLoader` from git |

---

## 13. Out of scope

- Replacing Google Search Console  
- Building a custom event warehouse or dashboard product  
- Exact numeric parity between GA4 and Vercel  
- Profiling individual readers or reconstructing personal histories  
- Blocking or excluding visitors based on geo heuristics  
- Marketing attribution / ad conversion pipelines  

---

## 14. File map (implementation reference)

| Concern | Paths |
|---------|-------|
| Layout wiring | `apps/site/app/layout.tsx` |
| Event vocabulary | `apps/site/lib/analytics/events.ts` |
| GA send path | `apps/site/lib/analytics/track.ts`, `track-reader.ts` |
| Vercel intents | `apps/site/lib/analytics/vercel-intent.ts` |
| UI beacons / regions | `apps/site/components/analytics/*`, reading/listen/paths components |
| Consent | `apps/site/lib/consent/*`, `apps/site/components/consent/*` |
| Site config / GA gates | `apps/site/lib/site-config.ts`, `apps/site/.env.example` |
| Privacy | `apps/site/app/privacy/page.tsx` |
| CSP | `apps/site/lib/security/headers.ts` |
| GA skill / scripts | `apps/site/.cursor/skills/ga-trends/`, `apps/site/scripts/ga4-*.sh`, `tools/ga_trends_brief.py` |
| Reader analytics skill / scripts | `apps/site/.cursor/skills/reader-analytics/`, `apps/site/scripts/vercel-web-analytics-query.sh`, `scripts/reader-analytics-test.sh`, `tools/reader_analytics_brief.py` |
| PADE | `pade.yaml`, `.pade/agent-bindings.yaml` |
| Verify docs | `apps/site/docs/seo-analytics-verification.md` |

---

## 15. Immediate next step

After **PR 2** is reviewed and merged **by the owner**:

1. Open **PR 3** on `test/vercel-reader-analytics-parity` from latest `main`.  
2. Run the parallel-measurement observation window and write the Gate 3 decision report.  
3. Do **not** start PR 4 (retire GA4) without explicit approval of that report.

---

## Revision history

| Date | Change |
|------|--------|
| 2026-10-17 | PR 0: initial architecture, inventory, schema, gates, and PR sequence from live code + Vercel entitlement probe |
| 2026-10-17 | PR 0 follow-up: review clarifications — source→chapter attribution spike; consent-split facade + tests; early privacy-copy fix; `chapter_advance` / audio property sufficiency; Plus treated as dated observation |
| 2026-10-17 | PR 1 merged (instrumentation + privacy copy + attribution `to_id`); PR 2 reporting stack started |
| 2026-10-17 | PR 2: `reader-analytics` skill, Web Analytics query client, weekly brief + Make entry, PADE `vercel.analytics.read` |
