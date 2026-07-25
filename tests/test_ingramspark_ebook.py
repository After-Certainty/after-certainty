"""INGRAM-003: IngramSpark ebook export, preflight, ebook-only package, website exclusion."""

from __future__ import annotations

import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

import pytest
import yaml

_REPO = Path(__file__).resolve().parents[1]
_TOOLS = _REPO / "tools"
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from book_specs import load_book_spec, spec_formats, validate_book_spec  # noqa: E402
from ingramspark.ebook_cover import EbookCoverError, export_ebook_cover_jpg  # noqa: E402
from ingramspark.ebook_preflight import run_ebook_preflight  # noqa: E402
from ingramspark.paths import ebook_output_dir, package_zip_path  # noqa: E402
from manifest_books import build_book_entry, format_entry  # noqa: E402

pandoc = shutil.which("pandoc")
requires_pandoc = pytest.mark.skipif(pandoc is None, reason="pandoc not installed")


def _write_cover(path: Path, size: tuple[int, int] = (1600, 2560)) -> None:
    try:
        from PIL import Image
    except ModuleNotFoundError:
        pytest.skip("Pillow required for cover fixtures")
    path.parent.mkdir(parents=True, exist_ok=True)
    Image.new("RGB", size, color=(40, 80, 120)).save(path)


def _fixture_book(
    root: Path,
    *,
    isbn: str = "9780000000101",
    cover_size: tuple[int, int] = (1600, 2560),
    enabled: bool = True,
) -> Path:
    book_dir = root / "books" / "ingram-ebook-fixture"
    book_dir.mkdir(parents=True)
    _write_cover(book_dir / "cover.png", cover_size)
    (book_dir / "index.md").write_text(
        "# Chapter One\n\nHello from the fixture manuscript.\n",
        encoding="utf-8",
    )
    spec = {
        "version": 1,
        "publishing": {
            "enabled": True,
            "targets": {
                "ingramspark": {
                    "enabled": enabled,
                    "specification_profile": "ingramspark-2026-07",
                    "status": "planning",
                    "package": {"github_release": False, "immutable_release": False},
                    "ebook": {
                        "enabled": True,
                        "isbn": isbn,
                        "format": "reflowable",
                        "cover_source": "cover.png",
                    },
                    "print": {"enabled": False},
                }
            },
        },
        "book": {
            "id": "ingram-ebook-fixture",
            "title": "Ingram Ebook Fixture",
            "subtitle": "Test Subtitle",
            "language": "en",
            "copyright_year": 2026,
            "author": {"name": "Test Author"},
            "title_page_cover": "cover.png",
        },
        "paths": {"manuscript": "./index.md", "output": "."},
        "frontmatter": {"generate": {"enabled": False}},
        "build": {
            "formats": {
                "epub": {"enabled": True},
                "pdf": {"enabled": False},
                "docx": {"enabled": False},
            }
        },
        "github": {"release": True, "release_tag": "latest", "artifacts": ["epub"]},
    }
    (book_dir / "book.yml").write_text(yaml.safe_dump(spec, sort_keys=False), encoding="utf-8")
    # Copy profile path resolution uses repo schema/; point --repo at real repo for profile,
    # but book dir lives under tmp. Scripts take book-dir relative to --repo, so we instead
    # place the fixture under a temp repo that includes schema/profiles via symlink.
    return book_dir


def _temp_repo(tmp_path: Path) -> Path:
    repo = tmp_path / "repo"
    repo.mkdir()
    (repo / "schema").symlink_to(_REPO / "schema", target_is_directory=True)
    (repo / "tools").symlink_to(_REPO / "tools", target_is_directory=True)
    (repo / "scripts").symlink_to(_REPO / "scripts", target_is_directory=True)
    (repo / "templates").mkdir()
    return repo


