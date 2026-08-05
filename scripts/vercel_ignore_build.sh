#!/usr/bin/env bash
# Vercel Ignored Build Step for the monorepo site project.
# Exit 0 = skip deployment; exit 1 = proceed with build.
#
# Phase 8: finer path rules — skip docs-only / draft / publishing-only churn;
# rebuild for public corpus + site + install/build scripts.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Prefixes/files that affect the public site or its local-manifest build.
should_build() {
  local f="$1"
  # Never treat draft / docs-only trees as site-affecting.
  case "$f" in
    semantic/_drafts/*|docs/*) return 1 ;;
  esac
  case "$f" in
    apps/site/*|books/*|schema/*|upcoming/*) return 0 ;;
    semantic/*) return 0 ;;
    packages/corpus-tasks/*) return 0 ;;
    tools/generate_semantic_manifest.py|tools/discovery_manifest.py) return 0 ;;
    tools/manifest_*.py|tools/book_specs.py|tools/manuscript_structure.py) return 0 ;;
    tools/pattern_yaml.py|tools/validate_book_specs.py|tools/verify_semantic_yaml.py) return 0 ;;
    scripts/install_local_manifest_for_site.py) return 0 ;;
    scripts/vercel_install.sh|scripts/vercel_build.sh|scripts/vercel_ignore_build.sh) return 0 ;;
    scripts/ensure_git_lfs_audio.sh) return 0 ;;
    scripts/watch_local_manifest.mjs|scripts/dev_site_with_manifest_watch.sh) return 0 ;;
    scripts/ci_uv_sync.sh) return 0 ;;
    package.json|package-lock.json|turbo.json|.npmrc|Makefile|pyproject.toml|uv.lock) return 0 ;;
    apps/site/vercel.json) return 0 ;;
    *) return 1 ;;
  esac
}

decide_from_changed() {
  local -a CHANGED=("$@")
  if [[ ${#CHANGED[@]} -eq 0 ]]; then
    echo "vercel_ignore_build: empty diff — skip"
    exit 0
  fi
  for f in "${CHANGED[@]}"; do
    [[ -z "$f" ]] && continue
    if should_build "$f"; then
      echo "vercel_ignore_build: site-affecting change: $f — build"
      exit 1
    fi
  done
  echo "vercel_ignore_build: no site-affecting paths — skip"
  exit 0
}

# Test hook: newline-separated paths (avoids git history / shallow clones).
if [[ -n "${VERCEL_IGNORE_CHANGED_FILES:-}" ]]; then
  mapfile -t CHANGED <<< "${VERCEL_IGNORE_CHANGED_FILES}"
  decide_from_changed "${CHANGED[@]}"
fi

# Always build when we cannot compare (first deploy, missing SHAs).
if [[ -z "${VERCEL_GIT_COMMIT_SHA:-}" ]]; then
  echo "vercel_ignore_build: no VERCEL_GIT_COMMIT_SHA — build"
  exit 1
fi

PREV="${VERCEL_GIT_PREVIOUS_SHA:-}"
if [[ -z "$PREV" ]]; then
  echo "vercel_ignore_build: no VERCEL_GIT_PREVIOUS_SHA — build"
  exit 1
fi

if ! git cat-file -e "${PREV}^{commit}" 2>/dev/null; then
  echo "vercel_ignore_build: previous SHA not in checkout — build"
  exit 1
fi

mapfile -t CHANGED < <(git diff --name-only "$PREV" "$VERCEL_GIT_COMMIT_SHA" || true)
decide_from_changed "${CHANGED[@]}"
