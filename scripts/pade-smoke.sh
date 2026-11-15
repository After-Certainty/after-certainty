#!/usr/bin/env bash
# Smoke-test PADE v0.4.1 + live broker from a Cursor Cloud Agent VM.
#
# Required checks fail the script (nonzero). Optional checks are reported but
# do not force failure unless PADE_SMOKE_STRICT_OPTIONAL=1.
#
# Never prints JWTs, VERCEL_TOKEN, GA_ACCESS_TOKEN, or other Material values.
# Does not fall back to parent-shell credentials for Cloud Agent broker mode.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

EXPECTED_VERSION="${PADE_EXPECTED_VERSION:-v0.4.1}"
BROKER="https://pade-broker-754719312452.us-central1.run.app"
PADE_PAUSE="${PADE_PAUSE:-0.75}"
BINDINGS="${PADE_BINDINGS:-$ROOT/.pade/agent-bindings.yaml}"
MANIFEST="$ROOT/pade.yaml"

# Prefer the repo-installed binary over any older PATH entry.
export PATH="$ROOT/.tools/pade:$PATH"
export PADE_BINDINGS="$BINDINGS"

# Broker-mode only: refuse silent inheritance of durable parent credentials.
unset VERCEL_TOKEN GA_ACCESS_TOKEN GA_PROPERTY_ID GOOGLE_APPLICATION_CREDENTIALS || true
unset GITHUB_TOKEN GH_TOKEN KSM_CONFIG || true

REQUIRED_CAPS=(
  github.repo.read
  google-analytics.read
  vercel.diagnostics
  vercel.analytics.read
)

declare -a SUMMARY_KEYS=()
declare -a SUMMARY_RESULTS=()
declare -a SUMMARY_NOTES=()
FAILURES=0

classify_error() {
  local stage="$1"
  local err="$2"
  local lower
  lower="$(printf '%s' "$err" | tr '[:upper:]' '[:lower:]')"

  case "$stage" in
    identity)
      if [[ "$lower" == *socket* || "$lower" == *workload* || "$lower" == *identity* || "$lower" == *oidc* ]]; then
        echo "identity"
        return
      fi
      echo "identity"
      ;;
    capabilities | validate | version | vercel_cli)
      echo "config"
      ;;
    *)
      if [[ "$lower" == *socket* || "$lower" == *workload* || "$lower" == *"identity socket"* ]]; then
        echo "identity"
      elif [[ "$lower" == *"401"* || "$lower" == *"403"* || "$lower" == *unauthorized* || "$lower" == *forbidden* || "$lower" == *broker* || "$lower" == *audience* || "$lower" == *policy* ]]; then
        echo "broker"
      else
        echo "provider"
      fi
      ;;
  esac
}

record() {
  local key="$1"
  local result="$2"
  local note="${3:-}"
  SUMMARY_KEYS+=("$key")
  SUMMARY_RESULTS+=("$result")
  SUMMARY_NOTES+=("$note")
  if [[ "$result" == "FAIL" ]]; then
    FAILURES=$((FAILURES + 1))
  fi
}

redact_secrets() {
  # Defense in depth: strip token-like values from captured stderr before print.
  sed -E \
    -e 's/(Bearer[[:space:]]+)[A-Za-z0-9._~+\/=-]+/\1[REDACTED]/g' \
    -e 's/([Ee]yJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/[REDACTED_JWT]/g' \
    -e 's/(VERCEL_TOKEN|GA_ACCESS_TOKEN|GITHUB_TOKEN|GH_TOKEN)=[^[:space:]]+/\1=[REDACTED]/g'
}

run_check() {
  local key="$1"
  local stage="$2"
  local required="$3" # required|optional
  shift 3

  echo "==> ${key}"
  local out err rc
  out="$(mktemp)"
  err="$(mktemp)"
  set +e
  "$@" >"$out" 2>"$err"
  rc=$?
  set -e

  if [[ $rc -eq 0 ]]; then
    # Show non-secret stdout for useful checks (version/identity/whoami).
    if [[ -s "$out" ]]; then
      cat "$out"
    fi
    record "$key" "PASS" ""
    rm -f "$out" "$err"
    sleep "$PADE_PAUSE"
    return 0
  fi

  local err_text class note
  err_text="$(redact_secrets <"$err" | tr '\n' ' ' | sed -E 's/[[:space:]]+/ /g' | cut -c1-240)"
  class="$(classify_error "$stage" "$err_text")"
  note="${class}: ${err_text:-command failed (exit ${rc})}"
  echo "FAIL (${class}): ${err_text:-exit ${rc}}" >&2
  if [[ "$required" == "required" ]]; then
    record "$key" "FAIL" "$note"
  else
    record "$key" "FAIL*" "$note (optional)"
    if [[ "${PADE_SMOKE_STRICT_OPTIONAL:-0}" == "1" ]]; then
      FAILURES=$((FAILURES + 1))
    fi
  fi
  rm -f "$out" "$err"
  sleep "$PADE_PAUSE"
  return 0
}

echo "==> PADE smoke (expected ${EXPECTED_VERSION}, broker ${BROKER})"

if ! command -v pade >/dev/null 2>&1; then
  echo "error: pade not found on PATH; run bash .cursor/install-pade.sh first" >&2
  record "PADE installation" "FAIL" "config: pade binary missing"
