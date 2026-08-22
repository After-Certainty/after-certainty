#!/usr/bin/env bash
# Cloud Agent install: refresh dependencies for the After Certainty monorepo.
# Idempotent and safe to re-run on every VM startup. Keep this minimal:
# dependency refresh only (no manifest generation, builds, or service startup).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# PADE analytics CLI (used by the ga-trends skill). Non-fatal so a release/network
# hiccup never blocks the critical dependency install below.
bash .cursor/install-pade.sh || echo "install: PADE bootstrap skipped (non-fatal)"

# Pinned Vercel CLI (used by vercel.diagnostics via pade exec). Non-fatal so an
# npm registry hiccup never blocks uv/npm ci. No VERCEL_TOKEN on the VM.
bash .cursor/install-vercel.sh || echo "install: Vercel CLI bootstrap skipped (non-fatal)"

# Python corpus toolchain: installs a checksum-verified uv into ~/.local/bin
# when missing, then `uv sync --frozen` (full dev group: semantic + test + publishing).
bash scripts/ci_uv_sync.sh

# Node workspace dependencies (Next.js site + corpus-tasks).
npm ci

echo "install: dependencies refreshed (uv sync --frozen + npm ci)"
