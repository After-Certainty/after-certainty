#!/usr/bin/env bash
# Read-only Vercel Web Analytics query via process-scoped Material from pade exec.
#
# Requires:
#   VERCEL_TOKEN — injected by pade exec (never print this)
# Optional:
#   VERCEL_TEAM_ID / VERCEL_PROJECT_ID — defaults to After Certainty production project
#
# Usage:
#   pade exec … --capability vercel.analytics.read --quiet -- \
#     apps/site/scripts/vercel-web-analytics-query.sh visits/aggregate \
#       since=2026-10-01 until=2026-10-07 by=day
#
# First argument: API suffix under /v1/query/web-analytics/ (e.g. visits/count).
# Remaining args: key=value query parameters (url-encoded by curl --data-urlencode).
set -euo pipefail

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "error: VERCEL_TOKEN is not set" >&2
  echo "hint: run via pade exec --capability vercel.analytics.read" >&2
  echo "hint: until the broker grants that capability, use vercel.diagnostics (same token Material)" >&2
  exit 1
fi

if [[ $# -lt 1 ]]; then
  echo "error: endpoint suffix required (e.g. visits/aggregate)" >&2
  exit 1
fi

ENDPOINT_SUFFIX="$1"
shift

TEAM_ID="${VERCEL_TEAM_ID:-team_AGmFePuKXsdzBqJqHl3O9mL0}"
PROJECT_ID="${VERCEL_PROJECT_ID:-prj_RgOjCRadnw2ILa8vK9jy4GqipdLl}"
API_BASE="${VERCEL_WEB_ANALYTICS_API_URL:-https://api.vercel.com/v1/query/web-analytics}"

if [[ "$VERCEL_TOKEN" == vercel_pade_fake_* || "$VERCEL_TOKEN" == ya29.pade_fake_* ]]; then
  echo '{"version":1,"query":{},"data":[],"note":"fake token; skipped real API"}'
  exit 0
fi

tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT

args=(
  -sS
  -o "$tmp"
  -w "%{http_code}"
  --get
  "${API_BASE}/${ENDPOINT_SUFFIX}"
  -H "Authorization: Bearer ${VERCEL_TOKEN}"
  -H "Accept: application/json"
  -H "User-Agent: after-certainty-vercel-web-analytics-query"
  --data-urlencode "teamId=${TEAM_ID}"
  --data-urlencode "projectId=${PROJECT_ID}"
)

for pair in "$@"; do
  args+=(--data-urlencode "$pair")
done

# Simple retry on 429 / 5xx
attempt=0
max_attempts=4
sleep_s=1
http_code=""
while (( attempt < max_attempts )); do
  attempt=$((attempt + 1))
  http_code="$(curl "${args[@]}")" || http_code="000"
  if [[ "$http_code" == "200" ]]; then
    cat "$tmp"
    exit 0
  fi
  if [[ "$http_code" == "429" || "$http_code" =~ ^5 ]]; then
    if (( attempt < max_attempts )); then
      echo "warn: Web Analytics API HTTP ${http_code}; retry ${attempt}/${max_attempts} in ${sleep_s}s" >&2
      sleep "$sleep_s"
      sleep_s=$((sleep_s * 2))
      continue
    fi
  fi
  break
done

echo "error: Vercel Web Analytics API ${ENDPOINT_SUFFIX} returned HTTP ${http_code}" >&2
if [[ -s "$tmp" ]]; then
  python3 -c "
import json,sys
p=sys.argv[1]
try:
  d=json.load(open(p))
  err=d.get('error') or d
  if isinstance(err, dict):
    print(err.get('message') or err, file=sys.stderr)
  else:
    print(err, file=sys.stderr)
except Exception:
  sys.stderr.write(open(p).read())
" "$tmp" 2>/dev/null || cat "$tmp" >&2
fi
exit 1
