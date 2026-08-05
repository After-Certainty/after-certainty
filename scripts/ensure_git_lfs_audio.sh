#!/usr/bin/env bash
# Ensure Git LFS is available and smudge books/*/audio/*.mp3 for site install.
# Vercel clones leave LFS pointer stubs unless we pull objects explicitly.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

GIT_LFS_VERSION="${GIT_LFS_VERSION:-3.7.1}"
GIT_LFS_ARCHIVE="git-lfs-linux-amd64-v${GIT_LFS_VERSION}.tar.gz"
GIT_LFS_SHA256="${GIT_LFS_SHA256:-1c0b6ee5200ca708c5cebebb18fdeb0e1c98f1af5c1a9cba205a4c0ab5a5ec08}"
GIT_LFS_URL="https://github.com/git-lfs/git-lfs/releases/download/v${GIT_LFS_VERSION}/${GIT_LFS_ARCHIVE}"
GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-ksteffe/after-certainty}"
LFS_ENDPOINT="https://github.com/${GITHUB_REPOSITORY}.git/info/lfs"

export PATH="${HOME}/.local/bin:${PATH:-}"

if ! command -v git-lfs >/dev/null 2>&1; then
  tmpdir="$(mktemp -d)"
  trap 'rm -rf "$tmpdir"' EXIT
  curl -fsSL "$GIT_LFS_URL" -o "${tmpdir}/${GIT_LFS_ARCHIVE}"
  echo "${GIT_LFS_SHA256}  ${tmpdir}/${GIT_LFS_ARCHIVE}" | sha256sum -c -
  tar -xzf "${tmpdir}/${GIT_LFS_ARCHIVE}" -C "$tmpdir"
  bin_src="$(find "$tmpdir" -type f -name git-lfs | head -n 1)"
  if [[ -z "$bin_src" || ! -f "$bin_src" ]]; then
    echo "git-lfs binary not found in archive" >&2
    exit 1
  fi
  mkdir -p "$HOME/.local/bin"
  install -m 755 "$bin_src" "$HOME/.local/bin/git-lfs"
  trap - EXIT
  rm -rf "$tmpdir"
fi

git lfs version
git lfs install --local

# Vercel clones often leave an empty LFS endpoint ("Failed to fetch … from ''").
# Point LFS at GitHub explicitly and ensure origin is an https remote.
echo "ensure_git_lfs_audio: remotes before fix:"
git remote -v || true
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "https://github.com/${GITHUB_REPOSITORY}.git"
else
  git remote add origin "https://github.com/${GITHUB_REPOSITORY}.git"
fi
git config lfs.url "${LFS_ENDPOINT}"

# Private-repo LFS needs a token on Vercel (clone credentials are not reused for LFS).
TOKEN="${GITHUB_TOKEN:-${GH_TOKEN:-}}"
if [[ -n "$TOKEN" ]]; then
  AUTH="$(printf 'x-access-token:%s' "$TOKEN" | base64 | tr -d '\n')"
  git config --local http.https://github.com/.extraheader "AUTHORIZATION: basic ${AUTH}"
  echo "ensure_git_lfs_audio: using GITHUB_TOKEN/GH_TOKEN for LFS auth"
else
  echo "ensure_git_lfs_audio: no GITHUB_TOKEN/GH_TOKEN — LFS pull may fail on private repos" >&2
fi

echo "ensure_git_lfs_audio: lfs.url=$(git config --get lfs.url)"
echo "ensure_git_lfs_audio: origin=$(git remote get-url origin)"

# Only pull chapter MP3s (receipts/alignment stay in ordinary Git).
if ! git lfs pull --include="books/*/audio/*.mp3" --exclude=""; then
  echo "error: git lfs pull failed (empty endpoint or auth)." >&2
  echo "On Vercel, set env GITHUB_TOKEN (repo Contents: Read) so LFS objects can be fetched." >&2
  exit 2
fi

pointer_count=0
mp3_count=0
while IFS= read -r -d '' mp3; do
  mp3_count=$((mp3_count + 1))
  head="$(head -c 120 "$mp3" 2>/dev/null || true)"
  if [[ "$head" == version\ https://git-lfs.github.com/spec/v1* ]]; then
    echo "error: still an LFS pointer after pull: $mp3" >&2
    pointer_count=$((pointer_count + 1))
  fi
done < <(find books -type f -path '*/audio/*.mp3' -print0 2>/dev/null || true)

if [[ "$pointer_count" -gt 0 ]]; then
  echo "error: ${pointer_count} chapter-audio MP3(s) remain Git LFS pointers" >&2
  exit 1
fi

echo "ensure_git_lfs_audio: smudged ${mp3_count} books/*/audio/*.mp3 ($(git-lfs version | head -n 1))"
