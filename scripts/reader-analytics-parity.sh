#!/usr/bin/env bash
# Collect a Gate 3 parity snapshot: GA4 + Vercel Web Analytics for approximately
# the same America/Denver completed-week calendar labels.
#
# Writes (regenerable):
#   reports/vercel-reader-analytics-parity/window.json
#   reports/vercel-reader-analytics-parity/raw/{vercel,ga4}_*.json
#   reports/vercel-reader-analytics-parity/comparison-summary.json
#
# Never overwrites (human / provenance):
#   reports/vercel-reader-analytics-parity/gate-decision.json
#   reports/vercel-reader-analytics-parity/manual/**
#
# Requires PADE: google-analytics.read + vercel.analytics.read
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
export PATH="$HOME/.local/bin:$ROOT/.venv/bin:$PATH"
export PYTHONPATH="$ROOT/tools${PYTHONPATH:+:$PYTHONPATH}"
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
# Vercel: ISO UTC midnights (approx calendar week). Aggregate endpoints may resolve until at T01:00
# on the same exclusive-end day as visits/count T00:00 — validated in reader_analytics_parity.py.
read -r VERCEL_SINCE VERCEL_UNTIL <<<"$(python3 -c "
from reader_analytics_parity import vercel_iso_request_bounds
s,u=vercel_iso_request_bounds('$SINCE','$UNTIL')
print(s, u)
")"

echo "==> parity Denver inclusive labels: ${SINCE} → ${UNTIL}" >&2
echo "==> Vercel ISO request: since=${VERCEL_SINCE} until=${VERCEL_UNTIL}" >&2
echo "==> GA4 uses property timezone America/Denver for the same date labels (approx alignment)" >&2

if [[ -f "$ART/gate-decision.json" ]]; then
  cp "$ART/gate-decision.json" "$ART/.gate-decision.before.json"
  echo "==> preserving gate-decision.json (will verify unchanged after summary build)" >&2
fi

assert_real_file() {
  local path="$1"
  python3 -c "
import json,sys
from reader_analytics_parity import assert_not_fake, is_fake_payload
p=sys.argv[1]
d=json.load(open(p))
assert_not_fake(d, path=p)
" "$path"
}

vquery() {
  local name="$1"; shift
  echo "==> vercel ${name}" >&2
  if ! pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml \
    --capability "$CAP_VERCEL" --quiet -- \
    "$Q" "$@" >"$RAW/vercel_${name}.json" 2>"$RAW/vercel_${name}.err"; then
    echo "error: vercel ${name} failed" >&2
    cat "$RAW/vercel_${name}.err" >&2 || true
    return 1
  fi
  assert_real_file "$RAW/vercel_${name}.json"
  sleep "$PADE_PAUSE"
}

gquery() {
  local name="$1" body="$2"
  echo "==> ga4 ${name}" >&2
  if ! pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml \
    --capability google-analytics.read --quiet -- \
    apps/site/scripts/ga4-run-report.sh "$body" \
    >"$RAW/ga4_${name}.json" 2>"$RAW/ga4_${name}.err"; then
    echo "error: ga4 ${name} failed" >&2
    cat "$RAW/ga4_${name}.err" >&2 || true
    return 1
  fi
  assert_real_file "$RAW/ga4_${name}.json"
  sleep "$PADE_PAUSE"
}

# All Vercel queries share the same ISO since/until request pair.
vquery visits_count visits/count since="$VERCEL_SINCE" until="$VERCEL_UNTIL" "filter=${ENV_FILTER}"
vquery visits_referrer visits/aggregate since="$VERCEL_SINCE" until="$VERCEL_UNTIL" "filter=${ENV_FILTER}" by=referrerHostname limit=20
vquery visits_country visits/aggregate since="$VERCEL_SINCE" until="$VERCEL_UNTIL" "filter=${ENV_FILTER}" by=country limit=15
vquery visits_device visits/aggregate since="$VERCEL_SINCE" until="$VERCEL_UNTIL" "filter=${ENV_FILTER}" by=deviceType limit=10
vquery visits_path visits/aggregate since="$VERCEL_SINCE" until="$VERCEL_UNTIL" "filter=${ENV_FILTER}" by=requestPath limit=25
vquery events_by_name events/aggregate since="$VERCEL_SINCE" until="$VERCEL_UNTIL" "filter=${ENV_FILTER}" by=eventName limit=40
vquery corpus_pairs events/aggregate since="$VERCEL_SINCE" until="$VERCEL_UNTIL" \
  "filter=environment eq 'production' and eventName eq 'corpus_navigation'" \
  by=requestPath by=eventData/to_id limit=30
vquery corpus_edges events/aggregate since="$VERCEL_SINCE" until="$VERCEL_UNTIL" \
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

python3 tools/reader_analytics_parity.py build-summary \
  --art-dir "$ART" \
  --since "$SINCE" \
  --until "$UNTIL" \
  --vercel-until-param "$VERCEL_UNTIL"

if [[ -f "$ART/.gate-decision.before.json" ]]; then
  python3 tools/reader_analytics_parity.py check-gate-decision-stable \
    --art-dir "$ART" \
    --before "$ART/.gate-decision.before.json"
  rm -f "$ART/.gate-decision.before.json"
fi

# Do not touch manual/ or gate-decision.json contents beyond the stability check above.
find "$RAW" -name '*.err' -size 0 -delete 2>/dev/null || true

echo "reader-analytics-parity: wrote ${ART}/comparison-summary.json (gate-decision.json preserved)" >&2
