"""
Regression: authenticated git remotes must not leak into generated manifests.

Uses an unmistakably synthetic credential injected only into a temporary remote
URL. Restores the original origin URL even if assertions fail.
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlparse

import pytest

from scan_generated_secrets import scan_path

# Unmistakably synthetic — must never resemble a live token closely enough to
# trigger external revocation systems.
FAKE_CREDENTIAL = "TESTONLY_NOT_A_SECRET_00000000"
FAKE_REMOTE = (
    f"https://x-access-token:{FAKE_CREDENTIAL}@github.com/After-Certainty/after-certainty.git"
)


def _git(repo: Path, *args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", "-C", str(repo), *args],
        capture_output=True,
        text=True,
        check=False,
    )


def _assert_no_credential_leak(text: str, *, label: str) -> None:
    assert FAKE_CREDENTIAL not in text, f"{label} contains fake credential"
    assert "x-access-token" not in text.lower(), f"{label} contains x-access-token"
    for match in __import__("re").finditer(r"https?://[^\s\"']+", text):
        parsed = urlparse(match.group(0).rstrip(").,;]"))
        assert parsed.username is None and parsed.password is None, (
            f"{label} URL has userinfo: {match.group(0)}"
        )


@pytest.fixture
def isolated_origin(repo_root: Path):
    """Point origin at a fake authenticated URL; always restore afterward."""
    before = _git(repo_root, "remote", "get-url", "origin")
    original = before.stdout.strip() if before.returncode == 0 else ""
    had_origin = before.returncode == 0 and bool(original)

    if had_origin:
        set_result = _git(repo_root, "remote", "set-url", "origin", FAKE_REMOTE)
    else:
        set_result = _git(repo_root, "remote", "add", "origin", FAKE_REMOTE)
    assert set_result.returncode == 0, set_result.stderr

    # Confirm the remote actually contains the fake credential for this test.
    current = _git(repo_root, "remote", "get-url", "origin")
    assert FAKE_CREDENTIAL in current.stdout

    try:
        yield repo_root
    finally:
        if had_origin:
            _git(repo_root, "remote", "set-url", "origin", original)
        else:
            _git(repo_root, "remote", "remove", "origin")
        restored = _git(repo_root, "remote", "get-url", "origin")
        if had_origin:
            assert restored.stdout.strip() == original
            assert FAKE_CREDENTIAL not in restored.stdout


def test_manifest_generation_strips_fake_authenticated_remote(
    isolated_origin: Path,
    tmp_path: Path,
) -> None:
    repo = isolated_origin
    books_out = tmp_path / "books-manifest.json"
    semantic_out = tmp_path / "semantic-manifest.json"
    log_path = tmp_path / "generation.log"

    combined_log: list[str] = []

    for out, script in (
        (books_out, "tools/generate_books_manifest.py"),
        (semantic_out, "tools/generate_semantic_manifest.py"),
    ):
        # Intentionally omit --github-repository so generation resolves via git remote.
        proc = subprocess.run(
            [
                sys.executable,
                str(repo / script),
                "--repo",
                str(repo),
                "--out",
                str(out),
                "--github-ref",
                "main",
                "--release-tag",
                "latest",
            ],
            capture_output=True,
            text=True,
            timeout=180,
            cwd=str(repo),
        )
        combined_log.append(proc.stdout)
        combined_log.append(proc.stderr)
        assert proc.returncode == 0, f"{script} failed:\n{proc.stderr}\n{proc.stdout}"
        assert out.is_file()

    log_path.write_text("\n".join(combined_log), encoding="utf-8")
    log_text = log_path.read_text(encoding="utf-8")
    _assert_no_credential_leak(log_text, label="generation log")

    books = json.loads(books_out.read_text(encoding="utf-8"))
    assert books.get("repository") == "After-Certainty/after-certainty"
    books_text = books_out.read_text(encoding="utf-8")
    _assert_no_credential_leak(books_text, label="books-manifest.json")

    semantic_text = semantic_out.read_text(encoding="utf-8")
    _assert_no_credential_leak(semantic_text, label="semantic-manifest.json")
    # semantic manifest may or may not embed repository; if present, must be clean
    semantic = json.loads(semantic_text)
    if "repository" in semantic:
        assert semantic["repository"] == "After-Certainty/after-certainty"

    for path in (books_out, semantic_out, log_path):
        findings = scan_path(path, extra_forbidden=[FAKE_CREDENTIAL])
        assert not findings, f"scan findings for {path}:\n" + "\n".join(map(str, findings))
