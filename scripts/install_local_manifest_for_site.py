#!/usr/bin/env python3
"""Install a same-checkout semantic-manifest.json into apps/site for preview/prod builds.

Phase 4–5 (Stage C/D): write gitignored local artifacts under apps/site/data/
so SEMANTIC_MANIFEST_USE_LOCAL=1 (+ OFFLINE=1) builds consume the checkout’s
generated manifest without overwriting the committed production fallback.

Also installs generated book-cover WebP derivatives into
apps/site/public/generated/book-covers/ (replacing stale slug directories).

Also installs book open-graph.png files into
apps/site/public/generated/open-graph/<slug>.png and rewrites
books[].openGraphImage to site-relative /generated/open-graph/<slug>.png
so social crawlers (especially Facebook) fetch first-party URLs instead of
raw.githubusercontent.com.

Also installs chapter manuscript Markdown into
apps/site/data/manuscripts/ (mirroring bookDir) so Native Reader SSR can
read files on Vercel without relying on monorepo file tracing alone.

Also installs manuscript images/diagrams into
apps/site/public/manuscript-assets/ (mirroring bookDir) so Native Reader
<img> tags resolve on Vercel without raw.githubusercontent.com.

Also installs available chapter-TTS audio (MP3 + optional alignment JSON) into
apps/site/public/generated/audio/ and writes
apps/site/data/local-chapter-audio-manifest.json (available units only).

Public release artifacts remain published; Stage D disables runtime remote fetch
via env on the deployment.
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from datetime import UTC, datetime
from pathlib import Path

_TOOLS = Path(__file__).resolve().parent.parent / "tools"
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from chapter_audio.site_manifest import (  # noqa: E402
    build_chapter_audio_manifest,
    is_lfs_pointer,
)

# Media referenced from chapter markdown (covers, figures, diagrams).
_MANUSCRIPT_MEDIA_SUFFIXES = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif"}
_MANUSCRIPT_ASSET_SKIP_DIR_NAMES = {
    "semantic-reports",
    "node_modules",
    ".git",
    "__pycache__",
}


def _check_deploy_sha(manifest: dict, expected: str | None) -> int:
    if not expected:
        return 0
    actual = manifest.get("sourceCommit")
    if not isinstance(actual, str) or not actual.strip():
        print("error: manifest missing sourceCommit for deploy-SHA check", file=sys.stderr)
        return 1
    if actual.strip() != expected.strip():
        print(
            "error: manifest sourceCommit does not match deploy SHA\n"
            f"  sourceCommit={actual.strip()}\n"
            f"  deploySha={expected.strip()}",
            file=sys.stderr,
        )
        return 1
    print(f"Deploy SHA matches manifest sourceCommit={actual.strip()}")
    return 0


def _install_book_covers(
    *,
    repo: Path,
    cover_source: Path,
    site_covers: Path,
) -> int:
    if not cover_source.is_dir():
        print(
            f"error: generated book covers not found: {cover_source}\n"
            "Run: make generate-book-cover-assets  (or npm run corpus:build-web-covers)",
            file=sys.stderr,
        )
        return 1
    manifest_path = cover_source / "manifest.json"
    if not manifest_path.is_file():
        print(f"error: missing cover manifest: {manifest_path}", file=sys.stderr)
        return 1
    try:
        cover_manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        print(f"error: invalid cover manifest JSON: {exc}", file=sys.stderr)
        return 1
    books = cover_manifest.get("books")
    if not isinstance(books, dict):
        print("error: cover manifest missing books object", file=sys.stderr)
        return 1

    site_covers.mkdir(parents=True, exist_ok=True)
    keep: set[str] = set()
    for slug, record in books.items():
        if not isinstance(slug, str) or not slug or "/" in slug or ".." in slug:
            print(f"error: unsafe cover slug: {slug!r}", file=sys.stderr)
            return 1
        src_dir = cover_source / slug
        if not src_dir.is_dir():
            print(f"error: missing cover directory: {src_dir}", file=sys.stderr)
            return 1
        dest_dir = site_covers / slug
        if dest_dir.exists():
            shutil.rmtree(dest_dir)
        shutil.copytree(src_dir, dest_dir)
        keep.add(slug)
        images = record.get("coverImages") if isinstance(record, dict) else None
        if isinstance(images, dict):
            for key, variant in images.items():
                dest_file = dest_dir / f"{key}.webp"
                if not dest_file.is_file():
                    print(f"error: installed cover missing file: {dest_file}", file=sys.stderr)
                    return 1
                expected = variant.get("bytes") if isinstance(variant, dict) else None
                if isinstance(expected, int) and dest_file.stat().st_size != expected:
                    print(
                        f"error: installed cover size mismatch for {slug}/{key}.webp",
                        file=sys.stderr,
                    )
                    return 1

    for child in site_covers.iterdir():
        if child.is_dir() and child.name not in keep:
            shutil.rmtree(child)
            print(f"Removed stale installed covers: {child.name}")

    readme = site_covers.parent / "README.md"
    if not readme.is_file():
        readme.write_text(
            "# Generated site assets\n\n"
            "This directory is produced by `make install-local-manifest-for-site`.\n"
            "Do not edit or commit these files; regenerate from the corpus checkout.\n",
            encoding="utf-8",
        )

    print(f"Installed book covers → {site_covers} ({len(keep)} books)")
    return 0


_SITE_OG_URL_PREFIX = "/generated/open-graph"


def _safe_slug(slug: object) -> str | None:
    if not isinstance(slug, str) or not slug or "/" in slug or ".." in slug:
        return None
    return slug


def _resolve_open_graph_source(repo: Path, book: dict) -> Path | None:
    """Locate archival open-graph.png for a manifest book entry."""
    og_path = book.get("openGraphImagePath")
    if isinstance(og_path, str) and og_path.strip():
        rel = og_path.strip().replace("\\", "/").lstrip("/")
        if rel and ".." not in rel.split("/") and not rel.startswith("/"):
            candidate = (repo / rel).resolve()
            books_root = (repo / "books").resolve()
            if (candidate == books_root or books_root in candidate.parents) and candidate.is_file():
                return candidate

    book_dir = book.get("bookDir")
    if isinstance(book_dir, str) and book_dir.strip():
        src_dir = _safe_book_dir(book_dir, repo=repo)
        if src_dir is not None:
            for name in ("open-graph.png", "open_graph.png"):
                candidate = src_dir / name
                if candidate.is_file():
                    return candidate
    return None


def _install_open_graph_images(
    *,
    repo: Path,
    manifest: dict,
    site_og: Path,
) -> int:
    """Copy open-graph.png into public/generated/open-graph and rewrite manifest URLs."""
    books = manifest.get("books")
    if not isinstance(books, list):
        print("error: manifest missing books array", file=sys.stderr)
        return 1

    site_og.mkdir(parents=True, exist_ok=True)
    keep: set[str] = set()
    installed = 0

    for book in books:
        if not isinstance(book, dict):
            continue
        slug = _safe_slug(book.get("slug"))
        if slug is None:
            continue
        source = _resolve_open_graph_source(repo, book)
        if source is None:
            continue
        dest = site_og / f"{slug}.png"
        shutil.copy2(source, dest)
        if not dest.is_file() or dest.stat().st_size <= 0:
            print(f"error: failed to install open graph image for {slug}", file=sys.stderr)
            return 1
        book["openGraphImage"] = f"{_SITE_OG_URL_PREFIX}/{slug}.png"
        keep.add(f"{slug}.png")
        installed += 1

    for child in site_og.iterdir():
        if child.is_file() and child.suffix.lower() == ".png" and child.name not in keep:
            child.unlink()
            print(f"Removed stale installed open-graph: {child.name}")

    print(f"Installed open-graph images → {site_og} ({installed} books)")
    return 0


def _safe_book_dir(book_dir: str, *, repo: Path) -> Path | None:
    """Return resolved book dir under repo/books, or None if unsafe/missing."""
    rel = book_dir.strip().replace("\\", "/").lstrip("/")
    if not rel or ".." in rel.split("/") or rel.startswith("/"):
        return None
    if not rel.startswith("books/"):
        return None
    src = (repo / rel).resolve()
    books_root = (repo / "books").resolve()
    if src != books_root and books_root not in src.parents:
        return None
    if not src.is_dir():
        return None
    return src


def _install_manuscripts(
    *,
    repo: Path,
    manifest: dict,
    site_data: Path,
) -> int:
    """Copy chapter markdown into apps/site/data/manuscripts/{bookDir}/…"""
    dest_root = site_data / "manuscripts"
    if dest_root.exists():
        shutil.rmtree(dest_root)
    dest_root.mkdir(parents=True, exist_ok=True)

    books = manifest.get("books")
    if not isinstance(books, list):
        print("error: manifest missing books array", file=sys.stderr)
        return 1

    copied = 0
    for book in books:
        if not isinstance(book, dict):
            continue
        book_dir = book.get("bookDir")
        slug = book.get("slug")
        if not isinstance(book_dir, str) or not book_dir.strip():
            # Fallback for older manifests without bookDir.
            if isinstance(slug, str) and slug.strip():
                book_dir = f"books/{slug.strip()}"
            else:
                continue
        src = _safe_book_dir(book_dir, repo=repo)
        if src is None:
            print(
                f"warning: skip manuscripts for unsafe/missing bookDir={book_dir!r}",
                file=sys.stderr,
            )
            continue
        rel_book = Path(book_dir.strip().replace("\\", "/").lstrip("/"))
        for md in sorted(src.rglob("*.md")):
            if not md.is_file():
                continue
            rel = md.relative_to(src)
            # Skip nested huge caches if any appear under book dirs.
            if any(part.startswith(".") for part in rel.parts):
                continue
            target = dest_root / rel_book / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(md, target)
            copied += 1

    marker = dest_root / "README.md"
    marker.write_text(
        "# Installed chapter manuscripts\n\n"
        "Produced by `make install-local-manifest-for-site` for Native Reader SSR "
        "(READ-003). Do not edit or commit; regenerate from the corpus checkout.\n",
        encoding="utf-8",
    )
    print(f"Installed manuscripts → {dest_root} ({copied} markdown files)")
    return 0


def _install_manuscript_assets(
    *,
    repo: Path,
    manifest: dict,
    site_public: Path,
) -> int:
    """Copy manuscript media into apps/site/public/manuscript-assets/{bookDir}/…"""
    dest_root = site_public / "manuscript-assets"
    if dest_root.exists():
        shutil.rmtree(dest_root)
    dest_root.mkdir(parents=True, exist_ok=True)

    books = manifest.get("books")
    if not isinstance(books, list):
        print("error: manifest missing books array", file=sys.stderr)
        return 1

    copied = 0
    for book in books:
        if not isinstance(book, dict):
            continue
        book_dir = book.get("bookDir")
        slug = book.get("slug")
        if not isinstance(book_dir, str) or not book_dir.strip():
            if isinstance(slug, str) and slug.strip():
                book_dir = f"books/{slug.strip()}"
            else:
                continue
        src = _safe_book_dir(book_dir, repo=repo)
        if src is None:
            print(
                f"warning: skip manuscript assets for unsafe/missing bookDir={book_dir!r}",
                file=sys.stderr,
            )
            continue
        rel_book = Path(book_dir.strip().replace("\\", "/").lstrip("/"))
        for path in sorted(src.rglob("*")):
            if not path.is_file():
                continue
            if path.suffix.lower() not in _MANUSCRIPT_MEDIA_SUFFIXES:
                continue
            rel = path.relative_to(src)
            if any(
                part.startswith(".") or part in _MANUSCRIPT_ASSET_SKIP_DIR_NAMES
                for part in rel.parts
            ):
                continue
            target = dest_root / rel_book / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, target)
            copied += 1

    marker = dest_root / "README.md"
    marker.write_text(
        "# Installed manuscript assets\n\n"
        "Produced by `make install-local-manifest-for-site` for Native Reader "
        "images/diagrams. Do not edit or commit; regenerate from the corpus checkout.\n",
        encoding="utf-8",
    )
    print(f"Installed manuscript assets → {dest_root} ({copied} media files)")
    return 0


def _install_chapter_audio(
    *,
    repo: Path,
    site_data: Path,
    site_public: Path,
    build_manifest_out: Path,
) -> int:
    """Install available chapter audio + site-facing audio manifest."""
    try:
        manifest = build_chapter_audio_manifest(repo)
    except (OSError, ValueError, TypeError, KeyError) as exc:
        print(f"error: failed to build chapter-audio manifest: {exc}", file=sys.stderr)
        return 1

    units = manifest.get("units")
    if not isinstance(units, list):
        print("error: chapter-audio manifest missing units array", file=sys.stderr)
        return 1

    audio_root = site_public / "generated" / "audio"
    if audio_root.exists():
        shutil.rmtree(audio_root)
    audio_root.mkdir(parents=True, exist_ok=True)

    installed = 0
    for unit in units:
        if not isinstance(unit, dict):
            print("error: chapter-audio unit entry must be an object", file=sys.stderr)
            return 1
        edition = unit.get("editionSlug")
        chapter = unit.get("chapterSlug")
        book_rel = unit.get("bookRelpath")
        if (
            not isinstance(edition, str)
            or not edition
            or "/" in edition
            or ".." in edition
            or not isinstance(chapter, str)
            or not chapter
            or "/" in chapter
            or ".." in chapter
        ):
            print(
                f"error: unsafe chapter-audio unit paths: {edition!r}/{chapter!r}", file=sys.stderr
            )
            return 1
        if not isinstance(book_rel, str) or not book_rel.strip():
            book_rel = f"books/{edition}"
        book_rel = book_rel.replace("\\", "/").strip("/")
        if (
            not book_rel.startswith("books/")
            or ".." in book_rel.split("/")
            or book_rel.startswith("/")
        ):
            print(f"error: unsafe chapter-audio bookRelpath: {book_rel!r}", file=sys.stderr)
            return 1

        src_mp3 = repo / book_rel / "audio" / f"{chapter}.mp3"
        if not src_mp3.is_file():
            print(f"error: missing audio artifact for available unit: {src_mp3}", file=sys.stderr)
            return 1
        if is_lfs_pointer(src_mp3):
            print(
                f"error: refusing Git LFS pointer stub (fetch real object): {src_mp3}",
                file=sys.stderr,
            )
            return 1

        dest_dir = audio_root / edition
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest_mp3 = dest_dir / f"{chapter}.mp3"
        shutil.copy2(src_mp3, dest_mp3)
        if not dest_mp3.is_file() or dest_mp3.stat().st_size <= 0:
            print(f"error: failed to install audio: {dest_mp3}", file=sys.stderr)
            return 1

        alignment_url = unit.get("alignmentUrl")
        if isinstance(alignment_url, str) and alignment_url.strip():
            src_align = repo / book_rel / "audio" / f"{chapter}.alignment.json"
            if not src_align.is_file():
                print(f"error: missing alignment for available unit: {src_align}", file=sys.stderr)
                return 1
            if is_lfs_pointer(src_align):
                print(
                    f"error: refusing Git LFS pointer stub: {src_align}",
                    file=sys.stderr,
                )
                return 1
            shutil.copy2(src_align, dest_dir / f"{chapter}.alignment.json")
        installed += 1

    build_manifest_out.parent.mkdir(parents=True, exist_ok=True)
    build_manifest_out.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    site_data.mkdir(parents=True, exist_ok=True)
    site_manifest = site_data / "local-chapter-audio-manifest.json"
    site_manifest.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    readme = audio_root / "README.md"
    readme.write_text(
        "# Installed chapter audio\n\n"
        "Produced by `make install-local-manifest-for-site` from available "
        "`books/**/audio/` artifacts. Do not edit or commit; regenerate from the corpus.\n",
        encoding="utf-8",
    )

    print(
        f"Installed chapter audio → {audio_root} ({installed} unit(s)); manifest → {site_manifest}"
    )
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--repo",
        type=Path,
        default=Path("."),
        help="Monorepo root (default: cwd)",
    )
    parser.add_argument(
        "--source",
        type=Path,
        default=None,
        help="Local manifest path (default: <repo>/build/semantic-manifest.json)",
    )
    parser.add_argument(
        "--site-data",
        type=Path,
        default=None,
        help="Site data directory (default: <repo>/apps/site/data)",
    )
    parser.add_argument(
        "--cover-source",
        type=Path,
        default=None,
        help="Generated covers dir (default: <repo>/build/site-assets/book-covers)",
    )
    parser.add_argument(
        "--site-covers",
        type=Path,
        default=None,
        help="Site public covers dir (default: <repo>/apps/site/public/generated/book-covers)",
    )
    parser.add_argument(
        "--skip-covers",
        action="store_true",
        help="Install JSON only (tests / emergency).",
    )
    parser.add_argument(
        "--skip-open-graph",
        action="store_true",
        help="Skip copying open-graph.png into apps/site/public/generated/open-graph.",
    )
    parser.add_argument(
        "--site-open-graph",
        type=Path,
        default=None,
        help="Site open-graph dir (default: <repo>/apps/site/public/generated/open-graph)",
    )
    parser.add_argument(
        "--skip-manuscripts",
        action="store_true",
        help="Skip copying chapter markdown into apps/site/data/manuscripts.",
    )
    parser.add_argument(
        "--site-public",
        type=Path,
        default=None,
        help="Site public directory (default: <repo>/apps/site/public)",
    )
    parser.add_argument(
        "--skip-manuscript-assets",
        action="store_true",
        help="Skip copying manuscript images into apps/site/public/manuscript-assets.",
    )
    parser.add_argument(
        "--skip-audio",
        action="store_true",
        help="Skip installing chapter TTS audio into public/generated/audio.",
    )
    parser.add_argument(
        "--require-deploy-sha",
        default=None,
        help="Require manifest sourceCommit to equal this SHA (Vercel: VERCEL_GIT_COMMIT_SHA).",
    )
    parser.add_argument(
        "--check-only",
        action="store_true",
        help="Validate only; do not write site data files.",
    )
    args = parser.parse_args(argv)

    repo = args.repo.resolve()
    source = (args.source or (repo / "build" / "semantic-manifest.json")).resolve()
    site_data = (args.site_data or (repo / "apps" / "site" / "data")).resolve()
    site_public = (args.site_public or (repo / "apps" / "site" / "public")).resolve()
    cover_source = (args.cover_source or (repo / "build" / "site-assets" / "book-covers")).resolve()
    site_covers = (args.site_covers or (site_public / "generated" / "book-covers")).resolve()
    site_og = (args.site_open_graph or (site_public / "generated" / "open-graph")).resolve()

    if not source.is_file():
        print(
            f"error: local manifest not found: {source}\n"
            "Run: make generate-semantic-manifest  (or npm run corpus:build-manifest)",
            file=sys.stderr,
        )
        return 1

    try:
        manifest = json.loads(source.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        print(f"error: invalid JSON in {source}: {exc}", file=sys.stderr)
        return 1

    if not isinstance(manifest, dict):
        print(f"error: {source} must be a JSON object", file=sys.stderr)
        return 1

    schema = manifest.get("schemaVersion")
    if schema != "2.4":
        print(f"error: expected schemaVersion '2.4', got {schema!r}", file=sys.stderr)
        return 1

    if args.require_deploy_sha:
        code = _check_deploy_sha(manifest, args.require_deploy_sha)
        if code != 0:
            return code

    if args.check_only:
        print(f"OK: checked {source}")
        return 0

    site_data.mkdir(parents=True, exist_ok=True)
    dest = site_data / "local-semantic-manifest.json"
    intended_path = site_data / "local-intended-manifest-release.json"

    if not args.skip_covers:
        code = _install_book_covers(repo=repo, cover_source=cover_source, site_covers=site_covers)
        if code != 0:
            return code

    if not args.skip_open_graph:
        code = _install_open_graph_images(repo=repo, manifest=manifest, site_og=site_og)
        if code != 0:
            return code

    dest.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    intended = {
        "schemaVersion": schema,
        "sourceCommit": manifest.get("sourceCommit"),
        "generatedAt": manifest.get("generatedAt"),
        "contentVersion": manifest.get("contentVersion"),
        "manifestUrl": "local:build/semantic-manifest.json",
        "syncedAt": datetime.now(UTC).isoformat(),
        "source": "local-checkout",
    }
    intended_path.write_text(json.dumps(intended, indent=2) + "\n", encoding="utf-8")

    if not args.skip_manuscripts:
        code = _install_manuscripts(repo=repo, manifest=manifest, site_data=site_data)
        if code != 0:
            return code

    if not args.skip_manuscript_assets:
        code = _install_manuscript_assets(repo=repo, manifest=manifest, site_public=site_public)
        if code != 0:
            return code

    if not args.skip_audio:
        code = _install_chapter_audio(
            repo=repo,
            site_data=site_data,
            site_public=site_public,
            build_manifest_out=repo / "build" / "chapter-audio-manifest.json",
        )
        if code != 0:
            return code

    books = len(manifest.get("books") or [])
    print(f"Installed preview/production manifest → {dest}")
    print(f"Pinned local intended release → {intended_path}")
    print(f"schemaVersion={schema} sourceCommit={intended.get('sourceCommit')} books={books}")
    print("Build with: SEMANTIC_MANIFEST_USE_LOCAL=1 SEMANTIC_MANIFEST_OFFLINE=1")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
