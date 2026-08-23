"""Tests for generated-artifact secret scanning."""

from __future__ import annotations

import io
import zipfile
from pathlib import Path

from scan_generated_secrets import scan_path, scan_text, scan_tree

FAKE_TOKEN = "TESTONLY_NOT_A_SECRET_00000000"
FAKE_URL = f"https://x-access-token:{FAKE_TOKEN}@github.com/After-Certainty/after-certainty"


def test_rejects_url_with_userinfo() -> None:
    findings = scan_text(
        "repo: https://user:pass@github.com/o/r.git\n",
        location="mem",
    )
    assert any("username or password" in f.label for f in findings)


def test_rejects_x_access_token_url() -> None:
    findings = scan_text(FAKE_URL, location="mem")
    assert any("x-access-token" in f.label for f in findings)


def test_rejects_github_token_prefix() -> None:
    # Unmistakably synthetic; length matches scanner threshold.
    fake = "ghp_" + ("T" * 36)
    findings = scan_text(f"token={fake}", location="mem")
    assert any("GitHub token" in f.label for f in findings)


def test_rejects_private_key_block() -> None:
    findings = scan_text(
        "-----BEGIN RSA PRIVATE KEY-----\nMIIE\n-----END RSA PRIVATE KEY-----\n",
        location="mem",
    )
    assert any("Private-key" in f.label for f in findings)


def test_rejects_authorization_header() -> None:
    findings = scan_text("Authorization: Bearer abc.def.ghi\n", location="mem")
    assert any("Authorization" in f.label for f in findings)


def test_rejects_absolute_and_home_paths() -> None:
    findings = scan_text("/home/ubuntu/.ssh/id_rsa and ~/.aws/credentials", location="mem")
    assert any("Absolute" in f.label or "Home-directory" in f.label for f in findings)


def test_rejects_injected_forbid_value(tmp_path: Path) -> None:
    path = tmp_path / "out.json"
    path.write_text('{"x": "' + FAKE_TOKEN + '"}\n', encoding="utf-8")
    findings = scan_path(path, extra_forbidden=[FAKE_TOKEN])
    assert any("Injected secret" in f.label for f in findings)


def test_clean_manifest_passes(tmp_path: Path) -> None:
    path = tmp_path / "books-manifest.json"
    path.write_text(
        '{"repository":"After-Certainty/after-certainty","books":[]}\n',
        encoding="utf-8",
    )
    assert scan_path(path) == []


def test_scans_docx_archive_members(tmp_path: Path) -> None:
    docx = tmp_path / "book.docx"
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr(
            "word/document.xml",
            f"<w:t>{FAKE_URL}</w:t>",
        )
    docx.write_bytes(buf.getvalue())
    findings = scan_path(docx)
    assert findings
    assert any("x-access-token" in f.label or "username" in f.label for f in findings)


def test_scans_epub_archive_members(tmp_path: Path) -> None:
    epub = tmp_path / "book.epub"
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("OEBPS/content.xhtml", f"<p>{FAKE_URL}</p>")
    epub.write_bytes(buf.getvalue())
    findings = scan_path(epub)
    assert findings


def test_scan_tree_directory(tmp_path: Path) -> None:
    (tmp_path / "ok.json").write_text('{"a":1}\n', encoding="utf-8")
    bad = tmp_path / "bad.md"
    bad.write_text(f"see {FAKE_URL}\n", encoding="utf-8")
    findings = scan_tree(tmp_path)
    assert any("bad.md" in f.path for f in findings)
