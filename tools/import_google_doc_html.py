#!/usr/bin/env python3
"""Download a public Google Doc as HTML and write a short import manifest."""

from __future__ import annotations

import argparse
import re
from datetime import UTC, datetime
from pathlib import Path
from urllib.error import URLError
from urllib.request import urlopen

DOC_ID_RE = re.compile(r"/document/d/([a-zA-Z0-9_-]+)")


def doc_id_from(value: str) -> str:
    value = value.strip()
    match = DOC_ID_RE.search(value)
    if match:
        return match.group(1)
    if re.fullmatch(r"[a-zA-Z0-9_-]+", value):
        return value
    raise ValueError(f"Could not parse Google Doc id from: {value!r}")


def export_url(doc_id: str) -> str:
    return f"https://docs.google.com/document/d/{doc_id}/export?format=html"


def download_html(doc_id: str) -> bytes:
    url = export_url(doc_id)
    try:
        with urlopen(url, timeout=120) as response:
            return response.read()
    except URLError as exc:
        raise SystemExit(f"Failed to download Google Doc HTML: {exc}") from exc


def write_manifest(manifest_path: Path, *, doc_id: str, byte_size: int) -> None:
    now = datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")
    manifest_path.write_text(
        "\n".join(
            [
                "# Google Doc import manifest",
                "",
                f"- **Doc ID:** `{doc_id}`",
                f"- **Export URL:** `{export_url(doc_id)}`",
                f"- **Downloaded (UTC):** {now}",
                f"- **Byte size:** {byte_size:,}",
                "",
            ]
        ),
        encoding="utf-8",
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "doc",
        help="Google Doc URL or document id",
    )
    parser.add_argument(
        "--book-dir",
        required=True,
        help="Book directory (writes import/source.html and import/manifest.md)",
    )
    args = parser.parse_args()

    book_dir = Path(args.book_dir).resolve()
    import_dir = book_dir / "import"
    import_dir.mkdir(parents=True, exist_ok=True)

    doc_id = doc_id_from(args.doc)
    html_bytes = download_html(doc_id)

    html_path = import_dir / "source.html"
    html_path.write_bytes(html_bytes)
    write_manifest(import_dir / "manifest.md", doc_id=doc_id, byte_size=len(html_bytes))

    print(f"Wrote {html_path} ({len(html_bytes):,} bytes)")
    print(f"Wrote {import_dir / 'manifest.md'}")


if __name__ == "__main__":
    main()
