# Reader analytics — After Certainty

Generated: **2026-11-15 02:27 UTC**  
Timezone for week labels: **America/Denver** (last 7 **completed** days ending yesterday)  
Current window (Denver calendar): **2026-11-07 → 2026-11-13** (inclusive completed days)  
API query bounds (as resolved by Vercel): **2026-11-07T00:00:00.000Z** → **2026-11-14T00:00:00.000Z**  
Note: Vercel date params map to UTC midnights; non-midnight ISO times are truncated.  
Source: Vercel Web Analytics aggregate API (project `after-certainty`)

## Limitations

- These are **aggregate** pageviews, visitors, and event counts — **not** session-level journeys.
- Do not treat event ratios as per-reader conversion or completion rates.
- Custom events and pageviews use different identification methods than GA4; expect directional, not exact, parity.
- Origin→destination claims require joint `requestPath` × `eventData/to_id` rows with non-empty `to_id`; empty `to_id` is legacy/type-only.
- Anomaly classes are **heuristics**, not confirmed bot identity. Never silently exclude traffic from headlines.
- Unavailable optional queries are labeled explicitly — never rendered as genuine zeroes.
- Fake/sentinel API payloads fail closed and do not produce a brief.

## 1. Visitors and pageviews

| Metric | Value |
| --- | --- |
| Visitors | 150 |
| Pageviews | 172 |

### Daily trend

| Day (UTC stamp) | Visitors | Pageviews |
| --- | --- | --- |
| 2026-11-07 | 48 | 50 |
| 2026-11-08 | 29 | 38 |
| 2026-11-09 | 9 | 11 |
| 2026-11-10 | 15 | 16 |
| 2026-11-11 | 9 | 13 |
| 2026-11-12 | 10 | 13 |
| 2026-11-13 | 31 | 31 |

## 2. Discovery channels and referrers

| Channel class | Visitors | Pageviews |
| --- | --- | --- |
| no_recorded_referrer | 113 | 134 |
| organic_search | 9 | 9 |

Top referrer hostnames:

| Hostname | Visitors | Pageviews |
| --- | --- | --- |
| (empty) | 113 | 134 |
| google.com | 5 | 5 |
| bing.com | 2 | 2 |
| cn.bing.com | 1 | 1 |
| duckduckgo.com | 1 | 1 |

## 3. Top overall paths (partial family breakdown)

Coverage: top **15** of up to **30** overall `requestPath` rows (not family-complete). Path-prefix filters are unsupported by this API, so family rollups are **pageviews among those truncated rows only** — not distinct visitors and not a full census of sources/thinkers/chapters.

Partial family pageview rollup (from the truncated top paths):

| Family | Pageviews (partial) |
| --- | --- |
| other | 64 |
| discovery_home | 24 |
| chapter | 20 |
| source | 5 |
| listen | 4 |
| thinker | 3 |
| book | 2 |

Top overall paths:

| Path | Visitors | Pageviews |
| --- | --- | --- |
| Others | 56 | 64 |
| /explore | 13 | 14 |
| / | 5 | 7 |
| /explore/books/everyone-knows-love/chapters/parts-part-1-everyone-knows-love-chapter-1-everyone-knows-love | 2 | 7 |
| /explore/sources/goodhart-charles-a-e-problems-of-monetary-management-the-u-k | 4 | 5 |
| /listen | 4 | 4 |
| /explore/books/no-time-to-think/chapters/parts-part-2-where-the-constraint-went-chapter-7-the-launch-schedule | 3 | 3 |
| /explore/thinkers/donald-t-campbell | 3 | 3 |
| /start | 3 | 3 |
| /explore/books/how-serious-systems-learn/chapters/parts-part-2-disciplines-that-survived-reality-chapter-8-when-failure-is-not-an-option | 2 | 2 |
| /explore/books/no-time-to-think/chapters/parts-part-2-where-the-constraint-went-chapter-4-the-stopwatch | 2 | 2 |
| /explore/books/no-time-to-think/chapters/parts-part-3-responsible-speed-chapter-9-what-history-preserved | 2 | 2 |
| /explore/books/the-discipline-of-uncertainty/chapters/parts-part-3-probabilistic-truth-and-moral-seriousness-chapter-5-why-the-world-refuses-absolutes | 2 | 2 |
| /explore/books/when-accountability-no-longer-expires/chapters/parts-part-1-permanence-of-legitimacy-chapter-2-sacralization-and-inheritance | 2 | 2 |
| /explore/books/when-others-look-to-you-v1 | 2 | 2 |

