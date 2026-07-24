#!/usr/bin/env bash
# Vercel install for monorepo Stage D (Phase 5): npm workspaces + lightweight uv semantic group.
# Run from repository root (see apps/site/vercel.json installCommand).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

UV_VERSION="${UV_VERSION:-0.11.29}"
UV_ARCHIVE="uv-x86_64-unknown-linux-gnu.tar.gz"
UV_SHA256="${UV_SHA256:-04f8b82f5d47f0512dcd32c67a4a6f16a0ea27c81537c338fd0ad6b23cebe829}"
UV_URL="https://github.com/astral-sh/uv/releases/download/${UV_VERSION}/${UV_ARCHIVE}"

if ! command -v uv >/dev/null 2>&1 || [[ "$(uv --version 2>/dev/null | awk '{print $2}')" != "$UV_VERSION" ]]; then
  tmpdir="$(mktemp -d)"
  trap 'rm -rf "$tmpdir"' EXIT
  curl -fsSL "$UV_URL" -o "${tmpdir}/${UV_ARCHIVE}"
  echo "${UV_SHA256}  ${tmpdir}/${UV_ARCHIVE}" | sha256sum -c -
  tar -xzf "${tmpdir}/${UV_ARCHIVE}" -C "$tmpdir"
  bin_src="$(find "$tmpdir" -type f -name uv | head -n 1)"
  if [[ -z "$bin_src" || ! -f "$bin_src" ]]; then
    echo "uv binary not found in archive" >&2
    exit 1
  fi
  mkdir -p "$HOME/.local/bin"
  install -m 755 "$bin_src" "$HOME/.local/bin/uv"
  export PATH="$HOME/.local/bin:$PATH"
  trap - EXIT
  rm -rf "$tmpdir"
fi

export PATH="$HOME/.local/bin:${PATH:-}"

# Lightweight: PyYAML + jsonschema only (no pandoc / python-docx).
uv sync --frozen --only-group semantic
export PATH="${ROOT}/.venv/bin:$PATH"

npm ci

echo "vercel_install: npm ci + uv sync --frozen --only-group semantic complete ($(uv --version))"
