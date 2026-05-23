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

Exact JSON arguments: [reports.md](reports.md)

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

## Property discovery

Only run `get_account_summaries` if property ID is unknown or user asks about accounts. Default to `properties/497528828`.
