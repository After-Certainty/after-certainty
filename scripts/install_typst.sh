#!/usr/bin/env bash
# Install Typst 0.14.2 (required for Observer Patterns cmarker export).
set -euo pipefail

VERSION="${TYPST_VERSION:-0.14.2}"
ARCH="${TYPST_ARCH:-x86_64-unknown-linux-musl}"
INSTALL_DIR="${TYPST_INSTALL_DIR:-/usr/local}"

if command -v typst >/dev/null 2>&1; then
  current="$(typst --version 2>/dev/null | awk '{print $2}')"
  if printf '%s\n%s\n' "0.14.0" "$current" | sort -V -C 2>/dev/null; then
    echo "Typst $current already installed (>= 0.14.0)"
    exit 0
  fi
fi

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

archive="typst-${ARCH}.tar.xz"
url="https://github.com/typst/typst/releases/download/v${VERSION}/${archive}"
echo "Downloading Typst v${VERSION} from ${url}"
curl -fsSL "$url" -o "${tmpdir}/${archive}"
tar -xJf "${tmpdir}/${archive}" -C "$tmpdir"

mkdir -p "${INSTALL_DIR}/bin"
install -m 755 "${tmpdir}/typst-${ARCH}/typst" "${INSTALL_DIR}/bin/typst"
echo "Installed typst to ${INSTALL_DIR}/bin/typst"
"${INSTALL_DIR}/bin/typst" --version
