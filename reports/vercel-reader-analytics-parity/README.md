# Vercel ↔ GA4 parity snapshots (Gate 3)

Machine-readable companions to
[`docs/analytics/vercel-reader-analytics-parity-decision.md`](../../docs/analytics/vercel-reader-analytics-parity-decision.md).

## Refresh

```bash
make reader-analytics-parity
# or: bash scripts/reader-analytics-parity.sh
```

Requires PADE broker capabilities `google-analytics.read` and `vercel.analytics.read`.

Writes:

| Path | Contents |
|------|----------|
| `window.json` | Denver completed-week bounds |
| `raw/vercel_*.json` | Web Analytics aggregates |
| `raw/ga4_*.json` | GA4 Data API reports |
| `comparison-summary.json` | Compact directional summary |

Optional post-merge smoke files (manual queries) may appear as `*_after_clicks.json`.

## Interpretation

- Exact numeric parity is **not** the goal (consent split + different models).
- Gate 3 needs **2–4 weeks** after PR 1 before approving GA4 retirement.
- Same-day Vercel event queries: use `until=` = next calendar day.
