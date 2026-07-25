"""INGRAM-005: print wrap + template-meta validation and {isbn}_cvr staging."""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

import pytest
import yaml

_REPO = Path(__file__).resolve().parents[1]
_TOOLS = _REPO / "tools"
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from book_specs import load_spec_for_book_dir  # noqa: E402
from ingramspark.cover_validate import (  # noqa: E402
    CoverValidateError,
    stale_page_count_message,
    validate_print_cover,
    validate_print_cover_or_raise,
)
from ingramspark.paths import print_cover_pdf_path  # noqa: E402

gs = shutil.which("gs")
requires_gs = pytest.mark.skipif(gs is None, reason="ghostscript required for wrap fixtures")


def _temp_repo(tmp_path: Path) -> Path:
    repo = tmp_path / "repo"
    repo.mkdir()
    (repo / "schema").symlink_to(_REPO / "schema", target_is_directory=True)
    (repo / "tools").symlink_to(_REPO / "tools", target_is_directory=True)
    (repo / "scripts").symlink_to(_REPO / "scripts", target_is_directory=True)
    return repo


def _write_wrap_pdf(
    path: Path,
    *,
    width_in: float = 12.5,
    height_in: float = 9.25,
) -> None:
    """Single-page CMYK-ish wrap PDF at the given media box (inches)."""
    path.parent.mkdir(parents=True, exist_ok=True)
    w_pts = width_in * 72
    h_pts = height_in * 72
    ps = path.with_suffix(".ps")
    ps.write_text(
        "%!PS-Adobe-3.0\n"
        f"<< /PageSize [{w_pts} {h_pts}] >> setpagedevice\n"
        "0 1 1 0 setcmykcolor\n"
        "36 36 200 200 rectfill\n"
        "showpage\n",
        encoding="utf-8",
    )
    proc = subprocess.run(
        [
            "gs",
            "-dBATCH",
            "-dNOPAUSE",
            "-dSAFER",
            "-sDEVICE=pdfwrite",
            "-sColorConversionStrategy=CMYK",
            "-dProcessColorModel=/DeviceCMYK",
            f"-sOutputFile={path.as_posix()}",
            ps.as_posix(),
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    assert proc.returncode == 0, proc.stderr
    ps.unlink(missing_ok=True)


def _template_meta(
    *,
    page_count: int = 200,
    trim_w: float = 6.0,
    trim_h: float = 9.0,
    box_w: float = 12.5,
    box_h: float = 9.25,
    barcode_supplied: bool | None = False,
    spine_text: bool = False,
    paper: str = "cream",
    color_mode: str = "black-and-white",
) -> dict:
    meta: dict = {
        "page_count": page_count,
        "trim": {"width_inches": trim_w, "height_inches": trim_h},
        "binding": "perfect-bound",
        "paper": paper,
        "color_mode": color_mode,
        "media_box": {"width_inches": box_w, "height_inches": box_h},
        "spine_width_inches": 0.5,
        "spine_text": spine_text,
    }
    if barcode_supplied is not None:
        meta["barcode_supplied"] = barcode_supplied
    return meta


def _fixture_book(
    root: Path,
    *,
    isbn: str = "9780000000404",
    template_page_count: int = 200,
    trim_w: float = 6.0,
    trim_h: float = 9.0,
    barcode_mode: str = "ingram-generated",
    write_wrap: bool = True,
    write_meta: bool = True,
    meta: dict | None = None,
    wrap_w: float = 12.5,
    wrap_h: float = 9.25,
) -> Path:
    book_dir = root / "books" / "ingram-cover-fixture"
    assets = book_dir / "assets" / "ingramspark"
    assets.mkdir(parents=True)
    if write_wrap:
        _write_wrap_pdf(assets / "cover-wrap.pdf", width_in=wrap_w, height_in=wrap_h)
    if write_meta:
        (assets / "template-meta.yml").write_text(
            yaml.safe_dump(meta or _template_meta(page_count=template_page_count), sort_keys=False),
            encoding="utf-8",
        )
    (book_dir / "index.md").write_text("# Cover Fixture\n", encoding="utf-8")
    spec = {
        "version": 1,
        "publishing": {
            "enabled": True,
            "targets": {
                "ingramspark": {
                    "enabled": True,
                    "specification_profile": "ingramspark-2026-07",
                    "status": "planning",
                    "package": {"github_release": False, "immutable_release": False},
                    "ebook": {"enabled": False},
                    "print": {
                        "enabled": True,
                        "edition": "paperback",
                        "isbn": isbn,
                        "binding": "perfect-bound",
                        "trim": {"width_inches": trim_w, "height_inches": trim_h},
                        "interior": {
                            "color_mode": "black-and-white",
                            "paper": "cream",
                            "bleed": False,
                        },
                        "cover": {
                            "strategy": "supplied-wrap",
                            "source": "assets/ingramspark/cover-wrap.pdf",
                            "template_page_count": template_page_count,
                            "barcode_mode": barcode_mode,
                        },
                    },
                }
            },
        },
        "book": {
            "id": "ingram-cover-fixture",
            "title": "Ingram Cover Fixture",
            "language": "en",
            "copyright_year": 2026,
            "author": {"name": "Test Author"},
        },
        "paths": {"manuscript": "./index.md", "output": "."},
        "frontmatter": {"generate": {"enabled": False}},
        "build": {
            "formats": {
                "epub": {"enabled": False},
                "pdf": {"enabled": False},
                "docx": {"enabled": False},
            }
        },
        "github": {"release": False, "release_tag": "latest", "artifacts": ["pdf"]},
    }
    (book_dir / "book.yml").write_text(yaml.safe_dump(spec, sort_keys=False), encoding="utf-8")
    return book_dir


def _write_page_count(repo: Path, book_id: str, pages: int) -> None:
    path = repo / "build" / "ingramspark" / book_id / "print" / "page-count.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"page_count": pages}) + "\n", encoding="utf-8")


@requires_gs
def test_valid_cover_stages_cvr_pdf(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo, template_page_count=200)
    _write_page_count(repo, "ingram-cover-fixture", 200)
    spec = load_spec_for_book_dir(book_dir)
    result = validate_print_cover_or_raise(repo=repo, book_dir=book_dir, spec=spec)
    assert result.ok is True
    staged = print_cover_pdf_path(repo, spec)
    assert staged.is_file()
    assert staged.name == "9780000000404_cvr.pdf"
    assert result.report_path is not None and result.report_path.is_file()


@requires_gs
def test_stale_page_count_actionable_message(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo, template_page_count=238)
    _write_page_count(repo, "ingram-cover-fixture", 242)
    spec = load_spec_for_book_dir(book_dir)
    result = validate_print_cover(repo=repo, book_dir=book_dir, spec=spec)
    assert result.ok is False
    expected = stale_page_count_message(template_pages=238, interior_pages=242)
    assert expected in result.errors
    assert result.staged_cover_path is None


@requires_gs
def test_trim_mismatch_vs_template_meta(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(
        repo,
        trim_w=5.5,
        trim_h=8.5,
        meta=_template_meta(trim_w=6.0, trim_h=9.0, page_count=200),
        template_page_count=200,
    )
    _write_page_count(repo, "ingram-cover-fixture", 200)
    spec = load_spec_for_book_dir(book_dir)
    result = validate_print_cover(repo=repo, book_dir=book_dir, spec=spec)
    assert result.ok is False
    assert any("print.trim" in e and "template-meta" in e for e in result.errors)


@requires_gs
def test_wrong_wrap_media_box_fails(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(
        repo,
        wrap_w=11.0,
        wrap_h=8.5,
        meta=_template_meta(box_w=12.5, box_h=9.25, page_count=200),
        template_page_count=200,
    )
    _write_page_count(repo, "ingram-cover-fixture", 200)
    spec = load_spec_for_book_dir(book_dir)
    result = validate_print_cover(repo=repo, book_dir=book_dir, spec=spec)
    assert result.ok is False
    assert any("media box" in e.lower() for e in result.errors)


@requires_gs
def test_missing_wrap_fails(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo, write_wrap=False, template_page_count=200)
    # book.yml schema validation requires wrap to exist at load time — write a stub
    # then delete after load? For runtime validator, call resolve path with missing file
    # by writing wrap for load_spec then removing it.
    wrap = book_dir / "assets" / "ingramspark" / "cover-wrap.pdf"
    wrap.write_bytes(b"%PDF-1.4\n")
    spec = load_spec_for_book_dir(book_dir)
    wrap.unlink()
    result = validate_print_cover(repo=repo, book_dir=book_dir, spec=spec, interior_page_count=200)
    assert result.ok is False
    assert any("Missing print cover wrap" in e for e in result.errors)


@requires_gs
def test_missing_template_meta_fails(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo, write_meta=False, template_page_count=200)
    spec = load_spec_for_book_dir(book_dir)
    result = validate_print_cover(repo=repo, book_dir=book_dir, spec=spec, interior_page_count=200)
    assert result.ok is False
    assert any("template-meta.yml" in e for e in result.errors)


@requires_gs
def test_barcode_mode_supplied_requires_meta_flag(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(
        repo,
        barcode_mode="supplied",
        meta=_template_meta(barcode_supplied=False, page_count=200),
        template_page_count=200,
    )
    spec = load_spec_for_book_dir(book_dir)
    result = validate_print_cover(repo=repo, book_dir=book_dir, spec=spec, interior_page_count=200)
    assert result.ok is False
    assert any("barcode_mode is supplied" in e for e in result.errors)


@requires_gs
def test_barcode_mode_ingram_generated_rejects_supplied_flag(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(
        repo,
        barcode_mode="ingram-generated",
        meta=_template_meta(barcode_supplied=True, page_count=200),
        template_page_count=200,
    )
    spec = load_spec_for_book_dir(book_dir)
    result = validate_print_cover(repo=repo, book_dir=book_dir, spec=spec, interior_page_count=200)
    assert result.ok is False
    assert any("ingram-generated" in e and "barcode_supplied" in e for e in result.errors)


@requires_gs
def test_barcode_mode_supplied_ok(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(
        repo,
        barcode_mode="supplied",
        meta=_template_meta(barcode_supplied=True, page_count=200),
        template_page_count=200,
    )
    spec = load_spec_for_book_dir(book_dir)
    result = validate_print_cover_or_raise(
        repo=repo, book_dir=book_dir, spec=spec, interior_page_count=200
    )
    assert result.ok is True


@requires_gs
def test_spine_text_forbidden_under_48_pages(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(
        repo,
        template_page_count=40,
        meta=_template_meta(page_count=40, spine_text=True),
    )
    spec = load_spec_for_book_dir(book_dir)
    result = validate_print_cover(repo=repo, book_dir=book_dir, spec=spec, interior_page_count=40)
    assert result.ok is False
    assert any("Spine text" in e for e in result.errors)


@requires_gs
def test_book_yml_template_page_count_must_match_meta(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(
        repo,
        template_page_count=200,
        meta=_template_meta(page_count=210),
    )
    spec = load_spec_for_book_dir(book_dir)
    result = validate_print_cover(repo=repo, book_dir=book_dir, spec=spec, interior_page_count=210)
    assert result.ok is False
    assert any("template_page_count" in e for e in result.errors)


@requires_gs
def test_validate_cli(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    _fixture_book(repo, isbn="9780000000505", template_page_count=180)
    _write_page_count(repo, "ingram-cover-fixture", 180)
    proc = subprocess.run(
        [
            sys.executable,
            str(_REPO / "scripts/validate_ingramspark_print_cover.py"),
            "--repo",
            str(repo),
            "--book-dir",
            "books/ingram-cover-fixture",
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    assert proc.returncode == 0, proc.stderr + proc.stdout
    assert "9780000000505_cvr.pdf" in proc.stdout


def test_stale_message_wording() -> None:
    msg = stale_page_count_message(template_pages=238, interior_pages=242)
    assert "238 pages" in msg
    assert "242 pages" in msg
    assert "Request or generate a new IngramSpark cover template" in msg


def test_validate_requires_opt_in(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = repo / "books" / "no-cover"
    book_dir.mkdir(parents=True)
    (book_dir / "index.md").write_text("# Hi\n", encoding="utf-8")
    (book_dir / "book.yml").write_text(
        yaml.safe_dump(
            {
                "version": 1,
                "publishing": {"enabled": True},
                "book": {
                    "id": "no-cover",
                    "title": "No Cover",
                    "language": "en",
                    "copyright_year": 2026,
                    "author": {"name": "A"},
                },
                "paths": {"manuscript": "./index.md", "output": "."},
                "frontmatter": {"generate": {"enabled": False}},
                "build": {"formats": {"pdf": {"enabled": False}}},
                "github": {"release": False, "release_tag": "latest", "artifacts": ["pdf"]},
            },
            sort_keys=False,
        ),
        encoding="utf-8",
    )
    spec = load_spec_for_book_dir(book_dir)
    with pytest.raises(CoverValidateError, match="enabled must be true"):
        validate_print_cover_or_raise(
            repo=repo, book_dir=book_dir, spec=spec, interior_page_count=10
        )
