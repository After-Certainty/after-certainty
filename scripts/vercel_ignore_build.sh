#!/usr/bin/env bash
# Vercel Ignored Build Step for the monorepo site project.
# Exit 0 = skip deployment; exit 1 = proceed with build.
#
# Rebuild when public corpus or site paths change. Skip docs-only / publishing-only churn.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

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
if [[ ${#CHANGED[@]} -eq 0 ]]; then
  echo "vercel_ignore_build: empty diff — skip"
  exit 0
fi

# Prefixes/files that affect the public site or its local-manifest build.
should_build() {
  local f="$1"
  case "$f" in
    apps/site/*|books/*|semantic/*|schema/*|upcoming/*) return 0 ;;
    packages/corpus-tasks/*) return 0 ;;
    tools/generate_semantic_manifest.py|tools/discovery_manifest.py) return 0 ;;
    tools/manifest_*.py|tools/book_specs.py|tools/manuscript_structure.py) return 0 ;;
    tools/pattern_yaml.py|tools/validate_book_specs.py|tools/verify_semantic_yaml.py) return 0 ;;
    scripts/install_local_manifest_for_site.py) return 0 ;;
    scripts/vercel_install.sh|scripts/vercel_build.sh|scripts/vercel_ignore_build.sh) return 0 ;;
    scripts/ci_uv_sync.sh) return 0 ;;
    package.json|package-lock.json|turbo.json|.npmrc|Makefile|pyproject.toml|uv.lock) return 0 ;;
    apps/site/vercel.json) return 0 ;;
    *) return 1 ;;
  esac
}

for f in "${CHANGED[@]}"; do
  if should_build "$f"; then
    echo "vercel_ignore_build: site-affecting change: $f — build"
    exit 1
  fi
done

echo "vercel_ignore_build: no site-affecting paths — skip"
exit 0
