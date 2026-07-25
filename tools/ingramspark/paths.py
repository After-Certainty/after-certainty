"""Filesystem layout for IngramSpark build outputs."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from book_specs import ingramspark_artifact_name, spec_ingramspark_target


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


def package_zip_path(repo: Path, spec: dict[str, Any]) -> Path:
    return ingramspark_build_dir(repo, spec) / ingramspark_artifact_name(book_id(spec))
