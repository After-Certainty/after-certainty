"""Atomic write helpers for chapter-audio artifact trio."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any


def _atomic_write_bytes(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + ".tmp")
    try:
        with tmp.open("wb") as fh:
            fh.write(data)
            fh.flush()
            os.fsync(fh.fileno())
        tmp.replace(path)
    finally:
        if tmp.is_file():
            try:
                tmp.unlink()
            except OSError:
                pass


def _atomic_write_text(path: Path, text: str) -> None:
    _atomic_write_bytes(path, text.encode("utf-8"))


def write_json_atomic(path: Path, payload: dict[str, Any]) -> None:
    _atomic_write_text(path, json.dumps(payload, indent=2, ensure_ascii=False) + "\n")


def write_audio_atomic(path: Path, audio_bytes: bytes) -> None:
    if not audio_bytes:
        raise ValueError("refusing to write empty audio bytes")
    if audio_bytes.startswith(b"version https://git-lfs.github.com/spec/v1"):
        raise ValueError("refusing to write a Git LFS pointer as audio")
    _atomic_write_bytes(path, audio_bytes)


def write_artifact_trio(
    *,
    audio_path: Path,
    audio_bytes: bytes,
    receipt_path: Path,
    receipt: dict[str, Any],
    alignment_path: Path | None = None,
    alignment: dict[str, Any] | None = None,
) -> None:
    """Write MP3 then alignment then receipt. Receipt last so incomplete sets lack a receipt."""
    write_audio_atomic(audio_path, audio_bytes)
    if alignment is not None and alignment_path is not None:
        write_json_atomic(alignment_path, alignment)
    write_json_atomic(receipt_path, receipt)