@requires_pandoc
def test_ebook_only_package_produces_isbn_named_files(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo)
    rel = "books/ingram-ebook-fixture"
    proc = subprocess.run(
        [
            sys.executable,
            str(_REPO / "scripts/package_ingramspark.py"),
            "--repo",
            str(repo),
            "--book-dir",
            rel,
            "--ebook-only",
        ],
        capture_output=True,
        text=True,
        cwd=str(_REPO),
    )
    assert proc.returncode == 0, proc.stdout + proc.stderr
    zip_path = Path(proc.stdout.strip().splitlines()[-1])
    assert zip_path.is_file()
    assert zip_path.name == "ingram-ebook-fixture-ingramspark.zip"

    with zipfile.ZipFile(zip_path, "r") as zf:
        names = set(zf.namelist())
    assert "ebook/9780000000101.epub" in names
    assert "ebook/9780000000101.jpg" in names
    assert "ebook/preflight.json" in names
    assert "README-UPLOAD.txt" in names
    assert "package-manifest.json" in names
    assert "checksums.sha256" in names
    assert "metadata/source-commit.txt" in names
    assert not any(n.startswith("print/") for n in names)

    # Public stem EPUB must not be created in the book dir by this pipeline.
    assert not (book_dir / "ingram-ebook-fixture.epub").exists()


def test_undersized_cover_is_blocking(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo, cover_size=(1024, 1536))
    spec = load_book_spec(book_dir / "book.yml")
    with pytest.raises(EbookCoverError, match="requires at least 2560"):
        export_ebook_cover_jpg(repo=repo, book_dir=book_dir, spec=spec)


def test_missing_cover_jpg_fails_preflight(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo)
    spec = load_book_spec(book_dir / "book.yml")
    out = ebook_output_dir(repo, spec)
    out.mkdir(parents=True, exist_ok=True)
    # Create a tiny fake epub zip so preflight gets past missing-epub for cover check path.
    epub = out / "9780000000101.epub"
    with zipfile.ZipFile(epub, "w") as zf:
        zf.writestr("mimetype", "application/epub+zip")
    report = run_ebook_preflight(repo=repo, spec=spec, skip_epubcheck=True)
    assert report.ok is False
    assert any(i.id == "ebook-cover-missing" for i in report.issues)


@requires_pandoc
def test_epubcheck_failure_is_blocking(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo)
    spec = load_book_spec(book_dir / "book.yml")
    out = ebook_output_dir(repo, spec)
    out.mkdir(parents=True, exist_ok=True)
    export_ebook_cover_jpg(repo=repo, book_dir=book_dir, spec=spec)
    # Invalid EPUB bytes should fail EPUBCheck.
    (out / "9780000000101.epub").write_bytes(b"not-an-epub")
    report = run_ebook_preflight(repo=repo, spec=spec, skip_epubcheck=False)
    assert report.ok is False
    assert any(i.id == "epubcheck" for i in report.issues)


def test_website_manifest_excludes_ingramspark_target(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo)
    spec_path = book_dir / "book.yml"
    spec = load_book_spec(spec_path)
    assert "ingramspark" not in spec_formats(spec)
    entry = format_entry(
        "owner/repo",
        "latest",
        "epub",
        "ingram-ebook-fixture",
        True,
        include_release_url=True,
    )
    assert set(entry.keys()) == {"enabled", "file", "url"}
    book_entry = build_book_entry(
        repo=repo,
        spec_path=spec_path,
        spec=spec,
        repo_slug="owner/repo",
        ref="main",
        release_tag="latest",
        source="books",
        status="published",
    )
    assert "ingramspark" not in book_entry
    assert {"docx", "epub", "pdf"} <= set(book_entry.keys())
    assert book_entry["epub"]["enabled"] is True
    assert book_entry["epub"]["file"] == "ingram-ebook-fixture.epub"


def test_profile_versions_remain_distinct() -> None:
    from ingramspark.profile import load_profile

    profile = load_profile("ingramspark-2026-07")
    assert profile["epub_content_version"] == "3.0"
    assert profile["epubcheck_tool_version"] == "5.3.0"


def test_disabled_target_still_validates_without_package(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_book(repo, enabled=False)
    # When master enabled is false, ebook.enabled true still needs isbn etc. by schema only
    # if ebook block is present — our fixture sets enabled false on target.
    spec = yaml.safe_load((book_dir / "book.yml").read_text(encoding="utf-8"))
    validate_book_spec(spec, book_dir / "book.yml")
    assert package_zip_path(repo, spec).name == "ingram-ebook-fixture-ingramspark.zip"
