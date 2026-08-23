"""Pytest configuration: repository root for integration-style checks."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import pytest


@pytest.fixture(scope="session")
def repo_root() -> Path:
    return Path(__file__).resolve().parent.parent


@pytest.fixture(scope="session")
def semantic_manifest_path(repo_root: Path, tmp_path_factory: pytest.TempPathFactory) -> Path:
    out = tmp_path_factory.mktemp("semantic-manifest") / "semantic-manifest.json"
    result = subprocess.run(
        [
            sys.executable,
            str(repo_root / "tools/generate_semantic_manifest.py"),
            "--repo",
            str(repo_root),
            "--out",
            str(out),
            "--github-repository",
            "After-Certainty/after-certainty",
            "--github-ref",
            "main",
            "--release-tag",
            "latest",
            "--no-warn-term-kind",
        ],
        cwd=repo_root,
        capture_output=True,
        text=True,
        timeout=180,
        check=False,
    )
    assert result.returncode == 0, result.stderr or result.stdout
    return out


@pytest.fixture(scope="session")
def semantic_manifest(semantic_manifest_path: Path) -> dict:
    return json.loads(semantic_manifest_path.read_text(encoding="utf-8"))
