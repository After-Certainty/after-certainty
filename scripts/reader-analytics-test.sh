#!/usr/bin/env bash
# Run the reader-analytics weekly report pack via PADE broker and print the markdown brief.
#
# Requires: pade v0.4.0 on PATH, pade.yaml, .pade/agent-bindings.yaml, Cloud Agent identity.
# Prefers capability vercel.analytics.read; falls back to vercel.diagnostics (same VERCEL_TOKEN Material)
# until the broker grants the dedicated analytics capability.
#
# Queries run sequentially with brief pauses to avoid broker identity-mint contention.
# Fail closed on fake/sentinel payloads. Optional corpus queries write an explicit
# unavailable status on failure — never silent empty zeroes.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

export PATH="$HOME/.local/bin:$ROOT/.venv/bin:$PATH"
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
QUERY_SCRIPT="apps/site/scripts/vercel-web-analytics-query.sh"
ENV_FILTER="environment eq 'production'"
CORPUS_FILTER="environment eq 'production' and eventName eq 'corpus_navigation'"

write_unavailable() {
  local out_file="$1" reason="$2"
  python3 -c "
import json,sys
print(json.dumps({
  'version': 1,
  'status': 'unavailable',
  'reason': sys.argv[1],
  'data': None,
}))
" "$reason" >"$out_file"
}

assert_real_payload() {
  local out_file="$1"
  python3 -c "
import json,sys
p=sys.argv[1]
d=json.load(open(p))
status=d.get('status')
note=d.get('note') or ''
if status == 'fake_token' or 'fake token' in str(note).lower():
  print(f'error: fake/sentinel payload in {p} — refusing to treat as real analytics', file=sys.stderr)
  sys.exit(1)
if status == 'unavailable':
  # Allowed only for optional corpus files written by write_unavailable.
  sys.exit(0)
if 'data' not in d:
  print(f'error: payload missing data in {p}', file=sys.stderr)
  sys.exit(1)
" "$out_file"
}

# Prefer dedicated analytics capability; fall back to diagnostics Material.
resolve_capability() {
  local cap
  for cap in vercel.analytics.read vercel.diagnostics; do
    if pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml \
      --capability "$cap" --quiet -- \
      "$QUERY_SCRIPT" visits/count since=2026-01-01 until=2026-01-02 \
      "filter=${ENV_FILTER}" >"$OUT/_cap_probe.json" 2>"$OUT/_cap_probe.err"; then
      if assert_real_payload "$OUT/_cap_probe.json" 2>/dev/null; then
        echo "$cap"
        return 0
      fi
    fi
  done
  echo "error: neither vercel.analytics.read nor vercel.diagnostics could query Web Analytics" >&2
  cat "$OUT/_cap_probe.err" >&2 || true
  return 1
}

echo "==> reader-analytics: resolving PADE capability" >&2
CAPABILITY="$(resolve_capability)"
echo "==> reader-analytics: using capability ${CAPABILITY}" >&2
sleep "$PADE_PAUSE"

BOUNDS_JSON="$(python3 tools/reader_analytics_brief.py --print-week-bounds)"
SINCE="$(python3 -c "import json,sys; print(json.load(sys.stdin)['current']['since'])" <<<"$BOUNDS_JSON")"
UNTIL="$(python3 -c "import json,sys; print(json.load(sys.stdin)['current']['until'])" <<<"$BOUNDS_JSON")"
PRIOR_SINCE="$(python3 -c "import json,sys; print(json.load(sys.stdin)['prior']['since'])" <<<"$BOUNDS_JSON")"
PRIOR_UNTIL="$(python3 -c "import json,sys; print(json.load(sys.stdin)['prior']['until'])" <<<"$BOUNDS_JSON")"

echo "==> reader-analytics: completed Denver window ${SINCE} → ${UNTIL} (prior ${PRIOR_SINCE} → ${PRIOR_UNTIL})" >&2
echo "==> reader-analytics: bounds meta: ${BOUNDS_JSON}" >&2

mkdir -p "$OUT/current" "$OUT/prior"

run_query_required() {
  local out_file="$1"
  local endpoint="$2"
  shift 2
  if ! pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml \
    --capability "$CAPABILITY" --quiet -- \
    "$QUERY_SCRIPT" "$endpoint" "$@" >"$out_file" 2>"${out_file}.err"; then
    echo "error: required query ${endpoint} failed → ${out_file}" >&2
    cat "${out_file}.err" >&2 || true
    return 1
  fi
  assert_real_payload "$out_file" || return 1
  sleep "$PADE_PAUSE"
}

