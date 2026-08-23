#!/usr/bin/env bash
# Ensure Git LFS is available and smudge books/**/audio/*.mp3 for site install.
# Vercel clones leave LFS pointer stubs unless we pull objects explicitly.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

GIT_LFS_VERSION="${GIT_LFS_VERSION:-3.7.1}"
GIT_LFS_ARCHIVE="git-lfs-linux-amd64-v${GIT_LFS_VERSION}.tar.gz"
GIT_LFS_SHA256="${GIT_LFS_SHA256:-1c0b6ee5200ca708c5cebebb18fdeb0e1c98f1af5c1a9cba205a4c0ab5a5ec08}"
GIT_LFS_URL="https://github.com/git-lfs/git-lfs/releases/download/v${GIT_LFS_VERSION}/${GIT_LFS_ARCHIVE}"
GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-After-Certainty/after-certainty}"
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

echo "ensure_git_lfs_audio: remotes before fix:"
git remote -v || true

ORIG_URL="$(git remote get-url origin 2>/dev/null || true)"
# Prefer a dedicated Vercel secret name; accept GITHUB_TOKEN/GH_TOKEN as aliases.
TOKEN="${CHAPTER_AUDIO_GITHUB_TOKEN:-${GITHUB_TOKEN:-${GH_TOKEN:-}}}"

# Always set an explicit LFS endpoint — Vercel often leaves this empty ("from ''").
git config lfs.url "${LFS_ENDPOINT}"

# Prefer an authenticated HTTPS origin for private LFS. Keep tokenized remotes;
# otherwise inject a token when available.
if [[ "$ORIG_URL" == https://*:*@github.com/* ]]; then
  echo "ensure_git_lfs_audio: keeping authenticated origin URL"
elif [[ -n "$TOKEN" ]]; then
  git remote remove origin 2>/dev/null || true
  git remote add origin "https://x-access-token:${TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
  echo "ensure_git_lfs_audio: origin set with token auth"
elif git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "https://github.com/${GITHUB_REPOSITORY}.git"
  echo "ensure_git_lfs_audio: origin set to https (no token env — private LFS may fail)" >&2
else
  git remote add origin "https://github.com/${GITHUB_REPOSITORY}.git"
  echo "ensure_git_lfs_audio: origin added as https (no token env — private LFS may fail)" >&2
fi

if [[ -n "$TOKEN" ]]; then
  AUTH="$(printf 'x-access-token:%s' "$TOKEN" | base64 | tr -d '\n')"
  git config --local http.https://github.com/.extraheader "AUTHORIZATION: basic ${AUTH}"
else
  echo "ensure_git_lfs_audio: missing CHAPTER_AUDIO_GITHUB_TOKEN/GITHUB_TOKEN/GH_TOKEN" >&2
fi

echo "ensure_git_lfs_audio: lfs.url=$(git config --get lfs.url)"
safe_origin="$(git remote get-url origin | sed -E 's#://[^/@]+@#://***@#')"
echo "ensure_git_lfs_audio: origin=${safe_origin}"
echo "ensure_git_lfs_audio: token_present=$([ -n "$TOKEN" ] && echo yes || echo no)"

# Avoid bash process substitution (< <(...)) — Vercel builds fail with /dev/fd/63.
count_audio_pointers() {
  local list pointer_count=0 mp3_count=0
  list="$(mktemp)"
  find books -type f -path '*/audio/*.mp3' >"$list" 2>/dev/null || true
  while IFS= read -r mp3; do
    [[ -z "$mp3" ]] && continue
    mp3_count=$((mp3_count + 1))
    # Binary MP3s contain NULs; head via command substitution warns — use od/dd.
    head="$(dd if="$mp3" bs=120 count=1 2>/dev/null | tr -d '\0' || true)"
    if [[ "$head" == version\ https://git-lfs.github.com/spec/v1* ]]; then
      pointer_count=$((pointer_count + 1))
    fi
  done <"$list"
  rm -f "$list"
  printf '%s %s' "$mp3_count" "$pointer_count"
}

read -r MP3_COUNT POINTER_COUNT <<<"$(count_audio_pointers)"
if [[ "${POINTER_COUNT}" -eq 0 && "${MP3_COUNT}" -gt 0 ]]; then
  echo "ensure_git_lfs_audio: ${MP3_COUNT} books/**/audio/*.mp3 already smudged; skipping lfs pull"
  exit 0
fi

# Nested edition dirs (books/<work>/v1/audio) need **.
if ! git lfs pull --include="books/**/audio/*.mp3" --exclude=""; then
  echo "error: git lfs pull failed." >&2
  echo "On Vercel, set CHAPTER_AUDIO_GITHUB_TOKEN or GITHUB_TOKEN (Contents: Read)." >&2
  exit 2
fi

read -r MP3_COUNT POINTER_COUNT <<<"$(count_audio_pointers)"
if [[ "$POINTER_COUNT" -gt 0 ]]; then
  echo "error: ${POINTER_COUNT} chapter-audio MP3(s) remain Git LFS pointers" >&2
  exit 1
fi

echo "ensure_git_lfs_audio: smudged ${MP3_COUNT} books/**/audio/*.mp3 ($(git-lfs version | head -n 1))"