"""Tests for manifest_books helpers."""

from __future__ import annotations

from manifest_books import sanitize_github_repo_slug


def test_sanitize_github_repo_slug_plain_slug() -> None:
    assert sanitize_github_repo_slug("ksteffe/after-certainty") == "ksteffe/after-certainty"


def test_sanitize_github_repo_slug_https_url() -> None:
    assert (
        sanitize_github_repo_slug("https://github.com/ksteffe/after-certainty.git")
        == "ksteffe/after-certainty"
    )


def test_sanitize_github_repo_slug_git_ssh_url() -> None:
    assert (
        sanitize_github_repo_slug("git@github.com:ksteffe/after-certainty.git")
        == "ksteffe/after-certainty"
    )


def test_sanitize_github_repo_slug_strips_embedded_token() -> None:
    token = "x" * 36
    assert (
        sanitize_github_repo_slug(
            f"https://x-access-token:{token}@github.com/ksteffe/after-certainty"
        )
        == "ksteffe/after-certainty"
    )


def test_sanitize_github_repo_slug_strips_userinfo_before_host() -> None:
    assert sanitize_github_repo_slug("https://user:pass@github.com/o/r") == "o/r"
