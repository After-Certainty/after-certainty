"""Typst installer rejects incorrect checksums without installing."""

from __future__ import annotations

import os
import subprocess
from pathlib import Path


def test_typst_install_rejects_bad_checksum(repo_root: Path, tmp_path: Path) -> None:
    archive = tmp_path / "typst-x86_64-unknown-linux-musl.tar.xz"
    archive.write_bytes(b"not-a-real-typst-archive")
    env = os.environ.copy()
    env["TYPST_CHECK_ONLY"] = "1"
    env["TYPST_LOCAL_ARCHIVE"] = str(archive)
    env["TYPST_EXPECTED_SHA256"] = "0" * 64
    env["TYPST_INSTALL_DIR"] = str(tmp_path / "install")
    proc = subprocess.run(
        ["bash", str(repo_root / "scripts/install_typst.sh")],
        capture_output=True,
        text=True,
        env=env,
    )
    assert proc.returncode != 0
    assert "checksum mismatch" in (proc.stderr + proc.stdout).lower()
    assert not (tmp_path / "install" / "bin" / "typst").exists()


def test_typst_install_accepts_matching_checksum(repo_root: Path, tmp_path: Path) -> None:
    archive = tmp_path / "fake.tar.xz"
    data = b"fixture-bytes-for-digest"
    archive.write_bytes(data)
    digest = subprocess.check_output(["sha256sum", str(archive)], text=True).split()[0]
    env = os.environ.copy()
    env["TYPST_CHECK_ONLY"] = "1"
    env["TYPST_LOCAL_ARCHIVE"] = str(archive)
    env["TYPST_EXPECTED_SHA256"] = digest
    proc = subprocess.run(
        ["bash", str(repo_root / "scripts/install_typst.sh")],
        capture_output=True,
        text=True,
        env=env,
    )
    assert proc.returncode == 0, proc.stderr
