"""Tests for after_certainty.export.build orchestration."""

from __future__ import annotations

from pathlib import Path
from unittest.mock import patch

import pytest

from after_certainty.export.build import build_book


def test_build_book_poetry_rejects_epub(repo_root: Path, tmp_path: Path) -> None:
    with patch("after_certainty.export.build.generate_frontmatter_for_book", return_value=[]):
        with patch("after_certainty.export.build.validate_book_for_publication", return_value=[]):
            with pytest.raises(SystemExit, match="Poetry books support PDF"):
                build_book(
                    repo=repo_root,
                    book_rel="books/observer-patterns",
                    out_dir=tmp_path / "out",
                    formats=["epub"],
                )


def test_build_book_copies_artifacts_and_writes_manifest(repo_root: Path, tmp_path: Path) -> None:
    out_dir = tmp_path / "out"

    def fake_typst(**kwargs: object) -> Path:
        out = kwargs["book_dir"] / f"{kwargs['book_stem']}.pdf"
        out.write_bytes(b"%PDF-1.4 test")
        return out

    manifest_path = out_dir / "observer-patterns.manifest.json"

    with patch("after_certainty.export.build.export_typst_pdf", side_effect=fake_typst):
        with patch("after_certainty.export.build.generate_frontmatter_for_book", return_value=[]):
            with patch(
                "after_certainty.export.build.validate_book_for_publication", return_value=[]
            ):
                with patch(
                    "after_certainty.export.build.write_book_manifest",
                    return_value=manifest_path,
                ) as write_manifest:
                    build_book(
                        repo=repo_root,
                        book_rel="books/observer-patterns",
                        out_dir=out_dir,
                        formats=["pdf"],
                    )

    assert (out_dir / "observer-patterns.pdf").is_file()
    write_manifest.assert_called_once()
    assert write_manifest.call_args.kwargs["formats"] == ["pdf"]
