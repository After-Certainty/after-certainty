"""Filesystem layout for IngramSpark build outputs."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from book_specs import (
    ingramspark_artifact_name,
    ingramspark_preview_artifact_name,
    spec_ingramspark_target,
)


def _as_dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def book_id(spec: dict[str, Any]) -> str:
    book = _as_dict(spec.get("book"))
    return str(book.get("id") or "").strip()


def ingramspark_build_dir(repo: Path, spec: dict[str, Any]) -> Path:
    bid = book_id(spec)
    if not bid:
        raise ValueError("book.id is required for IngramSpark build paths")
    return (repo / "build" / "ingramspark" / bid).resolve()


def ebook_output_dir(repo: Path, spec: dict[str, Any]) -> Path:
    return ingramspark_build_dir(repo, spec) / "ebook"


def ebook_isbn(spec: dict[str, Any]) -> str:
    target = spec_ingramspark_target(spec)
    ebook = _as_dict(target.get("ebook"))
    isbn = str(ebook.get("isbn") or "").strip()
    if not isbn:
        raise ValueError("publishing.targets.ingramspark.ebook.isbn is required")
    return isbn


def print_output_dir(repo: Path, spec: dict[str, Any]) -> Path:
    return ingramspark_build_dir(repo, spec) / "print"


def print_isbn_optional(spec: dict[str, Any]) -> str | None:
    """Return print ISBN when configured; otherwise None (planning cover-preview mode)."""
    target = spec_ingramspark_target(spec)
    print_cfg = _as_dict(target.get("print"))
    isbn = str(print_cfg.get("isbn") or "").strip()
    return isbn or None


def print_isbn(spec: dict[str, Any]) -> str:
    isbn = print_isbn_optional(spec)
    if not isbn:
        raise ValueError("publishing.targets.ingramspark.print.isbn is required")
    return isbn


def print_cover_basename(spec: dict[str, Any]) -> str:
    """
    Cover PDF basename.

    With a print ISBN: ``{isbn}_cvr.pdf`` (IngramSpark submission name).
    Without ISBN (planning cover preview): ``{book.id}_cvr.pdf``.
    """
    isbn = print_isbn_optional(spec)
    if isbn:
        return f"{isbn}_cvr.pdf"
    bid = book_id(spec)
    if not bid:
        raise ValueError("book.id is required to name a cover PDF without print.isbn")
    return f"{bid}_cvr.pdf"


def print_interior_pdf_path(repo: Path, spec: dict[str, Any]) -> Path:
    """IngramSpark interior naming: ``{isbn}_txt.pdf``."""
    return print_output_dir(repo, spec) / f"{print_isbn(spec)}_txt.pdf"


def print_cover_pdf_path(repo: Path, spec: dict[str, Any]) -> Path:
    """Staged cover path: ``{isbn}_cvr.pdf`` or planning ``{book.id}_cvr.pdf``."""
    return print_output_dir(repo, spec) / print_cover_basename(spec)


def print_cover_work_dir(repo: Path, spec: dict[str, Any]) -> Path:
    """Target-specific work directory for raster-wrap intermediates (not website assets)."""
    return ingramspark_build_dir(repo, spec) / "print-cover"


def print_page_count_path(repo: Path, spec: dict[str, Any]) -> Path:
    return print_output_dir(repo, spec) / "page-count.json"


def is_print_cover_preview(spec: dict[str, Any]) -> bool:
    """
    True when print is enabled without ISBN under status: planning.

    Cover conversion and preview ZIPs are allowed; submission packaging is not.
    """
    target = spec_ingramspark_target(spec)
    if target.get("status") != "planning":
        return False
    print_cfg = _as_dict(target.get("print"))
    if print_cfg.get("enabled", False) is not True:
        return False
    return print_isbn_optional(spec) is None


def package_zip_path(repo: Path, spec: dict[str, Any]) -> Path:
    return ingramspark_build_dir(repo, spec) / ingramspark_artifact_name(book_id(spec))


def preview_package_zip_path(repo: Path, spec: dict[str, Any]) -> Path:
    return ingramspark_build_dir(repo, spec) / ingramspark_preview_artifact_name(book_id(spec))
