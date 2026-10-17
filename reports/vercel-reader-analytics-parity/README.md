# Vercel ↔ GA4 parity snapshots (Gate 3)

Companions to
[`docs/analytics/vercel-reader-analytics-parity-decision.md`](../../docs/analytics/vercel-reader-analytics-parity-decision.md).

## What re-running updates

```bash
make reader-analytics-parity
# or: bash scripts/reader-analytics-parity.sh
```

| Path | Updated? |
|------|----------|
| `window.json`, `raw/`, `comparison-summary.json` | **Yes** — regenerable |
| `gate-decision.json` | **No** — pack fails if mutated |
| `manual/` | **No** — owner smoke / billing only |

## Window alignment

- **Labels:** America/Denver inclusive completed week (`since` → `until`).
- **Vercel requests:** ISO UTC midnights for an approximate calendar week; exclusive `until` = day after inclusive end at `T00:00:00.000Z`.
- **Resolved quirk:** `visits/count` keeps `until` at `T00:00:00.000Z`; `*/aggregate` often resolves the **same UTC calendar day** at `T01:00:00.000Z`. The builder requires a shared exclusive-end **day** and rejects aggregates that end a full day earlier than count.
- **GA4:** same date labels in property timezone America/Denver.
- Comparisons are **approximate calendar days** (UTC vs Denver midnights), not identical instants.

## Fake tokens

`ga4-run-report.sh` and the Vercel query helper **refuse** fake/sentinel tokens unless `READER_ANALYTICS_ALLOW_FAKE_TOKEN=1`. The parity pack also rejects payloads whose `note` contains `fake token`.
