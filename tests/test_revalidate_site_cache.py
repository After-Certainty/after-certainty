"""Unit tests for scripts/revalidate_site_cache.sh URL allowlist (no network)."""

from __future__ import annotations

import os
import subprocess
from pathlib import Path

import pytest


@pytest.fixture
def revalidate_script(repo_root: Path) -> Path:
    return repo_root / "scripts" / "revalidate_site_cache.sh"


def _source_validate(script: Path, url: str) -> subprocess.CompletedProcess[str]:
    """Source the script helpers and call validate_revalidate_url."""
    env = os.environ.copy()
    env["REVALIDATE_SOURCED"] = "1"
    # bash -c sourcing: define helpers then invoke.
    cmd = f'''
set -euo pipefail
REVALIDATE_SOURCED=1
source "{script}"
validate_revalidate_url {repr(url)}
'''
    return subprocess.run(
        ["bash", "-c", cmd],
        capture_output=True,
        text=True,
        env=env,
    )


def test_approved_url_accepted(revalidate_script: Path) -> None:
    proc = _source_validate(
        revalidate_script,
        "https://www.after-certainty.com/api/cache/revalidate",
    )
    assert proc.returncode == 0, proc.stderr


@pytest.mark.parametrize(
    "url",
    [
        "https://www.after-certainty.com.evil.example/api/cache/revalidate",
        "https://evil.after-certainty.com/api/cache/revalidate",
        "https://after-certainty.com/api/cache/revalidate",
        "https://user:pass@www.after-certainty.com/api/cache/revalidate",
        "http://www.after-certainty.com/api/cache/revalidate",
        "https://www.after-certainty.com/api/cache/revalidate/extra",
        "https://www.after-certainty.com/api/other",
        "",
    ],
)
def test_unapproved_urls_rejected(revalidate_script: Path, url: str) -> None:
    proc = _source_validate(revalidate_script, url)
    assert proc.returncode != 0, f"expected rejection for {url!r}"


def test_dry_run_does_not_need_network(revalidate_script: Path, tmp_path: Path) -> None:
    env = os.environ.copy()
    env["CACHE_REVALIDATE_SECRET"] = "TESTONLY_NOT_A_SECRET_00000000"
    env["REVALIDATE_DRY_RUN"] = "1"
    # Point curl at a missing binary — dry-run must not invoke it.
    env["REVALIDATE_CURL_BIN"] = str(tmp_path / "no-such-curl")
    proc = subprocess.run(
        ["bash", str(revalidate_script)],
        capture_output=True,
        text=True,
        env=env,
    )
    assert proc.returncode == 0, proc.stderr
    assert "TESTONLY_NOT_A_SECRET" not in proc.stdout
    assert "TESTONLY_NOT_A_SECRET" not in proc.stderr
    assert "Authorization" not in proc.stdout
    assert "Authorization" not in proc.stderr


def test_redirect_attempt_fails_closed(revalidate_script: Path, tmp_path: Path) -> None:
    """Mock curl that would follow a redirect: script passes --max-redirs 0."""
    mock = tmp_path / "curl"
    mock.write_text(
        "#!/usr/bin/env bash\n"
        "# Fail if caller allows redirects (max-redirs missing or non-zero).\n"
        "max=unset\n"
        "args=()\n"
        "while [[ $# -gt 0 ]]; do\n"
        '  case "$1" in\n'
        "    --max-redirs) max=$2; shift 2 ;;\n"
        '    *) args+=("$1"); shift ;;\n'
        "  esac\n"
        "done\n"
        'if [[ "$max" != "0" ]]; then echo REDIRS_ALLOWED >&2; exit 99; fi\n'
        'echo -n \'{"ok":true}\' > /tmp/site-revalidate.json\n'
        "printf 200\n",
        encoding="utf-8",
    )
    mock.chmod(0o755)
    env = os.environ.copy()
    env["CACHE_REVALIDATE_SECRET"] = "TESTONLY_NOT_A_SECRET_00000000"
    env["REVALIDATE_CURL_BIN"] = str(mock)
    proc = subprocess.run(
        ["bash", str(revalidate_script)],
        capture_output=True,
        text=True,
        env=env,
    )
    assert proc.returncode == 0, proc.stderr + proc.stdout
    assert "TESTONLY_NOT_A_SECRET" not in proc.stdout + proc.stderr


def test_posts_site_allowlisted_targets_only(revalidate_script: Path, tmp_path: Path) -> None:
    """Site rejects unknown targets (e.g. books/semantic); body must be podcast only."""
    body_file = tmp_path / "body.json"
    mock = tmp_path / "curl"
    mock.write_text(
        "#!/usr/bin/env bash\n"
        "body=''\n"
        "while [[ $# -gt 0 ]]; do\n"
        '  case "$1" in\n'
        "    -d) body=$2; shift 2 ;;\n"
        "    --max-redirs) shift 2 ;;\n"
        '    *) shift ;;\n'
        "  esac\n"
        "done\n"
        f"printf '%s' \"$body\" > '{body_file}'\n"
        'echo -n \'{"ok":true,"revalidated":["podcast"]}\' '
        "> /tmp/site-revalidate.json\n"
        "printf 200\n",
        encoding="utf-8",
    )
    mock.chmod(0o755)
    env = os.environ.copy()
    env["CACHE_REVALIDATE_SECRET"] = "TESTONLY_NOT_A_SECRET_00000000"
    env["REVALIDATE_CURL_BIN"] = str(mock)
    proc = subprocess.run(
        ["bash", str(revalidate_script)],
        capture_output=True,
        text=True,
        env=env,
    )
    assert proc.returncode == 0, proc.stderr + proc.stdout
    payload = body_file.read_text(encoding="utf-8")
    assert payload == '{"targets":["podcast"]}'
    assert "books" not in payload
    assert "semantic" not in payload
