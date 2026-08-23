---
name: ga-trends
description: >-
  Pulls Google Analytics 4 trend reports for After Certainty. Primary path:
  PADE v0.2.0 broker on Cursor Cloud Agents. Fallback: analytics MCP on local
  laptop. Use when the user asks for GA trends, traffic updates, analytics
  reports, weekly metrics, or a regular analytics check.
---

# GA4 trends (After Certainty)

## Auth paths

| Priority | Path | When |
|----------|------|------|
| **Primary** | PADE broker + `pade exec --capability google-analytics.read` | Cursor Cloud Agent (this repo) |
| **Fallback** | MCP `user-analytics-mcp` + `gcloud auth application-default login` | Local laptop / MCP already configured |

## Prerequisites

### Cloud Agent (primary — PADE broker)

- Released **PADE v0.2.0** on `PATH` (from [`.cursor/install-pade.sh`](../../../../.cursor/install-pade.sh) via [`.cursor/environment.json`](../../../../.cursor/environment.json))
- [`pade.yaml`](../../../../pade.yaml) and [`.pade/agent-bindings.yaml`](../../../../.pade/agent-bindings.yaml) at repo root
- Cursor Cloud Agent VM (identity socket for OIDC)
- **Do not** require `gcloud auth application-default login` on Cloud Agents
- **Do not** mount GA service-account JSON, GitHub App keys, or `KSM_CONFIG` on the agent VM

### Local laptop (fallback — MCP)

- MCP server: `user-analytics-mcp` (Google `analytics-mcp`)
- Read tool schemas under `mcps/user-analytics-mcp/tools/` before calling
- **Property ID for MCP reports:** `properties/430022966` (not measurement ID `G-H7FSEF4WLW`) — verify against broker if unsure
- If MCP auth fails, tell the user to run `gcloud auth application-default login` (ADC expires after ~7 days in testing mode)

### Property ID

- **PADE path:** use `$GA_PROPERTY_ID` injected by the broker into `pade exec` children. Run property-meta once per session if unknown:

```bash
pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml \
  --capability google-analytics.read --quiet -- \
  apps/site/scripts/ga4-property-meta.sh
```

- **Do not hardcode** a property ID in PADE report calls — the broker sets `GA_PROPERTY_ID`.
- **MCP fallback:** default to `properties/430022966` unless property-meta or Admin confirms otherwise.

Timezone in reports: America/Denver

## When the user runs this skill

1. **Choose auth path:** Cloud Agent → PADE; local desktop with MCP configured → MCP fallback.
2. **Batch report calls** (do not serialize unnecessarily):
   - **MCP fallback:** run all reports in one parallel batch.
   - **PADE path:** run **≤3 concurrent** `pade exec` calls, or sequential with ~1s pauses — parallel `pade exec` can hit broker identity-mint contention.
3. Use date range **`7daysAgo` → `today`** for weekly trends unless the user asks otherwise.
4. For week-over-week comparison, add a second range **`14daysAgo` → `8daysAgo`** with empty dimensions (GA returns a `dateRange` column automatically).
5. If a report returns **zero rows**, retry the same query with `endDate: "today"` (excluding today often yields empty data on low-traffic properties).

### PADE execution

Run each report via `pade exec` and the repo scripts. Property ID comes from `$GA_PROPERTY_ID` (URL in script), not the JSON body.

```bash
pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml \
  --capability google-analytics.read --quiet -- \
  apps/site/scripts/ga4-run-report.sh '<json-body>'
```

Realtime reports use `ga4-run-realtime-report.sh` instead.

Exact REST JSON bodies: [reports.md](reports.md) (PADE path section).

### MCP execution

Use `CallMcpTool` with `server: "user-analytics-mcp"`. Exact MCP JSON: [reports.md](reports.md) (MCP fallback section).

## Standard report pack

