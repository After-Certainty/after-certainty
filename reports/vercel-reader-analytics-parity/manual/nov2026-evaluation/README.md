# November 2026 Gate 3 final evaluation pack

Append-only evidence for the 2026-11-14 decision. **Not** overwritten by `make reader-analytics-parity`.

| Path | Role |
|------|------|
| `window-meta.json` | Denver labels + UTC request bounds |
| `findings-summary.json` | Headline rollup used by the decision report |
| `brief.md` / `brief-summary.json` | Vercel reader brief (current 7 + prior 7) |
| `current/` / `prior-week/` | Vercel Web Analytics JSON for those weeks |
| `full/` | Vercel pack for completed observation **2026-10-17 → 2026-11-13** |
| `ga4_full/` | Matching GA4 Data API reports (Denver date labels) |
| `vercel_billing_snapshot_2026-11-14.txt` | Fresh Pro / Plus / event-price probe |

October owner smoke and the original billing snapshot remain in the parent `manual/` directory.
