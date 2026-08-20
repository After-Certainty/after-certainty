#!/usr/bin/env bash
# Install released PADE v0.1.0 for Cloud Agent sessions (idempotent, non-interactive).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TOOLS="$ROOT/.tools/pade"
VERSION=v0.1.0

case "$(uname -s)-$(uname -m)" in
  Linux-x86_64) ARCH=linux-amd64 ;;
  Linux-aarch64 | Linux-arm64) ARCH=linux-arm64 ;;
  Darwin-arm64) ARCH=darwin-arm64 ;;
  *)
    echo "error: unsupported platform $(uname -s)-$(uname -m)" >&2
    echo "hint: PADE v0.1.0 release supports linux-amd64, linux-arm64, darwin-arm64" >&2
    exit 1
    ;;
esac

mkdir -p "$TOOLS"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

BASE="https://github.com/ksteffe/pade/releases/download/${VERSION}"
TARBALL="pade-${VERSION}-${ARCH}.tar.gz"
curl -fsSL -o "$TMP/$TARBALL" "${BASE}/${TARBALL}"
curl -fsSL -o "$TMP/SHA256SUMS" "${BASE}/SHA256SUMS"
( cd "$TMP" && grep "$TARBALL" SHA256SUMS | sha256sum -c - )

tar -xzf "$TMP/$TARBALL" -C "$TOOLS" pade
chmod +x "$TOOLS/pade"

# Expose pade on PATH and default bindings for agent shells.
PROFILE="/etc/profile.d/cursor-pade.sh"
if [[ -w "$(dirname "$PROFILE")" ]]; then
  cat >"$PROFILE" <<EOF
# Cursor Cloud Agent: PADE CLI (installed by .cursor/install-pade.sh)
export PATH="$TOOLS:\$PATH"
export PADE_BINDINGS="$ROOT/.pade/agent-bindings.yaml"
EOF
else
  SNIPPET="$HOME/.cursor-pade-env.sh"
  cat >"$SNIPPET" <<EOF
export PATH="$TOOLS:\$PATH"
export PADE_BINDINGS="$ROOT/.pade/agent-bindings.yaml"
EOF
  if ! grep -qF "$SNIPPET" "$HOME/.bashrc" 2>/dev/null; then
    echo "[ -f \"$SNIPPET\" ] && . \"$SNIPPET\"" >>"$HOME/.bashrc"
  fi
fi

export PATH="$TOOLS:$PATH"
"$TOOLS/pade" --version
