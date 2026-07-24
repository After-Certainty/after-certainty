#!/usr/bin/env python3
"""Attach generated web cover derivatives onto semantic/books manifest book entries."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

COVER_VARIANT_KEYS = ("detail", "card", "thumbnail")
SHA256_RE = re.compile(r"^[a-f0-9]{64}$")
SAFE_REL_PATH_RE = re.compile(r"^book-covers/[a-zA-Z0-9._-]+/(detail|card|thumbnail)\.webp$")
SAFE_URL_RE = re.compile(r"^/generated/book-covers/[a-zA-Z0-9._-]+/(detail|card|thumbnail)\.webp$")


def default_cover_assets_manifest_path(repo: Path) -> Path:
    return (repo / "build" / "site-assets" / "book-covers" / "manifest.json").resolve()


def load_cover_assets_manifest(path: Path) -> dict[str, Any]:
    if not path.is_file():
        return {}
    raw = json.loads(path.read_text(encoding="utf-8"))
    return raw if isinstance(raw, dict) else {}


def _validate_variant(slug: str, key: str, variant: dict[str, Any]) -> None:
    if not isinstance(variant, dict):
        raise ValueError(f"{slug}: coverImages.{key} must be an object")
    path = str(variant.get("path", ""))
    url = str(variant.get("url", ""))
    if not SAFE_REL_PATH_RE.match(path):
        raise ValueError(f"{slug}: unsafe coverImages.{key}.path: {path!r}")
    if not SAFE_URL_RE.match(url):
        raise ValueError(f"{slug}: unsafe coverImages.{key}.url: {url!r}")
    if variant.get("format") != "webp":
        raise ValueError(f"{slug}: coverImages.{key}.format must be webp")
    for field in ("width", "height", "bytes"):
        value = variant.get(field)
        if not isinstance(value, int) or value <= 0:
            raise ValueError(f"{slug}: coverImages.{key}.{field} must be a positive int")
    sha = str(variant.get("sha256", ""))
    if not SHA256_RE.match(sha):
        raise ValueError(f"{slug}: coverImages.{key}.sha256 invalid")
    expected_path = f"book-covers/{slug}/{key}.webp"
    expected_url = f"/generated/book-covers/{slug}/{key}.webp"
    if path != expected_path:
        raise ValueError(f"{slug}: coverImages.{key}.path expected {expected_path}")
    if url != expected_url:
        raise ValueError(f"{slug}: coverImages.{key}.url expected {expected_url}")


def cover_fields_for_slug(
    cover_manifest: dict[str, Any],
    slug: str,
    *,
    require: bool = False,
) -> dict[str, Any] | None:
    books = cover_manifest.get("books")
    if not isinstance(books, dict):
        if require:
            raise ValueError("cover assets manifest missing books object")
        return None
    record = books.get(slug)
    if not isinstance(record, dict):
        if require:
            raise ValueError(f"missing generated cover assets for {slug}")
        return None
    images = record.get("coverImages")
    if not isinstance(images, dict):
        raise ValueError(f"{slug}: coverImages missing in cover assets manifest")
    out_images: dict[str, Any] = {}
    for key in COVER_VARIANT_KEYS:
        variant = images.get(key)
        if not isinstance(variant, dict):
            raise ValueError(f"{slug}: missing coverImages.{key}")
        _validate_variant(slug, key, variant)
        out_images[key] = {
            "path": variant["path"],
            "url": variant["url"],
            "width": variant["width"],
            "height": variant["height"],
            "format": "webp",
            "bytes": variant["bytes"],
            "sha256": variant["sha256"],
        }
    source_sha = str(record.get("sourceSha256", "")).strip()
    if not SHA256_RE.match(source_sha):
        raise ValueError(f"{slug}: invalid sourceSha256")
    generator_version = record.get("generatorVersion")
    if not isinstance(generator_version, int) or generator_version < 1:
        raise ValueError(f"{slug}: invalid generatorVersion")
    return {
        "coverImages": out_images,
        "coverImageGeneration": {
            "sourceSha256": source_sha,
            "generatorVersion": generator_version,
        },
    }


def attach_cover_images_to_books(
    books: list[dict[str, Any]],
    cover_manifest: dict[str, Any],
    *,
    require_for_covered: bool = True,
) -> None:
    """Mutate book entries in place, attaching coverImages when assets exist."""
    for book in books:
        slug = str(book.get("slug", "")).strip()
        if not slug:
            continue
        has_original = bool(book.get("coverImagePath") or book.get("coverImage"))
        if not has_original:
            continue
        if str(book.get("status", "")).strip() == "draft":
            continue
        fields = cover_fields_for_slug(
            cover_manifest,
            slug,
            require=require_for_covered,
        )
        if fields:
            book.update(fields)