Run these every time unless the user narrows scope. Cloud Agent path: `make ga-trends-test` (13 core reports + realtime screens + optional custom-dimension breakdowns 14–15). Brief renderer: [`tools/ga_trends_brief.py`](../../../../tools/ga_trends_brief.py).

| # | Report | Tool | Purpose |
|---|--------|------|---------|
| 1 | Overview + WoW | `run_report` | sessions, users, page views, engagement, duration |
| 2 | Daily trend | `run_report` | `date` dimension |
| 3 | Channels | `run_report` | `sessionDefaultChannelGroup` |
| 4 | Top pages | `run_report` | `pagePath`, limit 30 (path-area + slug bucketing) |
| 5 | Events | `run_report` | `eventName`, limit 25 (all events, including automatic) |
| 6 | Devices | `run_report` | `deviceCategory` |
| 7 | Geography | `run_report` | `country`, limit 10 |
| 8 | Realtime pulse | `run_realtime_report` | active users + top screens |
| 9 | Device OS | `run_report` | `deviceCategory` + `operatingSystem` (you vs not you) |
| 10 | Mobile models | `run_report` | `mobileDeviceBranding` + `mobileDeviceModel` (mobile only) |
| 11 | Session source | `run_report` | `sessionSourceMedium` (Facebook, Vercel, Tag Assistant) |
| 12 | Site custom events | `run_report` | `eventName` inList of shipped `AnalyticsEvents`, limit 50 |
| 13 | Landing pages | `run_report` | `landingPage` (fallback `landingPagePlusQueryString`), limit 15 |
| 14 | Observatory breakdown | `run_report` | `select_content` × `customEvent:content_type` / `item_id` / `method` (skip on 400) |
| 15 | Outbound click breakdown | `run_report` | `click` × `customEvent:location` / `platform` (skip on 400) |

Exact JSON arguments: [reports.md](reports.md). Report 12 body can be emitted with `python3 tools/ga_trends_brief.py --report-body 12` so the inList stays in sync with the catalog.

**Include in the brief (already in report 1/6/7 JSON):** `newUsers`, `engagementRate`, `averageSessionDuration`, device category, country.

**Landing page 400:** retry report 13 with `landingPagePlusQueryString` (`--report-body 13b`). Do not fail the pack.

## Estimated you vs not you

Run reports **9–11** every time. Compute from **sessions** (not users). This is a **heuristic** until GA4 **internal traffic** (IP) is configured in Admin.

**Owner device profile** (default for After Certainty): Macintosh desktop + iPhone (model often missing; treat `iPhone 13` when present as a strong “you” signal).

### Inputs (from reports)

| Input | How to read |
|-------|-------------|
| `total` | Sessions from overview (Last7Days) |
| `definite_not_you` | Sum sessions where `operatingSystem` is **Android**, **Linux**, or **Windows** (report 9) |
| `mac_ios_pool` | Sum sessions where OS is **Macintosh** or **iOS** (report 9) |
| `social_referral` | Sum sessions where report 11 source host is `facebook.com` or a `*.facebook.com` subdomain (split `sessionSourceMedium` on ` / `; not a URL substring) |
| `tooling_you` | Sum sessions where source is `vercel.com` or `tagassistant.google.com` (report 11) |
| `iphone13_you` | Sessions with `mobileDeviceModel` = `iPhone 13` (report 10) |
| `macintosh_sessions` | Sessions with `operatingSystem` = `Macintosh` (report 9) |

### Estimates

1. **Floor — definitely not you:** `definite_not_you` (wrong OS for Mac + iPhone).
2. **You signals (additive, cap at `mac_ios_pool`):**  
   `you_signals = tooling_you + iphone13_you + round(macintosh_sessions × 0.65)`  
   (`0.65` = default share of Mac desktop sessions attributed to the site owner; not precise.)
3. **Middle — estimated you:** `you_mid = min(mac_ios_pool, you_signals)`  
   **Middle — estimated not you:** `not_you_mid = total - you_mid`
