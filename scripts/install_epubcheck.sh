#!/usr/bin/env bash
# Install a pinned EPUBCheck release into tools/vendor/epubcheck-<version>/.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="${EPUBCHECK_VERSION:-5.3.0}"
VENDOR_DIR="${ROOT}/tools/vendor/epubcheck-${VERSION}"
JAR="${VENDOR_DIR}/epubcheck.jar"
ZIP_URL="${EPUBCHECK_URL:-https://github.com/w3c/epubcheck/releases/download/v${VERSION}/epubcheck-${VERSION}.zip}"

if [[ -f "${JAR}" ]]; then
  echo "${JAR}"
  exit 0
fi

command -v java >/dev/null 2>&1 || {
  echo "Error: java is required to run EPUBCheck ${VERSION}." >&2
  exit 1
}
command -v curl >/dev/null 2>&1 || command -v wget >/dev/null 2>&1 || {
  echo "Error: curl or wget is required to download EPUBCheck." >&2
  exit 1
}

TMP="$(mktemp -d)"
trap 'rm -rf "${TMP}"' EXIT
ZIP="${TMP}/epubcheck.zip"

echo "Downloading EPUBCheck ${VERSION}…"
if command -v curl >/dev/null 2>&1; then
  curl -fsSL -o "${ZIP}" "${ZIP_URL}"
else
  wget -q -O "${ZIP}" "${ZIP_URL}"
fi

unzip -q "${ZIP}" -d "${TMP}"
SRC="$(find "${TMP}" -type f -name 'epubcheck.jar' | head -n 1)"
if [[ -z "${SRC}" ]]; then
  echo "Error: epubcheck.jar not found in downloaded archive." >&2
  exit 1
fi

mkdir -p "${VENDOR_DIR}"
# Copy jar plus sibling lib/ if present (EPUBCheck distributions often need lib/).
SRC_DIR="$(dirname "${SRC}")"
cp -a "${SRC_DIR}/." "${VENDOR_DIR}/"
# Normalize jar name for the runner.
if [[ ! -f "${JAR}" ]]; then
  cp -a "${SRC}" "${JAR}"
fi

echo "${JAR}"
