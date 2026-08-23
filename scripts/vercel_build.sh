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

# Chapter MP3s are Git LFS; Vercel clones leave pointer stubs unless we pull.
bash scripts/ensure_git_lfs_audio.sh

# Same logical chain as Turbo: covers → manifest (skip duplicate covers) → install.
npm run corpus:build-web-covers
SKIP_WEB_COVERS=1 npm run corpus:build-manifest

install_args=(--repo .)
if [[ -n "${VERCEL_GIT_COMMIT_SHA:-}" ]]; then
  # Stage D success criterion: deploy SHA matches manifest provenance.
  install_args+=(--require-deploy-sha "${VERCEL_GIT_COMMIT_SHA}")
fi
node packages/corpus-tasks/scripts/install-for-site.mjs "${install_args[@]}"

# Fail the deploy if generated covers and manifest diverge from installed public assets.
REQUIRE_INSTALLED=1 REQUIRE_SEMANTIC=1 npm run corpus:validate-web-covers

npm run site:build

echo "vercel_build: site built with local checkout manifest + book covers (USE_LOCAL=1 OFFLINE=1)"
