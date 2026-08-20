#!/usr/bin/env bash
# GA4 Data API runRealtimeReport via process-scoped Material from pade exec.
#
# Requires:
#   GA_ACCESS_TOKEN — injected by pade exec (never print this)
#   GA_PROPERTY_ID  — properties/{id} or numeric id
#
# Usage:
#   pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml \
#     --capability google-analytics.read --quiet -- \
#     apps/site/scripts/ga4-run-realtime-report.sh '<json-body>'
set -euo pipefail

if [[ -z "${GA_ACCESS_TOKEN:-}" ]]; then
  echo "error: GA_ACCESS_TOKEN is not set" >&2
  echo "hint: run via pade exec --capability google-analytics.read" >&2
  exit 1
fi

PROP="${GA_PROPERTY_ID:-}"
if [[ -z "$PROP" ]]; then
  echo "error: GA_PROPERTY_ID must be set" >&2
  exit 1
fi
if [[ "$PROP" != properties/* ]]; then
  PROP="properties/${PROP}"
fi

if [[ $# -lt 1 ]]; then
  echo "error: JSON request body required as first argument" >&2
  exit 1
fi
BODY="$1"

API_URL="${GOOGLE_ANALYTICS_DATA_API_URL:-https://analyticsdata.googleapis.com}"

if [[ "$GA_ACCESS_TOKEN" == ya29.pade_fake_* ]]; then
  echo '{"kind":"analyticsData#RunRealtimeReportResponse","rowCount":0,"note":"fake token; skipped real API"}'
  exit 0
fi

tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT

http_code="$(
  curl -sS -o "$tmp" -w '%{http_code}' \
    -X POST \
    -H "Authorization: Bearer ${GA_ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "User-Agent: after-certainty-ga4-run-realtime-report" \
    -d "$BODY" \
    "${API_URL}/v1beta/${PROP}:runRealtimeReport"
)"

if [[ "$http_code" != "200" ]]; then
  echo "error: Google Analytics Data API runRealtimeReport returned HTTP ${http_code}" >&2
  if [[ -s "$tmp" ]]; then
    python3 -c "import json,sys; d=json.load(open(sys.argv[1])); print(d.get('error',{}).get('message', d), file=sys.stderr)" "$tmp" 2>/dev/null || cat "$tmp" >&2
  fi
  exit 1
fi

cat "$tmp"
