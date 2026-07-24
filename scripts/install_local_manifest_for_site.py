#!/usr/bin/env python3
"""Install a same-checkout semantic-manifest.json into apps/site for preview/prod builds.

Phase 4–5 (Stage C/D): write gitignored local artifacts under apps/site/data/
so SEMANTIC_MANIFEST_USE_LOCAL=1 (+ OFFLINE=1) builds consume the checkout’s
generated manifest without overwriting the committed production fallback.

Also installs generated book-cover WebP derivatives into
apps/site/public/generated/book-covers/ (replacing stale slug directories).

Also installs chapter manuscript Markdown into
apps/site/data/manuscripts/ (mirroring bookDir) so Native Reader SSR can
read files on Vercel without relying on monorepo file tracing alone.

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
        "--skip-manuscripts",
        action="store_true",
        help="Skip copying chapter markdown into apps/site/data/manuscripts.",
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
    cover_source = (args.cover_source or (repo / "build" / "site-assets" / "book-covers")).resolve()
    site_covers = (
        args.site_covers or (repo / "apps" / "site" / "public" / "generated" / "book-covers")
    ).resolve()

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
    if schema != "2.3":
        print(f"error: expected schemaVersion '2.3', got {schema!r}", file=sys.stderr)
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

    if not args.skip_covers:
        code = _install_book_covers(repo=repo, cover_source=cover_source, site_covers=site_covers)
        if code != 0:
            return code

    if not args.skip_manuscripts:
        code = _install_manuscripts(repo=repo, manifest=manifest, site_data=site_data)
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