4. **Range (show all three):**
   - **Low not you / high you:** `not_you_low = definite_not_you`, `you_high = total - not_you_low`
   - **High not you / low you:** `not_you_high = definite_not_you + social_referral`, `you_low = total - not_you_high`  
     (Facebook overlap with mobile OS is possible; note in output.)
   - **Middle:** use step 3.

Always state that **GA does not label “you”** without internal traffic; recommend **Admin → Data streams → Define internal traffic** for a definitive split.

Call out in the block: generic **iPhone** (no model) may still be the owner; **Nexus 5X** / **Linux** are usually bots or cloud, not readers.

## Site custom events (source of truth)

After consent, the site sends the names in `AnalyticsEvents` (`apps/site/lib/analytics/events.ts`). Group report 12 into product-activity tables. Omit empty surfaces. `question_path_complete` is defined but **not currently fired**.

| Surface | Events |
|---------|--------|
| **Reader funnel (ANALYTICS-001)** | `chapter_open` → `next_chapter` → `file_download` |
| **Search** | `search_open`, `search_query`, `search_select`, `search_refine`, `search_no_results`, `search_expand` |
| **Questions** | `question_section_view`, `question_select`, `question_path_start`, `question_stop_open`, `question_related_select`, `question_continue_book`, `question_search_handoff`, `question_observatory_pathway` |
| **Trails** | `trail_index_view`, `trail_select`, `trail_path_start`, `trail_stop_open`, `trail_related_select`, `trail_continue_book`, `trail_search_handoff`, `trail_observatory_pathway` |
| **Books catalog** | `books_catalog_view`, `books_shelf_select`, `books_filter_*`, `books_sort_change`, `books_search`, `books_card_select`, `books_no_match`, `books_start_here_select` |
| **Book overview** | `book_overview_primary_action`, `book_overview_concept_select`, `book_overview_related_select`, `book_overview_edition_history_open`, `edition_*` |
| **Observatory** | `select_content` (`content_type`, `item_id`, `method`) |
| **What's new** | `whats_new_view`, `whats_new_select`, `whats_new_filter`, `whats_new_home_select` |
| **Games** | `game_started`, `challenge_answered`, `challenge_completed`, `related_content_opened`, `session_completed`, `session_delight_shown` |
| **Outbound / recommended** | `click` (outbound CTA), `file_download`, `generate_lead` (newsletter — **future**, not in `AnalyticsEvents` yet) |

Call out whether `select_content`, `file_download`, and `click` appear. Absence usually means low traffic, consent denied, or non-production. Enhanced Measurement may also emit `click` / `file_download`; do not treat those as a session funnel.

**Path-area buckets** (from report 4 `pagePath`, not event params): `/` home, `/start`, `/explore/books/…/chapters/` reader, other `/explore/books/` catalog/overview, other `/explore/`, `/questions/`, `/trails/`, `/search`, `/games/`, `/whats-new`, `/podcast`, other. Parse book/question/trail/chapter **slugs** from those paths.

### Custom dimensions (probed 2026-08-20)

**Registered** (`customEvent:`): `content_type`, `item_id`, `location`, `method`, `platform`, `file_extension`, `file_name`, `link_url`, `link_text`.

**Not registered:** `book_id`, `question_id`, `trail_id`, `surface`, `action_kind`. Those views stay on `pagePath` slugs until Admin registration.

Probe:

```bash
pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml \
  --capability google-analytics.read --quiet -- \
  apps/site/scripts/ga4-get-metadata.sh \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print('\n'.join(sorted(x['apiName'] for x in d.get('dimensions',[]) if x.get('apiName','').startswith('customEvent:'))))"
```

Reports 14–15 use the registered dims. **Do not fail the pack** if a custom-dimension report 400s.

## Optional deep dives (user must ask or say "full")

