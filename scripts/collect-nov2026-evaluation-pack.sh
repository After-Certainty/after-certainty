#!/usr/bin/env bash
# Re-collect Gate 3 November evaluation Vercel packs with exclusive-end ISO bounds.
# Uses tools/reader_analytics_parity.vercel_iso_request_bounds (day-after inclusive until).
# Does not overwrite October owner smoke; writes under manual/nov2026-evaluation/.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
export PATH="$HOME/.local/bin:$ROOT/.venv/bin:$PATH"
export PYTHONPATH="$ROOT/tools${PYTHONPATH:+:$PYTHONPATH}"
if ! command -v pade >/dev/null 2>&1 && [[ -x "$ROOT/.tools/pade/pade" ]]; then
  export PATH="$ROOT/.tools/pade:$PATH"
fi

MANUAL="${1:-reports/vercel-reader-analytics-parity/manual/nov2026-evaluation}"
PADE_PAUSE="${PADE_PAUSE:-0.75}"
CAP="${CAP_VERCEL:-vercel.analytics.read}"
Q=apps/site/scripts/vercel-web-analytics-query.sh
ENV_FILTER="environment eq 'production'"
CORPUS_FILTER="environment eq 'production' and eventName eq 'corpus_navigation'"

mkdir -p "$MANUAL"/{current,prior-week,full}

assert_real() {
  python3 -c "
import json,sys
from reader_analytics_parity import assert_not_fake, is_fake_payload
p=sys.argv[1]
d=json.load(open(p))
assert_not_fake(d, path=p)
if d.get('status')!='unavailable' and 'data' not in d:
  raise SystemExit(f'missing data in {p}')
" "$1"
}

iso_bounds() {
  local since_d="$1" until_d="$2"
  python3 -c "
from reader_analytics_parity import vercel_iso_request_bounds
s,u=vercel_iso_request_bounds('$since_d','$until_d')
print(s, u)
"
}

vquery() {
  local dir="$1" name="$2"; shift 2
  echo "==> vercel ${dir}/${name}" >&2
  if ! pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml \
    --capability "$CAP" --quiet -- \
    "$Q" "$@" >"$dir/${name}.json" 2>"$dir/${name}.err"; then
    echo "error: ${dir}/${name}" >&2
    cat "$dir/${name}.err" >&2 || true
    return 1
  fi
  assert_real "$dir/${name}.json"
  sleep "$PADE_PAUSE"
}

vquery_opt() {
  local dir="$1" name="$2"; shift 2
  echo "==> vercel optional ${dir}/${name}" >&2
  if ! pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml \
    --capability "$CAP" --quiet -- \
    "$Q" "$@" >"$dir/${name}.json" 2>"$dir/${name}.err"; then
    python3 -c "import json,sys; print(json.dumps({'version':1,'status':'unavailable','reason':sys.argv[1],'data':None}))" \
      "$(tr '\n' ' ' <"$dir/${name}.err" | cut -c1-240)" >"$dir/${name}.json"
  else
    assert_real "$dir/${name}.json" || \
      python3 -c "import json; print(json.dumps({'version':1,'status':'unavailable','reason':'invalid','data':None}))" >"$dir/${name}.json"
  fi
  sleep "$PADE_PAUSE"
}

fetch_window() {
  local dir="$1" since_d="$2" until_d="$3"
  local since_iso until_iso
  read -r since_iso until_iso <<<"$(iso_bounds "$since_d" "$until_d")"
  echo "==== ${dir}: Denver ${since_d}→${until_d}; Vercel ISO ${since_iso} → ${until_iso} ====" >&2
  vquery "$dir" visits_count visits/count since="$since_iso" until="$until_iso" "filter=${ENV_FILTER}"
  vquery "$dir" visits_by_day visits/aggregate since="$since_iso" until="$until_iso" "filter=${ENV_FILTER}" by=day limit=40
  vquery "$dir" visits_by_referrer visits/aggregate since="$since_iso" until="$until_iso" "filter=${ENV_FILTER}" by=referrerHostname limit=25
  vquery "$dir" visits_by_country visits/aggregate since="$since_iso" until="$until_iso" "filter=${ENV_FILTER}" by=country limit=15
  vquery "$dir" visits_by_device visits/aggregate since="$since_iso" until="$until_iso" "filter=${ENV_FILTER}" by=deviceType limit=10
  vquery "$dir" visits_by_path visits/aggregate since="$since_iso" until="$until_iso" "filter=${ENV_FILTER}" by=requestPath limit=40
  vquery "$dir" events_by_name events/aggregate since="$since_iso" until="$until_iso" "filter=${ENV_FILTER}" by=eventName limit=40
  vquery_opt "$dir" corpus_by_origin_and_to_id events/aggregate since="$since_iso" until="$until_iso" \
    "filter=${CORPUS_FILTER}" by=requestPath by=eventData/to_id limit=40
  vquery_opt "$dir" corpus_by_from_to_type events/aggregate since="$since_iso" until="$until_iso" \
    "filter=${CORPUS_FILTER}" by=eventData/from_type by=eventData/to_type limit=30
  vquery_opt "$dir" corpus_by_from_type events/aggregate since="$since_iso" until="$until_iso" \
    "filter=${CORPUS_FILTER}" by=eventData/from_type limit=20
  vquery_opt "$dir" corpus_by_to_type events/aggregate since="$since_iso" until="$until_iso" \
    "filter=${CORPUS_FILTER}" by=eventData/to_type limit=20
  vquery_opt "$dir" corpus_by_to_id events/aggregate since="$since_iso" until="$until_iso" \
    "filter=${CORPUS_FILTER}" by=eventData/to_id limit=30

  python3 tools/reader_analytics_parity.py validate-evidence-pack \
    --pack-dir "$dir" --since "$since_d" --until "$until_d"
}

fetch_window "$MANUAL/current" 2026-11-07 2026-11-13
fetch_window "$MANUAL/prior-week" 2026-10-31 2026-11-06
fetch_window "$MANUAL/full" 2026-10-17 2026-11-13

# Targeted path-start probe (same full window)
read -r FULL_SINCE FULL_UNTIL <<<"$(iso_bounds 2026-10-17 2026-11-13)"
vquery "$MANUAL/full" events_reading_path_started events/aggregate \
  since="$FULL_SINCE" until="$FULL_UNTIL" \
  "filter=environment eq 'production' and eventName eq 'reading_path_started'" \
  by=eventName limit=10

python3 tools/reader_analytics_brief.py \
  --current-dir "$MANUAL/current" \
  --prior-dir "$MANUAL/prior-week" \
  --since 2026-11-07 --until 2026-11-13 \
  --prior-since 2026-10-31 --prior-until 2026-11-06 \
  --json-out "$MANUAL/brief-summary.json" \
  >"$MANUAL/brief.md"

find "$MANUAL" -name '*.err' -size 0 -delete 2>/dev/null || true
echo "collect-nov2026-evaluation-pack: OK → ${MANUAL}" >&2
