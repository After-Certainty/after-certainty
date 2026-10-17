#!/usr/bin/env bash
# Collect a Gate 3 parity snapshot: GA4 + Vercel Web Analytics for the same
# America/Denver completed-week window. Writes JSON under
# reports/vercel-reader-analytics-parity/raw/ and a comparison-summary.json.
#
# Requires PADE broker: google-analytics.read + vercel.analytics.read
# (vercel.analytics.read may fall back only if you edit CAP_VERCEL below).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
export PATH="$HOME/.local/bin:$ROOT/.venv/bin:$PATH"
if ! command -v pade >/dev/null 2>&1 && [[ -x "$ROOT/.tools/pade/pade" ]]; then
  export PATH="$ROOT/.tools/pade:$PATH"
fi

ART="${READER_ANALYTICS_PARITY_DIR:-reports/vercel-reader-analytics-parity}"
RAW="$ART/raw"
mkdir -p "$RAW"

PADE_PAUSE="${PADE_PAUSE:-0.75}"
CAP_VERCEL="${CAP_VERCEL:-vercel.analytics.read}"
ENV_FILTER="environment eq 'production'"
Q=apps/site/scripts/vercel-web-analytics-query.sh

BOUNDS_JSON="$(python3 tools/reader_analytics_brief.py --print-week-bounds)"
echo "$BOUNDS_JSON" >"$ART/window.json"
SINCE="$(python3 -c "import json,sys; print(json.load(sys.stdin)['current']['since'])" <<<"$BOUNDS_JSON")"
UNTIL="$(python3 -c "import json,sys; print(json.load(sys.stdin)['current']['until'])" <<<"$BOUNDS_JSON")"
echo "==> parity window (Denver completed): ${SINCE} → ${UNTIL}" >&2

vquery() {
  local name="$1"; shift
  echo "==> vercel ${name}" >&2
  pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml \
    --capability "$CAP_VERCEL" --quiet -- \
    "$Q" "$@" >"$RAW/vercel_${name}.json" 2>"$RAW/vercel_${name}.err"
  sleep "$PADE_PAUSE"
}

gquery() {
  local name="$1" body="$2"
  echo "==> ga4 ${name}" >&2
  pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml \
    --capability google-analytics.read --quiet -- \
    apps/site/scripts/ga4-run-report.sh "$body" \
    >"$RAW/ga4_${name}.json" 2>"$RAW/ga4_${name}.err"
  sleep "$PADE_PAUSE"
}

vquery visits_count visits/count since="$SINCE" until="$UNTIL" "filter=${ENV_FILTER}"
vquery visits_referrer visits/aggregate since="$SINCE" until="$UNTIL" "filter=${ENV_FILTER}" by=referrerHostname limit=20
vquery visits_country visits/aggregate since="$SINCE" until="$UNTIL" "filter=${ENV_FILTER}" by=country limit=15
vquery visits_device visits/aggregate since="$SINCE" until="$UNTIL" "filter=${ENV_FILTER}" by=deviceType limit=10
vquery visits_path visits/aggregate since="$SINCE" until="$UNTIL" "filter=${ENV_FILTER}" by=requestPath limit=25
vquery events_by_name events/aggregate since="$SINCE" until="$UNTIL" "filter=${ENV_FILTER}" by=eventName limit=40
vquery corpus_pairs events/aggregate since="$SINCE" until="$UNTIL" \
  "filter=environment eq 'production' and eventName eq 'corpus_navigation'" \
  by=requestPath by=eventData/to_id limit=30
vquery corpus_edges events/aggregate since="$SINCE" until="$UNTIL" \
  "filter=environment eq 'production' and eventName eq 'corpus_navigation'" \
  by=eventData/from_type by=eventData/to_type limit=20