run_query_optional() {
  local out_file="$1"
  local endpoint="$2"
  shift 2
  if ! pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml \
    --capability "$CAPABILITY" --quiet -- \
    "$QUERY_SCRIPT" "$endpoint" "$@" >"$out_file" 2>"${out_file}.err"; then
    local reason
    reason="$(tr '\n' ' ' <"${out_file}.err" | sed 's/[[:space:]]\+/ /g' | cut -c1-240)"
    [[ -z "$reason" ]] && reason="query failed (HTTP/auth/unsupported dimension)"
    echo "warn: optional query ${endpoint} unavailable — recording status, not zeroes" >&2
    write_unavailable "$out_file" "$reason"
    sleep "$PADE_PAUSE"
    return 0
  fi
  if ! assert_real_payload "$out_file"; then
    write_unavailable "$out_file" "fake or invalid optional payload rejected"
    return 0
  fi
  sleep "$PADE_PAUSE"
}

fetch_window() {
  local dir="$1" since="$2" until="$3"
  echo "==> reader-analytics: fetching ${dir} (${since} → ${until})" >&2
  run_query_required "$dir/visits_count.json" visits/count \
    "since=${since}" "until=${until}" "filter=${ENV_FILTER}" || return 1
  run_query_required "$dir/visits_by_day.json" visits/aggregate \
    "since=${since}" "until=${until}" "filter=${ENV_FILTER}" by=day limit=14 || return 1
  run_query_required "$dir/visits_by_referrer.json" visits/aggregate \
    "since=${since}" "until=${until}" "filter=${ENV_FILTER}" by=referrerHostname limit=25 || return 1
  run_query_required "$dir/visits_by_country.json" visits/aggregate \
    "since=${since}" "until=${until}" "filter=${ENV_FILTER}" by=country limit=15 || return 1
  run_query_required "$dir/visits_by_device.json" visits/aggregate \
    "since=${since}" "until=${until}" "filter=${ENV_FILTER}" by=deviceType limit=10 || return 1
  run_query_required "$dir/visits_by_path.json" visits/aggregate \
    "since=${since}" "until=${until}" "filter=${ENV_FILTER}" by=requestPath limit=30 || return 1
  run_query_required "$dir/events_by_name.json" events/aggregate \
    "since=${since}" "until=${until}" "filter=${ENV_FILTER}" by=eventName limit=40 || return 1

  # Joint attribution + edge tables (preferred). Soft-unavailable on failure.
  run_query_optional "$dir/corpus_by_origin_and_to_id.json" events/aggregate \
    "since=${since}" "until=${until}" "filter=${CORPUS_FILTER}" \
    by=requestPath by=eventData/to_id limit=40
  run_query_optional "$dir/corpus_by_from_to_type.json" events/aggregate \
    "since=${since}" "until=${until}" "filter=${CORPUS_FILTER}" \
    by=eventData/from_type by=eventData/to_type limit=30

  # Secondary marginal totals (context only).
  run_query_optional "$dir/corpus_by_from_type.json" events/aggregate \
    "since=${since}" "until=${until}" "filter=${CORPUS_FILTER}" \
    by=eventData/from_type limit=20
  run_query_optional "$dir/corpus_by_to_type.json" events/aggregate \
    "since=${since}" "until=${until}" "filter=${CORPUS_FILTER}" \
    by=eventData/to_type limit=20
  run_query_optional "$dir/corpus_by_to_id.json" events/aggregate \
    "since=${since}" "until=${until}" "filter=${CORPUS_FILTER}" \
    by=eventData/to_id limit=30
}

fetch_window "$OUT/current" "$SINCE" "$UNTIL" || exit 1
fetch_window "$OUT/prior" "$PRIOR_SINCE" "$PRIOR_UNTIL" || exit 1

JSON_OUT="${READER_ANALYTICS_JSON_OUT:-}"
BRIEF_ARGS=(
  --current-dir "$OUT/current"
  --prior-dir "$OUT/prior"
  --since "$SINCE"
  --until "$UNTIL"
  --prior-since "$PRIOR_SINCE"
  --prior-until "$PRIOR_UNTIL"
)
if [[ -n "$JSON_OUT" ]]; then
  BRIEF_ARGS+=(--json-out "$JSON_OUT")
fi

python3 tools/reader_analytics_brief.py "${BRIEF_ARGS[@]}"

echo "reader-analytics-test: OK" >&2
