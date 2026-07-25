"""INGRAM-004: PDF/X proof, print-interior export, trim/color/font checks."""

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

from ingramspark.pdf_inspect import inspect_pdf, media_box_matches_trim  # noqa: E402
from ingramspark.pdfx_proof import PdfxProofError, build_grayscale_pdfx_proof  # noqa: E402
from ingramspark.print_export import (  # noqa: E402
    PrintExportError,
    convert_pdf_to_device_gray,
    export_ingramspark_print_interior,
    validate_print_interior,
)
from ingramspark.profile import load_profile  # noqa: E402

pandoc = shutil.which("pandoc")
xelatex = shutil.which("xelatex")
gs = shutil.which("gs")
requires_print_tools = pytest.mark.skipif(
    pandoc is None or xelatex is None or gs is None,
    reason="pandoc, xelatex, and ghostscript required for print export tests",
)
requires_gs = pytest.mark.skipif(gs is None, reason="ghostscript required")


def _temp_repo(tmp_path: Path) -> Path:
    repo = tmp_path / "repo"
    repo.mkdir()
    (repo / "schema").symlink_to(_REPO / "schema", target_is_directory=True)
    (repo / "tools").symlink_to(_REPO / "tools", target_is_directory=True)
    (repo / "scripts").symlink_to(_REPO / "scripts", target_is_directory=True)
    (repo / "templates").mkdir()
    return repo