## 4. Source/thinker → book/chapter navigation

`corpus_navigation` events (by name): **1** count / **1** visitors.

### Origin path × `to_id` (joint attribution)

Pairs answer which origin page targeted which destination ID. Empty `to_id` rows are **legacy/type-only** — do not claim a specific destination.

Source/thinker origins:

| Origin path | to_id | Count | Visitors | Status |
| --- | --- | --- | --- | --- |
| (none) | — | 0 | 0 | no rows |

Other origins (same joint query):

| Origin path | to_id | Count | Visitors | Status |
| --- | --- | --- | --- | --- |
| /explore/books/everyone-knows-love | (empty) | 1 | 1 | legacy/type-only (empty to_id) |

### Edge types (`from_type` × `to_type`)

Joint grouping — not separate marginal totals — so source→chapter counts are real edge counts.

| from_type | to_type | Count | Visitors |
| --- | --- | --- | --- |
| book | chapter | 1 | 1 |

### Secondary marginal totals (not attribution pairs)

_Shown only as context; prefer the joint tables above._

| from_type | Count | Visitors |
| --- | --- | --- |
| book | 1 | 1 |

| to_type | Count | Visitors |
| --- | --- | --- |
| chapter | 1 | 1 |

| to_id (marginal) | Count | Visitors |
| --- | --- | --- |
| (empty) | 1 | 1 |

## 5. Reader continuation and downloads

| Event | Count | Visitors |
| --- | --- | --- |
| chapter_open | 5 | 5 |
| chapter_advance | 2 | 1 |
| book_download | 0 | 0 |

Continuation ratio: 0.40 events per open (2/5) — aggregate ratio, not a session conversion rate

## 6. Audio and exploration activity

| Event | Count | Visitors |
| --- | --- | --- |
| reader_audio_started | 4 | 2 |
| reading_path_started | 0 | 0 |
| corpus_navigation | 1 | 1 |

## 7. Traffic anomalies

Geography (top):

| Country | Visitors | Pageviews |
| --- | --- | --- |
| SG | 72 | 75 |
| US | 25 | 41 |
| CN | 10 | 11 |
| TR | 2 | 4 |
| DE | 3 | 3 |
| CA | 2 | 2 |
| CH | 1 | 1 |
| EC | 1 | 1 |

Devices:

| Device | Visitors | Pageviews |
| --- | --- | --- |
| desktop | 110 | 121 |
| mobile | 10 | 21 |
|  | 1 | 1 |

- Heuristic: country **SG** is ~48% of overall visitors (72 / 150; 75 pageviews in country row). Treat as anomaly signal, not bot identity.
- Heuristic: desktop-heavy traffic (110 visitors in device breakdown vs 150 overall visitors in period).
- Heuristic: research/thinker/source paths show ~22 visitors in top path rows; empty-referrer visitors ~113. Combine with country/device above — not confirmed automation.

## 8. Changes from previous comparable period

Prior window: **2026-10-31 → 2026-11-06** (America/Denver completed calendar days; same length as current).

| Metric | Current | Prior | Delta |
| --- | --- | --- | --- |
| Visitors | 150 | 325 | -175 |
| Pageviews | 172 | 361 | -189 |
| chapter_open count | 5 | 10 | -5 |

Deltas are raw aggregate differences, not significance tests.
