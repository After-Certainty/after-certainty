"""Tests for editorial preservation register validation."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import yaml

from validate_editorial_preservation import normalize_for_match, validate_book


def test_normalize_collapses_soft_wraps() -> None:
    wrapped = (
        "Leadership cannot be reduced to intention. Intention matters,\nbut structure matters more."
    )
    logical = (
        "Leadership cannot be reduced to intention. Intention matters, but structure matters more."
    )
    assert normalize_for_match(wrapped) == normalize_for_match(logical)


def test_normalize_preserves_paragraph_break() -> None:
    text = "When guest leadership is trusted, more people use it openly.\n\nWhen guest leadership is punished, people retreat."
    assert "\n\n" in normalize_for_match(text)


def test_validate_wolty_v1_register(repo_root: Path) -> None:
    book = repo_root / "books/when-others-look-to-you/v1"
    errors = validate_book(book)
    assert errors == [], errors


def test_missing_verbatim_text_fails(tmp_path: Path) -> None:
    book = tmp_path / "book"
    (book / "docs").mkdir(parents=True)
    (book / "front-matter").mkdir(parents=True)
    # Minimal manuscript missing the protected line
    (book / "front-matter" / "introduction-attention-finds-a-focus.md").write_text(
        "# Intro\n\nNo leader definition here.\n",
        encoding="utf-8",
    )
    register = {
        "version": 1,
        "verbatim": [
            {
                "id": "leader-definition",
                "file": "front-matter/introduction-attention-finds-a-focus.md",
                "text": "A leader is someone others look to when deciding what to do next.",
                "reason": "test",
            }
        ],
        "substantive": [],
        "manualReview": [],
    }
    (book / "docs" / "editorial-preservation-register.yml").write_text(
        yaml.dump(register),
        encoding="utf-8",
    )
    errors = validate_book(book)
    assert any("leader-definition" in e for e in errors)


def test_validate_editorial_preservation_cli(repo_root: Path) -> None:
    r = subprocess.run(
        [
            sys.executable,
            str(repo_root / "tools/validate_editorial_preservation.py"),
            "--repo",
            str(repo_root),
            "--book-dir",
            "books/when-others-look-to-you/v1",
        ],
        capture_output=True,
        text=True,
        timeout=60,
    )
    assert r.returncode == 0, r.stderr
    assert "verbatim" in r.stdout.lower() or "OK" in r.stdout
