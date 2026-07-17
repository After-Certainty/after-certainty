#!/usr/bin/env bash
# Install Typst with pinned version and SHA-256 verification.
# Fail closed on digest mismatch. Extract into a temp directory; reject archive
# path traversal. Never pipe network responses into a shell.
set -euo pipefail

VERSION="${TYPST_VERSION:-0.14.2}"
ARCH="${TYPST_ARCH:-x86_64-unknown-linux-musl}"
INSTALL_DIR="${TYPST_INSTALL_DIR:-/usr/local}"

# Checked-in digest for the official musl linux x86_64 archive (v0.14.2).
# Override only for tests via TYPST_EXPECTED_SHA256.
EXPECTED_SHA256="${TYPST_EXPECTED_SHA256:-a6044cbad2a954deb921167e257e120ac0a16b20339ec01121194ff9d394996d}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIGESTS_FILE="${TYPST_DIGESTS_FILE:-${SCRIPT_DIR}/typst.sha256}"

# Test hook: verify digest logic without downloading (runs before install-skip).
if [[ "${TYPST_CHECK_ONLY:-}" == "1" ]]; then
  archive_path="${TYPST_LOCAL_ARCHIVE:?TYPST_LOCAL_ARCHIVE required when TYPST_CHECK_ONLY=1}"
  if [[ ! -f "$archive_path" ]]; then
    echo "Typst archive not found: $archive_path" >&2
    exit 1
  fi
  actual="$(sha256sum "$archive_path" | awk '{print $1}')"
  if [[ "$actual" != "$EXPECTED_SHA256" ]]; then
    echo "Typst checksum mismatch (fail closed)." >&2
    echo "  expected: $EXPECTED_SHA256" >&2
    echo "  actual:   $actual" >&2
    exit 1
  fi
  echo "Typst checksum OK (check-only)"
  exit 0
fi

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

# Prefer digest from checked-in file when present for this archive name.
if [[ -f "$DIGESTS_FILE" ]]; then
  file_digest="$(awk -v a="$archive" '$2 == a {print $1; exit}' "$DIGESTS_FILE" || true)"
  if [[ -n "$file_digest" ]]; then
    EXPECTED_SHA256="$file_digest"
  fi
fi

echo "Downloading Typst v${VERSION} from ${url}"
case "$url" in
  https://*) ;;
  *) echo "Refusing non-HTTPS Typst download URL" >&2; exit 1 ;;
esac

curl -fsSL "$url" -o "${tmpdir}/${archive}"

actual="$(sha256sum "${tmpdir}/${archive}" | awk '{print $1}')"
if [[ "$actual" != "$EXPECTED_SHA256" ]]; then
  echo "Typst checksum mismatch (fail closed)." >&2
  echo "  expected: $EXPECTED_SHA256" >&2
  echo "  actual:   $actual" >&2
  exit 1
fi

# Safe extract: reject absolute paths and .. components.
tar -tJf "${tmpdir}/${archive}" | while IFS= read -r member; do
  case "$member" in
    /* | *..*)
      echo "Refusing archive member with unsafe path: $member" >&2
      exit 1
      ;;
  esac
done

tar -xJf "${tmpdir}/${archive}" -C "$tmpdir"

bin_src="${tmpdir}/typst-${ARCH}/typst"
if [[ ! -f "$bin_src" ]]; then
  echo "Expected typst binary not found after extract: $bin_src" >&2
  exit 1
fi

mkdir -p "${INSTALL_DIR}/bin"
install -m 755 "$bin_src" "${INSTALL_DIR}/bin/typst"
echo "Installed typst to ${INSTALL_DIR}/bin/typst"
"${INSTALL_DIR}/bin/typst" --version