gquery overview "{\"dateRanges\":[{\"startDate\":\"${SINCE}\",\"endDate\":\"${UNTIL}\",\"name\":\"parity\"}],\"metrics\":[{\"name\":\"sessions\"},{\"name\":\"activeUsers\"},{\"name\":\"totalUsers\"},{\"name\":\"screenPageViews\"},{\"name\":\"eventCount\"},{\"name\":\"engagedSessions\"},{\"name\":\"engagementRate\"}]}"
gquery channels "{\"dateRanges\":[{\"startDate\":\"${SINCE}\",\"endDate\":\"${UNTIL}\"}],\"dimensions\":[{\"name\":\"sessionDefaultChannelGroup\"}],\"metrics\":[{\"name\":\"sessions\"},{\"name\":\"activeUsers\"}],\"orderBys\":[{\"metric\":{\"metricName\":\"sessions\"},\"desc\":true}],\"limit\":15}"
gquery source_medium "{\"dateRanges\":[{\"startDate\":\"${SINCE}\",\"endDate\":\"${UNTIL}\"}],\"dimensions\":[{\"name\":\"sessionSourceMedium\"}],\"metrics\":[{\"name\":\"sessions\"},{\"name\":\"activeUsers\"}],\"orderBys\":[{\"metric\":{\"metricName\":\"sessions\"},\"desc\":true}],\"limit\":20}"
gquery country "{\"dateRanges\":[{\"startDate\":\"${SINCE}\",\"endDate\":\"${UNTIL}\"}],\"dimensions\":[{\"name\":\"country\"}],\"metrics\":[{\"name\":\"sessions\"},{\"name\":\"activeUsers\"}],\"orderBys\":[{\"metric\":{\"metricName\":\"sessions\"},\"desc\":true}],\"limit\":15}"
gquery device "{\"dateRanges\":[{\"startDate\":\"${SINCE}\",\"endDate\":\"${UNTIL}\"}],\"dimensions\":[{\"name\":\"deviceCategory\"}],\"metrics\":[{\"name\":\"sessions\"},{\"name\":\"activeUsers\"}],\"orderBys\":[{\"metric\":{\"metricName\":\"sessions\"},\"desc\":true}]}"
gquery pages "{\"dateRanges\":[{\"startDate\":\"${SINCE}\",\"endDate\":\"${UNTIL}\"}],\"dimensions\":[{\"name\":\"pagePath\"}],\"metrics\":[{\"name\":\"screenPageViews\"},{\"name\":\"activeUsers\"}],\"orderBys\":[{\"metric\":{\"metricName\":\"screenPageViews\"},\"desc\":true}],\"limit\":25}"
gquery events "{\"dateRanges\":[{\"startDate\":\"${SINCE}\",\"endDate\":\"${UNTIL}\"}],\"dimensions\":[{\"name\":\"eventName\"}],\"metrics\":[{\"name\":\"eventCount\"}],\"orderBys\":[{\"metric\":{\"metricName\":\"eventCount\"},\"desc\":true}],\"limit\":40}"
gquery reader_events "{\"dateRanges\":[{\"startDate\":\"${SINCE}\",\"endDate\":\"${UNTIL}\"}],\"dimensions\":[{\"name\":\"eventName\"}],\"metrics\":[{\"name\":\"eventCount\"}],\"dimensionFilter\":{\"filter\":{\"fieldName\":\"eventName\",\"inListFilter\":{\"values\":[\"chapter_open\",\"next_chapter\",\"file_download\",\"question_path_start\",\"trail_path_start\",\"select_content\",\"click\"]}}},\"orderBys\":[{\"metric\":{\"metricName\":\"eventCount\"},\"desc\":true}],\"limit\":20}"

python3 - <<'PY' "$ART" "$SINCE" "$UNTIL"
import json, sys
from datetime import UTC, datetime
from pathlib import Path

art = Path(sys.argv[1])
raw = art / "raw"
since, until = sys.argv[2], sys.argv[3]

def load(name):
    p = raw / name
    return json.loads(p.read_text()) if p.exists() else None

def ga_metrics(payload):
    if not payload or not payload.get("rows"):
        return {}
    names = [h["name"] for h in payload.get("metricHeaders", [])]
    vals = [m["value"] for m in payload["rows"][0]["metricValues"]]
    return dict(zip(names, vals))

def ga_event_map(payload):
    out = {}
    for row in (payload or {}).get("rows") or []:
        name = row["dimensionValues"][0]["value"]
        out[name] = int(float(row["metricValues"][0]["value"]))
    return out

def vercel_event_map(payload):
    out = {}
    for row in (payload or {}).get("data") or []:
        if isinstance(row, dict) and row.get("eventName"):
            out[row["eventName"]] = {
                "count": int(row.get("count") or 0),
                "visitors": int(row.get("visitors") or 0),
            }
    return out

v_visits = (load("vercel_visits_count.json") or {}).get("data") or {}
g_overview = ga_metrics(load("ga4_overview.json"))
v_events = vercel_event_map(load("vercel_events_by_name.json"))
g_reader = ga_event_map(load("ga4_reader_events.json"))
g_all = ga_event_map(load("ga4_events.json"))

summary = {
    "generated_at_utc": datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
    "timezone": "America/Denver",
    "window": {"since": since, "until": until, "rule": "last_7_completed_denver_days_ending_yesterday"},
    "pr1_merged_at_utc": "2026-10-17T21:15:09Z",
    "observation_window_note": (
        "Gate 3 requires 2–4 weeks after PR 1. Snapshots taken before that window completes "
        "are baseline / early-signal only — not approval to retire GA4."
    ),
    "vercel": {
        "visitors": v_visits.get("visitors"),
        "pageviews": v_visits.get("pageviews"),
        "events": v_events,
        "google_referrer_visitors": next(
            (
                r.get("visitors")
                for r in (load("vercel_visits_referrer.json") or {}).get("data") or []
                if r.get("referrerHostname") == "google.com"
            ),
            0,
        ),
        "top_countries": (load("vercel_visits_country.json") or {}).get("data") or [],
    },
    "ga4": {
        "overview": g_overview,
        "reader_events": g_reader,
        "selected_events": {
            k: g_all.get(k, 0)
            for k in (
                "chapter_open",
                "next_chapter",
                "file_download",
                "page_view",
                "session_start",
                "search_query",
            )
        },
        "organic_search_sessions": next(
            (
                int(float(r["metricValues"][0]["value"]))
                for r in (load("ga4_channels.json") or {}).get("rows") or []
                if r["dimensionValues"][0]["value"] == "Organic Search"
            ),
            0,
        ),
    },
    "directional_comparisons": {
        "volume_scale": "Vercel visitors include ungated aggregate traffic; GA4 is consent-gated — expect large numeric gaps",
        "chapter_open": {
            "ga4_event_count": g_reader.get("chapter_open", g_all.get("chapter_open", 0)),
            "vercel_event_count": (v_events.get("chapter_open") or {}).get("count", 0),
        },
        "corpus_navigation_vercel_only": (v_events.get("corpus_navigation") or {}),
    },
}

(art / "comparison-summary.json").write_text(json.dumps(summary, indent=2) + "\n")
print(json.dumps(summary, indent=2))
PY

echo "reader-analytics-parity: wrote ${ART}/comparison-summary.json" >&2
