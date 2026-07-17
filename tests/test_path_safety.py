"""Tests for path containment helpers."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

from path_safety import PathSafetyError, ensure_under, safe_book_id


def test_valid_nested_path(tmp_path: Path) -> None:
    base = tmp_path / "book"
    base.mkdir()
    target = ensure_under(base, "front-matter/title.md")
    assert target == (base / "front-matter" / "title.md").resolve()
    assert str(target).startswith(str(base.resolve()))


def test_unicode_and_spaces(tmp_path: Path) -> None:
    base = tmp_path / "book"
    base.mkdir()
    rel = "docs/My File — café.md"
    target = ensure_under(base, rel)
    assert target.name == "My File — café.md"


def test_rejects_parent_traversal(tmp_path: Path) -> None:
    base = tmp_path / "book"
    base.mkdir()
    with pytest.raises(PathSafetyError, match=r"\.\."):
        ensure_under(base, "../outside")


def test_rejects_multi_level_traversal(tmp_path: Path) -> None:
    base = tmp_path / "a" / "b"
    base.mkdir(parents=True)
    with pytest.raises(PathSafetyError):
        ensure_under(base, "../../outside.txt")


def test_rejects_absolute_unix(tmp_path: Path) -> None:
    with pytest.raises(PathSafetyError, match="absolute"):
        ensure_under(tmp_path, "/etc/passwd")


def test_rejects_absolute_windows(tmp_path: Path) -> None:
    with pytest.raises(PathSafetyError, match="absolute"):
        ensure_under(tmp_path, r"C:\Windows\System32")


def test_rejects_empty(tmp_path: Path) -> None:
    with pytest.raises(PathSafetyError, match="empty"):
        ensure_under(tmp_path, "  ")


def test_symlink_escape(tmp_path: Path) -> None:
    if sys.platform == "win32":
        pytest.skip("symlink privileges vary on Windows")
    base = tmp_path / "book"
    base.mkdir()
    outside = tmp_path / "outside"
    outside.mkdir()
    secret = outside / "secret.txt"
    secret.write_text("x", encoding="utf-8")
    link = base / "escape"
    try:
        link.symlink_to(outside, target_is_directory=True)
    except OSError:
        pytest.skip("symlink not permitted")
    with pytest.raises(PathSafetyError, match="escapes"):
        ensure_under(base, "escape/secret.txt", must_exist=True)


def test_not_yet_created_output(tmp_path: Path) -> None:
    base = tmp_path / "book"
    base.mkdir()
    target = ensure_under(base, "out/new-file.md", must_exist=False)
    assert not target.exists()
    assert target.parent == (base / "out").resolve() or target.parent == base / "out"


def test_existing_file(tmp_path: Path) -> None:
    base = tmp_path / "book"
    base.mkdir()
    existing = base / "ok.md"
    existing.write_text("hi", encoding="utf-8")
    resolved = ensure_under(base, "ok.md", must_exist=True)
    assert resolved == existing.resolve()


def test_safe_book_id() -> None:
    assert safe_book_id("how-meaning-moves") == "how-meaning-moves"
    with pytest.raises(PathSafetyError):
        safe_book_id("../etc")
    with pytest.raises(PathSafetyError):
        safe_book_id("a/b")
    with pytest.raises(PathSafetyError):
        safe_book_id("")
