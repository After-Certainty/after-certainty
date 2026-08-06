#!/usr/bin/env bash
# Vercel Ignored Build Step for the monorepo site project.
# Exit 0 = skip deployment; exit 1 = proceed with build.
#
# Production (VERCEL_ENV=production): rebuild when public corpus or site paths
# change (books/semantic/etc. must ship to the live site on merge to main).
#
# Preview: only rebuild when apps/site/** changes. Manuscript/corpus PR churn
# should not spend preview build minutes.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Preview deploys: site app source only.
should_build_preview() {
  local f="$1"
  case "$f" in
    apps/site/*) return 0 ;;
    *) return 1 ;;
  esac
}

# Production deploys: public corpus + site + install/build scripts.
should_build_production() {
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
    *) return 1 ;;
  esac
}

is_production() {
  [[ "${VERCEL_ENV:-}" == "production" ]]
}

should_build() {
  if is_production; then
    should_build_production "$1"
  else
    should_build_preview "$1"
  fi
}

decide_from_changed() {
  local mode="preview"
  is_production && mode="production"

  # With set -u, "${arr[@]}" errors on an empty array — use length check first.
  if [[ ${#CHANGED[@]} -eq 0 ]]; then
    echo "vercel_ignore_build: empty diff ($mode) — skip"
    exit 0
  fi
  local f
  for f in "${CHANGED[@]}"; do
    [[ -z "$f" ]] && continue
    if should_build "$f"; then
      echo "vercel_ignore_build: $mode-affecting change: $f — build"
      exit 1
    fi
  done
  echo "vercel_ignore_build: no $mode-affecting paths — skip"
  exit 0
}

# Collect newline-separated paths into CHANGED without process substitution
# (Vercel's ignore-step shell rejects /dev/fd from < <(...)).
CHANGED=()
read_changed_lines() {
  local text="$1"
  CHANGED=()
  # Avoid mapfile <<< on a trailing-newline-only empty string creating one "" entry.
  if [[ -z "${text}" ]]; then
    return 0
  fi
  local line
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ -z "$line" ]] && continue
    CHANGED+=("$line")
  done <<< "$text"
}

# Test hook: newline-separated paths (avoids git history / shallow clones).
if [[ -n "${VERCEL_IGNORE_CHANGED_FILES:-}" ]]; then
  read_changed_lines "${VERCEL_IGNORE_CHANGED_FILES}"
  decide_from_changed
fi

if [[ -z "${VERCEL_GIT_COMMIT_SHA:-}" ]]; then
  echo "vercel_ignore_build: no VERCEL_GIT_COMMIT_SHA — build"
  exit 1
fi

SHA="${VERCEL_GIT_COMMIT_SHA}"
DIFF_TEXT=""
DIFF_SOURCE=""

if ! git cat-file -e "${SHA}^{commit}" 2>/dev/null; then
  if is_production; then
    echo "vercel_ignore_build: commit SHA not in checkout (production) — build"
    exit 1
  fi
  echo "vercel_ignore_build: commit SHA not in checkout (preview) — skip"
  exit 0
fi

PREV="${VERCEL_GIT_PREVIOUS_SHA:-}"
if [[ -n "$PREV" ]] && git cat-file -e "${PREV}^{commit}" 2>/dev/null; then
  DIFF_TEXT="$(git diff --name-only "$PREV" "$SHA" || true)"
  DIFF_SOURCE="previous-sha"
else
  # First push on a branch often omits PREVIOUS_SHA. Compare to main when present.
  for base in origin/main main; do
    if git rev-parse --verify "$base" >/dev/null 2>&1; then
      DIFF_TEXT="$(git diff --name-only "${base}...${SHA}" || true)"
      DIFF_SOURCE="vs-${base}"
      break
    fi
  done
  if [[ -z "$DIFF_SOURCE" ]] && git rev-parse --verify "${SHA}^" >/dev/null 2>&1; then
    DIFF_TEXT="$(git diff --name-only "${SHA}^" "$SHA" || true)"
    DIFF_SOURCE="parent"
  fi
fi

if [[ -z "$DIFF_SOURCE" ]]; then
  if is_production; then
    echo "vercel_ignore_build: cannot resolve changed files (production) — build"
    exit 1
  fi
  echo "vercel_ignore_build: cannot resolve changed files (preview) — skip"
  exit 0
fi

echo "vercel_ignore_build: diff source=$DIFF_SOURCE"
read_changed_lines "$DIFF_TEXT"
decide_from_changed
