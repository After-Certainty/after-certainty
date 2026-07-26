"""Tests for print-cover page-count sync."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest
from PIL import Image

_REPO = Path(__file__).resolve().parents[1]
_TOOLS = _REPO / "tools"
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from book_specs import load_spec_for_book_dir  # noqa: E402
from ingramspark.cover_page_sync import (  # noqa: E402
    CoverPageSyncError,
    cream_spine_pixels,
    sync_assembled_cover_to_page_count,
)
from ingramspark.template_meta import load_raw_template_meta, normalize_template_meta  # noqa: E402


def test_cream_spine_pixels_76() -> None:
    assert cream_spine_pixels(76, paper="cream", ppi=300) == 57
    assert cream_spine_pixels(74, paper="cream", ppi=300) == 56


def test_sync_assembled_cover_recrops_spine(tmp_path: Path) -> None:
    src_book = _REPO / "books" / "everyone-knows-love"
    book_dir = tmp_path / "everyone-knows-love"
    # Copy only what sync needs.
    (book_dir / "assets" / "ingramspark").mkdir(parents=True)
    for name in (
        "book.yml",
        "book-cover.png",
        "assets/ingramspark/template-meta.yml",
        "assets/ingramspark/spine-source.png",
        "assets/ingramspark/spine.png",
        "assets/ingramspark/back.png",
        "assets/ingramspark/front.png",
        "assets/ingramspark/ebook-front.png",
    ):
        src = src_book / name
        dest = book_dir / name
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(src.read_bytes())

    # Ensure source is wide enough.
    assert Image.open(book_dir / "assets/ingramspark/spine-source.png").size[0] >= 57

    spec = load_spec_for_book_dir(book_dir)
    # Force a mismatch.
    text = (book_dir / "book.yml").read_text(encoding="utf-8")
    (book_dir / "book.yml").write_text(
        text.replace("template_page_count: 76", "template_page_count: 100")
        .replace("template_page_count: 74", "template_page_count: 100")
        .replace("template_page_count: 75", "template_page_count: 100"),
        encoding="utf-8",
    )
    spec = load_spec_for_book_dir(book_dir)

    result = sync_assembled_cover_to_page_count(book_dir=book_dir, spec=spec, page_count=74)
    assert result.changed is True
    assert result.page_count == 74
    assert result.spine_width_pixels == 56
    assert Image.open(book_dir / "assets/ingramspark/spine.png").size == (56, 2775)

    meta = normalize_template_meta(
        load_raw_template_meta(book_dir / "assets/ingramspark/template-meta.yml")
    )
    assert meta.page_count == 74
    assert meta.components is not None
    assert meta.components["spine"].width == 56

    reloaded = load_spec_for_book_dir(book_dir)
    assert (
        reloaded["publishing"]["targets"]["ingramspark"]["print"]["cover"]["template_page_count"]
        == 74
    )

    # Idempotent when already matched.
    again = sync_assembled_cover_to_page_count(book_dir=book_dir, spec=reloaded, page_count=74)
    assert again.changed is False


def test_build_exports_returns_reloaded_spec_after_sync(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Regression: preflight must see synced template_page_count, not the stale in-memory spec."""
    from dataclasses import dataclass

    from ingramspark import package as pkg

    src_book = _REPO / "books" / "everyone-knows-love"
    repo = tmp_path / "repo"
    repo.mkdir()
    book_dir = repo / "books" / "everyone-knows-love"
    (repo / "schema").symlink_to(_REPO / "schema", target_is_directory=True)
    (book_dir / "assets" / "ingramspark").mkdir(parents=True)
    for name in (
        "book.yml",
        "book-cover.png",
        "assets/ingramspark/template-meta.yml",
        "assets/ingramspark/spine-source.png",
        "assets/ingramspark/spine.png",
        "assets/ingramspark/back.png",
        "assets/ingramspark/front.png",
        "assets/ingramspark/ebook-front.png",
    ):
        dest = book_dir / name
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes((src_book / name).read_bytes())

    @dataclass(frozen=True)
    class _FakeExport:
        page_count: int = 74

    monkeypatch.setattr(pkg, "export_ingramspark_print_interior", lambda **_kwargs: _FakeExport())
    monkeypatch.setattr(pkg, "validate_print_cover_or_raise", lambda **_kwargs: None)

    # Force a stale in-memory / on-disk page count so sync must rewrite during export.
    text = (book_dir / "book.yml").read_text(encoding="utf-8")
    (book_dir / "book.yml").write_text(
        text.replace("template_page_count: 74", "template_page_count: 76").replace(
            "template_page_count: 100", "template_page_count: 76"
        ),
        encoding="utf-8",
    )
    stale = load_spec_for_book_dir(book_dir)
    assert (
        stale["publishing"]["targets"]["ingramspark"]["print"]["cover"]["template_page_count"] == 76
    )

    returned = pkg._build_exports(
        repo=repo,
        book_dir=book_dir,
        spec=stale,
        modes=["print"],
        pandoc="pandoc",
        pdf_engine="xelatex",
        allow_cover_upscale=False,
    )
    assert (
        returned["publishing"]["targets"]["ingramspark"]["print"]["cover"]["template_page_count"]
        == 74
    )
    # Stale caller object must not be mutated in place; return value is the source of truth.
    assert (
        stale["publishing"]["targets"]["ingramspark"]["print"]["cover"]["template_page_count"] == 76
    )


def test_sync_requires_spine_source(tmp_path: Path) -> None:
    src_book = _REPO / "books" / "everyone-knows-love"
    book_dir = tmp_path / "everyone-knows-love"
    (book_dir / "assets" / "ingramspark").mkdir(parents=True)
    for name in (
        "book.yml",
        "book-cover.png",
        "assets/ingramspark/template-meta.yml",
        "assets/ingramspark/spine.png",
        "assets/ingramspark/back.png",
        "assets/ingramspark/front.png",
        "assets/ingramspark/ebook-front.png",
    ):
        dest = book_dir / name
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes((src_book / name).read_bytes())
    # Force mismatch so sync attempts a recrop.
    text = (book_dir / "book.yml").read_text(encoding="utf-8")
    (book_dir / "book.yml").write_text(
        text.replace("template_page_count: 76", "template_page_count: 100").replace(
            "template_page_count: 74", "template_page_count: 100"
        ),
        encoding="utf-8",
    )
    spec = load_spec_for_book_dir(book_dir)
    with pytest.raises(CoverPageSyncError, match="spine-source"):
        sync_assembled_cover_to_page_count(book_dir=book_dir, spec=spec, page_count=74)
