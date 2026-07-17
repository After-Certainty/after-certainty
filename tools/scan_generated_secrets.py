#!/usr/bin/env python3
"""
Scan generated artifacts for credential leakage and unsafe path disclosure.

Inspects text files directly and archive members (ZIP/DOCX/EPUB/tar) rather than
only the compressed bytes. Intended for CI preparation jobs and local tests.
"""

from __future__ import annotations

import argparse
import re
import sys
import tarfile
import zipfile
from pathlib import Path
from urllib.parse import urlparse

# Text-like suffixes scanned as UTF-8 (errors replaced).
TEXT_SUFFIXES = frozenset(
    {
        ".json",
        ".yml",
        ".yaml",
        ".md",
        ".markdown",
        ".html",
        ".htm",
        ".txt",
        ".csv",
        ".xml",
        ".typ",
        ".log",
        ".sha256",
        ".sums",
    }
)

ARCHIVE_SUFFIXES = frozenset({".zip", ".docx", ".epub", ".jar"})
TAR_SUFFIXES = frozenset({".tar", ".tar.gz", ".tgz", ".tar.xz", ".txz"})

GITHUB_TOKEN_PREFIXES = re.compile(r"(?:ghp_|gho_|ghs_|ghu_|ghr_|github_pat_)[A-Za-z0-9_]{20,}")
PRIVATE_KEY_BLOCK = re.compile(r"-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----")
AUTHORIZATION_HEADER = re.compile(r"(?i)authorization\s*:\s*(?:bearer|basic)\s+\S+")
X_ACCESS_TOKEN = re.compile(r"(?i)x-access-token:")
ABS_UNIX_PATH = re.compile(r"(?<![\w/])/(?:home|Users|root|var/secrets)/[^\s\"']+")
HOME_PATH = re.compile(r"(?<![\w])~/(?:\.ssh|\.config|\.aws)/[^\s\"']+")


class ScanFinding:
    __slots__ = ("path", "label", "detail")

    def __init__(self, path: str, label: str, detail: str = "") -> None:
        self.path = path
        self.label = label
        self.detail = detail

    def __str__(self) -> str:
        if self.detail:
            return f"{self.path}: {self.label} ({self.detail})"
        return f"{self.path}: {self.label}"


def _url_has_userinfo(text: str) -> list[str]:
    """Return URL substrings that embed username/password via URL parsing."""
    hits: list[str] = []
    # Rough URL finder; structural check uses urlparse.
    for match in re.finditer(r"https?://[^\s\"'<>]+", text, re.I):
        raw = match.group(0).rstrip(").,;]")
        parsed = urlparse(raw)
        if parsed.username is not None or parsed.password is not None:
            hits.append(raw)
        # netloc may still contain userinfo if parsing is odd
        if "@" in (parsed.netloc or "") and parsed.scheme in {"http", "https"}:
            userinfo, _, host = parsed.netloc.rpartition("@")
            if userinfo and host and raw not in hits:
                hits.append(raw)
    return hits


def scan_text(
    text: str,
    *,
    location: str,
    extra_forbidden: list[str] | None = None,
) -> list[ScanFinding]:
    findings: list[ScanFinding] = []

    for url in _url_has_userinfo(text):
        findings.append(ScanFinding(location, "URL contains username or password", url))

    if X_ACCESS_TOKEN.search(text):
        findings.append(ScanFinding(location, "x-access-token present"))

    if GITHUB_TOKEN_PREFIXES.search(text):
        findings.append(ScanFinding(location, "GitHub token prefix"))

    if PRIVATE_KEY_BLOCK.search(text):
        findings.append(ScanFinding(location, "Private-key block"))

    if AUTHORIZATION_HEADER.search(text):
        findings.append(ScanFinding(location, "Authorization header"))

    if ABS_UNIX_PATH.search(text):
        findings.append(ScanFinding(location, "Absolute home/secret filesystem path"))

    if HOME_PATH.search(text):
        findings.append(ScanFinding(location, "Home-directory secret path"))

    for secret in extra_forbidden or []:
        if secret and secret in text:
            findings.append(ScanFinding(location, "Injected secret value present", secret[:24]))

    return findings


def _read_text_bytes(data: bytes) -> str:
    return data.decode("utf-8", errors="replace")


