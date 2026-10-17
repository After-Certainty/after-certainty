# Reader analytics — report payloads

Companion to [`SKILL.md`](SKILL.md). All queries go through
[`apps/site/scripts/vercel-web-analytics-query.sh`](../../scripts/vercel-web-analytics-query.sh)
under `/v1/query/web-analytics/`.

Default project (overridable via env in the query child):

- `VERCEL_TEAM_ID` → `team_AGmFePuKXsdzBqJqHl3O9mL0`
- `VERCEL_PROJECT_ID` → `prj_RgOjCRadnw2ILa8vK9jy4GqipdLl` (`after-certainty`)

Default filter for briefs: `environment eq 'production'`.

## Week bounds

```bash
python3 tools/reader_analytics_brief.py --print-week-bounds
```

Emits America/Denver inclusive `current` / `prior` `{since,until}` for the last
**seven completed** Denver days ending **yesterday**, plus Denver-midnight UTC
instants and an `api_note` about Vercel date truncation.

## Pack queries (current window)

Replace `SINCE` / `UNTIL` with the Denver calendar dates. Capability: prefer
`vercel.analytics.read`, else `vercel.diagnostics`.

```bash
CAP=vercel.analytics.read   # or vercel.diagnostics
PADE=(pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml --capability "$CAP" --quiet --)
Q=apps/site/scripts/vercel-web-analytics-query.sh
F="environment eq 'production'"

"${PADE[@]}" "$Q" visits/count since="$SINCE" until="$UNTIL" "filter=$F"
"${PADE[@]}" "$Q" visits/aggregate since="$SINCE" until="$UNTIL" "filter=$F" by=day limit=14
"${PADE[@]}" "$Q" visits/aggregate since="$SINCE" until="$UNTIL" "filter=$F" by=referrerHostname limit=25
"${PADE[@]}" "$Q" visits/aggregate since="$SINCE" until="$UNTIL" "filter=$F" by=country limit=15
"${PADE[@]}" "$Q" visits/aggregate since="$SINCE" until="$UNTIL" "filter=$F" by=deviceType limit=10
"${PADE[@]}" "$Q" visits/aggregate since="$SINCE" until="$UNTIL" "filter=$F" by=requestPath limit=30
"${PADE[@]}" "$Q" events/aggregate since="$SINCE" until="$UNTIL" "filter=$F" by=eventName limit=40

CF="environment eq 'production' and eventName eq 'corpus_navigation'"
# Joint attribution (preferred)
"${PADE[@]}" "$Q" events/aggregate since="$SINCE" until="$UNTIL" "filter=$CF" \
  by=requestPath by=eventData/to_id limit=40
"${PADE[@]}" "$Q" events/aggregate since="$SINCE" until="$UNTIL" "filter=$CF" \
  by=eventData/from_type by=eventData/to_type limit=30
# Secondary marginals
"${PADE[@]}" "$Q" events/aggregate since="$SINCE" until="$UNTIL" "filter=$CF" by=eventData/from_type limit=20
"${PADE[@]}" "$Q" events/aggregate since="$SINCE" until="$UNTIL" "filter=$CF" by=eventData/to_type limit=20
"${PADE[@]}" "$Q" events/aggregate since="$SINCE" until="$UNTIL" "filter=$CF" by=eventData/to_id limit=30
```

Repeat with prior-window dates into a second directory. Render:

```bash
python3 tools/reader_analytics_brief.py \
  --current-dir "$OUT/current" \
  --prior-dir "$OUT/prior" \
  --since "$SINCE" --until "$UNTIL" \
  --prior-since "$PRIOR_SINCE" --prior-until "$PRIOR_UNTIL"
```

Or run the full pack: `make reader-analytics-test`.

## Channel classification (brief heuristics)

| Class | Rule |
|-------|------|
| `organic_search` | `referrerHostname` matches known search hosts |
| `social_or_newsletter` | known social / mail host fragments |
| `other_external` | non-empty host not in the above |
| `no_recorded_referrer` | empty hostname |

Never drop classified traffic from headline visitor/pageview totals.

## One-off probes

```bash
# Totals only
pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml \
  --capability vercel.diagnostics --quiet -- \
  apps/site/scripts/vercel-web-analytics-query.sh visits/count \
  since=2026-10-01 until=2026-10-17 "filter=environment eq 'production'"

# Custom event names
pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml \
  --capability vercel.diagnostics --quiet -- \
  apps/site/scripts/vercel-web-analytics-query.sh events/aggregate \
  since=2026-10-01 until=2026-10-17 "filter=environment eq 'production'" by=eventName limit=40
```
