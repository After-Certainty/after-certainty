#!/usr/bin/env bash
# Ensure the repository-pinned uv is installed at ~/.local/bin for environments
# (e.g. Cursor Cloud) that do not provide it. Install only — does not run uv sync.
#
# Pin matches mise.toml [tools].uv (canonical developer/CI toolchain). Duplicated
# here because shell bootstrap runs before mise can help and Cursor Cloud does not
# provide mise.
set -euo pipefail

UV_VERSION="0.11.29"
UV_ARCHIVE="uv-x86_64-unknown-linux-gnu.tar.gz"
UV_SHA256="04f8b82f5d47f0512dcd32c67a4a6f16a0ea27c81537c338fd0ad6b23cebe829"
UV_URL="https://github.com/astral-sh/uv/releases/download/${UV_VERSION}/${UV_ARCHIVE}"

export PATH="${HOME}/.local/bin:${PATH:-}"

if command -v uv >/dev/null 2>&1; then
  current="$(uv --version 2>/dev/null | awk '{print $2}')"
  if [[ "${current}" == "${UV_VERSION}" ]]; then
    echo "install_pinned_uv: uv ${UV_VERSION} already on PATH ($(command -v uv))"
    exit 0
  fi
  echo "install_pinned_uv: found uv ${current:-unknown}; installing ${UV_VERSION}"
else
  echo "install_pinned_uv: uv not on PATH; installing ${UV_VERSION}"
fi

command -v curl >/dev/null 2>&1 || {
  echo "install_pinned_uv: curl is required to download uv" >&2
  exit 1
}
command -v sha256sum >/dev/null 2>&1 || {
  echo "install_pinned_uv: sha256sum is required to verify uv" >&2
  exit 1
}

tmpdir="$(mktemp -d)"
trap 'rm -rf "${tmpdir}"' EXIT

curl -fsSL "${UV_URL}" -o "${tmpdir}/${UV_ARCHIVE}"
echo "${UV_SHA256}  ${tmpdir}/${UV_ARCHIVE}" | sha256sum -c -

tar -xzf "${tmpdir}/${UV_ARCHIVE}" -C "${tmpdir}"
bin_src="$(find "${tmpdir}" -type f -name uv | head -n 1)"
if [[ -z "${bin_src}" || ! -f "${bin_src}" ]]; then
  echo "install_pinned_uv: uv binary not found in ${UV_ARCHIVE}" >&2
  exit 1
fi

mkdir -p "${HOME}/.local/bin"
install -m 755 "${bin_src}" "${HOME}/.local/bin/uv"
export PATH="${HOME}/.local/bin:${PATH}"

installed="$(uv --version 2>/dev/null | awk '{print $2}')"
if [[ "${installed}" != "${UV_VERSION}" ]]; then
  echo "install_pinned_uv: expected uv ${UV_VERSION} after install, got ${installed:-unknown}" >&2
  exit 1
fi

echo "install_pinned_uv: installed uv ${UV_VERSION} → ${HOME}/.local/bin/uv"
