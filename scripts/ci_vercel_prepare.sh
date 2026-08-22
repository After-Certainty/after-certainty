#!/usr/bin/env bash
# Shared Vercel link / pull / LFS / env sanitize for Site CI.
# Usage: bash scripts/ci_vercel_prepare.sh <preview|production>
#
# Requires: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID, vercel CLI on PATH.
# Optional: CHAPTER_AUDIO_GITHUB_TOKEN (preferred for git lfs), SITE_URL.
set -euo pipefail

ENVIRONMENT="${1:-}"
if [[ "${ENVIRONMENT}" != "preview" && "${ENVIRONMENT}" != "production" ]]; then
  echo "usage: $0 <preview|production>" >&2
  exit 2
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

: "${VERCEL_TOKEN:?VERCEL_TOKEN is required}"
: "${VERCEL_ORG_ID:?VERCEL_ORG_ID is required}"
: "${VERCEL_PROJECT_ID:?VERCEL_PROJECT_ID is required}"

SITE_URL="${SITE_URL:-https://www.after-certainty.com}"

rm -rf .vercel
mkdir -p .vercel
printf '%s\n' "{\"projectId\":\"${VERCEL_PROJECT_ID}\",\"orgId\":\"${VERCEL_ORG_ID}\"}" > .vercel/project.json

if ! vercel whoami --token="${VERCEL_TOKEN}"; then
  echo "::error::VERCEL_TOKEN is invalid or not tied to a Vercel user (CLI: User not found). Recreate the token under the team that owns this project and update the GitHub Actions secret."
  exit 1
fi

vercel pull --yes --environment="${ENVIRONMENT}" --token="${VERCEL_TOKEN}"

# Smudge chapter audio with the Actions token. Production Vercel env has been
# observed to inject a stale GITHUB_TOKEN that makes `git lfs pull` fail.
bash scripts/ensure_git_lfs_audio.sh

# vercel build loads .vercel/.env.*.local from pull; a missing/invalid
# NEXT_PUBLIC_SITE_URL there breaks next metadataBase (Invalid URL).
# Also strip GitHub auth vars so a bad Vercel-project token cannot override
# Actions credentials during scripts/vercel_build.sh → ensure_git_lfs_audio.
if [[ "${ENVIRONMENT}" == "preview" ]]; then
  env_file=".vercel/.env.preview.local"
else
  env_file=".vercel/.env.production.local"
fi
mkdir -p .vercel
if [[ -f "${env_file}" ]]; then
  grep -Ev '^(NEXT_PUBLIC_SITE_URL|GITHUB_TOKEN|GH_TOKEN|CHAPTER_AUDIO_GITHUB_TOKEN)=' \
    "${env_file}" > "${env_file}.tmp" || true
  mv "${env_file}.tmp" "${env_file}"
fi
printf 'NEXT_PUBLIC_SITE_URL=%s\n' "${SITE_URL}" >> "${env_file}"

echo "ci_vercel_prepare: ${ENVIRONMENT} linked, pulled, LFS smudged, env sanitized"
