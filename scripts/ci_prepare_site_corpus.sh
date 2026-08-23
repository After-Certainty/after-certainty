#!/usr/bin/env bash
# Shared Site CI corpus prep: covers → manifest (no duplicate covers) → install-for-site.
# Matches the logical chain in scripts/vercel_build.sh without next build or LFS pull.
# Usage: bash scripts/ci_prepare_site_corpus.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.venv/bin:${HOME}/.local/bin:${PATH:-}"
export GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-After-Certainty/after-certainty}"
export SEMANTIC_MANIFEST_USE_LOCAL=1
export SEMANTIC_MANIFEST_OFFLINE=1

started_at="$(date +%s)"

npm run corpus:build-web-covers
SKIP_WEB_COVERS=1 npm run corpus:build-manifest
npm run site:install-local-manifest

elapsed=$(( $(date +%s) - started_at ))
echo "ci_prepare_site_corpus: covers + manifest + install complete in ${elapsed}s"

if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
  {
    echo "### Corpus prep"
    echo ""
    echo "- Duration: **${elapsed}s**"
    echo "- Path: \`corpus:build-web-covers\` → \`SKIP_WEB_COVERS=1 corpus:build-manifest\` → \`site:install-local-manifest\`"
  } >> "${GITHUB_STEP_SUMMARY}"
fi
