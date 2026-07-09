"""Fail if tracked repository files contain common secret patterns."""

from __future__ import annotations

import re
import subprocess
from pathlib import Path

# Match likely real secrets, not documentation or test placeholders.
SECRET_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    (
        "GitHub token embedded in URL",
        re.compile(r"x-access-token:[A-Za-z0-9_]{8,}@github\.com", re.I),
    ),
    ("GitHub personal access token", re.compile(r"ghp_[A-Za-z0-9]{36,}")),
    ("GitHub OAuth token", re.compile(r"gho_[A-Za-z0-9]{36,}")),
    ("GitHub server-to-server token", re.compile(r"ghs_[A-Za-z0-9]{36,}")),
    ("GitHub fine-grained PAT", re.compile(r"github_pat_[A-Za-z0-9_]{40,}")),
]

SKIP_PREFIXES = (
    ".git/",
    "build/",
    ".venv/",
    "venv/",
    "__pycache__/",
)


def _tracked_files(repo_root: Path) -> list[Path]:
    result = subprocess.run(
        ["git", "-C", str(repo_root), "ls-files"],
        capture_output=True,
        text=True,
        check=True,
    )
    out: list[Path] = []
    for line in result.stdout.splitlines():
        rel = line.strip()
        if not rel or rel.startswith(SKIP_PREFIXES):
            continue
        out.append(repo_root / rel)
    return out


def find_secret_violations(repo_root: Path) -> list[str]:
    violations: list[str] = []
    for path in _tracked_files(repo_root):
        if not path.is_file():
            continue
        try:
            text = path.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        for label, pattern in SECRET_PATTERNS:
            if pattern.search(text):
                violations.append(f"{path.relative_to(repo_root)}: {label}")
    return violations


def test_no_secrets_in_tracked_files(repo_root: Path) -> None:
    violations = find_secret_violations(repo_root)
    assert not violations, "Secret patterns found in tracked files:\n" + "\n".join(violations)
