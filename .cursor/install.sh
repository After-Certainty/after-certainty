#!/usr/bin/env bash
# Cloud Agent install: refresh dependencies for the After Certainty monorepo.
# Idempotent and safe to re-run on every VM startup. Keep this minimal:
# dependency refresh only (no manifest generation, builds, or service startup).
#
# Expects uv on PATH (Cloud Agent base image / environment snapshot). Does not
# install mise or curl|sh bootstrap uv — see docs/task-orchestration.md.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# PADE analytics CLI (used by the ga-trends skill). Non-fatal so a release/network
# hiccup never blocks the critical dependency install below.
bash .cursor/install-pade.sh || echo "install: PADE bootstrap skipped (non-fatal)"

# Pinned Vercel CLI (used by vercel.diagnostics via pade exec). Non-fatal so an
# npm registry hiccup never blocks uv/npm ci. No VERCEL_TOKEN on the VM.
bash .cursor/install-vercel.sh || echo "install: Vercel CLI bootstrap skipped (non-fatal)"

# Python corpus toolchain (uv.lock). Cloud Agent images must provide `uv`.
if ! command -v uv >/dev/null 2>&1; then
  echo "install: uv not found on PATH; Cloud Agent images must provide uv" >&2
  exit 1
fi
uv sync --frozen

# Node workspace dependencies (Next.js site + corpus-tasks).
npm ci

echo "install: dependencies refreshed (uv sync --frozen + npm ci)"