def scan_zip_members(
    path: Path,
    *,
    extra_forbidden: list[str] | None = None,
) -> list[ScanFinding]:
    findings: list[ScanFinding] = []
    try:
        with zipfile.ZipFile(path) as zf:
            for info in zf.infolist():
                if info.is_dir():
                    continue
                name = info.filename
                # Skip obviously binary image/font payloads inside office docs.
                lower = name.lower()
                if lower.endswith(
                    (".png", ".jpg", ".jpeg", ".gif", ".webp", ".woff", ".woff2", ".ttf", ".otf")
                ):
                    continue
                try:
                    data = zf.read(info)
                except Exception as exc:  # noqa: BLE001 — report and continue
                    findings.append(
                        ScanFinding(f"{path}!{name}", "Failed to read archive member", str(exc))
                    )
                    continue
                # Prefer text; also scan XML parts of DOCX/EPUB.
                if (
                    any(lower.endswith(s) for s in TEXT_SUFFIXES)
                    or lower.endswith((".xml", ".xhtml", ".opf", ".ncx", ".rels"))
                    or b"\x00" not in data[:1024]
                ):
                    loc = f"{path}!{name}"
                    findings.extend(
                        scan_text(
                            _read_text_bytes(data), location=loc, extra_forbidden=extra_forbidden
                        )
                    )
    except zipfile.BadZipFile as exc:
        findings.append(ScanFinding(str(path), "Invalid ZIP/DOCX/EPUB", str(exc)))
    return findings


def scan_tar_members(
    path: Path,
    *,
    extra_forbidden: list[str] | None = None,
) -> list[ScanFinding]:
    findings: list[ScanFinding] = []
    try:
        with tarfile.open(path, mode="r:*") as tf:
            for member in tf.getmembers():
                if not member.isfile():
                    continue
                extracted = tf.extractfile(member)
                if extracted is None:
                    continue
                data = extracted.read()
                lower = member.name.lower()
                if b"\x00" in data[:1024] and not any(lower.endswith(s) for s in TEXT_SUFFIXES):
                    continue
                loc = f"{path}!{member.name}"
                findings.extend(
                    scan_text(_read_text_bytes(data), location=loc, extra_forbidden=extra_forbidden)
                )
    except tarfile.TarError as exc:
        findings.append(ScanFinding(str(path), "Invalid tar archive", str(exc)))
    return findings


def scan_pdf_bytes(
    path: Path,
    data: bytes,
    *,
    extra_forbidden: list[str] | None = None,
) -> list[ScanFinding]:
    """Best-effort PDF scan: metadata strings and extractable Latin text streams."""
    text = _read_text_bytes(data)
    findings = scan_text(text, location=str(path), extra_forbidden=extra_forbidden)
    # Also pull simple parenthesized PDF strings (common for metadata).
    for match in re.finditer(rb"\((?:\\.|[^\\)]){4,200}\)", data):
        chunk = match.group(0)[1:-1].decode("latin-1", errors="replace")
        findings.extend(
            scan_text(chunk, location=f"{path}!pdf-string", extra_forbidden=extra_forbidden)
        )
    return findings


def scan_path(
    path: Path,
    *,
    extra_forbidden: list[str] | None = None,
) -> list[ScanFinding]:
    if not path.is_file():
        return [ScanFinding(str(path), "Not a file")]

    suffix = path.suffix.lower()
    name = path.name.lower()

    if suffix in ARCHIVE_SUFFIXES or name.endswith(".docx") or name.endswith(".epub"):
        return scan_zip_members(path, extra_forbidden=extra_forbidden)

    if suffix in {".gz", ".xz", ".bz2"} or any(name.endswith(s) for s in TAR_SUFFIXES):
        # .tar.gz handled by tarfile; lone .gz of non-tar still attempted.
        try:
            return scan_tar_members(path, extra_forbidden=extra_forbidden)
        except Exception:  # noqa: BLE001
            pass

    if suffix == ".pdf":
        return scan_pdf_bytes(path, path.read_bytes(), extra_forbidden=extra_forbidden)

    if suffix in TEXT_SUFFIXES or suffix == "" or name in {"sha256sums", "checksums"}:
        return scan_text(
            path.read_text(encoding="utf-8", errors="replace"),
            location=str(path),
            extra_forbidden=extra_forbidden,
        )

    # Unknown binary: still scan as text for embedded ASCII secrets.
    return scan_text(
        _read_text_bytes(path.read_bytes()),
        location=str(path),
        extra_forbidden=extra_forbidden,
    )


def scan_tree(
    root: Path,
    *,
    extra_forbidden: list[str] | None = None,
) -> list[ScanFinding]:
    root = root.resolve()
    findings: list[ScanFinding] = []
    if root.is_file():
        return scan_path(root, extra_forbidden=extra_forbidden)
    for path in sorted(root.rglob("*")):
        if path.is_file():
            findings.extend(scan_path(path, extra_forbidden=extra_forbidden))
    return findings


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "paths",
        nargs="+",
        type=Path,
        help="Files or directories to scan",
    )
    parser.add_argument(
        "--forbid",
        action="append",
        default=[],
        help="Exact string that must not appear (repeatable; for injected test secrets)",
    )
    args = parser.parse_args(argv)

    findings: list[ScanFinding] = []
    for path in args.paths:
        if not path.exists():
            print(f"error: path does not exist: {path}", file=sys.stderr)
            return 2
        findings.extend(scan_tree(path, extra_forbidden=args.forbid))

    if findings:
        print("Secret / unsafe-path findings:", file=sys.stderr)
        for finding in findings:
            print(f"  {finding}", file=sys.stderr)
        return 1
    print("No secret findings.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
