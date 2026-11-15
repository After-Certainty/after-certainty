# November 2026 Gate 3 final evaluation pack

Evidence for the 2026-11-14 decision and review follow-up. **Not** overwritten by `make reader-analytics-parity`.

Re-collect Vercel windows (exclusive-end ISO) and validate:

```bash
bash scripts/collect-nov2026-evaluation-pack.sh
python3 tools/reader_analytics_parity.py validate-evidence-pack \
  --pack-dir reports/vercel-reader-analytics-parity/manual/nov2026-evaluation/current \
  --since 2026-11-07 --until 2026-11-13
```

| Path | Role |
|------|------|
| `window-meta.json` | Denver labels + exclusive-end UTC request bounds |
| `findings-summary.json` | Headline rollup used by the decision report |
| `brief.md` / `brief-summary.json` | Vercel reader brief (current 7 + prior 7) |
| `current/` / `prior-week/` | Vercel Web Analytics JSON for those weeks |
| `full/` | Vercel pack for completed observation **2026-10-17 → 2026-11-13** |
| `full/events_reading_path_started.json` | Filtered probe — empty after reconcile |
| `ga4_full/` | Matching GA4 Data API reports (Denver date labels) |
| `vercel_billing_snapshot_2026-11-14.txt` | Fresh Pro / Plus / event-price probe |

October owner smoke and the original billing snapshot remain in the parent `manual/` directory.
