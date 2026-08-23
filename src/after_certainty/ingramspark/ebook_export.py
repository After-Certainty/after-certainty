"""Build an IngramSpark production EPUB (ISBN-named, separate from public exports)."""

from __future__ import annotations

import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from after_certainty.core.repo_root import repo_root
from after_certainty.export.assets import epub_css
from after_certainty.ingramspark.ebook_cover import export_epub_internal_cover_image
from after_certainty.ingramspark.paths import ebook_isbn, ebook_output_dir
from book_specs import spec_ingramspark_enabled, spec_ingramspark_target

_REPO_ROOT = repo_root(Path(__file__))
_TOOLS = _REPO_ROOT / "tools"


@dataclass(frozen=True)
class EbookExportResult:
    epub_path: Path
    isbn: str
    prep_markdown: Path


class EbookExportError(ValueError):
    pass


def _as_dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def _run(cmd: list[str]) -> None:
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as exc:
        raise EbookExportError(f"Command failed ({exc.returncode}): {' '.join(cmd)}") from exc


def _require_ebook_enabled(spec: dict[str, Any]) -> dict[str, Any]:
    if not spec_ingramspark_enabled(spec):
        raise EbookExportError("publishing.targets.ingramspark.enabled must be true")
    target = spec_ingramspark_target(spec)
    ebook = _as_dict(target.get("ebook"))
    if ebook.get("enabled", False) is not True:
        raise EbookExportError("publishing.targets.ingramspark.ebook.enabled must be true")
    return ebook


def export_ingramspark_epub(
    *,
    repo: Path,
    book_dir: Path,
    spec: dict[str, Any],
    pandoc: str = "pandoc",
) -> EbookExportResult:
    """
    Produce ``build/ingramspark/<book-id>/ebook/<isbn>.epub``.

    Reuses shared flatten + pandoc + postprocess, but writes a target-specific path and
    injects edition ISBN / bibliographic metadata. Does not modify public ``{stem}.epub``.
    """
    ebook = _require_ebook_enabled(spec)
    book = _as_dict(spec.get("book"))
    index = book_dir / "index.md"
    if not index.is_file():
        raise EbookExportError(f"Missing index.md: {index}")

    isbn = ebook_isbn(spec)
    out_dir = ebook_output_dir(repo, spec)
    out_dir.mkdir(parents=True, exist_ok=True)
    prep = out_dir / "export-ingramspark.md"
    out_epub = out_dir / f"{isbn}.epub"

    _run(
        [
            sys.executable,
            (_TOOLS / "kindle-flatten.py").as_posix(),
            "--book-dir",
            book_dir.as_posix(),
            "--index",
            index.as_posix(),
            "--out",
            prep.as_posix(),
            "--flatten-custom-blocks",
        ]
    )

    # Separate external JPG (large) is exported by ebook_cover.export_ebook_cover_jpg.
    # Pandoc embeds this resized internal cover so EPUB images stay under the pixel cap.
    cover = export_epub_internal_cover_image(repo=repo, book_dir=book_dir, spec=spec)
    title = str(book.get("title") or "").strip()
    subtitle = str(book.get("subtitle") or "").strip()
    language = str(book.get("language") or "en").strip() or "en"
    author = _as_dict(book.get("author")).get("name")
    if not author:
        authors = book.get("authors")
        if isinstance(authors, list) and authors:
            author = _as_dict(authors[0]).get("name")
    author = str(author or "").strip()

    fmt = str(ebook.get("format") or "reflowable").strip()
    if fmt != "reflowable":
        raise EbookExportError(
            f"IngramSpark ebook format {fmt!r} is not supported yet; use reflowable"
        )

    cmd = [
        pandoc,
        prep.as_posix(),
        f"--resource-path={book_dir}",
        "--from=markdown+fenced_divs",
        "--toc",
        "--toc-depth=1",
        "--epub-title-page=false",
        "--metadata=toc-title:Table of Contents",
        f"--metadata=title:{title}",
        f"--metadata=lang:{language}",
        f"--metadata=identifier:urn:isbn:{isbn}",
        f"--metadata=isbn:{isbn}",
        f"--epub-cover-image={cover.as_posix()}",
    ]
    if subtitle:
        cmd.append(f"--metadata=subtitle:{subtitle}")
    if author:
        cmd.append(f"--metadata=author:{author}")
    css = epub_css(book_dir)
    if css is not None:
        cmd.append(f"--css={css.as_posix()}")
    cmd.extend(["-o", out_epub.as_posix()])
    _run(cmd)
    # Do not run tools/epub-postprocess.py here: it removes cover_xhtml from the spine for
    # Kindle reading order, which leaves nav references to a non-spine item and fails EPUBCheck.
    return EbookExportResult(epub_path=out_epub, isbn=isbn, prep_markdown=prep)
