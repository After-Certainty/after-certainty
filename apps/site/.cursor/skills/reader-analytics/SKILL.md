---
name: reader-analytics
description: >-
  Pulls Vercel Web Analytics reader briefs for After Certainty. Primary path:
  PADE v0.4.0 broker on Cursor Cloud Agents (capability vercel.analytics.read,
  fallback vercel.diagnostics). Use when the user asks for reader analytics,
  Vercel Web Analytics trends, discovery/readership metrics, weekly reader
  briefs, or corpus_navigation / chapter_open reporting. Prefer this skill over
  ga-trends for Vercel-primary questions during parallel measurement.
---

# Reader analytics (Vercel Web Analytics — After Certainty)

## Auth paths

| Priority | Path | When |
|----------|------|------|
| **Primary** | PADE broker + `pade exec --capability vercel.analytics.read` | Cursor Cloud Agent (this repo) |
| **Fallback (broker)** | Same scripts with `--capability vercel.diagnostics` | Until the broker grants `vercel.analytics.read` (identical `VERCEL_TOKEN` Material) |
| **Fallback (local)** | Logged-in `vercel` CLI + exported `VERCEL_TOKEN` only inside a child process | Local laptop — never commit tokens |

On Cloud Agents, **do not** use Vercel MCP, `vercel login`, `--token` in chat, or a session `VERCEL_TOKEN`. Material is injected only into `pade exec` children.

## Prerequisites

### Cloud Agent (primary — PADE broker)

- Released **PADE v0.4.0** on `PATH` (from [`.cursor/install-pade.sh`](../../../../.cursor/install-pade.sh))
- [`pade.yaml`](../../../../pade.yaml) and [`.pade/agent-bindings.yaml`](../../../../.pade/agent-bindings.yaml) at repo root
- Cursor Cloud Agent VM (identity socket for OIDC)
- Query helper: [`apps/site/scripts/vercel-web-analytics-query.sh`](../../scripts/vercel-web-analytics-query.sh)
- Brief renderer: [`tools/reader_analytics_brief.py`](../../../../tools/reader_analytics_brief.py)

### Local laptop (fallback)

- A Vercel token with Web Analytics read access for team `ksteffes-projects` / project `after-certainty`
- Inject token only for the query child (`VERCEL_TOKEN=… apps/site/scripts/vercel-web-analytics-query.sh …`); never paste into chat or commits

## When the user runs this skill

1. **Choose auth path:** Cloud Agent → PADE; local laptop → token-in-child fallback.
2. Prefer **`make reader-analytics-test`** (full pack + markdown brief). Override pause with `PADE_PAUSE=1.5`.
3. Default window: last **7 completed America/Denver calendar days ending yesterday** (excludes today's partial day), plus prior comparable 7 completed days. Brief shows Denver labels and Vercel-resolved UTC query bounds.
4. Always include the **Limitations** section from the renderer — aggregate counts are not session journeys; unavailable optional queries must not look like zeroes.
5. If `vercel.analytics.read` is undeclared or denied by the broker, retry with `vercel.diagnostics` (the pack script does this automatically).

### PADE execution (single query)

```bash
pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml \
  --capability vercel.analytics.read --quiet -- \
  apps/site/scripts/vercel-web-analytics-query.sh visits/count \
  since=2026-10-10 until=2026-10-17 "filter=environment eq 'production'"
```

Until the broker grants `vercel.analytics.read`, substitute `--capability vercel.diagnostics`.

Parallel `pade exec` can hit broker identity-mint contention. Run **≤3 concurrent** calls, or sequential with ~1s pauses (`PADE_PAUSE` in the pack script).

Exact endpoint pack: [reports.md](reports.md).

## Standard report pack

Cloud Agent path: `make reader-analytics-test`. Brief renderer: [`tools/reader_analytics_brief.py`](../../../../tools/reader_analytics_brief.py).

| # | Report file | Endpoint | Purpose |
|---|-------------|----------|---------|
| 1 | `visits_count.json` | `visits/count` | Visitors + pageviews (**required**) |
| 2 | `visits_by_day.json` | `visits/aggregate` `by=day` | Daily trend |
| 3 | `visits_by_referrer.json` | `visits/aggregate` `by=referrerHostname` | Discovery channels |
| 4 | `visits_by_country.json` | `visits/aggregate` `by=country` | Geography / anomaly |
| 5 | `visits_by_device.json` | `visits/aggregate` `by=deviceType` | Device mix |
| 6 | `visits_by_path.json` | `visits/aggregate` `by=requestPath` | Top overall paths (partial; path-prefix filters unsupported) |
| 7 | `events_by_name.json` | `events/aggregate` `by=eventName` | Custom reader vocabulary |
| 8 | `corpus_by_origin_and_to_id.json` | `events/aggregate` `by=requestPath` + `by=eventData/to_id` | **Joint** origin→destination pairs |
| 9 | `corpus_by_from_to_type.json` | `by=eventData/from_type` + `by=eventData/to_type` | **Joint** edge-type counts |
| 10–12 | `corpus_by_{from_type,to_type,to_id}.json` | single-dimension marginals | Secondary context only |

Default filter: `environment eq 'production'`. Corpus rows add `and eventName eq 'corpus_navigation'`. Prior window repeats into a sibling directory for WoW deltas. Optional corpus queries that fail are written as `{"status":"unavailable",…}` — never silent empty zeroes.

## Brief sections (always)

1. Visitors and pageviews  
2. Discovery channels and referrers (classified heuristics)  
3. Most visited books, chapters, sources, thinkers  
4. Source/thinker → book/chapter navigation (`corpus_navigation`)  
5. Reader continuation and downloads (aggregate ratios only)  
6. Audio and exploration activity  
7. Traffic anomalies (heuristic — never silently drop from headlines)  
8. Changes vs previous comparable period  

Timezone: **America/Denver** completed-day week bounds ending yesterday; brief header also shows Vercel-resolved UTC query bounds.

## Interpretation guardrails

- **Aggregate only:** do not claim session conversion, retention, or personal journeys.
- **Ratios:** `chapter_advance / chapter_open` is an event-count ratio, not a per-reader continuation rate.
- **`to_id`:** empty rows mean type-level-only or pre-instrumentation traffic — say so.
- **Anomalies:** SG-heavy desktop + empty referrer + research paths is a **heuristic**, not bot proof.
- **GA4 parallel:** during dual-write, expect directional not exact parity with `ga-trends`.
- **API failure:** fail loudly; never invent rows. Soft-skip only corpus property breakdowns when the API rejects a `by=` key.

## Security guardrails

- **Never echo `$VERCEL_TOKEN`** or paste tokens into chat, commits, or PR descriptions.
- Do not write `.vercel/.env.*.local` on Cloud Agents.
- If `pade exec` fails with **401/403**, check broker policy subject and Cloud Agent identity:

```bash
pade identity --audience "https://pade-broker-754719312452.us-central1.run.app"
```

Expected allowed subject: `user:253367178`.

## Related

- Migration roadmap: [`docs/roadmaps/vercel-reader-analytics-migration.md`](../../../../docs/roadmaps/vercel-reader-analytics-migration.md) §9  
- Attribution spike: [`apps/site/docs/reader-analytics-attribution-spike.md`](../../docs/reader-analytics-attribution-spike.md)  
- GA4 parallel skill (legacy during migration): [`ga-trends`](../ga-trends/SKILL.md)  
- Vercel CLI diagnostics (whoami/ls/inspect/logs): [`vercel-diagnostics`](../vercel-diagnostics/SKILL.md)  
