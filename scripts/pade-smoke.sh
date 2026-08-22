#!/usr/bin/env bash
# Smoke-test PADE v0.1.0 + live broker from a Cursor Cloud Agent VM.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

BROKER="https://pade-broker-754719312452.us-central1.run.app"

echo "==> pade --version"
pade --version

echo "==> vercel --version"
vercel --version

echo "==> pade identity --audience ${BROKER}"
pade identity --audience "$BROKER"

echo "==> pade validate -f pade.yaml"
pade validate -f pade.yaml

echo "==> pade capabilities -f pade.yaml --bindings .pade/agent-bindings.yaml"
pade capabilities -f pade.yaml --bindings .pade/agent-bindings.yaml

echo "==> pade exec property meta (google-analytics.read)"
pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml \
  --capability google-analytics.read --quiet -- \
  apps/site/scripts/ga4-property-meta.sh

echo "==> pade exec minimal runReport (google-analytics.read)"
pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml \
  --capability google-analytics.read --quiet -- \
  apps/site/scripts/ga4-run-report.sh \
  '{"dateRanges":[{"startDate":"7daysAgo","endDate":"today"}],"metrics":[{"name":"activeUsers"}]}'

echo "==> pade exec vercel whoami (vercel.diagnostics)"
pade exec -f pade.yaml --bindings .pade/agent-bindings.yaml \
  --capability vercel.diagnostics --quiet -- \
  vercel whoami

echo "pade-smoke: OK"
