"""Tests for semantic enrichment CI PR fallback helpers."""

from __future__ import annotations

from tools.run_semantic_enrichment_ci import _manual_pr_url


def test_manual_pr_url_from_env(monkeypatch) -> None:
    monkeypatch.setenv("GITHUB_REPOSITORY", "ksteffe/after-certainty")
    monkeypatch.setenv("GITHUB_SERVER_URL", "https://github.com")
    url = _manual_pr_url(base_branch="main", branch="semantic-agent/questions-after-certainty-99")
    assert url == (
        "https://github.com/ksteffe/after-certainty/compare/"
        "main...semantic-agent/questions-after-certainty-99?expand=1"
    )


def test_manual_pr_url_without_env(monkeypatch) -> None:
    monkeypatch.delenv("GITHUB_REPOSITORY", raising=False)
    assert _manual_pr_url(base_branch="main", branch="semantic-agent/x-1") is None
