"""Tests for Stage D Vercel ignore-build path filtering.

Uses VERCEL_IGNORE_CHANGED_FILES so CI shallow clones do not need HEAD^.

Preview builds only for apps/site/**; production still rebuilds for corpus paths.
"""

from __future__ import annotations

import os
import subprocess
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SCRIPT = REPO / "scripts" / "vercel_ignore_build.sh"


def _run(env: dict[str, str]) -> subprocess.CompletedProcess[str]:
    merged = {**os.environ, **env}
    # Drop Vercel SHAs / env unless the test sets them.
    for key in list(merged):
        if key.startswith("VERCEL_GIT_") and key not in env:
            del merged[key]
    if "VERCEL_ENV" not in env:
        merged.pop("VERCEL_ENV", None)
    # Default path-list tests to production unless the test sets VERCEL_ENV.
    if "VERCEL_ENV" not in env and "VERCEL_IGNORE_CHANGED_FILES" in env:
        merged["VERCEL_ENV"] = "production"
    return subprocess.run(
        ["bash", str(SCRIPT)],
        cwd=REPO,
        env=merged,
        capture_output=True,
        text=True,
        check=False,
    )


def test_builds_when_commit_sha_missing() -> None:
    result = _run({})
    assert result.returncode == 1
    assert "no VERCEL_GIT_COMMIT_SHA" in result.stdout


def test_preview_skips_when_commit_missing_from_checkout() -> None:
    result = _run(
        {
            "VERCEL_ENV": "preview",
            "VERCEL_GIT_COMMIT_SHA": "abc123",
        }
    )
    assert result.returncode == 0
    assert "commit SHA not in checkout (preview) — skip" in result.stdout


def test_production_builds_when_commit_missing_from_checkout() -> None:
    result = _run(
        {
            "VERCEL_ENV": "production",
            "VERCEL_GIT_COMMIT_SHA": "abc123",
        }
    )
    assert result.returncode == 1
    assert "commit SHA not in checkout (production) — build" in result.stdout


def test_skips_on_empty_diff_same_sha() -> None:
    head = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=REPO, text=True).strip()
    result = _run(
        {
            "VERCEL_ENV": "production",
            "VERCEL_GIT_COMMIT_SHA": head,
            "VERCEL_GIT_PREVIOUS_SHA": head,
        }
    )
    assert result.returncode == 0
    assert "skip" in result.stdout


def test_builds_on_site_affecting_path_list() -> None:
    result = _run(
        {
            "VERCEL_IGNORE_CHANGED_FILES": "docs/roadmaps/monorepo-migration-plan.md\napps/site/vercel.json\n",
        }
    )
    assert result.returncode == 1
    assert "apps/site/vercel.json" in result.stdout


def test_skips_on_docs_only_path_list() -> None:
    result = _run(
        {
            "VERCEL_IGNORE_CHANGED_FILES": "docs/roadmaps/monorepo-migration-plan.md\nREADME.md\n",
        }
    )
    assert result.returncode == 0
    assert "no production-affecting paths" in result.stdout


def test_skips_semantic_drafts() -> None:
    result = _run(
        {
            "VERCEL_IGNORE_CHANGED_FILES": "semantic/_drafts/generated/foo.yml\n",
        }
    )
    assert result.returncode == 0
    assert "no production-affecting paths" in result.stdout


def test_builds_on_corpus_path_list_in_production() -> None:
    result = _run(
        {
            "VERCEL_ENV": "production",
            "VERCEL_IGNORE_CHANGED_FILES": "semantic/glossary/constraint.yml\n",
        }
    )
    assert result.returncode == 1
    assert "semantic/glossary/constraint.yml" in result.stdout


def test_builds_on_books_path_in_production() -> None:
    result = _run(
        {
            "VERCEL_ENV": "production",
            "VERCEL_IGNORE_CHANGED_FILES": "books/after-certainty/manuscript/foo.md\n",
        }
    )
    assert result.returncode == 1
    assert "books/after-certainty/manuscript/foo.md" in result.stdout


def test_preview_skips_books_only_changes() -> None:
    result = _run(
        {
            "VERCEL_ENV": "preview",
            "VERCEL_IGNORE_CHANGED_FILES": "books/after-certainty/manuscript/foo.md\nsemantic/glossary/constraint.yml\n",
        }
    )
    assert result.returncode == 0
    assert "no preview-affecting paths" in result.stdout


def test_preview_builds_on_apps_site_change() -> None:
    result = _run(
        {
            "VERCEL_ENV": "preview",
            "VERCEL_IGNORE_CHANGED_FILES": "books/after-certainty/manuscript/foo.md\napps/site/app/page.tsx\n",
        }
    )
    assert result.returncode == 1
    assert "apps/site/app/page.tsx" in result.stdout


def test_preview_skips_root_package_json() -> None:
    result = _run(
        {
            "VERCEL_ENV": "preview",
            "VERCEL_IGNORE_CHANGED_FILES": "package.json\npackage-lock.json\n",
        }
    )
    assert result.returncode == 0
    assert "no preview-affecting paths" in result.stdout


def test_production_builds_on_root_package_json() -> None:
    result = _run(
        {
            "VERCEL_ENV": "production",
            "VERCEL_IGNORE_CHANGED_FILES": "package.json\n",
        }
    )
    assert result.returncode == 1
    assert "package.json" in result.stdout