def _fixture_print_book(
    root: Path,
    *,
    isbn: str = "9780000000202",
    width: float = 6.0,
    height: float = 9.0,
    color_mode: str = "black-and-white",
) -> Path:
    book_dir = root / "books" / "ingram-print-fixture"
    book_dir.mkdir(parents=True)
    wrap = book_dir / "assets" / "ingramspark"
    wrap.mkdir(parents=True)
    (wrap / "cover-wrap.pdf").write_bytes(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    (book_dir / "chapter-1.md").write_text(
        "# Chapter One\n\nHello from the print fixture.\n\nMore body text for pagination.\n",
        encoding="utf-8",
    )
    (book_dir / "index.md").write_text(
        "# Ingram Print Fixture\n\n[Chapter One](chapter-1.md)\n",
        encoding="utf-8",
    )
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
                        "trim": {"width_inches": width, "height_inches": height},
                        "interior": {
                            "color_mode": color_mode,
                            "paper": "cream",
                            "bleed": False,
                        },
                        "cover": {
                            "strategy": "supplied-wrap",
                            "source": "assets/ingramspark/cover-wrap.pdf",
                            "template_page_count": 2,
                            "barcode_mode": "ingram-generated",
                        },
                    },
                }
            },
        },
        "book": {
            "id": "ingram-print-fixture",
            "title": "Ingram Print Fixture",
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


@requires_gs
def test_pdfx_proof_builds_6x9_with_output_intent(tmp_path: Path) -> None:
    out = tmp_path / "proof"
    result = build_grayscale_pdfx_proof(out_dir=out)
    assert result.pdf_path.is_file()
    assert result.inspection_path.is_file()
    assert media_box_matches_trim(result.inspection, width_inches=6.0, height_inches=9.0)
    assert result.inspection.has_output_intent is True
    assert result.inspection.page_count == 1
    assert result.construction["conformance_target"] == "PDF/X-3:2002"
    assert result.construction["account_upload_status"] == "pending-human"
    # pdfinfo should report PDF/X subtype when Ghostscript stamped it.
    info = subprocess.run(
        ["pdfinfo", result.pdf_path.as_posix()],
        capture_output=True,
        text=True,
        check=False,
    )
    assert "PDF/X-3:2002" in (info.stdout or "")


@requires_gs
def test_profile_records_pdfx_construction_candidate() -> None:
    profile = load_profile("ingramspark-2026-07")
    construction = profile["print"]["pdfx_construction"]
    assert construction["id"] == "gs-pdfx3-gray-sgray-output-intent"
    assert construction["status"] == "candidate-local-proof"
    assert profile["print"]["pdfx_icc_policy"] == "account-verification-needed"


@requires_gs
def test_wrong_trim_fails_media_box_helper(tmp_path: Path) -> None:
    out = tmp_path / "proof"
    result = build_grayscale_pdfx_proof(out_dir=out)
    assert media_box_matches_trim(result.inspection, width_inches=5.5, height_inches=8.5) is False


@requires_gs
def test_rgb_content_fails_bw_validation(tmp_path: Path) -> None:
    """A PDF with RGB content-stream operators must fail B&W interior validation."""
    ps = tmp_path / "rgb.ps"
    ps.write_text(
        "%!PS-Adobe-3.0\n"
        "<< /PageSize [432 648] >> setpagedevice\n"
        "1 0 0 setrgbcolor\n"
        "72 72 200 200 rectfill\n"
        "showpage\n",
        encoding="utf-8",
    )
    rgb_pdf = tmp_path / "rgb.pdf"
    proc = subprocess.run(
        [
            "gs",
            "-dBATCH",
            "-dNOPAUSE",
            "-dSAFER",
            "-sDEVICE=pdfwrite",
            "-sColorConversionStrategy=LeaveColorUnchanged",
            "-dProcessColorModel=/DeviceRGB",
            f"-sOutputFile={rgb_pdf.as_posix()}",
            ps.as_posix(),
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    assert proc.returncode == 0, proc.stderr
    inspection = inspect_pdf(rgb_pdf)
    assert inspection.mentions_device_rgb is True
    report = validate_print_interior(
        pdf_path=rgb_pdf,
        width_inches=6.0,
        height_inches=9.0,
        color_mode="black-and-white",
    )
    assert report["ok"] is False
    assert any("DeviceRGB" in e for e in report["errors"])


@requires_gs
def test_grayscale_conversion_removes_rgb(tmp_path: Path) -> None:
    ps = tmp_path / "rgb.ps"
    ps.write_text(
        "%!PS-Adobe-3.0\n"
        "<< /PageSize [432 648] >> setpagedevice\n"
        "1 0 0 setrgbcolor\n"
        "72 72 200 200 rectfill\n"
        "showpage\n",
        encoding="utf-8",
    )
    rgb_pdf = tmp_path / "rgb.pdf"
    gray_pdf = tmp_path / "gray.pdf"
    subprocess.run(
        [
            "gs",
            "-dBATCH",
            "-dNOPAUSE",
            "-dSAFER",
            "-sDEVICE=pdfwrite",
            "-sColorConversionStrategy=RGB",
            "-dProcessColorModel=/DeviceRGB",
            f"-sOutputFile={rgb_pdf.as_posix()}",
            ps.as_posix(),
        ],
        check=True,
        capture_output=True,
    )
    convert_pdf_to_device_gray(src=rgb_pdf, dest=gray_pdf)
    report = validate_print_interior(
        pdf_path=gray_pdf,
        width_inches=6.0,
        height_inches=9.0,
        color_mode="black-and-white",
    )
    assert report["ok"] is True
    assert report["inspection"]["mentions_device_rgb"] is not True


@requires_print_tools
def test_print_interior_export_isbn_trim_and_page_count(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = _fixture_print_book(repo, isbn="9780000000202", width=6.0, height=9.0)
    from book_specs import load_spec_for_book_dir

    spec = load_spec_for_book_dir(book_dir)
    result = export_ingramspark_print_interior(
        repo=repo,
        book_dir=book_dir,
        spec=spec,
        pandoc="pandoc",
        pdf_engine="xelatex",
    )
    assert result.pdf_path.name == "9780000000202_txt.pdf"
    assert result.pdf_path.is_file()
    assert result.page_count >= 1
    assert result.page_count_path.is_file()
    payload = json.loads(result.page_count_path.read_text(encoding="utf-8"))
    assert payload["page_count"] == result.page_count
    assert payload["trim_inches"] == {"width": 6.0, "height": 9.0}
    inspection = inspect_pdf(result.pdf_path)
    assert media_box_matches_trim(inspection, width_inches=6.0, height_inches=9.0)
    assert inspection.all_fonts_embedded is True
    assert inspection.mentions_device_rgb is not True


@requires_print_tools
def test_print_export_cli(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    _fixture_print_book(repo, isbn="9780000000303", width=5.5, height=8.5)
    proc = subprocess.run(
        [
            sys.executable,
            str(_REPO / "scripts/export_ingramspark_print.py"),
            "--repo",
            str(repo),
            "--book-dir",
            "books/ingram-print-fixture",
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    assert proc.returncode == 0, proc.stderr + proc.stdout
    out_pdf = repo / "build/ingramspark/ingram-print-fixture/print/9780000000303_txt.pdf"
    assert out_pdf.is_file()
    inspection = inspect_pdf(out_pdf)
    assert media_box_matches_trim(inspection, width_inches=5.5, height_inches=8.5)


@requires_print_tools
def test_missing_fonts_flagged(tmp_path: Path) -> None:
    """pdffonts emb=no should fail validation."""
    # Build a minimal PDF that references Helvetica without embedding via PostScript.
    ps = tmp_path / "font.ps"
    ps.write_text(
        "%!PS-Adobe-3.0\n"
        "<< /PageSize [432 648] >> setpagedevice\n"
        "/Helvetica findfont 12 scalefont setfont\n"
        "0 setgray\n"
        "72 600 moveto (Hello) show\n"
        "showpage\n",
        encoding="utf-8",
    )
    pdf = tmp_path / "font.pdf"
    # Use ps2write-like path: pdfwrite may embed by default; force no subset embed if possible.
    # Ghostscript typically embeds; instead craft a PDF with Type1 unembedded via qpdf isn't easy.
    # Validate the helper path: mutate inspection by writing a known-unembedded case with
    # Ghostscript -dEmbedAllFonts=false.
    proc = subprocess.run(
        [
            "gs",
            "-dBATCH",
            "-dNOPAUSE",
            "-dSAFER",
            "-sDEVICE=pdfwrite",
            "-dEmbedAllFonts=false",
            "-dSubsetFonts=false",
            "-sColorConversionStrategy=Gray",
            "-dProcessColorModel=/DeviceGray",
            f"-sOutputFile={pdf.as_posix()}",
            ps.as_posix(),
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    assert proc.returncode == 0, proc.stderr
    fonts = subprocess.run(
        ["pdffonts", pdf.as_posix()],
        capture_output=True,
        text=True,
        check=False,
    )
    if (
        "yes" in (fonts.stdout or "").lower()
        and "no" not in "\n".join((fonts.stdout or "").splitlines()[2:]).lower()
    ):
        pytest.skip("Ghostscript embedded fonts despite -dEmbedAllFonts=false")
    report = validate_print_interior(
        pdf_path=pdf,
        width_inches=6.0,
        height_inches=9.0,
        color_mode="black-and-white",
    )
    if report["inspection"]["all_fonts_embedded"] is False:
        assert report["ok"] is False
        assert any("embedded" in e.lower() for e in report["errors"])
    else:
        pytest.skip("Could not produce an unembedded-font PDF in this environment")


@requires_gs
def test_pdfx_proof_cli(tmp_path: Path) -> None:
    out = tmp_path / "cli-proof"
    proc = subprocess.run(
        [
            sys.executable,
            str(_REPO / "scripts/build_ingramspark_pdfx_proof.py"),
            "--repo",
            str(_REPO),
            "--out-dir",
            str(out),
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    assert proc.returncode == 0, proc.stderr + proc.stdout
    assert (out / "grayscale-pdfx3-proof.pdf").is_file()


def test_print_export_requires_opt_in(tmp_path: Path) -> None:
    repo = _temp_repo(tmp_path)
    book_dir = repo / "books" / "no-target"
    book_dir.mkdir(parents=True)
    (book_dir / "index.md").write_text("# Hi\n", encoding="utf-8")
    (book_dir / "book.yml").write_text(
        yaml.safe_dump(
            {
                "version": 1,
                "publishing": {"enabled": True},
                "book": {
                    "id": "no-target",
                    "title": "No Target",
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
    from book_specs import load_spec_for_book_dir

    spec = load_spec_for_book_dir(book_dir)
    with pytest.raises(PrintExportError, match="enabled must be true"):
        export_ingramspark_print_interior(repo=repo, book_dir=book_dir, spec=spec)


def test_pdfx_proof_missing_gs(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    monkeypatch.setattr("ingramspark.pdfx_proof.shutil.which", lambda _name: None)
    with pytest.raises(PdfxProofError, match="Ghostscript"):
        build_grayscale_pdfx_proof(out_dir=tmp_path / "x")
