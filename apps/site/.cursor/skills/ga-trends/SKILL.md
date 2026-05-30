---
name: ga-trends
description: >-
  Pulls Google Analytics 4 trend reports for After Certainty via the analytics
  MCP (user-analytics-mcp). Use when the user asks for GA trends, traffic
  updates, analytics reports, weekly metrics, or to run a regular analytics
  check.
---

# GA4 trends (After Certainty)

## Prerequisites

- MCP server: `user-analytics-mcp` (Google `analytics-mcp`)
- Read tool schemas under `mcps/user-analytics-mcp/tools/` before calling
- **Property ID for reports:** `properties/497528828` (not measurement ID `G-H7FSEF4WLW`)
- Timezone in reports: America/Denver

If MCP auth fails, tell the user to run `gcloud auth application-default login` (ADC expires after ~7 days in testing mode).

## When the user runs this skill

1. **Batch all `run_report` / `run_realtime_report` calls in one parallel tool batch** (do not serialize).
2. Use date range **`7daysAgo` → `today`** for weekly trends unless the user asks otherwise.
3. For week-over-week comparison, add a second range **`14daysAgo` → `8daysAgo`** with empty `dimensions` (GA returns a `dateRange` column automatically).
4. If a report returns **zero rows**, retry the same query with `end_date: "today"` (excluding today often yields empty data on low-traffic properties).

## Standard report pack

Run these every time unless the user narrows scope:

| # | Report | Tool | Purpose |
|---|--------|------|---------|
| 1 | Overview + WoW | `run_report` | sessions, users, page views, engagement |
| 2 | Daily trend | `run_report` | `date` dimension |
| 3 | Channels | `run_report` | `sessionDefaultChannelGroup` |
| 4 | Top pages | `run_report` | `pagePath`, limit 15 |
| 5 | Events | `run_report` | `eventName`, limit 25 |
| 6 | Devices | `run_report` | `deviceCategory` |
| 7 | Geography | `run_report` | `country`, limit 10 |
| 8 | Realtime pulse | `run_realtime_report` | active users + top screens |
| 9 | Device OS | `run_report` | `deviceCategory` + `operatingSystem` (you vs not you) |
| 10 | Mobile models | `run_report` | `mobileDeviceBranding` + `mobileDeviceModel` (mobile only) |
| 11 | Session source | `run_report` | `sessionSourceMedium` (Facebook, Vercel, Tag Assistant) |

Exact JSON arguments: [reports.md](reports.md)

## Estimated you vs not you

Run reports **9–11** every time. Compute from **sessions** (not users). This is a **heuristic** until GA4 **internal traffic** (IP) is configured in Admin.

**Owner device profile** (default for After Certainty): Macintosh desktop + iPhone (model often missing; treat `iPhone 13` when present as a strong “you” signal).

### Inputs (from reports)

| Input | How to read |
|-------|-------------|
| `total` | Sessions from overview (Last7Days) |
| `definite_not_you` | Sum sessions where `operatingSystem` is **Android**, **Linux**, or **Windows** (report 9) |
| `mac_ios_pool` | Sum sessions where OS is **Macintosh** or **iOS** (report 9) |
| `social_referral` | Sum sessions where `sessionSourceMedium` contains `facebook.com` or `m.facebook.com` (report 11) |
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

## Custom events to highlight

After consent, the site sends (see `lib/analytics/events.ts`):

| Event | Meaning |
|-------|---------|
| `select_content` | Observatory focus / entity engagement (`content_type`, `item_id`, `method`) |
| `file_download` | Book EPUB/PDF/DOCX |
| `click` | Outbound CTA (`outbound: true`, `location`, `platform`) |
| `generate_lead` | Newsletter (future) |

In the events report, call out whether these appear. Absence usually means low traffic, consent denied, or non-production.

## Optional deep dives (user must ask or say "full")

- **28-day totals:** `28daysAgo` → `today`, no dimensions
- **Explore/Observatory:** filter `pagePath` contains `/explore` or events `select_content`
- **Funnel:** `run_funnel_report` — home → explore → select_content (see reports.md)
- **Conversions:** `run_conversions_report` if key events are marked in GA4 Admin

## Output template

Deliver a single markdown brief:

```markdown
# GA trends — After Certainty
**Property:** properties/497528828 · **Range:** [dates] · **Pulled:** [today]

## Headline
[1–2 sentences: up/down/flat vs prior week, caveats if all traffic is one day]

## Overview
| Metric | This period | Prior period (if any) |
|--------|------------:|----------------------:|

## Daily
| Date | Sessions | Users | Page views |

## Channels / Pages / Events
[tables]

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
- Suggested follow-ups (1–3 bullets)
```

## Interpretation guardrails

- **Low volume:** do not over-interpret single-day spikes; say when the entire window is one date.
- **Channel totals** can exceed session counts (attribution quirks); prefer sessions for channel ranking.
- **Unassigned** channel often means missing UTM / direct app traffic — note, don't panic.
- **Engagement rate** near 0 with few sessions is noisy.
- **You vs not you:** never present the middle estimate as exact; show the range and recommend internal-traffic IP filters. iPhone model is often `(not set)` or generic `iPhone` even for the owner's device.

## Property discovery

Only run `get_account_summaries` if property ID is unknown or user asks about accounts. Default to `properties/497528828`.
