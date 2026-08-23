"""Tests for poetry/Typst export pipeline and book spec helpers."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path
from unittest.mock import patch

import pytest

_REPO = Path(__file__).resolve().parents[1]
if str(_REPO / "tools") not in sys.path:
    sys.path.insert(0, str(_REPO / "tools"))
if str(_REPO / "scripts") not in sys.path:
    sys.path.insert(0, str(_REPO / "scripts"))

from after_certainty.export.typst_manifest import (
    manifest_lines_for_units,
    parse_index_markdown_links,
)
from book_specs import (  # noqa: E402
    load_book_spec,
    resolve_spec_path,
    spec_formats,
    spec_pdf_engine,
    validate_book_spec,
)


def test_resolve_spec_path_finds_book_yml(repo_root: Path) -> None:
    book_dir = repo_root / "books" / "observer-patterns"
    spec_path = resolve_spec_path(book_dir)
    assert spec_path is not None
    assert spec_path.name == "book.yml"


def test_observer_patterns_spec_is_poetry_typst_pdf(repo_root: Path) -> None:
    spec_path = repo_root / "books" / "observer-patterns" / "book.yml"
    spec = load_book_spec(spec_path)
    assert spec["book"]["kind"] == "poetry"
    assert spec["publishing"]["enabled"] is True
    assert spec_formats(spec) == ["pdf"]
    assert spec_pdf_engine(spec) == "typst"


def test_poetry_spec_rejects_enabled_epub(repo_root: Path) -> None:
    spec_path = repo_root / "books" / "observer-patterns" / "book.yml"
    spec = load_book_spec(spec_path)
    bad = dict(spec)
    bad["build"] = dict(spec["build"])
    bad["build"]["formats"] = dict(spec["build"]["formats"])
    bad["build"]["formats"]["epub"] = {"enabled": True}
    with pytest.raises(ValueError, match="poetry books support PDF"):
        validate_book_spec(bad, spec_path)


def test_parse_index_markdown_links_preserves_order() -> None:
    index = """
# Title

## Front Matter

- [Copyright](front-matter/copyright.md)
- [Intro](front-matter/introduction.md)

## Part I

- [Bridge](parts/part-i/bridge.md)
- [Poem](parts/part-i/poem.md)
"""
    assert parse_index_markdown_links(index) == [
        "front-matter/copyright.md",
        "front-matter/introduction.md",
        "parts/part-i/bridge.md",
        "parts/part-i/poem.md",
    ]


def test_manifest_lines_for_bridge_and_poem() -> None:
    lines = manifest_lines_for_units(
        [
            "front-matter/copyright.md",
            "parts/part-i/bridge.md",
            "parts/part-i/poem.md",
        ],
        header="// test",
    )
    text = "\n".join(lines)
    assert '#import "template.typ": render-markdown, render-prose-markdown, render-bridge' in text
    assert "#render-prose-markdown" in text
    assert '#part-bridge(render-bridge("../parts/part-i/bridge.md"))' in text
    assert '#render-markdown("../parts/part-i/poem.md")' in text
    bridge_idx = text.index("part-i/bridge.md")
    poem_idx = text.index("part-i/poem.md")
    bridge_section = text[bridge_idx:poem_idx]
    assert "#pagebreak()" not in bridge_section
    assert "#pagebreak()" in text


def test_build_routes_typst_pdf_without_pandoc(repo_root: Path, tmp_path: Path) -> None:
    out_dir = tmp_path / "out"
    typst_calls: list[tuple] = []
    pdf_calls: list[tuple] = []

    def fake_typst(**kwargs: object) -> Path:
        typst_calls.append(kwargs)
        out = kwargs["book_dir"] / f"{kwargs['book_stem']}.pdf"
        out.write_bytes(b"%PDF-1.4 test")
        return out

    def fake_pdf(**kwargs: object) -> Path:
        pdf_calls.append(kwargs)
        out = kwargs["book_dir"] / f"{kwargs['book_stem']}.pdf"
        out.write_bytes(b"%PDF-1.4 test")
        return out

    with patch("after_certainty.export.build.export_typst_pdf", side_effect=fake_typst):
        with patch("after_certainty.export.build.export_pdf", side_effect=fake_pdf):
            with patch(
                "after_certainty.export.build.generate_frontmatter_for_book", return_value=[]
            ):
                with patch(
                    "after_certainty.export.build.validate_book_for_publication",
                    return_value=[],
                ):
                    with patch(
                        "after_certainty.export.build.write_book_manifest",
                        return_value=out_dir / "observer-patterns.manifest.json",
                    ):
                        from after_certainty.export.build import build_book

                        build_book(
                            repo=repo_root,
                            book_rel="books/observer-patterns",
                            out_dir=out_dir,
                            formats=["pdf"],
                        )

    assert typst_calls
    assert not pdf_calls


def test_build_rejects_epub_for_poetry(repo_root: Path, tmp_path: Path) -> None:
    build_script = repo_root / "scripts" / "build.py"
    result = subprocess.run(
        [
            sys.executable,
            str(build_script),
            "--repo",
            str(repo_root),
            "--book-dir",
            "books/observer-patterns",
            "--out-dir",
            str(tmp_path / "out"),
            "--format",
            "epub",
        ],
        capture_output=True,
        text=True,
    )
    assert result.returncode != 0
    assert "Poetry books support PDF (Typst) only" in result.stderr + result.stdout


@pytest.fixture
def repo_root() -> Path:
    return _REPO