- **28-day totals:** `28daysAgo` → `today`, no dimensions
- **Explore/Observatory:** filter `pagePath` contains `/explore` or events `select_content`
- **Funnel:** `run_funnel_report` — home → explore → select_content (MCP only; see reports.md)
- **Conversions:** `run_conversions_report` if key events are marked in GA4 Admin (MCP only)

## Output template

Prefer `python3 tools/ga_trends_brief.py <report-json-dir>` (what `make ga-trends-test` prints). Deliver a single markdown brief:

```markdown
# GA trends — After Certainty
**Property:** [resolved GA_PROPERTY_ID] · **Range:** [dates] · **Pulled:** [today]

## Headline
[1–2 sentences: up/down/flat vs prior week, caveats if all traffic is one day]

## Overview
| Metric | This period | Prior period |
|--------|------------:|-------------:|
sessions, activeUsers, newUsers, screenPageViews, engagedSessions, engagementRate, averageSessionDuration, eventCount

## Daily / Channels / Devices / Geography
[tables]

## Where they land
| Landing page | Sessions | Users |

## What they view (path areas)
| Area | Page views |

## Top pages
[table, first 15 of report 4]

## Top content (from URLs)
Books / questions / trails / chapters — slugs from pagePath

## Events
Top automatic + custom (⭐ = site custom)

## What they did (product activity)
Per-surface tables from report 12; omit empty groups

## Reader funnel
chapter_open / next_chapter / file_download counts and ratios (not a true session funnel)

## Search health
search_query vs search_no_results vs search_select (omit rates if search_query is 0)

## Estimated you vs not you
Heuristic only (owner devices: Mac + iPhone). Configure internal traffic in GA4 for a definitive split.

| | Sessions | % of total |
|---|----------:|-----------:|
| **Definitely not you** (Android / Linux / Windows) | N | % |
| Mac + iOS pool (mixed) | N | % |
| — Tooling (Vercel, Tag Assistant) | N | |
| — iPhone 13 (model reported) | N | |
| **Estimated you (middle)** | N | % |
| **Estimated not you (middle)** | N | % |

Range: not you **low**–**high** = [definite_not_you] – [definite_not_you + social_referral]; you the complement.

Device/OS table + top `sessionSourceMedium` rows. One-line caveat on overlap and iPhone model masking.

## Realtime
Active users now: N

## Notes
- Consent / custom events / data quality caveats
- Custom dimensions still unregistered → pagePath slugs only
- Suggested follow-ups (1–3 bullets)
```

## Interpretation guardrails

- **Low volume:** do not over-interpret single-day spikes; say when the entire window is one date.
- **Channel totals** can exceed session counts (attribution quirks); prefer sessions for channel ranking.
- **Unassigned** channel often means missing UTM / direct app traffic — note, don't panic.
- **Engagement rate** near 0 with few sessions is noisy.
- **You vs not you:** never present the middle estimate as exact; show the range and recommend internal-traffic IP filters. iPhone model is often `(not set)` or generic `iPhone` even for the owner's device.
- **Reader funnel / search rates:** event counts are not session-scoped; `next_chapter / chapter_open` can exceed 1.0 with repeat readers.
- **`click` / `file_download`:** may mix Enhanced Measurement with site `trackEvent`.
- **`question_path_complete`:** defined in TypeScript, not fired yet — do not treat absence as a product bug.

## Security guardrails

- **Never echo `$GA_ACCESS_TOKEN`** or paste tokens into chat, commits, or PR descriptions.
- If `pade exec` fails with **401/403**, check broker policy subject and Cloud Agent identity:

```bash
pade identity --audience "https://pade-broker-754719312452.us-central1.run.app"
```

Expected allowed subject: `user:253367178`. MCP path remains documented for local dev without broker.

## Property discovery

- **PADE:** run `ga4-property-meta.sh` once if `$GA_PROPERTY_ID` / display name is unknown.
- **MCP:** only run `get_account_summaries` if property ID is unknown or user asks about accounts. Default to `properties/430022966`.
