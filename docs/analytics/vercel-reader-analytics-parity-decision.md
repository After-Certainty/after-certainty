# Gate 3 decision report — Vercel reader analytics parity

**Status:** Baseline + early dual-write verification — **not** approval to retire GA4  
**Date:** 2026-10-17  
**Roadmap:** [`docs/roadmaps/vercel-reader-analytics-migration.md`](../roadmaps/vercel-reader-analytics-migration.md) §10 Gate 3  
**Artifacts:** [`reports/vercel-reader-analytics-parity/`](../../reports/vercel-reader-analytics-parity/)  
**Re-run:** `bash scripts/reader-analytics-parity.sh` (or `make reader-analytics-parity`)

---

## Context

| Milestone | When (UTC) |
|-----------|------------|
| PR 1 instrumentation merged (#694) | 2026-10-17T21:15:09Z |
| PR 2 reporting merged (#696) | 2026-10-17T22:14:33Z |
| This Gate 3 snapshot | 2026-10-17 (same calendar day as PR 1) |

Gate 3 requires **2–4 weeks** of production data after PR 1. This report records a **baseline week** (mostly pre-instrumentation), an **owner production smoke** after merge, and an explicit recommendation. It does **not** authorize PR 4.

**Completed Denver week used for baseline comparison:** 2026-10-10 → 2026-10-16  
**Post-merge smoke window:** 2026-10-17 → 2026-10-18 (API inclusive until next calendar day)

---

## Recommendation (question 6, stated first)

**Keep parallel measurement longer.** Do **not** start `chore/retire-ga4` (PR 4).

| Checkpoint | Date | Purpose |
|------------|------|---------|
| Earliest revisit | **2026-10-31** | ≥2 weeks after PR 1 |
| Preferred decision | **2026-11-14** | ~4 weeks; richer dual-write volume |
| Approval gate | Human sign-off on an **updated** copy of this report | Required before PR 4 |

Re-run: `make reader-analytics-parity`, refresh this document’s tables, then record approval (or extend again / open a corrective PR).

---

## Snapshot totals (directional — not numeric parity)

### Baseline week 2026-10-10 → 2026-10-16 (pre–PR 1 dual-write for most traffic)

| System | Volume signal | Reader customs |
|--------|---------------|----------------|
| **Vercel** (ungated) | 176 visitors / 208 pageviews | `corpus_navigation` 4, `listen_item_selected` 6; **no** `chapter_open` |
| **GA4** (consent-gated) | 9 sessions / 4 activeUsers / 32 pageviews | `chapter_open` 2 |

Google discovery (directional): Vercel `google.com` referrer ≈ 11 visitors; GA4 Organic Search ≈ 5 sessions.

Geography: Vercel dominated by **SG** (98 visitors) vs **US** (18) — anomaly heuristic, not bot proof. Empty `referrerHostname` ≈ 131 visitors.

### Post-merge owner smoke (2026-10-17 production clicks)

After intentional production navigation (cookie Accept), Vercel Web Analytics recorded:

| Event | Count | Properties observed |
|-------|------:|---------------------|
| `chapter_open` | 2 | `book_id` + `chapter_id` (semantic IDs) |
| `chapter_advance` | 3 | `from_chapter_id` + `to_chapter_id` chain |
| `book_download` | 1 | `book_id` + `format=pdf` |
| `corpus_navigation` | 3 | Joint `requestPath` × `to_id`; Goodhart source → chapter **with** `to_id` |

GA4 on the same calendar day still shows `chapter_open` (consent path intact). Exact count parity is not expected (consent split, naming, timing).

**API note:** For same-day Vercel event queries, pass `until=` as the **next** calendar day. `since=until=YYYY-MM-DD` can resolve to a ~1-hour empty window.

---

## Gate 3 questions

### 1. What Vercel measures reliably

- **Always-on visits:** pageviews, visitors, `requestPath`, country, device, `referrerHostname`, environment (production vs preview).
- **Custom reader vocabulary (verified in production smoke):** `chapter_open`, `chapter_advance`, `book_download`, `corpus_navigation` with bounded properties.
- **Joint attribution:** `requestPath` × `eventData/to_id` and `from_type` × `to_type` (≤2 `by=` dimensions; 3-way groupBy returned HTTP 400).
- **Reporting stack (PR 2):** `make reader-analytics-test` + `vercel.analytics.read` PADE capability (broker granted).

### 2. What differs from GA4

| Topic | Difference |
|-------|------------|
| Consent | Vercel customs/pageviews ungated; GA4 gated by cookie Accept |
| Volume | Vercel totals ≫ GA4 (expected) — do not treat as undercount of “real readers” without anomaly context |
| Event names | Facade: `chapter_advance` / `book_download` on Vercel vs GA `next_chapter` / `file_download` during parallel run |
| Journeys | Vercel aggregate API only — no session funnels |
| Search / catalog richness | GA4 still richer (`search_*`, many `select_content` / catalog events) unless later ported |
| Anomaly visibility | Vercel surfaces SG-heavy / empty-referrer traffic GA consent path largely never sees |

### 3. What would be lost by retiring GA4 now

- Consent-scoped engagement view and existing `ga-trends` workflow familiarity.
- Search and secondary event taxonomy not on Vercel.
- Historical GA-only series for week-over-week continuity during the thin post-merge period.
- Confidence from a full 2–4 week dual-write window (not yet available).

### 4. Whether remaining gaps matter to After Certainty

| Gap | Matters now? | Notes |
|-----|--------------|-------|
| Observation window incomplete | **Yes — blocks PR 4** | Roadmap rule |
| Dual-write smoke | **Addressed for core events** | Owner production clicks confirmed |
| Sparse organic dual-write volume | Yes for decision quality | Revisit ≥2026-10-31 |
| Session journeys | Accepted | Aggregate ratios only |
| Empty historical `to_id` | Partially addressed | New attribution rows can carry `to_id`; legacy empty remains |
| GA search/catalog depth | Moderate | Keep GA until Observe demand says otherwise |
| Cost (Plus ~$10/mo + metered events) | Monitor | No surprise spike yet; watch Usage |

### 5. Cost outcomes

Dated billing observation (2026-10-17, team invoice items via PADE diagnostics):

- Plan: **Pro**
- Web Analytics Plus: ~**$10/mo** (`analytics` invoice item price 1000¢)
- Custom/page events: metered (`webAnalyticsEvent` ~$0.003 / event in invoice metadata)

No evidence yet of unexpected cost from PR 1 dual-write (volume still low). Re-check Usage at the revisit date.

### 6. Explicit recommendation

**`keep_parallel_longer`**

- Gaps accepted for now: aggregate-only model; consent-split volume gap; incomplete window.
- Corrective PR: **none required** from this smoke for core dual-write — optional follow-up only if revisit shows missing events under real traffic.
- **PR 4 blocked** until a human updates/approves this report after the observation window.

---

## Comparison checklist (for revisit)

Re-run `make reader-analytics-parity` and fill:

| Question | Vercel | GA4 | Directional OK? |
|----------|--------|-----|-----------------|
| Google-referred visits | | | |
| Chapter opens | | | |
| Continuation (`chapter_advance` / `next_chapter`) | | | |
| Downloads | | | |
| Source→chapter (`to_id` pairs) | | | |
| Geography / anomaly | | | |
| Reporting usefulness (`reader-analytics` brief) | | | |
| Cost / Usage | | | |

---

## Approval record (PR 4 gate)

| Field | Value |
|-------|-------|
| Report version | 2026-10-17 baseline + dual-write smoke |
| Recommendation | keep_parallel_longer |
| Approver | _pending_ |
| Approval date | _pending_ |
| Decision | ☐ extend parallel   ☐ corrective PR   ☐ approve PR 4 (retire GA4) |

**Do not merge or open PR 4 without a completed approval row above on an updated report.**

---

## Revision history

| Date | Change |
|------|--------|
| 2026-10-17 | Initial Gate 3 baseline; owner production smoke confirms dual-write; recommend keep parallel |
