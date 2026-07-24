#!/usr/bin/env bash
# Vercel build for monorepo Stage D (Phase 5): generate local manifest → install → next build.
# Runtime remote fetch is disabled via SEMANTIC_MANIFEST_USE_LOCAL + OFFLINE.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.venv/bin:${HOME}/.local/bin:${PATH:-}"
export GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-ksteffe/after-certainty}"
export SEMANTIC_MANIFEST_USE_LOCAL=1
export SEMANTIC_MANIFEST_OFFLINE=1

make generate-semantic-manifest

install_args=(--repo .)
if [[ -n "${VERCEL_GIT_COMMIT_SHA:-}" ]]; then
  # Stage D success criterion: deploy SHA matches manifest provenance.
  install_args+=(--require-deploy-sha "${VERCEL_GIT_COMMIT_SHA}")
fi
python3 scripts/install_local_manifest_for_site.py "${install_args[@]}"

npm run site:build

echo "vercel_build: site built with local checkout manifest (USE_LOCAL=1 OFFLINE=1)"
