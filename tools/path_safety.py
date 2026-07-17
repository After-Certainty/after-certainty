#!/usr/bin/env python3
"""
Path containment helpers.

Reject empty paths, absolute paths, ``..`` traversal, and symlink escapes.
Resolve candidates and require the result to remain under a permitted base.
Produces clear errors and never writes files.
"""

from __future__ import annotations

import os
from pathlib import Path, PurePosixPath, PureWindowsPath


class PathSafetyError(ValueError):
    """Raised when a path escapes its permitted base or is otherwise unsafe."""


def _looks_absolute(raw: str) -> bool:
    if not raw:
        return False
    # Unix absolute
    if raw.startswith("/") or raw.startswith("\\"):
        return True
    # Windows drive / UNC
    pure_win = PureWindowsPath(raw)
    if pure_win.is_absolute() or pure_win.drive or raw.startswith("\\\\"):
        return True
    # Pathlib on POSIX may not treat "C:\\foo" as absolute; check explicitly.
    if len(raw) >= 3 and raw[1] == ":" and raw[2] in "/\\":
        return True
    return False


def _contains_parent_ref(raw: str) -> bool:
    # Check logical segments before resolution.
    for part in PurePosixPath(raw.replace("\\", "/")).parts:
        if part == "..":
            return True
    return False


def ensure_under(
    base: Path,
    candidate: str | Path,
    *,
    must_exist: bool = False,
    allow_empty: bool = False,
    description: str = "path",
) -> Path:
    """
    Resolve ``candidate`` relative to ``base`` and ensure it stays under ``base``.

    ``candidate`` must be a relative path (no absolute Unix/Windows forms).
    Symlinks are resolved; the final path must remain under the resolved base.
    """
    base_resolved = base.resolve()

    if isinstance(candidate, Path):
        raw = str(candidate)
    else:
        raw = candidate

    if raw is None or (isinstance(raw, str) and not raw.strip()):
        if allow_empty:
            raise PathSafetyError(f"{description} is empty")  # callers should not allow_empty+use
        raise PathSafetyError(f"{description} must not be empty")

    raw = str(raw).strip()
    if not raw:
        raise PathSafetyError(f"{description} must not be empty")

    if _looks_absolute(raw):
        raise PathSafetyError(f"{description} must be a relative path, got absolute: {raw!r}")

    if _contains_parent_ref(raw):
        # Still resolve to give a clear escape message, but reject early for clarity.
        raise PathSafetyError(f"{description} must not contain '..' segments: {raw!r}")

    # Join then resolve (handles symlink escape).
    joined = base_resolved / raw
    # For not-yet-created files, resolve parent and append name.
    if must_exist:
        try:
            resolved = joined.resolve(strict=True)
        except FileNotFoundError as exc:
            raise PathSafetyError(f"{description} does not exist: {raw!r}") from exc
    else:
        parent = joined.parent
        try:
            parent_resolved = parent.resolve(strict=False)
        except OSError as exc:
            raise PathSafetyError(f"{description} cannot resolve parent: {raw!r}") from exc
        resolved = parent_resolved / joined.name
        # If the file already exists, resolve fully to catch symlink files.
        if resolved.exists() or joined.exists():
            resolved = joined.resolve(strict=False)

    try:
        resolved.relative_to(base_resolved)
    except ValueError as exc:
        raise PathSafetyError(
            f"{description} escapes permitted base {base_resolved}: {raw!r} -> {resolved}"
        ) from exc

    # Extra: reject if any symlink in the chain pointed outside (relative_to already covers).
    return resolved


def ensure_repo_relative(
    repo: Path,
    candidate: str | Path,
    *,
    must_exist: bool = False,
    description: str = "path",
) -> Path:
    """Ensure ``candidate`` resolves under the repository root."""
    return ensure_under(
        repo,
        candidate,
        must_exist=must_exist,
        description=description,
    )


def ensure_book_relative(
    book_dir: Path,
    candidate: str | Path,
    *,
    must_exist: bool = False,
    description: str = "path",
) -> Path:
    """Ensure ``candidate`` resolves under a book directory."""
    return ensure_under(
        book_dir,
        candidate,
        must_exist=must_exist,
        description=description,
    )


def safe_book_id(book_id: str) -> str:
    """
    Validate a book_id used as a single path segment under draft directories.

    Rejects empty values, separators, and ``..``.
    """
    value = (book_id or "").strip()
    if not value:
        raise PathSafetyError("book_id must not be empty")
    if value in {".", ".."}:
        raise PathSafetyError(f"invalid book_id: {value!r}")
    if "/" in value or "\\" in value or os.sep in value:
        raise PathSafetyError(f"book_id must not contain path separators: {value!r}")
    if _looks_absolute(value):
        raise PathSafetyError(f"book_id must not be absolute: {value!r}")
    return value


def safe_draft_out_dir(repo: Path, out_dir: str, book_id: str) -> Path:
    """Resolve ``<out_dir>/<book_id>`` under the repository root."""
    bid = safe_book_id(book_id)
    base = str(out_dir).strip().replace("\\", "/").rstrip("/")
    if not base:
        raise PathSafetyError("out-dir must not be empty")
    rel = f"{base}/{bid}"
    return ensure_under(repo, rel, description="draft output directory")