else
  VERSION_OUT="$(pade --version 2>&1 || true)"
  echo "$VERSION_OUT"
  if [[ "$VERSION_OUT" != *"${EXPECTED_VERSION}"* ]]; then
    echo "error: installed PADE is not ${EXPECTED_VERSION}" >&2
    echo "hint: bash .cursor/install-pade.sh && export PATH=\"\$PWD/.tools/pade:\$PATH\"" >&2
    record "PADE ${EXPECTED_VERSION} installation" "FAIL" "config: got ${VERSION_OUT}"
  else
    record "PADE ${EXPECTED_VERSION} installation" "PASS" ""
  fi
fi

if command -v vercel >/dev/null 2>&1; then
  run_check "Vercel CLI present" vercel_cli required vercel --version
else
  echo "error: vercel CLI not found on PATH" >&2
  record "Vercel CLI present" "FAIL" "config: vercel missing"
fi

run_check "Manifest validation" validate required \
  pade validate -f "$MANIFEST"

CAPS_OUT="$(mktemp)"
CAPS_ERR="$(mktemp)"
echo "==> Broker capability configuration"
set +e
pade capabilities -f "$MANIFEST" --bindings "$BINDINGS" >"$CAPS_OUT" 2>"$CAPS_ERR"
CAPS_RC=$?
set -e
if [[ $CAPS_RC -ne 0 ]]; then
  err_text="$(redact_secrets <"$CAPS_ERR" | tr '\n' ' ' | sed -E 's/[[:space:]]+/ /g' | cut -c1-240)"
  echo "FAIL (config): ${err_text:-capabilities failed}" >&2
  record "Broker capability configuration" "FAIL" "config: ${err_text:-capabilities failed}"
else
  cat "$CAPS_OUT"
  missing=()
  for cap in "${REQUIRED_CAPS[@]}"; do
    if ! grep -q "$cap" "$CAPS_OUT"; then
      missing+=("$cap")
    fi
  done
  if [[ ${#missing[@]} -gt 0 ]]; then
    note="config: missing capability listing: ${missing[*]}"
    echo "FAIL (${note})" >&2
    record "Broker capability configuration" "FAIL" "$note"
  elif ! grep -q "broker" "$CAPS_OUT"; then
    record "Broker capability configuration" "FAIL" "config: no broker provider entries found"
  else
    record "Broker capability configuration" "PASS" "github.repo.read configured (capabilities); exec probe not run (no helper script)"
  fi
fi
rm -f "$CAPS_OUT" "$CAPS_ERR"
sleep "$PADE_PAUSE"

# Identity: require Cursor workload identity for the broker audience.
if [[ -z "${CURSOR_AGENT_SOCKET:-}" && ! -S /run/cursor/api.sock ]]; then
  echo "FAIL (identity): Cursor workload identity socket missing (CURSOR_AGENT_SOCKET unset and /run/cursor/api.sock absent)" >&2
  record "Cursor workload identity" "FAIL" "identity: socket missing — cannot perform live broker validation"
else
  run_check "Cursor workload identity" identity required \
    pade identity --audience "$BROKER"
fi

run_check "GA4 property metadata" google-analytics.read required \
  pade exec -f "$MANIFEST" --bindings "$BINDINGS" \
    --capability google-analytics.read --quiet -- \
    apps/site/scripts/ga4-property-meta.sh

run_check "GA4 minimal report" google-analytics.read required \
  pade exec -f "$MANIFEST" --bindings "$BINDINGS" \
    --capability google-analytics.read --quiet -- \
    apps/site/scripts/ga4-run-report.sh \
    '{"dateRanges":[{"startDate":"7daysAgo","endDate":"today"}],"metrics":[{"name":"activeUsers"}]}'

export VERCEL_TELEMETRY_DISABLED=1
run_check "Vercel authentication (whoami)" vercel.diagnostics required \
  pade exec -f "$MANIFEST" --bindings "$BINDINGS" \
    --capability vercel.diagnostics --quiet -- \
    vercel whoami

# Additional read-only capability probe (existing helper script).
run_check "Vercel analytics.read (minimal)" vercel.analytics.read optional \
  pade exec -f "$MANIFEST" --bindings "$BINDINGS" \
    --capability vercel.analytics.read --quiet -- \
    apps/site/scripts/vercel-web-analytics-query.sh \
    visits/count since=2026-01-01 until=2026-01-02 \
    "filter=environment eq 'production'"

echo
echo "=== pade-smoke summary ==="
printf '%-40s %s\n' "Check" "Result"
printf '%-40s %s\n' "-----" "------"
i=0
while [[ $i -lt ${#SUMMARY_KEYS[@]} ]]; do
  key="${SUMMARY_KEYS[$i]}"
  result="${SUMMARY_RESULTS[$i]}"
  note="${SUMMARY_NOTES[$i]}"
  if [[ -n "$note" ]]; then
    printf '%-40s %s (%s)\n' "$key" "$result" "$note"
  else
    printf '%-40s %s\n' "$key" "$result"
  fi
  i=$((i + 1))
done

if [[ $FAILURES -gt 0 ]]; then
  echo
  echo "pade-smoke: FAILED (${FAILURES} required failure(s))" >&2
  exit 1
fi

echo
echo "pade-smoke: OK"
