#!/usr/bin/env bash
# Run the ga-trends standard report pack via PADE broker and print the markdown brief.
#
# Requires: pade v0.2.1 on PATH, pade.yaml, .pade/agent-bindings.yaml, Cloud Agent identity.
# Reports run sequentially with brief pauses to avoid broker identity-mint contention.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v pade >/dev/null 2>&1; then
  if [[ -x "$ROOT/.tools/pade/pade" ]]; then
    export PATH="$ROOT/.tools/pade:$PATH"
  else
    echo "error: pade not found; run bash .cursor/install-pade.sh first" >&2
    exit 1
  fi
fi

OUT="$(mktemp -d)"
trap 'rm -rf "$OUT"' EXIT

PADE_PAUSE="${PADE_PAUSE:-0.75}"

run_report() {
  local id="$1" body="$2" script="apps/site/scripts/ga4-run-report.sh"
  [[ "$id" == "8" || "$id" == "8b" ]] && script="apps/site/scripts/ga4-run-realtime-report.sh"
  if ! pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml \
    --capability google-analytics.read --quiet -- \
    "$script" "$body" >"$OUT/$id.json" 2>"$OUT/$id.err"; then
    echo "error: report $id failed" >&2
    cat "$OUT/$id.err" >&2
    return 1
  fi
  sleep "$PADE_PAUSE"
}

echo "==> ga-trends: property meta" >&2
pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml \
  --capability google-analytics.read --quiet -- \
  apps/site/scripts/ga4-property-meta.sh >&2
sleep "$PADE_PAUSE"

echo "==> ga-trends: fetching standard report pack (13 reports + custom-dimension breakdowns)" >&2

run_report 1 '{"dateRanges":[{"startDate":"7daysAgo","endDate":"today","name":"Last7Days"},{"startDate":"14daysAgo","endDate":"8daysAgo","name":"Prior7Days"}],"dimensions":[],"metrics":[{"name":"sessions"},{"name":"activeUsers"},{"name":"totalUsers"},{"name":"newUsers"},{"name":"screenPageViews"},{"name":"engagedSessions"},{"name":"engagementRate"},{"name":"averageSessionDuration"},{"name":"eventCount"}]}' \
  || exit 1
run_report 2 '{"dateRanges":[{"startDate":"7daysAgo","endDate":"today","name":"Last7Days"}],"dimensions":[{"name":"date"}],"metrics":[{"name":"sessions"},{"name":"activeUsers"},{"name":"screenPageViews"}],"orderBys":[{"dimension":{"dimensionName":"date","orderType":"ALPHANUMERIC"},"desc":false}]}' \
  || exit 1
run_report 3 '{"dateRanges":[{"startDate":"7daysAgo","endDate":"today","name":"Last7Days"}],"dimensions":[{"name":"sessionDefaultChannelGroup"}],"metrics":[{"name":"sessions"},{"name":"activeUsers"},{"name":"engagedSessions"}],"orderBys":[{"metric":{"metricName":"sessions"},"desc":true}],"limit":10}' \
  || exit 1
run_report 4 '{"dateRanges":[{"startDate":"7daysAgo","endDate":"today","name":"Last7Days"}],"dimensions":[{"name":"pagePath"}],"metrics":[{"name":"screenPageViews"},{"name":"activeUsers"}],"orderBys":[{"metric":{"metricName":"screenPageViews"},"desc":true}],"limit":30}' \
  || exit 1
run_report 5 '{"dateRanges":[{"startDate":"7daysAgo","endDate":"today","name":"Last7Days"}],"dimensions":[{"name":"eventName"}],"metrics":[{"name":"eventCount"}],"orderBys":[{"metric":{"metricName":"eventCount"},"desc":true}],"limit":25}' \
  || exit 1
run_report 6 '{"dateRanges":[{"startDate":"7daysAgo","endDate":"today","name":"Last7Days"}],"dimensions":[{"name":"deviceCategory"}],"metrics":[{"name":"sessions"},{"name":"activeUsers"}],"orderBys":[{"metric":{"metricName":"sessions"},"desc":true}]}' \
  || exit 1
run_report 7 '{"dateRanges":[{"startDate":"7daysAgo","endDate":"today","name":"Last7Days"}],"dimensions":[{"name":"country"}],"metrics":[{"name":"sessions"},{"name":"activeUsers"}],"orderBys":[{"metric":{"metricName":"sessions"},"desc":true}],"limit":10}' \
  || exit 1
run_report 8 '{"dimensions":[],"metrics":[{"name":"activeUsers"},{"name":"eventCount"}]}' \
  || exit 1
run_report 8b '{"dimensions":[{"name":"unifiedScreenName"}],"metrics":[{"name":"activeUsers"}],"orderBys":[{"metric":{"metricName":"activeUsers"},"desc":true}],"limit":10}' \
  || exit 1
run_report 9 '{"dateRanges":[{"startDate":"7daysAgo","endDate":"today","name":"Last7Days"}],"dimensions":[{"name":"deviceCategory"},{"name":"operatingSystem"}],"metrics":[{"name":"sessions"},{"name":"activeUsers"}],"orderBys":[{"metric":{"metricName":"sessions"},"desc":true}],"limit":25}' \
  || exit 1
run_report 10 '{"dateRanges":[{"startDate":"7daysAgo","endDate":"today","name":"Last7Days"}],"dimensions":[{"name":"deviceCategory"},{"name":"mobileDeviceBranding"},{"name":"mobileDeviceModel"}],"metrics":[{"name":"sessions"},{"name":"activeUsers"}],"dimensionFilter":{"filter":{"fieldName":"deviceCategory","stringFilter":{"matchType":"EXACT","value":"mobile","caseSensitive":true}}},"orderBys":[{"metric":{"metricName":"sessions"},"desc":true}],"limit":20}' \
  || exit 1
run_report 11 '{"dateRanges":[{"startDate":"7daysAgo","endDate":"today","name":"Last7Days"}],"dimensions":[{"name":"sessionSourceMedium"}],"metrics":[{"name":"sessions"},{"name":"activeUsers"}],"orderBys":[{"metric":{"metricName":"sessions"},"desc":true}],"limit":15}' \
  || exit 1

BODY12="$(python3 tools/ga_trends_brief.py --report-body 12)"
run_report 12 "$BODY12" || exit 1

BODY13="$(python3 tools/ga_trends_brief.py --report-body 13)"
if ! run_report 13 "$BODY13"; then
  echo "==> ga-trends: landingPage failed; retrying landingPagePlusQueryString" >&2
  BODY13B="$(python3 tools/ga_trends_brief.py --report-body 13b)"
  run_report 13 "$BODY13B" || exit 1
fi

# Registered customEvent dimensions (content_type, item_id, location, …). Skip on 400.
BODY14="$(python3 tools/ga_trends_brief.py --report-body 14)"
if ! run_report 14 "$BODY14"; then
  echo "==> ga-trends: report 14 (select_content breakdown) skipped" >&2
  echo '{"dimensionHeaders":[],"metricHeaders":[],"rows":[]}' >"$OUT/14.json"
fi
BODY15="$(python3 tools/ga_trends_brief.py --report-body 15)"
if ! run_report 15 "$BODY15"; then
  echo "==> ga-trends: report 15 (click location) skipped" >&2
  echo '{"dimensionHeaders":[],"metricHeaders":[],"rows":[]}' >"$OUT/15.json"
fi

python3 tools/ga_trends_brief.py "$OUT"

echo "ga-trends-test: OK" >&2
