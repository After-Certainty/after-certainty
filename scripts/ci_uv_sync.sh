#!/usr/bin/env bash
# Install a checksum-verified uv binary and sync the frozen lockfile for CI.
set -euo pipefail

UV_VERSION="${UV_VERSION:-0.11.29}"
UV_ARCHIVE="uv-x86_64-unknown-linux-gnu.tar.gz"
UV_SHA256="${UV_SHA256:-04f8b82f5d47f0512dcd32c67a4a6f16a0ea27c81537c338fd0ad6b23cebe829}"
UV_URL="https://github.com/astral-sh/uv/releases/download/${UV_VERSION}/${UV_ARCHIVE}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v uv >/dev/null 2>&1 || [[ "$(uv --version 2>/dev/null | awk '{print $2}')" != "$UV_VERSION" ]]; then
  tmpdir="$(mktemp -d)"
  trap 'rm -rf "$tmpdir"' EXIT
  curl -fsSL "$UV_URL" -o "${tmpdir}/${UV_ARCHIVE}"
  echo "${UV_SHA256}  ${tmpdir}/${UV_ARCHIVE}" | sha256sum -c -
  tar -xzf "${tmpdir}/${UV_ARCHIVE}" -C "$tmpdir"
  # Archive contains a top-level uv binary (and sometimes uvx).
  bin_src="$(find "$tmpdir" -type f -name uv | head -n 1)"
  if [[ -z "$bin_src" || ! -f "$bin_src" ]]; then
    echo "uv binary not found in archive" >&2
    exit 1
  fi
  mkdir -p "$HOME/.local/bin"
  install -m 755 "$bin_src" "$HOME/.local/bin/uv"
  export PATH="$HOME/.local/bin:$PATH"
  if [[ -n "${GITHUB_PATH:-}" ]]; then
    echo "$HOME/.local/bin" >> "$GITHUB_PATH"
  fi
  trap - EXIT
  rm -rf "$tmpdir"
fi

# Optional dependency groups, e.g. UV_GROUPS="publishing" or UV_GROUPS="dev".
sync_args=(--frozen)
if [[ -n "${UV_GROUPS:-}" ]]; then
  # shellcheck disable=SC2206
  for group in ${UV_GROUPS}; do
    sync_args+=(--group "${group}")
  done
fi
uv sync "${sync_args[@]}"
export PATH="${ROOT}/.venv/bin:$PATH"
# GITHUB_PATH is consumed by *subsequent* workflow steps only — not later
# commands in the same step. Prefer a separate install step, or call scripts
# that resolve .venv/bin/python3 themselves.
if [[ -n "${GITHUB_PATH:-}" ]]; then
  echo "${ROOT}/.venv/bin" >> "$GITHUB_PATH"
fi
echo "uv sync --frozen complete ($(uv --version))"
