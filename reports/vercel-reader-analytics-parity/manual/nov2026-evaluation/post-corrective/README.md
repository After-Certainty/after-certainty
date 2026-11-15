# Post-corrective verification (PR #770)

Collected after production deploy of the path-start queue stub + `site_search` dual-write.

## Method

1. Confirm Site CI green and production deployment Ready for the merge commit.
2. Playwright production smoke against `www.after-certainty.com` (shell Playwright, not computerUse):
   - Cookie **Accept analytics**
   - Hard-load one question + one trail
   - Run `/search` (URL + typed query)
3. PADE `vercel.analytics.read` queries with exclusive-end ISO bounds and `environment eq 'production'`.

**Note:** Default Playwright `navigator.webdriver` leaves `window.va` as the queue stub (insights collector does not initialize). Smoke used `--disable-blink-features=AutomationControlled` plus `navigator.webdriver` override so the real collector could flush `/_vercel/insights/event`.

## Results (America/Denver labels; API window since 2026-11-14T00:00Z until exclusive 2026-11-16)

See `findings-summary.json` and the `events_*.json` files in this directory.

- `reading_path_started` present (question + trail path_id dims)
- `site_search` present (bucket props only: surface, result_count_bucket, has_results / query_length_bucket — no raw query text in Vercel props)
