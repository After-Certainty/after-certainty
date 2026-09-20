#!/usr/bin/env bash
# Cloud Agent install: refresh dependencies for the After Certainty monorepo.
# Idempotent and safe to re-run on every VM startup. Keep this minimal:
# dependency refresh only (no manifest generation, builds, or service startup).
#
# Bootstraps a checksum-verified pinned uv into ~/.local/bin when missing or
# wrong version (Cursor Cloud base images do not reliably provide uv). Does not
# install mise — see docs/task-orchestration.md.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# PADE analytics CLI (used by the ga-trends skill). Non-fatal so a release/network
# hiccup never blocks the critical dependency install below.
bash .cursor/install-pade.sh || echo "install: PADE bootstrap skipped (non-fatal)"

# Pinned Vercel CLI (used by vercel.diagnostics via pade exec). Non-fatal so an
# npm registry hiccup never blocks uv/npm ci. No VERCEL_TOKEN on the VM.
bash .cursor/install-vercel.sh || echo "install: Vercel CLI bootstrap skipped (non-fatal)"

# Python corpus toolchain (uv.lock). Ensure pinned uv, then sync full dev group.
bash scripts/install_pinned_uv.sh
export PATH="${HOME}/.local/bin:${PATH}"
uv sync --frozen

# Node workspace dependencies (Next.js site + corpus-tasks).
npm ci

echo "install: dependencies refreshed (uv sync --frozen + npm ci)"
